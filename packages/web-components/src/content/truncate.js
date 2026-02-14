import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * @tag arc-truncate
 */
export class ArcTruncate extends LitElement {
  static properties = {
    lines:    { type: Number, reflect: true },
    expanded: { type: Boolean, reflect: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: block; }

      .truncate__content {
        color: var(--text-secondary);
        font-family: var(--font-body);
        font-size: var(--body-size);
        line-height: var(--body-lh);
      }

      .truncate__content--clamped {
        display: -webkit-box;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .truncate__toggle {
        display: inline-block;
        margin-top: var(--space-xs);
        background: none;
        border: none;
        padding: 0;
        cursor: pointer;
        font-family: var(--font-accent);
        font-weight: 600;
        font-size: var(--text-xs);
        letter-spacing: 1px;
        text-transform: uppercase;
        color: var(--accent-primary);
        transition: color var(--transition-fast);
      }

      .truncate__toggle:hover {
        color: var(--text-primary);
      }

      .truncate__toggle:focus-visible {
        outline: none;
        box-shadow: var(--focus-ring);
        border-radius: var(--radius-sm);
      }

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
    this.lines = 3;
    this.expanded = false;
    this._overflows = false;
    this._resizeObserver = null;
  }

  connectedCallback() {
    super.connectedCallback();
    this._resizeObserver = new ResizeObserver(() => this._checkOverflow());
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._resizeObserver?.disconnect();
    this._resizeObserver = null;
  }

  firstUpdated() {
    const content = this.shadowRoot.querySelector('.truncate__content');
    if (content) {
      this._resizeObserver?.observe(content);
    }
    this._checkOverflow();
  }

  updated(changed) {
    if (changed.has('lines') || changed.has('expanded')) {
      this._checkOverflow();
    }
  }

  _checkOverflow() {
    const content = this.shadowRoot.querySelector('.truncate__content');
    if (!content) return;

    if (this.expanded) {
      // When expanded, we need to temporarily clamp to check if it would overflow
      const prev = content.style.webkitLineClamp;
      const prevDisplay = content.style.display;
      const prevOrient = content.style.webkitBoxOrient;
      const prevOverflow = content.style.overflow;

      content.style.display = '-webkit-box';
      content.style.webkitBoxOrient = 'vertical';
      content.style.overflow = 'hidden';
      content.style.webkitLineClamp = String(this.lines);

      this._overflows = content.scrollHeight > content.clientHeight;

      content.style.webkitLineClamp = prev;
      content.style.display = prevDisplay;
      content.style.webkitBoxOrient = prevOrient;
      content.style.overflow = prevOverflow;
    } else {
      // When clamped, CSS handles the clamp; check if content overflows
      this._overflows = content.scrollHeight > content.clientHeight;
    }

    this.requestUpdate();
  }

  _toggle() {
    this.expanded = !this.expanded;
    this.dispatchEvent(new CustomEvent('arc-toggle', {
      detail: { expanded: this.expanded },
      bubbles: true,
      composed: true,
    }));
  }

  render() {
    const clamped = !this.expanded;
    const clampStyle = clamped ? `-webkit-line-clamp: ${this.lines};` : '';

    return html`
      <div
        class="truncate__content ${clamped ? 'truncate__content--clamped' : ''}"
        style=${clampStyle}
        part="content"
      >
        <slot></slot>
      </div>
      ${this._overflows || this.expanded ? html`
        <button
          class="truncate__toggle"
          @click=${this._toggle}
          part="toggle"
        >${this.expanded ? 'Show less' : 'Show more'}</button>
      ` : ''}
    `;
  }
}
