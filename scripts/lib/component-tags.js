/**
 * Shared component discovery — parses @tag / @requires JSDoc annotations out of
 * the Web Component sources.
 *
 * Single source of truth for "which custom element tags does ARC define?".
 * Consumed by generate-registrations.js (needs the full records) and
 * generate-base-css.js (needs just the tag list, to scope the :not(:defined)
 * guard so the shipped stylesheet only hides elements we actually own).
 */
import { readFileSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const SRC_DIR = resolve(__dirname, '../../packages/web-components/src');

export const TIERS = [
  'content', 'data', 'typography', 'input',
  'navigation', 'layout', 'feedback', 'shared',
];

/**
 * @returns {Map<string, { tag: string, className: string, tier: string, file: string, requires: string[] }>}
 *   Keyed by tag, in filesystem traversal order.
 */
export function findComponents() {
  const components = new Map();

  for (const tier of TIERS) {
    const tierDir = resolve(SRC_DIR, tier);
    for (const file of readdirSync(tierDir)) {
      if (!file.endsWith('.js') || file === 'index.js' || file.endsWith('.register.js')) continue;

      const source = readFileSync(resolve(tierDir, file), 'utf-8');

      const tagMatch = source.match(/@tag\s+([a-z][\w-]*)/);
      if (!tagMatch) continue;
      const tag = tagMatch[1];

      const classMatch = source.match(/export\s+class\s+(\w+)\s+extends/);
      if (!classMatch) continue;
      const className = classMatch[1];

      const requires = [];
      const reqPattern = /@requires\s+([a-z][\w-]*)/g;
      let reqMatch;
      while ((reqMatch = reqPattern.exec(source)) !== null) {
        requires.push(reqMatch[1]);
      }

      components.set(tag, { tag, className, tier, file, requires });
    }
  }

  return components;
}

/** Sorted tag list, for stable generated output. */
export function findComponentTags() {
  return [...findComponents().keys()].sort();
}
