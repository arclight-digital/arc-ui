/**
 * Re-export tokenStyles from the main arc-ui package.
 *
 * Uses the barrel export which includes shared-styles via the index.
 * We import the css helper and define a minimal subset of tokens needed
 * by brand components — the full theme tokens (colors, gradients) inherit
 * from base.css on the document root.
 */
import { css } from 'lit';

export const tokenStyles = css`
  *, *::before, *::after {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  :host {
    --font-body: 'Host Grotesk', system-ui, sans-serif;
    --font-accent: 'Tektur', system-ui, sans-serif;

    --space-xs: 4px;
    --space-sm: 8px;
    --space-md: 16px;

    --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  }
`;
