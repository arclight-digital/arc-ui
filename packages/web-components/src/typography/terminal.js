import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/*
 * Pacing between lines when a line carries no explicit delay. A command waits
 * longer — the pause reads as a person deciding what to type next — while
 * output follows its command quickly, like a process answering. Both are
 * per-line overridable via the line's `delay` field.
 */
const COMMAND_DELAY = 500;
const OUTPUT_DELAY = 150;
/* Pause at the end of a completed transcript before a looping replay clears it. */
const LOOP_PAUSE = 2000;

/**
 * Animated terminal window: a chrome'd frame that types commands
 * character-by-character and prints their output line by line.
 *
 * The typing machinery mirrors arc-typewriter's setTimeout chain rather than
 * importing it — typewriter animates one string, this sequences many lines
 * with three behaviours, and a shared chain would serve neither cleanly.
 *
 * Server-side the full completed transcript renders (no animation in Node);
 * on the client, autoplay blanks it before first paint and replays it when
 * the element scrolls into view. Under prefers-reduced-motion the transcript
 * renders complete immediately and nothing animates — the same policy
 * arc-typewriter follows.
 *
 * @tag arc-terminal
 * @prop {Array} lines - The transcript, as objects of shape { type: 'command' | 'output' | 'comment', text: string, delay?: number }. Commands get the prompt glyph and type character-by-character; output lines appear whole; comments render muted. `delay` is milliseconds before the line starts (default 500 for commands, 150 otherwise). Property only — arrays do not survive an attribute.
 * @prop {string} prompt - Prompt glyph rendered before each command line.
 * @prop {string} title - Text centered in the window chrome bar. Empty hides it, leaving only the orbs.
 * @prop {number} speed - Milliseconds per character when typing command lines.
 * @prop {boolean} autoplay - Start the animation when the element scrolls into view. Defaults to true; disable from JS or a framework wrapper with a false property value, then drive it with play().
 * @prop {boolean} loop - Replay the transcript indefinitely, pausing briefly at the end of each cycle.
 * @fires {CustomEvent<void>} arc-complete - Fired when the whole sequence has finished printing (each cycle, when looping)
 * @slot none
 * @csspart terminal
 * @csspart titlebar
 * @csspart orbs
 * @csspart title
 * @csspart body
 * @csspart line
 * @csspart prompt
 * @csspart text
 * @csspart cursor
 */
export class ArcTerminal extends LitElement {
  static properties = {
    lines:    { attribute: false },
    prompt:   { type: String },
    title:    { type: String },
    speed:    { type: Number },
    autoplay: { type: Boolean },
    loop:     { type: Boolean, reflect: true },
    _lineIndex: { state: true },
    _charIndex: { state: true },
    _started:   { state: true },
    _complete:  { state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: block;
      }

      .terminal {
        background: var(--surface-primary);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-lg);
        overflow: hidden;
        box-shadow: var(--shadow-overlay);
      }

      /* The house window chrome — same family as arc-code-block's window
         variant: three orbs, hairline divider, centered mono title. */
      .terminal__titlebar {
        display: flex;
        align-items: center;
        padding: var(--space-sm) var(--space-md);
        border-bottom: 1px solid var(--divider);
        background: var(--surface-primary);
        position: relative;
      }

      .terminal__orbs {
        display: flex;
        gap: 8px;
      }

      .terminal__orb {
        width: 12px;
        height: 12px;
        border-radius: var(--radius-full);
      }

      .terminal__orb--close    { background: #ff5f57; }
      .terminal__orb--minimize { background: #febc2e; }
      .terminal__orb--maximize { background: #28c840; }

      .terminal__title {
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        font-family: var(--font-mono);
        font-size: var(--_text-sm);
        color: var(--text-muted);
      }

      .terminal__body {
        padding: var(--space-md);
        font-family: var(--font-mono);
        font-size: var(--code-size);
        line-height: var(--code-lh);
        color: var(--text-secondary);
        overflow-x: auto;
      }

      .terminal__line--command {
        display: flex;
        gap: var(--space-sm);
        color: var(--text-primary);
      }

      .terminal__line--comment {
        color: var(--text-ghost);
      }

      /* Lines whose turn has not come yet keep their box but not their ink:
         the frame holds its final height from the first frame, so nothing
         below it shifts while the transcript prints. */
      .terminal__line--pending {
        visibility: hidden;
      }

      .terminal__prompt {
        flex-shrink: 0;
        color: var(--accent-primary);
        user-select: none;
      }

      .terminal__text {
        min-width: 0;
        white-space: pre-wrap;
        word-break: break-word;
      }

      .terminal__cursor {
        display: inline-block;
        width: 0.55em;
        height: 1.05em;
        margin-inline-start: 1px;
        vertical-align: text-bottom;
        background: var(--accent-primary);
        box-shadow: 0 0 8px rgba(var(--accent-primary-rgb), 0.55);
        animation: blink 1s step-end infinite;
      }

      @keyframes blink {
        50% { opacity: 0; }
      }

      @media (prefers-reduced-motion: reduce) {
        .terminal__cursor {
          animation: none;
        }
      }
    `,
  ];

  constructor() {
    super();
    this.lines = [];
    this.prompt = '$';
    this.title = '';
    this.speed = 50;
    this.autoplay = true;
    this.loop = false;
    this._lineIndex = 0;
    this._charIndex = 0;
    this._started = false;
    this._complete = false;
    this._timeoutId = null;
    this._observer = null;
    this._reducedMotion = false;
  }

  connectedCallback() {
    super.connectedCallback();
    this._mqListener = (e) => { this._reducedMotion = e.matches; };
    this._mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    this._reducedMotion = this._mq.matches;
    this._mq.addEventListener('change', this._mqListener);

    if (this.autoplay && !this._complete) {
      if (typeof IntersectionObserver === 'undefined') {
        this.play();
        return;
      }
      // Blank the transcript before first client paint so a server-rendered
      // full transcript doesn't flash and then wipe. Under reduced motion the
      // transcript must stay visible the whole time, so it is never blanked.
      if (!this._reducedMotion) this._started = true;
      this._observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) this.play();
        },
        { threshold: 0.2 }
      );
      this._observer.observe(this);
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._clearTimeout();
    this._observer?.disconnect();
    this._observer = null;
    if (this._mq) {
      this._mq.removeEventListener('change', this._mqListener);
    }
  }

  updated(changed) {
    // A new transcript restarts a running animation. Before any playback the
    // static full transcript simply re-renders from the new array.
    if (changed.has('lines') && changed.get('lines') !== undefined && this._started) {
      this.play();
    }
  }

  _clearTimeout() {
    if (this._timeoutId != null) {
      clearTimeout(this._timeoutId);
      this._timeoutId = null;
    }
  }

  /** The lines array, defensively normalised so render never throws. */
  _normalizedLines() {
    if (!Array.isArray(this.lines)) return [];
    return this.lines.filter(Boolean).map((line) => ({
      type: line.type === 'command' || line.type === 'comment' ? line.type : 'output',
      text: typeof line.text === 'string' ? line.text : String(line.text ?? ''),
      delay: line.delay,
    }));
  }

  /** Play the sequence from the beginning. */
  play() {
    this._clearTimeout();
    this._observer?.disconnect();
    this._observer = null;
    this._started = true;
    this._complete = false;
    this._lineIndex = 0;
    this._charIndex = 0;

    if (this._reducedMotion || this._normalizedLines().length === 0) {
      this._finish(true);
      return;
    }
    this._advance(0);
  }

  /** Return to the blank, pre-animation state without starting playback. */
  reset() {
    this._clearTimeout();
    this._started = true;
    this._complete = false;
    this._lineIndex = 0;
    this._charIndex = 0;
  }

  _finish(instant) {
    this._lineIndex = this._normalizedLines().length;
    this._charIndex = 0;
    this._complete = true;
    this.dispatchEvent(new CustomEvent('arc-complete', { bubbles: true, composed: true }));
    // The instant path (reduced motion, empty transcript) never loops — a
    // zero-length cycle repeating forever is a busy-loop, and under reduced
    // motion a clearing-and-reappearing transcript is exactly the motion the
    // preference asked not to see.
    if (this.loop && !instant) {
      this._timeoutId = setTimeout(() => this.play(), LOOP_PAUSE);
    }
  }

  _advance(index) {
    const lines = this._normalizedLines();
    if (index >= lines.length) {
      this._finish(false);
      return;
    }
    const line = lines[index];
    this._lineIndex = index;
    this._charIndex = 0;
    const delay = line.delay ?? (line.type === 'command' ? COMMAND_DELAY : OUTPUT_DELAY);
    this._timeoutId = setTimeout(() => {
      if (line.type === 'command' && line.text.length > 0) {
        this._typeChar(index, 1);
      } else {
        this._lineIndex = index + 1;
        this._advance(index + 1);
      }
    }, delay);
  }

  _typeChar(index, count) {
    const line = this._normalizedLines()[index];
    if (!line) return;
    this._charIndex = count;
    if (count >= line.text.length) {
      this._lineIndex = index + 1;
      this._charIndex = 0;
      this._advance(index + 1);
      return;
    }
    this._timeoutId = setTimeout(() => this._typeChar(index, count + 1), this.speed);
  }

  _renderPrompt() {
    return html`<span class="terminal__prompt" part="prompt">${this.prompt}</span>`;
  }

  _renderCursor() {
    return html`<span class="terminal__cursor" part="cursor"></span>`;
  }

  _renderLine(line, index, done) {
    const revealed = done || index < this._lineIndex;
    const typing = !done && index === this._lineIndex && line.type === 'command';
    const pending = !revealed && !typing;
    const classes = `terminal__line terminal__line--${line.type}${pending ? ' terminal__line--pending' : ''}`;
    const text = typing ? line.text.slice(0, this._charIndex) : line.text;

    if (line.type === 'command') {
      return html`<div class=${classes} part="line">${this._renderPrompt()}<span class="terminal__text" part="text">${text}${typing ? this._renderCursor() : ''}</span></div>`;
    }
    return html`<div class=${classes} part="line"><span class="terminal__text" part="text">${text.length > 0 ? text : '\u00A0'}</span></div>`;
  }

  render() {
    const lines = this._normalizedLines();
    // Before playback ever starts (server render, or autoplay off) the full
    // completed transcript shows — the content is never hidden behind an
    // animation that might not run.
    const done = !this._started || this._complete;

    return html`
      <div class="terminal" part="terminal">
        <div class="terminal__titlebar" part="titlebar">
          <div class="terminal__orbs" part="orbs">
            <span class="terminal__orb terminal__orb--close"></span>
            <span class="terminal__orb terminal__orb--minimize"></span>
            <span class="terminal__orb terminal__orb--maximize"></span>
          </div>
          ${this.title ? html`<span class="terminal__title" part="title">${this.title}</span>` : ''}
        </div>
        <div class="terminal__body" part="body">
          ${lines.map((line, i) => this._renderLine(line, i, done))}
          <div class="terminal__line terminal__line--command${done ? '' : ' terminal__line--pending'}" part="line">${this._renderPrompt()}<span class="terminal__text" part="text">${done ? this._renderCursor() : '\u00A0'}</span></div>
        </div>
      </div>
    `;
  }
}
