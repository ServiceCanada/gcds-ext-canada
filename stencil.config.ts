import { Config } from '@stencil/core';

// Namespace used for the global build bundle, e.g. www/build/gcds-ext-mws.esm.js
export const config: Config = {
  namespace: 'gcds-ext-mws',
  outputTargets: [
    // Lazy-loaded distribution for npm consumers who just want to
    // `import 'gcds-ext-mws'` and use the custom elements.
    {
      type: 'dist',
      esmLoaderPath: '../loader',
    },
    // Tree-shakeable, non-lazy custom elements build for bundler consumers.
    {
      type: 'dist-custom-elements',
      externalRuntime: true,
    },
    // Auto-generates a readme.md per component (props, events, methods, slots, CSS parts).
    {
      type: 'docs-readme',
    },
    // Auto-generates a JSON schema for each component.
    {
      type: 'docs-json',
      file: 'dist/docs.json'
    },
    // A ready-to-run browser build, used both for local dev (`npm start`)
    // and as the bundle Playwright/Eleventy load in the browser.
    {
      type: 'www',
      serviceWorker: null,
      copy: [],
    },
  ],
  testing: {
    // We use Playwright (see /tests/e2e) instead of Stencil's built-in
    // Jest/Puppeteer testing, so Stencil's test runner is left disabled.
    browserHeadless: true,
  },
};
