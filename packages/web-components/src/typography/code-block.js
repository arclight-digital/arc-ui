import { LitElement, html, css } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { tokenStyles } from '../shared-styles.js';
import '../input/copy-button.js';
import '../layout/status-bar.js';

/* ── Shared Shiki highlighter (singleton, lazy — loaded on first use) ── */
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
 * shiki is an optional peer — it is 13.6 MB with its grammars, and every other
 * component in the library reaches none of it — so its absence is a supported
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
    // their own — same supported state, same one-time explanation.
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
 * Syntax-highlighted code display with optional filename and copy button.
 *
 * @tag arc-code-block
 * @requires arc-status-bar
 * @requires arc-copy-button
 * @prop {'default' | 'window' | 'basic'} variant - Visual variant. `default` shows the standard layout with optional filename header and status bar. `window` adds a macOS-style title bar with colored orbs and centered filename. `basic` strips all chrome for a compact, minimal display.
 * @prop {string} language - Programming language identifier (e.g. `js`, `css`, `html`). Displayed in uppercase in the header bar.
 * @prop {string} filename - Optional filename displayed in the header in monospace font. When empty, the header shows only the language.
 * @prop {string} code - Code content to display. Used as the `<pre><code>` content and copied to clipboard when the copy button is clicked.
 * @slot none
 * @csspart titlebar
 * @csspart orbs
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
 */
export class ArcCodeBlock extends LitElement {
  static properties = {
    language: { type: String, reflect: true },
    filename: { type: String, reflect: true },
    code: { type: String },
    variant: { type: String, reflect: true },
    _highlightedHtml: { state: true },
    _overflows: { state: true },
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

      .code-block__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--space-xs) var(--space-md);
        border-bottom: 1px solid var(--divider);
        background: var(--surface-raised);
      }

      .code-block__filename {
        font-family: var(--font-mono);
        font-size: var(--_text-sm);
        color: var(--text-muted);
      }

      .code-block__lang {
        font-family: var(--font-mono);
        font-size: var(--_text-xs);
        color: var(--text-ghost);
        text-transform: uppercase;
        letter-spacing: 1px;
      }

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

      /* Shiki CSS-variables theme — map --shiki-* to design tokens.
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
           never work for both cases at once — this picks per block. */
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


      .code-block__body pre {
        margin: 0;
        background: transparent !important;
        font-family: var(--font-mono);
        font-size: var(--code-size);
        line-height: var(--code-lh);
        white-space: pre;
        tab-size: 2;
      }

      .code-block__body pre code {
        font-family: inherit;
        font-size: inherit;
        line-height: inherit;
      }

      .code-block__pre {
        margin: 0;
        font-family: var(--font-mono);
        font-size: var(--code-size);
        line-height: var(--code-lh);
        color: var(--text-primary);
        white-space: pre;
        tab-size: 2;
      }

      arc-status-bar {
        border-radius: 0;
      }

      arc-status-bar::part(base) {
        border-top-color: var(--divider);
      }

      /* — Window variant — */
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

      .code-block__orb--close    { background: #ff5f57; }
      .code-block__orb--minimize { background: #febc2e; }
      .code-block__orb--maximize { background: #28c840; }

      .code-block__titlebar-filename {
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        font-family: var(--font-mono);
        font-size: var(--_text-sm);
        color: var(--text-muted);
      }

      /* — Basic variant — */
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
    `,
  ];

  constructor() {
    super();
    this.language = '';
    this.filename = '';
    this.code = '';
    this.variant = 'default';
    this._highlightedHtml = '';
    this._overflows = false;
    this._resizeObserver = null;
  }

  firstUpdated() {
    // Watch the scroller rather than the host: the answer depends on the code's
    // width against the viewport's, and either can change without the other.
    if (typeof ResizeObserver === 'undefined') return;
    const body = this.shadowRoot?.querySelector('.code-block__body');
    if (!body) return;
    this._resizeObserver = new ResizeObserver(() => this._measureOverflow());
    this._resizeObserver.observe(body);
    this._measureOverflow();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._resizeObserver?.disconnect();
    this._resizeObserver = null;
  }

  /**
   * Whether any code can actually end up behind the copy button.
   *
   * The body reserves inline-end padding for the button, so code that fits
   * never reaches it — on those blocks the button covers nothing and there is
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
    if (changedProperties.has('_highlightedHtml')) this._measureOverflow();
  }

  async _highlight() {
    if (!this.code || !this.language) {
      this._highlightedHtml = '';
      return;
    }
    try {
      const hl = await getHL(this.language);
      if (!hl) {
        this._highlightedHtml = '';
        return;
      }
      this._highlightedHtml = hl.codeToHtml(this.code, {
        lang: this.language,
        theme: 'arc-tokens',
      });
    } catch {
      this._highlightedHtml = '';
    }
  }

  _lineCount() {
    return this.code ? this.code.split('\n').length : 0;
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
            this.filename
              ? html`
            <span class="code-block__titlebar-filename" part="filename">${this.filename}</span>
          `
              : ''
          }
        </div>
      `;
    }
    // default — show header when filename or language is set
    if (!this.filename && !this.language) return '';
    return html`
      <div class="code-block__header" part="header">
        <span class="code-block__filename" part="filename">${this.filename}</span>
        ${
          this.language
            ? html`
          <span class="code-block__lang" part="lang">${this.language}</span>
        `
            : ''
        }
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

  render() {
    return html`
      <div class="code-block" part="code-block">
        ${this._renderHeader()}
        <div class="code-block__body-wrap">
          <div class="code-block__copy ${this._lineCount() === 1 ? 'code-block__copy--centered' : ''} ${this._overflows ? 'code-block__copy--quiet' : ''}">
            <arc-copy-button .value=${this.code} part="copy"></arc-copy-button>
          </div>
          <div class="code-block__body" part="body">
            ${
              this._highlightedHtml
                ? unsafeHTML(this._highlightedHtml)
                : html`<pre class="code-block__pre" part="pre"><code part="code">${this.code}</code></pre>`
            }
          </div>
        </div>
        ${this._renderFooter()}
      </div>
    `;
  }
}
