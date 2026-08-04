const pkg = require('../../package.json');

module.exports = () => {
  const version = pkg.peerDependencies['@gcds-core/components'];
  const cleanVersion = version.match(/\d.*$/)[0];

  return cleanVersion;
};