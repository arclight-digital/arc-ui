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
    textSecondary: 'rgb(138, 138, 150)',
    textMuted:     'rgb(124, 124, 137)',
    textGhost:     'rgb(107, 107, 128)',

    /* Borders */
    borderSubtle:  'rgb(24, 24, 30)',
    borderDefault: 'rgb(34, 34, 41)',
    borderBright:  'rgb(51, 51, 64)',

    /* Accent */
    accentBlue:   'rgb(77, 126, 247)',
    accentViolet: 'rgb(139, 92, 246)',

    /* Feedback */
    success: 'rgb(52, 211, 153)',
    error:   'rgb(239, 68, 68)',
    warning: 'rgb(245, 158, 11)',
    info:    'rgb(59, 130, 246)',
  },

  /* RGB channels (for alpha compositing) */
  rgb: {
    accentBlue:   '77, 126, 247',
    accentViolet: '139, 92, 246',
    textPrimary:  '232, 232, 236',
    textMuted:    '124, 124, 137',
    error:        '239, 68, 68',
    success:      '52, 211, 153',
    warning:      '245, 158, 11',
    info:         '59, 130, 246',
    white:        '255, 255, 255',
    black:        '0, 0, 0',
  },

  /* ── Typography ── */
  font: {
    body:   "'Host Grotesk', system-ui, sans-serif",
    accent: "'Tektur', system-ui, sans-serif",
    mono:   "'JetBrains Mono', ui-monospace, monospace",
  },

  fontSize: {
    xs:           '12px',
    sm:           '14px',
    md:           '15px',
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
    code:         'var(--text-sm)',
    labelInline:  'var(--text-xs)',
  },

  fontWeight: {
    displayXl:    500,
    heading:      500,
    body:         500,
    wordmark:     500,
    sectionTitle: 600,
    uiAccent:     600,
  },

  letterSpacing: {
    displayXl:    '-1px',
    sectionTitle: '4px',
    uiAccent:     '1px',
    wordmark:     'clamp(8px, 1.2vw, 14px)',
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
  },

  /* ── Z-Index ── */
  zIndex: {
    base:     0,
    dropdown: 100,
    sticky:   200,
    drawer:   300,
    modal:    400,
    popover:  500,
    toast:    600,
    tooltip:  700,
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
    blue:  '0 0 8px rgba(var(--accent-primary-rgb),0.9), 0 0 20px rgba(var(--accent-primary-rgb),0.5), 0 0 44px rgba(var(--accent-primary-rgb),0.25), 0 0 80px rgba(var(--accent-primary-rgb),0.1)',
    violet: '0 0 8px rgba(var(--accent-secondary-rgb),0.9), 0 0 20px rgba(var(--accent-secondary-rgb),0.5), 0 0 44px rgba(var(--accent-secondary-rgb),0.25), 0 0 80px rgba(var(--accent-secondary-rgb),0.1)',
  },

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

  --accent-primary: ${tokens.color.accentBlue};
  --accent-secondary: ${tokens.color.accentViolet};
  --accent-primary-rgb: ${tokens.rgb.accentBlue};
  --accent-secondary-rgb: ${tokens.rgb.accentViolet};
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

  --shadow-xs: ${tokens.shadow.xs};
  --shadow-sm: ${tokens.shadow.sm};
  --shadow-md: ${tokens.shadow.md};
  --shadow-lg: ${tokens.shadow.lg};
  --shadow-xl: ${tokens.shadow.xl};
  --shadow-overlay: ${tokens.shadow.overlay};

  --z-base: ${tokens.zIndex.base};
  --z-dropdown: ${tokens.zIndex.dropdown};
  --z-sticky: ${tokens.zIndex.sticky};
  --z-drawer: ${tokens.zIndex.drawer};
  --z-modal: ${tokens.zIndex.modal};
  --z-popover: ${tokens.zIndex.popover};
  --z-toast: ${tokens.zIndex.toast};
  --z-tooltip: ${tokens.zIndex.tooltip};
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

  --font-body: ${tokens.font.body};
  --font-accent: ${tokens.font.accent};
  --font-mono: ${tokens.font.mono};

  --text-xs: ${tokens.fontSize.xs};
  --text-sm: ${tokens.fontSize.sm};
  --text-md: ${tokens.fontSize.md};
  --text-lg: ${tokens.fontSize.lg};
  --text-xl: ${tokens.fontSize.xl};
  --text-2xl: ${tokens.fontSize['2xl']};
  --text-3xl: ${tokens.fontSize['3xl']};

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
  --label-inline-spacing: 3px;

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
    textMuted:     'rgb(115, 118, 140)',
    textGhost:     'rgb(150, 152, 172)',
    borderSubtle:  'rgb(230, 232, 238)',
    borderDefault: 'rgb(210, 214, 222)',
    borderBright:  'rgb(190, 195, 205)',
    accentBlue:   'rgb(55, 105, 235)',
    accentViolet: 'rgb(120, 70, 230)',
  },
  rgb: {
    accentBlue:   '55, 105, 235',
    accentViolet: '120, 70, 230',
    textPrimary:  '35, 35, 55',
    textMuted:    '115, 118, 140',
  },
  glow: {
    blue:  '0 0 8px rgba(var(--accent-primary-rgb),0.5), 0 0 24px rgba(var(--accent-primary-rgb),0.2), 0 0 48px rgba(var(--accent-primary-rgb),0.08)',
    violet: '0 0 8px rgba(var(--accent-secondary-rgb),0.5), 0 0 24px rgba(var(--accent-secondary-rgb),0.2), 0 0 48px rgba(var(--accent-secondary-rgb),0.08)',
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
    blue: 'linear-gradient(90deg, transparent, rgba(var(--accent-primary-rgb),0.6), transparent)',
  },
  utility: {
    bgHover: 'rgba(55, 105, 235, 0.04)',
    overlayBackdrop: 'rgba(20, 20, 40, 0.25)',
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
    textSecondary: 'rgb(138, 138, 150)',
    textMuted:     'rgb(124, 124, 137)',
    textGhost:     'rgb(107, 107, 128)',
    borderSubtle:  'rgb(24, 24, 30)',
    borderDefault: 'rgb(34, 34, 41)',
    borderBright:  'rgb(51, 51, 64)',
    accentBlue:   'rgb(77, 126, 247)',
    accentViolet: 'rgb(139, 92, 246)',
  },
  rgb: {
    accentBlue:   '77, 126, 247',
    accentViolet: '139, 92, 246',
    textPrimary:  '232, 232, 236',
    textMuted:    '124, 124, 137',
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
    textSecondary: 'rgb(160, 165, 195)',
    textMuted:     'rgb(135, 140, 175)',
    textGhost:     'rgb(110, 115, 155)',
    borderSubtle:  'rgb(30, 30, 78)',
    borderDefault: 'rgb(42, 42, 92)',
    borderBright:  'rgb(56, 56, 108)',
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
  accentBlue: '--accent-primary', accentViolet: '--accent-secondary',
};

const rgbVarMap = {
  accentBlue: '--accent-primary-rgb', accentViolet: '--accent-secondary-rgb',
  textPrimary: '--text-primary-rgb', textMuted: '--text-muted-rgb',
  white: '--white-rgb', black: '--black-rgb',
};

const shadowVarMap = {
  xs: '--shadow-xs', sm: '--shadow-sm', md: '--shadow-md',
  lg: '--shadow-lg', xl: '--shadow-xl', overlay: '--shadow-overlay',
};

const gradientVarMap = {
  displayText: '--gradient-display-text', divider: '--gradient-divider',
  dividerGlow: '--gradient-divider-glow', pageAmbient: '--gradient-page-ambient',
  borderGlow: '--gradient-border-glow', ambient: '--gradient-ambient',
};

function renderOverrides(t, indent = '  ') {
  const lines = [];
  const add = (name, val) => lines.push(`${indent}${name}: ${val};`);

  if (t.color) for (const [k, v] of Object.entries(t.color)) if (colorVarMap[k]) add(colorVarMap[k], v);
  if (t.rgb)   for (const [k, v] of Object.entries(t.rgb))   if (rgbVarMap[k])   add(rgbVarMap[k], v);
  if (t.shadow) for (const [k, v] of Object.entries(t.shadow)) if (shadowVarMap[k]) add(shadowVarMap[k], v);

  if (t.gradient) for (const [k, v] of Object.entries(t.gradient)) if (gradientVarMap[k]) add(gradientVarMap[k], v);

  if (t.glow) {
    if (t.glow.blue)   add('--glow-primary', t.glow.blue);
    if (t.glow.violet) add('--glow-secondary', t.glow.violet);
    if (t.glow.white)  add('--glow-white', t.glow.white);
  }
  if (t.glowCard?.hover) add('--glow-card-hover', t.glowCard.hover);

  if (t.glowLine) {
    if (t.glowLine.white) add('--glow-line-white', t.glowLine.white);
    if (t.glowLine.blue)  add('--glow-line-blue', t.glowLine.blue);
  }

  if (t.utility) {
    if (t.utility.bgHover)          add('--bg-hover', t.utility.bgHover);
    if (t.utility.overlayBackdrop)  add('--overlay-backdrop', t.utility.overlayBackdrop);
  }

  return lines.join('\n');
}

/** Generate the full tokens.css content from JS data */
export function generateTokensCSS() {
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
