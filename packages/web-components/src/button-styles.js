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

/**
 * The square icon-button box: one scale of sizes, shared.
 *
 * Split out of icon-button for the same reason buttonVariantStyles was split
 * out of button — a second component needs the identical box and had been
 * carrying its own copy of the numbers. arc-theme-toggle's icon-only form was
 * 36px at radius-full with a visible border while arc-icon-button at size="sm"
 * was 32px at radius-md with a transparent one; standing next to each other in
 * a top bar, as they do on every page of the docs, the two read as different
 * kinds of control. Numbers that must agree cannot live in two files.
 *
 * A consumer still supplies:
 * - the base `.btn` rule, including its border-radius
 * - the variant colours (buttonVariantStyles, or its own)
 * - anything the labelled, non-square form needs
 *
 * Keyed on `.btn:not(.btn--has-text)`, so a component that also has a labelled
 * form marks it with `.btn--has-text` and keeps its own sizing for that.
 */
export const iconBoxStyles = css`
  /* Circular. An icon-only control has no text to give it a reading direction,
     so a square is arbitrary about its corners in a way a circle is not; it
     also separates the bare-glyph controls from the labelled, rectangular ones
     at a glance. This is the shape arc-theme-toggle already had, now applied to
     both rather than to one of them. */
  .btn:not(.btn--has-text),
  .btn-slot::slotted(a) { border-radius: var(--radius-full); }

  .btn:not(.btn--has-text) { aspect-ratio: 1; }

  .btn:not(.btn--has-text),
  .btn-slot::slotted(a) { min-width: var(--touch-min); min-height: var(--touch-min); }

  /* The default arm is keyed on "not the others" so an unrecognised size lands
     on it rather than on no rule at all — see check-enum-fallbacks.js. The
     explicit [size="md"] selector stays so prism can infer the union. */
  :host(:not([size="lg"]):not([size="sm"]):not([size="xs"])) .btn:not(.btn--has-text),
  :host(:not([size="lg"]):not([size="sm"]):not([size="xs"])) .btn-slot::slotted(a),
  :host([size="md"]) .btn:not(.btn--has-text),
  :host([size="md"]) .btn-slot::slotted(a) { width: 36px; height: 36px; }

  :host([size="xs"]) .btn:not(.btn--has-text),
  :host([size="xs"]) .btn-slot::slotted(a) { width: 28px; height: 28px; }

  :host([size="sm"]) .btn:not(.btn--has-text),
  :host([size="sm"]) .btn-slot::slotted(a) { width: 32px; height: 32px; }

  :host([size="lg"]) .btn:not(.btn--has-text),
  :host([size="lg"]) .btn-slot::slotted(a) { width: 44px; height: 44px; }
`;
