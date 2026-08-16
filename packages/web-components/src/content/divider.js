import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { DeclaredPropsMixin, flag, oneOf } from '../shared/props.js';

/**
 * Horizontal rule with multiple visual styles from subtle to glowing.
 *
 * @tag arc-divider
 * @status stable
 * @prop {'subtle' | 'glow' | 'line-white' | 'line-primary' | 'line-gradient' | 'dashed' | 'dotted' | 'fade' | 'line'} variant - Visual style.
 *   `subtle`, `glow` and the three `line-*` styles are the illuminated set. `dashed`, `dotted` and `fade` are
 *   the plain rule styles absorbed from `arc-separator` when it was merged here, along with `line`,
 *   its flat single-color rule. `fade` is the flat edge-to-edge fade, as distinct from `subtle`, which
 *   is the token gradient; `line` is the flat rule with no fade at all.
 * @prop {'' | 'left' | 'right'} align - Shifts the gradient origin so it fades from one edge
 *   instead of both. Empty (the default) fades from both edges. Useful for asymmetric layouts where the divider should visually connect to content on one side.
 * @prop {boolean} vertical - Renders the divider as a vertical line. Switches to `inline-flex` display and rotates gradient directions to run top-to-bottom. Use inside flex rows to separate inline content.
 * @prop {string} label - Text displayed in the center of the divider, splitting it into two lines. Common use: 'OR' between form options. Only applies to horizontal dividers.
 * @slot none
 * @csspart base - The root element.
 * @csspart divider
 * @csspart line
 * @csspart label
 */
export class ArcDivider extends DeclaredPropsMixin(LitElement) {
  static properties = {
    variant: oneOf([
      'subtle', 'glow', 'line-white', 'line-primary', 'line-gradient',
      // Absorbed from arc-separator (4.2). A merge that dropped them would be
      // deleting three visual capabilities and calling it consolidation —
      // arc-divider had no dashed or dotted rule of any kind.
      'dashed', 'dotted', 'fade', 'line',
    ]),
    align: oneOf(['', 'left', 'right']),
    vertical: flag(false),
    label: { type: String },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: block; width: 100%; }

      .divider { width: 100%; height: 1px; }

      :host(:not([variant="glow"]):not([variant="line-gradient"]):not([variant="line-primary"]):not([variant="line-white"]):not([variant="dashed"]):not([variant="dotted"]):not([variant="fade"]):not([variant="line"])) .divider,
      :host([variant="subtle"]) .divider { background: var(--gradient-divider); }

      :host([variant="glow"]) .divider {
        position: relative;
        background: var(--gradient-divider-glow);
        box-shadow: 0 0 6px rgba(var(--accent-primary-rgb),0.08);
      }
      :host([variant="glow"]) .divider::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(90deg, transparent 0%, rgba(var(--accent-secondary-rgb),0.4) 50%, transparent 100%);
        background-size: 200% 100%;
        animation: divider-shimmer 6s ease-in-out infinite;
        mix-blend-mode: screen;
      }

      :host([variant="line-white"]) .divider,
      :host([variant="line-primary"]) .divider,
      :host([variant="line-gradient"]) .divider {
        height: 2px;
        margin-inline: auto;
      }
      :host([variant="line-white"]) .divider {
        max-width: 160px;
        background: linear-gradient(90deg, transparent, rgba(var(--text-primary-rgb),0.35), transparent);
      }
      :host([variant="line-primary"]) .divider {
        max-width: 200px;
        background: linear-gradient(90deg, transparent, rgba(var(--accent-primary-rgb),0.7), transparent);
        box-shadow: var(--glow-sm);
      }
      :host([variant="line-gradient"]) .divider {
        max-width: 240px;
        background: var(--divider-glow);
        box-shadow: var(--glow-md);
      }

      /* Alignment — rewrite gradients to originate from one edge */
      :host([align="left"]) .divider { margin-inline: 0; }
      :host([align="right"]) .divider { margin-inline-start: auto; margin-inline-end: 0; }

      :host([align="left"]:not([variant="glow"]):not([variant="line-gradient"]):not([variant="line-primary"]):not([variant="line-white"]):not([variant="dashed"]):not([variant="dotted"]):not([variant="fade"]):not([variant="line"])) .divider,
      :host([align="left"][variant="subtle"]) .divider {
        background: linear-gradient(90deg, var(--border-default), transparent);
      }
      :host([align="right"]:not([variant="glow"]):not([variant="line-gradient"]):not([variant="line-primary"]):not([variant="line-white"]):not([variant="dashed"]):not([variant="dotted"]):not([variant="fade"]):not([variant="line"])) .divider,
      :host([align="right"][variant="subtle"]) .divider {
        background: linear-gradient(90deg, transparent, var(--border-default));
      }

      :host([align="left"][variant="glow"]) .divider {
        background: linear-gradient(90deg, rgba(var(--accent-primary-rgb),0.5), rgba(var(--accent-secondary-rgb),0.3), transparent);
      }
      :host([align="right"][variant="glow"]) .divider {
        background: linear-gradient(90deg, transparent, rgba(var(--accent-secondary-rgb),0.3), rgba(var(--accent-primary-rgb),0.5));
      }

      :host([align="left"][variant="line-white"]) .divider {
        background: linear-gradient(90deg, rgba(var(--text-primary-rgb),0.35), transparent);
      }
      :host([align="right"][variant="line-white"]) .divider {
        background: linear-gradient(90deg, transparent, rgba(var(--text-primary-rgb),0.35));
      }

      :host([align="left"][variant="line-primary"]) .divider {
        background: linear-gradient(90deg, rgba(var(--accent-primary-rgb),0.7), transparent);
      }
      :host([align="right"][variant="line-primary"]) .divider {
        background: linear-gradient(90deg, transparent, rgba(var(--accent-primary-rgb),0.7));
      }

      :host([align="left"][variant="line-gradient"]) .divider {
        background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary), transparent);
      }
      :host([align="right"][variant="line-gradient"]) .divider {
        background: linear-gradient(90deg, transparent, var(--accent-primary), var(--accent-secondary));
      }

      /* ── Vertical ── */
      :host([vertical]) { display: inline-flex; width: auto; height: 100%; }
      :host([vertical]) .divider { width: 1px; height: 100%; }

      :host([vertical]:not([variant="glow"]):not([variant="line-gradient"]):not([variant="line-primary"]):not([variant="line-white"]):not([variant="dashed"]):not([variant="dotted"]):not([variant="fade"]):not([variant="line"])) .divider,
      :host([vertical][variant="subtle"]) .divider {
        background: linear-gradient(180deg, transparent, var(--border-default), transparent);
      }

      :host([vertical][variant="glow"]) .divider {
        background: linear-gradient(180deg, transparent, rgba(var(--accent-primary-rgb),0.5), rgba(var(--accent-secondary-rgb),0.3), transparent);
      }

      :host([vertical][variant="line-gradient"]) .divider {
        width: 2px;
        max-width: none;
        background: linear-gradient(180deg, transparent, var(--accent-primary), var(--accent-secondary), transparent);
        box-shadow: var(--glow-md);
      }

      :host([vertical][variant="line-primary"]) .divider {
        width: 2px;
        max-width: none;
        background: linear-gradient(180deg, transparent, rgba(var(--accent-primary-rgb),0.7), transparent);
        box-shadow: var(--glow-sm);
      }

      :host([vertical][variant="line-white"]) .divider {
        width: 2px;
        max-width: none;
        background: linear-gradient(180deg, transparent, rgba(var(--text-primary-rgb),0.35), transparent);
      }

      /* ── Plain rule styles, absorbed from arc-separator ──
         Border-based rather than background-based, which is what makes a dash a
         dash: a repeating background cannot produce the platform's dash metrics
         and would not track a border-style change from a consumer's own CSS.
         Height goes to 0 because the border becomes the line. */
      :host([variant="dashed"]) .divider,
      :host([variant="dotted"]) .divider {
        background: none;
        box-shadow: none;
        height: 0;
        max-width: none;
      }
      :host([variant="dashed"]) .divider { border-top: 1px dashed var(--border-default); }
      :host([variant="dotted"]) .divider { border-top: 1px dotted var(--border-default); }

      :host([variant="fade"]) .divider {
        background: linear-gradient(90deg, transparent, var(--border-default), transparent);
        box-shadow: none;
        max-width: none;
      }

      /* arc-separator's default, and the reason this variant exists rather than
         mapping separator onto subtle: subtle is the token *gradient*, which
         fades at both ends. A flat rule that reaches the full width is a
         different thing, and it was what every unadorned arc-separator drew. */
      :host([variant="line"]) .divider {
        background: var(--border-default);
        box-shadow: none;
        max-width: none;
      }

      :host([vertical][variant="dashed"]) .divider,
      :host([vertical][variant="dotted"]) .divider {
        border-top: none;
        width: 0;
        height: 100%;
      }
      :host([vertical][variant="dashed"]) .divider { border-inline-start: 1px dashed var(--border-default); }
      :host([vertical][variant="dotted"]) .divider { border-inline-start: 1px dotted var(--border-default); }

      :host([vertical][variant="fade"]) .divider {
        background: linear-gradient(180deg, transparent, var(--border-default), transparent);
      }

      :host([vertical][variant="line"]) .divider { background: var(--border-default); }

      /* Align applies to the two gradient-bearing rule styles only. A dashed
         line has no origin to shift. */
      :host([align="left"][variant="fade"]) .divider {
        background: linear-gradient(90deg, var(--border-default), transparent);
      }
      :host([align="right"][variant="fade"]) .divider {
        background: linear-gradient(90deg, transparent, var(--border-default));
      }

      /* Labeled divider */
      .divider--labeled {
        display: flex;
        align-items: center;
        gap: var(--space-md);
        height: auto;
        background: none !important;
        box-shadow: none !important;
      }

      .divider__line {
        flex: 1;
        height: 1px;
        background: var(--gradient-divider);
      }

      :host([variant="dashed"]) .divider__line,
      :host([variant="dotted"]) .divider__line {
        background: none;
        height: 0;
      }
      :host([variant="dashed"]) .divider__line { border-top: 1px dashed var(--border-default); }
      :host([variant="dotted"]) .divider__line { border-top: 1px dotted var(--border-default); }

      :host([variant="line"]) .divider__line { background: var(--border-default); }

      /* Each half fades away from the label rather than repeating the
         both-ends fade twice, which would put a hard edge either side of it. */
      :host([variant="fade"]) .divider__line:first-child {
        background: linear-gradient(90deg, transparent, var(--border-default));
      }
      :host([variant="fade"]) .divider__line:last-child {
        background: linear-gradient(90deg, var(--border-default), transparent);
      }

      .divider__label {
        font-family: var(--font-label);
        font-size: var(--_text-xs);
        font-weight: var(--font-label-weight, 600);
        letter-spacing: var(--label-spacing);
        text-transform: uppercase;
        color: var(--text-muted);
        white-space: nowrap;
        flex-shrink: 0;
      }

      @keyframes divider-shimmer {
        0%, 100% { background-position: 200% 0; }
        50% { background-position: -100% 0; }
      }

      @media (prefers-reduced-motion: reduce) {
        :host([variant="glow"]) .divider::after { animation: none; }
      }
    `,
  ];

  constructor() {
    super();
    this.label = '';
  }

  render() {
    if (this.label && !this.vertical) {
      return html`
        <div class="divider divider--labeled" role="separator" part="base divider">
          <span class="divider__line" part="line"></span>
          <span class="divider__label" part="label">${this.label}</span>
          <span class="divider__line" part="line"></span>
        </div>
      `;
    }
    return html`<div class="divider" role="separator" aria-orientation=${this.vertical ? 'vertical' : 'horizontal'} part="base divider"></div>`;
  }
}
