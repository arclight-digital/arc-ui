import { css, unsafeCSS } from 'lit';

/**
 * Shared positioning CSS for popup/overlay panels.
 * Returns CSS rules for top/bottom/left/right positioning
 * relative to the host element.
 *
 * @param {string} cls - The panel class name (without dot), e.g. 'popover__panel'
 * @param {object} [opts]
 * @param {string} [opts.offset='var(--space-sm)'] - CSS offset from the trigger
 * @param {number} [opts.scale=0.95] - Scale-down value when closed (1 to disable)
 * @param {string} [opts.openCls] - If set, the "open" state is a modifier class on the
 *   panel element (e.g. 'hovercard__card--visible'). If omitted, uses :host([open]).
 */
export function positionStyles(cls, { offset = 'var(--space-sm)', scale = 0.95, openCls } = {}) {
  const c = unsafeCSS(cls);
  const off = unsafeCSS(offset);
  const s = unsafeCSS(scale);

  // Build selectors for the "open" state transforms.
  // Two modes:
  //   1. Host attribute:  :host([open]) .panel        (popover)
  //   2. Modifier class:  .panel.panel--visible        (hover-card)
  const openBottom = openCls
    ? css`:host(:not([position])) .${unsafeCSS(openCls)},\n    :host([position="bottom"]) .${unsafeCSS(openCls)}`
    : css`:host([open]:not([position])) .${c},\n    :host([open][position="bottom"]) .${c}`;

  const openTop = openCls
    ? css`:host([position="top"]) .${unsafeCSS(openCls)}`
    : css`:host([open][position="top"]) .${c}`;

  const openLeft = openCls
    ? css`:host([position="left"]) .${unsafeCSS(openCls)}`
    : css`:host([open][position="left"]) .${c}`;

  const openRight = openCls
    ? css`:host([position="right"]) .${unsafeCSS(openCls)}`
    : css`:host([open][position="right"]) .${c}`;

  return css`
    :host(:not([position])) .${c},
    :host([position="bottom"]) .${c} {
      top: calc(100% + ${off});
      left: 50%;
      transform: translateX(-50%) scale(${s});
    }
    ${openBottom} {
      transform: translateX(-50%) scale(1);
    }

    :host([position="top"]) .${c} {
      bottom: calc(100% + ${off});
      left: 50%;
      transform: translateX(-50%) scale(${s});
    }
    ${openTop} {
      transform: translateX(-50%) scale(1);
    }

    :host([position="left"]) .${c} {
      right: calc(100% + ${off});
      top: 50%;
      transform: translateY(-50%) scale(${s});
    }
    ${openLeft} {
      transform: translateY(-50%) scale(1);
    }

    :host([position="right"]) .${c} {
      left: calc(100% + ${off});
      top: 50%;
      transform: translateY(-50%) scale(${s});
    }
    ${openRight} {
      transform: translateY(-50%) scale(1);
    }
  `;
}
