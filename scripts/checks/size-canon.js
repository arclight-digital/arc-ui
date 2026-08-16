#!/usr/bin/env node
/**
 * size-canon.js
 *
 * `size` means `sm | md | lg`, in that order, everywhere it is a control scale.
 *
 * The first of V4-PLAN 4.3's five convention checks, and the first rule written
 * on `scripts/lib/source-walker.js` — which 4.3 builds and 4.10 moves nine
 * existing checks onto.
 *
 * Thirty-nine components already declared exactly the canonical set. A canon is
 * worth having because a consumer can stop looking it up, and that only holds
 * if the exceptions are decided rather than accumulated. So there are two
 * lists, and the difference between them is the whole design:
 *
 * - **NOT_A_SCALE** — the prop shares the word `size` and means something else.
 *   Nothing about the canon applies, and forcing it on would be renaming the
 *   concept to protect the convention.
 * - **EXTENDS** — it *is* the control scale, and has a member beyond it. The
 *   canon is still enforced: all three present, in order, before the extras. A
 *   consumer who knows `sm | md | lg` is right about this component too; they
 *   just have one more option.
 *
 * An entry in either list carries its reason, and both lists are checked for
 * rot — an entry naming a tag that no longer declares `size` is a decision
 * about nothing, which is how a list like this stops being read.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { run } from '../lib/source-walker.js';
import { findComponents, SRC_DIR } from '../lib/component-tags.js';

/** The canon, in order. The order is API — `oneOf`'s first member is the default. */
const CANON = ['sm', 'md', 'lg'];

/** `size` here is not a control scale at all. */
const NOT_A_SCALE = {
  'arc-qr-code': 'a pixel dimension — the QR code edge in px',
  'arc-resizable': 'a pixel dimension — the pane extent in px',
  'arc-container':
    'a max-width scale for page containers (sm…xl, full). That is the layout ' +
    'axis rather than the control axis; sharing three member names with the ' +
    'control canon is a coincidence of vocabulary, not a shared meaning',
  'arc-icon':
    'the type scale, not the control scale. An icon is set beside text at every ' +
    'text size, so it needs xs and xl for the same reason the text does. 4.5 ' +
    'owns whether these become font-role tokens',
};

/** The control scale, with a member beyond the canon. */
const EXTENDS = {
  'arc-icon-button':
    'xs, for an icon button set inside dense chrome. Load-bearing rather than ' +
    'speculative: arc-signature-pad renders one at that size',
  'arc-theme-toggle':
    'xs, matching arc-icon-button, which it is a specialisation of — the two ' +
    'appear beside each other in a top bar and would look wrong at different ' +
    'floors',
};

/** The `oneOf([...])` members declared for a prop, or null when it is not one. */
function declaredMembers(text) {
  const list = text?.match(/oneOf\(\s*\[([\s\S]*?)\]/);
  if (!list) return null;
  return list[1]
    .split(',')
    .map((x) => x.trim().replace(/^['"]|['"]$/g, ''))
    .filter(Boolean);
}

const sizeCanon = {
  name: 'size-canon',
  describe: "size is 'sm' | 'md' | 'lg', in that order, before any extension",
  hint:
    "Add the missing members, or reorder them — oneOf's first member is the default,\n" +
    '    so the order is API. A prop that is not a control scale goes in NOT_A_SCALE;\n' +
    '    a scale with an extra member goes in EXTENDS. Both take a reason, and both\n' +
    '    are decisions rather than suppressions.',
  component({ tag, prop, report }) {
    const size = prop('size');
    if (!size) return;
    if (NOT_A_SCALE[tag]) return;

    const members = declaredMembers(size.text);
    if (!members) {
      if (/type:\s*Number/.test(size.text)) {
        report(
          size.line,
          'size is a number and is not listed in NOT_A_SCALE — a dimension is not a scale.',
        );
        return;
      }
      report(
        size.line,
        'size is not declared with oneOf(), so nothing derives its members and an ' +
          'unrecognised value cannot fall back to the default.',
      );
      return;
    }

    // The canon must be present, and must be the first three in order. An
    // extension sits after it, so `['xs','sm','md','lg']` fails this and
    // `['sm','md','lg','xl']` passes — which is deliberate: a member before the
    // canon changes what `oneOf` defaults to.
    const head = members.slice(0, CANON.length);
    if (head.join('|') !== CANON.join('|')) {
      const missing = CANON.filter((m) => !members.includes(m));
      report(
        size.line,
        missing.length
          ? `size is missing ${missing.map((m) => `'${m}'`).join(', ')} — declared [${members.join(', ')}]`
          : `size declares the canon out of order — [${members.join(', ')}]. The first three ` +
            `members must be ${CANON.join(', ')}, since the first is the default.`,
      );
      return;
    }

    const extra = members.slice(CANON.length);
    if (extra.length && !EXTENDS[tag]) {
      report(
        size.line,
        `size declares ${extra.map((m) => `'${m}'`).join(', ')} beyond the canon. ` +
          'If that is intended, add it to EXTENDS with the reason.',
      );
    }
  },
};

/**
 * Both lists, checked against the tree.
 *
 * A list of decided exceptions is only worth reading while every entry is still
 * a decision about something. Three ways it stops being one, all caught here:
 * an empty reason, a tag that is not registered, and a tag that no longer
 * declares `size` at all.
 */
function auditLists() {
  const components = findComponents();
  const stale = [];

  for (const [label, list] of [['NOT_A_SCALE', NOT_A_SCALE], ['EXTENDS', EXTENDS]]) {
    for (const [tag, reason] of Object.entries(list)) {
      if (!reason?.trim()) {
        stale.push(`${label}: ${tag} has no reason`);
        continue;
      }
      const meta = components.get(tag);
      if (!meta) {
        stale.push(`${label}: ${tag} is not a registered tag`);
        continue;
      }
      const source = readFileSync(resolve(SRC_DIR, meta.tier, meta.file), 'utf-8');
      if (!/^\s*size:/m.test(source)) {
        stale.push(`${label}: ${tag} no longer declares a size prop`);
      }
    }
  }
  return stale;
}

const code = run({ name: 'size-canon', rules: [sizeCanon] });

// After the sweep, so a stale exception is reported next to the findings it
// might otherwise have been hiding rather than instead of them.
const stale = auditLists();
if (stale.length) {
  console.error('\ncheck-size-canon: the exception lists are stale\n');
  for (const s of stale) console.error(`  ${s}`);
  console.error(
    '\nAn entry that no longer describes anything is a decision about nothing, and\n' +
      'that is how a list like this stops being read. Remove it or fix the reason.',
  );
  process.exit(1);
}

process.exit(code);
