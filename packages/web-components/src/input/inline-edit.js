import { LitElement, html, css, nothing } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { FormControlMixin } from '../shared/form-control-mixin.js';
import '../content/icon.js';
import { DeclaredPropsMixin, flag } from '../shared/props.js';

/**
 * Click-to-edit text: renders as plain text until activated, then swaps to a
 * pre-filled field. Enter or blur commits, Escape cancels. Built for track
 * renames, document titles, and other fields where a permanent input box would
 * be visual noise.
 *
 * The display text inherits the surrounding typography (`font: inherit`) and
 * the edit field matches it, so the swap never changes the text's metrics —
 * an inline-edit inside a heading edits at heading size, one in a table cell
 * edits at cell size. This is why there is no `size` prop: sizing comes from
 * context, and a fixed scale would fight it.
 *
 * While editing, keystrokes accumulate in an internal draft. `value` — and the
 * value a form submits — only changes on commit, so Escape can always revert
 * and a half-typed rename is never submitted. Committing an unchanged value
 * fires no event at all.
 *
 * @tag arc-inline-edit
 * @status stable
 * @requires arc-icon
 * @prop {string} value - The committed text. Updated only when an edit commits (Enter or blur); keystrokes accumulate in an internal draft until then.
 * @prop {string} label - Accessible name for the control. The display state announces as "Edit {label}" and the edit field is labeled with it. Always provide one.
 * @prop {string} name - The `name` attribute sent with form data on submission. The submitted value is the committed `value`, never an in-progress draft.
 * @prop {string} placeholder - Text shown in muted italic when `value` is empty, and as the field placeholder while editing. Defaults to "Empty".
 * @prop {boolean} multiline - When true, editing uses a `<textarea>`: Enter inserts a newline and Cmd/Ctrl+Enter commits. Single-line commits on plain Enter.
 * @prop {boolean} disabled - Prevents activation and applies a muted treatment. The value is excluded from form submission while disabled.
 * @prop {boolean} required - Marks the field as required. An empty committed value is invalid — including in display state, which shows a subtle error tint.
 * @prop {boolean} readonly - Renders the display state only: the text remains focusable for reading order, but activation is inert and no pencil affordance appears.
 * @fires {CustomEvent<{ value: string }>} arc-input - Fired on each keystroke while editing, with the draft text in detail.value.
 * @fires {CustomEvent<{ value: string }>} arc-change - Fired once on commit when the value actually changed, with the new value in detail.value.
 * @fires {CustomEvent<{ value: string }>} arc-cancel - Fired when an edit is canceled (Escape or cancel()), with the retained value in detail.value. No arc-change accompanies it.
 * @csspart base - The root element.
 * @csspart display - The display-state button wrapping the text and pencil affordance.
 * @csspart field - The input or textarea shown while editing.
 * @csspart icon - The pencil affordance icon.
 */
export class ArcInlineEdit extends DeclaredPropsMixin(FormControlMixin(LitElement)) {
  static properties = {
    value: { type: String },
    label: { type: String },
    name: { type: String, reflect: true },
    placeholder: { type: String },
    multiline: flag(false),
    // NOT flag(): a form-associated custom element whose `disabled` content
    // attribute is merely *present* is "actually disabled" per the HTML spec,
    // so the platform calls formDisabledCallback(true) and the mixin sets the
    // property back. `disabled="false"` is a disabled control here for exactly
    // the reason it is on a native <input>. Native semantics win; see
    // shared/props.js.
    disabled: { type: Boolean, reflect: true },
    _editing: { state: true },
    _draft: { state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: block; }
      :host([disabled]) { opacity: 0.5; }

      /* Display state. font/color/text-align inherit from the surrounding
         context on purpose: the component is text that happens to be editable,
         not a form control that happens to show text. */
      .inline-edit__display {
        display: flex;
        align-items: center;
        gap: var(--space-xs);
        width: 100%;
        font: inherit;
        letter-spacing: inherit;
        color: inherit;
        text-align: inherit;
        background: transparent;
        border: 1px solid transparent;
        border-radius: var(--radius-sm);
        padding: calc(var(--space-xs) / 2) var(--space-xs);
        cursor: text;
        transition:
          background var(--transition-fast),
          box-shadow var(--transition-fast);
      }

      .inline-edit__display:hover:not(:disabled) {
        background: var(--surface-hover);
      }

      .inline-edit__display:focus-visible {
        outline: none;
        background: var(--surface-hover);
        box-shadow: var(--interactive-focus-ring);
      }

      :host([disabled]) .inline-edit__display { cursor: not-allowed; }
      :host([readonly]) .inline-edit__display {
        cursor: default;
        background: transparent;
        box-shadow: none;
      }

      .inline-edit__text {
        flex: 1;
        min-width: 0;
        white-space: pre-wrap;
        overflow-wrap: anywhere;
      }

      .inline-edit__text--empty {
        color: var(--text-muted);
        font-style: italic;
      }

      /* Pencil affordance: present in the markup, revealed by hover or focus. */
      .inline-edit__icon {
        flex: none;
        color: var(--text-muted);
        opacity: 0;
        transition: opacity var(--transition-fast);
      }

      .inline-edit__display:hover .inline-edit__icon,
      .inline-edit__display:focus-visible .inline-edit__icon {
        opacity: 1;
      }

      :host([readonly]) .inline-edit__icon,
      :host([disabled]) .inline-edit__icon { opacity: 0; }

      /* Required + empty: a quiet error tint, matching the invalid treatment
         of arc-input. Placed after the hover rule so the tint survives hover. */
      .inline-edit__display--invalid,
      .inline-edit__display--invalid:hover:not(:disabled) {
        background: var(--color-error-subtle);
      }
      .inline-edit__display--invalid .inline-edit__text--empty {
        color: var(--color-error);
      }

      /* Edit state: the focus treatment arc-input shows on focus-within,
         since an inline edit field is by definition focused. Same padding and
         border-width as the display button so the text does not shift. */
      .inline-edit__field {
        display: block;
        width: 100%;
        font: inherit;
        letter-spacing: inherit;
        text-align: inherit;
        color: var(--text-primary);
        background: var(--surface-raised);
        border: 1px solid rgba(var(--interactive-rgb), 0.4);
        border-radius: var(--radius-sm);
        padding: calc(var(--space-xs) / 2) var(--space-xs);
        box-shadow: var(--shadow-inset), var(--interactive-focus);
        outline: none;
        box-sizing: border-box;
        animation: inline-edit-in var(--duration-enter) var(--ease-out);
      }

      .inline-edit__field::placeholder { color: var(--text-ghost); }

      textarea.inline-edit__field {
        resize: none;
        line-height: inherit;
      }

      .inline-edit__field--invalid {
        border-color: var(--color-error);
        box-shadow: var(--shadow-inset), var(--interactive-focus-error);
      }

      /* Only entering edit mode animates: it is the state change worth
         marking. The return to display is a return to rest. The global
         reduced-motion guard in shared-styles collapses this to instant. */
      @keyframes inline-edit-in {
        from { opacity: 0; transform: scale(0.99); }
        to   { opacity: 1; transform: scale(1); }
      }
    `,
  ];

  constructor() {
    super();
    this.value = '';
    this.label = '';
    this.name = '';
    this.placeholder = 'Empty';
    this.disabled = false;
    this._editing = false;
    this._draft = '';
  }

  /** Enter edit mode: focus the field and select its text. No-op when disabled, readonly, or already editing. */
  edit() {
    if (this.disabled || this.readonly || this._editing) return;
    this._draft = this.value ?? '';
    this._editing = true;
    this.updateComplete.then(() => {
      const field = this.shadowRoot?.querySelector('.inline-edit__field');
      if (field) {
        field.focus();
        field.select();
      }
    });
  }

  /** Commit the current draft and leave edit mode. Fires arc-change only if the value changed. */
  commit() {
    this._finish({ commit: true, restoreFocus: false });
  }

  /** Discard the draft, keep the previous value, and leave edit mode. Fires arc-cancel. */
  cancel() {
    this._finish({ commit: false, restoreFocus: false });
  }

  _finish({ commit, restoreFocus }) {
    if (!this._editing) return;
    const draft = this._draft;
    this._editing = false;
    if (commit) {
      // An unchanged commit is a no-op: no arc-change, no arc-cancel. The
      // consumer contract is that arc-change means the value is different.
      if (draft !== this.value) {
        this.value = draft;
        this.dispatchEvent(
          new CustomEvent('arc-change', {
            detail: { value: draft },
            bubbles: true,
            composed: true,
          }),
        );
      }
    } else {
      this.dispatchEvent(
        new CustomEvent('arc-cancel', {
          detail: { value: this.value },
          bubbles: true,
          composed: true,
        }),
      );
    }
    if (restoreFocus) {
      this.updateComplete.then(() => {
        this.shadowRoot?.querySelector('.inline-edit__display')?.focus();
      });
    }
  }

  _onDisplayClick() {
    this.edit();
  }

  _onDisplayKeydown(e) {
    // Enter and Space also arrive as native button activation (click), but
    // edit() is idempotent, and handling them here keeps activation working
    // when the event is synthesized or the button semantics are overridden.
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'F2') {
      e.preventDefault();
      this.edit();
    }
  }

  _onFieldInput(e) {
    this._draft = e.target.value;
    this.dispatchEvent(
      new CustomEvent('arc-input', {
        detail: { value: this._draft },
        bubbles: true,
        composed: true,
      }),
    );
  }

  _onFieldKeydown(e) {
    if (e.key === 'Escape') {
      // Contain the Escape: cancelling an inline edit must not also close a
      // surrounding modal or drawer.
      e.preventDefault();
      e.stopPropagation();
      this._finish({ commit: false, restoreFocus: true });
      return;
    }
    if (e.key === 'Enter') {
      const commits = this.multiline ? e.metaKey || e.ctrlKey : true;
      if (commits) {
        e.preventDefault();
        this._finish({ commit: true, restoreFocus: true });
      }
    }
  }

  _onFieldBlur() {
    // A blur that follows Enter/Escape finds _editing already false and does
    // nothing; a real click-away commits.
    if (this._editing) this._finish({ commit: true, restoreFocus: false });
  }

  _renderField() {
    const invalid = this.required && !this._draft;
    const classes = `inline-edit__field ${invalid ? 'inline-edit__field--invalid' : ''}`;
    if (this.multiline) {
      // Rows track the draft so the field roughly matches the display height
      // it replaced, clamped so a long note cannot swallow the page.
      const rows = Math.min(8, Math.max(2, String(this._draft).split('\n').length));
      return html`<textarea
        class=${classes}
        part="field"
        rows=${rows}
        placeholder=${this.placeholder}
        aria-label=${this.label || nothing}
        aria-invalid=${invalid ? 'true' : nothing}
        .value=${this._draft}
        @input=${this._onFieldInput}
        @keydown=${this._onFieldKeydown}
        @blur=${this._onFieldBlur}
      ></textarea>`;
    }
    return html`<input
      class=${classes}
      part="field"
      type="text"
      placeholder=${this.placeholder}
      aria-label=${this.label || nothing}
      aria-invalid=${invalid ? 'true' : nothing}
      .value=${this._draft}
      @input=${this._onFieldInput}
      @keydown=${this._onFieldKeydown}
      @blur=${this._onFieldBlur}
    />`;
  }

  _renderDisplay() {
    const empty = !this.value;
    const invalid = this.required && empty;
    const classes = `inline-edit__display ${invalid ? 'inline-edit__display--invalid' : ''}`;
    return html`
      <button
        type="button"
        class=${classes}
        part="base display"
        ?disabled=${this.disabled}
        aria-label=${this.label ? `Edit ${this.label}` : 'Edit'}
        aria-disabled=${this.readonly ? 'true' : nothing}
        @click=${this._onDisplayClick}
        @keydown=${this._onDisplayKeydown}
      >
        <span class="inline-edit__text ${empty ? 'inline-edit__text--empty' : ''}">${empty ? this.placeholder : this.value}</span>
        <arc-icon class="inline-edit__icon" name="pencil" size="xs" part="icon"></arc-icon>
      </button>
    `;
  }

  render() {
    return this._editing ? this._renderField() : this._renderDisplay();
  }
}
