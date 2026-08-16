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
import { matchItem, matchTerm, highlightRuns, snippetAround } from '../src/shared/fuzzy-match.js';

import '../src/feedback/command-palette.register.js';
import '../src/feedback/command-item.register.js';
import '../src/feedback/command-group.register.js';

/** Score `query` against `text`, or null when it does not match at all. */
const score = (query, text) => {
  const hit = matchItem(query, { label: text });
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


/**
 * Type into the palette's own field.
 *
 * `_query` is state; the input is how a query gets there, and going through it
 * also exercises the `@input` handler that a direct assignment skips.
 */
async function type(el, text) {
  const field = el.shadowRoot.querySelector('.palette__input');
  field.value = text;
  field.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
  await el.updateComplete;
}

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
    const onLabel = matchItem('dialog', { label: 'Dialog' });
    const onKeyword = matchItem('dialog', { label: 'Modal', keywords: 'dialog popup' });
    expect(onKeyword, 'keywords should still match').to.not.equal(null);
    expect(onLabel.score).to.be.greaterThan(onKeyword.score);
  });

  it('reports match positions per rendered field', () => {
    const hit = matchItem('mod', { label: 'Modal', keywords: 'dialog' });
    expect(hit.label).to.deep.equal([0, 1, 2]);
    expect(hit.description).to.deep.equal([]);

    // keywords are never displayed, so a keyword-only match lights up nothing.
    const viaKeyword = matchItem('popup', { label: 'Modal', keywords: 'popup' });
    expect(viaKeyword).to.not.equal(null);
    expect(viaKeyword.label).to.deep.equal([]);
    expect(viaKeyword.description).to.deep.equal([]);
  });

  it('lights up the description when that is where the query landed', () => {
    const hit = matchItem('token', {
      label: 'Theming',
      description: 'Override a token to restyle every component at once.',
    });
    expect(hit.label).to.deep.equal([]);
    expect(hit.description.length).to.be.greaterThan(0);
  });

  it('lights up both lines when a term is in both', () => {
    const hit = matchItem('theme', {
      label: 'Theme Synthesizer',
      description: 'Build a theme from two colours.',
    });
    expect(hit.label.length).to.be.greaterThan(0);
    expect(hit.description.length).to.be.greaterThan(0);
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
    await type(el, 'cp');
    expect(labels(el)[0]).to.equal('Command Palette');
  });

  it('matches on keywords that are never displayed', async () => {
    const el = await palette();
    el.open = true;
    await el.updateComplete;
    await type(el, 'popup');
    expect(labels(el)).to.deep.equal(['Modal']);
  });

  it('marks the matched characters', async () => {
    const el = await palette();
    el.open = true;
    await el.updateComplete;
    await type(el, 'mod');
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

describe('snippetAround', () => {
  const long =
    'Themes are controlled by the data-theme attribute on the html element. ' +
    'ARC UI ships three modes and a synthesizer for building your own palette.';

  it('leaves a short string alone', () => {
    const out = snippetAround('short enough', [0], 120);
    expect(out.text).to.equal('short enough');
    expect(out.indices).to.deep.equal([0]);
  });

  it('windows around the match rather than showing the head', () => {
    const at = long.indexOf('synthesizer');
    const out = snippetAround(long, [at], 60);
    expect(out.text).to.contain('synthesizer');
    expect(out.text.length).to.be.lessThan(long.length);
  });

  it('re-bases the positions onto the returned text', () => {
    const at = long.indexOf('synthesizer');
    const indices = Array.from({ length: 11 }, (_, i) => at + i);
    const out = snippetAround(long, indices, 60);
    const lit = out.indices.map((i) => out.text[i]).join('');
    expect(lit).to.equal('synthesizer');
  });

  it('marks where it cut', () => {
    const at = long.indexOf('synthesizer');
    const out = snippetAround(long, [at], 60);
    expect(out.text.startsWith('…')).to.equal(true);
  });
});

describe('subsequence discipline', () => {
  // Everything here is about one tension: subsequence matching is what makes
  // "cmdpal" find Command Palette, and is also what made a 1,400-section docs
  // index return hundreds of coincidences for any three letters.

  it('rejects a sparse coincidence', () => {
    // r…t…l are in order across thirty characters, two of them mid-word.
    expect(matchTerm('rtl', 'Avoiding the Registration Flash')).to.equal(null);
  });

  it('keeps a dense abbreviation', () => {
    expect(matchTerm('cmdpal', 'Command Palette')).to.not.equal(null);
    expect(matchTerm('dtbl', 'Data Table')).to.not.equal(null);
  });

  it('keeps an acronym however far it spans', () => {
    // Every character starts a word, which is what an acronym is — the span
    // rule must not punish it.
    expect(matchTerm('cp', 'Command Palette')).to.not.equal(null);
  });

  it('does not subsequence-match prose', () => {
    const prose = 'Themes are controlled by the data-theme attribute on the html element.';
    // Present as a subsequence, absent as a word — in prose only the word counts.
    expect(matchTerm('tact', prose, { prose: true })).to.equal(null);
    expect(matchTerm('theme', prose, { prose: true })).to.not.equal(null);
  });

  it('ignores single-letter words in a multi-word query', () => {
    // "a" carries no intent, and requiring it would exclude the right answers.
    const hit = matchItem('override a token', {
      label: 'Tokens',
      description: 'Override any token to restyle the library.',
    });
    expect(hit).to.not.equal(null);
  });

  it('still honours a query that is itself one character', () => {
    expect(matchItem('a', { label: 'Alert' })).to.not.equal(null);
  });
});

describe('result cap', () => {
  afterEach(cleanup);

  it('renders at most maxResults, after ranking', async () => {
    const items = Array.from({ length: 40 }, (_, i) => `<arc-command-item>Item ${i}</arc-command-item>`);
    const el = mount(`<arc-command-palette max-results="5">${items.join('')}</arc-command-palette>`);
    await el.updateComplete;
    await tick();
    el.open = true;
    await el.updateComplete;
    await type(el, 'item');

    expect(el.shadowRoot.querySelectorAll('.palette__item').length).to.equal(5);
  });
});
