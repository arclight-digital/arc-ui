/**
 * /og/[card].png — per-page OG images.
 *
 * One card per component (slug = component slug) plus one per docs page
 * (slug = "docs-<page>"). Card data lives in src/lib/og-pages.ts; DocsLayout
 * points pages at their card automatically via ogPathFor().
 */
import type { APIRoute } from 'astro';
import { docsCards, componentCard, allCardSlugs } from '../../lib/og-pages';
import { pageCardPng } from '../../lib/og-card';

export const prerender = true;

export function getStaticPaths() {
  return allCardSlugs().map((card) => ({ params: { card } }));
}

export const GET: APIRoute = async ({ params }) => {
  const card = docsCards[params.card!] ?? componentCard(params.card!);
  if (!card) return new Response('Not found', { status: 404 });

  const png = await pageCardPng(card);
  return new Response(png, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
