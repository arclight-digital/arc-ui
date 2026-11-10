import type { ComponentDef } from './_types';

export const center: ComponentDef = {
  name: 'Center',
  slug: 'center',
  tag: 'arc-center',
  tier: 'layout',
  interactivity: 'static',
  description:
    'A wrapper that centers its children horizontally and caps their width, 60ch by default.',

  overview: `Center centers its children horizontally. By default it's a block with \`margin-inline: auto\`, a \`max-width\` (default \`60ch\`) and \`--space-lg\` of padding on each side. Use it to keep a content column at a readable width in the middle of the page.

\`intrinsic\` makes it a flex column with \`align-items: center\`, so children keep their natural width and don't stretch to the column. Use it for buttons, icons and short labels. \`text\` adds \`text-align: center\` for inline text. The three modes can be combined.`,

  features: ['The max-width applies in every mode, intrinsic included'],

  guidelines: {
    do: [
      'Use the default mode for a page content column',
      'Use text mode for centered headings and short paragraphs',
      'Combine intrinsic and text for call-to-action sections',
      'Change max-width to fit the layout, for example "480px" for a narrow form',
    ],
    dont: [
      "Don't use it for vertical centering. It centers horizontally only",
      "Don't wrap anything that should run full width, like a navigation bar",
      "Don't set max-width to 100%. Then there is nothing to center",
    ],
  },

  previewHtml: `<div style="width:100%;display:flex;flex-direction:column;gap:var(--space-lg)">
  <div style="border:1px dashed var(--accent-primary);border-radius:var(--radius-sm);padding:var(--space-sm)">
    <div style="max-width:280px;margin-inline:auto;background:rgba(77,126,247,0.08);border-radius:var(--radius-sm);padding:var(--space-md);text-align:center;color:var(--text-secondary);font-size:13px;font-family:var(--font-body)">
      Block centering (max-width: 280px)
    </div>
  </div>
  <div style="border:1px dashed var(--accent-secondary);border-radius:var(--radius-sm);padding:var(--space-sm);display:flex;justify-content:center;align-items:center">
    <div style="background:rgba(139,92,246,0.08);border-radius:var(--radius-sm);padding:var(--space-sm) var(--space-md);color:var(--text-secondary);font-size:13px;font-family:var(--font-body)">
      Intrinsic centering
    </div>
  </div>
  <div style="border:1px dashed var(--accent-primary);border-radius:var(--radius-sm);padding:var(--space-md);text-align:center;color:var(--text-secondary);font-size:13px;font-family:var(--font-body)">
    Text centering (text-align: center)
  </div>
</div>`,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<!-- Block centering with max-width -->
<arc-center max-width="720px">
  <h2>Centered Heading</h2>
  <p>This content is constrained to 720px and centered on the page.</p>
</arc-center>

<!-- Intrinsic centering for a button -->
<arc-center intrinsic>
  <arc-button>Centered Button</arc-button>
</arc-center>

<!-- Text centering -->
<arc-center text>
  <p>This text is centered within the full-width block.</p>
</arc-center>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { Center, Button } from '@arclux/arc-ui-react';

function HeroSection() {
  return (
    <>
      {/* Block centering */}
      <Center maxWidth="720px">
        <h2>Centered Heading</h2>
        <p>Content constrained to 720px.</p>
      </Center>

      {/* Intrinsic centering */}
      <Center intrinsic>
        <Button>Centered Button</Button>
      </Center>

      {/* Text centering */}
      <Center text>
        <p>This text is centered.</p>
      </Center>
    </>
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { Center, Button } from '@arclux/arc-ui-vue';
</script>

<template>
  <!-- Block centering -->
  <Center max-width="720px">
    <h2>Centered Heading</h2>
    <p>Content constrained to 720px.</p>
  </Center>

  <!-- Intrinsic centering -->
  <Center intrinsic>
    <Button>Centered Button</Button>
  </Center>

  <!-- Text centering -->
  <Center text>
    <p>This text is centered.</p>
  </Center>
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { Center, Button } from '@arclux/arc-ui-svelte';
</script>

<!-- Block centering -->
<Center max-width="720px">
  <h2>Centered Heading</h2>
  <p>Content constrained to 720px.</p>
</Center>

<!-- Intrinsic centering -->
<Center intrinsic>
  <Button>Centered Button</Button>
</Center>

<!-- Text centering -->
<Center text>
  <p>This text is centered.</p>
</Center>`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { Center, Button } from '@arclux/arc-ui-angular';

@Component({
  imports: [Center, Button],
  template: \`
    <!-- Block centering -->
    <arc-center max-width="720px">
      <h2>Centered Heading</h2>
      <p>Content constrained to 720px.</p>
    </arc-center>

    <!-- Intrinsic centering -->
    <arc-center intrinsic>
      <arc-button>Centered Button</arc-button>
    </arc-center>

    <!-- Text centering -->
    <arc-center text>
      <p>This text is centered.</p>
    </arc-center>
  \`,
})
export class HeroSectionComponent {}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { Center, Button } from '@arclux/arc-ui-solid';

function HeroSection() {
  return (
    <>
      <Center maxWidth="720px">
        <h2>Centered Heading</h2>
        <p>Content constrained to 720px.</p>
      </Center>

      <Center intrinsic>
        <Button>Centered Button</Button>
      </Center>

      <Center text>
        <p>This text is centered.</p>
      </Center>
    </>
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { Center, Button } from '@arclux/arc-ui-preact';

function HeroSection() {
  return (
    <>
      <Center maxWidth="720px">
        <h2>Centered Heading</h2>
        <p>Content constrained to 720px.</p>
      </Center>

      <Center intrinsic>
        <Button>Centered Button</Button>
      </Center>

      <Center text>
        <p>This text is centered.</p>
      </Center>
    </>
  );
}`,
    },
    {
      label: 'HTML',
      lang: 'html',
      code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-center — requires center.css + base.css (or arc-ui.css) -->
<div class="arc-center">
  Center
</div>`,
    },
    {
      label: 'HTML (Inline)',
      lang: 'html',
      code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-center — self-contained, no external CSS needed -->
<div class="arc-center" style="display: block; box-sizing: border-box; margin-inline: auto; max-width: 60ch; padding-inline: 24px">
  Center
</div>`,
    },
  ],

  seeAlso: ['container', 'stack', 'inset'],
};
