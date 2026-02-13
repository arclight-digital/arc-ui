import type { ComponentDef } from './_types';

export const icon: ComponentDef = {
    name: 'Icon',
    slug: 'icon',
    tag: 'arc-icon',
    tier: 'content',
    interactivity: 'static',
    description: 'Renders icons from Phosphor (1,500+) or Lucide (1,900+) by name, with one-line library switching and custom icon registration.',

    overview: `Icon renders SVG icons from a centralized icon registry by name. When the \`name\` property is set, the component looks up the corresponding SVG string in the registry, parses it through a DOMParser-based sanitizer that strips all \`<script>\` elements and \`on*\` event handler attributes, and injects the cleaned SVG into the shadow DOM. Parsed SVGs are cached in a module-level Map for efficient re-renders.

ARC UI ships with two icon libraries built in. **Phosphor Icons** (phosphoricons.com) is the default — a flexible, consistent set of over 1,500 icons with a clean filled style that works well at all sizes. **Lucide** (lucide.dev) is also bundled as an alternative — a community fork of Feather Icons with over 1,900 stroke-based icons that pair well with lighter UI styles. Use the icon browser below to explore both libraries and click any icon to copy its name.

To switch libraries globally, use the \`iconRegistry\` API or the declarative \`<arc-icon-library>\` component:

\`\`\`js
// JavaScript API
import { iconRegistry } from '@arclux/arc-ui';
iconRegistry.use('lucide'); // switch all icons to Lucide
\`\`\`

\`\`\`html
<!-- Declarative (place anywhere in the document) -->
<arc-icon-library name="lucide"></arc-icon-library>
\`\`\`

You can also register custom icons on top of the active library. Custom icons are merged into the current set, so you can mix library icons with your own brand marks:

\`\`\`js
iconRegistry.set({
  'my-logo': '<svg viewBox="0 0 24 24">...</svg>',
  'custom-chart': '<svg viewBox="0 0 24 24">...</svg>',
});
\`\`\`

Five size presets — xs (12px), sm (16px), md (20px), lg (24px), and xl (32px) — control the rendered dimensions. The component inherits color from its parent via \`currentColor\`, so icon color naturally follows the surrounding text or container styling. When no matching name is found in the registry, the component falls back to rendering its default slot, allowing you to pass inline SVGs or custom content directly.

The \`label\` property controls accessibility behavior: when a label is provided, the icon wrapper receives \`role="img"\` and \`aria-label\` with the given text; when omitted, the icon is marked as \`role="presentation"\` with \`aria-hidden="true"\`, hiding it from assistive technology. This two-mode approach ensures decorative icons stay silent while meaningful icons are properly announced.`,

    features: [
      'Two built-in icon packs: Phosphor (1,500+ filled) and Lucide (1,900+ stroke-based)',
      'One-line library switching via iconRegistry.use() or <arc-icon-library>',
      'Custom icon registration — merge your own SVGs on top of any library',
      'Five size presets: xs (12px), sm (16px), md (20px), lg (24px), xl (32px)',
      'Inherits color via currentColor for natural parent-driven styling',
      'Slot fallback when no registry name matches, allowing inline SVG passthrough',
      'Accessible role switching: role="img" with label, role="presentation" without',
      'XSS-safe: strips <script> tags and on* event handlers from SVG content',
    ],

    guidelines: {
      do: [
        'Provide a label for icons that convey meaning (e.g., status indicators, action icons)',
        'Omit the label for purely decorative icons so they are hidden from screen readers',
        'Use the size prop rather than CSS overrides to maintain consistent icon dimensions',
        'Register custom icons via the iconRegistry before first render',
        'Use currentColor inheritance by setting color on the parent element',
      ],
      dont: [
        'Pass unsanitized SVG strings from user input — while the component strips scripts, defense in depth is wise',
        'Use the xl size for inline text icons; sm or md integrates better with body copy',
        'Set both a name and slot content simultaneously — the name lookup takes precedence',
        'Rely on the icon alone to communicate critical information; pair with visible text',
        'Hardcode fill or stroke colors in registered SVGs — use currentColor so they adapt to context',
      ],
    },

    previewHtml: `<div style="display: flex; flex-direction: column; gap: 24px; width: 100%;">
  <div style="display: flex; align-items: center; gap: 16px; flex-wrap: wrap;">
    <arc-icon name="star" size="lg"></arc-icon>
    <arc-icon name="heart" size="lg"></arc-icon>
    <arc-icon name="gear" size="lg"></arc-icon>
    <arc-icon name="house" size="lg"></arc-icon>
    <arc-icon name="magnifying-glass" size="lg"></arc-icon>
    <arc-icon name="bell" size="lg"></arc-icon>
    <arc-icon name="user" size="lg"></arc-icon>
    <arc-icon name="envelope" size="lg"></arc-icon>
    <arc-icon name="chat-circle" size="lg"></arc-icon>
    <arc-icon name="check-circle" size="lg"></arc-icon>
    <arc-icon name="warning" size="lg"></arc-icon>
    <arc-icon name="trash" size="lg"></arc-icon>
    <arc-icon name="pencil" size="lg"></arc-icon>
    <arc-icon name="download" size="lg"></arc-icon>
    <arc-icon name="upload" size="lg"></arc-icon>
    <arc-icon name="folder" size="lg"></arc-icon>
    <arc-icon name="file" size="lg"></arc-icon>
    <arc-icon name="code" size="lg"></arc-icon>
    <arc-icon name="globe" size="lg"></arc-icon>
    <arc-icon name="lightning" size="lg"></arc-icon>
  </div>
  <div class="icon-browser"></div>
</div>`,

    previewSetup: `
      (function() {
        var browser = el.querySelector('.icon-browser');
        if (!browser || browser.dataset.init) return;
        browser.dataset.init = '1';

        var iconRegistry = window.__arcIconRegistry;
        if (!iconRegistry) return;
        var packs = {
          phosphor: iconRegistry.list('phosphor'),
          lucide:   iconRegistry.list('lucide'),
        };

        var activePack = 'phosphor';
        var query = '';

        function render() {
          var names = packs[activePack] || [];
          var filtered = query
            ? names.filter(n => n.includes(query.toLowerCase()))
            : names;

          browser.innerHTML =
            '<div class="icon-browser__controls"></div>' +
            '<span class="icon-browser__count"></span>' +
            '<div class="icon-browser__grid"></div>';

          var controls = browser.querySelector('.icon-browser__controls');
          var countEl  = browser.querySelector('.icon-browser__count');
          var grid     = browser.querySelector('.icon-browser__grid');

          /* ── Search ── */
          var search = document.createElement('arc-search');
          search.setAttribute('placeholder', 'Search ' + names.length + ' icons\\u2026');
          search.setAttribute('size', 'sm');
          search.style.flex = '1';
          search.style.minWidth = '200px';
          if (query) search.setAttribute('value', query);
          search.addEventListener('arc-input', function(e) {
            query = (e.detail && e.detail.value != null) ? e.detail.value : (e.target.value || '');
            render();
          });
          controls.appendChild(search);

          /* ── Library toggle ── */
          var toggle = document.createElement('div');
          toggle.className = 'icon-browser__toggle';
          ['phosphor', 'lucide'].forEach(function(lib) {
            var btn = document.createElement('arc-button');
            btn.setAttribute('size', 'sm');
            btn.setAttribute('variant', activePack === lib ? 'primary' : 'ghost');
            btn.textContent = lib.charAt(0).toUpperCase() + lib.slice(1) + ' (' + (packs[lib].length) + ')';
            btn.addEventListener('click', function() {
              if (activePack !== lib) {
                activePack = lib;
                iconRegistry.use(lib);
                render();
              }
            });
            toggle.appendChild(btn);
          });
          controls.appendChild(toggle);

          countEl.textContent = filtered.length + ' of ' + names.length + ' icons';

          /* ── Grid (cap at 200 for perf) ── */
          var visible = filtered.slice(0, 200);
          visible.forEach(function(name) {
            var tile = document.createElement('button');
            tile.className = 'icon-tile';
            tile.title = name;
            tile.innerHTML =
              '<arc-icon name="' + name + '" size="lg"></arc-icon>' +
              '<span class="icon-tile__name">' + name + '</span>';
            tile.addEventListener('click', function() {
              navigator.clipboard.writeText(name);
              var label = tile.querySelector('.icon-tile__name');
              label.textContent = '\\u2713 copied';
              setTimeout(function() { label.textContent = name; }, 1500);
            });
            grid.appendChild(tile);
          });

          if (filtered.length > 200) {
            var more = document.createElement('div');
            more.style.cssText = 'grid-column:1/-1;text-align:center;padding:12px;color:var(--text-ghost);font-size:13px';
            more.textContent = '+ ' + (filtered.length - 200) + ' more \\u2014 refine your search';
            grid.appendChild(more);
          }
        }

        render();
      })()
    `,

    props: [
      { name: 'name', type: 'string', default: "''", description: 'Icon name to look up in the icon registry. When provided, renders the matching SVG. When empty, falls back to slotted content.' },
      { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'sm'", description: 'Icon dimensions: `xs` (12px), `sm` (16px), `md` (20px), `lg` (24px), `xl` (32px).' },
      { name: 'label', type: 'string', default: "''", description: 'Accessibility label. When provided, sets `role="img"` and `aria-label`. When empty, sets `role="presentation"` and `aria-hidden="true"`.' },
    ],
    tabs: [
      {
        label: 'Web Component',
        lang: 'html',
        code: `<!-- Basic usage (Phosphor is the default library) -->
<arc-icon name="star" size="sm"></arc-icon>
<arc-icon name="heart" size="md"></arc-icon>
<arc-icon name="gear" size="lg"></arc-icon>

<!-- Accessible icon with label -->
<arc-icon name="warning" size="md" label="Warning"></arc-icon>

<!-- Switch to Lucide globally -->
<arc-icon-library name="lucide"></arc-icon-library>`,
      },
      {
        label: 'Registry API',
        lang: 'js',
        code: `import { iconRegistry } from '@arclux/arc-ui';

// Switch all icons to Lucide
iconRegistry.use('lucide');

// List all available icon names
const names = iconRegistry.list();          // active library
const phosphor = iconRegistry.list('phosphor'); // specific library

// Register custom icons (merged on top of active library)
iconRegistry.set({
  'my-logo': '<svg viewBox="0 0 24 24">...</svg>',
});

// Look up an icon by name
const svg = iconRegistry.get('star'); // returns SVG string or null`,
      },
      {
        label: 'React',
        lang: 'tsx',
        code: `import { Icon } from '@arclux/arc-ui-react';

<Icon name="star" size="sm" />
<Icon name="heart" size="md" />
<Icon name="gear" size="lg" label="Settings" />`,
      },
      {
        label: 'Vue',
        lang: 'html',
        code: `<script setup>
import { Icon } from '@arclux/arc-ui-vue';
</script>

<template>
  <Icon name="star" size="sm"></Icon>
  <Icon name="heart" size="md"></Icon>
  <Icon name="gear" size="lg"></Icon>
</template>`,
      },
      {
        label: 'Svelte',
        lang: 'html',
        code: `<script>
  import { Icon } from '@arclux/arc-ui-svelte';
</script>

<Icon name="star" size="sm"></Icon>
<Icon name="heart" size="md"></Icon>
<Icon name="gear" size="lg"></Icon>`,
      },
      {
        label: 'Angular',
        lang: 'ts',
        code: `import { Component } from '@angular/core';
import { Icon } from '@arclux/arc-ui-angular';

@Component({
  imports: [Icon],
  template: \`
    <Icon name="star" size="sm"></Icon>
    <Icon name="heart" size="md"></Icon>
    <Icon name="gear" size="lg"></Icon>
  \`,
})
export class MyComponent {}`,
      },
      {
        label: 'Solid',
        lang: 'tsx',
        code: `import { Icon } from '@arclux/arc-ui-solid';

<Icon name="star" size="sm"></Icon>
<Icon name="heart" size="md"></Icon>
<Icon name="gear" size="lg"></Icon>`,
      },
      {
        label: 'Preact',
        lang: 'tsx',
        code: `import { Icon } from '@arclux/arc-ui-preact';

<Icon name="star" size="sm"></Icon>
<Icon name="heart" size="md"></Icon>
<Icon name="gear" size="lg"></Icon>`,
      },
      { label: 'HTML', lang: 'html', code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-icon — requires icon.css + tokens.css (or arc-ui.css) -->
<span class="arc-icon">
  <span
   class="icon"
   role="presentation"
   aria-label="Label"
   aria-hidden="true"
   >

   </span>
</span>` },
      { label: 'HTML (Inline)', lang: 'html', code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-icon — self-contained, no external CSS needed -->
<span class="arc-icon" style="display: inline-flex; align-items: center; justify-content: center; color: currentColor; vertical-align: middle">
  <span
   style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%"
   role="presentation"
   aria-label="Label"
   aria-hidden="true"
   >

   </span>
</span>` }
    ],
  };
