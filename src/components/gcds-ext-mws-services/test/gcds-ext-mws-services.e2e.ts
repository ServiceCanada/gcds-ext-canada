import { expect } from '@playwright/test';
import { test } from '@stencil/playwright';
import { renderTestPage } from '../../../../tests/helpers';

const defaultElements = `
  <gcds-ext-mws-services-item heading="[Hyperlink text 1]" href="#">Description 1</gcds-ext-mws-services-item>
  <gcds-ext-mws-services-item heading="[Hyperlink text 2]" href="#">Description 2</gcds-ext-mws-services-item>
  <gcds-ext-mws-services-item heading="[Hyperlink text 3]" href="#">Description 3</gcds-ext-mws-services-item>
  <gcds-ext-mws-services-item heading="[Hyperlink text 4]" href="#">Description 4</gcds-ext-mws-services-item>
  <gcds-ext-mws-services-item heading="[Hyperlink text 5]" href="#">Description 5</gcds-ext-mws-services-item>
  <gcds-ext-mws-services-item heading="[Hyperlink text 6]" href="#">Description 6</gcds-ext-mws-services-item>
  `;

test.describe('gcds-ext-mws-services', () => {
  test('default render', async ({ page }) => {
    await renderTestPage(page, `
      <gcds-ext-mws-services heading="Services and information">
        ${defaultElements}
      </gcds-ext-mws-services>
      `
    );

    const element = page.locator('gcds-ext-mws-services');

    // Wait for element to attach and become visible, allowing up to 10s
    await element.waitFor({ state: 'attached' });
    await element.waitFor({ state: 'visible' });

    await expect(element).toHaveClass('hydrated');
    await expect(element.locator('gcds-heading:not(gcds-ext-mws-services-item gcds-heading)')).toHaveText('Services and information');
    await expect(element.locator('gcds-grid')).toHaveAttribute('columns-desktop', '1fr 1fr 1fr');
    await expect(element.locator('gcds-grid')).toHaveAttribute('columns-tablet', '1fr 1fr');
  });

  test('no heading', async ({ page }) => {
    await renderTestPage(page, `
      <gcds-ext-mws-services heading="Services and information" hide-heading>
        ${defaultElements}
      </gcds-ext-mws-services>
      `
    );

    const element = page.locator('gcds-ext-mws-services');

    await expect(element.locator('gcds-heading:not(gcds-ext-mws-services-item gcds-heading)')).toHaveCount(0);
    await expect(element.locator('gcds-sr-only')).toContainText('Services and information');
  });

  test('renders single column layout', async ({ page }) => {
    await renderTestPage(page, `
      <gcds-ext-mws-services
        heading="Services and information"
        columns="1">
        ${defaultElements}
      </gcds-ext-mws-services>
    `);

    const grid = page.locator('gcds-ext-mws-services gcds-grid');

    await expect(grid).toHaveAttribute('columns-tablet', '1fr');
    await expect(grid).toHaveAttribute('columns-desktop', '1fr');
  });

  test('renders two column layout', async ({ page }) => {
    await renderTestPage(page, `
      <gcds-ext-mws-services
        heading="Services and information"
        columns="2">
        ${defaultElements}
      </gcds-ext-mws-services>
    `);

    const grid = page.locator('gcds-ext-mws-services gcds-grid');

    await expect(grid).toHaveAttribute('columns-tablet', '1fr 1fr');
    await expect(grid).toHaveAttribute('columns-desktop', '1fr 1fr');
  });

  test('renders three column layout when columns is explicitly set to 3', async ({ page }) => {
    await renderTestPage(page, `
      <gcds-ext-mws-services
        heading="Services and information"
        columns="3">
        ${defaultElements}
      </gcds-ext-mws-services>
    `);

    const grid = page.locator('gcds-ext-mws-services gcds-grid');

    await expect(grid).toHaveAttribute('columns-desktop', '1fr 1fr 1fr');
    await expect(grid).toHaveAttribute('columns-tablet', '1fr 1fr');
  });

  test('falls back to 3 columns when invalid value is provided', async ({ page }) => {
    await renderTestPage(page, `
      <gcds-ext-mws-services
        heading="Services and information"
        columns="5">
        ${defaultElements}
      </gcds-ext-mws-services>
    `);

    const grid = page.locator('gcds-ext-mws-services gcds-grid');

    await expect(grid).toHaveAttribute('columns-desktop', '1fr 1fr 1fr');
    await expect(grid).toHaveAttribute('columns-tablet', '1fr 1fr');
  });

  test('renders all service items', async ({ page }) => {
    await renderTestPage(page, `
      <gcds-ext-mws-services heading="Services and information">
        ${defaultElements}
      </gcds-ext-mws-services>
    `);

    await expect(page.locator('gcds-ext-mws-services-item')).toHaveCount(6);
  });
});
