/**
 * Shared component discovery — parses @tag / @requires / @arc-group JSDoc
 * annotations out of the Web Component sources.
 *
 * Single source of truth for "which custom element tags does ARC define?".
 * Consumed by generate-registrations.js (needs the full records) and
 * generate-base-css.js (needs just the tag list, to scope the :not(:defined)
 * guard so the shipped stylesheet only hides elements we actually own).
 *
 * Since V4-SCOPE §1.1 it is also the source of truth for **domain groups** —
 * the second catalog axis, orthogonal to tier. A grouped component keeps its
 * tier (`arc-cta-banner` is still `content`, and its wrapper still generates
 * into `content/`); what the group changes is *reachability*: it leaves the
 * default barrel and is imported from `@arclux/arc-ui/marketing` instead.
 * See scripts/generate/group-barrels.js and scripts/checks/group-gating.js.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

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
 * @returns {Map<string, { tag: string, className: string, tier: string, file: string, requires: string[], group: string | null }>}
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

      components.set(tag, { tag, className, tier, file, requires, group });
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

/** Sorted tags of every grouped component — what stays out of the default barrels. */
export function findGroupedTags() {
  return [...findComponents().values()]
    .filter((c) => c.group)
    .map((c) => c.tag)
    .sort();
}
