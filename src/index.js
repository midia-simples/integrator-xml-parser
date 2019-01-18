const requestParser = require('./requestParser')
const responseParser = require('./responseParser')
const { removewhitesSpacesOutSideTags } = require('./utils/handleStrings')

module.exports = {
  requestParser,
  removewhitesSpacesOutSideTags,
  responseParser
}
