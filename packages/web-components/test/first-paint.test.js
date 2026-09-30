/**
 * The server's first paint is the paint: every component's docs preview,
 * server-rendered, must look the same before its JavaScript arrives as after.
 *
 * Each preview is planted as the browser would parse it (declarative shadow
 * DOM attached, nothing defined), measured, then every component is defined
 * and hydrates, and it is measured again. A box that changes size or text
 * that changes is a layout shift on every server-rendered page using that
 * component, and a hydration error is a tree Lit threw away and redrew.
 *
 * Found from arclight.build (4.9.0): arc-breadcrumb and arc-navigation-menu
 * served empty frames because they build their shadow trees from their
 * children, which lit-ssr never gave them. The previews come from
 * test/ssr-previews.mjs through the plugin in web-test-runner.config.mjs.
 */
import { expect } from '@esm-bundle/chai';
// Before any component module, as a consumer must.
import '../src/hydrate.js';
import body from '/__ssr-previews.js';

/**
 * Where the first paint and the hydrated one may differ, and why. Each entry is
 * a known gap, not a pass: remove it when the gap closes, and the test then
 * holds it closed.
 */
const KNOWN = {
  'arc-activity-heatmap':
    'With no end-date the grid ends today, which only the browser knows; pinned, it renders the same on both sides (documented on the component).',
  'arc-clock': 'The time of day. The server draws the placeholder, the browser the time.',
};

/** Rounding: a box a pixel taller after hydration isn't a shift anyone sees. */
const TOLERANCE = 2;
const sizeOf = (size) => size.split('x').map(Number);
const sameSize = (a, b) => sizeOf(a).every((n, i) => Math.abs(n - sizeOf(b)[i]) <= TOLERANCE);

/** Every element's box and the preview's visible text, shadow roots included. */
function measure(frame) {
  const boxes = [];
  const walk = (root) => {
    for (const el of root.querySelectorAll('*')) {
      if (el.localName === 'template' || el.localName === 'style' || el.localName === 'link')
        continue;
      const r = el.getBoundingClientRect();
      boxes.push(
        `${el.localName}${el.className && typeof el.className === 'string' ? '.' + el.className.split(' ')[0] : ''} ${Math.round(r.width)}x${Math.round(r.height)}`,
      );
      if (el.shadowRoot) walk(el.shadowRoot);
    }
  };
  walk(frame);
  const host = frame.getBoundingClientRect();
  return {
    size: `${Math.round(host.width)}x${Math.round(host.height)}`,
    text: frame.innerText.replace(/\s+/g, ' ').trim(),
    boxes,
  };
}

describe('first paint', () => {
  it('matches the hydrated paint for every docs preview', async function () {
    this.timeout(120000);
    const problems = [];
    const logs = [];
    // Which component threw: the first Arc class in the stack.
    const owner = (args) => {
      const stack = args.find((x) => x?.stack)?.stack ?? '';
      return /at (Arc\w+)\./.exec(stack)?.[1] ?? '?';
    };
    const record =
      (level) =>
      (...args) =>
        logs.push(`${level} [${owner(args)}]: ${args.map(String).join(' ')}`);
    const saved = { error: console.error, warn: console.warn };
    console.error = record('error');
    console.warn = record('warn');
    // A hydration mismatch throws from an update, which lands as an uncaught
    // error; collect it with the rest instead of letting it end the test.
    const onError = (e) => {
      logs.push(`uncaught [${owner([e.error])}]: ${e.message}`);
      e.stopImmediatePropagation();
      e.preventDefault();
    };
    const savedOnError = window.onerror;
    window.onerror = null;
    window.addEventListener('error', onError, true);

    const frames = {};
    try {
      // As a server-rendered page arrives: base.css linked, the root marked.
      // base.css is what keeps a closed overlay's contents out of the paint.
      document.documentElement.setAttribute('data-arc-ssr', '');
      const base = document.createElement('link');
      base.rel = 'stylesheet';
      base.href = new URL('../../../shared/base.css', import.meta.url).href;
      document.head.append(base);
      await new Promise((r) => base.addEventListener('load', r, { once: true }));

      const page = document.createElement('div');
      page.setHTMLUnsafe(body);
      document.body.append(page);
      for (const frame of page.querySelectorAll(':scope > section[data-arc-preview]')) {
        // Its own layout and paint box, so a fixed or absolutely placed part
        // of one preview can't move another.
        frame.style.cssText =
          'width:800px;contain:layout paint;position:relative;margin-bottom:24px';
        frames[frame.dataset.arcPreview] = frame;
      }
      // The shadow roots link their stylesheets rather than inlining them, as
      // a real server render does: let every one load before the first read.
      const links = [];
      const collectLinks = (root) => {
        for (const el of root.querySelectorAll('*')) {
          if (el.localName === 'link' && el.rel === 'stylesheet') links.push(el);
          if (el.shadowRoot) collectLinks(el.shadowRoot);
        }
      };
      collectLinks(page);
      await Promise.all(
        links.map((l) =>
          l.sheet
            ? null
            : new Promise((r) => {
                l.addEventListener('load', r, { once: true });
                l.addEventListener('error', r, { once: true });
              }),
        ),
      );
      // A link can report a sheet before it has applied; give styling a beat.
      await new Promise((r) => setTimeout(r, 300));
      for (let i = 0; i < 2; i++) await new Promise((r) => requestAnimationFrame(r));
      const before = Object.fromEntries(
        Object.entries(frames).map(([tag, f]) => [tag, measure(f)]),
      );

      await import('/__register-all.js');
      // An update that throws (a hydration mismatch does) rejects its
      // updateComplete: record it against its element and carry on.
      const pending = [];
      const collectUpdating = (root) => {
        for (const el of root.querySelectorAll('*')) {
          if (el.updateComplete) pending.push(el);
          if (el.shadowRoot) collectUpdating(el.shadowRoot);
        }
      };
      collectUpdating(page);
      const settled = await Promise.allSettled(pending.map((el) => el.updateComplete));
      settled.forEach((r, i) => {
        if (r.status === 'rejected') {
          const host = pending[i].closest('section[data-arc-preview]')?.dataset.arcPreview;
          logs.push(
            `error [${pending[i].localName} in ${host ?? '?'}]: ${r.reason?.message ?? r.reason}`,
          );
        }
      });
      for (let i = 0; i < 5; i++) await new Promise((r) => requestAnimationFrame(r));

      for (const [tag, frame] of Object.entries(frames)) {
        const a = before[tag];
        const b = measure(frame);
        const diffs = [];
        if (!sameSize(a.size, b.size)) {
          // Name the first boxes that moved, which is where to look.
          const moved = a.boxes
            .map((box, i) => [box, b.boxes[i]])
            .filter(([x, y]) => x !== y)
            .slice(0, 2);
          diffs.push(
            `size ${a.size} -> ${b.size} (${moved.map(([x, y]) => `${x} -> ${y}`).join(', ')})`,
          );
        }
        if (a.text !== b.text)
          diffs.push(`text "${a.text.slice(0, 60)}" -> "${b.text.slice(0, 60)}"`);
        if (diffs.length && !KNOWN[tag]) problems.push(`${tag}: ${diffs.join('; ')}`);
        if (!diffs.length && KNOWN[tag])
          problems.push(`${tag}: listed in KNOWN but now matches; remove it`);
      }
    } finally {
      console.error = saved.error;
      console.warn = saved.warn;
      window.removeEventListener('error', onError, true);
      window.onerror = savedOnError;
    }

    const hydration = logs.filter((l) => /hydrat|lit-part|Unexpected|mismatch/i.test(l));
    for (const l of hydration) problems.push(l.slice(0, 300));
    expect(problems, problems.join('\n')).to.deep.equal([]);
  });
});
