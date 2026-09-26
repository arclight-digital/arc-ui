/**
 * Hydration with script-set data: every component with a `list()` prop.
 *
 * A `list()` prop is data a page sets from script, commonly before the element
 * upgrades. Lit applies it at the top of the first update, which is the update
 * that has to adopt the server's markup, and the server rendered from
 * attributes alone. A first client render that uses the page's array is a
 * hydration mismatch ("Unexpected TemplateResult rendered to part" and friends),
 * and hydration abandons the tree.
 *
 * Ten components carried a hand-copied hold for this, under four different
 * names; fifteen had none, including arc-bar-list, written in 4.6. This test
 * found them (test-findings #144). DeclaredPropsMixin now holds every `list()`
 * prop generically, and this pins it for every component that has one,
 * including the next.
 *
 * The markup is the real server output, captured in Node by
 * scripts/generate/ssr-fixtures.js; hand-written markup would carry no lit-part
 * markers and prove nothing.
 */
import { expect } from '@esm-bundle/chai';
// Before any component module: hydration support patches LitElement's update
// path, and a class defined before the patch never gets it.
import '../src/hydrate.js';
import fixtures from './fixtures/ssr-list-props.js';
import { cleanup, settle } from './helpers.js';

afterEach(cleanup);

/** One realistic value per documented shape, enough to change the render. */
const SAMPLES = {
  'arc-activity-heatmap': { data: [{ date: '2026-01-05', value: 3 }, { date: '2026-01-06', value: 7 }] },
  'arc-anchor-nav': { items: [{ label: 'Intro', value: 'intro' }, { label: 'Usage', value: 'usage' }] },
  'arc-bar-list': { items: [{ label: 'Search', value: 40 }, { label: 'Direct', value: 20 }] },
  'arc-bottom-nav': { items: [{ label: 'Home', value: 'home' }, { label: 'Search', value: 'search' }] },
  'arc-breadcrumb-menu': { items: [{ label: 'Docs', href: '/docs' }, { label: 'Guides', href: '/docs/guides' }] },
  'arc-chart': { series: [{ label: 'Visits', data: [3, 5, 2] }], labels: ['Mon', 'Tue', 'Wed'] },
  'arc-color-picker': { presets: ['#ff0000', '#00ff00'] },
  'arc-comparison': { features: ['Storage', 'Bandwidth'] },
  'arc-comparison-column': { values: ['true', 'false'] },
  'arc-data-grid': {
    columns: [{ key: 'name', label: 'Name', sortable: true }, { key: 'age', label: 'Age' }],
    rows: [{ name: 'Ada', age: 36 }, { name: 'Grace', age: 45 }],
    sort: [{ key: 'name', direction: 'asc' }],
  },
  'arc-date-range-picker': { presets: [{ label: 'Last 7 days', days: 7 }] },
  'arc-kanban': { columns: [{ id: 'todo', title: 'To do', items: [{ id: 'a', label: 'Write' }] }] },
  'arc-knob': { detents: [0, 50, 100] },
  'arc-lightbox': { images: [{ src: 'data:image/gif;base64,R0lGODlhAQABAAAAACw=', alt: 'Pixel' }] },
  'arc-menubar': { items: [{ label: 'File', items: [{ label: 'Open' }] }, { label: 'Edit', items: [{ label: 'Undo' }] }] },
  'arc-multi-select': { value: ['a', 'b'] },
  'arc-rail': { items: [{ icon: 'x', label: 'Home', value: 'home' }] },
  'arc-stepper-nav': { steps: ['Account', 'Profile', 'Done'] },
  'arc-tag-input': { value: ['alpha', 'beta'], suggestions: ['gamma'] },
  'arc-terminal': { lines: [{ type: 'command', text: 'ls' }, { type: 'output', text: 'README.md' }] },
  'arc-transfer-list': { options: [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }], value: ['b'] },
  'arc-tree-select': {
    items: [{ value: 'g', label: 'Group', children: [{ value: 'a', label: 'A' }] }],
    expandedValues: ['g'],
  },
  'arc-uptime': { data: [1, 0.99, 0.5] },
  'arc-virtual-list': { items: [{ id: 1 }, { id: 2 }, { id: 3 }] },
  'arc-waveform': { peaks: [0.2, 0.8, 0.4, 0.6] },
};

describe('hydration with script-set list() data', () => {
  const classes = {};
  before(async () => {
    for (const [tag, { register }] of Object.entries(fixtures)) {
      const mod = await import(register);
      classes[tag] = Object.values(mod).find((v) => typeof v === 'function' && v.prototype instanceof HTMLElement);
    }
  });

  it('has a sample for every component with a list() prop', () => {
    const missing = Object.entries(fixtures)
      .flatMap(([tag, { props }]) => props.filter((p) => !(SAMPLES[tag] && p in SAMPLES[tag])).map((p) => `${tag}.${p}`));
    expect(missing, 'add a sample for each').to.deep.equal([]);
  });

  /** Plant, hand over the data at the chosen moment, connect, and collect errors. */
  async function hydrate(markup, props, sample, { beforeUpgrade, tag }) {
    let fresh = null;
    if (beforeUpgrade) {
      // A tag nothing has defined yet, so the parsed element stays un-upgraded
      // and the page's assignments park as own properties, as on a page whose
      // register barrel has not loaded.
      fresh = `hd-${tag.slice(4)}-${Math.random().toString(36).slice(2, 8)}`;
      markup = markup.replace(new RegExp(`^<${tag}`), `<${fresh}`).replace(new RegExp(`</${tag}>\\s*$`), `</${fresh}>`);
    }
    const host = document.createElement('div');
    // setHTMLUnsafe attaches the declarative shadow root; innerHTML would not.
    host.setHTMLUnsafe(markup);
    const el = host.firstElementChild;
    expect(el.shadowRoot !== null, 'the fixture is server-rendered').to.equal(true);
    for (const p of props) el[p] = sample[p];

    const errors = [];
    const onError = (e) => errors.push(e.reason?.message ?? e.message ?? String(e));
    window.addEventListener('unhandledrejection', onError);
    window.addEventListener('error', onError);
    try {
      document.body.appendChild(host);
      if (fresh) customElements.define(fresh, class extends classes[tag] {});
      for (let i = 0; i < 3; i++) await settle(el).catch((e) => errors.push(e?.message ?? String(e)));
    } finally {
      window.removeEventListener('unhandledrejection', onError);
      window.removeEventListener('error', onError);
    }
    return { el, errors };
  }

  for (const [tag, { props, markup }] of Object.entries(fixtures)) {
    for (const beforeUpgrade of [true, false]) {
      const when = beforeUpgrade ? 'parked before upgrade' : 'set after upgrade, before the first update';
      it(`${tag}: adopts the server markup, then takes ${props.join(', ')} ${when}`, async () => {
        const { el, errors } = await hydrate(markup, props, SAMPLES[tag], { beforeUpgrade, tag });
        expect(errors, 'no hydration error').to.deep.equal([]);
        for (const p of props) expect(el[p], `${p} is the page's`).to.deep.equal(SAMPLES[tag][p]);
      });
    }
  }
});
