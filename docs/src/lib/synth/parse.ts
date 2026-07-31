/**
 * parse.ts — read a theme back in.
 *
 * Round-tripping matters more than it looks: most people arrive at the
 * synthesizer already shipping a theme, and without an import the tool asks
 * them to rebuild it from defaults by eye before it can help. This accepts
 * what the tool emits, what `shared/tokens.js` emits, and the loose middle
 * ground of a stylesheet somebody hand-edited.
 */
import {
  COLOR_TOKENS,
  RANGE_CONTROLS,
  cloneState,
  defaultState,
  toHex,
  type SynthState,
  type ThemeMode,
} from './schema';

export interface ImportReport {
  state: SynthState;
  /** Tokens recognised and applied. */
  applied: string[];
  /** Declarations that named an ARC token the synthesizer does not edit. */
  ignored: string[];
  ok: boolean;
  message: string;
}

const RANGE_BY_TOKEN = new Map(RANGE_CONTROLS.map((c) => [c.token, c]));

/** Which theme a selector block writes to — or null if it isn't a theme block. */
function modeForSelector(selector: string): ThemeMode | null {
  const s = selector.toLowerCase();
  if (s.includes('data-theme="light"') || s.includes("data-theme='light'")) return 'light';
  if (s.includes('data-theme="auto"') || s.includes("data-theme='auto'")) return 'light';
  if (s.includes('data-theme="dark"') || s.includes("data-theme='dark'")) return 'dark';
  if (s.includes(':root') || s.trim() === 'html' || s.includes('.theme-')) return 'dark';
  return null;
}

/**
 * A bare colour — someone pasting just an accent, which is the most common
 * thing anyone has on hand.
 */
function parseBareColor(text: string): string | null {
  const t = text.trim();
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(t)) return toHex(t);
  if (/^rgba?\([^)]+\)$/i.test(t)) return toHex(t);
  return null;
}

export function importTheme(text: string, base?: SynthState): ImportReport {
  const state = base ? cloneState(base) : defaultState();
  const applied: string[] = [];
  const ignored: string[] = [];

  const bare = parseBareColor(text);
  if (bare) {
    state.colors.dark['--accent-primary'] = bare;
    state.colors.light['--accent-primary'] = bare;
    return {
      state,
      applied: ['--accent-primary'],
      ignored: [],
      ok: true,
      message: 'Read a single colour and assigned it to the primary accent in both themes.',
    };
  }

  // Strip comments first: a commented-out declaration is not a declaration,
  // and the old header block is full of token names in prose.
  const clean = text.replace(/\/\*[\s\S]*?\*\//g, '');

  // Walk selector blocks rather than regexing declarations globally, so a
  // light-theme block lands in the light palette instead of overwriting dark.
  const blockRe = /([^{}]+)\{([^{}]*)\}/g;
  let match: RegExpExecArray | null;
  let sawBlock = false;

  while ((match = blockRe.exec(clean)) !== null) {
    const selector = match[1].trim();
    const body = match[2];
    // A media query wrapper has no declarations of its own; its inner block is
    // matched separately on the next pass, so skipping it here is correct.
    if (!body.includes(':')) continue;

    const mode = modeForSelector(selector);
    if (!mode) continue;
    sawBlock = true;

    for (const [, token, rawValue] of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);?/g)) {
      const value = rawValue.trim();
      if (applyDeclaration(state, mode, token, value)) applied.push(token);
      else if (!token.endsWith('-rgb')) ignored.push(token);
    }
  }

  if (!sawBlock) {
    return {
      state,
      applied: [],
      ignored: [],
      ok: false,
      message: 'Found no :root or [data-theme] block. Paste a stylesheet, or a single colour to set the accent.',
    };
  }

  // Tokens a partial paste never mentions keep the shipped default for their
  // own theme — the state was seeded per-mode, so a dark-only stylesheet
  // leaves a working light theme behind rather than a dark one mislabelled.
  const uniqueApplied = [...new Set(applied)];
  const uniqueIgnored = [...new Set(ignored)];
  return {
    state,
    applied: uniqueApplied,
    ignored: uniqueIgnored,
    ok: uniqueApplied.length > 0,
    message: uniqueApplied.length
      ? `Applied ${uniqueApplied.length} token${uniqueApplied.length === 1 ? '' : 's'}` +
        (uniqueIgnored.length ? `, skipped ${uniqueIgnored.length} the synthesizer doesn't edit.` : '.')
      : 'Found a stylesheet, but none of its declarations name a token the synthesizer edits.',
  };
}

function applyDeclaration(state: SynthState, mode: ThemeMode, token: string, value: string): boolean {
  // The -rgb channels are derived on export; reading them back would let a
  // stale triplet disagree with the colour it is supposed to mirror.
  if (token.endsWith('-rgb')) return false;

  if (COLOR_TOKENS.includes(token)) {
    if (value.startsWith('var(')) return false;
    const hex = toHex(value);
    if (hex === '#000000' && !/(^#0{3,6}$)|(\b0[,\s]+0[,\s]+0\b)/.test(value)) return false;
    state.colors[mode][token] = hex;
    return true;
  }

  if (token.startsWith('--font-')) {
    if (state.fonts[token] === undefined) return false;
    state.fonts[token] = value;
    return true;
  }

  const range = RANGE_BY_TOKEN.get(token);
  if (range) {
    const n = parseFloat(value);
    if (Number.isNaN(n)) return false;
    state.ranges[token] = Math.min(range.max, Math.max(range.min, n));
    return true;
  }

  return false;
}
