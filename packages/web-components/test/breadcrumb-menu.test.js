/**
 * arc-breadcrumb-menu — the sibling dropdowns and the navigate contract.
 *
 * Two crumb shapes render from one items array: a plain link, and a button
 * with a dropdown when the item carries `siblings`. Only one dropdown exists
 * in the DOM at a time (`_openIndex`), which is what lets it share a single
 * PositionController — and what makes "open one while another is open" a real
 * transition rather than a no-op.
 *
 * It is also the eighteenth DismissController consumer, so the reconnect case
 * from finding #72 is checked here against a real component rather than only
 * against the controller's own probe.
 */
import { expect } from '@esm-bundle/chai';
import { mount, cleanup, settle, pointerInit } from './helpers.js';
import '../src/navigation/breadcrumb-menu.register.js';

afterEach(cleanup);

const ITEMS = [
  { label: 'Home', href: '/' },
  {
    label: 'Projects',
    href: '/projects',
    siblings: [
      { label: 'Archive', href: '/archive' },
      { label: 'Drafts', href: '/drafts' },
    ],
  },
  { label: 'Arc UI', href: '/projects/arc-ui' },
];

async function crumbs(items = ITEMS, attrs = '') {
  const el = mount(`<arc-breadcrumb-menu ${attrs}></arc-breadcrumb-menu>`);
  el.items = items;
  await settle(el);
  return el;
}

const links = (el) => [...el.shadowRoot.querySelectorAll('[part~="link"]')];
const dropdown = (el) => el.shadowRoot.querySelector('[part~="dropdown"]');
const dropdownItems = (el) => [...el.shadowRoot.querySelectorAll('[part~="dropdown-item"]')];
const navigations = (el) => {
  const seen = [];
  el.addEventListener('arc-navigate', (e) => seen.push(e.detail.href));
  return seen;
};

// ---------------------------------------------------------------------------
// The trail
// ---------------------------------------------------------------------------

describe('arc-breadcrumb-menu: the trail', () => {
  it('renders one crumb per item with a separator between', async () => {
    const el = await crumbs();
    expect(links(el).map((b) => b.textContent.trim().split('\n')[0].trim()))
      .to.eql(['Home', 'Projects', 'Arc UI']);
    expect(el.shadowRoot.querySelectorAll('[part~="separator"]').length, 'n-1 separators').to.equal(2);
  });

  it('marks only the last crumb as the current page', async () => {
    const el = await crumbs();
    expect(links(el).map((b) => b.getAttribute('aria-current')))
      .to.eql(['false', 'false', 'page']);
  });

  it('names the nav for assistive tech', async () => {
    const el = await crumbs();
    expect(el.shadowRoot.querySelector('[part~="base"]').getAttribute('aria-label'))
      .to.equal('Breadcrumb');
  });

  it('takes a custom nav label', async () => {
    const el = await crumbs(ITEMS, 'label="You are here"');
    expect(el.shadowRoot.querySelector('[part~="base"]').getAttribute('aria-label'))
      .to.equal('You are here');
  });

  it('renders nothing for an empty trail', async () => {
    const el = await crumbs([]);
    expect(links(el)).to.eql([]);
  });

  it('falls back to an empty trail on malformed JSON', async () => {
    const el = mount(`<arc-breadcrumb-menu items='{oops'></arc-breadcrumb-menu>`);
    await settle(el);
    expect(el.items).to.eql([]);
  });
});

// ---------------------------------------------------------------------------
// Navigating
// ---------------------------------------------------------------------------

describe('arc-breadcrumb-menu: navigating', () => {
  it('announces the href of a plain crumb', async () => {
    const el = await crumbs();
    const seen = navigations(el);

    links(el)[0].click();
    await settle(el);

    expect(seen).to.eql(['/']);
  });

  it('announces the href of a dropdown entry', async () => {
    const el = await crumbs();
    const seen = navigations(el);

    links(el)[1].click();
    await settle(el);
    dropdownItems(el)[1].click();
    await settle(el);

    expect(seen).to.eql(['/drafts']);
  });

  it('does not navigate when opening the dropdown itself', async () => {
    // The crumb with siblings is a disclosure button, not a link — clicking it
    // must not also follow its own href.
    const el = await crumbs();
    const seen = navigations(el);

    links(el)[1].click();
    await settle(el);

    expect(seen).to.eql([]);
  });

  it('closes the dropdown after choosing', async () => {
    const el = await crumbs();
    links(el)[1].click();
    await settle(el);
    expect(dropdown(el)).to.not.equal(null);

    dropdownItems(el)[0].click();
    await settle(el);

    expect(dropdown(el)).to.equal(null);
  });
});

// ---------------------------------------------------------------------------
// The dropdown
// ---------------------------------------------------------------------------

describe('arc-breadcrumb-menu: the dropdown', () => {
  it('only exists for a crumb that has siblings', async () => {
    const el = await crumbs();
    expect(links(el)[0].hasAttribute('aria-expanded'), 'a plain crumb is not a disclosure')
      .to.equal(false);
    expect(links(el)[1].getAttribute('aria-expanded')).to.equal('false');
  });

  it('opens and reports itself expanded', async () => {
    const el = await crumbs();
    links(el)[1].click();
    await settle(el);

    expect(links(el)[1].getAttribute('aria-expanded')).to.equal('true');
    expect(dropdownItems(el).map((b) => b.textContent.trim())).to.eql(['Archive', 'Drafts']);
  });

  it('toggles shut when its own crumb is clicked again', async () => {
    const el = await crumbs();
    links(el)[1].click();
    await settle(el);
    links(el)[1].click();
    await settle(el);

    expect(dropdown(el)).to.equal(null);
    expect(links(el)[1].getAttribute('aria-expanded')).to.equal('false');
  });

  it('moves to another crumb rather than opening a second dropdown', async () => {
    const items = [
      { label: 'A', href: '/a', siblings: [{ label: 'A2', href: '/a2' }] },
      { label: 'B', href: '/b', siblings: [{ label: 'B2', href: '/b2' }] },
    ];
    const el = await crumbs(items);

    links(el)[0].click();
    await settle(el);
    links(el)[1].click();
    await settle(el);

    expect(el.shadowRoot.querySelectorAll('[part~="dropdown"]').length, 'only ever one').to.equal(1);
    expect(dropdownItems(el).map((b) => b.textContent.trim())).to.eql(['B2']);
  });

  it('a click inside the panel does not close it', async () => {
    // The panel stops its own click from reaching the document dismissal.
    const el = await crumbs();
    links(el)[1].click();
    await settle(el);

    dropdown(el).click();
    await settle(el);

    expect(dropdown(el)).to.not.equal(null);
  });

  it('closes when a pointer lands outside', async () => {
    const el = await crumbs();
    links(el)[1].click();
    await settle(el);
    expect(dropdown(el)).to.not.equal(null);

    document.body.dispatchEvent(new PointerEvent('pointerdown', { ...pointerInit, composed: true }));
    await settle(el);

    expect(dropdown(el)).to.equal(null);
  });
});

// ---------------------------------------------------------------------------
// Reconnection — finding #72, against a real consumer
// ---------------------------------------------------------------------------

describe('arc-breadcrumb-menu: reconnection', () => {
  it('an open dropdown is still dismissable after a reparent', async () => {
    // The 18th DismissController consumer. Before #72 this element came back
    // from a DOM move rendering its dropdown and unable to close it — the
    // controller's own suite proves the mechanism, this proves the wiring.
    const el = await crumbs();
    links(el)[1].click();
    await settle(el);

    const host = document.createElement('div');
    document.body.appendChild(host);
    el.remove();
    host.appendChild(el);
    await settle(el);

    expect(dropdown(el), 'still open across the move').to.not.equal(null);

    document.body.dispatchEvent(new PointerEvent('pointerdown', { ...pointerInit, composed: true }));
    await settle(el);

    expect(dropdown(el)).to.equal(null);
  });
});
