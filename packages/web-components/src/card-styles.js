import { css } from 'lit';

/**
 * Shared card shell + hover styles for Card / FeatureCard.
 *
 * Provides the 1px-padding border trick, hover gradient border,
 * inner box-shadow glow, and focus ring. Each consumer keeps its
 * own inner layout, content, and responsive overrides.
 */
export const cardHoverStyles = css`
  .card {
    position: relative;
    border-radius: var(--radius-lg);
    padding: 1px;
    background: var(--border-subtle);
    transition: background var(--transition-slow);
    text-decoration: none;
    display: flex;
    flex-direction: column;
  }

  .card:hover {
    background: linear-gradient(135deg, rgba(var(--accent-primary-rgb),0.3), rgba(var(--accent-secondary-rgb),0.15), var(--border-default));
  }

  .card__inner {
    position: relative;
    background: var(--bg-card);
    border-radius: calc(var(--radius-lg) - 1px);
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    transition: box-shadow var(--transition-slow);
  }

  .card:hover .card__inner {
    box-shadow: inset 0 1px 0 var(--bg-hover), var(--glow-card-hover);
  }

  .card:focus-visible { outline: none; box-shadow: var(--focus-glow); border-radius: var(--radius-lg); }
`;
