import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import '../content/spinner.js';
import { DeclaredPropsMixin, flag } from '../shared/props.js';
import { observeIntersect } from '../shared/subscriptions.js';

/**
 * Intersection Observer-powered container that fires a load event when the user scrolls near the
 * bottom, with built-in loading spinner and end-of-list state.
 *
 * @tag arc-infinite-scroll
 * @status stable
 * @requires arc-spinner
 * @prop {number} threshold - Distance in pixels from the bottom of the content at which `arc-load-more` fires. Controls how eagerly new data is requested.
 * @prop {boolean} loading - When true, displays a spinner in the footer and suppresses additional `arc-load-more` events.
 * @prop {boolean} finished - When true, disconnects the observer and displays "No more items" text in the footer.
 * @prop {boolean} disabled - Disables the component, disconnects the observer, and reduces opacity to 40%.
 * @fires {CustomEvent<void>} arc-load-more - Fired when the scroll sentinel enters the viewport, signaling more content should load
 * @slot - Default content.
 * @csspart base - The root element.
 * @csspart container
 * @csspart content
 * @csspart footer
 * @csspart end-text
 * @csspart spinner
 */
export class ArcInfiniteScroll extends DeclaredPropsMixin(LitElement) {
  static properties = {
    threshold: { type: Number },
    loading: flag(false),
    finished: flag(false),
    disabled: flag(false),
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: block;
      }
      :host([disabled]) { pointer-events: none; opacity: 0.5; }

      .infinite-scroll {
        display: flex;
        flex-direction: column;
      }

      .infinite-scroll__content {
        display: contents;
      }

      .infinite-scroll__footer {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: var(--space-lg) 0;
        min-height: 48px;
      }

      .infinite-scroll__sentinel {
        width: 100%;
        height: 1px;
        pointer-events: none;
      }

      .infinite-scroll__end-text {
        font-family: var(--font-body);
        font-size: var(--body-size);
        color: var(--text-muted);
        text-align: center;
        user-select: none;
      }
    `,
  ];

  constructor() {
    super();
    this.threshold = 200;

    // Was created in firstUpdated and destroyed in disconnectedCallback, which
    // do not pair — so the first reparenting stopped it loading more, silently
    // and for good (finding #64). `updated` re-created it only when `finished`
    // or `disabled` changed, which a reconnect does not.
    //
    // Returning null from the resolver is how "stop watching" is expressed now:
    // the controller releases the observation and takes it back if the state
    // reverses, so there is no second teardown path to keep paired.
    observeIntersect(
      this,
      () =>
        this.finished || this.disabled
          ? null
          : (this.shadowRoot?.querySelector('.infinite-scroll__sentinel') ?? null),
      (entries) => {
        const entry = entries[0];
        if (entry && entry.isIntersecting && !this.loading && !this.finished && !this.disabled) {
          this.dispatchEvent(
            new CustomEvent('arc-load-more', {
              bubbles: true,
              composed: true,
            }),
          );
        }
      },
      { rootMargin: `0px 0px ${this.threshold}px 0px` },
    );
  }

  render() {
    return html`
      <div
        class="infinite-scroll"
        aria-busy=${this.loading ? 'true' : 'false'}
        part="base container"
      >
        <div class="infinite-scroll__content" part="content">
          <slot></slot>
        </div>

        ${
          this.finished
            ? html`
            <div class="infinite-scroll__footer" part="footer">
              <span class="infinite-scroll__end-text" part="end-text">No more items</span>
            </div>
          `
            : html`
            <div class="infinite-scroll__footer" part="footer">
              ${this.loading ? html`<arc-spinner size="sm" part="spinner"></arc-spinner>` : ''}
            </div>
            <div class="infinite-scroll__sentinel"></div>
          `
        }
      </div>
    `;
  }
}
