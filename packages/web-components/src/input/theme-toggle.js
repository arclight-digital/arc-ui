import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { iconBoxStyles } from '../button-styles.js';
import { DeclaredPropsMixin, flag, oneOf } from '../shared/props.js';
import { observeAttributes } from '../shared/subscriptions.js';

/**
 * Three-state theme toggle cycling through dark, light, and auto modes with animated icon
 * transitions and localStorage persistence.
 *
 * @tag arc-theme-toggle
 * @status stable
 * @prop {'dark' | 'light' | 'auto'} theme - The current theme mode. Synced in both directions: changing it — by click, by key, or by assigning the property — writes the document root's `data-theme` and localStorage, and a change to that attribute from anywhere else is adopted back, so every toggle on the page agrees.
 * @prop {boolean} disabled - Prevents cycling and reduces opacity to 40%.
 * @prop {boolean} iconOnly - Renders the button as a compact square without the theme name label, matching an icon-only arc-icon-button of the same size. Attribute name is `icon-only`.
 * @prop {'xs' | 'sm' | 'md' | 'lg'} size - Box size when `icon-only`, on the same scale as arc-icon-button: xs=28px, sm=32px, md=36px, lg=44px. Set both controls to the same value when they sit side by side. Ignored by the labeled form, which is sized by its text.
 * @fires {CustomEvent<{ value: 'dark' | 'light' | 'auto' }>} arc-change - Fired when the theme is toggled, with { theme } detail
 * @slot none
 * @csspart base - The root element.
 * @csspart button
 * @csspart icon
 * @csspart label
 */
export class ArcThemeToggle extends DeclaredPropsMixin(LitElement) {
  static properties = {
    theme: oneOf(['dark', 'light', 'auto'], { default: 'auto' }),
    disabled: flag(false),
    iconOnly: flag(false, { attribute: 'icon-only' }),
    // Canon first, extension after (V4-PLAN 4.3). `xs` moved behind `lg` rather
    // than being dropped — arc-signature-pad renders an icon button at that
    // size, so it is load-bearing. The explicit `default` means the reorder
    // changes nothing at runtime; it is the declaration that now reads the way
    // every other size does.
    size: oneOf(['sm', 'md', 'lg', 'xs'], { default: 'md' }),
  };

  static styles = [
    tokenStyles,
    /* The square box, shared with arc-icon-button. The icon-only form used to
       carry its own 36px/radius-full/1px-border rules, which put it beside a
       ghost arc-icon-button in a top bar as a different size, a different
       radius and the only one of the two with a visible edge. */
    iconBoxStyles,
    css`
      :host { display: inline-flex; }
      :host([disabled]) { pointer-events: none; opacity: 0.5; }

      /* Named .btn so the shared box rules reach it; the labeled form marks
         itself .btn--has-text, which is what excuses it from being square. */
      .btn {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: var(--space-sm);
        background: transparent;
        border: 1px solid transparent;
        border-radius: var(--radius-md);
        color: var(--text-muted);
        cursor: pointer;
        padding: 0;
        box-sizing: border-box;
        transition:
          background var(--transition-fast),
          border-color var(--transition-fast),
          color var(--transition-fast),
          box-shadow var(--transition-fast),
          transform 120ms var(--ease-out-expo);
      }

      /* The labeled form keeps its border: with a word in it, it reads as a
         control you operate rather than as one of a row of bare glyphs. */
      .btn--has-text {
        border-color: var(--border-default);
        border-radius: var(--radius-sm);
        padding: var(--space-sm);
        min-width: 90px;
        min-height: var(--touch-min);
      }

      .btn:hover {
        box-shadow: var(--glow-sm);
        color: var(--text-primary);
        background: var(--surface-hover);
      }

      .btn:active {
        transform: scale(0.95);
      }

      .btn:focus-visible {
        outline: none;
        box-shadow: var(--interactive-focus);
      }

      /* ── Icon container ── */
      .btn__icon {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 18px;
        height: 18px;
        flex-shrink: 0;
      }

      /* All three icons sit on top of each other, opacity-animated */
      .btn__icon svg {
        position: absolute;
        inset: 0;
        opacity: 0;
        transform: scale(0.5) rotate(-90deg);
        transition: opacity var(--transition-slow), transform var(--transition-slow);
      }

      .btn__icon svg.is-active {
        opacity: 1;
        transform: scale(1) rotate(0deg);
      }

      /* ── Label ── */
      .btn__label {
        font-family: var(--font-body);
        font-size: var(--_text-sm);
        text-transform: capitalize;
        user-select: none;
        width: 32px;
        text-align: start;
      }

      :host([icon-only]) .btn__label {
        display: none;
      }
    `,
  ];

  static _themeOrder = ['dark', 'light', 'auto'];

  constructor() {
    super();
    // The page is the single source of truth, and this component is one of
    // possibly several views onto it. Following the root attribute is what
    // makes a second toggle agree with the first (finding #15) — each used to
    // sample global state once, on connect, so the one that was not clicked
    // kept rendering the previous theme while the page had already moved.
    observeAttributes(this, () => document.documentElement, ['data-theme'], () => {
      this._adoptDocumentTheme();
    });
  }

  /** Take the root's theme without writing it back. */
  _adoptDocumentTheme() {
    const next = document.documentElement.getAttribute('data-theme');
    if (!ArcThemeToggle._themeOrder.includes(next) || next === this.theme) return;
    // Marked applied first: this value *came from* the document, so pushing it
    // back would be a write per instance per change, and each write would
    // re-notify every observer.
    this._appliedTheme = next;
    this.theme = next;
  }

  connectedCallback() {
    super.connectedCallback();
    // Whatever the component connects with is already in effect as far as it is
    // concerned; only a later value is a change worth writing out.
    this._appliedTheme = this.theme;
    // An explicit `theme` in markup is the author stating the answer, and used
    // to be discarded: this sampled storage and the document root
    // unconditionally, so `<arc-theme-toggle theme="dark">` rendered as
    // whatever was stored. Found by the derived conformance suite.
    if (this.hasAttribute('theme')) {
      this._appliedTheme = this.theme;
      return;
    }
    const stored = localStorage.getItem('arc-theme');
    if (stored && ArcThemeToggle._themeOrder.includes(stored)) {
      this.theme = stored;
    } else {
      this.theme = document.documentElement.getAttribute('data-theme') || 'auto';
    }
    this._appliedTheme = this.theme;
  }

  /**
   * The "automatically synced" half of the documented contract — finding #14.
   *
   * The sync used to live inside `_cycle()` and nowhere else, so it happened on
   * a click and not on `el.theme = 'dark'`, which is the documented way to
   * drive the component from application state and the only way to restore a
   * saved preference. The button repainted and the page kept its old theme.
   *
   * Guarded against the *initial* value rather than against every render:
   * merely putting a toggle on a page must not stamp the document with a theme
   * nobody chose. `:root:not([data-theme])` and `[data-theme="auto"]` are
   * different rules in base.css, so writing `auto` on mount would be a visible
   * change, not a no-op.
   */
  updated(changed) {
    if (!changed.has('theme')) return;
    if (this.theme === this._appliedTheme) return;
    this._appliedTheme = this.theme;
    this._writeGlobalTheme();
  }

  /** Push `theme` to the two pieces of global state the prop documents. */
  _writeGlobalTheme() {
    if (document.documentElement.getAttribute('data-theme') !== this.theme) {
      document.documentElement.setAttribute('data-theme', this.theme);
    }
    if (localStorage.getItem('arc-theme') !== this.theme) {
      localStorage.setItem('arc-theme', this.theme);
    }
  }

  _cycle() {
    if (this.disabled) return;

    const order = ArcThemeToggle._themeOrder;
    const currentIdx = order.indexOf(this.theme);
    const nextIdx = (currentIdx + 1) % order.length;
    // `updated()` performs the sync now, for every path that moves `theme`
    // rather than for this one only.
    this.theme = order[nextIdx];

    this.dispatchEvent(
      new CustomEvent('arc-change', {
        detail: { value: this.theme },
        bubbles: true,
        composed: true,
      }),
    );
  }

  _handleKeydown(e) {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      this._cycle();
    }
  }

  render() {
    return html`
      <button
        class="btn ${this.iconOnly ? '' : 'btn--has-text'}"
        @click=${this._cycle}
        @keydown=${this._handleKeydown}
        ?disabled=${this.disabled}
        aria-label="Toggle theme, current: ${this.theme}"
        title="Theme: ${this.theme}"
        part="base button"
      >
        <span class="btn__icon" part="icon">
          <!-- Sun -->
          <svg class="${this.theme === 'light' ? 'is-active' : ''}" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/>
            <line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
          <!-- Moon -->
          <svg class="${this.theme === 'dark' ? 'is-active' : ''}" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
          </svg>
          <!-- Monitor (auto) -->
          <svg class="${this.theme === 'auto' ? 'is-active' : ''}" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
            <line x1="8" y1="21" x2="16" y2="21"/>
            <line x1="12" y1="17" x2="12" y2="21"/>
          </svg>
        </span>
        <span class="btn__label" part="label">${this.theme}</span>
      </button>
    `;
  }
}
