#!/usr/bin/env node
/**
 * group-gating.js
 *
 * Asserts that the domain groups (V4-SCOPE §1.1) actually gate the barrels, in
 * both directions and in every framework.
 *
 * The group axis is expressed twice on purpose — once as the `@arc-group`
 * annotation that `generate/group-barrels.js` writes `src/marketing/index.js`
 * from, and once as prism's `barrelExclude`, which removes the same names from
 * the default barrels. Both derive from the same annotation, so they cannot
 * disagree *today*; this check exists because the two halves are executed by
 * different tools at different points in the pipeline, and the failure mode
 * when they come apart is silent and total:
 *
 *   - excluded but not in a group barrel → the component ships in the tarball
 *     and is importable from no barrel at all. Nothing else notices: the file
 *     exists, its subpath resolves, its wrappers generate, its tests pass.
 *   - in a group barrel but not excluded → the group is decorative. A default
 *     `@arclux/arc-ui` import still drags a landing-page carousel into an admin
 *     dashboard, which is the entire cost the grouping was meant to remove.
 *
 * The second is the one that would survive review, because everything works.
 * That is exactly why it is asserted rather than trusted.
 *
 * Checked against the barrels **as written to disk**, never against the config
 * that was supposed to produce them — the same rule prism's own prune follows.
 * A check that re-derived the expected barrel from the annotations would agree
 * with itself no matter what the generators did.
 *
 * Run via: pnpm check group-gating (and as part of pnpm generate)
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { findComponents, findGroups, GROUPS, SRC_DIR, TIERS } from '../lib/component-tags.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');

/**
 * The barrels a grouped component must be absent from: the web-component root
 * and tier barrels, plus the same two for every framework package that prism
 * generates barrels for. Tier barrels matter as much as root ones — the tier
 * barrel is a published subpath of its own (`@arclux/arc-ui-react/content`).
 */
const BARREL_ROOTS = [
  { label: 'web-components', dir: join(ROOT, 'packages/web-components/src'), ext: '.js' },
  { label: 'react', dir: join(ROOT, 'packages/react/src'), ext: '.ts' },
  { label: 'preact', dir: join(ROOT, 'packages/preact/src'), ext: '.ts' },
  { label: 'vue', dir: join(ROOT, 'packages/vue/src'), ext: '.ts' },
  { label: 'svelte', dir: join(ROOT, 'packages/svelte/src'), ext: '.ts' },
  { label: 'solid', dir: join(ROOT, 'packages/solid/src'), ext: '.ts' },
  { label: 'angular', dir: join(ROOT, 'packages/angular/src'), ext: '.ts' },
];

/** Identifier-boundary search, so `ArcComparison` does not match `ArcComparisonColumn`. */
function mentions(text, name) {
  return new RegExp(`(?<![\\w$])${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\w$])`).test(text);
}

/** Every barrel file under a package root, as `{ path, text }`. */
function barrelsOf({ dir, ext }) {
  const out = [];
  for (const rel of [`index${ext}`, ...TIERS.map((t) => join(t, `index${ext}`))]) {
    const path = join(dir, rel);
    if (existsSync(path)) out.push({ path, text: readFileSync(path, 'utf-8') });
  }
  return out;
}

const components = findComponents();
const groups = findGroups();
const problems = [];

// ── 1. Every grouped component is absent from every default barrel ──────────
//
// The wrapper class name differs from the web-component one (ArcCarousel vs
// Carousel), so both spellings are searched. A false positive here is cheap; a
// missed one ships the thing the grouping was for.
for (const [group, members] of groups) {
  for (const comp of members) {
    const pascal = comp.className.replace(/^Arc/, '');
    for (const pkg of BARREL_ROOTS) {
      const names = pkg.label === 'web-components' ? [comp.className] : [pascal];
      for (const { path, text } of barrelsOf(pkg)) {
        for (const name of names) {
          if (mentions(text, name)) {
            problems.push(
              `${comp.tag} is in group "${group}" but still exported from ` +
                `${path.slice(ROOT.length + 1)} as ${name}`,
            );
          }
        }
      }
    }
  }
}

// ── 2. Every group barrel exists and exports exactly its members ────────────
for (const [group, members] of groups) {
  const path = resolve(SRC_DIR, group, 'index.js');
  if (!existsSync(path)) {
    problems.push(`group "${group}" has no barrel at src/${group}/index.js`);
    continue;
  }
  const text = readFileSync(path, 'utf-8');
  for (const comp of members) {
    if (!mentions(text, comp.className)) {
      problems.push(`${comp.tag} is in group "${group}" but src/${group}/index.js does not export ${comp.className}`);
    }
  }
  // The reverse: a name in the barrel that no longer claims the group. Only
  // Arc-prefixed identifiers are components; `export *` lines carry none.
  for (const [, name] of text.matchAll(/\b(Arc[A-Z]\w*)\b/g)) {
    const owner = [...components.values()].find((c) => c.className === name);
    if (!owner) {
      problems.push(`src/${group}/index.js exports ${name}, which is not a component`);
    } else if (owner.group !== group) {
      problems.push(
        `src/${group}/index.js exports ${name}, whose @arc-group is ` +
          (owner.group ? `"${owner.group}"` : 'absent'),
      );
    }
  }
}

// ── 3. Every group is a published subpath ───────────────────────────────────
const pkg = JSON.parse(readFileSync(join(ROOT, 'packages/web-components/package.json'), 'utf-8'));
for (const group of GROUPS) {
  const key = `./${group}`;
  const entry = pkg.exports[key];
  const target = typeof entry === 'string' ? entry : entry?.default;
  if (target !== `./src/${group}/index.js`) {
    problems.push(
      `package.json exports has no "${key}" → "./src/${group}/index.js"` +
        (target ? ` (found "${target}")` : '') +
        ' — the group barrel is unreachable from outside the package',
    );
  }
}

// Anti-vacuity: with no groups, every assertion above is trivially satisfied
// and this check would report a clean tree while asserting nothing at all.
const grouped = [...groups.values()].flat();
if (grouped.length === 0) {
  console.error('check-group-gating: no component carries an @arc-group — nothing was asserted.');
  process.exit(1);
}

if (problems.length) {
  console.error('check-group-gating: the domain groups do not gate the barrels\n');
  for (const p of problems) console.error(`  ${p}`);
  console.error(
    '\nA group is only real when both halves hold: the component is out of every\n' +
      'default barrel, and in its group barrel. Both derive from @arc-group — run\n' +
      '`pnpm generate` rather than editing a barrel by hand.',
  );
  process.exit(1);
}

const summary = [...groups].map(([g, m]) => `${m.length} ${g}`).join(', ');
console.log(`check-group-gating: ${grouped.length} grouped component(s) gated out of the default barrels — ${summary}`);
