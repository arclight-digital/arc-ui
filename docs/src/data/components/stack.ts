import type { ComponentDef } from './_types';

export const stack: ComponentDef = {
    name: 'Stack',
    slug: 'stack',
    tag: 'arc-stack',
    tier: 'content',
    interactivity: 'static',
    description: 'Flexbox layout component for vertical or horizontal stacking with token-based spacing.',

    overview: `Stack is a pure layout primitive that arranges child elements in a vertical or horizontal flex container with consistent, token-based spacing. Rather than writing ad-hoc flexbox CSS for every layout, Stack provides a declarative API where \`direction\`, \`gap\`, \`align\`, and \`justify\` attributes map directly to the design system's spacing scale.

The component renders no inner wrapper — the \`:host\` element itself is the flex container, and \`render()\` returns a bare \`<slot>\`. This zero-overhead design means Stack adds no extra DOM nodes. Gap values (\`xs\` through \`2xl\`) map to \`var(--space-*)\` tokens, ensuring consistent spacing across the application without magic numbers.

Stack is especially useful for form layouts, card groups, button rows, and any composition where items need uniform spacing. The \`wrap\` attribute enables flex wrapping for responsive grids, and combining \`direction="horizontal"\` with \`justify="between"\` creates common toolbar-style layouts.`,

    features: [
      'Vertical and horizontal flex direction via attribute',
      'Token-based gap scale: xs, sm, md, lg, xl, 2xl mapping to --space-* tokens',
      'Alignment control with start, center, end, and stretch options',
      'Justification control including space-between and space-around',
      'Flex wrap support for responsive layouts',
      'Zero inner DOM — host element is the flex container directly',
    ],

    guidelines: {
      do: [
        'Use Stack to replace inline flexbox styles for consistent spacing',
        'Combine direction="horizontal" with justify="between" for toolbar layouts',
        'Use the wrap attribute for responsive card or tag grids',
        'Nest stacks for complex layouts: horizontal inside vertical',
        'Use gap tokens instead of margins on child elements',
      ],
      dont: [
        'Use Stack when CSS Grid is more appropriate (2D layouts with column alignment)',
        'Add margin to Stack children — use gap instead',
        'Use gap="xs" for major layout sections — reserve xs for tight clusters like icon+text',
        'Nest more than 3 levels deep — consider a dedicated layout component instead',
      ],
    },

    previewHtml: `<arc-stack direction="vertical" gap="md" style="max-width: 280px;">
  <arc-stack direction="horizontal" gap="sm" align="center">
    <arc-badge variant="info">NEW</arc-badge>
    <arc-text variant="label">Stack Layout</arc-text>
  </arc-stack>
  <arc-divider></arc-divider>
  <arc-stack direction="horizontal" gap="sm" justify="between" align="center">
    <arc-button size="sm" variant="ghost">Cancel</arc-button>
    <arc-button size="sm">Submit</arc-button>
  </arc-stack>
</arc-stack>`,

    props: [
      { name: 'direction', type: "'vertical' | 'horizontal'", default: "'vertical'", description: 'Flex direction — vertical is column, horizontal is row' },
      { name: 'gap', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'", default: "'md'", description: 'Gap between children, maps to --space-* tokens' },
      { name: 'align', type: "'start' | 'center' | 'end' | 'stretch'", default: "'stretch'", description: 'Cross-axis alignment (align-items)' },
      { name: 'justify', type: "'start' | 'center' | 'end' | 'between' | 'around'", default: "'start'", description: 'Main-axis alignment (justify-content)' },
      { name: 'wrap', type: 'boolean', default: 'false', description: 'Enable flex-wrap for responsive wrapping' },
    ],
    tabs: [
      {
        label: 'Web Component',
        lang: 'html',
        code: `<arc-stack direction="vertical" gap="md">
  <arc-text>Item one</arc-text>
  <arc-text>Item two</arc-text>
  <arc-text>Item three</arc-text>
</arc-stack>

<arc-stack direction="horizontal" gap="sm" align="center" justify="between">
  <arc-button variant="ghost">Cancel</arc-button>
  <arc-button>Save</arc-button>
</arc-stack>`,
      },
      {
        label: 'React',
        lang: 'tsx',
        code: `import { Stack, Text, Button } from '@arclux/arc-ui-react';

<Stack direction="vertical" gap="md">
  <Text>Item one</Text>
  <Text>Item two</Text>
</Stack>

<Stack direction="horizontal" gap="sm" align="center" justify="between">
  <Button variant="ghost">Cancel</Button>
  <Button>Save</Button>
</Stack>`,
      },
      {
        label: 'Vue',
        lang: 'html',
        code: `<script setup>
import { Stack, Text } from '@arclux/arc-ui-vue';
</script>

<template>
  <Stack direction="vertical" gap="md">
    <Text>Item one</Text>
    <Text>Item two</Text>
  </Stack>
</template>`,
      },
      {
        label: 'Svelte',
        lang: 'html',
        code: `<script>
  import { Stack, Text } from '@arclux/arc-ui-svelte';
</script>

<Stack direction="vertical" gap="md">
  <Text>Item one</Text>
  <Text>Item two</Text>
</Stack>`,
      },
      {
        label: 'Angular',
        lang: 'ts',
        code: `import { Component } from '@angular/core';
import { Stack, Text } from '@arclux/arc-ui-angular';

@Component({
  imports: [Stack, Text],
  template: \`
    <Stack direction="vertical" gap="md">
      <Text>Item one</Text>
      <Text>Item two</Text>
    </Stack>
  \`,
})
export class MyComponent {}`,
      },
      {
        label: 'Solid',
        lang: 'tsx',
        code: `import { Stack, Text } from '@arclux/arc-ui-solid';

<Stack direction="vertical" gap="md">
  <Text>Item one</Text>
  <Text>Item two</Text>
</Stack>`,
      },
      {
        label: 'Preact',
        lang: 'tsx',
        code: `import { Stack, Text } from '@arclux/arc-ui-preact';

<Stack direction="vertical" gap="md">
  <Text>Item one</Text>
  <Text>Item two</Text>
</Stack>`,
      },
    ],
  
  seeAlso: ["container","section"],
};
