import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { hydrateSlots } from '../shared/hydrate-slots.js';
import { DeclaredPropsMixin, flag, oneOf } from '../shared/props.js';

/** The role vocabulary. An unrecognized value renders as the default, user. */
const ROLES = new Set(['user', 'assistant', 'system']);

/**
 * One message in a conversation transcript. The speaker attribute decides the voice: user messages
 * sit at the inline end on a faint accent tint, assistant messages sit at the inline start on a
 * neutral surface, and system messages run centered, muted and small. The default slot is the
 * message body — append text to it to stream a reply in — and with the markdown attribute set,
 * that slotted text renders through arc-markdown, re-rendering as the text grows. A pending
 * message shows the typing indicator in place of its body. Slot an avatar for either speaker if
 * the product wants faces; none is built in.
 *
 * @tag arc-message
 * @status stable
 * @requires arc-markdown
 * @requires arc-time-ago
 * @prop {'user' | 'assistant' | 'system'} speaker - Whose message this is. "user" aligns to the inline end on an accent-tinted surface, "assistant" to the inline start on a neutral surface, and "system" runs centered and muted for notices in the transcript's own voice. An unrecognized value renders as "user".
 * @prop {string} author - Display name shown in the muted meta line above the bubble. Omit it and the meta line only appears when a timestamp is set.
 * @prop {string} timestamp - When the message was sent, as an ISO 8601 string. Rendered as house relative time ("3 minutes ago") through arc-time-ago, with the absolute date on its title.
 * @prop {boolean} pending - Renders the typing indicator — three pulsing dots — in place of the body while a reply is being produced. Under prefers-reduced-motion the dots give way to a static ellipsis.
 * @prop {boolean} markdown - Render the slotted text through the house markdown renderer. The slot's text content is the source; it re-parses whenever the slot changes, so streaming into the slot streams through the renderer. When false, slotted content renders as-is.
 * @slot - The message body. Text when markdown is set; any markup otherwise.
 * @slot avatar - An optional avatar beside the bubble; the component ships none of its own.
 * @csspart base - The root element.
 * @csspart message
 * @csspart meta
 * @csspart bubble
 */
export class ArcMessage extends DeclaredPropsMixin(LitElement) {
  static properties = {
    speaker: oneOf(['user', 'assistant', 'system'], { reflect: false }),
    author: { type: String },
    timestamp: { type: String },
    pending: flag(false),
    markdown: flag(false),
    _source: { state: true },
    // What the meta line actually renders — see willUpdate.
    _author: { state: true },
    _timestamp: { state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: block; }

      .message {
        display: flex;
        align-items: flex-end;
        gap: var(--space-sm);
      }

      /* The default voice is the user: bubble at the inline end. Flex end
         follows the writing direction, so RTL mirrors for free. The base rule
         carries the user styling and the other roles override it, which is
         what routes an unrecognized role onto the default. */
      .message--user { flex-direction: row-reverse; }

      .message__main {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs);
        max-inline-size: var(--message-max-width, 80%);
        min-inline-size: 0;
      }

      .message--user .message__main { align-items: flex-end; }

      .message__meta {
        margin: 0;
        display: flex;
        align-items: baseline;
        gap: var(--space-sm);
        font-family: var(--font-body);
        font-size: var(--_text-xs);
        color: var(--text-muted);
      }

      .message__author {
        font-weight: var(--font-label-weight, 600);
        color: var(--text-secondary);
      }

      .message__bubble {
        padding: var(--space-sm) var(--space-md);
        border-radius: var(--radius-lg);
        font-family: var(--font-body);
        font-size: var(--_text-sm);
        line-height: var(--body-lh);
        overflow-wrap: break-word;
        /* State by tint: the speaking user carries the accent wash. */
        background: rgba(var(--accent-primary-rgb), 0.08);
        border: 1px solid rgba(var(--accent-primary-rgb), 0.15);
        color: var(--text-primary);
      }

      /* The assistant answers on a neutral surface; arc-markdown sets its
         prose in --text-secondary, so plain text matches it here. */
      .message--assistant .message__bubble {
        background: var(--surface-raised);
        border-color: var(--border-subtle);
        color: var(--text-secondary);
      }

      /* System notices: the transcript's own voice, centered and quiet. */
      .message--system { justify-content: center; }
      .message--system .message__main { align-items: center; }
      .message--system .message__meta { justify-content: center; }
      .message--system .message__bubble {
        background: none;
        border: none;
        padding: var(--space-xs) var(--space-md);
        font-size: var(--_text-xs);
        color: var(--text-muted);
        text-align: center;
      }

      .message__body--hidden { display: none; }

      /* The typing indicator. The keyword curve is deliberate: loops are
         exempt from the entrance and exit curves in the token tree, and
         ease-in-out is the symmetric shape a pulse wants — see the loop note
         in scripts/checks/motion-tokens.js and the arc-hotspot halo this
         follows. Opacity and transform only, so it stays off the layout path.
         The shared reduced-motion guard shortens it to nothing; the explicit
         rule below swaps the dots for a static ellipsis outright. */
      .message__pending {
        display: inline-flex;
        align-items: center;
        gap: var(--space-xs);
        padding-block: var(--space-xs);
      }

      .message__pending-dot {
        inline-size: 6px;
        block-size: 6px;
        border-radius: var(--radius-full);
        background: var(--text-muted);
        animation: message-dot 1.2s ease-in-out infinite;
      }

      .message__pending-dot:nth-child(2) { animation-delay: 0.15s; }
      .message__pending-dot:nth-child(3) { animation-delay: 0.3s; }

      @keyframes message-dot {
        0%, 100% { opacity: 0.35; transform: translateY(0); }
        50%      { opacity: 1;    transform: translateY(-2px); }
      }

      .message__pending-ellipsis {
        display: none;
        color: var(--text-muted);
        line-height: var(--glyph-lh);
      }

      @media (prefers-reduced-motion: reduce) {
        .message__pending-dot { display: none; }
        .message__pending-ellipsis { display: inline; }
      }
    `,
  ];

  constructor() {
    super();
    this.author = '';
    this.timestamp = '';
    /** Slotted text captured for the markdown path; state, so updates re-render. */
    this._source = '';
    this._author = '';
    this._timestamp = '';
  }

  /**
   * The meta line renders from `_author` and `_timestamp`, seeded here from the
   * attributes rather than from the properties.
   *
   * The server renders from markup alone, so an author or timestamp assigned as
   * a *property* — how a transcript assembled at runtime carries them, and how
   * the docs page stamps its messages — is a value the server never had. Lit
   * re-applies a property set before upgrade during the first update, which is
   * before this, so rendering it here would open the meta line, or the
   * arc-time-ago inside it, in the client's first render where the server
   * opened neither. That is a part changing shape under hydration, which is the
   * one thing it cannot adopt. updated() takes the properties one render later,
   * after the server DOM has been adopted — the same shape as _source.
   */
  willUpdate(changed) {
    super.willUpdate?.(changed);
    if (!this.hasUpdated) {
      this._author = this.getAttribute('author') ?? '';
      this._timestamp = this.getAttribute('timestamp') ?? '';
    }
  }

  updated(changed) {
    super.updated?.(changed);
    if (changed.has('author')) this._author = this.author;
    if (changed.has('timestamp')) this._timestamp = this.timestamp;
  }

  /**
   * The DSD read, and nothing beside it.
   *
   * `slotchange` alone is not enough under declarative shadow DOM: the parser
   * attaches the shadow root and assigns the slot before Lit adopts the tree,
   * so the assignment has already happened by the time this component's
   * listener exists and the event never arrives. `hydrateSlots` delivers it —
   * that is the whole of its job, and the reader below runs from the same
   * handler a real slotchange reaches.
   *
   * There used to be a direct call here as well, which is where this
   * component's share of Lit's `change-in-update` warning came from: a second
   * read, of the same slot, writing state from inside the update.
   */
  firstUpdated() {
    hydrateSlots(this);
  }

  _onSlotChange() {
    this._readSlottedSource();
  }

  _readSlottedSource() {
    const slot = this.shadowRoot?.querySelector('slot:not([name])');
    if (!slot) return;
    const text = slot
      .assignedNodes({ flatten: true })
      .map((node) => node.textContent)
      .join('');
    if (text !== this._source) this._source = text;
  }

  /** The role class, with anything outside the vocabulary landing on user. */
  get _speaker() {
    return ROLES.has(this.speaker) ? this.speaker : 'user';
  }

  _renderMeta() {
    if (!this._author && !this._timestamp) return '';
    return html`
      <p class="message__meta" part="meta">
        ${this._author ? html`<span class="message__author">${this._author}</span>` : ''}
        ${this._timestamp ? html`<arc-time-ago datetime=${this._timestamp}></arc-time-ago>` : ''}
      </p>
    `;
  }

  _renderPending() {
    return html`
      <span class="message__pending" role="img" aria-label="Waiting for a reply">
        <span class="message__pending-dot"></span>
        <span class="message__pending-dot"></span>
        <span class="message__pending-dot"></span>
        <span class="message__pending-ellipsis" aria-hidden="true">&hellip;</span>
      </span>
    `;
  }

  render() {
    // Server-side, _source is empty (firstUpdated does not run), so the raw
    // slotted text stays visible and hydration swaps in the rendered form —
    // the transcript is never blank while the markdown path waits for JS.
    const rendersMarkdown = this.markdown && !this.pending && this._source;
    return html`
      <div class="message message--${this._speaker}" part="base message">
        <slot name="avatar"></slot>
        <div class="message__main">
          ${this._renderMeta()}
          <div class="message__bubble" part="bubble">
            ${this.pending ? this._renderPending() : ''}
            ${rendersMarkdown ? html`<arc-markdown .content=${this._source}></arc-markdown>` : ''}
            <div class=${this.pending || rendersMarkdown ? 'message__body--hidden' : ''}>
              <slot @slotchange=${this._onSlotChange}></slot>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
