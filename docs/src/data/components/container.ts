import type { ComponentDef } from './_types';

export const container: ComponentDef = {
  name: 'Container',
  slug: 'container',
  tag: 'arc-container',
  tier: 'layout',
  interactivity: 'static',
  description: 'Centers page content and caps its width, so sections share one line length and side margins.',

  overview: `Container constrains width. It centers its content with \`margin-inline: auto\`, caps it at the \`--max-width\` token (1120px by default) and adds \`--space-lg\` of inline padding. Use it around page sections so line lengths and side margins match across the page.

\`size\` picks the cap: \`sm\` is \`--max-width-sm\` (720px), \`md\` is the default, \`lg\` is 1400px, \`xl\` is 1600px and \`full\` removes it. Use \`sm\` for articles and single-column forms. \`padding\` sets the inline padding to \`none\`, \`sm\`, \`md\` (the default) or \`lg\`.

It sets only inline spacing, with logical properties, so it works in right-to-left layouts. Vertical spacing is up to the parent or a Section.`,

  features: [
    'Content renders inside an inner wrapper exposed as the `container` CSS part, for one-off `::part(container)` changes',
  ],

  guidelines: {
    do: [
      'Put a Container inside a Section when you need both vertical spacing and a width cap',
      'Change the `--max-width` and `--max-width-sm` tokens to change widths across the site',
      'Use DashboardGrid or another grid inside it for the inner layout',
    ],
    dont: [
      'Don\'t nest Containers. The inline padding doubles',
      'Don\'t override `padding-inline` with fixed pixels. Use the `padding` prop or the `--space-*` tokens',
      'Don\'t make it a flex or grid parent. Its children are inside the inner wrapper, so `display` on the host doesn\'t lay them out',
      'Don\'t use it for column structure. That\'s PageLayout',
    ],
  },

  previewHtml: `<div style="width:100%;display:flex;flex-direction:column;gap:var(--space-md)">
  <div style="width:100%;margin-inline:auto;padding-inline:var(--space-lg);box-sizing:border-box">
    <div style="background:rgba(77,126,247,0.08);border:1px dashed var(--accent-primary);border-radius:var(--radius-sm);padding:var(--space-lg);text-align:center;color:var(--text-secondary);font-size:14px;font-family:var(--font-body)">
      Default container (max-width: var(--max-width))
    </div>
  </div>
  <div style="width:65%;margin-inline:auto;padding-inline:var(--space-lg);box-sizing:border-box">
    <div style="background:rgba(139,92,246,0.08);border:1px dashed var(--accent-secondary);border-radius:var(--radius-sm);padding:var(--space-lg);text-align:center;color:var(--text-secondary);font-size:14px;font-family:var(--font-body)">
      Narrow container (max-width: var(--max-width-sm))
    </div>
  </div>
</div>`,

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

export default function Example() {
  return (
    <Container>
      <p>Content constrained to 1120px</p>
    </Container>
  );
}`,
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
    <arc-container>
      <p>Content constrained to 1120px</p>
    </arc-container>
    
    <arc-container narrow>
      <p>Content constrained to 720px</p>
    </arc-container>
  \`,
})
export class MyComponent {}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { Container } from '@arclux/arc-ui-solid';

export default function Example() {
  return (
    <>
      <Container>
        <p>Content constrained to 1120px</p>
      </Container>

      <Container narrow>
        <p>Content constrained to 720px</p>
      </Container>
    </>
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { Container } from '@arclux/arc-ui-preact';

export default function Example() {
  return (
    <>
      <Container>
        <p>Content constrained to 1120px</p>
      </Container>

      <Container narrow>
        <p>Content constrained to 720px</p>
      </Container>
    </>
  );
}`,
    },
    {
      label: 'HTML',
      lang: 'html',
      code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-container — requires container.css + base.css (or arc-ui.css) -->
<div class="arc-container">
  <div class="container">Container</div>
</div>`,
    },
    {
      label: 'HTML (Inline)',
      lang: 'html',
      code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-container — self-contained, no external CSS needed -->
<div class="arc-container" style="display: block">
  <div style="width: 100%; max-width: 1120px; margin-inline: auto; padding-inline: 24px">Container</div>
</div>`,
    },
  ],

  seeAlso: ['section', 'stack', 'page-layout'],
};
