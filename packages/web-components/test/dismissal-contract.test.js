/**
 * The dismissal contract, in one place, for every component that opens.
 *
 * Escape is asserted in 22 test files and centrally in none. Each of those
 * assertions was written for one component, which is why the library has four
 * different answers to "what closes an overlay" and no statement of what the
 * answer should be: `OverlayMixin` handles Escape for five components,
 * `DismissController` handles pointer and focus for eleven, six hand-roll a
 * keydown listener, and five have no dismissal mechanism at all.
 *
 * **Subjects are derived, and so are the expectations.** A hand-written list
 * would repeat the failure it exists to fix — HANDOFF's table flags exactly
 * this, and both of this repo's hand-listed guards had already gone blind by
 * the time it was written. So:
 *
 *   - the *population* comes from the manifest: every custom element with a
 *     public `open` member (24 of them);
 *   - the *close event* each one must fire comes from its own `@fires` tags;
 *   - the *dismissal affordances* each one must honour come from its own
 *     documented description. A component whose `@prop open` says "closes on
 *     Escape" is asserted to close on Escape. Nobody types that expectation
 *     here.
 *
 * That last rule is the load-bearing one, and it is deliberately **one-way**.
 * Documentation is reliable when it *claims* a capability and unreliable when
 * it omits one: `arc-modal` closes on Escape and its `open` description never
 * says so. So a claim is a test and an omission is not a licence — the omitted
 * cases are covered by POLICY below, which is hand-written but cannot go stale,
 * because a subject with no row fails the coverage guard rather than being
 * silently skipped. That is the same shape as `scripts/checks/scope-coverage.js`:
 * the list is written by hand, the *completeness* of the list is derived.
 *
 * What this file does not do is force the four mechanisms into one. Converging
 * them onto `OverlayMixin` is V4-PLAN 4.4, and this suite is what makes that
 * rework safe: it states the behaviour every one of them must keep, without
 * caring which of the four is currently producing it.
 */
import { expect } from '@esm-bundle/chai';
import { mount, cleanup, settle, deepActive } from './helpers.js';

const manifest = await fetch(new URL('../custom-elements.json', import.meta.url)).then((r) =>
  r.json()
);

/** Every custom element with a public `open` member, with its own docs. */
const SUBJECTS = manifest.modules.flatMap((m) =>
  (m.declarations ?? [])
    .filter((d) => d.customElement && d.tagName && (d.members ?? []).some((x) => x.name === 'open'))
    .map((d) => ({
      tag: d.tagName,
      path: m.path,
      open: (d.members ?? []).find((x) => x.name === 'open'),
      events: d.events ?? [],
    }))
);

// The register module, not the component module: importing the class does not
// define the element (see listbox-controller.test.js).
const unimportable = [];
for (const { tag, path } of SUBJECTS) {
  try {
    await import(
      /* @vite-ignore */ new URL(`../${path.replace(/\.js$/, '.register.js')}`, import.meta.url).href
    );
  } catch (error) {
    unimportable.push(`${tag}: ${error.message.slice(0, 80)}`);
  }
}
// `arc-option` must be a *defined* element for the select-family fixtures —
// unupgraded it has no `label` or `value` at all.
await import('../src/shared/option.register.js');
// Same reason, for the arc-search fixture below.
await import('../src/input/suggestion.register.js');

/**
 * Per-subject fixture and policy. One row per subject, enforced below.
 *
 * `markup` only where the default `<tag></tag>` will not open — a panel with
 * nothing in it is not a panel, and several components refuse to open empty.
 *
 * `escape` / `outside` take three values. `true` is the contract. `'BUG'` is
 * the contract too, but unmet today — those rows assert the *current* broken
 * behaviour and name the finding, so the gap is documented and the assertion
 * flips loudly the moment someone fixes it. `null` means
 * "deliberately not part of the contract", and every `null` carries its reason:
 * these are the disclosure widgets and the layout affordances, which share the
 * `open` property with the overlays and share none of their dismissal
 * semantics. Escape closing a sidebar section would be a bug, not a feature.
 */
const POLICY = {
  // ── Overlays: dismissible, whatever mechanism they currently use ──────────
  'arc-modal': { escape: true, outside: true },
  'arc-lightbox': { escape: true, outside: null, why: 'outside: the backdrop is the viewer' },
  'arc-command-palette': { escape: true, outside: true },
  'arc-sheet': { escape: true, outside: true },
  'arc-drawer': { escape: true, outside: true },
  'arc-confirm': { escape: true, outside: true },
  'arc-dialog': { escape: true, outside: true },
  // Items, because an empty context menu cannot be dismissed by Escape at all
  // (finding #85, pinned below) and an empty menu is not the interesting case.
  'arc-context-menu': {
    escape: true,
    outside: true,
    markup: '<arc-context-menu><arc-menu-item>A</arc-menu-item></arc-context-menu>',
  },
  'arc-dropdown-menu': { escape: true, outside: true },
  'arc-popover': { escape: true, outside: true },
  'arc-hotspot': { escape: true, outside: true },
  'arc-notification-panel': { escape: 'BUG', outside: true, bug: '#86' },

  // ── Field-with-a-panel: the panel dismisses, the field keeps focus ────────
  'arc-select': { escape: true, outside: true, markup: '<arc-select><arc-option value="a">A</arc-option></arc-select>' },
  'arc-tree-select': { escape: true, outside: true },
  'arc-date-picker': { escape: true, outside: true },
  'arc-date-range-picker': { escape: true, outside: true },
  'arc-time-picker': { escape: true, outside: true },
  // The suggestions panel is "really open" only when it has something to show
  // (search.js:230), and that is the condition DismissController is armed on —
  // so an empty fixture is not an open panel and dismissing it proves nothing.
  'arc-search': {
    escape: true,
    outside: true,
    markup: '<arc-search><arc-suggestion value="a">A</arc-suggestion></arc-search>',
  },

  // ── Not overlays. `open` here is disclosure or layout state ───────────────
  'arc-collapsible': { escape: null, outside: null, why: 'a disclosure; its heading is the only control' },
  'arc-sidebar-section': { escape: null, outside: null, why: 'a disclosure inside a persistent nav' },
  'arc-float-bar': { escape: null, outside: null, why: 'layout affordance; visibility tracks a selection, not focus' },
};

describe('dismissal contract: the derivation itself', () => {
  it('every register module imported', () => {
    expect(unimportable, unimportable.join('\n')).to.eql([]);
  });

  // Anti-vacuity. A manifest shape change, or a `open`-declaring component
  // added after this file was written, must fail here rather than quietly
  // shrinking the sweep to nothing.
  it('found the open-declaring population', () => {
    expect(SUBJECTS.length, 'subjects derived from the manifest').to.be.greaterThan(20);
  });

  // The reason POLICY is allowed to be hand-written: it cannot go stale. A new
  // component with a public `open` fails this until someone states whether it
  // is dismissible, which is the decision that would otherwise be skipped.
  it('POLICY has exactly one row per subject, and no rows for anything else', () => {
    const tags = SUBJECTS.map((s) => s.tag).sort();
    const rows = Object.keys(POLICY).sort();
    expect(rows.filter((t) => !tags.includes(t)), 'POLICY rows with no such component').to.eql([]);
    expect(tags.filter((t) => !rows.includes(t)), 'components with no POLICY row').to.eql([]);
  });

  it('every pinned gap names its finding', () => {
    const unnamed = Object.entries(POLICY)
      .filter(([, p]) => (p.escape === 'BUG' || p.outside === 'BUG') && !p.bug)
      .map(([tag]) => tag);
    expect(unnamed, 'pinned as BUG without a finding reference').to.eql([]);
  });

  it('every deliberately-exempt row says why', () => {
    const silent = Object.entries(POLICY)
      .filter(([, p]) => (p.escape === null || p.outside === null) && !p.why)
      .map(([tag]) => tag);
    expect(silent, 'exempt without a reason').to.eql([]);
  });
});

/** Documented claims, read off the component's own description and @fires. */
function claims(subject) {
  const closeEvents = subject.events.filter((e) => /close|cancel|dismiss/i.test(e.name));
  const blob = [subject.open.description ?? '', ...closeEvents.map((e) => e.description ?? '')]
    .join(' | ')
    .toLowerCase();
  return {
    escape: blob.includes('escape'),
    outside: /outside|backdrop|elsewhere|off the/.test(blob),
    closeEvents: closeEvents.map((e) => e.name),
  };
}

/** Open a subject and prove it actually opened. */
async function open(subject) {
  const policy = POLICY[subject.tag];
  const el = mount(policy.markup ?? `<${subject.tag}></${subject.tag}>`);
  await el.updateComplete;
  el.open = true;
  await el.updateComplete;
  await settle();
  // Anti-vacuity per subject: a component that silently refuses to open makes
  // every dismissal assertion below pass by never having anything to dismiss.
  expect(el.open, `${subject.tag} did not open when set programmatically`).to.equal(true);
  return el;
}

/** True when `node` is inside `host`, crossing shadow boundaries. */
function within(host, node) {
  for (let p = node; p; p = p.parentNode?.host ?? p.parentElement ?? p.parentNode) {
    if (p === host) return true;
  }
  return false;
}

/**
 * `querySelector` that descends through nested shadow roots.
 *
 * `arc-confirm` and `arc-dialog` are thin wrappers around `arc-modal`, so their
 * backdrop is two shadow roots down and a search of their own root finds
 * nothing. Stopping at the first boundary reports a composed component as
 * having no dismissal affordance when it has inherited a perfectly good one.
 */
function deepQuery(root, selector) {
  const here = root.shadowRoot ?? root;
  const hit = here.querySelector?.(selector);
  if (hit) return hit;
  for (const child of here.querySelectorAll?.('*') ?? []) {
    if (child.shadowRoot) {
      const nested = deepQuery(child, selector);
      if (nested) return nested;
    }
  }
  return null;
}

/** The deepest element under `root`, crossing no shadow boundary. */
function deepestIn(root) {
  let best = null;
  let bestDepth = -1;
  for (const node of root.querySelectorAll('*')) {
    let depth = 0;
    for (let p = node; p && p !== root; p = p.parentElement ?? p.parentNode) depth += 1;
    if (depth > bestDepth) [bestDepth, best] = [depth, node];
  }
  return best;
}

/**
 * Press Escape the way a keyboard does: from whatever has focus.
 *
 * Dispatching on `document` — the obvious first draft — only reaches the five
 * components whose handler is on `document` via `OverlayMixin`, and silently
 * misses every component that binds `@keydown` inside its own template. A real
 * Escape originates at the focused node deep in the tree and bubbles up through
 * all of them, so one dispatch from the right origin exercises every mechanism
 * at once. That is also why the existing per-component suites all use
 * `keyOn(menu(el), 'Escape')` rather than a document-level press.
 */
async function pressEscape(el) {
  // A modal `<dialog>` is the third case, and it is the platform's rather than
  // the component's: the user agent translates Escape into a `cancel` event on
  // the element, and no dispatched keydown produces that — not from document,
  // not from the focused node, not from anywhere. Since V4-PLAN 4.4 moved the
  // five backdrop overlays onto `showModal()`, dispatching a key at them
  // asserts nothing at all, and would keep passing if their handling were
  // deleted outright.
  //
  // So the driver dispatches what the browser would. Whether Escape produces a
  // cancel is the platform's guarantee; what the component does with one is the
  // library's, and that is the half this suite is about.
  // deepQuery, not shadowRoot.querySelector: arc-confirm and arc-dialog
  // compose an <arc-modal>, so their dialog is one shadow root further down.
  const dialog = deepQuery(el, 'dialog');
  if (dialog?.open) {
    dialog.dispatchEvent(new Event('cancel', { cancelable: true }));
    return;
  }

  el.focus?.();
  await settle();

  // `active !== el` matters: several components are focusable hosts, so
  // `el.focus()` leaves the *host* as the active element. Dispatching there
  // reaches document-level handlers but never a `@keydown` bound on a
  // descendant in the template, which is where six of these components put it —
  // and the miss looks exactly like a broken component.
  const active = deepActive();
  const origin =
    (active && active !== el && within(el, active) && active) ||
    el.shadowRoot?.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"]), ' +
        '[role="menu"], [role="listbox"], [role="dialog"], [role="tooltip"]'
    ) ||
    (el.shadowRoot && deepestIn(el.shadowRoot)) ||
    el;

  origin.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, composed: true, cancelable: true })
  );
}

/**
 * Dismiss from outside, with the gesture the component's own geometry implies.
 *
 * There are two geometries here and the library states neither. An anchored
 * panel (`DismissController`) is dismissed by a pointerdown anywhere else in
 * the document. A backdrop overlay covers the viewport, so there *is* no
 * "anywhere else" to click — the documented gesture is a click on its own
 * backdrop, and a document-level pointerdown is not something a user can
 * perform on it at all.
 *
 * Which one applies is derived from what the open component renders rather
 * than hand-listed: a backdrop in the shadow root means the backdrop geometry.
 */
async function dismissOutside(el) {
  // Three geometries now, and the third arrived with the platform. A modal
  // `<dialog>` has no backdrop *element*: the scrim is `::backdrop`, which is a
  // pseudo-element and cannot be clicked directly — the browser dispatches a
  // click on it to the dialog itself. So `target === dialog` is what "outside
  // the content" means, and dispatching at the dialog is the only way to
  // perform the gesture. A document-level pointerdown is not something a user
  // can do to a modal at all: everything else in the document is inert.
  const dialog = deepQuery(el, 'dialog');
  if (dialog?.open) {
    dialog.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));
    return 'dialog backdrop click';
  }

  const backdrop = deepQuery(el, '[part~="backdrop"], [class*="backdrop"]');
  if (!backdrop) {
    document.body.dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true, composed: true, cancelable: true })
    );
    return 'document pointerdown';
  }

  // Click first — the documented backdrop gesture — and only fall through to
  // pointerdown if the component listens for that instead. Sequential, not
  // both, so a component cannot be closed twice and pass the once-only test.
  backdrop.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true, cancelable: true }));
  await el.updateComplete;
  if (el.open) {
    backdrop.dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true, composed: true, cancelable: true })
    );
  }
  return 'backdrop click';
}

describe('dismissal contract: documented claims are kept', () => {
  afterEach(cleanup);

  // Nobody wrote these expectations — each one is the component's own sentence
  // about itself, turned into an assertion.
  for (const subject of SUBJECTS) {
    const claimed = claims(subject);

    if (claimed.escape) {
      it(`${subject.tag} closes on Escape, as its own docs say`, async () => {
        const el = await open(subject);
        await pressEscape(el);
        await el.updateComplete;
        await settle();
        expect(el.open).to.equal(false);
      });
    }

    if (claimed.outside) {
      it(`${subject.tag} closes on an outside pointerdown, as its own docs say`, async () => {
        const el = await open(subject);
        await dismissOutside(el);
        await el.updateComplete;
        await settle();
        expect(el.open).to.equal(false);
      });
    }
  }
});

describe('dismissal contract: the policy the docs do not state', () => {
  afterEach(cleanup);

  for (const subject of SUBJECTS) {
    const policy = POLICY[subject.tag];

    if (policy.escape === true) {
      it(`${subject.tag} closes on Escape`, async () => {
        const el = await open(subject);
        await pressEscape(el);
        await el.updateComplete;
        await settle();
        expect(el.open).to.equal(false);
      });
    }

    if (policy.escape === null) {
      it(`${subject.tag} does NOT close on Escape — ${policy.why}`, async () => {
        const el = await open(subject);
        await pressEscape(el);
        await el.updateComplete;
        await settle();
        expect(el.open).to.equal(true);
      });
    }

    // Pinned gaps. These assert the broken behaviour on purpose, so the gap is
    // recorded and the test flips the moment it is fixed — the same ratchet the
    // wrapper harness uses, in the shape this repo already spells `BUG:`.
    if (policy.escape === 'BUG') {
      it(`BUG: ${subject.tag} does not close on Escape (${policy.bug})`, async () => {
        const el = await open(subject);
        await pressEscape(el);
        await el.updateComplete;
        await settle();
        expect(el.open, 'fixed? remove the BUG pin in POLICY').to.equal(true);
      });
    }

    if (policy.outside === 'BUG') {
      it(`BUG: ${subject.tag} does not close on an outside pointerdown (${policy.bug})`, async () => {
        const el = await open(subject);
        await dismissOutside(el);
        await el.updateComplete;
        await settle();
        expect(el.open, 'fixed? remove the BUG pin in POLICY').to.equal(true);
      });
    }

    if (policy.outside === true) {
      it(`${subject.tag} closes on an outside pointerdown`, async () => {
        const el = await open(subject);
        await dismissOutside(el);
        await el.updateComplete;
        await settle();
        expect(el.open).to.equal(false);
      });
    }
  }
});

describe('dismissal contract: closing announces itself exactly once', () => {
  afterEach(cleanup);

  // Derived from each component's own @fires: a component that documents
  // arc-close must fire it when Escape closes it, and must fire it once.
  for (const subject of SUBJECTS) {
    const policy = POLICY[subject.tag];
    const { closeEvents } = claims(subject);
    if (policy.escape !== true || closeEvents.length === 0) continue;

    it(`${subject.tag} fires ${closeEvents.join('/')} once when Escape closes it`, async () => {
      const el = await open(subject);
      const seen = [];
      for (const name of closeEvents) el.addEventListener(name, () => seen.push(name));

      await pressEscape(el);
      await el.updateComplete;
      await settle();

      expect(el.open, 'precondition: it closed').to.equal(false);
      expect(seen.length, `expected one of ${closeEvents.join('/')}, got ${seen.join(',')}`)
        .to.equal(1);
    });
  }
});

describe('dismissal contract: Escape while closed is inert', () => {
  afterEach(cleanup);

  // The universal half — it applies to all 24 regardless of policy, and it is
  // the assertion that catches a global keydown listener left armed after
  // close. Findings #72/#73/#75 were all the mirror image of this (a listener
  // that stopped working); this is the one that fires when it should not.
  for (const subject of SUBJECTS) {
    const { closeEvents } = claims(subject);

    it(`${subject.tag} fires nothing on Escape while closed`, async () => {
      const policy = POLICY[subject.tag];
      const el = mount(policy.markup ?? `<${subject.tag}></${subject.tag}>`);
      await el.updateComplete;
      await settle();

      const seen = [];
      for (const name of closeEvents) el.addEventListener(name, () => seen.push(name));
      const before = el.open;

      await pressEscape(el);
      await el.updateComplete;
      await settle();

      expect(seen, `${subject.tag} announced a close it never made`).to.eql([]);
      expect(el.open, `${subject.tag} changed open state on a stray Escape`).to.equal(before);
    });
  }
});

describe('dismissal contract: the guard that swallows Escape', () => {
  afterEach(cleanup);

  // Was a BUG pin (finding #85). `arc-context-menu._handleKeydown` opened with
  //
  //     const selectable = this._selectableItems;
  //     if (selectable.length === 0) return;
  //
  // which exists for the arrow-key cases below it — they index into
  // `selectable` and would throw on an empty list. Escape needs none of that
  // and was blocked by it anyway, so a context menu with no items rendered a
  // full-viewport backdrop the keyboard could not dismiss. The backdrop's click
  // handler still worked, so it was dismissible by mouse and not by keyboard,
  // which is the half that matters.
  //
  // Fixed by handling Escape *before* the guard: dismissal does not depend on
  // there being anything to select.
  //
  // Narrower than it first looked, and worth keeping stated: *disabled* items
  // still count as selectable, so the common "every command is disabled in this
  // context" menu was never affected. The reachable case is a menu whose items
  // have not arrived yet.
  it('an empty arc-context-menu closes on Escape (#85)', async () => {
    const el = mount('<arc-context-menu></arc-context-menu>');
    await el.updateComplete;
    el.open = true;
    await el.updateComplete;
    await settle();

    await pressEscape(el);
    await el.updateComplete;
    await settle();

    expect(el.open).to.equal(false);
  });

  it('the same menu with one item closes on Escape', async () => {
    // The pair that makes the one above mean something: without it, "Escape
    // does not close it" also passes on a component whose Escape never worked.
    const el = mount('<arc-context-menu><arc-menu-item>A</arc-menu-item></arc-context-menu>');
    await el.updateComplete;
    el.open = true;
    await el.updateComplete;
    await settle();

    await pressEscape(el);
    await el.updateComplete;
    await settle();

    expect(el.open).to.equal(false);
  });

  it('and so does a menu whose only item is disabled', async () => {
    // Pins the boundary measured while diagnosing #85, so a future "fix" that
    // narrows `_selectableItems` to enabled items reintroduces the bug for the
    // most common context-menu state there is.
    const el = mount('<arc-context-menu><arc-menu-item disabled>A</arc-menu-item></arc-context-menu>');
    await el.updateComplete;
    el.open = true;
    await el.updateComplete;
    await settle();

    await pressEscape(el);
    await el.updateComplete;
    await settle();

    expect(el.open).to.equal(false);
  });
});
