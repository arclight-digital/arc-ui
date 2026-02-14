import { css } from 'lit';

/**
 * Shared status-variant CSS custom properties.
 * Maps variant attributes on :host to --_status-color / --_status-rgb.
 *
 * Covers both Alert/Toast names (info, success, warning, error)
 * and Callout aliases (note → info, tip → success, danger → error).
 */
export const statusVars = css`
  :host([variant="info"]),
  :host([variant="note"]) {
    --_status-color: var(--accent-primary);
    --_status-rgb:   var(--accent-primary-rgb);
  }

  :host([variant="success"]),
  :host([variant="tip"]) {
    --_status-color: var(--color-success);
    --_status-rgb:   var(--color-success-rgb);
  }

  :host([variant="warning"]) {
    --_status-color: var(--color-warning);
    --_status-rgb:   var(--color-warning-rgb);
  }

  :host([variant="error"]),
  :host([variant="danger"]) {
    --_status-color: var(--color-error);
    --_status-rgb:   var(--color-error-rgb);
  }
`;
