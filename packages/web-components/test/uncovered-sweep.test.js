/**
 * The uncovered-components sweep — the props that carried a real constraint.
 *
 * 31 components had no coverage of any kind. Surveying their 71 props before
 * writing anything was the useful step: **most are free-form strings** —
 * `label`, `heading`, `href`, `description` — where the vocabulary has nothing
 * to enforce and adoption would have bought zero assertions. Adopting all 31 on
 * principle would have been ceremony.
 *
 * Seven props carried an actual constraint, and every one was the recurring
 * shape: enforced on the render, or nowhere.
 *
 *   - arc-stepper `active`         — unbounded; past the last step nothing is current
 *   - arc-timeline `heading-level` — unbounded; emits invalid `aria-level`
 *   - arc-spy-link `level`         — a nesting depth that could go negative
 *   - arc-stat `trend`             — a bogus value drew an uncoloured dash
 *   - arc-calendar `first-day-of-week` — 9 reordered the week arbitrarily
 *   - arc-dashboard-grid `columns` — NaN and negatives reached the grid template
 *   - arc-aspect-ratio `ratio`     — documented fallback applied to the render only
 *
 * All but the last are fixed here by declaration. `ratio` is a *pattern* rather
 * than a set or a range, which the vocabulary cannot say, so it is pinned below
 * as current behaviour — see test-findings.md.
 *
 * Three of these turn on the same subtlety: **the "absent" state is a real
 * member, not an absence.** `trend: ''` means no indicator, `columns: 0` means
 * auto-fill, `firstDayOfWeek: 0` means follow the locale. Each looked at first
 * like a prop the vocabulary could not express, and each became expressible the
 * moment the sentinel was read as a member of the set.
 */
import { expect } from '@esm-bundle/chai';
import { mount, cleanup, settle } from './helpers.js';

import '../src/data/stepper.register.js';
import '../src/data/step.register.js';
import '../src/data/timeline.register.js';
import '../src/data/timeline-item.register.js';
import '../src/content/aspect-ratio.register.js';

afterEach(() => cleanup());

const STEPS = `
  <arc-step label="One"></arc-step>
  <arc-step label="Two"></arc-step>
  <arc-step label="Three"></arc-step>
`;

async function stepper(attrs = '') {
  const el = mount(`<arc-stepper ${attrs}>${STEPS}</arc-stepper>`);
  await settle(el);
  return el;
}

const circles = (el) => [...el.shadowRoot.querySelectorAll('[part~="step"]')];
const current = (el) => circles(el).filter((c) => c.getAttribute('aria-current') === 'step');

describe('arc-stepper active is bounded by the steps that exist', () => {
  it('marks the indexed step as current', async () => {
    const el = await stepper('active="1"');
    expect(current(el).length, 'exactly one step should be current').to.equal(1);
  });

  it('holds an over-range index at the last step', async () => {
    // Was unbounded: every step read as completed and *no* step was current,
    // so a screen reader announced a workflow with no current position.
    const el = await stepper('active="99"');
    expect(el.active).to.equal(2);
    expect(current(el).length, 'no step was current').to.equal(1);
  });

  it('holds a negative index at the first step', async () => {
    const el = await stepper('active="-5"');
    expect(el.active).to.equal(0);
    expect(current(el).length).to.equal(1);
  });

  it('truncates a fractional index rather than comparing against a float', async () => {
    const el = await stepper();
    el.active = 1.8;
    await settle(el);
    expect(el.active).to.equal(1);
  });

  it('keeps a markup index that the slot has not caught up with yet', async () => {
    // The hazard in clamping against a slot-derived bound: `_maxStep` must be
    // undefined while there are no steps, or `active="2"` is clamped to 0
    // before the steps arrive and never comes back — clamping is destructive.
    const el = await stepper('active="2"');
    expect(el.active, 'a valid index was destroyed before the slot populated').to.equal(2);
  });

  it('re-clamps when steps are removed under it', async () => {
    const el = await stepper('active="2"');
    el.querySelectorAll('arc-step')[2].remove();
    await settle(el);
    await settle(el);
    expect(el.active, 'active pointed past the end after a step was removed').to.equal(1);
  });
});

describe('arc-timeline heading level stays valid for assistive technology', () => {
  const timeline = async (attrs = '') => {
    const el = mount(
      `<arc-timeline ${attrs}><arc-timeline-item heading="A" date="Jan"></arc-timeline-item></arc-timeline>`,
    );
    await settle(el);
    return el;
  };
  const level = (el) => el.shadowRoot.querySelector('[part~="title"]')?.getAttribute('aria-level');

  it('defaults to 3', async () => {
    expect(await timeline().then(level)).to.equal('3');
  });

  it('accepts a valid level', async () => {
    expect(await timeline('heading-level="2"').then(level)).to.equal('2');
  });

  it('never emits a level below 1', async () => {
    // `aria-level="0"` is invalid and is discarded, which silently drops the
    // heading semantics the prop exists to provide.
    const el = await timeline('heading-level="0"');
    expect(el.headingLevel).to.equal(1);
    expect(level(el)).to.equal('1');
  });

  it('never emits a negative level', async () => {
    expect((await timeline('heading-level="-2"')).headingLevel).to.equal(1);
  });

  it('falls back rather than emitting NaN for a non-numeric level', async () => {
    const el = await timeline('heading-level="huge"');
    expect(Number.isNaN(el.headingLevel), 'headingLevel went NaN').to.equal(false);
    expect(level(el)).to.equal('3');
  });
});

describe('arc-aspect-ratio', () => {
  const ratio = async (attrs = '') => {
    const el = mount(`<arc-aspect-ratio ${attrs}></arc-aspect-ratio>`);
    await settle(el);
    return el;
  };
  const box = (el) => el.shadowRoot.querySelector('.aspect-ratio');

  it('uses a valid ratio', async () => {
    const el = await ratio('ratio="4/3"');
    expect(box(el).getAttribute('style')).to.contain('4 / 3');
  });

  it('falls back to 16/9 in the rendering when the format is invalid', async () => {
    const el = await ratio('ratio="banana"');
    expect(box(el).getAttribute('style')).to.contain('16 / 9');
  });

  // Was three BUG pins, and they were one defect wearing three hats.
  //
  // The documented fallback was applied in the *render*, so the property kept a
  // value the component did not honour — same shape as findings #1, #47 and
  // #70. `0/5` matched the format check, reached the CSS as
  // `aspect-ratio: 0 / 5` and collapsed the box; the guard for exactly that
  // lived in `_paddingFallback`, a getter the render never called, so the check
  // had been written and then stranded. And that getter's docstring promised a
  // padding-top fallback "for browsers that don't support the aspect-ratio CSS
  // property" which nothing rendered.
  //
  // Normalising on the state fixes the first two and makes the third's dead
  // code genuinely dead, so it is gone.
  it('normalises an unparseable ratio on the property', async () => {
    const el = await ratio('ratio="banana"');
    expect(el.ratio, 'the property, not just the render').to.equal('16/9');
    expect(box(el).getAttribute('style')).to.contain('16 / 9');
  });

  it('rejects a zero on either side rather than collapsing the box', async () => {
    for (const bad of ['0/5', '5/0']) {
      const el = await ratio(`ratio="${bad}"`);
      expect(el.ratio, bad).to.equal('16/9');
      expect(box(el).getAttribute('style'), bad).to.contain('16 / 9');
      cleanup();
    }
  });

  it('keeps a valid ratio exactly as given', async () => {
    // Anti-vacuity: a component that normalised everything to 16/9 would pass
    // both tests above.
    const el = await ratio('ratio="21/9"');
    expect(el.ratio).to.equal('21/9');
    expect(box(el).getAttribute('style')).to.contain('21 / 9');
  });

  it('keeps a decimal ratio, which the format allows', async () => {
    const el = await ratio('ratio="1.85/1"');
    expect(el.ratio).to.equal('1.85/1');
  });

  it('re-normalises a bad value assigned after mount', async () => {
    const el = await ratio('ratio="4/3"');
    el.ratio = 'banana';
    await settle(el);
    expect(el.ratio).to.equal('16/9');
  });

  it('renders no padding-top fallback, and no longer claims one', async () => {
    const el = await ratio('ratio="4/3"');
    expect(el.shadowRoot.innerHTML).to.not.contain('padding-top');
    expect(el._paddingFallback, 'the dead getter is gone').to.equal(undefined);
  });
});

// ---------------------------------------------------------------------------
// The second batch: props whose "absent" state is a real member, not an absence
// ---------------------------------------------------------------------------

import '../src/data/stat.register.js';
import '../src/navigation/spy-link.register.js';
import '../src/layout/dashboard-grid.register.js';
import '../src/input/calendar.register.js';

describe('arc-stat trend is a closed set including "no trend"', () => {
  const stat = async (attrs = '') => {
    const el = mount(`<arc-stat value="99%" label="Uptime" ${attrs}></arc-stat>`);
    await settle(el);
    return el;
  };
  const indicator = (el) => el.shadowRoot.querySelector('[part~="trend"]');

  it('shows no indicator by default', async () => {
    expect(indicator(await stat()) === null, 'an unset trend drew an arrow').to.equal(true);
  });

  it('shows the indicator for a declared member', async () => {
    expect(indicator(await stat('trend="up"'))).to.not.equal(null);
  });

  it('falls back to no trend for an unrecognised value', async () => {
    // Was: `trend="sideways"` rendered the indicator on the else branch — an
    // uncoloured dash, since `:host([trend="sideways"])` matches no rule. The
    // empty string is a real member of this set, which is what makes it
    // expressible as oneOf at all.
    const el = await stat('trend="sideways"');
    expect(el.trend).to.equal('');
    expect(indicator(el) === null, 'drew an unstyled dash for a bogus trend').to.equal(true);
  });
});

describe('arc-spy-link level is a depth, so it cannot be negative', () => {
  const link = async (attrs = '') => {
    const el = mount(`<arc-spy-link target="a" ${attrs}>A</arc-spy-link>`);
    await settle(el);
    return el;
  };

  it('defaults to 0', async () => {
    expect((await link()).level).to.equal(0);
  });

  it('holds a negative level at 0', async () => {
    expect((await link('level="-3"')).level).to.equal(0);
  });

  it('truncates a fractional level', async () => {
    const el = await link();
    el.level = 2.7;
    await settle(el);
    expect(el.level).to.equal(2);
  });
});

describe('arc-dashboard-grid columns keeps its auto-fill sentinel', () => {
  const grid = async (attrs = '') => {
    const el = mount(`<arc-dashboard-grid ${attrs}><div>a</div></arc-dashboard-grid>`);
    await settle(el);
    return el;
  };

  it('defaults to 0, which means auto-fill', async () => {
    // 0 is not "unset" here, it is the mode switch — which is why the
    // declaration keeps it as the default rather than clamping it away.
    expect((await grid()).columns).to.equal(0);
  });

  it('keeps an explicit column count', async () => {
    expect((await grid('columns="4"')).columns).to.equal(4);
  });

  it('falls back to auto-fill rather than going NaN', async () => {
    const el = await grid('columns="lots"');
    expect(Number.isNaN(el.columns), 'columns went NaN').to.equal(false);
    expect(el.columns).to.equal(0);
  });

  it('holds a negative count at the sentinel', async () => {
    expect((await grid('columns="-2"')).columns).to.equal(0);
  });
});

describe('arc-calendar first-day-of-week is 0 (locale) or an ISO day', () => {
  const cal = async (attrs = '') => {
    const el = mount(`<arc-calendar ${attrs}></arc-calendar>`);
    await settle(el);
    return el;
  };
  const weekdays = (el) =>
    [...el.shadowRoot.querySelectorAll('[part~="dow"]')].map((n) => n.textContent.trim());

  it('defaults to 0, meaning follow the locale', async () => {
    // The documented range is "1 = Monday … 7 = Sunday" and the default is 0,
    // which the prose never mentioned. 0 is the auto sentinel:
    // `this.firstDayOfWeek || firstDayOfWeek(locale)`.
    expect((await cal()).firstDayOfWeek).to.equal(0);
  });

  it('accepts an ISO day', async () => {
    expect((await cal('first-day-of-week="1"')).firstDayOfWeek).to.equal(1);
  });

  it('falls back to the locale for a day outside the week', async () => {
    // Was: 9 is truthy, so it reached weekdayOffset() and reordered the week
    // arbitrarily — a calendar whose columns do not correspond to any weekday.
    const el = await cal('first-day-of-week="9"');
    expect(el.firstDayOfWeek).to.equal(0);
    expect(weekdays(el).length, 'the week should still have seven columns').to.equal(7);
  });

  it('still renders seven distinct weekday headers under a valid override', async () => {
    const el = await cal('first-day-of-week="7"');
    expect(new Set(weekdays(el)).size).to.equal(7);
  });
});

describe('arc-calendar month and year default to now, and stay in range', () => {
  const cal = async (attrs = '') => {
    const el = mount(`<arc-calendar ${attrs}></arc-calendar>`);
    await settle(el);
    return el;
  };
  const title = (el) => el.shadowRoot.querySelector('[part~="title"]').textContent.trim();

  it('defaults to the current month and year', async () => {
    // The case the computed-default form was added for: there is no literal to
    // put in the declaration, and a static default would fight the constructor.
    const now = new Date();
    const el = await cal();
    expect(el.month).to.equal(now.getMonth());
    expect(el.year).to.equal(now.getFullYear());
  });

  it('clamps a month past December instead of rolling into the next year', async () => {
    // `new Date(year, 15)` is April of the following year, so an out-of-range
    // month silently displayed a different year than the `year` prop said.
    const el = await cal('month="15" year="2026"');
    expect(el.month).to.equal(11);
    expect(title(el), 'the header must agree with the year prop').to.contain('2026');
  });

  it('clamps a negative month', async () => {
    const el = await cal('month="-3" year="2026"');
    expect(el.month).to.equal(0);
    expect(title(el)).to.contain('2026');
  });

  it('falls back to the current month for a non-numeric value', async () => {
    const el = await cal('month="Jan"');
    expect(el.month).to.equal(new Date().getMonth());
  });
});
