import type { ComponentDef } from './_types';

export const list: ComponentDef = {
  name: 'List',
  slug: 'list',
  tag: 'arc-list',
  tier: 'data',
  interactivity: 'interactive',
  description: 'Structured list container with optional selection, keyboard navigation, and multiple visual variants. Pairs with arc-list-item for rich content rows.',

  overview: `List provides a semantic container for ordered collections of items. It handles keyboard navigation (arrow keys, Home, End), optional single or multi-select behavior, and visual variants that control border and separator styles.

When \`selectable\` is set, the list renders with \`role="listbox"\` and manages \`aria-selected\` states across its child \`arc-list-item\` elements. Selection state is tracked via a comma-separated \`value\` string, making it easy to bind in any framework. The \`arc-change\` event fires on each selection change with the current value in \`event.detail\`.

Three visual variants — default (plain), bordered (outlined container), and separated (bottom borders between items) — cover the most common list presentation patterns. A size prop controls the base font size for the entire list, cascading down to child items.`,

  features: [
    'Keyboard navigation with Arrow Up/Down, Home, End, Enter, and Space',
    'Single and multi-select modes with `value` binding and `arc-change` events',
    'Three visual variants: default, bordered, separated',
    'Three size presets: sm, md, lg — cascades to child items',
    'Semantic `role="listbox"` when selectable, `role="list"` otherwise',
    'Automatic `aria-multiselectable` when `multiple` is set',
    'Exposed CSS part: list'
  ],

  guidelines: {
    do: [
      'Use arc-list-item as direct children for consistent styling and keyboard navigation',
      'Set `selectable` when items represent choices the user needs to pick from',
      'Use the bordered variant inside cards or panels that need visual containment',
      'Use the separated variant for long lists where row boundaries improve scannability'
    ],
    dont: [
      'Use List for navigation menus — use `arc-navigation-menu` or `arc-dropdown-menu` instead',
      'Mix arc-list-item with raw HTML elements inside a selectable list',
      'Nest lists more than one level deep — consider a tree view for hierarchical data'
    ],
  },

  previewHtml: `<arc-list variant="bordered" selectable style="max-width: 320px;">
  <arc-list-item value="inbox">Inbox</arc-list-item>
  <arc-list-item value="drafts">Drafts</arc-list-item>
  <arc-list-item value="sent">Sent</arc-list-item>
  <arc-list-item value="trash" disabled>Trash</arc-list-item>
</arc-list>`,

  props: [
    { name: 'variant', type: "'default' | 'bordered' | 'separated'", default: "'default'", description: 'Visual style. Bordered wraps the list in an outlined container. Separated adds bottom borders between items.' },
    { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Controls the base font size for the list and its children.' },
    { name: 'selectable', type: 'boolean', default: 'false', description: 'Enables selection mode. Sets `role="listbox"` and manages `aria-selected` on child items.' },
    { name: 'multiple', type: 'boolean', default: 'false', description: 'Allows multiple items to be selected simultaneously. Only applies when `selectable` is true.' },
    { name: 'value', type: 'string', default: "''", description: 'The currently selected value(s). Comma-separated when `multiple` is true.' }
  ],

  events: [
    { name: 'arc-change', description: 'Fired when the selection changes. `event.detail.value` contains the new value string.' }
  ],

  subComponents: [
    {
      name: 'List Item',
      tag: 'arc-list-item',
      description: 'Individual row within an arc-list. Supports prefix/suffix slots, a description slot for secondary text, links, and selection state.',
      props: [
        { name: 'value', type: 'string', default: "''", description: 'Unique identifier used for selection tracking.' },
        { name: 'selected', type: 'boolean', default: 'false', description: 'Whether this item is currently selected. Managed automatically by the parent list.' },
        { name: 'disabled', type: 'boolean', default: 'false', description: 'Prevents interaction and dims the item.' },
        { name: 'href', type: 'string', default: "''", description: 'When set, renders the item as an anchor tag for navigation.' },
        { name: 'slot="prefix"', type: 'slot', description: 'Leading content area for icons, avatars, or indicators.' },
        { name: 'slot="suffix"', type: 'slot', description: 'Trailing content area for badges, actions, or metadata.' },
        { name: 'slot="description"', type: 'slot', description: 'Secondary text rendered below the main label in smaller, muted type.' }
      ],
    }
  ],

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<arc-list variant="bordered" selectable>
  <arc-list-item value="inbox">
    <arc-icon slot="prefix" name="inbox"></arc-icon>
    Inbox
    <arc-badge slot="suffix" variant="primary">12</arc-badge>
  </arc-list-item>
  <arc-list-item value="drafts">
    <arc-icon slot="prefix" name="file-text"></arc-icon>
    Drafts
  </arc-list-item>
  <arc-list-item value="sent">
    <arc-icon slot="prefix" name="send"></arc-icon>
    Sent
  </arc-list-item>
</arc-list>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { List, ListItem, Icon, Badge } from '@arclux/arc-ui-react';

<List variant="bordered" selectable>
  <ListItem value="inbox">
    <Icon slot="prefix" name="inbox" />
    Inbox
    <Badge slot="suffix" variant="primary">12</Badge>
  </ListItem>
  <ListItem value="drafts">
    <Icon slot="prefix" name="file-text" />
    Drafts
  </ListItem>
  <ListItem value="sent">
    <Icon slot="prefix" name="send" />
    Sent
  </ListItem>
</List>`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { List, ListItem, Icon, Badge } from '@arclux/arc-ui-vue';
</script>

<template>
  <List variant="bordered" selectable>
    <ListItem value="inbox">
      <Icon slot="prefix" name="inbox" />
      Inbox
      <Badge slot="suffix" variant="primary">12</Badge>
    </ListItem>
    <ListItem value="drafts">
      <Icon slot="prefix" name="file-text" />
      Drafts
    </ListItem>
  </List>
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { List, ListItem, Icon, Badge } from '@arclux/arc-ui-svelte';
</script>

<List variant="bordered" selectable>
  <ListItem value="inbox">
    <Icon slot="prefix" name="inbox" />
    Inbox
    <Badge slot="suffix" variant="primary">12</Badge>
  </ListItem>
  <ListItem value="drafts">
    <Icon slot="prefix" name="file-text" />
    Drafts
  </ListItem>
</List>`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { List, ListItem, Icon, Badge } from '@arclux/arc-ui-angular';

@Component({
  imports: [List, ListItem, Icon, Badge],
  template: \`
    <List variant="bordered" selectable>
      <ListItem value="inbox">
        <Icon slot="prefix" name="inbox" />
        Inbox
        <Badge slot="suffix" variant="primary">12</Badge>
      </ListItem>
      <ListItem value="drafts">
        <Icon slot="prefix" name="file-text" />
        Drafts
      </ListItem>
    </List>
  \`,
})
export class MailboxComponent {}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { List, ListItem, Icon, Badge } from '@arclux/arc-ui-solid';

<List variant="bordered" selectable>
  <ListItem value="inbox">
    <Icon slot="prefix" name="inbox" />
    Inbox
    <Badge slot="suffix" variant="primary">12</Badge>
  </ListItem>
  <ListItem value="drafts">
    <Icon slot="prefix" name="file-text" />
    Drafts
  </ListItem>
</List>`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { List, ListItem, Icon, Badge } from '@arclux/arc-ui-preact';

<List variant="bordered" selectable>
  <ListItem value="inbox">
    <Icon slot="prefix" name="inbox" />
    Inbox
    <Badge slot="suffix" variant="primary">12</Badge>
  </ListItem>
  <ListItem value="drafts">
    <Icon slot="prefix" name="file-text" />
    Drafts
  </ListItem>
</List>`,
    },
  ],

  seeAlso: ['data-table', 'navigation-menu', 'virtual-list'],
};
