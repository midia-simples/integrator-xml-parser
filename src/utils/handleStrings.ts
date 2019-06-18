export const removewhitesSpacesOutSideTags = (xml: string) =>
  xml.replace(/\s+(?![^<>]*>)/g, '')
