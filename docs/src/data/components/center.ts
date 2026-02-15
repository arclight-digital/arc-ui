import type { ComponentDef } from './_types';

export const center: ComponentDef = {
    name: 'Center',
    slug: 'center',
    tag: 'arc-center',
    tier: 'layout',
    interactivity: 'static',
    description: 'Content centering primitive with max-width, intrinsic centering, and text-center options.',

    overview: `Center is a layout primitive that horizontally centers its children within the available space. By default it applies \`margin-inline: auto\` with a configurable \`max-width\`, which is the standard block-level centering pattern for constraining content to a readable width. This covers the most common centering use case: a content column centered on the page.

The \`intrinsic\` prop switches to intrinsic centering mode, which uses \`display: flex\` with \`align-items: center\` and \`justify-content: center\` to center children based on their natural (intrinsic) size rather than stretching them to the max-width. This is ideal for centering buttons, icons, or short labels that should not stretch to fill a column.

The \`text\` prop adds \`text-align: center\` for centering inline text content within the block. These three modes — block centering, intrinsic centering, and text centering — can be combined to cover virtually any centering pattern without writing custom CSS.`,

    features: [
      'Block-level centering with `margin-inline: auto` and configurable `max-width`',
      'Intrinsic centering mode with flexbox for natural-width children',
      'Text centering mode with `text-align: center` for inline content',
      'Configurable max-width via the `max-width` prop (defaults to --max-width token)',
      'Modes can be combined: intrinsic + text for centered buttons with centered labels',
      'Pure CSS — no JavaScript overhead',
      'CSS part: `center` for targeted ::part() styling',
    ],

    guidelines: {
      do: [
        'Use default mode for centering page content columns with a max-width',
        'Use intrinsic mode for centering buttons, icons, or small elements by their natural width',
        'Use text mode for centering heading text or short descriptive paragraphs',
        'Combine intrinsic and text modes for centered call-to-action sections',
        'Override max-width to match your layout needs (e.g., "480px" for narrow forms)',
      ],
      dont: [
        'Do not use Center as a substitute for Container — Container adds padding, Center only centers',
        'Do not use Center for vertical centering — it handles horizontal centering only',
        'Do not apply Center to elements that should be full-width (like navigation bars)',
        'Do not set max-width to 100% — it makes the centering constraint meaningless',
        'Do not nest multiple Centers — a single Center wrapper is sufficient',
      ],
    },

    previewHtml: `<div style="width:100%;display:flex;flex-direction:column;gap:var(--space-lg)">
  <div style="border:1px dashed var(--accent-primary);border-radius:var(--radius-sm);padding:var(--space-sm)">
    <div style="max-width:280px;margin-inline:auto;background:rgba(77,126,247,0.08);border-radius:var(--radius-sm);padding:var(--space-md);text-align:center;color:var(--text-secondary);font-size:13px;font-family:var(--font-body)">
      Block centering — max-width: 280px
    </div>
  </div>
  <div style="border:1px dashed var(--accent-secondary);border-radius:var(--radius-sm);padding:var(--space-sm);display:flex;justify-content:center;align-items:center">
    <div style="background:rgba(139,92,246,0.08);border-radius:var(--radius-sm);padding:var(--space-sm) var(--space-md);color:var(--text-secondary);font-size:13px;font-family:var(--font-body)">
      Intrinsic centering
    </div>
  </div>
  <div style="border:1px dashed var(--accent-primary);border-radius:var(--radius-sm);padding:var(--space-md);text-align:center;color:var(--text-secondary);font-size:13px;font-family:var(--font-body)">
    Text centering — text-align: center
  </div>
</div>`,

    props: [
      { name: 'max-width', type: 'string', default: "'var(--max-width)'", description: 'Maximum width for the centered content block. Accepts any CSS length or custom property. Only applies in default (block) centering mode.' },
      { name: 'intrinsic', type: 'boolean', default: 'false', description: 'Enables intrinsic centering mode using flexbox, which centers children based on their natural width rather than stretching to max-width.' },
      { name: 'text', type: 'boolean', default: 'false', description: 'Adds text-align: center for centering inline text content within the block.' },
    ],

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
      { label: 'HTML', lang: 'html', code: `<!-- See HTML tab after running pnpm generate -->
<div class="arc-center">...</div>` },
      { label: 'HTML (Inline)', lang: 'html', code: `<!-- See HTML (Inline) tab after running pnpm generate -->
<div class="arc-center" style="max-width:var(--max-width);margin-inline:auto">...</div>` },
    ],

  seeAlso: ['container', 'stack', 'inset'],
};
