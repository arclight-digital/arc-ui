/**
 * Conformance — the declared *surface*: slots, css parts, and mounting.
 *
 * Companion to conformance.test.js, which covers the declared prop contract.
 * Same principle and the same guarantee: every assertion is derived from
 * `custom-elements.json`, so a component is covered by documenting itself and
 * there is no table to keep in step.
 *
 * This is the runtime half of what `doc-claims.js` checks statically. That check
 * verifies a documented part or slot *appears in the source*; it cannot verify
 * that anything reaches the rendered output. The gap is not hypothetical —
 * 2.11.0 shipped wrappers with the default slot deleted, and prism grew its own
 * read-back check afterwards precisely because "the inputs looked right and the
 * output was not".
 *
 * On assertion direction, which decides whether a suite like this is usable:
 *
 *   - **Slot projection** is asserted forward (declared → works). Content put
 *     into a declared slot must actually be assigned somewhere. Low false
 *     positive rate: a component that documents a slot and drops the content
 *     is broken by any reading.
 *
 *   - **Parts** are asserted *backwards* (rendered → declared). A blanket
 *     "every declared part renders" fails honestly-conditional parts —
 *     arc-carousel's `dot` needs slides, `arrow-prev` needs `showArrows` — and a
 *     suite that cries wolf gets deleted. The inverse has no such problem: a
 *     `part=` in the output that nobody documented is a documentation gap with
 *     no legitimate explanation, and it is the direction nothing else covers.
 */
import { expect } from '@esm-bundle/chai';
import { mount, cleanup, settle } from './helpers.js';
import { declaredProps } from '../src/shared/props.js';

const manifest = await fetch(new URL('../custom-elements.json', import.meta.url)).then((r) =>
  r.json(),
);

const ONLY = globalThis.__ARC_CONFORMANCE_ONLY__ ?? null;

const components = manifest.modules
  .flatMap((m) => (m.declarations ?? []).map((d) => ({ ...d, path: m.path })))
  .filter((d) => d.tagName)
  .filter((d) => !ONLY || ONLY.includes(d.tagName));

for (const c of components) {
  try {
    await import(/* @vite-ignore */ new URL(`../${c.path.replace(/\.js$/, '.register.js')}`, import.meta.url).href);
  } catch {
    // conformance.test.js owns the "every module imports" assertion; a module
    // that cannot load is reported there rather than twice.
  }
}

const LIVE = components.filter((c) => customElements.get(c.tagName));

afterEach(() => cleanup());

/**
 * ARIA attributes where an empty value is a deliberate statement rather than a
 * slip, so the sweep below must not flag them.
 *
 * Only one so far, and its reasoning is in ListboxController: an
 * `aria-activedescendant` pointing at an option that has been removed is worse
 * than none at all — assistive technology then announces *nothing* — so the
 * controller returns `''` when there is no active option rather than dropping
 * the attribute. Four components take it that way. Anything added here needs a
 * comparable argument written down at the source.
 */
const EMPTY_IS_MEANINGFUL = new Set(['aria-activedescendant']);

describe('surface discovery', () => {
  it('discovers components to verify', () => {
    expect(LIVE.length, 'no components registered').to.be.greaterThan(ONLY ? 0 : 150);
  });
});

for (const c of LIVE) {
  const tag = c.tagName;
  const slots = c.slots ?? [];
  const parts = (c.cssParts ?? []).map((p) => p.name);

  describe(`${tag} — declared surface`, () => {
    it('mounts and attaches a shadow root without a console error', async () => {
      const errors = [];
      const real = console.error;
      console.error = (...a) => errors.push(a.join(' '));
      try {
        const el = mount(`<${tag}></${tag}>`);
        await settle(el);
        expect(el.shadowRoot, `${tag} has no shadow root`).to.not.equal(null);
        expect(errors, `${tag} logged: ${errors.join(' | ')}`).to.have.lengthOf(0);
      } finally {
        console.error = real;
      }
    });

    it('renders no empty ARIA attribute', async () => {
      // The runtime half of scripts/checks/empty-attributes.js, and the reason
      // it is here rather than there: that check reads source and states its own
      // blind spots — it skips any expression containing braces of its own. In
      // Lit only `nothing` removes an attribute; `undefined` and `null` are
      // stringified, so `aria-expanded=${cond ? x : undefined}` ships
      // `aria-expanded=""`. An empty string is not a valid value for an
      // enumerated ARIA state and is an IDREF list pointing at nothing.
      // Findings #24, #25 and #36 were five instances of it.
      const el = mount(`<${tag}></${tag}>`);
      await settle(el);
      if (!el.shadowRoot) return;

      const empty = [...el.shadowRoot.querySelectorAll('*')]
        .flatMap((node) =>
          [...node.attributes]
            .filter((a) => a.name.startsWith('aria-') && a.value === '')
            .filter((a) => !EMPTY_IS_MEANINGFUL.has(a.name))
            .map((a) => `${node.localName}[${a.name}]`),
        );

      expect(empty, `${tag} renders ${empty.join(', ')}`).to.eql([]);
    });

    for (const slot of slots) {
      // `@slot none` is this library's way of documenting "no slots"; it is a
      // statement of absence, not a slot called "none".
      if (slot.name === 'none') continue;
      // `@slot item-${index}` documents a *pattern*, not a name — the slot is
      // generated per row. There is no literal attribute a consumer can write,
      // so there is nothing here to project into. Worth knowing that the name
      // reaches custom-elements.json and the docs site verbatim, template
      // syntax and all.
      if (slot.name.includes('${')) continue;

      const label = slot.name === '' ? 'the default slot' : `the "${slot.name}" slot`;
      it(`projects content into ${label}`, async () => {
        const marker = 'conformance-slot-probe';
        const child =
          slot.name === ''
            ? `<span data-probe="${marker}">x</span>`
            : `<span slot="${slot.name}" data-probe="${marker}">x</span>`;
        const el = mount(`<${tag}>${child}</${tag}>`);
        await settle(el);

        let probe = el.querySelector(`[data-probe="${marker}"]`);
        expect(probe, 'the probe should still be in the light DOM').to.not.equal(null);

        // assignedSlot is the browser's own answer to "did this get projected",
        // and it is true through nested slots, which several components use.
        if (probe.assignedSlot !== null) return;

        // Not projected in the default configuration — which is legitimate for a
        // slot that only exists in one variant, as arc-auth-shell's `aside` only
        // renders when `variant="split"`. Rather than carry a list of such
        // exceptions, derive the configurations: retry once per declared enum
        // value. The claim being tested is that the documented slot works in
        // *some* documented configuration, not in the default one.
        const Ctor = customElements.get(tag);
        const enums = declaredProps(Ctor).filter(([, meta]) => meta.kind === 'enum');
        const tried = [];
        for (const [prop, meta] of enums) {
          const propAttr = prop.replace(/[A-Z]/g, (ch) => `-${ch.toLowerCase()}`);
          for (const value of meta.values) {
            cleanup();
            const variantEl = mount(`<${tag} ${propAttr}="${value}">${child}</${tag}>`);
            await settle(variantEl);
            probe = variantEl.querySelector(`[data-probe="${marker}"]`);
            if (probe?.assignedSlot) return;
            tried.push(`${propAttr}="${value}"`);
          }
        }

        expect.fail(
          `content in ${label} of ${tag} is not assigned to any slot — it renders nowhere. ` +
            `Tried the default configuration${tried.length ? ` and ${tried.join(', ')}` : ''}.`,
        );
      });
    }

    if (parts.length) {
      it('declares every part it renders', async () => {
        const el = mount(`<${tag}></${tag}>`);
        await settle(el);

        const rendered = new Set();
        for (const node of el.shadowRoot.querySelectorAll('[part]')) {
          for (const p of node.getAttribute('part').split(/\s+/).filter(Boolean)) rendered.add(p);
        }

        const undocumented = [...rendered].filter((p) => !parts.includes(p));
        expect(
          undocumented,
          `${tag} renders part(s) it does not document: ${undocumented.join(', ')} ` +
            `— consumers cannot style what is not in the API`,
        ).to.have.lengthOf(0);
      });
    }
  });
}
