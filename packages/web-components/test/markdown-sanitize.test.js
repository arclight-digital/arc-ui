import { expect } from '@esm-bundle/chai';
import '../src/typography/markdown.register.js';
import { mount, cleanup } from './helpers.js';

/**
 * arc-markdown's sanitizer used to be DOMParser-based, which is what kept it
 * the one component that could not be server-rendered. The replacement shares
 * a hand-written scanner with arc-icon, so it needs its own tests against the
 * markup this component actually produces.
 *
 * Worth knowing while reading these: the markdown parser escapes `<`, `>` and
 * `&` in its source before emitting a tag, so raw HTML in the source never
 * becomes an element. The sanitizer's real job is the URL inside a link or an
 * image; the tag-stripping is defence against a parser bug.
 */
async function render(content) {
  const el = mount('<arc-markdown></arc-markdown>');
  el.content = content;
  await el.updateComplete;
  return el.shadowRoot.querySelector('.markdown');
}

describe('arc-markdown sanitizing', () => {
  afterEach(cleanup);

  it('escapes raw HTML in the source rather than rendering it', async () => {
    const md = await render('Hello <script>alert(1)</script> world');
    expect(md.querySelector('script')).to.equal(null);
    expect(md.textContent).to.contain('script');
  });

  it('drops a javascript: link but keeps its text', async () => {
    const md = await render('[click me](javascript:alert(1))');
    const a = md.querySelector('a');
    expect(a?.getAttribute('href') ?? null).to.equal(null);
    expect(md.textContent).to.contain('click me');
  });

  it('rejects a javascript: URL split by a control character', async () => {
    const md = await render('[x](java\tscript:alert(1))');
    expect(md.querySelector('a')?.getAttribute('href') ?? null).to.equal(null);
  });

  it('keeps allowlisted schemes and relative URLs', async () => {
    for (const [url, expected] of [
      ['https://example.com/', 'https://example.com/'],
      ['mailto:a@b.c', 'mailto:a@b.c'],
      ['/docs/page', '/docs/page'],
    ]) {
      const md = await render(`[link](${url})`);
      expect(md.querySelector('a')?.getAttribute('href'), url).to.equal(expected);
    }
  });

  it('drops a data: image source', async () => {
    const md = await render('![alt](data:text/html;base64,PHNjcmlwdD4=)');
    expect(md.querySelector('img')?.getAttribute('src') ?? null).to.equal(null);
  });

  it('hardens links with rel="noopener noreferrer"', async () => {
    const md = await render('[out](https://example.com/)');
    expect(md.querySelector('a')?.getAttribute('rel')).to.equal('noopener noreferrer');
  });

  it('renders ordinary markdown intact', async () => {
    const md = await render('# Title\n\nSome **bold** and `code`.\n\n- one\n- two');
    expect(md.querySelector('h1')?.textContent).to.contain('Title');
    expect(md.querySelector('strong')?.textContent).to.equal('bold');
    expect(md.querySelector('code')?.textContent).to.equal('code');
    expect(md.querySelectorAll('li').length).to.equal(2);
  });

  it('puts the markup in the template, not on a property', async () => {
    // A .innerHTML binding is applied by the client after upgrade, so the
    // server would render an empty div and this component could never be
    // server-rendered. unsafeHTML keeps the markup in the template itself.
    const md = await render('**x**');
    expect(md.innerHTML).to.contain('<strong>');
  });
});
