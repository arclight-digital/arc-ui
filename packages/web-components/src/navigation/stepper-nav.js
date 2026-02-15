import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * @tag arc-stepper-nav
 */
export class ArcStepperNav extends LitElement {
  static properties = {
    steps: {
      converter: {
        fromAttribute: (v) => { try { return JSON.parse(v); } catch { return []; } },
      },
    },
    active: { type: Number, reflect: true },
    linear: { type: Boolean, reflect: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: block;
      }

      .stepper-nav {
        display: flex;
        flex-direction: column;
        gap: var(--space-lg);
      }

      .stepper-nav__steps {
        display: flex;
        align-items: center;
        gap: var(--space-xs);
      }

      .stepper-nav__step {
        display: flex;
        align-items: center;
        gap: var(--space-xs);
      }

      .stepper-nav__indicator {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--text-sm);
        font-weight: 600;
        border: 2px solid var(--border-default);
        color: var(--text-muted);
        transition: all var(--transition-base);
        background: none;
        cursor: default;
        font-family: inherit;
        padding: 0;
      }

      .stepper-nav__indicator.is-active {
        background: var(--accent-primary);
        color: white;
        border-color: var(--accent-primary);
        box-shadow: 0 0 12px rgba(var(--accent-primary-rgb), 0.3);
      }

      .stepper-nav__indicator.is-complete {
        background: var(--color-success);
        border-color: var(--color-success);
        color: white;
      }

      .stepper-nav__indicator.is-clickable {
        cursor: pointer;
      }

      .stepper-nav__connector {
        flex: 1;
        height: 2px;
        background: var(--border-default);
        transition: background var(--transition-base);
      }

      .stepper-nav__connector.is-complete {
        background: var(--gradient-accent-text);
      }

      .stepper-nav__panel {
        min-height: 0;
      }

      .stepper-nav__controls {
        display: flex;
        gap: var(--space-sm);
        justify-content: flex-end;
      }

      .stepper-nav__check {
        width: 14px;
        height: 14px;
      }
    `,
  ];

  constructor() {
    super();
    this.steps = [];
    this.active = 0;
    this.linear = false;
  }

  _goTo(index) {
    if (this.linear && index > this.active) return;
    this.active = index;
    this.dispatchEvent(new CustomEvent('arc-change', {
      detail: { step: this.active },
      bubbles: true,
      composed: true,
    }));
  }

  _back() {
    if (this.active > 0) this._goTo(this.active - 1);
  }

  _next() {
    if (this.active < this.steps.length - 1) {
      this._goTo(this.active + 1);
    } else {
      this.dispatchEvent(new CustomEvent('arc-complete', {
        bubbles: true,
        composed: true,
      }));
    }
  }

  _skip() {
    if (!this.linear && this.active < this.steps.length - 1) {
      this._goTo(this.active + 1);
    }
  }

  render() {
    return html`
      <div class="stepper-nav" part="base">
        <div class="stepper-nav__steps" part="steps">
          ${this.steps.map((step, i) => html`
            ${i > 0 ? html`<div class="stepper-nav__connector ${i <= this.active ? 'is-complete' : ''}" part="connector"></div>` : ''}
            <div class="stepper-nav__step">
              <button
                class="stepper-nav__indicator ${i === this.active ? 'is-active' : ''} ${i < this.active ? 'is-complete' : ''} ${!this.linear || i <= this.active ? 'is-clickable' : ''}"
                part="indicator"
                @click=${() => this._goTo(i)}
                ?disabled=${this.linear && i > this.active}
                aria-current=${i === this.active ? 'step' : 'false'}
              >
                ${i < this.active
                  ? html`<svg class="stepper-nav__check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`
                  : i + 1}
              </button>
            </div>
          `)}
        </div>
        <div class="stepper-nav__panel" part="panel">
          <slot></slot>
        </div>
        <div class="stepper-nav__controls" part="controls">
          <arc-button variant="ghost" size="sm" ?disabled=${this.active === 0} @click=${this._back}>Back</arc-button>
          ${!this.linear && this.active < this.steps.length - 1
            ? html`<arc-button variant="ghost" size="sm" @click=${this._skip}>Skip</arc-button>`
            : ''}
          <arc-button variant="primary" size="sm" @click=${this._next}>
            ${this.active === this.steps.length - 1 ? 'Complete' : 'Next'}
          </arc-button>
        </div>
      </div>
    `;
  }
}
