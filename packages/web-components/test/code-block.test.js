/**
 * arc-code-block — the overflow measurement.
 *
 * This closes the one gap left open by the ResizeObserver sweep (finding #55).
 * The component decides between two presentations of its copy button from a
 * single measurement — `scrollWidth > clientWidth` on the body — so the question
 * that matters is not *whether* it measures but *when*, and there are three
 * independent triggers that each cover a different way the answer can change:
 *
 *   - the container resizes            → the ResizeObserver
 *   - the highlighted markup lands     → `_highlightedHtml` changed
 *   - the code itself changed          → added for #69
 *
 * The third looks redundant next to the other two and is not, which is why each
 * gets its own test rather than one "it measures overflow".
 *
 * Everything here runs without a `language`, deliberately: that is the path
 * where highlighting never resolves, `_highlightedHtml` stays `''`, and the
 * measurement has to come from somewhere else. With a language the bug is
 * masked by the re-highlight.
 */
import { expect } from '@esm-bundle/chai';
import { mount, cleanup, settle, until } from './helpers.js';

import '../src/typography/code-block.register.js';

afterEach(() => cleanup());

const LONG = 'x'.repeat(500);
const SHORT = 'hi';

/** A block in a fixed-width box, so overflow is decided by the code alone. */
async function block(width = '200px', code = '') {
  const box = mount(`<div style="width:${width}"><arc-code-block></arc-code-block></div>`);
  const el = box.querySelector('arc-code-block');
  if (code) el.code = code;
  await settle(el);
  return { box, el };
}

/** Overflow is measured off layout and applied through reactive state. */
/**
 * Whether the block is showing itself as horizontally overflowing.
 *
 * Read off the class the state drives — `copy--quiet` moves the copy button
 * out of the way of a scrollbar. `_overflows` is state, and the whole point of
 * the finding this file pins is that the state got *stuck*, which only matters
 * because it was visible.
 */
const overflowing = (el) =>
  el.shadowRoot.querySelector('.code-block__copy')?.classList.contains('code-block__copy--quiet') ?? false;
const copyButton = (el) => el.shadowRoot.querySelector('.code-block__copy');

describe('arc-code-block overflow measurement', () => {
  it('reports no overflow for code that fits', async () => {
    const { el } = await block('400px', SHORT);
    expect(await until(() => overflowing(el) === false)).to.equal(true);
  });

  it('reports overflow for code that does not', async () => {
    const { el } = await block('200px', LONG);
    expect(await until(() => overflowing(el) === true)).to.equal(true);
  });

  it('re-measures when the container narrows', async () => {
    // The ResizeObserver's own job, and the trigger that already worked.
    const { box, el } = await block('800px', 'y'.repeat(80));
    expect(await until(() => overflowing(el) === false), 'overflowed while wide').to.equal(true);

    box.style.width = '120px';
    expect(await until(() => overflowing(el) === true)).to.equal(true);
  });

  it('re-measures when the container widens again', async () => {
    const { box, el } = await block('120px', 'y'.repeat(80));
    await until(() => overflowing(el) === true);

    box.style.width = '900px';
    expect(await until(() => overflowing(el) === false)).to.equal(true);
  });

  /**
   * Finding #69. Replacing long code with short code changes neither trigger the
   * component had: the body's *box* is unchanged — same height, same
   * container-constrained width — so the ResizeObserver does not fire, and with
   * no `language` the highlighted markup stays `''`, so that does not change
   * either. `_overflows` stayed true and the copy button stayed in its quiet
   * state on a block that now fits comfortably.
   *
   * The reverse direction passed throughout, which is why the gap was recorded
   * in the handoff as a suspicion about `_highlight()` rather than as this.
   */
  it('re-measures when long code is replaced with short code', async () => {
    const { el } = await block('200px', LONG);
    expect(await until(() => overflowing(el) === true), 'never overflowed').to.equal(true);

    el.code = SHORT;
    expect(await until(() => overflowing(el) === false)).to.equal(true);
  });

  it('re-measures when short code is replaced with long code', async () => {
    // The direction that already worked — kept as the control, so a regression
    // in the new trigger cannot be mistaken for the measurement being broken.
    const { el } = await block('200px', SHORT);
    await until(() => overflowing(el) === false);

    el.code = LONG;
    expect(await until(() => overflowing(el) === true)).to.equal(true);
  });

  it('measures once the block first renders, not only after a change', async () => {
    const { el } = await block('200px', LONG);
    expect(await until(() => overflowing(el) === true)).to.equal(true);
  });
});

describe('arc-code-block copy affordance', () => {
  it('is quiet only while the code can scroll under it', async () => {
    // The whole reason the measurement exists: a button that cannot be scrolled
    // beneath has no reason to hide, and one that can does.
    const { el } = await block('200px', LONG);
    await until(() => overflowing(el) === true);
    expect(copyButton(el).classList.contains('code-block__copy--quiet')).to.equal(true);

    el.code = SHORT;
    await until(() => overflowing(el) === false);
    expect(
      copyButton(el).classList.contains('code-block__copy--quiet'),
      'stayed quiet on a block that now fits',
    ).to.equal(false);
  });

  it('centres itself on a single line', async () => {
    const { el } = await block('400px', SHORT);
    await settle(el);
    expect(copyButton(el).classList.contains('code-block__copy--centered')).to.equal(true);
  });

  it('does not centre on multiple lines', async () => {
    const { el } = await block('400px', 'one\ntwo\nthree');
    await settle(el);
    expect(copyButton(el).classList.contains('code-block__copy--centered')).to.equal(false);
  });
});
