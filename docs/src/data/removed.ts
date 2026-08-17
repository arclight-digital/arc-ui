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
 *
 * Since the pre-release housecleaning, the merge sources are here too: v4.0.0
 * removes them outright rather than deprecating them for a major, because v4
 * has never shipped and a deprecation period would be a promise to consumers
 * who cannot exist yet. Their entries differ from the cuts in tone — the cut
 * entries record defects, the merge entries record a survivor that can do the
 * job — and both name the exact translation, because that is the only thing
 * the reader wanted.
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
  {
    name: 'Modal',
    slug: 'modal',
    tag: 'arc-modal',
    tier: 'feedback',
    removedIn: 'v4.0.0',
    was: 'The general-purpose focus-trapping overlay — the same component that is now arc-dialog.',
    why:
      'A pure rename. The element is a dialog, the platform calls it a dialog, and "modal" named one ' +
      'of its behaviours rather than what it is. Removed rather than aliased because v4 never shipped: ' +
      'an alias tag would have served consumers who cannot exist yet.',
    alternatives: [
      {
        label: 'Dialog',
        href: '/docs/components/dialog',
        note: 'The same component — same props, events, parts and custom properties. Rename the tag and you are done.',
      },
    ],
    migration: '#arc-modal-is-arc-dialog-and-arc-dialog-is-not-what-it-was',
  },
  {
    name: 'Table',
    slug: 'table',
    tag: 'arc-table',
    tier: 'data',
    removedIn: 'v4.0.0',
    was: 'A static table fed positional arrays: `columns: ["A"]` and `rows: [["1"]]`.',
    why:
      'Merged into arc-data-grid, which took its `density` and `striped` on the way. One column model ' +
      'for the whole family: named keys rather than positions, so a column can move without every row ' +
      'moving with it.',
    alternatives: [
      {
        label: 'Data Grid',
        href: '/docs/components/data-grid',
        note: '`columns` become `[{ key, label }]` and each row an object keyed by them. `striped` defaults on — pass `no-striped` for the plain look.',
      },
    ],
    migration: '#the-merges',
  },
  {
    name: 'Data Table',
    slug: 'data-table',
    tag: 'arc-data-table',
    tier: 'data',
    removedIn: 'v4.0.0',
    was: 'A virtual-scrolling table configured by slotted <arc-column> children.',
    why:
      'Merged into arc-data-grid. The slotted column model was the one thing it had that the survivor ' +
      'does differently — an array of the same fields — and sorting generalises to the multi-sort ' +
      '`sort` array, where a single entry behaves exactly as `sort-column`/`sort-direction` did.',
    alternatives: [
      {
        label: 'Data Grid',
        href: '/docs/components/data-grid',
        note: 'Each <arc-column> becomes one entry of the `columns` array, same field names. Selection, virtual scrolling and `overscan` are unchanged.',
      },
    ],
    migration: '#the-merges',
  },
  {
    name: 'Column',
    slug: 'column',
    tag: 'arc-column',
    tier: 'content',
    removedIn: 'v4.0.0',
    was: "arc-data-table's declarative column definition — one element per column.",
    why:
      'Its only consumer was arc-data-table, and arc-data-grid takes its columns as an array rather ' +
      'than as slotted children, so there is no element for it to migrate to. It goes with its parent.',
    alternatives: [
      {
        label: 'Data Grid',
        href: '/docs/components/data-grid',
        note: 'One `columns` array entry per element; the field names carry over.',
      },
    ],
    migration: '#the-merges',
  },
  {
    name: 'Separator',
    slug: 'separator',
    tag: 'arc-separator',
    tier: 'content',
    removedIn: 'v4.0.0',
    was: 'A horizontal or vertical rule with dashed, dotted and fade variants.',
    why:
      'Merged into arc-divider, which gained `line`, `dashed`, `dotted` and `fade` to close the gap — ' +
      'it previously drew only the token gradient.',
    alternatives: [
      {
        label: 'Divider',
        href: '/docs/components/divider',
        note: '`orientation="vertical"` becomes the `vertical` flag; variants carry over unchanged.',
      },
    ],
    migration: '#the-merges',
  },
  {
    name: 'Key Value',
    slug: 'key-value',
    tag: 'arc-key-value',
    tier: 'data',
    removedIn: 'v4.0.0',
    was: 'A term-beside-detail pair list.',
    why:
      'Merged into arc-description-list, which gained `layout` to cover the horizontal arrangement ' +
      'this component defaulted to.',
    alternatives: [
      {
        label: 'Description List',
        href: '/docs/components/description-list',
        note: 'Add `layout="horizontal"` to keep this one’s default — the survivor defaults to stacked.',
      },
    ],
    migration: '#the-merges',
  },
  {
    name: 'KV Pair',
    slug: 'kv-pair',
    tag: 'arc-kv-pair',
    tier: 'data',
    removedIn: 'v4.0.0',
    was: 'A single term/detail pair.',
    why: 'Merged into arc-description-item along with its parent list.',
    alternatives: [
      {
        label: 'Description List',
        href: '/docs/components/description-list',
        note: '`label` becomes `term`; the `key`/`value` parts become `term`/`detail`.',
      },
    ],
    migration: '#the-merges',
  },
  {
    name: 'Cluster',
    slug: 'cluster',
    tag: 'arc-cluster',
    tier: 'layout',
    removedIn: 'v4.0.0',
    was: 'A wrapping horizontal group with gap and alignment.',
    why:
      'Merged into arc-stack: `<arc-stack direction="horizontal" wrap>` is exactly this component.',
    alternatives: [
      {
        label: 'Stack',
        href: '/docs/components/stack',
        note: 'The migration is four attributes, not two: arc-cluster also defaulted to `gap="sm"` and `align="center"`, where arc-stack defaults to `md` and `stretch`. `justify` spells the edge values `between` and `around`.',
      },
    ],
    migration: '#the-merges',
  },
  {
    name: 'OTP Input',
    slug: 'otp-input',
    tag: 'arc-otp-input',
    tier: 'input',
    removedIn: 'v4.0.0',
    was: 'A one-time-passcode entry of separated digit boxes.',
    why:
      'Merged into arc-pin-input — the same control, where `length` covers 4-vs-6 and `mask` covers ' +
      'the obscured variant.',
    alternatives: [
      {
        label: 'Pin Input',
        href: '/docs/components/pin-input',
        note: 'Props carry over; the `otp` part becomes `pin`.',
      },
    ],
    migration: '#the-feedback-family',
  },
  {
    name: 'Callout',
    slug: 'callout',
    tag: 'arc-callout',
    tier: 'content',
    removedIn: 'v4.0.0',
    was: 'An emphasised aside with a variant accent and a derived uppercase label.',
    why:
      'Merged into arc-alert, which gained `tip`, an `icon` slot and a `live` prop to absorb it.',
    alternatives: [
      {
        label: 'Alert',
        href: '/docs/components/alert',
        note: '`variant` carries over, `tip` included. The derived uppercase label has no equivalent — pass `heading` if you want one.',
      },
    ],
    migration: '#the-feedback-family',
  },
  {
    name: 'Snackbar',
    slug: 'snackbar',
    tag: 'arc-snackbar',
    tier: 'feedback',
    removedIn: 'v4.0.0',
    was: 'A bottom-anchored transient message with an action button.',
    why:
      'Merged into arc-toast, which covers every position this had and now fires `arc-action` beside ' +
      'calling the `action` callback — because a callback cannot be attached declaratively, and that ' +
      'is how snackbar consumers were listening.',
    alternatives: [
      {
        label: 'Toast',
        href: '/docs/components/toast',
        note: '`show({ message, action, actionLabel })` is unchanged.',
      },
    ],
    migration: '#the-feedback-family',
  },
  {
    name: 'Progress Toast',
    slug: 'progress-toast',
    tag: 'arc-progress-toast',
    tier: 'feedback',
    removedIn: 'v4.0.0',
    was: 'A toast carrying a progress track for long-running work.',
    why:
      'Merged into arc-toast as its progress mode: pass `progress` to `show()` and it renders the ' +
      'track, skips dedupe and never auto-dismisses.',
    alternatives: [
      {
        label: 'Toast',
        href: '/docs/components/toast',
        note: '`updateToast(id, { progress })`, `complete(id)` and the `arc-complete`/`arc-cancel` events keep their names.',
      },
    ],
    migration: '#the-feedback-family',
  },
  {
    name: 'Inline Message',
    slug: 'inline-message',
    tag: 'arc-inline-message',
    tier: 'feedback',
    removedIn: 'v4.0.0',
    was: 'A small status line placed beside or below another element, usually a form control.',
    why:
      'No single replacement, on purpose. Below a form control it duplicated what every control ' +
      'already renders itself — an `error` with its own part and the aria wiring done, which a ' +
      'sibling element cannot do for it. Standing alone, it was an alert in all but name.',
    alternatives: [
      {
        label: 'The control’s own error prop',
        note: 'Every form control renders one, with `part="error"` and the aria wiring already in place.',
      },
      {
        label: 'Alert',
        href: '/docs/components/alert',
        note: 'For a standalone message: `<arc-alert density="compact">`.',
      },
    ],
    migration: '#the-feedback-family',
  },
];

export const removedBySlug = new Map(removedComponents.map((c) => [c.slug, c]));
