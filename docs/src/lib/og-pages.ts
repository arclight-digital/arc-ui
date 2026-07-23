/**
 * og-pages.ts — the card catalog for /og/[card].png.
 *
 * DocsLayout derives each page's OG image from the URL via ogPathFor(), so a
 * new docs page gets a custom card by adding one entry to `docsCards` (keyed
 * `docs-<path>` with `/` flattened to `-`). Component pages are automatic.
 */
import { components } from '../data/components/index';
import { componentCount, frameworkCount, tokenCount, versionShort } from '../data/site-stats';
import type { PageCard } from './og-card';

export const docsCards: Record<string, PageCard> = {
  'docs-index': {
    pills: [{ text: 'Docs' }],
    title: 'Documentation',
    description: `Everything you need to build with ARC UI — setup, theming, tokens, and ${componentCount} component references.`,
  },
  'docs-getting-started': {
    pills: [{ text: 'Docs' }],
    title: 'Getting Started',
    description: `Install ARC UI and render your first component in any of ${frameworkCount} framework targets — no build step required.`,
  },
  'docs-components': {
    pills: [{ text: 'Docs' }],
    title: 'Components',
    description: `${componentCount} dark-first components, written once in Lit and generated natively for every framework.`,
  },
  'docs-tokens': {
    pills: [{ text: 'Docs' }],
    title: 'Design Tokens',
    description: `${tokenCount} design tokens — color, spacing, typography, radii, and glows — every one overridable with plain CSS.`,
  },
  'docs-theming': {
    pills: [{ text: 'Docs' }],
    title: 'Theming',
    description: 'Override a handful of base tokens and every gradient, glow, and focus ring cascades automatically.',
  },
  'docs-theme-synthesizer': {
    pills: [{ text: 'Docs' }],
    title: 'Theme Synthesizer',
    description: 'Pick two accent colors and generate a complete, ready-to-paste ARC UI theme.',
  },
  'docs-frameworks': {
    pills: [{ text: 'Docs' }],
    title: 'Frameworks',
    description: 'Typed, native wrappers for React, Vue, Svelte, Angular, Solid, and Preact — generated from one Lit source by Prism.',
  },
  'docs-accessibility': {
    pills: [{ text: 'Docs' }],
    title: 'Accessibility',
    description: 'Zero axe violations on every component page, WCAG AA contrast in both themes — enforced in CI on every commit.',
  },
  'docs-browser-support': {
    pills: [{ text: 'Docs' }],
    title: 'Browser Support',
    description: 'Baseline browser targets, required platform features, and the graceful-degradation policy.',
  },
  'docs-contributing': {
    pills: [{ text: 'Docs' }],
    title: 'Contributing',
    description: 'How to propose, build, and ship changes to ARC UI.',
  },
  'docs-changelog': {
    pills: [{ text: 'Docs' }],
    title: 'Changelog',
    description: `What's new in ARC UI ${versionShort} — release notes for every version.`,
  },
};

export function componentCard(slug: string): PageCard | undefined {
  const c = components.find((comp) => comp.slug === slug);
  if (!c) return undefined;
  return {
    pills: [
      { text: 'Component' },
      { text: c.tier, accent: 'violet' },
      { text: c.interactivity, accent: 'teal' },
    ],
    title: c.name,
    description: c.description,
    showFrameworks: true,
  };
}

/** All card slugs, for the endpoint's getStaticPaths. */
export function allCardSlugs(): string[] {
  return [...Object.keys(docsCards), ...components.map((c) => c.slug)];
}

/** Resolve a docs pathname to its /og/… image path, or undefined for the site default. */
export function ogPathFor(pathname: string): string | undefined {
  const path = pathname.replace(/\/+$/, '') || '/';
  const compMatch = path.match(/^\/docs\/components\/([^/]+)$/);
  if (compMatch && components.some((c) => c.slug === compMatch[1])) {
    return `/og/${compMatch[1]}.png`;
  }
  const seg = path === '/docs' ? 'index' : path.replace(/^\/docs\//, '').replace(/\//g, '-');
  return docsCards[`docs-${seg}`] ? `/og/docs-${seg}.png` : undefined;
}
