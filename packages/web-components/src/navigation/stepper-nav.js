import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { DeclaredPropsMixin, flag, int, list } from '../shared/props.js';

/**
 * Wizard navigation with back/next/skip controls and step validation gates. Steps connected by
 * gradient lines with interactive routing.
 *
 * @tag arc-stepper-nav
 * @requires arc-button
 * @prop {Array<string>} steps - Array of step labels displayed along the progress track.
 * @prop {number} active - Zero-based index of the currently active step. Clamped to the steps that exist, so it can never name a step the wizard does not have.
 * @prop {boolean} linear - When true, prevents jumping to future steps — the user must complete each step sequentially.
 * @fires {CustomEvent<{ step: number }>} arc-change - Fired when the active step changes with detail: { step }.
 * @fires {CustomEvent<void>} arc-complete - Fired when the user confirms the final step.
 * @slot - Default content.
 * @csspart base
 * @csspart steps
 * @csspart connector
 * @csspart indicator
 * @csspart panel
 * @csspart controls
 */
export class ArcStepperNav extends DeclaredPropsMixin(LitElement) {
  static properties = {
    steps: list(),
    /**
     * Bounded by the step list rather than by nothing (finding #78). The sharp
     * form of the unbounded version was two conditions on the same value
     * disagreeing: the button's label asked `active === steps.length - 1`
     * (99 === 4, false) and read "Next", while `_next()` asked
     * `active < steps.length - 1` (99 < 4, false) and took the *completion*
     * branch — the user was told there was another step, clicked Next, and the
     * wizard submitted. Neither guard changed; the value can no longer reach a
     * state where they differ.
     */
    active: int({ default: 0, min: 0, max: '_lastStep', clamp: 'toRange', reflect: true }),
    linear: flag(false),
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
        border-radius: var(--radius-full);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--_text-sm);
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
        background: var(--interactive);
        color: white;
        border-color: var(--interactive);
        box-shadow: 0 0 12px rgba(var(--interactive-rgb), 0.3);
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
    // `active` is seeded from its declaration — see DeclaredPropsMixin.
  }

  /** Upper bound for `active`: the last real step, or 0 when there are none. */
  get _lastStep() {
    return Array.isArray(this.steps) ? Math.max(this.steps.length - 1, 0) : 0;
  }

  _goTo(index) {
    if (this.linear && index > this.active) return;
    this.active = index;
    this.dispatchEvent(
      new CustomEvent('arc-change', {
        detail: { value: this.active, step: this.active },
        bubbles: true,
        composed: true,
      }),
    );
  }

  _back() {
    if (this.active > 0) this._goTo(this.active - 1);
  }

  _next() {
    if (this.active < this.steps.length - 1) {
      this._goTo(this.active + 1);
    } else {
      this.dispatchEvent(
        new CustomEvent('arc-complete', {
          bubbles: true,
          composed: true,
        }),
      );
    }
  }

  _skip() {
    if (!this.linear && this.active < this.steps.length - 1) {
      this._goTo(this.active + 1);
    }
  }

  _stepLabel(step, i) {
    const label = typeof step === 'string' ? step : (step?.label ?? '');
    const name = `Step ${i + 1}${label ? `: ${label}` : ''}`;
    return i < this.active ? `${name} (completed)` : name;
  }

  render() {
    return html`
      <div class="stepper-nav" part="base">
        <div class="stepper-nav__steps" part="steps">
          ${this.steps.map(
            (step, i) => html`
            ${i > 0 ? html`<div class="stepper-nav__connector ${i <= this.active ? 'is-complete' : ''}" part="connector"></div>` : ''}
            <div class="stepper-nav__step">
              <button
                class="stepper-nav__indicator ${i === this.active ? 'is-active' : ''} ${i < this.active ? 'is-complete' : ''} ${!this.linear || i <= this.active ? 'is-clickable' : ''}"
                part="indicator"
                @click=${() => this._goTo(i)}
                ?disabled=${this.linear && i > this.active}
                aria-current=${i === this.active ? 'step' : 'false'}
                aria-label=${this._stepLabel(step, i)}
              >
                ${
                  i < this.active
                    ? html`<svg class="stepper-nav__check" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`
                    : i + 1
                }
              </button>
            </div>
          `,
          )}
        </div>
        <div class="stepper-nav__panel" part="panel">
          <slot></slot>
        </div>
        <div class="stepper-nav__controls" part="controls">
          <arc-button variant="ghost" size="sm" ?disabled=${this.active === 0} @click=${this._back}>Back</arc-button>
          ${
            !this.linear && this.active < this.steps.length - 1
              ? html`<arc-button variant="ghost" size="sm" @click=${this._skip}>Skip</arc-button>`
              : ''
          }
          <arc-button variant="primary" size="sm" @click=${this._next}>
            ${this.active === this.steps.length - 1 ? 'Complete' : 'Next'}
          </arc-button>
        </div>
      </div>
    `;
  }
}
