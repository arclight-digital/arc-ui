/**
 * Components that were removed, and what to use instead.
 *
 * Every cut keeps its URL. `/docs/components/dock` still resolves — it renders
 * a tombstone rather than 404ing, because the link is already in someone's
 * bookmarks, someone's ticket, and the search index of every crawler that has
 * been here. A 404 tells a reader their memory is wrong; a tombstone tells them
 * what happened and where to go, which is the only thing they wanted.
 *
 * This is V4-PLAN ground rule 1, which is deliberately stricter for cuts than
 * for internal replacements: an internal replacement waits until its successor
 * is green in CI, but a *component* cut ships its tombstone at cut time, naming
 * the alternative — and naming it as forthcoming when the alternative is a
 * planned arc component that does not exist yet. `arc-tour` (V4-PLAN 4.8) is
 * that case for two of the five below, and these entries get updated when it
 * lands rather than left pointing at a promise.
 *
 * Kept separate from `data/components/` on purpose: a removed component has no
 * API surface, no preview and no examples, so a `ComponentDef` for one would be
 * nine tenths empty fields, and every consumer of `components` would need to
 * learn to skip it. The manifest would not have it either — `getApi()` throws on
 * an unknown tag, which is the guard that keeps the docs honest and is not worth
 * weakening for five pages.
 */

export interface RemovedComponent {
  name: string;
  slug: string;
  tag: string;
  /** The tier it was in, for the breadcrumb and the page badge. */
  tier: 'layout' | 'navigation' | 'content' | 'data' | 'typography' | 'input' | 'feedback';
  /** Release the removal shipped in. */
  removedIn: string;
  /** One sentence: what it was. Present tense is wrong here; it is gone. */
  was: string;
  /** Why it was cut. The honest reason, not a euphemism. */
  why: string;
  /** What to use instead. `forthcoming` marks an alternative that is planned but not yet shipped. */
  alternatives: Array<{ label: string; href?: string; note?: string; forthcoming?: boolean }>;
  /** Anchor in MIGRATION.md carrying the full entry. */
  migration: string;
}

export const removedComponents: RemovedComponent[] = [
  {
    name: 'Guided Tour',
    slug: 'guided-tour',
    tag: 'arc-guided-tour',
    tier: 'feedback',
    removedIn: 'v4.0.0',
    was: 'A multi-step product tour that dimmed the page and walked a user through a sequence of anchored steps.',
    why:
      'It shipped as stable while being unusable in the two ways that matter for a tour: a finished tour ' +
      'resumed at its last step instead of restarting, and the backdrop it drew over the page could not be ' +
      'dismissed from the keyboard at all. Both were structural rather than incidental — it targeted steps ' +
      'by CSS selector, which cannot reach into a shadow root, so a tour over this very library could not ' +
      'point at anything.',
    alternatives: [
      {
        label: 'arc-tour',
        forthcoming: true,
        note:
          'The rebuild, on the v4 overlay contract and taking element references rather than selectors — ' +
          'which is the fix for shadow-DOM targeting, by API design rather than by workaround.',
      },
      {
        label: 'Popover',
        href: '/docs/components/popover',
        note: 'For a single anchored explanation rather than a sequence.',
      },
    ],
    migration: '#the-five-cuts',
  },
  {
    name: 'Spotlight',
    slug: 'spotlight',
    tag: 'arc-spotlight',
    tier: 'feedback',
    removedIn: 'v4.0.0',
    was: 'A dimming overlay that cut a hole around one highlighted element on the page.',
    why:
      'Half of a tour with no tour around it. It found its target by CSS selector, so like Guided Tour it ' +
      'could not highlight anything inside a shadow root, and the two were only ever used together.',
    alternatives: [
      {
        label: 'arc-tour',
        forthcoming: true,
        note: 'Absorbs the highlight: a one-step tour is exactly this, and it takes an element reference.',
      },
    ],
    migration: '#the-five-cuts',
  },
  {
    name: 'Speed Dial',
    slug: 'speed-dial',
    tag: 'arc-speed-dial',
    tier: 'navigation',
    removedIn: 'v4.0.0',
    was: 'A floating action button that fanned out into a set of secondary actions.',
    why:
      'Three separate defects, all of them in the parts a consumer would hit first. Its closed actions ' +
      'stayed focusable and clickable — invisible controls a keyboard user could still activate. An ' +
      'unrecognised position anchored it nowhere at all rather than falling back. And the per-item ' +
      'value it documented was never emitted, so a handler could not tell which action fired. It also ' +
      'had no dismissal of any kind: no Escape, no outside click, no controller.',
    alternatives: [
      {
        label: 'Dropdown Menu',
        href: '/docs/components/dropdown-menu',
        note: 'A trigger with a set of actions, with the dismissal and keyboard contracts the fan never had.',
      },
      {
        label: 'Float Bar',
        href: '/docs/components/float-bar',
        note: 'When the actions should be visible rather than behind a trigger.',
      },
    ],
    migration: '#the-five-cuts',
  },
  {
    name: 'Dock',
    slug: 'dock',
    tag: 'arc-dock',
    tier: 'layout',
    removedIn: 'v4.0.0',
    was: 'An edge-snapped panel that auto-hid and slid back into view on hover near the viewport edge.',
    why:
      'With auto-hide set, the reveal was a bare CSS :hover rule and nothing else — no keyboard path, ' +
      'no touch path, so on a phone or from a keyboard the panel and everything in it were unreachable. ' +
      'The API described a component that was never built: open was documented as reflecting the ' +
      'hover-reveal state and arc-open/arc-close as firing on it, but nothing wrote open on hover, ' +
      'so neither happened. A _hovered state property was declared, assigned once in the constructor, ' +
      'and never read again. Fixing it means giving it a trigger, at which point it is a drawer.',
    alternatives: [
      {
        label: 'Drawer',
        href: '/docs/components/drawer',
        note: 'An edge panel that opens from a control, with focus handling and dismissal.',
      },
      {
        label: 'Toolbar',
        href: '/docs/components/toolbar',
        note: 'When the controls should stay visible rather than hide.',
      },
    ],
    migration: '#the-five-cuts',
  },
  {
    name: 'Event Calendar',
    slug: 'event-calendar',
    tag: 'arc-event-calendar',
    tier: 'data',
    removedIn: 'v4.0.0',
    was: 'A month grid that laid events out across days.',
    why:
      'It had no time-of-day support of any kind: events were whole-day blocks, with no start time, no end ' +
      'time, no week or day view, and no overlap handling. A calendar that cannot express "Tuesday at ' +
      '2pm" cannot express an appointment, which is what a calendar is for. This is a scope failure rather ' +
      'than a bug list — the missing 80% is the hard 80%, and building it properly is a component in its ' +
      'own right rather than a fix.',
    alternatives: [
      {
        label: 'Calendar',
        href: '/docs/components/calendar',
        note: 'For date selection, which is what most reaches for a calendar actually wanted.',
      },
      {
        label: 'Activity Heatmap',
        href: '/docs/components/activity-heatmap',
        note: 'For per-day density over a long span.',
      },
      {
        label: 'Integration recipe',
        href: '/docs/components/data-grid',
        note:
          'For real scheduling, drive a dedicated calendar library and use ARC for the surrounding UI — ' +
          'MIGRATION.md carries the recipe. ARC does not intend to ship a scheduler.',
      },
    ],
    migration: '#the-five-cuts',
  },
];

export const removedBySlug = new Map(removedComponents.map((c) => [c.slug, c]));
