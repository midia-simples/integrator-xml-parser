const { requestParser, removewhitesSpacesOutSideTags, responseParser, valueFormatter } = require('../src')

describe('xml Integrator Tests', () => {
  it('requestParser', () => {
    const received = requestParser('usuario',
      'password',
      'nomeMetodo',
      {
        metodo1: 'parametro Metodo1',
        metodo2: 'parametroMetodo2'
      })

    const expected = removewhitesSpacesOutSideTags(
      `<?xml version="1.0" encoding="iso-8859-1"?>
            <methodCall>
              <methodName>nomeMetodo</methodName>
              <params>
              <param name="_user">
                    <value>
                      <string><![CDATA[usuario]]></string>
                    </value>
              </param>
              <param name="_passwd">
                    <value>
                      <string><![CDATA[password]]></string>
                    </value>
              </param>
              <param name="metodo1">
                    <value>
                      <string><![CDATA[parametro%20Metodo1]]></string>
                    </value>
                 </param><param name="metodo2">
                    <value>
                      <string><![CDATA[parametroMetodo2]]></string>
                    </value>
                 </param>
             </params>
            </methodCall>`
    )
    expect(received).to.be.eql(expected)
  })
  it('responseParser OK = 1 - Xml de Sucesso', (done) => {
    const expected = {
      ok: 1,
      historico:
        [ { data_processamento: '2018-09-20',
          historico_da_conta: 'ATIVAÇÃO (VENDA + SERVIÇO) - TX ATIVAÇÃO ( 1/ 2)',
          periodo: '00/00/0000 - 00/00/0000' },
        { data_processamento: '2018-06-12',
          historico_da_conta: 'TESTE 1 - TX. DE ATIVAÇÃO ( 4/ 5)',
          periodo: '00/00/0000 - 00/00/0000' } ] }

    responseParser(
      `<?xml version="1.0" encoding="iso-8859-1"?>
            <methodResponse>
            <methodName>response</methodName>
            <params>
                <param name="ok">
                    <value>
                        <boolean>1</boolean>
                    </value>
                </param>
                <param name="historico">
                    <value>
                        <DOMElement>
                            <result>
                                <row>
                                    <Data_Processamento>2018-09-20</Data_Processamento>
                                    <Historico_da_Conta>ATIVAÃÃO (VENDA + SERVIÃO) - TX ATIVAÃÃO ( 1/ 2)</Historico_da_Conta>
                                    <periodo>00/00/0000 - 00/00/0000</periodo>
                                </row>
                                <row>
                                    <Data_Processamento>2018-06-12</Data_Processamento>
                                    <Historico_da_Conta>TESTE 1 - TX. DE ATIVAÃÃO ( 4/ 5)</Historico_da_Conta>
                                    <periodo>00/00/0000 - 00/00/0000</periodo>
                                </row>
                            </result>
                        </DOMElement>
                    </value>
                </param>
            </params>
            </methodResponse>`
    )
      .then(res => {
        expect(res).to.be.eql(expected)
        done()
      })
      .catch(done)
  })
  it('responseParser OK = 1 - xml de Sucesso com result Vazio (<result/>)', (done) => {
    const expected = { ok: 1, historico: [] }
    responseParser(
      `<?xml version="1.0" encoding="iso-8859-1"?>
            <methodResponse>
            <methodName>response</methodName>
            <params>
                <param name="ok">
                    <value>
                        <boolean>1</boolean>
                    </value>
                </param>
                <param name="historico">
                    <value>
                        <DOMElement>
                            <result />
                        </DOMElement>
                    </value>
                </param>
            </params>
            </methodResponse>`
    )
      .then(res => {
        expect(res).to.be.eql(expected)
        done()
      })
      .catch(done)
  })
  it('responseParser OK = 1 - xml de Sucesso com result 1 row (<result><row></row></result>)', (done) => {
    const expected = { ok: 1,
      historico: [ { data_processamento: '2018-09-20',
        historico_da_conta: 'ATIVAÇÃO (VENDA + SERVIÇO) - TX ATIVAÇÃO ( 1/ 2)',
        periodo: '00/00/0000 - 00/00/0000' } ] }

    responseParser(
      `<?xml version="1.0" encoding="iso-8859-1"?>
            <methodResponse>
            <methodName>response</methodName>
            <params>
                <param name="ok">
                    <value>
                        <boolean>1</boolean>
                    </value>
                </param>
                <param name="historico">
                    <value>
                        <DOMElement>
                            <result>
                                <row>
                                    <Data_Processamento>2018-09-20</Data_Processamento>
                                    <Historico_da_Conta>ATIVAÃÃO (VENDA + SERVIÃO) - TX ATIVAÃÃO ( 1/ 2)</Historico_da_Conta>
                                    <periodo>00/00/0000 - 00/00/0000</periodo>
                                </row>
                            </result>
                        </DOMElement>
                    </value>
                </param>
            </params>
            </methodResponse>`
    )
      .then(res => {
        expect(res).to.be.eql(expected)
        done()
      })
      .catch(done)
  })
  it('responseParser OK = 0 - Xml de Erro', (done) => {
    const expected = {
      ok: 0,
      errmsg: '10 - Não possui extrato financeiro.',
      coderro: '10'
    }

    responseParser(
      `<?xml version="1.0" encoding="iso-8859-1"?>
            <methodResponse>
                <methodName>response</methodName>
                <params>
                    <param name="ok">
                        <value>
                            <boolean>0</boolean>
                        </value>
                    </param>
                    <param name="errmsg">
                        <value>
                            <string>
                                <![CDATA[10%20-%20N%E3o%20possui%20extrato%20financeiro.]]>
                            </string>
                        </value>
                    </param>
                    <param name="coderro">
                        <value>
                            <double>10</double>
                        </value>
                    </param>
                </params>
            </methodResponse>`)
      .then(res => {
        expect(res).to.be.eql(expected)
        done()
      })
      .catch(done)
  })
  it('responseParser Fault- na montagem do XML', (done) => {
    const expected = {
      faultCode: 0,
      faultString: '0000 - É necessário informar o código da view a ser executada'
    }
    responseParser(`
      <?xml version="1.0" encoding="iso-8859-1"?>
      <methodResponse>
          <fault>
              <value>
                  <struct>
                      <member>
                          <name>faultCode</name>
                          <value>
                              <int>0</int>
                          </value>
                      </member>
                      <member>
                          <name>faultString</name>
                          <value>
                              <string>
                                  <![CDATA[0000%20-%20%C9%20necess%E1rio%20informar%20o%20c%F3digo%20da%20view%20a%20ser%20executada]]>
                              </string>
                          </value>
                      </member>
                  </struct>
              </value>
          </fault>
      </methodResponse>`)
      .then(() => done())
      .catch(err => {
        expect(err).to.be.eql(expected)
        done()
      })
      .catch(done)
  })

  // // boleto paRequest parser Boletorser
  it('response parser boleto sem tag <result> apos domelement', done => {
    const expected = { ok: 1,
      xml:
        { boleto:
            { versao: '1.1',
              logoboleto: 'logo.jpg',
              datavencimento: '03/11/2018',
              nome_cli: 'Cliente',
              especie: 'R$',
              especiefixo: 'R$',
              demonstrativo: 'SERVICOS DE INTERNET CLIENTE - PROTOCOLO DE CANCE (R$ 6.99) TESTE - VENDA EQUIPAMENTO',
              imagem: './document/001.jpg',
              banco: '111-1',
              linhadigitavel: '11111.11111 11111.111111 11111.111111 1 11111111111111',
              codbarra: '00199761700000005750000001927865000000410117',
              localpagamento: 'QUALQUER BANCO ATE O VENCIMENTO. APOS, UTILIZE BOLETO NO SITE BB.COM.BR',
              beneficiario: 'Empresa Ltda CNPJ: 11.111.111/1111-11',
              agencia: '1111-1 / 11111 -0',
              datadocumento: '29/10/18',
              numerodoc: '2222222222',
              especiedoc: 'DS',
              aceite: 'N',
              nossonumero: '66666666666666666-6',
              carteira: '99',
              quantidade: '1',
              valordocumento: '5,75',
              instrucoes: 'APOS VENCIMENTO,MULTA DE R$ 10,00 MAIS JUROS DE 1%(R$0,06) AO MES',
              cpfcnpj: 'CPF:111.111.111-11',
              enderecocob: 'AV Cliente 1111',
              bairrocob: 'BAIRRO CLIENTE',
              nomecidade: 'Birigui',
              uf: 'SP',
              cep: '16200-000',
              enderecoinstalacao: 'teste',
              bairroinstalacao: 'teste',
              nomecidadeinstalacao: 'Aracatuba',
              ufinstalacao: 'SP',
              cepinstalacao: '16200000' } },
      versao: '1.1',
      logoBoleto: 'logo.jpg',
      dataVencimento: '03/11/2018',
      nome_cli: 'Cliente',
      especie: 'R$',
      especieFixo: 'R$',
      demonstrativo: 'SERVICOS DE INTERNET   CLIENTE                       - PROTOCOLO DE CANCE        (R$  6.99)    TESTE - VENDA EQUIPAMENTO            ',
      imagem: './document/001.jpg',
      banco: '111-1',
      linhadigitavel: '11111.11111 11111.111111 11111.111111 1 11111111111111',
      codBarra: '00199761700000005750000001927865000000410117',
      LocalPagamento: 'QUALQUER BANCO ATE O VENCIMENTO. APOS, UTILIZE BOLETO NO SITE BB.COM.BR',
      beneficiario: 'Empresa Ltda CNPJ: 11.111.111/0001-11',
      agencia: '1111-4 / 16117   -0',
      dataDocumento: '29/10/18',
      numeroDoc: '2222222222',
      especieDoc: 'DS',
      aceite: 'N',
      nossoNumero: '66666666666666666-6',
      carteira: '99',
      quantidade: '1',
      valorDocumento: '5,75',
      instrucoes: 'APOS VENCIMENTO,MULTA DE R$ 10,00 MAIS JUROS DE 1%(R$0,06) AO MES',
      cpfCnpj: 'CPF:111.111.111-11',
      enderecoCob: 'AV Cliente, 1111',
      bairroCob: 'Bairro cliente',
      nomeCidade: 'Birigui',
      uf: 'SP',
      cep: '16200-000',
      enderecoInstalacao: 'teste',
      bairroInstalacao: 'teste',
      nomeCidadeInstalacao: 'Aracatuba',
      ufInstalacao: 'SP',
      cepInstalacao: '16000000' }

    responseParser(`<?xml version="1.0" encoding="iso-8859-1"?>
  <methodResponse>
      <methodName>response</methodName>
      <params>
          <param name="ok">
              <value>
                  <boolean>1</boolean>
              </value>
          </param>
          <param name="xml">
             <value>
                <DOMElement>
                     <boleto>
                        <versao>1.1</versao>
                        <logoBoleto><![CDATA[logo.jpg]]></logoBoleto>
                        <dataVencimento><![CDATA[03/11/2018]]></dataVencimento>
                        <nome_cli><![CDATA[Cliente]]></nome_cli>
                        <especie><![CDATA[R$]]></especie>
                        <especieFixo><![CDATA[R$]]></especieFixo>
                        <demonstrativo><![CDATA[SERVICOS DE INTERNET   CLIENTE                       - PROTOCOLO DE CANCE        (R$  6.99)    TESTE - VENDA EQUIPAMENTO]]></demonstrativo>
                        <imagem><![CDATA[./document/001.jpg]]></imagem>
                        <banco><![CDATA[111-1]]></banco>
                        <linhadigitavel><![CDATA[11111.11111 11111.111111 11111.111111 1 11111111111111]]></linhadigitavel>
                        <codBarra><![CDATA[00199761700000005750000001927865000000410117]]></codBarra>
                        <LocalPagamento><![CDATA[QUALQUER BANCO ATE O VENCIMENTO. APOS, UTILIZE BOLETO NO SITE BB.COM.BR]]></LocalPagamento>
                        <beneficiario><![CDATA[Empresa Ltda CNPJ: 11.111.111/1111-11]]></beneficiario>
                        <agencia><![CDATA[1111-1 / 11111   -0]]></agencia>
                        <dataDocumento><![CDATA[29/10/18]]></dataDocumento>
                        <numeroDoc><![CDATA[2222222222]]></numeroDoc>
                        <especieDoc><![CDATA[DS]]></especieDoc>
                        <aceite><![CDATA[N]]></aceite>
                        <nossoNumero><![CDATA[66666666666666666-6]]></nossoNumero>
                        <carteira><![CDATA[99]]></carteira>
                        <quantidade>1</quantidade>
                        <valorDocumento><![CDATA[5,75]]></valorDocumento>
                        <instrucoes><![CDATA[APOS VENCIMENTO,MULTA DE R$ 10,00 MAIS JUROS DE 1%(R$0,06) AO MES]]></instrucoes>
                        <cpfCnpj><![CDATA[CPF:111.111.111-11]]></cpfCnpj>
                        <enderecoCob><![CDATA[AV Cliente 1111]]></enderecoCob>
                        <bairroCob><![CDATA[BAIRRO CLIENTE]]></bairroCob>
                        <nomeCidade><![CDATA[Birigui]]></nomeCidade>
                        <uf><![CDATA[SP]]></uf>
                        <cep><![CDATA[16200-000]]></cep>
                        <enderecoInstalacao><![CDATA[teste]]></enderecoInstalacao>
                        <bairroInstalacao><![CDATA[teste]]></bairroInstalacao>
                        <nomeCidadeInstalacao><![CDATA[Aracatuba]]></nomeCidadeInstalacao>
                        <ufInstalacao><![CDATA[SP]]></ufInstalacao>
                        <cepInstalacao><![CDATA[16200000]]></cepInstalacao>
                     </boleto>
                </DOMElement>
             </value>
          </param>
          <param name="versao">
             <value>
                <string><![CDATA[1.1]]></string>
             </value>
          </param>
          <param name="logoBoleto">
             <value>
                <string><![CDATA[logo.jpg]]></string>
             </value>
          </param>
          <param name="dataVencimento">
             <value>
                <string><![CDATA[03%2F11%2F2018]]></string>
             </value>
          </param>
          <param name="nome_cli">
             <value>
                <string><![CDATA[Cliente]]></string>
             </value>
          </param>
          <param name="especie">
             <value>
                <string><![CDATA[R%24]]></string>
             </value>
          </param>
          <param name="especieFixo">
             <value>
                <string><![CDATA[R%24]]></string>
             </value>
          </param>
          <param name="demonstrativo">
             <value>
                <string><![CDATA[SERVICOS%20DE%20INTERNET%20%20%20CLIENTE%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20-%20PROTOCOLO%20DE%20CANCE%20%20%20%20%20%20%20%20%28R%24%20%206.99%29%20%20%20%20TESTE%20-%20VENDA%20EQUIPAMENTO%20%20%20%20%20%20%20%20%20%20%20%20]]></string>
             </value>
          </param>
          <param name="imagem">
             <value>
                <string><![CDATA[.%2Fdocument%2F001.jpg]]></string>
             </value>
          </param>
          <param name="banco">
             <value>
                <string><![CDATA[111-1]]></string>
             </value>
          </param>
          <param name="linhadigitavel">
             <value>
                <string><![CDATA[11111.11111%2011111.111111%2011111.111111%201%2011111111111111]]></string>
             </value>
          </param>
          <param name="codBarra">
             <value>
                <string><![CDATA[00199761700000005750000001927865000000410117]]></string>
             </value>
          </param>
          <param name="LocalPagamento">
             <value>
                <string><![CDATA[QUALQUER%20BANCO%20ATE%20O%20VENCIMENTO.%20APOS%2C%20UTILIZE%20BOLETO%20NO%20SITE%20BB.COM.BR]]></string>
             </value>
          </param>
          <param name="beneficiario">
             <value>
                <string><![CDATA[Empresa%20Ltda%20CNPJ%3A%2011.111.111%2F0001-11]]></string>
             </value>
          </param>
          <param name="agencia">
             <value>
                <string><![CDATA[1111-4%20%2F%2016117%20%20%20-0]]></string>
             </value>
          </param>
          <param name="dataDocumento">
             <value>
                <string><![CDATA[29%2F10%2F18]]></string>
             </value>
          </param>
          <param name="numeroDoc">
             <value>
                <string><![CDATA[2222222222]]></string>
             </value>
          </param>
          <param name="especieDoc">
             <value>
                <string><![CDATA[DS]]></string>
             </value>
          </param>
          <param name="aceite">
             <value>
                <string><![CDATA[N]]></string>
             </value>
          </param>
          <param name="nossoNumero">
             <value>
                <string><![CDATA[66666666666666666-6]]></string>
             </value>
          </param>
          <param name="carteira">
             <value>
                <string><![CDATA[99]]></string>
             </value>
          </param>
          <param name="quantidade">
             <value>
                <string><![CDATA[1]]></string>
             </value>
          </param>
          <param name="valorDocumento">
             <value>
                <string><![CDATA[5%2C75]]></string>
             </value>
          </param>
          <param name="instrucoes">
             <value>
                <string><![CDATA[APOS%20VENCIMENTO%2CMULTA%20DE%20R%24%2010%2C00%20MAIS%20JUROS%20DE%201%25%28R%240%2C06%29%20AO%20MES]]></string>
             </value>
          </param>
          <param name="cpfCnpj">
             <value>
                <string><![CDATA[CPF%3A111.111.111-11]]></string>
             </value>
          </param>
          <param name="enderecoCob">
             <value>
                <string><![CDATA[AV%20Cliente%2C%201111]]></string>
             </value>
          </param>
          <param name="bairroCob">
             <value>
                <string><![CDATA[Bairro%20cliente]]></string>
             </value>
          </param>
          <param name="nomeCidade">
             <value>
                <string><![CDATA[Birigui]]></string>
             </value>
          </param>
          <param name="uf">
             <value>
                <string><![CDATA[SP]]></string>
             </value>
          </param>
          <param name="cep">
             <value>
                <string><![CDATA[16200-000]]></string>
             </value>
          </param>
          <param name="enderecoInstalacao">
             <value>
                <string><![CDATA[teste]]></string>
             </value>
          </param>
          <param name="bairroInstalacao">
             <value>
                <string><![CDATA[teste]]></string>
             </value>
          </param>
          <param name="nomeCidadeInstalacao">
             <value>
                <string><![CDATA[Aracatuba]]></string>
             </value>
          </param>
          <param name="ufInstalacao">
             <value>
                <string><![CDATA[SP]]></string>
             </value>
          </param>
          <param name="cepInstalacao">
             <value>
                <string><![CDATA[16000000]]></string>
             </value>
          </param>
      </params>
  </methodResponse>`)
      .then(resp => {
        expect(resp).to.be.eql(expected)
        done()
      })
      .catch(done)
  })
})
