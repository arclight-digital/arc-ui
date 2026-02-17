import type { ComponentDef } from './_types';

export const callout: ComponentDef = {
    name: 'Callout',
    slug: 'callout',
    tag: 'arc-callout',
    tier: 'content',
    interactivity: 'static',
    description: 'Styled callout box for tips, warnings, and info.',

    overview: `Callout is an inline notification block for documentation and content pages. It draws attention to supplementary information — tips, warnings, important notes, and danger notices — using colour-coded variants that are instantly recognisable. Each variant applies a distinct border colour, tinted background, and icon colour, so readers can identify the severity at a glance without reading the label.

The component ships with four variants: \`info\` (blue), \`warning\` (yellow/orange), \`tip\` (green), and \`danger\` (red). Each variant sets its own border colour, background tint, and icon colour via the design token system. The default variant is \`info\`. The variant colour is applied through the container's border-color and a subtle background tint, providing a clear visual anchor that differentiates it from regular card content.

The icon slot lets you replace the default emoji icons with custom SVG or icon-font content. The default icon is determined automatically from the variant: info shows an info symbol, warning shows a caution symbol, tip shows a sparkle, and danger shows a stop sign. The default content slot accepts any HTML, making it suitable for rich content including inline code, links, and lists.`,

    features: [
      'Four semantic variants: info, warning, tip, and danger with distinct colour schemes',
      'Automatic default icon per variant (info, caution, sparkle, stop) via _getDefaultIcon()',
      'Variant-coloured border and subtle background tint for visual differentiation',
      'Tinted background using rgba alpha on each variant colour for subtle emphasis',
      'Icon slot for replacing default emoji icons with custom SVG content',
      'Default content slot accepts rich HTML including links, code, and lists',
      'role="note" on the container for assistive technology context',
      'CSS parts (callout, icon, content) for external style overrides',
    ],

    guidelines: {
      do: [
        'Use info for general supplementary information and helpful context',
        'Use warning for actions that could cause unexpected results if ignored',
        'Use danger sparingly — reserve it for destructive or irreversible actions',
        'Use tip for best practices, shortcuts, and recommended approaches',
        'Keep callout content concise — one to three sentences is ideal',
      ],
      dont: [
        'Stack multiple callouts of the same variant back to back — consolidate the content',
        'Use callouts for primary page content; they are for supplementary information only',
        'Use danger for minor notes — overuse dilutes its urgency',
        'Remove the icon entirely without providing an alternative visual indicator',
        'Nest callouts inside other callouts; the visual nesting is confusing',
      ],
    },

    previewHtml: `<div style="display: flex; flex-direction: column; gap: 12px; max-width: 480px;">
  <arc-callout variant="info">This API requires authentication. See the setup guide for details.</arc-callout>
  <arc-callout variant="tip">Use keyboard shortcuts to speed up your workflow.</arc-callout>
  <arc-callout variant="warning">This feature is deprecated and will be removed in v3.0.</arc-callout>
  <arc-callout variant="danger">This action permanently deletes all data and cannot be undone.</arc-callout>
</div>`,

    props: [
      { name: 'variant', type: "'info' | 'warning' | 'tip' | 'danger'", default: "'info'", description: 'Semantic variant that controls the colour scheme, top accent bar, and default icon' },
      { name: 'dismissible', type: 'boolean', default: 'false', description: 'Shows a close button that removes the callout. Fires an arc-dismiss event on close.' },
    ],
    events: [
      { name: 'arc-dismiss', description: 'Fired when the dismiss button is clicked on a dismissible callout.' },
    ],
    tabs: [
      {
        label: 'Web Component',
        lang: 'html',
        code: `<arc-callout variant="info">Informational callout.</arc-callout>
<arc-callout variant="warning">Warning callout.</arc-callout>
<arc-callout variant="tip">Tip callout.</arc-callout>`,
      },
      {
        label: 'React',
        lang: 'tsx',
        code: `import { Callout } from '@arclux/arc-ui-react';

<Callout variant="info">Informational callout.</Callout>
<Callout variant="warning">Warning callout.</Callout>
<Callout variant="tip">Tip callout.</Callout>`,
      },
      {
        label: 'Vue',
        lang: 'html',
        code: `<script setup>
import { Callout } from '@arclux/arc-ui-vue';
</script>

<template>
  <Callout variant="info">Informational callout.</Callout>
  <Callout variant="warning">Warning callout.</Callout>
  <Callout variant="tip">Tip callout.</Callout>
</template>`,
      },
      {
        label: 'Svelte',
        lang: 'html',
        code: `<script>
  import { Callout } from '@arclux/arc-ui-svelte';
</script>

<Callout variant="info">Informational callout.</Callout>
<Callout variant="warning">Warning callout.</Callout>
<Callout variant="tip">Tip callout.</Callout>`,
      },
      {
        label: 'Angular',
        lang: 'ts',
        code: `import { Component } from '@angular/core';
import { Callout } from '@arclux/arc-ui-angular';

@Component({
  imports: [Callout],
  template: \`
    <Callout variant="info">Informational callout.</Callout>
    <Callout variant="warning">Warning callout.</Callout>
    <Callout variant="tip">Tip callout.</Callout>
  \`,
})
export class MyComponent {}`,
      },
      {
        label: 'Solid',
        lang: 'tsx',
        code: `import { Callout } from '@arclux/arc-ui-solid';

<Callout variant="info">Informational callout.</Callout>
<Callout variant="warning">Warning callout.</Callout>
<Callout variant="tip">Tip callout.</Callout>`,
      },
      {
        label: 'Preact',
        lang: 'tsx',
        code: `import { Callout } from '@arclux/arc-ui-preact';

<Callout variant="info">Informational callout.</Callout>
<Callout variant="warning">Warning callout.</Callout>
<Callout variant="tip">Tip callout.</Callout>`,
      },
      { label: 'HTML', lang: 'html', code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-callout — requires callout.css + base.css (or arc-ui.css) -->
<div class="arc-callout">
  <div class="callout" role="note">
   <span class="callout__icon" aria-hidden="true">
   &#x26A0;&#xFE0F;
   </span>
   <div class="callout__content">
   Callout
   </div>
   </div>
</div>` },
      { label: 'HTML (Inline)', lang: 'html', code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-callout — self-contained, no external CSS needed -->
<div class="arc-callout" style="display: block">
  <div style="position: absolute; display: flex; gap: 16px; padding: 16px 24px; border-radius: 10px; border: 1px solid rgb(34, 34, 41); background: rgb(51, 51, 64); font-family: 'Host Grotesk', system-ui, sans-serif; font-size: clamp(15px, 1.2vw, 16px); line-height: 1.7; color: rgb(138, 138, 150); overflow: hidden; content: ''; top: 0; left: 0; right: 0; height: 2px" role="note">
   <span style="flex-shrink: 0; font-size: 18px; line-height: 1.7" aria-hidden="true">
   &#x26A0;&#xFE0F;
   </span>
   <div style="flex: 1; min-width: 0">
   Callout
   </div>
   </div>
</div>` }
    ],
  
  seeAlso: ["alert","card","cta-banner"],
};
