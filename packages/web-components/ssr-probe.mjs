import { render } from '@lit-labs/ssr';
import { html } from 'lit';
import { collectResult } from '@lit-labs/ssr/lib/render-result.js';
await import('./src/content/feature-card.register.js');
const out = await collectResult(render(html`
  <arc-feature-card heading="Fast by default" description="Ships less JavaScript"></arc-feature-card>
`));
console.log(out.slice(0, 500));
console.log('\nDSD:', out.includes('shadowrootmode'), '| heading in payload:', out.includes('Fast by default'));
