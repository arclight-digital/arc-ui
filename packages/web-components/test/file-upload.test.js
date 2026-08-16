/**
 * arc-file-upload — the dropzone.
 *
 * What this pins: files arrive from both the drop and the browse paths,
 * `multiple` appends where single-select replaces, `maxSize` rejects with an
 * inline error while letting the acceptable files through, removal reports the
 * file it dropped and the new list, and the native input is reset so the same
 * file can be picked twice.
 *
 * `disabled` used to be drawn entirely in CSS, so the dropzone kept its tab stop
 * and still opened the picker from the keyboard — finding #61, now fixed here and
 * guarded library-wide by test/disabled-focus-sweep.test.js.
 */
import { expect } from '@esm-bundle/chai';
import { mount, cleanup, settle, keyOn, record } from './helpers.js';

import '../src/input/file-upload.register.js';

afterEach(() => cleanup());

async function upload(attrs = '') {
  const el = mount(`<arc-file-upload ${attrs}></arc-file-upload>`);
  await settle(el);
  return el;
}

const dropzone = (el) => el.shadowRoot.querySelector('[part~="dropzone"]');
const nativeInput = (el) => el.shadowRoot.querySelector('input[type="file"]');
const items = (el) => [...el.shadowRoot.querySelectorAll('[part~="file-item"]')];
const errorText = (el) => el.shadowRoot.querySelector('[part~="error"]')?.textContent.trim() ?? '';

/** A File of a given size, so maxSize can be exercised without real bytes. */
const file = (name, bytes = 10) => new File(['x'.repeat(bytes)], name, { type: 'text/plain' });

/** Drop files onto the dropzone the way a browser delivers them. */
async function drop(el, files) {
  const dataTransfer = new DataTransfer();
  for (const f of files) dataTransfer.items.add(f);
  dropzone(el).dispatchEvent(
    new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer }),
  );
  await settle(el);
}

describe('arc-file-upload rendering', () => {
  it('exposes the documented css parts', async () => {
    const el = await upload();
    expect(el.shadowRoot.querySelector('[part~="wrapper"]')).to.not.equal(null);
    expect(dropzone(el)).to.not.equal(null);
  });

  it('is a labelled button in the tab order', async () => {
    const el = await upload();
    expect(dropzone(el).getAttribute('role')).to.equal('button');
    expect(dropzone(el).getAttribute('tabindex')).to.equal('0');
    expect(dropzone(el).getAttribute('aria-label')).to.contain('Upload files');
  });

  it('passes accept through to the native input and shows it as a hint', async () => {
    const el = await upload('accept=".pdf,.docx"');
    expect(nativeInput(el).getAttribute('accept')).to.equal('.pdf,.docx');
    expect(dropzone(el).textContent).to.contain('.pdf');
  });

  it('shows the size limit as a hint only when one is set', async () => {
    const limited = await upload('max-size="1024"');
    expect(dropzone(limited).textContent).to.contain('Max size');

    const open = await upload();
    expect(dropzone(open).textContent).to.not.contain('Max size');
  });

  it('lists nothing before any file arrives', async () => {
    const el = await upload();
    expect(items(el)).to.have.lengthOf(0);
  });
});

describe('arc-file-upload receiving files', () => {
  it('accepts a drop and lists the file', async () => {
    const el = await upload();
    await drop(el, [file('notes.txt')]);

    expect(items(el)).to.have.lengthOf(1);
    expect(items(el)[0].textContent).to.contain('notes.txt');
  });

  it('reports the new list on detail.value', async () => {
    const el = await upload();
    const details = [];
    el.addEventListener('arc-change', (e) => details.push(e.detail));

    await drop(el, [file('a.txt')]);

    expect(details).to.have.lengthOf(1);
    expect(details[0].value.map((f) => f.name)).to.deep.equal(['a.txt']);
  });

  it('bubbles and crosses the shadow boundary', async () => {
    const el = await upload();
    let event = null;
    document.body.addEventListener('arc-change', (e) => { event = e; }, { once: true });

    await drop(el, [file('a.txt')]);

    expect(event).to.not.equal(null);
    expect(event.bubbles).to.equal(true);
    expect(event.composed).to.equal(true);
  });

  it('replaces the file when not multiple', async () => {
    const el = await upload();
    await drop(el, [file('first.txt')]);
    await drop(el, [file('second.txt')]);

    expect(items(el)).to.have.lengthOf(1);
    expect(items(el)[0].textContent).to.contain('second.txt');
  });

  it('appends when multiple', async () => {
    const el = await upload('multiple');
    await drop(el, [file('a.txt')]);
    await drop(el, [file('b.txt'), file('c.txt')]);

    expect(items(el)).to.have.lengthOf(3);
  });

  it('takes only the first of a multi-file drop when not multiple', async () => {
    const el = await upload();
    await drop(el, [file('a.txt'), file('b.txt')]);

    expect(items(el)).to.have.lengthOf(1);
    expect(items(el)[0].textContent).to.contain('a.txt');
  });

  it('claims the drop so the browser does not navigate to the file', async () => {
    const el = await upload();
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file('a.txt'));
    const event = new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer });

    dropzone(el).dispatchEvent(event);
    await settle(el);

    expect(event.defaultPrevented).to.equal(true);
  });

  it('marks itself while a drag is over it, and unmarks on leave', async () => {
    const el = await upload();

    dropzone(el).dispatchEvent(new DragEvent('dragover', { bubbles: true, cancelable: true }));
    await settle(el);
    expect(dropzone(el).classList.contains('drag-over')).to.equal(true);

    dropzone(el).dispatchEvent(new DragEvent('dragleave', { bubbles: true, cancelable: true }));
    await settle(el);
    expect(dropzone(el).classList.contains('drag-over')).to.equal(false);
  });

  it('resets the native input so the same file can be picked twice', async () => {
    const el = await upload();
    const input = nativeInput(el);

    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file('same.txt'));
    input.files = dataTransfer.files;
    input.dispatchEvent(new Event('change', { bubbles: true }));
    await settle(el);

    expect(items(el)).to.have.lengthOf(1);
    expect(input.value, 'cleared, or a repeat pick fires nothing').to.equal('');
  });
});

describe('arc-file-upload size limit', () => {
  it('rejects an oversized file and says which one', async () => {
    const el = await upload('max-size="100"');
    await drop(el, [file('huge.txt', 500)]);

    expect(items(el), 'nothing accepted').to.have.lengthOf(0);
    expect(errorText(el)).to.contain('huge.txt');
    expect(errorText(el)).to.contain('exceeded max size');
  });

  it('keeps the acceptable files from a mixed drop', async () => {
    const el = await upload('multiple max-size="100"');
    await drop(el, [file('ok.txt', 10), file('huge.txt', 500)]);

    expect(items(el).map((i) => i.textContent.trim())).to.have.lengthOf(1);
    expect(items(el)[0].textContent).to.contain('ok.txt');
    expect(errorText(el), 'and still reports the rejection').to.contain('huge.txt');
  });

  it('announces nothing when every file is rejected', async () => {
    const el = await upload('max-size="100"');
    const seen = record(el, ['arc-change']);

    await drop(el, [file('huge.txt', 500)]);

    expect(seen, 'no files means no change').to.deep.equal([]);
  });

  it('treats maxSize 0 as no limit', async () => {
    const el = await upload('max-size="0"');
    await drop(el, [file('huge.txt', 100000)]);

    expect(items(el)).to.have.lengthOf(1);
    expect(errorText(el)).to.equal('');
  });
});

describe('arc-file-upload removal', () => {
  it('reports the removed file and then the new list', async () => {
    const el = await upload('multiple');
    await drop(el, [file('a.txt'), file('b.txt')]);

    const seen = [];
    el.addEventListener('arc-remove', (e) => seen.push(['remove', e.detail]));
    el.addEventListener('arc-change', (e) => seen.push(['change', e.detail]));

    el.shadowRoot.querySelector('[part~="file-item"] button')?.click();
    await settle(el);

    expect(seen.map(([k]) => k), 'remove then change').to.deep.equal(['remove', 'change']);
    expect(seen[0][1].value.name).to.equal('a.txt');
    expect(seen[0][1].index).to.equal(0);
    expect(seen[1][1].value.map((f) => f.name)).to.deep.equal(['b.txt']);
  });

  it('clears a standing error when a file is removed', async () => {
    const el = await upload('multiple max-size="100"');
    await drop(el, [file('ok.txt', 10), file('huge.txt', 500)]);
    expect(errorText(el)).to.not.equal('');

    el.shadowRoot.querySelector('[part~="file-item"] button')?.click();
    await settle(el);

    expect(errorText(el)).to.equal('');
  });
});

describe('arc-file-upload keyboard and disabled', () => {
  it('opens the picker from Enter and Space', async () => {
    for (const key of ['Enter', ' ']) {
      const el = await upload();
      let opened = 0;
      nativeInput(el).addEventListener('click', (e) => { e.preventDefault(); opened++; });

      keyOn(dropzone(el), key);
      await settle(el);

      expect(opened, key).to.equal(1);
      cleanup();
    }
  });

  it('claims Enter and Space', async () => {
    const el = await upload();
    for (const key of ['Enter', ' ']) {
      const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
      nativeInput(el).addEventListener('click', (e) => e.preventDefault());
      dropzone(el).dispatchEvent(event);
      await settle(el);
      expect(event.defaultPrevented, key).to.equal(true);
    }
  });

  it('takes the whole control out of the pointer path when disabled', async () => {
    const el = await upload('disabled');
    expect(getComputedStyle(el).pointerEvents).to.equal('none');
  });

  // Finding #61, fixed. `disabled` used to be drawn entirely in CSS —
  // `:host([disabled]) { opacity: .5; pointer-events: none }` — with a hardcoded
  // tabindex="0", no aria-disabled, and no flag check in _handleKeydown or
  // _handleClick. pointer-events does not affect the keyboard, so a disabled
  // dropzone stayed focusable and opened the file picker on Enter or Space.
  //
  // Same shape as the disabled-anchor case in arc-button (test-audit.md §5,
  // bug 2): a control disabled by CSS alone stays live to keyboard users.
  // The library-wide guard is test/disabled-focus-sweep.test.js.
  it('a disabled dropzone is out of the tab order and inert', async () => {
    const el = await upload('disabled');
    let opened = 0;
    nativeInput(el).addEventListener('click', (e) => { e.preventDefault(); opened++; });

    expect(dropzone(el).getAttribute('tabindex'), 'still a tab stop').to.equal('-1');
    expect(dropzone(el).getAttribute('aria-disabled'), 'not announced disabled')
      .to.equal('true');

    keyOn(dropzone(el), 'Enter');
    await settle(el);

    expect(opened, 'the picker opened on a disabled control').to.equal(0);
  });

  it('a disabled dropzone refuses a drop', async () => {
    // Drag-and-drop delivers the event regardless of pointer-events, so this
    // path needed its own guard rather than inheriting the stylesheet's.
    const el = await upload('disabled');
    const seen = record(el, ['arc-change']);

    await drop(el, [file('a.txt')]);

    expect(items(el), 'the file was accepted').to.have.lengthOf(0);
    expect(seen).to.have.lengthOf(0);
  });
});
