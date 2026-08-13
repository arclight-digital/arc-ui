import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { DeclaredPropsMixin, oneOf } from '../shared/props.js';

/**
 * Long-form content container that applies typographic rhythm and styling to slotted HTML
 * elements.
 *
 * @tag arc-prose
 * @prop {'sm' | 'md' | 'lg'} size - Controls the base font size of the prose container. Affects paragraph text; headings and code maintain their own scale.
 * @slot - Default content.
 * @csspart prose
 */
export class ArcProse extends DeclaredPropsMixin(LitElement) {
  static properties = {
    size: oneOf(['sm', 'md', 'lg'], { default: 'md' }),
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: block;
        color: var(--text-secondary);
        font-family: var(--font-body);
        line-height: var(--body-lh);
      }

      /* Size variants */
      :host([size="sm"]) { font-size: var(--_text-sm); }
      :host([size="md"]), :host(:not([size="lg"]):not([size="sm"])) { font-size: var(--body-size); }
      :host([size="lg"]) { font-size: var(--_text-lg); }

      /* Direct-child block elements via ::slotted */
      ::slotted(h1) {
        font-size: var(--_text-3xl) !important;
        font-weight: var(--heading-weight) !important;
        color: var(--text-primary) !important;
        margin-top: var(--space-2xl) !important;
        margin-bottom: var(--space-md) !important;
        line-height: 1.3 !important;
      }
      ::slotted(h2) {
        font-size: var(--heading-size) !important;
        font-weight: var(--heading-weight) !important;
        color: var(--text-primary) !important;
        margin-top: var(--space-xl) !important;
        margin-bottom: var(--space-md) !important;
        line-height: 1.4 !important;
      }
      ::slotted(h3) {
        font-size: var(--_text-lg) !important;
        font-weight: 600 !important;
        color: var(--text-primary) !important;
        margin-top: var(--space-lg) !important;
        margin-bottom: var(--space-sm) !important;
      }
      ::slotted(h4) {
        font-size: var(--_text-md) !important;
        font-weight: 600 !important;
        color: var(--text-primary) !important;
        margin-top: var(--space-lg) !important;
        margin-bottom: var(--space-sm) !important;
      }
      ::slotted(p) {
        margin-bottom: var(--space-md) !important;
        text-wrap: pretty !important;
      }
      ::slotted(ul),
      ::slotted(ol) {
        margin-bottom: var(--space-md) !important;
        padding-inline-start: var(--space-lg) !important;
        color: var(--text-secondary) !important;
      }
      ::slotted(blockquote) {
        padding: var(--space-md) var(--space-lg) !important;
        margin: var(--space-lg) 0 !important;
        background: rgba(var(--accent-primary-rgb), 0.03) !important;
        border-radius: var(--radius-md) !important;
        font-style: italic !important;
        color: var(--text-muted) !important;
      }
      ::slotted(pre) {
        margin: var(--space-lg) 0 !important;
        padding: var(--space-md) !important;
        background: var(--surface-primary) !important;
        border: 1px solid var(--border-subtle) !important;
        border-radius: var(--radius-md) !important;
        overflow-x: auto !important;
        font-family: var(--font-mono) !important;
        font-size: var(--code-size) !important;
        line-height: var(--code-lh) !important;
      }
      ::slotted(hr) {
        border: none !important;
        height: 1px !important;
        background: var(--divider) !important;
        margin: var(--space-xl) 0 !important;
      }
      ::slotted(img) {
        max-width: 100% !important;
        height: auto !important;
        border-radius: var(--radius-md) !important;
        margin: var(--space-lg) 0 !important;
      }
      ::slotted(table) {
        width: 100% !important;
        border-collapse: collapse !important;
        margin: var(--space-lg) 0 !important;
        font-size: var(--_text-sm) !important;
      }
    `,
  ];

  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();
    this._injectLightStyles();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._lightStyle && this._lightStyle.parentNode) {
      this._lightStyle.remove();
    }
  }

  /**
   * Inject a scoped <style> into the light DOM for nested element styles
   * that ::slotted() cannot reach (li, a, code, strong, etc.)
   */
  _injectLightStyles() {
    if (this._lightStyle) return;

    const style = document.createElement('style');
    style.textContent = `
      arc-prose li {
        margin-bottom: 4px;
        line-height: 1.7;
      }
      arc-prose li::marker {
        color: var(--text-ghost);
      }
      arc-prose a {
        color: var(--interactive);
        text-decoration: underline;
        text-decoration-color: rgba(var(--interactive-rgb), 0.3);
        text-underline-offset: 3px;
        transition: text-decoration-color var(--transition-fast);
      }
      arc-prose a:hover {
        text-decoration-color: var(--interactive);
      }
      arc-prose code {
        font-family: var(--font-mono);
        font-size: 0.9em;
        background: var(--surface-overlay);
        padding: 2px 6px;
        border-radius: var(--radius-sm);
        color: var(--accent-primary);
      }
      arc-prose pre code {
        background: none;
        padding: 0;
        font-size: inherit;
        color: inherit;
      }
      arc-prose strong {
        color: var(--text-primary);
        font-weight: 600;
      }
      arc-prose em {
        font-style: italic;
      }
      arc-prose th,
      arc-prose td {
        padding: 8px 16px;
        text-align: start;
        border-bottom: 1px solid var(--divider);
      }
      arc-prose th {
        font-weight: 600;
        color: var(--text-primary);
      }
      arc-prose blockquote p {
        margin-bottom: 0;
      }
    `;
    this._lightStyle = style;
    this.appendChild(style);
  }

  render() {
    return html`<div class="prose" part="prose"><slot></slot></div>`;
  }
}
