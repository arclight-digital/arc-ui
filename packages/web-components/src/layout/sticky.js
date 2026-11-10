import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { serverHostStyle } from '../shared/server-host-style.js';
import { DeclaredPropsMixin, flag } from '../shared/props.js';

/**
 * Wrapper that goes sticky at a configurable offset and emits a stuck attribute/event for visual
 * state changes.
 *
 * @tag arc-sticky
 * @status stable
 * @prop {string} offset - The CSS `top` value for sticky positioning. Set to "64px" to stick below a 64px top bar, or "0px" to stick flush with the viewport/scroll container edge.
 * @prop {boolean} stuck - Read-only attribute set by the IntersectionObserver while the element is stuck at its `offset`, whatever the offset is. Use the `[stuck]` CSS selector to style the stuck state.
 * @fires arc-stuck - Fired when the stuck state changes. Event detail contains `{ stuck: boolean }` indicating whether the element is currently stuck.
 * @slot - Default content.
 * @csspart base - The root element.
 */
export class ArcSticky extends DeclaredPropsMixin(LitElement) {
  static properties = {
    offset: { type: String, reflect: true },
    // `state: true` used to sit here alongside `reflect: true`. In Lit, state
    // means *no attribute at all*, so the reflect was dead and `[stuck]` never
    // appeared, which broke the component's own `:host([stuck])` rule below as
    // well as the selector its @prop documentation tells consumers to use. It
    // is an output, not an input: see `derived` in shared/props.js.
    stuck: flag(false, { derived: true }),
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
        box-shadow: var(--shadow-sm);
      }

      .sentinel {
        position: absolute;
        top: -1px;
        inset-inline-start: 0;
        inset-inline-end: 0;
        height: 1px;
        pointer-events: none;
        visibility: hidden;
      }
    `,
  ];

  constructor() {
    super();
    this.offset = '0px';
    this._observer = null;
  }

  /** The same custom property on the server, which never runs updated(). */
  willUpdate(changed) {
    if (changed.has('offset')) serverHostStyle(this, { '--_offset': this.offset });
  }

  updated(changed) {
    if (changed.has('offset')) {
      this.style.setProperty('--_offset', this.offset);
      // The first observer is made in connectedCallback; this re-aims it.
      if (this._observer) this._observe();
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this.updateComplete.then(() => this._observe());
  }

  /**
   * (Re)create the observer for the current offset.
   *
   * The sentinel sits 1px above the host and moves with it, so once the host
   * sticks at `top: 64px` the sentinel sits at 63px, still inside the
   * viewport. Shrinking the root's top edge by the offset puts the line it
   * crosses where the host actually sticks. It used to watch the plain
   * viewport, which only worked at offset 0. rootMargin takes only px or %, so
   * the offset is read back from the computed `top`, which resolves rem, em
   * and calc() to px.
   */
  _observe() {
    this._observer?.disconnect();
    this._observer = null;
    if (!this.isConnected) return;
    const sentinel = this.shadowRoot?.querySelector('.sentinel');
    if (!sentinel) return;
    const top = getComputedStyle(this).top;
    const inset = `${-(parseFloat(top) || 0)}${top.endsWith('%') ? '%' : 'px'}`;
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
      { threshold: [1], rootMargin: `${inset} 0px 0px 0px` },
    );
    this._observer.observe(sentinel);
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
      <div part="base" class="sentinel"></div>
      <slot></slot>
    `;
  }
}
