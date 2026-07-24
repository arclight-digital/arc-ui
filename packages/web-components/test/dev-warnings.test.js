import { expect } from '@esm-bundle/chai';
import { mount, cleanup } from './helpers.js';

// Importing the module activates the document-wide observer for this page.
import '../src/dev.js';

const warnings = [];
const originalWarn = console.warn;

before(() => {
  console.warn = (msg) => warnings.push(String(msg));
});

after(() => {
  console.warn = originalWarn;
});

/** MutationObserver callbacks run at the microtask checkpoint. */
const settle = () => new Promise((r) => setTimeout(r));

describe('dev warnings', () => {
  beforeEach(() => {
    warnings.length = 0;
  });
  afterEach(cleanup);

  it('warns on invalid enum values', async () => {
    mount('<arc-button variant="primry">Go</arc-button>');
    await settle();
    expect(warnings.some((w) => w.includes('"primry" is not a valid variant') && w.includes('primary | secondary | ghost'))).to.be.true;
  });

  it('includes a docs link', async () => {
    mount('<arc-button size="xxl">Go</arc-button>');
    await settle();
    expect(warnings.some((w) => w.includes('https://arcui.dev/docs/components/button'))).to.be.true;
  });

  it('stays silent for valid usage', async () => {
    mount('<arc-button variant="secondary" size="lg" disabled>Go</arc-button>');
    await settle();
    expect(warnings).to.deep.equal([]);
  });

  it('suggests kebab-case for camelCase attributes', async () => {
    // HTML lowercases attribute names, so confirmLabel arrives as confirmlabel.
    mount('<arc-dialog confirmLabel="Yes"></arc-dialog>');
    await settle();
    expect(warnings.some((w) => w.includes('use "confirm-label"'))).to.be.true;
  });

  it('suggests near-miss attribute names', async () => {
    mount('<arc-button vairant="primary">Go</arc-button>');
    await settle();
    expect(warnings.some((w) => w.includes('did you mean "variant"'))).to.be.true;
  });

  it('ignores global and data attributes', async () => {
    mount('<arc-button class="x" id="y" data-test="z" aria-label="Go">Go</arc-button>');
    await settle();
    expect(warnings).to.deep.equal([]);
  });

  it('warns once per element and attribute value', async () => {
    const el = mount('<arc-button variant="primry">Go</arc-button>');
    await settle();
    el.setAttribute('variant', 'primry');
    await settle();
    expect(warnings.filter((w) => w.includes('primry')).length).to.equal(1);
  });

  it('catches attribute changes after mount', async () => {
    const el = mount('<arc-button variant="primary">Go</arc-button>');
    await settle();
    expect(warnings).to.deep.equal([]);
    el.setAttribute('variant', 'wrong');
    await settle();
    expect(warnings.some((w) => w.includes('"wrong" is not a valid variant'))).to.be.true;
  });
});
