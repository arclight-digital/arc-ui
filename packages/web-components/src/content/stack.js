import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * Flexbox layout component for vertical or horizontal stacking with token-based spacing.
 *
 * @tag arc-stack
 * @prop {'vertical' | 'horizontal'} direction - Flex direction — vertical is column, horizontal is row
 * @prop {'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'} gap - Gap between children, maps to --space-* tokens
 * @prop {'start' | 'center' | 'end' | 'stretch'} align - Cross-axis alignment (align-items)
 * @prop {'start' | 'center' | 'end' | 'between' | 'around'} justify - Main-axis alignment (justify-content)
 * @prop {boolean} wrap - Enable flex-wrap for responsive wrapping
 * @slot - Default content.
 */
export class ArcStack extends LitElement {
  static properties = {
    direction: { type: String, reflect: true },
    gap:       { type: String, reflect: true },
    align:     { type: String, reflect: true },
    justify:   { type: String, reflect: true },
    wrap:      { type: Boolean, reflect: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: flex;
        flex-direction: column;
        gap: var(--space-md);
        align-items: stretch;
        justify-content: flex-start;
      }

      /* Direction */
      :host([direction="horizontal"]) { flex-direction: row; }
      :host([direction="vertical"])   { flex-direction: column; }

      /* Gap */
      :host([gap="xs"])  { gap: var(--space-xs); }
      :host([gap="sm"])  { gap: var(--space-sm); }
      :host([gap="md"])  { gap: var(--space-md); }
      :host([gap="lg"])  { gap: var(--space-lg); }
      :host([gap="xl"])  { gap: var(--space-xl); }
      :host([gap="2xl"]) { gap: var(--space-2xl); }

      /* Align */
      :host([align="start"])   { align-items: flex-start; }
      :host([align="center"])  { align-items: center; }
      :host([align="end"])     { align-items: flex-end; }
      :host([align="stretch"]) { align-items: stretch; }

      /* Justify */
      :host([justify="start"])   { justify-content: flex-start; }
      :host([justify="center"])  { justify-content: center; }
      :host([justify="end"])     { justify-content: flex-end; }
      :host([justify="between"]) { justify-content: space-between; }
      :host([justify="around"])  { justify-content: space-around; }

      /* Wrap */
      :host([wrap]) { flex-wrap: wrap; }
    `,
  ];

  constructor() {
    super();
    this.direction = 'vertical';
    this.gap = 'md';
    this.align = 'stretch';
    this.justify = 'start';
    this.wrap = false;
  }

  render() {
    return html`<slot></slot>`;
  }
}
