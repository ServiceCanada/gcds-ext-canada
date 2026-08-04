const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");

module.exports = function (eleventyConfig) {
  // Static assets for the docs site itself (CSS, etc.)
  eleventyConfig.addPassthroughCopy({ 'src/assets': 'assets' });

  // The compiled component bundle produced by `stencil build` (www output
  // target). Docs pages load this so live <app-alert> demos actually work.
  eleventyConfig.addPassthroughCopy({ 'www/build': 'build' });

  // Passthrough your browser-only loader
  eleventyConfig.addPassthroughCopy({ "public": "public" });

  // Watch Stencil component changes
  eleventyConfig.addWatchTarget('./src/components/');

  // Add syntax highlighting
  eleventyConfig.addPlugin(syntaxHighlight, {
    templateFormats: ["*", "html", "md"] // adds support across formats
  });

  // Detect GitHub Pages environment
  const isGithubPages = process.env.GITHUB_ACTIONS === 'true';

  return {
    dir: {
      input: 'src',
      output: '_site',
      includes: '_includes',
      data: '_data',
    },
    htmlTemplateEngine: 'njk',
    markdownTemplateEngine: 'njk',

    // Only apply prefix when deployed on GitHub Pages
    pathPrefix: isGithubPages ? "/gcds-ext-canada" : "",
  };
};
