import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import './step.js';

export class ArcStepper extends LitElement {
  static properties = {
    active: { type: Number, reflect: true },
    _steps: { state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: block; }

      .stepper {
        display: flex;
        align-items: flex-start;
        gap: var(--space-xs);
      }

      .step {
        display: flex;
        flex-direction: column;
        align-items: center;
        flex: 1;
        position: relative;
        padding: 0 var(--space-sm);
      }

      .step__header {
        display: flex;
        align-items: center;
        width: 100%;
        position: relative;
      }

      .step__circle {
        width: 36px;
        height: 36px;
        border-radius: var(--radius-full);
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: var(--font-accent);
        font-size: var(--text-sm);
        font-weight: 700;
        letter-spacing: 1px;
        flex-shrink: 0;
        position: relative;
        z-index: 1;
        transition: background var(--transition-base),
                    color var(--transition-base),
                    border-color var(--transition-base),
                    box-shadow var(--transition-base);
        margin: 0 auto;
        box-sizing: border-box;
      }

      /* Upcoming (default) */
      .step__circle {
        background: var(--bg-elevated);
        color: var(--text-ghost);
        border: 1px solid var(--border-default);
      }

      /* Active */
      .step--active .step__circle {
        background: transparent;
        color: var(--accent-primary);
        border: 2px solid var(--accent-primary);
        box-shadow: 0 0 12px rgba(var(--accent-primary-rgb), 0.25);
      }

      /* Completed */
      .step--completed .step__circle {
        background: var(--accent-primary);
        color: var(--text-primary);
        border: 2px solid var(--accent-primary);
      }

      .step__line {
        position: absolute;
        top: 50%;
        height: 1px;
        background: var(--border-default);
        transform: translateY(-50%);
      }

      .step__line--left {
        left: calc(-1 * var(--space-xs) - var(--space-sm));
        right: calc(50% + 20px);
      }

      .step__line--right {
        left: calc(50% + 20px);
        right: calc(-1 * var(--space-xs) - var(--space-sm));
      }

      .step--completed .step__line--left,
      .step--active .step__line--left {
        background: var(--accent-primary);
      }

      .step--completed .step__line--right {
        background: var(--accent-primary);
      }

      .step__label {
        margin-top: var(--space-md);
        font-family: var(--font-accent);
        font-size: var(--text-xs);
        font-weight: 600;
        letter-spacing: 2px;
        text-transform: uppercase;
        color: var(--text-muted);
        text-align: center;
        transition: color var(--transition-base);
      }

      .step--active .step__label {
        color: var(--text-primary);
      }

      .step--completed .step__label {
        color: var(--text-secondary);
      }

      .step__check {
        font-size: var(--text-sm);
        line-height: 1;
      }

      .stepper__slot-host { display: none; }

      @media (prefers-reduced-motion: reduce) {
        :host *,
        :host *::before,
        :host *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      }
    `,
  ];

  constructor() {
    super();
    this.active = 0;
    this._steps = [];
  }

  _onSlotChange(e) {
    this._steps = e.target.assignedElements({ flatten: true })
      .filter(el => el.tagName === 'ARC-STEP');
  }

  _getStepState(index) {
    if (index < this.active) return 'completed';
    if (index === this.active) return 'active';
    return 'upcoming';
  }

  render() {
    return html`
      <div class="stepper__slot-host">
        <slot @slotchange=${this._onSlotChange}></slot>
      </div>
      <div class="stepper" part="stepper" role="list" aria-label="Progress">
        ${this._steps.map((step, i) => {
          const state = this._getStepState(i);
          const label = step.label || '';
          const isFirst = i === 0;
          const isLast = i === this._steps.length - 1;

          return html`
            <div
              class="step step--${state}"
              part="step"
              role="listitem"
              aria-current=${state === 'active' ? 'step' : 'false'}
            >
              <div class="step__header">
                ${!isFirst ? html`<span class="step__line step__line--left" part="line"></span>` : ''}
                <span class="step__circle" part="circle">
                  ${state === 'completed'
                    ? html`<span class="step__check" aria-hidden="true">&#10003;</span>`
                    : i + 1}
                </span>
                ${!isLast ? html`<span class="step__line step__line--right" part="line"></span>` : ''}
              </div>
              <span class="step__label" part="label">${label}</span>
            </div>
          `;
        })}
      </div>
    `;
  }
}

customElements.define('arc-stepper', ArcStepper);
