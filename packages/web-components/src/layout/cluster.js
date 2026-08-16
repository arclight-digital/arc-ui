import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { DeclaredPropsMixin, oneOf } from '../shared/props.js';

/**
 * @deprecated Since v4.0.0 — use `<arc-stack>`. `<arc-stack direction="horizontal" wrap>` is exactly this; `justify` spells the two edge values `between` and `around`. Removed in v5.
 *
 * Flex-wrap primitive for variable-width children like tags, chips, and buttons with token gap
 * spacing.
 *
 * @tag arc-cluster
 * @status deprecated
 * @arc-merged-into arc-stack
 * @prop {'xs' | 'sm' | 'md' | 'lg' | 'xl'} gap - Spacing between items, mapped to design system spacing tokens. Use sm for dense tag groups, md for button groups.
 * @prop {'start' | 'center' | 'end'} align - Vertical alignment of items within each row (maps to align-items).
 * @prop {'start' | 'center' | 'end' | 'space-between' | 'space-around'} justify - Horizontal distribution of items (maps to justify-content). Use "space-between" for navigation-style spacing.
 * @slot - Default content.
 */
export class ArcCluster extends DeclaredPropsMixin(LitElement) {
  static properties = {
    gap: oneOf(['xs', 'sm', 'md', 'lg', 'xl'], { default: 'sm' }),
    align: oneOf(['start', 'center', 'end'], { default: 'center' }),
    justify: oneOf(['start', 'center', 'end', 'space-between', 'space-around']),
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-sm);
        align-items: center;
      }

      /* Gap variants */
      :host([gap="xs"]) { gap: var(--space-xs); }
      :host([gap="sm"]) { gap: var(--space-sm); }
      :host([gap="md"]) { gap: var(--space-md); }
      :host([gap="lg"]) { gap: var(--space-lg); }
      :host([gap="xl"]) { gap: var(--space-xl); }

      /* Align variants */
      :host([align="start"])  { align-items: flex-start; }
      :host([align="center"]) { align-items: center; }
      :host([align="end"])    { align-items: flex-end; }

      /* Justify variants */
      :host([justify="start"])         { justify-content: flex-start; }
      :host([justify="center"])        { justify-content: center; }
      :host([justify="end"])           { justify-content: flex-end; }
      :host([justify="space-between"]) { justify-content: space-between; }
      :host([justify="space-around"])  { justify-content: space-around; }
    `,
  ];

  constructor() {
    super();
  }

  render() {
    return html`<slot></slot>`;
  }
}
