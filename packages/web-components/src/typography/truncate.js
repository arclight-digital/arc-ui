import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { DeclaredPropsMixin, flag } from '../shared/props.js';
import { observeResize } from '../shared/subscriptions.js';

/**
 * Multi-line text clamping with expandable show-more toggle.
 *
 * @tag arc-truncate
 * @status stable
 * @prop {number} lines - Maximum number of visible lines before clamping
 * @prop {boolean} expanded - Whether the text is fully expanded
 * @fires {CustomEvent<{ expanded: boolean }>} arc-toggle - Fired when expand/collapse toggle is clicked, with { expanded } detail
 * @slot - Default content.
 * @csspart base - The root element.
 * @csspart content
 * @csspart toggle
 */
export class ArcTruncate extends DeclaredPropsMixin(LitElement) {
  static properties = {
    lines: { type: Number, reflect: true },
    expanded: flag(false),
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
        font-family: var(--font-label);
        font-weight: var(--font-label-weight, 600);
        font-size: var(--_text-xs);
        letter-spacing: var(--label-spacing);
        text-transform: uppercase;
        color: var(--interactive);
        transition: color var(--transition-fast);
      }

      .truncate__toggle:hover {
        color: var(--text-primary);
      }

      .truncate__toggle:focus-visible {
        outline: none;
        box-shadow: var(--interactive-focus-ring);
        border-radius: var(--radius-sm);
      }
    `,
  ];

  constructor() {
    super();
    this.lines = 3;
    this._overflows = false;
    observeResize(this, '.truncate__content', () => this._checkOverflow());
  }

  firstUpdated() {
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
    this.dispatchEvent(
      new CustomEvent('arc-toggle', {
        detail: { expanded: this.expanded },
        bubbles: true,
        composed: true,
      }),
    );
  }

  render() {
    const clamped = !this.expanded;
    const clampStyle = clamped ? `-webkit-line-clamp: ${this.lines};` : '';

    return html`
      <div
        class="truncate__content ${clamped ? 'truncate__content--clamped' : ''}"
        style=${clampStyle}
        part="base content"
      >
        <slot></slot>
      </div>
      ${
        this._overflows || this.expanded
          ? html`
        <button
          class="truncate__toggle"
          @click=${this._toggle}
          part="toggle"
        >${this.expanded ? 'Show less' : 'Show more'}</button>
      `
          : ''
      }
    `;
  }
}
