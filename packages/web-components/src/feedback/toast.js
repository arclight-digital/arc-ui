import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { getStatusIcon } from '../status-utils.js';
import { DeclaredPropsMixin, flag, oneOf, int } from '../shared/props.js';

/** Returns inline style string setting --_status-color/rgb for a given variant */
function statusStyle(variant) {
  const map = {
    info: { color: 'var(--accent-primary)', rgb: 'var(--accent-primary-rgb)' },
    success: { color: 'var(--color-success)', rgb: 'var(--color-success-rgb)' },
    warning: { color: 'var(--color-warning)', rgb: 'var(--color-warning-rgb)' },
    error: { color: 'var(--color-error)', rgb: 'var(--color-error-rgb)' },
  };
  const v = map[variant] || map.info;
  return `--_status-color:${v.color};--_status-rgb:${v.rgb}`;
}

/**
 * Stack-managed notification toasts with auto-dismiss, variant-colored indicators, configurable
 * position, smooth enter/exit animations, and the stacking policy that used to live in a separate
 * arc-toast-manager: a cap on how many show at once, a FIFO queue for the overflow, and
 * deduplication of repeated messages.
 *
 * Queueing belongs here rather than in a wrapper. As a separate component it could only reach
 * arc-toast's public surface, so a duplicate of a *visible* toast had to be dismissed and re-shown
 * to gain its "(×N)" suffix — a visible flicker for what is conceptually a counter increment. Owning
 * the render state makes that an in-place update.
 *
 * @tag arc-toast
 * @status stable
 * @requires arc-button
 * @requires arc-icon-button
 * @prop {'top-right' | 'top-left' | 'top-center' | 'bottom-right' | 'bottom-left' | 'bottom-center'} position - Anchors the toast stack to a fixed edge of the viewport. Top-right is the most conventional position for web applications. Bottom positions work well for media players or editors where the top area is occupied by toolbars.
 * @prop {number} duration - Time in milliseconds before a toast auto-dismisses. Applies as the default for every show() call but can be overridden per-toast via the duration option in the show() payload. Set to 0 to disable auto-dismiss entirely, requiring the user to click the close button.
 * @prop {number} maxVisible - Maximum toasts on screen at once (attribute: max-visible). Further show() calls queue FIFO and release as visible toasts dismiss. Set to 0 for no cap.
 * @prop {boolean} dedupe - When true, a show() whose message and variant match a visible or queued toast is coalesced: the existing toast gains a "(×N)" counter and a fresh timer instead of a second toast appearing. Set the property to false from JS to disable.
 * @prop {number} queueLimit - Maximum queued (not visible) toasts (attribute: queue-limit). Beyond it the oldest queued entries are dropped and arc-queue-overflow fires with the drop count.
 * @fires arc-close - Fired when a toast notification is dismissed. detail: { id } — the id show() returned.
 * @fires arc-queue-change - Fired whenever the visible or queued count changes. detail: { visible, queued }.
 * @fires arc-queue-overflow - Fired when the queue exceeds queueLimit and the oldest queued entries are dropped. detail: { dropped }.
 * @fires arc-action - Fired when the user clicks a toast's action button, before it dismisses. detail: { id }. Absorbed from arc-snackbar, whose action was reachable as an event as well as the `action` callback — a callback cannot be attached declaratively.
 * @fires arc-complete - Fired when a progress toast is completed with complete(id). detail: { id }.
 * @fires arc-cancel - Fired when the user clicks a progress toast's cancel button. detail: { id }.
 * @slot none
 * @csspart base - The root element.
 * @csspart container
 * @csspart toast
 * @csspart action
 * @csspart dismiss
 * @csspart track
 * @csspart fill
 * @csspart cancel
 */
export class ArcToast extends DeclaredPropsMixin(LitElement) {
  static properties = {
    position: oneOf(['top-right', 'top-left', 'top-center', 'bottom-right', 'bottom-left', 'bottom-center']),
    duration: { type: Number },
    maxVisible: { type: Number, attribute: 'max-visible' },
    dedupe: flag(true, { negative: 'no-dedupe', reflect: false }),
    queueLimit: int({ default: 20, min: 0, clamp: 'toRange', attribute: 'queue-limit' }),
    _toasts: { state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: block; }

      .toast-container {
        position: fixed;
        z-index: var(--z-toast);
        display: flex;
        flex-direction: column;
        gap: var(--space-sm);
        pointer-events: none;
        max-width: 400px;
        width: 100%;
      }

      /* Positions */
      :host([position="top-right"]) .toast-container,
      :host(:not([position="bottom-center"]):not([position="bottom-left"]):not([position="bottom-right"]):not([position="top-center"]):not([position="top-left"])) .toast-container {
        top: var(--space-lg); right: var(--space-lg);
      }
      :host([position="top-left"]) .toast-container {
        top: var(--space-lg); left: var(--space-lg);
      }
      :host([position="top-center"]) .toast-container {
        top: var(--space-lg); left: 50%; transform: translateX(-50%);
      }
      :host([position="bottom-right"]) .toast-container {
        bottom: var(--space-lg); right: var(--space-lg);
      }
      :host([position="bottom-left"]) .toast-container {
        bottom: var(--space-lg); left: var(--space-lg);
      }
      :host([position="bottom-center"]) .toast-container {
        bottom: var(--space-lg); left: 50%; transform: translateX(-50%);
      }

      .toast {
        pointer-events: auto;
        position: relative;
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        padding: var(--space-sm);
        border-radius: var(--radius-md);
        background: var(--surface-overlay);
        border: 1px solid var(--border-default);
        box-shadow: var(--shadow-overlay);
        animation: toast-in 300ms var(--ease-out-expo);
        font-family: var(--font-body);
        font-size: var(--_text-sm);
        color: var(--text-secondary);
        overflow: hidden;
      }

      /* Bottom gradient indicator */
      .toast::after {
        content: '';
        position: absolute;
        bottom: 0;
        inset-inline-start: 0;
        inset-inline-end: 0;
        height: 2px;
        background: linear-gradient(90deg, transparent, var(--_status-color), transparent);
      }

      .toast__icon {
        font-size: var(--_text-sm);
        flex-shrink: 0;
        line-height: 1;
        color: var(--_status-color);
      }

      .toast__body {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: var(--space-xs);
      }

      .toast__message { flex: 1; }

      /* Progress track, absorbed from arc-progress-toast (4.2). Copied rather
         than reinterpreted — a merge that also restyles is two changes wearing
         one commit. */
      .toast__track {
        height: 4px;
        border-radius: var(--radius-full);
        background: var(--border-subtle);
        overflow: hidden;
      }

      .toast__fill {
        height: 100%;
        border-radius: var(--radius-full);
        background: var(--gradient-accent-text);
        transition: width var(--transition-base);
        box-shadow: var(--glow-sm);
      }

      @media (prefers-reduced-motion: reduce) {
        .toast__fill { transition: none; }
      }


      .toast.is-exiting {
        animation: toast-out 200ms var(--ease-in) forwards;
      }

      @keyframes toast-in {
        from { opacity: 0; transform: translateY(-8px) scale(0.96); }
        to   { opacity: 1; transform: translateY(0) scale(1); }
      }

      @keyframes toast-out {
        to { opacity: 0; transform: translateY(-8px) scale(0.96); }
      }

      @media (prefers-reduced-motion: reduce) {
        .toast, .toast.is-exiting { animation: none; }
      }

      @media (max-width: 640px) { /* --breakpoint-sm */
        .toast-container {
          inset-inline-end: var(--space-sm);
          inset-inline-start: var(--space-sm);
          max-width: none;
        }
      }
    `,
  ];

  constructor() {
    super();
    this.duration = 4000;
    this.maxVisible = 3;
    this._toasts = [];
    this._queue = [];
    this._counter = 0;
    this._timers = new Set();
    this._lastCounts = { visible: 0, queued: 0 };
    // Lets any component raise a toast without holding a reference to this one.
    this._onDocToast = (e) => {
      this.show(e.detail ?? {});
    };
  }

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener('arc-toast', this._onDocToast);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('arc-toast', this._onDocToast);
    for (const timer of this._timers) clearTimeout(timer);
    this._timers.clear();
  }

  _setTimer(fn, ms) {
    const timer = setTimeout(() => {
      this._timers.delete(timer);
      fn();
    }, ms);
    this._timers.add(timer);
  }

  /**
   * Show a toast, or coalesce it into an identical one that is already showing.
   *
   * @returns {number} the toast's id, for a later dismiss(). A dedupe hit returns
   *   the id of the toast it merged into, so a caller that tracks ids never ends
   *   up holding one that was never created.
   */
  show(options = {}) {
    const { message = '', variant = 'info', progress } = options;
    const isProgress = typeof progress === 'number';

    // A progress toast is never deduped and never auto-dismisses. Two uploads
    // of a file with the same name are two uploads, not one that happened
    // twice — coalescing them would leave one bar tracking two operations. And
    // it persists by definition: it is finished by complete(), not by a timer.
    // Absorbed from arc-progress-toast (4.2), which had neither a queue nor a
    // dedupe to have to except itself from.
    if (this.dedupe && !isProgress) {
      const existing = [...this._toasts, ...this._queue].find(
        (t) => t.message === message && t.variant === variant,
      );
      if (existing) {
        existing.count += 1;
        // A visible duplicate gets its timer restarted, so a repeating message
        // stays on screen while it keeps repeating.
        if (this._toasts.includes(existing)) this._restartTimer(existing);
        this._toasts = [...this._toasts];
        this._notify();
        return existing.id;
      }
    }

    const entry = {
      id: ++this._counter,
      message,
      variant,
      count: 1,
      options: isProgress ? { ...options, persistent: true } : options,
      progress: isProgress ? progress : undefined,
      onCancel: options.onCancel,
    };

    if (this._hasRoom()) {
      this._present(entry);
    } else {
      this._queue.push(entry);
      let dropped = 0;
      while (this.queueLimit > 0 && this._queue.length > this.queueLimit) {
        this._queue.shift();
        dropped += 1;
      }
      if (dropped > 0) {
        this.dispatchEvent(
          new CustomEvent('arc-queue-overflow', {
            detail: { dropped },
            bubbles: true,
            composed: true,
          }),
        );
      }
    }

    this._notify();
    return entry.id;
  }

  /**
   * Dismiss a toast by the id show() returned, whether it is visible or still
   * queued. Unknown ids are ignored.
   *
   * @param {number} id
   */
  dismiss(id) {
    if (this._toasts.some((t) => t.id === id)) {
      this._dismiss(id);
      return;
    }
    const before = this._queue.length;
    this._queue = this._queue.filter((t) => t.id !== id);
    if (this._queue.length !== before) this._notify();
  }

  /** Dismiss everything on screen and discard the queue. */
  clear() {
    this._queue = [];
    for (const t of [...this._toasts]) this._dismiss(t.id);
    this._notify();
  }

  /** Whether another toast may be shown without queueing. maxVisible 0 = no cap. */
  _hasRoom() {
    return this.maxVisible <= 0 || this._toasts.length < this.maxVisible;
  }

  /** Put an entry on screen and start its auto-dismiss timer. */
  _present(entry) {
    this._toasts = [...this._toasts, entry];
    this._restartTimer(entry);
  }

  /**
   * (Re)start an entry's auto-dismiss timer.
   *
   * The old timer is abandoned rather than cleared — _dismiss() is a no-op for an
   * id that has already gone, so a stale timer firing is harmless, and tracking
   * one handle per entry to cancel it would be more state for no gain.
   */
  _restartTimer(entry) {
    const dur = entry.options.duration ?? this.duration;
    entry.timerGeneration = (entry.timerGeneration ?? 0) + 1;
    const generation = entry.timerGeneration;
    if (entry.options.persistent || dur <= 0) return;
    this._setTimer(() => {
      // Only the newest timer for this entry may dismiss it.
      if (entry.timerGeneration === generation) this._dismiss(entry.id);
    }, dur);
  }

  /** Release queued toasts into any free slots. */
  _release() {
    while (this._queue.length > 0 && this._hasRoom()) {
      this._present(this._queue.shift());
    }
  }

  _notify() {
    const counts = { visible: this._toasts.length, queued: this._queue.length };
    if (counts.visible === this._lastCounts.visible && counts.queued === this._lastCounts.queued)
      return;
    this._lastCounts = counts;
    this.dispatchEvent(
      new CustomEvent('arc-queue-change', {
        detail: counts,
        bubbles: true,
        composed: true,
      }),
    );
  }

  /** The rendered text: the message, plus a counter once it has repeated. */
  _label(entry) {
    return entry.count > 1 ? `${entry.message} (×${entry.count})` : entry.message;
  }

  /**
   * Move a progress toast's bar, its message, or both. Unknown ids are ignored,
   * matching dismiss().
   *
   * Named `updateToast` rather than `update` because `update` is Lit's — the
   * name arc-progress-toast used, and the reason it also carried a do-nothing
   * `update(changedProps) { super.update(changedProps); }` override that read
   * as if it meant something.
   *
   * @param {number} id
   * @param {{ progress?: number, message?: string }} changes
   */
  updateToast(id, { progress, message } = {}) {
    let touched = false;
    const apply = (t) => {
      if (t.id !== id) return t;
      touched = true;
      return {
        ...t,
        progress: progress !== undefined ? progress : t.progress,
        message: message !== undefined ? message : t.message,
      };
    };
    this._toasts = this._toasts.map(apply);
    // Queued entries too: a progress toast can be behind maxVisible, and an
    // upload does not pause because its toast is not on screen yet.
    this._queue = this._queue.map(apply);
    if (touched) this.requestUpdate();
  }

  /**
   * Finish a progress toast: dismiss it and fire `arc-complete`.
   *
   * Distinct from `dismiss()` on purpose — the operation finishing and the user
   * closing the toast are different events, and a consumer waiting on the first
   * should not be woken by the second.
   */
  complete(id) {
    if (!this._toasts.some((t) => t.id === id) && !this._queue.some((t) => t.id === id)) return;
    this._dismiss(id, { silent: true });
    this._queue = this._queue.filter((t) => t.id !== id);
    this.dispatchEvent(
      new CustomEvent('arc-complete', { detail: { id }, bubbles: true, composed: true }),
    );
    this._notify();
  }

  _cancel(toast) {
    if (toast.onCancel) toast.onCancel();
    this.dispatchEvent(
      new CustomEvent('arc-cancel', { detail: { id: toast.id }, bubbles: true, composed: true }),
    );
    this._dismiss(toast.id, { silent: true });
  }

  _handleAction(toast) {
    // The callback first, then the event: a consumer who passed `action` gets
    // it called whether or not anyone is listening, and arc-snackbar's
    // declarative consumers get the event they had.
    if (toast.options?.action) toast.options.action();
    this.dispatchEvent(
      new CustomEvent('arc-action', { detail: { id: toast.id }, bubbles: true, composed: true }),
    );
    this._dismiss(toast.id);
  }

  /**
   * @param {number} id
   * @param {{ silent?: boolean }} [opts] - `silent` suppresses `arc-close`, for
   *   the two paths that have already announced themselves: `complete()` fires
   *   `arc-complete` and `_cancel()` fires `arc-cancel`. Emitting `arc-close`
   *   as well would make every progress operation look like it was closed by
   *   the user, which is the one thing `arc-close` is supposed to mean.
   */
  _dismiss(id, { silent = false } = {}) {
    if (!this._toasts.some((t) => t.id === id)) return;
    const el = this.shadowRoot.querySelector(`[data-toast-id="${id}"]`);
    if (el) {
      el.classList.add('is-exiting');
      let done = false;
      const cleanup = () => {
        if (done) return;
        done = true;
        this._toasts = this._toasts.filter((t) => t.id !== id);
        if (!silent) {
          this.dispatchEvent(
            new CustomEvent('arc-close', {
              detail: { id },
              bubbles: true,
              composed: true,
            }),
          );
        }
        this._release();
        this._notify();
      };
      el.addEventListener('animationend', cleanup, { once: true });
      // Safety fallback if animation doesn't fire (e.g. prefers-reduced-motion)
      this._setTimer(cleanup, 300);
    } else {
      this._toasts = this._toasts.filter((t) => t.id !== id);
      this._release();
      this._notify();
    }
  }

  render() {
    return html`
      <div class="toast-container" role="status" aria-live="polite" aria-atomic="false" part="base container">
        ${this._toasts.map(
          (t) => html`
          <div class="toast" style=${statusStyle(t.variant)} data-toast-id=${t.id} part="toast">
            <span class="toast__icon" aria-hidden="true">${getStatusIcon(t.variant)}</span>
            <div class="toast__body">
              <span class="toast__message">${this._label(t)}</span>
              ${
                typeof t.progress === 'number'
                  ? html`
                <div class="toast__track" part="track">
                  <div
                    class="toast__fill"
                    style="width:${Math.min(100, Math.max(0, t.progress))}%"
                    part="fill"
                  ></div>
                </div>
              `
                  : ''
              }
            </div>
            ${/* `t.options.actionLabel`, not `t.actionLabel`.

                  show() has only ever put the payload on `entry.options` —
                  `const entry = { id, message, variant, count: 1, options }` —
                  so `t.actionLabel` was undefined for every toast that ever
                  rendered, and this button has never once appeared. The
                  documented `part="action"` was undeliverable, and
                  `_handleAction`'s `toast.action` was undefined on the same
                  terms. Found while absorbing arc-snackbar, whose whole point
                  is an action button. Nothing caught it because a conditional
                  part is exempt from the derived part sweep by construction
                  (conformance-surface.test.js:16-28) — it cannot tell a part
                  that is conditional from one that is unreachable. */
              t.options?.actionLabel
                ? html`
              <arc-button variant="ghost" size="sm" @click=${() => this._handleAction(t)} part="action">${t.options.actionLabel}</arc-button>
            `
                : ''
            }
            ${
              t.onCancel
                ? html`
              <arc-icon-button name="x" label="Cancel" variant="ghost" size="sm" @click=${() => this._cancel(t)} part="cancel"></arc-icon-button>
            `
                : html`
              <arc-icon-button name="x" label="Dismiss" variant="ghost" size="sm" @click=${() => this._dismiss(t.id)} part="dismiss"></arc-icon-button>
            `
            }
          </div>
        `,
        )}
      </div>
    `;
  }
}
