/**
 * Component metadata definition for the demo site.
 * Each entry drives a component documentation page.
 */
export interface ComponentDef {
  name: string;
  slug: string;
  tag: string;
  tier: 'layout' | 'navigation' | 'content' | 'input' | 'feedback';
  interactivity: 'static' | 'hybrid' | 'interactive';
  status?: 'stable' | 'beta' | 'experimental';
  description: string;
  props: Array<{ name: string; type: string; default?: string; description: string }>;
  events?: Array<{ name: string; description: string }>;
  tabs: Array<{ label: string; lang: string; code: string }>;
  subComponents?: Array<{
    name: string;
    tag: string;
    description: string;
    props: Array<{ name: string; type: string; default?: string; description: string }>;
  }>;

  // Rich documentation fields (all optional — graceful fallback)
  overview?: string;
  features?: string[];
  guidelines?: {
    do: string[];
    dont?: string[];
  };
  previewHtml?: string;
  previewSetup?: string;
  /** Show a replay button on the preview to re-trigger one-shot animations */
  replayable?: boolean;
  /** Related component slugs or guide paths (e.g. ['icon-button', '/docs/theming']) */
  seeAlso?: string[];
}
