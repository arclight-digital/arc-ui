import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

export class ArcProgress extends LitElement {
  static properties = {
    value:         { type: Number },
    variant:       { type: String, reflect: true },
    size:          { type: String, reflect: true },
    indeterminate: { type: Boolean, reflect: true },
    showValue:     { type: Boolean, attribute: 'show-value', reflect: true },
    label:         { type: String },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: block; }

      .progress__label {
        font-family: var(--font-accent);
        font-weight: 600;
        font-size: var(--label-inline-size);
        letter-spacing: var(--label-inline-spacing);
        text-transform: uppercase;
        color: var(--text-muted);
        margin-bottom: var(--space-xs);
        display: block;
      }

      /* Bar */
      .progress__track {
        width: 100%;
        border-radius: var(--radius-full);
        background: var(--border-subtle);
        overflow: hidden;
      }

      :host([size="sm"]) .progress__track { height: 4px; }
      :host(:not([size])) .progress__track,
      :host([size="md"]) .progress__track { height: 8px; }
      :host([size="lg"]) .progress__track { height: 12px; }

      .progress__fill {
        height: 100%;
        border-radius: var(--radius-full);
        background: var(--gradient-accent-text);
        transition: width var(--transition-base);
        box-shadow: 0 0 8px rgba(var(--accent-primary-rgb), 0.3);
      }

      :host([indeterminate]) .progress__fill {
        width: 30% !important;
        animation: progress-indeterminate 1.5s ease-in-out infinite;
      }

      /* Spinner */
      .progress__spinner {
        display: inline-block;
      }

      :host([size="sm"]) .progress__spinner { width: 20px; height: 20px; }
      :host(:not([size])) .progress__spinner,
      :host([size="md"]) .progress__spinner { width: 32px; height: 32px; }
      :host([size="lg"]) .progress__spinner { width: 48px; height: 48px; }

      .progress__spinner svg {
        width: 100%;
        height: 100%;
        animation: spinner-rotate 1.4s linear infinite;
      }

      .progress__spinner-track {
        fill: none;
        stroke: var(--border-subtle);
        stroke-width: 3;
      }

      .progress__spinner-fill {
        fill: none;
        stroke: var(--accent-primary);
        stroke-width: 3;
        stroke-linecap: round;
        stroke-dasharray: 80, 200;
        stroke-dashoffset: 0;
        animation: spinner-dash 1.4s ease-in-out infinite;
      }

      .progress__header {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        margin-bottom: var(--space-xs);
      }

      .progress__value {
        font-family: var(--font-mono);
        font-size: var(--text-xs);
        color: var(--text-muted);
      }

      @keyframes progress-indeterminate {
        0%   { transform: translateX(-100%); }
        100% { transform: translateX(400%); }
      }

      @keyframes spinner-rotate {
        100% { transform: rotate(360deg); }
      }

      @keyframes spinner-dash {
        0%   { stroke-dasharray: 1, 200; stroke-dashoffset: 0; }
        50%  { stroke-dasharray: 80, 200; stroke-dashoffset: -35; }
        100% { stroke-dasharray: 80, 200; stroke-dashoffset: -125; }
      }

      @media (prefers-reduced-motion: reduce) {
        .progress__fill,
        .progress__spinner svg,
        .progress__spinner-fill {
          animation: none;
        }
      }
    `,
  ];

  constructor() {
    super();
    this.value = 0;
    this.variant = 'bar';
    this.size = 'md';
    this.indeterminate = false;
    this.showValue = false;
    this.label = '';
  }

  render() {
    const clampedValue = Math.max(0, Math.min(100, this.value));

    if (this.variant === 'spinner') {
      return html`
        <div part="progress">
          ${this.label ? html`<span class="progress__label" part="label">${this.label}</span>` : ''}
          <div
            class="progress__spinner"
            role="progressbar"
            aria-valuenow=${this.indeterminate ? undefined : clampedValue}
            aria-valuemin="0"
            aria-valuemax="100"
            aria-label=${this.label || 'Loading'}
            part="spinner"
          >
            <svg viewBox="0 0 44 44">
              <circle class="progress__spinner-track" cx="22" cy="22" r="20"></circle>
              <circle class="progress__spinner-fill" cx="22" cy="22" r="20"></circle>
            </svg>
          </div>
        </div>
      `;
    }

    const hasHeader = this.label || (this.showValue && !this.indeterminate);

    return html`
      <div part="progress">
        ${hasHeader ? html`
          <div class="progress__header">
            ${this.label ? html`<span class="progress__label" style="margin-bottom:0" part="label">${this.label}</span>` : html`<span></span>`}
            ${this.showValue && !this.indeterminate ? html`<span class="progress__value" part="value">${clampedValue}%</span>` : ''}
          </div>
        ` : ''}
        <div
          class="progress__track"
          role="progressbar"
          aria-valuenow=${this.indeterminate ? undefined : clampedValue}
          aria-valuemin="0"
          aria-valuemax="100"
          aria-label=${this.label || 'Progress'}
          part="track"
        >
          <div
            class="progress__fill"
            style="width: ${this.indeterminate ? '30' : clampedValue}%"
            part="fill"
          ></div>
        </div>
      </div>
    `;
  }
}

customElements.define('arc-progress', ArcProgress);
