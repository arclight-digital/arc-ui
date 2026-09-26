import { LitElement, html, css, nothing } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { DeclaredPropsMixin, flag, list, num } from '../shared/props.js';

/**
 * Labelled horizontal bars with their values, ranked: "which of these, and by how
 * much", in less room than a chart. For a top-N breakdown in a tile or a sidebar,
 * where `arc-chart` is dashboard-sized and `arc-sparkline` has no labels.
 *
 * It renders a real ordered list. Each row reads as its label and value; the bar is
 * decoration and hidden from assistive tech, so nothing is carried by length alone.
 *
 * @tag arc-bar-list
 * @status stable
 * @prop {Array} items - The rows, as `{ label, value, display?, href? }` objects. Set from script, a framework binding, or a JSON attribute. Rows whose value is not a finite number are dropped. `display` is the text shown for the value (e.g. "1.2k"); without it the number is shown as is, so server and client render the same text in any locale. With `href`, a row's label is a link.
 * @prop {number} max - The value a full bar stands for. Defaults to the largest value, so the top row always fills the track. Set it to compare several lists on one scale.
 * @prop {number} limit - Show at most this many rows, after sorting. Unset shows all.
 * @prop {boolean} unsorted - Keep the order the items were given in. By default rows are ranked, largest first.
 * @prop {string} unit - Text appended to each value, such as "%" or " ms".
 * @prop {string} label - Accessible name for the list, announced before its rows.
 * @slot none
 * @csspart base - The root element: the ordered list.
 * @csspart item - One row.
 * @csspart label - A row's label, or its link.
 * @csspart value - A row's value.
 * @csspart track - The bar's full-length track.
 * @csspart bar - The bar itself. Coloured by `--bar-list-fill`.
 */
export class ArcBarList extends DeclaredPropsMixin(LitElement) {
  static properties = {
    items: list(),
    max: num({ nullable: true, min: 0 }),
    limit: num({ nullable: true, min: 0, int: true }),
    unsorted: flag(false),
    unit: { type: String },
    label: { type: String },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: block; }

      .list {
        list-style: none;
        display: flex;
        flex-direction: column;
        gap: var(--space-sm);
      }

      .row {
        display: grid;
        grid-template-columns: 1fr auto;
        grid-template-areas: 'label value' 'track track';
        column-gap: var(--space-sm);
        row-gap: var(--space-xs);
        align-items: baseline;
      }

      .label {
        grid-area: label;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-family: var(--font-body);
        font-size: var(--ui-size);
        line-height: var(--ui-lh);
        color: var(--text-secondary);
      }

      a.label {
        color: inherit;
        text-decoration: none;
        border-radius: var(--radius-xs);
      }
      a.label:hover { color: var(--text-primary); text-decoration: underline; }
      a.label:focus-visible { outline: none; box-shadow: var(--interactive-focus); }

      .value {
        grid-area: value;
        font-family: var(--font-mono);
        font-size: var(--ui-size);
        font-variant-numeric: tabular-nums;
        color: var(--text-primary);
      }

      .track {
        grid-area: track;
        height: 6px;
        border-radius: var(--radius-full);
        background: var(--surface-overlay);
        overflow: hidden;
      }

      .bar {
        height: 100%;
        border-radius: var(--radius-full);
        background: var(--bar-list-fill, var(--accent-primary));
        transition: width var(--transition-base);
      }
    `,
  ];

  constructor() {
    super();
    this.unit = '';
    this.label = '';
  }

  /** Finite rows, ranked unless `unsorted`, cut to `limit`. */
  get _rows() {
    const rows = (Array.isArray(this.items) ? this.items : [])
      .filter((r) => r && Number.isFinite(Number(r.value)))
      .map((r) => ({
        label: String(r.label ?? ''),
        value: Number(r.value),
        display: r.display == null ? null : String(r.display),
        href: r.href,
      }));
    if (!this.unsorted) rows.sort((a, b) => b.value - a.value);
    return Number.isInteger(this.limit) ? rows.slice(0, this.limit) : rows;
  }

  render() {
    const rows = this._rows;
    const top = this.max ?? Math.max(0, ...rows.map((r) => r.value));
    const width = (v) => (top > 0 ? Math.max(0, Math.min(100, (v / top) * 100)) : 0);
    return html`
      <ol class="list" part="base" aria-label=${this.label || nothing}>
        ${rows.map(
          (r) => html`
            <li class="row" part="item">
              ${
                r.href
                  ? html`<a class="label" part="label" href=${r.href}>${r.label}</a>`
                  : html`<span class="label" part="label">${r.label}</span>`
              }
              <span class="value" part="value">${r.display ?? r.value}${this.unit}</span>
              <span class="track" part="track" aria-hidden="true">
                <span class="bar" part="bar" style="display: block; width: ${width(r.value)}%"></span>
              </span>
            </li>
          `,
        )}
      </ol>
    `;
  }
}
