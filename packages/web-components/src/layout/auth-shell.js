import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * @tag arc-auth-shell
 */
export class ArcAuthShell extends LitElement {
  static properties = {
    variant: { type: String, reflect: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: block;
        box-sizing: border-box;
      }

      /* Centered variant */
      .auth-shell--centered {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        background: var(--surface-primary);
        padding: var(--space-xl) var(--space-lg);
        box-sizing: border-box;
      }

      .auth-shell--centered .logo {
        margin-bottom: var(--space-xl);
        text-align: center;
      }

      .auth-shell--centered .card {
        background: var(--surface-raised);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-lg);
        padding: var(--space-xl);
        width: 100%;
        max-width: 420px;
        box-sizing: border-box;
      }

      .auth-shell--centered .footer {
        margin-top: var(--space-lg);
        color: var(--text-muted);
        font-size: var(--text-sm);
        text-align: center;
      }

      /* Split variant */
      .auth-shell--split {
        display: grid;
        grid-template-columns: 1fr 1fr;
        min-height: 100vh;
        box-sizing: border-box;
      }

      .auth-shell--split .form-side {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: var(--surface-primary);
        padding: var(--space-xl) var(--space-lg);
      }

      .auth-shell--split .logo {
        margin-bottom: var(--space-xl);
        text-align: center;
      }

      .auth-shell--split .card {
        background: var(--surface-raised);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-lg);
        padding: var(--space-xl);
        width: 100%;
        max-width: 420px;
        box-sizing: border-box;
      }

      .auth-shell--split .footer {
        margin-top: var(--space-lg);
        color: var(--text-muted);
        font-size: var(--text-sm);
        text-align: center;
      }

      .auth-shell--split .aside-side {
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--surface-base);
        padding: var(--space-xl);
      }

      @media (max-width: 768px) { /* --breakpoint-md */
        .auth-shell--split {
          grid-template-columns: 1fr;
        }

        .auth-shell--split .aside-side {
          display: none;
        }
      }
    `,
  ];

  constructor() {
    super();
    this.variant = 'centered';
  }

  render() {
    if (this.variant === 'split') {
      return html`
        <div class="auth-shell--split" part="shell">
          <div class="form-side" part="form-side">
            <div class="logo" part="logo">
              <slot name="logo"></slot>
            </div>
            <div class="card" part="card">
              <slot></slot>
            </div>
            <div class="footer" part="footer">
              <slot name="footer"></slot>
            </div>
          </div>
          <div class="aside-side" part="aside">
            <slot name="aside"></slot>
          </div>
        </div>
      `;
    }

    return html`
      <div class="auth-shell--centered" part="shell">
        <div class="logo" part="logo">
          <slot name="logo"></slot>
        </div>
        <div class="card" part="card">
          <slot></slot>
        </div>
        <div class="footer" part="footer">
          <slot name="footer"></slot>
        </div>
      </div>
    `;
  }
}
