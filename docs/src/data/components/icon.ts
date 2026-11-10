import type { ComponentDef } from './_types';

export const icon: ComponentDef = {
  name: 'Icon',
  slug: 'icon',
  tag: 'arc-icon',
  tier: 'content',
  interactivity: 'static',
  description:
    'Renders an SVG icon by name from the Phosphor or Lucide library, or from icons you register yourself.',

  overview: `Icon looks up \`name\` in the icon registry, runs the SVG through a sanitizer that strips \`<script>\` elements and \`on*\` handler attributes, and renders the result in its shadow root. Sanitized SVGs are cached, so each one is processed once.

Each of the 3,400+ icons is its own module (Lucide icons average 500 bytes and Phosphor icons 660), and \`<arc-icon name="star">\` fetches only \`star.js\`. Importing \`arc-icon\` brings no icon library with it, only the nine glyphs ARC UI's own buttons draw (close, chevrons, overflow, edit, play and pause).

The icons ship separately in \`@arclux/arc-ui-icons\`. It has two libraries: **Phosphor Icons** (phosphoricons.com), 1,512 glyphs drawn as filled paths, and **Lucide** (lucide.dev), a community fork of Feather Icons with 1,896 stroke-based glyphs. Click any icon in the browser below to copy its name.

Install it and import a pack. One line registers it, and if nothing else has been selected it becomes the active library, so \`<arc-icon name="star">\` works on the next line:

\`\`\`js
import '@arclux/arc-ui-icons/phosphor';
\`\`\`

Nothing is selected by default. Until a pack registers, a named icon renders its slot fallback (unless it's one of the nine built-in glyphs) and the registry logs a warning saying why. Before v4 both packs were vendored inside \`@arclux/arc-ui\`, where they were 88% of the published files and 44% of the unpacked bytes of every install.

To switch libraries for the whole page, use the \`iconRegistry\` API or the \`<arc-icon-library>\` element:

\`\`\`js
// JavaScript API
import { iconRegistry } from '@arclux/arc-ui';
iconRegistry.use('lucide'); // switch all icons to Lucide (no data loaded until icons render)
\`\`\`

\`\`\`html
<!-- Declarative (place anywhere in the document) -->
<arc-icon-library name="lucide"></arc-icon-library>
\`\`\`

You can register your own icons, such as a logo, on top of the active library and use them alongside its icons. Icons registered with \`set()\` resolve with no network request:

\`\`\`js
iconRegistry.set({
  'my-logo': '<svg viewBox="0 0 24 24">...</svg>',
  'custom-chart': '<svg viewBox="0 0 24 24">...</svg>',
});
\`\`\`

If your app uses a handful of icons, skip the pack registration and import those glyphs directly. That pulls in one module per icon and no resolver at all:

\`\`\`js
import { iconRegistry } from '@arclux/arc-ui';
import check from '@arclux/arc-ui-icons/phosphor/check';
import x from '@arclux/arc-ui-icons/phosphor/x';

iconRegistry.set({ check, x });
\`\`\`

To load a whole library in one import, for an icon picker say, use the \`all\` entry points:

\`\`\`js
import phosphor from '@arclux/arc-ui-icons/all/phosphor'; // loads all ~1,500 icons
import lucide from '@arclux/arc-ui-icons/all/lucide';     // loads all ~1,900 icons
\`\`\``,

  features: [
    'Sizes: `xs` (12px), `sm` (16px, the default), `md` (20px), `lg` (24px) and `xl` (32px)',
    'Takes its color from the parent through `currentColor`',
    'Renders its default slot when the registry has no icon by that name, so an inline SVG works as a fallback',
    'With `label`, the icon gets `role="img"` and that `aria-label`. Without it, `role="presentation"` and `aria-hidden="true"`',
  ],

  guidelines: {
    do: [
      'Give an icon a `label` when it carries meaning, such as a status or an action',
      'Leave `label` off decorative icons so screen readers skip them',
      'Size icons with the `size` prop, not CSS',
      'Register custom icons with `iconRegistry.set()` before they first render',
    ],
    dont: [
      "Don't render SVG strings from user input without sanitizing them yourself first",
      "Don't use `xl` for icons in running text. `sm` or `md` matches body copy",
      "Don't set both `name` and slot content. When the name resolves, the slot is ignored",
      "Don't let an icon carry critical information on its own. Pair it with visible text",
      "Don't hardcode fill or stroke colors in registered SVGs. Use `currentColor` so they follow the text color",
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
      (async function() {
        var browser = el.querySelector('.icon-browser');
        if (!browser || browser.dataset.init) return;
        browser.dataset.init = '1';

        var iconRegistry = window.__arcIconRegistry;
        if (!iconRegistry) return;
        var packs = {
          phosphor: await iconRegistry.list('phosphor'),
          lucide:   await iconRegistry.list('lucide'),
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

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<!-- Basic usage, once a pack is registered (see the Registry API tab) -->
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
import '@arclux/arc-ui-icons/lucide';

// Switch all icons to Lucide
iconRegistry.use('lucide');

// List all available icon names (async — loads manifest lazily)
const names = await iconRegistry.list();          // active library
const phosphor = await iconRegistry.list('phosphor'); // specific library

// Register custom icons (merged on top of active library)
iconRegistry.set({
  'my-logo': '<svg viewBox="0 0 24 24">...</svg>',
});

// Look up an icon by name (async — loads single icon lazily)
const svg = await iconRegistry.get('star'); // returns SVG string or null`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { Icon } from '@arclux/arc-ui-react';

export default function Example() {
  return (
    <>
      <Icon name="star" size="sm" />
      <Icon name="heart" size="md" />
      <Icon name="gear" size="lg" label="Settings" />
    </>
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { Icon } from '@arclux/arc-ui-vue';
</script>

<template>
  <Icon name="star" size="sm" />
  <Icon name="heart" size="md" />
  <Icon name="gear" size="lg" />
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { Icon } from '@arclux/arc-ui-svelte';
</script>

<Icon name="star" size="sm" />
<Icon name="heart" size="md" />
<Icon name="gear" size="lg" />`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { Icon } from '@arclux/arc-ui-angular';

@Component({
  imports: [Icon],
  template: \`
    <arc-icon name="star" size="sm"></arc-icon>
    <arc-icon name="heart" size="md"></arc-icon>
    <arc-icon name="gear" size="lg"></arc-icon>
  \`,
})
export class MyComponent {}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { Icon } from '@arclux/arc-ui-solid';

export default function Example() {
  return (
    <>
      <Icon name="star" size="sm" />
      <Icon name="heart" size="md" />
      <Icon name="gear" size="lg" />
    </>
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { Icon } from '@arclux/arc-ui-preact';

export default function Example() {
  return (
    <>
      <Icon name="star" size="sm" />
      <Icon name="heart" size="md" />
      <Icon name="gear" size="lg" />
    </>
  );
}`,
    },
    {
      label: 'HTML',
      lang: 'html',
      code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-icon — requires icon.css + base.css (or arc-ui.css) -->
<span class="arc-icon">
  <span
   class="icon"
   role="presentation"
   aria-label="Label"
   aria-hidden="true"
   >

   </span>
</span>`,
    },
    {
      label: 'HTML (Inline)',
      lang: 'html',
      code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-icon — self-contained, no external CSS needed -->
<span class="arc-icon" style="display: inline-flex; align-items: center; justify-content: center; color: currentColor; vertical-align: middle">
  <span
   style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%"
   role="presentation"
   aria-label="Label"
   aria-hidden="true"
   >

   </span>
</span>`,
    },
  ],

  seeAlso: ['icon-button', 'badge'],
};
