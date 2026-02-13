import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * @arc-prism hybrid — display works without JS; copy-to-clipboard requires JS
 */
export class ArcCodeBlock extends LitElement {
  static properties = {
    language: { type: String, reflect: true },
    filename: { type: String },
    code:     { type: String },
    _copied:  { state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: block; }

      .code-block {
        background: var(--bg-surface);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-lg);
        overflow: hidden;
      }

      .code-block__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--space-xs) var(--space-md);
        border-bottom: 1px solid var(--border-subtle);
        background: var(--bg-card);
      }

      .code-block__filename {
        font-family: var(--font-mono);
        font-size: var(--text-sm);
        color: var(--text-muted);
      }

      .code-block__lang {
        font-family: var(--font-accent);
        font-size: var(--text-xs);
        letter-spacing: 2px;
        text-transform: uppercase;
        color: var(--text-ghost);
      }

      .code-block__copy {
        display: flex;
        align-items: center;
        gap: var(--space-xs);
        background: none;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        color: var(--text-muted);
        font-family: var(--font-accent);
        font-size: var(--text-xs);
        letter-spacing: 1px;
        text-transform: uppercase;
        padding: var(--space-xs) var(--space-sm);
        cursor: pointer;
        transition: color var(--transition-fast), border-color var(--transition-fast);
      }

      .code-block__copy:hover {
        color: var(--text-primary);
        border-color: var(--border-bright);
      }

      .code-block__copy[data-copied] {
        color: var(--color-success);
        border-color: var(--color-success);
      }

      .code-block__body {
        padding: var(--space-md);
        overflow-x: auto;
      }

      .code-block__pre {
        margin: 0;
        font-family: var(--font-mono);
        font-size: var(--code-size);
        line-height: var(--code-lh);
        color: var(--text-primary);
        white-space: pre;
        tab-size: 2;
      }

      @media (prefers-reduced-motion: reduce) {
        :host *,
        :host *::before,
        :host *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      }
    `,
  ];

  constructor() {
    super();
    this.language = '';
    this.filename = '';
    this.code = '';
    this._copied = false;
    this._copyTimer = null;
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._copyTimer) clearTimeout(this._copyTimer);
  }

  async _copy() {
    const text = this.code || '';
    try {
      await navigator.clipboard.writeText(text);
      this._copied = true;
      if (this._copyTimer) clearTimeout(this._copyTimer);
      this._copyTimer = setTimeout(() => { this._copied = false; this._copyTimer = null; }, 2000);
    } catch {
      // Copy failed — requires secure context (HTTPS) or user gesture
    }
  }

  render() {
    return html`
      <div class="code-block" part="code-block">
        <div class="code-block__header" part="header">
          <span class="code-block__filename" part="filename">${this.filename || ''}</span>
          <span class="code-block__lang" part="lang">${this.language}</span>
          <button
            class="code-block__copy"
            ?data-copied=${this._copied}
            @click=${this._copy}
            aria-label=${this._copied ? 'Copied to clipboard' : 'Copy code'}
            part="copy"
          >${this._copied ? 'Copied' : 'Copy'}</button>
        </div>
        <div class="code-block__body" part="body">
          <pre class="code-block__pre" part="pre"><code part="code"><slot>${this.code}</slot></code></pre>
        </div>
      </div>
    `;
  }
}

customElements.define('arc-code-block', ArcCodeBlock);
