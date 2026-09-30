/**
 * arc-avatar: the photo doesn't wait for script to be seen.
 *
 * It sat at opacity 0 until the load event reached the component, so a
 * server-rendered avatar showed its shimmer until JavaScript ran, cached
 * photo or not (found on arclight.build, 4.9.0).
 */
import { expect } from '@esm-bundle/chai';
import '../src/content/avatar.register.js';
import { mount, cleanup } from './helpers.js';

// Never finishes loading: the state a first paint catches it in.
const PENDING = 'data:image/svg+xml,';

describe('arc-avatar', () => {
  afterEach(cleanup);

  it('shows its image before the load event, painted over the shimmer', async () => {
    const el = mount(`<arc-avatar src="${PENDING}" name="Ada Lovelace"></arc-avatar>`);
    await el.updateComplete;
    const img = el.shadowRoot.querySelector('[part="img"]');
    const shimmer = el.shadowRoot.querySelector('.avatar__shimmer');
    expect(getComputedStyle(img).opacity).to.equal('1');
    expect(getComputedStyle(img).position, 'positioned, so it paints over the shimmer').to.equal(
      'relative',
    );
    expect(
      img.compareDocumentPosition(shimmer) & Node.DOCUMENT_POSITION_PRECEDING,
      'shimmer first',
    ).to.be.greaterThan(0);
  });

  it('falls back to initials when the image fails', async () => {
    const el = mount(
      '<arc-avatar src="data:image/png;base64,broken" name="Ada Lovelace"></arc-avatar>',
    );
    await el.updateComplete;
    await new Promise((r) => setTimeout(r, 100));
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('[part="initials"]'), 'initials shown').to.not.equal(null);
    expect(el.shadowRoot.querySelector('[part="img"]'), 'image gone').to.equal(null);
  });
});
