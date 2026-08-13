/**
 * focus-trap.js — composed-tree focus utilities, tested directly.
 *
 * The reason this is not `shadowRoot.querySelectorAll` is the whole contract:
 * a modal's focusable elements are mostly the *consumer's*, arriving through
 * `header`/`body`/`footer` slots, with more of them inside nested component
 * shadow roots. A trap that only sees its own shadow tree traps nothing.
 *
 * Both wrap directions are exercised on purpose. `trapTabKey` is two
 * conditionals over the same index, and testing forward-from-last and
 * backward-from-first only — the obvious pair — leaves the *middle* of each
 * branch unpinned, which is exactly how range-slider's Home/End conditionals
 * both survived mutation (Home was only ever tested on the low thumb, End only
 * on the high).
 */
import { expect } from '@esm-bundle/chai';
import { mount, cleanup } from './helpers.js';
import { collectFocusable, deepActiveElement, trapTabKey, focusFirst } from '../src/shared/focus-trap.js';

afterEach(cleanup);

/** A host whose shadow tree both slots light content and nests its own buttons. */
class TrapProbe extends HTMLElement {
  connectedCallback() {
    if (this.shadowRoot) return;
    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = `
      <div class="panel">
        <button class="shadow-first">shadow-first</button>
        <slot></slot>
        <button class="shadow-last">shadow-last</button>
      </div>`;
  }
}
if (!customElements.get('arc-trap-probe')) customElements.define('arc-trap-probe', TrapProbe);

const labels = (nodes) => nodes.map((n) => n.textContent.trim());

/** Tab keydown, cancelable so defaultPrevented is readable afterwards. */
const tab = (shiftKey = false) =>
  new KeyboardEvent('keydown', { key: 'Tab', shiftKey, cancelable: true, bubbles: true });

// ---------------------------------------------------------------------------
// collectFocusable
// ---------------------------------------------------------------------------

describe('collectFocusable', () => {
  it('walks slot assignments and shadow roots in composed order', () => {
    // The ordering is the deliverable: a trap that finds the right elements in
    // the wrong order wraps to the wrong end.
    const el = mount(`
      <arc-trap-probe>
        <button>light-a</button>
        <button>light-b</button>
      </arc-trap-probe>`);

    expect(labels(collectFocusable(el.shadowRoot.querySelector('.panel')))).to.eql([
      'shadow-first',
      'light-a',
      'light-b',
      'shadow-last',
    ]);
  });

  it('descends into a nested component shadow root', () => {
    const el = mount(`
      <arc-trap-probe>
        <arc-trap-probe><button>nested-light</button></arc-trap-probe>
      </arc-trap-probe>`);

    expect(labels(collectFocusable(el.shadowRoot.querySelector('.panel')))).to.eql([
      'shadow-first',
      'shadow-first',
      'nested-light',
      'shadow-last',
      'shadow-last',
    ]);
  });

  it('skips disabled controls', () => {
    const el = mount(`
      <div>
        <button>ok</button>
        <button disabled>no</button>
        <input disabled />
      </div>`);
    expect(labels(collectFocusable(el))).to.eql(['ok']);
  });

  it('skips tabindex="-1", which is reachable by script but not by Tab', () => {
    const el = mount(`
      <div>
        <button>ok</button>
        <div tabindex="-1">programmatic only</div>
        <div tabindex="0">in the order</div>
      </div>`);
    expect(labels(collectFocusable(el))).to.eql(['ok', 'in the order']);
  });

  it('skips elements with no box', () => {
    // A hidden panel's buttons are still in the DOM. Trapping onto one of them
    // sends focus somewhere the user cannot see.
    const el = mount(`
      <div>
        <button>visible</button>
        <button style="display: none">hidden</button>
      </div>`);
    expect(labels(collectFocusable(el))).to.eql(['visible']);
  });

  it('counts a collapsed-but-rendered element as visible', () => {
    // isVisible is three ORed measurements and the third is load-bearing on its
    // own: an element laid out to zero on *both* axes still generates a client
    // rect, is still in the tab order, and trapping past it would skip a
    // control the user can reach. Every earlier visibility test here used
    // display:none, which zeroes all three at once and so cannot tell the three
    // measurements apart.
    //
    // Chosen against the mutants rather than by eye: `width:0;height:20px`
    // reads like the obvious fixture and kills nothing, because `&&` binds
    // tighter than `||` — `(0 && 20) || rects` is still truthy. Only
    // zero-on-both-axes separates `oh || rects` from `oh && rects`.
    const el = mount(`
      <div>
        <button style="width: 0; height: 0; padding: 0; border: 0; overflow: hidden">flat</button>
      </div>`);
    expect(labels(collectFocusable(el))).to.eql(['flat']);
  });

  it('finds links by href, not by tag', () => {
    const el = mount(`
      <div>
        <a href="#x">linked</a>
        <a>bare anchor</a>
      </div>`);
    expect(labels(collectFocusable(el))).to.eql(['linked']);
  });

  it('returns nothing for a container with no focusable content', () => {
    expect(collectFocusable(mount('<div><p>text</p></div>'))).to.eql([]);
  });
});

// ---------------------------------------------------------------------------
// deepActiveElement
// ---------------------------------------------------------------------------

describe('deepActiveElement', () => {
  it('reports the real element through a shadow boundary', () => {
    const el = mount('<arc-trap-probe></arc-trap-probe>');
    const inner = el.shadowRoot.querySelector('.shadow-first');
    inner.focus();

    expect(document.activeElement === el, 'the document only sees the host').to.equal(true);
    expect(deepActiveElement() === inner, 'the util sees through it').to.equal(true);
  });
});

// ---------------------------------------------------------------------------
// trapTabKey — both directions, and the middle of both
// ---------------------------------------------------------------------------

describe('trapTabKey', () => {
  const panel = () =>
    mount(`
      <div>
        <button>first</button>
        <button>middle</button>
        <button>last</button>
      </div>`);

  it('wraps forward from the last element to the first', () => {
    const el = panel();
    const [first, , last] = collectFocusable(el);
    last.focus();

    const e = tab();
    trapTabKey(e, el);

    expect(e.defaultPrevented, 'the browser must not take focus out').to.equal(true);
    expect(deepActiveElement() === first).to.equal(true);
  });

  it('wraps backward from the first element to the last', () => {
    const el = panel();
    const [first, , last] = collectFocusable(el);
    first.focus();

    const e = tab(true);
    trapTabKey(e, el);

    expect(e.defaultPrevented).to.equal(true);
    expect(deepActiveElement() === last).to.equal(true);
  });

  it('leaves a forward Tab in the middle to the browser', () => {
    const el = panel();
    const [, middle] = collectFocusable(el);
    middle.focus();

    const e = tab();
    trapTabKey(e, el);

    expect(e.defaultPrevented, 'native Tab ordering is not ours to reimplement').to.equal(false);
    expect(deepActiveElement() === middle, 'focus is left where it was').to.equal(true);
  });

  it('leaves a backward Tab in the middle to the browser', () => {
    const el = panel();
    const [, middle] = collectFocusable(el);
    middle.focus();

    const e = tab(true);
    trapTabKey(e, el);

    expect(e.defaultPrevented).to.equal(false);
    expect(deepActiveElement() === middle).to.equal(true);
  });

  it('pulls focus in when it is currently outside the container', () => {
    // The idx === -1 branch: focus somewhere else on the page entirely, which
    // is where an overlay opened without focusing itself leaves it.
    const outside = mount('<button>outside</button>');
    const el = panel();
    outside.focus();

    const e = tab();
    trapTabKey(e, el);

    expect(e.defaultPrevented).to.equal(true);
    expect(deepActiveElement() === collectFocusable(el)[0]).to.equal(true);
  });

  it('swallows Tab in a container with nothing focusable', () => {
    // Nowhere to send focus, so the only correct move is to keep it from
    // leaving — otherwise Tab escapes the modal to the page behind it.
    const el = mount('<div><p>nothing here</p></div>');
    const e = tab();
    trapTabKey(e, el);

    expect(e.defaultPrevented).to.equal(true);
  });
});

// ---------------------------------------------------------------------------
// focusFirst
// ---------------------------------------------------------------------------

describe('focusFirst', () => {
  it('focuses the first focusable element', () => {
    const el = mount('<div><button>first</button><button>second</button></div>');
    focusFirst(el);
    expect(deepActiveElement().textContent).to.equal('first');
  });

  it('falls back to the container, making it focusable to do so', () => {
    // An empty dialog still has to take focus, or the screen reader stays on
    // whatever was behind it.
    const el = mount('<div><p>just text</p></div>');
    focusFirst(el);

    expect(el.tabIndex, 'programmatic only — it must not join the Tab order').to.equal(-1);
    expect(deepActiveElement() === el).to.equal(true);
  });
});
