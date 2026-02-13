import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

export class ArcStat extends LitElement {
  static properties = {
    value: { type: String },
    label: { type: String },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: block; }

      .stat {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--space-sm);
        text-align: center;
        padding: var(--space-lg) var(--space-md);
      }

      .stat__value {
        font-size: clamp(32px, 4.5vw, 48px);
        font-weight: 200;
        letter-spacing: -1px;
        line-height: 1;
        background: var(--gradient-accent-text);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        filter: drop-shadow(0 0 16px rgba(var(--accent-primary-rgb),0.3))
                drop-shadow(0 0 40px rgba(var(--accent-secondary-rgb),0.12));
      }

      .stat__rule {
        width: 24px;
        height: 1px;
        background: linear-gradient(90deg, transparent, var(--accent-primary), transparent);
        opacity: 0.4;
      }

      .stat__label {
        font-family: var(--font-accent);
        font-weight: 600;
        font-size: var(--label-inline-size);
        letter-spacing: var(--label-inline-spacing);
        text-transform: uppercase;
        color: var(--text-muted);
      }
    `,
  ];

  constructor() {
    super();
    this.value = '';
    this.label = '';
  }

  render() {
    return html`
      <div class="stat" part="stat">
        <span class="stat__value" part="value">${this.value}</span>
        <span class="stat__rule"></span>
        <span class="stat__label" part="label">${this.label}</span>
      </div>
    `;
  }
}

customElements.define('arc-stat', ArcStat);
