import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * @tag arc-stat
 */
export class ArcStat extends LitElement {
  static properties = {
    value:  { type: String },
    label:  { type: String },
    trend:  { type: String, reflect: true },
    change: { type: String },
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
        padding: var(--space-lg);
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

      .stat__trend {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-family: var(--font-mono);
        font-size: var(--text-sm);
        font-weight: 500;
        margin-top: var(--space-xs);
      }

      :host([trend="up"]) .stat__trend { color: var(--color-success); }
      :host([trend="down"]) .stat__trend { color: var(--color-error); }
      :host([trend="neutral"]) .stat__trend { color: var(--text-muted); }

      .stat__trend-arrow {
        width: 12px;
        height: 12px;
      }
    `,
  ];

  constructor() {
    super();
    this.value = '';
    this.label = '';
    this.trend = '';
    this.change = '';
  }

  render() {
    const arrowUp = html`<svg class="stat__trend-arrow" viewBox="0 0 16 16" fill="currentColor"><path d="M8 3.5l4.5 5H3.5z"/></svg>`;
    const arrowDown = html`<svg class="stat__trend-arrow" viewBox="0 0 16 16" fill="currentColor"><path d="M8 12.5l4.5-5H3.5z"/></svg>`;
    const dash = html`<svg class="stat__trend-arrow" viewBox="0 0 16 16" fill="currentColor"><rect x="3" y="7" width="10" height="2" rx="1"/></svg>`;

    return html`
      <div class="stat" part="stat">
        <span class="stat__value" part="value">${this.value}</span>
        <span class="stat__rule"></span>
        <span class="stat__label" part="label">${this.label}</span>
        ${this.trend ? html`
          <span class="stat__trend" part="trend">
            ${this.trend === 'up' ? arrowUp : this.trend === 'down' ? arrowDown : dash}
            ${this.change || ''}
          </span>
        ` : ''}
      </div>
    `;
  }
}
