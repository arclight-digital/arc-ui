import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { hydrateSlots } from '../shared/hydrate-slots.js';
import { DeclaredPropsMixin, flag } from '../shared/props.js';

/**
 * Page title area with positional slots for composing breadcrumbs, actions, tabs, or any content
 * around a heading and description.
 *
 * @tag arc-page-header
 * @status stable
 * @prop {string} heading - The page title rendered as an <h1>. This is the primary text landmark and should clearly describe the current page or view (e.g. "Team Settings", "Order #4021"). Keep it concise — two to five words is ideal.
 * @prop {string} description - Optional supporting text displayed below the title row. Use it to provide a one-line summary of what the page contains or what action the user should take. When empty, the description paragraph is not rendered.
 * @prop {boolean} border - When set, renders a subtle bottom border below the header to visually separate it from page content.
 * @slot above - Content above the title row — breadcrumbs, a back link, a status chip. The space it occupies is reserved only when something is in it.
 * @slot heading
 * @slot aside
 * @slot description
 * @slot below
 * @slot - Default content.
 * @csspart base
 * @csspart above
 * @csspart title-row
 * @csspart heading
 * @csspart aside
 * @csspart description
 * @csspart below
 * @csspart content
 */
export class ArcPageHeader extends DeclaredPropsMixin(LitElement) {
  static properties = {
    heading: { type: String },
    description: { type: String },
    border: flag(false),
    _filled: { state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: block;
        font-family: var(--font-body);
      }

      .page-header {
        padding: 0 0 var(--space-md);
      }

      :host([border]) .page-header {
        border-bottom: 1px solid var(--divider);
      }

      /* Each of the three wrappers carries a margin, and each used to carry it
         whether or not its slot had anything in it: a header with just a
         heading and a description reserved --space-sm + --space-md + --space-md
         of empty room below itself, about 48px that nothing on the page
         accounted for. The first attempt at a layout under one of these was
         always slightly wrong, and invisible from the outside.

         The wrappers still render — a slot removed from the shadow tree can
         never be filled again, because slotchange only fires on assignment
         changes to a slot that exists — so what the empty state drops is the
         margin. */
      .page-header__above {
        margin-bottom: var(--space-sm);
      }


      .page-header__title-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--space-md);
        flex-wrap: wrap;
      }

      .page-header__heading,
      slot[name='heading']::slotted(*) {
        margin: 0;
        font-family: var(--font-body);
        font-size: var(--heading-size);
        font-weight: var(--heading-weight);
        color: var(--text-primary);
        line-height: var(--heading-lh);
      }

      .page-header__aside {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        flex-shrink: 0;
      }

      .page-header__description {
        margin-top: var(--space-sm);
        color: var(--text-secondary);
        font-size: var(--body-size);
        line-height: var(--ui-lh);
      }

      slot[name='description']::slotted(*) {
        margin: var(--space-sm) 0 0;
        color: var(--text-secondary);
        font-size: var(--body-size);
        line-height: var(--ui-lh);
      }

      .page-header__below {
        margin-top: var(--space-md);
      }

      .page-header__content {
        margin-top: var(--space-md);
      }

      /* Last, so it outranks the three margins above at equal specificity. */
      .page-header__above--empty,
      .page-header__below--empty,
      .page-header__content--empty {
        margin: 0;
      }
    `,
  ];

  constructor() {
    super();
    this.heading = '';
    this.description = '';
    this._filled = { above: false, below: false, content: false };
  }

  /** The slotchange DSD swallows — see shared/hydrate-slots.js. */
  firstUpdated() {
    hydrateSlots(this);
  }

  /**
   * Read-and-store, and idempotent: a slot with the same assignment reports the
   * same answer, and re-reading it changes nothing.
   *
   * Whitespace-only text does not count as content. A slot written across lines
   * in the consumer's markup is assigned the newlines between the tags, so
   * `assignedNodes().length` alone would call every empty slot full.
   */
  _onSlotChange(name, e) {
    const filled = e.target
      .assignedNodes({ flatten: true })
      .some((n) => n.nodeType !== Node.TEXT_NODE || n.textContent.trim());
    if (this._filled[name] === filled) return;
    this._filled = { ...this._filled, [name]: filled };
  }

  render() {
    return html`
      <div class="page-header" part="base">
        <div class="page-header__above ${this._filled.above ? '' : 'page-header__above--empty'}" part="above">
          <slot name="above" @slotchange=${(e) => this._onSlotChange('above', e)}></slot>
        </div>
        <div class="page-header__title-row" part="title-row">
          ${
            this.heading
              ? html`<h1 class="page-header__heading" part="heading">${this.heading}</h1>`
              : html`<slot name="heading"></slot>`
          }
          <div class="page-header__aside" part="aside">
            <slot name="aside"></slot>
          </div>
        </div>
        ${
          this.description
            ? html`<p class="page-header__description" part="description">${this.description}</p>`
            : html`<slot name="description"></slot>`
        }
        <div class="page-header__below ${this._filled.below ? '' : 'page-header__below--empty'}" part="below">
          <slot name="below" @slotchange=${(e) => this._onSlotChange('below', e)}></slot>
        </div>
        <div class="page-header__content ${this._filled.content ? '' : 'page-header__content--empty'}" part="content">
          <slot @slotchange=${(e) => this._onSlotChange('content', e)}></slot>
        </div>
      </div>
    `;
  }
}
