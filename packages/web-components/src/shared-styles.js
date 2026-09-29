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
 * written here; see generated/host-tokens.js. A hand-maintained copy here
 * drifted from the token tree (nineteen of eighty-one values, two of them
 * visibly). Edit the tree.
 */
/**
 * Just the box-sizing reset, for components an application writes itself.
 *
 * A shadow root does not see the document's global
 * `*, *::before, *::after { box-sizing: border-box }`, so every app component
 * written with Lit needs its own. `tokenStyles` below carries one too, but it
 * also zeroes every margin and padding and adds ARC's static token layer, which
 * restyles an existing component. A consumer tried it and kept a hand-written
 * reset for that reason (test-findings #127). This is the part they asked for.
 */
export const resetStyles = css`
  *, *::before, *::after {
    box-sizing: border-box;
  }
`;

export const tokenStyles = css`
  *, *::before, *::after {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  /* Neutralise the UA stylesheet for [popover]. PositionController promotes
     floating panels to the top layer, and the UA rules for a popover include
     a solid border, padding, a canvas background and inset:0/margin:auto,
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

  /* The hidden attribute hides, on every component. A component's own
     :host display (block, flex, inline-flex…) outranked the UA's
     [hidden] { display: none }, so hiding an element the platform way did
     nothing: a filtered arc-list-item stayed on screen. :host([hidden]) is
     more specific than any bare :host, so it wins wherever it is declared,
     and it lives here once rather than in every file. */
  :host([hidden]) {
    display: none;
  }

  ${hostTouchTokens}

  /* Reduced motion, once, for every component that adopts these styles.

     This was copy-pasted verbatim into sixty-nine component files while fifteen
     animating components had no guard at all, which is the usual outcome when
     a cross-cutting rule is a convention rather than a place. Components keep
     their own blocks only for what this cannot express: scroll-behavior,
     animation-play-state, a transform that must be neutralised rather than
     shortened.

     0.01ms rather than "animation: none" on purpose. A component that removes
     itself on animationend (the exiting toast and snackbar both do) would
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
