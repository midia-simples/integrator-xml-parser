const { requestParser, removewhitesSpacesOutSideTags, responseParser } = require('../src')

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
    const expected = { ok: 1, historico: [ { data_processamento: '2018-09-20',
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
        done();
      })
      .catch(done)
  })

  it('Request parsers OK = 1 Not Array', done => {
    const expected = {ok: 1}
    responseParser(`<?xml version="1.0" encoding="iso-8859-1"?>
  <methodResponse>
      <methodName>response</methodName>
      <params>
          <param name="ok">
              <value>
                  <boolean>1</boolean>
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
