import { Component, State, Event, EventEmitter, h, Element, Host, Fragment, Prop } from '@stencil/core';
import { assignLanguage, observerConfig, emitEvent, logError, piiPatterns } from '../../utils/utils';
import i18n from './i18n/i18n';

interface GcdsTextareaElement extends HTMLElement {
  value?: string;
  errorMessage?: string;
}

/**
 * @slot - The main content of the container.
 */
@Component({
  tag: 'gcds-ext-mws-feedback',
  styleUrl: 'gcds-ext-mws-feedback.css',
  shadow: true,
})
export class GcdsExtMwsFeedback {
  @Element() el: HTMLElement;

  /**
   * Props
   */

  /**
   * Defines the theme of your page (sent as data via the form submission)
   */
  @Prop() theme?: string = '';

  /**
   * Defines the section where your page resides (sent as data via the form submission)
   */
  @Prop() section?: string = '';

  /**
   * Defines the URL where the feedback should be submitted
   */
  @Prop() action?: string = 'https://feedback-retroaction.canada.ca/api/QueueProblemForm';

  /**
   * States
   */

  /**
   * Language of rendered component
   */
  @State() lang: string = 'en';

  /**
   * Specifies if the feedback details are open
   */
  @State() isOpen: boolean = false;

  /**
   * Specifies the status of the feedback submission
   */
  @State() submitStatus: 'idle' | 'success' | 'error' = 'idle';

  /**
   * Specifies if the is currently submitting data
   */
  @State() isSubmitting: boolean = false;

  /**
   * Events
   */

  /**
   * Triggered when the user select "No"
   */
  @Event() feedbackNo!: EventEmitter<void>;

  /**
   * Triggered when the user select "Yes" or submits a comment
   */
  @Event() feedbackSubmit!: EventEmitter<void>;

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

  async componentWillLoad() {
    // Define lang attribute
    this.lang = assignLanguage(this.el);

    this.updateLang();
  }

  /**
   * Look for personal information in the comment field
   */
  private findPII(value: string): string | null {
    for (const [name, pattern] of Object.entries(piiPatterns)) {
      pattern.lastIndex = 0; // Reset lastIndex since these are global regexes reused across calls
      if (pattern.test(value)) {
        return name;
      }
    }
    return null;
  }

  private async handleSubmit(event: Event) {
    event.preventDefault();
    if (this.isSubmitting) return;

    const textarea = this.el.shadowRoot?.querySelector('gcds-textarea') as GcdsTextareaElement;
    const details = textarea?.value ?? '';

    // Guard: Prevent submission if PII is detected or textarea has an existing error
    if (this.findPII(details)) {
      if (textarea) textarea.errorMessage = i18n[this.lang].errorMessage;
      return;
    }

    if (textarea?.errorMessage) {
      return;
    }

    const form = event.currentTarget as HTMLFormElement;
    const data = new URLSearchParams();
    const header = document.querySelector('gcds-header');
    const creator = document.querySelector('meta[name="dcterms.creator"]') as HTMLMetaElement;

    // Set data for successful feedback submission response
    data.set('pageTitle', document.title);
    data.set('language', document.documentElement.lang);
    data.set('submissionPage', window.location.href);
    data.set('oppositelang', header?.getAttribute('lang-href') ?? '');
    data.set('themeopt', this.theme || '');
    data.set('sectionopt', this.section || '');
    data.set('institutionopt', creator?.content ?? '');
    data.set('helpful', this.isOpen ? 'No-Non' : 'Yes-Oui');
    data.set('details', details);

    try {
      this.isSubmitting = true;
      this.submitStatus = 'idle';

      const response = await fetch(form.action, {
        method: form.method || 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: data.toString(),
      });

      if (response.ok) {
        this.submitStatus = 'success';
        emitEvent(event, this.feedbackSubmit, data);
      } else {
        logError('gcds-ext-mws-feedback', [`Feedback submission failed: ${response.status}`]);
        this.submitStatus = 'error';
      }
    } catch (error) {
      logError('gcds-ext-mws-feedback', [`Feedback submission failed: ${error}`]);
      this.submitStatus = 'error';
    } finally {
      this.isSubmitting = false;
    }
  }

  render() {
    return (
      <Host>
        <section class="gcds-ext-mws-feedback" aria-label={i18n[this.lang].giveFeedback}>
          {this.submitStatus !== 'idle' ? (
            <Fragment>
              {this.submitStatus === 'success' && (
                <gcds-text role="alert" class="success-message" margin-bottom="0">
                  <gcds-icon name="checkmark-circle" size="h4" margin-right="100"></gcds-icon>{i18n[this.lang].successMessage}
                </gcds-text>
              )}
              {this.submitStatus === 'error' && (
                <gcds-text role="alert" class="error-message" margin-bottom="0">
                  <gcds-icon name="exclamation-circle" size="h4" margin-right="100"></gcds-icon>{i18n[this.lang].errorMessage}
                </gcds-text>
              )}
            </Fragment>
          ) : (
            <form action={this.action} method="POST" onSubmit={e => this.handleSubmit(e)}>
              {this.isOpen ? (
                <Fragment>
                  <gcds-textarea
                    prop:label={i18n[this.lang].moreDetails}
                    hint={i18n[this.lang].hint}
                    prop:name="details"
                    prop:textareaId="details"
                    maxlength={300}
                    lang={this.lang}
                    autofocus
                    validate-on="other"
                    onGcdsInput={(e: CustomEvent<string>) => {
                      const textarea = e.target as GcdsTextareaElement;
                      if (this.findPII(e.detail)) {
                        textarea.errorMessage = i18n[this.lang].piiErrorMessage;
                      } else {
                        textarea.errorMessage = '';
                      }
                    }}
                  ></gcds-textarea>
                  <gcds-button type="submit" size="small" disabled={this.isSubmitting}>{i18n[this.lang].submit}</gcds-button>
                </Fragment>
              ) : (
                <fieldset>
                  <legend>{i18n[this.lang].didYouFind}</legend>
                  <gcds-button name="helpful" value="Yes-Oui" button-role="primary" type="submit" size="small" disabled={this.isSubmitting}>{i18n[this.lang].yes}</gcds-button>
                  <gcds-button 
                    button-role="primary" 
                    type="button" 
                    size="small"
                    onClick={e => {
                      const event = emitEvent(e, this.feedbackNo);
                      if (event) {
                        this.isOpen = true;
                      }
                    }}
                  >{i18n[this.lang].no}</gcds-button>
                </fieldset>
              )}
            </form>
          )}
        </section>
      </Host>
    );
  }
}
