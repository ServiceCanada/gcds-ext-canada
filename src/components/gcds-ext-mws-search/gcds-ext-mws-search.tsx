import {
  Component,
  Host,
  Prop,
  Element,
  State,
  Event,
  EventEmitter,
  h,
  Watch,
  Listen,
} from '@stencil/core';
import { assignLanguage, observerConfig, emitEvent } from '../../utils/utils';
import i18n from './i18n/i18n';

type Completion = {
  highlighted: string;
  text: string;
};

/**
 * Search is a space for entering keywords to find relevant information.
 */
@Component({
  tag: 'gcds-ext-mws-search',
  styleUrl: 'gcds-ext-mws-search.css',
  shadow: true,
})
export class GcdsSearch {
  @Element() el: HTMLElement;

  /**
   * Set the placeholder and label for the search input. Becomes "Search [placeholder]"
   */
  @Prop() placeholder: string = 'Canada.ca';

  /**
   * Sets the action for the search form. Default will be canada.ca global search
   */
  @Prop() action: string = '/sr/srb.html';

  /**
   * Set the form method of the search form
   */
  @Prop() method: 'get' | 'post' = 'get';

  /**
   * Set the name of the search input
   */
  @Prop() name: string = 'q';

  /**
   * Set the id of the search input
   */
  @Prop() searchId: string = 'search';

  /**
   * Set the value of the search input
   */
  @Prop({ mutable: true }) value: string;

  /**
   * Base URL for the Canada.ca query suggestions API, without the /querySuggest path.
   */
  @Prop() suggestionsEndpoint: string = 'https://apps.canada.ca/search';

  /**
   * Organization ID used to access the suggestions API.
   */
  @Prop() suggestionsOrganizationId: string = '';

  /**
   * Bearer token used to access the suggestions API. Suggestions are disabled when omitted.
   */
  @Prop() suggestionsAccessToken: string = '';

  /**
   * Search hub sent with each suggestions request.
   */
  @Prop() suggestionsSearchHub: string = '';

  /**
   * Pipeline sent with each suggestions request.
   */
  @Prop() suggestionsPipeline: string = '';

  /**
   * Maximum number of suggestions requested from the API.
   */
  @Prop() suggestionsMaxItems: number = 5;

  /**
   * Minimum number of input characters before suggestions are requested.
   */
  @Prop() suggestionsMinCharacters: number = 3;

  /**
   * Events
   */

  /**
   * Emitted when the search element has received input.
   */
  @Event() gcdsInput!: EventEmitter<string>;

  /**
   * Emitted when the search input value has changed.
   */
  @Event() gcdsChange!: EventEmitter<string>;

  /**
   * Emitted when the search input has gained focus.
   */
  @Event() gcdsFocus!: EventEmitter<void>;

  /**
   * Emitted when the search input has lost focus.
   */
  @Event() gcdsBlur!: EventEmitter<void>;

  /**
   * Emitted when the search form has submitted.
   */
  @Event() gcdsSubmit!: EventEmitter<string>;

  /**
   * States
   */

  /**
   * Language of rendered component
   */
  @State() lang: string;

  /**
   * Suggestions returned by the query suggestions API.
   */
  @State() suggestions: Completion[] = [];

  /**
   * Indicates whether the suggestions list is open.
   */
  @State() isOpen: boolean = false;

  /**
   * Index of the active suggestion, or -1 when no suggestion is active.
   */
  @State() activeIndex: number = -1;

  private inputElement?: HTMLInputElement;
  private requestId: number = 0;
  private listId: string;

  @Watch('searchId')
  updateListId() {
    this.listId = `${this.searchId}-listbox`;
  }

  async componentWillLoad() {
    // Define lang attribute
    this.lang = assignLanguage(this.el);
    this.updateListId();

    // Observe lang attribute changes
    const observer = new MutationObserver(mutations => {
      if (mutations[0].oldValue !== this.el.lang) {
        this.lang = assignLanguage(this.el);
      }
    });
    observer.observe(this.el, observerConfig);
  }

  /**
   * Close the suggestions list when the user clicks outside this component.
   */
  @Listen('click', { target: 'document' })
  onDocumentClick(event: MouseEvent) {
    if (!event.composedPath().includes(this.el)) {
      this.closeList();
    }
  }

  /**
   * Remove HTML markup and query suggestion markers from a completion.
   */
  private cleanText(value: string) {
    const element = document.createElement('textarea');
    element.innerHTML = value.replace(/<[^>]*>/g, '').replace(/[\[\]{}()]/g, '');
    return element.value;
  }

  /**
   * Convert the query suggestion bracket markers to highlighted HTML.
   */
  private highlight(value: string) {
    const escaped = value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    return escaped
      .replace(/\[([^\]]*)\]/g, '<strong>$1</strong>')
      .replace(/[(){}]/g, '');
  }

  /**
   * Fetch suggestions when the search input changes.
   */
  private onInput = async (event: InputEvent) => {
    const input = event.target as HTMLInputElement;
    this.value = input.value;
    this.gcdsInput.emit(input.value);

    const query = input.value.trim();
    const requestId = ++this.requestId;
    this.activeIndex = -1;

    if (!this.suggestionsAccessToken || query.length < Number(this.suggestionsMinCharacters)) {
      this.suggestions = [];
      this.closeList();
      return;
    }

    const url = new URL(`${this.suggestionsEndpoint.replace(/\/$/, '')}/querySuggest`);

    if (this.suggestionsOrganizationId) {
      url.searchParams.set('organizationId', this.suggestionsOrganizationId);
    }

    const form = this.el.closest('form') as HTMLFormElement;
    const originLevel3 = form?.action || window.location.href;
    let relativeUrl = originLevel3;

    try {
      relativeUrl = new URL(originLevel3, window.location.href).pathname;
    } catch (_) {
      // Keep the supplied originLevel3 value if it is not a valid URL.
    }

    const body = {
      count: Number(this.suggestionsMaxItems),
      q: query,
      locale: this.lang,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      context: {
        searchPageUrl: originLevel3,
        searchPageRelativeUrl: relativeUrl,
      },
      searchHub: this.suggestionsSearchHub,
      pipeline: this.suggestionsPipeline,
    };

    try {
      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.suggestionsAccessToken}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      if (requestId !== this.requestId || input.value.trim() !== query) {
        return;
      }

      this.suggestions = (data.completions || [])
        .map((item: any) => ({
          highlighted: this.highlight(String(item.highlighted || '')),
          text: this.cleanText(String(item.highlighted || item.completion || '')),
        }))
        .filter((item: Completion) => item.text);
      this.isOpen = this.suggestions.length > 0;
    } catch (error) {
      if (requestId === this.requestId) {
        this.closeList();
      }
      console.error('gcds-ext-mws-search: Unable to load search suggestions.', error);
    }
  };

  /**
   * Handle keyboard navigation and selection in the suggestions list.
   */
  private onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!this.suggestions.length) {
        return;
      }

      this.isOpen = true;
      this.activeIndex =
        this.activeIndex < 0
          ? event.key === 'ArrowDown'
            ? 0
            : this.suggestions.length - 1
          : (this.activeIndex +
              (event.key === 'ArrowDown' ? 1 : this.suggestions.length - 1)) %
            this.suggestions.length;
      this.scrollActiveSuggestionIntoView();
    } else if (event.key === 'Enter' && this.isOpen && this.activeIndex >= 0) {
      event.preventDefault();
      this.selectSuggestion(this.suggestions[this.activeIndex]);
    } else if (event.key === 'Escape' && this.isOpen) {
      event.preventDefault();
      this.closeList();
    } else if (event.key === 'Tab') {
      this.closeList();
    }
  };

  /**
   * Keep the active suggestion visible while navigating the list with the keyboard.
   */
  private scrollActiveSuggestionIntoView() {
    requestAnimationFrame(() => {
      const activeOption = this.el.shadowRoot?.getElementById(
        `${this.listId}-option-${this.activeIndex}`,
      );
      activeOption?.scrollIntoView({ block: 'nearest' });
    });
  }

  /**
   * Select a suggestion and submit the search form.
   */
  private selectSuggestion(suggestion: Completion) {
    if (!this.inputElement) {
      return;
    }

    this.inputElement.value = suggestion.text;
    this.value = suggestion.text;
    this.closeList();

    const form = this.inputElement.form;
    if (form) {
      form.requestSubmit();
    }
  }

  /**
   * Close the suggestions list and clear the active suggestion.
   */
  private closeList() {
    this.isOpen = false;
    this.activeIndex = -1;
  }

  /**
   * Render one suggestion with its current active state.
   */
  private renderSuggestion(suggestion: Completion, index: number) {
    const id = `${this.listId}-option-${index}`;

    return (
      <li
        id={id}
        role="option"
        aria-selected={this.activeIndex === index ? 'true' : 'false'}
        aria-setsize={this.suggestions.length}
        aria-posinset={index + 1}
        class={{
          'gcds-ext-mws-search__option': true,
          active: this.activeIndex === index,
        }}
        onMouseDown={event => event.preventDefault()}
        onMouseEnter={() => (this.activeIndex = index)}
        onClick={() => this.selectSuggestion(suggestion)}
      >
        <gcds-icon name="search" margin-right="100"></gcds-icon>
        <span innerHTML={suggestion.highlighted}></span>
      </li>
    );
  }

  render() {
    const {
      placeholder,
      action,
      method,
      name,
      value,
      lang,
      searchId,
      isOpen,
      activeIndex,
      listId,
    } = this;

    const labelText = i18n[lang].searchLabel.replace('{$}', placeholder);
    const formAction =
      action === '/sr/srb.html'
        ? `https://www.canada.ca/${lang}/sr/srb.html`
        : action;
    const activeDescendant = activeIndex >= 0 ? `${listId}-option-${activeIndex}` : undefined;
    const hasSuggestions = Boolean(this.suggestionsAccessToken);
    const suggestionAttributes = hasSuggestions
      ? {
          role: 'combobox',
          'aria-expanded': isOpen ? 'true' : 'false',
          'aria-autocomplete': 'list',
          'aria-haspopup': 'listbox',
          'aria-controls': listId,
          'aria-activedescendant': activeDescendant,
          autoComplete: 'off',
        }
      : {};

    return (
      <Host>
        <section class="gcds-ext-mws-search">
          <gcds-sr-only tag="h2">{i18n[lang].search}</gcds-sr-only>
          <form
            action={formAction}
            method={method}
            role="search"
            onSubmit={event => emitEvent(event, this.gcdsSubmit, value)}
            class="gcds-ext-mws-search__form"
          >
            <gcds-label
              label={labelText}
              label-for={searchId}
              hide-label
            ></gcds-label>
            <div class="gcds-ext-mws-search__wrapper">
              <input
                ref={element => (this.inputElement = element)}
                type="search"
                id={searchId}
                {...suggestionAttributes}
                size={35}
                maxLength={170}
                name={name}
                placeholder={labelText}
                class="gcds-ext-mws-search__input"
                value={value}
                onInput={this.onInput}
                onChange={event =>
                  this.gcdsChange.emit((event.target as HTMLInputElement).value)
                }
                onKeyDown={hasSuggestions ? this.onKeyDown : undefined}
                onFocus={() => this.gcdsFocus.emit()}
                onBlur={() => this.gcdsBlur.emit()}
              ></input>
              {hasSuggestions && (
                <ul
                  id={listId}
                  role="listbox"
                  hidden={!isOpen}
                  class="gcds-ext-mws-search__list"
                >
                  {this.suggestions.map((suggestion, index) =>
                    this.renderSuggestion(suggestion, index),
                  )}
                </ul>
              )}
            </div>
            <gcds-button
              type="submit"
              class="gcds-ext-mws-search__button"
              exportparts="button"
            >
              <gcds-icon
                name="search"
                label={i18n[lang].search}
              ></gcds-icon>
            </gcds-button>
          </form>
        </section>
      </Host>
    );
  }
}
