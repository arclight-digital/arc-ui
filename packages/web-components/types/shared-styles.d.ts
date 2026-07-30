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
export declare const tokenStyles: import("lit").CSSResult;
