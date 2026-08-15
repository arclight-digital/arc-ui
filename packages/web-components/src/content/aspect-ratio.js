import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * Container that enforces a consistent width-to-height ratio on its content, ideal for images,
 * videos, and embedded media.
 *
 * @tag arc-aspect-ratio
 * @prop {string} ratio - Aspect ratio as a `W/H` string. Supports integers and decimals. An unparseable value, or one with a zero on either side, is normalised **on the property** to `16/9` — so reading `ratio` back always gives the ratio the component is actually using.
 * @slot - Default content.
 * @csspart container
 * @csspart inner
 */
export class ArcAspectRatio extends LitElement {
  static properties = {
    ratio: { type: String, reflect: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: block; }

      .aspect-ratio {
        position: relative;
        width: 100%;
        overflow: hidden;
        border-radius: var(--radius-md);
      }

      .aspect-ratio__inner {
        width: 100%;
        height: 100%;
      }

      ::slotted(*) {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
    `,
  ];

  constructor() {
    super();
    this.ratio = '16/9';
  }

  /** The documented default, and what anything unusable normalises to. */
  static DEFAULT_RATIO = '16/9';

  /**
   * `W/H` if the string is a usable ratio, else null.
   *
   * A zero on either side is rejected rather than passed through: `0/5` matched
   * the old format check, reached the CSS as `aspect-ratio: 0 / 5`, and
   * collapsed the box. The guard for exactly that (`if (w === 0) …`) existed —
   * inside `_paddingFallback`, a getter the render never called, so the check
   * had been written and then stranded. That getter is gone; its docstring
   * promised a padding-top fallback "for browsers that don't support the
   * aspect-ratio CSS property" and nothing rendered one, which is the same
   * doc/code drift as the rest of this batch.
   */
  static parseRatio(value) {
    const match = String(value ?? '').match(/^(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)$/);
    if (!match) return null;
    if (parseFloat(match[1]) === 0 || parseFloat(match[2]) === 0) return null;
    return `${match[1]}/${match[2]}`;
  }

  /**
   * Normalise on the **state**, not in the render.
   *
   * The fallback used to be applied where the value was *used*, so
   * `<arc-aspect-ratio ratio="banana">` drew a 16/9 box while `el.ratio` still
   * read `banana` — the component displayed one ratio and held another. Same
   * shape as findings #1, #47 and #70.
   *
   * Written by hand rather than through the declared-props vocabulary, which
   * has no term for a string pattern: `oneOf` is a membership test and `num` is
   * a range, and inventing a `pattern()` kind for a single prop is speculative.
   * V4-PLAN 2.3 surveys the ~70 remaining prose constraints and is where that
   * term earns its place if more than one prop wants it.
   */
  willUpdate(changed) {
    if (!changed.has('ratio')) return;
    const parsed = ArcAspectRatio.parseRatio(this.ratio);
    if (parsed !== this.ratio) this.ratio = parsed ?? ArcAspectRatio.DEFAULT_RATIO;
  }

  /** The normalised ratio, as CSS wants it spaced. */
  get _aspectRatio() {
    return (ArcAspectRatio.parseRatio(this.ratio) ?? ArcAspectRatio.DEFAULT_RATIO).replace('/', ' / ');
  }

  render() {
    return html`
      <div
        class="aspect-ratio"
        part="container"
        style="aspect-ratio: ${this._aspectRatio};"
      >
        <div class="aspect-ratio__inner" part="inner">
          <slot></slot>
        </div>
      </div>
    `;
  }
}
