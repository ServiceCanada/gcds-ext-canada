import { Component, Prop, h, Element } from '@stencil/core';

/**
 * @slot heading - Custom heading content.
 * @slot - The main content of the container.
 */
@Component({
  tag: 'gcds-ext-mws-services-item',
  styleUrl: 'gcds-ext-mws-services-item.css',
  shadow: true,
})
export class GcdsExtMwsServicesItem {
  @Element() host!: HTMLElement;

  /**
   * Service title.
   *
   * Used as a fallback when the heading slot is not provided.
   */
  @Prop() heading?: string;

  /**
   * Link href
   */
  @Prop() href!: string;

  /**
   * Optional description.
   * If omitted, the component will render the default slot instead.
   */
  @Prop() description?: string;

  private hasHeadingSlot(): boolean {
    return !!this.host.querySelector('[slot="heading"]');
  }

  render() {
    const hasHeadingSlot = this.hasHeadingSlot();

    return (
      <div class="gcds-ext-mws-services-item">
        <gcds-heading tag="h3" margin-bottom="0" margin-top="0">
          <gcds-link href={this.href}>
            {hasHeadingSlot ? (
              <slot name="heading"></slot>
            ) : (
              this.heading
            )}
          </gcds-link>
        </gcds-heading>

        <gcds-text margin-bottom="100">
          {this.description ? this.description : <slot />}
        </gcds-text>
      </div>
    );
  }
}