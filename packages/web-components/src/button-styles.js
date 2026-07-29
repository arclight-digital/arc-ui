import { css } from 'lit';

/**
 * Shared button variant styles for primary / secondary / ghost.
 *
 * Each consuming component still defines:
 * - Its own default variant (Button → primary, IconButton → ghost)
 * - Its own :active transform scale
 * - Sizes, layout, and component-specific rules
 *
 * Every rule is paired with a `.btn-slot::slotted(a)` form. That covers the
 * anchor-adoption path, where a slotted `<a>` is the control instead of the
 * shadow `.btn` — see the slot detection in input/button.js. Consumers get the
 * same visual result whichever form they author, so keep the pairs in step.
 */
export const buttonVariantStyles = css`
  /* ── Primary ── */
  :host([variant="primary"]) .btn,
  :host([variant="primary"]) .btn-slot::slotted(a) {
    background: var(--interactive);
    color: var(--surface-base);
    border-color: var(--interactive);
  }
  :host([variant="primary"]) .btn:hover,
  :host([variant="primary"]) .btn-slot::slotted(a:hover) {
    box-shadow: var(--interactive-active);
  }

  /* ── Secondary ── */
  :host([variant="secondary"]) .btn,
  :host([variant="secondary"]) .btn-slot::slotted(a) {
    background: transparent;
    color: var(--text-primary);
    border-color: var(--border-default);
  }
  :host([variant="secondary"]) .btn:hover,
  :host([variant="secondary"]) .btn-slot::slotted(a:hover) {
    border-color: var(--interactive);
    color: var(--interactive);
    box-shadow: 0 0 20px rgba(var(--interactive-rgb), 0.15);
  }

  /* ── Ghost ── */
  :host([variant="ghost"]) .btn,
  :host([variant="ghost"]) .btn-slot::slotted(a) {
    background: transparent;
    color: var(--text-muted);
    border-color: transparent;
  }
  :host([variant="ghost"]) .btn:hover,
  :host([variant="ghost"]) .btn-slot::slotted(a:hover) {
    color: var(--text-primary);
    background: var(--surface-hover);
  }

  /* ── Focus ── */
  .btn:focus-visible { outline: none; box-shadow: var(--interactive-focus); }
  .btn-slot::slotted(a:focus-visible) { outline: none; box-shadow: var(--interactive-focus); }

  /* ── Disabled ── */
  :host([disabled]) .btn,
  :host([disabled]) .btn-slot::slotted(a) { opacity: 0.5; cursor: not-allowed; pointer-events: none; }
`;
