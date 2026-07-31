import { css, unsafeCSS } from 'lit';

/**
 * Managed-panel CSS — the half of a floating panel's styling that applies once
 * PositionController has adopted it.
 *
 * The controller marks a panel `data-managed` and writes `position: fixed` plus
 * viewport coordinates inline. The pure-CSS resting rules must therefore step
 * aside: they centre a panel with `transform: translateX(-50%)`, which would
 * shift it half its width away from coordinates that already account for
 * centring. So `transform` here carries the open/closed scale animation and
 * nothing else.
 *
 * Both halves ship together — a panel is styled for whichever state it is in,
 * and which state that is depends on whether JS ran. See position-controller.js
 * for why that matters to prism's static HTML export.
 *
 * @param {string} cls - The panel class name (without dot).
 * @param {object} [opts]
 * @param {number} [opts.scale=0.95] - Scale-down value when closed (1 to disable).
 * @param {string} [opts.openCls] - Open state as a modifier class on the panel;
 *   omit to use :host([open]).
 * @param {boolean} [opts.animate=true] - Emit the open/close enter and exit
 *   animation. Pass false for panels that run their own keyframe animation, so
 *   this doesn't declare a competing `transform` on the same element.
 * @param {string} [opts.duration='var(--duration-base)'] - Animation duration.
 *   Must be a bare <duration> (--duration-*), never a --transition-* shorthand:
 *   this feeds `transition-duration`, where a `<time> <curve>` pair is invalid
 *   and computes to 0s — the panel would snap instead of animating.
 * @param {string} [opts.closedTransform] - Closed-state transform, replacing the
 *   scale. Lets a panel keep the entrance it already had (the menus slide down
 *   rather than scale) instead of every panel being normalized to one.
 */
export function managedPanelStyles(
  cls,
  {
    scale = 0.95,
    openCls,
    animate = true,
    duration = 'var(--duration-base)',
    closedTransform,
  } = {},
) {
  const c = unsafeCSS(cls);
  const s = unsafeCSS(closedTransform ?? `scale(${scale})`);
  const d = unsafeCSS(duration);
  const open = openCls
    ? css`.${c}[data-managed].${unsafeCSS(openCls)}`
    : css`:host([open]) .${c}[data-managed]`;

  // A top-layer panel is display:none while closed — that comes from the UA's
  // `[popover]:not(:popover-open)` rule, not from us — and a property cannot
  // transition out of a display:none box. Left alone, every managed panel would
  // snap open and snap shut where it used to fade.
  //
  // `display` and `overlay` in the transition list plus `allow-discrete` is what
  // buys the animation back: the discrete properties flip at the far end of the
  // transition instead of immediately, so the enter transition has a rendered
  // box to start from and the exit transition finishes painting before the panel
  // leaves the top layer. @starting-style supplies the "before" state for the
  // enter, which otherwise has no previous style to interpolate from.
  //
  // The open state is keyed on the host/modifier class rather than
  // :popover-open, because a browser without popover support still gets a
  // data-managed panel — keying on :popover-open would leave it stuck at
  // opacity 0 there.
  //
  // The curves follow the motion scale's rule (see shared/tokens.js): --ease-out
  // for something entering, --ease-in for something leaving. A transition reads
  // its timing from the *destination* state, so the closed-state rule carries the
  // exit curve and the open rule the enter curve. Both are declared explicitly
  // because transition-duration alone would leave the UA default `ease`.
  const scaleRules = animate
    ? css`
    .${c}[data-managed] {
      opacity: 0;
      transform: ${s};
      transition-property: opacity, transform, display, overlay;
      transition-duration: ${d};
      transition-timing-function: var(--ease-in);
      transition-behavior: allow-discrete;
    }
    ${open} {
      opacity: 1;
      transform: none;
      transition-timing-function: var(--ease-out);
    }
    @starting-style {
      ${open} {
        opacity: 0;
        transform: ${s};
      }
    }
  `
    : css``;

  return css`
    .${c}[data-managed] {
      /* Belt-and-braces with the inline styles: a panel promoted to the top
         layer inherits the UA's [popover] rules, whose inset:0 and margin:auto
         would centre it in the viewport if a coordinate write were ever
         missed. */
      inset: auto;
      margin: 0;
    }
    ${scaleRules}

    /* Grow out of the anchored edge, and follow a flip. data-placement is the
       side the panel actually landed on, not the one that was asked for. */
    .${c}[data-managed][data-placement='bottom'] { transform-origin: top center; }
    .${c}[data-managed][data-placement='top'] { transform-origin: bottom center; }
    .${c}[data-managed][data-placement='right'] { transform-origin: center left; }
    .${c}[data-managed][data-placement='left'] { transform-origin: center right; }
  `;
}

/**
 * Shared positioning CSS for popup/overlay panels.
 * Returns CSS rules for top/bottom/left/right positioning
 * relative to the host element.
 *
 * These are the *fallback* rules, scoped to panels PositionController has not
 * adopted: pre-upgrade, in prism's static HTML export, and anywhere JS didn't
 * run. The managed rules come along in the same stylesheet.
 *
 * @param {string} cls - The panel class name (without dot), e.g. 'popover__panel'
 * @param {object} [opts]
 * @param {string} [opts.offset='var(--space-sm)'] - CSS offset from the trigger
 * @param {number} [opts.scale=0.95] - Scale-down value when closed (1 to disable)
 * @param {string} [opts.openCls] - If set, the "open" state is a modifier class on the
 *   panel element (e.g. 'hovercard__card--visible'). If omitted, uses :host([open]).
 */
export function positionStyles(cls, { offset = 'var(--space-sm)', scale = 0.95, openCls } = {}) {
  const c = unsafeCSS(cls);
  const off = unsafeCSS(offset);
  const s = unsafeCSS(scale);

  // The default branch is selected by "not one of the other three", so one
  // selector covers an absent attribute, position="bottom", and any unrecognized
  // value. The explicit :host([position="bottom"]) branch is kept beside it so
  // prism can still infer `bottom` as a union member from the CSS.
  //
  // The invariant to preserve when touching these: the open rule must outrank the
  // closed rule for *every* value the closed rule matches. Both use the same
  // shape, so :host([open]…) is one attribute selector more specific than
  // :host(…) in each branch. Widening only the closed rule would silently invert
  // that for the values the widening adds — the panel would keep its closed
  // transform while open. Covered by the positionStyles cases in
  // test/enum-fallback-sweep.test.js, which read the stylesheet directly because
  // the components animate `transform` and a post-open read returns an
  // interpolated value rather than the resolved one.
  //
  // Two open mechanisms:
  //   1. Host attribute:  :host([open]) .panel        (popover)
  //   2. Modifier class:  .panel.panel--visible        (hover-card)
  const notOther = unsafeCSS(
    ':not([position="left"]):not([position="right"]):not([position="top"])',
  );

  // Every rule below is scoped away from controller-managed panels. The
  // :not([data-managed]) lands on both the closed and the open rule of each
  // branch, so it shifts their specificity equally and the open-outranks-closed
  // invariant above is unaffected.
  const unmanaged = unsafeCSS(':not([data-managed])');
  const p = css`${c}${unmanaged}`;
  const o = openCls ? css`${unsafeCSS(openCls)}${unmanaged}` : null;

  const openBottom = openCls
    ? css`:host(${notOther}) .${o},\n    :host([position="bottom"]) .${o}`
    : css`:host([open]${notOther}) .${p},\n    :host([open][position="bottom"]) .${p}`;

  const openTop = openCls
    ? css`:host([position="top"]) .${o}`
    : css`:host([open][position="top"]) .${p}`;

  const openLeft = openCls
    ? css`:host([position="left"]) .${o}`
    : css`:host([open][position="left"]) .${p}`;

  const openRight = openCls
    ? css`:host([position="right"]) .${o}`
    : css`:host([open][position="right"]) .${p}`;

  return css`
    :host(${notOther}) .${p},
    :host([position="bottom"]) .${p} {
      top: calc(100% + ${off});
      left: 50%;
      transform: translateX(-50%) scale(${s});
    }
    ${openBottom} {
      transform: translateX(-50%) scale(1);
    }

    :host([position="top"]) .${p} {
      bottom: calc(100% + ${off});
      left: 50%;
      transform: translateX(-50%) scale(${s});
    }
    ${openTop} {
      transform: translateX(-50%) scale(1);
    }

    :host([position="left"]) .${p} {
      right: calc(100% + ${off});
      top: 50%;
      transform: translateY(-50%) scale(${s});
    }
    ${openLeft} {
      transform: translateY(-50%) scale(1);
    }

    :host([position="right"]) .${p} {
      left: calc(100% + ${off});
      top: 50%;
      transform: translateY(-50%) scale(${s});
    }
    ${openRight} {
      transform: translateY(-50%) scale(1);
    }

    ${managedPanelStyles(cls, { scale, openCls })}
  `;
}
