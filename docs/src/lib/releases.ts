/**
 * releases.ts — helpers over the `releases` content collection
 * (src/content/releases/, one markdown file per published release).
 */

/** Anchor id on /docs/changelog for a version, e.g. "v2-3-0". */
export function anchorFor(version: string): string {
  return `v${version.replace(/\./g, '-')}`;
}

/** Major version number of a semver string. */
export function majorOf(version: string): number {
  return Number(version.split('.')[0]);
}

/** Semver-aware descending comparator — 2.10.0 sorts above 2.9.0. */
export function compareVersionsDesc(a: string, b: string): number {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    const diff = (pb[i] ?? 0) - (pa[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}
