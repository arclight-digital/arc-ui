/**
 * A page that registers its own glyphs and selects no library.
 *
 * `get()` consults the custom map *before* it asks for a library, so such a
 * page is a working page: every name it registered resolves, and only a name it
 * never registered reaches the no-library warning. The warning used to say
 * "every named icon renders as an empty slot" anyway, which reads as
 * "hand-registration is unsupported, install a pack" — and a consumer read it
 * exactly that way while their actual gap was one glyph. `arc-inline-edit`'s
 * `pencil` had been rendering as an empty slot for two minor versions, silently,
 * because they had registered only the icons they used directly.
 *
 * Its own file, not a case in icon-library.test.js: the registry is module
 * state, and that file selects a library and warns about it. A test of the
 * no-library branch has to start from a page that never selected one, which is
 * what a fresh module gives it.
 */
import { expect } from '@esm-bundle/chai';
import { iconRegistry } from '../src/content/icon-registry.js';

describe('the no-library warning on a hand-registered page', () => {
  it('names the glyph that missed and leaves the rest alone', async () => {
    iconRegistry.set({ x: '<svg id="x"></svg>' });

    const warnings = [];
    const realWarn = console.warn;
    console.warn = (...args) => warnings.push(args.join(' '));
    try {
      expect(await iconRegistry.get('x'), 'a registered glyph resolves').to.not.equal(null);
      expect(warnings, 'and says nothing').to.deep.equal([]);

      expect(await iconRegistry.get('pencil'), 'an unregistered one does not').to.equal(null);
    } finally {
      console.warn = realWarn;
    }

    expect(warnings.length, 'one line, not one per icon').to.equal(1);
    expect(warnings[0], 'names the glyph that missed').to.contain('pencil');
    expect(warnings[0], 'says where it was looked for').to.contain('custom icon map');
    expect(warnings[0], 'and counts what is working').to.contain('registered by hand');
    // The old wording, and the reason this file exists: it condemned the whole
    // page for one unregistered name.
    expect(warnings[0], 'does not condemn every icon on the page').to.not.contain(
      'every named icon renders as an empty slot',
    );
  });
});
