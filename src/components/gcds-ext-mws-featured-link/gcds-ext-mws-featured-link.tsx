import { Component, State, h, Element, Host, Prop } from '@stencil/core';
import { assignLanguage, observerConfig } from '../../utils/utils';
import { GcdsTextLight, GcdsTextPrimary } from '@gcds-core/tokens/build/web/js/tokens';
import i18n from './i18n/i18n';

/**
 * @slot link - An `<a href="url" slot="link">text</a>` used to build the featured gcds-link. Accepts HTML content. Required if the `href` and `link-text` props are not set.
 * @slot description - Optional. A `<p slot="description">text</p>` used to build the gcds-text shown under the link. Accepts HTML content. Ignored if the `description` prop is set.
 */
@Component({
  tag: 'gcds-ext-mws-featured-link',
  styleUrl: 'gcds-ext-mws-featured-link.css',
  shadow: true,
})
export class GcdsExtMwsFeaturedLink {
  @Element() el!: HTMLElement;

  /**
   * Props
   */

  /**
   * URL for the featured link. Mandatory if the `link` slot is not used.
   */
  @Prop() href?: string;

  /**
   * Text for the featured link. Mandatory if the `link` slot is not used.
   */
  @Prop() linkText?: string;

  /**
   * Description shown under the link. Optional, and takes priority over the `description` slot if both are provided.
   */
  @Prop() description?: string;

  /**
   * Background color for the featured link section, as a hex value (e.g. "#FF0000").
   */
  @Prop() bgColor?: string;

  /**
   * States
   */

  /**
   * Language of rendered component
   */
  @State() lang?: string = "en";

  /**
   * URL used to build the gcds-link, resolved from the `href` prop or the `link` slot
   */
  @State() linkHref?: string | null;

  /**
   * HTML content used to build the gcds-link, resolved from the `link-text` prop or the `link` slot
   */
  @State() linkHtml?: string;

  /**
   * HTML content used to build the gcds-text, resolved from the `description` prop or the `description` slot
   */
  @State() descriptionHtml?: string;

  /**
   * Whether bgColor has insufficient contrast against var(--gcds-bg-primary),
   * meaning gcds-link/gcds-text should switch to their "light" roles.
   */
  @State() useLightRole: boolean = true;

  /*
   * Observe lang attribute change
   */
  updateLang() {
    const observer = new MutationObserver(mutations => {
      if (mutations[0].oldValue != this.el.lang) {
        this.lang = this.el.lang;
      }
    });
    observer.observe(this.el, observerConfig);
  }

  /*
   * Convert hex (#RRGGBB) → RGB
   */
  private hexToRgb(hex: string): [number, number, number] {
    const clean = hex.replace('#', '');
    const bigint = parseInt(clean, 16);
    return [
      (bigint >> 16) & 255,
      (bigint >> 8) & 255,
      bigint & 255,
    ];
  }

  /*
   * WCAG relative luminance
   */
  private luminance([r, g, b]: [number, number, number]): number {
    const srgb = [r, g, b].map(v => {
      const c = v / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
  }

  /*
   * WCAG contrast ratio
   */
  private contrastRatio(bg: string, fg: string): number {
    const L1 = this.luminance(this.hexToRgb(bg));
    const L2 = this.luminance(this.hexToRgb(fg));
    const lighter = Math.max(L1, L2);
    const darker = Math.min(L1, L2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  /*
   * Resolve link/description content from props first, falling back to
   * the author-provided slotted elements. Save the data needed to build
   * gcds-link / gcds-text in the render function.
   */
  private parseContent() {
    if (this.href && this.linkText) {
      this.linkHref = this.href;
      this.linkHtml = this.linkText;
    } else {
      const linkEl = this.el.querySelector<HTMLAnchorElement>('a[slot="link"]');

      if (!linkEl || !linkEl.getAttribute('href')) {
        console.error(
          'gcds-ext-mws-featured-link: either the "href" and "link-text" props, or a required <a href="url" slot="link">text</a> element, must be provided.',
        );
      } else {
        this.linkHref = linkEl.getAttribute('href');
        this.linkHtml = linkEl.innerHTML.trim();
      }
    }

    if (this.description) {
      this.descriptionHtml = this.description;
    } else {
      const descriptionEl = this.el.querySelector<HTMLParagraphElement>('p[slot="description"]');

      if (descriptionEl) {
        this.descriptionHtml = descriptionEl.innerHTML.trim();
      }
    }
  }

  /*
   * Validates if the contrast ratio between the background color and the text colors (GcdsTextLight and GcdsTextPrimary) meets the minimum WCAG 2.1 AA standard of 4.5:1. If neither text color meets the contrast requirement, an error is thrown. If one of them meets the requirement, the component will use that text color for rendering.
   */
  private validateContrast() {
    if (!this.bgColor) {
      return; // No bgColor → nothing to validate
    }

    const bg = this.bgColor;

    // GCDS tokens expose colors as hex strings
    const lightColor = GcdsTextLight;
    const primaryColor = GcdsTextPrimary;

    const ratioLight = this.contrastRatio(bg, lightColor);
    const ratioPrimary = this.contrastRatio(bg, primaryColor);

    const MIN = 4.5;

    const lightOK = ratioLight >= MIN;
    const primaryOK = ratioPrimary >= MIN;

    if (!lightOK && !primaryOK) {
      throw new Error(
        `[gcds-ext-mws-featured-link] Background color ${bg} does not meet the minimum 4.5:1 contrast ratio for either GcdsTextLight or GcdsTextPrimary.`
      );
    }

    if (lightOK) {
      this.useLightRole = true;
      return;
    }

    // Light fails but Primary passes → switch to primary role
    this.useLightRole = false;
  }

  async componentWillLoad() {
    // Define lang attribute
    this.lang = assignLanguage(this.el);

    this.updateLang();
    this.parseContent();
    this.validateContrast();
  }

  render() {
    return (
      <Host>
        <section
          class="gcds-ext-mws-featured-link"
          style={this.bgColor ? { backgroundColor: this.bgColor } : {}}
        >
          <gcds-container layout="page">
            <h2>{i18n[this.lang].spotlightOn}</h2>
            {this.linkHref && this.linkHtml && (
              <gcds-link
                href={this.linkHref}
                innerHTML={this.linkHtml}
                {...(this.useLightRole ? { 'link-role': 'light' } : {})}
                margin-bottom="0"
              ></gcds-link>
            )}
            {this.descriptionHtml && (
              <gcds-text
                innerHTML={this.descriptionHtml}
                {...(this.useLightRole ? { 'text-role': 'light' } : {})}
                margin-top="100"
                margin-bottom="0"
              ></gcds-text>
            )}
          </gcds-container>
        </section>
      </Host>
    );
  }
}