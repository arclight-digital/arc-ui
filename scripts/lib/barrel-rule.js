/**
 * The rule that decides which components leave the default barrels.
 *
 * Deliberately free of every import, including `node:fs`. The rule is a pure
 * function of the catalog, and keeping it that way is what lets
 * `test/barrel-gating.test.js` — which runs in a browser, like every test in
 * this repo — exercise it against catalogs the tree does not contain. That
 * matters more than it sounds: `experimental` is one of the three reasons a
 * component is excluded, and there are currently zero experimental components,
 * so nothing derived from the real catalog can assert that branch at all.
 *
 * `scripts/lib/component-tags.js` re-exports both of these and supplies the
 * filesystem-reading wrapper. Callers that already have a component map should
 * import from here; everything else should not notice the split.
 */

/**
 * Tags kept out of every barrel because of a heavy optional dependency,
 * regardless of group or status.
 *
 * One entry, and it is the reason `barrelExclude` exists at all: a bundler
 * resolves the dynamic imports of anything in its module graph, so re-exporting
 * arc-code-block from the barrel made shiki and its grammars (13.6 MB)
 * everyone's install rather than the install of consumers who render code.
 * Listed rather than derived because "heavy" is a judgement about a specific
 * dependency, not a property the source can state about itself.
 */
export const HEAVY_DEPENDENCY_TAGS = ['arc-code-block'];

/**
 * Every reason a component stays out of the default barrels, in one place.
 *
 * Three reasons, and they compose: a heavy optional dependency, a domain group
 * (V4-SCOPE §1.1), and `experimental` status. The last is the one V4-PLAN 4.1
 * landed *early*, on purpose — every 4.8 addition ships experimental, and gating
 * them at the point they are born means no addition ever enters the barrel only
 * to be removed from it in the same major. A barrel entry is the hardest thing
 * to take back: removing one is a breaking change even when the component was
 * never meant to be there.
 *
 * `beta` and `deprecated` deliberately do *not* gate, for opposite reasons.
 * Beta is a promise about how much the API may still move, not about whether the
 * component is ready to be found; a beta component hidden from the barrel is a
 * component nobody evaluates, which is the opposite of what a beta is for.
 * `deprecated` is the reverse case — it is already in the barrel, and removing
 * it there is precisely the break the deprecation period exists to postpone, so
 * gating on it would perform the break while announcing a grace period.
 *
 * So only `experimental` gates, and it is the only status that can: it is the
 * one a component can carry *before* anyone depends on it.
 *
 * Set-backed, so a component excluded for two reasons at once appears once.
 * Sorted, so the generated wrapper output is stable across runs.
 *
 * @param {Map<string, {tag: string, group: string | null, status: string}>} components
 * @returns {string[]} sorted tags
 */
export function excludedFrom(components) {
  const out = new Set(HEAVY_DEPENDENCY_TAGS);
  for (const comp of components.values()) {
    if (comp.group) out.add(comp.tag);
    if (comp.status === 'experimental') out.add(comp.tag);
  }
  return [...out].sort();
}
