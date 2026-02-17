import { LitElement, nothing } from 'lit';

/**
 * @tag arc-comparison-column
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
