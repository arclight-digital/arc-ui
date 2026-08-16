import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { OverlayController } from '../shared/overlay-controller.js';
import { DeclaredPropsMixin, flag, oneOf } from '../shared/props.js';

/** camelCase prop name to its kebab attribute, for the reused-tag guard below. */
const attrOf = (name) => name.replace(/[A-Z]/g, (ch) => `-${ch.toLowerCase()}`);

/**
 * General-purpose modal overlay on the platform's `<dialog>`: the browser's focus containment,
 * inert background, Escape handling and top layer, with the library's sizing, header/body/footer
 * structure and cancelable close contract on top.
 *
 * Named `arc-modal` before v4. The rename is V4-SCOPE §2.4 — the element is a dialog, the platform
 * calls it a dialog, and `modal` names one of its behaviours rather than what it is. `arc-modal`
 * stays as a deprecated alias for the whole of v4.
 *
 * **This is not the confirm prompt that used to be called `arc-dialog`.** That one is
 * `<arc-confirm>` now, and it absorbed both of its old spellings. The tag name is reused here for
 * a different component, so this one throws in dev when it is handed `message` or `confirmLabel` —
 * the two props that would otherwise be silently ignored, leaving an empty panel.
 *
 * @tag arc-dialog
 * @status stable
 * @requires arc-icon-button
 * @prop {boolean} open - Controls the visible state of the dialog. Set to `true` to open it and move focus inside; set to `false` to run the exit animation and restore focus to wherever it came from.
 * @prop {string} heading - Text displayed in the header bar, and the dialog's accessible name. Keep it short and action-oriented (e.g. "Delete Project" rather than "Are you sure?").
 * @prop {'sm' | 'md' | 'lg'} size - Controls the maximum width of the dialog panel. `sm` (400px) is ideal for simple confirmations, `md` (560px) for standard forms, and `lg` (720px) for content-heavy dialogs with tables or multi-column layouts.
 * @prop {boolean} dismissible - When `true`, renders the built-in X close button and allows dismissal via Escape key and backdrop click. Set to `false` for critical decisions the user must resolve through the footer buttons. Note the default: a dialog is dismissible unless you say otherwise, where an alert is not dismissible unless you say so — the name is the convention, the default belongs to the component.
 * @prop {boolean} closable - @deprecated Since v4.0.0 — the old name for `dismissible`, kept as a two-way alias for one major and removed in v5. Setting either sets both.
 * @prop {boolean} fullscreen - Makes the dialog fill the entire viewport. Useful for mobile forms or complex workflows.
 * @fires {CustomEvent<void>} arc-open - Fired when the dialog opens
 * @fires {CustomEvent<void>} arc-close - Fired when the dialog closes. Cancelable: `preventDefault()` vetoes the close.
 * @slot header
 * @slot - Default content.
 * @slot footer
 * @csspart base - The root element.
 * @csspart dialog - The dialog panel. Same element as `base`; the scrim is `::backdrop`,
 *   which is not an element and so cannot be a part — style it with the
 *   `--dialog-backdrop` and `--dialog-backdrop-filter` custom properties.
 * @csspart header
 * @csspart close
 * @csspart body
 * @csspart footer
 */
export class ArcDialog extends DeclaredPropsMixin(LitElement) {
  static properties = {
    open: flag(false),
    heading: { type: String },
    size: oneOf(['sm', 'md', 'lg'], { default: 'md' }),

    fullscreen: flag(false),

    /**
     * The canonical dismissal prop (V4-PLAN 4.3). `dismissible` won over
     * `closable` on 3-to-1 usage — arc-alert, arc-banner and arc-callout — and
     * because `DismissController` and the central dismissal contract are the
     * architecture's word for it.
     *
     * **The two dialects differed in polarity as well as spelling, and only the
     * spelling converges.** A dialog is dismissible unless you say otherwise; an
     * alert is not dismissible unless you say so. Both defaults are right for
     * their component — an inescapable dialog is the exception, an alert with an
     * X is the exception — so forcing one default on both would trade a naming
     * inconsistency for a behavioural one, which is the worse of the two.
     */
    dismissible: flag(true, { negative: 'no-dismissible' }),

    /**
     * Deprecated alias, removed in v5. Declared as a real property rather than
     * a getter pair so the *attribute* keeps working: `<arc-dialog no-closable>`
     * is markup that exists in consumers' pages, and an accessor alone would
     * leave Lit with no attribute to observe.
     */
    closable: flag(true, { negative: 'no-closable' }),
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: contents; }

      /* The dialog is the panel. There is no backdrop element any more — the
         scrim is ::backdrop, which the browser paints in the top layer with no
         z-index and no stacking context to lose to. Its two properties come
         through custom properties so a consumer can still reach them;
         ::backdrop inherits from its originating element, which is what makes
         that work. */
      .dialog__panel {
        position: fixed;
        inset: 0;
        margin: auto;
        padding: 0;
        border: 1px solid var(--border-subtle);
        background: var(--surface-raised);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-overlay);
        width: calc(100% - var(--space-lg) * 2);
        max-height: calc(100vh - var(--space-2xl) * 2);
        overflow-y: auto;
        flex-direction: column;
        opacity: 0;
        transform: translateY(16px);
        transition:
          opacity var(--transition-base),
          transform var(--transition-base),
          overlay var(--transition-base) allow-discrete,
          display var(--transition-base) allow-discrete;
      }

      /* display is set here rather than on the base rule: a closed <dialog> is
         display:none by UA stylesheet, and a flex declaration on the base rule
         would override that and leave the panel visible while closed. */
      .dialog__panel[open] {
        display: flex;
        opacity: 1;
        transform: translateY(0);
      }

      /* The entry half of the transition. Without it the panel is already at
         its final opacity on the frame it enters the top layer, so only the
         exit animates. */
      @starting-style {
        .dialog__panel[open] {
          opacity: 0;
          transform: translateY(16px);
        }
      }

      .dialog__panel::backdrop {
        background: var(--dialog-backdrop, var(--overlay-backdrop));
        backdrop-filter: var(--dialog-backdrop-filter, blur(4px));
        opacity: 0;
        transition:
          opacity var(--transition-base),
          overlay var(--transition-base) allow-discrete,
          display var(--transition-base) allow-discrete;
      }

      .dialog__panel[open]::backdrop { opacity: 1; }

      @starting-style {
        .dialog__panel[open]::backdrop { opacity: 0; }
      }

      :host([size="sm"]) .dialog__panel { max-width: 400px; }
      :host(:not([size="lg"]):not([size="sm"])) .dialog__panel,
      :host([size="md"]) .dialog__panel { max-width: 560px; }
      :host([size="lg"]) .dialog__panel { max-width: 720px; }

      :host([fullscreen]) .dialog__panel {
        max-width: none;
        max-height: none;
        width: 100%;
        height: 100%;
        border-radius: 0;
        border: none;
      }

      .dialog__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--space-lg);
        position: relative;
      }

      .dialog__header::after {
        content: '';
        position: absolute;
        bottom: 0;
        inset-inline-start: var(--space-lg);
        inset-inline-end: var(--space-lg);
        height: 1px;
        background: var(--divider-glow);
        opacity: 0.5;
      }

      .dialog__heading {
        font-size: var(--_text-md);
        font-weight: var(--font-label-weight, 600);
        color: var(--text-primary);
        margin: 0;
      }


      .dialog__body {
        padding: var(--space-lg);
        color: var(--text-secondary);
        font-size: var(--body-size);
        line-height: var(--body-lh);
        flex: 1;
      }

      .dialog__footer {
        padding: var(--space-lg);
        position: relative;
        display: flex;
        justify-content: flex-end;
        gap: var(--space-sm);
      }

      .dialog__footer::before {
        content: '';
        position: absolute;
        top: 0;
        inset-inline-start: var(--space-lg);
        inset-inline-end: var(--space-lg);
        height: 1px;
        background: var(--divider-glow);
        opacity: 0.5;
      }

      @media (prefers-reduced-motion: reduce) {
        /* The discrete properties keep their transitions: without overlay and
           display easing, a closing dialog leaves the top layer on the frame
           close() is called and the exit never runs at all. Dropping the
           duration to 0s is what "no motion" means here, not dropping the
           allow-discrete behaviour that makes close() observable. */
        .dialog__panel,
        .dialog__panel::backdrop {
          transition-duration: 0s;
        }
      }
    `,
  ];

  /**
   * The props that belonged to the *old* `arc-dialog`.
   *
   * V4-SCOPE §3.3 requires this and says why: the old `arc-dialog` was a confirm
   * prompt with `heading`, `message` and `confirmLabel`, and it merged into
   * `arc-confirm`. Anyone still writing that markup upgrades into this
   * primitive, which knows `heading` and would silently ignore the other two —
   * rendering an empty panel with a title. That is the quietest possible
   * failure, and a line in MIGRATION.md is not a fix for it.
   *
   * `heading` is deliberately not in the list: it means the same thing in both
   * components, so its presence is not evidence of the mistake.
   */
  static REUSED_TAG_PROPS = ['message', 'confirmLabel', 'cancelLabel'];

  connectedCallback() {
    super.connectedCallback();
    const stray = ArcDialog.REUSED_TAG_PROPS.filter(
      (name) => this[name] !== undefined || this.hasAttribute(attrOf(name)),
    );
    if (!stray.length) return;

    // `console.error`, not `throw`. A throw from `connectedCallback` is a
    // custom-element reaction: the browser catches it, reports it globally, and
    // leaves *this element* unupgraded while the call site sees nothing it can
    // catch. That trades a blank dialog for a blank dialog plus an error nobody
    // can handle. `console.error` is the level above the `console.warn` the
    // rest of the library uses, which is the right distinction: this is a
    // certain mistake rather than a suspicion.
    console.error(
      `[arc-dialog] received ${stray.map((n) => `\`${n}\``).join(', ')}, which it does not ` +
        'have. In v4 `arc-dialog` is the modal primitive (renamed from `arc-modal`); the ' +
        'confirm prompt that used to be called `arc-dialog` is now `<arc-confirm>`, and it ' +
        'takes all of them. See MIGRATION.md.',
    );
  }

  constructor() {
    super();
    this.heading = '';
    this._overlay = new OverlayController(this, {
      dialog: () => this.shadowRoot?.querySelector('dialog'),
      isOpen: () => this.open,
      onRequestClose: () => this._close(),
    });
  }

  /**
   * The single gate on dismissal.
   *
   * OverlayController routes Escape and backdrop clicks here, and the X button
   * only renders when dismissible, so guarding once covers every path. A dialog
   * with dismissible=false is genuinely undismissable — the caller has to
   * resolve it through its own footer actions.
   *
   * The Escape path is why the controller cancels the browser's own close
   * rather than letting it through: `dismissible=false` has to be able to
   * refuse, and a dialog that closed and reopened would flash.
   */
  _close() {
    if (!this.dismissible) return;
    // Cancelable: a consumer with unsaved state can preventDefault() to veto.
    if (
      !this.dispatchEvent(
        new CustomEvent('arc-close', { bubbles: true, composed: true, cancelable: true }),
      )
    )
      return;
    this.open = false;
  }

  /**
   * Keep the deprecated `closable` and the canonical `dismissible` in step.
   *
   * In `willUpdate` rather than `updated`, so the mirrored assignment is folded
   * into the same render pass instead of costing a second one. The canonical
   * name is checked first, so a consumer that sets both in one turn gets the
   * one they are supposed to be using.
   *
   * This cannot loop: the second pass sees the two already equal and the guard
   * on each branch is an inequality.
   */
  willUpdate(changed) {
    super.willUpdate?.(changed);
    if (changed.has('dismissible') && this.closable !== this.dismissible) {
      this.closable = this.dismissible;
    } else if (changed.has('closable') && this.dismissible !== this.closable) {
      this.dismissible = this.closable;
    }
  }

  updated(changed) {
    // Focus, inertness, Escape, focus restore and the top layer are the
    // browser's, via OverlayController and <dialog>. This only adds the event.
    super.updated?.(changed);
    if (changed.has('open') && this.open) {
      this.dispatchEvent(new CustomEvent('arc-open', { bubbles: true, composed: true }));
    }
  }

  render() {
    return html`
      <dialog
        class="dialog__panel"
        aria-label=${this.heading || 'Dialog'}
        part="base dialog"
      >
        <div class="dialog__header" part="header">
          <slot name="header">
            <h2 class="dialog__heading">${this.heading}</h2>
          </slot>
          ${
            this.dismissible
              ? html`
            <arc-icon-button name="x" label="Close" variant="ghost" size="sm" @click=${this._close} part="close"></arc-icon-button>
          `
              : ''
          }
        </div>
        <div class="dialog__body" part="body">
          <slot></slot>
        </div>
        <div class="dialog__footer" part="footer">
          <slot name="footer"></slot>
        </div>
      </dialog>
    `;
  }
}
