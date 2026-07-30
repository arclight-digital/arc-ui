import { expect } from '@esm-bundle/chai';
import { mount, cleanup, tick } from './helpers.js';
import { isEditingTarget, isEditingNode } from '../src/shared/editing-target.js';

import '../src/input/textarea.register.js';
import '../src/input/input.register.js';
import '../src/input/checkbox.register.js';
import '../src/input/hotkey.register.js';

/**
 * Shadow DOM retargets an event as it leaves the shadow root, so a keypress in
 * the <textarea> inside <arc-textarea> reaches a document listener with
 * `target` set to <arc-textarea>. Every "am I typing?" guard written against
 * `target.tagName` therefore lets the shortcut through, which is how a space
 * typed into a textarea toggles play/pause.
 */

afterEach(cleanup);

/** Dispatch a keydown from `node` so it propagates and retargets for real. */
function keyFrom(node, key = ' ') {
  node.dispatchEvent(
    new KeyboardEvent('keydown', { key, bubbles: true, composed: true, cancelable: true }),
  );
}

describe('isEditingTarget', () => {
  it('sees the textarea inside arc-textarea, not the retargeted host', async () => {
    const el = mount('<arc-textarea label="Notes"></arc-textarea>');
    await el.updateComplete;
    const inner = el.shadowRoot.querySelector('textarea');
    expect(inner, 'expected a textarea in arc-textarea').to.exist;

    let seen;
    document.addEventListener('keydown', (e) => {
      // The premise: target really is the host, so the naive check fails.
      seen = { target: e.target.tagName, editing: isEditingTarget(e) };
    }, { once: true });
    keyFrom(inner);

    expect(seen.target).to.equal('ARC-TEXTAREA');
    expect(seen.editing, 'isEditingTarget must look through the shadow boundary').to.be.true;
  });

  it('sees the input inside arc-input', async () => {
    const el = mount('<arc-input label="Name"></arc-input>');
    await el.updateComplete;
    const inner = el.shadowRoot.querySelector('input');

    let editing;
    document.addEventListener('keydown', (e) => { editing = isEditingTarget(e); }, { once: true });
    keyFrom(inner);
    expect(editing).to.be.true;
  });

  it('is false for a keypress on a plain non-editing element', () => {
    const div = mount('<div tabindex="0">x</div>');
    let editing;
    document.addEventListener('keydown', (e) => { editing = isEditingTarget(e); }, { once: true });
    keyFrom(div);
    expect(editing).to.be.false;
  });

  it('is false for a checkbox — space there is the control, not text', async () => {
    const el = mount('<arc-checkbox label="Agree"></arc-checkbox>');
    await el.updateComplete;
    let editing;
    document.addEventListener('keydown', (e) => { editing = isEditingTarget(e); }, { once: true });
    keyFrom(el);
    expect(editing).to.be.false;
  });

  it('accepts a node as well as an event', () => {
    const wrap = mount('<div><input type="text"><input type="range"><textarea></textarea></div>');
    const [text, range] = wrap.querySelectorAll('input');
    expect(isEditingTarget(text)).to.be.true;
    expect(isEditingTarget(range)).to.be.false;
    expect(isEditingTarget(wrap.querySelector('textarea'))).to.be.true;
  });

  it('handles null and undefined', () => {
    expect(isEditingTarget(null)).to.be.false;
    expect(isEditingTarget(undefined)).to.be.false;
  });
});

describe('isEditingNode', () => {
  it('distinguishes text inputs from button-like ones', () => {
    const wrap = mount(`<div>
      <input type="text"><input type="email"><input type="search"><input type="password">
      <input type="checkbox"><input type="radio"><input type="submit"><input type="color">
    </div>`);
    const byType = (t) => wrap.querySelector(`input[type="${t}"]`);
    for (const t of ['text', 'email', 'search', 'password']) {
      expect(isEditingNode(byType(t)), `${t} should count as editing`).to.be.true;
    }
    for (const t of ['checkbox', 'radio', 'submit', 'color']) {
      expect(isEditingNode(byType(t)), `${t} should not count as editing`).to.be.false;
    }
  });

  it('treats an input with no type as text', () => {
    const el = mount('<input>');
    expect(isEditingNode(el)).to.be.true;
  });

  it('treats contenteditable as editing', () => {
    const el = mount('<div contenteditable="true">text</div>');
    expect(isEditingNode(el)).to.be.true;
  });

  it('treats a child of a contenteditable as editing', () => {
    const wrap = mount('<div contenteditable="true"><span>text</span></div>');
    expect(isEditingNode(wrap.querySelector('span'))).to.be.true;
  });

  it('treats select as editing — it consumes typeahead', () => {
    const el = mount('<select><option>a</option></select>');
    expect(isEditingNode(el)).to.be.true;
  });
});

describe('data-arc-editing marker', () => {
  it('appears on the host while an inner text field has focus', async () => {
    const el = mount('<arc-input label="Name"></arc-input>');
    await el.updateComplete;
    expect(el.hasAttribute('data-arc-editing')).to.be.false;

    el.shadowRoot.querySelector('input').focus();
    await tick();
    expect(el.hasAttribute('data-arc-editing'), 'marker should be set on focus').to.be.true;

    el.shadowRoot.querySelector('input').blur();
    await tick();
    expect(el.hasAttribute('data-arc-editing'), 'marker should clear on blur').to.be.false;
  });

  it('is reachable with matches() from outside, which is the point', async () => {
    const el = mount('<arc-textarea label="Notes"></arc-textarea>');
    await el.updateComplete;
    el.shadowRoot.querySelector('textarea').focus();
    await tick();
    expect(el.matches('[data-arc-editing]')).to.be.true;
  });

  it('stays off a control that is not a text field', async () => {
    const el = mount('<arc-checkbox label="Agree"></arc-checkbox>');
    await el.updateComplete;
    el.focus();
    (el.shadowRoot.querySelector('[role="checkbox"], input, button') || el).focus?.();
    await tick();
    expect(el.hasAttribute('data-arc-editing')).to.be.false;
  });
});

describe('arc-hotkey ignores keys typed into a field', () => {
  it('does not fire for a bare key pressed inside arc-textarea', async () => {
    const wrap = mount(`
      <div>
        <arc-hotkey keys="k"></arc-hotkey>
        <arc-textarea label="Notes"></arc-textarea>
      </div>`);
    const hotkey = wrap.querySelector('arc-hotkey');
    const textarea = wrap.querySelector('arc-textarea');
    await hotkey.updateComplete;
    await textarea.updateComplete;

    let fired = 0;
    hotkey.addEventListener('arc-hotkey-trigger', () => { fired++; });

    keyFrom(textarea.shadowRoot.querySelector('textarea'), 'k');
    await tick();
    expect(fired, 'a key typed into a textarea is not a shortcut').to.equal(0);
  });

  it('still fires for the same key pressed outside a field', async () => {
    const wrap = mount(`
      <div>
        <arc-hotkey keys="k"></arc-hotkey>
        <div tabindex="0" id="plain">x</div>
      </div>`);
    const hotkey = wrap.querySelector('arc-hotkey');
    await hotkey.updateComplete;

    let fired = 0;
    hotkey.addEventListener('arc-hotkey-trigger', () => { fired++; });

    keyFrom(wrap.querySelector('#plain'), 'k');
    await tick();
    expect(fired).to.equal(1);
  });

  it('global still fires inside a field', async () => {
    const wrap = mount(`
      <div>
        <arc-hotkey keys="k" global></arc-hotkey>
        <arc-textarea label="Notes"></arc-textarea>
      </div>`);
    const hotkey = wrap.querySelector('arc-hotkey');
    const textarea = wrap.querySelector('arc-textarea');
    await hotkey.updateComplete;
    await textarea.updateComplete;

    let fired = 0;
    hotkey.addEventListener('arc-hotkey-trigger', () => { fired++; });

    keyFrom(textarea.shadowRoot.querySelector('textarea'), 'k');
    await tick();
    expect(fired, 'global opts out of the guard on purpose').to.equal(1);
  });
});
