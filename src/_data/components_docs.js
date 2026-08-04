const docs = require('../../dist/docs.json');

module.exports = docs.components.reduce((components, component) => {
  components[component.tag] = component;
  return components;
}, {});