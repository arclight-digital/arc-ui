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
export declare const resetStyles: import("lit").CSSResult;
export declare const tokenStyles: import("lit").CSSResult;
