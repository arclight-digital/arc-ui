/**
 * /rss.xml — RSS 2.0 feed of ARC UI releases, one item per version.
 * Hand-rolled (no @astrojs/rss dependency) from src/data/releases.ts.
 */
import type { APIRoute } from 'astro';
import { releases, anchorFor } from '../data/releases';

export const prerender = true;

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export const GET: APIRoute = ({ site }) => {
  const base = (site ?? new URL('https://arcui.dev')).href.replace(/\/$/, '');
  const items = releases
    .map((r) => {
      const url = `${base}/docs/changelog#${anchorFor(r.version)}`;
      return `    <item>
      <title>${escapeXml(`ARC UI v${r.version} — ${r.title}`)}</title>
      <link>${url}</link>
      <guid isPermaLink="false">arc-ui-v${r.version}</guid>
      <pubDate>${new Date(`${r.date}T12:00:00Z`).toUTCString()}</pubDate>
      <description>${escapeXml(`ARC UI v${r.version}: ${r.title}. Full release notes on the changelog.`)}</description>
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>ARC UI Changelog</title>
    <link>${base}/docs/changelog</link>
    <atom:link href="${base}/rss.xml" rel="self" type="application/rss+xml" />
    <description>Release notes for ARC UI — Lit web components generated natively for seven framework targets.</description>
    <language>en</language>
    <lastBuildDate>${new Date(`${releases[0].date}T12:00:00Z`).toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
};
