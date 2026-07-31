import { css } from 'lit';
import { hostTokens, hostTouchTokens } from './generated/host-tokens.js';

/**
 * Shared CSS custom properties injected into every ARC UI component's shadow DOM.
 *
 * Theme-sensitive tokens (colors, gradients, glows, shadows) are NOT set here.
 * They inherit from base.css on the document root, which handles
 * dark/light/auto themes and .theme-fixed overrides.
 *
 * Only static tokens (typography, spacing, radii, transitions, layout) live here
 * as fallback defaults, and they are GENERATED from shared/tokens.js rather than
 * written here — see generated/host-tokens.js. This block used to be a second,
 * hand-maintained copy of values that also live in the token tree, and nineteen
 * of the eighty-one had drifted apart, two of them visibly. Edit the tree.
 */
export const tokenStyles = css`
  *, *::before, *::after {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  /* Neutralise the UA stylesheet for [popover]. PositionController promotes
     floating panels to the top layer, and the UA rules for a popover include
     a solid border, padding, a canvas background and inset:0/margin:auto —
     enough to inflate a measured panel by 14px and to paint a border no
     component asked for. :where() keeps this at zero specificity so it beats
     the UA origin but loses to every rule a component writes for itself. */
  :where([popover]) {
    border: 0;
    padding: 0;
    margin: 0;
    inset: auto;
    width: auto;
    height: auto;
    background: none;
    color: inherit;
    overflow: visible;
  }

  :host {
    transition: opacity var(--transition-fast);

    ${hostTokens}
  }

  ${hostTouchTokens}

  /* Reduced motion, once, for every component that adopts these styles.

     This was copy-pasted verbatim into sixty-nine component files while fifteen
     animating components had no guard at all — which is the usual outcome when
     a cross-cutting rule is a convention rather than a place. Components keep
     their own blocks only for what this cannot express: scroll-behavior,
     animation-play-state, a transform that must be neutralised rather than
     shortened.

     0.01ms rather than "animation: none" on purpose. A component that removes
     itself on animationend — the exiting toast and snackbar both do — would
     wait forever for an event that a canceled animation never fires. A
     duration this short is imperceptible and still completes. */
  @media (prefers-reduced-motion: reduce) {
    :host *,
    :host *::before,
    :host *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
`;
