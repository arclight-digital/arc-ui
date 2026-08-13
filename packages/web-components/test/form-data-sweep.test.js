/**
 * What the form actually submits — swept across every form-associated control.
 *
 * `form-contract.test.js` predates this and never calls `new FormData` once: it
 * sweeps `checkValidity()`, `validity.valueMissing` and the reflected `name`,
 * all of which a control can get right while submitting nothing. Twelve
 * components carry their own ad-hoc FormData block, which means the other
 * fourteen had no submission assertion anywhere — including every control that
 * overrides `_formValue()`, which is exactly where submission is non-obvious.
 *
 * **Subjects are derived, not listed.** `custom-elements.json` records a
 * `formAssociated` member on precisely the classes that participate in forms,
 * so the sweep reads the manifest rather than carrying a table. Both of this
 * repo's hand-listed guards missed a real component (HANDOFF's table says so in
 * its own words), and `form-contract.test.js`'s hand list is 14 of 26 — the
 * same failure, already happened, in the file this one extends.
 *
 * The per-control knowledge that genuinely cannot be derived — *how* to give
 * this control a value — is a FILL map, and a derived tag with no FILL entry is
 * a **failure**, not a silent skip. That is what keeps the derivation honest as
 * the catalog changes.
 */
import { expect } from '@esm-bundle/chai';
import { mount, cleanup, settle } from './helpers.js';
// arc-option must be a defined element, not just parsed markup: unupgraded it
// has neither `label` nor `value`, so every option reads blank.
import '../src/shared/option.register.js';

const manifest = await fetch(new URL('../custom-elements.json', import.meta.url)).then((r) =>
  r.json()
);

/** Every custom element whose class declares `formAssociated`. */
const SUBJECTS = manifest.modules.flatMap((m) =>
  (m.declarations ?? [])
    .filter((d) => d.tagName && (d.members ?? []).some((x) => x.name === 'formAssociated'))
    .map((d) => ({ tag: d.tagName, path: m.path }))
);

const unimportable = [];
for (const { path } of SUBJECTS) {
  try {
    await import(/* @vite-ignore */ new URL(`../${path.replace(/\.js$/, '.register.js')}`, import.meta.url).href);
  } catch (error) {
    unimportable.push(`${path}: ${error.message.slice(0, 80)}`);
  }
}

/**
 * How to give each control a value. The only hand-written thing here, and it is
 * checked against the derived subject list below in both directions.
 */
const FILL = {
  'arc-input': (el) => { el.value = 'typed'; },
  'arc-textarea': (el) => { el.value = 'typed'; },
  'arc-select': (el) => { el.value = 'a'; },
  'arc-combobox': (el) => { el.value = 'a'; },
  'arc-multi-select': (el) => { el.value = ['a', 'b']; },
  'arc-radio-group': (el) => { el.value = 'a'; },
  'arc-checkbox': (el) => { el.checked = true; },
  'arc-toggle': (el) => { el.checked = true; },
  'arc-date-picker': (el) => { el.value = '2026-07-30'; },
  'arc-date-range-picker': (el) => { el.value = '2026-07-01/2026-07-10'; },
  'arc-time-picker': (el) => { el.value = '12:30'; },
  'arc-otp-input': (el) => { el.value = '123456'; },
  'arc-pin-input': (el) => { el.value = '1234'; },
  'arc-tag-input': (el) => { el.value = ['a', 'b']; },
  'arc-password-input': (el) => { el.value = 'hunter2'; },
  // Not the default #4d7ef7: a fill that equals the starting value makes the
  // differential assertion below unfalsifiable. Caught by this sweep on its
  // first run, which is the rule earning its keep rather than being quoted.
  'arc-color-picker': (el) => { el.value = '#00ff88'; },
  'arc-inline-edit': (el) => { el.value = 'edited'; },
  'arc-masked-input': (el) => { el.value = '12042026'; },
  'arc-tree-select': (el) => { el.value = 'leaf'; },
  'arc-transfer-list': (el) => { el.value = ['a', 'b']; },
  'arc-signature-pad': (el) => { el.value = 'data:image/png;base64,iVBORw0KGgo='; },
  // Numeric controls: deliberately not their defaults, and not zero — a fill
  // that matches the starting value makes the differential assertion below
  // unfalsifiable, which is how range-slider's arithmetic mutants survived.
  'arc-knob': (el) => { el.value = 42; },
  'arc-number-input': (el) => { el.value = 42; },
  'arc-rating': (el) => { el.value = 4; },
  'arc-slider': (el) => { el.value = 42; },
  'arc-range-slider': (el) => { el.low = 20; el.high = 80; },
};

/**
 * Markup a control needs before it will accept a value at all. Kept separate
 * from FILL because it has to be present on the *unnamed* mount too.
 */
const SETUP = {
  // `mask` defaults to '', and conform('') accepts no characters — so an
  // unmasked masked-input rejects every assignment, including the one this
  // sweep makes. Not a defect; a masked input without a mask has no slots.
  'arc-masked-input': 'mask="##/##/####"',
};

/** Mount `tag` inside a real form — the only place submission is observable. */
async function inForm(tag, attrs = 'name="f"') {
  const form = mount(`<form><${tag} ${attrs} ${SETUP[tag] ?? ''}></${tag}></form>`);
  const el = form.firstElementChild;
  await settle(el);
  return { form, el };
}

const entries = (form, name = 'f') => new FormData(form).getAll(name);

afterEach(cleanup);

// ---------------------------------------------------------------------------
// The derivation itself
// ---------------------------------------------------------------------------

describe('the form-control sweep is complete', () => {
  it('every subject module imported', () => {
    expect(unimportable, 'a control that stops importing is a failure, not a smaller suite').to.eql(
      []
    );
  });

  it('found the form-associated controls', () => {
    // Anti-vacuity: an empty or near-empty derivation would make every `for`
    // loop below run zero times and the file pass green.
    expect(SUBJECTS.length).to.be.greaterThan(20);
  });

  it('every derived control has a fill', () => {
    // The maintenance point. A new form control joins this sweep by existing,
    // and fails here until someone says how to give it a value — rather than
    // being silently skipped, which is how the 14-of-26 hand list happened.
    const missing = SUBJECTS.map((s) => s.tag).filter((t) => !FILL[t]);
    expect(missing).to.eql([]);
  });

  it('every fill names a control that still exists', () => {
    const derived = new Set(SUBJECTS.map((s) => s.tag));
    expect(Object.keys(FILL).filter((t) => !derived.has(t))).to.eql([]);
  });
});

// ---------------------------------------------------------------------------
// The contract, across every control
// ---------------------------------------------------------------------------

describe('filling a control changes what the form submits', () => {
  for (const { tag } of SUBJECTS) {
    it(tag, async () => {
      // Differential rather than absolute: the submitted serialization differs
      // per control (a comma-joined range, a data URL, an ISO interval), but
      // "the form sends something different once the control has a value" is
      // the same contract for all of them — and it is precisely what a control
      // that never calls _updateFormValue() fails.
      const { form, el } = await inForm(tag);
      const before = entries(form).join('|');

      FILL[tag](el);
      await settle(el);
      const after = entries(form).join('|');

      expect(after, `${tag}: the form still submits ${JSON.stringify(before)}`).to.not.equal(before);
      expect(after.length, `${tag}: submitted an empty value`).to.be.greaterThan(0);
    });
  }
});

describe('a control with no name submits nothing', () => {
  for (const { tag } of SUBJECTS) {
    it(tag, async () => {
      // The platform keys submission on `name`, and several controls build
      // their own FormData — which would submit under whatever key they chose
      // if they did not check for a name first.
      const { form, el } = await inForm(tag, '');
      FILL[tag](el);
      await settle(el);

      expect([...new FormData(form).keys()], `${tag}: submitted without a name`).to.eql([]);
    });
  }
});

// ---------------------------------------------------------------------------
// The multi-entry controls — one name, several values
// ---------------------------------------------------------------------------

describe('multi-value controls submit one entry per value', () => {
  // These three override _formValue() to build a real FormData and append once
  // per selection, which is what makes `name="tags"` arrive server-side as a
  // list rather than as the string "a,b". Nothing asserted that until now.
  for (const tag of ['arc-multi-select', 'arc-tag-input', 'arc-transfer-list']) {
    it(tag, async () => {
      const { form, el } = await inForm(tag);
      el.value = ['a', 'b'];
      await settle(el);

      expect(entries(form), `${tag}: expected two separate entries`).to.eql(['a', 'b']);
    });
  }

  for (const tag of ['arc-multi-select', 'arc-tag-input', 'arc-transfer-list']) {
    it(`${tag}: falls back to a joined string with no name`, async () => {
      // The unnamed branch of the same override. It cannot be observed through
      // FormData — an unnamed control is not submitted at all — so this reads
      // the documented extension point directly.
      const { el } = await inForm(tag, '');
      el.value = ['a', 'b'];
      await settle(el);

      expect(el._formValue()).to.equal('a,b');
    });
  }

  it('an empty selection submits nothing', async () => {
    const { form, el } = await inForm('arc-multi-select');
    el.value = [];
    await settle(el);

    expect(entries(form)).to.eql([]);
  });
});

// ---------------------------------------------------------------------------
// The individually-shaped ones
// ---------------------------------------------------------------------------

describe('checkbox submission follows the platform', () => {
  it('an unchecked box submits nothing at all', async () => {
    const { form } = await inForm('arc-checkbox');
    expect([...new FormData(form).keys()]).to.eql([]);
  });

  it('a checked box with no value submits "on"', async () => {
    const { form, el } = await inForm('arc-checkbox');
    el.checked = true;
    await settle(el);

    expect(entries(form)).to.eql(['on']);
  });

  it('a checked box submits its own value when it has one', async () => {
    const { form, el } = await inForm('arc-checkbox', 'name="f" value="yes"');
    el.checked = true;
    await settle(el);

    expect(entries(form)).to.eql(['yes']);
  });
});

describe('range-slider submits both thumbs', () => {
  it('as a comma-joined pair', async () => {
    // Its submitted state lives in low/high rather than `value`, so the mixin's
    // updated() hook cannot see it — the component has to call
    // _updateFormValue() itself, and this is what proves it does.
    const { form, el } = await inForm('arc-range-slider');
    el.low = 20;
    el.high = 80;
    await settle(el);

    expect(entries(form)).to.eql(['20,80']);
  });
});

describe('date-range-picker submits an ISO interval', () => {
  it('once both ends are set', async () => {
    const { form, el } = await inForm('arc-date-range-picker');
    el.value = '2026-07-01/2026-07-10';
    await settle(el);

    expect(entries(form)).to.eql(['2026-07-01/2026-07-10']);
  });
});
