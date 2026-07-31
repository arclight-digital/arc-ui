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
    description: `${componentCount} dark-first components, written once in Lit and generated natively for seven framework targets.`,
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
  'docs-typography': {
    pills: [{ text: 'Docs' }],
    title: 'Typography',
    description: 'ARC UI ships no font files. Assign your own typefaces to five role slots and the whole system follows.',
  },
  // Keyed `synth`, not `docs-…`: since v3 the synthesizer is an application at
  // /synth rather than a page in the docs tree.
  synth: {
    pills: [{ text: 'Tool' }],
    title: 'Theme Synthesizer',
    description:
      'Build a theme against a live interface, check its contrast in both themes, and export only the tokens you changed.',
  },
  'docs-frameworks': {
    pills: [{ text: 'Docs' }],
    title: 'Frameworks',
    description: 'Typed, native wrappers for React, Vue, Svelte, Angular, Solid, Preact, and plain HTML — generated from one Lit source by Prism.',
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
      { text: c.tier, accent: 'primary' },
      { text: c.interactivity, accent: 'secondary' },
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
  // Standalone tool routes are keyed by their own name, without the docs prefix.
  if (docsCards[path.slice(1)]) return `/og/${path.slice(1)}.png`;
  const seg = path === '/docs' ? 'index' : path.replace(/^\/docs\//, '').replace(/\//g, '-');
  return docsCards[`docs-${seg}`] ? `/og/docs-${seg}.png` : undefined;
}
