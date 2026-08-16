#!/usr/bin/env node
/**
 * barrel-gating.js
 *
 * Asserts that what is in the default barrels is exactly what should be, in
 * both directions and in every framework.
 *
 * Three things take a component out of the default barrel, and
 * `excludedFrom` in scripts/lib/component-tags.js is the one place that says
 * so: a heavy optional dependency (arc-code-block and shiki), a domain group
 * (V4-SCOPE §1.1), and an `experimental` status. All three end up as prism's
 * `barrelExclude`, and the group half additionally has to appear in a group
 * barrel — so the rule is executed by two tools at two points in the pipeline,
 * and this is what checks that they agreed.
 *
 * The failure modes it exists for are silent and total:
 *
 *   - excluded but not in a group barrel → the component ships in the tarball
 *     and is importable from no barrel at all. Nothing else notices: the file
 *     exists, its subpath resolves, its wrappers generate, its tests pass.
 *   - in a group barrel but not excluded → the group is decorative. A default
 *     `@arclux/arc-ui` import still drags a landing-page carousel into an admin
 *     dashboard, which is the entire cost the grouping was meant to remove.
 *   - experimental but not excluded → a component with no API stability promise
 *     enters the barrel, and taking it back out later is a breaking change even
 *     though it was never meant to be there. This is the one 4.1 landed early,
 *     before 4.8 adds a single experimental component.
 *   - excluded for no stated reason → something is unreachable and nobody
 *     decided that it should be.
 *
 * The middle two would survive review, because everything works. That is
 * exactly why they are asserted rather than trusted.
 *
 * Checked against the barrels **as written to disk**, never against the config
 * that was supposed to produce them — the same rule prism's own prune follows.
 * A check that re-derived the expected barrel from the annotations would agree
 * with itself no matter what the generators did.
 *
 * **Where this check is weak, and what covers it.** There are zero experimental
 * components today, so nothing in the tree exercises the status branch of
 * `excludedFrom`; the summary below says so out loud rather than letting a
 * vacuous pass read as coverage. `test/barrel-gating.test.js` calls
 * `excludedFrom` with a fabricated catalog to cover what the real one cannot.
 *
 * Run via: pnpm check barrel-gating (and as part of pnpm generate)
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { excludedFrom, findComponents, findGroups, GROUPS, SRC_DIR, TIERS } from '../lib/component-tags.js';

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
const excluded = new Set(excludedFrom(components));
const problems = [];

/** Why a tag is out of the default barrels, as a phrase for the message. */
function reasonFor(tag) {
  const comp = components.get(tag);
  if (!comp) return 'a heavy optional dependency';
  const reasons = [];
  if (comp.group) reasons.push(`in group "${comp.group}"`);
  if (comp.status === 'experimental') reasons.push('experimental');
  return reasons.join(' and ') || 'a heavy optional dependency';
}

// ── 1. Every excluded component is absent from every default barrel ─────────
//
// The wrapper class name differs from the web-component one (ArcCarousel vs
// Carousel), so both spellings are searched. A false positive here is cheap; a
// missed one ships the thing the exclusion was for.
for (const tag of excluded) {
  const comp = components.get(tag);
  if (!comp) continue; // heavy-dependency entry for a tag that no longer exists
  const pascal = comp.className.replace(/^Arc/, '');
  for (const pkg of BARREL_ROOTS) {
    const names = pkg.label === 'web-components' ? [comp.className] : [pascal];
    for (const { path, text } of barrelsOf(pkg)) {
      for (const name of names) {
        if (mentions(text, name)) {
          problems.push(
            `${tag} is ${reasonFor(tag)} but still exported from ` +
              `${path.slice(ROOT.length + 1)} as ${name}`,
          );
        }
      }
    }
  }
}

// ── 1b. And every component that is *not* excluded is present in the root ───
//
// The direction nothing else covers. Every check above is satisfied by a barrel
// that exports nothing at all, and a barrel prune that removed too much would
// look identical to one that worked — the component still builds, still tests,
// still has its own subpath. Only the root barrel is asserted: the tier barrels
// are prism's to arrange, and arc-code-block is reached by subpath by design.
const rootBarrel = readFileSync(resolve(SRC_DIR, 'index.js'), 'utf-8');
for (const comp of components.values()) {
  if (excluded.has(comp.tag)) continue;
  if (!mentions(rootBarrel, comp.className)) {
    problems.push(
      `${comp.tag} has no reason to be out of the default barrel ` +
        `(status "${comp.status}", no group) but src/index.js does not export ${comp.className}`,
    );
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

// Anti-vacuity: with nothing excluded and nothing in the barrel, every
// assertion above is trivially satisfied and this check would report a clean
// tree while asserting nothing at all.
const grouped = [...groups.values()].flat();
if (grouped.length === 0 || components.size === 0) {
  console.error('check-barrel-gating: no components or no groups found — nothing was asserted.');
  process.exit(1);
}

if (problems.length) {
  console.error('check-barrel-gating: the default barrels do not match the catalog\n');
  for (const p of problems) console.error(`  ${p}`);
  console.error(
    '\nBarrel membership is derived by `excludedFrom` in scripts/lib/component-tags.js\n' +
      'from @arc-group and @status. Both halves have to hold: an excluded component is\n' +
      'out of every default barrel *and* in its group barrel, and everything else is in\n' +
      'the root barrel. Run `pnpm generate` rather than editing a barrel by hand.',
  );
  process.exit(1);
}

const experimental = [...components.values()].filter((c) => c.status === 'experimental');
const summary = [...groups].map(([g, m]) => `${m.length} ${g}`).join(', ');
console.log(
  `check-barrel-gating: ${components.size - excluded.size} of ${components.size} in the default barrel; ` +
    `${excluded.size} out — ${summary}, ${experimental.length} experimental, ` +
    `${excluded.size - grouped.length - experimental.length} heavy-dependency`,
);
// Said out loud rather than left as a silent pass: with no experimental
// components the status branch of `excludedFrom` is never reached from the real
// catalog, so nothing here has asserted it. test/barrel-gating.test.js does.
if (experimental.length === 0) {
  console.log(
    '  no experimental components — the status half is vacuous here; ' +
      'test/barrel-gating.test.js covers it against a fabricated catalog',
  );
}
