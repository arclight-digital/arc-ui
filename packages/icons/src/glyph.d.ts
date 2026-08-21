/**
 * The type behind the per-glyph subpaths, `./phosphor/*` and `./lucide/*`.
 *
 *     import check from '@arclux/arc-ui-icons/phosphor/check';
 *     iconRegistry.set({ check });
 *
 * Every one of the 3,408 glyph modules is the same two lines — a default export
 * holding one SVG string — so one declaration describes all of them. The export
 * map points both wildcards here rather than at a `*.d.ts` sibling per glyph:
 * substituting the wildcard would work too, and would mean 3,408 extra files in
 * every install to say `string` 3,408 times.
 *
 * Without this the wildcards published no types at all, and TypeScript reported
 * TS7016 — "could not find a declaration file … implicitly has an 'any' type" —
 * for every single-glyph import. The barrels at `./all/phosphor` and
 * `./all/lucide` were typed from the start, so the package looked typed from the
 * outside while the import everyone is told to prefer was not.
 *
 * Note that the wildcards also match the two internal modules that sit in those
 * directories, `_resolver` and `_manifest`, which are not this shape. They are
 * underscore-prefixed because they are not API: nothing outside the package
 * reaches them through the export map, and `_manifest.d.ts` still describes the
 * real thing for the relative imports that do.
 */
declare const svg: string;
export default svg;
