/**
 * Types for phosphor.register.js — the side-effecting `./phosphor` subpath.
 *
 *     import '@arclux/arc-ui-icons/phosphor';
 *
 * That import is the whole point of the module and binds nothing, so the export
 * below is not what anyone is here for. It exists to describe the throwing Proxy
 * the module defaults to, which is there to catch one migration: importing this
 * specifier expecting the eager glyph map that `@arclux/arc-ui/icons/phosphor`
 * used to be.
 *
 * An object type with no properties is what makes that mistake a compile error
 * — `icons.check` is TS2339, at the line that reads it. `Record<string, never>`
 * would not: the read type-checks and yields `never`, which is assignable to
 * anything, so the mistake would survive the type-checker and land on the Proxy
 * at runtime. It still does for consumers who are not type-checking, and the
 * message says where the map went: `./all/phosphor` for the whole library,
 * `./phosphor/<name>` for one glyph.
 */
declare const notAnIconMap: Record<never, never>;
export default notAnIconMap;
