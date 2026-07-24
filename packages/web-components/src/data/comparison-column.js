import { LitElement, nothing } from 'lit';

/**
 * Data-holder child element that defines a single column in the comparison grid. Renders nothing
 * visible — it provides heading, highlight, and values data to the parent.
 *
 * @tag arc-comparison-column
 * @prop {string} heading - Column header text displayed at the top of this column (e.g., "Free", "Pro").
 * @prop {boolean} highlight - When true, adds an accent background to the header and all cells in this column.
 * @prop {string} values - JSON array of values matching the features order. Use "true"/"false" for check/cross icons, or any string for text values.
 */
export class ArcComparisonColumn extends LitElement {
  static properties = {
    heading:   { type: String, reflect: true },
    highlight: { type: Boolean, reflect: true },
    values:    { type: String },
  };

  constructor() {
    super();
    this.heading = '';
    this.highlight = false;
    this.values = '[]';
  }

  render() {
    return nothing;
  }
}
