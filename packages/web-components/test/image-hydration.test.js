/**
 * The `load` a server-rendered image has already spent.
 *
 * arc-image, arc-avatar, arc-lightbox and arc-image-cropper all paint in two
 * steps: the `<img>` starts transparent behind a shimmer and the `load` handler
 * fades it in. Server-rendered, the parser creates that `<img>` and starts
 * fetching it long before the hydrate bundle attaches the listener — so a
 * cached or above-the-fold image finishes first, `load` fires into nothing, and
 * the picture never appears. See shared/hydrate-images.js.
 *
 * The ordering is the whole test, so nothing here may define the component
 * up front: the markup is planted while `arc-image` is still unknown, the image
 * is allowed to finish, and only then does the register module land. That is
 * the real sequence, and it is the one no other test in this directory
 * produces — every component test defines first and plants second, which is why
 * this shipped.
 *
 * The DSD payload is the real output of ssr.js for `<arc-image>`; hand-written
 * markup would lack the lit-part markers hydration binds to, Lit would render a
 * fresh `<img>` over it with a live listener, and the bug would vanish from the
 * test while staying in the product.
 */
import { expect } from '@esm-bundle/chai';
import { cleanup, tick } from './helpers.js';

// Before any component module: a class defined without this never adopts.
import '../src/hydrate.js';

afterEach(() => cleanup());

const PIXEL =
  'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';

const SERVER_HTML = `<arc-image   src="${PIXEL}" alt="pixel" aspect fit="cover"><template shadowroot="open" shadowrootmode="open"><style></style><!--lit-part o71FFQQIA5o=-->
      <div class="image-wrapper" part="base wrapper">
        <!--lit-part--><!--/lit-part-->
        <!--lit-node 2--><div class="shimmer " aria-hidden="true"></div>
        <!--lit-part 38WDZ9vulmw=-->
            <!--lit-node 0--><img
              src="${PIXEL}"
              alt="pixel"
              loading="lazy"
              class=""
              \n              \n              part="image"
            /><!--/lit-part-->
      </div>
    <!--/lit-part--></template></arc-image>`;

/** Parse DSD markup the way a browser parses a server response. */
function planted(markup) {
  const host = document.createElement('div');
  // setHTMLUnsafe is what attaches declarative shadow roots; innerHTML leaves
  // the <template> inert, which would make this test a no-op that passes.
  host.setHTMLUnsafe(markup);
  document.body.appendChild(host);
  return host.firstElementChild;
}

describe('an image that loaded before its component did', () => {
  it('is faded in anyway, and the shimmer stops', async () => {
    expect(customElements.get('arc-image'), 'undefined at plant time').to.equal(undefined);

    const el = planted(SERVER_HTML);
    const img = el.shadowRoot.querySelector('img');
    expect(img, 'the server rendered an img').to.not.equal(null);
    expect(img.className, 'and left it un-faded, as it must').to.equal('');

    // Spend the load. This is the gap the bug lives in.
    if (!img.complete) await new Promise((r) => img.addEventListener('load', r, { once: true }));
    expect(img.complete, 'the image finished before the component arrived').to.equal(true);

    await import('../src/content/image.register.js');
    await el.updateComplete;
    await tick();

    expect(img, 'the server node was adopted, not replaced').to.equal(
      el.shadowRoot.querySelector('img'),
    );
    expect(img.classList.contains('loaded'), 'the image is visible').to.equal(true);
    expect(
      el.shadowRoot.querySelector('.shimmer').classList.contains('shimmer--hidden'),
      'the skeleton is gone',
    ).to.equal(true);
  });
});
