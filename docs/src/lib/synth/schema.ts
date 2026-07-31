/**
 * schema.ts — what the synthesizer can edit, and what "unchanged" means.
 *
 * Every default here is READ FROM `shared/tokens.js`, never retyped. The
 * previous synthesizer carried a hand-copied `DEFAULTS` map, and by v3 it had
 * silently drifted: three of the four text colors, every status color in
 * light mode, and the whole font model were wrong, so the tool opened on a
 * theme the library does not ship and exported it as if it were the baseline.
 * Deriving the defaults makes that class of bug impossible — if a token moves
 * in the source of truth, the app moves with it.
 */
import { tokens, lightTokens } from '../../../../shared/tokens.js';

export type ThemeMode = 'dark' | 'light';

/** A color token, edited per theme. */
export interface ColorControl {
  token: string;
  label: string;
  /** Emit `<token>-rgb` alongside it — the channel triplet compounds read. */
  rgb?: boolean;
}

export interface ColorGroup {
  id: string;
  label: string;
  hint: string;
  controls: ColorControl[];
}

/** A numeric token, shared across themes. */
export interface RangeControl {
  token: string;
  label: string;
  min: number;
  max: number;
  step: number;
  unit: string;
  /** Draw the value as a spacing bar or a rounded corner beside the slider. */
  gauge?: 'space' | 'radius';
}

export interface RangeGroup {
  id: string;
  label: string;
  hint: string;
  controls: RangeControl[];
}

/** One of the five font role slots. */
export interface FontRole {
  role: string;
  label: string;
  hint: string;
  /** display follows body until assigned, so its family default is a var(). */
  familyFollowsBody?: boolean;
}

/* ── Color ─────────────────────────────────────────────────────────────── */

export const COLOR_GROUPS: ColorGroup[] = [
  {
    id: 'surfaces',
    label: 'Surfaces',
    hint: 'The five grounds, deepest first. Each step should read as lifting off the one below it.',
    controls: [
      { token: '--bg-deep', label: 'Deep' },
      { token: '--bg-surface', label: 'Surface' },
      { token: '--bg-base', label: 'Base' },
      { token: '--bg-card', label: 'Card' },
      { token: '--bg-elevated', label: 'Elevated' },
    ],
  },
  {
    id: 'text',
    label: 'Text',
    hint: 'Hierarchy comes from lifting to primary, not from stepping down the ramp — the lower three sit within 17 RGB points of each other.',
    controls: [
      { token: '--text-primary', label: 'Primary', rgb: true },
      { token: '--text-secondary', label: 'Secondary' },
      { token: '--text-muted', label: 'Muted', rgb: true },
      { token: '--text-ghost', label: 'Ghost' },
    ],
  },
  {
    id: 'borders',
    label: 'Borders',
    hint: 'Structure only. State is never marked with a border in ARC UI.',
    controls: [
      { token: '--border-subtle', label: 'Subtle' },
      { token: '--border-default', label: 'Default' },
      { token: '--border-bright', label: 'Bright' },
    ],
  },
  {
    id: 'accent',
    label: 'Accent',
    hint: 'The two colors the whole system is built on. Every gradient, glow and focus ring composes from these — change them and watch the preview.',
    controls: [
      { token: '--accent-primary', label: 'Primary', rgb: true },
      { token: '--accent-secondary', label: 'Secondary', rgb: true },
    ],
  },
  {
    id: 'status',
    label: 'Status',
    hint: 'Reserved for state. Keep them distinguishable from the accent pair, or a success badge reads as a brand element.',
    controls: [
      { token: '--color-success', label: 'Success', rgb: true },
      { token: '--color-warning', label: 'Warning', rgb: true },
      { token: '--color-error', label: 'Error', rgb: true },
      { token: '--color-info', label: 'Info', rgb: true },
    ],
  },
];

export const COLOR_TOKENS: string[] = COLOR_GROUPS.flatMap((g) => g.controls.map((c) => c.token));

/** Tokens whose `-rgb` channel triplet has to move with the color. */
export const RGB_TOKENS: string[] = COLOR_GROUPS.flatMap((g) =>
  g.controls.filter((c) => c.rgb).map((c) => c.token),
);

/* ── Type ───────────────────────────────────────────────────────────────── */

export const FONT_ROLES: FontRole[] = [
  { role: 'body', label: 'Body', hint: 'Prose, inputs, descriptions. The default for everything.' },
  { role: 'display', label: 'Display', hint: 'Large headings. Follows Body until you assign it.', familyFollowsBody: true },
  { role: 'label', label: 'Label', hint: 'Form labels, table headers, eyebrows. Small, uppercase, tracked.' },
  { role: 'mono', label: 'Mono', hint: 'Code, keyboard hints, tabular numerics.' },
  { role: 'quote', label: 'Quote', hint: 'The decorative glyph on arc-blockquote.' },
];

/**
 * Only the fixed steps of the type scale are exposed.
 *
 * `--text-lg` and up are `clamp()` expressions that carry the responsive
 * behavior of the whole system; handing them to a px slider would flatten
 * every heading to a fixed size, which is a downgrade dressed up as a control.
 */
export const TYPE_RANGES: RangeGroup = {
  id: 'scale',
  label: 'Scale',
  hint: 'The fixed steps. Sizes from lg up are fluid clamp() expressions and stay that way.',
  controls: [
    { token: '--text-xs', label: 'Extra small', min: 9, max: 16, step: 1, unit: 'px' },
    { token: '--text-sm', label: 'Small', min: 12, max: 20, step: 1, unit: 'px' },
    { token: '--text-md', label: 'Medium (body)', min: 13, max: 22, step: 1, unit: 'px' },
    { token: '--code-size', label: 'Code', min: 11, max: 18, step: 1, unit: 'px' },
    { token: '--body-lh', label: 'Body line height', min: 1.2, max: 2.2, step: 0.05, unit: '' },
    { token: '--code-lh', label: 'Code line height', min: 1.2, max: 2.2, step: 0.05, unit: '' },
  ],
};

/* ── Space ──────────────────────────────────────────────────────────────── */

export const SPACE_GROUPS: RangeGroup[] = [
  {
    id: 'spacing',
    label: 'Spacing',
    hint: 'The rhythm every component measures its padding and gaps against.',
    controls: [
      { token: '--space-xs', label: 'XS', min: 2, max: 8, step: 1, unit: 'px', gauge: 'space' },
      { token: '--space-sm', label: 'SM', min: 4, max: 16, step: 1, unit: 'px', gauge: 'space' },
      { token: '--space-md', label: 'MD', min: 8, max: 32, step: 1, unit: 'px', gauge: 'space' },
      { token: '--space-lg', label: 'LG', min: 12, max: 48, step: 1, unit: 'px', gauge: 'space' },
      { token: '--space-xl', label: 'XL', min: 24, max: 80, step: 2, unit: 'px', gauge: 'space' },
    ],
  },
  {
    id: 'radii',
    label: 'Radii',
    hint: 'Corner softness across the set. Zero everywhere gives a hard, terminal-flavoured build.',
    controls: [
      { token: '--radius-xs', label: 'XS', min: 0, max: 8, step: 1, unit: 'px', gauge: 'radius' },
      { token: '--radius-sm', label: 'SM', min: 0, max: 12, step: 1, unit: 'px', gauge: 'radius' },
      { token: '--radius-md', label: 'MD', min: 0, max: 24, step: 1, unit: 'px', gauge: 'radius' },
      { token: '--radius-lg', label: 'LG', min: 0, max: 32, step: 1, unit: 'px', gauge: 'radius' },
      { token: '--radius-xl', label: 'XL', min: 0, max: 40, step: 1, unit: 'px', gauge: 'radius' },
    ],
  },
  {
    id: 'layout',
    label: 'Layout',
    hint: 'Page measure and the height of the navigation row.',
    controls: [
      { token: '--max-width', label: 'Max width', min: 800, max: 1600, step: 20, unit: 'px' },
      { token: '--max-width-sm', label: 'Max width (narrow)', min: 560, max: 1000, step: 20, unit: 'px' },
      { token: '--nav-height', label: 'Nav height', min: 48, max: 96, step: 2, unit: 'px' },
    ],
  },
];

/* ── Motion ─────────────────────────────────────────────────────────────── */

/**
 * Durations, not `--transition-*`.
 *
 * The transition tokens are composed shorthands (`var(--duration-base)
 * var(--ease-standard)`), so overriding them the way the old synthesizer did
 * replaced the composition with a literal and cut the easing scale out of the
 * system. Moving the duration underneath retunes every shorthand that reads it.
 */
export const MOTION_GROUP: RangeGroup = {
  id: 'motion',
  label: 'Duration',
  hint: 'The transition tokens compose from these, so a change here retunes every animation that reads them.',
  controls: [
    { token: '--duration-fast', label: 'Fast', min: 60, max: 300, step: 10, unit: 'ms' },
    { token: '--duration-base', label: 'Base', min: 100, max: 500, step: 10, unit: 'ms' },
    { token: '--duration-slow', label: 'Slow', min: 200, max: 800, step: 20, unit: 'ms' },
    { token: '--duration-enter', label: 'Enter', min: 200, max: 900, step: 20, unit: 'ms' },
    { token: '--duration-exit', label: 'Exit', min: 100, max: 600, step: 20, unit: 'ms' },
  ],
};

export const RANGE_GROUPS: RangeGroup[] = [TYPE_RANGES, ...SPACE_GROUPS, MOTION_GROUP];

export const RANGE_CONTROLS: RangeControl[] = RANGE_GROUPS.flatMap((g) => g.controls);

/* ── Defaults, derived ──────────────────────────────────────────────────── */

/** `rgb(3, 3, 7)` / `#4d7ef7` → `#030307`. */
export function toHex(value: string): string {
  const v = value.trim();
  if (v.startsWith('#')) {
    if (v.length === 4) return '#' + [...v.slice(1)].map((c) => c + c).join('');
    return v.toLowerCase();
  }
  const m = v.match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/);
  if (!m) return '#000000';
  return channelsToHex([+m[1], +m[2], +m[3]]);
}

export function channelsToHex(ch: [number, number, number]): string {
  return '#' + ch.map((c) => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, '0')).join('');
}

export function hexToChannels(hex: string): [number, number, number] {
  const h = toHex(hex).slice(1);
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

/** Strip the unit off a token value so a slider can hold it as a number. */
function num(value: string | number): number {
  return typeof value === 'number' ? value : parseFloat(value);
}

const colorSource = (t: any) => ({
  '--bg-deep': t.color.bgDeep,
  '--bg-surface': t.color.bgSurface,
  '--bg-base': t.color.bgBase,
  '--bg-card': t.color.bgCard,
  '--bg-elevated': t.color.bgElevated,
  '--text-primary': t.color.textPrimary,
  '--text-secondary': t.color.textSecondary,
  '--text-muted': t.color.textMuted,
  '--text-ghost': t.color.textGhost,
  '--border-subtle': t.color.borderSubtle,
  '--border-default': t.color.borderDefault,
  '--border-bright': t.color.borderBright,
  '--accent-primary': t.color.accentPrimary,
  '--accent-secondary': t.color.accentSecondary,
  '--color-success': t.color.success,
  '--color-warning': t.color.warning,
  '--color-error': t.color.error,
  '--color-info': t.color.info,
});

function hexMap(source: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const token of COLOR_TOKENS) out[token] = toHex(source[token]);
  return out;
}

export const DEFAULT_COLORS: Record<ThemeMode, Record<string, string>> = {
  dark: hexMap(colorSource(tokens)),
  // lightTokens overrides a subset; anything it leaves alone keeps the dark value.
  light: hexMap({ ...colorSource(tokens), ...pruneUndefined(colorSource(lightTokens)) }),
};

function pruneUndefined(o: Record<string, string | undefined>): Record<string, string> {
  return Object.fromEntries(Object.entries(o).filter(([, v]) => v != null)) as Record<string, string>;
}

export const DEFAULT_FONTS: Record<string, string> = {
  '--font-body-family': tokens.font.body.family,
  '--font-body-fallback': tokens.font.body.fallback,
  '--font-body-weight': String(tokens.font.body.weight),
  '--font-display-family': 'var(--font-body-family)',
  '--font-display-fallback': 'var(--font-body-fallback)',
  '--font-display-weight': String(tokens.font.display.weight),
  '--font-label-family': tokens.font.label.family,
  '--font-label-fallback': tokens.font.label.fallback,
  '--font-label-weight': String(tokens.font.label.weight),
  '--font-mono-family': tokens.font.mono.family,
  '--font-mono-fallback': tokens.font.mono.fallback,
  '--font-mono-weight': String(tokens.font.mono.weight),
  '--font-quote-family': tokens.font.quote.family,
  '--font-quote-fallback': tokens.font.quote.fallback,
  '--font-quote-weight': String(tokens.font.quote.weight),
};

export const DEFAULT_RANGES: Record<string, number> = {
  '--text-xs': num(tokens.fontSize.xs),
  '--text-sm': num(tokens.fontSize.sm),
  '--text-md': num(tokens.fontSize.md),
  '--code-size': num(tokens.fontSize.code),
  '--body-lh': num(tokens.lineHeight.body),
  '--code-lh': num(tokens.lineHeight.code),
  '--space-xs': num(tokens.space.xs),
  '--space-sm': num(tokens.space.sm),
  '--space-md': num(tokens.space.md),
  '--space-lg': num(tokens.space.lg),
  '--space-xl': num(tokens.space.xl),
  '--radius-xs': num(tokens.radius.xs),
  '--radius-sm': num(tokens.radius.sm),
  '--radius-md': num(tokens.radius.md),
  '--radius-lg': num(tokens.radius.lg),
  '--radius-xl': num(tokens.radius.xl),
  '--max-width': num(tokens.layout.maxWidth),
  '--max-width-sm': num(tokens.layout.maxWidthSm),
  '--nav-height': num(tokens.layout.navHeight),
  '--duration-fast': num(tokens.duration.fast),
  '--duration-base': num(tokens.duration.base),
  '--duration-slow': num(tokens.duration.slow),
  '--duration-enter': num(tokens.duration.enter),
  '--duration-exit': num(tokens.duration.exit),
};

/** The whole editable surface, as one serialisable object. */
export interface SynthState {
  colors: Record<ThemeMode, Record<string, string>>;
  fonts: Record<string, string>;
  ranges: Record<string, number>;
}

export function defaultState(): SynthState {
  return {
    colors: { dark: { ...DEFAULT_COLORS.dark }, light: { ...DEFAULT_COLORS.light } },
    fonts: { ...DEFAULT_FONTS },
    ranges: { ...DEFAULT_RANGES },
  };
}

/** Deep-clone a state, so presets and history never alias the live object. */
export function cloneState(s: SynthState): SynthState {
  return {
    colors: { dark: { ...s.colors.dark }, light: { ...s.colors.light } },
    fonts: { ...s.fonts },
    ranges: { ...s.ranges },
  };
}

/** How many tokens the user has actually moved off the shipped defaults. */
export function changedCount(s: SynthState): number {
  let n = 0;
  for (const mode of ['dark', 'light'] as ThemeMode[]) {
    for (const token of COLOR_TOKENS) {
      if (s.colors[mode][token] !== DEFAULT_COLORS[mode][token]) n++;
    }
  }
  for (const [k, v] of Object.entries(s.fonts)) if (v !== DEFAULT_FONTS[k]) n++;
  for (const [k, v] of Object.entries(s.ranges)) if (v !== DEFAULT_RANGES[k]) n++;
  return n;
}
