#!/usr/bin/env node
/**
 * Adopt the declared-props vocabulary (src/shared/props.js) across components.
 *
 *   node scripts/codemod-declared-props.js --kind=flag [--dry] [--only=input/knob.js]
 *
 * Deliberately conservative. It transforms only what it can read with
 * certainty and reports everything it skipped, because the failure mode of a
 * property codemod is a component that still compiles and quietly behaves
 * differently. Anything ambiguous is left for a human.
 *
 * `--kind=flag`  booleans     → flag(default, { attribute, negative })
 * `--kind=enum`  string enums → oneOf([...], { default })
 *
 * Enum members come from the `@prop {'a' | 'b'}` union in the JSDoc, which is
 * the same source the six framework wrappers and the docs site already treat as
 * authoritative, and `prop-unions.js` already checks it survives generation.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(__dirname, '..', 'packages', 'web-components', 'src');
const TIERS = ['content', 'data', 'feedback', 'input', 'layout', 'navigation', 'typography', 'shared'];

const args = process.argv.slice(2);
const KIND = (args.find((a) => a.startsWith('--kind=')) ?? '--kind=flag').split('=')[1];
const DRY = args.includes('--dry');
const ONLY = args.find((a) => a.startsWith('--only='))?.split('=')[1];

/** The balanced `{ … }` at or after `from`. */
function balanced(src, from) {
  const open = src.indexOf('{', from);
  if (open === -1) return null;
  let depth = 0;
  for (let i = open; i < src.length; i += 1) {
    if (src[i] === '{') depth += 1;
    else if (src[i] === '}' && (depth -= 1) === 0) {
      return { body: src.slice(open + 1, i), start: open, end: i };
    }
  }
  return null;
}

/** `name: { … }` entries of the static properties block, with source offsets. */
function declarations(src) {
  const at = src.indexOf('static properties');
  if (at === -1) return null;
  const block = balanced(src, at);
  if (!block) return null;

  const out = [];
  const entry = /(\w+)\s*:\s*\{/g;
  let m;
  while ((m = entry.exec(block.body))) {
    const inner = balanced(block.body, m.index);
    if (!inner) break;
    out.push({
      name: m[1],
      decl: inner.body,
      from: block.start + 1 + m.index,
      to: block.start + 1 + inner.end + 1,
    });
    entry.lastIndex = inner.end;
  }
  return { block, entries: out };
}

/** Top-level `this.x = <literal>;` assignments in the constructor. */
function constructorDefaults(src) {
  const m = /\n\s*constructor\s*\(/.exec(src);
  if (!m) return new Map();
  const ctor = balanced(src, m.index);
  if (!ctor) return new Map();

  const found = new Map();
  let depth = 0;
  for (const line of ctor.body.split('\n')) {
    const assign = /^\s*this\.(\w+)\s*=\s*([^;]+);/.exec(line);
    if (assign && depth === 0) found.set(assign[1], assign[2].trim());
    depth += (line.match(/[{[(]/g) || []).length - (line.match(/[}\])]/g) || []).length;
  }
  return found;
}

/** Documented union members for a prop, from `@prop {'a' | 'b'} name`. */
function documentedUnion(src, prop) {
  const re = new RegExp(`@prop\\s+\\{([^}]*)\\}\\s+${prop}\\b`);
  const m = re.exec(src);
  if (!m) return null;
  const type = m[1];
  // Only a pure union of string literals. A union containing `string`,
  // `number`, `null` or an object is not a closed set and must not get a
  // fallback — that would turn a legal value into the default.
  if (!/^\s*'[^']*'(\s*\|\s*'[^']*')+\s*$/.test(type)) return null;
  return [...type.matchAll(/'([^']*)'/g)].map((x) => x[1]);
}

/** kebab-case attribute for a prop, matching Lit's default. */
const kebab = (prop) => prop.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

/** The negative attribute name for a true-defaulting flag. */
function negativeFor(prop) {
  const attr = kebab(prop);
  // showDots -> no-dots, border -> no-border, pauseOnHover -> no-pause-on-hover
  return `no-${attr.replace(/^(show|allow|enable|with)-/, '')}`;
}

const results = { changed: [], skipped: [] };

for (const tier of TIERS) {
  const dir = path.join(SRC, tier);
  if (!fs.existsSync(dir)) continue;

  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith('.js') || file.endsWith('.register.js') || file === 'index.js') continue;
    const rel = `${tier}/${file}`;
    if (ONLY && rel !== ONLY) continue;

    const full = path.join(dir, file);
    let src = fs.readFileSync(full, 'utf-8');
    if (!/extends\s+(?:\w+\()?LitElement/.test(src)) continue;

    const parsed = declarations(src);
    if (!parsed) continue;
    const defaults = constructorDefaults(src);

    const edits = [];
    for (const { name, decl, from, to } of parsed.entries) {
      if (/\bstate\s*:\s*true/.test(decl)) continue;
      if (/\bconverter\s*:/.test(decl)) {
        results.skipped.push(`${rel}:${name} — has its own converter`);
        continue;
      }
      if (/attribute\s*:\s*false/.test(decl)) continue;

      const attrMatch = /attribute\s*:\s*'([^']+)'/.exec(decl);
      const attr = attrMatch?.[1];
      const reflect = /\breflect\s*:\s*true/.test(decl);

      if (KIND === 'flag') {
        if (!/type\s*:\s*Boolean/.test(decl)) continue;
        const def = defaults.get(name);
        if (def !== 'true' && def !== 'false' && def !== undefined) {
          results.skipped.push(`${rel}:${name} — default is not a boolean literal (${def})`);
          continue;
        }
        const isTrue = def === 'true';
        const opts = [];
        if (attr) opts.push(`attribute: '${attr}'`);
        if (isTrue) opts.push(`negative: '${negativeFor(name)}'`);
        if (!reflect) opts.push('reflect: false');
        const call = `flag(${isTrue}${opts.length ? `, { ${opts.join(', ')} }` : ''})`;
        edits.push({ from, to, text: `${name}: ${call}` });
      }

      if (KIND === 'enum') {
        if (!/type\s*:\s*String/.test(decl)) continue;
        const members = documentedUnion(src, name);
        if (!members) continue;
        const def = defaults.get(name);
        const literal = def && /^'[^']*'$/.test(def) ? def.slice(1, -1) : undefined;
        if (literal === undefined) {
          results.skipped.push(`${rel}:${name} — enum default is not a string literal (${def})`);
          continue;
        }
        if (!members.includes(literal)) {
          results.skipped.push(`${rel}:${name} — default '${literal}' is not in the documented union`);
          continue;
        }
        const opts = [];
        if (literal !== members[0]) opts.push(`default: '${literal}'`);
        if (attr) opts.push(`attribute: '${attr}'`);
        if (!reflect) opts.push('reflect: false');
        const list = members.map((v) => `'${v}'`).join(', ');
        const call = `oneOf([${list}]${opts.length ? `, { ${opts.join(', ')} }` : ''})`;
        edits.push({ from, to, text: `${name}: ${call}` });
      }
    }

    if (!edits.length) continue;

    // Apply back-to-front so earlier offsets stay valid.
    for (const e of edits.reverse()) src = src.slice(0, e.from) + e.text + src.slice(e.to);

    // Mixin + import, once per file.
    if (!/DeclaredPropsMixin/.test(src)) {
      src = src.replace(/extends\s+LitElement/, 'extends DeclaredPropsMixin(LitElement)');
      const depth = rel.includes('/') ? '../' : './';
      const importLine = `import { DeclaredPropsMixin, ${KIND === 'flag' ? 'flag' : 'oneOf'} } from '${depth}shared/props.js';\n`;
      const lines = src.split('\n');
      const last = lines.reduce((acc, l, i) => (l.startsWith('import ') ? i : acc), -1);
      lines.splice(last + 1, 0, importLine.trimEnd());
      src = lines.join('\n');
    } else {
      // Already adopted for the other kind — extend the existing import.
      const helper = KIND === 'flag' ? 'flag' : 'oneOf';
      src = src.replace(
        /import \{ DeclaredPropsMixin([^}]*)\} from '(\.\.?\/)shared\/props\.js';/,
        (whole, rest, dots) =>
          rest.includes(helper)
            ? whole
            : `import { DeclaredPropsMixin${rest.trimEnd()}, ${helper} } from '${dots}shared/props.js';`,
      );
    }

    results.changed.push(`${rel} (${edits.length} prop${edits.length === 1 ? '' : 's'})`);
    if (!DRY) fs.writeFileSync(full, src);
  }
}

console.log(`codemod --kind=${KIND}${DRY ? ' --dry' : ''}\n`);
console.log(`changed: ${results.changed.length} file(s)`);
for (const c of results.changed) console.log(`  ${c}`);
if (results.skipped.length) {
  console.log(`\nskipped, left for a human: ${results.skipped.length}`);
  for (const s of results.skipped) console.log(`  ${s}`);
}
