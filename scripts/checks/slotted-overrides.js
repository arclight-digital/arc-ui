#!/usr/bin/env node
/**
 * check-slotted-overrides.js
 *
 * Every `!important` inside a `::slotted(arc-*)` rule names its property, gives
 * its reason, and overrides something the slotted component really sets.
 *
 * `!important` inside `::slotted(arc-x)` is the one mechanism a component has
 * for reaching into another component and overriding a rule that component
 * depends on (test-frame §4.4, finding #91). arc-app-shell's block for
 * arc-sidebar carried four of them, each an unvalidated claim about another
 * component's internals. That block is where #91 came from: the override
 * flattened the sidebar it is documented to compose with.
 *
 * Two rules:
 *
 *   1. Each (file, slotted tag, property) has an entry in OVERRIDES with its
 *      reason, the way type-roles handles EXEMPT. A new one has to be argued
 *      for, in one reviewable place.
 *   2. The slotted component sets that property on its own `:host`. An
 *      `!important` on a property the host never declares overrides nothing:
 *      a stale claim, left behind when the other component changed.
 *
 * Stale entries fail too: an OVERRIDES key with no matching declaration.
 *
 * Run via: pnpm check slotted-overrides (and as part of pnpm generate)
 */
import fs from 'node:fs';
import path from 'node:path';
import { withoutComments } from '../lib/source-walker.js';
import { findComponents, SRC_DIR } from '../lib/component-tags.js';

/** `file ::slotted(tag) property` → why the override is needed. */
const OVERRIDES = {
  // arc-sidebar standing alone is a sticky, viewport-tall, self-scrolling rail
  // of its own width. Inside arc-app-shell, .shell__sidebar is that rail: it
  // owns sticky, height, scrolling and width (and the mobile drawer), and a
  // second sticky, scrolling, fixed-width box nested in it would fight it.
  'layout/app-shell.js ::slotted(arc-sidebar) position':
    'the shell rail is the sticky box; the sidebar inside it must not be a second one',
  'layout/app-shell.js ::slotted(arc-sidebar) height':
    'the shell rail sets the height; min-height: 100% on the rail stretches the sidebar (finding #91)',
  'layout/app-shell.js ::slotted(arc-sidebar) overflow':
    'the shell rail scrolls; a scrolling sidebar inside it would nest two scroll containers',
  'layout/app-shell.js ::slotted(arc-sidebar) width':
    'the shell rail sets the width from --sidebar-width; the sidebar fills it (finding #92)',
};

const components = findComponents();
const sourceOf = (tag) => {
  const meta = components.get(tag);
  return meta ? fs.readFileSync(path.join(SRC_DIR, meta.tier, meta.file), 'utf8') : null;
};

/** Properties a component declares in any :host rule. */
function hostProperties(tag) {
  const src = sourceOf(tag);
  if (!src) return null;
  const props = new Set();
  for (const m of withoutComments(src).matchAll(/:host(?:\([^{}]*\))?[^{}]*\{([^{}]*)\}/g)) {
    for (const p of m[1].matchAll(/(^|[;{\s])([a-z-]+)\s*:/g)) props.add(p[2]);
  }
  return props;
}

const failures = [];
const seen = new Set();

for (const meta of components.values()) {
  const rel = `${meta.tier}/${meta.file}`;
  const code = withoutComments(fs.readFileSync(path.join(SRC_DIR, meta.tier, meta.file), 'utf8'));
  for (const rule of code.matchAll(/([^{}]*)\{([^{}]*)\}/g)) {
    const tags = [...rule[1].matchAll(/::slotted\(\s*(arc-[a-z-]+)/g)].map((m) => m[1]);
    if (!tags.length) continue;
    for (const [, prop] of rule[2].matchAll(/([a-z-]+)\s*:[^;]*!important/g)) {
      for (const tag of new Set(tags)) {
        const key = `${rel} ::slotted(${tag}) ${prop}`;
        seen.add(key);
        if (!OVERRIDES[key]) {
          failures.push(
            `${key}\n      !important with no reason: add it to OVERRIDES, saying what it overrides and why`,
          );
        }
        const host = hostProperties(tag);
        if (host && !host.has(prop)) {
          failures.push(
            `${key}\n      <${tag}> sets no \`${prop}\` on its :host, so this overrides nothing`,
          );
        }
      }
    }
  }
}

for (const key of Object.keys(OVERRIDES)) {
  if (!seen.has(key))
    failures.push(`${key}\n      OVERRIDES entry with no matching declaration: delete it`);
}

if (failures.length) {
  console.error(`check-slotted-overrides: ${failures.length} finding(s)\n`);
  console.error(failures.map((f) => `  ${f}`).join('\n'));
  process.exit(1);
}
console.log(
  `check-slotted-overrides: ${seen.size} override(s), each with its reason and a real target`,
);
