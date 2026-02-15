import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * @tag arc-sticky
 */
export class ArcSticky extends LitElement {
  static properties = {
    offset: { type: String, reflect: true },
    stuck:  { type: Boolean, reflect: true, state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: block;
        position: sticky;
        top: var(--_offset, 0px);
        z-index: 10;
        transition: box-shadow var(--transition-fast);
      }

      :host([stuck]) {
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
      }

      .sentinel {
        position: absolute;
        top: -1px;
        left: 0;
        right: 0;
        height: 1px;
        pointer-events: none;
        visibility: hidden;
      }
    `,
  ];

  constructor() {
    super();
    this.offset = '0px';
    this.stuck = false;
    this._observer = null;
  }

  updated(changed) {
    if (changed.has('offset')) {
      this.style.setProperty('--_offset', this.offset);
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this.updateComplete.then(() => {
      const sentinel = this.shadowRoot.querySelector('.sentinel');
      if (!sentinel) return;
      this._observer = new IntersectionObserver(
        ([entry]) => {
          const isStuck = !entry.isIntersecting;
          if (this.stuck !== isStuck) {
            this.stuck = isStuck;
            this.dispatchEvent(
              new CustomEvent('arc-stuck', {
                detail: { stuck: isStuck },
                bubbles: true,
                composed: true,
              }),
            );
          }
        },
        { threshold: [1] },
      );
      this._observer.observe(sentinel);
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._observer) {
      this._observer.disconnect();
      this._observer = null;
    }
  }

  render() {
    return html`
      <div class="sentinel"></div>
      <slot></slot>
    `;
  }
}
