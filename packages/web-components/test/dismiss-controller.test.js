/**
 * DismissController — the shared "the user has left" layer, tested directly.
 *
 * Seventeen components sit on this file and none of them tested it: it was
 * covered only by inference, through whichever component's own suite happened
 * to click outside a panel. That is the same posture `props.js` was in before
 * `props.test.js`, and it has the same cost — a break here surfaces as a
 * scattering of unrelated component failures, none of which names this file.
 *
 * Two things pinned here are decisions rather than behaviour, and exist to stop
 * a future reader "fixing" them:
 *
 *   - **A null `focusout.relatedTarget` is ignored.** Reading through to
 *     `document.activeElement` was tried twice and broke 16 then 11 tests
 *     (finding #60). The header of dismiss-controller.js has the full argument.
 *     The test below asserts the null case is ignored *and*, on the same
 *     fixture, that a real outside relatedTarget still dismisses — otherwise
 *     the negative would pass on a controller that had simply stopped working.
 *   - **A boundary resolving to nothing means there is no inside**, so every
 *     pointer is outside. That is the right reading for arc-spotlight, whose
 *     highlighted target can go away.
 *
 * The host here is a purpose-built probe, not a real component. That is what
 * makes this a direct suite: a failure names the controller.
 */
import { expect } from '@esm-bundle/chai';
import { LitElement, html } from 'lit';
import { mount, cleanup, pointerInit } from './helpers.js';
import { DismissController } from '../src/shared/dismiss-controller.js';

afterEach(cleanup);

class DismissProbe extends LitElement {
  static properties = { open: { type: Boolean, reflect: true } };

  constructor() {
    super();
    this.open = false;
    this.dismissed = 0;
  }

  /**
   * Install the controller with per-test options — the same thing every
   * consumer does in its own constructor, deferred so one probe class can
   * cover every option combination.
   */
  install(opts = {}) {
    this._dismiss = new DismissController(this, {
      onDismiss: () => {
        this.dismissed += 1;
      },
      ...opts,
    });
    return this._dismiss;
  }

  render() {
    return html`<div class="panel"><slot></slot><button class="inner">inner</button></div>`;
  }
}
if (!customElements.get('arc-dismiss-probe')) {
  customElements.define('arc-dismiss-probe', DismissProbe);
}

/**
 * A probe with two slotted children, plus a sibling unambiguously outside it.
 *
 * The light-DOM children are not decoration. `focusout` carries a
 * `relatedTarget`, and the platform **skips dispatch entirely** on any node
 * where the retargeted target and relatedTarget come out equal — so a focus
 * move that begins *and* ends inside the shadow tree produces no event at the
 * host at all, and a synthetic `focusout` fired at the host naming a
 * shadow-internal relatedTarget is silently dropped. Written that way these
 * tests pass without the listener ever running, which is the vacuity trap this
 * repo keeps paying for. Firing from a slotted child is both the realistic
 * shape and the one that actually reaches `_onFocusOut`.
 */
async function fixture(opts = {}) {
  const el = mount(
    `<arc-dismiss-probe>
       <button class="light">light</button>
       <button class="light2">light2</button>
     </arc-dismiss-probe>`
  );
  const outside = document.createElement('button');
  outside.textContent = 'outside';
  document.body.appendChild(outside);
  await el.updateComplete;
  const controller = el.install(opts);
  controller.activate();
  return {
    el,
    outside,
    controller,
    inner: el.shadowRoot.querySelector('.inner'),
    light: el.querySelector('.light'),
    light2: el.querySelector('.light2'),
  };
}

/** A pointerdown as the platform delivers it — composed, so it crosses shadow roots. */
function down(target) {
  target.dispatchEvent(new PointerEvent('pointerdown', { ...pointerInit, composed: true }));
}

/** A focusout as the platform delivers it: fired at the node losing focus. */
function focusOut(target, relatedTarget) {
  target.dispatchEvent(
    new FocusEvent('focusout', { bubbles: true, composed: true, relatedTarget })
  );
}

// ---------------------------------------------------------------------------
// The pointer half
// ---------------------------------------------------------------------------

describe('DismissController: the pointer half', () => {
  it('dismisses when a pointer lands outside', async () => {
    const { el, outside } = await fixture();
    down(outside);
    expect(el.dismissed).to.equal(1);
  });

  it('does not dismiss when the pointer lands on the host', async () => {
    const { el } = await fixture();
    down(el);
    expect(el.dismissed).to.equal(0);
  });

  it('does not dismiss when the pointer lands inside the shadow tree', async () => {
    // composedPath() is what makes this work: the path of an event dispatched on
    // a shadow-internal node includes the host, so no shadow-specific code is
    // needed here or in any of the 17 consumers.
    const { el, inner } = await fixture();
    down(inner);
    expect(el.dismissed).to.equal(0);
  });

  it('listens on the document, so a pointer anywhere is seen', async () => {
    const { el } = await fixture();
    down(document.body);
    expect(el.dismissed).to.equal(1);
  });
});

// ---------------------------------------------------------------------------
// The focus half — finding #60
// ---------------------------------------------------------------------------

describe('DismissController: the focus half', () => {
  it('dismisses when focus moves to a real element outside', async () => {
    // The bug this replaces: arc-multi-select, arc-combobox and arc-tag-input
    // open on focus and had no focus-side dismissal at all, so tabbing away
    // left the dropdown open over the rest of the page.
    const { el, light, outside } = await fixture();
    focusOut(light, outside);
    expect(el.dismissed).to.equal(1);
  });

  it('does not dismiss when focus moves to another element inside', async () => {
    const { el, light, light2 } = await fixture();
    focusOut(light, light2);
    expect(el.dismissed).to.equal(0);
  });

  it('does not dismiss when relatedTarget retargets to the host itself', async () => {
    // Focus moving from a slotted child into the shadow tree retargets
    // relatedTarget to the host, and Node.contains counts a node as containing
    // itself — that `inside === node` branch is what covers it.
    const { el, light } = await fixture();
    focusOut(light, el);
    expect(el.dismissed).to.equal(0);
  });

  it('ignores a null relatedTarget, and still answers a real one', async () => {
    // Both halves of this are load-bearing. The null case is the decision
    // (finding #60: a re-render orphaning focus, or the window losing it, both
    // arrive as null and neither means the user left). The second assertion is
    // the anti-vacuity pair — without it this passes on a dead controller.
    const { el, light, outside } = await fixture();
    focusOut(light, null);
    expect(el.dismissed, 'a null relatedTarget is not an answer').to.equal(0);

    focusOut(light, outside);
    expect(el.dismissed, 'the same controller still dismisses on a real one').to.equal(1);
  });
});

// ---------------------------------------------------------------------------
// The options
// ---------------------------------------------------------------------------

describe('DismissController: when()', () => {
  it('gates both halves', async () => {
    const { el, light, outside } = await fixture({ when: () => false });
    down(outside);
    focusOut(light, outside);
    expect(el.dismissed).to.equal(0);
  });

  it('is re-read per event, not captured once', async () => {
    let allowed = false;
    const { el, outside } = await fixture({ when: () => allowed });
    down(outside);
    expect(el.dismissed).to.equal(0);

    allowed = true;
    down(outside);
    expect(el.dismissed).to.equal(1);
  });
});

describe('DismissController: boundary()', () => {
  it('treats the named element as inside instead of the host', async () => {
    const el = mount('<arc-dismiss-probe></arc-dismiss-probe>');
    const target = document.createElement('div');
    target.innerHTML = '<button>target</button>';
    document.body.appendChild(target);
    await el.updateComplete;
    el.install({ boundary: () => target }).activate();

    down(target.querySelector('button'));
    expect(el.dismissed, 'a pointer inside the boundary is inside').to.equal(0);

    down(el);
    expect(el.dismissed, 'the host is no longer what counts as inside').to.equal(1);
  });

  it('a boundary resolving to nothing means every pointer is outside', async () => {
    // arc-spotlight's highlighted target can disappear; with no inside left,
    // the next pointer anywhere should close it rather than trap the page.
    const { el, inner } = await fixture({ boundary: () => null });
    down(inner);
    expect(el.dismissed).to.equal(1);
  });

  it('a boundary resolving to nothing dismisses on any focusout', async () => {
    const { el, light, light2 } = await fixture({ boundary: () => null });
    focusOut(light, light2);
    expect(el.dismissed).to.equal(1);
  });
});

describe('DismissController: half-disabling', () => {
  it('pointer:false leaves only the focus half', async () => {
    const { el, light, outside } = await fixture({ pointer: false });
    down(outside);
    expect(el.dismissed, 'the pointer half is off').to.equal(0);

    focusOut(light, outside);
    expect(el.dismissed, 'the focus half is still on').to.equal(1);
  });

  it('focus:false leaves only the pointer half', async () => {
    const { el, light, outside } = await fixture({ focus: false });
    focusOut(light, outside);
    expect(el.dismissed, 'the focus half is off').to.equal(0);

    down(outside);
    expect(el.dismissed, 'the pointer half is still on').to.equal(1);
  });

  it('both are on by default — that is the point of finding #60', async () => {
    const { el, light, outside } = await fixture();
    focusOut(light, outside);
    down(outside);
    expect(el.dismissed).to.equal(2);
  });
});

// ---------------------------------------------------------------------------
// Activation lifecycle
// ---------------------------------------------------------------------------

describe('DismissController: activation', () => {
  it('is inert until activated', async () => {
    const el = mount('<arc-dismiss-probe></arc-dismiss-probe>');
    const outside = document.createElement('button');
    document.body.appendChild(outside);
    await el.updateComplete;
    el.install();

    down(outside);
    expect(el.dismissed).to.equal(0);
  });

  it('a double activate() still detaches on one deactivate()', async () => {
    // Not pedantry: consumers call activate() from updated(), which runs on
    // every render while open. Without the _active guard each render would add
    // another document listener and one deactivate() would leave the rest.
    const { el, outside, controller } = await fixture();
    controller.activate();
    controller.deactivate();

    down(outside);
    expect(el.dismissed).to.equal(0);
  });

  it('deactivate() before any activate() is a no-op', async () => {
    const el = mount('<arc-dismiss-probe></arc-dismiss-probe>');
    await el.updateComplete;
    const controller = el.install();
    expect(() => controller.deactivate()).to.not.throw();
  });

  it('detaches when the host disconnects', async () => {
    const { el, outside } = await fixture();
    el.remove();

    down(outside);
    expect(el.dismissed).to.equal(0);
  });
});

// ---------------------------------------------------------------------------
// Reconnection — findings #55 and #64, in the dismiss layer
// ---------------------------------------------------------------------------

describe('DismissController: reconnection', () => {
  it('re-arms after the host is reparented while active', async () => {
    // The shape of #55/#64 again: hostDisconnected tears the listeners down,
    // and the only thing that puts them back is the consumer's updated(),
    // which is keyed on an open-state *change*. Reparenting changes no state,
    // so an overlay that was open before the move came back undismissable —
    // still rendering, still answering every property, permanently stuck.
    const { el, light, outside } = await fixture();
    const host = document.createElement('div');
    document.body.appendChild(host);

    el.remove();
    host.appendChild(el);
    await el.updateComplete;

    down(outside);
    expect(el.dismissed, 'the pointer half must survive a reparent').to.equal(1);

    focusOut(light, outside);
    expect(el.dismissed, 'and so must the focus half').to.equal(2);
  });

  it('does not arm a controller that was inactive when it moved', async () => {
    // The other half of the contract, and the reason this is not just
    // "activate on hostConnected": a closed panel must stay closed-and-inert
    // across a reparent, or every move re-arms every dismissable component
    // on the page.
    const el = mount('<arc-dismiss-probe></arc-dismiss-probe>');
    const outside = document.createElement('button');
    document.body.appendChild(outside);
    await el.updateComplete;
    el.install();

    const host = document.createElement('div');
    document.body.appendChild(host);
    el.remove();
    host.appendChild(el);
    await el.updateComplete;

    down(outside);
    expect(el.dismissed).to.equal(0);
  });
});
