# GCDS Extension Components

A collection of reusable web components that extend the Government of Canada Design System (GCDS) with additional functionality for Canada.ca managed web services.

Built with Stencil, the library produces framework-agnostic Web Components that can be used in static sites, CMS platforms, and modern JavaScript frameworks.

## Features

* Framework-agnostic Web Components
* Built with Stencil
* Shadow DOM encapsulation
* TypeScript support
* Accessibility-first development
* Automated component documentation
* Playwright end-to-end testing
* Eleventy-powered documentation site
* Bilingual documentation support (English and French)
* Compatible with GCDS components

## Getting Started

### Prerequisites

* Node.js 22 or later
* npm 10 or later

### Installation

Clone the repository:

```bash
git clone https://github.com/ServiceCanada/gcds-ext-canada.git
cd gcds-ext-canada
```

Install dependencies:

```bash
npm install
```

## Development

Start the component library and documentation site in watch mode:

```bash
npm start
```

This command:

* Rebuilds Stencil components when source files change
* Regenerates documentation pages
* Serves the Eleventy documentation site locally

### Build

Build the component library:

```bash
npm run build
```

### Generate Documentation

Build the component library and documentation site:

```bash
npm run docs:build
```

### Serve Documentation

Build and launch the documentation site locally:

```bash
npm run docs:serve
```

## Documentation

Documentation is generated using Eleventy and includes:

* Component overview
* Live examples
* Usage guidance
* Properties
* Events
* Slots
* Accessibility considerations
* Source code examples

Component API metadata is generated directly from the Stencil source to ensure documentation remains synchronized with implementation.

## Testing

Run end-to-end tests:

```bash
npm test
```

Run tests with the Playwright UI:

```bash
npm run test:ui
```

Run tests in headed mode:

```bash
npm run test:headed
```

## Using Components

After building the project, load the generated component bundle:

```html
<script type="module" src="/build/gcds-ext-mws.esm.js"></script>
```

## Accessibility

Accessibility is a core requirement for all components.

Components are designed to:

* Support keyboard navigation
* Provide appropriate ARIA semantics
* Work with assistive technologies
* Follow WCAG guidance where applicable
* Align with Government of Canada accessibility requirements

## Contributing

Contributions are welcome.

Before submitting a pull request:

1. Create or update documentation.
2. Add or update tests.
3. Verify accessibility requirements.
4. Ensure all builds and tests pass.

## Related Resources

* [GC Design System](https://design-system.canada.ca/)
* [GCDS Components](https://github.com/cds-snc/gcds-components)
* [StencilJS](https://stenciljs.com/)
* [Eleventy](https://www.11ty.dev/)
* [Playwright](https://playwright.dev/)

## License

MIT
