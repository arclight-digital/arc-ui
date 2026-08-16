/**
 * arc-navigation-menu — the largest component in the library, 973 lines.
 *
 * A previous attempt at this file was written, could not be stabilised, and was
 * removed; test-findings.md "Not covered" recorded why. Those five traps are
 * honoured here and worth restating, because every one of them is a silent
 * failure rather than an error:
 *
 *   1. `arc-nav-item`'s `label` is a **getter over its own text nodes**, not the
 *      `label` attribute. `<arc-nav-item label="Docs">` renders a blank trigger.
 *   2. A dropdown is declared by **nesting** nav-items, not by a prop —
 *      `hasChildren` is `:scope > arc-nav-item`.
 *   3. The dropdown element is **always rendered**; open/closed is a class and
 *      `aria-expanded`. Asserting presence proves nothing.
 *   4. The triggers are **real anchors**. A plain `href` plus `.click()` unloads
 *      the page and aborts the whole run — every href here is a fragment.
 *   5. `_onKeyDown` is bound to the **host**, so Escape must originate inside the
 *      component and be `composed` to cross the shadow boundary. `keyOn()` sets
 *      that; `pressKey()` on document does not reach it.
 *
 * The mobile overlay renders into a **portal**: a separate element appended to
 * document.body with its own shadow root, not into this component's shadow DOM.
 * Nothing about it is findable through `el.shadowRoot`.
 *
 * **Sixth trap, found here and not in the earlier attempt: the test runner's
 * viewport is 800px, and this component collapses at 900px.** So `.nav` is
 * `display: none` for the whole suite. Structural assertions still work — the
 * elements exist and carry their classes and ARIA — but nothing in the desktop
 * bar can take focus, because a `display: none` subtree is not focusable. A
 * focus assertion therefore fails for a reason that has nothing to do with the
 * component. `forceDesktop()` below is how the focus tests get a real bar; it is
 * also worth knowing for every other breakpoint-gated component in the library.
 */
import { expect } from '@esm-bundle/chai';
import { mount, cleanup, settle, until, keyOn, nextFrame } from './helpers.js';

import '../src/navigation/navigation-menu.register.js';
import '../src/navigation/nav-item.register.js';

afterEach(() => cleanup());

/** Trap 1 and 2: label comes from text, children come from nesting. */
const MARKUP = `
  <arc-navigation-menu label="Main">
    <arc-nav-item href="#home">Home</arc-nav-item>
    <arc-nav-item href="#products">Products
      <arc-nav-item href="#one">One</arc-nav-item>
      <arc-nav-item href="#two">Two</arc-nav-item>
    </arc-nav-item>
    <arc-nav-item href="#about" active>About</arc-nav-item>
  </arc-navigation-menu>
`;

async function menu(markup = MARKUP) {
  const el = mount(markup);
  await settle(el);
  await until(() => el.shadowRoot.querySelectorAll('.nav__item').length > 0);
  await settle(el);
  return el;
}

const triggers = (el) => [...el.shadowRoot.querySelectorAll('.nav__trigger')];
const triggerText = (el) => triggers(el).map((t) => t.textContent.trim());
const dropdowns = (el) => [...el.shadowRoot.querySelectorAll('.nav__dropdown')];
/** Trap 3: openness is a class, not presence. */
const openDropdowns = (el) =>
  dropdowns(el).filter((d) => d.classList.contains('nav__dropdown--open'));
/**
 * Undo the collapse media query for one element.
 *
 * The runner is 800px wide and `.nav` is hidden below 900px, so the desktop bar
 * is unfocusable by default. Injected as an extra adopted stylesheet rather than
 * an inline style because the rule it is beating lives in the component's own
 * sheet and targets `.nav` inside the shadow root.
 */
function forceDesktop(el) {
  const sheet = new CSSStyleSheet();
  sheet.replaceSync('.nav { display: flex !important; }');
  el.shadowRoot.adoptedStyleSheets = [...el.shadowRoot.adoptedStyleSheets, sheet];
}

const portal = () => document.querySelector('[data-arc-nav-portal]');
const portalRoot = () => portal()?.shadowRoot ?? null;

describe('arc-navigation-menu rendering', () => {
  it('renders a trigger per top-level item, labelled from its text', async () => {
    const el = await menu();
    expect(triggerText(el)).to.eql(['Home', 'Products', 'About']);
  });

  it('ignores nested items at the top level', async () => {
    const el = await menu();
    expect(triggers(el).length, 'sub-items leaked into the bar').to.equal(3);
  });

  it('names the nav from its label', async () => {
    const el = await menu();
    expect(el.shadowRoot.querySelector('.nav').getAttribute('aria-label')).to.equal('Main');
  });

  it('renders an item with children as a button, and one without as a link', async () => {
    const el = await menu();
    expect(triggers(el).map((t) => t.localName)).to.eql(['a', 'button', 'a']);
  });

  it('marks the active item', async () => {
    const el = await menu();
    const active = triggers(el).filter((t) => t.classList.contains('nav__trigger--active'));
    expect(active.map((t) => t.textContent.trim())).to.eql(['About']);
  });

  it('hides the light DOM it mirrors', async () => {
    // The slot host is display:none — the links are re-rendered into the bar.
    // If this ever renders visibly, every link appears twice.
    const el = await menu();
    const host = el.shadowRoot.querySelector('.nav__slot-host');
    expect(getComputedStyle(host).display).to.equal('none');
  });

  it('reads its items even when slotchange never fires', async () => {
    // Documented at length on firstUpdated: under declarative shadow DOM the
    // assignment happens before Lit adopts the tree, so the event never
    // arrives and the whole nav bar renders empty. hydrateSlots is the fix.
    const el = await menu();
    // Counted off the rendered bar rather than off `_items`: the failure this
    // guards is "the whole nav renders empty", and a list held in state that
    // never reaches the DOM is exactly that failure passing.
    expect([...el.shadowRoot.querySelectorAll('.nav__item')]).to.have.lengthOf(3);
  });

  it('renders the sub-items of a dropdown', async () => {
    const el = await menu();
    const links = [...dropdowns(el)[0].querySelectorAll('a')];
    expect(links.map((a) => a.textContent.trim())).to.eql(['One', 'Two']);
  });

  it('gives the dropdown a menu role', async () => {
    const el = await menu();
    expect(dropdowns(el)[0].getAttribute('role')).to.equal('menu');
  });
});

describe('arc-navigation-menu dropdowns', () => {
  it('starts closed', async () => {
    const el = await menu();
    expect(openDropdowns(el).length).to.equal(0);
    expect(triggers(el)[1].getAttribute('aria-expanded')).to.equal('false');
  });

  it('opens on a trigger click', async () => {
    const el = await menu();
    triggers(el)[1].click();
    await settle(el);
    expect(triggers(el)[1].getAttribute('aria-expanded')).to.equal('true');
    expect(openDropdowns(el).length).to.equal(1);
  });

  it('closes on a second click of the same trigger', async () => {
    const el = await menu();
    triggers(el)[1].click();
    await settle(el);
    triggers(el)[1].click();
    await settle(el);
    expect(triggers(el)[1].getAttribute('aria-expanded')).to.equal('false');
  });

  it('opens on hover', async () => {
    const el = await menu();
    const item = el.shadowRoot.querySelectorAll('.nav__item')[1];
    item.dispatchEvent(new MouseEvent('mouseenter'));
    await settle(el);
    expect(openDropdowns(el).length).to.equal(1);
  });

  it('closes after leaving, but not immediately', async () => {
    // The 150ms grace is what lets the pointer cross the gap between the
    // trigger and the panel without the menu vanishing underneath it.
    const el = await menu();
    const item = el.shadowRoot.querySelectorAll('.nav__item')[1];
    item.dispatchEvent(new MouseEvent('mouseenter'));
    await settle(el);

    item.dispatchEvent(new MouseEvent('mouseleave'));
    await settle(el);
    expect(openDropdowns(el).length, 'closed instantly on mouseleave').to.equal(1);

    expect(await until(() => openDropdowns(el).length === 0)).to.equal(true);
  });

  it('cancels the close when the pointer reaches the panel', async () => {
    const el = await menu();
    const item = el.shadowRoot.querySelectorAll('.nav__item')[1];
    item.dispatchEvent(new MouseEvent('mouseenter'));
    await settle(el);

    item.dispatchEvent(new MouseEvent('mouseleave'));
    dropdowns(el)[0].dispatchEvent(new MouseEvent('mouseenter'));

    // Long enough that an uncancelled close would have landed.
    await until(() => false, { timeout: 300 });
    expect(openDropdowns(el).length, 'the panel closed under the pointer').to.equal(1);
  });

  it('opens only one dropdown at a time', async () => {
    const el = await menu(`
      <arc-navigation-menu>
        <arc-nav-item href="#a">A<arc-nav-item href="#a1">A1</arc-nav-item></arc-nav-item>
        <arc-nav-item href="#b">B<arc-nav-item href="#b1">B1</arc-nav-item></arc-nav-item>
      </arc-navigation-menu>
    `);
    triggers(el)[0].click();
    await settle(el);
    triggers(el)[1].click();
    await settle(el);
    expect(openDropdowns(el).length).to.equal(1);
    expect(triggers(el)[0].getAttribute('aria-expanded')).to.equal('false');
  });

  it('does not open anything for a childless item', async () => {
    const el = await menu();
    triggers(el)[0].click();
    await settle(el);
    expect(openDropdowns(el).length).to.equal(0);
  });
});

describe('arc-navigation-menu keyboard', () => {
  it('closes an open dropdown on Escape and restores focus to its trigger', async () => {
    // Trap 5: the listener is on the host, so the event has to start inside and
    // be composed. keyOn() does both; pressKey() on document would not arrive.
    const el = await menu();
    forceDesktop(el);
    triggers(el)[1].click();
    await settle(el);

    keyOn(triggers(el)[1], 'Escape');
    await settle(el);

    expect(openDropdowns(el).length).to.equal(0);

    /**
     * Finding #66, fixed. `_onKeyDown` cleared `_openIndex` and *then* read it
     * to pick the trigger to focus:
     *
     *     this._close();                       // _openIndex = -1
     *     triggers[this._openIndex]?.focus();  // triggers[-1] → undefined
     *
     * So Escape closed the panel and dropped focus. The optional chaining is
     * what made it silent — no error, focus simply stayed wherever it was,
     * which for a keyboard user is back at the top of the document.
     *
     * Compared as a boolean, not with `.to.equal(node)`: chai builds its diff by
     * walking live DOM references and hangs the runner. This assertion is how I
     * rediscovered that — the whole file timed out at 120s with zero tests run
     * and no failure message, which is very likely what made the first attempt
     * at this file look "unstable".
     */
    const focused = el.shadowRoot.activeElement === triggers(el)[1];
    expect(focused, 'Escape did not return focus to the trigger').to.equal(true);
  });

  it('ignores Escape when nothing is open', async () => {
    const el = await menu();
    keyOn(triggers(el)[0], 'Escape');
    await settle(el);
    expect(openDropdowns(el).length).to.equal(0);
  });

  it('leaves every trigger in the tab order', async () => {
    const el = await menu();
    const removed = triggers(el).filter((t) => t.getAttribute('tabindex') === '-1');
    expect(removed.length, 'a trigger was taken out of the tab order').to.equal(0);
  });
});

describe('arc-navigation-menu navigation', () => {
  it('fires arc-navigate with the item that was chosen', async () => {
    const el = await menu();
    const seen = [];
    el.addEventListener('arc-navigate', (e) => {
      e.preventDefault(); // trap 4: do not let the anchor actually navigate
      seen.push(e.detail);
    });

    triggers(el)[0].click();
    await settle(el);

    expect(seen.length).to.equal(1);
    expect(seen[0].href).to.equal('#home');
    expect(seen[0].item.label).to.equal('Home');
  });

  it('fires for a sub-item too', async () => {
    const el = await menu();
    triggers(el)[1].click();
    await settle(el);

    const seen = [];
    el.addEventListener('arc-navigate', (e) => {
      e.preventDefault();
      seen.push(e.detail);
    });
    dropdowns(el)[0].querySelector('a').click();
    await settle(el);

    expect(seen.length).to.equal(1);
    expect(seen[0].href).to.equal('#one');
  });

  it('closes the dropdown when a sub-item is chosen', async () => {
    const el = await menu();
    triggers(el)[1].click();
    await settle(el);
    el.addEventListener('arc-navigate', (e) => e.preventDefault());
    dropdowns(el)[0].querySelector('a').click();
    await settle(el);
    expect(openDropdowns(el).length).to.equal(0);
  });

  it('lets a consumer cancel the navigation', async () => {
    // arc-navigate is cancelable, and preventing it must prevent the anchor's
    // default too — that is the whole point of a router intercepting it.
    const el = await menu();
    el.addEventListener('arc-navigate', (e) => e.preventDefault());

    const event = new MouseEvent('click', { bubbles: true, cancelable: true, composed: true });
    triggers(el)[0].dispatchEvent(event);
    await settle(el);

    expect(event.defaultPrevented, 'the anchor would still have navigated').to.equal(true);
  });

  it('leaves the anchor alone when nobody cancels', async () => {
    const el = await menu();
    const event = new MouseEvent('click', { bubbles: true, cancelable: true, composed: true });
    // Not appended anywhere that would navigate: dispatched directly, and no
    // listener calls preventDefault, so this asserts the component does not.
    triggers(el)[0].dispatchEvent(event);
    await settle(el);
    expect(event.defaultPrevented).to.equal(false);
  });

  it('crosses the shadow boundary', async () => {
    const el = await menu();
    let caught = null;
    document.addEventListener('arc-navigate', (e) => {
      e.preventDefault();
      caught = e;
    }, { once: true });

    triggers(el)[0].click();
    await settle(el);
    expect(caught, 'arc-navigate did not compose out').to.not.equal(null);
  });
});

describe('arc-navigation-menu mobile portal', () => {
  it('creates a portal on connect', async () => {
    const el = await menu();
    expect(portal(), 'no portal element in the document').to.not.equal(null);
    expect(portalRoot(), 'the portal has no shadow root').to.not.equal(null);
  });

  it('removes the portal on disconnect', async () => {
    const el = await menu();
    el.remove();
    await nextFrame();
    expect(portal() === null, 'the portal outlived its component').to.equal(true);
  });

  it('opens the mobile panel on the document-level toggle event', async () => {
    const el = await menu();
    document.dispatchEvent(
      new CustomEvent('arc-mobile-menu-toggle', { detail: { value: true }, bubbles: true }),
    );
    await settle(el);
    expect(
      await until(() => portalRoot()?.querySelector('.mobile-panel--open') !== null),
      'the mobile panel opened',
    ).to.equal(true);
  });

  it('renders the items into the portal, not into its own shadow root', async () => {
    const el = await menu();
    document.dispatchEvent(
      new CustomEvent('arc-mobile-menu-toggle', { detail: { value: true }, bubbles: true }),
    );
    await settle(el);
    expect(await until(() => portalRoot().querySelector('.mobile-panel') !== null)).to.equal(true);
  });

  it('re-styles a fresh portal after the component is reparented', async () => {
    /**
     * Finding #67. `_createPortal` runs on every `connectedCallback` and builds
     * a *new* shadow root, but the "already styled" marker was an instance flag
     * that survived the reconnect — so the second portal was never styled and
     * the mobile overlay rendered as unstyled markup over the page.
     *
     * Same family as #55 and #64 (state outliving the thing it describes) with a
     * third mechanism: not a mismatched lifecycle, but a cached *done* flag.
     * Now keyed on the portal root's own adoptedStyleSheets.
     */
    const el = await menu();
    await settle(el);
    expect(portalRoot().adoptedStyleSheets.length, 'unstyled before reparenting').to.be.greaterThan(
      0,
    );

    const parent = el.parentElement;
    el.remove();
    await nextFrame();
    parent.appendChild(el);
    await settle(el);

    expect(portalRoot(), 'no portal after reconnect').to.not.equal(null);
    expect(
      portalRoot().adoptedStyleSheets.length,
      'the new portal was never styled',
    ).to.be.greaterThan(0);
  });

  it('styles the portal, which has no inherited stylesheet of its own', async () => {
    // A portal shadow root gets nothing from the host: the component copies its
    // own elementStyles across explicitly, and without that the overlay renders
    // as unstyled markup on top of the page.
    const el = await menu();
    await settle(el);
    expect(portalRoot().adoptedStyleSheets.length, 'portal is unstyled').to.be.greaterThan(0);
  });
});
