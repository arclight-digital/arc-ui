/**
 * presets.ts — somewhere to start that isn't the default.
 *
 * A blank tool asks the user to have an opinion before it shows them anything.
 * Each preset is a *partial* override applied over the shipped defaults, for
 * the same reason the export is partial: it demonstrates how few tokens a
 * recognisable theme actually takes.
 */
import { defaultState, toHex, type SynthState, type ThemeMode } from './schema';

export interface Preset {
  id: string;
  name: string;
  /** What this preset is for, in one line. */
  blurb: string;
  /** The two swatches shown on the preset chip. */
  swatches: [string, string];
  colors?: Partial<Record<ThemeMode, Record<string, string>>>;
  ranges?: Record<string, number>;
  fonts?: Record<string, string>;
}

export const PRESETS: Preset[] = [
  {
    id: 'default',
    name: 'ARC',
    blurb: 'The shipped theme. Blue into violet on near-black.',
    swatches: ['#4d7ef7', '#8b5cf6'],
  },
  {
    id: 'ember',
    name: 'Ember',
    blurb: 'Warm amber and rose over a browner black.',
    swatches: ['#f97316', '#e11d48'],
    colors: {
      dark: {
        '--accent-primary': '#f97316',
        '--accent-secondary': '#e11d48',
        '--bg-deep': '#0a0604',
        '--bg-surface': '#120c08',
        '--bg-base': '#120c08',
        '--bg-card': '#171009',
        '--bg-elevated': '#1e150d',
        '--border-subtle': '#241a10',
        '--border-default': '#33251a',
      },
      light: {
        '--accent-primary': '#c2410c',
        '--accent-secondary': '#be123c',
        '--bg-deep': '#faf5f0',
        '--bg-surface': '#fdfaf7',
        '--bg-base': '#fcf8f4',
        '--bg-card': '#fdfaf7',
      },
    },
  },
  {
    id: 'terminal',
    name: 'Terminal',
    blurb: 'Phosphor green, square corners, monospace body.',
    swatches: ['#4ade80', '#22d3ee'],
    colors: {
      dark: {
        '--accent-primary': '#4ade80',
        '--accent-secondary': '#22d3ee',
        '--bg-deep': '#000000',
        '--bg-surface': '#050705',
        '--bg-base': '#050705',
        '--bg-card': '#080b08',
        '--bg-elevated': '#0d110d',
        '--text-primary': '#d7f7de',
        '--border-subtle': '#12180f',
        '--border-default': '#1d2718',
      },
      light: {
        '--accent-primary': '#15803d',
        '--accent-secondary': '#0e7490',
      },
    },
    ranges: {
      '--radius-xs': 0,
      '--radius-sm': 0,
      '--radius-md': 0,
      '--radius-lg': 0,
      '--radius-xl': 2,
    },
    fonts: {
      '--font-body-family': "'JetBrains Mono'",
      '--font-body-fallback': 'ui-monospace, monospace',
      '--font-display-family': "'JetBrains Mono'",
    },
  },
  {
    id: 'glacier',
    name: 'Glacier',
    blurb: 'Cool cyan on slate. Softer corners, roomier spacing.',
    swatches: ['#38bdf8', '#818cf8'],
    colors: {
      dark: {
        '--accent-primary': '#38bdf8',
        '--accent-secondary': '#818cf8',
        '--bg-deep': '#05080e',
        '--bg-surface': '#0a0f18',
        '--bg-base': '#0a0f18',
        '--bg-card': '#0e141f',
        '--bg-elevated': '#131b28',
        '--border-subtle': '#161f2c',
        '--border-default': '#222e3f',
        '--border-bright': '#33445c',
      },
      light: {
        // sky-700, not sky-600: the brighter step reads well as a fill but
        // lands at 3.91:1 as text on this preset's card, under the 4.5 bar.
        // A starting point that ships a contrast failure teaches the wrong
        // lesson on the page whose job is to catch them.
        '--accent-primary': '#0369a1',
        '--accent-secondary': '#4f46e5',
        '--bg-deep': '#eef2f8',
        '--bg-surface': '#f7fafd',
        '--bg-base': '#f3f7fb',
        '--bg-card': '#f7fafd',
      },
    },
    ranges: {
      '--radius-sm': 8,
      '--radius-md': 14,
      '--radius-lg': 20,
      '--radius-xl': 28,
      '--space-md': 18,
      '--space-lg': 28,
    },
  },
  {
    id: 'monochrome',
    name: 'Monochrome',
    blurb: 'No hue at all. Everything has to earn its place through contrast.',
    swatches: ['#e5e5e5', '#a3a3a3'],
    colors: {
      dark: {
        '--accent-primary': '#e5e5e5',
        '--accent-secondary': '#a3a3a3',
        '--bg-deep': '#050505',
        '--bg-surface': '#0b0b0b',
        '--bg-base': '#0b0b0b',
        '--bg-card': '#101010',
        '--bg-elevated': '#161616',
        '--border-subtle': '#1c1c1c',
        '--border-default': '#282828',
        '--border-bright': '#3d3d3d',
      },
      light: {
        '--accent-primary': '#171717',
        '--accent-secondary': '#525252',
        '--bg-deep': '#f0f0f0',
        '--bg-surface': '#fafafa',
        '--bg-base': '#f6f6f6',
        '--bg-card': '#fafafa',
      },
    },
  },
  {
    id: 'orchid',
    name: 'Orchid',
    blurb: 'Magenta into violet, deeper surfaces, tighter type.',
    swatches: ['#d946ef', '#7c3aed'],
    colors: {
      dark: {
        '--accent-primary': '#d946ef',
        '--accent-secondary': '#7c3aed',
        '--bg-deep': '#08040c',
        '--bg-surface': '#0e0715',
        '--bg-base': '#0e0715',
        '--bg-card': '#130a1c',
        '--bg-elevated': '#1a0f26',
        '--border-subtle': '#1e1129',
        '--border-default': '#2c1a3c',
      },
      light: {
        '--accent-primary': '#a21caf',
        '--accent-secondary': '#6d28d9',
        '--bg-deep': '#f6f1fa',
        '--bg-surface': '#fbf8fd',
        '--bg-base': '#f9f5fc',
        '--bg-card': '#fbf8fd',
      },
    },
    ranges: { '--text-md': 16, '--body-lh': 1.6 },
  },
];

/** Build a full state from a preset, over the shipped defaults. */
export function applyPreset(preset: Preset): SynthState {
  const state = defaultState();
  for (const mode of ['dark', 'light'] as ThemeMode[]) {
    for (const [token, value] of Object.entries(preset.colors?.[mode] ?? {})) {
      state.colors[mode][token] = toHex(value);
    }
  }
  Object.assign(state.ranges, preset.ranges ?? {});
  Object.assign(state.fonts, preset.fonts ?? {});
  return state;
}
