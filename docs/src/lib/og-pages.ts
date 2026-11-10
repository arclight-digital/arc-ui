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
    description: `Setup, theming, tokens, and reference pages for all ${componentCount} ARC UI components.`,
  },
  'docs-getting-started': {
    pills: [{ text: 'Docs' }],
    title: 'Getting started',
    description: `Install ARC UI and render your first component in any of its ${frameworkCount} framework targets.`,
  },
  'docs-components': {
    pills: [{ text: 'Docs' }],
    title: 'Components',
    description: `${componentCount} dark-first components, written once in Lit and generated natively for ${frameworkCount} framework targets.`,
  },
  'docs-tokens': {
    pills: [{ text: 'Docs' }],
    title: 'Design tokens',
    description: `${tokenCount} design tokens for color, spacing, typography, radii and glows, each one overridable with plain CSS.`,
  },
  'docs-theming': {
    pills: [{ text: 'Docs' }],
    title: 'Theming',
    description: 'Override the two accent colors, and every gradient, glow and focus ring built from them follows.',
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
    description: 'Typed, native wrappers for React, Vue, Svelte, Angular, Solid and Preact, plus plain HTML, generated from one Lit source by Prism.',
  },
  'docs-accessibility': {
    pills: [{ text: 'Docs' }],
    title: 'Accessibility',
    description: 'Zero axe violations on every component page and WCAG AA contrast in both themes. Serious and critical violations fail CI.',
  },
  'docs-browser-support': {
    pills: [{ text: 'Docs' }],
    title: 'Browser support',
    description: 'Baseline browser targets, the platform features ARC UI needs, and polyfills for older browsers.',
  },
  'docs-contributing': {
    pills: [{ text: 'Docs' }],
    title: 'Contributing',
    description: 'How to set up the repo and get a change into ARC UI.',
  },
  'docs-changelog': {
    pills: [{ text: 'Docs' }],
    title: 'Changelog',
    description: `Release notes for every ARC UI version, up to ${versionShort}.`,
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
