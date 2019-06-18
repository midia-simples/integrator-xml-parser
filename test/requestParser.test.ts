import { requestParser, removewhitesSpacesOutSideTags } from '../src'

describe('SuiterequestParser', () => {
  test('requestParser', () => {
    const received = requestParser('usuario', 'password', 'nomeMetodo', {
      metodo1: 'parametro Metodo1',
      metodo2: 'parametroMetodo2',
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
    expect(received).toEqual(expected)
  })
})
