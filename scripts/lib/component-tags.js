/**
 * Shared component discovery — parses the @tag / @requires / @arc-group /
 * @status JSDoc annotations out of the Web Component sources.
 *
 * Single source of truth for "which custom element tags does ARC define?".
 * Consumed by generate-registrations.js (needs the full records) and
 * generate-base-css.js (needs just the tag list, to scope the :not(:defined)
 * guard so the shipped stylesheet only hides elements we actually own).
 *
 * Since V4-SCOPE §1 it is also the source of truth for the two axes that decide
 * a component's *reachability*, both orthogonal to tier:
 *
 *   - **domain group** (`@arc-group`) — what kind of product it is for. A
 *     grouped component keeps its tier (`arc-cta-banner` is still `content`,
 *     and its wrapper still generates into `content/`); what changes is that it
 *     leaves the default barrel for `@arclux/arc-ui/marketing`.
 *   - **status** (`@status`) — how settled its API is. `experimental` leaves
 *     the barrel too; `beta` deliberately does not.
 *
 * `./barrel-rule.js` composes the two into the exclusion list prism is given,
 * `generate/group-barrels.js` writes the group barrels, `generate/manifest.js`
 * carries both onto every declaration so the docs read them rather than
 * restating them, and `checks/barrel-gating.js` asserts the whole round trip.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { excludedFrom, HEAVY_DEPENDENCY_TAGS } from './barrel-rule.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const SRC_DIR = resolve(__dirname, '../../packages/web-components/src');

export const TIERS = [
  'content', 'data', 'typography', 'input',
  'navigation', 'layout', 'feedback', 'shared',
];

/**
 * The domain groups, in the order their barrels and docs sections are written.
 *
 * A group is a *published subpath*, not a package and not a support level:
 * `@arclux/arc-ui/marketing` is one version, one repo, one test suite and one
 * derived conformance run with the rest of the library. That is the whole
 * reason V4-SCOPE chose subpaths over satellite packages — a satellite is
 * where components go to die, and a subpath demonstrably is not.
 */
export const GROUPS = ['marketing', 'media'];

/**
 * Maturity, from least to most settled. Orthogonal to `GROUPS`: a `/marketing`
 * component can be perfectly stable, and an app component can be experimental.
 * Conflating the two axes was the mistake V4-SCOPE §1.2 called out by name.
 *
 * **Required on every component, with no default.** It used to live on the docs
 * pages as an optional field, set on 14 of 184 — which meant the other 170 had
 * no status at all, so nothing could render a badge and nothing could gate on
 * it. A default here would bring that back in a quieter form: a new component
 * would silently inherit `stable`, which is the one answer a brand-new component
 * should never give by omission. So it is declared, and `findComponents` throws
 * when it is not.
 *
 * The source is the source of truth rather than the docs page, because the
 * *barrel* gates on it (see `excludedFrom`) and a published package's exports
 * cannot be defined by the documentation site's data layer.
 */
export const STATUSES = ['experimental', 'beta', 'stable'];

/**
 * @returns {Map<string, { tag: string, className: string, tier: string, file: string, requires: string[], group: string | null, status: string }>}
 *   Keyed by tag, in filesystem traversal order.
 */
export function findComponents() {
  const components = new Map();

  for (const tier of TIERS) {
    const tierDir = resolve(SRC_DIR, tier);
    for (const file of readdirSync(tierDir)) {
      if (!file.endsWith('.js') || file === 'index.js' || file.endsWith('.register.js')) continue;

      const source = readFileSync(resolve(tierDir, file), 'utf-8');

      const tagMatch = source.match(/@tag\s+([a-z][\w-]*)/);
      if (!tagMatch) continue;
      const tag = tagMatch[1];

      const classMatch = source.match(/export\s+class\s+(\w+)\s+extends/);
      if (!classMatch) continue;
      const className = classMatch[1];

      const requires = [];
      const reqPattern = /@requires\s+([a-z][\w-]*)/g;
      let reqMatch;
      while ((reqMatch = reqPattern.exec(source)) !== null) {
        requires.push(reqMatch[1]);
      }

      // An unknown group name is a typo that would otherwise silently produce a
      // component in no barrel at all: excluded from the default one by being
      // grouped, absent from every group barrel because none matches.
      const groupMatch = source.match(/@arc-group\s+([a-z][\w-]*)/);
      const group = groupMatch?.[1] ?? null;
      if (group !== null && !GROUPS.includes(group)) {
        throw new Error(
          `${tier}/${file}: @arc-group ${group} is not a known group ` +
            `(${GROUPS.join(', ')}). Add it to GROUPS in this file, or fix the tag.`,
        );
      }

      const statusMatch = source.match(/@status\s+([a-z][\w-]*)/);
      const status = statusMatch?.[1] ?? null;
      if (status === null) {
        throw new Error(
          `${tier}/${file}: no @status. Every component declares one of ` +
            `${STATUSES.join(', ')} — see STATUSES in this file for why there is no default.`,
        );
      }
      if (!STATUSES.includes(status)) {
        throw new Error(
          `${tier}/${file}: @status ${status} is not a known status (${STATUSES.join(', ')}).`,
        );
      }

      components.set(tag, { tag, className, tier, file, requires, group, status });
    }
  }

  return components;
}

/** Sorted tag list, for stable generated output. */
export function findComponentTags() {
  return [...findComponents().keys()].sort();
}

/**
 * Group name → the components in it, sorted by class name.
 *
 * Every group in GROUPS gets an entry even when empty, so a consumer iterating
 * this map writes the same set of barrels every run — a group that emptied out
 * should produce an empty barrel and a visible diff, not a silently vanished
 * published subpath.
 */
export function findGroups() {
  const byGroup = new Map(GROUPS.map((g) => [g, []]));
  for (const comp of findComponents().values()) {
    if (comp.group) byGroup.get(comp.group).push(comp);
  }
  for (const list of byGroup.values()) {
    list.sort((a, b) => a.className.localeCompare(b.className));
  }
  return byGroup;
}

/** Sorted tags of every grouped component. */
export function findGroupedTags() {
  return [...findComponents().values()]
    .filter((c) => c.group)
    .map((c) => c.tag)
    .sort();
}

/**
 * `excludedFrom` against the real catalog — what prism.config.js hands to prism.
 *
 * The rule itself lives in the import-free `./barrel-rule.js` so the browser
 * suite can exercise it; this module owns only the filesystem half.
 */
export function findExcludedTags() {
  return excludedFrom(findComponents());
}

// Re-exported so `component-tags.js` stays the one import for catalog facts.
export { excludedFrom, HEAVY_DEPENDENCY_TAGS };
