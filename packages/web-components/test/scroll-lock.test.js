/**
 * scroll-lock.js — body scroll locking with per-owner tracking, tested directly.
 *
 * Twenty-five lines carrying five overlays, and the whole point is the
 * refcount: modal, sheet, drawer, lightbox and command-palette can be open at
 * once, and body overflow must be restored only when the *last* one lets go.
 * A naive lock/unlock pair leaves the page unscrollable behind a still-open
 * overlay, or unlocks it under one.
 *
 * `savedOverflow` is module state, so every test here restores it explicitly —
 * a leaked lock would leave `body { overflow: hidden }` for the rest of the
 * file and quietly change what every later test measures.
 */
import { expect } from '@esm-bundle/chai';
import { lockScroll, unlockScroll } from '../src/shared/scroll-lock.js';

/** Owners taken during a test, released in afterEach whatever the outcome. */
let owners = [];
const owner = (name) => {
  const o = { name };
  owners.push(o);
  return o;
};

afterEach(() => {
  for (const o of owners) unlockScroll(o);
  owners = [];
  document.body.style.overflow = '';
});

describe('scroll-lock', () => {
  it('locks the body on the first owner', () => {
    lockScroll(owner('a'));
    expect(document.body.style.overflow).to.equal('hidden');
  });

  it('restores only when the last owner releases', () => {
    // The reason this file exists. Two overlays open; closing one must not
    // hand scrolling back to the page while the other is still up.
    const a = owner('a');
    const b = owner('b');
    lockScroll(a);
    lockScroll(b);

    unlockScroll(a);
    expect(document.body.style.overflow, 'still locked for b').to.equal('hidden');

    unlockScroll(b);
    expect(document.body.style.overflow, 'released by the last owner').to.equal('');
  });

  it('round-trips whatever the page had set before the first lock', () => {
    // Deliberately not the default: '' in and '' out is a round-trip that
    // cannot fail, and would pass on an implementation that just clears the
    // property. This is the observable-value rule from the range-slider
    // fixtures.
    document.body.style.overflow = 'scroll';
    const a = owner('a');

    lockScroll(a);
    expect(document.body.style.overflow).to.equal('hidden');

    unlockScroll(a);
    expect(document.body.style.overflow, 'the page keeps its own overflow').to.equal('scroll');
  });

  it('does not re-read the page overflow while a lock is held', () => {
    // Second lock must not overwrite savedOverflow with 'hidden' — that is how
    // a refcounted lock ends up unable to restore anything.
    document.body.style.overflow = 'scroll';
    const a = owner('a');
    const b = owner('b');

    lockScroll(a);
    lockScroll(b);
    unlockScroll(a);
    unlockScroll(b);

    expect(document.body.style.overflow).to.equal('scroll');
  });

  it('is idempotent per owner', () => {
    // Overlays call lockScroll from updated(), which can run repeatedly while
    // open. Two locks by one owner must still take one unlock to release.
    document.body.style.overflow = 'scroll';
    const a = owner('a');

    lockScroll(a);
    lockScroll(a);
    unlockScroll(a);

    expect(document.body.style.overflow).to.equal('scroll');
  });

  it('ignores an unlock from something that never locked', () => {
    // Components call unlockScroll() on close *and* on disconnect, so the
    // second call is routinely a no-op — it must not release someone else's
    // lock. This is the `if (!locks.delete(owner)) return` guard.
    const a = owner('a');
    lockScroll(a);

    unlockScroll(owner('stranger'));
    expect(document.body.style.overflow, "a stranger cannot release a's lock").to.equal('hidden');
  });

  it('an unlock with no locks held at all does nothing', () => {
    document.body.style.overflow = 'scroll';
    unlockScroll(owner('nobody'));
    expect(document.body.style.overflow).to.equal('scroll');
  });
});
