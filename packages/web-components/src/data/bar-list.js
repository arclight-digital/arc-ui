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
 * @prop {Array} items - The rows, as `{ label, value, display?, href?, highlight? }` objects. `highlight: true` emphasises a row: its bar takes `--bar-list-highlight` and its label is set in bold, so the emphasis is not carried by colour alone. Set from script, a framework binding, or a JSON attribute. Rows whose value is not a finite number are dropped. `display` is the text shown for the value (e.g. "1.2k"); without it the number is shown as is, so server and client render the same text in any locale. With `href`, a row's label is a link.
 * @prop {number} max - The value a full bar stands for. Defaults to the largest value, so the top row always fills the track. Set it to compare several lists on one scale.
 * @prop {number} limit - Show at most this many rows, after sorting. Unset shows all. The rows left out are counted in a closing "N more" line, which the `more` slot replaces.
 * @prop {number} reference - A value to mark on every track with a dashed line, such as chance level, a target or a baseline. On the same scale as the bars.
 * @prop {string} referenceLabel - What the reference line is. Shown with its value beneath the list, so the marker reads as text as well as a position.
 * @prop {string} referenceDisplay - The text shown for the reference's value in that caption (e.g. "6%"), as `display` is for a row. Without it the number is shown as is, with `unit`.
 * @prop {boolean} unsorted - Keep the order the items were given in. By default rows are ranked, largest first.
 * @prop {string} unit - Text appended to each value, such as "%" or " ms".
 * @prop {string} label - Accessible name for the list, announced before its rows.
 * @slot more - Replaces the "N more" line when `limit` leaves rows out, for example with a link to the full list.
 * @csspart base - The root element: the ordered list.
 * @csspart item - One row.
 * @csspart label - A row's label, or its link.
 * @csspart value - A row's value.
 * @csspart track - The bar's full-length track.
 * @csspart bar - The bar itself. Coloured by `--bar-list-fill`; a highlighted row's bar also has the part `highlight` and takes `--bar-list-highlight`.
 * @csspart highlight - A highlighted row's bar.
 * @csspart more - The "N more" line.
 * @csspart reference - The dashed reference line.
 * @csspart reference-label - The reference's caption.
 */
export class ArcBarList extends DeclaredPropsMixin(LitElement) {
  static properties = {
    items: list(),
    max: num({ nullable: true, min: 0 }),
    limit: num({ nullable: true, min: 0, int: true }),
    unsorted: flag(false),
    unit: { type: String },
    label: { type: String },
    reference: num({ nullable: true }),
    referenceLabel: { type: String, attribute: 'reference-label' },
    referenceDisplay: { type: String, attribute: 'reference-display' },
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

      .row--highlight .label {
        color: var(--text-primary);
        font-weight: var(--label-weight);
      }

      .row--highlight .bar { background: var(--bar-list-highlight, var(--accent-secondary)); }

      .more {
        font-family: var(--font-body);
        font-size: var(--ui-size);
        color: var(--text-muted);
      }

      /* One dashed line through every track. The tracks span the full width,
         so a share of the list's width is a share of every track. */
      .body { position: relative; }
      .reference {
        position: absolute;
        top: 0;
        bottom: 0;
        border-inline-start: 1px dashed var(--text-muted);
        pointer-events: none;
      }
      .reference-label {
        margin-top: var(--space-xs);
        font-family: var(--font-body);
        font-size: var(--label-size);
        color: var(--text-muted);
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
        highlight: r.highlight === true,
      }));
    if (!this.unsorted) rows.sort((a, b) => b.value - a.value);
    return rows;
  }

  render() {
    const all = this._rows;
    const rows = Number.isInteger(this.limit) ? all.slice(0, this.limit) : all;
    const left = all.length - rows.length;
    const hasRef = this.reference != null && Number.isFinite(this.reference);
    // The top of the scale: max, else the largest bar, and never short of the
    // reference, which would otherwise be drawn off the end.
    const top = this.max ?? Math.max(0, ...rows.map((r) => r.value), hasRef ? this.reference : 0);
    const width = (v) => (top > 0 ? Math.max(0, Math.min(100, (v / top) * 100)) : 0);
    // The caption's number in the list's own format: "Random pick: 6%" beside
    // bars in percentages, not "Random pick: 0.0556" (asked for on adoption).
    const refValue = this.referenceDisplay || `${this.reference}${this.unit}`;
    const ref = hasRef ? `${this.referenceLabel || 'Reference'}: ${refValue}` : '';
    return html`
      <div class="body">
      <ol class="list" part="base" aria-label=${this.label || nothing}>
        ${rows.map(
          (r) => html`
            <li class="row ${r.highlight ? 'row--highlight' : ''}" part="item">
              ${
                r.href
                  ? html`<a class="label" part="label" href=${r.href}>${r.label}</a>`
                  : html`<span class="label" part="label">${r.label}</span>`
              }
              <span class="value" part="value">${r.display ?? r.value}${this.unit}</span>
              <span class="track" part="track" aria-hidden="true">
                ${
                  r.highlight
                    ? html`<span class="bar" part="bar highlight" style="display: block; width: ${width(r.value)}%"></span>`
                    : html`<span class="bar" part="bar" style="display: block; width: ${width(r.value)}%"></span>`
                }
              </span>
            </li>
          `,
        )}
        <li class="more" part="more" ?hidden=${left === 0}><slot name="more">${left} more</slot></li>
      </ol>
      ${
        hasRef
          ? html`<span class="reference" part="reference" aria-hidden="true" style="inset-inline-start: ${width(this.reference)}%"></span>`
          : nothing
      }
      </div>
      ${hasRef ? html`<div class="reference-label" part="reference-label">${ref}</div>` : nothing}
    `;
  }
}
