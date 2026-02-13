import type { ComponentDef } from './_types';

export const container: ComponentDef = {
    name: 'Container',
    slug: 'container',
    tag: 'arc-container',
    tier: 'layout',
    interactivity: 'static',
    description: 'Max-width wrapper for page sections.',

    overview: `Container is the fundamental width-constraining primitive in your layout toolkit. It centers its children horizontally with \`margin-inline: auto\` and caps their width at the \`--max-width\` design token (1120px by default), while adding consistent inline padding via \`--space-lg\`. Every landing page hero, documentation section, and dashboard content area should be wrapped in a Container to maintain readable line lengths and a uniform horizontal rhythm.

The \`narrow\` boolean prop switches the max-width constraint to \`--max-width-sm\` (typically 720px), which is ideal for article-style content, blog posts, and focused forms where shorter line lengths improve readability. This single toggle covers the two most common content widths without requiring custom CSS overrides.

Container exposes a \`container\` CSS part on the inner wrapper, so you can target it with \`::part(container)\` for one-off adjustments. Because the component uses \`padding-inline\` rather than fixed margins, it handles RTL layouts automatically and leaves vertical spacing to the parent or sibling components like Section.`,

    features: [
      'Centers content with margin-inline: auto and respects the --max-width token',
      'Narrow mode switches to --max-width-sm for article and form layouts',
      'Consistent inline padding via --space-lg design token',
      'RTL-safe layout using logical properties (padding-inline, margin-inline)',
      'Exposes a container CSS part for targeted ::part() styling',
      'Zero vertical opinion -- leaves block spacing to parent layout components',
      'Lightweight wrapper with no JavaScript interactivity overhead',
    ],

    guidelines: {
      do: [
        'Wrap every full-width page section in a Container to maintain consistent margins',
        'Use the narrow prop for blog posts, articles, and single-column forms',
        'Nest Container inside Section when you need both vertical spacing and width constraints',
        'Rely on the --max-width and --max-width-sm tokens for global width changes',
        'Combine with DashboardGrid or other grid components for structured inner layouts',
      ],
      dont: [
        'Nest Containers inside other Containers -- a single wrapper per content band is sufficient',
        'Override padding-inline with fixed pixel values; adjust the --space-lg token instead',
        'Use Container as a flex or grid parent -- it is a block-level width constraint only',
        'Apply background colors directly to Container; wrap it in a full-bleed div for colored bands',
        'Confuse Container with PageLayout -- Container constrains width, PageLayout manages column structure',
      ],
    },

    previewHtml: `<div style="width:100%;border:1px solid var(--border-subtle);border-radius:var(--radius-md);overflow:hidden;background:var(--bg-surface)">
  <arc-container>
    <div style="background:rgba(77,126,247,0.08);border:1px dashed var(--accent-primary);border-radius:var(--radius-sm);padding:var(--space-lg);text-align:center;color:var(--text-secondary);font-size:14px;font-family:var(--font-body)">
      Default container (max-width: 1120px)
    </div>
  </arc-container>
  <div style="height:var(--space-md)"></div>
  <arc-container narrow>
    <div style="background:rgba(77,126,247,0.08);border:1px dashed var(--accent-primary);border-radius:var(--radius-sm);padding:var(--space-lg);text-align:center;color:var(--text-secondary);font-size:14px;font-family:var(--font-body)">
      Narrow container (max-width: 720px)
    </div>
  </arc-container>
</div>`,

    props: [
      { name: 'narrow', type: 'boolean', default: 'false', description: 'Use the narrow max-width (720px vs 1120px)' },
    ],
    tabs: [
      {
        label: 'Web Component',
        lang: 'html',
        code: `<arc-container>
  <p>Content constrained to 1120px</p>
</arc-container>

<arc-container narrow>
  <p>Content constrained to 720px</p>
</arc-container>`,
      },
      {
        label: 'React',
        lang: 'tsx',
        code: `import { Container } from '@arclux/arc-ui-react';

<Container>
  <p>Content constrained to 1120px</p>
</Container>`,
      },
      
      {
        label: 'Vue',
        lang: 'html',
        code: `<script setup>
import { Container } from '@arclux/arc-ui-vue';
</script>

<template>
  <Container>
    <p>Content constrained to 1120px</p>
  </Container>
  
  <Container narrow>
    <p>Content constrained to 720px</p>
  </Container>
</template>`,
      },
      {
        label: 'Svelte',
        lang: 'html',
        code: `<script>
  import { Container } from '@arclux/arc-ui-svelte';
</script>

<Container>
  <p>Content constrained to 1120px</p>
</Container>

<Container narrow>
  <p>Content constrained to 720px</p>
</Container>`,
      },
      {
        label: 'Angular',
        lang: 'ts',
        code: `import { Component } from '@angular/core';
import { Container } from '@arclux/arc-ui-angular';

@Component({
  imports: [Container],
  template: \`
    <Container>
      <p>Content constrained to 1120px</p>
    </Container>
    
    <Container narrow>
      <p>Content constrained to 720px</p>
    </Container>
  \`,
})
export class MyComponent {}`,
      },
      {
        label: 'Solid',
        lang: 'tsx',
        code: `import { Container } from '@arclux/arc-ui-solid';

<Container>
  <p>Content constrained to 1120px</p>
</Container>

<Container narrow>
  <p>Content constrained to 720px</p>
</Container>`,
      },
      {
        label: 'Preact',
        lang: 'tsx',
        code: `import { Container } from '@arclux/arc-ui-preact';

<Container>
  <p>Content constrained to 1120px</p>
</Container>

<Container narrow>
  <p>Content constrained to 720px</p>
</Container>`,
      },
{ label: 'HTML', lang: 'html', code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-container — requires container.css + tokens.css (or arc-ui.css) -->
<div class="arc-container">
  <div class="container">Container</div>
</div>` },
      { label: 'HTML (Inline)', lang: 'html', code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-container — self-contained, no external CSS needed -->
<div class="arc-container" style="display: block">
  <div style="width: 100%; max-width: 1120px; margin-inline: auto; padding-inline: 24px">Container</div>
</div>` }
    ],
  };
