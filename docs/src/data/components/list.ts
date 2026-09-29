import type { ComponentDef } from './_types';

export const list: ComponentDef = {
  name: 'List',
  slug: 'list',
  tag: 'arc-list',
  tier: 'data',
  interactivity: 'interactive',
  description:
    'Structured list container with optional selection, keyboard navigation, and multiple visual variants. Pairs with arc-list-item for rich content rows.',

  overview: `List provides a semantic container for ordered collections of items. It handles keyboard navigation (arrow keys, Home, End), optional single or multi-select behavior, and visual variants that control border and separator styles.

When \`selectable\` is set, the list renders with \`role="listbox"\` and manages \`aria-selected\` states across its child \`arc-list-item\` elements. Selection state is tracked via a comma-separated \`value\` string, making it easy to bind in any framework. The \`arc-change\` event fires on each selection change with the current value in \`event.detail\`.

Three visual variants cover the common list presentations: default (plain), bordered (outlined container), and separated (bottom borders between items). A size prop controls the base font size for the entire list, cascading down to child items.`,

  features: [
    'Full keyboard navigation with Arrow Up/Down, Home, End, Enter, and Space',
    'Single and multi-select modes with `value` binding and `arc-change` events',
    'Three visual variants: default, bordered, separated',
    'Three size presets (sm, md, lg) that cascade to child items',
    'Semantic `role="listbox"` when selectable, `role="list"` otherwise',
    'Automatic `aria-multiselectable` when `multiple` is set',
    'Row actions: an `actions` slot on arc-list-item, revealed on hover or focus and always shown without hover, that never selects the row',
    'Exposed CSS part: list',
  ],

  guidelines: {
    do: [
      'Use arc-list-item as direct children for consistent styling and keyboard navigation',
      'Put per-row buttons (rename, delete) in the `actions` slot of a plain list, and give each one a label naming its row: "Rename Weekly review", not "Rename"',
      'Mark the current row of an actionable list with `href` and `selected`, which sets aria-current; a selectable list is a listbox and cannot hold row actions',
      'Set `selectable` when items represent choices the user needs to pick from',
      'Use the bordered variant inside cards or panels that need visual containment',
      'Use the separated variant for long lists where row boundaries improve scannability',
    ],
    dont: [
      'Do not use List for navigation menus. Use `arc-navigation-menu` or `arc-dropdown-menu` instead',
      'Do not mix arc-list-item with raw HTML elements inside a selectable list',
      'Do not nest lists more than one level deep. Consider a tree view for hierarchical data',
    ],
  },

  previewHtml: `<div style="display: flex; gap: var(--space-xl); flex-wrap: wrap;">
  <arc-list variant="bordered" selectable label="Mailboxes" style="width: 260px;">
    <arc-list-item value="inbox">Inbox</arc-list-item>
    <arc-list-item value="drafts">Drafts</arc-list-item>
    <arc-list-item value="sent">Sent</arc-list-item>
    <arc-list-item value="trash" disabled>Trash</arc-list-item>
  </arc-list>
  <arc-list variant="bordered" label="Documents" style="width: 260px;">
    <arc-list-item href="#weekly" selected>
      Weekly review
      <arc-icon-button slot="actions" name="pencil" label="Rename Weekly review" variant="ghost" size="sm"></arc-icon-button>
      <arc-icon-button slot="actions" name="x" label="Delete Weekly review" variant="ghost" size="sm"></arc-icon-button>
    </arc-list-item>
    <arc-list-item href="#roadmap">
      Roadmap
      <arc-icon-button slot="actions" name="pencil" label="Rename Roadmap" variant="ghost" size="sm"></arc-icon-button>
      <arc-icon-button slot="actions" name="x" label="Delete Roadmap" variant="ghost" size="sm"></arc-icon-button>
    </arc-list-item>
  </arc-list>
</div>`,

  subComponents: [
    {
      name: 'List Item',
      tag: 'arc-list-item',
      description:
        'Individual row within an arc-list. Supports prefix/suffix slots, a description slot for secondary text, an actions slot for per-row buttons, links, and selection state.',
    },
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

export default function Example() {
  return (
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
    </List>
  );
}`,
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
    <arc-list variant="bordered" selectable>
      <arc-list-item value="inbox">
        <arc-icon slot="prefix" name="inbox" />
        Inbox
        <arc-badge slot="suffix" variant="primary">12</arc-badge>
      </arc-list-item>
      <arc-list-item value="drafts">
        <arc-icon slot="prefix" name="file-text" />
        Drafts
      </arc-list-item>
    </arc-list>
  \`,
})
export class MailboxComponent {}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { List, ListItem, Icon, Badge } from '@arclux/arc-ui-solid';

export default function Example() {
  return (
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
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { List, ListItem, Icon, Badge } from '@arclux/arc-ui-preact';

export default function Example() {
  return (
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
  );
}`,
    },
  ],

  seeAlso: ['data-grid', 'navigation-menu', 'virtual-list'],
};
