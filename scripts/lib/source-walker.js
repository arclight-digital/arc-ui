/**
 * One reader for component source, and rules written against it.
 *
 * Nine checks in `scripts/checks/` each open the same files and hand-roll the
 * same three or four scans. `boolean-defaults` and `empty-attributes` both walk
 * the `static properties` block by brace depth; `inert-declarations` and
 * `lifecycle-pairing` both find a method body the same way; `gradient-stops`,
 * `focus-ring`, `motion-tokens`, `breakpoint-drift` and `pinned-schemes` each
 * strip comments and pick apart CSS rules. Every one of them is correct, and
 * every one of them had to rediscover the same two facts: that a regex over a
 * nested object matches the nesting, and that a comment quoting the banned
 * thing fails the rule that bans it. Both of those are noted in the sources, in
 * different words, more than once.
 *
 * V4-PLAN 4.3 builds this because its five convention checks would otherwise be
 * the tenth through fourteenth; 4.10 moves the nine across. Nothing here is new
 * behaviour — it is the intersection of what those checks already do, with the
 * lessons they each recorded kept as properties of the reader rather than as
 * comments in nine places.
 *
 * ## What a rule looks like
 *
 *     export const rule = {
 *       name: 'size-canon',
 *       describe: 'size is sm | md | lg',
 *       component({ tag, prop, report }) {
 *         const size = prop('size');
 *         if (size && !canonical(size.text)) report(size.line, `…`);
 *       },
 *     };
 *
 * A rule receives one component at a time and reports findings against it. It
 * does not open files, decide which components to visit, or format output —
 * `run()` does those, so every check reports the same way and a rule stays the
 * size of its idea.
 *
 * ## Deliberately not an AST
 *
 * These files do not parse as anything standard: `static styles = [tokenStyles,
 * css\`…\`]` is JavaScript containing CSS, and the JSDoc above a class carries
 * contract that no JS parser records. A real parser would need a CSS parser
 * beside it and a JSDoc parser beside that, and the three would disagree about
 * offsets. What the checks actually need is narrower — balanced regions and the
 * text inside them — and that is what this provides, with the same failure mode
 * every hand-rolled version had: it is exact about nesting and does not pretend
 * to understand semantics.
 */
import { readFileSync } from 'node:fs';
import { resolve, relative } from 'node:path';
import { findComponents, SRC_DIR } from './component-tags.js';

const ROOT = resolve(SRC_DIR, '..', '..', '..');

// ── Region reading ──────────────────────────────────────────────────────────

/**
 * The body of the first balanced `{ … }` at or after `from`.
 *
 * By depth rather than by regex, because every consumer of this needs nesting
 * to belong to its parent: a `converter: { … }` inside a property declaration
 * is part of that declaration, not an entry beside it — and in
 * `boolean-defaults`' case the converter is the thing being looked for.
 *
 * @returns {{ body: string, start: number, end: number } | null}
 */
export function balanced(source, from = 0, open = '{', close = '}') {
  const at = source.indexOf(open, from);
  if (at === -1) return null;
  let depth = 0;
  for (let i = at; i < source.length; i++) {
    if (source[i] === open) depth++;
    else if (source[i] === close && --depth === 0) {
      return { body: source.slice(at + 1, i), start: at, end: i };
    }
  }
  return null;
}

/**
 * Source with comments blanked out, offsets preserved.
 *
 * Every rule that bans a keyword has to strip comments first, because the
 * comment explaining the rule quotes the keyword — `gradient-stops` says so
 * outright, and its own header would fail it. Blanking rather than deleting
 * keeps every offset and line number valid, so a finding can be reported
 * against the original text.
 *
 * Strings are left alone: a rule that cares about `'transparent'` in a value
 * wants to see it.
 */
export function withoutComments(source) {
  let out = '';
  let i = 0;
  while (i < source.length) {
    if (source[i] === '/' && source[i + 1] === '*') {
      const end = source.indexOf('*/', i + 2);
      const stop = end === -1 ? source.length : end + 2;
      // Newlines survive so line numbers do not move.
      out += source.slice(i, stop).replace(/[^\n]/g, ' ');
      i = stop;
    } else if (source[i] === '/' && source[i + 1] === '/' && source[i - 1] !== ':') {
      const end = source.indexOf('\n', i);
      const stop = end === -1 ? source.length : end;
      out += ' '.repeat(stop - i);
      i = stop;
    } else {
      out += source[i];
      i += 1;
    }
  }
  return out;
}

/** 1-based line number of an offset. */
export function lineAt(source, offset) {
  return source.slice(0, offset).split('\n').length;
}

/**
 * The source of the component class this one extends, when there is one.
 *
 * A component defined as `class ArcModal extends ArcDialog {}` has no
 * properties, no template, no dispatches and no parts of its own, and documents
 * all four — it has to, because the manifest, the editor data, the docs tables
 * and six wrapper packages are generated from that JSDoc. Three separate checks
 * read one file and concluded the docblock was lying.
 *
 * V4-SCOPE §2.4's `arc-modal` → `arc-dialog` rename is the first of these, and
 * it will not be the last: an empty subclass is how a renamed tag keeps working
 * for a major without the alias being a copy that can drift from the original.
 *
 * Resolved through the import rather than by matching class names, so a rename
 * that breaks the link reads as "no base" and fails the checks loudly instead
 * of silently widening what they accept.
 *
 * @returns {string | null} the base component's source text
 */
export function baseComponentSource(source) {
  const ext = source.match(/^export\s+class\s+\w+\s+extends\s+(\w+)\s*\{/m);
  if (!ext) return null;
  const imported = new RegExp(
    `import\\s*\\{[^}]*\\b${ext[1]}\\b[^}]*\\}\\s*from\\s*['"]([^'"]+)['"]`,
  ).exec(source);
  if (!imported) return null;

  const spec = imported[1];
  if (!spec.startsWith('.')) return null;
  for (const meta of findComponents().values()) {
    const rel = `${meta.tier}/${meta.file}`;
    if (rel.endsWith(`/${spec.replace(/^\.\//, '')}`) || rel === spec.replace(/^\.\.\//, '')) {
      return readFileSync(resolve(SRC_DIR, meta.tier, meta.file), 'utf-8');
    }
  }
  return null;
}

// ── The component view ──────────────────────────────────────────────────────

/**
 * Everything a rule can ask about one component, computed lazily.
 *
 * Lazily because most rules want one of these and computing all of them for
 * 200 components on every check is work nobody asked for. Cached because two
 * rules in the same run will want the same one.
 */
class ComponentSource {
  constructor(meta, source) {
    this.meta = meta;
    /** @type {string} tag name, e.g. `arc-button`. */
    this.tag = meta.tag;
    /** @type {string} repo-relative path, for reporting. */
    this.file = relative(ROOT, resolve(SRC_DIR, meta.tier, meta.file));
    /** @type {string} the raw file. */
    this.source = source;
    this._cache = new Map();
  }

  _memo(key, compute) {
    if (!this._cache.has(key)) this._cache.set(key, compute());
    return this._cache.get(key);
  }

  /** The file with comments blanked and offsets preserved. */
  get code() {
    return this._memo('code', () => withoutComments(this.source));
  }

  /** The JSDoc block immediately above the exported class. */
  get docblock() {
    return this._memo('docblock', () => {
      const cls = this.source.search(/^export\s+class\s/m);
      if (cls === -1) return '';
      const open = this.source.lastIndexOf('/**', cls);
      if (open === -1) return '';
      const close = this.source.indexOf('*/', open);
      return close === -1 ? '' : this.source.slice(open, close + 2);
    });
  }

  /**
   * Every `@`-tag in the docblock, as `{ tag, text, line }`, in source order.
   *
   * Multi-line tags are joined: a `@prop` description that wraps is one tag
   * with one text, which is what a rule reading it wants. A tag is only a tag
   * at the start of a doc line, so an `@` inside prose does not open one.
   */
  get docTags() {
    return this._memo('docTags', () => {
      const block = this.docblock;
      if (!block) return [];
      const base = this.source.indexOf(block);
      const out = [];
      const lines = block.split('\n');
      let offset = 0;
      for (const raw of lines) {
        const m = raw.match(/^\s*\*\s*@([\w-]+)\s?(.*)$/);
        if (m) {
          out.push({
            tag: m[1],
            text: m[2].trim(),
            line: lineAt(this.source, base + offset),
          });
        } else if (out.length) {
          const cont = raw.match(/^\s*\*\s{2,}(\S.*)$/);
          if (cont) out[out.length - 1].text += ' ' + cont[1].trim();
        }
        offset += raw.length + 1;
      }
      return out;
    });
  }

  /** Docblock tags of one name, e.g. `docTag('csspart')`. */
  docTag(name) {
    return this.docTags.filter((t) => t.tag === name);
  }

  /**
   * Every entry in `static properties`, as `{ name, text, line }`.
   *
   * Read from the comment-blanked copy: a property named in a comment inside
   * the block is prose, not a declaration.
   */
  get props() {
    return this._memo('props', () => {
      const at = this.code.indexOf('static properties');
      if (at === -1) return [];
      const block = balanced(this.code, at);
      if (!block) return [];

      const out = [];
      const entry = /([\w$]+)\s*:\s*/g;
      entry.lastIndex = 0;
      let m;
      while ((m = entry.exec(block.body))) {
        const after = block.body.slice(m.index + m[0].length);
        // Two shapes: `name: { … }` (Lit's own) and `name: helper(…)` (this
        // repo's vocabulary). Both have to be read whole, and the second is
        // parenthesised rather than braced.
        let text;
        let consumed;
        if (after.startsWith('{')) {
          const inner = balanced(block.body, m.index + m[0].length);
          if (!inner) break;
          text = inner.body;
          consumed = inner.end;
        } else {
          const call = balanced(block.body, m.index + m[0].length, '(', ')');
          if (!call) {
            entry.lastIndex = m.index + m[0].length;
            continue;
          }
          text = after.slice(0, call.end - (m.index + m[0].length) + 1);
          consumed = call.end;
        }
        out.push({
          name: m[1],
          text,
          line: lineAt(this.code, block.start + 1 + m.index),
        });
        entry.lastIndex = consumed;
      }
      return out;
    });
  }

  /** One property entry by name, or undefined. */
  prop(name) {
    return this.props.find((p) => p.name === name);
  }

  /**
   * Every `css` template in the file, as `{ text, start }` against the original
   * source.
   *
   * Located in the comment-blanked copy so a `css\`` mentioned in prose does not
   * open one — the same false positive that took a hand-written scanner out of
   * `css-backticks`.
   */
  get styleBlocks() {
    return this._memo('styleBlocks', () => {
      const out = [];
      const opener = /\bcss`/g;
      let m;
      while ((m = opener.exec(this.code))) {
        const from = m.index + m[0].length;
        const close = this.code.indexOf('`', from);
        if (close === -1) break;
        out.push({ text: this.source.slice(from, close), start: from });
        opener.lastIndex = close + 1;
      }
      return out;
    });
  }

  /**
   * Every innermost CSS rule across every style block, as
   * `{ selector, body, line }`.
   *
   * Innermost falls out of the pattern for free: `[^{}]*` can never span a
   * brace, so a match is always a leaf block and its selector is the text since
   * the previous one. That is the same reasoning `rtl-intl` records for its own
   * copy, and it is why at-rules need no special handling — `@media` wraps the
   * rules it contains rather than being one.
   */
  get cssRules() {
    return this._memo('cssRules', () => {
      const out = [];
      for (const block of this.styleBlocks) {
        for (const rule of block.text.matchAll(/([^{}]*)\{([^{}]*)\}/g)) {
          out.push({
            selector: rule[1].trim().replace(/\s+/g, ' '),
            body: rule[2].trim(),
            line: lineAt(this.source, block.start + rule.index),
          });
        }
      }
      return out;
    });
  }

  /**
   * The body of a method, by brace depth, or null.
   *
   * Matched at the start of a line so that a call to `render()` inside another
   * method does not read as its declaration.
   */
  method(name) {
    return this._memo(`method:${name}`, () => {
      const m = new RegExp(`^\\s{2}(?:async\\s+)?${name}\\s*\\(`, 'm').exec(this.code);
      if (!m) return null;
      const body = balanced(this.code, m.index);
      return body ? { body: body.body, line: lineAt(this.code, m.index) } : null;
    });
  }
}

// ── Running rules ───────────────────────────────────────────────────────────

/**
 * Run one or more rules over every component and report as a check.
 *
 * Rules never exit or print. `run()` owns both, so every check built on this
 * reports identically — which is the other half of why nine hand-rolled scans
 * were worth replacing: they each formatted their findings a little
 * differently, and a reader learns the format once.
 *
 * @param {object} opts
 * @param {string} opts.name - Check name, for the summary line.
 * @param {Array<{name: string, describe: string, component: Function, hint?: string}>} opts.rules
 * @param {(meta: object) => boolean} [opts.filter] - Which components to visit.
 * @returns {number} process exit code
 */
export function run({ name, rules, filter = () => true }) {
  const components = [...findComponents().values()].filter(filter);

  // Anti-vacuity, once, for every check built on this. A rule that visits
  // nothing passes, and the three ways that happens — a broken walk, an
  // over-narrow filter, an empty rule list — all look like success.
  if (components.length === 0) {
    console.error(`check-${name}: no components matched the filter — nothing was asserted.`);
    return 1;
  }
  if (rules.length === 0) {
    console.error(`check-${name}: no rules — nothing was asserted.`);
    return 1;
  }

  const findings = [];
  for (const meta of components) {
    const source = readFileSync(resolve(SRC_DIR, meta.tier, meta.file), 'utf-8');
    const view = new ComponentSource(meta, source);
    for (const rule of rules) {
      rule.component({
        ...view,
        tag: view.tag,
        file: view.file,
        source: view.source,
        code: view.code,
        docTag: (n) => view.docTag(n),
        docTags: view.docTags,
        props: view.props,
        prop: (n) => view.prop(n),
        cssRules: view.cssRules,
        styleBlocks: view.styleBlocks,
        method: (n) => view.method(n),
        meta,
        report: (line, message) =>
          findings.push({ rule: rule.name, tag: view.tag, file: view.file, line, message }),
      });
    }
  }

  if (findings.length) {
    console.error(`check-${name}: ${findings.length} finding(s)\n`);
    const byRule = new Map();
    for (const f of findings) {
      if (!byRule.has(f.rule)) byRule.set(f.rule, []);
      byRule.get(f.rule).push(f);
    }
    for (const [ruleName, list] of byRule) {
      const rule = rules.find((r) => r.name === ruleName);
      console.error(`  ${ruleName} — ${rule.describe}`);
      for (const f of list) {
        console.error(`    ${f.file}:${f.line}  ${f.tag}`);
        console.error(`      ${f.message}`);
      }
      if (rule.hint) console.error(`\n    ${rule.hint}\n`);
    }
    return 1;
  }

  console.log(
    `check-${name}: ${components.length} components, ${rules.length} rule(s), no findings`,
  );
  return 0;
}

export { ComponentSource };
