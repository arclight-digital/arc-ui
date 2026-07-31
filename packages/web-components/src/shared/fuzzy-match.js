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
 * `prose` turns off subsequence matching, and it matters more than it sounds.
 * Subsequence is the right tool for a name — "cmdpal" should find "Command
 * Palette" — and actively wrong for a paragraph, because in 180 characters of
 * English almost any four letters appear in order somewhere. Left on, the query
 * "override a token" matched 375 of 1,377 indexed sections, ranked prop tables
 * above the theming guide, and highlighted a scatter of single letters that
 * read as a rendering bug. Long text has to be matched on contiguous runs.
 *
 * @returns {{score: number, indices: number[]}|null} null when the term does
 *   not appear at all. Callers treat null as "this item is out", so a
 *   multi-term query rejects an item as soon as one term misses.
 */
export function matchTerm(term, text, { prose = false } = {}) {
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

  // In prose, a contiguous run is the only kind of match worth having.
  if (prose) return null;

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
  let boundaryHits = 0;

  for (let i = 0; i < hay.length && ti < t.length; i++) {
    if (hay[i] !== t[ti]) continue;

    if (isBoundary(text, i)) { score += 90; boundaryHits++; }
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

  // Reject a match that is neither compact nor an acronym.
  //
  // A real abbreviation is one of two shapes. Either it is dense — "cmdpal"
  // covers eleven characters of "Command Palette" — or every character of it
  // begins a word, which is what an acronym is: "cp" spans the whole of
  // "Command Palette" and is still exactly what someone means by it.
  //
  // A coincidence is neither. "rtl" is a subsequence of "Avoiding the
  // Registration Flash" only because those three letters happen to fall in that
  // order across thirty characters, two of them mid-word. Without this rule
  // every three-letter query returned dozens of those and ranked them above the
  // page that actually discusses the subject.
  const spanned = indices[indices.length - 1] - indices[0] + 1;
  const isAcronym = boundaryHits === t.length;
  if (!isAcronym && spanned > t.length * 3) return null;

  return { score, indices };
}

const span = (start, length) =>
  Array.from({ length }, (_, i) => start + i);

/**
 * Score a query against an item's searchable fields.
 *
 * The label is weighted above the rest: an item whose *label* matches should
 * beat one where the same text turned up in prose, however well it scored
 * there. Weighting by multiplication rather than addition keeps that true
 * across tiers rather than only within one.
 *
 * Positions come back per rendered field, not as one list. Both the label and
 * the description are shown, and a result has to be able to say which of them
 * the query actually hit — a content result that lights up nothing has the same
 * problem as no highlight at all: the reader cannot see why it is in the list.
 * `keywords` gets no positions because it is never displayed.
 *
 * @param {string} query
 * @param {{label?: string, keywords?: string, description?: string}} fields
 * @returns {{score: number, label: number[], description: number[]}|null}
 */
export function matchItem(query, fields) {
  let terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return { score: 0, label: [], description: [] };

  // Drop single-character words from a multi-word query. Every term has to
  // match, so "override a token" would otherwise require the letter "a" to
  // appear alongside the other two — a real constraint that carries no
  // intent. Only when there are other terms: a query that *is* "a" still
  // means it.
  if (terms.length > 1) {
    const meaningful = terms.filter((t) => t.length > 1);
    if (meaningful.length > 0) terms = meaningful;
  }

  const label = fields.label || '';
  const keywords = fields.keywords || '';
  const description = fields.description || '';

  let total = 0;
  const labelHits = [];
  const descriptionHits = [];

  for (const term of terms) {
    const onLabel = matchTerm(term, label);
    const onKeywords = keywords ? matchTerm(term, keywords) : null;
    // Prose mode: a description is a paragraph, not a name. See matchTerm.
    const onDescription = description ? matchTerm(term, description, { prose: true }) : null;

    const candidates = [
      onLabel && { score: onLabel.score * 4, field: 'label', hit: onLabel },
      onKeywords && { score: onKeywords.score, field: 'keywords', hit: onKeywords },
      onDescription && { score: onDescription.score, field: 'description', hit: onDescription },
    ].filter(Boolean);

    // Every term has to land somewhere.
    if (candidates.length === 0) return null;

    const best = candidates.reduce((a, b) => (b.score > a.score ? b : a));
    total += best.score;

    // Highlight wherever the term was found in a *rendered* field, not only in
    // the field that won the score. A term matching both the title and the body
    // should light up in both — that is the reader's answer to "why this one".
    if (onLabel) labelHits.push(...onLabel.indices);
    if (onDescription) descriptionHits.push(...onDescription.indices);
  }

  const dedupe = (xs) => [...new Set(xs)].sort((a, b) => a - b);
  return { score: total, label: dedupe(labelHits), description: dedupe(descriptionHits) };
}

/**
 * Window a long string down to the part worth showing, around its first match.
 *
 * A section snippet is a couple of hundred characters and the match is often
 * not in the first forty, so showing the head of the string shows a result
 * whose relevance is invisible. This centres the window on the first hit and
 * re-bases the positions onto the returned text, so highlighting still lines up.
 *
 * Cuts on word boundaries where there is one nearby — a snippet starting
 * mid-word reads as damaged rather than as trimmed.
 *
 * @returns {{text: string, indices: number[]}}
 */
export function snippetAround(text, indices, width = 120) {
  if (!text) return { text: '', indices: [] };
  if (text.length <= width) return { text, indices };

  const first = indices.length ? indices[0] : 0;
  // Bias the window left of the match so there is a little context before it.
  let start = Math.max(0, first - Math.floor(width / 3));
  if (start > 0) {
    const space = text.indexOf(' ', start);
    if (space !== -1 && space - start < 15) start = space + 1;
  }
  let end = Math.min(text.length, start + width);
  if (end < text.length) {
    const space = text.lastIndexOf(' ', end);
    if (space > start && end - space < 15) end = space;
  }

  const lead = start > 0 ? '…' : '';
  const tail = end < text.length ? '…' : '';
  const offset = lead.length - start;

  return {
    text: lead + text.slice(start, end) + tail,
    indices: indices
      .filter((i) => i >= start && i < end)
      .map((i) => i + offset),
  };
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
