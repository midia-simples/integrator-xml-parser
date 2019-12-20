const requestParser = require("./requestParser");
const {
  responseParser,
  valueFormatter,
  normalizeResponsesIntegrator
} = require("./responseParser");
const { removewhitesSpacesOutSideTags } = require("./utils/handleStrings");

module.exports = {
  requestParser,
  removewhitesSpacesOutSideTags,
  responseParser,
  valueFormatter,
  normalizeResponsesIntegrator
};
