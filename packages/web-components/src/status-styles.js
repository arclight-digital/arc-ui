import { css } from 'lit';

/**
 * Shared status-variant CSS custom properties.
 * Maps variant attributes on :host to --_status-color / --_status-rgb.
 *
 * Covers the Alert/Toast names (info, success, warning, error) plus
 * Callout's tip, which renders on the success ramp. The v2 note/danger
 * aliases are retired — v3 speaks one name per state.
 */
export const statusVars = css`
  :host([variant="info"]) {
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

  :host([variant="error"]) {
    --_status-color: var(--color-error);
    --_status-rgb:   var(--color-error-rgb);
  }
`;
