import { Component, Prop, State, Event, EventEmitter, h, Host } from '@stencil/core';

export type AppAlertType = 'info' | 'success' | 'warning' | 'danger';

/**
 * @slot - The main message content of the alert.
 * @part container - The outer container of the alert.
 * @part heading - The optional heading element.
 * @part dismiss-button - The dismiss button, when `dismissible` is true.
 */
@Component({
  tag: 'app-alert',
  styleUrl: 'app-alert.css',
  shadow: true,
})
export class AppAlert {
  /** Controls the colour and icon used for the alert. */
  @Prop() alertType: AppAlertType = 'info';

  /** Optional heading shown above the slotted message. */
  @Prop() heading?: string;

  /** When true, renders a button that lets the user dismiss the alert. */
  @Prop() dismissible = false;

  /** Internal: whether the alert has been dismissed by the user. */
  @State() private dismissed = false;

  /** Emitted after the user dismisses the alert. */
  @Event() appDismiss!: EventEmitter<void>;

  private handleDismiss = () => {
    this.dismissed = true;
    this.appDismiss.emit();
  };

  render() {
    if (this.dismissed) {
      return null;
    }

    return (
      <Host role="alert" class={{ [`alert-${this.alertType}`]: true }}>
        <div class="alert-container" part="container">
          <div class="alert-icon" aria-hidden="true"></div>
          <div class="alert-content">
            {this.heading && (
              <h2 class="alert-heading" part="heading">
                {this.heading}
              </h2>
            )}
            <div class="alert-body">
              <slot></slot>
            </div>
          </div>
          {this.dismissible && (
            <button
              type="button"
              class="alert-dismiss"
              part="dismiss-button"
              aria-label="Dismiss this alert"
              onClick={this.handleDismiss}
            >
              <span aria-hidden="true">&times;</span>
            </button>
          )}
        </div>
      </Host>
    );
  }
}
