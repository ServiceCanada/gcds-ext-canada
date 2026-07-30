const fs = require('fs');
const path = require('path');

// Scans src/components/* for a component.meta.json in each component's
// folder and exposes the combined list as Eleventy global data (`components`).
module.exports = () => {
  const componentsDir = path.join(process.cwd(), 'src', 'components');

  if (!fs.existsSync(componentsDir)) {
    return [];
  }

  const entries = fs
    .readdirSync(componentsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const metaPath = path.join(componentsDir, entry.name, 'component.meta.json');
      if (!fs.existsSync(metaPath)) {
        return null;
      }
      return JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
    })
    .filter(Boolean);

  entries.sort((a, b) => a.name.localeCompare(b.name));
  return entries;
};
