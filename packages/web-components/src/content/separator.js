import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { DeclaredPropsMixin, oneOf } from '../shared/props.js';

/**
 * Visual divider for separating content sections. Supports horizontal and vertical orientations,
 * multiple line styles, and optional inline labels.
 *
 * @tag arc-separator
 * @status stable
 * @prop {'horizontal' | 'vertical'} orientation - Controls the divider direction. Vertical separators display as inline-flex with full parent height.
 * @prop {string} label - Optional text displayed centered between two line segments. Only applies to horizontal orientation.
 * @prop {'line' | 'dashed' | 'dotted' | 'fade'} variant - Controls the line style. Fade uses a gradient that tapers to transparent at both ends.
 * @slot none
 * @csspart separator
 * @csspart line
 * @csspart label
 */
export class ArcSeparator extends DeclaredPropsMixin(LitElement) {
  static properties = {
    orientation: oneOf(['horizontal', 'vertical']),
    label: { type: String },
    variant: oneOf(['line', 'dashed', 'dotted', 'fade']),
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: block;
        width: 100%;
      }

      :host([orientation="vertical"]) {
        display: inline-flex;
        width: auto;
        height: 100%;
      }

      .separator {
        width: 100%;
        height: 1px;
        background: var(--border-default);
      }

      :host([variant="dashed"]) .separator {
        background: none;
        border-top: 1px dashed var(--border-default);
        height: 0;
      }

      :host([variant="dotted"]) .separator {
        background: none;
        border-top: 1px dotted var(--border-default);
        height: 0;
      }

      :host([variant="fade"]) .separator {
        background: linear-gradient(90deg, transparent, var(--border-default), transparent);
      }

      /* Vertical */
      :host([orientation="vertical"]) .separator {
        width: 1px;
        height: 100%;
        background: var(--border-default);
      }

      :host([orientation="vertical"][variant="dashed"]) .separator {
        background: none;
        border-top: none;
        border-inline-start: 1px dashed var(--border-default);
        width: 0;
      }

      :host([orientation="vertical"][variant="dotted"]) .separator {
        background: none;
        border-top: none;
        border-inline-start: 1px dotted var(--border-default);
        width: 0;
      }

      :host([orientation="vertical"][variant="fade"]) .separator {
        background: linear-gradient(180deg, transparent, var(--border-default), transparent);
      }

      /* Labeled */
      .separator--labeled {
        display: flex;
        align-items: center;
        gap: var(--space-md);
        height: auto;
        background: none;
        border: none;
      }

      .separator__line {
        flex: 1;
        height: 1px;
        background: var(--border-default);
      }

      :host([variant="dashed"]) .separator__line {
        background: none;
        border-top: 1px dashed var(--border-default);
        height: 0;
      }

      :host([variant="dotted"]) .separator__line {
        background: none;
        border-top: 1px dotted var(--border-default);
        height: 0;
      }

      :host([variant="fade"]) .separator__line:first-child {
        background: linear-gradient(90deg, transparent, var(--border-default));
      }

      :host([variant="fade"]) .separator__line:last-child {
        background: linear-gradient(90deg, var(--border-default), transparent);
      }

      .separator__label {
        font-family: var(--font-body);
        font-size: var(--_text-sm);
        color: var(--text-muted);
        white-space: nowrap;
        flex-shrink: 0;
        user-select: none;
      }
    `,
  ];

  constructor() {
    super();
    this.label = '';
  }

  render() {
    const vertical = this.orientation === 'vertical';

    if (this.label && !vertical) {
      return html`
        <div class="separator separator--labeled" role="separator" part="separator">
          <span class="separator__line" part="line"></span>
          <span class="separator__label" part="label">${this.label}</span>
          <span class="separator__line" part="line"></span>
        </div>
      `;
    }

    return html`
      <div
        class="separator"
        role="separator"
        aria-orientation=${vertical ? 'vertical' : 'horizontal'}
        part="separator"
      ></div>
    `;
  }
}
