/**
 * FormControlMixin — form participation for 26 controls, tested directly.
 *
 * `form-contract.test.js` sweeps the *consumers*: it proves 14 real components
 * report valueMissing and reflect `name`. That is the right test for the
 * components and the wrong one for the mixin — a break in `_formValueIsEmpty`
 * surfaces there as a scattering of component failures, none of which names
 * this file, and the extension points consumers actually override
 * (`_formValue`, `_formResetState`, `_applyFormState`, `autoValidates`) are
 * exercised only wherever some component happens to use them.
 *
 * So the mechanism is pinned here, once, against a purpose-built probe
 * composed the way every real consumer is —
 * `DeclaredPropsMixin(FormControlMixin(LitElement))`, which is the composition
 * all 27 files use — and the consumer sweep keeps what is genuinely
 * per-component.
 */
import { expect } from '@esm-bundle/chai';
import { LitElement, html } from 'lit';
import { mount, cleanup, settle, tick } from './helpers.js';
import { FormControlMixin } from '../src/shared/form-control-mixin.js';
import { DeclaredPropsMixin } from '../src/shared/props.js';

afterEach(cleanup);

class FormProbe extends DeclaredPropsMixin(FormControlMixin(LitElement)) {
  static properties = {
    value: { type: String },
    name: { type: String, reflect: true },
    disabled: { type: Boolean, reflect: true },
  };

  constructor() {
    super();
    this.value = '';
    this.name = '';
    this.disabled = false;
  }

  render() {
    return html`<input class="native" type="text" .value=${this.value} />`;
  }
}
if (!customElements.get('arc-form-probe')) customElements.define('arc-form-probe', FormProbe);

/** Submits a FormData rather than a string — the multi-value shape. */
class MultiProbe extends FormProbe {
  _formValue() {
    if (!this.name) return null;
    const data = new FormData();
    for (const v of this.value || []) data.append(this.name, v);
    return data;
  }
}
if (!customElements.get('arc-form-multi-probe')) {
  customElements.define('arc-form-multi-probe', MultiProbe);
}

/** Owns its whole validity flag set, as pattern/range controls do. */
class SelfValidatingProbe extends FormProbe {
  static autoValidates = false;
}
if (!customElements.get('arc-form-selfvalid-probe')) {
  customElements.define('arc-form-selfvalid-probe', SelfValidatingProbe);
}

/** A probe inside a real form, which is the only place submission is observable. */
async function inForm(markup = '<arc-form-probe name="f"></arc-form-probe>') {
  const form = mount(`<form>${markup}</form>`);
  const el = form.firstElementChild;
  await settle(el);
  return { form, el };
}

const submitted = (form) => new FormData(form);

// ---------------------------------------------------------------------------
// Emptiness — what `required` actually means
// ---------------------------------------------------------------------------

describe('FormControlMixin: emptiness', () => {
  it('an empty string is missing, a filled one is not', async () => {
    const { el } = await inForm('<arc-form-probe name="f" required></arc-form-probe>');
    expect(el.checkValidity()).to.equal(false);
    expect(el.validity.valueMissing).to.equal(true);

    el.value = 'x';
    await settle(el);
    expect(el.checkValidity()).to.equal(true);
  });

  it('zero is a value, not an absence', async () => {
    // The trap this exists to stop: a number-valued control defaulting to 0
    // reads as empty under any `!value` test, and a required numeric field
    // becomes unsubmittable at exactly its most common value.
    const { el } = await inForm('<arc-form-probe name="f" required></arc-form-probe>');
    el.value = 0;
    await settle(el);

    expect(el.checkValidity(), '0 must submit').to.equal(true);
  });

  it('false is a value too', async () => {
    const { el } = await inForm('<arc-form-probe name="f" required></arc-form-probe>');
    el.value = false;
    await settle(el);

    expect(el.checkValidity()).to.equal(true);
  });

  it('an empty array is missing, a populated one is not', async () => {
    const { el } = await inForm('<arc-form-probe name="f" required></arc-form-probe>');
    el.value = [];
    await settle(el);
    expect(el.checkValidity(), 'no selections is missing').to.equal(false);

    el.value = ['a'];
    await settle(el);
    expect(el.checkValidity()).to.equal(true);
  });

  it('an empty FormData is missing, a populated one is not', async () => {
    // The multi-entry controls (multi-select, tag-input, transfer-list) all
    // submit a FormData, so `required` on them is decided by this branch alone.
    const { el } = await inForm('<arc-form-multi-probe name="f" required></arc-form-multi-probe>');
    el.value = [];
    await settle(el);
    expect(el.checkValidity()).to.equal(false);

    el.value = ['a', 'b'];
    await settle(el);
    expect(el.checkValidity()).to.equal(true);
  });

  it('null is missing', async () => {
    const { el } = await inForm('<arc-form-probe name="f" required></arc-form-probe>');
    el.value = null;
    await settle(el);
    expect(el.checkValidity()).to.equal(false);
  });
});

// ---------------------------------------------------------------------------
// required / readonly are flag(), deliberately unlike `disabled`
// ---------------------------------------------------------------------------

describe('FormControlMixin: required is a flag(), not a platform boolean', () => {
  it('required="false" is not required', async () => {
    // Finding #48's shape across all 26 controls at once. `disabled` cannot be
    // tri-state — the platform makes a merely-present attribute disabling — but
    // `required` is enforced here in JS, so the stock converter buys nothing
    // and costs a form the author meant to leave optional.
    const { el } = await inForm('<arc-form-probe name="f" required="false"></arc-form-probe>');
    expect(el.required).to.equal(false);
    expect(el.checkValidity(), 'an empty optional field is valid').to.equal(true);
  });

  it('a bare required attribute is required', async () => {
    const { el } = await inForm('<arc-form-probe name="f" required></arc-form-probe>');
    expect(el.required).to.equal(true);
    expect(el.checkValidity()).to.equal(false);
  });

  it('readonly="false" is not readonly', async () => {
    const { el } = await inForm('<arc-form-probe name="f" readonly="false"></arc-form-probe>');
    expect(el.readonly).to.equal(false);
  });
});

// ---------------------------------------------------------------------------
// The updated() hooks — the reason programmatic assignment works at all
// ---------------------------------------------------------------------------

describe('FormControlMixin: keeping the form in sync', () => {
  it('a programmatic value assignment reaches the form', async () => {
    // Most controls only call _updateFormValue() from their interaction
    // handlers, so before these hooks existed `el.value = x` from script left
    // the submitted value stale — the form sent the old one.
    const { form, el } = await inForm();
    el.value = 'typed';
    await settle(el);

    expect(submitted(form).get('f')).to.equal('typed');
  });

  it('toggling required after mount resyncs validity with no value change', async () => {
    const { el } = await inForm();
    expect(el.checkValidity()).to.equal(true);

    el.required = true;
    await settle(el);
    expect(el.checkValidity(), 'now required and still empty').to.equal(false);

    el.required = false;
    await settle(el);
    expect(el.checkValidity(), 'and back again').to.equal(true);
  });

  it('a parse-time required attribute is live before any value change', async () => {
    // connectedCallback syncs it, so checkValidity() is correct on an element
    // nobody has touched — which is what a submit handler reads.
    const { el } = await inForm('<arc-form-probe name="f" required></arc-form-probe>');
    expect(el.checkValidity()).to.equal(false);
  });

  it('autoValidates = false hands the whole flag set to the subclass', async () => {
    // Controls with their own constraint logic (pattern, range) must not have
    // valueMissing written underneath them.
    const { el } = await inForm(
      '<arc-form-selfvalid-probe name="f" required></arc-form-selfvalid-probe>'
    );
    expect(el.checkValidity(), 'the mixin did not set valueMissing').to.equal(true);

    el._setValidity({ customError: true }, 'mine');
    expect(el.validity.customError).to.equal(true);
    expect(el.validationMessage).to.equal('mine');
  });
});

// ---------------------------------------------------------------------------
// Reset — and the first-connect baseline that keeps catching people
// ---------------------------------------------------------------------------

describe('FormControlMixin: reset', () => {
  it('restores the value the control had when it first connected', async () => {
    // Built detached and seeded *before* connecting, which is the only way to
    // choose the reset baseline. See the next test for what happens otherwise.
    const form = mount('<form></form>');
    const el = document.createElement('arc-form-probe');
    el.name = 'f';
    el.value = 'seed';
    form.appendChild(el);
    await settle(el);

    el.value = 'changed';
    await settle(el);
    form.reset();
    await settle(el);

    expect(el.value).to.equal('seed');
  });

  it('baselines on first connect, not on the first assignment', async () => {
    // The trap, pinned as behaviour rather than left as folklore: a value
    // assigned after the element is in the DOM is *not* what reset() restores,
    // so a test that mounts and then seeds is testing something else.
    const { form, el } = await inForm();
    el.value = 'assigned after mount';
    await settle(el);

    form.reset();
    await settle(el);
    expect(el.value, 'the baseline was the empty string it connected with').to.equal('');
  });

  it('reset goes through _applyFormState, so overrides are honoured', async () => {
    class TwoFieldProbe extends FormProbe {
      static properties = { other: { type: String } };
      constructor() {
        super();
        this.other = '';
      }
      _formResetState() {
        return { value: this.value, other: this.other };
      }
      _applyFormState(state) {
        this.value = state.value;
        this.other = state.other;
      }
    }
    if (!customElements.get('arc-form-two-probe')) {
      customElements.define('arc-form-two-probe', TwoFieldProbe);
    }

    const form = mount('<form></form>');
    const el = document.createElement('arc-form-two-probe');
    el.name = 'f';
    el.value = 'v0';
    el.other = 'o0';
    form.appendChild(el);
    await settle(el);

    el.value = 'v1';
    el.other = 'o1';
    await settle(el);
    form.reset();
    await settle(el);

    expect(el.value).to.equal('v0');
    expect(el.other, 'state outside `value` is restored too').to.equal('o0');
  });

  it('_recaptureFormResetState moves the baseline to a derived initial value', async () => {
    // The escape hatch for the previous test's trap. A control whose initial
    // value arrives from slotted children — arc-segmented-control auto-selects
    // its first option on the first slotchange — has nothing to baseline at
    // connect, so reset() would clear it rather than restore it (finding #7).
    const { form, el } = await inForm();

    el.value = 'derived from the children';
    await settle(el);
    el._recaptureFormResetState();

    el.value = 'user picked something else';
    await settle(el);
    form.reset();
    await settle(el);

    expect(el.value).to.equal('derived from the children');
    expect(submitted(form).get('f'), 'and the form agrees').to.equal('derived from the children');
  });

  it('reset puts the restored value back into the form', async () => {
    const form = mount('<form></form>');
    const el = document.createElement('arc-form-probe');
    el.name = 'f';
    el.value = 'seed';
    form.appendChild(el);
    await settle(el);

    el.value = 'changed';
    await settle(el);
    form.reset();
    await settle(el);

    expect(submitted(form).get('f'), 'not just the property').to.equal('seed');
  });
});

// ---------------------------------------------------------------------------
// The platform callbacks
// ---------------------------------------------------------------------------

describe('FormControlMixin: platform callbacks', () => {
  it('a disabled fieldset disables the control', async () => {
    const form = mount(`
      <form>
        <fieldset disabled>
          <arc-form-probe name="f"></arc-form-probe>
        </fieldset>
      </form>`);
    const el = form.querySelector('arc-form-probe');
    await settle(el);

    expect(el.disabled).to.equal(true);
  });

  // BUG (finding #74): `<fieldset disabled>` is a one-way door for all 27 form
  // controls. formDisabledCallback assigns `this.disabled = true`, which
  // reflects — and per the HTML spec a form-associated custom element is
  // disabled if *its own* disabled attribute is present **or** an ancestor
  // fieldset is disabled. Writing the attribute therefore makes the element
  // self-disabled, the computed state stops depending on the fieldset, and the
  // platform never calls formDisabledCallback(false). The control is dead for
  // the life of the page.
  //
  // Measured, not inferred: an otherwise identical form-associated element that
  // records the callback *without* writing an attribute receives [true, false];
  // one that reflects receives [true]. Confirmed on arc-input and arc-checkbox,
  // where the native <input> also stays disabled.
  //
  // Not fixed here because every candidate fix changes the disabled contract
  // itself — see test-findings.md §74. This pin asserts today's behaviour so
  // the suite stays honest; it flips to the assertion below it when fixed.
  it('BUG: re-enabling the fieldset does not re-enable the control', async () => {
    const form = mount(`
      <form>
        <fieldset disabled>
          <arc-form-probe name="f"></arc-form-probe>
        </fieldset>
      </form>`);
    const el = form.querySelector('arc-form-probe');
    await settle(el);
    expect(el.disabled, 'disabled by the fieldset').to.equal(true);

    form.querySelector('fieldset').disabled = false;
    await settle(el);

    expect(el.disabled, 'should be false — this is the bug').to.equal(true);
    expect(el.hasAttribute('disabled'), 'and the attribute is why').to.equal(true);
  });

  it('restores a string state from bfcache or autofill', async () => {
    const { form, el } = await inForm();
    el.formStateRestoreCallback('restored');
    await settle(el);

    expect(el.value).to.equal('restored');
    expect(submitted(form).get('f'), 'and it reaches the form').to.equal('restored');
  });

  it('ignores a non-string restore state', async () => {
    const { el } = await inForm();
    el.value = 'kept';
    await settle(el);

    el.formStateRestoreCallback(new FormData());
    await settle(el);
    expect(el.value).to.equal('kept');
  });

  it('exposes the owning form', async () => {
    const { form, el } = await inForm();
    expect(el.form === form).to.equal(true);
  });

  it('reports no form when it has none', async () => {
    const el = mount('<arc-form-probe name="f"></arc-form-probe>');
    await settle(el);
    expect(el.form).to.equal(null);
  });
});

// ---------------------------------------------------------------------------
// The editing marker
// ---------------------------------------------------------------------------

describe('FormControlMixin: the data-arc-editing marker', () => {
  it('marks the host while a text field inside holds focus', async () => {
    // Retargeting means an outside listener sees <arc-form-probe>, not the
    // <input>, and no selector crosses a shadow boundary — so without this
    // marker a bare-key shortcut has no way to know it is firing mid-sentence.
    const el = mount('<arc-form-probe></arc-form-probe>');
    await settle(el);
    const native = el.shadowRoot.querySelector('.native');

    native.focus();
    await tick();
    expect(el.hasAttribute('data-arc-editing')).to.equal(true);

    native.blur();
    await tick();
    expect(el.hasAttribute('data-arc-editing')).to.equal(false);
  });

  it('does not mark the host for a non-text control', async () => {
    class CheckProbe extends FormProbe {
      render() {
        return html`<input class="native" type="checkbox" />`;
      }
    }
    if (!customElements.get('arc-form-check-probe')) {
      customElements.define('arc-form-check-probe', CheckProbe);
    }

    const el = mount('<arc-form-check-probe></arc-form-check-probe>');
    await settle(el);
    el.shadowRoot.querySelector('.native').focus();
    await tick();

    expect(el.hasAttribute('data-arc-editing')).to.equal(false);
  });

  it('drops the marker when the control is disconnected mid-edit', async () => {
    const el = mount('<arc-form-probe></arc-form-probe>');
    await settle(el);
    el.shadowRoot.querySelector('.native').focus();
    await tick();
    expect(el.hasAttribute('data-arc-editing'), 'marked first').to.equal(true);

    el.remove();
    expect(el.hasAttribute('data-arc-editing')).to.equal(false);
  });
});
