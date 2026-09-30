/**
 * The public SSR entry renders every component, not just the barrel's.
 *
 * @arclux/arc-ui/ssr registers through ./register.js, the default barrel, which
 * leaves out arc-code-block, the domain groups and anything experimental.
 * Through 4.8.1 those were never defined on the server, so each rendered as an
 * empty tag: every code block on arcui.dev and getpulsar.dev reached no-JS
 * readers with no code in it. ssr-fuzz renders component classes directly and
 * could not see it; this goes through renderDeclarativeShadowDOM, as a
 * consumer does, in a process that has defined nothing else.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { findExcludedTags } from '../scripts/lib/component-tags.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const WC = path.join(root, 'packages/web-components');
const requireFromWC = createRequire(pathToFileURL(path.join(WC, 'package.json')));
const { renderDeclarativeShadowDOM } = await import(pathToFileURL(requireFromWC.resolve('@arclux/arc-ui/ssr')).href);

const render = async (markup) => (await renderDeclarativeShadowDOM(markup, { lift: false, inlineIcons: false })).html;

test('every component outside the barrel gets a shadow root', async () => {
  const tags = findExcludedTags();
  assert.ok(tags.includes('arc-code-block'), 'the list is the real one');
  for (const tag of tags) {
    const html = await render(`<${tag}></${tag}>`);
    assert.ok(new RegExp(`<${tag}\\b[^>]*><template shadowroot`).test(html), `${tag} rendered no shadow root`);
  }
});

test('a code block carries its code and header in the server HTML', async () => {
  const html = await render(
    '<arc-code-block language="bash" filename="enroll the key" code="sudo mokutil --import key.der"></arc-code-block>',
  );
  const shadow = html.slice(html.indexOf('<template'));
  assert.match(shadow, /sudo mokutil --import key\.der/);
  assert.match(shadow, /enroll the key/);
});

test('an arc- tag with no entry is left alone', async () => {
  const html = await render('<arc-not-a-component>x</arc-not-a-component>');
  assert.equal(html, '<arc-not-a-component>x</arc-not-a-component>');
});
