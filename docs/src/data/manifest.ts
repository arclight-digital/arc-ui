/**
 * Build-time loader exposing the component API surface (props, events, slots,
 * CSS parts) from packages/web-components/custom-elements.json — the single
 * source of truth generated from component JSDoc by `pnpm generate`.
 *
 * Doc pages and llms endpoints must read API data from here, never from
 * hand-maintained tables, so docs can't drift from the source.
 */
import fs from 'node:fs';

export interface ApiProp {
  name: string;
  type: string;
  default?: string;
  description: string;
}

export interface ApiEvent {
  name: string;
  /** Detail payload type, e.g. `{ value: string }` — absent when untyped or void. */
  detail?: string;
  description: string;
}

export interface ApiSlot {
  /** Empty string = default slot. */
  name: string;
  description: string;
}

export interface ComponentApi {
  tag: string;
  description: string;
  /**
   * Domain group (V4-SCOPE §1) — `null` for the app catalog, which is most of
   * it. A grouped component is published from a subpath instead of the default
   * barrel, so this is what `importPath()` answers from.
   */
  group: string | null;
  /**
   * Maturity, declared on every component with no default (V4-PLAN 4.1). Never
   * absent: `generate/manifest.js` fails rather than emit a manifest without it.
   */
  status: 'stable' | 'beta' | 'experimental' | 'deprecated';
  /** The tag that replaces this one. Present only when `status` is `deprecated`. */
  mergedInto?: string;
  props: ApiProp[];
  events: ApiEvent[];
  slots: ApiSlot[];
  cssParts: { name: string; description: string }[];
}

const manifest = JSON.parse(
  fs.readFileSync(new URL('../../../packages/web-components/custom-elements.json', import.meta.url), 'utf-8'),
);

function detailOf(typeText?: string): string | undefined {
  const m = typeText?.match(/^CustomEvent<(.+)>$/);
  if (!m || m[1] === 'void') return undefined;
  return m[1];
}

const byTag = new Map<string, ComponentApi>();
for (const mod of manifest.modules) {
  for (const decl of mod.declarations ?? []) {
    if (!decl.customElement || !decl.tagName) continue;
    byTag.set(decl.tagName, {
      tag: decl.tagName,
      description: decl.description ?? '',
      group: decl.group ?? null,
      status: decl.status,
      mergedInto: decl.mergedInto,
      props: (decl.members ?? [])
        .filter((m: any) => m.kind === 'field' && m.privacy !== 'private' && m.privacy !== 'protected')
        .map((m: any) => ({
          name: m.attribute ?? m.name,
          type: m.type?.text ?? '',
          default: m.default,
          description: m.description ?? '',
        })),
      events: (decl.events ?? []).map((e: any) => ({
        name: e.name,
        detail: detailOf(e.type?.text),
        description: e.description ?? '',
      })),
      slots: (decl.slots ?? []).map((s: any) => ({ name: s.name ?? '', description: s.description ?? '' })),
      cssParts: (decl.cssParts ?? []).map((p: any) => ({ name: p.name, description: p.description ?? '' })),
    });
  }
}

/** API surface for a tag. Throws at build time on unknown tags so stale docs fail loudly. */
export function getApi(tag: string): ComponentApi {
  const api = byTag.get(tag);
  if (!api) throw new Error(`manifest.ts: no custom element "${tag}" in custom-elements.json`);
  return api;
}

/**
 * The package specifier a component's barrel import comes from.
 *
 * Derived rather than written on the page, because getting it wrong is not
 * visible in the docs — a copied `import { ArcCarousel } from '@arclux/arc-ui'`
 * looks exactly right and fails only in the reader's build.
 */
export function importPath(tag: string): string {
  const group = getApi(tag).group;
  return group ? `@arclux/arc-ui/${group}` : '@arclux/arc-ui';
}

/**
 * Whether a component is reachable from the default `@arclux/arc-ui` barrel.
 *
 * Mirrors `scripts/lib/barrel-rule.js` for the two axes a docs page can see. The
 * heavy-dependency case (arc-code-block) is not mirrored — it is one component
 * with its own documented story — so this answers "is it gated by group or
 * status", not "is it in the barrel". `importPath()` is the one to render.
 */
export function inDefaultBarrel(tag: string): boolean {
  const api = getApi(tag);
  return !api.group && api.status !== 'experimental';
}

/** Group name → the tags in it, for the docs pages that list a whole group. */
export function tagsByGroup(): Map<string, string[]> {
  const out = new Map<string, string[]>();
  for (const api of byTag.values()) {
    if (!api.group) continue;
    if (!out.has(api.group)) out.set(api.group, []);
    out.get(api.group)!.push(api.tag);
  }
  for (const tags of out.values()) tags.sort();
  return out;
}
