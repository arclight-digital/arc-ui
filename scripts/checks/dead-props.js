#!/usr/bin/env node
/**
 * check-dead-props.js
 *
 * Every public prop is read by something.
 *
 * `arc-sidebar.width` was declared, defaulted to '280px' and read by nothing
 * (finding #92). The 280px a consumer saw came from somewhere else, so the prop
 * looked like it worked right up until someone passed a different value. Tests
 * are written from the implementation, so a prop nothing reads gets no test:
 * delete its `@prop` line and nothing fails. test-frame §4.1 ranked this the
 * highest-value guard left unbuilt; this is it.
 *
 * A prop counts as read when any of these holds:
 *
 * - its own component, or a class it extends, reads `this.<name>` anywhere
 *   other than as an assignment target, or destructures it from `this`;
 * - a CSS rule in the component selects on its attribute (`:host([size="sm"])`);
 * - a shared mixin reads it (FormControlMixin reads `name`, `disabled` and more);
 * - any other source file reads `.<name>` on something other than `this`, which
 *   is how a parent reads a data-child's props (arc-dropdown-menu reading
 *   `child.shortcut`).
 *
 * The last test is deliberately loose. It lets a real dead prop through when an
 * unrelated file happens to read a same-named property. That is the right
 * direction for this check to be wrong in: a false finding teaches people to
 * waive, and a waiver list that grows is a check nobody reads.
 *
 * The constructor is excluded from reads, and so is the `static properties`
 * block, because a default and a declaration are not uses.
 *
 * Run via: pnpm check dead-props (and as part of pnpm generate)
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { run, balanced, withoutComments, baseComponentSource } from '../lib/source-walker.js';
import { SRC_DIR } from '../lib/component-tags.js';

/**
 * Props read by a path this check cannot see. Each needs its reason; delete
 * an entry the moment its prop gains a visible read.
 */
const WAIVERS = {
  'arc-popover.trigger':
    'deprecated in 4.6: documented as reserved for future trigger modes and never read. ' +
    'Removing a public prop is a major change, so it has no effect until v5 removes it; ' +
    'the dev module warns when it is set',
};

/** Every source file under src, comment-blanked, keyed by path. */
function allSources() {
  const out = new Map();
  const walk = (dir) => {
    for (const f of readdirSync(dir)) {
      const p = join(dir, f);
      if (statSync(p).isDirectory()) walk(p);
      else if (f.endsWith('.js') && !f.endsWith('.register.js')) {
        out.set(p, withoutComments(readFileSync(p, 'utf-8')));
      }
    }
  };
  walk(SRC_DIR);
  return out;
}
const SOURCES = allSources();

/** Mixins every component may pull reads from. */
const MIXIN_CODE = ['shared/form-control-mixin.js']
  .map((f) => SOURCES.get(resolve(SRC_DIR, f)) ?? '')
  .join('\n');

/** The code a component's own reads may appear in: minus declarations and constructor. */
function readableCode(code) {
  let out = code;
  const cut = (from) => {
    if (from === -1) return;
    const block = balanced(out, from);
    if (!block) return;
    out =
      out.slice(0, block.start) +
      ' '.repeat(block.end - block.start + 1) +
      out.slice(block.end + 1);
  };
  cut(out.indexOf('static properties'));
  const ctor = /^\s{2}constructor\s*\(/m.exec(out);
  if (ctor) cut(ctor.index);
  return out;
}

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function readsThis(code, name) {
  // `this.name` not followed by an assignment (`=` but not `==`/`===`/`=>`).
  const re = new RegExp(
    `this\\.${escape(name)}\\b(?!\\s*(?:[-+*/%&|^]|\\?\\?|\\|\\||&&)?=(?!=|>))`,
  );
  if (re.test(code)) return true;
  // `const { a, name, b } = this`
  for (const m of code.matchAll(/\{([^{}]*)\}\s*=\s*this\b/g)) {
    if (new RegExp(`(^|[\\s,])${escape(name)}(\\s*[,:}]|\\s*$)`).test(m[1])) return true;
  }
  return false;
}

function attributeOf(prop) {
  const explicit = prop.text.match(/attribute:\s*['"]([\w-]+)['"]/);
  if (explicit) return explicit[1];
  if (/attribute:\s*false/.test(prop.text)) return null;
  return prop.name.toLowerCase();
}

export const rule = {
  name: 'dead-props',
  describe: 'every public prop is read by something',
  hint:
    'Wire it (read it in the template, styles or logic), delete it and its @prop line, or,\n' +
    '    if something reads it in a way this check cannot see, add it to WAIVERS with the reason.',
  component({ tag, file, props, code, source, report }) {
    const own = readableCode(code);
    const base = baseComponentSource(source);
    const baseCode = base ? readableCode(withoutComments(base)) : '';
    const ownPath = resolve(SRC_DIR, '..', '..', '..', file);
    const isRead = (prop) => {
      if (readsThis(own, prop.name) || (baseCode && readsThis(baseCode, prop.name))) return true;
      const attr = attributeOf(prop);
      if (attr && new RegExp(`\\[${escape(attr)}(?=[\\]=~|^$*])`).test(own)) return true;
      if (readsThis(MIXIN_CODE, prop.name)) return true;
      const elsewhere = new RegExp(`(?<!this)(?<![\\w$])[\\w$\\])]+\\??\\.${escape(prop.name)}\\b`);
      for (const [path, other] of SOURCES) {
        if (path !== ownPath && elsewhere.test(other)) return true;
      }
      return false;
    };
    for (const prop of props) {
      if (prop.name.startsWith('_') || /state:\s*true/.test(prop.text)) continue;
      const waived = WAIVERS[`${tag}.${prop.name}`];
      const read = isRead(prop);
      if (waived && read) {
        report(prop.line, `\`${prop.name}\` is waived but is now read: delete its WAIVERS entry`);
      } else if (!waived && !read) {
        report(prop.line, `\`${prop.name}\` is declared but nothing reads it`);
      }
    }
    // A waiver naming a prop this component no longer declares is a decision
    // about nothing, which is how a list like this stops being read.
    for (const key of Object.keys(WAIVERS)) {
      const [wTag, wProp] = key.split('.');
      if (wTag === tag && !props.some((p) => p.name === wProp)) {
        report(1, `WAIVERS names \`${key}\`, which is no longer declared: delete the entry`);
      }
    }
  },
};

process.exit(run({ name: 'dead-props', rules: [rule] }));
