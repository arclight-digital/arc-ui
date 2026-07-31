import { LitElement, html, css, nothing } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/* ── Layout tables ──
   Plain module-level data, so the board is a pure function of props and
   server-renders without touching the DOM or the platform.

   Widths are quarter-key units: 1u = 4 columns, and every main-block row
   sums to 60 columns (the classic 15u ANSI row). The ansi layout appends a
   2-column gutter and a 12-column nav cluster, for 74 columns total. */

/** A key of `w` quarter-units. */
const k = (id, w = 4) => ({ id, w });
/** A spacer of `w` quarter-units — advances the cursor, renders nothing. */
const g = (w) => ({ gap: w });

const F_ROW = [
  k('esc'),
  g(4),
  k('f1'),
  k('f2'),
  k('f3'),
  k('f4'),
  g(2),
  k('f5'),
  k('f6'),
  k('f7'),
  k('f8'),
  g(2),
  k('f9'),
  k('f10'),
  k('f11'),
  k('f12'),
];

/* In compact, Esc takes the backquote position (the 60% convention); in
   ansi, Esc lives in the F-row and backquote returns home. */
const NUM_ROW_COMPACT = [
  k('esc'),
  k('1'),
  k('2'),
  k('3'),
  k('4'),
  k('5'),
  k('6'),
  k('7'),
  k('8'),
  k('9'),
  k('0'),
  k('minus'),
  k('equal'),
  k('backspace', 8),
];
const NUM_ROW_ANSI = [
  k('backquote'),
  k('1'),
  k('2'),
  k('3'),
  k('4'),
  k('5'),
  k('6'),
  k('7'),
  k('8'),
  k('9'),
  k('0'),
  k('minus'),
  k('equal'),
  k('backspace', 8),
];

const TOP_ROW = [
  k('tab', 6),
  k('q'),
  k('w'),
  k('e'),
  k('r'),
  k('t'),
  k('y'),
  k('u'),
  k('i'),
  k('o'),
  k('p'),
  k('bracketleft'),
  k('bracketright'),
  k('backslash', 6),
];

const HOME_ROW = [
  k('caps', 7),
  k('a'),
  k('s'),
  k('d'),
  k('f'),
  k('g'),
  k('h'),
  k('j'),
  k('k'),
  k('l'),
  k('semicolon'),
  k('quote'),
  k('enter', 9),
];

const SHIFT_ROW = [
  k('shift', 9),
  k('z'),
  k('x'),
  k('c'),
  k('v'),
  k('b'),
  k('n'),
  k('m'),
  k('comma'),
  k('period'),
  k('slash'),
  k('shift', 11),
];

/** Bottom row order follows the platform: Cmd flanks Space on a Mac board. */
function bottomRow(platform) {
  return platform === 'mac'
    ? [
        k('ctrl', 5),
        k('alt', 5),
        k('meta', 5),
        k('space', 30),
        k('meta', 5),
        k('alt', 5),
        k('ctrl', 5),
      ]
    : [
        k('ctrl', 5),
        k('meta', 5),
        k('alt', 5),
        k('space', 30),
        k('alt', 5),
        k('meta', 5),
        k('ctrl', 5),
      ];
}

/* Nav cluster (ansi only): absolute placements right of the 2-column
   gutter. Rows follow the physical board — Ins/Home/PgUp beside the number
   row, Del/End/PgDn beside the top row, arrows in the last two rows. */
const NAV_CLUSTER = [
  { id: 'insert', row: 2, col: 63, span: 4 },
  { id: 'home', row: 2, col: 67, span: 4 },
  { id: 'pageup', row: 2, col: 71, span: 4 },
  { id: 'delete', row: 3, col: 63, span: 4 },
  { id: 'end', row: 3, col: 67, span: 4 },
  { id: 'pagedown', row: 3, col: 71, span: 4 },
  { id: 'up', row: 5, col: 67, span: 4 },
  { id: 'left', row: 6, col: 63, span: 4 },
  { id: 'down', row: 6, col: 67, span: 4 },
  { id: 'right', row: 6, col: 71, span: 4 },
];

/** Every key with its grid placement, for one layout on one platform. */
function buildBoard(layout, platform) {
  const rows =
    layout === 'ansi'
      ? [F_ROW, NUM_ROW_ANSI, TOP_ROW, HOME_ROW, SHIFT_ROW, bottomRow(platform)]
      : [NUM_ROW_COMPACT, TOP_ROW, HOME_ROW, SHIFT_ROW, bottomRow(platform)];

  const keys = [];
  rows.forEach((row, r) => {
    let col = 1;
    for (const item of row) {
      if (item.gap) {
        col += item.gap;
        continue;
      }
      keys.push({ id: item.id, row: r + 1, col, span: item.w });
      col += item.w;
    }
  });
  if (layout === 'ansi') keys.push(...NAV_CLUSTER);
  return keys;
}

/* ── Chord parsing ──
   Mirrors arc-hotkey's normalization (hotkey keeps its parser private, so
   the aliases are restated here rather than imported): ctrl/control,
   meta/cmd/command, alt/option, shift — plus `mod`, which resolves to meta
   on mac and ctrl elsewhere, so one chord string documents both platforms. */

const MODIFIER_IDS = {
  ctrl: 'ctrl',
  control: 'ctrl',
  meta: 'meta',
  cmd: 'meta',
  command: 'meta',
  win: 'meta',
  windows: 'meta',
  shift: 'shift',
  alt: 'alt',
  option: 'alt',
  opt: 'alt',
};

/** Typed key name → board key id. Letters, digits and F-keys pass through. */
const KEY_IDS = {
  escape: 'esc',
  esc: 'esc',
  enter: 'enter',
  return: 'enter',
  space: 'space',
  spacebar: 'space',
  backspace: 'backspace',
  tab: 'tab',
  capslock: 'caps',
  caps: 'caps',
  delete: 'delete',
  del: 'delete',
  insert: 'insert',
  ins: 'insert',
  home: 'home',
  end: 'end',
  pageup: 'pageup',
  pgup: 'pageup',
  pagedown: 'pagedown',
  pgdn: 'pagedown',
  up: 'up',
  arrowup: 'up',
  down: 'down',
  arrowdown: 'down',
  left: 'left',
  arrowleft: 'left',
  right: 'right',
  arrowright: 'right',
  '-': 'minus',
  minus: 'minus',
  '=': 'equal',
  equal: 'equal',
  '[': 'bracketleft',
  ']': 'bracketright',
  '\\': 'backslash',
  ';': 'semicolon',
  semicolon: 'semicolon',
  "'": 'quote',
  quote: 'quote',
  ',': 'comma',
  comma: 'comma',
  '.': 'period',
  period: 'period',
  '/': 'slash',
  slash: 'slash',
  '`': 'backquote',
  backquote: 'backquote',
};

/** Board key id, or null when the name is not a key this board knows. */
function normalizeKey(name) {
  if (KEY_IDS[name]) return KEY_IDS[name];
  if (/^[a-z0-9]$/.test(name)) return name;
  if (/^f([1-9]|1[0-2])$/.test(name)) return name;
  return null;
}

/** "mod+shift+p" → { mods: ['meta','shift'], key: 'p' }. Unknown names drop out. */
function parseChord(chord, platform) {
  const mods = [];
  let key = null;
  for (const raw of chord.toLowerCase().split('+').filter(Boolean)) {
    const part = raw === 'mod' ? (platform === 'mac' ? 'meta' : 'ctrl') : raw;
    const mod = MODIFIER_IDS[part];
    if (mod) {
      if (!mods.includes(mod)) mods.push(mod);
    } else {
      key = normalizeKey(part);
    }
  }
  return { mods, key };
}

/** The highlight prop as a list of chord strings: array as-is, string split. */
function chordList(highlight) {
  if (Array.isArray(highlight)) return highlight.filter(Boolean).map(String);
  if (typeof highlight === 'string' && highlight.trim()) return highlight.trim().split(/[\s,]+/);
  return [];
}

/* ── Legends ── */

const MOD_LEGENDS = {
  mac: { ctrl: '⌃', alt: '⌥', shift: '⇧', meta: '⌘' },
  win: { ctrl: 'Ctrl', alt: 'Alt', shift: 'Shift', meta: 'Win' },
};

const BASE_LEGENDS = {
  esc: 'Esc',
  tab: 'Tab',
  caps: 'Caps',
  enter: 'Enter',
  backspace: '⌫',
  space: '',
  minus: '-',
  equal: '=',
  bracketleft: '[',
  bracketright: ']',
  backslash: '\\',
  semicolon: ';',
  quote: "'",
  comma: ',',
  period: '.',
  slash: '/',
  backquote: '`',
  insert: 'Ins',
  delete: 'Del',
  home: 'Home',
  end: 'End',
  pageup: 'PgUp',
  pagedown: 'PgDn',
  up: '↑',
  down: '↓',
  left: '←',
  right: '→',
};

function legendFor(id, platform) {
  const mods = platform === 'mac' ? MOD_LEGENDS.mac : MOD_LEGENDS.win;
  if (mods[id]) return mods[id];
  if (id in BASE_LEGENDS) return BASE_LEGENDS[id];
  return id.toUpperCase();
}

/* ── Accessible chord names ──
   Words rather than glyphs, spelled the way shortcut docs spell them:
   the primary modifier first (Ctrl or Cmd), then Alt, then Shift — so a
   screen reader hears "Cmd+Shift+P", not the glyph order "Shift+Cmd+P". */

const MOD_NAMES = {
  mac: { ctrl: 'Ctrl', alt: 'Option', shift: 'Shift', meta: 'Cmd' },
  win: { ctrl: 'Ctrl', alt: 'Alt', shift: 'Shift', meta: 'Win' },
};
const MOD_ORDER = ['ctrl', 'meta', 'alt', 'shift'];

const KEY_NAMES = {
  esc: 'Esc',
  tab: 'Tab',
  caps: 'Caps Lock',
  enter: 'Enter',
  backspace: 'Backspace',
  space: 'Space',
  insert: 'Insert',
  delete: 'Delete',
  home: 'Home',
  end: 'End',
  pageup: 'Page Up',
  pagedown: 'Page Down',
  up: 'Up',
  down: 'Down',
  left: 'Left',
  right: 'Right',
  minus: '-',
  equal: '=',
  bracketleft: '[',
  bracketright: ']',
  backslash: '\\',
  semicolon: ';',
  quote: "'",
  comma: ',',
  period: '.',
  slash: '/',
  backquote: '`',
};

function chordName({ mods, key }, platform) {
  const names = platform === 'mac' ? MOD_NAMES.mac : MOD_NAMES.win;
  const parts = MOD_ORDER.filter((m) => mods.includes(m)).map((m) => names[m]);
  if (key) parts.push(KEY_NAMES[key] ?? key.toUpperCase());
  return parts.join('+');
}

/**
 * A rendered keyboard with highlighted keys and chords — the visual big
 * sibling of arc-kbd and arc-hotkey, for shortcut documentation and editor
 * cheat sheets. Every key named in `highlight` lights up with the house
 * state marking: accent tint, glow, accent legend text.
 *
 * The board is a stylised diagram, not a keyboard configurator: `compact`
 * (the default) is a 60%-style block without nav cluster or numpad — enough
 * for almost all shortcut documentation — and `ansi` adds the F-row and nav
 * cluster. There is deliberately no ISO/JIS machinery; a diagram that
 * chased physical-layout fidelity would trade its one job (making a chord
 * legible at a glance) for configuration surface.
 *
 * It is pure display typography — no slots, no click events, nothing
 * focusable. A shortcut diagram that responded to clicks would imply the
 * keys do something; wiring real shortcuts is arc-hotkey's job.
 *
 * @tag arc-keyboard-map
 * @prop {string} layout - Board shape: "compact" (default, a 60%-style block) or "ansi" (adds the F-row and nav cluster). Unknown values fall back to compact.
 * @prop {string|string[]} highlight - Key chords to light up: an array property (e.g. ["mod+z", "mod+shift+z"]) or a comma- or space-separated attribute string. Each chord joins keys with "+" ("mod+shift+p"); `mod` resolves to Cmd on mac and Ctrl on win, mirroring arc-hotkey's aliases (cmd/command → meta, option → alt, control → ctrl). Single keys are fine ("g", "escape"). Unknown key names are ignored.
 * @prop {boolean} labels - Whether keys render their legends (default true; set the attribute to the string "false" to disable from markup).
 * @prop {string} platform - Which platform's modifier legends and `mod` resolution to use: "auto" (default — detected in the browser, mac on the server), "mac", or "win".
 * @prop {string} caption - Optional caption rendered below the board in muted text.
 * @slot none
 * @csspart board
 * @csspart key
 * @csspart key-highlighted
 * @csspart caption
 */
export class ArcKeyboardMap extends LitElement {
  static properties = {
    layout: { type: String, reflect: true },
    highlight: {},
    labels: { type: Boolean, converter: { fromAttribute: (v) => v !== 'false' } },
    platform: { type: String },
    caption: { type: String },
    _detected: { state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: block;
        container-type: inline-size;
      }

      .map { margin: 0; }

      /* One knob scales the whole board: key height tracks the container
         width so caps stay square-ish, and the grid columns carry width. */
      .board {
        --_key: var(--keyboard-map-key, clamp(20px, 6.2cqw, 46px));
        --_gap: var(--keyboard-map-gap, clamp(2px, 0.55cqw, 6px));
        display: grid;
        grid-template-columns: repeat(60, minmax(0, 1fr));
        grid-auto-rows: var(--_key);
        gap: var(--_gap);
      }

      /* ansi is 18.5 units wide to compact's 15, so its default key runs
         proportionally smaller in the same container. */
      .board--ansi {
        --_key: var(--keyboard-map-key, clamp(16px, 5cqw, 42px));
        grid-template-columns: repeat(74, minmax(0, 1fr));
      }

      /* arc-kbd's keycap language, scaled: same surface, border, depth. */
      .key {
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 0;
        overflow: hidden;
        font-family: var(--font-mono);
        font-size: clamp(8px, calc(var(--_key) * 0.32), 13px);
        line-height: 1;
        color: var(--text-secondary);
        background: var(--surface-overlay);
        border: 1px solid var(--border-default);
        border-bottom-width: 2px;
        border-radius: var(--radius-sm);
        white-space: nowrap;
        user-select: none;
        transition:
          color var(--transition-fast),
          background-color var(--transition-fast),
          border-color var(--transition-fast),
          box-shadow var(--transition-fast);
      }

      /* The house state marking: tint, glow, accent text — never an edge. */
      .key--hit {
        color: var(--accent-primary);
        background: rgba(var(--accent-primary-rgb), 0.16);
        border-color: rgba(var(--accent-primary-rgb), 0.45);
        box-shadow: var(--glow-sm);
      }

      .caption {
        margin-block-start: var(--space-sm);
        font-family: var(--font-label);
        font-size: var(--_text-xs);
        color: var(--text-muted);
        text-align: center;
      }

      /* Below this the legends are unreadable noise; the highlight pattern
         still carries the information, so they step out. */
      @container (max-width: 340px) {
        .key__legend { display: none; }
      }

      @media (prefers-reduced-motion: reduce) {
        .key { transition: none; }
      }
    `,
  ];

  constructor() {
    super();
    this.layout = 'compact';
    this.highlight = '';
    this.labels = true;
    this.platform = 'auto';
    this.caption = '';
    /* Server-safe default; the real detection waits for connectedCallback,
       so a Node render never reads navigator (the connection-status rule). */
    this._detected = 'mac';
  }

  connectedCallback() {
    super.connectedCallback();
    if (typeof navigator !== 'undefined') {
      const p = navigator.platform || navigator.userAgent || '';
      this._detected = /mac|iphone|ipad|ipod/i.test(p) ? 'mac' : 'win';
    }
  }

  /** The platform actually rendered: an explicit prop wins, else detection. */
  get _platform() {
    if (this.platform === 'mac' || this.platform === 'win') return this.platform;
    return this._detected;
  }

  /** Unknown layout values land on the default, per the enum-fallback rule. */
  get _layout() {
    return this.layout === 'ansi' ? 'ansi' : 'compact';
  }

  /** Parsed chords, unknown-only chords dropped. */
  _chords(platform) {
    return chordList(this.highlight)
      .map((c) => parseChord(c, platform))
      .filter((c) => c.mods.length > 0 || c.key !== null);
  }

  /** Every board key id lit by any chord. */
  _highlightSet(chords) {
    const set = new Set();
    for (const { mods, key } of chords) {
      for (const m of mods) set.add(m);
      if (key) set.add(key);
    }
    return set;
  }

  _ariaLabel(chords, platform) {
    const names = chords.map((c) => chordName(c, platform)).filter(Boolean);
    return names.length ? `Keyboard diagram highlighting ${names.join(', ')}` : 'Keyboard diagram';
  }

  render() {
    const platform = this._platform;
    const layout = this._layout;
    const chords = this._chords(platform);
    const hits = this._highlightSet(chords);
    const keys = buildBoard(layout, platform);

    return html`
      <figure class="map">
        <div
          class="board board--${layout}"
          part="board"
          role="img"
          aria-label=${this._ariaLabel(chords, platform)}
        >
          ${keys.map((key) =>
            hits.has(key.id)
              ? html`
            <kbd
              class="key key--hit"
              part="key key-highlighted"
              data-key=${key.id}
              style="grid-row: ${key.row}; grid-column: ${key.col} / span ${key.span};"
              aria-hidden="true"
            >${this.labels ? html`<span class="key__legend">${legendFor(key.id, platform)}</span>` : nothing}</kbd>`
              : html`
            <kbd
              class="key"
              part="key"
              data-key=${key.id}
              style="grid-row: ${key.row}; grid-column: ${key.col} / span ${key.span};"
              aria-hidden="true"
            >${this.labels ? html`<span class="key__legend">${legendFor(key.id, platform)}</span>` : nothing}</kbd>`,
          )}
        </div>
        ${
          this.caption
            ? html`<figcaption class="caption" part="caption">${this.caption}</figcaption>`
            : nothing
        }
      </figure>
    `;
  }
}
