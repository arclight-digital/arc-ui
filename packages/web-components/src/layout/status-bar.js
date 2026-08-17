import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { DeclaredPropsMixin, oneOf } from '../shared/props.js';

/**
 * Bottom status bar with start, center, and end slots.
 *
 * @tag arc-status-bar
 * @status stable
 * @prop {'static' | 'fixed'} position - Controls whether the status bar flows with the document (static) or pins to the bottom of the viewport (fixed). Fixed mode sets bottom: 0, left: 0, right: 0 with z-index: 100.
 * @slot prefix - Content pinned to the inline-start edge of the bar.
 * @slot - Default content.
 * @slot suffix - Content pinned to the inline-end edge of the bar.
 * @csspart base
 * @csspart prefix
 * @csspart center
 * @csspart suffix
 */
export class ArcStatusBar extends DeclaredPropsMixin(LitElement) {
  static properties = {
    position: oneOf(['static', 'fixed']),
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: block;
        font-family: var(--font-mono);
        font-size: var(--_text-sm);
        color: var(--text-muted);
      }

      :host([position='fixed']) {
        position: fixed;
        bottom: 0;
        inset-inline-start: 0;
        inset-inline-end: 0;
        z-index: 100;
      }

      .status-bar {
        display: flex;
        align-items: center;
        height: 28px;
        padding: 0 var(--space-sm);
        background: var(--surface-base);
        border-top: 1px solid var(--divider);
        gap: var(--space-sm);
      }

      .status-bar__start {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        flex-shrink: 0;
      }

      .status-bar__center {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        flex: 1;
        justify-content: center;
      }

      .status-bar__end {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        flex-shrink: 0;
        margin-inline-start: auto;
      }
    `,
  ];

  constructor() {
    super();
  }

  render() {
    return html`
      <div class="status-bar" part="base" role="status">
        <div class="status-bar__start" part="prefix">
          <slot name="prefix"></slot>
        </div>
        <div class="status-bar__center" part="center">
          <slot></slot>
        </div>
        <div class="status-bar__end" part="suffix">
          <slot name="suffix"></slot>
        </div>
      </div>
    `;
  }
}
