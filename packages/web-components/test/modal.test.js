/**
 * arc-modal, and what moving to `<dialog>` is supposed to have bought.
 *
 * V4-PLAN 4.4 replaced a hand-rolled Tab trap, focus restore, Escape listener
 * and `z-index: var(--z-modal)` with `showModal()`. The claim is not "it still
 * works" — it is that several things which were *not* true before are true now,
 * and those are what this file asserts. A suite that only re-checked the old
 * behaviour would pass just as well against the old implementation and would
 * not be evidence of anything.
 */
import { expect } from '@esm-bundle/chai';
import '../src/feedback/modal.register.js';
import { deepActive, mount, cleanup, tick, nextFrame } from './helpers.js';

/**
 * Escape, as the component can actually observe it.
 *
 * A synthetic KeyboardEvent no longer reaches this: closing a modal `<dialog>`
 * on Escape is done by the user agent, which fires `cancel` on the element, and
 * no dispatched keydown produces that. Losing the ability to test Escape with a
 * fake key press is a real consequence of the move and worth stating rather
 * than working around — what the library owns is what happens *when* cancel
 * arrives, and that is exactly what dispatching it tests. Whether Escape
 * produces a cancel is the platform's guarantee, not ours.
 */
function escape(el) {
  el.shadowRoot.querySelector('dialog').dispatchEvent(new Event('cancel', { cancelable: true }));
}

async function mountModal(attrs = '') {
  const el = mount(`
    <arc-modal heading="Test modal" ${attrs}>
      <p>Body</p>
      <button id="in-modal">Action</button>
    </arc-modal>
  `);
  await el.updateComplete;
  return el;
}

const dialogOf = (el) => el.shadowRoot.querySelector('dialog');

async function openModal(attrs = '') {
  const el = await mountModal(attrs);
  el.open = true;
  await el.updateComplete;
  await tick();
  return el;
}

describe('arc-modal focus management', () => {
  afterEach(cleanup);

  it('moves focus into the dialog when opened', async () => {
    const el = await openModal();
    const active = deepActive();
    expect(active).to.not.equal(document.body);
    // Containment must follow the composed tree: since arc-icon-button became
    // a registered dependency of the modal, first focus lands on the close
    // button *inside its shadow root*, which neither contains() can see.
    let insideModal = false;
    for (let node = active; node; node = node.getRootNode().host ?? null) {
      if (el.contains(node) || el.shadowRoot.contains(node)) {
        insideModal = true;
        break;
      }
    }
    expect(insideModal, `active element <${active.tagName}> should be inside the modal`).to.equal(
      true,
    );
  });

  it('restores focus to the opener when closed', async () => {
    // Hand-rolled before, as a stored `__previousFocus` that went stale if the
    // element moved. The browser owns it now, so the assertion is about the
    // platform doing it rather than about our bookkeeping being right.
    const opener = document.createElement('button');
    document.body.append(opener);
    opener.focus();

    const el = await openModal();
    expect(deepActive()).to.not.equal(opener);

    el.open = false;
    await el.updateComplete;
    await tick();
    expect(deepActive(), 'focus goes back where it came from').to.equal(opener);
    opener.remove();
  });

  it('is usable the moment open is set, without waiting out a transition', async () => {
    // The old implementation transitioned `visibility`, and this test existed
    // because a delayed visibility made the panel unfocusable for the length of
    // the animation. The <dialog> equivalent of "usable now" is being in the
    // top layer now, which is what `open` on the element means.
    const el = await mountModal();
    el.open = true;
    await el.updateComplete;
    expect(dialogOf(el).open, 'the dialog is in the top layer on the same turn').to.equal(true);
  });
});

describe('arc-modal is a modal', () => {
  afterEach(cleanup);

  it('makes the rest of the document inert, not merely untabbable', async () => {
    // The thing a Tab trap never did. `inert` is what stops a click landing on
    // a button behind the scrim and what stops a screen reader's virtual cursor
    // walking into the page, and neither is a keyboard concern.
    const outside = document.createElement('button');
    outside.id = 'outside';
    document.body.append(outside);

    const el = await openModal();
    let clicked = false;
    outside.addEventListener('click', () => (clicked = true));
    outside.click();
    expect(clicked, 'a synthetic click still dispatches — that is not what inert changes').to.equal(
      true,
    );
    // What inert does change: the element is no longer focusable.
    outside.focus();
    expect(deepActive(), 'the background cannot take focus while a modal is open').to.not.equal(
      outside,
    );
    outside.remove();
  });

  it('does not lose to a stacking context around it', async () => {
    // Findings #31 and #67, structurally. A z-index ladder loses to any
    // ancestor that creates a stacking context; the top layer does not
    // participate in stacking at all.
    const host = document.createElement('div');
    host.style.cssText = 'position: relative; z-index: 0; transform: translateZ(0);';
    document.body.append(host);
    const el = document.createElement('arc-modal');
    host.append(el);
    await el.updateComplete;
    el.open = true;
    await el.updateComplete;

    const dialog = dialogOf(el);
    const box = dialog.getBoundingClientRect();
    const hit = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
    expect(hit, 'the panel is the topmost thing at its own centre').to.equal(el);
    host.remove();
  });
});

describe('arc-modal dismissal', () => {
  afterEach(cleanup);

  it('closes on Escape', async () => {
    const el = await openModal();
    escape(el);
    await el.updateComplete;
    expect(el.open).to.equal(false);
  });

  it('refuses Escape when it is not dismissible', async () => {
    // The reason OverlayController cancels the browser's own close rather than
    // letting it through: `dismissible=false` has to be able to refuse, and a
    // dialog that closed and reopened would flash.
    const el = await openModal('no-dismissible');
    escape(el);
    await el.updateComplete;
    expect(el.open, 'an undismissable modal stays open').to.equal(true);
    expect(dialogOf(el).open, 'and stays in the top layer').to.equal(true);
  });

  it('lets a consumer veto a close through arc-close', async () => {
    const el = await openModal();
    el.addEventListener('arc-close', (e) => e.preventDefault());
    escape(el);
    await el.updateComplete;
    expect(el.open).to.equal(true);
  });

  it('closes on a backdrop click and not on a click inside', async () => {
    const el = await openModal();
    const dialog = dialogOf(el);

    el.querySelector('#in-modal').click();
    await el.updateComplete;
    expect(el.open, 'a click on the content is not a dismissal').to.equal(true);

    // A click on ::backdrop is dispatched to the dialog element itself, which
    // is what makes `target === dialog` mean "outside the content".
    dialog.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));
    await el.updateComplete;
    expect(el.open).to.equal(false);
  });

  it('reconciles open when something closes the dialog directly', async () => {
    // A <form method="dialog"> inside the modal, or a stray dialog.close().
    // Leaving `open` true would make the property lie until the next render.
    const el = await openModal();
    dialogOf(el).close();
    // `close()` shuts the dialog synchronously but fires its `close` event from
    // a queued task that lands *after* a same-turn setTimeout(0), so one tick
    // is not enough to observe the reconciliation. A frame is.
    await nextFrame();
    await el.updateComplete;
    expect(el.open).to.equal(false);
  });
});
