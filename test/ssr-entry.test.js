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
const { renderDeclarativeShadowDOM } = await import(
  pathToFileURL(requireFromWC.resolve('@arclux/arc-ui/ssr')).href
);

const render = async (markup) =>
  (await renderDeclarativeShadowDOM(markup, { lift: false, inlineIcons: false })).html;

test('every component outside the barrel gets a shadow root', async () => {
  const tags = findExcludedTags();
  assert.ok(tags.includes('arc-code-block'), 'the list is the real one');
  for (const tag of tags) {
    const html = await render(`<${tag}></${tag}>`);
    assert.ok(
      new RegExp(`<${tag}\\b[^>]*><template shadowroot`).test(html),
      `${tag} rendered no shadow root`,
    );
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

test('a > inside an attribute value does not end the start tag', async () => {
  // arc-copy-button carries code in `value`; a slot mark once landed inside it.
  const html = await render(
    '<arc-breadcrumb label="a > b"><arc-breadcrumb-item href="/">Home</arc-breadcrumb-item><arc-breadcrumb-item>Here</arc-breadcrumb-item></arc-breadcrumb>',
  );
  assert.match(html, /<arc-breadcrumb\s+label="a &gt; b"><template shadowroot/);
  assert.match(html, /breadcrumb__link[^>]*>(<!--[^>]*-->)?Home/);
  assert.doesNotMatch(html, /data-arc-ssr-slots/);
});

test('children a reader hides are hidden in the server HTML', async () => {
  const html = await render(
    '<arc-tabs><arc-tab label="One">First</arc-tab><arc-tab label="Two">Second</arc-tab></arc-tabs>',
  );
  const tabs = html.match(/<arc-tab\b[^>]*>/g);
  assert.doesNotMatch(tabs[0], /hidden/);
  assert.match(tabs[1], /label="Two" hidden/);
});

test('markup inside an attribute value is not taken for an element', async () => {
  // arcui.dev's copy buttons carry snippets like this in `value`.
  const snippet = '<arc-breadcrumb><arc-breadcrumb-item>x</arc-breadcrumb-item></arc-breadcrumb>';
  const html = await render(`<arc-copy-button value='${snippet}'></arc-copy-button>`);
  assert.ok(
    html.includes(snippet.replace(/</g, '&lt;').replace(/>/g, '&gt;')) || html.includes(snippet),
    'value intact',
  );
  assert.doesNotMatch(html, /data-arc-ssr-slots/);
});

test("a reader's state and its children's styles are in the server HTML", async () => {
  const html = await render(
    '<arc-avatar-group max="2"><arc-avatar name="A B"></arc-avatar><arc-avatar name="C D"></arc-avatar><arc-avatar name="E F"></arc-avatar></arc-avatar-group>',
  );
  assert.match(html, /group__overflow[^>]*>\+(<!--[^>]*-->)?1/, 'the +N count');
  assert.match(
    html,
    /<arc-avatar\s+name="E F" style="display: none/,
    'the avatar past max, hidden',
  );
});

test('host styles set from props are in the server HTML, beside the page’s own', async () => {
  const html = await render(
    '<arc-icon size="12"></arc-icon><arc-center max-width="40ch" style="color: red"></arc-center><arc-sticky offset="64px"></arc-sticky>',
  );
  assert.match(html, /<arc-icon\s+size="12" style="width: 12px; height: 12px"/);
  assert.match(html, /<arc-center\s+max-width="40ch" style="color: red; --_max-width: 40ch"/);
  assert.match(html, /<arc-sticky\s+offset="64px" style="--_offset: 64px"/);
});
