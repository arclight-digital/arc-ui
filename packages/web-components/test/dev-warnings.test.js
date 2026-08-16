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

  it('warns that a deprecated component is going away, and names the survivor', async () => {
    mount('<arc-separator></arc-separator>');
    await settle();
    const w = warnings.find((x) => x.includes('deprecated'));
    expect(w, warnings.join('\n')).to.be.a('string');
    expect(w).to.include('<arc-separator>');
    expect(w).to.include('<arc-divider>');
  });

  it('warns about the deprecation before an attribute problem on the same element', async () => {
    // Order matters here rather than being incidental: the element going away
    // is the more useful of the two, and a consumer who reads one line should
    // read that one. It also proves the attribute checks still run — an early
    // return after the deprecation warning would be a silent regression for
    // every deprecated component's remaining lifetime.
    mount('<arc-separator variant="dashd"></arc-separator>');
    await settle();
    const deprecated = warnings.findIndex((w) => w.includes('deprecated'));
    const badEnum = warnings.findIndex((w) => w.includes('is not a valid variant'));
    expect(deprecated, warnings.join('\n')).to.be.at.least(0);
    expect(badEnum, warnings.join('\n')).to.be.at.least(0);
    expect(deprecated).to.be.lessThan(badEnum);
  });

  it('says nothing about deprecation for a live component', async () => {
    // Anti-vacuity for the pair above: the warning has to be keyed on the
    // schema entry, not emitted for every arc-* element the observer sees.
    mount('<arc-divider></arc-divider>');
    await settle();
    expect(warnings.filter((w) => w.includes('deprecated'))).to.deep.equal([]);
  });

  it('suggests kebab-case for camelCase attributes', async () => {
    // HTML lowercases attribute names, so confirmLabel arrives as confirmlabel.
    // On arc-confirm since V4-SCOPE §3.3: `arc-dialog` is the modal primitive
    // now and has no confirm button to label.
    mount('<arc-confirm confirmLabel="Yes"></arc-confirm>');
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
