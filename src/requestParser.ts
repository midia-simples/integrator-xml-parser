import { removewhitesSpacesOutSideTags } from './utils/handleStrings'

const xmlBuildParams = (objParams: any) =>
  Object.keys(objParams).reduce(
    (acc, key) =>
      acc.concat(`<param name="${key}">
                  <value>
                    <string><![CDATA[${encodeURIComponent(
                      objParams[key]
                    )}]]></string>
                  </value>
                </param>`),
    ''
  )

export const requestParser = (
  user: string,
  password: string,
  methodName: string,
  objParams: object
) =>
  removewhitesSpacesOutSideTags(
    `<?xml version="1.0" encoding="iso-8859-1"?>
    <methodCall>
      <methodName>${methodName}</methodName>
      <params>
      ${xmlBuildParams({ _user: user, _passwd: password })}
      ${xmlBuildParams(objParams)}
     </params>
    </methodCall>`
  )
