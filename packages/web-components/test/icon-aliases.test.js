/**
 * Cross-library icon names.
 *
 * Phosphor and Lucide disagree about what common glyphs are called, and for the
 * carets they disagree completely — no spelling exists in both. A component that
 * hard-codes either one renders an empty box under the other library, silently,
 * which is how arc-transfer-list shipped four blank move buttons: it asked for
 * Lucide's `chevron-*` while the default library is Phosphor.
 *
 * scripts/check-icon-names.js stops a *new* name from being added that way.
 * These tests cover the other half — that the alias map actually resolves, in a
 * browser, under both libraries.
 */
import { expect } from '@esm-bundle/chai';
import { iconRegistry } from '../src/content/icon-registry.js';
import { generatedIconsPresent, ICONS_MISSING } from './helpers.js';

// Every test in this file resolves a real glyph, so the whole file is gated on
// the generated modules being present. See generatedIconsPresent().
const icons = await generatedIconsPresent();
const describeIcons = icons ? describe : describe.skip;
if (!icons) console.warn(`↷ icon-aliases: ${ICONS_MISSING}`);

const CROSS_LIBRARY = [
  'chevron-left', 'chevron-right', 'chevron-up', 'chevron-down',
  'chevrons-left', 'chevrons-right', 'dots-three',
];

// Each library's resolver is one dynamic import of ~1,500 lazy entries, and the
// first one takes longer than Mocha's 2s default. Warm both once here rather
// than letting whichever test happens to run first pay for it.
before(async function warmResolvers() {
  this.timeout(20_000);
  if (!icons) return;
  for (const library of ['phosphor', 'lucide']) {
    iconRegistry.use(library);
    await iconRegistry.get('plus');
  }
  iconRegistry.use('phosphor');
});

afterEach(() => iconRegistry.use('phosphor'));

describeIcons('icon names ARC UI components use resolve in both libraries', () => {
  for (const library of ['phosphor', 'lucide']) {
    for (const name of CROSS_LIBRARY) {
      it(`${library}: ${name}`, async () => {
        iconRegistry.use(library);
        const svg = await iconRegistry.get(name);
        expect(svg, `${name} is missing under ${library}`).to.be.a('string');
        expect(svg).to.contain('<svg');
      });
    }
  }
});

describeIcons('aliasing does not change what a name means for a consumer', () => {
  it('leaves an unaliased name alone', async () => {
    // `plus` exists under both spellings of its own accord.
    expect(await iconRegistry.get('plus')).to.contain('<svg');
    iconRegistry.use('lucide');
    expect(await iconRegistry.get('plus')).to.contain('<svg');
  });

  it('still returns null for a name that exists nowhere', async () => {
    expect(await iconRegistry.get('definitely-not-an-icon')).to.equal(null);
  });

  it('lets a custom icon win over an alias', async () => {
    iconRegistry.set({ 'chevron-right': '<svg data-custom="1"></svg>' });
    expect(await iconRegistry.get('chevron-right')).to.contain('data-custom');
  });
});
