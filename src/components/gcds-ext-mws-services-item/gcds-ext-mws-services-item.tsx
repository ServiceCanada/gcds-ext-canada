import { Component, Prop, State, Event, EventEmitter, h, Host } from '@stencil/core';

/**
 * @slot - The main content of the container.
 */
@Component({
  tag: 'gcds-ext-mws-services-item',
  styleUrl: 'gcds-ext-mws-services-item.css',
  shadow: true,
})
export class GcdsExtMwsServicesItem {
  /**
   * Service title
   */
  @Prop() serviceTitle!: string;

  /**
   * Link href
   */
  @Prop() href!: string;

  /**
   * Optional description.
   * If omitted, the component will render the default slot instead.
   */
  @Prop() description?: string;

  render() {
    return (
      <div class="gcds-ext-mws-services-item">
        <gcds-heading tag="h3" margin-bottom="0" margin-top="0">
          <gcds-link href={this.href}>{this.serviceTitle}</gcds-link>
        </gcds-heading>
        <gcds-text margin-bottom="100">{this.description ? this.description : <slot />}</gcds-text>
      </div>
    );
  }
}
