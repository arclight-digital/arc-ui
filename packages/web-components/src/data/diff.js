import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { DeclaredPropsMixin, oneOf } from '../shared/props.js';

/**
 * Line-based text diff viewer with inline and side-by-side display modes.
 *
 * @tag arc-diff
 * @status stable
 * @prop {string} original - The original text to compare (split by newlines).
 * @prop {string} revised - The modified text to compare (split by newlines).
 * @prop {'inline' | 'side-by-side'} mode - Display mode: 'inline' renders changes in a single column, 'side-by-side' renders two panes in a grid.
 * @slot none
 * @csspart line
 * @csspart line-number
 * @csspart prefix
 * @csspart container
 */
export class ArcDiff extends DeclaredPropsMixin(LitElement) {
  static properties = {
    original: { type: String },
    revised: { type: String },
    mode: oneOf(['inline', 'side-by-side']),
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
        color: color-mix(in srgb, var(--color-success), var(--text-primary) 50%);
      }

      .diff__line--removed {
        background: rgba(var(--color-error-rgb), 0.08);
        color: color-mix(in srgb, var(--color-error), var(--text-primary) 50%);
        text-decoration: line-through;
      }

      .diff__line--unchanged {
        color: var(--text-secondary);
      }

      .diff__line-number {
        color: var(--text-ghost);
        user-select: none;
        padding-inline-end: var(--space-sm);
        text-align: end;
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
        border-inline-start: 1px solid var(--divider);
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
    this.original = '';
    this.revised = '';
    /** `{ original, revised, ops }` for the last pair diffed — see `_diffOps`. */
    this._diffMemo = null;
  }

  /**
   * The diff for the current `original`/`revised` pair, computed once per pair.
   *
   * `_computeDiff` is O(m × n) in time *and* memory — it allocates the whole
   * LCS table — and `render()` used to call it directly, so every re-render
   * paid for it again. A `mode` flip, a parent update, anything at all that
   * reached `requestUpdate` rebuilt a table for text that had not moved.
   *
   * Keyed on the two strings rather than on a dirty flag, so the memo is
   * correct whatever drives the update: reverting `revised` to a value it held
   * two renders ago is a cache miss, which is the only reading that cannot go
   * stale. This is invisible to callers by construction — same inputs, same
   * ops, and the ops array is never handed out or mutated.
   *
   * Not memoised across instances: the key would have to be the pair of full
   * texts, and holding those in a module-level cache keeps every document a
   * page has ever diffed alive for the lifetime of the tab.
   */
  _diffOps() {
    const original = this.original || '';
    const revised = this.revised || '';
    const memo = this._diffMemo;
    if (memo && memo.original === original && memo.revised === revised) return memo.ops;

    const ops = this._computeDiff(original.split('\n'), revised.split('\n'));
    this._diffMemo = { original, revised, ops };
    return ops;
  }

  /** Compute LCS-based diff of two line arrays. */
  _computeDiff(beforeLines, afterLines) {
    const m = beforeLines.length;
    const n = afterLines.length;

    // Build LCS table
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        dp[i][j] =
          beforeLines[i - 1] === afterLines[j - 1]
            ? dp[i - 1][j - 1] + 1
            : Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }

    // Backtrack to produce diff operations
    const ops = [];
    let i = m,
      j = n;
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && beforeLines[i - 1] === afterLines[j - 1]) {
        ops.push({ type: 'unchanged', text: beforeLines[i - 1], oldNum: i, newNum: j });
        i--;
        j--;
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
    const ops = this._diffOps();

    if (this.mode === 'side-by-side') {
      const removedOps = ops.filter((o) => o.type !== 'added');
      const addedOps = ops.filter((o) => o.type !== 'removed');

      return html`
        <div class="diff" part="container">
          <div class="diff__body">
            <div class="diff__pane">
              ${removedOps.map((op) => this._renderLine(op.type === 'unchanged' ? { ...op } : op))}
            </div>
            <div class="diff__pane">
              ${addedOps.map((op) => this._renderLine(op.type === 'unchanged' ? { ...op } : op))}
            </div>
          </div>
        </div>
      `;
    }

    return html`
      <div class="diff" part="container">
        <div class="diff__body">
          ${ops.map((op) => this._renderLine(op))}
        </div>
      </div>
    `;
  }
}
