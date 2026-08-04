import { Component, Prop, h, Element } from '@stencil/core';

/**
 * @slot - The main content of the container.
 */
@Component({
  tag: 'gcds-ext-mws-services',
  styleUrl: 'gcds-ext-mws-services.css',
  shadow: true,
})
export class GcdsExtMwsServices {
  @Element() host!: HTMLElement;

  /**
   * Title text (required)
   */
  @Prop() servicesTitle!: string;

  /**
   * Hide the title visually.
   */
  @Prop() hideTitle?: boolean = false;

  /**
   * Number of columns to distribute items across.
   */
  @Prop() columns: 1 | 2 | 3 = 3;

  private getGridColumns() {
    const mobile = '1fr';

    const tabletCols = Math.min(this.columns, 2);
    const tablet = Array(tabletCols).fill('1fr').join(' ');

    const desktop = Array(this.columns).fill('1fr').join(' ');

    return { mobile, tablet, desktop };
  }

  private renderTitle() {
    const hide = this.hideTitle === true;

    if (hide) {
      return (
        <gcds-sr-only tag="h2">
          {this.servicesTitle}
        </gcds-sr-only>
      );
    }

    return (
      <gcds-heading tag="h2">
        {this.servicesTitle}
      </gcds-heading>
    );
  }

  render() {
    const { mobile, tablet, desktop } = this.getGridColumns();

    return (
      <div class="gcds-ext-mws-services">
        {this.renderTitle()}

        <gcds-grid
          columns={mobile}
          columns-tablet={tablet}
          columns-desktop={desktop}
        >
          <slot></slot>
        </gcds-grid>

        <div class="more-information">
          <slot name="moreInformation"></slot>
        </div>
      </div>
    );
  }
}
