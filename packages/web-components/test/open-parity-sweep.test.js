/**
 * Opening by click and opening by property must produce the same panel.
 *
 * Finding #59. Three components did state preparation inside their toggle
 * handler — `_syncFromValue()`, anchoring the calendar to `value`, clearing a
 * stale preview highlight — which is reachable only from the field click. Every
 * one of them documents `open` as settable programmatically, so `el.open = true`
 * rendered a panel that had skipped its own setup: a time picker with nothing
 * highlighted, a date picker showing today's month instead of the month its
 * value is in.
 *
 * That is the fifth appearance of one shape (see #1, #14, #47, #58): behaviour
 * attached to the *interaction* rather than to the *state*. `blockedBy` in
 * props.js answered the constraint half of it. This is the preparation half, and
 * no declaration can express it — the work is component-specific, and only its
 * *placement* is general. So this sweep is the guard instead.
 *
 * The assertion is deliberately structural rather than per-component: it renders
 * each panel both ways and compares the resulting markup. That means a sixth
 * component acquiring the same divergence fails here without anyone thinking to
 * write a test for it, which is the whole point — the shape came back four times
 * while every previous instance was being fixed one at a time.
 *
 * Why markup and not a hand-picked assertion per component: the divergences
 * differ (a highlight, a month heading, a focus ring) and enumerating them is
 * the maintenance burden this file exists to avoid. The trade-off is that a
 * benign difference would also fail — see `normalize()`.
 */
import { expect } from '@esm-bundle/chai';
import { mount, cleanup, settle } from './helpers.js';

import '../src/input/date-picker.register.js';
import '../src/input/date-range-picker.register.js';
import '../src/input/time-picker.register.js';
import '../src/input/select.register.js';
import '../src/input/tree-select.register.js';
import '../src/feedback/dropdown-menu.register.js';
import '../src/feedback/popover.register.js';
import '../src/content/hotspot.register.js';
import '../src/feedback/notification-panel.register.js';

afterEach(() => cleanup());

const CASES = [
  {
    tag: 'arc-date-picker',
    // A value well away from today, so an unanchored calendar shows a different
    // month and the comparison has something to catch.
    markup: '<arc-date-picker value="2021-03-15"></arc-date-picker>',
    panel: '.dropdown',
    field: 'input',
  },
  {
    tag: 'arc-date-range-picker',
    markup: '<arc-date-range-picker start="2021-03-10" end="2021-03-20"></arc-date-range-picker>',
    panel: '.dropdown',
    field: 'input',
  },
  {
    tag: 'arc-time-picker',
    markup: '<arc-time-picker value="14:30" step="15"></arc-time-picker>',
    panel: '.dropdown',
    field: 'input',
  },
  {
    tag: 'arc-select',
    markup:
      '<arc-select value="b"><arc-option value="a">A</arc-option><arc-option value="b">B</arc-option></arc-select>',
    panel: '[part~="dropdown"]',
    field: '[part~="trigger"]',
  },
  {
    tag: 'arc-tree-select',
    markup: '<arc-tree-select value="leaf"></arc-tree-select>',
    panel: '[part~="panel"]',
    field: '[part~="trigger"]',
    // "Branches containing the selected value auto-expand on open" — exactly the
    // kind of open-time preparation this sweep is looking for, so the fixture
    // has to have a branch to expand.
    props: {
      items: [
        { value: 'g', label: 'Group', children: [{ value: 'leaf', label: 'Leaf' }] },
        { value: 'other', label: 'Other' },
      ],
    },
  },

  // ── Trigger-and-panel overlays ────────────────────────────────────────────
  // Added when the sweep was converted to derived coverage. Every one of these
  // renders its own trigger, so both paths exist and the comparison is the same
  // one #59 was about — they were simply never listed.
  {
    tag: 'arc-dropdown-menu',
    markup:
      '<arc-dropdown-menu label="Menu"><arc-menu-item>One</arc-menu-item><arc-menu-item>Two</arc-menu-item></arc-dropdown-menu>',
    panel: '[part~="panel"]',
    field: '[part~="trigger"]',
  },
  {
    tag: 'arc-popover',
    markup: '<arc-popover label="More"><p>Body</p></arc-popover>',
    panel: '[part~="panel"]',
    field: '[part~="trigger"]',
  },
  {
    tag: 'arc-hotspot',
    markup: '<arc-hotspot label="Pin"><p>Detail</p></arc-hotspot>',
    panel: '[part~="panel"]',
    field: '[part~="pin"]',
  },
  {
    tag: 'arc-notification-panel',
    markup: '<arc-notification-panel></arc-notification-panel>',
    panel: '[part~="panel"]',
    field: '[part~="trigger"]',
  },
];

/**
 * Why this list is no longer allowed to be hand-written alone.
 *
 * HANDOFF's table flags `CASES` as "at risk", and it was right: the sweep
 * exists because one shape came back four times, and it was guarding five of
 * the twenty-four components that can open. Nothing said which twenty-four, so
 * nothing could notice the nineteen.
 *
 * The population is derived from the manifest — every custom element with a
 * public `open` member — and every one of them must appear either as a case
 * above or as an exemption below, with a reason. A new component that opens
 * fails this until someone decides which it is. The cases still cannot be
 * derived (the panel and trigger selectors are per-component facts), but their
 * *completeness* now is.
 *
 * Five cases became ten this way. The five additions are exactly the components
 * that render their own trigger and were simply never listed.
 */
const manifest = await fetch(new URL('../custom-elements.json', import.meta.url)).then((r) =>
  r.json()
);

const OPENABLE = manifest.modules
  .flatMap((m) => m.declarations ?? [])
  .filter((d) => d.customElement && d.tagName && (d.members ?? []).some((x) => x.name === 'open'))
  .map((d) => d.tagName);

/** Openable, but with no second path to compare — each with the reason why. */
const NO_SECOND_PATH = {
  'arc-modal': 'no trigger of its own; the application opens it',
  'arc-sheet': 'no trigger of its own; the application opens it',
  'arc-drawer': 'no trigger of its own; the application opens it',
  'arc-lightbox': 'no trigger of its own; opened from a gallery click',
  'arc-command-palette': 'no trigger of its own; opened by a global shortcut',
  'arc-confirm': 'no trigger of its own; wraps arc-modal for an imperative API',
  'arc-dialog': 'no trigger of its own; wraps arc-modal for an imperative API',
  'arc-context-menu': 'opens from a contextmenu event on a separate target, not from a click on itself',
  'arc-search': 'the panel opens on typing, so there is no click path to compare',
  'arc-collapsible': 'a disclosure: the heading click is the only path there is',
  'arc-sidebar-section': 'a disclosure: the heading click is the only path there is',
  'arc-float-bar': 'visibility tracks a selection, not a trigger',
};

describe('open parity: the sweep covers everything that opens', () => {
  it('found the openable population', () => {
    // Anti-vacuity: a manifest shape change must fail here rather than quietly
    // reducing the required coverage to nothing.
    expect(OPENABLE.length, 'openable components derived from the manifest').to.be.greaterThan(20);
  });

  it('every openable component is either a case or an explained exemption', () => {
    const covered = new Set([...CASES.map((c) => c.tag), ...Object.keys(NO_SECOND_PATH)]);
    const missing = OPENABLE.filter((t) => !covered.has(t));
    expect(missing, 'openable, but neither swept nor exempted').to.eql([]);
  });

  it('no case or exemption names a component that cannot open', () => {
    const claimed = [...CASES.map((c) => c.tag), ...Object.keys(NO_SECOND_PATH)];
    expect(claimed.filter((t) => !OPENABLE.includes(t)), 'listed but not openable').to.eql([]);
  });

  it('nothing is both swept and exempted', () => {
    const swept = CASES.map((c) => c.tag);
    expect(swept.filter((t) => t in NO_SECOND_PATH), 'in both lists').to.eql([]);
  });
});

/**
 * Strip the things that legitimately differ between two separate elements.
 *
 * Ids are generated per instance, and the position controller writes inline
 * `top`/`left` that depend on where in the page each fixture landed. Neither is
 * state the two paths disagree about, and leaving them in would make every case
 * fail for reasons that have nothing to do with #59.
 */
function normalize(htmlText) {
  return htmlText
    .replace(/\bid="[^"]*"/g, 'id=""')
    .replace(/\baria-(?:labelledby|controls|activedescendant|describedby)="[^"]*"/g, '$&=""')
    .replace(/\bstyle="[^"]*"/g, 'style=""')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

async function panelHtml(el, sel) {
  await settle(el);
  const node = el.shadowRoot.querySelector(sel);
  return node ? normalize(node.innerHTML) : null;
}

async function build(markup, props) {
  const el = mount(markup);
  if (props) Object.assign(el, props);
  await settle(el);
  return el;
}

for (const { tag, markup, panel, field, props } of CASES) {
  describe(`${tag} open parity`, () => {
    it('renders the same panel whether opened by click or by property', async () => {
      // The two fixtures are built and read *one at a time*, never side by side.
      // Several of these panels move focus into themselves when they open, so a
      // second live instance opening would pull focus out of the first — and the
      // DismissController correctly closes it. Overlapping the fixtures tests
      // the harness, not the component.
      const byClick = await build(markup, props);
      byClick.shadowRoot.querySelector(field).click();
      const clicked = await panelHtml(byClick, panel);

      // anti-vacuity, in three parts. Some of these panels are always in the
      // DOM and merely hidden, so "the node exists" proves nothing on its own —
      // `open` has to be true, and the panel has to have content. Without this,
      // two equally-empty panels compare equal and the sweep reports parity for
      // something that never opened.
      expect(byClick.open, `${tag} did not open on click`).to.equal(true);
      expect(clicked, `${tag} has no panel at ${panel}`).to.be.a('string');
      expect(clicked.length, `${tag} rendered an empty panel`).to.be.greaterThan(0);
      byClick.remove();

      const byProp = await build(markup, props);
      byProp.open = true;
      const propped = await panelHtml(byProp, panel);
      expect(byProp.open, `${tag} did not open as a property`).to.equal(true);

      expect(propped, `${tag}: the property path rendered a different panel`).to.equal(clicked);
    });

    it('reopens to the same panel after being closed', async () => {
      // The state a toggle handler prepares is also the state that goes stale.
      // Closing and reopening has to re-run it, or the second open shows the
      // leftovers of the first.
      const el = await build(markup, props);
      el.shadowRoot.querySelector(field).click();
      const first = await panelHtml(el, panel);

      el.open = false;
      await settle(el);
      el.open = true;
      const second = await panelHtml(el, panel);

      expect(el.open, `${tag} did not reopen`).to.equal(true);
      expect(first.length, `${tag} rendered an empty panel`).to.be.greaterThan(0);
      expect(second, `${tag}: reopening rendered a different panel`).to.equal(first);
    });
  });
}
