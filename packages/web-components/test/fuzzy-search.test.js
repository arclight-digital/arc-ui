/**
 * Fuzzy matching, ranking, and the arc-select value contract.
 *
 * The ranking assertions are written as "A beats B" rather than as exact
 * scores. The scores are an implementation detail that should be free to move;
 * the orderings are the behaviour anyone actually notices, and they are what
 * regressed when the palette filtered with String.includes.
 */
import { expect } from '@esm-bundle/chai';
import { mount, cleanup, tick } from './helpers.js';
import { matchItem, matchTerm, highlightRuns } from '../src/shared/fuzzy-match.js';

import '../src/feedback/command-palette.register.js';
import '../src/feedback/command-item.register.js';
import '../src/feedback/command-group.register.js';

/** Score `query` against `text`, or null when it does not match at all. */
const score = (query, text) => {
  const hit = matchItem(query, { primary: text });
  return hit ? hit.score : null;
};

/** Assert `winner` outranks `loser` for `query`. */
const beats = (query, winner, loser) => {
  const w = score(query, winner);
  const l = score(query, loser);
  expect(w, `"${query}" should match "${winner}"`).to.be.a('number');
  expect(l, `"${query}" should match "${loser}"`).to.be.a('number');
  expect(w, `"${query}": "${winner}" should outrank "${loser}"`).to.be.greaterThan(l);
};

describe('fuzzy matching', () => {
  it('finds a subsequence the old substring filter could not', () => {
    expect(score('cmdpal', 'Command Palette')).to.be.a('number');
    expect(score('dtbl', 'Data Table')).to.be.a('number');
    // A typo that drops a letter still lands.
    expect(score('modl', 'Modal')).to.be.a('number');
  });

  it('rejects a query whose characters are not all present, in order', () => {
    expect(score('zzz', 'Command Palette')).to.equal(null);
    // Right letters, wrong order — subsequence is order-sensitive.
    expect(score('elap', 'Palette')).to.equal(null);
  });

  it('ranks by kind of match, not by whether one exists', () => {
    beats('in', 'Input', 'Number Input');      // prefix over word-boundary
    beats('in', 'Number Input', 'Pagination'); // word-boundary over mid-word
    beats('modal', 'Modal', 'Modal Dialog Wrapper'); // exact over prefix
  });

  it('prefers an acronym to an incidental subsequence', () => {
    // Both contain c…p in order; only one is what "cp" abbreviates.
    beats('cp', 'Command Palette', 'Copy Button');
  });

  it('accepts terms in any order', () => {
    expect(score('palette command', 'Command Palette')).to.be.a('number');
    expect(score('table data', 'Data Table')).to.be.a('number');
  });

  it('requires every term to match something', () => {
    expect(score('command nonsense', 'Command Palette')).to.equal(null);
  });

  it('lets a keyword match without letting it outrank a label match', () => {
    const onLabel = matchItem('dialog', { primary: 'Dialog' });
    const onKeyword = matchItem('dialog', { primary: 'Modal', secondary: ['dialog popup'] });
    expect(onKeyword, 'keywords should still match').to.not.equal(null);
    expect(onLabel.score).to.be.greaterThan(onKeyword.score);
  });

  it('reports match positions against the label only', () => {
    const hit = matchItem('mod', { primary: 'Modal', secondary: ['dialog'] });
    expect(hit.indices).to.deep.equal([0, 1, 2]);

    // A secondary-only match has nothing to highlight in the label.
    const viaKeyword = matchItem('popup', { primary: 'Modal', secondary: ['popup'] });
    expect(viaKeyword).to.not.equal(null);
    expect(viaKeyword.indices).to.deep.equal([]);
  });

  it('is case-insensitive but reports indices into the original text', () => {
    const hit = matchTerm('cp', 'Command Palette');
    expect(hit).to.not.equal(null);
    expect(hit.indices.map((i) => 'Command Palette'[i]).join('')).to.equal('CP');
  });
});

describe('highlightRuns', () => {
  it('splits a label into alternating matched and unmatched runs', () => {
    expect(highlightRuns('Modal', [0, 1, 2])).to.deep.equal([
      { text: 'Mod', matched: true },
      { text: 'al', matched: false },
    ]);
  });

  it('returns one unmatched run when nothing matched', () => {
    expect(highlightRuns('Modal', [])).to.deep.equal([{ text: 'Modal', matched: false }]);
  });

  it('round-trips the original text exactly', () => {
    const text = 'Command Palette';
    const runs = highlightRuns(text, matchTerm('cp', text).indices);
    expect(runs.map((r) => r.text).join('')).to.equal(text);
  });
});

describe('arc-command-palette search', () => {
  afterEach(cleanup);

  async function palette() {
    const el = mount(`
      <arc-command-palette>
        <arc-command-group heading="Guides">
          <arc-command-item value="/guide/tokens">Design Tokens</arc-command-item>
        </arc-command-group>
        <arc-command-group heading="Components">
          <arc-command-item value="/c/modal" keywords="dialog popup">Modal</arc-command-item>
          <arc-command-item value="/c/command-palette">Command Palette</arc-command-item>
          <arc-command-item value="/c/copy-button">Copy Button</arc-command-item>
        </arc-command-group>
      </arc-command-palette>
    `);
    await el.updateComplete;
    await tick();
    return el;
  }

  const labels = (el) =>
    [...el.shadowRoot.querySelectorAll('.palette__item-label')].map((n) => n.textContent.trim());

  it('keeps author order when nothing is typed', async () => {
    const el = await palette();
    el.open = true;
    await el.updateComplete;
    expect(labels(el)).to.deep.equal(['Design Tokens', 'Modal', 'Command Palette', 'Copy Button']);
  });

  it('ranks the acronym match first', async () => {
    const el = await palette();
    el.open = true;
    await el.updateComplete;
    el._query = 'cp';
    await el.updateComplete;
    expect(labels(el)[0]).to.equal('Command Palette');
  });

  it('matches on keywords that are never displayed', async () => {
    const el = await palette();
    el.open = true;
    await el.updateComplete;
    el._query = 'popup';
    await el.updateComplete;
    expect(labels(el)).to.deep.equal(['Modal']);
  });

  it('marks the matched characters', async () => {
    const el = await palette();
    el.open = true;
    await el.updateComplete;
    el._query = 'mod';
    await el.updateComplete;
    const mark = el.shadowRoot.querySelector('.palette__item-match');
    expect(mark, 'a match should be marked').to.exist;
    expect(mark.textContent).to.equal('Mod');
  });

  it('carries the item value on arc-select, per the v3 event contract', async () => {
    const el = await palette();
    el.open = true;
    await el.updateComplete;

    let detail = null;
    el.addEventListener('arc-select', (e) => { detail = e.detail; });
    el.shadowRoot.querySelector('.palette__item').click();

    expect(detail, 'arc-select should fire').to.not.equal(null);
    expect(detail.value).to.equal('/guide/tokens');
  });

  it('falls back to the label when an item sets no value', async () => {
    const el = mount(`
      <arc-command-palette><arc-command-item>Plain</arc-command-item></arc-command-palette>
    `);
    await el.updateComplete;
    await tick();
    el.open = true;
    await el.updateComplete;

    let detail = null;
    el.addEventListener('arc-select', (e) => { detail = e.detail; });
    el.shadowRoot.querySelector('.palette__item').click();
    expect(detail.value).to.equal('Plain');
  });
});
