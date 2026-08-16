import { expect } from '@esm-bundle/chai';
import '../src/input/date-picker.register.js';
import '../src/input/calendar.register.js';
import '../src/data/data-grid.register.js';
import {
  monthNames, weekdayNames, firstDayOfWeek, weekdayOffset, defaultLocale,
} from '../src/shared/date-names.js';
import { mount, cleanup, tick } from './helpers.js';

describe('Intl date names', () => {
  it('returns twelve months, January-first regardless of locale', () => {
    // Callers index by month number, so the order has to be calendrical.
    for (const locale of ['en-US', 'de-DE', 'ar-EG', 'ja-JP']) {
      const names = monthNames('long', locale);
      expect(names, locale).to.have.lengthOf(12);
      expect(new Set(names).size, `${locale} has twelve distinct names`).to.equal(12);
    }
  });

  it('localises month names', () => {
    expect(monthNames('long', 'en-US')[0]).to.equal('January');
    expect(monthNames('long', 'de-DE')[0]).to.equal('Januar');
    expect(monthNames('long', 'fr-FR')[0]).to.equal('janvier');
  });

  it('never lands on an adjacent month through a timezone boundary', () => {
    // The formatter is fed day 15 in UTC for exactly this reason: day 1 can slip
    // backwards into the previous month in a negative offset.
    const names = monthNames('short', 'en-US');
    expect(names[0]).to.equal('Jan');
    expect(names[11]).to.equal('Dec');
  });

  it('returns seven weekdays ordered from the locale first day', () => {
    expect(weekdayNames('short', 'en-US')).to.have.lengthOf(7);
    // en-US starts on Sunday, en-GB on Monday.
    expect(weekdayNames('long', 'en-US')[0]).to.equal('Sunday');
    expect(weekdayNames('long', 'en-GB')[0]).to.equal('Monday');
  });

  it('honours an explicit first day over the locale', () => {
    expect(weekdayNames('long', 'en-US', 1)[0]).to.equal('Monday');
    expect(weekdayNames('long', 'en-GB', 7)[0]).to.equal('Sunday');
    expect(weekdayNames('long', 'en-US', 6)[0]).to.equal('Saturday');
  });

  it('knows the regional first day of the week', () => {
    expect(firstDayOfWeek('en-US'), 'US: Sunday').to.equal(7);
    expect(firstDayOfWeek('en-GB'), 'GB: Monday').to.equal(1);
    expect(firstDayOfWeek('de-DE'), 'DE: Monday').to.equal(1);
    expect(firstDayOfWeek('ar-EG'), 'EG: Saturday').to.equal(6);
  });

  it('falls back to Monday for an unparseable locale', () => {
    expect(firstDayOfWeek('not a locale')).to.equal(1);
  });

  it('takes the default locale from the document lang', () => {
    const original = document.documentElement.lang;
    document.documentElement.lang = 'de-DE';
    expect(defaultLocale()).to.equal('de-DE');
    document.documentElement.lang = original;
  });
});

describe('weekdayOffset: the leading-blank count', () => {
  // This is the arithmetic every calendar got wrong by mixing a Sunday-based
  // getDay() with a non-Sunday first day.
  it('counts from Sunday when the week starts on Sunday', () => {
    const sunday = new Date(2021, 7, 1);   // 2021-08-01 was a Sunday
    expect(weekdayOffset(sunday, 7)).to.equal(0);
    expect(weekdayOffset(new Date(2021, 7, 2), 7), 'Monday').to.equal(1);
    expect(weekdayOffset(new Date(2021, 7, 7), 7), 'Saturday').to.equal(6);
  });

  it('counts from Monday when the week starts on Monday', () => {
    expect(weekdayOffset(new Date(2021, 7, 2), 1), 'Monday').to.equal(0);
    expect(weekdayOffset(new Date(2021, 7, 1), 1), 'Sunday is last').to.equal(6);
  });

  it('counts from Saturday when the week starts on Saturday', () => {
    expect(weekdayOffset(new Date(2021, 7, 7), 6), 'Saturday').to.equal(0);
    expect(weekdayOffset(new Date(2021, 7, 1), 6), 'Sunday').to.equal(1);
  });

  it('always lands in 0-6 for every day and every first-day', () => {
    for (let firstDay = 1; firstDay <= 7; firstDay++) {
      for (let d = 1; d <= 7; d++) {
        const n = weekdayOffset(new Date(2021, 7, d), firstDay);
        expect(n, `firstDay=${firstDay} day=${d}`).to.be.within(0, 6);
      }
    }
  });
});

describe('the calendars use the shared source', () => {
  afterEach(cleanup);

  it('arc-date-picker renders localised weekday headers', async () => {
    const el = mount('<arc-date-picker label="When" locale="de-DE"></arc-date-picker>');
    await el.updateComplete;
    el.open = true;
    await el.updateComplete;
    await tick();

    const dows = [...el.shadowRoot.querySelectorAll('.dow, [part~="dow"], .weekday')]
      .map((n) => n.textContent.trim()).filter(Boolean);
    expect(dows.length, 'seven headers').to.be.at.least(7);
    // German short weekdays start with Mo, since de-DE starts the week there.
    expect(dows[0]).to.equal('Mo');
  });

  it('arc-date-picker respects first-day-of-week', async () => {
    const el = mount('<arc-date-picker label="When" locale="en-GB" first-day-of-week="7"></arc-date-picker>');
    await el.updateComplete;
    el.open = true;
    await el.updateComplete;
    await tick();

    const dows = [...el.shadowRoot.querySelectorAll('.dow, [part~="dow"], .weekday')]
      .map((n) => n.textContent.trim()).filter(Boolean);
    expect(dows[0], 'forced to Sunday despite en-GB').to.equal('Sun');
  });

  it('arc-calendar aligns day 1 under the right column', async () => {
    // 2021-08-01 was a Sunday. Week starting Monday => six leading blanks.
    const el = mount('<arc-calendar year="2021" month="7" locale="en-GB"></arc-calendar>');
    await el.updateComplete;
    // Read off the header row rather than off `_firstDay`: a calendar that
    // resolved the locale's first day and laid the grid out from a different
    // one is exactly the bug, and the field alone cannot tell them apart.
    const dows = [...el.shadowRoot.querySelectorAll('[part~="dow"]')].map((n) => n.textContent.trim());
    expect(dows[0], 'en-GB weeks start on Monday').to.equal('Mon');
    expect(el.shadowRoot.textContent).to.include('August');
  });

  it('localises the calendar title', async () => {
    const el = mount('<arc-calendar year="2021" month="7" locale="fr-FR"></arc-calendar>');
    await el.updateComplete;
    expect(el.shadowRoot.textContent).to.include('août');
  });

  it('keeps no hardcoded English date names in the sources', async () => {
    const paths = [
      'input/date-picker.js', 'input/calendar.js',
      'input/date-range-picker.js',
    ];
    for (const path of paths) {
      const src = await (await fetch(new URL(`../src/${path}`, import.meta.url))).text();
      // Month/weekday literals in an array, i.e. the four copies this replaced.
      expect(src, path).to.not.match(/\[\s*'(?:January|Jan|Su|Sun|Sunday|Monday)'/);
    }
  });
});

describe('logical properties for RTL', () => {
  // Matched against a single trimmed declaration, not against a source line.
  // The line-anchored version could only see a declaration that started its
  // line, so `.crumbs { padding-left: var(--space-md); }` written on one line
  // was invisible — eleven real violations across six components sat behind
  // that until a prettier run happened to split them onto their own lines.
  const PHYSICAL = /^(margin|padding|border)-(left|right)\s*:|^text-align\s*:\s*(left|right)$|^border-(top|bottom)-(left|right)-radius\s*:/;

  // The codemod's baseline. These are the files that keep a physical property on
  // purpose, each for a stated reason; everything else must be logical.
  const ALLOWED = [
    'shared/position-controller.js',  // JS-measured viewport coordinates
  ];

  // ~185 component files. Fetched one after another this took longer than
  // Mocha's 2s default on a CI runner — green on every developer machine, red
  // in the one place it had to be right. The fetches are now concurrent, which
  // is the actual fix; the raised timeout is only headroom for a cold runner.
  it('leaves no physical inline-axis declarations in component CSS', async function sweep() {
    this.timeout(15_000);
    const res = await fetch(new URL('../custom-elements.json', import.meta.url));
    // Fall back to a fixed sweep if the manifest is not served.
    const paths = res.ok
      ? [...new Set((await res.text()).match(/src\/[a-z-]+\/[a-z0-9-]+\.js/g) || [])]
      : [];
    expect(paths.length, 'found component paths to sweep').to.be.greaterThan(20);

    const sweepable = paths.filter((p) => !ALLOWED.some((a) => p.endsWith(a)));
    const perFile = await Promise.all(sweepable.map(async (path) => {
      const r = await fetch(new URL(`../${path}`, import.meta.url));
      if (!r.ok) return [];
      const src = await r.text();
      const found = [];
      // Read the css`…` templates as innermost selector/body pairs, so how a
      // rule is formatted cannot decide whether it is swept. Nested at-rules
      // fall out for free: [^{}]* can never span a brace, so every match is an
      // innermost block and its selector is the text since the last one.
      for (const block of src.matchAll(/\bcss`([^`]*)`/g)) {
        for (const rule of block[1].matchAll(/([^{}]*)\{([^{}]*)\}/g)) {
          const selector = rule[1].trim();
          // A rule keyed on a physical side describes that side by API
          // contract: `position="left"` means the left edge, not the start
          // edge, so its border belongs on the physical right. Same for a
          // resolved data-placement. The codemod's deliberate carve-outs.
          if (/\[(?:position|data-placement)\s*=\s*"(?:left|right)"\]/.test(selector)) continue;
          for (const raw of rule[2].split(';')) {
            const decl = raw.trim();
            if (decl && PHYSICAL.test(decl)) found.push(`${path}: ${decl};`);
          }
        }
      }
      return found;
    }));
    // Sorted so the failure message is stable rather than ordered by whichever
    // fetch happened to resolve first.
    const offenders = perFile.flat().sort();
    expect(offenders, `\n  ${offenders.join('\n  ')}\n`).to.deep.equal([]);
  });

  it('mirrors a logical inset under direction: rtl', async () => {
    // Proof the conversion does something, not just that it compiles.
    const box = document.createElement('div');
    box.style.cssText = 'position: relative; width: 200px; height: 20px;';
    const inner = document.createElement('div');
    inner.style.cssText = 'position: absolute; inset-inline-start: 0; width: 20px; height: 20px;';
    box.appendChild(inner);
    document.body.appendChild(box);

    const ltr = inner.getBoundingClientRect().left - box.getBoundingClientRect().left;
    box.style.direction = 'rtl';
    const rtl = inner.getBoundingClientRect().left - box.getBoundingClientRect().left;

    expect(ltr).to.equal(0);
    expect(rtl, 'start edge moved to the right in RTL').to.equal(180);
    cleanup();
  });

  // Column pinning was the one system left physical after the v3 sweep: sticky
  // offsets written as `left:${n}px` from JS, an edge shadow cast rightward,
  // and a scroll test of `scrollLeft > 0` that RTL's negative scrollLeft could
  // never satisfy. Converting one of those alone would have been worse than
  // leaving all three, so this asserts the unit.
  it('pins data-grid columns to the inline-start edge in both directions', async () => {
    const columns = [
      { key: 'a', label: 'A', pinned: true, width: '100px' },
      { key: 'b', label: 'B', pinned: true, width: '100px' },
      { key: 'c', label: 'C', width: '800px' },
    ];
    const grid = mount('<arc-data-grid></arc-data-grid>');
    // Narrower than the 1000px of columns, or nothing scrolls and the cells sit
    // where ordinary table layout puts them — which mirrors under RTL all by
    // itself and would let this pass with the offsets still physical.
    grid.style.width = '300px';
    grid.columns = columns;
    // Long unwrappable text, not the 800px width hint: under `table {width:100%}`
    // a width is only a suggestion and the column would compress to fit rather
    // than overflow, leaving nothing to scroll.
    grid.rows = [{ a: '1', b: '2', c: 'wide '.repeat(200) }];
    await grid.updateComplete;
    await tick();

    const wrapper = grid.shadowRoot.querySelector('.grid-wrapper');
    const cells = () => [...grid.shadowRoot.querySelectorAll('tbody td')];
    const box = () => wrapper.getBoundingClientRect();
    const startEdge = (cell) => {
      const r = cell.getBoundingClientRect();
      // Distance from the wrapper's start edge, whichever side that is.
      return grid.style.direction === 'rtl' ? box().right - r.right : r.left - box().left;
    };

    // Scrolled well past the pinned block: unpinned content has moved, so any
    // cell still at the start edge is there because it is pinned.
    wrapper.scrollLeft = 400;
    await tick();
    const [a, b, c] = cells();
    expect(startEdge(a), 'first pinned column holds the start edge').to.be.closeTo(0, 1.5);
    expect(startEdge(b), 'second pinned column clears the first').to.be.closeTo(100, 1.5);
    expect(startEdge(c), 'unpinned column scrolled away').to.be.lessThan(0);

    grid.style.direction = 'rtl';
    await grid.updateComplete;
    // RTL scrollLeft runs 0 → negative, so this is the same 400px of travel.
    wrapper.scrollLeft = -400;
    await tick();

    const [a2, b2, c2] = cells();
    expect(startEdge(a2), 'still the start edge, now on the right').to.be.closeTo(0, 1.5);
    expect(startEdge(b2), 'and still inboard of it').to.be.closeTo(100, 1.5);
    expect(startEdge(c2), 'unpinned column scrolled away').to.be.lessThan(0);

    // The edge shadow is gated on having scrolled at all, which a `> 0` test of
    // a negative scrollLeft can never satisfy. The scroll listener is passive
    // and coalesces through rAF before touching state, so settle both.
    for (let i = 0; i < 3 && !wrapper.classList.contains('scrolled-x'); i++) {
      await new Promise(requestAnimationFrame);
      await tick();
      await grid.updateComplete;
    }
    expect(wrapper.classList.contains('scrolled-x'), 'edge shadow armed under RTL').to.equal(true);

    cleanup();
  });
});
