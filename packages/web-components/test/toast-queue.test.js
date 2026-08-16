import { expect } from '@esm-bundle/chai';
import '../src/feedback/toast.register.js';
import { mount, cleanup, tick } from './helpers.js';

/**
 * arc-toast absorbed the stacking policy that used to live in arc-toast-manager.
 *
 * The merge is what makes dedupe an in-place update: as a separate component the
 * manager could only reach arc-toast's public surface, so a duplicate of a
 * *visible* toast had to be dismissed and re-shown to gain its "(×N)" suffix.
 */
async function mountToast(attrs = '') {
  const el = mount(`<arc-toast ${attrs}></arc-toast>`);
  await el.updateComplete;
  return el;
}

/**
 * Wait for a dismissal to actually complete.
 *
 * _dismiss() animates the toast out and only drops it on animationend, with a
 * 300ms safety fallback for prefers-reduced-motion — so a single microtask tick
 * is not enough to observe the removal.
 */
async function until(predicate, label, timeout = 600) {
  const deadline = performance.now() + timeout;
  while (performance.now() < deadline) {
    if (predicate()) return;
    await new Promise((r) => setTimeout(r, 16));
  }
  throw new Error(`timed out waiting for: ${label}`);
}

function messages(el) {
  return [...el.shadowRoot.querySelectorAll('.toast__message')].map((n) => n.textContent.trim());
}

/**
 * How deep the queue is, per the component's own announcement.
 *
 * `_queue` is state and the queue is the one part of this component that is
 * deliberately *not* rendered — which is exactly why `arc-queue-change` exists.
 * Reading the counts off the event is reading the published contract; reading
 * the array is reading the implementation of it.
 */
function counts(el) {
  const seen = [];
  el.addEventListener('arc-queue-change', (e) => seen.push(e.detail));
  return {
    latest: () => seen.at(-1) ?? { visible: 0, queued: 0 },
    all: seen,
  };
}

describe('arc-toast: visible cap and FIFO queue', () => {
  afterEach(cleanup);

  it('caps visible toasts at maxVisible and queues the rest', async () => {
    const el = await mountToast('max-visible="2" duration="0"');
    const q = counts(el);
    for (const m of ['one', 'two', 'three']) el.show({ message: m });
    await el.updateComplete;

    expect(messages(el)).to.deep.equal(['one', 'two']);
    expect(q.latest(), 'third is queued').to.deep.equal({ visible: 2, queued: 1 });
  });

  it('releases a queued toast when a visible one is dismissed', async () => {
    const el = await mountToast('max-visible="1" duration="0"');
    const q = counts(el);
    const first = el.show({ message: 'one' });
    el.show({ message: 'two' });
    await el.updateComplete;
    expect(messages(el)).to.deep.equal(['one']);

    el.dismiss(first);
    await until(() => messages(el).join() === 'two', 'queued toast released');
    expect(q.latest()).to.deep.equal({ visible: 1, queued: 0 });
  });

  it('treats maxVisible 0 as no cap', async () => {
    const el = await mountToast('max-visible="0" duration="0"');
    for (const m of ['a', 'b', 'c', 'd']) el.show({ message: m });
    await el.updateComplete;
    expect(messages(el)).to.have.lengthOf(4);
  });

  it('drops the oldest queued entries past queueLimit and reports it', async () => {
    const el = await mountToast('max-visible="1" queue-limit="2" duration="0"');
    let dropped = 0;
    el.addEventListener('arc-queue-overflow', (e) => { dropped += e.detail.dropped; });

    const q = counts(el);
    for (const m of ['v', 'q1', 'q2', 'q3']) el.show({ message: m });
    await el.updateComplete;

    expect(q.latest().queued, 'queue held at the limit').to.equal(2);
    expect(dropped).to.equal(1);

    // Which two survived, shown rather than inspected: clearing the screen
    // releases them in order, and `q1` — the dropped one — never appears.
    const dismissVisible = () =>
      el.shadowRoot.querySelector('[part="dismiss"]').click();

    dismissVisible();
    await until(() => messages(el).join() === 'q2', 'q2 released first');
    dismissVisible();
    await until(() => messages(el).join() === 'q3', 'then q3');
    dismissVisible();
    await until(() => messages(el).length === 0, 'and nothing else was queued');
  });

  it('reports visible and queued counts as they change', async () => {
    const el = await mountToast('max-visible="1" duration="0"');
    const seen = [];
    el.addEventListener('arc-queue-change', (e) => { seen.push(e.detail); });

    el.show({ message: 'one' });
    el.show({ message: 'two' });
    await el.updateComplete;

    expect(seen.at(-1)).to.deep.equal({ visible: 1, queued: 1 });
  });

  it('clear() empties the screen and the queue', async () => {
    const el = await mountToast('max-visible="1" duration="0"');
    el.show({ message: 'one' });
    el.show({ message: 'two' });
    await el.updateComplete;

    const q = counts(el);
    el.clear();
    await until(() => messages(el).length === 0, 'screen emptied');
    expect(q.latest()).to.deep.equal({ visible: 0, queued: 0 });
  });
});

describe('arc-toast: dedupe', () => {
  afterEach(cleanup);

  it('coalesces a repeat of a visible toast in place', async () => {
    // The point of the merge: one toast, a counter, no dismiss-and-re-show.
    const el = await mountToast('duration="0"');
    const id = el.show({ message: 'Saved' });
    const again = el.show({ message: 'Saved' });
    await el.updateComplete;

    expect(messages(el), 'still one toast').to.deep.equal(['Saved (×2)']);
    expect(again, 'returns the id it merged into').to.equal(id);
  });

  it('keeps counting past two', async () => {
    const el = await mountToast('duration="0"');
    for (let i = 0; i < 4; i++) el.show({ message: 'Saved' });
    await el.updateComplete;
    expect(messages(el)).to.deep.equal(['Saved (×4)']);
  });

  it('does not coalesce across variants', async () => {
    const el = await mountToast('duration="0"');
    el.show({ message: 'Same', variant: 'info' });
    el.show({ message: 'Same', variant: 'error' });
    await el.updateComplete;
    expect(messages(el)).to.have.lengthOf(2);
  });

  it('coalesces into a queued toast too', async () => {
    const el = await mountToast('max-visible="1" duration="0"');
    const q = counts(el);
    el.show({ message: 'visible' });
    const queued = el.show({ message: 'queued' });
    const dup = el.show({ message: 'queued' });
    await el.updateComplete;

    expect(dup, 'the same id came back').to.equal(queued);
    expect(q.latest().queued, 'one queued entry, not two').to.equal(1);

    // And it was counted twice, which shows when it reaches the screen: the
    // "(×N)" suffix is what coalescing is *for*, so releasing the queue is the
    // honest way to ask whether the count survived.
    el.shadowRoot.querySelector('[part="dismiss"]').click();
    await until(() => messages(el).join() === 'queued (×2)', 'released with its count');
  });

  it('can be turned off', async () => {
    const el = await mountToast('duration="0"');
    el.dedupe = false;
    el.show({ message: 'Saved' });
    el.show({ message: 'Saved' });
    await el.updateComplete;
    expect(messages(el)).to.deep.equal(['Saved', 'Saved']);
  });

  it('restarts the timer on a visible duplicate', async () => {
    // A message that keeps repeating should stay on screen while it repeats.
    const el = await mountToast('duration="80"');
    el.show({ message: 'Retrying' });
    await new Promise((r) => setTimeout(r, 50));
    el.show({ message: 'Retrying' });
    await new Promise((r) => setTimeout(r, 50));

    // Past the original 80ms deadline, but the duplicate reset it.
    expect(messages(el), 'still showing').to.deep.equal(['Retrying (×2)']);
  });
});

describe('arc-toast: the document event channel', () => {
  afterEach(cleanup);

  it('shows a toast raised as a document-level arc-toast event', async () => {
    // Lets any component raise a toast without holding a reference.
    const el = await mountToast('duration="0"');
    document.dispatchEvent(new CustomEvent('arc-toast', { detail: { message: 'from anywhere' } }));
    await el.updateComplete;
    expect(messages(el)).to.deep.equal(['from anywhere']);
  });

  it('stops listening once disconnected', async () => {
    const el = await mountToast('duration="0"');
    el.remove();
    await tick();
    document.dispatchEvent(new CustomEvent('arc-toast', { detail: { message: 'ignored' } }));
    await tick();
    expect(messages(el)).to.deep.equal([]);
  });
});

describe('arc-toast-manager is gone', () => {
  it('is no longer a defined element', () => {
    // Folded into arc-toast: a queueing policy layer that could not reach the
    // render state it was managing.
    expect(customElements.get('arc-toast-manager')).to.equal(undefined);
  });
});
