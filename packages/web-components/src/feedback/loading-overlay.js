import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import '../content/spinner.js';
import { DeclaredPropsMixin, flag } from '../shared/props.js';
import { OverlayController } from '../shared/overlay-controller.js';

/**
 * Semi-transparent surface-overlay with backdrop blur covering a container or page. Centers a
 * spinner with optional progress text.
 *
 * In global mode the overlay is a modal `<dialog>`, opened with `showModal()` through the same
 * OverlayController arc-dialog uses. The browser makes the rest of the page inert, so Tab, a click
 * and a screen reader's own navigation can't reach it, and focus goes back where it was when the
 * overlay closes. Escape doesn't close it, and the page doesn't scroll while it's up. Contained
 * mode blocks clicks only: the keyboard still reaches the covered content.
 *
 * @tag arc-loading-overlay
 * @status stable
 * @requires arc-spinner
 * @prop {boolean} active - Controls whether the loading overlay is visible. When true, the overlay fades in, blocks clicks on the content behind it.
 * @prop {string} message - Optional text displayed below the spinner. Use it to communicate what is loading or the current progress step.
 * @prop {boolean} global - When true, the overlay covers the whole viewport instead of its parent container, as a modal dialog: while active, everything else on the page is inert, so the keyboard can't reach it either.
 * @slot none
 * @csspart base - The root element.
 * @csspart overlay
 * @csspart spinner
 * @csspart message
 */
export class ArcLoadingOverlay extends DeclaredPropsMixin(LitElement) {
  static properties = {
    active: flag(false),
    message: { type: String },
    global: flag(false),
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: contents; }

      .loading-overlay {
        position: absolute;
        inset: 0;
        z-index: 50;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: var(--space-md);
        background: var(--overlay-backdrop);
        backdrop-filter: blur(4px);
        opacity: 0;
        visibility: hidden;
        transition: opacity var(--transition-base), visibility var(--transition-base);
      }

      :host([active]) .loading-overlay {
        opacity: 1;
        visibility: visible;
      }

      :host([global]) .loading-overlay {
        position: fixed;
        z-index: var(--z-overlay);
      }

      /* Global mode's <dialog>. A closed dialog is display:none by UA
         stylesheet; the base rule's display:flex overrides that, so it paints
         while closed exactly as the old div did (the server paint, and the fade
         out). showModal() only adds the top layer and the inert page. The rest
         undoes the UA dialog box. */
      dialog.loading-overlay {
        margin: 0;
        padding: 0;
        border: 0;
        width: auto;
        height: auto;
        max-width: none;
        max-height: none;
        overflow: visible;
        color: inherit;
      }

      dialog.loading-overlay::backdrop { background: transparent; }

      .loading-overlay__status { display: contents; }

      .loading-overlay__message {
        font-family: var(--font-body);
        font-size: var(--_text-sm);
        color: var(--text-muted);
      }

      @media (prefers-reduced-motion: reduce) {
        .loading-overlay { transition: none; }
      }
    `,
  ];

  constructor() {
    super();
    this.message = '';
    // Global mode only: a contained overlay has no <dialog> to hand over.
    this._overlay = new OverlayController(this, {
      dialog: () => (this.global ? this.shadowRoot?.querySelector('dialog') : null),
      isOpen: () => this.active && this.global,
      // Escape and a dialog the browser closed anyway (a second Escape) both
      // land here. The overlay stays up for as long as `active` says, and a
      // render reconciles the dialog back to that.
      onRequestClose: () => this.requestUpdate(),
      lightDismiss: false,
    });
  }

  willUpdate(changed) {
    super.willUpdate?.(changed);
    // Leaving global mode while open removes the <dialog> from the render.
    // Removing an open modal dialog doesn't close it or fire `close`, so the
    // controller would keep its scroll lock; closing it first does.
    if (changed.get('global') === true && !this.global) {
      this.shadowRoot?.querySelector('dialog')?.close();
    }
  }

  render() {
    const content = html`
      <arc-spinner size="lg" part="spinner"></arc-spinner>
      ${this.message ? html`<span class="loading-overlay__message" part="message">${this.message}</span>` : ''}
    `;
    if (this.global) {
      return html`
        <dialog class="loading-overlay" aria-label=${this.message || 'Loading'} part="base overlay">
          <div class="loading-overlay__status" role="status" aria-live="polite">${content}</div>
        </dialog>
      `;
    }
    return html`
      <div class="loading-overlay" role="status" aria-live="polite" part="base overlay">${content}</div>
    `;
  }
}
