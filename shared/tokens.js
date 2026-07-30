/**
 * Arclight Design Tokens
 * Single source of truth — extracted from arclight.build
 */

export const tokens = {
  /* ── Backgrounds ── */
  color: {
    bgDeep:      'rgb(3, 3, 7)',
    bgSurface:   'rgb(10, 10, 15)',
    bgBase:      'rgb(10, 10, 15)',
    bgCard:      'rgb(13, 13, 18)',
    bgElevated:  'rgb(17, 17, 22)',

    /* Text */
    textPrimary:   'rgb(232, 232, 236)',
    textSecondary: 'rgb(150, 152, 162)',
    textMuted:     'rgb(142, 142, 155)',
    textGhost:     'rgb(133, 133, 154)',

    /* Borders */
    borderSubtle:  'rgb(24, 24, 30)',
    borderDefault: 'rgb(34, 34, 41)',
    borderBright:  'rgb(51, 51, 64)',

    /* Accent */
    accentPrimary:   'rgb(77, 126, 247)',
    accentSecondary: 'rgb(139, 92, 246)',

    /* Feedback */
    success: 'rgb(52, 211, 153)',
    error:   'rgb(239, 68, 68)',
    warning: 'rgb(245, 158, 11)',
    info:    'rgb(59, 130, 246)',

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
    accentPrimary:   '77, 126, 247',
    accentSecondary: '139, 92, 246',
    textPrimary:  '232, 232, 236',
    textMuted:    '142, 142, 155',
    error:        '239, 68, 68',
    success:      '52, 211, 153',
    warning:      '245, 158, 11',
    info:         '59, 130, 246',
    white:        '255, 255, 255',
    black:        '0, 0, 0',
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
    body:  { family: "'Host Grotesk'",   fallback: 'system-ui, sans-serif',   weight: 500 },
    label: { family: "'Tektur'",         fallback: 'system-ui, sans-serif',   weight: 600 },
    mono:  { family: "'JetBrains Mono'", fallback: 'ui-monospace, monospace', weight: 400 },
    quote: { family: 'Georgia',          fallback: 'serif',                   weight: 200 },
    // display has no family of its own — it follows body until assigned — but
    // it does have its own weight, since large type usually wants a different
    // one from body text even when it is the same face.
    display: { weight: 500 },
  },

  fontSize: {
    xs:           '12px',
    sm:           '16px',
    md:           '17px',
    lg:           'clamp(18px, 1.5vw, 20px)',
    xl:           'clamp(22px, 2.5vw, 26px)',
    '2xl':        'clamp(28px, 3vw, 36px)',
    '3xl':        'clamp(36px, 5vw, 52px)',
    displayXl:    'var(--text-3xl)',
    heading:      'var(--text-xl)',
    body:         'var(--text-md)',
    wordmark:     'clamp(20px, 2.5vw, 28px)',
    sectionTitle: 'var(--text-xs)',
    uiAccent:     '16px',
    code:         '14px',
    // 10px, not var(--text-xs) (12px). The two sources disagreed: shared-styles
    // declared 10px on :host, which shadows :root, so web-component consumers
    // saw 10px while the standalone CSS build — which has no shadow root and
    // read this token — saw 12px. Same component, two label sizes depending on
    // which package you installed. Settled on 10px because that is what the
    // canonical Lit components have been rendering; if 12px was the intent, this
    // is the one line to change.
    labelInline:  '10px',
  },

  /* Context weights, derived from the role weights above rather than restated.
     Overriding --font-label-weight has to move every label-role context with
     it, or the role knob only reaches half of what wears the role. Same rule as
     the gradients and focus rings: compound tokens reference base tokens. */
  fontWeight: {
    displayXl:    'var(--font-display-weight)',
    heading:      'var(--font-display-weight)',
    body:         'var(--font-body-weight)',
    wordmark:     'var(--font-display-weight)',
    sectionTitle: 'var(--font-label-weight)',
    uiAccent:     'var(--font-label-weight)',
    /* Field text: what the user typed, in the four text inputs. Its own context
       rather than the body weight, because a form value wants the weight a
       native input has (400) and body prose here is 500. Before this it was
       hardcoded three different ways — 300 in arc-input, 400 in arc-select and
       arc-textarea, 500 in arc-number-input — for the same kind of text. */
    field:        400,
  },

  letterSpacing: {
    displayXl:    '-1px',
    sectionTitle: '4px',
    uiAccent:     '1px',
    wordmark:     'clamp(8px, 1.2vw, 14px)',
    // Was spelled only in the :root template and in shared-styles.js, never in
    // the tree — so the generated :host layer had no way to know about it.
    labelInline:  '3px',
  },

  lineHeight: {
    body: 1.7,
    code: 1.8,
    heading: 1.2,
  },

  /* ── Spacing ── */
  space: {
    xs:  '4px',
    sm:  '8px',
    md:  '16px',
    lg:  '24px',
    xl:  '40px',
    '2xl': '64px',
    '3xl': '96px',
    '4xl': '128px',
  },

  /* ── Radii ── */
  radius: {
    // Four components read --radius-xs (breadcrumb, link, notification-panel)
    // and the scale had no such step, so the declaration was invalid at
    // computed-value time and those corners rendered square.
    xs:   '2px',
    sm:   '4px',
    md:   '10px',
    lg:   '14px',
    xl:   '20px',
    full: '9999px',
  },

  /* ── Transitions ── */
  transition: {
    fast: '120ms ease',
    base: '200ms ease',
    slow: '400ms ease',
  },

  /* ── Motion ── */
  easing: {
    outExpo: 'cubic-bezier(0.16, 1, 0.3, 1)',
    inOut:   'cubic-bezier(0.4, 0, 0.2, 1)',
  },

  duration: {
    enter: '500ms',
    exit:  '300ms',
  },

  /* ── Shadows ── */
  shadow: {
    xs:      '0 1px 2px rgba(0, 0, 0, 0.2)',
    sm:      '0 2px 4px rgba(0, 0, 0, 0.2), 0 1px 2px rgba(0, 0, 0, 0.15)',
    md:      '0 4px 12px rgba(0, 0, 0, 0.25), 0 2px 4px rgba(0, 0, 0, 0.15)',
    lg:      '0 8px 24px rgba(0, 0, 0, 0.3), 0 4px 8px rgba(0, 0, 0, 0.15)',
    xl:      '0 16px 48px rgba(0, 0, 0, 0.35), 0 8px 16px rgba(0, 0, 0, 0.15)',
    overlay: '0 8px 32px rgba(0, 0, 0, 0.4)',
    inset:   'inset 0 1px 3px rgba(0, 0, 0, 0.25)',
  },

  /* ── Z-Index ── */
  zIndex: {
    base:     0,
    dropdown: 1000,
    tooltip:  1100,
    overlay:  1200,
    modal:    1300,
    toast:    1400,
    max:      9999,
  },

  /* ── Breakpoints ── */
  breakpoint: {
    xs:   '480px',
    sm:   '640px',
    md:   '768px',
    lg:   '1024px',
    xl:   '1280px',
    '2xl': '1536px',
  },

  /* ── Opacity ── */
  opacity: {
    disabled: 0.5,
    muted:    0.6,
    hover:    0.8,
    visible:  1,
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
    maxWidth:   '1120px',
    maxWidthSm: '720px',
    navHeight:  '64px',
  },

  /* ── Gradients ── */
  gradient: {
    displayText: 'linear-gradient(135deg, rgb(232, 232, 236) 0%, rgb(124, 124, 137) 100%)',
    accentText:  'linear-gradient(90deg, rgb(77, 126, 247), rgb(139, 92, 246))',
    divider:     'linear-gradient(90deg, transparent, rgb(24, 24, 30), transparent)',
    dividerGlow: 'linear-gradient(90deg, transparent, rgba(var(--accent-primary-rgb),0.2), rgba(var(--accent-secondary-rgb),0.12), transparent)',
  },

  /* ── Glow (box-shadow presets) ── */
  glow: {
    white: '0 0 6px rgba(var(--text-primary-rgb),0.6), 0 0 18px rgba(var(--text-primary-rgb),0.25), 0 0 40px rgba(var(--text-primary-rgb),0.1)',
    primary:   '0 0 8px rgba(var(--accent-primary-rgb),0.9), 0 0 20px rgba(var(--accent-primary-rgb),0.5), 0 0 44px rgba(var(--accent-primary-rgb),0.25), 0 0 80px rgba(var(--accent-primary-rgb),0.1)',
    secondary: '0 0 8px rgba(var(--accent-secondary-rgb),0.9), 0 0 20px rgba(var(--accent-secondary-rgb),0.5), 0 0 44px rgba(var(--accent-secondary-rgb),0.25), 0 0 80px rgba(var(--accent-secondary-rgb),0.1)',
  },

  /* ── Hover Glow ── */
  glowHover: '0 0 12px rgba(var(--accent-primary-rgb), 0.15)',

  /* ── Card / Ambient Glow ── */
  glowCard: {
    hover: '0 0 20px rgba(var(--accent-primary-rgb),0.08), 0 0 40px rgba(var(--accent-secondary-rgb),0.04)',
  },

  /* ── Focus ── */
  focus: {
    ring: '0 0 0 1px rgba(var(--accent-primary-rgb),0.25)',
    glow: '0 0 0 1px rgba(var(--accent-primary-rgb),0.2), 0 0 6px rgba(var(--accent-primary-rgb),0.35), 0 0 16px rgba(var(--accent-primary-rgb),0.2), 0 0 40px rgba(var(--accent-secondary-rgb),0.12)',
  },
};

/** CSS custom properties string — inject into :host or :root */
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

  --transition-fast: ${tokens.transition.fast};
  --transition-base: ${tokens.transition.base};
  --transition-slow: ${tokens.transition.slow};

  --ease-out-expo: ${tokens.easing.outExpo};
  --ease-in-out: ${tokens.easing.inOut};
  --duration-enter: ${tokens.duration.enter};
  --duration-exit: ${tokens.duration.exit};

  --gradient-display-text: ${tokens.gradient.displayText};
  --gradient-accent-text: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
  --gradient-divider: ${tokens.gradient.divider};
  --gradient-divider-glow: linear-gradient(90deg, transparent, rgba(var(--accent-primary-rgb),0.2), rgba(var(--accent-secondary-rgb),0.12), transparent);
  --gradient-page-ambient: radial-gradient(ellipse, rgba(${tokens.rgb.white},0.015) 0%, transparent 70%);

  --glow-white: ${tokens.glow.white};
  --glow-primary: 0 0 8px rgba(var(--accent-primary-rgb),0.9), 0 0 20px rgba(var(--accent-primary-rgb),0.5), 0 0 44px rgba(var(--accent-primary-rgb),0.25), 0 0 80px rgba(var(--accent-primary-rgb),0.1);
  --glow-secondary: 0 0 8px rgba(var(--accent-secondary-rgb),0.9), 0 0 20px rgba(var(--accent-secondary-rgb),0.4), 0 0 40px rgba(var(--accent-secondary-rgb),0.15);

  --glow-line-white: linear-gradient(90deg, transparent, rgba(var(--text-primary-rgb),0.35), transparent);
  --glow-line-blue: linear-gradient(90deg, transparent, rgba(var(--accent-primary-rgb),0.7), transparent);
  --glow-line-gradient: linear-gradient(90deg, transparent, var(--accent-primary), var(--accent-secondary), transparent);

  --glow-hover: 0 0 12px rgba(var(--accent-primary-rgb), 0.15);
  --glow-card-hover: 0 0 20px rgba(var(--accent-primary-rgb),0.08), 0 0 40px rgba(var(--accent-secondary-rgb),0.04);
  --gradient-border-glow: linear-gradient(135deg, rgba(var(--accent-primary-rgb),0.15), rgba(var(--accent-secondary-rgb),0.1), rgba(var(--accent-primary-rgb),0.05));
  --gradient-ambient: radial-gradient(circle at 15% 85%, rgba(var(--accent-primary-rgb),0.04) 0%, transparent 50%),
                      radial-gradient(circle at 85% 15%, rgba(var(--accent-secondary-rgb),0.03) 0%, transparent 50%);

  --focus-ring: ${tokens.focus.ring};
  --focus-glow: ${tokens.focus.glow};

  --max-width: ${tokens.layout.maxWidth};
  --max-width-sm: ${tokens.layout.maxWidthSm};
  --nav-height: ${tokens.layout.navHeight};

  --bg-hover: rgba(${tokens.rgb.white}, 0.04);
  --overlay-backdrop: rgba(${tokens.rgb.black}, 0.6);
  --accent-text-mix: 0%;

  /* ── Semantic: Interactive ── */
  --interactive: var(--accent-primary);
  --interactive-rgb: var(--accent-primary-rgb);
  --interactive-hover: var(--glow-hover);
  --interactive-active: var(--glow-primary);
  --interactive-focus: var(--focus-glow);
  --interactive-focus-ring: var(--focus-ring);
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
    bgDeep:      'rgb(242, 242, 248)',
    bgSurface:   'rgb(248, 248, 252)',
    bgBase:      'rgb(244, 244, 250)',
    bgCard:      'rgb(248, 248, 252)',
    bgElevated:  'rgb(238, 238, 246)',
    textPrimary:   'rgb(35, 35, 55)',
    textSecondary: 'rgb(85, 88, 108)',
    textMuted:     'rgb(97, 100, 120)',
    textGhost:     'rgb(104, 107, 129)',
    borderSubtle:  'rgb(230, 232, 238)',
    borderDefault: 'rgb(210, 214, 222)',
    borderBright:  'rgb(190, 195, 205)',
    accentPrimary:   'rgb(55, 105, 235)',
    accentSecondary: 'rgb(120, 70, 230)',
    /* Chart series — light-mode steps (brand accents shift; lime darkens
       to clear 3:1 on the light surface). Validated like the dark set. */
    chart1: '#3769eb',
    chart4: '#7846e6',
    chart6: '#4d7c0f',
  },
  rgb: {
    accentPrimary:   '55, 105, 235',
    accentSecondary: '120, 70, 230',
    textPrimary:  '35, 35, 55',
    textMuted:    '97, 100, 120',
  },
  glow: {
    primary:   '0 0 8px rgba(var(--accent-primary-rgb),0.5), 0 0 24px rgba(var(--accent-primary-rgb),0.2), 0 0 48px rgba(var(--accent-primary-rgb),0.08)',
    secondary: '0 0 8px rgba(var(--accent-secondary-rgb),0.5), 0 0 24px rgba(var(--accent-secondary-rgb),0.2), 0 0 48px rgba(var(--accent-secondary-rgb),0.08)',
    white: '0 0 8px rgba(var(--accent-primary-rgb),0.15), 0 0 20px rgba(var(--accent-secondary-rgb),0.08)',
  },
  glowCard: {
    hover: '0 0 20px rgba(var(--accent-primary-rgb),0.12), 0 0 40px rgba(var(--accent-secondary-rgb),0.06)',
  },
  shadow: {
    xs:      '0 1px 2px rgba(var(--accent-primary-rgb),0.06)',
    sm:      '0 2px 4px rgba(var(--accent-primary-rgb),0.08), 0 1px 2px rgba(var(--accent-secondary-rgb),0.04)',
    md:      '0 4px 12px rgba(var(--accent-primary-rgb),0.1), 0 2px 4px rgba(var(--accent-secondary-rgb),0.05)',
    lg:      '0 8px 24px rgba(var(--accent-primary-rgb),0.12), 0 4px 8px rgba(var(--accent-secondary-rgb),0.06)',
    xl:      '0 16px 48px rgba(var(--accent-primary-rgb),0.14), 0 8px 16px rgba(var(--accent-secondary-rgb),0.07)',
    overlay: '0 4px 24px rgba(var(--accent-primary-rgb),0.1), 0 8px 48px rgba(var(--accent-secondary-rgb),0.06)',
  },
  gradient: {
    displayText: 'linear-gradient(135deg, var(--text-primary) 0%, var(--accent-primary) 100%)',
    divider: 'linear-gradient(90deg, transparent, rgba(var(--accent-primary-rgb),0.2), transparent)',
    dividerGlow: 'linear-gradient(90deg, transparent, rgba(var(--accent-primary-rgb),0.35), rgba(var(--accent-secondary-rgb),0.25), transparent)',
    pageAmbient: 'radial-gradient(ellipse, rgba(var(--accent-primary-rgb),0.06) 0%, transparent 70%)',
    borderGlow: 'linear-gradient(135deg, rgba(var(--accent-primary-rgb),0.2), rgba(var(--accent-secondary-rgb),0.15), rgba(var(--accent-primary-rgb),0.08))',
    ambient: 'radial-gradient(circle at 15% 85%, rgba(var(--accent-primary-rgb),0.07) 0%, transparent 50%),\n    radial-gradient(circle at 85% 15%, rgba(var(--accent-secondary-rgb),0.05) 0%, transparent 50%)',
  },
  glowLine: {
    white: 'linear-gradient(90deg, transparent, rgba(var(--accent-primary-rgb),0.15), transparent)',
    primary: 'linear-gradient(90deg, transparent, rgba(var(--accent-primary-rgb),0.6), transparent)',
  },
  utility: {
    bgHover: 'rgba(55, 105, 235, 0.04)',
    overlayBackdrop: 'rgba(20, 20, 40, 0.25)',
    accentTextMix: '55%',
  },
};

/** Fixed dark tokens for nav/footer regions */
export const fixedDarkTokens = {
  color: {
    bgDeep:      'rgb(3, 3, 7)',
    bgSurface:   'rgb(10, 10, 15)',
    bgBase:      'rgb(10, 10, 15)',
    bgCard:      'rgb(13, 13, 18)',
    bgElevated:  'rgb(17, 17, 22)',
    textPrimary:   'rgb(232, 232, 236)',
    textSecondary: 'rgb(150, 152, 162)',
    textMuted:     'rgb(142, 142, 155)',
    textGhost:     'rgb(133, 133, 154)',
    borderSubtle:  'rgb(24, 24, 30)',
    borderDefault: 'rgb(34, 34, 41)',
    borderBright:  'rgb(51, 51, 64)',
    accentPrimary:   'rgb(77, 126, 247)',
    accentSecondary: 'rgb(139, 92, 246)',
  },
  rgb: {
    accentPrimary:   '77, 126, 247',
    accentSecondary: '139, 92, 246',
    textPrimary:  '232, 232, 236',
    textMuted:    '142, 142, 155',
    white:        '255, 255, 255',
    black:        '0, 0, 0',
  },
  gradient: {
    displayText: 'linear-gradient(135deg, rgb(232, 232, 236) 0%, rgb(124, 124, 137) 100%)',
    divider: 'linear-gradient(90deg, transparent, var(--border-subtle), transparent)',
  },
  shadow: {
    overlay: '0 8px 32px rgba(0, 0, 0, 0.4)',
  },
  utility: {
    bgHover: 'rgba(var(--white-rgb), 0.04)',
    overlayBackdrop: 'rgba(var(--black-rgb), 0.6)',
  },
};

/** Light-mode fixed dark tokens (deep royal blue for nav/footer) */
export const lightFixedTokens = {
  color: {
    bgDeep:      'rgb(12, 12, 52)',
    bgSurface:   'rgb(16, 16, 62)',
    bgBase:      'rgb(16, 16, 62)',
    bgCard:      'rgb(20, 20, 70)',
    bgElevated:  'rgb(26, 26, 80)',
    textSecondary: 'rgb(179, 183, 212)',
    textMuted:     'rgb(165, 170, 203)',
    textGhost:     'rgb(155, 160, 196)',
    accentPrimary:   'rgb(130, 164, 250)',
    borderSubtle:  'rgb(30, 30, 78)',
    borderDefault: 'rgb(42, 42, 92)',
    borderBright:  'rgb(56, 56, 108)',
  },
  rgb: {
    accentPrimary: '130, 164, 250',
  },
};

/* ── CSS Generator ── */

const colorVarMap = {
  bgDeep: '--bg-deep', bgSurface: '--bg-surface', bgBase: '--bg-base',
  bgCard: '--bg-card', bgElevated: '--bg-elevated',
  textPrimary: '--text-primary', textSecondary: '--text-secondary',
  textMuted: '--text-muted', textGhost: '--text-ghost',
  borderSubtle: '--border-subtle', borderDefault: '--border-default',
  borderBright: '--border-bright',
  accentPrimary: '--accent-primary', accentSecondary: '--accent-secondary',
  chart1: '--chart-1', chart2: '--chart-2', chart3: '--chart-3',
  chart4: '--chart-4', chart5: '--chart-5', chart6: '--chart-6',
};

const rgbVarMap = {
  accentPrimary: '--accent-primary-rgb', accentSecondary: '--accent-secondary-rgb',
  textPrimary: '--text-primary-rgb', textMuted: '--text-muted-rgb',
  white: '--white-rgb', black: '--black-rgb',
};

const shadowVarMap = {
  xs: '--shadow-xs', sm: '--shadow-sm', md: '--shadow-md',
  lg: '--shadow-lg', xl: '--shadow-xl', overlay: '--shadow-overlay',
  inset: '--shadow-inset',
};

const gradientVarMap = {
  displayText: '--gradient-display-text', divider: '--gradient-divider',
  dividerGlow: '--gradient-divider-glow', pageAmbient: '--gradient-page-ambient',
  borderGlow: '--gradient-border-glow', ambient: '--gradient-ambient',
};

function renderOverrides(t, indent = '  ', label = 'theme') {
  const lines = [];
  const add = (name, val) => lines.push(`${indent}${name}: ${val};`);

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

  if (t.color)    for (const [k, v] of Object.entries(t.color))    mapped(colorVarMap, 'color')(k, v);
  if (t.rgb)      for (const [k, v] of Object.entries(t.rgb))      mapped(rgbVarMap, 'rgb')(k, v);
  if (t.shadow)   for (const [k, v] of Object.entries(t.shadow))   mapped(shadowVarMap, 'shadow')(k, v);
  if (t.gradient) for (const [k, v] of Object.entries(t.gradient)) mapped(gradientVarMap, 'gradient')(k, v);

  if (t.glow) {
    const glowVar = { primary: '--glow-primary', secondary: '--glow-secondary', white: '--glow-white' };
    for (const [k, v] of Object.entries(t.glow)) mapped(glowVar, 'glow')(k, v);
  }
  if (t.glowCard) {
    for (const [k, v] of Object.entries(t.glowCard)) mapped({ hover: '--glow-card-hover' }, 'glowCard')(k, v);
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
    };
    for (const [k, v] of Object.entries(t.utility)) mapped(utilVar, 'utility')(k, v);
  }

  for (const group of Object.keys(t)) {
    if (!['color', 'rgb', 'shadow', 'gradient', 'glow', 'glowCard', 'glowLine', 'utility'].includes(group)) {
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

  return lines.join('\n');
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
  // Only tokens whose value is a *literal* may be forwarded.
  //
  // `inherit` resolves to the parent's already-substituted value, so forwarding a
  // composition freezes it: --interactive: inherit would take the parent's
  // resolved accent, and `arc-button { --accent-primary: red }` would stop
  // recolouring the button because :host's --interactive: var(--accent-primary)
  // never gets to resolve in the element's own context. Compositions must stay
  // local. Nothing is lost by skipping them — each derives from a base token that
  // is itself reachable: --interactive from --accent-primary (a colour, never on
  // :host, so already inherited) and --body-size from --text-md (via its private
  // mirror).
  const names = [...generateHostTokensCSS('').matchAll(/^(--[a-zA-Z0-9_-]+)\s*:\s*([^;]+);/gm)]
    .filter(([, , value]) => !value.includes('var('))
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
   selectable trace), so the page has to say so, once, at the root. */
@media (scripting: enabled) {
  :root:not([data-arc-ssr]) :is(
${wrapTagList(tags)}
  ):not(:defined) {
    opacity: 0;
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
  return String(value).replace(
    /var\(--font-([a-z]+)-weight\)/g,
    (whole, role) => {
      const literal = tokens.font[role]?.weight;
      return literal === undefined ? whole : `var(--font-${role}-weight, ${literal})`;
    },
  );
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

  note('Generated from shared/tokens.js by scripts/generate-host-tokens.js.');
  note('Do not edit by hand — edit the token tree instead.');
  blank();

  // ── Font roles, composed from the slots rather than from literal faces. A
  // value on :host beats one inherited from :root, so spelling a typeface here
  // would make --font-<role>-family on the document root unreachable. Only the
  // slots are inherited; the composition is local.
  for (const [role, def] of Object.entries(tokens.font)) {
    if (!def.family) continue;
    add(`--font-${role}`, `var(--font-${role}-family, ${def.family}), var(--font-${role}-fallback, ${def.fallback})`);
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
    if (tokens.letterSpacing[key] !== undefined) add(`--${cssName}-spacing`, tokens.letterSpacing[key]);
    if (tokens.lineHeight[key] !== undefined) add(`--${cssName}-lh`, tokens.lineHeight[key]);
  }
  blank();

  const group = (label, entries) => {
    note(label);
    for (const [name, value] of entries) add(name, value);
    blank();
  };

  group('Spacing', Object.entries(tokens.space).map(([k, v]) => [`--space-${k}`, v]));
  group('Radii', Object.entries(tokens.radius).map(([k, v]) => [`--radius-${k}`, v]));
  group('Transitions and motion', [
    ...Object.entries(tokens.transition).map(([k, v]) => [`--transition-${k}`, v]),
    ['--ease-out-expo', tokens.easing.outExpo],
    ['--ease-in-out', tokens.easing.inOut],
    ['--duration-enter', tokens.duration.enter],
    ['--duration-exit', tokens.duration.exit],
  ]);
  group('Z-index', Object.entries(tokens.zIndex).map(([k, v]) => [`--z-${k}`, v]));
  group('Glow and focus', [
    ['--glow-hover', tokens.glowHover],
    ['--focus-ring', tokens.focus.ring],
    ['--focus-glow', tokens.focus.glow],
  ]);
  group('Semantic aliases', [
    ['--interactive', 'var(--accent-primary)'],
    ['--interactive-rgb', 'var(--accent-primary-rgb)'],
    ['--interactive-hover', 'var(--glow-hover)'],
    ['--interactive-active', 'var(--glow-primary)'],
    ['--interactive-focus', 'var(--focus-glow)'],
    ['--interactive-focus-ring', 'var(--focus-ring)'],
    ['--interactive-muted', 'var(--text-ghost)'],
    ['--surface-base', 'var(--bg-deep)'],
    ['--surface-primary', 'var(--bg-surface)'],
    ['--surface-raised', 'var(--bg-card)'],
    ['--surface-overlay', 'var(--bg-elevated)'],
    ['--surface-hover', 'var(--bg-hover)'],
    ['--divider', 'var(--border-subtle)'],
  ]);
  group('Interactive and layout', [
    ['--touch-min', tokens.touch.min],
    ['--touch-pad', tokens.touch.pad],
    ['--max-width', tokens.layout.maxWidth],
    ['--max-width-sm', tokens.layout.maxWidthSm],
    ['--nav-height', tokens.layout.navHeight],
  ]);

  return out.join('\n').replace(/\n+$/, '');
}

/**
 * Generate the full tokens.css content from JS data.
 *
 * @param {{ tags?: string[] }} [options] - `tags` scopes the :not(:defined)
 *   guard. Supplied by scripts/generate-base-css.js from the component sources;
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
  const fixedVars = renderOverrides(fixedDarkTokens);
  const fixedVarsNested = renderOverrides(fixedDarkTokens, '    ');
  const lightFixedVars = renderOverrides(lightFixedTokens);
  const lightFixedVarsNested = renderOverrides(lightFixedTokens, '    ');

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

/* Fixed Dark — always-dark regions (nav, footer) */
.theme-fixed {
${fixedVars}
}

[data-theme="light"] .theme-fixed {
${lightFixedVars}
}

@media (prefers-color-scheme: light) {
  [data-theme="auto"] .theme-fixed {
${lightFixedVarsNested}
  }
}
`;
}

export default tokens;
