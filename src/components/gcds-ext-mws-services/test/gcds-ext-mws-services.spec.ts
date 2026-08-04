/**
 * Playwright tests for <gcds-ext-mws-services>
 */

import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'http://localhost:3333';

/**
 * Mounts the component (and optional slotted children) into the page's #root
 * mount point, then waits for Stencil hydration to complete.
 */
async function mountComponent(page: Page, markup: string) {
  await page.goto(`${BASE_URL}/`);

  await page.evaluate((html) => {
    const root = document.getElementById('root') ?? document.body;
    root.innerHTML = html;
  }, markup);

  const host = page.locator('gcds-ext-mws-services');
  await host.waitFor({ state: 'attached' });

  // Wait for Stencil to finish hydrating (hydrated class is added post-render).
  await page.waitForFunction(() => {
    const el = document.querySelector('gcds-ext-mws-services');
    return !!el && el.shadowRoot !== null && el.shadowRoot.childElementCount > 0;
  });
}

const DEFAULT_SLOT_CONTENT = `
  <div>Service A</div>
  <div>Service B</div>
  <div>Service C</div>
`;

const MORE_INFO_CONTENT = `<p slot="moreInformation">Need help? Contact us.</p>`;

test.describe('gcds-ext-mws-services', () => {
  test('renders the host container with a visible heading by default', async ({ page }) => {
    await mountComponent(
      page,
      `<gcds-ext-mws-services services-title="Our Services">${DEFAULT_SLOT_CONTENT}</gcds-ext-mws-services>`
    );

    const container = page.locator('gcds-ext-mws-services .gcds-ext-mws-services');
    await expect(container).toBeVisible();

    const heading = page.locator('gcds-ext-mws-services gcds-heading[tag="h2"]');
    await expect(heading).toHaveText('Our Services');

    // The visually-hidden variant should NOT be present when hideTitle is falsy.
    const srOnly = page.locator('gcds-ext-mws-services gcds-sr-only');
    await expect(srOnly).toHaveCount(0);
  });

  test('renders a visually-hidden heading when hideTitle is true', async ({ page }) => {
    await mountComponent(
      page,
      `<gcds-ext-mws-services services-title="Our Services" hide-title="true">${DEFAULT_SLOT_CONTENT}</gcds-ext-mws-services>`
    );

    const srOnly = page.locator('gcds-ext-mws-services gcds-sr-only[tag="h2"]');
    await expect(srOnly).toHaveText('Our Services');

    const heading = page.locator('gcds-ext-mws-services gcds-heading');
    await expect(heading).toHaveCount(0);
  });

  test('renders the visible heading when hideTitle is explicitly false', async ({ page }) => {
    await mountComponent(
      page,
      `<gcds-ext-mws-services services-title="Our Services" hide-title="false">${DEFAULT_SLOT_CONTENT}</gcds-ext-mws-services>`
    );

    await expect(page.locator('gcds-ext-mws-services gcds-heading')).toHaveText('Our Services');
    await expect(page.locator('gcds-ext-mws-services gcds-sr-only')).toHaveCount(0);
  });

  test('projects default slot content into gcds-grid', async ({ page }) => {
    await mountComponent(
      page,
      `<gcds-ext-mws-services services-title="Our Services">${DEFAULT_SLOT_CONTENT}</gcds-ext-mws-services>`
    );

    const grid = page.locator('gcds-ext-mws-services gcds-grid');
    await expect(grid).toBeVisible();

    // Slotted (light DOM) children live on the host element itself.
    const items = page.locator('gcds-ext-mws-services > div');
    await expect(items).toHaveCount(3);
    await expect(items.nth(0)).toHaveText('Service A');
    await expect(items.nth(1)).toHaveText('Service B');
    await expect(items.nth(2)).toHaveText('Service C');
  });

  test('projects "moreInformation" named slot content', async ({ page }) => {
    await mountComponent(
      page,
      `<gcds-ext-mws-services services-title="Our Services">
        ${DEFAULT_SLOT_CONTENT}
        ${MORE_INFO_CONTENT}
      </gcds-ext-mws-services>`
    );

    const moreInfoWrapper = page.locator('gcds-ext-mws-services .more-information');
    await expect(moreInfoWrapper).toBeVisible();

    const moreInfoContent = page.locator('gcds-ext-mws-services [slot="moreInformation"]');
    await expect(moreInfoContent).toHaveText('Need help? Contact us.');
  });

  test('renders an empty "more-information" wrapper when no named slot content is provided', async ({ page }) => {
    await mountComponent(
      page,
      `<gcds-ext-mws-services services-title="Our Services">${DEFAULT_SLOT_CONTENT}</gcds-ext-mws-services>`
    );

    const moreInfoWrapper = page.locator('gcds-ext-mws-services .more-information');
    await expect(moreInfoWrapper).toBeAttached();
    await expect(moreInfoWrapper).toBeEmpty();
  });

  test.describe('columns prop / grid layout', () => {
    test('defaults to 3 columns when the prop is not set', async ({ page }) => {
      await mountComponent(
        page,
        `<gcds-ext-mws-services services-title="Our Services">${DEFAULT_SLOT_CONTENT}</gcds-ext-mws-services>`
      );

      const grid = page.locator('gcds-ext-mws-services gcds-grid');
      await expect(grid).toHaveAttribute('columns', '1fr');
      await expect(grid).toHaveAttribute('columns-tablet', '1fr 1fr');
      await expect(grid).toHaveAttribute('columns-desktop', '1fr 1fr 1fr');
    });

    test('columns=1 renders a single column at every breakpoint', async ({ page }) => {
      await mountComponent(
        page,
        `<gcds-ext-mws-services services-title="Our Services" columns="1">${DEFAULT_SLOT_CONTENT}</gcds-ext-mws-services>`
      );

      const grid = page.locator('gcds-ext-mws-services gcds-grid');
      await expect(grid).toHaveAttribute('columns', '1fr');
      await expect(grid).toHaveAttribute('columns-tablet', '1fr');
      await expect(grid).toHaveAttribute('columns-desktop', '1fr');
    });

    test('columns=2 caps tablet at 2 columns and desktop at 2 columns', async ({ page }) => {
      await mountComponent(
        page,
        `<gcds-ext-mws-services services-title="Our Services" columns="2">${DEFAULT_SLOT_CONTENT}</gcds-ext-mws-services>`
      );

      const grid = page.locator('gcds-ext-mws-services gcds-grid');
      await expect(grid).toHaveAttribute('columns', '1fr');
      await expect(grid).toHaveAttribute('columns-tablet', '1fr 1fr');
      await expect(grid).toHaveAttribute('columns-desktop', '1fr 1fr');
    });

    test('columns=3 caps tablet at 2 columns while desktop uses 3', async ({ page }) => {
      await mountComponent(
        page,
        `<gcds-ext-mws-services services-title="Our Services" columns="3">${DEFAULT_SLOT_CONTENT}</gcds-ext-mws-services>`
      );

      const grid = page.locator('gcds-ext-mws-services gcds-grid');
      await expect(grid).toHaveAttribute('columns', '1fr');
      await expect(grid).toHaveAttribute('columns-tablet', '1fr 1fr');
      await expect(grid).toHaveAttribute('columns-desktop', '1fr 1fr 1fr');
    });

    test('updating the columns prop dynamically re-renders the grid', async ({ page }) => {
      await mountComponent(
        page,
        `<gcds-ext-mws-services id="svc" services-title="Our Services" columns="1">${DEFAULT_SLOT_CONTENT}</gcds-ext-mws-services>`
      );

      const grid = page.locator('gcds-ext-mws-services gcds-grid');
      await expect(grid).toHaveAttribute('columns-desktop', '1fr');

      await page.evaluate(() => {
        const el = document.getElementById('svc') as HTMLElement & { columns: number };
        el.columns = 3 as any;
      });

      await expect(grid).toHaveAttribute('columns-tablet', '1fr 1fr');
      await expect(grid).toHaveAttribute('columns-desktop', '1fr 1fr 1fr');
    });
  });

  test.describe('accessibility', () => {
    test('title text is present in the accessibility tree even when visually hidden', async ({ page }) => {
      await mountComponent(
        page,
        `<gcds-ext-mws-services services-title="Accessible Title" hide-title="true">${DEFAULT_SLOT_CONTENT}</gcds-ext-mws-services>`
      );

      const srOnly = page.locator('gcds-ext-mws-services gcds-sr-only');
      // Content should exist in the DOM/AX tree, just visually hidden — not `display: none`.
      await expect(srOnly).toHaveText('Accessible Title');
      await expect(srOnly).toBeAttached();
    });

    test('heading uses an h2 tag for correct document outline', async ({ page }) => {
      await mountComponent(
        page,
        `<gcds-ext-mws-services services-title="Our Services">${DEFAULT_SLOT_CONTENT}</gcds-ext-mws-services>`
      );

      await expect(page.locator('gcds-ext-mws-services gcds-heading')).toHaveAttribute('tag', 'h2');
    });
  });
});