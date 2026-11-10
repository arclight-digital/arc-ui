import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { hydrateSlots } from '../shared/hydrate-slots.js';
import { DeclaredPropsMixin, flag, oneOf } from '../shared/props.js';

/**
 * Controls some arc-fieldset disabled, as opposed to controls disabled on
 * their own. Shared across instances so nested fieldsets agree: the one that
 * re-enables last is the one that releases, whichever disabled first.
 */
const cascaded = new WeakSet();

const isControl = (el) => !!customElements.get(el.localName)?.formAssociated;

/**
 * Grouped form section with legend, description, error message, and optional card variant. Wraps
 * related inputs with native fieldset semantics.
 *
 * `disabled` reaches the controls by attribute. The native `<fieldset disabled>` is in the shadow
 * root and the controls are slotted, not its descendants, so the platform's own cascade never gets
 * to them. The fieldset sets `disabled` on every form-associated element it holds (every ARC form
 * control, at any depth), and on re-enable removes it only from the ones it disabled.
 *
 * @tag arc-fieldset
 * @status stable
 * @prop {string} legend - Text displayed in the `<legend>` element. Also available via the `legend` slot for markup.
 * @prop {string} description - Helper text displayed below the legend.
 * @prop {boolean} disabled - Dims the fieldset and disables every ARC form control inside it, at any depth, and a control slotted in directly while it is disabled. Re-enabling it re-enables only the controls it disabled, so a control that was already disabled stays disabled.
 * @prop {string} error - Error message displayed below the content with `role="alert"`.
 * @prop {'default' | 'card'} variant - Visual style. Card adds a surface background and shadow.
 * @slot legend
 * @slot actions
 * @slot - Default content.
 * @csspart base - The root element.
 * @csspart fieldset
 * @csspart legend
 * @csspart description
 * @csspart content
 * @csspart error
 */
export class ArcFieldset extends DeclaredPropsMixin(LitElement) {
  static properties = {
    legend: { type: String },
    description: { type: String },
    disabled: flag(false),
    error: { type: String },
    variant: oneOf(['default', 'card']),
    _hasLegend: { state: true },
    _hasActions: { state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: block;
      }

      :host([disabled]) {
        opacity: 0.5;
      }

      fieldset {
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        padding: var(--space-md) var(--space-lg) var(--space-lg);
        margin: 0;
        min-width: 0;
      }

      :host([variant="card"]) fieldset {
        background: var(--surface-primary);
        box-shadow: var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05));
      }

      legend {
        font-family: var(--font-body);
        font-size: var(--body-size);
        font-weight: var(--font-label-weight, 600);
        color: var(--text-primary);
        padding: 0 var(--space-xs);
        display: flex;
        align-items: center;
        gap: var(--space-sm);
      }

      .legend__slot { display: contents; }
      .legend__slot--empty { display: none; }

      /* The <legend> renders unconditionally so its slots exist for slotchange
         to fire on; this hides it when it would be empty. Making the whole
         block conditional on _hasLegend was circular; the flag is set by the
         slotchange of a slot that only existed once the flag was set, so a
         slotted legend never appeared at all. */
      .fieldset__legend--empty { display: none; }

      .fieldset__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--space-md);
      }

      .fieldset__actions {
        display: inline-flex;
        gap: var(--space-sm);
      }

      .fieldset__actions--empty { display: none; }

      .fieldset__description {
        font-family: var(--font-body);
        font-size: var(--_text-sm);
        color: var(--text-muted);
        line-height: var(--ui-lh);
        margin-top: var(--space-xs);
        padding: 0 var(--space-xs);
      }

      .fieldset__content {
        display: flex;
        flex-direction: column;
        gap: var(--space-md);
        margin-top: var(--space-md);
      }

      .fieldset__error {
        font-family: var(--font-body);
        font-size: var(--_text-sm);
        color: var(--status-error, #ef4444);
        margin-top: var(--space-sm);
        padding: 0 var(--space-xs);
      }
    `,
  ];

  /** @internal Slots read on the server and before hydration; see ssr.js. */
  static slotReaders = { legend: '_onLegendSlotChange', actions: '_onActionsSlotChange' };

  constructor() {
    super();
    this.legend = '';
    this.description = '';
    this.error = '';
    this._hasLegend = false;
    this._hasActions = false;
  }

  _onLegendSlotChange(e) {
    this._hasLegend = e.target.assignedNodes({ flatten: true }).length > 0;
  }

  _onActionsSlotChange(e) {
    this._hasActions = e.target.assignedNodes({ flatten: true }).length > 0;
  }

  /** The slotchange DSD swallows; see shared/hydrate-slots.js. */
  firstUpdated() {
    hydrateSlots(this);
  }

  updated(changed) {
    super.updated?.(changed);
    if (changed.has('disabled')) this._cascadeDisabled();
  }

  /** A control slotted in while the fieldset is disabled joins the rest. */
  _onDefaultSlotChange() {
    if (this.disabled) this._cascadeDisabled();
  }

  /**
   * Put every form control inside in the fieldset's disabled state. Done after
   * render rather than in a slot reader: the server can't write `disabled` onto
   * children, so doing it before a server-rendered control hydrates would make
   * its first client render differ from the server's. Such a control waits for
   * its own first update instead.
   */
  _cascadeDisabled() {
    for (const el of this.querySelectorAll('*')) {
      if (!isControl(el)) continue;
      if (el.shadowRoot && !el.hasUpdated) {
        customElements
          .whenDefined(el.localName)
          .then(() => el.updateComplete)
          .then(() => this._syncControl(el));
      } else {
        this._syncControl(el);
      }
    }
  }

  _syncControl(el) {
    if (!this.contains(el)) return;
    if (this.disabled) {
      // Already disabled means disabled on its own (or by an outer fieldset,
      // which is then the one that releases it).
      if (el.hasAttribute('disabled')) return;
      cascaded.add(el);
      el.setAttribute('disabled', '');
    } else if (cascaded.has(el) && !el.parentElement?.closest('arc-fieldset[disabled]')) {
      cascaded.delete(el);
      el.removeAttribute('disabled');
    }
  }

  render() {
    const hasContent = this.legend || this._hasLegend || this._hasActions;

    return html`
      <fieldset ?disabled=${this.disabled} part="base fieldset">
        ${html`
          <legend part="legend" class="${hasContent ? '' : 'fieldset__legend--empty'}">
            <div class="fieldset__header">
              <span>
                ${this.legend}
                <span class="legend__slot ${this._hasLegend ? '' : 'legend__slot--empty'}">
                  <slot name="legend" @slotchange=${this._onLegendSlotChange}></slot>
                </span>
              </span>
              <span class="fieldset__actions ${this._hasActions ? '' : 'fieldset__actions--empty'}">
                <slot name="actions" @slotchange=${this._onActionsSlotChange}></slot>
              </span>
            </div>
          </legend>
        `}
        ${this.description ? html`<div class="fieldset__description" part="description">${this.description}</div>` : ''}
        <div class="fieldset__content" part="content">
          <slot @slotchange=${this._onDefaultSlotChange}></slot>
        </div>
        ${this.error ? html`<div class="fieldset__error" role="alert" part="error">${this.error}</div>` : ''}
      </fieldset>
    `;
  }
}
