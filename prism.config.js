import { findExcludedTags } from './scripts/lib/component-tags.js';

export default {
  // Resolve props from the class rather than by reading the file.
  //
  // prism imports each component module and reads `Ctor.elementProperties`,
  // Lit's own resolved map — so a declaration built by a helper
  // (`oneOf(['sm','md','lg'])`) and one contributed by a mixin
  // (FormControlMixin's `required` and `readonly`) are both ordinary properties
  // by the time the class exists. Both were invisible to a source reader, and
  // both needed a hook here to explain them: `propsFrom` re-implemented the
  // vocabulary's semantics and `formAssociated` re-implemented the mixin's.
  // Neither exists now.
  //
  // `readonly` is why the trade is worth it. Declared once, in
  // FormControlMixin, it reached no wrapper in any of the six frameworks on 25
  // of 27 form controls — because the hook only ever read the component's own
  // file. A second reader of a fact the class already knows will drift from it;
  // this asks the class.
  //
  // The cost is real and is why it is opt-in: reading the class means importing
  // the module, and importing a module runs it. It degrades rather than fails —
  // a module that throws on import costs that one component its runtime answer,
  // reports `runtime-unavailable`, and falls back to the source reader.
  runtime: true,



  // The two controls whose value is a pair. A ControlValueAccessor carries one
  // value and these bind two, with no single `value` between them, so the
  // accessor carries an object — which is what a reactive form holds for a
  // compound value anyway. Without these entries `formControlName` would work
  // on 25 of 27 controls, which is the kind of gap a consumer discovers rather
  // than reads.
  formValue: {
    'arc-date-range-picker': ['start', 'end'],
    'arc-range-slider': ['low', 'high'],
  },

  // Where to find Lit web components
  components: 'packages/web-components/src',
  // Tier directories to scan (maps to output subdirectories)
  tiers: ['content', 'data', 'typography', 'input', 'navigation', 'layout', 'feedback', 'shared'],
  // Ignore patterns
  ignore: ['**/shared-styles.js', '**/index.js', '**/icon-registry.js', '**/icon-library.js', '**/icons/**', '**/*.register.js', '**/register.js'],

  // Kept out of every barrel, in every framework.
  //
  // **Derived, never listed here by hand.** The three reasons a component leaves
  // the default barrel — a heavy optional dependency, a domain group, an
  // `experimental` status — live together in `excludedFrom` in
  // scripts/lib/component-tags.js, which reads the same `@arc-group` and
  // `@status` annotations that generate/group-barrels.js and the manifest read.
  // A second hand-kept list here would eventually drift into a component that is
  // in no barrel at all: excluded from the default one, absent from the group
  // one. That is a failure a consumer discovers and nothing in this file would
  // see. scripts/checks/barrel-gating.js asserts the whole round trip against
  // the barrels as written to disk.
  //
  // Wrapper consumers are unaffected in reachability: every wrapper component
  // has had its own subpath since generate/wrapper-exports.js
  // (`@arclux/arc-ui-react/Carousel`), which is exactly how arc-code-block —
  // the original and still the only heavy-dependency case — has been reached
  // for a release.
  barrelExclude: findExcludedTags(),

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
      code: 'doc-prop-undeclared',
      tag: 'arc-date-range-picker',
      prop: 'value',
      note:
        'NOT deliberate — the only one left, and it is real. `value` here is a ' +
        'get/set accessor pair (the ISO 8601 interval derived from `start` and ' +
        '`end`, and what the form submits), not a reactive property, so it is ' +
        'absent from elementProperties too and reaches no wrapper: a React ' +
        'consumer can set start and end but not the range. Runtime resolution ' +
        'does not paper over this and should not — the wrappers genuinely ' +
        'cannot bind it. Making it reactive means a Lit accessor declaration on ' +
        'a hand-written getter, which is a component change with reactivity ' +
        'consequences. Tracked; remove this entry when it is fixed.',
    },

    // Nothing here for the eight slots that share a name with a prop
    // (arc-cta-banner's `eyebrow`, arc-page-header's `heading`, …). That pairing
    // — prop for the plain string, slot to override it with markup — is the
    // library's standard escape hatch, and since 2.8.0 prism reports it as
    // informational with the right advice rather than as something to waive:
    // the slot keeps its real name everywhere, and Svelte consumers write
    // `{#snippet eyebrow_()}` because Svelte derives the snippet prop from the
    // slot name and the prop already has it.
    //
    // 2.7.0 raised these as strict `slot-name-remapped` findings claiming the
    // names were "not valid identifiers", so they were waived here. They are no
    // longer emitted, and an acknowledgement for a code prism does not emit is
    // itself reported — so these entries are gone rather than left to rot.
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
    // prism writes this package's `exports`, `main`, `module` and `types`
    // from the file tree it just generated — replacing wrapper-exports.js.
    packageJson: 'packages/react/package.json',
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
    // prism writes this package's `exports`, `main`, `module` and `types`
    // from the file tree it just generated — replacing wrapper-exports.js.
    packageJson: 'packages/vue/package.json',
    wcPackage: '@arclux/arc-ui',
    barrels: true,
  },

  // Svelte 5 output
  svelte: {
    outDir: 'packages/svelte/src',
    // prism writes this package's `exports`, `main`, `module` and `types`
    // from the file tree it just generated — replacing wrapper-exports.js.
    packageJson: 'packages/svelte/package.json',
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
    // prism writes this package's `exports`, `main`, `module` and `types`
    // from the file tree it just generated — replacing wrapper-exports.js.
    packageJson: 'packages/solid/package.json',
    wcPackage: '@arclux/arc-ui',
    barrels: true,
  },

  // Preact components
  preact: {
    outDir: 'packages/preact/src',
    // prism writes this package's `exports`, `main`, `module` and `types`
    // from the file tree it just generated — replacing wrapper-exports.js.
    packageJson: 'packages/preact/package.json',
    wcPackage: '@arclux/arc-ui',
    barrels: true,
  },

  // Opt-in JSX typings for consumers rendering <arc-*> directly instead of
  // importing a wrapper — replacing the three-target block in
  // scripts/generate/types.js.
  jsxTypes: {
    outDir: 'packages/web-components/types',
    frameworks: ['react', 'preact', 'solid'],
    // No `wcPackage` here: prism 3.0 inherits it from the framework sections
    // below, which already name the package their imports use, and throws at
    // config load if they disagree. It briefly needed stating — the default was
    // `@<prefix>/<prefix>-ui`, i.e. `@arc/arc-ui`, which does not exist, so the
    // activation instruction in the emitted header became the exact silent
    // no-op that header spends six lines warning about.
  },
};
