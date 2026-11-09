import { Component, Prop, h, Element, State } from '@stencil/core';

type MostRequestedFrame = 'nav' | 'home';

type MostRequestedItem = {
  slotName: string;
};

/**
 * @slot heading - Custom heading content.
 * @slot - Most requested item elements.
 */
@Component({
  tag: 'gcds-ext-mws-most-requested',
  styleUrl: 'gcds-ext-mws-most-requested.css',
  shadow: true,
})
export class GcdsExtMwsMostRequested {
  @Element() host!: HTMLElement;

  /**
   * Heading text (required)
   */
  @Prop() heading!: string;

  /**
   * Hide the heading visually.
   */
  @Prop() hideHeading?: boolean = false;

  @State() resolvedFrame: MostRequestedFrame = 'nav';
  @State() items: MostRequestedItem[] = [];
  @State() itemCount = 0;
  @State() hasStackedSibling = false;
  @State() isMisnested = false;

  private childObserver?: MutationObserver;
  private siblingObserver?: MutationObserver;
  private itemSlotNames = new WeakMap<HTMLElement, string>();
  private nextSlotId = 0;

  componentWillLoad() {
    this.updateResolvedFrame();
    this.updateItems();
    this.updateAuthoringState();
  }

  componentDidLoad() {
    this.observeItems();
    this.observeSiblings();
    this.updateAuthoringState();
  }

  disconnectedCallback() {
    this.childObserver?.disconnect();
    this.siblingObserver?.disconnect();
  }

  private updateResolvedFrame() {
    const resolvedFrame = this.resolveFrame();

    this.resolvedFrame = resolvedFrame;
    this.host.setAttribute('data-gcds-frame', resolvedFrame);
  }

  private resolveFrame(): MostRequestedFrame {
    return this.isCanadaHomePage() ? 'home' : 'nav';
  }

  private isCanadaHomePage(): boolean {
    const ownerDocument = this.host?.ownerDocument;

    return [ownerDocument?.documentElement, ownerDocument?.body].some((element) => (
      !!element && element.classList.contains('home') && element.classList.contains('page-type-nav')
    ));
  }

  private observeItems() {
    if (typeof MutationObserver === 'undefined') {
      return;
    }

    this.childObserver = new MutationObserver(() => this.updateItems());
    this.childObserver.observe(this.host, {
      attributes: true,
      attributeFilter: ['href', 'text'],
      childList: true,
      characterData: true,
      subtree: true,
    });
  }

  private observeSiblings() {
    if (typeof MutationObserver === 'undefined' || !this.host.parentElement) {
      return;
    }

    this.siblingObserver = new MutationObserver(() => this.updateAuthoringState());
    this.siblingObserver.observe(this.host.parentElement, { childList: true });
  }

  private updateAuthoringState() {
    this.hasStackedSibling = this.hasFollowingMostRequestedSibling();
    this.isMisnested = this.isInsideWrongContainer();

    this.host.toggleAttribute('data-gcds-stacked', this.hasStackedSibling);
    this.host.toggleAttribute('data-gcds-misnested', this.isMisnested);
  }

  private hasFollowingMostRequestedSibling(): boolean {
    return this.host?.nextElementSibling?.tagName.toLowerCase() === this.host.tagName.toLowerCase();
  }

  private isInsideWrongContainer(): boolean {
    if (typeof this.host?.closest !== 'function') {
      return false;
    }

    return !!this.host.closest('.container:not(.responsivegrid)');
  }

  private updateItems() {
    const items = Array.from(
      this.host.querySelectorAll('gcds-ext-mws-most-requested-item'),
    )
      .map((item) => this.getItem(item as HTMLElement))
      .filter((item): item is MostRequestedItem => !!item);

    this.items = items;
    this.itemCount = items.length;
    this.host.setAttribute('data-gcds-item-count', String(this.itemCount));
  }

  private getItem(item: HTMLElement): MostRequestedItem | undefined {
    const href = this.getItemValue(item, 'href');

    if (!href || !this.hasItemContent(item)) {
      return undefined;
    }

    const slotName = this.getItemSlotName(item);
    this.assignItemSlot(item, slotName);

    return { slotName };
  }

  private hasItemContent(item: HTMLElement): boolean {
    const hasSlottedContent = Array.from(item.childNodes).some((node) => this.isMeaningfulItemContent(node));
    const fallbackText = this.getItemValue(item, 'text');

    return hasSlottedContent || !!fallbackText;
  }

  private isMeaningfulItemContent(node: ChildNode): boolean {
    if (node.nodeType === 3 || node.nodeType === 4) {
      return !!node.nodeValue?.trim();
    }

    return node.nodeType === 1;
  }

  private getItemValue(item: HTMLElement, name: 'href' | 'text'): string | undefined {
    const value = (item as unknown as Record<string, unknown>)[name];

    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }

    const attributeValue = item.getAttribute(name)?.trim();

    return attributeValue || undefined;
  }

  private getItemSlotName(item: HTMLElement): string {
    const existingSlotName = this.itemSlotNames.get(item);

    if (existingSlotName) {
      return existingSlotName;
    }

    const slotName = `most-requested-item-${this.nextSlotId}`;
    this.nextSlotId += 1;
    this.itemSlotNames.set(item, slotName);

    return slotName;
  }

  private assignItemSlot(item: HTMLElement, slotName: string) {
    if (item.getAttribute('slot') !== slotName) {
      item.setAttribute('slot', slotName);
    }
  }

  private renderHeading() {
    const heading = <slot name="heading">{this.heading}</slot>;

    if (this.hideHeading === true) {
      return <gcds-sr-only tag="h2">{heading}</gcds-sr-only>;
    }

    return <h2>{heading}</h2>;
  }

  render() {
    const frameClass = `gcds-ext-mws-most-requested--${this.resolvedFrame}`;
    const listClasses = {
      'two-items': this.itemCount === 2,
    };

    return (
      <section class={`gcds-ext-mws-most-requested ${frameClass}`}>
        <div class="container">
          {this.renderHeading()}
          <ul class={listClasses}>
            {this.items.map((item) => (
              <li key={item.slotName}>
                <slot name={item.slotName}></slot>
              </li>
            ))}
          </ul>
        </div>
      </section>
    );
  }
}
