/**
 * attachShadowRoots: a server-rendered page parsed by DOMParser, as a
 * client-side router parses the next page, hydrates like one the browser
 * loaded (arclight.build's ClientRouter, 4.9.0).
 */
import { expect } from '@esm-bundle/chai';
import '../src/hydrate.js';
import body from '/__ssr-previews.js';
import { attachShadowRoots } from '../src/shadow-roots.js';
import { cleanup } from './helpers.js';

afterEach(cleanup);

/** One preview's server markup, out of the rendered catalog. */
function preview(tag) {
  const page = new DOMParser().parseFromString(`<body>${body}</body>`, 'text/html');
  return page.querySelector(`section[data-arc-preview="${tag}"]`).innerHTML;
}

describe('attachShadowRoots', () => {
  it('turns what DOMParser left inert into shadow roots, nested ones included', () => {
    const doc = new DOMParser().parseFromString(
      `<body>${preview('arc-breadcrumb')}</body>`,
      'text/html',
    );
    const crumb = doc.querySelector('arc-breadcrumb');
    expect(crumb.shadowRoot, 'DOMParser attaches nothing').to.equal(null);
    expect(attachShadowRoots(doc)).to.be.greaterThan(0);
    expect(crumb.shadowRoot.querySelector('.breadcrumb__link')?.textContent).to.equal('Dashboard');
    expect(doc.querySelector('template[shadowrootmode]'), 'no inert templates left').to.equal(null);
    expect(attachShadowRoots(doc), 'a second call finds nothing to do').to.equal(0);
  });

  it('lets the swapped-in page hydrate instead of rendering a second copy', async () => {
    const doc = new DOMParser().parseFromString(
      `<body>${preview('arc-breadcrumb')}</body>`,
      'text/html',
    );
    attachShadowRoots(doc);
    const crumb = document.adoptNode(doc.querySelector('arc-breadcrumb'));
    document.body.append(crumb);
    const link = crumb.shadowRoot.querySelector('.breadcrumb__link');
    await import('../src/navigation/breadcrumb.register.js');
    await crumb.updateComplete;
    expect(
      crumb.shadowRoot.querySelector('.breadcrumb__link'),
      'the server node, adopted',
    ).to.equal(link);
    expect(
      crumb.shadowRoot.querySelectorAll('slot:not([name])').length,
      'one default slot, not two',
    ).to.equal(1);
  });
});
