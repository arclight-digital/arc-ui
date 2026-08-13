/**
 * contract.js — the one contract all six wrapper packages are held to.
 *
 * Nothing in this repo has ever mounted a wrapper. Every wrapper check is
 * static: `wrapper-slots.js` reads generated source, `smoke-test-wrappers.js`
 * proves a tarball *builds* in a real consumer, and the component suite tests
 * the custom element the wrappers wrap. The gap between "it compiles" and "the
 * prop arrived" is where the wrapper bugs live, and it is the whole of this
 * file's subject.
 *
 * The probes run **in the browser, against the built bundle**, and they are
 * written once here rather than once per framework on purpose: six hand-written
 * suites drift, and a matrix whose rows assert different things cannot be read
 * as a matrix. Each fixture app's only job is to render the DOM described by
 * `FIXTURE` below; every assertion is this file's.
 *
 * The four capabilities, one representative component each (V4-PLAN 2.4a):
 *
 *   arc-card             default + named slot content
 *   arc-top-bar          named slots on a component that renders four of them
 *   arc-activity-heatmap array and numeric props — the ones an attribute
 *                        round-trip silently destroys
 *   arc-time-picker      event out, and state written back down
 *
 * ── The fixture contract ────────────────────────────────────────────────────
 *
 * Every framework app renders exactly this, in this order:
 *
 *   <arc-card id="card" padding="lg">
 *     <span id="card-default">DEFAULT</span>
 *     <span id="card-footer" slot="footer">FOOTER</span>
 *   </arc-card>
 *
 *   <arc-card id="card-unset"></arc-card>            <- no padding passed
 *
 *   <arc-top-bar id="topbar" heading="Runtime">
 *     <span id="tb-logo" slot="logo">LOGO</span>
 *     <span id="tb-actions" slot="actions">ACTIONS</span>
 *   </arc-top-bar>
 *
 *   <arc-activity-heatmap id="heatmap"
 *     data=ROWS weeks=4 endDate="2026-01-03"></arc-activity-heatmap>
 *
 *   <arc-time-picker id="picker" value={state} onArcChange={...}>
 *   <output id="echo">{state}</output>
 *   <output id="events">{count}</output>
 *
 * `id` is deliberately *not* how elements are found — a framework that drops
 * unknown attributes would fail every probe at once and the diagnosis would be
 * lost in the noise. Elements are found by tag in document order, and `id`
 * landing is its own probe with its own verdict.
 */

/** The array prop. Three rows, distinguishable from each other and from ''. */
export const ROWS = [
  { date: '2026-01-01', value: 1 },
  { date: '2026-01-02', value: 2 },
  { date: '2026-01-03', value: 3 },
];

export const FIXTURE = {
  cardPadding: 'lg',
  /** `oneOf(['none','sm','md','lg'], { default: 'md' })` — card.js:26. */
  cardPaddingDefault: 'md',
  topBarHeading: 'Runtime',
  heatmapWeeks: 4,
  heatmapEndDate: '2026-01-03',
  pickerInitial: '08:00',
  /** What the probe dispatches, and therefore what write-back must produce. */
  pickerNext: '09:15',
  rows: ROWS,
};

/**
 * Runs in the page. Returns `{ [probe]: { actual, note? } }` — verdicts are
 * Node's job (below), so a probe that throws reports the throw rather than
 * taking the whole run down with it.
 *
 * Serialized with `Function.prototype.toString` and handed to `page.evaluate`,
 * so it must be self-contained: no imports, no closure over module scope.
 */
export async function collect(fixture) {
  const out = {};
  const record = async (name, fn) => {
    try {
      out[name] = { actual: await fn() };
    } catch (err) {
      out[name] = { actual: `THREW: ${err && err.message}` };
    }
  };

  const settle = () => new Promise((r) => requestAnimationFrame(() => setTimeout(r, 0)));

  const cards = [...document.querySelectorAll('arc-card')];
  const [card, cardUnset] = cards;
  const topbar = document.querySelector('arc-top-bar');
  const heatmap = document.querySelector('arc-activity-heatmap');
  const picker = document.querySelector('arc-time-picker');

  // Upgrade + first render. Everything below reads a settled element.
  for (const el of [card, cardUnset, topbar, heatmap, picker]) {
    if (el && el.updateComplete) await el.updateComplete;
  }

  // ── Did the elements render at all? ───────────────────────────────────────
  await record('mounted', () =>
    [card, cardUnset, topbar, heatmap, picker].filter(Boolean).length
  );

  // Not a formality. A wrapper that emits `<arc-card>` without ever importing
  // the module that defines it produces an `HTMLUnknownElement`, and **every
  // prop probe below still passes on it** — `el.padding = 'lg'` writes an
  // expando to a plain object, and reading it back returns `'lg'`. So this
  // probe has to come first and be its own verdict: without it, a package that
  // registers nothing at all reports one slot failure and eleven greens.
  await record('defined', () =>
    ['arc-card', 'arc-top-bar', 'arc-activity-heatmap', 'arc-time-picker']
      .filter((t) => customElements.get(t)).length
  );
  await record('upgraded', () => (card && card.shadowRoot ? 'shadow root' : 'NO SHADOW ROOT'));

  // ── Props ─────────────────────────────────────────────────────────────────
  await record('prop-string', () => card && card.padding);
  await record('prop-unset-keeps-default', () => cardUnset && cardUnset.padding);
  await record('prop-string-topbar', () => topbar && topbar.heading);
  await record('attr-passthrough', () => card && card.id);

  // An array prop that arrived as an attribute is a string, and a string that
  // happens to be `[object Object],[object Object]` passes any check looser
  // than this one.
  await record('prop-array', () => {
    if (!heatmap) return 'NO ELEMENT';
    const d = heatmap.data;
    if (!Array.isArray(d)) return `NOT AN ARRAY: ${typeof d} ${JSON.stringify(d)}`;
    return `${d.length}:${d.map((r) => `${r && r.date}=${r && r.value}`).join(',')}`;
  });

  // `4` and `'4'` are both truthy and both render; only this tells them apart.
  await record('prop-number', () => heatmap && `${typeof heatmap.weeks}:${heatmap.weeks}`);

  // camelCase cannot survive an attribute, so this is the case-preservation
  // probe as much as the value one.
  await record('prop-camel', () => heatmap && heatmap.endDate);

  // ── Slots ─────────────────────────────────────────────────────────────────
  // Presence in the light DOM is not enough: content the component never
  // assigns to a slot is invisible. `assignedSlot` is the assertion that
  // distinguishes "rendered" from "rendered where the user can see it".
  const slotted = (host, id) => {
    if (!host) return 'NO HOST';
    const node = host.querySelector(`#${id}`);
    if (!node) return 'ABSENT FROM LIGHT DOM';
    if (!node.assignedSlot) return 'PRESENT BUT UNASSIGNED';
    return `${node.assignedSlot.name || '(default)'}:${node.textContent}`;
  };

  await record('slot-default', () => slotted(card, 'card-default'));
  await record('slot-named-footer', () => slotted(card, 'card-footer'));
  await record('slot-named-logo', () => slotted(topbar, 'tb-logo'));
  await record('slot-named-actions', () => slotted(topbar, 'tb-actions'));

  // ── Events, and the write-back round trip ─────────────────────────────────
  // Dispatched rather than clicked: the subject here is the wrapper's event
  // wiring, not the time picker's interaction model, which its own suite owns.
  await record('event-and-writeback', async () => {
    if (!picker) return 'NO ELEMENT';
    const before = document.querySelector('#events');
    const beforeCount = before ? before.textContent.trim() : 'NO COUNTER';

    picker.dispatchEvent(
      new CustomEvent('arc-change', {
        detail: { value: fixture.pickerNext },
        bubbles: true,
        composed: true,
      })
    );
    await settle();
    if (picker.updateComplete) await picker.updateComplete;
    await settle();

    const after = document.querySelector('#events');
    const echo = document.querySelector('#echo');
    return [
      `count:${beforeCount}->${after ? after.textContent.trim() : 'NO COUNTER'}`,
      `echo:${echo ? echo.textContent.trim() : 'NO ECHO'}`,
      `el:${picker.value}`,
    ].join(' ');
  });

  return out;
}

/**
 * The expected value of every probe, for every framework. One table, because
 * "the wrapper matrix" means the rows are comparable.
 *
 * `event-and-writeback` folds three facts into one string on purpose: the
 * handler ran (count 0->1), the framework's own state updated (echo), and that
 * state flowed back down into the element (el). A wrapper can pass any one of
 * those and fail the other two, and each failure reads differently.
 */
export function expectations(fixture) {
  return {
    mounted: 5,
    defined: 4,
    upgraded: 'shadow root',
    'prop-string': fixture.cardPadding,
    'prop-unset-keeps-default': fixture.cardPaddingDefault,
    'prop-string-topbar': fixture.topBarHeading,
    'attr-passthrough': 'card',
    'prop-array': `3:2026-01-01=1,2026-01-02=2,2026-01-03=3`,
    'prop-number': `number:${fixture.heatmapWeeks}`,
    'prop-camel': fixture.heatmapEndDate,
    'slot-default': '(default):DEFAULT',
    'slot-named-footer': 'footer:FOOTER',
    'slot-named-logo': 'logo:LOGO',
    'slot-named-actions': 'actions:ACTIONS',
    'event-and-writeback': `count:0->1 echo:${fixture.pickerNext} el:${fixture.pickerNext}`,
  };
}

/**
 * Probes that are known to fail today, with the finding that owns each.
 *
 * A pin is not a suppression. A pinned probe that *passes* fails the run just
 * as loudly as an unpinned one that fails — the same ratchet the mutation gates
 * use, where thresholds sit at measured values so the numbers only move one
 * way. Without it this harness could never enter CI: it would be permanently
 * red, and a permanently red job stops being read.
 *
 * Every entry here is a defect in `@arclux/prism`'s emitters, not in this
 * repo's source, so none of them can be fixed from here. They are V4-PLAN 3.1's
 * subject, and 3.1 is explicitly gated on this harness existing first.
 */
export const PINNED = {
  angular: {
    // #80 — the Angular package registers no custom elements at all.
    defined: '#80',
    upgraded: '#80',
    'prop-unset-keeps-default': '#80',
    'slot-default': '#80',
    'slot-named-footer': '#80',
    // #81 — no <ng-content> on any component without a *default* slot.
    'slot-named-logo': '#81',
    'slot-named-actions': '#81',
  },
  solid: {
    // #82 — same root cause as #81, in the Solid emitter: no `children` at all
    // for a component whose slots are all named.
    'slot-named-logo': '#82',
    'slot-named-actions': '#82',
  },
};

/** Probe → the capability it stands for, for the matrix's row labels. */
export const CAPABILITY = {
  mounted: 'render',
  defined: 'render',
  upgraded: 'render',
  'prop-string': 'prop',
  'prop-unset-keeps-default': 'prop',
  'prop-string-topbar': 'prop',
  'attr-passthrough': 'prop',
  'prop-array': 'prop',
  'prop-number': 'prop',
  'prop-camel': 'prop',
  'slot-default': 'slot',
  'slot-named-footer': 'slot',
  'slot-named-logo': 'slot',
  'slot-named-actions': 'slot',
  'event-and-writeback': 'event',
};
