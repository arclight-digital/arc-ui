import { LitElement, nothing } from 'lit';
import { DeclaredPropsMixin, flag, list } from '../shared/props.js';

/**
 * Data-holder child element that defines a single column in the comparison grid. Renders nothing
 * visible — it provides heading, highlight, and values data to the parent.
 *
 * @tag arc-comparison-column
 * @prop {string} heading - Column header text displayed at the top of this column (e.g., "Free", "Pro").
 * @prop {boolean} highlight - When true, adds an accent background to the header and all cells in this column.
 * @prop {string[]} values - Values matching the features order. Settable as a property, or as a JSON array in markup. Use "true"/"false" for check/cross icons, or any string for text values.
 * @slot none
 */
export class ArcComparisonColumn extends DeclaredPropsMixin(LitElement) {
  static properties = {
    heading: { type: String, reflect: true },
    highlight: flag(false),
    values: list(),
  };

  constructor() {
    super();
    this.heading = '';
  }

  render() {
    return nothing;
  }
}
