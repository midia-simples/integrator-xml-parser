const { removewhitesSpacesOutSideTags } = require('./utils/handleStrings')

const xmlBuildParams = objParams =>
  Object.keys(objParams).reduce((acc, key) => (
    acc.concat(`<param name="${key}">
                  <value>
                    <string><![CDATA[${encodeURIComponent(objParams[key])}]]></string>
                  </value>
                </param>`)
  ), '')

const requestParser = (user, password, methodName, objParams) =>
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

module.exports = requestParser
