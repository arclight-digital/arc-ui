import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * Padding primitive consuming spacing tokens with optional negative-margin bleed mode.
 *
 * @tag arc-inset
 * @prop {'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'} space - Padding size mapped to a design system spacing token. Controls all four sides equally.
 * @prop {boolean} bleed - When true, applies negative margins equal to the space value, allowing children to break out of a parent container's padding for full-bleed layouts.
 * @slot - Default content.
 */
export class ArcInset extends LitElement {
  static properties = {
    space: { type: String, reflect: true },
    bleed: { type: Boolean, reflect: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: block;
        padding: var(--space-md);
      }

      :host([space="xs"]) { padding: var(--space-xs); }
      :host([space="sm"]) { padding: var(--space-sm); }
      :host([space="md"]) { padding: var(--space-md); }
      :host([space="lg"]) { padding: var(--space-lg); }
      :host([space="xl"]) { padding: var(--space-xl); }
      :host([space="2xl"]) { padding: var(--space-2xl); }

      :host([bleed]) { margin: calc(-1 * var(--_pad)); }
      :host([bleed][space="xs"]) { --_pad: var(--space-xs); }
      :host([bleed][space="sm"]) { --_pad: var(--space-sm); }
      :host([bleed]:not([space])),
      :host([bleed][space="md"]) { --_pad: var(--space-md); }
      :host([bleed][space="lg"]) { --_pad: var(--space-lg); }
      :host([bleed][space="xl"]) { --_pad: var(--space-xl); }
      :host([bleed][space="2xl"]) { --_pad: var(--space-2xl); }
    `,
  ];

  constructor() {
    super();
    this.space = 'md';
    this.bleed = false;
  }

  render() {
    return html`<slot></slot>`;
  }
}
