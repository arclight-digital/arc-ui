import { LitElement, html, css } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { tokenStyles } from '../shared-styles.js';
import { sanitizeMarkup, normalizeUrl } from '../shared/sanitize-markup.js';
import { hydrateSlots } from '../shared/hydrate-slots.js';

/** Tags dropped with their contents: active content, and document-level markup. */
const BANNED_ELEMENTS = new Set([
  'script',
  'style',
  'iframe',
  'object',
  'embed',
  'link',
  'meta',
  'base',
  'form',
]);

/** Attributes carrying a URL, where a `javascript:` value would execute. */
const URL_ATTRIBUTES = new Set(['href', 'src', 'xlink:href']);

/**
 * Return true if a URL is safe to emit in href/src: relative, or an
 * allowlisted scheme (http, https, mailto, tel).
 */
function isSafeUrl(value) {
  // Strip control chars/whitespace the browser ignores when parsing the scheme
  const url = normalizeUrl(value);
  if (!/^[a-z][a-z0-9+.-]*:/.test(url)) return true;
  return /^(?:https?|mailto|tel):/.test(url);
}

/** Links get `rel="noopener noreferrer"`, replacing any the markup supplied. */
function hardenLinks(tag) {
  if (tag.name !== 'a') return;
  if (!tag.attributes.some(({ name }) => name.toLowerCase() === 'href')) return;
  tag.attributes = tag.attributes
    .filter(({ name }) => name.toLowerCase() !== 'rel')
    .concat({ name: 'rel', value: 'noopener noreferrer' });
}

/**
 * Sanitize an HTML string: strip active-content tags, on* event attributes,
 * and href/src values with non-allowlisted URL schemes (javascript:, data:, …).
 *
 * This was DOMParser-based, which is why arc-markdown was the one component
 * that could not be server-rendered. Note what it is actually defending: the
 * parser below escapes `<`, `>` and `&` in its source before emitting a single
 * tag, so the markup reaching here is the parser's own output, and the only
 * attacker-influenced part of it is the URL inside a link or an image.
 */
function sanitizeHtml(raw) {
  return (
    sanitizeMarkup(raw, {
      banned: BANNED_ELEMENTS,
      urlAttributes: URL_ATTRIBUTES,
      isSafeUrl,
      onTag: hardenLinks,
    }) ?? ''
  );
}

/**
 * Lightweight regex-based Markdown-to-HTML parser.
 * Handles headings, bold, italic, inline code, code blocks, lists,
 * blockquotes, links, images, horizontal rules, and paragraphs.
 */
function parseMarkdown(src) {
  if (!src) return '';

  let out = '';
  // Normalize line endings
  const text = src.replace(/\r\n?/g, '\n');

  // Extract fenced code blocks first to protect them from further parsing
  const codeBlocks = [];
  const withPlaceholders = text.replace(/^```(\w*)\n([\s\S]*?)^```/gm, (_match, lang, code) => {
    const idx = codeBlocks.length;
    const escaped = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const langAttr = lang ? ` class="language-${lang}"` : '';
    codeBlocks.push(`<pre tabindex="0"><code${langAttr}>${escaped}</code></pre>`);
    return `\x00CODEBLOCK_${idx}\x00`;
  });

  // Split into blocks by double newline
  const blocks = withPlaceholders.split(/\n{2,}/);

  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    // Code block placeholder
    const cbMatch = trimmed.match(/^\x00CODEBLOCK_(\d+)\x00$/);
    if (cbMatch) {
      out += codeBlocks[parseInt(cbMatch[1])];
      continue;
    }

    // Heading
    const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      out += `<h${level}>${inlineMarkdown(headingMatch[2])}</h${level}>`;
      continue;
    }

    // Horizontal rule
    if (/^[-*_]{3,}\s*$/.test(trimmed)) {
      out += '<hr>';
      continue;
    }

    // Blockquote
    if (/^>\s?/.test(trimmed)) {
      const content = trimmed
        .split('\n')
        .map((l) => l.replace(/^>\s?/, ''))
        .join('\n');
      out += `<blockquote>${parseMarkdown(content)}</blockquote>`;
      continue;
    }

    // Unordered list
    if (/^[\-*]\s/.test(trimmed)) {
      const items = trimmed.split('\n').filter((l) => /^[\-*]\s/.test(l.trim()));
      out +=
        '<ul>' +
        items.map((l) => `<li>${inlineMarkdown(l.trim().replace(/^[\-*]\s+/, ''))}</li>`).join('') +
        '</ul>';
      continue;
    }

    // Ordered list
    if (/^\d+\.\s/.test(trimmed)) {
      const items = trimmed.split('\n').filter((l) => /^\d+\.\s/.test(l.trim()));
      out +=
        '<ol>' +
        items.map((l) => `<li>${inlineMarkdown(l.trim().replace(/^\d+\.\s+/, ''))}</li>`).join('') +
        '</ol>';
      continue;
    }

    // Paragraph (default)
    out += `<p>${inlineMarkdown(trimmed.replace(/\n/g, ' '))}</p>`;
  }

  return out;
}

/**
 * Parse inline markdown: images, links, bold, italic, inline code.
 */
function inlineMarkdown(text) {
  let s = text;
  // Escape HTML entities in source (but not our generated tags)
  s = s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  // Inline code (before bold/italic so backticks are handled first)
  s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
  // Images
  s = s.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');
  // Links
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  // Bold
  s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // Italic
  s = s.replace(/\*(.+?)\*/g, '<em>$1</em>');
  return s;
}

/**
 * Renders markdown content as styled HTML with zero dependencies. Supports headings, lists, code
 * blocks, blockquotes, links, images, and inline formatting.
 *
 * @tag arc-markdown
 * @prop {string} content - Markdown string to parse and render. Takes precedence over slotted text content.
 * @slot - Default content.
 * @csspart markdown
 */
export class ArcMarkdown extends LitElement {
  static properties = {
    content: { type: String },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: block; }

      .markdown {
        font-family: var(--font-body);
        font-size: var(--body-size);
        font-weight: var(--body-weight);
        line-height: var(--body-lh);
        color: var(--text-secondary);
      }

      .markdown h1,
      .markdown h2,
      .markdown h3,
      .markdown h4,
      .markdown h5,
      .markdown h6 {
        font-family: var(--font-body);
        color: var(--text-primary);
        line-height: 1.3;
        margin-top: var(--space-xl);
        margin-bottom: var(--space-md);
      }

      .markdown h1 { font-size: var(--_text-3xl); font-weight: 600; }
      .markdown h2 { font-size: var(--heading-size); font-weight: 600; }
      .markdown h3 { font-size: var(--_text-lg); font-weight: 600; }
      .markdown h4 { font-size: var(--body-size); font-weight: 600; }
      .markdown h5 { font-size: var(--body-size); font-weight: 500; }
      .markdown h6 { font-size: var(--code-size); font-weight: 500; text-transform: uppercase; letter-spacing: 1px; }

      .markdown h1:first-child,
      .markdown h2:first-child,
      .markdown h3:first-child,
      .markdown h4:first-child,
      .markdown h5:first-child,
      .markdown h6:first-child { margin-top: 0; }

      .markdown p {
        margin: 0 0 var(--space-md) 0;
      }

      .markdown p:last-child { margin-bottom: 0; }

      .markdown strong { color: var(--text-primary); font-weight: 600; }

      .markdown em { font-style: italic; }

      .markdown a {
        color: var(--interactive);
        text-decoration: underline;
        transition: color var(--transition-fast);
      }

      .markdown a:hover {
        text-decoration-thickness: 2px;
      }

      .markdown code {
        font-family: var(--font-mono);
        font-size: var(--code-size);
        color: var(--accent-secondary);
        background: var(--surface-primary);
        padding: 2px calc(var(--space-xs) + 2px); /* cosmetic 2px vertical for inline code */
        border-radius: var(--radius-sm);
      }

      .markdown pre {
        background: var(--surface-primary);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        padding: var(--space-md);
        overflow-x: auto;
        margin: 0 0 var(--space-md) 0;
      }

      .markdown pre code {
        background: none;
        padding: 0;
        border-radius: 0;
        font-size: var(--code-size);
        line-height: var(--code-lh);
        color: var(--text-primary);
      }

      .markdown blockquote {
        margin: 0 0 var(--space-md) 0;
        padding: var(--space-sm);
        background: var(--surface-raised);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
      }

      .markdown blockquote p:last-child { margin-bottom: 0; }

      .markdown ul,
      .markdown ol {
        margin: 0 0 var(--space-md) 0;
        padding-inline-start: var(--space-lg);
        color: var(--text-secondary);
      }

      .markdown li {
        margin-bottom: var(--space-xs);
      }

      .markdown li:last-child { margin-bottom: 0; }

      .markdown hr {
        border: none;
        height: 1px;
        background: var(--divider);
        margin: var(--space-xl) 0;
      }

      .markdown img {
        max-width: 100%;
        height: auto;
        border-radius: var(--radius-md);
        margin: var(--space-sm) 0;
      }
    `,
  ];

  constructor() {
    super();
    this.content = '';
  }

  _getSource() {
    if (this.content) return this.content;
    // Fall back to slotted text content
    const slot = this.shadowRoot?.querySelector('slot');
    if (slot) {
      const nodes = slot.assignedNodes({ flatten: true });
      return nodes.map((n) => n.textContent).join('');
    }
    return this.textContent || '';
  }

  /** The slotchange DSD swallows — see shared/hydrate-slots.js. */
  firstUpdated() {
    hydrateSlots(this);
  }

  render() {
    const source = this.content || this.textContent || '';
    const parsed = sanitizeHtml(parseMarkdown(source));
    return html`
      <!-- unsafeHTML rather than .innerHTML: a property binding is set by the
           client after the element upgrades, so the server has nothing to
           serialize and this component rendered as an empty div. The directive
           puts the markup in the template itself, which server-renders and
           hydrates. The value is sanitizeHtml's output either way. -->
      <div class="markdown" part="markdown">${unsafeHTML(parsed)}</div>
      <slot style="display:none" @slotchange=${this._onSlotChange}></slot>
    `;
  }

  _onSlotChange() {
    // Re-render when slot content changes and no content prop is set
    if (!this.content) this.requestUpdate();
  }
}
