import { LitElement, html, css, nothing } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { tokenStyles } from '../shared-styles.js';
import { DeclaredPropsMixin, flag, oneOf } from '../shared/props.js';

/**
 * House-styled video player. Before the first play it shows the poster with a large glowing
 * play button; once playback starts, a minimal custom control bar rides the native video —
 * play/pause, a mono time readout, a scrub bar that seeks directly, a mute toggle, and a
 * fullscreen button. During playback the bar dims after two seconds of idle rather than
 * leaving — it stays visible and clickable, and returns to full strength when the pointer is
 * anywhere over the player or a control takes focus. Standard player
 * keys work on the focused player: Space or K toggles playback, the arrow keys seek five
 * seconds, M toggles mute, F toggles fullscreen.
 *
 * Takes a single `src` — there is no source-element fallback chain for multiple formats.
 * Serve one broadly supported encoding (H.264/MP4 plays everywhere), or reach for the native
 * video element directly when you need format negotiation or adaptive streaming.
 *
 * @tag arc-video
 * @status stable
 * @requires arc-icon
 * @prop {string} src - Video source URL. A single source only; no multi-format machinery.
 * @prop {string} poster - Poster image URL shown before the first play.
 * @prop {string} label - Accessible name for the player region. Falls back to a generic label when empty.
 * @prop {boolean} autoplay - Starts playback as soon as the browser allows. Browsers only honor autoplay when the video is muted, so pair it with `muted`; when autoplay is blocked, the play overlay simply remains and the user starts playback themselves.
 * @prop {boolean} loop - Restarts playback from the beginning when the video ends.
 * @prop {boolean} muted - Mutes the audio track. Toggled live by the mute button and the M key.
 * @prop {boolean} controls - Shows the custom control bar once playback has started, and enables the player keyboard shortcuts. Defaults to true; set `controls="false"` for ambient or presentation video.
 * @prop {'none' | 'metadata' | 'auto'} preload - Passed through to the native video element. The default `metadata` loads dimensions and duration without buffering content.
 * @fires {CustomEvent<{ value: number }>} arc-play - Fired when playback starts or resumes. `detail.value` is the current time in seconds.
 * @fires {CustomEvent<{ value: number }>} arc-pause - Fired when playback pauses. `detail.value` is the current time in seconds.
 * @fires {CustomEvent<{ value: number }>} arc-ended - Fired when playback reaches the end. `detail.value` is the final time in seconds.
 * @slot none
 * @csspart base - The root element.
 * @csspart wrapper - The player frame.
 * @csspart video - The native video element.
 * @csspart overlay - The pre-play overlay covering the poster.
 * @csspart play-button - The large centered play button inside the overlay.
 * @csspart controls - The control bar.
 * @csspart play-toggle - The play/pause button in the control bar.
 * @csspart time - The current/total time readout.
 * @csspart scrubber - The seek range input.
 * @csspart mute-button - The mute toggle button.
 * @csspart fullscreen-button - The fullscreen button.
 */
export class ArcVideo extends DeclaredPropsMixin(LitElement) {
  static properties = {
    src: { type: String },
    poster: { type: String },
    label: { type: String },
    autoplay: flag(false),
    loop: flag(false),
    muted: flag(false),
    // Default-true boolean: presence is still true, and the explicit string
    // "false" is the off switch (same pattern as arc-uptime's summary prop).
    controls: flag(true, { negative: 'no-controls' }),
    preload: oneOf(['none', 'metadata', 'auto'], { default: 'metadata', reflect: false }),
    _started: { state: true },
    _playing: { state: true },
    _currentTime: { state: true },
    _duration: { state: true },
    _fullscreen: { state: true },
    _controlsVisible: { state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: block;
      }

      .video {
        position: relative;
        overflow: hidden;
        aspect-ratio: 16/9;
        border-radius: var(--radius-md);
        background: var(--surface-base);
      }

      .video:focus-visible {
        outline: none;
        box-shadow: var(--interactive-focus-ring);
      }

      video {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: contain;
        display: block;
      }

      /* Pre-play overlay: the poster shows through, the play button carries
         the state - accent glyph, glow, and a brighter glow on approach. */
      .video__overlay {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .video__play {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 64px;
        height: 64px;
        padding: 0;
        border-radius: var(--radius-full);
        border: 1px solid var(--border-default);
        background: var(--surface-primary);
        color: var(--interactive);
        cursor: pointer;
        box-shadow: var(--glow-md);
        transition:
          box-shadow var(--transition-base),
          transform var(--transition-base);
      }

      .video__play:hover {
        box-shadow: var(--glow-primary);
        transform: scale(1.05);
      }

      .video__play:focus-visible {
        outline: none;
        box-shadow: var(--interactive-focus), var(--glow-md);
      }

      /* The glyph is a triangle pointing right; nudge it optically on-center. */
      .video__play arc-icon {
        margin-inline-start: 3px;
      }

      /* Control bar: a floating themed chip, not raw glyphs over an unknown
         frame - the same call arc-carousel makes for its arrows, and the only
         one that survives both themes over arbitrary video content. */
      .video__controls {
        position: absolute;
        inset-inline: var(--space-sm);
        inset-block-end: var(--space-sm);
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        padding: var(--space-xs) var(--space-sm);
        border-radius: var(--radius-md);
        border: 1px solid var(--border-subtle);
        background: var(--surface-primary);
        transition:
          opacity var(--transition-base),
          transform var(--transition-base);
      }

      /* At rest the bar recedes rather than leaves: still legible, still
         clickable, just quiet enough to stop competing with the frame. It
         returns to full strength on approach, which is the affordance - you
         can always see where the controls are, so nothing has to be
         summoned by waving at the video. */
      .video__controls--idle {
        opacity: 0.45;
      }

      .video:hover .video__controls--idle,
      .video__controls--idle:hover,
      .video__controls--idle:focus-within {
        opacity: 1;
      }

      .video__button {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        flex: none;
        padding: 0;
        border: none;
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-primary);
        cursor: pointer;
        transition:
          color var(--transition-fast),
          background var(--transition-fast),
          box-shadow var(--transition-fast);
      }

      .video__button:hover {
        color: var(--interactive);
        background: var(--surface-hover);
        box-shadow: var(--glow-xs);
      }

      .video__button:focus-visible {
        outline: none;
        box-shadow: var(--interactive-focus-ring);
      }

      .video__button svg {
        width: 16px;
        height: 16px;
      }

      .video__time {
        display: flex;
        align-items: baseline;
        gap: var(--space-xs);
        font-family: var(--font-mono);
        font-size: var(--code-size);
        color: var(--text-muted);
        /* Updated every timeupdate - proportional digits would jitter. */
        font-variant-numeric: tabular-nums;
        user-select: none;
        white-space: nowrap;
      }

      .video__time-current {
        color: var(--interactive);
        font-weight: var(--font-label-weight, 600);
      }

      /* Scrubber: the slider track recipe, sized down for a control bar. */
      .video__scrubber {
        -webkit-appearance: none;
        appearance: none;
        flex: 1;
        min-width: 40px;
        height: 4px;
        margin: 0;
        padding: 0;
        border-radius: var(--radius-full);
        background: linear-gradient(
          to right,
          var(--interactive) 0%,
          var(--interactive) var(--fill-percent, 0%),
          var(--border-default) var(--fill-percent, 0%),
          var(--border-default) 100%
        );
        outline: none;
        cursor: pointer;
      }

      .video__scrubber::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 12px;
        height: 12px;
        border-radius: var(--radius-full);
        background: var(--interactive);
        border: 2px solid var(--surface-primary);
        cursor: pointer;
        box-shadow: var(--glow-xs);
        transition: box-shadow var(--transition-fast);
      }

      .video__scrubber::-moz-range-thumb {
        width: 12px;
        height: 12px;
        border-radius: var(--radius-full);
        background: var(--interactive);
        border: 2px solid var(--surface-primary);
        cursor: pointer;
        box-shadow: var(--glow-xs);
        transition: box-shadow var(--transition-fast);
      }

      /* The two thumb pseudo-elements cannot share a selector: a browser that
         does not recognize one drops the whole rule. */
      .video__scrubber:focus-visible::-webkit-slider-thumb {
        box-shadow: var(--interactive-focus-ring), var(--interactive-focus-thumb);
      }

      .video__scrubber:focus-visible::-moz-range-thumb {
        box-shadow: var(--interactive-focus-ring), var(--interactive-focus-thumb);
      }

      @media (prefers-reduced-motion: reduce) {
        .video__play,
        .video__button,
        .video__scrubber::-webkit-slider-thumb,
        .video__scrubber::-moz-range-thumb {
          transition: none;
        }

        .video__play:hover {
          transform: none;
        }

        /* Reduced motion drops the fade, not the dimming: the bar still
           recedes at rest, it just arrives there without the transition. */
        .video__controls {
          transition: none;
        }
      }
    `,
  ];

  constructor() {
    super();
    this.src = '';
    this.poster = '';
    this.label = '';
    this.controls = true;
    this._started = false;
    this._playing = false;
    this._currentTime = 0;
    this._duration = 0;
    this._fullscreen = false;
    this._controlsVisible = true;
    this._scrubbing = false;
    this._idleTimer = null;
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    clearTimeout(this._idleTimer);
  }

  get _video() {
    return this.renderRoot?.querySelector('video') ?? null;
  }

  /** Seconds to m:ss (or h:mm:ss). NaN or missing metadata reads as 0:00. */
  _formatTime(seconds) {
    const total = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    const pad = (n) => String(n).padStart(2, '0');
    return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
  }

  /* ---- Media element events ---- */

  _onPlay(e) {
    this._started = true;
    this._playing = true;
    this.dispatchEvent(
      new CustomEvent('arc-play', {
        detail: { value: e.target.currentTime ?? 0 },
        bubbles: true,
        composed: true,
      }),
    );
    this._restartIdleTimer();
  }

  _onPause(e) {
    this._playing = false;
    clearTimeout(this._idleTimer);
    this._controlsVisible = true;
    this.dispatchEvent(
      new CustomEvent('arc-pause', {
        detail: { value: e.target.currentTime ?? 0 },
        bubbles: true,
        composed: true,
      }),
    );
  }

  _onEnded(e) {
    this.dispatchEvent(
      new CustomEvent('arc-ended', {
        detail: { value: e.target.currentTime ?? 0 },
        bubbles: true,
        composed: true,
      }),
    );
  }

  _onTimeUpdate(e) {
    this._currentTime = e.target.currentTime ?? 0;
  }

  _onLoadedMetadata(e) {
    const d = e.target.duration;
    this._duration = Number.isFinite(d) ? d : 0;
  }

  /* ---- Idle fade ---- */

  _onActivity() {
    if (!this._controlsVisible) this._controlsVisible = true;
    this._restartIdleTimer();
  }

  _restartIdleTimer() {
    clearTimeout(this._idleTimer);
    if (!this._playing) return;
    this._idleTimer = setTimeout(() => {
      if (this._playing && !this._scrubbing) this._controlsVisible = false;
    }, 2000);
  }

  /* ---- Controls ---- */

  _togglePlay() {
    const video = this._video;
    if (!video) return;
    if (video.paused) {
      // Autoplay policy can reject; the poster overlay is the fallback UI.
      video.play()?.catch?.(() => {});
    } else {
      video.pause();
    }
  }

  _toggleMute() {
    this.muted = !this.muted;
    const video = this._video;
    if (video) video.muted = this.muted;
  }

  _toggleFullscreen() {
    const wrapper = this.renderRoot?.querySelector('.video');
    // Guarded here rather than in render: fullscreen APIs are absent both in
    // Node and in some embedded browsers, and absence must be a quiet no-op.
    if (!wrapper || typeof wrapper.requestFullscreen !== 'function') return;
    if (document.fullscreenElement) {
      document.exitFullscreen?.();
    } else {
      wrapper.requestFullscreen()?.catch?.(() => {});
    }
  }

  _onFullscreenChange() {
    this._fullscreen = !!document.fullscreenElement;
  }

  _seekBy(delta) {
    const video = this._video;
    if (!video) return;
    const duration = Number.isFinite(video.duration) ? video.duration : 0;
    const next = Math.min(duration, Math.max(0, (video.currentTime ?? 0) + delta));
    video.currentTime = next;
    this._currentTime = next;
  }

  _onScrubInput(e) {
    const t = Number(e.target.value);
    const video = this._video;
    if (video) video.currentTime = t;
    this._currentTime = t;
  }

  _onScrubDown() {
    this._scrubbing = true;
    this._onActivity();
  }

  _onScrubUp() {
    this._scrubbing = false;
    this._restartIdleTimer();
  }

  /* ---- Keyboard ---- */

  _onKeyDown(e) {
    const target = e.composedPath()[0];
    const onRange = target?.matches?.('input[type="range"]');
    const onButton = !!target?.closest?.('button');

    switch (e.key) {
      case ' ':
        // A focused button or the scrubber owns Space; doubling up would
        // toggle twice or fight the native activation.
        if (onButton || onRange) return;
        e.preventDefault();
        this._togglePlay();
        break;
      case 'k':
      case 'K':
        e.preventDefault();
        this._togglePlay();
        break;
      case 'ArrowRight':
        if (onRange) return; // the native range already seeks by arrow
        e.preventDefault();
        this._seekBy(5);
        break;
      case 'ArrowLeft':
        if (onRange) return;
        e.preventDefault();
        this._seekBy(-5);
        break;
      case 'm':
      case 'M':
        e.preventDefault();
        this._toggleMute();
        break;
      case 'f':
      case 'F':
        e.preventDefault();
        this._toggleFullscreen();
        break;
      default:
        return;
    }
    this._onActivity();
  }

  /* ---- Inline glyphs ----
   * Mute and fullscreen have no icon name that resolves in both shipped icon
   * libraries (phosphor spells them speaker-high / corners-out, lucide spells
   * them volume-2 / maximize, and the intersection is empty), so these four
   * glyphs are drawn inline - the same move arc-image makes for its fallback
   * glyph. Play and pause resolve in both libraries and stay arc-icons. */

  _muteGlyph() {
    return this.muted
      ? html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="22" y1="9" x2="16" y2="15"></line><line x1="16" y1="9" x2="22" y2="15"></line></svg>`
      : html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>`;
  }

  _fullscreenGlyph() {
    return this._fullscreen
      ? html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 3v3a2 2 0 0 1-2 2H3"></path><path d="M21 8h-3a2 2 0 0 1-2-2V3"></path><path d="M3 16h3a2 2 0 0 1 2 2v3"></path><path d="M16 21v-3a2 2 0 0 1 2-2h3"></path></svg>`
      : html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 3H5a2 2 0 0 0-2 2v3"></path><path d="M21 8V5a2 2 0 0 0-2-2h-3"></path><path d="M3 16v3a2 2 0 0 0 2 2h3"></path><path d="M16 21h3a2 2 0 0 0 2-2v-3"></path></svg>`;
  }

  _renderControls() {
    const duration = this._duration;
    const fill = duration > 0 ? (this._currentTime / duration) * 100 : 0;
    const idle = !this._controlsVisible;
    return html`
      <div class="video__controls ${idle ? 'video__controls--idle' : ''}" part="controls">
        <button
          class="video__button"
          part="play-toggle"
          aria-label=${this._playing ? 'Pause' : 'Play'}
          @click=${this._togglePlay}
        >
          <arc-icon name=${this._playing ? 'pause' : 'play'} size="sm"></arc-icon>
        </button>
        <span class="video__time" part="time">
          <span class="video__time-current">${this._formatTime(this._currentTime)}</span>
          <span aria-hidden="true">/</span>
          <span class="video__time-total">${this._formatTime(duration)}</span>
        </span>
        <input
          class="video__scrubber"
          part="scrubber"
          type="range"
          min="0"
          max=${duration > 0 ? duration : 1}
          step="any"
          .value=${String(this._currentTime)}
          aria-label="Seek"
          aria-valuetext="${this._formatTime(this._currentTime)} of ${this._formatTime(duration)}"
          style="--fill-percent: ${fill}%"
          @input=${this._onScrubInput}
          @pointerdown=${this._onScrubDown}
          @pointerup=${this._onScrubUp}
          @pointercancel=${this._onScrubUp}
        />
        <button
          class="video__button"
          part="mute-button"
          aria-label=${this.muted ? 'Unmute' : 'Mute'}
          aria-pressed=${this.muted ? 'true' : 'false'}
          @click=${this._toggleMute}
        >${this._muteGlyph()}</button>
        <button
          class="video__button"
          part="fullscreen-button"
          aria-label=${this._fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          @click=${this._toggleFullscreen}
        >${this._fullscreenGlyph()}</button>
      </div>
    `;
  }

  render() {
    const controls = this.controls !== false;
    return html`
      <div
        class="video"
        part="base wrapper"
        role="region"
        aria-label=${this.label || 'Video player'}
        tabindex=${ifDefined(controls ? '0' : undefined)}
        @keydown=${controls ? this._onKeyDown : nothing}
        @pointermove=${controls ? this._onActivity : nothing}
        @pointerdown=${controls ? this._onActivity : nothing}
        @focusin=${controls ? this._onActivity : nothing}
        @fullscreenchange=${this._onFullscreenChange}
      >
        <video
          part="video"
          src=${this.src || nothing}
          poster=${this.poster || nothing}
          preload=${this.preload}
          ?autoplay=${this.autoplay}
          ?loop=${this.loop}
          ?muted=${this.muted}
          .muted=${this.muted}
          playsinline
          @play=${this._onPlay}
          @pause=${this._onPause}
          @ended=${this._onEnded}
          @timeupdate=${this._onTimeUpdate}
          @loadedmetadata=${this._onLoadedMetadata}
          @durationchange=${this._onLoadedMetadata}
          @click=${this._started ? this._togglePlay : nothing}
        ></video>
        ${
          !this._started
            ? html`
          <div class="video__overlay" part="overlay">
            <button
              class="video__play"
              part="play-button"
              aria-label=${this.label ? `Play ${this.label}` : 'Play video'}
              @click=${this._togglePlay}
            >
              <arc-icon name="play" size="xl"></arc-icon>
            </button>
          </div>
        `
            : nothing
        }
        ${controls && this._started ? this._renderControls() : nothing}
      </div>
    `;
  }
}
