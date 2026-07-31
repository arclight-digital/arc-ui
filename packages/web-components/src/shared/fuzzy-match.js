/**
 * Fuzzy matching and ranking for the searchable list components.
 *
 * The palette used `haystack.includes(query)`, which is a filter rather than a
 * search: it cannot find "Command Palette" from "cmdpal", it has no opinion
 * about whether a hit is good, and results come back in DOM order — so a query
 * matching thirty items shows them alphabetically and buries the one the user
 * meant. This returns a score and the matched character positions, which is
 * what ranking and highlighting both need.
 *
 * ## What scores well, and why
 *
 * Five tiers, each an order of magnitude apart, so a better *kind* of match
 * always beats a longer worse one. "in" should surface "Input" ahead of
 * "Pagination", even though both contain it:
 *
 *   exact      the whole string is the query
 *   prefix     the string starts with the query
 *   boundary   the query starts at a word boundary ("pal" in "Command Palette")
 *   substring  the query appears somewhere contiguous
 *   subsequence the query's characters appear in order with gaps
 *
 * Within a tier, position and length break the tie: earlier is better, and a
 * shorter haystack is better because the match covers more of it. "modal"
 * against "Modal" beats "modal" against "Modal Dialog Wrapper".
 *
 * Acronyms are the case worth naming. Subsequence matching alone would rank
 * "cp" against "Command Palette" the same as against "Copy", but the first is
 * what a user typing an abbreviation means. Every character that lands on a
 * word boundary earns a bonus, so initials win without a separate code path.
 *
 * ## Multi-term queries
 *
 * A query is split on whitespace and every term must match somewhere, in any
 * order — "palette command" finds "Command Palette". Terms are scored
 * independently and summed, so the ordering of what the user typed does not
 * decide the ranking.
 */

/** Characters after which the next character starts a new word. */
const BOUNDARY_BEFORE = /[\s\-_/.:()[\]]/;

const isBoundary = (text, i) =>
  i === 0 ||
  BOUNDARY_BEFORE.test(text[i - 1]) ||
  // camelCase / PascalCase: a capital following a lowercase starts a word.
  (text[i] >= 'A' && text[i] <= 'Z' && text[i - 1] >= 'a' && text[i - 1] <= 'z');

const SCORE = {
  exact: 1_000_000,
  prefix: 100_000,
  boundary: 10_000,
  substring: 1_000,
  subsequence: 100,
};

/**
 * Score one term against one string.
 *
 * @returns {{score: number, indices: number[]}|null} null when the term does
 *   not appear at all. Callers treat null as "this item is out", so a
 *   multi-term query rejects an item as soon as one term misses.
 */
export function matchTerm(term, text) {
  if (!term) return { score: 0, indices: [] };
  if (!text) return null;

  const t = term.toLowerCase();
  const hay = text.toLowerCase();

  // Shorter haystacks score higher within a tier: the match covers more of the
  // string, so it is more likely to be what was meant. Capped so a very long
  // string cannot drag a good match below a worse one in the tier beneath.
  const brevity = Math.max(0, 100 - text.length);

  if (hay === t) {
    return { score: SCORE.exact + brevity, indices: span(0, t.length) };
  }

  const at = hay.indexOf(t);
  if (at === 0) {
    return { score: SCORE.prefix + brevity, indices: span(0, t.length) };
  }
  if (at > 0) {
    // Earlier is better; a boundary hit is a different tier from a hit that
    // lands mid-word, because "pal" in "Command Palette" is a word the user
    // could have been reaching for and "ale" in "Palette" is not.
    const tier = isBoundary(text, at) ? SCORE.boundary : SCORE.substring;
    return { score: tier + brevity - at, indices: span(at, t.length) };
  }

  return subsequence(t, text, hay, brevity);
}

/**
 * Greedy left-to-right subsequence walk.
 *
 * Greedy rather than optimal on purpose. Finding the best possible alignment
 * needs dynamic programming over query × text, and this runs on every keystroke
 * across every item; the greedy walk is linear and picks the same alignment as
 * the optimal one for the abbreviations people actually type. The boundary
 * bonus below is what recovers most of the difference: it is applied per
 * matched character, so an acronym alignment out-scores an accidental one even
 * when both are found greedily.
 */
function subsequence(t, text, hay, brevity) {
  const indices = [];
  let score = SCORE.subsequence + brevity;
  let ti = 0;
  let lastMatch = -1;

  for (let i = 0; i < hay.length && ti < t.length; i++) {
    if (hay[i] !== t[ti]) continue;

    if (isBoundary(text, i)) score += 90;
    // Consecutive characters read as a real fragment rather than as scattered
    // letters that happen to be in order.
    if (i === lastMatch + 1) score += 40;
    // Every skipped character is evidence the match is incidental.
    else if (lastMatch !== -1) score -= Math.min(20, i - lastMatch - 1);

    indices.push(i);
    lastMatch = i;
    ti++;
  }

  if (ti < t.length) return null;
  return { score, indices };
}

const span = (start, length) =>
  Array.from({ length }, (_, i) => start + i);

/**
 * Score a query against an item's searchable fields.
 *
 * Fields are weighted, and only the best-scoring field decides the tier — an
 * item whose *label* matches should beat one where the same text turned up in a
 * description, no matter how well. Weighting by multiplication rather than
 * addition keeps that true across tiers.
 *
 * `indices` come back only for the primary field, because that is the only one
 * rendered; highlighting a description the palette never shows would be work
 * with no output.
 *
 * @param {string} query
 * @param {{primary: string, secondary?: string[]}} fields
 * @returns {{score: number, indices: number[]}|null}
 */
export function matchItem(query, fields) {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return { score: 0, indices: [] };

  const primary = fields.primary || '';
  const secondary = (fields.secondary || []).filter(Boolean);

  let total = 0;
  let indices = [];

  for (const term of terms) {
    const onPrimary = matchTerm(term, primary);
    let best = onPrimary ? { ...onPrimary, score: onPrimary.score * 4 } : null;

    for (const field of secondary) {
      const hit = matchTerm(term, field);
      if (hit && (!best || hit.score > best.score)) {
        // Secondary hits contribute no indices — they are not rendered.
        best = { score: hit.score, indices: [] };
      }
    }

    // Every term has to land somewhere.
    if (!best) return null;

    total += best.score;
    if (onPrimary && best.indices.length) indices.push(...onPrimary.indices);
  }

  // Terms can overlap on the same characters; de-duplicate so highlighting
  // does not emit the same index twice.
  indices = [...new Set(indices)].sort((a, b) => a - b);
  return { score: total, indices };
}

/**
 * Split a string into alternating unmatched/matched runs for rendering.
 *
 * Returns `[{text, matched}]` rather than markup so the caller decides the
 * element — the palette wraps matches in <mark>, and a consumer templating this
 * differently is not forced through innerHTML.
 */
export function highlightRuns(text, indices) {
  if (!indices || indices.length === 0) return [{ text, matched: false }];

  const hit = new Set(indices);
  const runs = [];
  let current = '';
  let currentMatched = hit.has(0);

  for (let i = 0; i < text.length; i++) {
    const matched = hit.has(i);
    if (matched !== currentMatched) {
      if (current) runs.push({ text: current, matched: currentMatched });
      current = '';
      currentMatched = matched;
    }
    current += text[i];
  }
  if (current) runs.push({ text: current, matched: currentMatched });
  return runs;
}
