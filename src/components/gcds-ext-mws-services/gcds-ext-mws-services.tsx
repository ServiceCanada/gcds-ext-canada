import { Component, Prop, h, Element, Watch } from '@stencil/core';

/**
 * @slot heading - Custom heading content.
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
   * Heading text (required)
   */
  @Prop() heading!: string;

  /**
   * Hide the Heading visually.
   */
  @Prop() hideHeading?: boolean = false;

  /**
   * Number of columns to distribute items across.
   * Allowed values: 1, 2, 3.
   */
  @Prop({ mutable: true }) columns: 1 | 2 | 3 = 3;

  @Watch('columns')
  validateColumns(newValue: number) {
    if (![1, 2, 3].includes(Number(newValue))) {
      console.warn(
        `[gcds-ext-mws-services] Invalid value "${newValue}" provided for "columns". Falling back to 3.`,
      );
      this.columns = 3;
    }
  }

  componentWillLoad() {
    this.validateColumns(this.columns);
  }

  private getGridColumns() {
    const mobile = '1fr';

    const tabletCols = Math.min(this.columns, 2);
    const tablet = Array(tabletCols).fill('1fr').join(' ');

    const desktop = Array(this.columns).fill('1fr').join(' ');

    return { mobile, tablet, desktop };
  }

  private renderHeading() {
    const hide = this.hideHeading === true;

    if (hide) {
      return (
        <gcds-sr-only tag="h2">
          <slot name="heading">{this.heading}</slot>
        </gcds-sr-only>
      );
    }

    return (
      <gcds-heading tag="h2">
        <slot name="heading">{this.heading}</slot>
      </gcds-heading>
    );
  }

  render() {
    const { mobile, tablet, desktop } = this.getGridColumns();

    return (
      <div class="gcds-ext-mws-services">
        {this.renderHeading()}

        <gcds-grid
          columns={mobile}
          columns-tablet={tablet}
          columns-desktop={desktop}
        >
          <slot></slot>
        </gcds-grid>
      </div>
    );
  }
}
