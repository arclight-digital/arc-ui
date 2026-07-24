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
