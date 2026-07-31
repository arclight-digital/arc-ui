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
  /* Default, for a consumer that sets no variant at all. arc-alert and its
     siblings default to info in the constructor and never see this; arc-badge
     and arc-tag have no default variant, and without it their status glow
     would resolve against an undefined --_status-rgb and simply not paint. */
  :host {
    --_status-color: var(--accent-primary);
    --_status-rgb:   var(--accent-primary-rgb);
  }

  /* info is the accent, not --color-info. The two were both in use — statusVars
     said accent-primary, arc-badge and arc-tag said --color-info — which made
     "info" mean two different blues depending on which component you asked.
     Settled here, since this is the shared mechanism. */
  :host([variant="info"]),
  :host([variant="primary"]) {
    --_status-color: var(--accent-primary);
    --_status-rgb:   var(--accent-primary-rgb);
  }

  :host([variant="secondary"]) {
    --_status-color: var(--accent-secondary);
    --_status-rgb:   var(--accent-secondary-rgb);
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
