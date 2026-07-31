import { expect } from '@esm-bundle/chai';
import { mount, cleanup } from './helpers.js';

import '../src/typography/keyboard-map.register.js';

afterEach(cleanup);

async function map(attrs = '') {
  const el = mount(`<arc-keyboard-map ${attrs}></arc-keyboard-map>`);
  await el.updateComplete;
  return el;
}

/** Distinct board key ids currently highlighted. */
function hitIds(el) {
  return new Set(
    [...el.shadowRoot.querySelectorAll('.key--hit')].map((k) => k.dataset.key)
  );
}

function board(el) {
  return el.shadowRoot.querySelector('.board');
}

describe('arc-keyboard-map chord parsing', () => {
  it('highlights all three keys of mod+shift+p, with mod resolved per platform', async () => {
    const mac = await map('platform="mac" highlight="mod+shift+p"');
    expect(hitIds(mac)).to.deep.equal(new Set(['meta', 'shift', 'p']));

    const win = await map('platform="win" highlight="mod+shift+p"');
    expect(hitIds(win)).to.deep.equal(new Set(['ctrl', 'shift', 'p']));
  });

  it('lights every physical instance of a highlighted modifier', async () => {
    const el = await map('platform="mac" highlight="shift"');
    const shifts = el.shadowRoot.querySelectorAll('.key--hit[data-key="shift"]');
    expect(shifts.length).to.equal(2);
  });

  it('normalizes hotkey-style aliases: cmd → meta, option → alt, escape → esc', async () => {
    const el = await map('platform="mac" highlight="cmd+option+k escape"');
    expect(hitIds(el)).to.deep.equal(new Set(['meta', 'alt', 'k', 'esc']));
  });

  it('accepts single keys', async () => {
    const el = await map('platform="mac" highlight="g"');
    expect(hitIds(el)).to.deep.equal(new Set(['g']));
  });
});

describe('arc-keyboard-map highlight forms', () => {
  it('accepts a comma-separated attribute string', async () => {
    const el = await map('platform="mac" highlight="mod+z, space"');
    expect(hitIds(el)).to.deep.equal(new Set(['meta', 'z', 'space']));
  });

  it('accepts a space-separated attribute string', async () => {
    const el = await map('platform="mac" highlight="mod+z space"');
    expect(hitIds(el)).to.deep.equal(new Set(['meta', 'z', 'space']));
  });

  it('accepts an array property and matches the string form', async () => {
    const fromString = await map('platform="mac" highlight="mod+z, mod+shift+z"');
    const el = await map('platform="mac"');
    el.highlight = ['mod+z', 'mod+shift+z'];
    await el.updateComplete;
    expect(hitIds(el)).to.deep.equal(hitIds(fromString));
    expect(hitIds(el)).to.deep.equal(new Set(['meta', 'z', 'shift']));
  });
});

describe('arc-keyboard-map layouts', () => {
  it('defaults to compact: no F-row, no nav cluster, Esc on the number row', async () => {
    const el = await map();
    expect(el.shadowRoot.querySelector('[data-key="f1"]')).to.not.exist;
    expect(el.shadowRoot.querySelector('[data-key="up"]')).to.not.exist;
    expect(el.shadowRoot.querySelector('[data-key="esc"]')).to.exist;
    expect(el.shadowRoot.querySelector('[data-key="backquote"]')).to.not.exist;
  });

  it('ansi adds the full F-row and the nav cluster', async () => {
    const el = await map('layout="ansi"');
    for (let i = 1; i <= 12; i++) {
      expect(el.shadowRoot.querySelector(`[data-key="f${i}"]`), `f${i}`).to.exist;
    }
    for (const id of ['insert', 'home', 'pageup', 'delete', 'end', 'pagedown', 'up', 'down', 'left', 'right']) {
      expect(el.shadowRoot.querySelector(`[data-key="${id}"]`), id).to.exist;
    }
  });

  it('an unknown layout value falls back to compact', async () => {
    const el = await map('layout="iso"');
    expect(el.shadowRoot.querySelector('[data-key="f1"]')).to.not.exist;
    expect(el.shadowRoot.querySelector('[data-key="esc"]')).to.exist;
  });
});

describe('arc-keyboard-map labels and caption', () => {
  it('renders key legends by default', async () => {
    const el = await map('platform="win"');
    const q = el.shadowRoot.querySelector('[data-key="q"]');
    expect(q.textContent.trim()).to.equal('Q');
  });

  it('labels="false" renders bare keycaps', async () => {
    const el = await map('labels="false"');
    expect(el.shadowRoot.querySelector('.key__legend')).to.not.exist;
    const q = el.shadowRoot.querySelector('[data-key="q"]');
    expect(q.textContent.trim()).to.equal('');
  });

  it('swaps modifier legends per platform', async () => {
    const mac = await map('platform="mac"');
    const win = await map('platform="win"');
    expect(mac.shadowRoot.querySelector('[data-key="meta"]').textContent.trim()).to.equal('⌘');
    expect(win.shadowRoot.querySelector('[data-key="meta"]').textContent.trim()).to.equal('Win');
  });

  it('renders a figcaption when caption is set, and none otherwise', async () => {
    const el = await map('caption="Transport controls"');
    const cap = el.shadowRoot.querySelector('figcaption');
    expect(cap).to.exist;
    expect(cap.textContent.trim()).to.equal('Transport controls');

    const bare = await map();
    expect(bare.shadowRoot.querySelector('figcaption')).to.not.exist;
  });
});

describe('arc-keyboard-map accessibility', () => {
  it('exposes role="img" with a label computed from the chords', async () => {
    const el = await map('platform="mac" highlight="mod+shift+p"');
    expect(board(el).getAttribute('role')).to.equal('img');
    expect(board(el).getAttribute('aria-label'))
      .to.equal('Keyboard diagram highlighting Cmd+Shift+P');
  });

  it('names win modifiers as words in the label', async () => {
    const el = await map('platform="win" highlight="mod+shift+p, alt+f4"');
    expect(board(el).getAttribute('aria-label'))
      .to.equal('Keyboard diagram highlighting Ctrl+Shift+P, Alt+F4');
  });

  it('falls back to a plain label with no highlights', async () => {
    const el = await map();
    expect(board(el).getAttribute('aria-label')).to.equal('Keyboard diagram');
  });

  it('hides key legends from assistive tech', async () => {
    const el = await map();
    const key = el.shadowRoot.querySelector('.key');
    expect(key.getAttribute('aria-hidden')).to.equal('true');
  });
});

describe('arc-keyboard-map unknown keys', () => {
  it('ignores an unknown key name without throwing', async () => {
    const el = await map('platform="mac" highlight="hyperdrive"');
    expect(hitIds(el).size).to.equal(0);
    expect(board(el).getAttribute('aria-label')).to.equal('Keyboard diagram');
  });

  it('keeps the known parts of a partly-unknown chord', async () => {
    const el = await map('platform="mac" highlight="banana+q"');
    expect(hitIds(el)).to.deep.equal(new Set(['q']));
  });

  it('a key absent from the current layout simply does not light', async () => {
    // f5 exists only on the ansi board; compact parses it but renders no key.
    const compact = await map('highlight="f5"');
    expect(compact.shadowRoot.querySelector('.key--hit')).to.not.exist;

    const ansi = await map('layout="ansi" highlight="f5"');
    expect(hitIds(ansi)).to.deep.equal(new Set(['f5']));
  });
});
