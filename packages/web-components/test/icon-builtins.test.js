/**
 * The built-in glyphs — what ARC's own chrome renders on a page with no pack.
 *
 * Reported against 4.2.2 (test-findings #102): arc-sheet's and arc-toast's close
 * buttons came out blank until the app imported `@arclux/arc-ui-icons`. The
 * console said why, but a component whose own affordance breaks without an
 * extra import is a trap however well it is explained.
 *
 * Its own file because the registry is module state. The first block needs a
 * page that never registered a library, and the second registers one, which
 * nothing can take back.
 */
import { expect } from '@esm-bundle/chai';
import { iconRegistry } from '../src/content/icon-registry.js';
import { builtinIcons } from '../src/content/icon-builtins.js';
import '../src/feedback/sheet.register.js';
import { mount, cleanup, until } from './helpers.js';

function capturingWarn() {
  const warnings = [];
  const real = console.warn;
  console.warn = (...args) => warnings.push(args.join(' '));
  return {
    warnings,
    restore: () => {
      console.warn = real;
    },
  };
}

describe('built-in glyphs on a page with no icon library', () => {
  afterEach(cleanup);

  it('resolves every built-in name, silently', async () => {
    const { warnings, restore } = capturingWarn();
    try {
      for (const name of Object.keys(builtinIcons)) {
        expect(await iconRegistry.get(name), name).to.equal(builtinIcons[name]);
        expect(iconRegistry.getSync(name), `${name}, synchronously`).to.equal(builtinIcons[name]);
      }
    } finally {
      restore();
    }
    expect(warnings).to.deep.equal([]);
  });

  it("draws arc-sheet's close button", async () => {
    const el = mount('<arc-sheet open heading="Sheet">Body</arc-sheet>');
    await el.updateComplete;
    const button = el.shadowRoot.querySelector('[part~="close"]');
    await until(() =>
      button.shadowRoot?.querySelector('arc-icon')?.shadowRoot?.querySelector('svg'),
    );
    const svg = button.shadowRoot.querySelector('arc-icon').shadowRoot.querySelector('svg');
    expect(svg.querySelector('path').getAttribute('d')).to.equal('M6 6l12 12M18 6L6 18');
  });

  it('still warns for a name outside the set', async () => {
    const { warnings, restore } = capturingWarn();
    try {
      expect(await iconRegistry.get('star')).to.equal(null);
    } finally {
      restore();
    }
    expect(warnings.length).to.equal(1);
    expect(warnings[0]).to.contain('star');
  });
});

describe('built-in glyphs under a registered library', () => {
  it("yields to the library's glyph, loaded or not", async () => {
    const lib = '<svg data-lib="x"></svg>';
    iconRegistry.register('test-pack', { icons: { x: () => Promise.resolve({ default: lib }) } });
    expect(iconRegistry.getSync('x'), 'not loaded yet: nothing, not the built-in').to.equal(null);
    expect(await iconRegistry.get('x')).to.equal(lib);
    expect(iconRegistry.getSync('x')).to.equal(lib);
  });

  it('fills a name the library lacks', async () => {
    expect(await iconRegistry.get('chevrons-left')).to.equal(builtinIcons['chevrons-left']);
  });

  it('resolves the library through its aliases before falling back', async () => {
    const lib = '<svg data-lib="caret"></svg>';
    iconRegistry.register('aliased-pack', {
      icons: { 'caret-left': lib },
      aliases: { 'chevron-left': 'caret-left' },
    });
    iconRegistry.use('aliased-pack');
    expect(await iconRegistry.get('chevron-left')).to.equal(lib);
  });
});
