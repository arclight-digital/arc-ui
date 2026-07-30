/**
 * Components that cannot be server-rendered *by our own design*, with the reason.
 *
 * **Empty, and worth keeping empty.** Anything listed here is content a consumer
 * cannot get into their initial payload.
 *
 * It lives in the package rather than in scripts/ because two things depend on
 * it and they are not both build tooling: scripts/check-ssr.js, which asserts
 * the list is neither short nor stale, and src/ssr.js, which must not define a
 * component that would throw the moment a page containing it is rendered.
 *
 * `arc-markdown` was the last entry. Its sanitiser was DOMParser-based and its
 * render used an `.innerHTML` property binding — which the server has nothing
 * to serialise, so it emitted an empty div. Both are fixed; see
 * src/shared/sanitize-markup.js.
 *
 * **Adding an entry is not just a matter of editing this object.** src/ssr.js
 * registers components through the `./register.js` barrel, which is all-or-
 * nothing, so it asserts this list is empty rather than silently defining
 * something that throws. A new entry has to come with a registration path that
 * can skip it.
 */
export const CLIENT_ONLY = {};
