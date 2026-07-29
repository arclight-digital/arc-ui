import { expect } from '@esm-bundle/chai';
import {
  createScale,
  rowScale,
  toPixels,
  toValue,
  spanToPixels,
  visibleRange,
  zoomAround,
  panBy,
  gridSnapper,
  gridLines,
  boundariesWithin,
  chooseStep,
} from '../src/shared/time-scale.js';

/** Ticks per quarter note used by the reference consumer. */
const PPQ = 960;
const TICKS_PER_BEAT = PPQ;
const TICKS_PER_BAR = PPQ * 4;

describe('time-scale', () => {
  describe('createScale', () => {
    it('freezes the scale so it cannot be mutated in place', () => {
      const scale = createScale({ pixelsPerUnit: 0.05 });
      expect(Object.isFrozen(scale)).to.be.true;
    });

    it('defaults origin to 0 and invert to false', () => {
      const scale = createScale({ pixelsPerUnit: 2 });
      expect(scale.origin).to.equal(0);
      expect(scale.invert).to.be.false;
    });

    it('rejects a degenerate pixelsPerUnit rather than yielding NaN', () => {
      expect(() => createScale({ pixelsPerUnit: 0 })).to.throw(RangeError);
      expect(() => createScale({ pixelsPerUnit: -1 })).to.throw(RangeError);
      expect(() => createScale({ pixelsPerUnit: undefined })).to.throw(RangeError);
      expect(() => createScale({ pixelsPerUnit: NaN })).to.throw(RangeError);
    });

    it('rejects a non-finite origin', () => {
      expect(() => createScale({ origin: NaN, pixelsPerUnit: 1 })).to.throw(RangeError);
    });
  });

  describe('horizontal mapping', () => {
    const scale = createScale({ origin: TICKS_PER_BAR, pixelsPerUnit: 0.05 });

    it('places the origin at pixel 0', () => {
      expect(toPixels(scale, TICKS_PER_BAR)).to.equal(0);
    });

    it('maps ticks forward of the origin to positive pixels', () => {
      expect(toPixels(scale, TICKS_PER_BAR + TICKS_PER_BEAT)).to.be.closeTo(48, 1e-9);
    });

    it('maps ticks behind the origin to negative pixels', () => {
      expect(toPixels(scale, 0)).to.be.closeTo(-192, 1e-9);
    });

    it('round-trips through toValue', () => {
      for (const tick of [0, 1, 240, 787_200]) {
        expect(toValue(scale, toPixels(scale, tick))).to.be.closeTo(tick, 1e-6);
      }
    });
  });

  describe('vertical mapping', () => {
    // Melody role: pitches 55–96, uniform rows.
    const scale = rowScale({ high: 96, rowHeight: 12 });

    it('puts the highest pitch at the top', () => {
      expect(toPixels(scale, 96)).to.equal(0);
    });

    it('descends as pitch falls', () => {
      expect(toPixels(scale, 95)).to.equal(12);
      expect(toPixels(scale, 55)).to.equal(492);
    });

    it('round-trips through toValue', () => {
      for (const pitch of [55, 60, 84, 96]) {
        expect(toValue(scale, toPixels(scale, pitch))).to.be.closeTo(pitch, 1e-9);
      }
    });

    it('keeps a one-semitone span equal to one row height', () => {
      expect(spanToPixels(scale, 1)).to.equal(12);
    });
  });

  describe('spanToPixels', () => {
    it('ignores origin', () => {
      const a = createScale({ origin: 0, pixelsPerUnit: 0.05 });
      const b = createScale({ origin: 500_000, pixelsPerUnit: 0.05 });
      expect(spanToPixels(a, TICKS_PER_BAR)).to.equal(spanToPixels(b, TICKS_PER_BAR));
    });

    it('returns a positive width on an inverted scale', () => {
      expect(spanToPixels(rowScale({ high: 96, rowHeight: 12 }), 4)).to.equal(48);
    });
  });

  describe('visibleRange', () => {
    it('returns the range covered by the viewport', () => {
      const scale = createScale({ origin: 1000, pixelsPerUnit: 0.5 });
      const { from, to } = visibleRange(scale, 400);
      expect(from).to.be.closeTo(1000, 1e-9);
      expect(to).to.be.closeTo(1800, 1e-9);
    });

    it('orders low→high even when inverted', () => {
      const { from, to } = visibleRange(rowScale({ high: 96, rowHeight: 12 }), 480);
      expect(from).to.be.closeTo(56, 1e-9);
      expect(to).to.be.closeTo(96, 1e-9);
      expect(from).to.be.lessThan(to);
    });
  });

  describe('zoomAround', () => {
    it('pins the value under the anchor pixel', () => {
      const scale = createScale({ origin: 4800, pixelsPerUnit: 0.05 });
      const anchor = 317;
      const before = toValue(scale, anchor);
      const zoomed = zoomAround(scale, 0.4, anchor);
      expect(toValue(zoomed, anchor)).to.be.closeTo(before, 1e-6);
    });

    it('pins on zoom out as well as zoom in', () => {
      const scale = createScale({ origin: 4800, pixelsPerUnit: 0.4 });
      const before = toValue(scale, 250);
      expect(toValue(zoomAround(scale, 0.02, 250), 250)).to.be.closeTo(before, 1e-6);
    });

    it('anchors at pixel 0 by default, holding the origin', () => {
      const scale = createScale({ origin: 4800, pixelsPerUnit: 0.05 });
      expect(zoomAround(scale, 0.2).origin).to.be.closeTo(4800, 1e-9);
    });

    it('preserves inversion', () => {
      expect(zoomAround(rowScale({ high: 96, rowHeight: 12 }), 24, 100).invert).to.be.true;
    });

    it('rejects a degenerate zoom level', () => {
      expect(() => zoomAround(createScale({ pixelsPerUnit: 1 }), 0, 10)).to.throw(RangeError);
    });
  });

  describe('panBy', () => {
    it('moves the view toward larger values on a forward scale', () => {
      const scale = createScale({ origin: 0, pixelsPerUnit: 0.05 });
      const panned = panBy(scale, 96);
      expect(panned.origin).to.be.closeTo(1920, 1e-9);
      expect(toPixels(panned, 1920)).to.be.closeTo(0, 1e-9);
    });

    it('shifts a fixed value left by exactly the delta', () => {
      const scale = createScale({ origin: 0, pixelsPerUnit: 0.05 });
      const before = toPixels(scale, 9600);
      expect(toPixels(panBy(scale, 40), 9600)).to.be.closeTo(before - 40, 1e-9);
    });

    it('is reversible', () => {
      const scale = createScale({ origin: 1000, pixelsPerUnit: 0.05 });
      expect(panBy(panBy(scale, 250), -250).origin).to.be.closeTo(1000, 1e-9);
    });
  });

  describe('gridSnapper', () => {
    const snap = gridSnapper(PPQ / 4); // 240 — the validator's default grid

    it('leaves on-grid values untouched', () => {
      expect(snap(0)).to.equal(0);
      expect(snap(240)).to.equal(240);
      expect(snap(787_200)).to.equal(787_200);
    });

    it('snaps to the nearest grid position', () => {
      expect(snap(239)).to.equal(240);
      expect(snap(241)).to.equal(240);
      expect(snap(359)).to.equal(240);
      expect(snap(361)).to.equal(480);
    });

    it('returns exact integers with no float drift over a long span', () => {
      for (const tick of [240, 12_000, 480_000, 787_200]) {
        const snapped = snap(tick + 1);
        expect(Number.isInteger(snapped)).to.be.true;
        expect(snapped % 240).to.equal(0);
      }
    });

    it('handles negative values', () => {
      expect(snap(-241)).to.equal(-240);
    });

    it('supports a coarser granularity for clip placement', () => {
      const toBar = gridSnapper(TICKS_PER_BAR);
      expect(toBar(TICKS_PER_BAR + 100)).to.equal(TICKS_PER_BAR);
      expect(toBar(TICKS_PER_BAR * 2 - 100)).to.equal(TICKS_PER_BAR * 2);
    });

    it('rejects a non-integer or non-positive grid', () => {
      expect(() => gridSnapper(0)).to.throw(RangeError);
      expect(() => gridSnapper(-240)).to.throw(RangeError);
      expect(() => gridSnapper(240.5)).to.throw(RangeError);
    });
  });

  describe('gridLines', () => {
    it('includes boundaries landing exactly on each edge', () => {
      expect(gridLines(0, TICKS_PER_BAR * 2, TICKS_PER_BAR)).to.deep.equal([0, 3840, 7680]);
    });

    it('starts at the first boundary at or after `from`', () => {
      expect(gridLines(100, 3000, TICKS_PER_BEAT)).to.deep.equal([960, 1920, 2880]);
    });

    it('returns integers for integer inputs', () => {
      for (const line of gridLines(1, 100_000, 240)) {
        expect(Number.isInteger(line)).to.be.true;
      }
    });

    it('returns empty when the range is inverted or holds no boundary', () => {
      expect(gridLines(100, 50, 240)).to.deep.equal([]);
      expect(gridLines(241, 479, 240)).to.deep.equal([]);
    });

    it('throws rather than silently allocating for a full-project range', () => {
      expect(() => gridLines(0, 787_200, 1)).to.throw(RangeError, /visibleRange/);
    });

    it('rejects a degenerate step', () => {
      expect(() => gridLines(0, 100, 0)).to.throw(RangeError);
    });
  });

  describe('boundariesWithin', () => {
    it('filters an irregular boundary list to the visible range', () => {
      // 4/4 bars, then a 6/8 section: spacing stops being uniform.
      const bars = [0, 3840, 7680, 11_520, 14_400, 17_280];
      expect(boundariesWithin(bars, 3840, 14_400)).to.deep.equal([3840, 7680, 11_520, 14_400]);
    });

    it('is inclusive of both edges', () => {
      expect(boundariesWithin([0, 100, 200], 0, 200)).to.deep.equal([0, 100, 200]);
    });
  });

  describe('chooseStep', () => {
    const candidates = [TICKS_PER_BAR, TICKS_PER_BEAT, TICKS_PER_BEAT / 2, TICKS_PER_BEAT / 4];

    it('picks the finest step meeting the minimum spacing', () => {
      // 0.05 px/tick → bar 192px, beat 48px, eighth 24px, sixteenth 12px.
      expect(chooseStep(createScale({ pixelsPerUnit: 0.05 }), candidates, 20)).to.equal(480);
    });

    it('coarsens as the scale shrinks', () => {
      expect(chooseStep(createScale({ pixelsPerUnit: 0.01 }), candidates, 20)).to.equal(3840);
    });

    it('refines as the scale grows', () => {
      expect(chooseStep(createScale({ pixelsPerUnit: 1 }), candidates, 20)).to.equal(240);
    });

    it('returns null when even the coarsest step is too dense', () => {
      expect(chooseStep(createScale({ pixelsPerUnit: 0.0001 }), candidates, 20)).to.equal(null);
    });
  });

  describe('ruler and grid stay aligned', () => {
    it('projects one offset onto both without drift', () => {
      const offset = 12_345;
      const pixelsPerUnit = 0.05;
      const ruler = createScale({ origin: offset, pixelsPerUnit });
      const grid = createScale({ origin: offset, pixelsPerUnit });

      const { from, to } = visibleRange(ruler, 900);
      const bars = gridLines(from, to, TICKS_PER_BAR);
      expect(bars.length).to.be.greaterThan(0);
      for (const tick of bars) {
        expect(toPixels(ruler, tick)).to.equal(toPixels(grid, tick));
      }
    });

    it('stays aligned through a zoom applied to both', () => {
      const base = createScale({ origin: 12_345, pixelsPerUnit: 0.05 });
      const ruler = zoomAround(base, 0.3, 400);
      const grid = zoomAround(base, 0.3, 400);
      expect(toPixels(ruler, 20_000)).to.equal(toPixels(grid, 20_000));
    });
  });
});
