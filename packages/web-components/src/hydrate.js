/**
 * Client-side support for server-rendered ARC components.
 *
 *   import '@arclux/arc-ui/hydrate';   // FIRST — before any component import
 *   import '@arclux/arc-ui/register';
 *
 * A server-rendered element arrives with its shadow root already attached and
 * its content already painted. Without this module, the moment the element
 * upgrades Lit renders its template from scratch into that shadow root,
 * throwing away identical DOM and producing a visible flash — the exact
 * flicker server rendering exists to avoid.
 *
 * This installs Lit's hydration support, which instead *adopts* the existing
 * DOM: it walks the markers @lit-labs/ssr left behind, binds each template
 * part to the node already there, and renders nothing. From then on updates
 * are ordinary Lit updates.
 *
 * **Import order matters.** Hydration support patches LitElement's update
 * path, so it has to be in place before any component class is defined. Import
 * it first, or from its own module ahead of everything else — importing it
 * after a component has already upgraded does nothing for that component.
 *
 * Pair it with `<html data-arc-ssr>`, which opts the page out of the
 * :not(:defined) FOUC guard in base.css. That guard hides ARC elements until
 * they upgrade, and a server-rendered element is un-upgraded but *finished* —
 * left in place it would hide exactly the content you paid to render early.
 *
 * Not needed by consumers who don't server-render. It costs nothing at runtime
 * beyond the import, but it is meaningless without declarative shadow DOM in
 * the payload.
 *
 * **This module must not import anything that reaches lit-element.** It looks
 * like a safe convenience — importing `LitElement` to check the hook landed, say
 * — and it is the one thing that breaks it. The support module works by setting
 * `globalThis.litElementHydrateSupport`, which lit-element reads once while its
 * own module evaluates; a bundler hoists a chunk's cross-chunk imports above
 * that chunk's own module bodies, so importing lit-element from here pulls it
 * (and any component registration bundled alongside it) into evaluation *before*
 * this file's import of the support module has run. The hook then arrives too
 * late for those components, silently: they render a second copy of their
 * template above the server's markup, leaving two default slots of which only
 * the first is assigned.
 *
 * That is not hypothetical. Adding such an import here left exactly the nine
 * eagerly-registered components on arcui.dev unpatched while the other 176
 * hydrated correctly.
 */
import '@lit-labs/ssr-client/lit-element-hydrate-support.js';

/**
 * Say so, once, when this module lost the race described above.
 *
 * The failure is silent by construction. Nothing throws, the page looks
 * approximately right, and the only symptom is that every component holds the
 * server's markup *and* a second client-rendered copy above it — so each has
 * two default slots, of which only the first is assigned. On arcui.dev that
 * surfaced as nine critical and forty-one serious axe violations, and it took
 * an afternoon to trace. A consumer without an accessibility gate would simply
 * ship it.
 *
 * The signal is the hook's own fingerprint on each class as it is defined:
 * `defer-hydration` appears in `observedAttributes` only if lit-element
 * consumed `globalThis.litElementHydrateSupport` while evaluating. That is
 * per-class, needs no DOM inspection, and is the same measurement that
 * diagnosed the original bug.
 *
 * Deliberately *not* checked: whether any components were defined before this
 * module ran. Registration is commonly deferred behind a dynamic import of the
 * barrel, so "we observed none" is normal rather than broken, and warning on it
 * would cry wolf at exactly the consumers doing it right.
 *
 * Gated on `data-arc-ssr`, so a page that never server-rendered — where none of
 * this matters — stays quiet.
 */
if (typeof customElements !== 'undefined' && typeof document !== 'undefined') {
  const define = customElements.define.bind(customElements);
  let warned = false;

  customElements.define = function arcHydrationOrderCheck(name, constructor, options) {
    define(name, constructor, options);
    if (warned || !name.startsWith('arc-')) return;
    if (!document.documentElement?.hasAttribute('data-arc-ssr')) return;

    let patched;
    try {
      // Read after defining, which is when the browser reads it too.
      patched = constructor.observedAttributes?.includes?.('defer-hydration');
    } catch {
      return; // Not a Lit element; nothing to say about it.
    }
    if (patched !== false) return;

    warned = true;
    console.warn(
      `[arc-ui] Hydration support loaded too late: <${name}> was defined `
      + 'without it, so Lit will render a second copy of every component over '
      + "the server's markup instead of adopting it.\n"
      + 'Importing @arclux/arc-ui/hydrate first is not sufficient on its own — '
      + "a bundler hoists a chunk's cross-chunk imports above its own inlined "
      + 'code, so a small module gets inlined into the entry and runs after the '
      + 'component chunks it was meant to precede.\n'
      + 'Force it into a chunk of its own (Rollup/Vite: manualChunks) so it '
      + 'becomes a cross-chunk import too, and keeps its source order.'
    );
  };
}
