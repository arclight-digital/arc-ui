import { expect } from '@esm-bundle/chai';
import { mount, cleanup } from './helpers.js';

import '../src/input/button.register.js';
import '../src/input/input.register.js';
import '../src/input/select.register.js';
import '../src/input/textarea.register.js';
import '../src/input/number-input.register.js';
import '../src/typography/text.register.js';

/**
 * The role slots expose a weight as well as a family, because a face you assign
 * will not always ship the weight the role is set at — the label role is 600
 * across some fifty components, and a face whose heaviest cut is 500 gets
 * synthesised into smeared type. One token has to move all of them.
 *
 * The context weights (--section-title-weight, --body-weight, …) reference the
 * role weight rather than restating a number, so overriding the role reaches
 * everything wearing it. Same rule as the gradients and focus rings.
 */

const overrides = [];
function setToken(name, value) {
  document.documentElement.style.setProperty(name, value);
  overrides.push(name);
}

afterEach(() => {
  for (const name of overrides) document.documentElement.style.removeProperty(name);
  overrides.length = 0;
  cleanup();
});

// The role weights live at :root in base.css, so the real cascade needs it.
before(async () => {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = '/packages/web-components/src/base.css';
  const loaded = new Promise((res, rej) => {
    link.onload = res;
    link.onerror = () => rej(new Error('base.css failed to load'));
  });
  document.head.appendChild(link);
  await loaded;
});

function weightOf(host, selector) {
  const node = host.shadowRoot.querySelector(selector);
  expect(node, `expected ${selector} inside ${host.localName}`).to.exist;
  return getComputedStyle(node).fontWeight;
}

describe('role weight slots', () => {
  it('arc-button label text follows --font-label-weight', async () => {
    const el = mount('<arc-button>Go</arc-button>');
    await el.updateComplete;
    expect(weightOf(el, '.btn')).to.equal('600');

    setToken('--font-label-weight', '400');
    expect(weightOf(el, '.btn'), 'the button hardcoded 600 before this token').to.equal('400');
  });

  it('reaches a label in a different component from the same token', async () => {
    const el = mount('<arc-input label="Name"></arc-input>');
    await el.updateComplete;
    setToken('--font-label-weight', '300');
    expect(weightOf(el, '.input-group__label')).to.equal('300');
  });

  it('leaves the other roles alone', async () => {
    const el = mount('<arc-input label="Name"></arc-input>');
    await el.updateComplete;
    setToken('--font-label-weight', '300');
    expect(weightOf(el, '.input-group__field'), 'field text is not label-role').to.not.equal('300');
  });
});

describe('context weights derive from role weights', () => {
  it('--body-weight follows --font-body-weight', () => {
    const probe = document.createElement('div');
    probe.style.fontWeight = 'var(--body-weight)';
    document.body.appendChild(probe);
    expect(getComputedStyle(probe).fontWeight).to.equal('500');

    setToken('--font-body-weight', '200');
    expect(getComputedStyle(probe).fontWeight).to.equal('200');
  });

  it('--section-title-weight and --ui-accent-weight follow the label role', () => {
    const probe = document.createElement('div');
    document.body.appendChild(probe);
    setToken('--font-label-weight', '700');
    for (const token of ['--section-title-weight', '--ui-accent-weight']) {
      probe.style.fontWeight = `var(${token})`;
      expect(getComputedStyle(probe).fontWeight, `${token} should track the label role`).to.equal('700');
    }
  });

  it('heading, display-xl and wordmark weights follow the display role', () => {
    const probe = document.createElement('div');
    document.body.appendChild(probe);
    setToken('--font-display-weight', '800');
    for (const token of ['--heading-weight', '--display-xl-weight', '--wordmark-weight']) {
      probe.style.fontWeight = `var(${token})`;
      expect(getComputedStyle(probe).fontWeight, `${token} should track the display role`).to.equal('800');
    }
  });

  it('the display role is independent of the body role', () => {
    const probe = document.createElement('div');
    probe.style.fontWeight = 'var(--heading-weight)';
    document.body.appendChild(probe);
    setToken('--font-body-weight', '200');
    expect(getComputedStyle(probe).fontWeight, 'headings should not follow body weight').to.equal('500');
  });
});

describe('field text weight is one decision', () => {
  // Was 300 in arc-input, 400 in arc-select and arc-textarea, 500 in
  // arc-number-input — the same kind of text, to a user, at three weights.
  const cases = [
    ['<arc-input label="a"></arc-input>', '.input-group__field'],
    ['<arc-select label="a"></arc-select>', '.select__trigger'],
    ['<arc-textarea label="a"></arc-textarea>', 'textarea'],
    ['<arc-number-input label="a"></arc-number-input>', '.number-input__field'],
  ];

  it('renders every field at the same weight', async () => {
    const seen = [];
    for (const [html, selector] of cases) {
      const el = mount(html);
      await el.updateComplete;
      seen.push([el.localName, weightOf(el, selector)]);
    }
    const weights = new Set(seen.map(([, w]) => w));
    expect([...weights], `got ${JSON.stringify(seen)}`).to.deep.equal(['400']);
  });

  it('moves all four together from --field-weight', async () => {
    setToken('--field-weight', '600');
    for (const [html, selector] of cases) {
      const el = mount(html);
      await el.updateComplete;
      expect(weightOf(el, selector), `${el.localName} should follow --field-weight`).to.equal('600');
    }
  });
});
