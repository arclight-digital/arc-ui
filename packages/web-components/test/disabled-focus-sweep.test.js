/**
 * A disabled control must not be a tab stop. Finding #61.
 *
 * Thirty components enforce `disabled` with
 * `:host([disabled]) { pointer-events: none }`, and that rule says nothing about
 * the keyboard. Five of them left a focusable control in the tab order while
 * disabled, and `arc-color-picker` also stayed *editable*: its hex field guarded
 * `readonly` and never looked at `disabled`, so a keyboard user could recolour a
 * disabled picker.
 *
 * That is #58's shape with a different mechanism — the constraint attached to
 * the presentation rather than to the state — which is why the guard here is
 * derived rather than a list. The tags come from `custom-elements.json`, so a
 * component gains this coverage by existing, and the sweep cannot fall behind
 * the library the way five hand-written tests would.
 *
 * The rule it asserts is the platform's own: a disabled `<button>` or `<input>`
 * is skipped by sequential focus navigation entirely. Anything with a
 * `role`/`tabindex` pair standing in for a native control owes the same.
 */
import { expect } from '@esm-bundle/chai';
import { mount, cleanup, settle } from './helpers.js';

// Every form control, imported individually rather than through
// src/register.js — that pulls in arc-qr-code, whose CJS-only dependency
// fails to import under the test runner.
import '../src/input/button-group.register.js';
import '../src/input/button.register.js';
import '../src/input/calendar.register.js';
import '../src/input/checkbox.register.js';
import '../src/input/chip.register.js';
import '../src/input/color-picker.register.js';
import '../src/input/combobox.register.js';
import '../src/input/copy-button.register.js';
import '../src/input/date-picker.register.js';
import '../src/input/date-range-picker.register.js';
import '../src/input/fieldset.register.js';
import '../src/input/file-upload.register.js';
import '../src/input/form.register.js';
import '../src/input/hotkey.register.js';
import '../src/input/icon-button.register.js';
import '../src/input/image-cropper.register.js';
import '../src/input/inline-edit.register.js';
import '../src/input/input-group.register.js';
import '../src/input/input.register.js';
import '../src/input/knob.register.js';
import '../src/input/label.register.js';
import '../src/input/masked-input.register.js';
import '../src/input/multi-select.register.js';
import '../src/input/number-input.register.js';
import '../src/input/otp-input.register.js';
import '../src/input/password-input.register.js';
import '../src/input/pin-input.register.js';
import '../src/input/radio-group.register.js';
import '../src/input/radio.register.js';
import '../src/input/range-slider.register.js';
import '../src/input/rating.register.js';
import '../src/input/search.register.js';
import '../src/input/segmented-control.register.js';
import '../src/input/select.register.js';
import '../src/input/signature-pad.register.js';
import '../src/input/slider.register.js';
import '../src/input/sortable-list.register.js';
import '../src/input/suggestion.register.js';
import '../src/input/switch-group.register.js';
import '../src/input/tag-input.register.js';
import '../src/input/textarea.register.js';
import '../src/input/theme-toggle.register.js';
import '../src/input/time-picker.register.js';
import '../src/input/toggle.register.js';
import '../src/input/transfer-list.register.js';
import '../src/input/tree-select.register.js';

afterEach(() => cleanup());

/**
 * Things that take sequential focus. `[tabindex]` is included because these
 * components stand roles up on plain divs — arc-range-slider's thumbs and
 * arc-file-upload's dropzone are `role="slider"` and `role="button"` on a div,
 * and a div cannot carry the `disabled` attribute that would exempt it.
 */
const FOCUSABLE = 'a[href], button, input, select, textarea, [tabindex]';

/** Would sequential focus navigation stop here? */
function isTabbable(node) {
  if (node.disabled) return false;
  const tabindex = node.getAttribute('tabindex');
  if (tabindex !== null && Number(tabindex) < 0) return false;
  return true;
}

/**
 * Extra attributes some components need before they render the shape at risk.
 *
 * arc-button is the reason this exists: bare, it renders a `<button>`, which
 * takes `?disabled` and was never the problem. Given an `href` it renders an
 * `<a>` instead — and an anchor has no `disabled` attribute at all, so a
 * disabled link button stayed focusable and followable. A sweep that only ever
 * mounts the bare tag reports it clean, which is exactly how that one survived
 * being written up in test-audit.md §5.
 */
const VARIANTS = {
  'arc-button': ['href="/somewhere"'],
  'arc-icon-button': ['href="/somewhere"'],
};

async function tabbablesFor(tag, extra = '') {
  const el = mount(`<${tag} disabled ${extra}></${tag}>`);
  await settle(el);
  if (el.disabled !== true) return null; // not a disable-able component
  return [...(el.shadowRoot?.querySelectorAll(FOCUSABLE) ?? [])].filter(isTabbable);
}

/** Every rendering of `tag` while disabled, bare plus any declared variants. */
async function allTabbablesWhileDisabled(tag) {
  const shapes = ['', ...(VARIANTS[tag] ?? [])];
  const out = [];
  let disableable = false;
  for (const extra of shapes) {
    const found = await tabbablesFor(tag, extra);
    cleanup();
    if (found === null) continue;
    disableable = true;
    for (const node of found) out.push(extra ? `${node.localName} (${extra})` : node.localName);
  }
  return disableable ? out : null;
}

let TAGS = [];

before(async () => {
  const manifest = await (await fetch('/packages/web-components/custom-elements.json')).json();
  TAGS = (manifest.modules ?? [])
    .flatMap((m) => m.declarations ?? [])
    .map((d) => d.tagName)
    .filter((t) => t?.startsWith('arc-') && customElements.get(t));
});

describe('disabled controls leave the tab order', () => {
  it('has a manifest to sweep', () => {
    // Anti-vacuity for the whole file: an empty or unfetched manifest would
    // make every assertion below pass without testing anything.
    expect(TAGS.length, 'no registered arc- tags found').to.be.greaterThan(20);
  });

  it('finds components that actually accept disabled', async () => {
    // The other half of the guard: `disabled` has to mean something on at least
    // a good number of these, or the sweep is skipping everything.
    let disableable = 0;
    for (const tag of TAGS) {
      if ((await allTabbablesWhileDisabled(tag)) !== null) disableable += 1;
    }
    expect(disableable, 'nothing in the library takes `disabled`').to.be.greaterThan(20);
  });

  it('leaves nothing keyboard-reachable in any disabled component', async () => {
    const leaks = [];
    for (const tag of TAGS) {
      const tabbable = await allTabbablesWhileDisabled(tag);
      if (tabbable?.length) leaks.push(`${tag} → ${tabbable.join(', ')}`);
    }
    expect(leaks, `disabled components still in the tab order:\n${leaks.join('\n')}`).to.eql([]);
  });
});

describe('arc-color-picker cannot be edited while disabled', () => {
  // The one leak that changed state rather than merely holding focus, kept as a
  // behavioural test because "not tabbable" and "not editable" are different
  // claims and the sweep above only makes the first.
  it('ignores a hex typed into it', async () => {
    const el = mount('<arc-color-picker disabled value="#ff0000"></arc-color-picker>');
    await settle(el);
    expect(el.disabled, 'not actually disabled').to.equal(true);

    const field = el.shadowRoot.querySelector('.picker__hex-input');
    field.value = '#00ff00';
    field.dispatchEvent(new Event('input', { bubbles: true }));
    field.dispatchEvent(new Event('blur', { bubbles: true }));
    await settle(el);

    expect(el.value, 'a disabled picker was recoloured').to.equal('#ff0000');
  });

  it('ignores a preset click', async () => {
    const el = mount('<arc-color-picker disabled value="#ff0000"></arc-color-picker>');
    el.presets = ['#00ff00'];
    await settle(el);

    el.shadowRoot.querySelector('.picker__swatch').click();
    await settle(el);
    expect(el.value).to.equal('#ff0000');
  });

  it('ignores a dispatched pointer on the area', async () => {
    // The stylesheet stops a real pointer, but only the JS guard stops this —
    // and the guard is what a future refactor of the CSS would leave behind.
    const el = mount('<arc-color-picker disabled value="#ff0000"></arc-color-picker>');
    await settle(el);

    const area = el.shadowRoot.querySelector('.picker__area');
    const rect = area.getBoundingClientRect();
    area.dispatchEvent(
      new PointerEvent('pointerdown', {
        bubbles: true,
        pointerId: 1,
        isPrimary: true,
        clientX: rect.left + rect.width * 0.2,
        clientY: rect.top + rect.height * 0.2,
      }),
    );
    await settle(el);
    expect(el.value).to.equal('#ff0000');
  });
});
