#!/usr/bin/env node
/**
 * array-dialect.js
 *
 * An array-valued prop is declared with `list()`.
 *
 * The third of V4-PLAN 4.3's five convention checks. `list()` was created in
 * 2.2; 4.3 is the sitewide migration onto it, and this is what stops the four
 * dialects it replaced from coming back one prop at a time. Each rule below
 * bans exactly one of them, and the reason each is banned is a defect rather
 * than a preference:
 *
 *  1. **`{ type: Array }`** — Lit's stock converter calls `JSON.parse` and lets
 *     it throw, inside `attributeChangedCallback`, where a custom-element
 *     reaction's exception is reported globally rather than propagated. One bad
 *     attribute in server-rendered markup and the element never renders.
 *  2. **`{ attribute: false }`** on an array — the prop has no markup form, so
 *     static HTML cannot set it at all. This one is the reason the check reads
 *     the JSDoc: the declaration for a property-only array and the declaration
 *     for a property-only *function* are the same three words, and only one of
 *     them is wrong. The type in `@prop` is what tells them apart.
 *  3. **A hand-rolled `converter`** — six copies of the same eight lines in
 *     `navigation/`, and all six had the same bug: `JSON.parse(null)` coerces
 *     to the string `"null"`, parses fine and returns `null`, so removing the
 *     attribute left a non-array on a prop typed as an array.
 *  4. **JSON-as-String** — the property holds a string and the component holds
 *     an array, so every reader has to know which side of the parse it is on.
 *
 * Rules 3 and 4 are one rule here: both show up as a `JSON.parse` of something
 * the component declared, and the fix for both is the same declaration.
 */
import { run } from '../lib/source-walker.js';
import { findComponents } from '../lib/component-tags.js';

/** A documented type that means "this prop holds an array". */
const ARRAY_TYPE = /^(?:Array\b|readonly\s|\w[\w.<>{},:?|'" ]*\[\]$|Array<)/;

/**
 * Props that parse a string the component was given on purpose.
 *
 * Not the JSON-as-String dialect, which is a prop that *should* have been an
 * array and was declared a string by accident. The distinction is whether the
 * string is the feature.
 */
const PARSES_ON_PURPOSE = {
  'arc-json-tree': {
    json: 'the component renders a JSON document, so the document text is the input; `data` beside it is the parsed form for callers who already have one',
  },
};

/** The documented type of a prop, from `@prop {T} name - …`, or null. */
function documentedType(docTags, name) {
  for (const tag of docTags) {
    if (tag.tag !== 'prop') continue;
    const m = tag.text.match(/^\{([\s\S]+?)\}\s+([\w$]+)\b/);
    if (m && m[2] === name) return m[1].trim();
  }
  return null;
}

/** Whether a property entry is one of the declared-props helpers. */
function isHelper(text) {
  return /^\s*[a-z]\w*\(/.test(text);
}

const stockArrayType = {
  name: 'array-type',
  describe: 'an array prop is declared with list(), not { type: Array }',
  hint:
    "Replace it with `list()`. Pass `{ attribute: 'kebab-name' }` where the attribute\n" +
    "    name differs from the property, and `{ of: Number }` for a comma-list attribute.\n" +
    '    Drop the constructor initialiser at the same time — the declaration is the\n' +
    '    default, and the mixin seeds it at construction.',
  component({ prop: _prop, props, report }) {
    for (const p of props) {
      if (isHelper(p.text)) continue;
      if (!/\btype:\s*Array\b/.test(p.text)) continue;
      report(
        p.line,
        `\`${p.name}\` uses Lit's stock Array converter, which throws on a malformed ` +
          'attribute inside attributeChangedCallback.',
      );
    }
  },
};

const propertyOnlyArray = {
  name: 'array-property-only',
  describe: 'an array prop has a markup form',
  hint:
    'Replace `{ attribute: false }` with `list()`. If the prop is not actually an\n' +
    '    array — a render callback, a parsed object — the fix is the JSDoc type rather\n' +
    '    than the declaration, and this rule stops firing once it is right.',
  component({ props, docTags, report }) {
    for (const p of props) {
      if (isHelper(p.text)) continue;
      if (!/\battribute:\s*false\b/.test(p.text)) continue;
      const type = documentedType(docTags, p.name);
      if (!type || !ARRAY_TYPE.test(type)) continue;
      report(
        p.line,
        `\`${p.name}\` is documented as \`${type}\` and declared property-only, so ` +
          'static HTML cannot set it. `list()` gives it a JSON attribute.',
      );
    }
  },
};

const handParsed = {
  name: 'array-hand-parsed',
  describe: 'no component parses its own array attribute',
  hint:
    "Declare the prop with `list()` and read it directly — it is already an array by\n" +
    '    the time render sees it, on both the attribute and the property path. A prop\n' +
    '    whose input genuinely is a document of text goes in PARSES_ON_PURPOSE.',
  component({ tag, props, code, report, source }) {
    const declared = new Set(props.map((p) => p.name));
    const exempt = PARSES_ON_PURPOSE[tag] ?? {};
    for (const m of code.matchAll(/JSON\.parse\(\s*this\.([\w$]+)/g)) {
      const name = m[1];
      if (!declared.has(name)) continue;
      if (exempt[name]) continue;
      report(
        source.slice(0, m.index).split('\n').length,
        `parses \`this.${name}\` by hand. That is the dialect where the property holds ` +
          'a string and the component holds an array.',
      );
    }
  },
};

const code = run({
  name: 'array-dialect',
  rules: [stockArrayType, propertyOnlyArray, handParsed],
});

/**
 * The exemption map, checked against the tree.
 *
 * Same reasoning as size-canon's and dismiss-prop's, and it earned its keep on
 * the first run the same way: an entry for `arc-icon-registry` was in here for
 * a `JSON.parse` the rule cannot reach — the registry parses its light-DOM text
 * content, not a property — and the audit removed it. An exemption for
 * something that was never going to fire reads as a decision and is not one.
 */
const known = findComponents();
const stale = [];
for (const [tag, props] of Object.entries(PARSES_ON_PURPOSE)) {
  if (!known.has(tag)) {
    stale.push(`${tag}: exempt but not a registered tag`);
    continue;
  }
  for (const [name, reason] of Object.entries(props)) {
    if (!reason?.trim()) stale.push(`${tag}.${name}: exempt with no reason`);
  }
}
if (stale.length) {
  console.error('\ncheck-array-dialect: the PARSES_ON_PURPOSE list is stale\n');
  for (const s of stale) console.error(`  ${s}`);
  process.exit(1);
}

process.exit(code);
