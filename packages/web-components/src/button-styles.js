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
    background: var(--accent-primary);
    color: var(--bg-deep);
    border-color: var(--accent-primary);
  }
  :host([variant="primary"]) .btn:hover {
    box-shadow: var(--glow-primary);
  }

  /* ── Secondary ── */
  :host([variant="secondary"]) .btn {
    background: transparent;
    color: var(--text-primary);
    border-color: var(--border-default);
  }
  :host([variant="secondary"]) .btn:hover {
    border-color: var(--accent-primary);
    color: var(--accent-primary);
    box-shadow: 0 0 20px var(--accent-primary-ring);
  }

  /* ── Ghost ── */
  :host([variant="ghost"]) .btn {
    background: transparent;
    color: var(--text-muted);
    border-color: transparent;
  }
  :host([variant="ghost"]) .btn:hover {
    color: var(--text-primary);
    background: var(--bg-hover);
  }

  /* ── Focus ── */
  .btn:focus-visible { outline: none; box-shadow: var(--focus-glow); }

  /* ── Disabled ── */
  :host([disabled]) .btn { opacity: 0.4; cursor: not-allowed; pointer-events: none; }
`;
