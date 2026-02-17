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
  javascript:  () => import('@shikijs/langs/javascript'),
  js:          () => import('@shikijs/langs/javascript'),
  typescript:  () => import('@shikijs/langs/typescript'),
  ts:          () => import('@shikijs/langs/typescript'),
  jsx:         () => import('@shikijs/langs/jsx'),
  tsx:         () => import('@shikijs/langs/tsx'),
  html:        () => import('@shikijs/langs/html'),
  css:         () => import('@shikijs/langs/css'),
  json:        () => import('@shikijs/langs/json'),
  bash:        () => import('@shikijs/langs/bash'),
  shell:       () => import('@shikijs/langs/shellscript'),
  sh:          () => import('@shikijs/langs/shellscript'),
  python:      () => import('@shikijs/langs/python'),
  py:          () => import('@shikijs/langs/python'),
  ruby:        () => import('@shikijs/langs/ruby'),
  rb:          () => import('@shikijs/langs/ruby'),
  go:          () => import('@shikijs/langs/go'),
  rust:        () => import('@shikijs/langs/rust'),
  rs:          () => import('@shikijs/langs/rust'),
  java:        () => import('@shikijs/langs/java'),
  php:         () => import('@shikijs/langs/php'),
  swift:       () => import('@shikijs/langs/swift'),
  kotlin:      () => import('@shikijs/langs/kotlin'),
  yaml:        () => import('@shikijs/langs/yaml'),
  yml:         () => import('@shikijs/langs/yaml'),
  toml:        () => import('@shikijs/langs/toml'),
  xml:         () => import('@shikijs/langs/xml'),
  markdown:    () => import('@shikijs/langs/markdown'),
  md:          () => import('@shikijs/langs/markdown'),
  sql:         () => import('@shikijs/langs/sql'),
  graphql:     () => import('@shikijs/langs/graphql'),
  docker:      () => import('@shikijs/langs/docker'),
  dockerfile:  () => import('@shikijs/langs/docker'),
  c:           () => import('@shikijs/langs/c'),
  cpp:         () => import('@shikijs/langs/cpp'),
  csharp:      () => import('@shikijs/langs/csharp'),
  cs:          () => import('@shikijs/langs/csharp'),
  scss:        () => import('@shikijs/langs/scss'),
  less:        () => import('@shikijs/langs/less'),
  svelte:      () => import('@shikijs/langs/svelte'),
  vue:         () => import('@shikijs/langs/vue'),
  astro:       () => import('@shikijs/langs/astro'),
  diff:        () => import('@shikijs/langs/diff'),
  regex:       () => import('@shikijs/langs/regex'),
};

async function getHL(lang) {
  if (!_hlReady) {
    _hlReady = (async () => {
      const [{ createHighlighterCore, createCssVariablesTheme }, { createJavaScriptRegexEngine }] = await Promise.all([
        import('shiki/core'),
        import('shiki/engine/javascript'),
      ]);
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
    await hl.loadLanguage(loader);
    _loadedLangs.add(lang);
  }
  return hl;
}

/**
 * @arc-prism hybrid — display works without JS; copy-to-clipboard requires JS
 */
/**
 * @tag arc-code-block
 */
export class ArcCodeBlock extends LitElement {
  static properties = {
    language: { type: String, reflect: true },
    filename: { type: String, reflect: true },
    code:     { type: String },
    variant:  { type: String, reflect: true },
    _highlightedHtml: { state: true },
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
        font-size: var(--text-sm);
        color: var(--text-muted);
      }

      .code-block__lang {
        font-family: var(--font-mono);
        font-size: var(--text-xs);
        color: var(--text-ghost);
        text-transform: uppercase;
        letter-spacing: 1px;
      }

      .code-block__body-wrap {
        position: relative;
      }

      .code-block__body {
        padding: var(--space-md);
        padding-right: calc(var(--space-md) + 80px);
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
        right: var(--space-sm);
        z-index: 1;
        border-radius: var(--radius-sm);
        opacity: 0.75;
        backdrop-filter: blur(4px);
        transition: opacity var(--transition-fast);
      }

      .code-block__copy:hover {
        opacity: 1;
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
        box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
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
        border-radius: 50%;
      }

      .code-block__orb--close    { background: #ff5f57; }
      .code-block__orb--minimize { background: #febc2e; }
      .code-block__orb--maximize { background: #28c840; }

      .code-block__titlebar-filename {
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        font-family: var(--font-mono);
        font-size: var(--text-sm);
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
        padding-right: var(--space-xs);
      }

      :host([variant="basic"]) .code-block__copy {
        position: static;
        flex-shrink: 0;
        order: 1;
        margin-left: var(--space-sm);
      }

      .code-block__meta {
        font-family: var(--font-mono);
        font-size: var(--text-xs);
        color: var(--text-ghost);
      }

      @media (prefers-reduced-motion: reduce) {
        :host *,
        :host *::before,
        :host *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
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
  }

  updated(changedProperties) {
    if (changedProperties.has('code') || changedProperties.has('language')) {
      this._highlight();
    }
  }

  async _highlight() {
    if (!this.code || !this.language) {
      this._highlightedHtml = '';
      return;
    }
    try {
      const hl = await getHL(this.language);
      if (!hl) { this._highlightedHtml = ''; return; }
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
          ${this.filename ? html`
            <span class="code-block__titlebar-filename" part="filename">${this.filename}</span>
          ` : ''}
        </div>
      `;
    }
    // default — show header when filename or language is set
    if (!this.filename && !this.language) return '';
    return html`
      <div class="code-block__header" part="header">
        <span class="code-block__filename" part="filename">${this.filename}</span>
        ${this.language ? html`
          <span class="code-block__lang" part="lang">${this.language}</span>
        ` : ''}
      </div>
    `;
  }

  _renderFooter() {
    if (this.variant !== 'window') return '';
    const lines = this._lineCount();
    return html`
      <arc-status-bar part="status-bar">
        ${this.language
          ? html`<span slot="start" class="code-block__meta" part="lang">${this.language}</span>`
          : ''}
        <span slot="end" class="code-block__meta" part="lines">${lines} ${lines === 1 ? 'line' : 'lines'}</span>
      </arc-status-bar>
    `;
  }

  render() {
    return html`
      <div class="code-block" part="code-block">
        ${this._renderHeader()}
        <div class="code-block__body-wrap">
          <div class="code-block__copy">
            <arc-copy-button .value=${this.code} part="copy"></arc-copy-button>
          </div>
          <div class="code-block__body" part="body">
            ${this._highlightedHtml
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
