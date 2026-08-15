import { LitElement, html, css } from 'lit';
import { DeclaredPropsMixin, list } from '../shared/props.js';
import { tokenStyles } from '../shared-styles.js';
import { hydrateSlots } from '../shared/hydrate-slots.js';

/**
 * A two-column or multi-column comparison table for pricing tiers, feature breakdowns, or
 * before/after comparisons. Each column is defined with an arc-comparison-column child element.
 *
 * @tag arc-comparison
 * @requires arc-comparison-column
 * @prop {string[]} features - Feature label strings, one row each. Settable as a property, or as a JSON array in markup: `features='["Storage","Bandwidth"]'`. A malformed value falls back to an empty list rather than throwing.
 * @slot - Default content.
 * @csspart table
 * @csspart header
 * @csspart feature
 * @csspart cell
 */
export class ArcComparison extends DeclaredPropsMixin(LitElement) {
  static properties = {
    features: list(),
    _columns: { state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: block;
      }

      .comparison {
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        overflow: hidden;
      }

      .grid {
        display: grid;
        width: 100%;
      }

      .header-cell {
        font-family: var(--font-label);
        font-weight: var(--font-label-weight, 600);
        font-size: var(--_text-sm);
        letter-spacing: 1px;
        text-transform: uppercase;
        color: var(--text-primary);
        padding: var(--space-md);
        text-align: center;
        border-bottom: 1px solid var(--divider);
      }

      .header-cell--feature {
        text-align: start;
      }

      .header-cell--highlight {
        background: var(--accent-primary-subtle);
        color: color-mix(in srgb, var(--accent-primary), var(--text-primary) var(--accent-text-mix, 0%));
      }

      .row {
        display: contents;
      }

      .row:hover > .cell {
        background: var(--surface-hover);
      }

      .row:hover > .cell--highlight {
        background: rgba(var(--accent-primary-rgb), 0.06);
      }

      .cell {
        padding: var(--space-sm) var(--space-md);
        text-align: center;
        font-family: var(--font-body);
        font-size: var(--_text-sm);
        color: var(--text-secondary);
        border-bottom: 1px solid var(--divider);
        transition: background var(--transition-fast);
      }

      .cell--feature {
        text-align: start;
        color: var(--text-secondary);
      }

      .cell--highlight {
        background: rgba(var(--accent-primary-rgb), 0.03);
      }

      .row:last-child > .cell {
        border-bottom: none;
      }

      .check {
        color: var(--color-success);
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }

      .cross {
        color: var(--text-ghost);
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }

      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0 0 0 0);
        white-space: nowrap;
      }
    `,
  ];

  constructor() {
    super();
    this._columns = [];
  }

  _onSlotChange(e) {
    this._columns = e.target
      .assignedElements({ flatten: true })
      .filter((el) => el.tagName === 'ARC-COMPARISON-COLUMN');
  }

  _renderCheck() {
    return html`<span class="check" role="img" aria-label="Yes">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
        <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"/>
      </svg>
    </span>`;
  }

  _renderCross() {
    return html`<span class="cross" role="img" aria-label="No">
      <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
        <path d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z"/>
      </svg>
    </span>`;
  }

  _renderCellValue(val) {
    if (val === 'true' || val === true) return this._renderCheck();
    if (val === 'false' || val === false) return this._renderCross();
    return val;
  }

  /** The slotchange DSD swallows — see shared/hydrate-slots.js. */
  firstUpdated() {
    hydrateSlots(this);
  }

  render() {
    const features = this.features;
    const cols = this._columns;
    const colCount = cols.length + 1;

    return html`
      <div class="comparison" part="table">
        <div class="grid" style="grid-template-columns: minmax(140px, 1fr) repeat(${cols.length}, 1fr);" role="table">
          <!-- Header row -->
          <div class="row" role="row">
            <div class="header-cell header-cell--feature" part="header" role="columnheader"><span class="sr-only">Feature</span></div>
            ${cols.map(
              (col) => html`
              <div class="header-cell ${col.highlight ? 'header-cell--highlight' : ''}" part="header" role="columnheader">
                ${col.heading}
              </div>
            `,
            )}
          </div>

          <!-- Feature rows -->
          ${features.map(
            (feature, i) => html`
            <div class="row" role="row">
              <div class="cell cell--feature" part="feature" role="rowheader">${feature}</div>
              ${cols.map((col) => {
                const values = col.values;
                const val = values[i] ?? '';
                return html`
                  <div class="cell ${col.highlight ? 'cell--highlight' : ''}" part="cell" role="cell">
                    ${this._renderCellValue(val)}
                  </div>
                `;
              })}
            </div>
          `,
          )}
        </div>

        <slot style="display:none" @slotchange=${this._onSlotChange}></slot>
      </div>
    `;
  }
}
