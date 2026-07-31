/**
 * The utility layer, generated from the same token tree the components compile
 * against.
 *
 * ARC components own everything inside their shadow boundary and nothing
 * outside it, so every consumer ends up hand-writing the same flex, gap and
 * padding CSS around them — against 381 custom properties that base.css already
 * publishes with no ergonomic way to use them. This is that surface.
 *
 * **What makes it not a worse Tailwind.** These classes are generated from
 * `tokens.js`, so `.arc-p-md` and an `arc-card`'s internal padding resolve to
 * the same value, and a consumer who overrides `--space-md` moves both at once.
 * A general-purpose utility framework cannot do that; it does not know the
 * components exist. Every declaration therefore reads a `var()` rather than the
 * literal — inlining the value would sever exactly the link that justifies this
 * file.
 *
 * **Light DOM only.** A class cannot cross a shadow boundary, so these style
 * the layout *around* components, never anything inside one. That is a real
 * limit and better said plainly than discovered.
 *
 * **Prefixed, and it has to be.** Consumers run Tailwind or Bootstrap;
 * unprefixed `.flex` and `.gap-2` would collide catastrophically. It costs the
 * terseness that makes utilities pleasant, and there is no way around it for a
 * library.
 *
 * Opt-in: `@arclux/arc-ui/utilities.css` is a separate import, so nobody who
 * only wants the tokens pays for it.
 */

/** The spacing steps, in the order they should appear. */
const SPACE_KEYS = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl'];

/** Radii, from the same tree. */
const RADIUS_KEYS = ['xs', 'sm', 'md', 'lg', 'xl', 'full'];

/** Shadows. */
const SHADOW_KEYS = ['xs', 'sm', 'md', 'lg', 'xl', 'overlay', 'inset'];

/**
 * The type *scale*, not the semantic sizes.
 *
 * `tokens.fontSize` also carries `heading`, `body`, `wordmark` and friends,
 * which exist so components can describe their own roles. Exposing those as
 * utilities would invite consumers to reach past the component for something
 * the component already decides.
 */
const TEXT_SIZE_KEYS = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'];

/** Foreground colours, as they are named in the token tree. */
const TEXT_COLORS = ['primary', 'secondary', 'muted', 'ghost'];

/** Background surfaces. */
const BG_COLORS = ['deep', 'surface', 'base', 'card', 'elevated'];

/** Border colours. */
const BORDER_COLORS = ['subtle', 'default', 'bright'];

/** Accent and status colours, available as both foreground and background. */
const ACCENT_COLORS = [
  'accent-primary', 'accent-secondary', 'success', 'error', 'warning', 'info',
];

/**
 * The token behind an accent/status class. The class name is the bare key
 * (.arc-text-success), but base.css publishes the status colours under the
 * --color-* prefix — var(--success) does not exist and resolves to nothing.
 * The accents really are bare (--accent-primary), so only the statuses map.
 */
const STATUS_KEYS = new Set(['success', 'error', 'warning', 'info']);
const accentVar = (k) => (STATUS_KEYS.has(k) ? `--color-${k}` : `--${k}`);

/** The five font roles. Components read these; so should layout around them. */
const FONT_ROLES = ['body', 'label', 'mono', 'display', 'quote'];

/**
 * Logical-property pairs for spacing.
 *
 * Logical throughout, never `left`/`right`: v3 committed to logical properties
 * so a layout mirrors under `dir="rtl"` without a second stylesheet, and a
 * utility layer that emitted physical sides would quietly reintroduce the
 * problem at the one place consumers write the most CSS.
 */
const SIDES = [
  ['', ''],                       // all sides
  ['x', '-inline'],
  ['y', '-block'],
  ['s', '-inline-start'],
  ['e', '-inline-end'],
  ['t', '-block-start'],
  ['b', '-block-end'],
];

const rule = (selector, declarations) => `.arc-${selector} { ${declarations} }`;

/**
 * What a step on a t-shirt scale looks like: `xs`, `sm`, `md`, `lg`, `xl`,
 * `2xl`, `3xl`, `2xs`.
 */
const SCALE_STEP = /^(?:xs|sm|md|lg|xl|\d+x[sl])$/;

/**
 * Keep the two vocabularies sharing `--text-*` from ever converging.
 *
 * `--text-md` is a size and `--text-primary` is a colour, so `.arc-text-*` is
 * deliberately both — the class name is the token name, which is the point.
 * That only works because the key sets are disjoint *by shape*: sizes are scale
 * steps, colours are semantic words.
 *
 * `assertNoCollisions` below catches the failure, but only once it has already
 * happened. This catches the cause: a colour named `md`, or a size named
 * `primary`, fails here naming the mistake rather than three steps later naming
 * a duplicate selector.
 */
function assertNamespaceShapes() {
  for (const key of [...TEXT_COLORS, ...ACCENT_COLORS]) {
    if (!SCALE_STEP.test(key)) continue;
    throw new Error(
      `utilities: the colour "${key}" is shaped like a step on the type scale, `
      + 'and both emit .arc-text-* classes from the same token prefix.\n'
      + 'Foreground colours must stay semantic words (primary, muted, …) and '
      + 'sizes must stay scale steps (xs, md, 2xl, …), or --text-* stops '
      + 'saying which kind of thing it is.',
    );
  }
  for (const key of TEXT_SIZE_KEYS) {
    if (SCALE_STEP.test(key)) continue;
    throw new Error(
      `utilities: the type size "${key}" is not shaped like a scale step, so it `
      + 'can collide with a foreground colour of the same name in .arc-text-*.\n'
      + 'The semantic sizes (heading, body, …) are for components to read, not '
      + 'for consumers to reach past them with.',
    );
  }
}

/**
 * Fail rather than emit two rules with the same name.
 *
 * The backstop to `assertNamespaceShapes`: that one guards the case we know
 * about, this one catches any pair from any two groups, including one nobody
 * anticipated. Without it the loser is whichever rule the cascade reaches
 * second, silently.
 */
function assertNoCollisions(rules) {
  const seen = new Map();
  for (const line of rules) {
    const selector = line.match(/^\.([a-z0-9-]+) /)?.[1];
    if (!selector) continue;
    if (seen.has(selector)) {
      throw new Error(
        `utilities: two rules both define .${selector}\n`
        + `  ${seen.get(selector)}\n  ${line}\n`
        + 'Class names come from token names, so this means two token groups '
        + 'now share a key. Rename one, or give its utility group its own '
        + 'prefix.',
      );
    }
    seen.set(selector, line);
  }
}

function section(title, rules) {
  return `\n/* ── ${title} ── */\n${rules.join('\n')}`;
}

/** Build the utility stylesheet. */
export function generateUtilitiesCSS() {
  const groups = [];

  // ── Spacing ──────────────────────────────────────────────────────────────
  const padding = [];
  const margin = [];
  for (const [suffix, axis] of SIDES) {
    for (const key of SPACE_KEYS) {
      padding.push(rule(`p${suffix}-${key}`, `padding${axis}: var(--space-${key});`));
      margin.push(rule(`m${suffix}-${key}`, `margin${axis}: var(--space-${key});`));
    }
    padding.push(rule(`p${suffix}-0`, `padding${axis}: 0;`));
    margin.push(rule(`m${suffix}-0`, `margin${axis}: 0;`));
    margin.push(rule(`m${suffix}-auto`, `margin${axis}: auto;`));
  }
  groups.push(section('Padding', padding));
  groups.push(section('Margin', margin));

  const gaps = [];
  for (const key of SPACE_KEYS) {
    gaps.push(rule(`gap-${key}`, `gap: var(--space-${key});`));
    gaps.push(rule(`gap-x-${key}`, `column-gap: var(--space-${key});`));
    gaps.push(rule(`gap-y-${key}`, `row-gap: var(--space-${key});`));
  }
  gaps.push(rule('gap-0', 'gap: 0;'));
  groups.push(section('Gap', gaps));

  // ── Layout ───────────────────────────────────────────────────────────────
  groups.push(section('Display', [
    rule('block', 'display: block;'),
    rule('inline-block', 'display: inline-block;'),
    rule('inline', 'display: inline;'),
    rule('flex', 'display: flex;'),
    rule('inline-flex', 'display: inline-flex;'),
    rule('grid', 'display: grid;'),
    rule('inline-grid', 'display: inline-grid;'),
    rule('contents', 'display: contents;'),
    rule('hidden', 'display: none;'),
  ]));

  groups.push(section('Flex', [
    rule('flex-row', 'flex-direction: row;'),
    rule('flex-col', 'flex-direction: column;'),
    rule('flex-row-reverse', 'flex-direction: row-reverse;'),
    rule('flex-col-reverse', 'flex-direction: column-reverse;'),
    rule('flex-wrap', 'flex-wrap: wrap;'),
    rule('flex-nowrap', 'flex-wrap: nowrap;'),
    rule('flex-1', 'flex: 1 1 0%;'),
    rule('flex-auto', 'flex: 1 1 auto;'),
    rule('flex-none', 'flex: none;'),
    rule('grow', 'flex-grow: 1;'),
    rule('grow-0', 'flex-grow: 0;'),
    rule('shrink', 'flex-shrink: 1;'),
    rule('shrink-0', 'flex-shrink: 0;'),
  ]));

  groups.push(section('Alignment', [
    ...['start', 'center', 'end', 'stretch', 'baseline']
      .map((v) => rule(`items-${v}`, `align-items: ${v === 'start' || v === 'end' ? `flex-${v}` : v};`)),
    ...['start', 'center', 'end', 'between', 'around', 'evenly'].map((v) => {
      const value = { start: 'flex-start', end: 'flex-end', between: 'space-between', around: 'space-around', evenly: 'space-evenly' }[v] ?? v;
      return rule(`justify-${v}`, `justify-content: ${value};`);
    }),
    ...['start', 'center', 'end', 'stretch', 'auto']
      .map((v) => rule(`self-${v}`, `align-self: ${v === 'start' || v === 'end' ? `flex-${v}` : v};`)),
  ]));

  const grid = [];
  for (let n = 1; n <= 6; n++) {
    grid.push(rule(`grid-cols-${n}`, `grid-template-columns: repeat(${n}, minmax(0, 1fr));`));
    grid.push(rule(`col-span-${n}`, `grid-column: span ${n} / span ${n};`));
  }
  grid.push(rule('col-span-full', 'grid-column: 1 / -1;'));
  groups.push(section('Grid', grid));

  groups.push(section('Size', [
    rule('w-full', 'inline-size: 100%;'),
    rule('w-auto', 'inline-size: auto;'),
    rule('w-fit', 'inline-size: fit-content;'),
    rule('h-full', 'block-size: 100%;'),
    rule('h-auto', 'block-size: auto;'),
    rule('h-fit', 'block-size: fit-content;'),
    rule('max-w-full', 'max-inline-size: 100%;'),
    // The fix for "my flex child will not shrink and my text will not
    // ellipsis", which is otherwise an afternoon of everyone's life.
    rule('min-w-0', 'min-inline-size: 0;'),
    rule('min-h-0', 'min-block-size: 0;'),
  ]));

  // ── Surface ──────────────────────────────────────────────────────────────
  groups.push(section('Radius', [
    ...RADIUS_KEYS.map((k) => rule(`rounded-${k}`, `border-radius: var(--radius-${k});`)),
    rule('rounded-none', 'border-radius: 0;'),
  ]));

  groups.push(section('Colour', [
    ...TEXT_SIZE_KEYS.map((k) => rule(`text-${k}`, `font-size: var(--text-${k});`)),
    ...TEXT_COLORS.map((k) => rule(`text-${k}`, `color: var(--text-${k});`)),
    ...ACCENT_COLORS.map((k) => rule(`text-${k}`, `color: var(${accentVar(k)});`)),
    ...BG_COLORS.map((k) => rule(`bg-${k}`, `background-color: var(--bg-${k});`)),
    ...ACCENT_COLORS.map((k) => rule(`bg-${k}`, `background-color: var(${accentVar(k)});`)),
    rule('bg-none', 'background: none;'),
  ]));

  groups.push(section('Border', [
    rule('border', 'border: 1px solid var(--border-default);'),
    rule('border-0', 'border: 0;'),
    ...BORDER_COLORS.map((k) => rule(`border-${k}`, `border-color: var(--border-${k});`)),
  ]));

  groups.push(section('Shadow', [
    ...SHADOW_KEYS.map((k) => rule(`shadow-${k}`, `box-shadow: var(--shadow-${k});`)),
    rule('shadow-none', 'box-shadow: none;'),
  ]));

  groups.push(section('Font role', FONT_ROLES.map(
    (role) => rule(`font-${role}`, `font-family: var(--font-${role});`)
  )));

  assertNamespaceShapes();

  const rules = groups.join('\n').split('\n').filter((l) => l.startsWith('.arc-'));
  assertNoCollisions(rules);

  return `/* ARC UI utilities — GENERATED by scripts/generate/utilities.js.
   Do not edit by hand; edit shared/tokens.js and shared/utilities.js.

   Opt-in and standalone:  import '@arclux/arc-ui/utilities.css';

   Every declaration reads a token variable rather than a literal, so
   overriding --space-md (or any other base token) moves these classes and the
   components together. Requires base.css, or your own definitions of the same
   variables.

   Light DOM only: a class cannot cross a shadow boundary, so these style the
   space around ARC components, never anything inside one.

   ${rules.length} classes. */
${groups.join('\n')}
`;
}
