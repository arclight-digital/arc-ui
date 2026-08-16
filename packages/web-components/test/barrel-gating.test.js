import { expect } from '@esm-bundle/chai';
import { excludedFrom, HEAVY_DEPENDENCY_TAGS } from '../../../scripts/lib/barrel-rule.js';

/**
 * The rule that decides what leaves the default barrel, exercised against
 * catalogs the repo does not contain.
 *
 * `scripts/checks/barrel-gating.js` asserts the *outcome* — that the barrels on
 * disk match `excludedFrom` over the real catalog — and that is the assertion
 * that matters, because it reads what the generators actually wrote. But it can
 * only cover branches the real catalog reaches, and today it reaches two of
 * three: twelve `/marketing` components, three `/media`, one heavy dependency,
 * and **zero experimental**.
 *
 * That zero is not an accident of timing to wait out. 4.1 landed the
 * experimental gate deliberately *before* 4.8 adds the first experimental
 * component, so that no addition ever enters the barrel only to be removed from
 * it in the same major — removing a barrel entry is a breaking change even when
 * the component was never meant to be there. The whole point of landing it early
 * is that it is untested by the tree it was landed into, which is precisely the
 * situation the anti-vacuity discipline exists for.
 *
 * So `excludedFrom` takes the component map rather than reading the filesystem,
 * and these cases hand it one.
 */

/** A component record with only the fields `excludedFrom` reads. */
const comp = (tag, { group = null, status = 'stable' } = {}) => [tag, { tag, group, status }];

const catalog = (...entries) => new Map(entries);

describe('barrel gating: what leaves the default barrel', () => {
  it('keeps a plain stable app component in', () => {
    expect(excludedFrom(catalog(comp('arc-button')))).to.deep.equal(HEAVY_DEPENDENCY_TAGS);
  });

  it('excludes an experimental component', () => {
    const out = excludedFrom(catalog(comp('arc-tree-grid', { status: 'experimental' })));
    expect(out).to.include('arc-tree-grid');
  });

  it('does NOT exclude a beta component', () => {
    // Deliberate, and the case most likely to be "fixed" by someone assuming
    // every not-yet-stable status should hide. Beta is a promise about how much
    // the API may still move, not about whether the component is ready to be
    // found — and a beta nobody can import is a beta nobody evaluates.
    const out = excludedFrom(catalog(comp('arc-data-grid', { status: 'beta' })));
    expect(out).to.not.include('arc-data-grid');
  });

  it('excludes a grouped component whatever its status', () => {
    const out = excludedFrom(
      catalog(
        comp('arc-carousel', { group: 'marketing' }),
        comp('arc-knob', { group: 'media', status: 'beta' }),
      ),
    );
    expect(out).to.include('arc-carousel');
    expect(out).to.include('arc-knob');
  });

  it('lists a component excluded for two reasons once', () => {
    // Set-backed, so an experimental component in a group cannot produce a
    // duplicate tag. prism validates every barrelExclude entry as a tag name and
    // would not complain about a repeat, so a duplicate would be invisible.
    const out = excludedFrom(catalog(comp('arc-filter-chip', { group: 'marketing', status: 'experimental' })));
    expect(out.filter((t) => t === 'arc-filter-chip')).to.have.lengthOf(1);
  });

  it('always carries the heavy-dependency tags, even for an empty catalog', () => {
    // `barrelExclude` is what keeps shiki out of everyone's install. It must not
    // depend on anything being found on disk.
    expect(excludedFrom(catalog())).to.deep.equal(HEAVY_DEPENDENCY_TAGS);
  });

  it('returns tags sorted, so the generated wrapper diff is stable', () => {
    const out = excludedFrom(
      catalog(
        comp('arc-zeta', { status: 'experimental' }),
        comp('arc-alpha', { status: 'experimental' }),
        comp('arc-mid', { group: 'media' }),
      ),
    );
    expect(out).to.deep.equal([...out].sort());
  });

  it('excludes nothing on the strength of a tier or a name', () => {
    // Anti-vacuity for the rule itself: if `excludedFrom` ever grew a heuristic
    // — "anything in /marketing", "anything named arc-*-card" — this catches it.
    // Only the two declared axes may gate.
    const out = excludedFrom(
      catalog(
        comp('arc-cta-banner'),
        comp('arc-feature-card'),
        comp('arc-waveform'),
        comp('arc-marquee'),
      ),
    );
    expect(out).to.deep.equal(HEAVY_DEPENDENCY_TAGS);
  });
});
