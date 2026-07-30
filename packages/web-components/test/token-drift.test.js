import { expect } from '@esm-bundle/chai';
import { LitElement } from 'lit';
import { tokenStyles } from '../src/shared-styles.js';
import { hostTokens } from '../src/generated/host-tokens.js';
import { cleanup } from './helpers.js';

/** Parse `--name: value;` pairs out of a stylesheet text. */
function declarations(text) {
  const out = new Map();
  for (const [, name, value] of text.matchAll(/(--[a-zA-Z0-9_-]+)\s*:\s*([^;]+);/g)) {
    out.set(name, value.replace(/\s+/g, ' ').trim());
  }
  return out;
}

/**
 * Reduce a token value to the part that must match between :host and :root.
 *
 * Drops every var() fallback and un-privatises the size mirrors, so
 * `var(--font-body-family, 'Host Grotesk')` and `var(--font-body-family)`
 * compare equal, as do `var(--_text-md)` and `var(--text-md)`.
 */
function normalise(value) {
  const src = value.replace(/--_text-/g, '--text-');
  let out = '';
  for (let i = 0; i < src.length; i++) {
    if (!src.startsWith('var(', i)) { out += src[i]; continue; }
    // Walk to the matching paren so a fallback containing its own var() is
    // discarded wholesale rather than half-matched by a regex.
    let depth = 0;
    let j = i + 3;
    for (; j < src.length; j++) {
      if (src[j] === '(') depth++;
      else if (src[j] === ')' && --depth === 0) break;
    }
    out += `var(${src.slice(i + 4, j).split(',')[0].trim()})`;
    i = j;
  }
  return out.replace(/\s+/g, ' ').trim();
}

/**
 * The first :root block only. base.css re-declares --touch-min and --touch-pad
 * inside a coarse-pointer media query, and those belong to hostTouchTokens
 * rather than to the block under comparison.
 */
function rootBlock(text) {
  const at = text.indexOf(':root {');
  return text.slice(at, text.indexOf('\n}', at));
}

async function fetchText(url) {
  const res = await fetch(url);
  expect(res.ok, `fetch ${url}`).to.equal(true);
  return res.text();
}

describe('token drift: :host and :root come from one source', () => {
  it('declares every :host token at :root too, with the same value', async () => {
    // The bug this prevents: shared-styles.js used to be a hand-maintained second
    // copy of the token tree. Nineteen of eighty-one had drifted; --text-3xl
    // shipped the 2xl value and --label-inline-size disagreed by 2px between the
    // shadow-DOM and standalone-CSS builds.
    const base = declarations(rootBlock(await fetchText(new URL('../src/base.css', import.meta.url))));
    const host = declarations(hostTokens.cssText);

    const problems = [];
    for (const [name, value] of host) {
      // The private size mirrors are the one deliberate difference: on :host they
      // carry a literal fallback (the no-base.css default), at :root they simply
      // read the public name. Both resolve to the same thing when base.css loads.
      if (name.startsWith('--_text-')) continue;

      if (!base.has(name)) {
        problems.push(`${name} is on :host but missing from base.css`);
        continue;
      }
      // Compare modulo the three documented :host transforms, which are the only
      // legitimate differences: a private size mirror stands in for the public
      // name, and any var() may carry a literal fallback that :root omits
      // because base.css is what declares the slot.
      if (normalise(value) !== normalise(base.get(name))) {
        problems.push(`${name}\n      :host ${value}\n      :root ${base.get(name)}`);
      }
    }

    expect(problems, `\n  ${problems.join('\n  ')}\n`).to.deep.equal([]);
  });

  it('keeps colours off :host, so a component is not pinned to one theme', async () => {
    const host = declarations(hostTokens.cssText);
    const themed = [...host.keys()].filter((n) =>
      /^--(bg|text-(primary|secondary|muted|ghost)|border|accent|color|chart|feedback)/.test(n));
    expect(themed, 'themed tokens must inherit from :root').to.deep.equal([]);
  });

  it('never declares the public size scale on :host', async () => {
    // Declaring it is precisely what made a :root override unreachable.
    const host = declarations(hostTokens.cssText);
    const public_ = [...host.keys()].filter((n) => /^--text-(xs|sm|md|lg|xl|2xl|3xl)$/.test(n));
    expect(public_).to.deep.equal([]);
  });
});

describe('token drift: no component reads a token that does not exist', () => {
  // An undeclared token with no fallback makes the whole declaration invalid at
  // computed-value time, so it silently falls back to the property's initial
  // value: border-radius: 0, background: transparent. Four components read
  // --radius-xs, which the scale did not have, and rendered square corners.
  const suspects = [
    ['navigation/breadcrumb.js', '--radius-xs'],
    ['navigation/link.js', '--radius-xs'],
    ['feedback/notification-panel.js', '--radius-xs'],
    ['navigation/command-bar.js', '--bg-inset'],
  ];

  for (const [path, token] of suspects) {
    it(`${path} resolves ${token}`, async () => {
      const base = declarations(rootBlock(await fetchText(new URL('../src/base.css', import.meta.url))));
      const src = await fetchText(new URL(`../src/${path}`, import.meta.url));

      // Either the component no longer reads it, or the token now exists.
      const reads = new RegExp(`var\\(\\s*${token}\\s*\\)`).test(src);
      if (reads) expect(base.has(token), `${token} declared at :root`).to.equal(true);
    });
  }

  it('resolves --radius-xs on a live component host', async () => {
    const tag = 'radius-probe';
    if (!customElements.get(tag)) {
      customElements.define(tag, class extends LitElement {
        static styles = [tokenStyles];
        render() { return null; }
      });
    }
    const el = document.createElement(tag);
    document.body.appendChild(el);
    await el.updateComplete;

    expect(getComputedStyle(el).getPropertyValue('--radius-xs').trim()).to.equal('2px');
    cleanup();
  });
});
