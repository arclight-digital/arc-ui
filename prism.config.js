export default {
  // Where to find Lit web components
  components: 'packages/web-components/src',
  // Tier directories to scan (maps to output subdirectories)
  tiers: ['content', 'data', 'typography', 'input', 'navigation', 'layout', 'feedback', 'shared'],
  // Ignore patterns
  ignore: ['**/shared-styles.js', '**/index.js', '**/icon-registry.js', '**/icon-library.js', '**/icons/**', '**/*.register.js', '**/register.js'],

  // Classification overrides. Highest precedence — beats the @arc-prism
  // JSDoc tag, which beats auto-detection. Lives here because JSDoc is
  // rewritten by codegen and overrides have twice been lost that way.
  //
  // 'interactive' entries are components auto-detection reads as static
  // because they carry no handlers of their own — they are slotted children
  // driven entirely by a parent, so they cannot stand alone as HTML/CSS.
  interactivity: {
    'arc-nav-item':         'interactive',  // child of arc-navigation-menu
    'arc-tab':              'interactive',  // child of arc-tabs
    'arc-tree-item':        'interactive',  // child of arc-tree-view
    'arc-sidebar-section':  'interactive',  // child of arc-sidebar
    'arc-code-block':       'hybrid',       // display works; copy needs JS
    'arc-callout':          'hybrid',       // box, variants and icon are pure CSS; only dismissal needs JS
    'arc-avatar-group':     'hybrid',       // stacking and overlap are pure layout; only the overflow count needs JS
    'arc-app-shell':        'hybrid',       // full page grid renders from CSS; only the mobile drawer backdrop needs JS
    'arc-top-bar':          'hybrid',       // bar, slots and sticky behaviour are CSS; only the mobile menu toggle needs JS
    'arc-toolbar':          'hybrid',       // lays out in CSS; only overflow measurement and collapse need JS
    'arc-tooltip':          'hybrid',       // reveal works via CSS :hover/:focus-within; JS only adds the configurable delay
    'arc-markdown':         'static',       // renders Markdown content as styled HTML

    // Presentational components tripped into 'interactive' by a single
    // incidental handler. Their entire visual is CSS; the handler adds one
    // affordance on top. Without these the CSS never reaches the bundle —
    // arc-button shipped with zero styles for two releases this way.
    'arc-button':           'hybrid',       // @click only bridges form submit/reset across the shadow boundary
    'arc-copy-button':      'hybrid',       // display works; copy requires JS
    'arc-alert':            'hybrid',       // same shape as callout — box and variants are CSS; only dismissal needs JS
    'arc-tag':              'hybrid',       // presentational; only the remove affordance needs JS
    'arc-chip':             'hybrid',       // presentational; only the remove affordance needs JS
    'arc-breadcrumb':       'hybrid',       // link list renders from CSS; only nav interception needs JS
    'arc-pagination':       'hybrid',       // control row is CSS; only page changes need JS
    'arc-sidebar':          'hybrid',       // layout and links are CSS; only the collapse toggle needs JS

    // Form controls that render a NATIVE element. Static consumers can
    // hand-author `<input class="input">` with this CSS and get a fully
    // working control, because native inputs need no JS. Deliberately not
    // extended to checkbox/toggle (role="checkbox"/"switch" divs with
    // JS-managed state) or to select/search/combobox/otp-input/pin-input,
    // whose behaviour can't be reproduced in static markup.
    // NOTE: input.css is correct (7 field rules), but input.html is missing
    // its <input> — the field is built in a `const` via a ternary and
    // interpolated as ${field}, which the template extractor can't resolve.
    // Kept hybrid because the CSS is the load-bearing artifact; the example
    // is a convenience. Filed upstream.
    'arc-input':            'hybrid',       // renders a native <input>/<textarea>
    'arc-textarea':         'hybrid',       // renders a native <textarea>
    'arc-slider':           'hybrid',       // renders a native <input type="range">
  },

  // Left interactive on purpose, against the report's suggestion:
  //   arc-chart            — render() computes all geometry via _donutModel()/
  //                          _cartesianModel(); no static markup can reproduce it
  //   arc-navigation-menu  — 60% of its 14 KB is the mobile overlay and dropdown,
  //                          driven by JS state classes; ~5.6 KB would be usable

  // Findings we have already decided about. Waived entries still print, under
  // a `prism: accepted:` heading, and an entry matching nothing is itself a
  // strict failure — so this list cannot quietly shelter a real regression or
  // rot into pre-waiving whatever next appears under the same key.
  acknowledge: [
    {
      code: 'framework-reserved',
      tag: 'arc-column',
      prop: 'key',
      note:
        'Deliberate. `field` is the supported name and is what React and Preact ' +
        'consumers must use; `key` is kept because it works in HTML, Vue, Svelte, ' +
        'Angular and Solid, and renaming would break five working consumers to ' +
        'repair two. arc-column falls back via `fieldName` (field || key).',
    },

    // ── slot-name-remapped ──
    //
    // Every entry below is a slot deliberately sharing its name with a prop:
    // the prop takes a plain string, the slot overrides it with markup. That
    // pairing is the library's standard escape hatch and appears on eight
    // components, so the Svelte wrapper has two things wanting one prop name
    // and suffixes the snippet (`eyebrow` → `eyebrow_`).
    //
    // Prism's message reads "is not a valid identifier", which is true of the
    // `icon-left` → `iconLeft` case the diagnostic was written for but not of
    // these — `eyebrow` is a perfectly good identifier, it is just taken. Its
    // suggested fix (rename the slot to `eyebrow_`) would put a trailing
    // underscore in the public HTML API of every framework to repair one, so
    // it is declined. Svelte consumers use `{#snippet eyebrow_()}`; everyone
    // else uses `slot="eyebrow"`. Documented per component.
    { code: 'slot-name-remapped', tag: 'arc-cta-banner',  prop: 'eyebrow_',     note: 'Slot pairs with the `eyebrow` prop.' },
    { code: 'slot-name-remapped', tag: 'arc-cta-banner',  prop: 'headline_',    note: 'Slot pairs with the `headline` prop.' },
    { code: 'slot-name-remapped', tag: 'arc-feature-card', prop: 'icon_',       note: 'Slot pairs with the `icon` prop.' },
    { code: 'slot-name-remapped', tag: 'arc-value-card',  prop: 'icon_',        note: 'Slot pairs with the `icon` prop.' },
    { code: 'slot-name-remapped', tag: 'arc-fieldset',    prop: 'legend_',      note: 'Slot pairs with the `legend` prop.' },
    { code: 'slot-name-remapped', tag: 'arc-page-header', prop: 'heading_',     note: 'Slot pairs with the `heading` prop.' },
    { code: 'slot-name-remapped', tag: 'arc-page-header', prop: 'description_', note: 'Slot pairs with the `description` prop.' },
    { code: 'slot-name-remapped', tag: 'arc-popover',     prop: 'trigger_',     note: 'Slot pairs with the `trigger` prop.' },

    // arc-virtual-list is a different case: its slot names are computed per row
    // (`item-0`, `item-1`, …), so there is no fixed name for a Svelte snippet
    // prop to be. Prism reads the `@slot item-${index}` doc entry and the
    // `name="item-${index}"` template literal as two literal slot names, which
    // is the closest either can get. Svelte snippet props are static, so the
    // wrapper structurally cannot express an indexed slot family — Svelte
    // consumers use the web component directly for this one.
    { code: 'slot-name-remapped', tag: 'arc-virtual-list', prop: 'itemIndex', note: 'Per-row slot family; no static snippet name exists.' },
    { code: 'slot-name-remapped', tag: 'arc-virtual-list', prop: 'item',      note: 'Per-row slot family; no static snippet name exists.' },
  ],

  // Two-way binding opt-outs. Bindings are derived by convention — an event
  // whose `detail` carries a key matching a declared prop name is that prop's
  // write-back path — which holds across the library except here. Lives in
  // config for the same reason as the interactivity block above.
  bindings: {
    // Collision: detail.label is the *selected option's* text, not the field's
    // own label prop. Binding it would rewrite the field label to the chosen
    // option's text on every change. The only genuine break in the convention.
    'arc-select':      { exclude: ['label'] },

    // Echoes: the element dispatches its own unchanged prop as identifying
    // context, never as a new value, so the write-back is a no-op. Excluded so
    // the two-way surface only advertises props that can actually change.
    'arc-copy-button': { exclude: ['value'] },  // the string it just copied
    'arc-hotkey':      { exclude: ['keys'] },   // the pattern that matched
    'arc-list-item':   { exclude: ['value'] },  // the item's own identity
    'arc-chip':        { exclude: ['value'] },  // keeps its real `selected` binding
  },

  // React output
  react: {
    outDir: 'packages/react/src',
    wcPackage: '@arclux/arc-ui',
    barrels: true,
  },

  // HTML/CSS output
  html: {
    outDir: 'packages/html/examples',
    baseCSS: 'shared/base.css',
    tokensJS: 'shared/tokens.js',
    inlineVariant: true,
  },

  // Standalone CSS output
  css: {
    outDir: 'packages/html/css',
    baseCSS: 'shared/base.css',
  },

  // Vue 3 output
  vue: {
    outDir: 'packages/vue/src',
    wcPackage: '@arclux/arc-ui',
    barrels: true,
  },

  // Svelte 5 output
  svelte: {
    outDir: 'packages/svelte/src',
    wcPackage: '@arclux/arc-ui',
    barrels: true,
  },

  // Angular standalone components
  angular: {
    outDir: 'packages/angular/src',
    wcPackage: '@arclux/arc-ui',
    barrels: true,
  },

  // Solid components
  solid: {
    outDir: 'packages/solid/src',
    wcPackage: '@arclux/arc-ui',
    barrels: true,
  },

  // Preact components
  preact: {
    outDir: 'packages/preact/src',
    wcPackage: '@arclux/arc-ui',
    barrels: true,
  },
};
