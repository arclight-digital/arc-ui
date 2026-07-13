import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import './toast.js';

/**
 * Queueing/stacking policy layer over arc-toast. Composes an internal
 * <arc-toast> (which owns rendering, timers, and a11y) and adds:
 * max-visible capping with a FIFO queue, message+variant deduplication,
 * queue overflow trimming, and a document-level `arc-toast` event channel.
 *
 * Composition notes (same-package couplings, kept deliberately minimal):
 * - arc-toast.show() does not return an id, so after each show() we read
 *   the id it just assigned from its internal counter (`_counter`).
 * - arc-toast has no public dismiss method, so dismiss()/clear() call its
 *   internal `_dismiss(id)`.
 * - arc-toast has no update API for a visible toast, so a dedupe hit on a
 *   visible toast is re-shown with a "(×N)" suffix and the stale entry is
 *   dismissed — the least hacky option available (mutating arc-toast's
 *   internal reactive state from outside would be worse).
 *
 * @tag arc-toast-manager
 * @requires arc-toast
 */
export class ArcToastManager extends LitElement {
  static properties = {
    position:   { type: String, reflect: true },
    duration:   { type: Number },
    maxVisible: { type: Number, attribute: 'max-visible' },
    dedupe:     { type: Boolean },
    queueLimit: { type: Number, attribute: 'queue-limit' },
  };

  static styles = [
    tokenStyles,
    css`
      /* The inner arc-toast owns all visual output. */
      :host { display: contents; }
    `,
  ];

  constructor() {
    super();
    this.position = 'top-right';
    this.duration = 4000;
    this.maxVisible = 3;
    this.dedupe = true;
    this.queueLimit = 20;
    this._counter = 0;      // manager-issued ids
    this._visible = [];     // [{ id, innerId, message, variant, count, options }]
    this._queue = [];       // [{ id, message, variant, count, options }]
    this._lastCounts = { visible: 0, queued: 0 };
    this._onDocToast = (e) => { this.show(e.detail ?? {}); };
  }

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener('arc-toast', this._onDocToast);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('arc-toast', this._onDocToast);
  }

  get _toastEl() {
    return this.shadowRoot?.querySelector('arc-toast') ?? null;
  }

  /**
   * Show a toast. Accepts the same options object as arc-toast.show()
   * ({ message, variant, duration, action, actionLabel, persistent }).
   * Returns a manager id usable with dismiss().
   */
  show(options = {}) {
    const { message = '', variant = 'info' } = options;

    if (this.dedupe) {
      const dup = this._visible.find(e => e.message === message && e.variant === variant);
      if (dup) {
        dup.count += 1;
        this._reshow(dup);
        return dup.id;
      }
      const queued = this._queue.find(e => e.message === message && e.variant === variant);
      if (queued) {
        queued.count += 1;
        return queued.id;
      }
    }

    const entry = { id: ++this._counter, innerId: null, message, variant, count: 1, options };
    this._queue.push(entry);

    let dropped = 0;
    while (this._queue.length > Math.max(0, this.queueLimit)) {
      this._queue.shift();
      dropped += 1;
    }
    if (dropped > 0) {
      this.dispatchEvent(new CustomEvent('arc-queue-overflow', {
        detail: { dropped },
        bubbles: true,
        composed: true,
      }));
    }

    this._release();
    this._notify();
    return entry.id;
  }

  /** Dismiss a toast (visible or queued) by manager id. */
  dismiss(id) {
    const entry = this._visible.find(e => e.id === id);
    if (entry) {
      // Removal from _visible happens in _onInnerDismiss.
      this._toastEl?._dismiss(entry.innerId);
      return;
    }
    const before = this._queue.length;
    this._queue = this._queue.filter(e => e.id !== id);
    if (this._queue.length !== before) this._notify();
  }

  /** Dismiss all visible toasts and flush the queue. */
  clear() {
    this._queue = [];
    const toast = this._toastEl;
    for (const entry of [...this._visible]) toast?._dismiss(entry.innerId);
    this._notify();
  }

  updated(changed) {
    // First render: releases show() calls made before the inner toast existed.
    // Later renders: a raised max-visible releases queued toasts immediately.
    if (changed.has('maxVisible') || !this._toastReady) {
      this._toastReady = true;
      this._release();
      this._notify();
    }
  }

  _label(entry) {
    return entry.count > 1 ? `${entry.message} (×${entry.count})` : entry.message;
  }

  _showOnInner(entry) {
    const toast = this._toastEl;
    toast.show({ ...entry.options, message: this._label(entry) });
    entry.innerId = toast._counter; // id arc-toast just assigned (see class doc)
  }

  /** Dedupe bump on a visible toast: re-show with (×N), drop the stale one. */
  _reshow(entry) {
    const toast = this._toastEl;
    if (!toast) return;
    const staleId = entry.innerId;
    this._showOnInner(entry);
    toast._dismiss(staleId); // its arc-dismiss no longer matches entry.innerId → ignored
  }

  _release() {
    const toast = this._toastEl;
    if (!toast) return;
    while (this._visible.length < Math.max(0, this.maxVisible) && this._queue.length > 0) {
      const entry = this._queue.shift();
      this._showOnInner(entry);
      this._visible.push(entry);
    }
  }

  _onInnerDismiss(e) {
    e.stopPropagation();
    const entry = this._visible.find(en => en.innerId === e.detail.id);
    if (!entry) return; // stale inner toast from a dedupe re-show
    this._visible = this._visible.filter(en => en !== entry);
    this.dispatchEvent(new CustomEvent('arc-dismiss', {
      detail: { id: entry.id },
      bubbles: true,
      composed: true,
    }));
    this._release();
    this._notify();
  }

  _notify() {
    const counts = { visible: this._visible.length, queued: this._queue.length };
    if (counts.visible === this._lastCounts.visible && counts.queued === this._lastCounts.queued) return;
    this._lastCounts = counts;
    this.dispatchEvent(new CustomEvent('arc-queue-change', {
      detail: counts,
      bubbles: true,
      composed: true,
    }));
  }

  render() {
    return html`
      <arc-toast
        position=${this.position}
        .duration=${this.duration}
        exportparts="container, toast, action, dismiss"
        @arc-dismiss=${this._onInnerDismiss}
      ></arc-toast>
    `;
  }
}
