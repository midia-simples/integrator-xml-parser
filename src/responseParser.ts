const xml2js = require('util').promisify(
  require('xml2js').Parser({
    trim: true,
    normalize: true,
    normalizeTags: true,
    explicitArray: false,
  }).parseString
)
const utf8 = require('utf8')
const htmlEntities = require('html-entities')
const compose = require('composeFn.ts')
const { NOT } = require('operators.ts')

const verifyIndexExistsInObjectPerType = (objectKeys, strType) =>
  objectKeys.indexOf(strType) !== -1 &&
  objectKeys[objectKeys.indexOf(strType)] === strType

const utf8Decode = str => {
  try {
    return utf8.decode(str)
  } catch (e) {
    return str
  }
}

const normalizeResponsesIntegrator = str =>
  compose(
    unescape,
    utf8Decode,
    htmlEntities.AllHtmlEntities.decode
  )(str)

const isArray = p => Array.isArray(p)

const toArray = p => [p]

const keyExistsInObject = (key, obj) => key in obj

const normalizeResponsesDomElement = arr =>
  arr.map(r => ({
    ...Object.keys(r).reduce(
      (acc, key) => ({
        ...acc,
        [key]: normalizeResponsesIntegrator(String(r[key]).trim()),
      }),
      {}
    ),
  }))

const valueFormatter = arrValue => {
  const keys = Object.keys(arrValue)
  if (verifyIndexExistsInObjectPerType(keys, 'boolean')) {
    return compose(
      parseInt,
      normalizeResponsesIntegrator,
      String
    )(arrValue[keys[keys.indexOf('boolean')]])
  }
  if (verifyIndexExistsInObjectPerType(keys, 'int')) {
    return compose(
      parseInt,
      normalizeResponsesIntegrator,
      String
    )(arrValue[keys[keys.indexOf('int')]])
  }
  if (verifyIndexExistsInObjectPerType(keys, 'string')) {
    return compose(
      normalizeResponsesIntegrator,
      String
    )(arrValue[keys[keys.indexOf('string')]])
  }
  if (verifyIndexExistsInObjectPerType(keys, 'double')) {
    return compose(
      normalizeResponsesIntegrator,
      String
    )(arrValue[keys[keys.indexOf('double')]])
  }
  if (verifyIndexExistsInObjectPerType(keys, 'domelement')) {
    const rows =
      arrValue.domelement.result === '' ? [] : arrValue.domelement.result.row
    return NOT(isArray(rows))
      ? compose(
          normalizeResponsesDomElement,
          toArray
        )(rows)
      : normalizeResponsesDomElement(rows)
  }
  return arrValue
}

const responseParser = xml => {
  return xml2js(xml).then(res => {
    if (res.methodresponse.fault) {
      return Promise.reject(
        res.methodresponse.fault.value.struct.member.reduce(
          (acc, p) => ({ ...acc, [p['name']]: valueFormatter(p['value']) }),
          {}
        )
      )
    }
    if (!Array.isArray(res.methodresponse.params.param)) {
      return {
        [res.methodresponse.params.param['$']['name']]: valueFormatter(
          res.methodresponse.params.param['value']
        ),
      }
    }
    return res.methodresponse.params.param.reduce(
      (acc, p) => ({ ...acc, [p['$']['name']]: valueFormatter(p['value']) }),
      {}
    )
  })
}

module.exports = responseParser
