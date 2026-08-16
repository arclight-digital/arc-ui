import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { hydrateSlots } from '../shared/hydrate-slots.js';

/**
 * An annotated image: glowing pins positioned over a slotted picture, each opening a small
 * popover of detail content. Built for product-feature callouts, annotated screenshots, and
 * simple maps. Slot the image and the arc-hotspot pins together as children — the pins position
 * themselves by percentage coordinates, so source order never matters. The parent keeps one
 * popover open at a time; open and close activity arrives as the arc-open and arc-close events
 * bubbling up from each arc-hotspot child, with detail.value naming the hotspot.
 *
 * @tag arc-image-hotspots
 * @arc-group marketing
 * @status stable
 * @requires arc-hotspot
 * @slot - Default content.
 * @csspart base - The root element.
 * @csspart container
 */
export class ArcImageHotspots extends LitElement {
  static styles = [
    tokenStyles,
    css`
      :host { display: block; }

      /* The positioning context every slotted arc-hotspot stretches over. */
      .image-hotspots {
        position: relative;
      }

      ::slotted(img),
      ::slotted(picture),
      ::slotted(arc-image) {
        display: block;
        width: 100%;
        height: auto;
      }
    `,
  ];

  constructor() {
    super();
    this._hotspots = [];
    this._onChildOpen = this._onChildOpen.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('arc-open', this._onChildOpen);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('arc-open', this._onChildOpen);
  }

  _onSlotChange(e) {
    this._hotspots = e.target
      .assignedElements({ flatten: true })
      .filter((el) => el.tagName === 'ARC-HOTSPOT');
    // The index is each pin's identity in event detail when it has no label.
    this._hotspots.forEach((el, i) => {
      el._index = i;
    });
  }

  /**
   * One popover at a time. The pointer path mostly handles itself — opening
   * pin B is an outside click for pin A — but a keyboard open never fires a
   * pointerdown, so the rule is enforced here on every child arc-open. Closing
   * goes through the child's close() so its cancelable arc-close still fires.
   */
  _onChildOpen(e) {
    const opened = e.target;
    if (!this._hotspots.includes(opened)) return;
    for (const hotspot of this._hotspots) {
      if (hotspot !== opened && hotspot.open) hotspot.close(false);
    }
  }

  /** The slotchange DSD swallows — see shared/hydrate-slots.js. */
  firstUpdated() {
    hydrateSlots(this);
  }

  render() {
    return html`
      <div class="image-hotspots" part="base container">
        <slot @slotchange=${this._onSlotChange}></slot>
      </div>
    `;
  }
}
