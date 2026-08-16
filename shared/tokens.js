/**
 * Arclight Design Tokens
 * Single source of truth — extracted from arclight.build
 */

/* ────────────────────────────────────────────────────────────────────────────
 * Motion, as two scales that the `transition` tokens compose.
 *
 * The curve carries the meaning, not the duration:
 *
 *   standard — a state change on an element that stays put: a hover recolor, a
 *     border shift. Symmetric, because nothing is arriving or leaving.
 *   out — something entering or expanding. Covers most of its distance
 *     immediately and settles, which is what makes an entrance read as already
 *     having been on its way rather than starting when you looked at it.
 *   in — the mirror, for something leaving. Paired with a shorter duration:
 *     an exit the user has already decided on should not have to be re-watched.
 *   spring — a slight overshoot, reserved for a control confirming a discrete
 *     action (a toggle landing, a checkbox filling). Motivated motion only.
 *
 * Before this, all three transition tokens ended in the CSS keyword `ease` —
 * the browser default — across 356 uses, while the two curves the tree already
 * published were spelled four times in the entire component library.
 * ──────────────────────────────────────────────────────────────────────────── */
const duration = {
  fast: '120ms',
  base: '200ms',
  slow: '400ms',
  enter: '500ms',
  exit: '300ms',
};

const easing = {
  standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
  out: 'cubic-bezier(0.16, 1, 0.3, 1)',
  in: 'cubic-bezier(0.7, 0, 0.84, 0)',
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
};

import {
  solveMixPercent,
  solveContrast,
  composite,
  contrast,
  parseColor,
  formatRgb,
  oklchToRgb,
  rgbToOklch,
} from './color.js';

export const tokens = {
  /* ── Backgrounds ── */
  color: {
    bgDeep: 'rgb(3, 3, 7)',
    bgSurface: 'rgb(10, 10, 15)',
    bgBase: 'rgb(10, 10, 15)',
    bgCard: 'rgb(13, 13, 18)',
    bgElevated: 'rgb(17, 17, 22)',

    /* Text */
    textPrimary: 'rgb(232, 232, 236)',
    textSecondary: 'rgb(150, 152, 162)',
    textMuted: 'rgb(142, 142, 155)',
    textGhost: 'rgb(133, 133, 154)',

    /* Borders */
    borderSubtle: 'rgb(24, 24, 30)',
    borderDefault: 'rgb(34, 34, 41)',
    borderBright: 'rgb(51, 51, 64)',

    /* Accent */
    accentPrimary: 'rgb(77, 126, 247)',
    accentSecondary: 'rgb(139, 92, 246)',

    /* Feedback */
    success: 'rgb(52, 211, 153)',
    error: 'rgb(239, 68, 68)',
    warning: 'rgb(245, 158, 11)',
    info: 'rgb(59, 130, 246)',

    /* Chart series — categorical palette, fixed order, never cycled.
       Validated (OKLCH lightness band, chroma floor, CVD adjacent-pair
       separation, ≥3:1 contrast) against bg-card in both themes.
       Status colors (success/error/warning/info) are reserved for state
       and must not be used as extra series. */
    chart1: '#4d7ef7',
    chart2: '#ea580c',
    chart3: '#0d9488',
    chart4: '#8b5cf6',
    chart5: '#db2777',
    chart6: '#65a30d',
  },

  /* RGB channels (for alpha compositing) */
  rgb: {
    accentPrimary: '77, 126, 247',
    accentSecondary: '139, 92, 246',
    textPrimary: '232, 232, 236',
    textMuted: '142, 142, 155',
    error: '239, 68, 68',
    success: '52, 211, 153',
    warning: '245, 158, 11',
    info: '59, 130, 246',
    white: '255, 255, 255',
    black: '0, 0, 0',
  },

  /* ── Typography ──
   *
   * Fonts are role slots, not typefaces. ARC UI ships no font files: each role
   * names a reference face and composes it with a fallback stack, so assigning
   * your own typeface means overriding one `--font-<role>-family` token and
   * inheriting every decision that sits around it.
   *
   * The roles are drawn from how the library actually uses them:
   *   text    — prose, inputs, descriptions, headings. The default for everything.
   *   label   — form labels, table headers, eyebrows. Small, uppercase, tracked.
   *   mono    — code, keyboard hints, and tabular numerics.
   *   display — large headings. Follows `text` until assigned separately.
   *   quote   — the decorative glyph on arc-blockquote.
   *
   * Each role carries a weight alongside its family. A face assigned to a role
   * does not necessarily ship the weight the role is used at — plenty of display
   * faces have no semibold, and the label role is set at 600 in fifty-odd
   * components — so the weight has to be adjustable at the role, not compiled
   * into each component. Values below are the weights those roles are already
   * used at, so assigning nothing changes nothing.
   */
  font: {
    body: { family: "'Host Grotesk'", fallback: 'system-ui, sans-serif', weight: 500 },
    // Proportional, so the fallback is a UI sans rather than the mono stack the
    // role carried while Azeret held it — falling back from a proportional face
    // to a monospace changes the width of every label on the page.
    label: {
      family: "'Tomorrow'",
      fallback: 'system-ui, -apple-system, Segoe UI, sans-serif',
      weight: 600,
    },
    mono: { family: "'JetBrains Mono'", fallback: 'ui-monospace, monospace', weight: 400 },
    quote: { family: 'Georgia', fallback: 'serif', weight: 200 },
    // display has no family of its own — it follows body until assigned — but
    // it does have its own weight, since large type usually wants a different
    // one from body text even when it is the same face.
    display: { weight: 500 },
  },

  /**
   * Type sizes, emitted as `--text-*`.
   *
   * **`--text-*` deliberately carries two kinds of thing**, and it is the only
   * prefix in the tree that does: `--text-md` is a size from here, while
   * `--text-primary` is a foreground color from `color` below. Reading
   * base.css that looks like an inconsistency; it is load-bearing. The class
   * name in the utility layer *is* the token name, so `.arc-text-md` sizes and
   * `.arc-text-primary` colors, and both read the variable a consumer would
   * override.
   *
   * That only works while the two key sets stay disjoint **by shape** — sizes
   * are scale steps (`xs`, `md`, `2xl`), colors are semantic words
   * (`primary`, `muted`). Adding a color called `md`, or a size called
   * `primary`, breaks it. `shared/utilities.js` asserts both directions and
   * fails the build, so this is a rule with a check behind it rather than a
   * convention to remember.
   *
   * The entries below the scale — `heading`, `body`, `wordmark` and friends —
   * are for components to describe their own roles. They are deliberately not
   * exposed as utilities: a consumer reaching for `.arc-text-heading` is
   * reaching past the component for something it already decides.
   */
  fontSize: {
    xs: '12px',
    sm: '16px',
    md: '17px',
    lg: 'clamp(18px, 1.5vw, 20px)',
    xl: 'clamp(22px, 2.5vw, 26px)',
    '2xl': 'clamp(28px, 3vw, 36px)',
    '3xl': 'clamp(36px, 5vw, 52px)',
    displayXl: 'var(--text-3xl)',
    heading: 'var(--text-xl)',
    body: 'var(--text-md)',
    wordmark: 'clamp(20px, 2.5vw, 28px)',
    /* The uppercase tracked label — a form label, a table header, an eyebrow
       over a section. One treatment, and until this entry existed it was
       written out by hand in some fifty components: 12px, the label role's
       weight, uppercase, tracked. `sectionTitle` below is the name that
       shipped for it first and now points here rather than restating it. */
    label: 'var(--text-xs)',
    /* The figure itself, at the size arc-clock and arc-countdown-timer had
       independently arrived at — the same clamp, character for character, in
       two files with no name between them. arc-stat's is deliberately larger
       and stays its own; this names the step two components already shared. */
    numeral: 'clamp(24px, 3vw, 36px)',
    sectionTitle: 'var(--label-size)',
    uiAccent: '16px',
    code: '14px',
    // 10px, not var(--text-xs) (12px). The two sources disagreed: shared-styles
    // declared 10px on :host, which shadows :root, so web-component consumers
    // saw 10px while the standalone CSS build — which has no shadow root and
    // read this token — saw 12px. Same component, two label sizes depending on
    // which package you installed. Settled on 10px because that is what the
    // canonical Lit components have been rendering; if 12px was the intent, this
    // is the one line to change.
    labelInline: '10px',
  },

  /* Context weights, derived from the role weights above rather than restated.
     Overriding --font-label-weight has to move every label-role context with
     it, or the role knob only reaches half of what wears the role. Same rule as
     the gradients and focus rings: compound tokens reference base tokens. */
  fontWeight: {
    displayXl: 'var(--font-display-weight)',
    heading: 'var(--font-display-weight)',
    body: 'var(--font-body-weight)',
    wordmark: 'var(--font-display-weight)',
    label: 'var(--font-label-weight)',
    sectionTitle: 'var(--label-weight)',
    uiAccent: 'var(--font-label-weight)',
    /* The large figure a stat, a clock, a countdown or a gauge displays.
       Light on purpose — a 48px number at the body weight reads as shouting —
       and its own context because the four components that draw one had it
       written out at 200 three times and 300 once, which is a difference
       nobody chose and nobody can see until two of them share a dashboard. */
    numeral: 200,
    /* Field text: what the user typed, in the four text inputs. Its own context
       rather than the body weight, because a form value wants the weight a
       native input has (400) and body prose here is 500. Before this it was
       hardcoded three different ways — 300 in arc-input, 400 in arc-select and
       arc-textarea, 500 in arc-number-input — for the same kind of text. */
    field: 400,
  },

  letterSpacing: {
    displayXl: '-1px',
    // Label-role tracking follows the face. A monospace carries its own
    // letter-fitting, so while Azeret held the role these sat near zero
    // (1px/0px) and the wide Tektur-era values (4px/1px/3px) read as gappy.
    // Tomorrow is proportional and set tight, so small caps need the tracking
    // back — short of Tektur's, which was compensating for a wider face.
    //
    // That decision reached this file and stopped there. The tree carried the
    // same uppercase label at four trackings — 2px, 1.5px, 1px and 0.08em —
    // and the two spellings this comment names as retired are exactly the ones
    // still in it: 1px is the Azeret-era value, 3px and 4px are Tektur's. The
    // style pass pointed all of them here.
    label: '2px',
    sectionTitle: 'var(--label-spacing)',
    uiAccent: '0.5px',
    wordmark: 'clamp(8px, 1.2vw, 14px)',
    // Was spelled only in the :root template and in shared-styles.js, never in
    // the tree — so the generated :host layer had no way to know about it.
    labelInline: '0.75px',
  },

  /* Leading, by what the box holds.
   *
   * Three of these are new, and the reason is the census that produced them:
   * the tree shipped three line-heights and the components used ten. `body`,
   * `code` and `heading` covered display type and prose and named nothing for
   * the two most common boxes in a component library —
   *
   *   `glyph`  a box whose whole content is one mark: an icon, a badge, a
   *            counter, a kbd cap. Leading has to add nothing or the box grows
   *            taller than the mark and stops centring. Twenty-four components
   *            wrote `line-height: 1`.
   *   `ui`     running text inside a control: a field, a list row, a menu item,
   *            a table cell, a label. Thirty components wrote this one, twenty
   *            at 1.4 and ten at 1.5 — 1.7px apart on a 17px face, invisible in
   *            any one component and plainly uneven in a form that uses four.
   *
   * The uppercase tracked label has no leading of its own: it is the same text
   * at a smaller size, so it reads `ui` like everything else in a control.
   */
  lineHeight: {
    glyph: 1,
    ui: 1.4,
    body: 1.7,
    code: 1.8,
    heading: 1.2,
  },

  /* ── Spacing ── */
  space: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '40px',
    '2xl': '64px',
    '3xl': '96px',
    '4xl': '128px',
  },

  /* ── Radii ── */
  radius: {
    // Four components read --radius-xs (breadcrumb, link, notification-panel)
    // and the scale had no such step, so the declaration was invalid at
    // computed-value time and those corners rendered square.
    xs: '2px',
    sm: '4px',
    md: '10px',
    lg: '14px',
    xl: '20px',
    full: '9999px',
  },

  /* ── Transitions ──
     Duration and curve composed into the one shorthand a component writes.

     Composed with var(), same rule as the gradients and glows: compound tokens
     reference base tokens, so overriding --duration-base or --ease-standard at
     :root retunes every shorthand with it. That works because --ease-* and
     --duration-* are forwarded by the :where(arc-*) rule in base.css — the
     :host copies yield to the inherited :root value — and the shorthands
     themselves are forwarded too, so the reference resolves on the element
     against whatever the page declares. */
  transition: {
    fast: 'var(--duration-fast) var(--ease-standard)',
    base: 'var(--duration-base) var(--ease-standard)',
    slow: 'var(--duration-slow) var(--ease-standard)',
    enter: 'var(--duration-enter) var(--ease-out)',
    exit: 'var(--duration-exit) var(--ease-in)',
  },

  /* ── Motion ── see the scales above the tree for what each curve is for. */
  easing,
  duration,

  /* ── Shadows ── */
  shadow: {
    xs: '0 1px 2px rgba(0, 0, 0, 0.2)',
    sm: '0 2px 4px rgba(0, 0, 0, 0.2), 0 1px 2px rgba(0, 0, 0, 0.15)',
    md: '0 4px 12px rgba(0, 0, 0, 0.25), 0 2px 4px rgba(0, 0, 0, 0.15)',
    lg: '0 8px 24px rgba(0, 0, 0, 0.3), 0 4px 8px rgba(0, 0, 0, 0.15)',
    xl: '0 16px 48px rgba(0, 0, 0, 0.35), 0 8px 16px rgba(0, 0, 0, 0.15)',
    overlay: '0 8px 32px rgba(0, 0, 0, 0.4)',
    inset: 'inset 0 1px 3px rgba(0, 0, 0, 0.25)',
  },

  /* ── Z-Index ── */
  zIndex: {
    base: 0,
    dropdown: 1000,
    tooltip: 1100,
    overlay: 1200,
    modal: 1300,
    toast: 1400,
    max: 9999,
  },

  /* ── Breakpoints ── */
  breakpoint: {
    xs: '480px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
    /**
     * The width at which the primary navigation collapses to a hamburger.
     *
     * Deliberately off the xs–2xl scale: it is not a layout step, it is the
     * point where the nav stops fitting, which depends on how many top-level
     * items there are rather than on any device class.
     *
     * It was written out four times — a media query in arc-top-bar, another in
     * arc-navigation-menu, a window.innerWidth comparison in the same file, and
     * arc-app-shell's `breakpoint` default. They have to agree: move one and
     * you get two hamburgers at once or none at all. A media query cannot read
     * a CSS custom property, so the shared value has to reach the components as
     * a build-time constant — see scripts/generate/breakpoints.js.
     */
    navCollapse: '900px',
  },

  /* ── Opacity ── */
  opacity: {
    disabled: 0.5,
    muted: 0.6,
    hover: 0.8,
    visible: 1,
  },

  /* ── Interactive ── */
  touch: {
    min: '24px',
    pad: '4px',
    mobileMin: '36px',
    mobilePad: '8px',
  },

  /* ── Layout ── */
  layout: {
    maxWidth: '1120px',
    maxWidthSm: '720px',
    navHeight: '64px',
    /**
     * Inline inset from a highlighted navigation row's edge to its content.
     *
     * Every component that paints a selectable row — the sidebar link, the
     * scroll-spy entry — reads this rather than reaching for a spacing step
     * directly. Those two drifted to 4px and 8px, which is invisible in either
     * one alone and obvious the moment both are on screen, as they are on every
     * docs page. A shared name is what makes the two *have* to agree; a lint
     * pass over "is this padding consistent" has no invariant to check.
     *
     * A composition on purpose, so overriding --space-sm moves the whole scale
     * with it rather than leaving this one value behind.
     *
     * Forwarded like any other :host token (only shadow-private compositions
     * are held back), so both knobs work from :root: --space-sm moves the whole
     * scale, and `:root { --nav-row-inset: 20px }` moves just the rows.
     */
    navRowInset: 'var(--space-sm)',
  },

  /* ── Gradients ──
   *
   * Never the `transparent` keyword in a stop list. It is `rgba(0, 0, 0, 0)` —
   * transparent *black* — so a stop fading to it darkens on the way out
   * instead of thinning, and where the gradient meets its element's box you
   * get a visible edge rather than nothing. Every fade-out is the adjacent
   * stop's own color at zero alpha.
   *
   * This was invisible for as long as every surface was near-black, which is
   * the same thing the fade was drifting toward. The softened schemes put a
   * divider and a page wash on a navy ground and the cuts showed up as hard
   * rectangles — first noticed under the footer wordmark, where two of these
   * overlap. `check gradient-stops` fails the build on a bare keyword.
   */
  gradient: {
    displayText: 'linear-gradient(135deg, rgb(232, 232, 236) 0%, rgb(124, 124, 137) 100%)',
    accentText: 'linear-gradient(90deg, rgb(77, 126, 247), rgb(139, 92, 246))',
    divider: 'linear-gradient(90deg, rgba(24, 24, 30, 0), rgb(24, 24, 30), rgba(24, 24, 30, 0))',
    dividerGlow:
      'linear-gradient(90deg, rgba(var(--accent-primary-rgb),0), rgba(var(--accent-primary-rgb),0.2), rgba(var(--accent-secondary-rgb),0.12), rgba(var(--accent-secondary-rgb),0))',
  },

  /* ── Glow (box-shadow presets) ── */
  glow: {
    white:
      '0 0 6px rgba(var(--text-primary-rgb),0.6), 0 0 18px rgba(var(--text-primary-rgb),0.25), 0 0 40px rgba(var(--text-primary-rgb),0.1)',
    primary:
      '0 0 8px rgba(var(--accent-primary-rgb),0.9), 0 0 20px rgba(var(--accent-primary-rgb),0.5), 0 0 44px rgba(var(--accent-primary-rgb),0.25), 0 0 80px rgba(var(--accent-primary-rgb),0.1)',
    secondary:
      '0 0 8px rgba(var(--accent-secondary-rgb),0.9), 0 0 20px rgba(var(--accent-secondary-rgb),0.5), 0 0 44px rgba(var(--accent-secondary-rgb),0.25), 0 0 80px rgba(var(--accent-secondary-rgb),0.1)',
  },

  /* ── Glow scale ──
     Three accent steps, for the emphasis a component adds on hover, on an
     active item, on a selected cell. Distinct from the `glow` block above,
     which is display work — a wordmark, a hero rule — at alphas no interface
     surface should carry.

     The values are not new. Sixty-two hand-written glows were counted across
     the components against five uses of the published tokens, and these three
     are the clusters that census found, kept at their exact existing values so
     adopting them changes nothing on screen. The scale exists so the sixty-third
     has something to reach for; that is the whole job of it.

     Elevation, for contrast, needed nothing: the same census found two
     hand-written cast shadows in the entire library against a hundred and
     seventy-seven token uses. The shadow scale was already doing its job.

     ── What hover does, and why it is two rules rather than one ──

     A surface — a badge, a tag, a toolbar button, a table checkbox — glows on
     hover and leaves its border alone. An edge that moves reads as the element
     resizing, and these sit in tables and toolbars where that fires on every
     row the pointer crosses.

     A form field brightens its border *and* glows. That is the older
     convention and it stays: a field is asking to be typed into, it is
     surrounded by other fields, and it can afford the stronger signal. Making
     the pickers match the rule while diverging from the arc-input beside them
     in the same form would have been the worse consistency.

     So a hover that only shifts border-color is drift; a hover that does both
     on a field is not. Twenty-seven rules do both, deliberately. */
  glowScale: {
    xs: '0 0 6px rgba(var(--accent-primary-rgb), 0.3)',
    sm: '0 0 8px rgba(var(--accent-primary-rgb), 0.3)',
    md: '0 0 12px rgba(var(--accent-primary-rgb), 0.25)',
    /* Reads --_status-rgb from status-styles.js, so it takes the color of
       whatever variant the host is carrying. arc-badge and arc-tag each spelled
       this out five times, once per variant; arc-alert a sixth.

       The alpha is a token of its own because this is the one glow that cannot
       be forwarded: --_status-rgb is shadow-private, guaranteed-invalid at
       :root, so --glow-status must stay a :host declaration — which would strand
       its light-theme retune at :root, unreachable. The themable part is only
       the alpha, so that is what crosses the boundary: --glow-status-alpha is a
       bare number, forwarded like any literal, overridden per theme below. */
    status: '0 0 12px rgba(var(--_status-rgb), var(--glow-status-alpha, 0.15))',
  },

  /* The themable half of --glow-status — see the note on glowScale.status. */
  glowStatusAlpha: '0.15',

  /* ── Hover Glow ── */
  glowHover: '0 0 12px rgba(var(--accent-primary-rgb), 0.15)',

  /* ── Card / Ambient Glow ── */
  glowCard: {
    hover:
      '0 0 20px rgba(var(--accent-primary-rgb),0.08), 0 0 40px rgba(var(--accent-secondary-rgb),0.04)',
  },

  /* ── Focus ──
     Two treatments, and which one a component takes is a property of the
     target rather than of the component:

       glow — a bounded control. A field, a button, a checkbox, a card: an
         element with its own box, where light gathering around that box reads
         as the box being addressed.
       ring — an inline or dense target. A link in running text, a tab, a table
         cell, a row in a list. These sit close to their neighbours, and a
         four-layer glow reaching 40px would wash over whatever is beside them
         instead of marking what is focused.
       error — the glow's shape in the error color, with an inner 2px in the
         surface color so the ring stays legible against a red border. This
         was written out by hand identically in four components before it was a
         token.
       inset — a full-bleed row inside a bordered container, where an outer
         glow would be clipped by the container it sits in and a 1px ring on
         the edge would be indistinguishable from the container's own border.
         arc-accordion and arc-collapsible triggers.
       thumb — a range input's thumb, which has no box to gather light around.
         Two tight layers on the circle itself. Repeated by hand across
         arc-slider and arc-image-cropper, hover and focus alike.

     The rule was latent in the library before it was written down: forty-eight
     components had picked the glow and thirteen the ring, and every one of them
     agreed with this except arc-carousel, which had them inverted — the thin
     ring on its arrow buttons and the 40px glow on an 8px dot. */
  focus: {
    ring: '0 0 0 1px rgba(var(--accent-primary-rgb),0.25)',
    error:
      '0 0 0 2px var(--surface-base), 0 0 0 4px var(--color-error), 0 0 16px rgba(var(--color-error-rgb), 0.2)',
    inset: 'inset 0 0 0 2px var(--interactive)',
    thumb: '0 0 8px rgba(var(--interactive-rgb), 0.5), 0 0 20px rgba(var(--interactive-rgb), 0.25)',
    glow: '0 0 0 1px rgba(var(--accent-primary-rgb),0.2), 0 0 6px rgba(var(--accent-primary-rgb),0.35), 0 0 16px rgba(var(--accent-primary-rgb),0.2), 0 0 40px rgba(var(--accent-secondary-rgb),0.12)',
  },
};

/** CSS custom properties string — inject into :host or :root */
/* ── Derived roles: solved, not chosen ──────────────────────────────────────
 *
 * A role that carries text states a contrast, and shared/color.js solves for
 * it — same hue, same chroma, lightness moved only as far as the contract
 * needs. What used to happen instead was a hex picked against one background
 * and corrected later against another: the light accent shipped at 3.99 on its
 * own 6% tint, which is the strictest surface it ever sits on and the one
 * nobody checks, because the accent looks fine against the page.
 *
 * The solver is a floor. A seed that already clears its contract comes back
 * untouched, which is why the dark theme is unchanged by any of this — its
 * accent was already at 5.29 — and why this is a correction of the light
 * palette rather than a re-baseline of the design.
 */
/* Both tints a text accent is ever laid on: 0.06 for --accent-primary-subtle,
 * 0.10 for the status fills. The heavier one pulls the background toward the
 * text's own hue and is the stricter test, so the percentage has to satisfy
 * both rather than the one that happened to get measured. */
const ACCENT_TINT_ALPHAS = [0.06, 0.1];
const BODY_TEXT_CONTRAST = 4.5; // WCAG AA, normal-size text

const accentTintOver = (palette) =>
  composite(parseColor(palette.accentPrimary), ACCENT_TINT_ALPHA, parseColor(palette.bgDeep));

/* The accents that are ever set as text, each on the subtle tint of itself —
 * the background they actually sit on in a badge, a callout, a current-page
 * link. Status fills use 0.1 alpha, the accent pair 0.06; the stricter of the
 * two is what the percentage has to satisfy. */
const textAccentKeys = ['accentPrimary', 'accentSecondary', 'success', 'warning', 'error', 'info'];

/* This percentage is not applied to our palette. It is applied to whatever
 * color a consumer hands a component — arc-tag takes one as a prop, and this
 * site passes it greys for the component tiers — so solving it against the six
 * accents we happen to ship answers a question nobody asked. Two attempts did
 * exactly that: against the accents' own tints it came out 15%, against every
 * surface 20%, and both broke twenty-seven pairings that the hand-picked 55%
 * had been quietly carrying.
 *
 * So the contract is the hard case rather than our case: any hue, at any
 * lightness a brand color plausibly uses, on any surface the theme defines.
 * The worst of that space is a mid-tone with little chroma sitting near the
 * surface's own luminance — a grey, which is precisely what failed. Sampling
 * it is cheap and it is honest about what the token has to survive.
 *
 * The surfaces are ours to know; the seeds are not, so they are swept — but
 * only across seeds a designer could plausibly have meant. A color already
 * below 3:1 on the page was never going to be read; carrying it to AA would
 * mean mixing every accent halfway to the text color, which is what the sweep
 * demanded of the dark theme before this floor: 50%, to rescue colors nobody
 * passes, at the cost of washing out the ones everybody does. The promise is
 * that a visible color stays legible, not that an invisible one is saved. */
const surfaceKeys = ['bgDeep', 'bgSurface', 'bgBase', 'bgCard', 'bgElevated'];

const SEED_SWEEP = [];
for (let l = 0.35; l <= 0.8; l += 0.05) {
  for (const c of [0, 0.08, 0.16]) {
    for (let h = 0; h < 360; h += 30) {
      SEED_SWEEP.push(formatRgb(oklchToRgb({ l, c, h })));
      if (c === 0) break; // hue is meaningless without chroma
    }
  }
}

/**
 * Two different questions, and pretending they are one is what produced a 55%
 * in the light theme and a 0% in the dark with nothing written down about why.
 *
 * On a light page the failure is ordinary: any mid-tone hue at all — the greys
 * this site passes arc-tag for its component tiers were the ones that broke —
 * so the percentage has to survive the sweep, and it lands on 55%, which is
 * where the hand-picked value already was. Derived now, and it will move if
 * the surfaces do.
 *
 * On a near-black page the accents we ship clear AA with room, and the sweep's
 * answer of 50% would wash every one of them out to rescue dark-saturated hues
 * that were marginal before any of this — 4.2:1 as a dark green on its own
 * tint. So the dark theme solves against the palette rather than the sweep,
 * and the open question is deliberately left open: how much the library owes a
 * consumer who hands a component a color that was never going to read on
 * their background. Answering it silently, in a number, is how this token got
 * here.
 */
const solveTextMix = (palette, seeds) => {
  const surfaces = surfaceKeys.filter((k) => palette[k]).map((k) => parseColor(palette[k]));
  const pairings = seeds.flatMap((seed) => [
    ...surfaces.map((background) => ({ seed, background })),
    ...surfaces.flatMap((surface) =>
      ACCENT_TINT_ALPHAS.map((alpha) => ({
        seed,
        background: composite(parseColor(seed), alpha, surface),
      })),
    ),
  ]);
  return solveMixPercent(pairings, palette.textPrimary, BODY_TEXT_CONTRAST);
};

const paletteAccents = (palette) => textAccentKeys.filter((k) => palette[k]).map((k) => palette[k]);

/* ── The contrast contract ──────────────────────────────────────────────────
 *
 * One contract, four schemes: dark, light, and the softened variant of each
 * that a pinned region uses when the page around it is the other one. Every
 * scheme solves its own foregrounds against its own ground, so none of them is
 * a special case and none of them needs a rescue.
 *
 * That is the lesson the fixed regions taught, expensively. The light theme
 * shipped at the AA line with nothing to spare — its accent measured 4.30:1 as
 * text on its own page, already under AA — and every variation attempted on
 * top of it had to be hand-rescued: a pinned accent literal for the navy
 * island, a 55% text mix, a white --on-accent exception, a container-scoped
 * accent that only half-recolored. All of them were the same missing headroom
 * showing up in a different place. Give each scheme a floor with room above it
 * and the rescues stop being necessary, because a scheme that can absorb a
 * ground shift is no longer a thing you have to tune by hand.
 *
 * The seed values in the trees below stay what a designer chose. The contract
 * only ever raises a seed that falls short of it, by the least change that
 * clears the bar and without moving its hue — so this reads as a floor under
 * the palette, not a replacement for it.
 */
const CONTRAST_FLOOR = 5.5; // AA + ~1.0 of headroom, which is what dark already carried

const FOREGROUND_KEYS = [
  'textPrimary',
  'textSecondary',
  'textMuted',
  'textGhost',
  'accentPrimary',
  'accentSecondary',
  'success',
  'error',
  'warning',
  'info',
];
const BORDER_KEYS = ['borderSubtle', 'borderDefault', 'borderBright'];
const SURFACE_KEYS = ['bgDeep', 'bgSurface', 'bgBase', 'bgCard', 'bgElevated'];

/* Ratios the dark scheme already achieves, used as the contract for the other
 * three. Two of them can't be a flat floor:
 *
 *   The text ramp is a hierarchy. Flooring secondary/muted/ghost at one number
 *   collapses them into each other — which is exactly the failure mode the
 *   ramp already has in places, three steps within seventeen rgb points of one
 *   another. Taking dark's three ratios keeps the spacing that makes them mean
 *   different things.
 *
 *   Borders are not text and AA does not apply. They get dark's own ratios too
 *   — around 1.16 to 1.66 — because the contract for a divider is "as visible
 *   as it is in dark mode", not a WCAG number. Without this the dark scheme's
 *   border-subtle on a softened ground measured 1.06: present in the
 *   stylesheet, invisible on screen.
 */
const ratiosOf = (palette, keys) =>
  Object.fromEntries(
    keys.map((k) => [k, contrast(parseColor(palette[k]), parseColor(palette.bgDeep))]),
  );

const RAMP_CONTRACT = ratiosOf(tokens.color, ['textSecondary', 'textMuted', 'textGhost']);
const BORDER_CONTRACT = ratiosOf(tokens.color, BORDER_KEYS);

/** The ratio a key owes its own ground. */
const contractFor = (key) => RAMP_CONTRACT[key] ?? BORDER_CONTRACT[key] ?? CONTRAST_FLOOR;

/**
 * Raise every foreground and border in a palette to the contract, against that
 * palette's own `bgDeep`.
 *
 * @param {object} palette - A complete color set: surfaces, text, borders, accents.
 * @param {string} label - Scheme name, for the error when a target is unreachable.
 */
function solvePalette(palette, label) {
  const ground = palette.bgDeep;
  const out = { ...palette };

  for (const key of [...FOREGROUND_KEYS, ...BORDER_KEYS]) {
    if (!palette[key]) continue;
    const target = contractFor(key);
    const solved = solveContrast(palette[key], ground, target);
    if (!solved) {
      throw new Error(
        `tokens.js: the ${label} scheme cannot carry ${key} at ${target.toFixed(2)}:1 on ` +
          `${ground} without leaving its hue — only black or white would reach it. Move the ` +
          `ground, or lower the contract for this key deliberately.`,
      );
    }
    out[key] = solved;
  }
  return out;
}

/* ── Softened schemes ───────────────────────────────────────────────────────
 *
 * A region pinned to one scheme inside a page using the other is the only case
 * that needs anything beyond the two schemes, and what it needs is not a
 * palette — it is the same scheme, laid over the page's extreme so the boundary
 * is a transition rather than a slab. Pinning dark inside a light page with no
 * softening is white-on-black; the softened variant is the escape hatch from
 * that, and it is opt-in because plenty of designs want the slab.
 *
 * The rule is the plainest statement of what "soften" means here: the accent
 * drawn over black for a dark region, over white for a light one, at a fixed
 * percentage per surface step. One table, `SOFT_MIX`, holds those percentages
 * and both consumers read it — the baked palette computed here and the
 * color-mix() emitted into the stylesheet — so the two cannot drift. They were
 * separate derivations once, an OKLCH lift and a mix, fitted to agree; that
 * agreement lasted exactly until the percentages moved.
 *
 * Foregrounds are deliberately untouched. `solvePalette` re-solves them against
 * whatever ground this produces, which is why the whole ramp can be brightened
 * by editing one number and nothing needs re-tuning by hand.
 */
function softenSurfaces(palette, variant) {
  const { over, pct } = SOFT_MIX[variant];
  const src = mixSource(palette, variant);
  const base = parseColor(over);
  const out = { ...palette };

  for (const [key, percent] of Object.entries(pct)) {
    out[key] = formatRgb(src.map((c, i) => base[i] + (c - base[i]) * (percent / 100)));
  }
  return out;
}

/* The dark scheme, brought to the contract before anything reads it. Only
   accentSecondary moves — it measured 4.86:1, the one value in the dark tree
   that was under the floor the rest of it already cleared. */
Object.assign(tokens.color, solvePalette(tokens.color, 'dark'));

/* Channel copies exist for alpha compositing and are a separate set of tokens,
   so a solved color has to be written back into them or the two desync — the
   fill tints one color while the text renders another. Derived rather than
   restated, for exactly that reason. */
const syncChannels = (palette, channels) => {
  for (const key of Object.keys(channels)) {
    if (palette[key]) channels[key] = parseColor(palette[key]).map(Math.round).join(', ');
  }
};
syncChannels(tokens.color, tokens.rgb);

export const cssVariables = `
  --bg-deep: ${tokens.color.bgDeep};
  --bg-surface: ${tokens.color.bgSurface};
  --bg-base: ${tokens.color.bgBase};
  --bg-card: ${tokens.color.bgCard};
  --bg-elevated: ${tokens.color.bgElevated};

  --text-primary: ${tokens.color.textPrimary};
  --text-secondary: ${tokens.color.textSecondary};
  --text-muted: ${tokens.color.textMuted};
  --text-ghost: ${tokens.color.textGhost};

  --border-subtle: ${tokens.color.borderSubtle};
  --border-default: ${tokens.color.borderDefault};
  --border-bright: ${tokens.color.borderBright};

  --accent-primary: ${tokens.color.accentPrimary};
  --accent-secondary: ${tokens.color.accentSecondary};

  /* The accent captured under a name pinned regions never redeclare, so they
     can derive from it without referencing a property they are themselves
     declaring — which would be a cycle, and would invalidate both. Private and
     not part of the public token surface: override --accent-primary as usual
     and this follows, including into a pinned nav or footer. */
  --_brand-primary: var(--accent-primary);
  --_brand-secondary: var(--accent-secondary);

  --accent-primary-rgb: ${tokens.rgb.accentPrimary};
  --accent-secondary-rgb: ${tokens.rgb.accentSecondary};
  --text-primary-rgb: ${tokens.rgb.textPrimary};
  --text-muted-rgb: ${tokens.rgb.textMuted};
  --color-error-rgb: ${tokens.rgb.error};
  --white-rgb: ${tokens.rgb.white};
  --black-rgb: ${tokens.rgb.black};

  --accent-primary-subtle: rgba(var(--accent-primary-rgb), 0.06);
  --accent-primary-border: rgba(var(--accent-primary-rgb), 0.12);
  --accent-primary-glow: rgba(var(--accent-primary-rgb), 0.2);
  --accent-primary-ring: rgba(var(--accent-primary-rgb), 0.15);
  --accent-secondary-subtle: rgba(var(--accent-secondary-rgb), 0.06);
  --accent-secondary-border: rgba(var(--accent-secondary-rgb), 0.12);
  --accent-secondary-glow: rgba(var(--accent-secondary-rgb), 0.2);

  --color-success: ${tokens.color.success};
  --color-success-rgb: ${tokens.rgb.success};
  --color-error: ${tokens.color.error};
  --color-error-subtle: rgba(${tokens.rgb.error}, 0.1);
  --color-warning: ${tokens.color.warning};
  --color-warning-rgb: ${tokens.rgb.warning};
  --color-warning-subtle: rgba(${tokens.rgb.warning}, 0.1);
  --color-info: ${tokens.color.info};
  --color-info-rgb: ${tokens.rgb.info};
  --color-info-subtle: rgba(${tokens.rgb.info}, 0.1);

  --chart-1: ${tokens.color.chart1};
  --chart-2: ${tokens.color.chart2};
  --chart-3: ${tokens.color.chart3};
  --chart-4: ${tokens.color.chart4};
  --chart-5: ${tokens.color.chart5};
  --chart-6: ${tokens.color.chart6};

  --shadow-xs: ${tokens.shadow.xs};
  --shadow-sm: ${tokens.shadow.sm};
  --shadow-md: ${tokens.shadow.md};
  --shadow-lg: ${tokens.shadow.lg};
  --shadow-xl: ${tokens.shadow.xl};
  --shadow-overlay: ${tokens.shadow.overlay};
  --shadow-inset: ${tokens.shadow.inset};

  --z-base: ${tokens.zIndex.base};
  --z-dropdown: ${tokens.zIndex.dropdown};
  --z-tooltip: ${tokens.zIndex.tooltip};
  --z-overlay: ${tokens.zIndex.overlay};
  --z-modal: ${tokens.zIndex.modal};
  --z-toast: ${tokens.zIndex.toast};
  --z-max: ${tokens.zIndex.max};

  --breakpoint-xs: ${tokens.breakpoint.xs};
  --breakpoint-sm: ${tokens.breakpoint.sm};
  --breakpoint-md: ${tokens.breakpoint.md};
  --breakpoint-lg: ${tokens.breakpoint.lg};
  --breakpoint-xl: ${tokens.breakpoint.xl};
  --breakpoint-2xl: ${tokens.breakpoint['2xl']};

  --opacity-disabled: ${tokens.opacity.disabled};
  --opacity-muted: ${tokens.opacity.muted};
  --opacity-hover: ${tokens.opacity.hover};
  --opacity-visible: ${tokens.opacity.visible};

  /* Font role slots. Override only the -family token to assign a typeface;
     the fallback and every component using the role follow automatically.
     Each role also carries a -weight, for faces that do not ship the weight
     the role is set at. */
  --font-body-family: ${tokens.font.body.family};
  --font-body-fallback: ${tokens.font.body.fallback};
  --font-body-weight: ${tokens.font.body.weight};
  --font-body: var(--font-body-family), var(--font-body-fallback);

  --font-label-family: ${tokens.font.label.family};
  --font-label-fallback: ${tokens.font.label.fallback};
  --font-label-weight: ${tokens.font.label.weight};
  --font-label: var(--font-label-family), var(--font-label-fallback);

  --font-mono-family: ${tokens.font.mono.family};
  --font-mono-fallback: ${tokens.font.mono.fallback};
  --font-mono-weight: ${tokens.font.mono.weight};
  --font-mono: var(--font-mono-family), var(--font-mono-fallback);

  /* Display follows the text role until it is assigned a face of its own. Its
     weight does not follow: large type usually wants its own. */
  --font-display-family: var(--font-body-family);
  --font-display-fallback: var(--font-body-fallback);
  --font-display-weight: ${tokens.font.display.weight};
  --font-display: var(--font-display-family), var(--font-display-fallback);

  --font-quote-family: ${tokens.font.quote.family};
  --font-quote-fallback: ${tokens.font.quote.fallback};
  --font-quote-weight: ${tokens.font.quote.weight};
  --font-quote: var(--font-quote-family), var(--font-quote-fallback);

  /* --font-accent named the label role before the slots were split out.
     Kept as an alias so existing overrides and usages keep working. */
  --font-accent: var(--font-label);

  --text-xs: ${tokens.fontSize.xs};
  --text-sm: ${tokens.fontSize.sm};
  --text-md: ${tokens.fontSize.md};
  --text-lg: ${tokens.fontSize.lg};
  --text-xl: ${tokens.fontSize.xl};
  --text-2xl: ${tokens.fontSize['2xl']};
  --text-3xl: ${tokens.fontSize['3xl']};

  /* Private mirrors of the size scale. Components read these rather than the
     public --text-* names, because shared-styles.js has to declare a working
     default on :host and a token cannot fall back to itself:
     --text-md: var(--text-md, 17px) is a self-reference and invalid. Declaring
     the public name on :host instead is what made an override at :root
     unreachable — a value set on the host always beats one inherited into it.
     The indirection gives components a name that is only ever declared, and
     consumers a name that is only ever read.

     Emitted here as well as on :host so the standalone CSS build resolves them:
     there is no shadow root there, so :root is the only declaration site. */
  --_text-xs: var(--text-xs);
  --_text-sm: var(--text-sm);
  --_text-md: var(--text-md);
  --_text-lg: var(--text-lg);
  --_text-xl: var(--text-xl);
  --_text-2xl: var(--text-2xl);
  --_text-3xl: var(--text-3xl);

  --display-xl-size: ${tokens.fontSize.displayXl};
  --display-xl-weight: ${tokens.fontWeight.displayXl};
  --display-xl-spacing: ${tokens.letterSpacing.displayXl};
  --heading-size: ${tokens.fontSize.heading};
  --heading-weight: ${tokens.fontWeight.heading};
  --heading-lh: ${tokens.lineHeight.heading};
  --body-size: ${tokens.fontSize.body};
  --body-weight: ${tokens.fontWeight.body};
  --body-lh: ${tokens.lineHeight.body};
  --wordmark-size: ${tokens.fontSize.wordmark};
  --wordmark-weight: ${tokens.fontWeight.wordmark};
  --wordmark-spacing: ${tokens.letterSpacing.wordmark};
  --glyph-lh: ${tokens.lineHeight.glyph};
  --ui-lh: ${tokens.lineHeight.ui};
  --numeral-size: ${tokens.fontSize.numeral};
  --numeral-weight: ${tokens.fontWeight.numeral};
  --label-size: ${tokens.fontSize.label};
  --label-weight: ${tokens.fontWeight.label};
  --label-spacing: ${tokens.letterSpacing.label};
  --section-title-size: ${tokens.fontSize.sectionTitle};
  --section-title-weight: ${tokens.fontWeight.sectionTitle};
  --section-title-spacing: ${tokens.letterSpacing.sectionTitle};
  --ui-accent-size: ${tokens.fontSize.uiAccent};
  --ui-accent-weight: ${tokens.fontWeight.uiAccent};
  --ui-accent-spacing: ${tokens.letterSpacing.uiAccent};
  --code-size: ${tokens.fontSize.code};
  --code-lh: ${tokens.lineHeight.code};
  --label-inline-size: ${tokens.fontSize.labelInline};
  --label-inline-spacing: ${tokens.letterSpacing.labelInline};
  --field-weight: ${tokens.fontWeight.field};

  --touch-min: ${tokens.touch.min};
  --touch-pad: ${tokens.touch.pad};

  --space-xs: ${tokens.space.xs};
  --space-sm: ${tokens.space.sm};
  --space-md: ${tokens.space.md};
  --space-lg: ${tokens.space.lg};
  --space-xl: ${tokens.space.xl};
  --space-2xl: ${tokens.space['2xl']};
  --space-3xl: ${tokens.space['3xl']};
  --space-4xl: ${tokens.space['4xl']};

  --radius-xs: ${tokens.radius.xs};
  --radius-sm: ${tokens.radius.sm};
  --radius-md: ${tokens.radius.md};
  --radius-lg: ${tokens.radius.lg};
  --radius-xl: ${tokens.radius.xl};
  --radius-full: ${tokens.radius.full};

${Object.entries(tokens.transition)
  .map(([k, v]) => `  --transition-${k}: ${v};`)
  .join('\n')}

${Object.entries(tokens.easing)
  .map(([k, v]) => `  --ease-${k}: ${v};`)
  .join('\n')}
${Object.entries(tokens.duration)
  .map(([k, v]) => `  --duration-${k}: ${v};`)
  .join('\n')}

  /* Back-compat: the two curve names published before the motion scale
     existed. Public API, so they stay; new work spells --ease-out and
     --ease-standard. */
  --ease-out-expo: var(--ease-out);
  --ease-in-out: var(--ease-standard);

  --gradient-display-text: ${tokens.gradient.displayText};
  --gradient-accent-text: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
  --gradient-divider: ${tokens.gradient.divider};
  --gradient-divider-glow: linear-gradient(90deg, rgba(var(--accent-primary-rgb),0), rgba(var(--accent-primary-rgb),0.2), rgba(var(--accent-secondary-rgb),0.12), rgba(var(--accent-secondary-rgb),0));
  --gradient-page-ambient: radial-gradient(ellipse, rgba(${tokens.rgb.white},0.015) 0%, rgba(${tokens.rgb.white},0) 70%);

  --glow-white: ${tokens.glow.white};
  --glow-primary: 0 0 8px rgba(var(--accent-primary-rgb),0.9), 0 0 20px rgba(var(--accent-primary-rgb),0.5), 0 0 44px rgba(var(--accent-primary-rgb),0.25), 0 0 80px rgba(var(--accent-primary-rgb),0.1);
  --glow-secondary: 0 0 8px rgba(var(--accent-secondary-rgb),0.9), 0 0 20px rgba(var(--accent-secondary-rgb),0.4), 0 0 40px rgba(var(--accent-secondary-rgb),0.15);

  --glow-line-white: linear-gradient(90deg, rgba(var(--text-primary-rgb),0), rgba(var(--text-primary-rgb),0.35), rgba(var(--text-primary-rgb),0));
  --glow-line-blue: linear-gradient(90deg, rgba(var(--accent-primary-rgb),0), rgba(var(--accent-primary-rgb),0.7), rgba(var(--accent-primary-rgb),0));
  --glow-line-gradient: linear-gradient(90deg, rgba(var(--accent-primary-rgb),0), var(--accent-primary), var(--accent-secondary), rgba(var(--accent-secondary-rgb),0));

${Object.entries(tokens.glowScale)
  .map(([k, v]) => `  --glow-${k}: ${v};`)
  .join('\n')}
  --glow-status-alpha: ${tokens.glowStatusAlpha};
  --glow-hover: 0 0 12px rgba(var(--accent-primary-rgb), 0.15);
  --glow-card-hover: 0 0 20px rgba(var(--accent-primary-rgb),0.08), 0 0 40px rgba(var(--accent-secondary-rgb),0.04);
  --gradient-border-glow: linear-gradient(135deg, rgba(var(--accent-primary-rgb),0.15), rgba(var(--accent-secondary-rgb),0.1), rgba(var(--accent-primary-rgb),0.05));
  --gradient-ambient: radial-gradient(circle at 15% 85%, rgba(var(--accent-primary-rgb),0.04) 0%, rgba(var(--accent-primary-rgb),0) 50%),
                      radial-gradient(circle at 85% 15%, rgba(var(--accent-secondary-rgb),0.03) 0%, rgba(var(--accent-secondary-rgb),0) 50%);

  --focus-ring: ${tokens.focus.ring};
  --focus-glow: ${tokens.focus.glow};
  --focus-error: ${tokens.focus.error};
  --focus-inset: ${tokens.focus.inset};
  --focus-thumb: ${tokens.focus.thumb};

  --max-width: ${tokens.layout.maxWidth};
  --max-width-sm: ${tokens.layout.maxWidthSm};
  --nav-height: ${tokens.layout.navHeight};
  --nav-row-inset: ${tokens.layout.navRowInset};

  --bg-hover: rgba(${tokens.rgb.white}, 0.04);
  --overlay-backdrop: rgba(${tokens.rgb.black}, 0.6);
  --accent-text-mix: ${solveTextMix(tokens.color, paletteAccents(tokens.color))}%;

  /* Text painted ON an accent fill — the primary button's label, the active
     segment, the selected day in a picker.

     Not simply --surface-base, which is what those five call sites used to
     read. That works in dark, where the ground is near-black against a bright
     accent (5.53:1), but light mode pairs its near-white ground with a darker
     accent and lands at 4.30:1 — under AA, on the most-used control in the
     library. The light theme overrides this to pure white (4.79:1); the dark
     value stays exactly what it was, since white on the dark accent would be
     3.72:1 and strictly worse. */
  --on-accent: var(--surface-base);

  /* ── Semantic: Interactive ── */
  --interactive: var(--accent-primary);
  --interactive-rgb: var(--accent-primary-rgb);
  --interactive-hover: var(--glow-hover);
  --interactive-active: var(--glow-primary);
  --interactive-focus: var(--focus-glow);
  --interactive-focus-ring: var(--focus-ring);
  --interactive-focus-error: var(--focus-error);
  --interactive-focus-inset: var(--focus-inset);
  --interactive-focus-thumb: var(--focus-thumb);
  --interactive-muted: var(--text-ghost);

  /* ── Semantic: Surface ── */
  --surface-base: var(--bg-deep);
  --surface-primary: var(--bg-surface);
  --surface-raised: var(--bg-card);
  --surface-overlay: var(--bg-elevated);
  --surface-hover: var(--bg-hover);

  /* ── Semantic: Divider ── */
  --divider: var(--border-subtle);
  --divider-glow: var(--glow-line-gradient);

  /* ── Semantic: Feedback composites ── */
  --feedback-error-subtle: var(--color-error-subtle);
  --feedback-error-border: rgba(var(--color-error-rgb), 0.2);
  --feedback-error-glow: 0 0 12px rgba(var(--color-error-rgb), 0.15);
  --feedback-success-subtle: rgba(var(--color-success-rgb), 0.1);
  --feedback-success-border: rgba(var(--color-success-rgb), 0.2);
  --feedback-success-glow: 0 0 12px rgba(var(--color-success-rgb), 0.15);
  --feedback-warning-subtle: var(--color-warning-subtle);
  --feedback-warning-border: rgba(var(--color-warning-rgb), 0.2);
  --feedback-warning-glow: 0 0 12px rgba(var(--color-warning-rgb), 0.15);
  --feedback-info-subtle: var(--color-info-subtle);
  --feedback-info-border: rgba(var(--color-info-rgb), 0.2);
  --feedback-info-glow: 0 0 12px rgba(var(--color-info-rgb), 0.15);
`;

/** Light theme color overrides */
export const lightTokens = {
  color: {
    bgDeep: 'rgb(242, 242, 248)',
    bgSurface: 'rgb(248, 248, 252)',
    bgBase: 'rgb(244, 244, 250)',
    bgCard: 'rgb(248, 248, 252)',
    bgElevated: 'rgb(238, 238, 246)',
    textPrimary: 'rgb(35, 35, 55)',
    textSecondary: 'rgb(85, 88, 108)',
    textMuted: 'rgb(97, 100, 120)',
    textGhost: 'rgb(104, 107, 129)',
    borderSubtle: 'rgb(230, 232, 238)',
    borderDefault: 'rgb(210, 214, 222)',
    borderBright: 'rgb(190, 195, 205)',
    accentPrimary: 'rgb(55, 105, 235)',
    accentSecondary: 'rgb(120, 70, 230)',
    /* Status colors, darkened for a light page.
     *
     * The dark-theme values are pitched to glow against near-black and were
     * never given light equivalents, so on rgb(242,242,248) they landed at
     * 1.50 to 2.48 — every one of them failing AA as text, and warning the
     * worst of the four. An install command rendered in `success` green came
     * out at 1.81 on the landing page, which is what surfaced this.
     *
     * Same hues, retuned: success 4.64, error 5.30, warning 4.55, info 5.91.
     * Only the solid colors move. The separate `rgb` set stays as it is —
     * those are used at 0.1 alpha for subtle fills, where a light tint of the
     * brighter hue is exactly what a light surface wants, and the darkened
     * text now sits on it with contrast to spare. */
    success: 'rgb(13, 124, 92)',
    error: 'rgb(190, 42, 42)',
    warning: 'rgb(147, 102, 0)',
    info: 'rgb(27, 88, 190)',
    /* Chart series — light-mode steps (brand accents shift; lime darkens
       to clear 3:1 on the light surface). Validated like the dark set. */
    chart1: '#3769eb',
    chart4: '#7846e6',
    chart6: '#4d7c0f',
  },
  rgb: {
    accentPrimary: '55, 105, 235',
    accentSecondary: '120, 70, 230',
    textPrimary: '35, 35, 55',
    textMuted: '97, 100, 120',
  },
  glow: {
    primary:
      '0 0 8px rgba(var(--accent-primary-rgb),0.5), 0 0 24px rgba(var(--accent-primary-rgb),0.2), 0 0 48px rgba(var(--accent-primary-rgb),0.08)',
    secondary:
      '0 0 8px rgba(var(--accent-secondary-rgb),0.5), 0 0 24px rgba(var(--accent-secondary-rgb),0.2), 0 0 48px rgba(var(--accent-secondary-rgb),0.08)',
    white:
      '0 0 8px rgba(var(--accent-primary-rgb),0.15), 0 0 20px rgba(var(--accent-secondary-rgb),0.08)',
  },
  glowCard: {
    hover:
      '0 0 20px rgba(var(--accent-primary-rgb),0.12), 0 0 40px rgba(var(--accent-secondary-rgb),0.06)',
  },

  /* The interface tier, which had no light values at all.

     Every glow the light theme overrode was display work — the hero emission,
     the card ambient, the divider lines. --glow-hover was not among them, and
     it is the one components actually spend: it backs --interactive-hover on
     the form fields. The scale added in the v3 glow pass inherited the same
     omission, so a light-mode hover was rendering at the alpha chosen against
     near-black.

     Ratio taken from glowCard.hover, the one precedent in the tree for a
     subtle accent glow crossing themes: 0.08 dark to 0.12 light, ×1.5. A faint
     wash needs more alpha on a light ground, not less — the bright emissions
     above go the other way (primary drops 0.9 to 0.5) because at high alpha the
     problem reverses and they glare. These are a starting point from that rule,
     not a judgement made by looking. */
  glowScale: {
    xs: '0 0 6px rgba(var(--accent-primary-rgb), 0.42)',
    sm: '0 0 8px rgba(var(--accent-primary-rgb), 0.42)',
    md: '0 0 12px rgba(var(--accent-primary-rgb), 0.36)',
  },
  /* The status glow's themable half. --glow-status itself stays on :host (its
     --_status-rgb is shadow-private and cannot cross the boundary), so the
     light retune travels as this bare number instead. Same ×1.5 rule. */
  glowStatusAlpha: '0.22',
  glowHover: '0 0 12px rgba(var(--accent-primary-rgb), 0.22)',

  /* Focus recipes, retuned by the same ×1.5 rule as the glow scale above:
     subtle accent washes need more alpha on a light ground. Structure is
     identical to the dark recipes — layers, radii and solid rings unchanged,
     only the alphas move. focus.inset carries no alpha and needs no override.
     The thumb's tight 0.5 layer already reads on a light ground; only its
     outer wash steps up. */
  focus: {
    ring: '0 0 0 1px rgba(var(--accent-primary-rgb),0.38)',
    glow: '0 0 0 1px rgba(var(--accent-primary-rgb),0.3), 0 0 6px rgba(var(--accent-primary-rgb),0.5), 0 0 16px rgba(var(--accent-primary-rgb),0.3), 0 0 40px rgba(var(--accent-secondary-rgb),0.18)',
    error:
      '0 0 0 2px var(--surface-base), 0 0 0 4px var(--color-error), 0 0 16px rgba(var(--color-error-rgb), 0.3)',
    thumb: '0 0 8px rgba(var(--interactive-rgb), 0.5), 0 0 20px rgba(var(--interactive-rgb), 0.38)',
  },

  shadow: {
    xs: '0 1px 2px rgba(var(--accent-primary-rgb),0.06)',
    sm: '0 2px 4px rgba(var(--accent-primary-rgb),0.08), 0 1px 2px rgba(var(--accent-secondary-rgb),0.04)',
    md: '0 4px 12px rgba(var(--accent-primary-rgb),0.1), 0 2px 4px rgba(var(--accent-secondary-rgb),0.05)',
    lg: '0 8px 24px rgba(var(--accent-primary-rgb),0.12), 0 4px 8px rgba(var(--accent-secondary-rgb),0.06)',
    xl: '0 16px 48px rgba(var(--accent-primary-rgb),0.14), 0 8px 16px rgba(var(--accent-secondary-rgb),0.07)',
    overlay:
      '0 4px 24px rgba(var(--accent-primary-rgb),0.1), 0 8px 48px rgba(var(--accent-secondary-rgb),0.06)',
  },
  gradient: {
    displayText: 'linear-gradient(135deg, var(--text-primary) 0%, var(--accent-primary) 100%)',
    divider:
      'linear-gradient(90deg, rgba(var(--accent-primary-rgb),0), rgba(var(--accent-primary-rgb),0.2), rgba(var(--accent-primary-rgb),0))',
    dividerGlow:
      'linear-gradient(90deg, rgba(var(--accent-primary-rgb),0), rgba(var(--accent-primary-rgb),0.35), rgba(var(--accent-secondary-rgb),0.25), rgba(var(--accent-secondary-rgb),0))',
    pageAmbient:
      'radial-gradient(ellipse, rgba(var(--accent-primary-rgb),0.06) 0%, rgba(var(--accent-primary-rgb),0) 70%)',
    borderGlow:
      'linear-gradient(135deg, rgba(var(--accent-primary-rgb),0.2), rgba(var(--accent-secondary-rgb),0.15), rgba(var(--accent-primary-rgb),0.08))',
    ambient:
      'radial-gradient(circle at 15% 85%, rgba(var(--accent-primary-rgb),0.07) 0%, rgba(var(--accent-primary-rgb),0) 50%),\n    radial-gradient(circle at 85% 15%, rgba(var(--accent-secondary-rgb),0.05) 0%, rgba(var(--accent-secondary-rgb),0) 50%)',
  },
  glowLine: {
    white:
      'linear-gradient(90deg, rgba(var(--accent-primary-rgb),0), rgba(var(--accent-primary-rgb),0.15), rgba(var(--accent-primary-rgb),0))',
    primary:
      'linear-gradient(90deg, rgba(var(--accent-primary-rgb),0), rgba(var(--accent-primary-rgb),0.6), rgba(var(--accent-primary-rgb),0))',
  },
  utility: {
    bgHover: 'rgba(55, 105, 235, 0.04)',
    overlayBackdrop: 'rgba(20, 20, 40, 0.25)',
    /* White, not the light ground. The near-white surface this theme would
       otherwise supply sits at 4.30:1 on the light accent — under AA for the
       primary button label and the active segment. Pure white clears it at
       4.79:1 without moving the brand color. */
    onAccent: 'rgb(var(--white-rgb))',
  },
};

/* The light scheme, brought to the same contract. Unlike dark, most of it
   moves: this is the palette that shipped at the AA line, and the whole
   downstream family of light-mode special cases traces back to it. */
Object.assign(
  lightTokens.color,
  Object.fromEntries(
    [...FOREGROUND_KEYS, ...BORDER_KEYS].map((key) => [
      key,
      solvePalette({ ...tokens.color, ...lightTokens.color }, 'light')[key],
    ]),
  ),
);
syncChannels(lightTokens.color, lightTokens.rgb);

/* The softening rule, and the only definition of it — the baked palettes below
 * and the derived CSS both read this table, so the two cannot disagree. They
 * were separate derivations fitted to agree once, which is a thing that stays
 * true until someone edits one of them.
 *
 * `sourceL` normalizes the brand before mixing, and it is doing real work. The
 * mix source is whatever accent the page carries, and the light scheme's accent
 * is deliberately darker than the dark scheme's — so mixing the same percentage
 * of it over black produced a *darker* ground in light mode than in dark, which
 * is precisely the mode the softening exists for. The region ended up darker
 * than the hand-tuned navy it replaced, defeating the point. Pinning the source
 * to the scheme's own accent lightness makes the ground depend on the scheme
 * and the hue depend on the consumer, which is the split that was intended.
 *
 * The percentages sit deliberately above the old navy rather than level with
 * it: that palette was tuned as a dark island, and this is meant to read as a
 * lit surface. bg-deep at 25% is L 0.248 against the navy's 0.187.
 */
const SOFT_MIX = {
  dark: {
    over: 'rgb(0, 0, 0)',
    sourceL: rgbToOklch(parseColor(tokens.color.accentPrimary)).l,
    pct: {
      bgDeep: 25,
      bgSurface: 32,
      bgBase: 32,
      bgCard: 34,
      bgElevated: 37,
      /* Above every surface step, and spaced to reproduce the dark scheme's own
         border-to-card ratios — 1.10, 1.23, 1.56. Taken from the contrast solve
         alone they landed at 34/40/51, which put border-subtle at exactly
         bg-card: a card outlined in its own fill. A border has to clear the
         surface it outlines, not merely satisfy a ratio against the deepest
         ground. */
      borderSubtle: 40,
      borderDefault: 45,
      borderBright: 56,
    },
  },
  light: {
    over: 'rgb(255, 255, 255)',
    sourceL: rgbToOklch(parseColor(lightTokens.color.accentPrimary)).l,
    pct: {
      bgDeep: 25,
      bgSurface: 22,
      bgBase: 24,
      bgCard: 22,
      bgElevated: 27,
      borderSubtle: 34,
      borderDefault: 41,
      borderBright: 54,
    },
  },
};

/** The brand re-lit to a scheme's accent lightness, as an rgb triplet. */
const mixSource = (palette, variant) =>
  oklchToRgb({
    ...rgbToOklch(parseColor(palette.accentPrimary)),
    l: SOFT_MIX[variant].sourceL,
  });

/* ── The two softened schemes ──
   Each is its parent scheme's surfaces moved toward the opposite page, with
   every foreground re-solved against the ground that produces. Nothing here is
   picked by hand, which is the point: change the accent and both retint,
   change a surface and both re-solve. */
const softPalettes = {
  dark: solvePalette(softenSurfaces({ ...tokens.color }, 'dark'), 'soft dark'),
  light: solvePalette(
    softenSurfaces({ ...tokens.color, ...lightTokens.color }, 'light'),
    'soft light',
  ),
};

/* ── Following a consumer's accent into a pinned region ─────────────────────
 *
 * A pinned region declares its scheme on its own element, and a value set on an
 * element beats one inherited into it. That is what makes the pin hold — and it
 * is also why `:root { --accent-primary: orange }` never reached inside one.
 * The theme synthesizer showed this plainly: the page went orange and both
 * pinned bars stayed ARC blue.
 *
 * The region cannot simply derive its accent from --accent-primary, because it
 * declares that property; a declaration that references itself is a cycle and
 * both halves go invalid. So :root captures the accent under a private name the
 * pinned blocks never shadow, and they derive from that instead. It costs no
 * public API — override --accent-primary as before and the capture follows.
 *
 * Two derivations, each using the mechanism that suits it:
 *
 *   Grounds are the accent drawn over the scheme's extreme — over black for a
 *   dark region, over white for a light one — at a fixed percentage per step.
 *   That is a plain color-mix, it is what "soften the accent into a surface"
 *   actually means, and the percentages below were fitted to reproduce the
 *   lightness ramp the deep blue already had in production.
 *
 *   Accents need their lightness moved without losing the hue, which a mix
 *   toward white cannot do — carrying the light accent to the dark accent's
 *   lightness that way lands on rgb(212, …), a wash rather than a blue. So they
 *   use relative color, pinning the scheme's own lightness and chroma onto
 *   whatever hue the consumer supplied.
 */
const BRAND_PRIMARY = '--_brand-primary';
const BRAND_SECONDARY = '--_brand-secondary';

/**
 * Re-light the brand to a scheme's accent lightness, keeping everything else
 * the consumer chose.
 *
 * Only the lightness is pinned. Chroma and hue pass through from the source —
 * `c` and `h`, not literals — because the scheme's contract is about how light
 * the accent is against its ground, and nothing else. Pinning ARC's chroma
 * here instead was a real bug with an obvious tell: a monochrome brand has
 * near-zero chroma and therefore an arbitrary hue, so forcing 0.19 of chroma
 * onto it manufactured a saturated color out of a grey. Monochrome came out
 * pink.
 */
const accentShape = (palette) =>
  Object.fromEntries(
    [
      ['accentPrimary', BRAND_PRIMARY],
      ['accentSecondary', BRAND_SECONDARY],
    ].map(([key, source]) => {
      const { l } = rgbToOklch(parseColor(palette[key]));
      return [key, `oklch(from var(${source}) ${l.toFixed(4)} c h)`];
    }),
  );

/**
 * Ground and border steps as the brand laid over the scheme's extreme — the
 * runtime twin of `softenSurfaces`, reading the same table.
 *
 * The source is re-lit to the scheme's own accent lightness before mixing, for
 * the same reason the baked side does it: the page's accent supplies the hue,
 * the scheme supplies how light the result is. Mixing the raw
 * `var(--_brand-primary)` meant a light page — whose accent is deliberately
 * darker — produced a darker softened region than a dark page did, which is
 * backwards for the one mode the softening exists to serve.
 */
const groundMix = (variant) =>
  Object.fromEntries(
    Object.entries(SOFT_MIX[variant].pct).map(([key, pct]) => [
      key,
      `color-mix(in srgb, oklch(from var(${BRAND_PRIMARY}) ${SOFT_MIX[variant].sourceL.toFixed(4)} c h) ${pct}%, ${SOFT_MIX[variant].over})`,
    ]),
  );

/* The accent's channel triplet cannot be derived. Relative color produces a
   color, and `rgba(var(--accent-primary-rgb), 0.2)` needs three bare numbers —
   there is no syntax that turns one into the other. So a pinned region cannot
   restate these and still follow a consumer's brand, and every glow, focus
   ring and tint in the library is built from them rather than from the solid
   color: with the triplets pinned to ARC's blue, an orange theme produced an
   orange nav wearing a blue focus ring and a blue checkbox.
   Left to inherit instead. On a page of the same scheme that is exactly right.
   On the opposite one it carries the other scheme's tuning of the same hue,
   which at the 0.06–0.2 alphas these are used at is a shade of dimness, not a
   wrong color — and far better than a hue that ignores the theme outright. */
const BRAND_CHANNELS = new Set(['--accent-primary-rgb', '--accent-secondary-rgb']);
const withoutBrandChannels = (pairs) => pairs.filter(([name]) => !BRAND_CHANNELS.has(name));

/** A softened scheme, shaped as an override tree like lightTokens. */
const softTokens = (palette) => ({
  color: Object.fromEntries(
    [...SURFACE_KEYS, ...BORDER_KEYS, ...FOREGROUND_KEYS].map((k) => [k, palette[k]]),
  ),
  rgb: Object.fromEntries(
    Object.keys(tokens.rgb)
      .filter((k) => palette[k] && !BRAND_CHANNELS.has(rgbVarMap[k]))
      .map((k) => [k, parseColor(palette[k]).map(Math.round).join(', ')]),
  ),
});

/* Solving and then checking are not the same act, and the check is the one
   that survives a future edit. A hand-picked value dropped into any of these
   trees, a surface moved, a status recolored — all of it lands here rather
   than on a page. The 0.1 slack is 8-bit rounding: the solver works in OKLCH
   and the last binary-search step can land a thousandth under once it is
   quantized to a channel. */
const CONTRACT_SLACK = 0.1;

for (const [label, palette] of [
  ['dark', tokens.color],
  ['light', { ...tokens.color, ...lightTokens.color }],
  ['soft dark', softPalettes.dark],
  ['soft light', softPalettes.light],
]) {
  const ground = parseColor(palette.bgDeep);
  const failures = [...FOREGROUND_KEYS, ...BORDER_KEYS]
    .filter((key) => palette[key])
    .map((key) => ({
      key,
      got: contrast(parseColor(palette[key]), ground),
      want: contractFor(key),
    }))
    .filter(({ got, want }) => got < want - CONTRACT_SLACK);

  if (failures.length) {
    throw new Error(
      `tokens.js: the ${label} scheme breaks its contrast contract on ${palette.bgDeep} — ` +
        failures
          .map((f) => `${f.key} ${f.got.toFixed(2)} (needs ${f.want.toFixed(2)})`)
          .join(', ') +
        `. Every scheme solves against its own ground; a value that lands here was either ` +
        `pinned by hand or is sitting on a surface that moved out from under it.`,
    );
  }
}

lightTokens.utility.accentTextMix = `${solveTextMix({ ...tokens.color, ...lightTokens.color }, [
  ...SEED_SWEEP,
  ...paletteAccents({ ...tokens.color, ...lightTokens.color }),
])}%`;

/* ── CSS Generator ── */

const colorVarMap = {
  bgDeep: '--bg-deep',
  bgSurface: '--bg-surface',
  bgBase: '--bg-base',
  bgCard: '--bg-card',
  bgElevated: '--bg-elevated',
  textPrimary: '--text-primary',
  textSecondary: '--text-secondary',
  textMuted: '--text-muted',
  textGhost: '--text-ghost',
  borderSubtle: '--border-subtle',
  borderDefault: '--border-default',
  borderBright: '--border-bright',
  accentPrimary: '--accent-primary',
  accentSecondary: '--accent-secondary',
  /* Status colors are themeable: they were declared once, tuned for a
     near-black page, and reused unchanged on a near-white one. */
  success: '--color-success',
  error: '--color-error',
  warning: '--color-warning',
  info: '--color-info',
  chart1: '--chart-1',
  chart2: '--chart-2',
  chart3: '--chart-3',
  chart4: '--chart-4',
  chart5: '--chart-5',
  chart6: '--chart-6',
};

const rgbVarMap = {
  accentPrimary: '--accent-primary-rgb',
  accentSecondary: '--accent-secondary-rgb',
  textPrimary: '--text-primary-rgb',
  textMuted: '--text-muted-rgb',
  success: '--color-success-rgb',
  error: '--color-error-rgb',
  warning: '--color-warning-rgb',
  info: '--color-info-rgb',
  white: '--white-rgb',
  black: '--black-rgb',
};

const focusVarMap = {
  ring: '--focus-ring',
  glow: '--focus-glow',
  error: '--focus-error',
  inset: '--focus-inset',
  thumb: '--focus-thumb',
};

const shadowVarMap = {
  xs: '--shadow-xs',
  sm: '--shadow-sm',
  md: '--shadow-md',
  lg: '--shadow-lg',
  xl: '--shadow-xl',
  overlay: '--shadow-overlay',
  inset: '--shadow-inset',
};

const gradientVarMap = {
  displayText: '--gradient-display-text',
  divider: '--gradient-divider',
  dividerGlow: '--gradient-divider-glow',
  pageAmbient: '--gradient-page-ambient',
  borderGlow: '--gradient-border-glow',
  ambient: '--gradient-ambient',
};

function collectOverrides(t, label = 'theme') {
  const lines = [];
  const add = (name, val) => lines.push([name, val]);

  // Unknown keys used to be dropped on the floor: every branch below was
  // `if (varMap[k]) add(...)`, so a typo in a theme override, or a token added
  // to the tree without a matching entry in the var map, silently produced no
  // CSS. The theme looked applied and one value was quietly missing. Collect
  // them instead and fail the build.
  const unknown = [];
  const mapped = (map, group) => (k, v) => {
    if (map[k]) add(map[k], v);
    else unknown.push(`${group}.${k}`);
  };

  if (t.color) for (const [k, v] of Object.entries(t.color)) mapped(colorVarMap, 'color')(k, v);
  if (t.rgb) for (const [k, v] of Object.entries(t.rgb)) mapped(rgbVarMap, 'rgb')(k, v);
  if (t.shadow) for (const [k, v] of Object.entries(t.shadow)) mapped(shadowVarMap, 'shadow')(k, v);
  if (t.gradient)
    for (const [k, v] of Object.entries(t.gradient)) mapped(gradientVarMap, 'gradient')(k, v);

  if (t.glow) {
    const glowVar = {
      primary: '--glow-primary',
      secondary: '--glow-secondary',
      white: '--glow-white',
    };
    for (const [k, v] of Object.entries(t.glow)) mapped(glowVar, 'glow')(k, v);
  }
  if (t.glowCard) {
    for (const [k, v] of Object.entries(t.glowCard))
      mapped({ hover: '--glow-card-hover' }, 'glowCard')(k, v);
  }
  if (t.glowScale) {
    const scaleVar = { xs: '--glow-xs', sm: '--glow-sm', md: '--glow-md', status: '--glow-status' };
    for (const [k, v] of Object.entries(t.glowScale)) mapped(scaleVar, 'glowScale')(k, v);
  }
  // Scalars rather than groups, like the base tree's glowHover.
  if (t.glowHover) add('--glow-hover', t.glowHover);
  if (t.glowStatusAlpha) add('--glow-status-alpha', t.glowStatusAlpha);
  if (t.focus) {
    for (const [k, v] of Object.entries(t.focus)) mapped(focusVarMap, 'focus')(k, v);
  }
  if (t.glowLine) {
    const lineVar = { white: '--glow-line-white', primary: '--glow-line-blue' };
    for (const [k, v] of Object.entries(t.glowLine)) mapped(lineVar, 'glowLine')(k, v);
  }
  if (t.utility) {
    const utilVar = {
      bgHover: '--bg-hover',
      accentTextMix: '--accent-text-mix',
      overlayBackdrop: '--overlay-backdrop',
      onAccent: '--on-accent',
    };
    for (const [k, v] of Object.entries(t.utility)) mapped(utilVar, 'utility')(k, v);
  }

  for (const group of Object.keys(t)) {
    if (
      ![
        'color',
        'rgb',
        'shadow',
        'gradient',
        'glow',
        'glowCard',
        'glowScale',
        'glowHover',
        'glowStatusAlpha',
        'glowLine',
        'focus',
        'utility',
      ].includes(group)
    ) {
      unknown.push(group);
    }
  }

  if (unknown.length) {
    throw new Error(
      `tokens.js: ${label} declares ${unknown.length} value(s) with nowhere to go: ` +
        `${unknown.join(', ')}. Add them to the matching var map in tokens.js, or ` +
        `remove them from the theme — silently dropping them is how themes end up ` +
        `half-applied.`,
    );
  }

  return lines;
}

/** Format `[name, value]` pairs as an indented declaration block. */
const renderDecls = (pairs, indent = '  ') =>
  pairs.map(([name, value]) => `${indent}${name}: ${value};`).join('\n');

const renderOverrides = (t, indent = '  ', label = 'theme') =>
  renderDecls(collectOverrides(t, label), indent);

/* ── Fixed-scheme regions ──
 *
 * A nav that stays dark on a light page — or a panel that stays light on a
 * dark one — is not a palette. It is one of the two schemes the library
 * already generates, applied to a subtree instead of to :root. So it is
 * emitted from the same token data rather than hand-picked beside it.
 *
 * What used to live here was a third palette (near-black) and a fourth (deep
 * navy, for the dark region on a light page), each hand-tuned, each free to
 * drift from the theme it stood in for — and the navy one needed a lifted
 * accent literal of its own, because a light-tuned accent on a dark ground
 * lands at 3.55–4.00 and had to be pinned by hand. The dark scheme's accent on
 * the dark scheme's ground is 5.53 with nothing pinned. The island stopped
 * needing a solver as soon as it stopped being a special case.
 *
 * Two mechanisms, because a custom property substitutes its var() references
 * in the scope where it is DECLARED and then inherits the resolved value:
 *
 *   1. The scheme's own values — everything the light theme retunes — restated
 *      on the region, so they beat a [data-theme] sitting on an ancestor.
 *   2. Every *other* :root property whose value transitively references one of
 *      those, restated too. Without it --surface-base, --glow-md, --focus-glow
 *      and friends arrive pre-substituted with the page theme's colors and
 *      quietly ignore the scheme forced above them. That set is computed to a
 *      fixpoint rather than hand-listed — the hand-list is what left
 *      --divider-glow and the ambient gradients leaking across the boundary.
 */

/** Every `--name: value` the :root block declares, comments stripped. */
const rootDeclarations = (() => {
  const map = new Map();
  const src = cssVariables.replace(/\/\*[\s\S]*?\*\//g, '');
  for (const decl of src.split(';')) {
    const m = decl.match(/(--[\w-]+)\s*:\s*([\s\S]+)/);
    if (m) map.set(m[1], m[2].trim().replace(/\s*\n\s*/g, ' '));
  }
  return map;
})();

/* --glow-status stays out: it reads the shadow-private --_status-rgb and must
   remain a :host declaration, so a copy here would be guaranteed-invalid. Its
   themable half crosses as the bare --glow-status-alpha, which is in the
   scheme block like any other retuned value. */
const REGION_EXCLUDED = new Set([
  '--glow-status',
  /* The brand capture is the one thing a pinned region must NOT restate: its
     whole job is to survive the region shadowing --accent-primary, and the
     closure would helpfully re-declare it into the very scope it exists to
     see past. */
  '--_brand-primary',
  '--_brand-secondary',
]);

/** The properties a scheme retunes. The light overrides define the set. */
const schemeNames = collectOverrides(lightTokens, 'light theme').map(([name]) => name);

/** :root properties that must re-substitute inside a fixed-scheme region. */
const dependentDeclarations = (() => {
  const needed = new Set(schemeNames);
  const out = new Map();
  for (let changed = true; changed; ) {
    changed = false;
    for (const [name, value] of rootDeclarations) {
      if (needed.has(name) || REGION_EXCLUDED.has(name)) continue;
      const refs = [...value.matchAll(/var\((--[\w-]+)/g)].map((m) => m[1]);
      if (refs.some((ref) => needed.has(ref))) {
        needed.add(name);
        out.set(name, value);
        changed = true;
      }
    }
  }
  return [...out];
})();

/**
 * One scheme's complete declaration block, for a selector other than :root.
 *
 * @param {object|null} overrides - The scheme's override tree, or null for
 *   dark, whose values are :root's own and are read back from it rather than
 *   restated — that is what keeps the pinned region and the dark page identical
 *   by construction.
 */
function schemeBlock(overrides, label, indent = '  ') {
  const own = overrides
    ? collectOverrides(overrides, label)
    : schemeNames.map((name) => {
        const value = rootDeclarations.get(name);
        if (value === undefined) {
          throw new Error(
            `tokens.js: the light theme retunes ${name}, but :root never declares it, ` +
              `so a fixed-dark region has no dark value to restate. Declare it in ` +
              `cssVariables, or drop it from lightTokens.`,
          );
        }
        return [name, value];
      });
  return renderDecls([...withoutBrandChannels(own), ...dependentDeclarations], indent);
}

/**
 * Build the FOUC guard that hides ARC elements until they upgrade.
 *
 * Two constraints shape this rule:
 *
 *  1. It must not apply when scripting is unavailable. Without JS nothing ever
 *     becomes `:defined`, so an unconditional rule hides the entire library
 *     forever — a blank page for no-JS visitors. `scripting: enabled` is
 *     unsupported on older engines, where the query simply doesn't match and
 *     the guard switches off: a brief FOUC rather than invisible content, which
 *     is the safe direction to fail in.
 *
 *  2. It must be scoped to tags we own. A bare `:not(:defined)` matches *any*
 *     undefined element, so the shipped stylesheet would hide the consumer's
 *     own custom elements and any third-party ones on the page.
 *
 * @param {string[]} tags - Custom element tags ARC defines.
 */
/** Wrap a tag list into indented, ~96-column selector lines. */
function wrapTagList(tags) {
  const lines = [];
  let current = '';
  for (const tag of tags) {
    const next = current ? `${current}, ${tag}` : `  ${tag}`;
    if (next.length > 96) {
      lines.push(`${current},`);
      current = `  ${tag}`;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines.join('\n');
}

/**
 * Tokens the forwarding rule must not touch.
 *
 * The font compositions are composed on :host *from slots* — and the slots are
 * deliberately not declared there, so they already inherit from :root. A
 * consumer overriding --font-body-family works today; forwarding the composed
 * --font-body on top of that would add nothing and would put the composition's
 * literal defaults at the mercy of base.css being complete.
 *
 * The private size mirrors are excluded for the same reason: --_text-md already
 * reads the public --text-md, which inherits.
 */
const NOT_FORWARDED = /^--(font-(body|label|mono|display|quote|accent)$|_text-)/;

/**
 * Re-expose the :host static token layer to a :root override.
 *
 * The problem this solves: every token the :host layer declares is *set on the
 * host element*, and a value set on an element always beats one inherited into
 * it. So `:root { --space-md: 20px }` could not reach a component — the tokens
 * were overridable per instance but not globally, which is backwards from what
 * consumers expect and from what the docs imply.
 *
 * The fix is one rule in the document, not a rename of ~2166 var() reads.
 * `--space-md: inherit` on the host takes the value from :root, and because the
 * cascade weighs *encapsulation context before specificity* for normal
 * declarations, this zero-specificity :where() rule in the outer tree beats the
 * :host declaration in the shadow tree. Per-instance overrides keep working,
 * since a consumer's own `arc-card { … }` outranks :where() on specificity.
 *
 * This can only live in base.css. `inherit` makes the token take the parent's
 * value, so shipping the rule without the :root declarations it forwards would
 * leave every token guaranteed-invalid. base.css is the file that declares them.
 *
 * @param {string[]} tags - ARC's own custom element names.
 */
function renderTokenForwarding(tags) {
  if (!tags.length) return '';

  // Derived from the :host layer itself rather than a hand-kept list, so a token
  // added to the tree is forwarded automatically.
  //
  // Only tokens that reference a *shadow-private* variable (var(--_…)) are held
  // back. A private token is only ever declared inside a shadow root —
  // --_status-rgb comes from status-styles.js — so forwarding its composition
  // would make the value inherit from a scope where the reference is
  // guaranteed-invalid. Everything else is forwarded, compositions included:
  // an accent compound like --glow-md or --focus-glow resolves fine at :root
  // (the accent channels are declared there), and forwarding is exactly what
  // lets the [data-theme="light"] retunes of those recipes reach into shadow
  // DOM — a blanket "no var()" exclusion here is what once stranded them at
  // :root while the :host copies kept the dark alphas.
  //
  // The trade `inherit` makes on a composition: the value arrives already
  // substituted in the parent's scope, so a *per-element* override of a base
  // token (`arc-button { --accent-primary: red }`) no longer re-resolves the
  // compounds on that element. Overriding the compound itself on the element
  // still works — an element selector outranks :where() — and :root/theme/
  // region overrides of the base token now cascade correctly, which is the
  // behavior consumers actually rely on.
  const names = [...generateHostTokensCSS('').matchAll(/^(--[a-zA-Z0-9_-]+)\s*:\s*([^;]+);/gm)]
    .filter(([, , value]) => !value.includes('var(--_'))
    .map((m) => m[1])
    .filter((n) => !NOT_FORWARDED.test(n));

  const decls = [...new Set(names)].map((n) => `  ${n}: inherit;`).join('\n');

  return `/* Let a :root override reach into shadow DOM.
   Each of these is also declared on :host by every component — which is what
   makes a component render correctly with no base.css at all — and a value set
   on the host beats one inherited into it. Without this rule
   \`:root { --space-md: 20px }\` would be silently ignored.
   Scoped to ARC's own tags: this must never be a universal selector, which
   would push these values onto every element in the consumer's page. */
:where(
${wrapTagList(tags)}
) {
${decls}
}`;
}

function renderUndefinedGuard(tags) {
  if (!tags.length) return '';

  return `/* Prevent FOUC — hide ARC elements until they upgrade.
   Fade-in transition provided by :host styles in each component.
   Gated on scripting so no-JS visitors get visible content instead of a blank
   page, and scoped to ARC tags so we never hide elements we don't own.

   Opted out of by \`<html data-arc-ssr>\`. A server-rendered element arrives
   with its shadow root already attached and its content already painted, but
   it stays :not(:defined) until the JS upgrades it — so this rule would hide
   finished content for the whole of that window, which is precisely the
   opposite of what server rendering is for. CSS cannot detect a declarative
   shadow root (the browser consumes the <template> during parsing, leaving no
   selectable trace), so the page has to say so.

   The two attributes below are the other half of that, because a page can be
   *partly* server-rendered and then the root attribute alone makes one claim
   about elements in two different states.

   \`data-arc-defer\` marks an element the build chose not to render — long
   repeated lists, where only the first screenful can matter. It keeps the
   guard's \`opacity: 0\`, which holds the element's layout so nothing shifts
   when it upgrades; it simply fades in like it would on a page with no server
   rendering at all. Set by the build, never by hand. */
@media (scripting: enabled) {
  :root:not([data-arc-ssr]) :is(
${wrapTagList(tags)}
  ):not(:defined),
  [data-arc-defer]:not(:defined) {
    opacity: 0;
  }

  /* A closed overlay, left un-rendered by the build because nothing inside one
     can reach a first paint. \`opacity: 0\` is wrong here and measurably so: it
     keeps the element in layout, so an un-upgraded command palette held 174
     items' worth of page until its JS arrived and collapsed them — LCP 784ms to
     2540ms. Closed means occupying nothing, which is what it will be once it
     upgrades. Set by the build, never by hand. */
  [data-arc-closed]:not(:defined) {
    display: none;
  }
}`;
}

/* ────────────────────────────────────────────────────────────────────────────
 * The :host static token layer
 *
 * Every component adopts these into its shadow root, so they are what makes a
 * component render correctly when base.css is not loaded at all — which is the
 * documented quick start: `npm install @arclux/arc-ui lit` and use the tags. The
 * declarations therefore cannot simply be deleted in favour of :root.
 *
 * They used to be hand-written in packages/web-components/src/shared-styles.js,
 * a second copy of values that also live here. Nineteen of the eighty-one had
 * drifted, two of them visibly: --text-3xl shipped the 2xl value, and
 * --label-inline-size disagreed by 2px between the two builds. Generating the
 * block from this tree makes that class of bug impossible rather than fixed.
 *
 * Three mechanical rules turn a :root value into its :host form. They are the
 * whole reason this is generated rather than copied:
 *
 *   1. A reference to the public size scale, var(--text-N), becomes a reference
 *      to the private mirror, var(--_text-N). Components must never read the
 *      public name — see the note beside the mirrors above.
 *   2. A reference to a role weight, var(--font-X-weight), gains that role's
 *      literal as a fallback, because base.css is what declares the slot.
 *   3. Anything else is emitted unchanged.
 *
 * Colors are deliberately absent: they are themed, and a literal on :host would
 * pin a component to one theme and defeat the light/dark switch.
 * ──────────────────────────────────────────────────────────────────────────── */

/** Rule 1: components read the private mirror of the size scale. */
function privatiseScale(value) {
  return String(value).replace(/var\(--text-((?:xs|sm|md|lg|xl|2xl|3xl))\)/g, 'var(--_text-$1)');
}

/** Rule 2: a role-weight reference carries the role's literal as its fallback. */
function weightWithFallback(value) {
  return String(value).replace(/var\(--font-([a-z]+)-weight\)/g, (whole, role) => {
    const literal = tokens.font[role]?.weight;
    return literal === undefined ? whole : `var(--font-${role}-weight, ${literal})`;
  });
}

const hostValue = (value) => weightWithFallback(privatiseScale(value));

/**
 * Generate the declarations for the `:host` static token layer.
 *
 * Returns declaration lines only — no selector — so shared-styles.js can keep
 * its own prose around them.
 *
 * @param {string} [indent='    ']
 */
export function generateHostTokensCSS(indent = '    ') {
  const out = [];
  const add = (name, value) => out.push(`${indent}${name}: ${hostValue(value)};`);
  const blank = () => out.push('');
  const note = (text) => out.push(`${indent}/* ${text} */`);

  note('Generated from shared/tokens.js by scripts/generate/host-tokens.js.');
  note('Do not edit by hand — edit the token tree instead.');
  blank();

  // ── Font roles, composed from the slots rather than from literal faces. A
  // value on :host beats one inherited from :root, so spelling a typeface here
  // would make --font-<role>-family on the document root unreachable. Only the
  // slots are inherited; the composition is local.
  for (const [role, def] of Object.entries(tokens.font)) {
    if (!def.family) continue;
    add(
      `--font-${role}`,
      `var(--font-${role}-family, ${def.family}), var(--font-${role}-fallback, ${def.fallback})`,
    );
  }
  // display has no family of its own: it follows body until assigned one.
  add(
    '--font-display',
    `var(--font-display-family, var(--font-body-family, ${tokens.font.body.family})), ` +
      `var(--font-display-fallback, var(--font-body-fallback, ${tokens.font.body.fallback}))`,
  );
  add('--font-accent', 'var(--font-label)');
  blank();

  // ── The size scale, as private mirrors of the public names. The public name
  // must not be declared here: that is what made a :root override unreachable,
  // and a token cannot fall back to itself.
  note('Private mirrors: components read these, consumers override --text-*.');
  for (const step of ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl']) {
    out.push(`${indent}--_text-${step}: var(--text-${step}, ${tokens.fontSize[step]});`);
  }
  blank();

  // ── Typography contexts.
  const contexts = [
    ['display-xl', 'displayXl'],
    ['heading', 'heading'],
    ['body', 'body'],
    ['wordmark', 'wordmark'],
    ['glyph', 'glyph'],
    ['ui', 'ui'],
    ['numeral', 'numeral'],
    ['label', 'label'],
    ['section-title', 'sectionTitle'],
    ['ui-accent', 'uiAccent'],
    ['code', 'code'],
    ['label-inline', 'labelInline'],
  ];
  for (const [cssName, key] of contexts) {
    if (tokens.fontSize[key] !== undefined) add(`--${cssName}-size`, tokens.fontSize[key]);
    // --field-weight is deliberately never emitted: it bottoms out in a literal
    // rather than a role slot, so a value here would beat the one inherited from
    // :root. The fields spell var(--field-weight, 400) at the point of use.
    if (key !== 'field' && tokens.fontWeight[key] !== undefined) {
      add(`--${cssName}-weight`, tokens.fontWeight[key]);
    }
    if (tokens.letterSpacing[key] !== undefined)
      add(`--${cssName}-spacing`, tokens.letterSpacing[key]);
    if (tokens.lineHeight[key] !== undefined) add(`--${cssName}-lh`, tokens.lineHeight[key]);
  }
  blank();

  const group = (label, entries) => {
    note(label);
    for (const [name, value] of entries) add(name, value);
    blank();
  };

  group(
    'Spacing',
    Object.entries(tokens.space).map(([k, v]) => [`--space-${k}`, v]),
  );
  group(
    'Radii',
    Object.entries(tokens.radius).map(([k, v]) => [`--radius-${k}`, v]),
  );
  group('Transitions and motion', [
    ...Object.entries(tokens.transition).map(([k, v]) => [`--transition-${k}`, v]),
    ...Object.entries(tokens.easing).map(([k, v]) => [`--ease-${k}`, v]),
    ...Object.entries(tokens.duration).map(([k, v]) => [`--duration-${k}`, v]),
    // Back-compat aliases for the two curve names published before the motion
    // scale existed. Both targets are declared just above on this same :host,
    // so the reference resolves locally and the alias cannot dangle.
    ['--ease-out-expo', 'var(--ease-out)'],
    ['--ease-in-out', 'var(--ease-standard)'],
  ]);
  group(
    'Z-index',
    Object.entries(tokens.zIndex).map(([k, v]) => [`--z-${k}`, v]),
  );
  group('Glow and focus', [
    ...Object.entries(tokens.glowScale).map(([k, v]) => [`--glow-${k}`, v]),
    // The status glow's themable half: a bare number, so it forwards where the
    // shadow-private composition above it cannot. See glowScale.status.
    ['--glow-status-alpha', tokens.glowStatusAlpha],
    ['--glow-hover', tokens.glowHover],
    ['--focus-ring', tokens.focus.ring],
    ['--focus-glow', tokens.focus.glow],
    ['--focus-error', tokens.focus.error],
    ['--focus-inset', tokens.focus.inset],
    ['--focus-thumb', tokens.focus.thumb],
  ]);
  group('Semantic aliases', [
    ['--interactive', 'var(--accent-primary)'],
    ['--interactive-rgb', 'var(--accent-primary-rgb)'],
    ['--interactive-hover', 'var(--glow-hover)'],
    ['--interactive-active', 'var(--glow-primary)'],
    ['--interactive-focus', 'var(--focus-glow)'],
    ['--interactive-focus-ring', 'var(--focus-ring)'],
    ['--interactive-focus-error', 'var(--focus-error)'],
    ['--interactive-focus-inset', 'var(--focus-inset)'],
    ['--interactive-focus-thumb', 'var(--focus-thumb)'],
    ['--interactive-muted', 'var(--text-ghost)'],
    ['--surface-base', 'var(--bg-deep)'],
    ['--surface-primary', 'var(--bg-surface)'],
    ['--surface-raised', 'var(--bg-card)'],
    ['--surface-overlay', 'var(--bg-elevated)'],
    ['--surface-hover', 'var(--bg-hover)'],
    ['--divider', 'var(--border-subtle)'],
    ['--on-accent', 'var(--surface-base)'],
  ]);
  group('Interactive and layout', [
    ['--touch-min', tokens.touch.min],
    ['--touch-pad', tokens.touch.pad],
    ['--max-width', tokens.layout.maxWidth],
    ['--max-width-sm', tokens.layout.maxWidthSm],
    ['--nav-height', tokens.layout.navHeight],
    ['--nav-row-inset', tokens.layout.navRowInset],
  ]);

  return out.join('\n').replace(/\n+$/, '');
}

/**
 * Generate the full tokens.css content from JS data.
 *
 * @param {{ tags?: string[] }} [options] - `tags` scopes the :not(:defined)
 *   guard. Supplied by scripts/generate/base-css.js from the component sources;
 *   omitting it drops the guard rather than emitting an unscoped one.
 */
export function generateTokensCSS({ tags = [] } = {}) {
  const undefinedGuard = renderUndefinedGuard(tags);
  const tokenForwarding = renderTokenForwarding(tags);

  const touchBlock = [
    '@media (pointer: coarse) {',
    '  :root {',
    `    --touch-min: ${tokens.touch.mobileMin};`,
    `    --touch-pad: ${tokens.touch.mobilePad};`,
    '  }',
    '}',
  ].join('\n');

  const lightVars = renderOverrides(lightTokens);
  const lightVarsNested = renderOverrides(lightTokens, '    ');
  /* ── Pinned regions declare nothing on a page of their own scheme ──
   *
   * "Fixed dark" means the region looks like dark mode no matter what the page
   * is doing — and on a dark page, dark mode is whatever the page says it is,
   * including every token a consumer retuned. Restating ARC's own literals
   * there does not pin the scheme, it pins *our palette*, and the difference is
   * invisible until someone themes the library: an orange theme produced a warm
   * page with two stubbornly neutral bars welded across the top of it.
   *
   * So the scheme is forced only where it has to be — when the page is the
   * opposite one — and inherited otherwise. That also makes the dark path the
   * one that needs no machinery, which is the right way round for a dark-first
   * library; before this the derived light-on-dark path was the one that
   * carried a consumer's colors and the plain dark path was the one that
   * dropped them.
   */
  const forced = {
    dark: schemeBlock(null, 'fixed dark'),
    darkNested: schemeBlock(null, 'fixed dark', '    '),
    light: schemeBlock(lightTokens, 'fixed light'),
    lightNested: schemeBlock(lightTokens, 'fixed light', '    '),
    softDark: schemeBlock(softTokens(softPalettes.dark), 'soft dark'),
    softDarkNested: schemeBlock(softTokens(softPalettes.dark), 'soft dark', '    '),
    softLight: schemeBlock(softTokens(softPalettes.light), 'soft light'),
    softLightNested: schemeBlock(softTokens(softPalettes.light), 'soft light', '    '),
  };

  /* The same forced values, derived from the brand capture instead of baked, so
     a consumer's accent reaches a region even where the scheme has to be
     overridden. Layered over the literals rather than replacing them: without
     relative color syntax the region keeps exactly the palette it has today and
     only loses the ability to follow. */
  const derived = (variant, palette, indent) =>
    renderDecls(
      [
        ...Object.entries(groundMix(variant)).map(([key, value]) => [colorVarMap[key], value]),
        ...Object.entries(accentShape(palette)).map(([key, value]) => [colorVarMap[key], value]),
      ],
      indent,
    );

  /* Forced but not softened: the ground stays the scheme's own and only the
     accent pair follows, re-lit from the page's accent to this scheme's. */
  const forcedAccents = (palette, indent) =>
    renderDecls(
      Object.entries(accentShape(palette)).map(([key, value]) => [colorVarMap[key], value]),
      indent,
    );

  return `/* Generated from shared/tokens.js — do not edit by hand */

${undefinedGuard}

:root {
  color-scheme: dark;
${cssVariables}
}

${touchBlock}

/* Light Theme Overrides */
[data-theme="light"] {
  color-scheme: light;
${lightVars}
}

@media (prefers-color-scheme: light) {
  [data-theme="auto"] {
    color-scheme: light;
${lightVarsNested}
  }
}

${tokenForwarding}

/* Fixed Scheme — a subtree pinned to one scheme regardless of the page theme.

   Two classes, each with two landing points. A pinned dark region is plain
   near-black on a dark page — nothing to do, the page is already there — and on
   a light page it lands on an accent-lifted deep color instead, because it is
   not allowed to go full light and a raw black slab against near-white is the
   thing this exists to avoid. .theme-fixed-light is the same in mirror.
   (No backticks anywhere in this comment: it lives inside a template literal,
   so one would end the string and take the rest of the stylesheet with it.)

   The lifted palette is not a third option a consumer picks. It is where the
   pin *resolves* when the page disagrees, which is why it has no name in the
   API: naming it alongside the scheme made it look like an independent choice
   and produced a hard/soft axis that nothing needed.

   Each block also restates every :root property that resolves against these —
   the semantic aliases, the glows, the focus recipes. A custom property
   substitutes where it is DECLARED and then inherits the resolved value, so
   without the restatement --surface-base and friends arrive carrying the page's
   colors and quietly ignore the scheme set here. That list is computed to a
   fixpoint rather than hand-kept. */
.theme-fixed-dark {
  color-scheme: dark;
${forced.dark}
}

/* On a light page it lifts rather than staying black. */
[data-theme="light"] .theme-fixed-dark {
${forced.softDark}
}

@media (prefers-color-scheme: light) {
  [data-theme="auto"] .theme-fixed-dark {
${forced.softDarkNested}
  }
}

.theme-fixed-light {
  color-scheme: light;
${forced.light}
}

/* Dark is the default page, so this covers an explicit dark theme and the case
   where a consumer never sets the attribute at all. */
[data-theme="dark"] .theme-fixed-light,
:root:not([data-theme]) .theme-fixed-light {
${forced.softLight}
}

@media (prefers-color-scheme: dark) {
  [data-theme="auto"] .theme-fixed-light {
${forced.softLightNested}
  }
}

/* Carry the consumer's accent into a pinned region.
   A region declares its own accent, so it cannot derive from the property it
   declares — :root captures the accent privately and these read that. Behind
   @supports because relative color syntax is what moves a hue to another
   scheme's lightness without washing it out; without it a region keeps the
   baked palette above, which is right for ARC's own accent and merely fixed. */
@supports (color: oklch(from red l c h)) {
  .theme-fixed-dark {
${forcedAccents(tokens.color, '    ')}
  }

  [data-theme="light"] .theme-fixed-dark {
${derived('dark', softPalettes.dark, '    ')}
  }

  .theme-fixed-light {
${forcedAccents({ ...tokens.color, ...lightTokens.color }, '    ')}
  }

  [data-theme="dark"] .theme-fixed-light,
  :root:not([data-theme]) .theme-fixed-light {
${derived('light', softPalettes.light, '    ')}
  }

  @media (prefers-color-scheme: light) {
    [data-theme="auto"] .theme-fixed-dark {
${derived('dark', softPalettes.dark, '      ')}
    }
  }

  @media (prefers-color-scheme: dark) {
    [data-theme="auto"] .theme-fixed-light {
${derived('light', softPalettes.light, '      ')}
    }
  }
}
`;
}

export default tokens;
