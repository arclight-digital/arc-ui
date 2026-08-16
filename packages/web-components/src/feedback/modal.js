import { ArcDialog } from './dialog.js';

/**
 * @deprecated Since v4.0.0 — use `<arc-dialog>`. Same component, same props, same events, same
 *   parts, same custom properties; only the tag name changed. Removed in v5.
 *
 * General-purpose modal overlay on the platform's `<dialog>`. Renamed because the element *is* a
 * dialog, the platform calls it a dialog, and `modal` named one of its behaviours rather than what
 * it is (V4-SCOPE §2.4).
 *
 * **A subclass with an empty body, on purpose.** The usual way a rename-with-compatibility-alias
 * rots is that the alias is a copy and one of the two copies gets a fix. There is nothing here to
 * fall behind: no styles, no template, no properties. The one thing `arc-dialog` has that this
 * does not inherit usefully is its reused-tag guard — that guard exists because the name
 * `arc-dialog` used to mean a confirm prompt, and `arc-modal` never meant anything else — but it
 * costs nothing to leave in place, and a page that hands `<arc-modal message="...">` the confirm
 * prompt's props has made the same mistake by a different route.
 *
 * @tag arc-modal
 * @status deprecated
 * @arc-merged-into arc-dialog
 * @requires arc-icon-button
 * @prop {boolean} open - Controls the visible state of the dialog. Set to `true` to open it and move focus inside; set to `false` to run the exit animation and restore focus to wherever it came from.
 * @prop {string} heading - Text displayed in the header bar, and the dialog's accessible name.
 * @prop {'sm' | 'md' | 'lg'} size - Maximum width of the panel. `sm` (400px) suits confirmations, `md` (560px) standard forms, and `lg` (720px) content-heavy dialogs with tables or multi-column layouts.
 * @prop {boolean} dismissible - When `true`, renders the built-in X close button and allows dismissal via Escape and backdrop click. Set to `false` for decisions the user must resolve through the footer.
 * @prop {boolean} closable - @deprecated Since v4.0.0 — the old name for `dismissible`, kept as a two-way alias for one major and removed in v5. Setting either sets both.
 * @prop {boolean} fullscreen - Makes the dialog fill the entire viewport. Useful for mobile forms or complex workflows.
 * @fires {CustomEvent<void>} arc-open - Fired when the dialog opens
 * @fires {CustomEvent<void>} arc-close - Fired when the dialog closes. Cancelable: `preventDefault()` vetoes the close.
 * @slot header
 * @slot - Default content.
 * @slot footer
 * @csspart base - The root element.
 * @csspart dialog - The dialog panel. Same element as `base`; the scrim is `::backdrop`, which is
 *   not an element and so cannot be a part — style it with the `--dialog-backdrop` and
 *   `--dialog-backdrop-filter` custom properties.
 * @csspart header
 * @csspart close
 * @csspart body
 * @csspart footer
 */
export class ArcModal extends ArcDialog {}
