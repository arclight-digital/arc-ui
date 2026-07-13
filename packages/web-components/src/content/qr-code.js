import { LitElement, html, css, nothing } from 'lit';
import qrcode from 'qrcode-generator';
import { tokenStyles } from '../shared-styles.js';

/**
 * @tag arc-qr-code
 */
export class ArcQrCode extends LitElement {
  static properties = {
    value:     { type: String },
    size:      { type: Number },
    level:     { type: String, reflect: true },
    label:     { type: String },
    quietZone: { type: Number, attribute: 'quiet-zone' },
    contrast:  { type: Boolean, reflect: true },
    _path:     { state: true },
    _count:    { state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: inline-block;
        line-height: 0;
        color: var(--text-primary);
      }

      svg {
        display: block;
      }

      .qr-bg {
        fill: var(--qr-bg, transparent);
      }

      .qr-modules {
        fill: var(--qr-fg, currentColor);
      }

      /* Scanners decode dark-on-light far more reliably than inverted codes.
         Contrast mode forces black modules on a white card so the code stays
         scannable in both themes, regardless of --qr-fg/--qr-bg overrides. */
      .card {
        display: inline-block;
        background: rgb(var(--white-rgb));
        padding: var(--space-sm);
        border-radius: var(--radius-md);
      }

      .card .qr-bg {
        fill: rgb(var(--white-rgb));
      }

      .card .qr-modules {
        fill: rgb(var(--black-rgb));
      }

      @media (prefers-reduced-motion: reduce) {
        :host *,
        :host *::before,
        :host *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      }
    `,
  ];

  constructor() {
    super();
    this.value = '';
    this.size = 160;
    this.level = 'M';
    this.label = '';
    this.quietZone = 2;
    this.contrast = false;
    this._path = '';
    this._count = 0;
  }

  willUpdate(changed) {
    if (changed.has('value') || changed.has('level')) this._encode();
  }

  _encode() {
    this._path = '';
    this._count = 0;
    if (!this.value) return;

    const level = ['L', 'M', 'Q', 'H'].includes(this.level) ? this.level : 'M';
    try {
      const qr = qrcode(0, level); // typeNumber 0 = auto-size to content
      qr.addData(this.value);
      qr.make();

      const count = qr.getModuleCount();
      // Single path, horizontal run-length encoded, one module = one unit.
      let d = '';
      for (let row = 0; row < count; row++) {
        let col = 0;
        while (col < count) {
          if (qr.isDark(row, col)) {
            let run = 1;
            while (col + run < count && qr.isDark(row, col + run)) run++;
            d += `M${col} ${row}h${run}v1h-${run}z`;
            col += run;
          } else {
            col++;
          }
        }
      }
      this._path = d;
      this._count = count;
    } catch {
      // Value exceeds QR capacity for the chosen level — render nothing.
    }
  }

  render() {
    if (!this._path) return nothing;

    const qz = Math.max(0, this.quietZone);
    const total = this._count + qz * 2;

    // aria-label never falls back to `value` — it may be a secret (2FA URI etc.).
    const code = html`
      <svg
        part="svg"
        role="img"
        aria-label=${this.label || 'QR code'}
        width=${this.size}
        height=${this.size}
        viewBox="${-qz} ${-qz} ${total} ${total}"
        shape-rendering="crispEdges"
      >
        <rect class="qr-bg" x=${-qz} y=${-qz} width=${total} height=${total} />
        <path class="qr-modules" d=${this._path} />
      </svg>
    `;

    return this.contrast ? html`<div class="card" part="card">${code}</div>` : code;
  }
}
