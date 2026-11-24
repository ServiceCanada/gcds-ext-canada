import type { Page } from '@stencil/playwright';

export interface RenderTestPageOptions {
    headExtra?: string;
    lang?: string;
}

export async function renderTestPage(
    page: Page,
    bodyContent: string,
    options: RenderTestPageOptions = {},
): Promise<void> {
    const { headExtra = '', lang = 'en' } = options;

    await page.setContent(`
        <!DOCTYPE html>
            <html lang="${lang}">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta name="dcterms.creator" content="ESDC">

                <title>Component test - Canada.ca</title>

                <link rel="stylesheet" href="https://cdn.design-system.canada.ca/@gcds-core/components@latest/dist/gcds/gcds.css" />
                <link rel="stylesheet" href="/assets/style.css">

                <script type="module" src="https://cdn.design-system.canada.ca/@gcds-core/components@latest/dist/gcds/gcds.esm.js"></script>
                <script type="module" src="/build/gcds-ext-mws.esm.js"></script>
                <script nomodule src="/build/gcds-ext-mws.js"></script>

                ${headExtra}
            </head>
            <body>
                ${bodyContent}
            </body>
        </html>
    `);

    await page.waitForChanges();
}
