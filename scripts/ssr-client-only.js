/**
 * Components that cannot be server-rendered *by our own design*, with the reason.
 *
 * Shared by scripts/check-ssr.js, which asserts the list is neither short nor
 * stale, and docs/integrations/arc-dsd.mjs, which skips registering these so
 * lit-ssr leaves them as plain tags for the client to upgrade. Two copies of
 * this list would drift, and the failure mode is quiet: a component dropped
 * from one copy either crashes a build or silently stops being checked.
 *
 * This should stay near-empty. Anything on it is content a consumer cannot get
 * into their initial payload.
 */
export const CLIENT_ONLY = {};
