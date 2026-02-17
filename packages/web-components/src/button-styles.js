import { css } from 'lit';

/**
 * Shared button variant styles for primary / secondary / ghost.
 *
 * Each consuming component still defines:
 * - Its own default variant (Button → primary, IconButton → ghost)
 * - Its own :active transform scale
 * - Sizes, layout, and component-specific rules
 */
export const buttonVariantStyles = css`
  /* ── Primary ── */
  :host([variant="primary"]) .btn {
    background: var(--interactive);
    color: var(--surface-base);
    border-color: var(--interactive);
  }
  :host([variant="primary"]) .btn:hover {
    box-shadow: var(--interactive-active);
  }

  /* ── Secondary ── */
  :host([variant="secondary"]) .btn {
    background: transparent;
    color: var(--text-primary);
    border-color: var(--border-default);
  }
  :host([variant="secondary"]) .btn:hover {
    border-color: var(--interactive);
    color: var(--interactive);
    box-shadow: 0 0 20px rgba(var(--interactive-rgb), 0.15);
  }

  /* ── Ghost ── */
  :host([variant="ghost"]) .btn {
    background: transparent;
    color: var(--text-muted);
    border-color: transparent;
  }
  :host([variant="ghost"]) .btn:hover {
    color: var(--text-primary);
    background: var(--surface-hover);
  }

  /* ── Focus ── */
  .btn:focus-visible { outline: none; box-shadow: var(--interactive-focus); }

  /* ── Disabled ── */
  :host([disabled]) .btn { opacity: 0.5; cursor: not-allowed; pointer-events: none; }
`;
