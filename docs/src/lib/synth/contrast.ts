/**
 * contrast.ts — the check the docs already promised.
 *
 * /docs/accessibility tells people to use the synthesizer "to preview and test
 * your custom themes for accessibility". It had no contrast checking of any
 * kind, so the one thing the tool was cited for was the one thing it did not
 * do. These are the pairs that decide whether a theme is usable: text on the
 * grounds it is actually painted on, and the non-text elements that carry
 * meaning on their own.
 */
import { hexToChannels, type SynthState, type ThemeMode } from './schema';

/**
 * `info` reports a ratio without a verdict.
 *
 * WCAG 1.4.11 applies to boundaries required to *identify* a component, and
 * ARC UI marks state with tint and glow rather than with edges — its borders
 * are structure. Held to 3:1, the shipped default theme reports two failures
 * on `--border-bright` alone, and a warning that fires on the library's own
 * palette teaches people to ignore the warning. The ratio is still worth
 * seeing: a border nobody can find is a real thing to know about.
 */
export type Requirement = 'text' | 'large' | 'nontext' | 'info';

export interface ContrastPair {
  label: string;
  fg: string;
  bg: string;
  requirement: Requirement;
  /** What breaks if this pair fails, in the user's terms. */
  note: string;
}

export interface ContrastResult extends ContrastPair {
  ratio: number;
  /** The bar this pair has to clear: 4.5, 3, or 3. */
  threshold: number;
  passes: boolean;
  /** Text pairs that clear 7:1 also earn AAA. */
  aaa: boolean;
}

export const PAIRS: ContrastPair[] = [
  { label: 'Body text on card', fg: '--text-primary', bg: '--bg-card', requirement: 'text', note: 'The single most-read pairing in the system.' },
  { label: 'Body text on base', fg: '--text-primary', bg: '--bg-base', requirement: 'text', note: 'Page-level prose.' },
  { label: 'Secondary text on card', fg: '--text-secondary', bg: '--bg-card', requirement: 'text', note: 'Descriptions, table cells, helper copy.' },
  { label: 'Muted text on card', fg: '--text-muted', bg: '--bg-card', requirement: 'text', note: 'Timestamps and captions still have to be readable.' },
  { label: 'Ghost text on card', fg: '--text-ghost', bg: '--bg-card', requirement: 'text', note: 'The faintest step. Fails easily — reserve it for decoration.' },
  { label: 'Accent text on card', fg: '--accent-primary', bg: '--bg-card', requirement: 'text', note: 'Links and accent labels are read, not just seen.' },
  { label: 'Accent on deep', fg: '--accent-primary', bg: '--bg-deep', requirement: 'nontext', note: 'Focus rings and glows against the deepest ground.' },
  { label: 'Secondary accent on card', fg: '--accent-secondary', bg: '--bg-card', requirement: 'nontext', note: 'Gradient endpoints and secondary emphasis.' },
  { label: 'Success on card', fg: '--color-success', bg: '--bg-card', requirement: 'nontext', note: 'Status colour carrying meaning without text.' },
  { label: 'Warning on card', fg: '--color-warning', bg: '--bg-card', requirement: 'nontext', note: 'Status colour carrying meaning without text.' },
  { label: 'Error on card', fg: '--color-error', bg: '--bg-card', requirement: 'nontext', note: 'Status colour carrying meaning without text.' },
  { label: 'Info on card', fg: '--color-info', bg: '--bg-card', requirement: 'nontext', note: 'Status colour carrying meaning without text.' },
  { label: 'Bright border on card', fg: '--border-bright', bg: '--bg-card', requirement: 'info', note: 'Structure, not state — no threshold applies. Below about 1.3:1 the edge stops being findable.' },
  { label: 'Default border on card', fg: '--border-default', bg: '--bg-card', requirement: 'info', note: 'Structure, not state. Shown so you can see how far your surfaces and borders have drifted apart.' },
];

const THRESHOLDS: Record<Requirement, number> = { text: 4.5, large: 3, nontext: 3, info: 0 };

function channelLuminance(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

export function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToChannels(hex);
  return 0.2126 * channelLuminance(r) + 0.7152 * channelLuminance(g) + 0.0722 * channelLuminance(b);
}

/** WCAG 2.1 contrast ratio, 1–21. */
export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

export function auditTheme(state: SynthState, mode: ThemeMode): ContrastResult[] {
  const palette = state.colors[mode];
  return PAIRS.map((pair) => {
    const ratio = contrastRatio(palette[pair.fg], palette[pair.bg]);
    const threshold = THRESHOLDS[pair.requirement];
    return {
      ...pair,
      ratio,
      threshold,
      passes: pair.requirement === 'info' ? true : ratio >= threshold,
      aaa: pair.requirement === 'text' && ratio >= 7,
    };
  });
}

export interface AuditSummary {
  failures: number;
  total: number;
  /** The worst pair that is actually held to a threshold. */
  worst?: ContrastResult;
}

export function summarize(results: ContrastResult[]): AuditSummary {
  const judged = results.filter((r) => r.requirement !== 'info');
  const failing = judged.filter((r) => !r.passes);
  const worst = [...judged].sort((a, b) => a.ratio / a.threshold - b.ratio / b.threshold)[0];
  return { failures: failing.length, total: judged.length, worst };
}

export function formatRatio(ratio: number): string {
  return `${ratio.toFixed(2)}:1`;
}
