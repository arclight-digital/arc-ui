import type { APIRoute } from 'astro';
import { components } from '../data/components/index';
import { version, frameworkCount } from '../data/site-stats';

export const prerender = true;

export const GET: APIRoute = async () => {
  // Preferred ordering; any tier present in the data but missing here is
  // appended so components can never be silently dropped from the output.
  const tierOrder = ['layout', 'navigation', 'content', 'data', 'typography', 'input', 'feedback'];
  const tiers = [
    ...tierOrder,
    ...Array.from(new Set(components.map((c) => c.tier))).filter((t) => !tierOrder.includes(t)),
  ];

  const componentsByTier = tiers.map((tier) => {
    const items = components.filter((c) => c.tier === tier);
    const list = items.map((c) => `  - ${c.name} (\`<${c.tag}>\`): ${c.description.split('.')[0]}.`).join('\n');
    return `### ${tier.charAt(0).toUpperCase() + tier.slice(1)} (${items.length})\n${list}`;
  });

  const body = `# ARC UI

> ARC UI (ARC Radiant Components) is a dark-first Web Component library built with Lit. Prism generates packages for ${frameworkCount} targets from the one Lit source.

- Version: ${version}
- Components: ${components.length}
- Targets: Web Components (canonical), React, Vue, Svelte, Angular, Solid, Preact, plain HTML/CSS
- License: MIT

## Installation

\`\`\`bash
# Web Components (canonical)
npm install @arclux/arc-ui lit

# React
npm install @arclux/arc-ui-react @arclux/arc-ui lit

# Vue
npm install @arclux/arc-ui-vue @arclux/arc-ui lit

# Svelte
npm install @arclux/arc-ui-svelte @arclux/arc-ui lit

# Angular
npm install @arclux/arc-ui-angular @arclux/arc-ui lit

# Solid
npm install @arclux/arc-ui-solid @arclux/arc-ui lit

# Preact
npm install @arclux/arc-ui-preact @arclux/arc-ui lit

# Plain HTML (standalone HTML/CSS package, no JS)
npm install @arclux/arc-ui-html
\`\`\`

## Quick start

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

Registering components:

- \`import '@arclux/arc-ui/<component>'\` registers a single element via its subpath export.
- \`import '@arclux/arc-ui/register'\` registers every component at once.
- Exception: \`arc-code-block\` is not in the register barrel, because it loads the Shiki syntax highlighter. Import it explicitly with \`import '@arclux/arc-ui/code-block'\`.

## Architecture

Framework packages are generated from the Lit Web Component source.

- Props, slots, and CSS parts are the same in every target. Events keep their \`arc-*\` names and are bound in each framework's own style: \`onArcInput\` in React, Solid and Preact, \`@arc-input\` in Vue, \`onarc-input\` in Svelte, \`(arc-input)\` in Angular. Angular wrappers also have \`<property>Change\` outputs (\`valueChange\`, \`checkedChange\`) for two-way binding. Anything documented for \`<arc-button>\` applies to React's \`<Button>\`, Vue's \`<Button>\`, etc.
- Wrapper packages are generated output; the Web Component package (\`@arclux/arc-ui\`) is the source of truth. File issues against it.
- \`@arclux/arc-ui-html\` is standalone HTML/CSS with no JavaScript.

### Tiers

Components are organized into seven tiers by responsibility:
- **Layout**: page structure (shells, grids, containers)
- **Navigation**: wayfinding (tabs, menus, breadcrumbs)
- **Content**: display (cards, avatars, icons, carousels)
- **Data**: structured data (data grids, lists, badges, meters, stats)
- **Typography**: text rendering (code blocks, markdown, kbd)
- **Input**: user interaction (buttons, forms, pickers)
- **Feedback**: system response (alerts, dialogs, toasts)

## Theming

The theme is dark by default. Set \`data-theme="light"\` on \`<html>\` for light mode, or \`data-theme="auto"\` to follow \`prefers-color-scheme\`.

Glows, focus rings and the accent gradients reference the two accent colors via \`var()\`, so overriding these four declarations changes them too:

\`\`\`css
:root {
  --accent-primary: #your-brand-blue;
  --accent-primary-rgb: R, G, B;
  --accent-secondary: #your-brand-purple;
  --accent-secondary-rgb: R, G, B;
}
\`\`\`

## Font roles

ARC UI ships no font files. Typography is five role slots (\`body\`, \`label\`, \`mono\`, \`display\`, \`quote\`), each exposed as \`--font-<role>\` (composed stack) plus \`--font-<role>-family\`, \`--font-<role>-fallback\`, and \`--font-<role>-weight\`. Components reference roles, never typefaces, so assigning a face is one override:

\`\`\`css
:root {
  --font-body-family: 'Your Face';
}
\`\`\`

- \`body\`: used for prose, inputs, descriptions, and table cells; the default for everything no other role covers.
- \`label\`: used for form labels, table headers, and eyebrows (small, uppercase, tracked type).
- \`mono\`: used for code, keyboard hints, and tabular numerics.
- \`display\`: used for large headings; it follows \`body\` until assigned its own family.
- \`quote\`: used for the decorative glyph on \`arc-blockquote\`.

## Server-side rendering

\`@arclux/arc-ui/ssr\` exports \`renderDeclarativeShadowDOM(html)\`, which takes HTML and returns \`{ html, stylesheets }\`. Serve the stylesheets at the paths the HTML links them from. Every \`<arc-*>\` in the input gets a declarative shadow root, whatever produced the markup. Of the frameworks, only Astro (this site's build) is tested in the repo. All components server-render. Requires the optional peer \`@lit-labs/ssr\`. On the client, import \`@arclux/arc-ui/hydrate\` before any component is defined so Lit adopts the server markup instead of re-rendering it.

## Components (${components.length})

${componentsByTier.join('\n\n')}

## Further reading

- [Full component reference with props, events, and examples](/llms-full.txt)
- [Documentation site](https://arcui.dev)
- [Component pages](https://arcui.dev/docs/components/)
- [Theming guide](https://arcui.dev/docs/theming/)
- [Typography and font roles](https://arcui.dev/docs/typography/)
- [Token reference](https://arcui.dev/docs/tokens/)
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
