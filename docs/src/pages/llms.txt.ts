import type { APIRoute } from 'astro';
import { components } from '../data/components/index';
import fs from 'node:fs';

const pkg = JSON.parse(fs.readFileSync(new URL('../../../packages/web-components/package.json', import.meta.url), 'utf-8'));

export const prerender = true;

export const GET: APIRoute = async () => {
  const tiers = ['layout', 'navigation', 'content', 'data', 'typography', 'input', 'feedback'] as const;

  const componentsByTier = tiers.map((tier) => {
    const items = components.filter((c) => c.tier === tier);
    const list = items.map((c) => `  - ${c.name} (\`<${c.tag}>\`) — ${c.description.split('.')[0]}.`).join('\n');
    return `### ${tier.charAt(0).toUpperCase() + tier.slice(1)} (${items.length})\n${list}`;
  });

  const body = `# ARC UI

> ARC Reactive Components — a dark-first web component library built with Lit. Single source of truth with automatic code generation for 7 framework targets.

- Version: ${pkg.version}
- Components: ${components.length}
- Frameworks: React, Vue, Svelte, Angular, Solid, Preact, vanilla HTML/CSS
- License: MIT

## Installation

\`\`\`bash
# Web Components (canonical)
npm install @arclux/arc-ui

# React
npm install @arclux/arc-ui-react

# Vue
npm install @arclux/arc-ui-vue

# Svelte
npm install @arclux/arc-ui-svelte

# Angular
npm install @arclux/arc-ui-angular

# Solid
npm install @arclux/arc-ui-solid

# Preact
npm install @arclux/arc-ui-preact

# HTML/CSS only (no JS)
npm install @arclux/arc-ui-html
\`\`\`

## Quick Start

\`\`\`html
<!-- Web Component -->
<script type="module">
  import '@arclux/arc-ui/button';
</script>
<arc-button variant="primary" href="/get-started">Get Started</arc-button>
\`\`\`

\`\`\`jsx
// React
import { Button } from '@arclux/arc-ui-react';
<Button variant="primary" href="/get-started">Get Started</Button>
\`\`\`

## Architecture

ARC UI uses a **Prism** code generator. You write Lit web components once, and Prism generates framework wrappers for React, Vue, Svelte, Angular, Solid, Preact, plus standalone HTML/CSS — all from the single WC source.

### Tier System

Components are organized into 7 tiers by responsibility:
- **Layout** — page structure (shells, grids, containers)
- **Navigation** — wayfinding (tabs, menus, breadcrumbs)
- **Content** — display (cards, avatars, icons, carousels)
- **Data** — structured data (tables, lists, badges, meters, stats)
- **Typography** — text rendering (code blocks, markdown, kbd)
- **Input** — user interaction (buttons, forms, pickers)
- **Feedback** — system response (alerts, modals, toasts)

## Design Tokens

Override 2-4 base tokens to theme the entire library:

\`\`\`css
:root {
  --accent-primary: #your-brand-blue;
  --accent-primary-rgb: R, G, B;
  --accent-secondary: #your-brand-purple;
  --accent-secondary-rgb: R, G, B;
}
\`\`\`

All compound tokens (gradients, glows, focus rings, shadows) cascade automatically from these base values.

## Components (${components.length})

${componentsByTier.join('\n\n')}

## Further Reading

- [Full component reference with props, events, and examples](/llms-full.txt)
- [Documentation site](https://arcui.dev)
- [Component pages](https://arcui.dev/docs/components/)
- [Theming guide](https://arcui.dev/docs/theming/)
- [Token reference](https://arcui.dev/docs/tokens/)
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
