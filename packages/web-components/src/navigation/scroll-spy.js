import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { hydrateSlots } from '../shared/hydrate-slots.js';

/**
 * Tracks scroll position and highlights the active navigation link.
 *
 * @tag arc-scroll-spy
 * @requires arc-spy-link
 * @prop {string} active - The id of the currently active section. Reflects to an attribute and updates automatically as the user scrolls.
 * @prop {number} offset - Pixel distance from the top of the viewport at which a section counts as current. Increase it to account for taller sticky headers.
 * @prop {'none' | 'ring' | 'read' | 'both'} progress - How the reader's position through the document is shown. `ring` draws a progress arc beside the heading; `read` recedes the entries already scrolled past; `both` does each. Defaults to `none`, and an unrecognised value lands there too.
 * @fires arc-change - Fired when the active spy target changes during scroll
 * @slot - Default content.
 * @csspart scroll-spy
 * @csspart heading
 * @csspart ring
 * @csspart list
 * @csspart link
 */
export class ArcScrollSpy extends LitElement {
  static properties = {
    active: { type: String, reflect: true },
    offset: { type: Number },
    progress: { type: String, reflect: true },
    _active: { state: true },
    _links: { state: true },
    _progress: { state: true },
  };

  /** Ring geometry. r drives the dasharray, so the two cannot drift apart. */
  static ringRadius = 6;

  /* Both readings of `progress` are derived, never stored, so the two can only
     ever agree with the prop. An unrecognised value answers false to both and
     so behaves as `none` — the default — rather than half-enabling something. */
  get _showRing() {
    return this.progress === 'ring' || this.progress === 'both';
  }

  get _showRead() {
    return this.progress === 'read' || this.progress === 'both';
  }

  static styles = [
    tokenStyles,
    css`
      :host {
        display: block;
      }

      .scroll-spy {
        padding: 0 var(--space-md);
      }

      .scroll-spy__heading {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        width: 100%;
        box-sizing: border-box;
        text-align: start;
        cursor: pointer;
        position: sticky;
        top: 0;
        z-index: 1;
        background: var(--surface-primary);
        padding: var(--space-sm) var(--space-md);
        border-radius: var(--radius-md);
        border: 1px solid var(--border-subtle);
        margin-bottom: var(--space-sm);
        transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
      }

      .scroll-spy__heading:hover {
        border-color: var(--border-default);
        box-shadow: var(--glow-card-hover);
      }

      .scroll-spy__heading-text {
        font-family: var(--font-label);
        font-weight: var(--font-label-weight, 600);
        font-size: var(--_text-xs);
        letter-spacing: 3px;
        text-transform: uppercase;
        background: var(--gradient-accent-text);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      /* ── Reading progress ── */
      /* An arc rather than a bar. A full-width bar under the heading reads as a
         second piece of chrome stacked on the panel; a 14px ring sits on the
         heading's own baseline as one more thing in that row, and says the same
         quantity in a shape the library is named after. */
      .scroll-spy__ring {
        margin-inline-start: auto;
        flex-shrink: 0;
        display: block;
        transform: rotate(-90deg);  /* Start the sweep at twelve o'clock. */
      }

      .scroll-spy__ring-track {
        stroke: var(--border-subtle);
      }

      .scroll-spy__ring-fill {
        stroke: var(--interactive);
        stroke-linecap: round;
        /* Deliberately untransitioned: the offset is rewritten on every scroll
           frame, so easing between frames only makes the ring trail the page. */
      }

      .scroll-spy__list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 2px; /* cosmetic micro-spacing */
      }

      .scroll-spy__item {
        display: block;
      }

      .scroll-spy__link {
        display: flex;
        align-items: center;
        font-family: var(--font-body);
        font-size: var(--_text-sm);
        line-height: 1.4;
        /* The unread baseline. --text-primary, and not one of the greys, for a
           reason worth writing down: secondary, muted and ghost are rgb 150,
           142 and 133 — seventeen points end to end. A read/unread split built
           from any two of them is invisible, which is exactly how it looked.
           The only real interval in the ramp is up to primary, so the hierarchy
           is built by lifting what is ahead rather than by sinking what is
           behind. Nothing ends up dimmer than the flat ghost every entry shared
           before, so the panel gains a state without spending contrast. */
        color: var(--text-primary);
        font-weight: 400;
        text-decoration: none;
        padding-block: var(--space-xs);
        padding-inline: var(--nav-row-inset) var(--space-sm);
        border-radius: var(--radius-sm);
        cursor: pointer;
        transition:
          color var(--transition-fast),
          background var(--transition-fast),
          box-shadow var(--transition-fast);
        background: none;
        border: none;
        width: 100%;
        /* An anchor is content-box by default where the <button> this replaced
           was border-box, so without this the indent on nested entries pushes
           the link wider than its container. */
        box-sizing: border-box;
        text-align: start;
        min-height: var(--touch-min);
      }

      .scroll-spy__link:hover {
        color: var(--text-primary);
        /* --surface-hover, not a white wash: --white-rgb is 255,255,255 in both
           themes, so 3% of it over a light background was invisible and the
           link had no hover affordance at all there. The token is the same
           thing done per-theme — white at 4% on dark, accent at 4% on light. */
        background: var(--surface-hover);
      }

      /* Ahead of the active rule, not after it. Both selectors are one class on
         one class, so the later one won: a nested heading that was the current
         section stayed ghost-grey, and on any page whose h3s outnumber its h2s
         the highlight was invisible most of the way down. */
      .scroll-spy__link--nested {
        font-size: var(--_text-xs);
      }

      /* Sections already scrolled past. Reading the list top to bottom, the
         point where it brightens is where you are — the same fact the ring
         gives as a quantity, in the place you are already looking.
         Hover puts it back: going *back* to a section you have read is the
         second thing a table of contents is for, and a receded row must not be
         a harder target than an unread one. */
      .scroll-spy__link--read {
        color: var(--text-ghost);
      }

      .scroll-spy__link--read:hover {
        color: var(--text-primary);
      }

      /* The accent, not a brighter grey. Unread entries already sit at
         --text-primary — the ramp has nothing above it — so lightness cannot
         say "here" as well as "ahead" at the same time. Hue can, and this is
         the treatment arc-sidebar gives its current page, which makes the two
         navigation panels agree about what current looks like. */
      .scroll-spy__link[aria-current="location"] {
        color: var(--interactive);
        font-weight: 500;
        background: var(--accent-primary-subtle);
        box-shadow: 0 0 12px rgba(var(--interactive-rgb), 0.08);
      }

      .scroll-spy__link[aria-current="location"]:hover {
        color: var(--interactive);
      }

      .scroll-spy__link:focus-visible {
        outline: none;
        box-shadow: var(--interactive-focus);
      }

      .scroll-spy__slot-host { display: none; }
    `,
  ];

  constructor() {
    super();
    this.active = '';
    this.offset = 80;
    this.progress = 'none';
    this._active = '';
    this._links = [];
    this._progress = 0;
    this._rafId = null;
    this._onScroll = this._onScroll.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    // Capture phase, on the document: the page may scroll the window or any
    // container between here and it, and scroll events do not bubble out of an
    // element. Capturing at the root sees all of them.
    document.addEventListener('scroll', this._onScroll, { capture: true, passive: true });
    window.addEventListener('resize', this._onScroll, { passive: true });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('scroll', this._onScroll, { capture: true });
    window.removeEventListener('resize', this._onScroll);
    if (this._rafId) cancelAnimationFrame(this._rafId);
    this._rafId = null;
  }

  _onSlotChange(e) {
    this._links = e.target
      .assignedElements({ flatten: true })
      .filter((el) => el.tagName === 'ARC-SPY-LINK');
  }

  updated(changed) {
    // A first pass as soon as there is anything to measure, so the current
    // section is marked on arrival rather than only after the reader scrolls —
    // which, on a page opened at a #hash, meant the highlight sat on the first
    // heading while the viewport showed the eighth.
    // Scheduled rather than measured inline: _measure sets reactive state, and
    // doing that inside updated() starts a second update pass from within the
    // first, which Lit warns about and which costs a render either way.
    if (changed.has('_links') && this._links.length > 0) this._onScroll();
  }

  /** Spy targets that resolve to a real element, in document order. */
  get _targets() {
    const seen = [];
    for (const link of this._links) {
      if (!link.target) continue;
      const el = document.getElementById(link.target);
      if (el) seen.push({ id: link.target, el });
    }
    return seen;
  }

  _onScroll() {
    if (this._rafId) return;
    this._rafId = requestAnimationFrame(() => {
      this._rafId = null;
      this._measure();
    });
  }

  /**
   * Decide which section is current from geometry rather than from whichever
   * IntersectionObserver entry happened to fire last.
   *
   * The observer version took the id of any entry reporting `isIntersecting`,
   * in callback order. Scrolling up fires the entry for the section being
   * *entered* and the one being *left* in the same batch, so the highlight
   * settled on whichever the browser listed second — usually the wrong one, and
   * inconsistently. Reading positions directly has one answer: the last heading
   * that has crossed the line, and nothing to get out of order.
   */
  _measure() {
    const targets = this._targets;
    if (targets.length === 0) return;

    const line = this.offset + 1;
    let active = targets[0].id;
    for (const t of targets) {
      if (t.el.getBoundingClientRect().top > line) break;
      active = t.id;
    }

    // A final section shorter than the remaining viewport never reaches the
    // line, so it could not be highlighted by scrolling at all. Once the page
    // bottoms out there is nowhere further to go, and it is what you are reading.
    const doc = document.scrollingElement || document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    if (max > 0 && doc.scrollTop >= max - 2) active = targets[targets.length - 1].id;

    this._progress = max > 0 ? Math.min(1, Math.max(0, doc.scrollTop / max)) : 0;

    if (active === this._active) return;
    this._active = active;
    this.active = active;
    this.dispatchEvent(
      new CustomEvent('arc-change', {
        detail: { value: active },
        bubbles: true,
        composed: true,
      }),
    );
  }

  /** 'auto' when the reader has asked for less motion, 'smooth' otherwise. */
  get _behavior() {
    return globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
  }

  _scrollToTop() {
    window.scrollTo({ top: 0, behavior: this._behavior });
    // Walk up from the host to find the nearest scrollable ancestor
    // (crosses shadow DOM boundaries via assignedSlot)
    let el = this.assignedSlot?.parentElement ?? this.parentElement;
    while (el) {
      if (el.scrollHeight > el.clientHeight) {
        el.scrollTo({ top: 0, behavior: this._behavior });
        break;
      }
      el = el.assignedSlot?.parentElement ?? el.parentElement;
    }
  }

  _handleClick(e, target) {
    const el = document.getElementById(target);
    if (!el) return; // Let the browser try the href; it knows as much as we do.
    e.preventDefault();

    // scroll-margin-top rather than arithmetic on a scroll offset: it is the one
    // form the browser applies itself, so it lands correctly whichever ancestor
    // turns out to be the scroll container.
    const previous = el.style.scrollMarginBlockStart;
    el.style.scrollMarginBlockStart = `${this.offset}px`;
    el.scrollIntoView({ behavior: this._behavior, block: 'start' });
    // Restored on the next frame so the value cannot leak into the page's own
    // styling, but not before the scroll has been queued against it.
    requestAnimationFrame(() => {
      el.style.scrollMarginBlockStart = previous;
    });

    // A table of contents whose entries do not change the URL cannot be used to
    // link to a section — the whole point of the headings having ids.
    if (globalThis.history?.replaceState) {
      history.replaceState(null, '', `#${target}`);
    }

    this._active = target;
    this.active = target;
  }

  /**
   * The progress ring.
   *
   * aria-hidden on purpose. It is an ambient restatement of a position assistive
   * technology already reports far more precisely, and as a live progressbar it
   * would announce on every scroll frame — noise in place of information. The
   * heading keeps its own name as the button's label.
   */
  _renderRing() {
    const r = this.constructor.ringRadius;
    const circumference = 2 * Math.PI * r;
    return html`
      <svg
        class="scroll-spy__ring"
        part="ring"
        width="14" height="14" viewBox="0 0 16 16"
        fill="none" stroke-width="2"
        aria-hidden="true"
      >
        <circle class="scroll-spy__ring-track" cx="8" cy="8" r=${r}></circle>
        <circle
          class="scroll-spy__ring-fill"
          cx="8" cy="8" r=${r}
          stroke-dasharray=${circumference}
          stroke-dashoffset=${circumference * (1 - this._progress)}
        ></circle>
      </svg>
    `;
  }

  /** The slotchange DSD swallows — see shared/hydrate-slots.js. */
  firstUpdated() {
    hydrateSlots(this);
  }

  render() {
    // Everything before the current section reads as covered ground. -1 while
    // nothing is active yet, which marks nothing — the correct starting state,
    // and the same value that switches the treatment off entirely.
    const activeIndex = this._showRead
      ? this._links.findIndex((l) => l.target === this._active)
      : -1;
    return html`
      <div class="scroll-spy__slot-host">
        <slot @slotchange=${this._onSlotChange}></slot>
      </div>
      <nav class="scroll-spy" part="scroll-spy" aria-label="Table of contents">
        <button class="scroll-spy__heading" part="heading" @click=${this._scrollToTop}>
          <span class="scroll-spy__heading-text">On this page</span>
          ${this._showRing ? this._renderRing() : ''}
        </button>
        <ul class="scroll-spy__list" part="list">
          ${this._links.map((link, i) => {
            const level = link.level || 0;
            return html`
            <li class="scroll-spy__item">
              <a
                class="scroll-spy__link ${level > 0 ? 'scroll-spy__link--nested' : ''} ${i < activeIndex ? 'scroll-spy__link--read' : ''}"
                href="#${link.target}"
                aria-current=${this._active === link.target ? 'location' : 'false'}
                @click=${(e) => this._handleClick(e, link.target)}
                part="link"
                style=${
                  level > 0
                    ? `padding-inline-start: calc(var(--nav-row-inset) + ${level * 12}px)`
                    : ''
                }
              >${link.label}</a>
            </li>
          `;
          })}
        </ul>
      </nav>
    `;
  }
}
