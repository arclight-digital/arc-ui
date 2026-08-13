import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { hydrateSlots } from '../shared/hydrate-slots.js';
import { DeclaredPropsMixin, flag } from '../shared/props.js';

/** How close to the bottom, in pixels, still counts as reading the live end. */
const NEAR_BOTTOM_PX = 100;

/**
 * A chat transcript: the scrollable column that holds arc-message children. Built for AI
 * assistant panels — the layout, the role alignment, and the scroll behavior all assume messages
 * arrive while the user is reading. While the reader sits near the bottom, new or growing
 * messages keep the view pinned to the latest; once they scroll up to re-read, the transcript
 * never yanks them back down. The arc-scroll-away and arc-scroll-return events report those
 * transitions with the distance from the bottom, so a consumer can float a "jump to latest" chip
 * and wire it to scrollToEnd().
 *
 * @tag arc-conversation
 * @requires arc-message
 * @prop {boolean} autoScroll - Follow new content: when a message is added or grows while the reader is near the bottom, scroll to keep the latest visible. A reader who has scrolled up is never pulled back down. Defaults to true; set the property to false to leave scrolling entirely to the consumer.
 * @fires {CustomEvent<{value: number}>} arc-scroll-away - Fired once when the reader scrolls up out of the near-bottom zone of the transcript. detail.value is the distance from the bottom in pixels.
 * @fires {CustomEvent<{value: number}>} arc-scroll-return - Fired once when the reader comes back within the near-bottom zone. detail.value is the distance from the bottom in pixels.
 * @slot - Default content: the arc-message children making up the transcript.
 * @csspart conversation
 */
export class ArcConversation extends DeclaredPropsMixin(LitElement) {
  static properties = {
    autoScroll: flag(true, { attribute: 'auto-scroll', negative: 'no-auto-scroll' }),
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: block;
        min-block-size: 0;
      }

      /* The container is the scroll area. With no --conversation-height set,
         the 100% fallback resolves against the host: a sized host is filled,
         an auto host lets the percentage collapse to auto and the transcript
         grows with its content. */
      .conversation {
        display: flex;
        flex-direction: column;
        gap: var(--space-md);
        block-size: var(--conversation-height, 100%);
        overflow-y: auto;
        overscroll-behavior: contain;
        padding: var(--space-md);
        border-radius: var(--radius-md);
      }

      /* A scrollable region is keyboard territory, so it takes focus; the
         inset ring is the treatment a filled scroll surface can carry without
         being clipped by its own overflow. */
      .conversation:focus-visible {
        outline: none;
        box-shadow: var(--interactive-focus-inset);
      }

      ::slotted(arc-message) { flex-shrink: 0; }
    `,
  ];

  constructor() {
    super();
    /** Whether the reader was near the live end at the last scroll sample. */
    this._nearEnd = true;
    this._observer = null;
    this._pinScheduled = false;
  }

  connectedCallback() {
    super.connectedCallback();
    // Streaming appends text nodes and flips pending attributes as often as it
    // adds children, so all three mutation kinds keep the view pinned.
    this._observer = new MutationObserver(() => this._onContentChanged());
    this._observer.observe(this, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['pending'],
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._observer?.disconnect();
    this._observer = null;
  }

  firstUpdated() {
    hydrateSlots(this);
    // A transcript opens at its latest message, not its oldest.
    if (this.autoScroll) {
      this.scrollToEnd();
      this._schedulePin();
    }
  }

  get _container() {
    return this.shadowRoot?.querySelector('.conversation');
  }

  /** Distance from the bottom of the scroll area, in pixels. */
  get _distanceFromEnd() {
    const c = this._container;
    if (!c) return 0;
    return Math.max(0, c.scrollHeight - c.scrollTop - c.clientHeight);
  }

  /** Scroll the transcript to its newest message. */
  scrollToEnd() {
    const c = this._container;
    if (!c) return;
    c.scrollTop = c.scrollHeight;
    this._syncNearState();
  }

  _onScroll() {
    this._syncNearState();
  }

  _onSlotChange() {
    this._onContentChanged();
  }

  /**
   * The standard chat rule: stick to the bottom only if the reader was already
   * there. _nearEnd is sampled from scroll events rather than recomputed here,
   * because a tall message landing at the bottom instantly puts the *old*
   * position outside the threshold — the reader did not move, so their intent
   * to follow stands.
   */
  _onContentChanged() {
    if (this.autoScroll && this._nearEnd) {
      this.scrollToEnd();
      // A just-added arc-message grows again when its own shadow content
      // renders a microtask later, and that growth never reaches the light-DOM
      // observer. Re-pin on the next frame, after those renders have flushed.
      this._schedulePin();
      return;
    }
    // Not following: content growth can still move the reader out of (never
    // into) the near zone, and the chip consumer wants to hear about it.
    this._syncNearState();
  }

  /** One follow-up pin per frame; skipped if the reader has since scrolled up. */
  _schedulePin() {
    if (this._pinScheduled) return;
    this._pinScheduled = true;
    requestAnimationFrame(() => {
      this._pinScheduled = false;
      if (this.autoScroll && this._nearEnd) this.scrollToEnd();
    });
  }

  /** Dispatch away/return once per transition across the threshold. */
  _syncNearState() {
    const distance = this._distanceFromEnd;
    const near = distance <= NEAR_BOTTOM_PX;
    if (near === this._nearEnd) return;
    this._nearEnd = near;
    this.dispatchEvent(
      new CustomEvent(near ? 'arc-scroll-return' : 'arc-scroll-away', {
        bubbles: true,
        composed: true,
        detail: { value: distance },
      }),
    );
  }

  render() {
    return html`
      <div
        class="conversation"
        part="conversation"
        role="log"
        tabindex="0"
        @scroll=${this._onScroll}
      >
        <slot @slotchange=${this._onSlotChange}></slot>
      </div>
    `;
  }
}
