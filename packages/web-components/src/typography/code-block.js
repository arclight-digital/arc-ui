import { LitElement, html, css, nothing } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import '../input/copy-button.js';
import '../layout/status-bar.js';
import { DeclaredPropsMixin, oneOf, flag, int } from '../shared/props.js';
import { observeResize } from '../shared/subscriptions.js';

/* ── Shared Shiki highlighter (singleton, lazy, loaded on first use) ── */
let _hlReady;
const _loadedLangs = new Set();

/* Lang name → dynamic import from @shikijs/langs */
const LANG_IMPORT = {
  javascript: () => import('@shikijs/langs/javascript'),
  js: () => import('@shikijs/langs/javascript'),
  typescript: () => import('@shikijs/langs/typescript'),
  ts: () => import('@shikijs/langs/typescript'),
  jsx: () => import('@shikijs/langs/jsx'),
  tsx: () => import('@shikijs/langs/tsx'),
  html: () => import('@shikijs/langs/html'),
  css: () => import('@shikijs/langs/css'),
  json: () => import('@shikijs/langs/json'),
  bash: () => import('@shikijs/langs/bash'),
  shell: () => import('@shikijs/langs/shellscript'),
  sh: () => import('@shikijs/langs/shellscript'),
  zsh: () => import('@shikijs/langs/shellscript'),
  python: () => import('@shikijs/langs/python'),
  py: () => import('@shikijs/langs/python'),
  ruby: () => import('@shikijs/langs/ruby'),
  rb: () => import('@shikijs/langs/ruby'),
  go: () => import('@shikijs/langs/go'),
  rust: () => import('@shikijs/langs/rust'),
  rs: () => import('@shikijs/langs/rust'),
  java: () => import('@shikijs/langs/java'),
  php: () => import('@shikijs/langs/php'),
  swift: () => import('@shikijs/langs/swift'),
  kotlin: () => import('@shikijs/langs/kotlin'),
  yaml: () => import('@shikijs/langs/yaml'),
  yml: () => import('@shikijs/langs/yaml'),
  toml: () => import('@shikijs/langs/toml'),
  xml: () => import('@shikijs/langs/xml'),
  markdown: () => import('@shikijs/langs/markdown'),
  md: () => import('@shikijs/langs/markdown'),
  sql: () => import('@shikijs/langs/sql'),
  graphql: () => import('@shikijs/langs/graphql'),
  docker: () => import('@shikijs/langs/docker'),
  dockerfile: () => import('@shikijs/langs/docker'),
  c: () => import('@shikijs/langs/c'),
  cpp: () => import('@shikijs/langs/cpp'),
  csharp: () => import('@shikijs/langs/csharp'),
  cs: () => import('@shikijs/langs/csharp'),
  scss: () => import('@shikijs/langs/scss'),
  less: () => import('@shikijs/langs/less'),
  svelte: () => import('@shikijs/langs/svelte'),
  vue: () => import('@shikijs/langs/vue'),
  astro: () => import('@shikijs/langs/astro'),
  diff: () => import('@shikijs/langs/diff'),
  regex: () => import('@shikijs/langs/regex'),
};

/**
 * Say it once, when shiki isn't installed.
 *
 * shiki is an optional peer: it is 13.6 MB with its grammars, and every other
 * component in the library reaches none of it, so its absence is a supported
 * state, not an error. The code still renders; it just isn't colored. But a
 * missing highlighter that says nothing is indistinguishable from a broken
 * theme or an unrecognized language, so it says something.
 */
let _warnedMissing = false;
function warnMissingShiki(err) {
  if (_warnedMissing) return;
  _warnedMissing = true;
  console.warn(
    '[arc-code-block] shiki is not installed, so code renders without syntax ' +
      'highlighting. Install it to enable highlighting:\n' +
      '  npm install shiki @shikijs/langs\n' +
      `(${err?.message ?? err})`,
  );
}


/** Languages whose blocks take a prompt and the shell token colors. */
const SHELL = new Set(['bash', 'shell', 'sh', 'zsh']);

/**
 * Wrappers whose first argument is the command that actually runs. The wrapper
 * is muted and the command after it takes the command color, so
 * `sudo bootc switch` reads as `bootc` being run.
 */
const WRAPPERS = new Set(['sudo', 'doas', 'env', 'time', 'exec', 'nohup', 'xargs', 'command', 'nice']);

/**
 * Shell scopes the css-variables theme folds together.
 *
 * Its rules color every bash argument as a string, so a command line came out
 * as one green run after the command name. These rules are more specific than
 * the theme's `string` rule, so they win for shell and leave every other
 * grammar as it was. Each one is a --shiki-token-* variable, mapped to an ARC
 * token in the component styles.
 */
const SHELL_RULES = [
  {
    scope: ['entity.name.command.shell', 'entity.name.function.call.shell', 'support.function.builtin.shell'],
    settings: { foreground: 'var(--shiki-token-command)' },
  },
  { scope: ['string.unquoted.argument.shell'], settings: { foreground: 'var(--shiki-token-argument)' } },
  { scope: ['constant.other.option'], settings: { foreground: 'var(--shiki-token-flag)' } },
  {
    scope: [
      'variable.other.normal.shell',
      'variable.other.positional.shell',
      'variable.other.special.shell',
      'variable.other.bracket.shell',
      'variable.parameter.positional.shell',
      'punctuation.definition.variable.shell',
    ],
    settings: { foreground: 'var(--shiki-token-variable)' },
  },
  {
    scope: [
      'keyword.operator.pipe.shell',
      'keyword.operator.redirect.shell',
      'keyword.operator.logical.shell',
      'punctuation.separator.statement.and.shell',
      'punctuation.separator.statement.or.shell',
      'punctuation.separator.statement.semicolon.shell',
      'punctuation.separator.statement.background.shell',
    ],
    settings: { foreground: 'var(--shiki-token-operator)' },
  },
  {
    scope: ['constant.character.escape.line-continuation.shell'],
    settings: { foreground: 'var(--shiki-token-continuation)' },
  },
];

const ARGUMENT = 'var(--shiki-token-argument)';
const COMMAND = 'var(--shiki-token-command)';
const PREFIX = 'var(--shiki-token-prefix)';
const SUBCOMMAND = 'var(--shiki-token-subcommand)';
const PATH = 'var(--shiki-token-path)';

async function getHL(lang) {
  if (!_hlReady) {
    _hlReady = (async () => {
      const [{ createHighlighterCore, createCssVariablesTheme }, { createJavaScriptRegexEngine }] =
        await Promise.all([import('shiki/core'), import('shiki/engine/javascript')]).catch(
          (err) => {
            warnMissingShiki(err);
            throw err;
          },
        );
      const theme = createCssVariablesTheme({
        name: 'arc-tokens',
        variablePrefix: '--shiki-',
        variableDefaults: {},
        fontStyle: true,
      });
      theme.tokenColors = [...theme.tokenColors, ...SHELL_RULES];
      return createHighlighterCore({
        themes: [theme],
        langs: [],
        engine: createJavaScriptRegexEngine(),
      });
    })();
  }
  const hl = await _hlReady;
  if (!_loadedLangs.has(lang)) {
    const loader = LANG_IMPORT[lang];
    if (!loader) return null;
    // The grammars are a second optional package, so they can be missing on
    // their own: same supported state, same one-time explanation.
    try {
      await hl.loadLanguage(loader);
    } catch (err) {
      warnMissingShiki(err);
      throw err;
    }
    _loadedLangs.add(lang);
  }
  return hl;
}

/**
 * The shell colors the grammar has no scopes for, read from the token text: a
 * wrapper like `sudo` is muted and the command after it takes the command
 * color; the first plain argument after a command is its subcommand
 * (`bootc switch`, `npm install`); an argument that names a place (a path, a
 * URL, an image reference) takes the path color. State runs across a
 * backslash continuation, since the grammar keeps the statement open there,
 * and resets at each new command.
 */
function refineShell(lines) {
  let sub = false;
  for (const line of lines) {
    for (const tok of line) {
      const word = tok.content.trim();
      if (tok.color === COMMAND) {
        if (WRAPPERS.has(word)) {
          tok.color = PREFIX;
          sub = 'wrapped';
        } else {
          sub = true;
        }
        continue;
      }
      if (tok.color !== ARGUMENT || !word) continue;
      if (sub === 'wrapped') {
        tok.color = COMMAND;
        sub = true;
      } else if (/[/.:@~]/.test(word)) {
        tok.color = PATH;
      } else if (sub) {
        tok.color = SUBCOMMAND;
        sub = false;
      }
    }
  }
  return lines;
}

/** `"2,4-6"` → a Set of 1-based line numbers. Junk entries are ignored. */
function parseRanges(value) {
  const out = new Set();
  for (const part of String(value ?? '').split(',')) {
    const m = part.trim().match(/^(\d+)(?:\s*-\s*(\d+))?$/);
    if (!m) continue;
    const a = Number(m[1]);
    const b = m[2] ? Number(m[2]) : a;
    for (let n = Math.min(a, b); n <= Math.max(a, b) && n - a < 10000; n++) out.add(n);
  }
  return out;
}

/**
 * Syntax-highlighted code display with an optional title, filename, copy
 * button, line numbers, line emphasis, a shell prompt and a collapsed height.
 *
 * Code renders line by line, highlighted or not, so the numbers, the prompt,
 * emphasis and diff tints work without shiki installed, and the colors
 * arriving never move a line.
 *
 * @tag arc-code-block
 * @status stable
 * @requires arc-status-bar
 * @requires arc-copy-button
 * @prop {'default' | 'window' | 'basic'} variant - Visual variant. `default` shows the standard layout with an optional header and status bar. `window` adds a macOS-style title bar with colored orbs and a centered title. `basic` strips all chrome for a compact display.
 * @prop {string} language - Language identifier (e.g. `js`, `css`, `bash`). Shown in uppercase in the header and used to pick the highlighter grammar.
 * @prop {string} label - A plain title for the header in the body font, such as "Pulsar for NVIDIA". Shown before the filename when both are set. Also the tab name inside an arc-code-group.
 * @prop {string} filename - A filename for the header, in monospace. When `label` is also set it follows the label, muted.
 * @prop {string} code - The code to display. Copied as-is by the copy button: no prompts, no line numbers.
 * @prop {string} prompt - Shows a prompt before each command line, never selectable and never copied. Set with no value for `$`, or give the character (`#`, `>`, `PS>`). Continuation lines after a trailing backslash and blank lines get none.
 * @prop {boolean} lineNumbers - Shows line numbers in a gutter that is not selected or copied.
 * @prop {string} highlight - Lines to emphasize, 1-based: a comma-separated list of numbers and ranges such as `2,4-6`.
 * @prop {boolean} diff - Tints lines that start with `+` as added and `-` as removed, on top of the block's own language. Always on for `language="diff"`.
 * @prop {boolean} wrap - Soft-wraps long lines instead of scrolling them. Wrapped text stays aligned after the line number and prompt.
 * @prop {number} maxLines - Collapses a longer block to this many lines, with a fade and a button to show the rest.
 * @fires arc-toggle - Fired when a collapsed block is expanded or collapsed again. `detail.value` is `true` when expanded.
 * @slot none
 * @csspart base - The root element.
 * @csspart titlebar
 * @csspart orbs
 * @csspart label
 * @csspart filename
 * @csspart header
 * @csspart lang
 * @csspart status-bar
 * @csspart lines
 * @csspart code-block
 * @csspart copy
 * @csspart body
 * @csspart pre
 * @csspart code
 * @csspart line - One line of code. Emphasized lines add `line-highlight`, diff lines `line-add` or `line-remove`.
 * @csspart line-highlight
 * @csspart line-add
 * @csspart line-remove
 * @csspart gutter - The line number cell. The number is its `::before`.
 * @csspart prompt - The prompt cell. The prompt is its `::before`.
 * @csspart expand - The show-all / show-fewer button of a collapsed block.
 */
export class ArcCodeBlock extends DeclaredPropsMixin(LitElement) {
  static properties = {
    language: { type: String, reflect: true },
    label: { type: String, reflect: true },
    filename: { type: String, reflect: true },
    code: { type: String },
    variant: oneOf(['default', 'window', 'basic']),
    prompt: { type: String, reflect: true },
    lineNumbers: flag(false, { attribute: 'line-numbers' }),
    highlight: { type: String },
    diff: flag(false),
    wrap: flag(false),
    maxLines: int({ nullable: true, min: 1, attribute: 'max-lines' }),
    _tokens: { state: true },
    _overflows: { state: true },
    _expanded: { state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: block; }

      .code-block {
        position: relative;
        background: var(--surface-primary);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-lg);
        overflow: hidden;
      }

      /* ── Header chrome ──────────────────────────────────────────────────
         A 36px bar: the title in the body font, the filename in mono, the
         language as a quiet mono tag at the end, and an icon-only copy. */
      .code-block__header {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        min-height: 36px;
        box-sizing: border-box;
        padding-block: 0;
        padding-inline: var(--space-md) 4px;
        border-bottom: 1px solid var(--divider);
        background: var(--surface-raised);
      }

      .code-block__title {
        display: flex;
        align-items: baseline;
        gap: var(--space-sm);
        min-width: 0;
      }

      .code-block__label {
        font-family: var(--font-body);
        font-size: var(--_text-sm);
        font-weight: var(--font-body-weight, 500);
        color: var(--text-secondary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .code-block__filename {
        font-family: var(--font-mono);
        font-size: var(--_text-sm);
        color: var(--text-muted);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .code-block__filename:empty {
        display: none;
      }

      .code-block__lang {
        font-family: var(--font-mono);
        font-size: var(--_text-xs);
        color: var(--text-ghost);
      }

      /* The language, or the copy button when there is no language, takes
         the free space so both sit at the end. */
      .code-block__header > .code-block__lang,
      .code-block__header > .code-block__copy.code-block__copy--bar {
        margin-inline-start: auto;
      }

      .code-block__header > .code-block__lang ~ .code-block__copy.code-block__copy--bar {
        margin-inline-start: 0;
      }

      /* ── end header chrome ── */

      .code-block__body-wrap {
        position: relative;
      }

      .code-block__body {
        padding: var(--space-md);
        /* Inside the scroller on purpose. Code that fits never reaches under
           the button, and code that overflows clears it once scrolled to the
           end. Held on the wrapper instead it would be a permanent dead column
           down the full height of the block, which costs every multi-line
           sample real width to solve a case only long single lines hit. */
        padding-inline-end: calc(var(--space-md) + 80px);
        overflow-x: auto;
        overflow-y: hidden;
      }

      /* Shiki CSS-variables theme: map --shiki-* to design tokens.
         Consumers override --accent-primary, --color-success, etc. and
         syntax colors follow automatically. */
      .code-block {
        --shiki-foreground: var(--text-secondary);
        --shiki-background: var(--surface-primary);
        --shiki-token-comment: var(--text-ghost);
        --shiki-token-keyword: var(--accent-primary);
        --shiki-token-string: var(--color-success);
        --shiki-token-constant: var(--accent-secondary);
        --shiki-token-function: var(--text-primary);
        --shiki-token-parameter: var(--text-secondary);
        --shiki-token-string-expression: var(--color-success);
        --shiki-token-punctuation: var(--text-muted);
        --shiki-token-link: var(--accent-primary);
        /* Shell: a wrapper such as sudo, the command, its subcommand, plain
           arguments, flags, variables, operators, a trailing backslash, and
           arguments that name a path, URL or image. */
        --shiki-token-prefix: var(--text-muted);
        --shiki-token-command: var(--text-primary);
        --shiki-token-subcommand: var(--accent-primary);
        --shiki-token-argument: var(--text-secondary);
        --shiki-token-flag: var(--accent-secondary);
        --shiki-token-variable: var(--color-warning);
        --shiki-token-operator: var(--text-muted);
        --shiki-token-continuation: var(--text-ghost);
        --shiki-token-path: var(--color-success);
      }

      .code-block__copy {
        position: absolute;
        top: var(--space-sm);
        inset-inline-end: var(--space-sm);
        z-index: 1;
        border-radius: var(--radius-sm);
        /* Fully visible by default. On a block whose code fits, the reserved
           inline-end padding means the button covers nothing, so hiding it
           would cost discoverability and buy nothing back. */
        opacity: 1;
        transition: opacity var(--transition-fast);
      }

      /* Only where it can actually get in the way: once the code overflows, a
           line can scroll under the button, so it drops back to a hint of
           itself and returns on presence. Tuning the transparency alone could
           never work for both cases at once; this picks per block. */
      .code-block__copy--quiet {
        opacity: 0.25;
      }

      .code-block__body-wrap:hover .code-block__copy--quiet,
      .code-block__copy--quiet:focus-within {
        opacity: 1;
      }

      /* No hover to bring it back, so never hide it in the first place. */
      @media (hover: none) {
        .code-block__copy--quiet { opacity: 1; }
      }

      @media (prefers-reduced-motion: reduce) {
        .code-block__copy { transition: none; }
      }

      /* One line has no top-right to speak of: the button would sit level with
         the only row of code, slightly above its centre, which reads as
         misaligned rather than as anchored. Centre it against the single line
         instead, and let anything taller keep the corner. */
      /* Not for the basic variant, which lays the button out as a static flex
         item: the top offset is inert there but the transform is not, so a
         -50% lifted it clean out through the top edge of the block. */
      :host(:not([variant="basic"])) .code-block__copy--centered {
        top: 50%;
        transform: translateY(-50%);
      }

      /* One pre for both the plain and the highlighted render, so the colors
         arriving change no box and nothing reflows. It is as wide as its
         longest line, so line backgrounds reach the end of a scrolled line. */
      .code-block__pre {
        margin: 0;
        min-width: 100%;
        width: max-content;
        box-sizing: border-box;
        font-family: var(--font-mono);
        font-size: var(--code-size);
        line-height: var(--code-lh);
        color: var(--shiki-foreground);
        white-space: pre;
        tab-size: 2;
      }

      /* A block with no language is never highlighted: full-strength text. */
      .code-block__pre--plain {
        color: var(--text-primary);
      }

      .code-block__pre code {
        display: block;
        font: inherit;
      }

      .code-block__line {
        display: flex;
        min-height: 1lh;
      }

      .code-block__text {
        flex: 1 0 auto;
      }

      .code-block__tok {
        transition: color var(--transition-fast);
      }

      .code-block__tok--command {
        font-weight: var(--font-label-weight, 600);
      }

      /* Colors fade in from the plain text color as the highlighter lands. */
      @starting-style {
        .code-block__tok { color: var(--shiki-foreground); }
      }

      @media (prefers-reduced-motion: reduce) {
        .code-block__tok { transition: none; }
      }

      .code-block__gutter,
      .code-block__prompt {
        flex: none;
        user-select: none;
        -webkit-user-select: none;
      }

      .code-block__gutter {
        min-width: calc(var(--_gutter-ch, 1) * 1ch);
        margin-inline-end: var(--space-md);
        text-align: end;
        color: var(--text-ghost);
      }

      .code-block__gutter::before {
        content: attr(data-n);
      }

      .code-block__prompt {
        min-width: calc(var(--_prompt-ch, 1) * 1ch + 1ch);
        color: var(--text-ghost);
      }

      .code-block__prompt::before {
        content: attr(data-prompt);
      }

      /* Emphasis and diff tints run edge to edge, across the body padding. */
      .code-block__line--highlight,
      .code-block__line--add,
      .code-block__line--remove {
        margin-inline: calc(-1 * var(--space-md));
        padding-inline: calc(var(--space-md) - 2px) var(--space-md);
        border-inline-start: 2px solid transparent;
      }

      .code-block__line--highlight {
        background: rgba(var(--accent-primary-rgb), 0.1);
        border-inline-start-color: var(--accent-primary);
      }

      .code-block__line--add {
        background: rgba(var(--color-success-rgb), 0.1);
        border-inline-start-color: rgba(var(--color-success-rgb), 0.6);
      }

      .code-block__line--remove {
        background: rgba(var(--color-error-rgb), 0.1);
        border-inline-start-color: rgba(var(--color-error-rgb), 0.6);
      }

      /* Wrap: the pre takes the body's width and the text column wraps inside
         its own flex item, so a wrapped line stays clear of the gutter and
         the prompt. */
      :host([wrap]) .code-block__pre {
        width: auto;
        white-space: pre-wrap;
      }

      :host([wrap]) .code-block__text {
        flex: 1 1 0;
        min-width: 0;
        overflow-wrap: anywhere;
      }

      /* Collapsed: the pre stops at max-lines and fades out over its last
         two. overflow-y: clip leaves the horizontal scroll alone. */
      /* The pre widens by the body padding here, because the mask clips to
         its box and would otherwise cut the edge-to-edge line tints. */
      .code-block__pre--collapsed {
        margin-inline: calc(-1 * var(--space-md));
        padding-inline: var(--space-md);
        min-width: calc(100% + 2 * var(--space-md));
        max-height: calc(var(--_max-lines) * 1lh);
        overflow-y: clip;
        -webkit-mask-image: linear-gradient(to bottom, #000 calc(100% - 2lh), rgba(0, 0, 0, 0));
        mask-image: linear-gradient(to bottom, #000 calc(100% - 2lh), rgba(0, 0, 0, 0));
      }

      .code-block__expand {
        display: block;
        width: 100%;
        padding: var(--space-xs) var(--space-md);
        border: 0;
        border-top: 1px solid var(--divider);
        background: transparent;
        color: var(--text-muted);
        font-family: var(--font-body);
        font-size: var(--_text-xs);
        text-align: center;
        cursor: pointer;
        transition: color var(--transition-fast), background var(--transition-fast);
      }

      .code-block__expand:hover {
        color: var(--text-primary);
        background: var(--surface-hover);
      }

      .code-block__expand:focus-visible {
        outline: none;
        box-shadow: inset var(--interactive-focus);
      }

      arc-status-bar {
        border-radius: 0;
      }

      arc-status-bar::part(base) {
        border-top-color: var(--divider);
      }

      /* Window variant */
      :host([variant="window"]) .code-block {
        box-shadow: var(--shadow-overlay);
      }

      .code-block__titlebar {
        display: flex;
        align-items: center;
        padding: var(--space-sm) var(--space-md);
        border-bottom: 1px solid var(--divider);
        background: var(--surface-primary);
        position: relative;
      }

      .code-block__orbs {
        display: flex;
        gap: 8px;
      }

      .code-block__orb {
        width: 12px;
        height: 12px;
        border-radius: var(--radius-full);
      }

      .code-block__orb--close    { background: var(--orb-close); }
      .code-block__orb--minimize { background: var(--orb-minimize); }
      .code-block__orb--maximize { background: var(--orb-maximize); }

      .code-block__titlebar-filename {
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        font-family: var(--font-mono);
        font-size: var(--_text-sm);
        color: var(--text-muted);
      }

      .code-block__titlebar-filename.code-block__label {
        font-family: var(--font-body);
        color: var(--text-primary);
      }

      /* Basic variant */
      :host([variant="basic"]) .code-block__body-wrap {
        display: flex;
        align-items: center;
        padding: var(--space-xs) var(--space-sm) var(--space-xs) 0;
      }

      :host([variant="basic"]) .code-block__body {
        flex: 1;
        min-width: 0;
        padding: var(--space-sm);
        padding-inline-end: var(--space-xs);
      }

      /* In a bar the button is an ordinary flex item at the end of the row;
         the body no longer reserves a column for it */
      .code-block__copy.code-block__copy--bar {
        position: static;
        flex-shrink: 0;
        margin-inline-start: var(--space-sm);
      }

      .code-block__titlebar .code-block__copy--bar {
        margin-inline-start: auto;
      }

      .code-block__body--clear {
        padding-inline-end: var(--space-md);
      }

      :host([variant="basic"]) .code-block__copy {
        position: static;
        flex-shrink: 0;
        order: 1;
        margin-inline-start: var(--space-sm);
      }

      .code-block__meta {
        font-family: var(--font-mono);
        font-size: var(--_text-xs);
        color: var(--text-ghost);
      }

      /* Inside arc-code-group, which draws the frame, the tabs and the one copy
         button. The block keeps its template (so a server render hydrates the
         same) and hides its own chrome. */
      :host([data-grouped]) .code-block {
        border: 0;
        border-radius: 0;
        box-shadow: none;
        background: transparent;
      }

      :host([data-grouped]) .code-block__header,
      :host([data-grouped]) .code-block__titlebar,
      :host([data-grouped]) arc-status-bar,
      :host([data-grouped]) .code-block__copy {
        display: none;
      }

      :host([data-grouped]) .code-block__body {
        padding-inline-end: var(--space-md);
      }
    `,
  ];

  constructor() {
    super();
    this.language = '';
    this.label = '';
    this.filename = '';
    this.code = '';
    this.prompt = null;
    this.highlight = '';
    this._tokens = null;
    this._overflows = false;
    this._expanded = false;
    this._highlightRun = 0;
    // Watch the scroller rather than the host: the answer depends on the code's
    // width against the viewport's, and either can change without the other.
    observeResize(this, '.code-block__body', () => this._measureOverflow());
  }

  firstUpdated() {
    this._measureOverflow();
  }

  /**
   * Whether any code can actually end up behind the copy button.
   *
   * The body reserves inline-end padding for the button, so code that fits
   * never reaches it; on those blocks the button covers nothing and there is
   * no reason to hide it. Only once the line overflows can it scroll underneath,
   * and only then is a quiet resting state worth the cost of being harder to
   * find. One measurement decides which of the two a given block gets.
   */
  _measureOverflow() {
    const body = this.shadowRoot?.querySelector('.code-block__body');
    if (!body) return;
    this._overflows = body.scrollWidth > body.clientWidth + 1;
  }

  updated(changedProperties) {
    if (changedProperties.has('code') || changedProperties.has('language')) {
      this._highlight();
    }
    // After a re-highlight the content width has changed under us.
    //
    // `code` is here too, and needs to be. The ResizeObserver watches the body's
    // *box*, and shrinking the code from a long line to a short one does not
    // change it (same height, same container-constrained width), so no resize
    // fires. And when there is no `language`, `_tokens` stays null, so it does
    // not change either. Between the two, replacing long code with short code
    // left `_overflows` stuck at true and the copy button permanently in its
    // quiet state (finding #69).
    if (
      changedProperties.has('_tokens') ||
      changedProperties.has('code') ||
      changedProperties.has('language') ||
      changedProperties.has('wrap') ||
      changedProperties.has('lineNumbers') ||
      changedProperties.has('prompt')
    ) {
      this._measureOverflow();
    }
  }

  async _highlight() {
    // A later call supersedes an earlier one still waiting on the grammar.
    const run = ++this._highlightRun;
    const { code, language } = this;
    if (!code || !language) {
      this._tokens = null;
      return;
    }
    let tokens = null;
    try {
      const hl = await getHL(language);
      if (hl) {
        tokens = hl.codeToTokensBase(this._source(code), { lang: language, theme: 'arc-tokens' });
        if (SHELL.has(language)) tokens = refineShell(tokens);
      }
    } catch {
      tokens = null;
    }
    if (run === this._highlightRun) this._tokens = tokens;
  }

  /** The code as displayed: a single trailing newline draws no extra line. */
  _source(code = this.code) {
    return code.endsWith('\n') ? code.slice(0, -1) : code;
  }

  _lineCount() {
    return this.code ? this.code.split('\n').length : 0;
  }

  /** Lines as token arrays: the highlighter's, or one plain token per line. */
  _lines() {
    if (this._tokens) return this._tokens;
    if (!this.code) return [];
    return this._source()
      .split('\n')
      .map((content) => [{ content }]);
  }

  /** The prompt string, or null for none. A bare attribute means `$`. */
  get _promptText() {
    if (this.prompt === null || this.prompt === undefined) return null;
    return this.prompt === '' ? '$' : this.prompt;
  }

  get _collapsible() {
    return this.maxLines != null && this._lines().length > this.maxLines;
  }

  _toggleExpanded() {
    this._expanded = !this._expanded;
    this.dispatchEvent(
      new CustomEvent('arc-toggle', { detail: { value: this._expanded }, bubbles: true, composed: true }),
    );
  }

  /**
   * Whether the block has a bar to put the copy button in.
   *
   * Where there is one, the button goes in it, and nothing can ever be
   * underneath it. Floating over the top-right of the code was fine for code
   * that fits, but an overflowing line ran under it, and the quiet state only
   * dimmed the problem: the button came back to full strength on hover,
   * exactly while the line under it was being read, and on touch it never
   * dimmed at all. The floating button now remains only where there is no bar:
   * a headerless default block. `basic` lays it out beside the code instead.
   */
  _copyInHeader() {
    if (this.variant === 'window') return true;
    if (this.variant === 'basic') return false;
    return Boolean(this.label || this.filename || this.language);
  }

  _renderCopy(extra = '', iconOnly = false) {
    return html`<div class="code-block__copy ${extra}">
      <arc-copy-button .value=${this.code} ?icon-only=${iconOnly} label="Copy code" part="copy"></arc-copy-button>
    </div>`;
  }

  _renderHeader() {
    if (this.variant === 'basic') return '';

    if (this.variant === 'window') {
      return html`
        <div class="code-block__titlebar" part="titlebar">
          <div class="code-block__orbs" part="orbs">
            <span class="code-block__orb code-block__orb--close"></span>
            <span class="code-block__orb code-block__orb--minimize"></span>
            <span class="code-block__orb code-block__orb--maximize"></span>
          </div>
          ${
            this.label
              ? html`<span class="code-block__titlebar-filename code-block__label" part="label">${this.label}</span>`
              : this.filename
                ? html`<span class="code-block__titlebar-filename" part="filename">${this.filename}</span>`
                : ''
          }
          ${this._renderCopy('code-block__copy--bar')}
        </div>
      `;
    }

    // default: a header when there is a label, filename or language to show
    if (!this.label && !this.filename && !this.language) return '';
    return html`
      <div class="code-block__header" part="header">
        <span class="code-block__title">
          ${this.label ? html`<span class="code-block__label" part="label">${this.label}</span>` : ''}
          <span class="code-block__filename" part="filename">${this.filename}</span>
        </span>
        ${this.language ? html`<span class="code-block__lang" part="lang">${this.language}</span>` : ''}
        ${this._renderCopy('code-block__copy--bar', true)}
      </div>
    `;
  }

  _renderFooter() {
    if (this.variant !== 'window') return '';
    const lines = this._lineCount();
    return html`
      <arc-status-bar part="status-bar">
        ${
          this.language
            ? html`<span slot="start" class="code-block__meta" part="lang">${this.language}</span>`
            : ''
        }
        <span slot="end" class="code-block__meta" part="lines">${lines} ${lines === 1 ? 'line' : 'lines'}</span>
      </arc-status-bar>
    `;
  }

  _renderToken(tok) {
    if (!tok.color && !tok.fontStyle) return tok.content;
    let style = tok.color ? `color:${tok.color};` : '';
    if (tok.fontStyle & 1) style += 'font-style:italic;';
    if (tok.fontStyle & 2) style += 'font-weight:var(--font-label-weight, 600);';
    if (tok.fontStyle & 4) style += 'text-decoration:underline;';
    const command = tok.color === COMMAND && SHELL.has(this.language);
    return html`<span class="code-block__tok ${command ? 'code-block__tok--command' : ''}" style=${style}>${tok.content}</span>`;
  }

  _renderLines(lines) {
    const emphasis = parseRanges(this.highlight);
    const diff = this.diff || this.language === 'diff';
    const prompt = this._promptText;
    let continued = false;

    return lines.map((toks, i) => {
      const n = i + 1;
      const text = toks.map((t) => t.content).join('');
      const emphasized = emphasis.has(n);
      // `+++ a/file` and `--- b/file` are headers, not changes.
      const added = diff && /^\+(?!\+\+ )/.test(text);
      const removed = diff && /^-(?!-- )/.test(text);
      const classes = [
        'code-block__line',
        emphasized ? 'code-block__line--highlight' : '',
        added ? 'code-block__line--add' : '',
        removed ? 'code-block__line--remove' : '',
      ].join(' ');
      let shown = '';
      if (prompt !== null) {
        if (!continued && text.trim() !== '') shown = prompt;
        continued = /\\\s*$/.test(text);
      }
      return html`<span
        class=${classes}
        part=${['line', emphasized ? 'line-highlight' : '', added ? 'line-add' : '', removed ? 'line-remove' : ''].join(' ').trim()}
      >${
        this.lineNumbers
          ? html`<span class="code-block__gutter" part="gutter" data-n=${n} aria-hidden="true"></span>`
          : nothing
      }${
        prompt !== null
          ? html`<span class="code-block__prompt" part="prompt" data-prompt=${shown} aria-hidden="true"></span>`
          : nothing
      }<span class="code-block__text">${toks.map((t) => this._renderToken(t))}${'\n'}</span></span>`;
    });
  }

  render() {
    const lines = this._lines();
    const collapsible = this._collapsible;
    const collapsed = collapsible && !this._expanded;
    const prompt = this._promptText;
    const preClass = [
      'code-block__pre',
      this.language ? '' : 'code-block__pre--plain',
      collapsed ? 'code-block__pre--collapsed' : '',
    ].join(' ');
    const preStyle = [
      this.lineNumbers ? `--_gutter-ch:${String(lines.length).length}` : '',
      prompt !== null ? `--_prompt-ch:${prompt.length}` : '',
      collapsed ? `--_max-lines:${this.maxLines}` : '',
    ]
      .filter(Boolean)
      .join(';');

    return html`
      <div class="code-block" part="base code-block">
        ${this._renderHeader()}
        <div class="code-block__body-wrap">
          ${
            this._copyInHeader()
              ? ''
              : this._renderCopy(
                  `${this._lineCount() === 1 ? 'code-block__copy--centered' : ''} ${this._overflows ? 'code-block__copy--quiet' : ''}`,
                )
          }
          <div class="code-block__body ${this._copyInHeader() ? 'code-block__body--clear' : ''}" part="body">
            <pre class=${preClass} style=${preStyle || nothing} part="pre"><code part="code">${this._renderLines(lines)}</code></pre>
          </div>
        </div>
        ${
          collapsible
            ? html`<button
                class="code-block__expand"
                part="expand"
                type="button"
                aria-expanded=${this._expanded ? 'true' : 'false'}
                @click=${this._toggleExpanded}
              >
                ${this._expanded ? 'Show fewer lines' : `Show all ${lines.length} lines`}
              </button>`
            : nothing
        }
        ${this._renderFooter()}
      </div>
    `;
  }
}
