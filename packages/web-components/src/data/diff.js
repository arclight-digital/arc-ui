import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * @tag arc-diff
 */
export class ArcDiff extends LitElement {
  static properties = {
    before: { type: String },
    after:  { type: String },
    mode:   { type: String, reflect: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: block; }

      .diff {
        font-family: var(--font-mono);
        font-size: var(--code-size);
        line-height: var(--code-lh);
        background: var(--surface-primary);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        overflow: hidden;
      }

      .diff__body {
        overflow-x: auto;
        scrollbar-width: thin;
        scrollbar-color: var(--border-default) transparent;
      }

      .diff__line {
        display: flex;
        padding: 1px var(--space-md);
      }

      .diff__line--added {
        background: rgba(var(--color-success-rgb), 0.08);
        color: var(--color-success);
      }

      .diff__line--removed {
        background: rgba(var(--color-error-rgb), 0.08);
        color: var(--color-error);
        text-decoration: line-through;
        opacity: 0.7;
      }

      .diff__line--unchanged {
        color: var(--text-secondary);
      }

      .diff__line-number {
        color: var(--text-ghost);
        user-select: none;
        padding-right: var(--space-sm);
        text-align: right;
        min-width: 3ch;
        flex-shrink: 0;
      }

      .diff__prefix {
        color: var(--text-ghost);
        width: 2ch;
        flex-shrink: 0;
        user-select: none;
      }

      .diff__content {
        white-space: pre;
        flex: 1;
        min-width: 0;
      }

      /* Side-by-side mode */
      :host([mode="side-by-side"]) .diff__body {
        display: grid;
        grid-template-columns: 1fr 1fr;
      }

      :host([mode="side-by-side"]) .diff__pane + .diff__pane {
        border-left: 1px solid var(--divider);
      }

      @media (prefers-reduced-motion: reduce) {
        :host {
          transition: none;
        }
      }
    `,
  ];

  constructor() {
    super();
    this.before = '';
    this.after = '';
    this.mode = 'inline';
  }

  /** Compute LCS-based diff of two line arrays. */
  _computeDiff(beforeLines, afterLines) {
    const m = beforeLines.length;
    const n = afterLines.length;

    // Build LCS table
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        dp[i][j] = beforeLines[i - 1] === afterLines[j - 1]
          ? dp[i - 1][j - 1] + 1
          : Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }

    // Backtrack to produce diff operations
    const ops = [];
    let i = m, j = n;
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && beforeLines[i - 1] === afterLines[j - 1]) {
        ops.push({ type: 'unchanged', text: beforeLines[i - 1], oldNum: i, newNum: j });
        i--; j--;
      } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
        ops.push({ type: 'added', text: afterLines[j - 1], newNum: j });
        j--;
      } else {
        ops.push({ type: 'removed', text: beforeLines[i - 1], oldNum: i });
        i--;
      }
    }
    return ops.reverse();
  }

  _renderLine(op) {
    const prefix = op.type === 'added' ? '+' : op.type === 'removed' ? '-' : ' ';
    const lineNum = op.type === 'removed' ? op.oldNum : op.newNum;
    const cls = `diff__line diff__line--${op.type}`;

    return html`
      <div class="${cls}" part="line">
        <span class="diff__line-number" part="line-number">${lineNum}</span>
        <span class="diff__prefix" part="prefix">${prefix}</span>
        <span class="diff__content">${op.text}</span>
      </div>
    `;
  }

  render() {
    const beforeLines = (this.before || '').split('\n');
    const afterLines = (this.after || '').split('\n');
    const ops = this._computeDiff(beforeLines, afterLines);

    if (this.mode === 'side-by-side') {
      const removedOps = ops.filter(o => o.type !== 'added');
      const addedOps = ops.filter(o => o.type !== 'removed');

      return html`
        <div class="diff" part="container">
          <div class="diff__body">
            <div class="diff__pane">
              ${removedOps.map(op => this._renderLine(
                op.type === 'unchanged' ? { ...op } : op
              ))}
            </div>
            <div class="diff__pane">
              ${addedOps.map(op => this._renderLine(
                op.type === 'unchanged' ? { ...op } : op
              ))}
            </div>
          </div>
        </div>
      `;
    }

    return html`
      <div class="diff" part="container">
        <div class="diff__body">
          ${ops.map(op => this._renderLine(op))}
        </div>
      </div>
    `;
  }
}
