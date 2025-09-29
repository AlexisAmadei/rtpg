function withLinks(resource, links = {}) {
  return { ...resource, _links: links };
}
module.exports = { withLinks };
