/**
 * Shared body scroll lock with per-owner tracking.
 *
 * Multiple overlays (modal, sheet, command palette, …) can be open at once;
 * body overflow is only restored when the last lock is released. Locking is
 * idempotent per owner, so a component may safely call unlockScroll() on
 * close/disconnect even if it never locked.
 */
const locks = new Set();
let savedOverflow = '';

export function lockScroll(owner) {
  if (locks.size === 0) {
    savedOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }
  locks.add(owner);
}

export function unlockScroll(owner) {
  if (!locks.delete(owner)) return;
  if (locks.size === 0) {
    document.body.style.overflow = savedOverflow;
  }
}
