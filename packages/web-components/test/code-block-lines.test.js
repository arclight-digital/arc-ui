/**
 * arc-code-block v2: line-level rendering.
 *
 * Code renders one `line` part per line whether shiki has colored it or not,
 * so the prompt, line numbers, emphasis, diff tints, wrap and collapse all
 * work on the plain path, and the colors arriving never move a line. The
 * shell color refinement is tested against the real bash grammar.
 */
import { expect } from '@esm-bundle/chai';
import { mount, cleanup, settle, until } from './helpers.js';

import '../src/typography/code-block.register.js';

afterEach(() => cleanup());

async function block(attrs = '', code = '', width = '480px') {
  const box = mount(`<div style="width:${width}"><arc-code-block ${attrs}></arc-code-block></div>`);
  const el = box.querySelector('arc-code-block');
  el.code = code;
  await settle(el);
  return el;
}

const lines = (el) => [...el.shadowRoot.querySelectorAll('[part~="line"]')];
const prompts = (el) => lines(el).map((l) => l.querySelector('[part="prompt"]')?.dataset.prompt ?? null);

describe('arc-code-block lines', () => {
  it('renders one line part per line, with no extra line for a trailing newline', async () => {
    const el = await block('', 'a\nb\n\nc\n');
    expect(lines(el).map((l) => l.textContent)).to.deep.equal(['a\n', 'b\n', '\n', 'c\n']);
  });

  it('gives a blank line a full line of height', async () => {
    const el = await block('', 'a\n\nc');
    const [a, blank] = lines(el);
    expect(blank.getBoundingClientRect().height).to.be.closeTo(a.getBoundingClientRect().height, 0.5);
  });
});

describe('arc-code-block prompt', () => {
  it('puts $ before command lines, not continuations or blank lines', async () => {
    const el = await block('prompt', 'sudo bootc switch \\\n  ghcr.io/x:latest\n\necho done');
    expect(prompts(el)).to.deep.equal(['$', '', '', '$']);
  });

  it('takes a custom prompt', async () => {
    const el = await block('prompt="#"', 'dnf install x');
    expect(prompts(el)).to.deep.equal(['#']);
  });

  it('draws no prompt cells without the attribute', async () => {
    const el = await block('', 'ls');
    expect(prompts(el)).to.deep.equal([null]);
  });

  it('keeps the prompt out of the text, the selection and the copy', async () => {
    const code = 'npm install\nnpm test';
    const el = await block('prompt language="bash" label="x"', code);
    const pre = el.shadowRoot.querySelector('[part="pre"]');
    expect(pre.textContent).to.equal('npm install\nnpm test\n');
    const cell = el.shadowRoot.querySelector('[part="prompt"]');
    expect(getComputedStyle(cell).userSelect).to.equal('none');
    expect(cell.getAttribute('aria-hidden')).to.equal('true');
    expect(el.shadowRoot.querySelector('arc-copy-button').value).to.equal(code);
  });
});

describe('arc-code-block line numbers, emphasis and diff', () => {
  it('numbers lines in a gutter that is not selectable', async () => {
    const el = await block('line-numbers', 'a\nb\nc');
    const gutters = [...el.shadowRoot.querySelectorAll('[part="gutter"]')];
    expect(gutters.map((g) => g.dataset.n)).to.deep.equal(['1', '2', '3']);
    expect(getComputedStyle(gutters[0]).userSelect).to.equal('none');
    expect(getComputedStyle(gutters[0], '::before').content).to.equal('"1"');
  });

  it('emphasizes the lines in `highlight`', async () => {
    const el = await block('highlight="2, 4-5, junk"', 'a\nb\nc\nd\ne\nf');
    const on = lines(el).map((l) => l.part.contains('line-highlight'));
    expect(on).to.deep.equal([false, true, false, true, true, false]);
  });

  it('tints + and - lines under `diff`, leaving file headers alone', async () => {
    const el = await block('diff', '--- a/x\n+++ b/x\n-old\n+new\n same');
    const kind = lines(el).map((l) => (l.part.contains('line-add') ? '+' : l.part.contains('line-remove') ? '-' : ' '));
    expect(kind).to.deep.equal([' ', ' ', '-', '+', ' ']);
  });

  it('tints diffs for language="diff" without the attribute', async () => {
    const el = await block('language="diff"', '-a\n+b');
    expect(lines(el)[1].part.contains('line-add')).to.equal(true);
  });
});

describe('arc-code-block wrap and collapse', () => {
  const LONG = 'word '.repeat(80);

  it('scrolls a long line by default and wraps it under `wrap`', async () => {
    const el = await block('', LONG, '240px');
    const body = el.shadowRoot.querySelector('[part="body"]');
    expect(body.scrollWidth).to.be.greaterThan(body.clientWidth);

    el.wrap = true;
    await settle(el);
    expect(body.scrollWidth).to.be.at.most(body.clientWidth + 1);
    expect(lines(el)[0].getBoundingClientRect().height).to.be.greaterThan(40);
  });

  it('collapses to max-lines and expands on the button', async () => {
    const code = Array.from({ length: 20 }, (_, i) => `line ${i + 1}`).join('\n');
    const el = await block('max-lines="5"', code);
    const pre = el.shadowRoot.querySelector('[part="pre"]');
    const lineHeight = lines(el)[0].getBoundingClientRect().height;
    expect(pre.getBoundingClientRect().height).to.be.closeTo(lineHeight * 5, 1);

    const button = el.shadowRoot.querySelector('[part="expand"]');
    expect(button.textContent.trim()).to.equal('Show all 20 lines');
    expect(button.getAttribute('aria-expanded')).to.equal('false');

    const seen = [];
    el.addEventListener('arc-toggle', (e) => seen.push(e.detail.value));
    button.click();
    await settle(el);
    expect(pre.getBoundingClientRect().height).to.be.closeTo(lineHeight * 20, 1);
    expect(button.getAttribute('aria-expanded')).to.equal('true');
    expect(button.textContent.trim()).to.equal('Show fewer lines');

    button.click();
    await settle(el);
    expect(pre.getBoundingClientRect().height).to.be.closeTo(lineHeight * 5, 1);
    expect(seen).to.deep.equal([true, false]);
  });

  it('draws no expand button when the code already fits', async () => {
    const el = await block('max-lines="5"', 'a\nb');
    expect(el.shadowRoot.querySelector('[part="expand"]')).to.equal(null);
  });
});

describe('arc-code-block highlighting', function () {
  // The first highlight loads shiki and a grammar, which can take longer than
  // mocha's 2s on a loaded run.
  this.timeout(8000);

  const SHELL = "sudo bootc switch --apply \\\n  ghcr.io/x/y:latest | grep $HOME && echo 'hi'";

  it('does not change the block height when the colors arrive', async () => {
    const box = mount('<div style="width:600px"><arc-code-block language="bash" label="x"></arc-code-block></div>');
    const el = box.querySelector('arc-code-block');
    el.code = SHELL;
    await el.updateComplete;
    expect(el._tokens).to.equal(null);
    const before = el.getBoundingClientRect().height;
    expect(await until(() => el._tokens !== null, { timeout: 5000 })).to.equal(true);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.code-block__tok')).to.not.equal(null);
    expect(el.getBoundingClientRect().height).to.equal(before);
  });

  it('colors each part of a shell command on its own', async () => {
    const el = await block('language="bash"', SHELL, '900px');
    await until(() => el._tokens !== null, { timeout: 5000 });
    await el.updateComplete;
    const colorOf = (text) => {
      const tok = [...el.shadowRoot.querySelectorAll('.code-block__tok')].find((t) => t.textContent.trim() === text);
      return tok?.getAttribute('style') ?? '';
    };
    expect(colorOf('sudo')).to.contain('--shiki-token-prefix');
    expect(colorOf('bootc')).to.contain('--shiki-token-command');
    expect(colorOf('switch')).to.contain('--shiki-token-subcommand');
    expect(colorOf('--apply')).to.contain('--shiki-token-flag');
    expect(colorOf('ghcr.io/x/y:latest')).to.contain('--shiki-token-path');
    expect(colorOf('|')).to.contain('--shiki-token-operator');
    expect(colorOf('grep')).to.contain('--shiki-token-command');
    expect(colorOf('echo')).to.contain('--shiki-token-command');

    const bootc = [...el.shadowRoot.querySelectorAll('.code-block__tok')].find((t) => t.textContent.trim() === 'bootc');
    expect(getComputedStyle(bootc).fontWeight).to.equal('600');
  });
});

describe('arc-code-block header', () => {
  it('shows the label, then the filename, and an icon-only copy', async () => {
    const el = await block('label="Pulsar" filename="install.sh" language="bash"', 'ls');
    const header = el.shadowRoot.querySelector('[part="header"]');
    expect(header.querySelector('[part="label"]').textContent).to.equal('Pulsar');
    expect(header.querySelector('[part="filename"]').textContent).to.equal('install.sh');
    const copy = header.querySelector('arc-copy-button');
    expect(copy.hasAttribute('icon-only')).to.equal(true);
    await copy.updateComplete;
    expect(copy.shadowRoot.querySelector('button').getAttribute('aria-label')).to.equal('Copy code');
  });

  it('puts the header up for a label alone', async () => {
    const el = await block('label="Only a title"', 'ls');
    expect(el.shadowRoot.querySelector('[part="header"] [part="label"]')).to.not.equal(null);
  });
});
