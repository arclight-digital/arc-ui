import { expect } from '@esm-bundle/chai';
import { sanitizeSvg } from '../src/content/sanitize-svg.js';
import { iconRegistry } from '../src/content/icon-registry.js';
import { generatedIconsPresent, ICONS_MISSING } from './helpers.js';

// Only the blocks that resolve a real glyph are gated — the scanner tests are
// pure string in, string out and must keep running on a fresh checkout, since
// they are the ones guarding against a `>` inside a quoted attribute.
const icons = await generatedIconsPresent();
const itIcons = icons ? it : it.skip;
const describeIcons = icons ? describe : describe.skip;
if (!icons) console.warn(`↷ sanitize-svg: real-icon tests skipped — ${ICONS_MISSING}`);

/**
 * arc-icon's sanitizer used to be DOMParser-based, which quietly made every
 * named icon impossible to server-render. The replacement parses the string
 * itself, so it needs its own tests: a hand-written scanner is exactly the kind
 * of code where `>` inside a quoted attribute truncates a tag and nobody
 * notices until an icon renders as half a path.
 */
describe('sanitizeSvg', () => {
  it('drops script elements and their contents', () => {
    const out = sanitizeSvg('<svg><script><circle r="1"/></script><path d="M0 0"/></svg>');
    expect(out).to.not.contain('script');
    expect(out).to.not.contain('circle');
    expect(out).to.contain('<path');
  });

  it('strips event handler attributes in any casing', () => {
    const out = sanitizeSvg('<svg ONLOAD="x()"><path onclick="y()" d="M0 0"/></svg>');
    expect(out.toLowerCase()).to.not.contain('onload');
    expect(out.toLowerCase()).to.not.contain('onclick');
    expect(out).to.contain('d="M0 0"');
  });

  it('drops foreignObject, which re-opens HTML parsing inside SVG', () => {
    const out = sanitizeSvg(
      '<svg><foreignObject><iframe src="evil"></iframe></foreignObject><path/></svg>'
    );
    expect(out).to.not.contain('iframe');
    expect(out).to.not.contain('foreign');
    expect(out).to.contain('<path');
  });

  it('allows same-document references but not remote ones', () => {
    expect(sanitizeSvg('<svg><use href="#local"/></svg>')).to.contain('#local');
    expect(sanitizeSvg('<svg><use href="https://evil.example/#x"/></svg>'))
      .to.not.contain('evil.example');
  });

  it('rejects a javascript: URL split by a control character', () => {
    // Browsers ignore the tab when resolving the scheme, so the check has to too.
    const out = sanitizeSvg('<svg><a href="java\tscript:alert(1)"><path/></a></svg>');
    expect(out).to.not.contain('script:');
  });

  it('does not truncate a tag at a > inside a quoted attribute', () => {
    const out = sanitizeSvg('<svg data-x="a>b"><path d="M0 0"/></svg>');
    expect(out).to.contain('a>b');
    expect(out).to.contain('<path');
  });

  it('discards anything outside the svg root', () => {
    const out = sanitizeSvg('<?xml version="1.0"?><!DOCTYPE svg><svg><path/></svg><trailing/>');
    expect(out.startsWith('<svg')).to.equal(true);
    expect(out.endsWith('</svg>')).to.equal(true);
    expect(out).to.not.contain('trailing');
  });

  it('drops comments without leaking their contents', () => {
    const out = sanitizeSvg('<svg><!-- <script>x</script> --><path/></svg>');
    expect(out).to.not.contain('script');
    expect(out).to.contain('<path');
  });

  it('keeps valueless attributes', () => {
    expect(sanitizeSvg('<svg><path hidden d="M0 0"/></svg>')).to.contain('hidden');
  });

  it('returns null when there is no svg root', () => {
    expect(sanitizeSvg('<div>nope</div>')).to.equal(null);
    expect(sanitizeSvg(null)).to.equal(null);
  });

  itIcons('leaves real icons from the shipped libraries intact', async function () {
    // First call pulls in the Phosphor resolver — a module with an entry for
    // every one of 1,500 glyphs — which is well past the 2s default.
    this.timeout(15000);
    // The sanitizer is only useful if it is not also destructive. A generated
    // icon set contains nothing it should strip, so element counts must match.
    const names = ['book-open', 'check', 'circle', 'gear'];
    await iconRegistry.preload(names);
    for (const name of names) {
      const raw = iconRegistry.getSync(name);
      expect(raw, `${name} should resolve`).to.be.a('string');
      const clean = sanitizeSvg(raw);
      const before = (raw.match(/<[a-zA-Z]/g) || []).length;
      const after = (clean.match(/<[a-zA-Z]/g) || []).length;
      expect(after, `${name} lost elements`).to.equal(before);
    }
  });
});

describeIcons('iconRegistry synchronous cache', () => {
  it('returns null before an icon is resolved and the source after', async function () {
    this.timeout(15000);
    expect(iconRegistry.getSync('anchor')).to.equal(null);
    await iconRegistry.preload(['anchor']);
    expect(iconRegistry.getSync('anchor')).to.contain('<svg');
  });

  it('skips unknown names rather than rejecting', async () => {
    await iconRegistry.preload(['definitely-not-an-icon-name']);
    expect(iconRegistry.getSync('definitely-not-an-icon-name')).to.equal(null);
  });
});
