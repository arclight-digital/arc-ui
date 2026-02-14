import { css } from 'lit';

/**
 * Shared CSS custom properties injected into every ARC UI component's shadow DOM.
 *
 * Theme-sensitive tokens (colors, gradients, glows, shadows) are NOT set here.
 * They inherit from base.css on the document root, which handles
 * dark/light/auto themes and .theme-fixed overrides.
 *
 * Only static tokens (typography, spacing, radii, transitions, layout) live here
 * as fallback defaults.
 */
export const tokenStyles = css`
  *, *::before, *::after {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  :host {
    transition: opacity 150ms ease;

    --font-body: 'Host Grotesk', system-ui, sans-serif;
    --font-accent: 'Tektur', system-ui, sans-serif;
    --font-mono: 'JetBrains Mono', ui-monospace, monospace;

    --text-xs: 12px;
    --text-sm: 14px;
    --text-md: 15px;
    --text-xl: clamp(22px, 2.5vw, 26px);

    --display-xl-size: clamp(36px, 5vw, 52px);
    --display-xl-weight: 500;
    --display-xl-spacing: -1px;
    --heading-size: clamp(22px, 2.5vw, 26px);
    --heading-weight: 500;
    --text-3xl: clamp(28px, 3vw, 36px);
    --text-lg: clamp(18px, 1.5vw, 20px);
    --body-size: clamp(15px, 1.2vw, 16px);
    --body-weight: 500;
    --body-lh: 1.7;
    --wordmark-size: clamp(20px, 2.5vw, 28px);
    --wordmark-weight: 500;
    --wordmark-spacing: clamp(8px, 1.2vw, 14px);
    --section-title-size: 12px;
    --section-title-weight: 600;
    --section-title-spacing: 4px;
    --ui-accent-size: 16px;
    --ui-accent-weight: 600;
    --ui-accent-spacing: 1px;
    --code-size: 13px;
    --code-lh: 1.8;
    --label-inline-size: 10px;
    --label-inline-spacing: 3px;

    --space-xs: 4px;
    --space-sm: 8px;
    --space-md: 16px;
    --space-lg: 24px;
    --space-xl: 40px;
    --space-2xl: 64px;
    --space-3xl: 96px;
    --space-4xl: 128px;

    --radius-sm: 4px;
    --radius-md: 10px;
    --radius-lg: 14px;
    --radius-xl: 20px;
    --radius-full: 9999px;

    --transition-fast: 120ms ease;
    --transition-base: 200ms ease;
    --transition-slow: 400ms ease;

    --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
    --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
    --duration-enter: 500ms;
    --duration-exit: 300ms;

    --focus-ring: 0 0 0 1px rgba(var(--accent-primary-rgb), 0.25);
    --focus-glow: 0 0 0 1px rgba(var(--accent-primary-rgb), 0.2), 0 0 6px rgba(var(--accent-primary-rgb), 0.35), 0 0 16px rgba(var(--accent-primary-rgb), 0.2), 0 0 40px rgba(var(--accent-secondary-rgb), 0.12);

    --touch-min: 24px;
    --touch-pad: 4px;

    --max-width: 1120px;
    --max-width-sm: 720px;
    --nav-height: 64px;
  }

  @media (pointer: coarse) {
    :host {
      --touch-min: 36px;
      --touch-pad: 8px;
    }
  }
`;
