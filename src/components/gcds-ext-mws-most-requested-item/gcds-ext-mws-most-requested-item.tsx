import { Component, Prop, h, Element, State } from '@stencil/core';

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

  @State() hasDefaultSlot = false;

  componentWillLoad() {
    this.updateDefaultSlotState();
  }

  private updateDefaultSlotState = () => {
    this.hasDefaultSlot = Array.from(this.host.childNodes).some((node) => this.isMeaningfulSlotContent(node));
  }

  private isMeaningfulSlotContent(node: ChildNode): boolean {
    if (node.nodeType === 3 || node.nodeType === 4) {
      return !!node.nodeValue?.trim();
    }

    return node.nodeType === 1;
  }

  render() {
    return (
      <a href={this.href}>
        <slot onSlotchange={this.updateDefaultSlotState}></slot>
        {!this.hasDefaultSlot ? this.text : undefined}
      </a>
    );
  }
}
