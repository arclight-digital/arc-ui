import { LitElement, css, nothing } from 'lit';
import { isEditingTarget } from '../shared/editing-target.js';
import { DeclaredPropsMixin, flag } from '../shared/props.js';

/**
 * Invisible keyboard shortcut listener that supports modifier combos (Ctrl+K) and chord sequences
 * (g i). Fires an event when the key pattern is matched.
 *
 * Invisible keyboard shortcut listener. Supports modifier combos ("ctrl+k", "meta+shift+p") and
 * chord sequences ("g i" = press g, then i).
 *
 * @tag arc-hotkey
 * @status stable
 * @prop {string} keys - Key pattern to match. Modifier combos use "+" (e.g., "ctrl+k"). Chords use spaces (e.g., "g i").
 * @prop {boolean} disabled - Temporarily suspends the shortcut listener.
 * @prop {boolean} global - When true, attaches to `window` instead of `document` and skips input/textarea filtering.
 * @fires {CustomEvent<{ keys: string }>} arc-hotkey-trigger - Fired when the full key pattern is matched. `event.detail.keys` contains the matched pattern string.
 * @slot none
 */
export class ArcHotkey extends DeclaredPropsMixin(LitElement) {
  static properties = {
    keys: { type: String },
    disabled: flag(false),
    global: flag(false, { reflect: false }),
  };

  static styles = css`
    :host { display: none !important; }
  `;

  constructor() {
    super();
    this.keys = '';
    this._chordIndex = 0;
    this._chordTimer = null;
    this._parsedChords = [];
    this._onKeydown = this._onKeydown.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    this._parseKeys();
    this._target.addEventListener('keydown', this._onKeydown);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._target.removeEventListener('keydown', this._onKeydown);
    this._clearChord();
  }

  updated(changed) {
    if (changed.has('keys')) {
      this._parseKeys();
    }
    if (changed.has('global')) {
      const oldTarget = changed.get('global') ? window : document;
      oldTarget?.removeEventListener?.('keydown', this._onKeydown);
      this._target.addEventListener('keydown', this._onKeydown);
    }
  }

  get _target() {
    return this.global ? window : document;
  }

  /**
   * Parse "ctrl+k" or "g i" (chord) into structured descriptors.
   * Chords are space-separated: "g i" means press g, release, press i.
   */
  _parseKeys() {
    if (!this.keys) {
      this._parsedChords = [];
      return;
    }

    this._parsedChords = this.keys.split(/\s+/).map((combo) => {
      const parts = combo.toLowerCase().split('+');
      const key = parts.pop();
      return {
        key,
        ctrl: parts.includes('ctrl') || parts.includes('control'),
        meta: parts.includes('meta') || parts.includes('cmd') || parts.includes('command'),
        shift: parts.includes('shift'),
        alt: parts.includes('alt') || parts.includes('option'),
      };
    });
  }

  _matchesCombo(e, combo) {
    const key = e.key.toLowerCase();
    if (key !== combo.key) return false;
    if (combo.ctrl !== (e.ctrlKey || false)) return false;
    if (combo.meta !== (e.metaKey || false)) return false;
    if (combo.shift !== (e.shiftKey || false)) return false;
    if (combo.alt !== (e.altKey || false)) return false;
    return true;
  }

  _onKeydown(e) {
    if (this.disabled || !this._parsedChords.length) return;

    // Skip if focus is in a text-entry element (unless global).
    //
    // This used to read e.target.tagName, which is the retargeted host for any
    // event out of a shadow root: a keypress in <arc-textarea> arrived as
    // ARC-TEXTAREA, matched nothing, and the hotkey fired while the user was
    // typing. isEditingTarget reads composedPath()[0] instead.
    if (!this.global && isEditingTarget(e)) return;

    const expected = this._parsedChords[this._chordIndex];
    if (!expected) return;

    if (this._matchesCombo(e, expected)) {
      e.preventDefault();
      this._chordIndex++;

      if (this._chordIndex >= this._parsedChords.length) {
        // Full match — fire trigger
        this._chordIndex = 0;
        this._clearChord();
        this.dispatchEvent(
          new CustomEvent('arc-hotkey-trigger', {
            bubbles: true,
            composed: true,
            detail: { keys: this.keys },
          }),
        );
      } else {
        // Waiting for next chord key — timeout after 1s
        this._clearChord();
        this._chordTimer = setTimeout(() => {
          this._chordIndex = 0;
        }, 1000);
      }
    } else if (this._chordIndex > 0) {
      // Wrong key during chord — reset
      this._chordIndex = 0;
      this._clearChord();
    }
  }

  _clearChord() {
    if (this._chordTimer) {
      clearTimeout(this._chordTimer);
      this._chordTimer = null;
    }
  }

  render() {
    return nothing;
  }
}
