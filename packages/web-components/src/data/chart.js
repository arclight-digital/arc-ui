import { LitElement, html, css, svg, nothing } from 'lit';
import { tokenStyles } from '../shared-styles.js';

const MAX_SERIES = 6; // --chart-1..6; extras fold into "Other"
const CHAR_W = 6.2; // rough glyph width at --text-xs, for label-fit estimates
const R = (v) => Math.round(v * 100) / 100;
const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
};

/**
 * @tag arc-chart
 */
export class ArcChart extends LitElement {
  static properties = {
    type: { type: String, reflect: true },
    series: { type: Array },
    labels: { type: Array },
    stacked: { type: Boolean, reflect: true },
    hideLegend: { type: Boolean, reflect: true, attribute: 'hide-legend' },
    hideAxis: { type: Boolean, reflect: true, attribute: 'hide-axis' },
    height: { type: Number },
    valueFormat: { type: String, attribute: 'value-format' },
    currency: { type: String },
    _width: { state: true },
    _hover: { state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: block;
        width: 100%;
      }

      :host(:focus-visible) {
        outline: none;
        box-shadow: var(--interactive-focus-ring);
      }

      .chart {
        position: relative;
        width: 100%;
      }

      svg {
        display: block;
        width: 100%;
      }

      .marks {
        animation: chart-enter 500ms var(--ease-out-expo);
      }

      @keyframes chart-enter {
        from { opacity: 0; }
      }

      .gridline {
        stroke: var(--border-subtle);
        stroke-width: 1;
      }

      .axis-text {
        fill: var(--text-muted);
        font-family: var(--font-body);
        font-size: var(--text-xs);
      }

      .line {
        fill: none;
        stroke-width: 2;
        stroke-linecap: round;
        stroke-linejoin: round;
      }

      .area {
        opacity: 0.12;
        stroke: none;
      }

      .crosshair {
        stroke: var(--border-default);
        stroke-width: 1;
      }

      /* 2px surface ring separates overlapping hover dots */
      .dot {
        stroke: var(--surface-raised);
        stroke-width: 2;
      }

      /* 2px surface-colored stroke creates the gaps between donut segments */
      .seg {
        stroke: var(--surface-raised);
        stroke-width: 2;
        cursor: pointer;
      }

      .hit {
        fill: transparent;
        cursor: pointer;
      }

      .hit-active {
        fill: rgba(var(--text-primary-rgb), 0.04);
      }

      .tooltip {
        position: absolute;
        pointer-events: none;
        z-index: var(--z-tooltip);
        min-width: 120px;
        padding: var(--space-sm) 12px;
        background: var(--surface-overlay);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-md);
        font-family: var(--font-body);
        font-size: var(--text-xs);
        white-space: nowrap;
      }

      .tooltip-title {
        color: var(--text-muted);
        margin-bottom: var(--space-xs);
      }

      .tooltip-row {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
      }

      .tooltip-row + .tooltip-row {
        margin-top: 2px;
      }

      .tooltip-label {
        color: var(--text-muted);
      }

      .tooltip-value {
        color: var(--text-primary);
        font-family: var(--font-mono);
        margin-left: auto;
        padding-left: var(--space-md);
      }

      .chip {
        width: 8px;
        height: 8px;
        border-radius: 2px;
        flex: none;
      }

      .legend {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: var(--space-xs) var(--space-md);
        margin-top: var(--space-sm);
      }

      .legend-item {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        color: var(--text-secondary);
        font-family: var(--font-body);
        font-size: var(--text-xs);
      }

      .empty {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: var(--text-muted);
        font-family: var(--font-body);
        font-size: var(--text-xs);
      }

      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0 0 0 0);
        white-space: nowrap;
        border: 0;
      }

      @media (prefers-reduced-motion: reduce) {
        .marks {
          animation: none;
        }

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
    this.type = 'line';
    this.series = [];
    this.labels = [];
    this.stacked = false;
    this.hideLegend = false;
    this.hideAxis = false;
    this.height = 260;
    this.valueFormat = 'number';
    this.currency = 'USD';
    this._width = 0;
    this._hover = null;
  }

  connectedCallback() {
    super.connectedCallback();
    if (typeof ResizeObserver !== 'undefined') {
      this._ro = new ResizeObserver((entries) => {
        const w = entries[0]?.contentRect?.width;
        if (w && Math.abs(w - this._width) > 0.5) this._width = w;
      });
      this._ro.observe(this);
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._ro?.disconnect();
    this._ro = null;
  }

  /* ── Formatting ───────────────────────────────────────────── */

  _nf(key, opts) {
    this._nfCache ??= new Map();
    if (!this._nfCache.has(key)) this._nfCache.set(key, new Intl.NumberFormat(undefined, opts));
    return this._nfCache.get(key);
  }

  /** Full-precision value for tooltips and the data table */
  _fmtValue(v) {
    if (!Number.isFinite(v)) return '—';
    if (this.valueFormat === 'percent') {
      return this._nf('pct', { style: 'percent', maximumFractionDigits: 1 }).format(v);
    }
    if (this.valueFormat === 'currency') {
      return this._nf(`cur:${this.currency}`, { style: 'currency', currency: this.currency }).format(v);
    }
    return this._nf('num', { maximumFractionDigits: 2 }).format(v);
  }

  /** Abbreviated value for axis ticks (1.2k, 3.4M) */
  _fmtAxis(v) {
    if (!Number.isFinite(v)) return '';
    if (this.valueFormat === 'percent') {
      return this._nf('pct-ax', { style: 'percent', maximumFractionDigits: 1 }).format(v);
    }
    if (this.valueFormat === 'currency') {
      return this._nf(`cur-ax:${this.currency}`, {
        style: 'currency',
        currency: this.currency,
        notation: 'compact',
        maximumFractionDigits: 1,
      }).format(v);
    }
    const a = Math.abs(v);
    const [d, suffix] = a >= 1e9 ? [v / 1e9, 'B'] : a >= 1e6 ? [v / 1e6, 'M'] : a >= 1e3 ? [v / 1e3, 'k'] : [v, ''];
    return `${Math.round(d * 10) / 10}${suffix}`;
  }

  _labelAt(i) {
    const l = Array.isArray(this.labels) ? this.labels[i] : undefined;
    return l != null ? String(l) : `${i + 1}`;
  }

  /* ── Data shaping ─────────────────────────────────────────── */

  /** Fixed color order --chart-1..6; series beyond 6 fold into a summed "Other" */
  _foldSeries() {
    const src = Array.isArray(this.series) ? this.series.filter((s) => s && Array.isArray(s.data)) : [];
    if (src.length <= MAX_SERIES) return src;
    const keep = src.slice(0, MAX_SERIES - 1);
    const rest = src.slice(MAX_SERIES - 1);
    const len = Math.max(0, ...rest.map((s) => s.data.length));
    const other = {
      label: `Other (${rest.length} series)`,
      data: Array.from({ length: len }, (_, i) => rest.reduce((a, s) => a + (num(s.data[i]) || 0), 0)),
    };
    return [...keep, other];
  }

  _donutSegments() {
    const src = Array.isArray(this.series) ? this.series.filter((s) => s && Array.isArray(s.data)) : [];
    let segs;
    if (src.length === 1) {
      segs = src[0].data.map((v, i) => ({
        label: this._labelAt(i),
        value: Math.max(0, num(v) || 0),
        seriesIndex: 0,
        index: i,
      }));
    } else {
      segs = src.map((s, i) => ({
        label: s.label ?? `Series ${i + 1}`,
        value: (s.data || []).reduce((a, b) => a + Math.max(0, num(b) || 0), 0),
        seriesIndex: i,
        index: i,
      }));
    }
    if (segs.length > MAX_SERIES) {
      const rest = segs.slice(MAX_SERIES - 1);
      segs = segs.slice(0, MAX_SERIES - 1);
      // seriesIndex -1 marks the folded aggregate
      segs.push({
        label: `Other (${rest.length})`,
        value: rest.reduce((a, s) => a + s.value, 0),
        seriesIndex: -1,
        index: MAX_SERIES - 1,
      });
    }
    return segs;
  }

  /* ── Scales ───────────────────────────────────────────────── */

  _niceNum(range, round) {
    if (!(range > 0)) return 1;
    const exp = Math.floor(Math.log10(range));
    const f = range / 10 ** exp;
    const nf = round
      ? f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10
      : f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10;
    return nf * 10 ** exp;
  }

  /** Nice 1/2/5 ticks spanning [min, max] */
  _ticks(min, max) {
    const step = this._niceNum(this._niceNum(max - min, false) / 4, true);
    const lo = Math.floor(min / step) * step;
    const hi = Math.ceil(max / step) * step;
    const out = [];
    for (let t = lo; t <= hi + step / 2; t += step) out.push(+t.toFixed(10));
    return out;
  }

  _barLayout(sCount, band) {
    if (sCount === 1) {
      const bw = Math.max(1, Math.min(band * 0.6, 48));
      return { bw, gw: bw };
    }
    const bw = Math.max(1, Math.min((band * 0.75 - 2 * (sCount - 1)) / sCount, 32));
    return { bw, gw: bw * sCount + 2 * (sCount - 1) };
  }

  /** Bar with 4px corners rounded only at the value end, anchored at the baseline */
  _barPath(x, w, yv, yb) {
    const r = Math.min(4, w / 2, Math.abs(yb - yv));
    const x1 = R(x);
    const x2 = R(x + w);
    if (yv <= yb) {
      return `M${x1},${R(yb)} L${x1},${R(yv + r)} Q${x1},${R(yv)} ${R(x + r)},${R(yv)} L${R(x + w - r)},${R(yv)} Q${x2},${R(yv)} ${x2},${R(yv + r)} L${x2},${R(yb)} Z`;
    }
    return `M${x1},${R(yb)} L${x1},${R(yv - r)} Q${x1},${R(yv)} ${R(x + r)},${R(yv)} L${R(x + w - r)},${R(yv)} Q${x2},${R(yv)} ${x2},${R(yv - r)} L${x2},${R(yb)} Z`;
  }

  _arcPath(cx, cy, rO, rI, a0, a1) {
    const large = a1 - a0 > Math.PI ? 1 : 0;
    const p = (r, a) => `${R(cx + r * Math.cos(a))},${R(cy + r * Math.sin(a))}`;
    return `M${p(rO, a0)} A${R(rO)},${R(rO)} 0 ${large} 1 ${p(rO, a1)} L${p(rI, a1)} A${R(rI)},${R(rI)} 0 ${large} 0 ${p(rI, a0)} Z`;
  }

  /* ── Pointer / events ─────────────────────────────────────── */

  _emit(seriesIndex, index, value) {
    this.dispatchEvent(
      new CustomEvent('arc-mark-click', {
        detail: { seriesIndex, index, value },
        bubbles: true,
        composed: true,
      })
    );
  }

  _chartPoint(e) {
    const box = this.renderRoot?.querySelector('.chart');
    const r = box ? box.getBoundingClientRect() : { left: 0, top: 0 };
    return { px: e.clientX - r.left, py: e.clientY - r.top };
  }

  _onEnterX(e, index) {
    this._hover = { kind: 'x', index, ...this._chartPoint(e) };
  }

  _onEnterSeg(e, seg, slot, frac) {
    this._hover = { kind: 'seg', seg, slot, frac, ...this._chartPoint(e) };
  }

  _onMove(e) {
    if (!this._hover) return;
    const r = e.currentTarget.getBoundingClientRect();
    this._hover = { ...this._hover, px: e.clientX - r.left, py: e.clientY - r.top };
  }

  _onLeave() {
    this._hover = null;
  }

  /** Resolve which series a click on the full-height hover column targets */
  _onColumnClick(i, list, geo) {
    const py = this._hover?.py ?? 0;
    const px = this._hover?.px ?? 0;
    let k = 0;
    if (this.type === 'bar' && this.stacked) {
      let c = 0;
      let lastVisible = 0;
      for (let si = 0; si < list.length; si++) {
        const v = Math.max(0, num(list[si].data[i]) || 0);
        if (!v) continue;
        lastVisible = si;
        if (py >= geo.y(c + v) && py <= geo.y(c)) { k = si; c = null; break; }
        c += v;
      }
      if (c !== null) k = lastVisible;
    } else if (this.type === 'bar') {
      const { bw, gw } = this._barLayout(list.length, geo.band);
      const x0 = geo.left + i * geo.band + (geo.band - gw) / 2;
      k = Math.max(0, Math.min(list.length - 1, Math.floor((px - x0) / (bw + 2))));
    } else {
      let best = Infinity;
      list.forEach((s, si) => {
        const v = num(s.data[i]);
        if (!Number.isFinite(v)) return;
        const d = Math.abs(geo.y(v) - py);
        if (d < best) { best = d; k = si; }
      });
    }
    const value = num(list[k]?.data[i]);
    this._emit(k, i, Number.isFinite(value) ? value : null);
  }

  /* ── Models ───────────────────────────────────────────────── */

  _emptyModel() {
    return {
      empty: true,
      aria: 'Empty chart, no data',
      body: html`<div class="empty">No data</div>`,
      legendItems: [],
      tableHead: [],
      tableRows: [],
    };
  }

  _cartesianModel() {
    const list = this._foldSeries();
    const n = list.length ? Math.max(0, ...list.map((s) => s.data.length)) : 0;
    if (!list.length || n === 0) return this._emptyModel();

    const stacked = this.stacked && this.type === 'bar';
    let lo = Infinity;
    let hi = -Infinity;
    if (stacked) {
      lo = 0;
      for (let i = 0; i < n; i++) {
        let sum = 0;
        for (const s of list) sum += Math.max(0, num(s.data[i]) || 0);
        hi = Math.max(hi, sum);
      }
    } else {
      for (const s of list) {
        for (let i = 0; i < n; i++) {
          const v = num(s.data[i]);
          if (Number.isFinite(v)) {
            lo = Math.min(lo, v);
            hi = Math.max(hi, v);
          }
        }
      }
    }
    if (!Number.isFinite(lo) || !Number.isFinite(hi)) { lo = 0; hi = 1; }
    if (this.type !== 'line') { lo = Math.min(lo, 0); hi = Math.max(hi, 0); }
    if (lo === hi) hi = lo + 1;

    const ticks = this._ticks(lo, hi);
    lo = ticks[0];
    hi = ticks[ticks.length - 1];

    const w = this._width || 600;
    const h = this.height;
    const tickLabels = ticks.map((t) => this._fmtAxis(t));
    const left = this.hideAxis ? 8 : Math.ceil(Math.max(...tickLabels.map((t) => t.length)) * CHAR_W) + 14;
    const right = 8;
    const top = 10;
    const bottom = this.hideAxis ? 8 : 26;
    const plotW = Math.max(1, w - left - right);
    const plotH = Math.max(1, h - top - bottom);
    const y = (v) => top + (1 - (v - lo) / (hi - lo)) * plotH;
    const band = plotW / n;
    const xc = (i) => left + (i + 0.5) * band;
    const geo = { y, band, left };

    let axis = nothing;
    if (!this.hideAxis) {
      // skip every Nth x label when the estimated widths would collide
      const labelStrs = Array.from({ length: n }, (_, i) => this._labelAt(i));
      const maxLen = Math.max(1, ...labelStrs.map((l) => l.length));
      const skip = Math.max(1, Math.ceil((n * (maxLen * CHAR_W + 12)) / plotW));
      axis = svg`
        <g part="axis">
          ${ticks.map((t) => svg`
            <line class="gridline" x1=${left} x2=${R(left + plotW)} y1=${R(y(t))} y2=${R(y(t))}></line>
            <text class="axis-text" x=${left - 8} y=${R(y(t))} text-anchor="end" dominant-baseline="middle">${this._fmtAxis(t)}</text>
          `)}
          ${labelStrs.map((l, i) => (i % skip ? nothing : svg`
            <text class="axis-text" x=${R(xc(i))} y=${h - 8} text-anchor="middle">${l}</text>
          `))}
        </g>`;
    }

    let marks;
    if (this.type === 'bar' && !stacked) {
      const { bw, gw } = this._barLayout(list.length, band);
      marks = list.map((s, si) => {
        const color = `var(--chart-${si + 1})`;
        return svg`${Array.from({ length: n }, (_, i) => {
          const v = num(s.data[i]);
          if (!Number.isFinite(v)) return nothing;
          const x = left + i * band + (band - gw) / 2 + si * (bw + 2);
          return svg`<path fill=${color} d=${this._barPath(x, bw, y(v), y(0))}></path>`;
        })}`;
      });
    } else if (stacked) {
      const { bw } = this._barLayout(1, band);
      marks = Array.from({ length: n }, (_, i) => {
        const x0 = left + i * band + (band - bw) / 2;
        const segs = [];
        for (let si = 0; si < list.length; si++) {
          const v = Math.max(0, num(list[si].data[i]) || 0);
          if (v > 0) segs.push({ si, v });
        }
        let c = 0;
        return svg`${segs.map((o, j) => {
          const yTop = y(c + o.v);
          const yBot = y(c);
          c += o.v;
          const color = `var(--chart-${o.si + 1})`;
          if (j === segs.length - 1) {
            // only the outermost segment gets the rounded value end
            return svg`<path fill=${color} d=${this._barPath(x0, bw, yTop, yBot)}></path>`;
          }
          // shave 2px off the top of inner segments: the surface shows through as the gap
          const shaved = Math.min(yBot, yTop + 2);
          return svg`<rect fill=${color} x=${R(x0)} y=${R(shaved)} width=${R(bw)} height=${R(Math.max(0, yBot - shaved))}></rect>`;
        })}`;
      });
    } else {
      const baseline = y(Math.max(lo, Math.min(hi, 0)));
      marks = list.map((s, si) => {
        const color = `var(--chart-${si + 1})`;
        const pts = [];
        for (let i = 0; i < n; i++) {
          const v = num(s.data[i]);
          if (Number.isFinite(v)) pts.push([xc(i), y(v)]);
        }
        if (!pts.length) return nothing;
        const d = pts.map(([X, Y], j) => `${j ? 'L' : 'M'}${R(X)},${R(Y)}`).join(' ');
        const area = this.type === 'area'
          ? svg`<path class="area" fill=${color} d=${`${d} L${R(pts[pts.length - 1][0])},${R(baseline)} L${R(pts[0][0])},${R(baseline)} Z`}></path>`
          : nothing;
        return svg`${area}<path class="line" stroke=${color} d=${d}></path>`;
      });
    }

    // crosshair + dots for line/area at the hovered x
    let hoverLayer = nothing;
    const hv = this._hover;
    if (hv?.kind === 'x' && hv.index < n && this.type !== 'bar') {
      const hx = R(xc(hv.index));
      hoverLayer = svg`
        <line class="crosshair" x1=${hx} x2=${hx} y1=${top} y2=${R(top + plotH)}></line>
        ${list.map((s, si) => {
          const v = num(s.data[hv.index]);
          if (!Number.isFinite(v)) return nothing;
          return svg`<circle class="dot" cx=${hx} cy=${R(y(v))} r="3.5" fill=${`var(--chart-${si + 1})`}></circle>`;
        })}`;
    }

    const hits = svg`
      ${Array.from({ length: n }, (_, i) => svg`
        <rect
          class="hit ${this.type === 'bar' && hv?.kind === 'x' && hv.index === i ? 'hit-active' : ''}"
          x=${R(left + i * band)} y=${top} width=${R(band)} height=${R(plotH)}
          @pointerenter=${(e) => this._onEnterX(e, i)}
          @click=${() => this._onColumnClick(i, list, geo)}
        ></rect>
      `)}`;

    const typeName = stacked ? 'Stacked bar' : this.type === 'area' ? 'Area' : this.type === 'bar' ? 'Bar' : 'Line';
    const aria = `${typeName} chart, ${list.length} series, ${n} categories`;

    return {
      aria,
      list,
      n,
      body: html`
        <svg height=${h} viewBox=${`0 0 ${w} ${h}`} aria-hidden="true">
          ${axis}
          <g class="marks">${marks}</g>
          ${hoverLayer}
          ${hits}
        </svg>`,
      legendItems: list.map((s, i) => s.label ?? `Series ${i + 1}`),
      tableHead: ['Category', ...list.map((s, i) => s.label ?? `Series ${i + 1}`)],
      tableRows: Array.from({ length: n }, (_, i) => [
        this._labelAt(i),
        ...list.map((s) => this._fmtValue(num(s.data[i]))),
      ]),
    };
  }

  _donutModel() {
    const segs = this._donutSegments();
    const total = segs.reduce((a, s) => a + s.value, 0);
    if (!segs.length || total <= 0) return this._emptyModel();

    const w = this._width || 600;
    const h = this.height;
    const cx = w / 2;
    const cy = h / 2;
    const rO = Math.max(10, Math.min(w, h) / 2 - 8);
    const rI = rO * 0.62; // hole >= 60%

    let a = -Math.PI / 2;
    const paths = segs.map((seg, slot) => {
      const frac = seg.value / total;
      const a0 = a;
      a += frac * Math.PI * 2;
      if (frac <= 0) return nothing;
      const a1 = Math.min(a, a0 + Math.PI * 2 - 0.0001);
      return svg`
        <path
          class="seg"
          fill=${`var(--chart-${slot + 1})`}
          d=${this._arcPath(cx, cy, rO, rI, a0, a1)}
          @pointerenter=${(e) => this._onEnterSeg(e, seg, slot, frac)}
          @click=${() => this._emit(seg.seriesIndex, seg.index, seg.value)}
        ></path>`;
    });

    return {
      aria: `Donut chart, ${segs.length} segments`,
      segs,
      body: html`
        <svg height=${h} viewBox=${`0 0 ${w} ${h}`} aria-hidden="true">
          <g class="marks">${paths}</g>
        </svg>`,
      legendItems: segs.map((s) => s.label),
      tableHead: ['Label', 'Value', 'Share'],
      tableRows: segs.map((s) => [
        s.label,
        this._fmtValue(s.value),
        this._nf('share', { style: 'percent', maximumFractionDigits: 1 }).format(s.value / total),
      ]),
    };
  }

  /* ── Render ───────────────────────────────────────────────── */

  _renderTooltip(model) {
    const hv = this._hover;
    if (!hv || hv.px == null) return nothing;
    const w = this._width || 600;
    const flip = hv.px > w * 0.55;
    const ty = Math.max(16, Math.min(this.height - 16, hv.py ?? 0));
    const style = `left:${R(hv.px + (flip ? -12 : 12))}px; top:${R(ty)}px; transform: translate(${flip ? '-100%' : '0'}, -50%);`;

    if (hv.kind === 'seg') {
      return html`
        <div class="tooltip" part="tooltip" style=${style}>
          <div class="tooltip-title">${hv.seg.label}</div>
          <div class="tooltip-row">
            <span class="chip" style=${`background: var(--chart-${hv.slot + 1})`}></span>
            <span class="tooltip-label">${this._nf('share', { style: 'percent', maximumFractionDigits: 1 }).format(hv.frac)}</span>
            <span class="tooltip-value">${this._fmtValue(hv.seg.value)}</span>
          </div>
        </div>`;
    }
    if (hv.kind !== 'x' || !model.list || hv.index >= model.n) return nothing;
    return html`
      <div class="tooltip" part="tooltip" style=${style}>
        <div class="tooltip-title">${this._labelAt(hv.index)}</div>
        ${model.list.map((s, si) => html`
          <div class="tooltip-row">
            <span class="chip" style=${`background: var(--chart-${si + 1})`}></span>
            <span class="tooltip-label">${s.label ?? `Series ${si + 1}`}</span>
            <span class="tooltip-value">${this._fmtValue(num(s.data[hv.index]))}</span>
          </div>
        `)}
      </div>`;
  }

  render() {
    const model = this.type === 'donut' ? this._donutModel() : this._cartesianModel();
    const showLegend = !this.hideLegend && model.legendItems.length >= 2;

    return html`
      <div
        class="chart"
        part="chart"
        role="img"
        aria-label=${model.aria}
        style=${`height:${this.height}px`}
        @pointermove=${this._onMove}
        @pointerleave=${this._onLeave}
      >
        ${model.body}
        ${model.empty ? nothing : this._renderTooltip(model)}
      </div>
      ${showLegend
        ? html`
          <div class="legend" part="legend">
            ${model.legendItems.map((label, i) => html`
              <span class="legend-item">
                <span class="chip" style=${`background: var(--chart-${i + 1})`}></span>${label}
              </span>
            `)}
          </div>`
        : nothing}
      ${model.empty
        ? nothing
        : html`
          <table class="sr-only">
            <caption>${model.aria}</caption>
            <thead>
              <tr>${model.tableHead.map((th) => html`<th scope="col">${th}</th>`)}</tr>
            </thead>
            <tbody>
              ${model.tableRows.map((row) => html`
                <tr>
                  ${row.map((cell, ci) => (ci === 0 ? html`<th scope="row">${cell}</th>` : html`<td>${cell}</td>`))}
                </tr>
              `)}
            </tbody>
          </table>`}
    `;
  }
}
