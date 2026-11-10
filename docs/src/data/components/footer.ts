import type { ComponentDef } from './_types';

export const footer: ComponentDef = {
  name: 'Footer',
  slug: 'footer',
  tag: 'arc-footer',
  tier: 'navigation',
  interactivity: 'static',
  description: 'Page footer with slots for a logo, link columns, social icons and legal text.',

  overview: `Footer is the page's \`<footer>\` landmark. It has four slots: \`logo\`, the default slot for link columns, \`social\` and \`legal\`. The legal slot gets its own thin rule above it.

Link columns go in the default slot, usually a \`<div>\` each with a heading and a list of links. They wrap on a CSS grid with a 160px minimum column width, one column on a phone and as many as fit on a wide screen, with no breakpoints to set.

\`border\` adds a top border and is on by default. Set \`no-border\` to remove it. \`density="compact"\` tightens the spacing, for dashboards and admin panels. \`align="center"\` centers everything, and \`contained\` wraps the content in a Container of size \`sm\`, \`md\`, \`lg\`, \`xl\` or \`full\` (\`md\` if left empty).`,

  features: [
    'The background is `--surface-base`, so it follows the theme',
    'CSS parts: `base`, `brand`, `columns`, `social`, `legal`',
  ],

  guidelines: {
    do: [
      'Make it the last child of your page layout or AppShell',
      'Keep the logo in the `logo` slot small',
      'Group links into columns by topic, such as Product, Company and Resources',
      'Put the copyright line and company name in the `legal` slot',
      'Use `density="compact"` inside admin shells and dashboards',
      'Keep column headings short, with the same casing',
    ],
    dont: [
      "Don't put forms, modals or other interactive widgets in it. Keep it to navigation",
      "Don't repeat the main navigation word for word. Pick the links people look for at the bottom of a page",
      "Don't put your main call to action only in the footer",
    ],
  },

  previewHtml: `<div style="width:100%;border:1px solid var(--border-subtle);border-radius:var(--radius-md);overflow:hidden">
  <arc-footer border>
    <div slot="logo" style="display:flex;align-items:center;gap:8px;">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style="flex-shrink:0"><circle cx="12" cy="12" r="10" stroke="var(--accent)" stroke-width="2"/><path d="M8 12l3 3 5-5" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      <strong style="color:var(--text-primary);font-size:18px;">ARC UI</strong>
    </div>
    <div>
      <p style="margin:0 0 12px;font-weight:600;color:var(--text-primary);font-size:13px;text-transform:uppercase;letter-spacing:1px;">Product</p>
      <ul style="list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:8px;font-size:14px;">
        <li><a href="#" style="color:var(--text-secondary);text-decoration:none;">Components</a></li>
        <li><a href="#" style="color:var(--text-secondary);text-decoration:none;">Tokens</a></li>
        <li><a href="#" style="color:var(--text-secondary);text-decoration:none;">Changelog</a></li>
      </ul>
    </div>
    <div>
      <p style="margin:0 0 12px;font-weight:600;color:var(--text-primary);font-size:13px;text-transform:uppercase;letter-spacing:1px;">Company</p>
      <ul style="list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:8px;font-size:14px;">
        <li><a href="#" style="color:var(--text-secondary);text-decoration:none;">About</a></li>
        <li><a href="#" style="color:var(--text-secondary);text-decoration:none;">Blog</a></li>
        <li><a href="#" style="color:var(--text-secondary);text-decoration:none;">Careers</a></li>
      </ul>
    </div>
    <div>
      <p style="margin:0 0 12px;font-weight:600;color:var(--text-primary);font-size:13px;text-transform:uppercase;letter-spacing:1px;">Resources</p>
      <ul style="list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:8px;font-size:14px;">
        <li><a href="#" style="color:var(--text-secondary);text-decoration:none;">Documentation</a></li>
        <li><a href="#" style="color:var(--text-secondary);text-decoration:none;">GitHub</a></li>
        <li><a href="#" style="color:var(--text-secondary);text-decoration:none;">Support</a></li>
      </ul>
    </div>
    <div slot="legal">&copy; ARC UI contributors. MIT licensed. &middot; <a href="#" style="color:var(--text-muted);text-decoration:none;">Privacy</a> &middot; <a href="#" style="color:var(--text-muted);text-decoration:none;">Terms</a></div>
  </arc-footer>
</div>`,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<script type="module" src="@arclux/arc-ui"></script>

<arc-footer border>
  <div slot="logo"><strong>ARC UI</strong></div>

  <div>
    <p><strong>Product</strong></p>
    <ul>
      <li><a href="/docs/components">Components</a></li>
      <li><a href="/docs/tokens">Tokens</a></li>
      <li><a href="/docs/changelog">Changelog</a></li>
    </ul>
  </div>
  <div>
    <p><strong>Company</strong></p>
    <ul>
      <li><a href="/about">About</a></li>
      <li><a href="/blog">Blog</a></li>
      <li><a href="/careers">Careers</a></li>
    </ul>
  </div>
  <div>
    <p><strong>Resources</strong></p>
    <ul>
      <li><a href="/docs">Documentation</a></li>
      <li><a href="/github">GitHub</a></li>
      <li><a href="/support">Support</a></li>
    </ul>
  </div>

  <div slot="legal">&copy; 2026 ARC UI. All rights reserved.</div>
</arc-footer>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { Footer } from '@arclux/arc-ui-react';

export function SiteFooter() {
  return (
    <Footer border>
      <div slot="logo"><strong>ARC UI</strong></div>

      <div>
        <p><strong>Product</strong></p>
        <ul>
          <li><a href="/docs/components">Components</a></li>
          <li><a href="/docs/tokens">Tokens</a></li>
          <li><a href="/docs/changelog">Changelog</a></li>
        </ul>
      </div>
      <div>
        <p><strong>Company</strong></p>
        <ul>
          <li><a href="/about">About</a></li>
          <li><a href="/blog">Blog</a></li>
          <li><a href="/careers">Careers</a></li>
        </ul>
      </div>
      <div>
        <p><strong>Resources</strong></p>
        <ul>
          <li><a href="/docs">Documentation</a></li>
          <li><a href="/github">GitHub</a></li>
          <li><a href="/support">Support</a></li>
        </ul>
      </div>

      <div slot="legal">&copy; 2026 ARC UI. All rights reserved.</div>
    </Footer>
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { Footer } from '@arclux/arc-ui-vue';
</script>

<template>
  <Footer border>
    <div slot="logo"><strong>ARC UI</strong></div>

    <div>
      <p><strong>Product</strong></p>
      <ul>
        <li><a href="/docs/components">Components</a></li>
        <li><a href="/docs/tokens">Tokens</a></li>
        <li><a href="/docs/changelog">Changelog</a></li>
      </ul>
    </div>
    <div>
      <p><strong>Company</strong></p>
      <ul>
        <li><a href="/about">About</a></li>
        <li><a href="/blog">Blog</a></li>
        <li><a href="/careers">Careers</a></li>
      </ul>
    </div>
    <div>
      <p><strong>Resources</strong></p>
      <ul>
        <li><a href="/docs">Documentation</a></li>
        <li><a href="/github">GitHub</a></li>
        <li><a href="/support">Support</a></li>
      </ul>
    </div>

    <div slot="legal">&copy; 2026 ARC UI. All rights reserved.</div>
  </Footer>
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { Footer } from '@arclux/arc-ui-svelte';
</script>

<Footer border>
  <div slot="logo"><strong>ARC UI</strong></div>

  <div>
    <p><strong>Product</strong></p>
    <ul>
      <li><a href="/docs/components">Components</a></li>
      <li><a href="/docs/tokens">Tokens</a></li>
      <li><a href="/docs/changelog">Changelog</a></li>
    </ul>
  </div>
  <div>
    <p><strong>Company</strong></p>
    <ul>
      <li><a href="/about">About</a></li>
      <li><a href="/blog">Blog</a></li>
      <li><a href="/careers">Careers</a></li>
    </ul>
  </div>
  <div>
    <p><strong>Resources</strong></p>
    <ul>
      <li><a href="/docs">Documentation</a></li>
      <li><a href="/github">GitHub</a></li>
      <li><a href="/support">Support</a></li>
    </ul>
  </div>

  <div slot="legal">&copy; 2026 ARC UI. All rights reserved.</div>
</Footer>`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { Footer } from '@arclux/arc-ui-angular';

@Component({
  imports: [Footer],
  template: \`
    <arc-footer border>
      <div slot="logo"><strong>ARC UI</strong></div>

      <div>
        <p><strong>Product</strong></p>
        <ul>
          <li><a href="/docs/components">Components</a></li>
          <li><a href="/docs/tokens">Tokens</a></li>
          <li><a href="/docs/changelog">Changelog</a></li>
        </ul>
      </div>
      <div>
        <p><strong>Company</strong></p>
        <ul>
          <li><a href="/about">About</a></li>
          <li><a href="/blog">Blog</a></li>
          <li><a href="/careers">Careers</a></li>
        </ul>
      </div>
      <div>
        <p><strong>Resources</strong></p>
        <ul>
          <li><a href="/docs">Documentation</a></li>
          <li><a href="/github">GitHub</a></li>
          <li><a href="/support">Support</a></li>
        </ul>
      </div>

      <div slot="legal">&copy; 2026 ARC UI. All rights reserved.</div>
    </arc-footer>
  \`,
})
export class SiteFooterComponent {}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { Footer } from '@arclux/arc-ui-solid';

export function SiteFooter() {
  return (
    <Footer border>
      <div slot="logo"><strong>ARC UI</strong></div>

      <div>
        <p><strong>Product</strong></p>
        <ul>
          <li><a href="/docs/components">Components</a></li>
          <li><a href="/docs/tokens">Tokens</a></li>
          <li><a href="/docs/changelog">Changelog</a></li>
        </ul>
      </div>
      <div>
        <p><strong>Company</strong></p>
        <ul>
          <li><a href="/about">About</a></li>
          <li><a href="/blog">Blog</a></li>
          <li><a href="/careers">Careers</a></li>
        </ul>
      </div>
      <div>
        <p><strong>Resources</strong></p>
        <ul>
          <li><a href="/docs">Documentation</a></li>
          <li><a href="/github">GitHub</a></li>
          <li><a href="/support">Support</a></li>
        </ul>
      </div>

      <div slot="legal">&copy; 2026 ARC UI. All rights reserved.</div>
    </Footer>
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { Footer } from '@arclux/arc-ui-preact';

export function SiteFooter() {
  return (
    <Footer border>
      <div slot="logo"><strong>ARC UI</strong></div>

      <div>
        <p><strong>Product</strong></p>
        <ul>
          <li><a href="/docs/components">Components</a></li>
          <li><a href="/docs/tokens">Tokens</a></li>
          <li><a href="/docs/changelog">Changelog</a></li>
        </ul>
      </div>
      <div>
        <p><strong>Company</strong></p>
        <ul>
          <li><a href="/about">About</a></li>
          <li><a href="/blog">Blog</a></li>
          <li><a href="/careers">Careers</a></li>
        </ul>
      </div>
      <div>
        <p><strong>Resources</strong></p>
        <ul>
          <li><a href="/docs">Documentation</a></li>
          <li><a href="/github">GitHub</a></li>
          <li><a href="/support">Support</a></li>
        </ul>
      </div>

      <div slot="legal">&copy; 2026 ARC UI. All rights reserved.</div>
    </Footer>
  );
}`,
    },
    {
      label: 'HTML',
      lang: 'html',
      code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-footer — requires footer.css + base.css (or arc-ui.css) -->
<div class="arc-footer">
  <footer class="footer">
   <div class="footer__brand">
    <strong>ARC UI</strong>
   </div>
   <div class="footer__columns">
    <div>
      <p><strong>Product</strong></p>
      <ul>
        <li><a href="/docs/components">Components</a></li>
        <li><a href="/docs/tokens">Tokens</a></li>
        <li><a href="/docs/changelog">Changelog</a></li>
      </ul>
    </div>
    <div>
      <p><strong>Company</strong></p>
      <ul>
        <li><a href="/about">About</a></li>
        <li><a href="/blog">Blog</a></li>
        <li><a href="/careers">Careers</a></li>
      </ul>
    </div>
    <div>
      <p><strong>Resources</strong></p>
      <ul>
        <li><a href="/docs">Documentation</a></li>
        <li><a href="/github">GitHub</a></li>
        <li><a href="/support">Support</a></li>
      </ul>
    </div>
   </div>
   <div class="footer__social">

   </div>
   <div class="footer__legal">
    &copy; 2026 ARC UI. All rights reserved.
   </div>
   </footer>
</div>`,
    },
    {
      label: 'HTML (Inline)',
      lang: 'html',
      code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-footer — self-contained, no external CSS needed -->
<div class="arc-footer" style="display: block; background: rgb(3, 3, 7); color: rgb(138, 138, 150); font-family: 'Host Grotesk', system-ui, sans-serif; font-size: clamp(15px, 1.2vw, 16px)">
  <footer style="padding: 64px 40px 40px; border-top: 1px solid rgb(24, 24, 30)">
   <div style="margin-bottom: 40px">
    <strong style="color: rgb(232, 232, 236); font-size: 18px">ARC UI</strong>
   </div>
   <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 40px; margin-bottom: 40px">
    <div>
      <p style="margin: 0 0 12px; font-weight: 600; color: rgb(232, 232, 236); font-size: 13px; text-transform: uppercase; letter-spacing: 1px">Product</p>
      <ul style="list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; font-size: 14px">
        <li><a href="/docs/components" style="color: rgb(138, 138, 150); text-decoration: none">Components</a></li>
        <li><a href="/docs/tokens" style="color: rgb(138, 138, 150); text-decoration: none">Tokens</a></li>
        <li><a href="/docs/changelog" style="color: rgb(138, 138, 150); text-decoration: none">Changelog</a></li>
      </ul>
    </div>
    <div>
      <p style="margin: 0 0 12px; font-weight: 600; color: rgb(232, 232, 236); font-size: 13px; text-transform: uppercase; letter-spacing: 1px">Company</p>
      <ul style="list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; font-size: 14px">
        <li><a href="/about" style="color: rgb(138, 138, 150); text-decoration: none">About</a></li>
        <li><a href="/blog" style="color: rgb(138, 138, 150); text-decoration: none">Blog</a></li>
        <li><a href="/careers" style="color: rgb(138, 138, 150); text-decoration: none">Careers</a></li>
      </ul>
    </div>
    <div>
      <p style="margin: 0 0 12px; font-weight: 600; color: rgb(232, 232, 236); font-size: 13px; text-transform: uppercase; letter-spacing: 1px">Resources</p>
      <ul style="list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; font-size: 14px">
        <li><a href="/docs" style="color: rgb(138, 138, 150); text-decoration: none">Documentation</a></li>
        <li><a href="/github" style="color: rgb(138, 138, 150); text-decoration: none">GitHub</a></li>
        <li><a href="/support" style="color: rgb(138, 138, 150); text-decoration: none">Support</a></li>
      </ul>
    </div>
   </div>
   <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 24px">

   </div>
   <div style="padding-top: 16px; border-top: 1px solid rgb(24, 24, 30); color: rgb(124, 124, 137); font-size: 12px">
    &copy; 2026 ARC UI. All rights reserved.
   </div>
   </footer>
</div>`,
    },
  ],

  seeAlso: ['top-bar', 'sidebar', 'app-shell', 'link'],
};
