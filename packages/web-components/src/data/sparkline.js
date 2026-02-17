import { LitElement, html, css, svg } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * @tag arc-sparkline
 */
export class ArcSparkline extends LitElement {
  static properties = {
    data:   { type: String },
    type:   { type: String, reflect: true },
    color:  { type: String },
    width:  { type: Number },
    height: { type: Number },
    fill:   { type: Boolean },
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: inline-block;
        vertical-align: middle;
      }

      svg {
        overflow: visible;
        display: block;
      }

      .sparkline-line {
        stroke: var(--_sparkline-color, var(--accent-primary));
        stroke-width: 1.5;
        stroke-linecap: round;
        stroke-linejoin: round;
        fill: none;
      }

      .sparkline-area {
        fill: rgba(var(--_sparkline-color-rgb, var(--accent-primary-rgb)), 0.1);
        stroke: none;
      }

      .sparkline-bar {
        fill: rgba(var(--_sparkline-color-rgb, var(--accent-primary-rgb)), 0.3);
        rx: 1;
        transition: fill var(--transition-fast, 150ms ease);
      }

      .sparkline-bar:hover {
        fill: rgba(var(--_sparkline-color-rgb, var(--accent-primary-rgb)), 0.6);
      }

      .sparkline-baseline {
        stroke: var(--border-subtle);
        stroke-width: 1;
      }

      /* Draw-in animation for line type */
      .sparkline-line-animated {
        animation: sparkline-draw 800ms ease-out forwards;
      }

      @keyframes sparkline-draw {
        from { stroke-dashoffset: var(--_dash-length); }
        to   { stroke-dashoffset: 0; }
      }

      .sparkline-area-animated {
        animation: sparkline-fade-in 800ms ease-out forwards;
        opacity: 0;
      }

      @keyframes sparkline-fade-in {
        from { opacity: 0; }
        to   { opacity: 1; }
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
    this.data = '';
    this.type = 'line';
    this.color = '';
    this.width = 120;
    this.height = 32;
    this.fill = false;
  }

  /** Parse comma-separated data string into number array */
  _parseData() {
    if (!this.data) return [];
    return this.data
      .split(',')
      .map((s) => parseFloat(s.trim()))
      .filter((n) => !isNaN(n));
  }

  /** Build polyline points string and optional area path */
  _buildLine(values) {
    if (values.length === 0) return { points: '', areaPath: '' };

    const padding = 2;
    const w = this.width;
    const h = this.height;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;

    const coords = values.map((v, i) => {
      const x = values.length === 1 ? w / 2 : (i / (values.length - 1)) * w;
      const y = padding + ((max - v) / range) * (h - padding * 2);
      return [x, y];
    });

    const points = coords.map(([x, y]) => `${x},${y}`).join(' ');

    let areaPath = '';
    if (this.fill && coords.length > 0) {
      const pathParts = coords.map(([x, y], i) => (i === 0 ? `M${x},${y}` : `L${x},${y}`));
      const lastX = coords[coords.length - 1][0];
      const firstX = coords[0][0];
      pathParts.push(`L${lastX},${h}`);
      pathParts.push(`L${firstX},${h}`);
      pathParts.push('Z');
      areaPath = pathParts.join(' ');
    }

    return { points, areaPath, coords };
  }

  /** Calculate total polyline length for dash animation */
  _calcLineLength(coords) {
    if (!coords || coords.length < 2) return 0;
    let len = 0;
    for (let i = 1; i < coords.length; i++) {
      const dx = coords[i][0] - coords[i - 1][0];
      const dy = coords[i][1] - coords[i - 1][1];
      len += Math.sqrt(dx * dx + dy * dy);
    }
    return len;
  }

  _renderLine(values) {
    const { points, areaPath, coords } = this._buildLine(values);
    if (!points) return svg``;

    const dashLen = this._calcLineLength(coords);

    return svg`
      ${this.fill ? svg`
        <path
          class="sparkline-area sparkline-area-animated"
          part="area"
          d=${areaPath}
        />
      ` : ''}
      <polyline
        class="sparkline-line sparkline-line-animated"
        part="line"
        points=${points}
        style="stroke-dasharray: ${dashLen}; stroke-dashoffset: ${dashLen}; --_dash-length: ${dashLen};"
      />
    `;
  }

  _renderBars(values) {
    if (values.length === 0) return svg``;

    const padding = 2;
    const gap = 2;
    const h = this.height;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const barWidth = Math.max(1, (this.width - gap * (values.length - 1)) / values.length);

    return values.map((v, i) => {
      const barHeight = Math.max(1, ((v - min) / range) * (h - padding * 2));
      const x = i * (barWidth + gap);
      const y = h - barHeight - padding;

      return svg`
        <rect
          class="sparkline-bar"
          part="bar"
          x=${x}
          y=${y}
          width=${barWidth}
          height=${barHeight}
          rx="1"
        />
      `;
    });
  }

  render() {
    const values = this._parseData();
    const colorStyle = this.color
      ? `--_sparkline-color: ${this.color}; --_sparkline-color-rgb: ${this.color};`
      : '';

    return html`
      <svg
        part="svg"
        width=${this.width}
        height=${this.height}
        viewBox="0 0 ${this.width} ${this.height}"
        style=${colorStyle}
        aria-hidden="true"
      >
        ${this.type === 'bar' ? this._renderBars(values) : this._renderLine(values)}
        <line
          class="sparkline-baseline"
          x1="0"
          y1=${this.height}
          x2=${this.width}
          y2=${this.height}
        />
      </svg>
    `;
  }
}
