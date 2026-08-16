/**
 * arc-diff — the line-based diff viewer.
 *
 * Written for V4-PLAN 3.2, which memoises the LCS off the render path. That
 * change is only allowed to be caller-invisible, and the component had no
 * suite at all — so this pins the output *first*: which lines appear, in what
 * order, with which numbers and which prefix, in both modes.
 *
 * The fixture is chosen so the three operation kinds interleave and the two
 * line-number series diverge. A one-line change would let a diff that reported
 * every line as unchanged pass, and a fixture whose old and new numbering
 * agree cannot tell `oldNum` from `newNum` — which is the one place
 * `_renderLine` branches.
 */
import { expect } from '@esm-bundle/chai';
import { ArcDiff } from '../src/data/diff.js';
import { mount, cleanup, settle } from './helpers.js';

if (!customElements.get('arc-diff')) {
  customElements.define('arc-diff', ArcDiff);
}

afterEach(() => cleanup());

async function diff(original, revised, attrs = '') {
  const el = mount(`<arc-diff ${attrs}></arc-diff>`);
  el.original = original;
  el.revised = revised;
  await settle(el);
  return el;
}

const lines = (el) => [...el.shadowRoot.querySelectorAll('[part="line"]')];
const panes = (el) => [...el.shadowRoot.querySelectorAll('.diff__pane')];

/** Each rendered line as `<number><prefix><text>`, which is the whole row. */
const readLines = (root) =>
  [...root.querySelectorAll('[part="line"]')].map((l) => ({
    num: l.querySelector('[part="line-number"]').textContent.trim(),
    prefix: l.querySelector('[part="prefix"]').textContent,
    text: l.querySelector('.diff__content').textContent,
    kind: [...l.classList].find((c) => c.startsWith('diff__line--'))?.replace('diff__line--', ''),
  }));

describe('arc-diff inline mode', () => {
  it('reports an unchanged file as entirely unchanged', async () => {
    const el = await diff('one\ntwo', 'one\ntwo');
    expect(readLines(el.shadowRoot)).to.deep.equal([
      { num: '1', prefix: ' ', text: 'one', kind: 'unchanged' },
      { num: '2', prefix: ' ', text: 'two', kind: 'unchanged' },
    ]);
  });

  it('places a removal before the addition that replaces it', async () => {
    // The order is the backtrack's, and it is part of the output: a reader
    // scanning the column sees what went before what arrived.
    const el = await diff('a\nb\nc', 'a\nx\nc');
    expect(readLines(el.shadowRoot)).to.deep.equal([
      { num: '1', prefix: ' ', text: 'a', kind: 'unchanged' },
      { num: '2', prefix: '-', text: 'b', kind: 'removed' },
      { num: '2', prefix: '+', text: 'x', kind: 'added' },
      { num: '3', prefix: ' ', text: 'c', kind: 'unchanged' },
    ]);
  });

  it('numbers a removal from the original and an addition from the revision', async () => {
    // Two deletions early make the two series diverge, so the numbers below
    // cannot both come from the same counter.
    const el = await diff('a\nb\nc\nd', 'a\nd\ne');
    expect(readLines(el.shadowRoot)).to.deep.equal([
      { num: '1', prefix: ' ', text: 'a', kind: 'unchanged' },
      { num: '2', prefix: '-', text: 'b', kind: 'removed' },
      { num: '3', prefix: '-', text: 'c', kind: 'removed' },
      { num: '2', prefix: ' ', text: 'd', kind: 'unchanged' },
      { num: '3', prefix: '+', text: 'e', kind: 'added' },
    ]);
  });

  it('reports a line deleted from the end as a deletion', async () => {
    // Every other fixture here either ends on a matching line or happens to
    // agree whichever way the backtrack goes, so none of them reads the last
    // column of the LCS table for a real decision — `j <= n` mutated to `j < n`
    // survived all of them. This one does not: with that column missing the
    // component reports the file as `-a +a` and never mentions `b` at all.
    const el = await diff('a\nb', 'a');
    expect(readLines(el.shadowRoot)).to.deep.equal([
      { num: '1', prefix: ' ', text: 'a', kind: 'unchanged' },
      { num: '2', prefix: '-', text: 'b', kind: 'removed' },
    ]);
  });

  it('treats an empty side as one empty line, not as no lines', async () => {
    // `''.split('\n')` is `['']`, and that is what reaches the render. Pinned
    // because it is the difference between an empty pane and a blank row.
    const el = await diff('', 'hello');
    expect(readLines(el.shadowRoot)).to.deep.equal([
      { num: '1', prefix: '-', text: '', kind: 'removed' },
      { num: '1', prefix: '+', text: 'hello', kind: 'added' },
    ]);
  });

  it('exposes the documented css parts', async () => {
    const el = await diff('a', 'b');
    for (const part of ['container', 'line', 'line-number', 'prefix']) {
      expect(el.shadowRoot.querySelector(`[part="${part}"]`), part).to.not.equal(null);
    }
  });
});

describe('arc-diff side-by-side mode', () => {
  it('keeps additions out of the left pane and removals out of the right', async () => {
    const el = await diff('a\nb\nc', 'a\nx\nc', 'mode="side-by-side"');
    const [left, right] = panes(el);

    expect(readLines(left).map((l) => l.text), 'left is the original').to.deep.equal(['a', 'b', 'c']);
    expect(readLines(right).map((l) => l.text), 'right is the revision').to.deep.equal(['a', 'x', 'c']);
    expect(readLines(left).map((l) => l.kind)).to.deep.equal(['unchanged', 'removed', 'unchanged']);
    expect(readLines(right).map((l) => l.kind)).to.deep.equal(['unchanged', 'added', 'unchanged']);
  });

  it('renders one pane in inline mode', async () => {
    const el = await diff('a\nb', 'a\nx');
    expect(panes(el)).to.have.lengthOf(0);
    expect(lines(el)).to.have.lengthOf(3);
  });
});

/**
 * V4-PLAN 3.2: the LCS is O(m x n) and `render()` used to rebuild it every
 * time, so a `mode` flip — or any parent-driven re-render — paid for the whole
 * table again on text that had not changed.
 *
 * This is a claim about work done rather than about output, so it is asserted
 * through a counter on the instance. That is the documented exception in
 * HANDOFF's testing rules: a resource claim with no rendered consequence. The
 * caller-invisible half is the whole block above, which must keep passing
 * unchanged — that is what "memoised" is allowed to mean.
 */
describe('arc-diff memoises its LCS', () => {
  /** Count `_computeDiff` calls without changing what it returns. */
  function countComputes(el) {
    const real = el._computeDiff.bind(el);
    const calls = { n: 0 };
    el._computeDiff = (...args) => {
      calls.n += 1;
      return real(...args);
    };
    return calls;
  }

  it('does not recompute when only the mode changes', async () => {
    const el = await diff('a\nb\nc', 'a\nx\nc');
    const calls = countComputes(el);

    el.mode = 'side-by-side';
    await settle(el);
    expect(calls.n, 'the text did not change').to.equal(0);

    // anti-vacuity: the mode change really did re-render
    expect(panes(el), 'and it did render side by side').to.have.lengthOf(2);
  });

  it('does not recompute on a re-render nothing changed', async () => {
    const el = await diff('a\nb\nc', 'a\nx\nc');
    const calls = countComputes(el);

    el.requestUpdate();
    await settle(el);
    expect(calls.n).to.equal(0);
  });

  it('recomputes when either side of the text changes', async () => {
    const el = await diff('a\nb\nc', 'a\nx\nc');
    const calls = countComputes(el);

    el.revised = 'a\ny\nc';
    await settle(el);
    expect(calls.n, 'a new revision is a new diff').to.equal(1);
    expect(readLines(el.shadowRoot).map((l) => l.text)).to.deep.equal(['a', 'b', 'y', 'c']);

    el.original = 'a\nq\nc';
    await settle(el);
    expect(calls.n, 'and so is a new original').to.equal(2);
    expect(readLines(el.shadowRoot).map((l) => l.text)).to.deep.equal(['a', 'q', 'y', 'c']);
  });

  it('recomputes when the text changes back to a value it held before', async () => {
    // A memo keyed on anything other than the current pair — a dirty flag, a
    // one-shot guard — passes the tests above and fails this one.
    const el = await diff('a\nb', 'a\nb');
    el.revised = 'a\nz';
    await settle(el);
    expect(readLines(el.shadowRoot).map((l) => l.text)).to.deep.equal(['a', 'b', 'z']);

    el.revised = 'a\nb';
    await settle(el);
    expect(readLines(el.shadowRoot).map((l) => l.text)).to.deep.equal(['a', 'b']);
  });
});
