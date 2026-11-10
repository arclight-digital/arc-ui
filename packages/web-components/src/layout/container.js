import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { DeclaredPropsMixin, flag, oneOf } from '../shared/props.js';

/**
 * Max-width wrapper for page sections.
 *
 * @tag arc-container
 * @status stable
 * @prop {boolean} narrow - Caps the width at `--max-width-sm` (720px by default), the same as `size="sm"`. Applies while `size` is the default `md`; a `size` of `lg`, `xl` or `full` wins over it.
 * @prop {'sm' | 'md' | 'lg' | 'xl' | 'full'} size - Controls the maximum width.
 * @prop {'none' | 'sm' | 'md' | 'lg'} padding - Controls inline padding.
 * @slot - Default content.
 * @csspart base - The root element.
 * @csspart container
 */
export class ArcContainer extends DeclaredPropsMixin(LitElement) {
  static properties = {
    narrow: flag(false),
    size: oneOf(['sm', 'md', 'lg', 'xl', 'full'], { default: 'md' }),
    padding: oneOf(['none', 'sm', 'md', 'lg'], { default: 'md' }),
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: block; }

      .container {
        width: 100%;
        max-width: var(--max-width);
        margin-inline: auto;
        padding-inline: var(--space-lg);
      }

      :host([size="sm"]) .container { max-width: var(--max-width-sm); }
      :host([size="md"]) .container { max-width: var(--max-width); }
      /* \`size\` defaults to md and reflects, so [size="md"] is always present
         when size was left alone. narrow narrows that default only; any other
         size the author set still wins. */
      :host([narrow][size="md"]) .container { max-width: var(--max-width-sm); }
      :host([size="lg"]) .container { max-width: 1400px; }
      :host([size="xl"]) .container { max-width: 1600px; }
      :host([size="full"]) .container { max-width: none; }

      /* Padding variants */
      :host([padding="none"]) .container { padding-inline: 0; }
      :host([padding="sm"]) .container { padding-inline: var(--space-sm); }
      :host([padding="lg"]) .container { padding-inline: var(--space-xl); }
    `,
  ];

  constructor() {
    super();
  }

  render() {
    return html`<div class="container" part="base container"><slot></slot></div>`;
  }
}
