import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * Sanitize an HTML string by stripping <script> tags and on* event attributes.
 */
function sanitizeHtml(raw) {
  const doc = new DOMParser().parseFromString(raw, 'text/html');
  for (const el of doc.querySelectorAll('script')) el.remove();
  for (const el of doc.querySelectorAll('*')) {
    for (const attr of [...el.attributes]) {
      if (attr.name.startsWith('on')) el.removeAttribute(attr.name);
    }
  }
  return doc.body.innerHTML;
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
    codeBlocks.push(`<pre><code${langAttr}>${escaped}</code></pre>`);
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
        .map(l => l.replace(/^>\s?/, ''))
        .join('\n');
      out += `<blockquote>${parseMarkdown(content)}</blockquote>`;
      continue;
    }

    // Unordered list
    if (/^[\-*]\s/.test(trimmed)) {
      const items = trimmed.split('\n').filter(l => /^[\-*]\s/.test(l.trim()));
      out += '<ul>' + items.map(l => `<li>${inlineMarkdown(l.trim().replace(/^[\-*]\s+/, ''))}</li>`).join('') + '</ul>';
      continue;
    }

    // Ordered list
    if (/^\d+\.\s/.test(trimmed)) {
      const items = trimmed.split('\n').filter(l => /^\d+\.\s/.test(l.trim()));
      out += '<ol>' + items.map(l => `<li>${inlineMarkdown(l.trim().replace(/^\d+\.\s+/, ''))}</li>`).join('') + '</ol>';
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
 * @arc-prism static — renders Markdown content as styled HTML
 */
/**
 * @tag arc-markdown
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

      .markdown h1 { font-size: var(--text-3xl); font-weight: 600; }
      .markdown h2 { font-size: var(--heading-size); font-weight: 600; }
      .markdown h3 { font-size: var(--text-lg); font-weight: 600; }
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
        text-decoration: none;
        transition: color var(--transition-fast);
      }

      .markdown a:hover {
        text-decoration: underline;
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
        padding-left: var(--space-lg);
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
    this.content = '';
  }

  _getSource() {
    if (this.content) return this.content;
    // Fall back to slotted text content
    const slot = this.shadowRoot?.querySelector('slot');
    if (slot) {
      const nodes = slot.assignedNodes({ flatten: true });
      return nodes.map(n => n.textContent).join('');
    }
    return this.textContent || '';
  }

  render() {
    const source = this.content || this.textContent || '';
    const parsed = sanitizeHtml(parseMarkdown(source));
    return html`
      <div class="markdown" part="markdown" .innerHTML=${parsed}></div>
      <slot style="display:none" @slotchange=${this._onSlotChange}></slot>
    `;
  }

  _onSlotChange() {
    // Re-render when slot content changes and no content prop is set
    if (!this.content) this.requestUpdate();
  }
}
