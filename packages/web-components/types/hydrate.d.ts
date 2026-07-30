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
 */
import '@lit-labs/ssr-client/lit-element-hydrate-support.js';
