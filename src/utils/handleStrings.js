const removewhitesSpacesOutSideTags = (xml) => xml.replace(/\s+(?![^<>]*>)/g, '')

module.exports = {
  removewhitesSpacesOutSideTags
}
