/**
 * The dialog family after V4-SCOPE §3.3 — three tags became two, and one of the
 * three tag *names* now refers to a different component.
 *
 * ```
 * before                              after
 * ------                              -----
 * arc-confirm  (the prompt)           arc-confirm  (the prompt, both APIs)
 *   └── arc-dialog (the prompt again)      └── arc-dialog (the primitive, renamed)
 *         └── arc-modal (the primitive)          └── arc-modal (deprecated alias)
 * ```
 *
 * The risky half is the middle row. Anyone still writing `<arc-dialog heading
 * message confirm-label>` upgrades into a bare overlay primitive that knows
 * `heading` and ignores the other two — an empty panel with a title, which is
 * the quietest failure a rename can produce. §3.3 requires a dev-mode error for
 * exactly that, and most of this file is about it.
 */
import { expect } from '@esm-bundle/chai';
import '../src/feedback/dialog.register.js';
import '../src/feedback/modal.register.js';
import '../src/feedback/confirm.register.js';
import { mount, cleanup, tick } from './helpers.js';

/**
 * The guard reports through `console.error` rather than throwing.
 *
 * A throw from `connectedCallback` is a custom-element reaction: the browser
 * catches it, reports it globally and leaves the element unupgraded, so the
 * call site cannot observe it and the test cannot assert on it — which is how
 * this file found out. Spying the console is what the library's other dev-time
 * diagnostics are tested through (see dev-warnings.test.js).
 */
const errors = [];
const originalError = console.error;
before(() => {
  console.error = (...args) => {
    errors.push(args.join(' '));
    originalError.apply(console, args);
  };
});
after(() => {
  console.error = originalError;
});
beforeEach(() => {
  errors.length = 0;
});

afterEach(cleanup);

describe('arc-dialog is the primitive, not the old confirm prompt', () => {
  it('reports the props that used to mean something on this tag', () => {
    mount('<arc-dialog heading="x" message="Sure?"></arc-dialog>');
    expect(errors.join('\n'), 'names where to go instead').to.match(/arc-confirm/);
  });

  it('names every offending prop, not just the first', () => {
    mount('<arc-dialog message="a" confirm-label="b"></arc-dialog>');
    const text = errors.join('\n');
    expect(text).to.include('message');
    expect(text).to.include('confirmLabel');
  });

  it('leaves `heading` alone, because it means the same thing in both', () => {
    // The prop that is *not* evidence of the mistake. Including it would make
    // the guard fire on correct v4 markup, which is how a guard gets deleted.
    mount('<arc-dialog heading="Settings"></arc-dialog>');
    expect(errors, 'correct v4 markup is silent').to.have.lengthOf(0);
  });

  it('is the modal primitive: it opens, and it has a size', async () => {
    const el = mount('<arc-dialog heading="Settings" size="lg"><p>body</p></arc-dialog>');
    await el.updateComplete;
    el.open = true;
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('dialog').open).to.equal(true);
    expect(el.size).to.equal('lg');
  });
});

describe('arc-modal is an alias with nothing in it', () => {
  it('is the same component under a different tag', async () => {
    const el = mount('<arc-modal heading="Settings"><p>body</p></arc-modal>');
    await el.updateComplete;
    el.open = true;
    await el.updateComplete;
    await tick();

    expect(el.shadowRoot.querySelector('dialog').open).to.equal(true);
    expect(el.shadowRoot.querySelector('.dialog__panel'), 'the base class renders').to.not.equal(
      null,
    );
  });

  it('adds nothing of its own', () => {
    // The property that keeps the alias honest: an alias with a body is an
    // alias that can drift from what it aliases, and this is the cheapest way
    // to notice one growing one. `styles` and `properties` are inherited
    // statics, so identity comparison is the test.
    const ArcModal = customElements.get('arc-modal');
    const ArcDialog = customElements.get('arc-dialog');
    expect(Object.getPrototypeOf(ArcModal)).to.equal(ArcDialog);
    expect(ArcModal.styles).to.equal(ArcDialog.styles);
    expect(ArcModal.properties).to.equal(ArcDialog.properties);
    expect(
      Object.getOwnPropertyNames(ArcModal.prototype).filter((k) => k !== 'constructor'),
      'the alias defines no methods of its own',
    ).to.have.lengthOf(0);
  });
});

describe('arc-confirm kept both of its shapes', () => {
  it('is a declarative element', async () => {
    const el = mount('<arc-confirm heading="Delete?" message="Gone for good."></arc-confirm>');
    await el.updateComplete;
    el.open = true;
    await el.updateComplete;
    await tick();

    const cancels = [];
    el.addEventListener('arc-cancel', () => cancels.push(1));
    el.shadowRoot.querySelector('arc-button[part~="cancel"]').click();
    await el.updateComplete;
    expect(cancels).to.have.lengthOf(1);
    expect(el.open).to.equal(false);
  });

  it('renders through the renamed primitive', async () => {
    // The composition §3.3 describes: arc-confirm is a skin, arc-dialog is the
    // overlay. If this stops being true the prompt has grown its own overlay
    // implementation, which is the duplication the merge removed.
    const el = mount('<arc-confirm heading="Delete?"></arc-confirm>');
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('arc-dialog'), 'built on arc-dialog').to.not.equal(null);
  });

  it('absorbed the props the old arc-dialog had', async () => {
    // The merge, stated as the thing a consumer of the old tag can now do:
    // every prop that markup carried works here, including the two arc-dialog
    // reports as a mistake.
    const el = mount(
      '<arc-confirm heading="Delete?" message="Gone." confirm-label="Delete" cancel-label="Keep" variant="error"></arc-confirm>',
    );
    await el.updateComplete;
    expect(el.heading).to.equal('Delete?');
    expect(el.message).to.equal('Gone.');
    expect(el.confirmLabel).to.equal('Delete');
    expect(el.cancelLabel).to.equal('Keep');
    expect(el.variant).to.equal('error');
  });
});
