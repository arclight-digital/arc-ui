import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * @tag arc-typewriter
 */
export class ArcTypewriter extends LitElement {
  static properties = {
    text:         { type: String },
    speed:        { type: Number },
    delay:        { type: Number },
    cursor:       { type: Boolean, reflect: true },
    loop:         { type: Boolean, reflect: true },
    nowrap:       { type: Boolean, reflect: true },
    'pause-end':  { type: Number, reflect: true, attribute: 'pause-end' },
    _displayText: { state: true },
    _complete:    { state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: inline;
      }

      .typewriter {
        font: inherit;
        white-space: pre-wrap;
      }

      :host([nowrap]) .typewriter {
        white-space: pre;
      }

      :host([cursor]) .typewriter::after {
        content: '|';
        color: var(--accent-primary);
        animation: blink 1s step-end infinite;
      }

      :host([cursor]) .typewriter--done::after {
        animation: blink 1s step-end 3, fadeout 300ms 3s forwards;
      }

      :host([cursor][loop]) .typewriter--done::after {
        animation: blink 1s step-end infinite;
      }

      @keyframes blink {
        50% { opacity: 0; }
      }

      @keyframes fadeout {
        to { opacity: 0; }
      }

      @media (prefers-reduced-motion: reduce) {
        :host([cursor]) .typewriter::after {
          animation: none;
        }

        :host([cursor]) .typewriter--done::after {
          animation: none;
        }
      }
    `,
  ];

  constructor() {
    super();
    this.text = '';
    this.speed = 50;
    this.delay = 0;
    this.cursor = true;
    this.nowrap = false;
    this.loop = false;
    this['pause-end'] = 2000;
    this._displayText = '';
    this._complete = false;
    this._timeoutId = null;
    this._reducedMotion = false;
  }

  connectedCallback() {
    super.connectedCallback();
    this._mqListener = (e) => { this._reducedMotion = e.matches; };
    this._mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    this._reducedMotion = this._mq.matches;
    this._mq.addEventListener('change', this._mqListener);
  }

  firstUpdated() {
    this._startAnimation();
  }

  updated(changed) {
    if (changed.has('text') && changed.get('text') !== undefined) {
      this._startAnimation();
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._clearTimeout();
    if (this._mq) {
      this._mq.removeEventListener('change', this._mqListener);
    }
  }

  _clearTimeout() {
    if (this._timeoutId != null) {
      clearTimeout(this._timeoutId);
      this._timeoutId = null;
    }
  }

  _startAnimation() {
    this._clearTimeout();
    this._complete = false;

    if (this._reducedMotion || !this.text) {
      this._displayText = this.text || '';
      this._complete = true;
      this.dispatchEvent(new CustomEvent('arc-complete', { bubbles: true, composed: true }));
      return;
    }

    this._displayText = '';
    this._timeoutId = setTimeout(() => this._typeNextChar(0), this.delay);
  }

  _typeNextChar(index) {
    if (index >= this.text.length) {
      this._complete = true;
      this.dispatchEvent(new CustomEvent('arc-complete', { bubbles: true, composed: true }));

      if (this.loop) {
        this._timeoutId = setTimeout(() => this._startAnimation(), this['pause-end']);
      }
      return;
    }

    this._displayText = this.text.slice(0, index + 1);
    this._timeoutId = setTimeout(() => this._typeNextChar(index + 1), this.speed);
  }

  /** Restart the typing animation from the beginning. */
  replay() {
    this._startAnimation();
  }

  render() {
    const classes = `typewriter${this._complete ? ' typewriter--done' : ''}`;

    return html`<span class=${classes} part="text">${this._displayText}</span>`;
  }
}
