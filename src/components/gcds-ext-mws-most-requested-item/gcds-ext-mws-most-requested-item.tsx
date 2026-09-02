import { Component, Prop, h, Element } from '@stencil/core';

/**
 * @slot - Link text. Overrides the text property.
 */
@Component({
  tag: 'gcds-ext-mws-most-requested-item',
  styleUrl: 'gcds-ext-mws-most-requested-item.css',
  shadow: true,
})
export class GcdsExtMwsMostRequestedItem {
  @Element() host!: HTMLElement;

  /**
   * Link href (required)
   */
  @Prop() href!: string;

  /**
   * Link text.
   *
   * Used as a fallback when the default slot is not provided.
   */
  @Prop() text?: string;

  private hasDefaultSlot(): boolean {
    return !!this.host.textContent?.trim();
  }

  render() {
    return (
      <a href={this.href}>
        {this.hasDefaultSlot() ? <slot /> : this.text}
      </a>
    );
  }
}
