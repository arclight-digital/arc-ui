import { expect } from '@esm-bundle/chai';
import { mount, cleanup, useBaseCss } from './helpers.js';

import '../src/content/divider.register.js';
import '../src/content/separator.register.js';
import '../src/content/stack.register.js';
import '../src/layout/cluster.register.js';
import '../src/data/tag.register.js';
import '../src/data/badge.register.js';
import '../src/data/description-list.register.js';
import '../src/data/description-item.register.js';
import '../src/data/key-value.register.js';
import '../src/data/kv-pair.register.js';
import '../src/input/pin-input.register.js';
import '../src/input/otp-input.register.js';
import '../src/feedback/alert.register.js';
import '../src/content/callout.register.js';
import '../src/feedback/toast.register.js';
import '../src/data/data-grid.register.js';
import '../src/data/table.register.js';

/**
 * V4-PLAN 4.2's merges, tested from the side that can actually fail.
 *
 * A merge is two claims. "The deprecated component still works" is the easy one
 * and is covered by everything that already existed. The one worth a suite is
 * **"the survivor can do what the deprecated one did"** — because that is what
 * V4-SCOPE §3 asserted from the names, and it was wrong about it four times out
 * of six. `arc-divider` had no dashed rule and no flat one; `arc-description-
 * list` could not put a term beside its detail; `arc-tag` had no `info`; and
 * `arc-badge`'s merge was backed out of 4.2 entirely once the two components'
 * typography was compared rather than their prop lists.
 *
 * So each case here pins a capability the *deprecated* component had, asserted
 * against the *survivor*, and several are paired with the deprecated component
 * rendering the same thing — an equivalence a rename can be checked against
 * rather than eyeballed.
 */

const styleOf = (el, sel) => getComputedStyle(el.shadowRoot.querySelector(sel));

/**
 * The :root token layer.
 *
 * `tokenStyles` gives every component the `:host` layer; the `:root` layer is
 * `base.css`, shipped to consumers and not loaded into a test page by default.
 * Without it `var(--border-default)` resolves to nothing — and a declaration
 * containing an invalid var() is invalid *at computed-value time*, so
 * `border-top: 1px dashed var(--border-default)` computes to `border-top-style:
 * none` rather than to `dashed`.
 *
 * That is silent. The first run of this suite reported that arc-separator
 * itself — untouched by 4.2 — had stopped drawing a dashed rule. Any assertion
 * in this repo on a property whose value flows through a `:root` token needs
 * this, or it is measuring the fallback.
 */
useBaseCss();

async function render(html) {
  const el = mount(html);
  await el.updateComplete;
  return el;
}

describe('4.2 merges: the survivor absorbs the capability', () => {
  afterEach(cleanup);

  describe('arc-separator → arc-divider', () => {
    // The four separator variants, each asserted on arc-divider by the property
    // that made it that variant — a dashed rule is a border, not a background.
    it('draws a dashed rule', async () => {
      const el = await render('<arc-divider variant="dashed"></arc-divider>');
      const s = styleOf(el, '.divider');
      expect(s.borderTopStyle).to.equal('dashed');
      expect(s.borderTopWidth).to.equal('1px');
    });

    it('draws a dotted rule', async () => {
      const el = await render('<arc-divider variant="dotted"></arc-divider>');
      expect(styleOf(el, '.divider').borderTopStyle).to.equal('dotted');
    });

    it('draws a flat line, not the subtle gradient', async () => {
      // `line` is the variant most easily argued away as "just use subtle", and
      // the difference is the whole reason arc-separator looked different:
      // subtle is a gradient that fades at both ends, line is a solid rule.
      const line = await render('<arc-divider variant="line"></arc-divider>');
      const subtle = await render('<arc-divider variant="subtle"></arc-divider>');
      expect(styleOf(line, '.divider').backgroundImage).to.equal('none');
      expect(styleOf(subtle, '.divider').backgroundImage).to.not.equal('none');
    });

    it('fades from both ends for fade, and from one for align', async () => {
      const both = await render('<arc-divider variant="fade"></arc-divider>');
      const left = await render('<arc-divider variant="fade" align="left"></arc-divider>');
      const bothImg = styleOf(both, '.divider').backgroundImage;
      const leftImg = styleOf(left, '.divider').backgroundImage;
      expect(bothImg).to.include('gradient');
      expect(leftImg).to.include('gradient');
      // Anti-vacuity: without the align rule these are the same string, and a
      // test that only asserted "is a gradient" would pass on a broken align.
      expect(leftImg).to.not.equal(bothImg);
    });

    it('does not let the fallback rule reclaim the absorbed variants', async () => {
      // The fallback is a `:host(:not([variant=…]):not(…))` chain, which
      // out-specifies a plain attribute selector — so a new variant that is not
      // added to every chain silently keeps the subtle gradient underneath it.
      // Four chains had to be extended; this is what notices if one is missed.
      for (const variant of ['dashed', 'dotted', 'line']) {
        const el = await render(`<arc-divider variant="${variant}"></arc-divider>`);
        expect(styleOf(el, '.divider').backgroundImage, variant).to.equal('none');
      }
    });

    it('applies the absorbed variants vertically too', async () => {
      const el = await render('<arc-divider vertical variant="dashed"></arc-divider>');
      const s = styleOf(el, '.divider');
      expect(s.borderTopStyle).to.equal('none');
      expect(s.borderInlineStartStyle).to.equal('dashed');
    });

    it('applies them to both halves of a labelled divider', async () => {
      const el = await render('<arc-divider variant="dashed" label="OR"></arc-divider>');
      const lines = el.shadowRoot.querySelectorAll('.divider__line');
      expect(lines).to.have.lengthOf(2);
      for (const line of lines) {
        expect(getComputedStyle(line).borderTopStyle).to.equal('dashed');
      }
    });

    it('still renders arc-separator unchanged', async () => {
      // The other half of the deprecation promise: nothing about it moved.
      const el = await render('<arc-separator variant="dashed"></arc-separator>');
      expect(styleOf(el, '.separator').borderTopStyle).to.equal('dashed');
    });
  });

  describe('arc-key-value → arc-description-list', () => {
    it('stacks term above detail by default', async () => {
      const el = await render(
        '<arc-description-list><arc-description-item term="A">1</arc-description-item></arc-description-list>',
      );
      const item = el.querySelector('arc-description-item');
      await item.updateComplete;
      expect(getComputedStyle(item.shadowRoot.querySelector('.item')).gridTemplateColumns)
        .to.not.include(' ');
    });

    it('puts term beside detail with layout="horizontal"', async () => {
      // The capability arc-key-value existed for. It crosses a shadow boundary —
      // the list styles a custom property, the item reads it — so this is the
      // case that fails if either half is missing.
      const el = await render(
        '<arc-description-list layout="horizontal"><arc-description-item term="A">1</arc-description-item></arc-description-list>',
      );
      const item = el.querySelector('arc-description-item');
      await item.updateComplete;
      const cols = getComputedStyle(item.shadowRoot.querySelector('.item')).gridTemplateColumns;
      expect(cols.split(' ').filter(Boolean)).to.have.lengthOf(2);
    });

    it('leaves an item outside a list laid out sensibly', async () => {
      // The fallbacks in the item's own CSS. Without them a standalone item
      // would get `grid-template-columns: ` and collapse.
      const el = await render('<arc-description-item term="A">1</arc-description-item>');
      const s = getComputedStyle(el.shadowRoot.querySelector('.item'));
      expect(s.display).to.equal('grid');
      expect(s.gridTemplateColumns).to.not.equal('');
    });

    it('still renders arc-key-value unchanged', async () => {
      const el = await render(
        '<arc-key-value><arc-kv-pair label="A">1</arc-kv-pair></arc-key-value>',
      );
      expect(el.layout).to.equal('horizontal');
      expect(getComputedStyle(el.querySelector('arc-kv-pair')).display).to.equal('grid');
    });
  });

  describe('arc-cluster → arc-stack', () => {
    it('reproduces a cluster exactly, given the four attributes', async () => {
      // V4-SCOPE §3 said `arc-stack[direction=horizontal][wrap]` "is exactly
      // what cluster is". It is not — cluster also defaults to gap="sm" and
      // align="center" where stack defaults to md/stretch — so the migration
      // is four attributes, not two, and MIGRATION.md says all four.
      const cluster = await render('<arc-cluster><span>a</span></arc-cluster>');
      const stack = await render(
        '<arc-stack direction="horizontal" wrap gap="sm" align="center"><span>a</span></arc-stack>',
      );
      const c = getComputedStyle(cluster);
      const s = getComputedStyle(stack);
      for (const prop of ['display', 'flexDirection', 'flexWrap', 'columnGap', 'alignItems']) {
        expect(s[prop], prop).to.equal(c[prop]);
      }
    });

    it('differs from the two-attribute version §3 proposed', async () => {
      // Anti-vacuity for the case above: if stack's defaults happened to match
      // cluster's, the four-attribute claim would be untested decoration.
      const cluster = await render('<arc-cluster><span>a</span></arc-cluster>');
      const naive = await render(
        '<arc-stack direction="horizontal" wrap><span>a</span></arc-stack>',
      );
      const c = getComputedStyle(cluster);
      const n = getComputedStyle(naive);
      expect([n.columnGap, n.alignItems]).to.not.deep.equal([c.columnGap, c.alignItems]);
    });

    it('maps the two justify values that are spelled differently', async () => {
      const cluster = await render('<arc-cluster justify="space-between"><span>a</span></arc-cluster>');
      const stack = await render(
        '<arc-stack direction="horizontal" justify="between"><span>a</span></arc-stack>',
      );
      expect(getComputedStyle(stack).justifyContent).to.equal(
        getComputedStyle(cluster).justifyContent,
      );
    });
  });

  describe('arc-otp-input → arc-pin-input', () => {
    it('covers both otp types', async () => {
      for (const type of ['number', 'text']) {
        const el = await render(`<arc-pin-input type="${type}" length="6"></arc-pin-input>`);
        expect(el.shadowRoot.querySelectorAll('input'), type).to.have.lengthOf(6);
      }
    });

    it('renders the same number of boxes as the otp it replaces', async () => {
      const otp = await render('<arc-otp-input length="4"></arc-otp-input>');
      const pin = await render('<arc-pin-input length="4"></arc-pin-input>');
      expect(pin.shadowRoot.querySelectorAll('input').length).to.equal(
        otp.shadowRoot.querySelectorAll('input').length,
      );
    });
  });

  describe('arc-callout → arc-alert', () => {
    const roleOf = (el) => el.shadowRoot.querySelector('.alert').getAttribute('role');
    const liveOf = (el) => el.shadowRoot.querySelector('.alert').getAttribute('aria-live');

    it('maps severity to a role, ratified in V4-SCOPE §3.2', async () => {
      const expected = {
        error: 'alert',
        warning: 'alert',
        success: 'status',
        info: 'note',
        tip: 'note',
      };
      for (const [variant, role] of Object.entries(expected)) {
        const el = await render(`<arc-alert variant="${variant}">x</arc-alert>`);
        expect(roleOf(el), variant).to.equal(role);
      }
    });

    it('no longer announces info — the correction the merge forced', async () => {
      // A behaviour change for existing arc-alert users, not only for callout's:
      // info used to be role="status", which is a polite live region. Since
      // info is arc-callout's default variant and arc-callout was a static
      // role="note" box, the naive merge would have turned every informational
      // callout on every page into an announcement.
      const el = await render('<arc-alert variant="info">x</arc-alert>');
      expect(roleOf(el)).to.equal('note');
      expect(liveOf(el), 'auto mode leaves the role to carry politeness').to.equal(null);
    });

    it('still announces error and warning assertively via the role', async () => {
      // Anti-vacuity for the case above: if the mapping had gone the other way
      // and everything became `note`, that test would pass and this one would
      // not.
      for (const variant of ['error', 'warning']) {
        const el = await render(`<arc-alert variant="${variant}">x</arc-alert>`);
        expect(roleOf(el), variant).to.equal('alert');
      }
    });

    it('lets live override the derived politeness in both directions', async () => {
      const quiet = await render('<arc-alert variant="error" live="off">x</arc-alert>');
      expect(roleOf(quiet), 'the role survives — it is still an error').to.equal('alert');
      expect(liveOf(quiet)).to.equal('off');

      const loud = await render('<arc-alert variant="info" live="polite">x</arc-alert>');
      expect(roleOf(loud)).to.equal('note');
      expect(liveOf(loud)).to.equal('polite');
    });

    it('emits no aria-live at all in auto mode', async () => {
      // Not cosmetic: writing the implicit value out again is a second
      // declaration of the same thing, and the two can drift.
      for (const variant of ['error', 'success', 'info']) {
        const el = await render(`<arc-alert variant="${variant}">x</arc-alert>`);
        expect(el.shadowRoot.querySelector('.alert').hasAttribute('aria-live'), variant).to.be.false;
      }
    });

    it('carries the tip variant, on the success color ramp with its own glyph', async () => {
      const tip = await render('<arc-alert variant="tip">x</arc-alert>');
      const success = await render('<arc-alert variant="success">x</arc-alert>');
      const icon = (el) => el.shadowRoot.querySelector('.alert__icon-wrap');
      expect(getComputedStyle(icon(tip)).color).to.equal(getComputedStyle(icon(success)).color);
      expect(icon(tip).textContent.trim()).to.not.equal(icon(success).textContent.trim());
    });

    it('takes a slotted icon, as arc-callout did', async () => {
      const el = await render('<arc-alert variant="tip"><span slot="icon">!</span>x</arc-alert>');
      const slot = el.shadowRoot.querySelector('slot[name="icon"]');
      expect(slot, 'the icon slot exists').to.exist;
      expect(slot.assignedElements()).to.have.lengthOf(1);
    });

    it('still renders arc-callout unchanged, note role and all', async () => {
      const el = await render('<arc-callout variant="info">x</arc-callout>');
      expect(el.shadowRoot.querySelector('.callout').getAttribute('role')).to.equal('note');
    });
  });

  describe('arc-snackbar + arc-progress-toast → arc-toast', () => {
    const toasts = (el) => [...el.shadowRoot.querySelectorAll('.toast')];
    const fill = (el) => el.shadowRoot.querySelector('.toast__fill');

    it('renders an action button — which it never did before', async () => {
      // Not a new capability, a repair. show() has only ever put the payload on
      // `entry.options`, and render read `t.actionLabel`, so this button was
      // unreachable for every toast that ever existed. The documented
      // part="action" could not be delivered.
      const el = await render('<arc-toast></arc-toast>');
      el.show({ message: 'Deleted', actionLabel: 'Undo' });
      await el.updateComplete;
      const action = el.shadowRoot.querySelector('[part~="action"]');
      expect(action, 'the action button renders').to.exist;
      expect(action.textContent.trim()).to.equal('Undo');
    });

    it('calls the action callback and fires arc-action', async () => {
      // arc-snackbar offered both. A callback cannot be attached declaratively,
      // which is why the event has to exist for its consumers to migrate.
      const el = await render('<arc-toast></arc-toast>');
      let called = 0;
      const seen = [];
      el.addEventListener('arc-action', (e) => seen.push(e.detail.id));
      const id = el.show({ message: 'Deleted', actionLabel: 'Undo', action: () => (called += 1) });
      await el.updateComplete;
      el.shadowRoot.querySelector('[part~="action"]').click();
      expect(called).to.equal(1);
      expect(seen).to.deep.equal([id]);
    });

    it('renders a progress track when show() is given a progress', async () => {
      const el = await render('<arc-toast></arc-toast>');
      el.show({ message: 'Uploading', progress: 40 });
      await el.updateComplete;
      expect(fill(el)).to.exist;
      expect(fill(el).style.width).to.equal('40%');
    });

    it('moves the bar with updateToast, and clamps it', async () => {
      const el = await render('<arc-toast></arc-toast>');
      const id = el.show({ message: 'Uploading', progress: 0 });
      el.updateToast(id, { progress: 70 });
      await el.updateComplete;
      expect(fill(el).style.width).to.equal('70%');
      el.updateToast(id, { progress: 300 });
      await el.updateComplete;
      expect(fill(el).style.width).to.equal('100%');
    });

    it('never dedupes a progress toast', async () => {
      // Two uploads of a file with the same name are two uploads. Coalescing
      // them would leave one bar tracking both.
      const el = await render('<arc-toast></arc-toast>');
      const a = el.show({ message: 'Uploading', progress: 0 });
      const b = el.show({ message: 'Uploading', progress: 0 });
      await el.updateComplete;
      expect(b).to.not.equal(a);
      expect(toasts(el)).to.have.lengthOf(2);
    });

    it('still dedupes an ordinary toast — the exception is scoped', async () => {
      // Anti-vacuity for the case above: if the dedupe guard had been dropped
      // rather than narrowed, that test would pass and this one would not.
      const el = await render('<arc-toast></arc-toast>');
      const a = el.show({ message: 'Saved' });
      const b = el.show({ message: 'Saved' });
      await el.updateComplete;
      expect(b).to.equal(a);
      expect(toasts(el)).to.have.lengthOf(1);
    });

    it('does not auto-dismiss a progress toast', async () => {
      const el = await render('<arc-toast duration="10"></arc-toast>');
      el.show({ message: 'Uploading', progress: 10 });
      await el.updateComplete;
      await new Promise((r) => setTimeout(r, 80));
      expect(toasts(el), 'a progress toast is finished by complete(), not a timer').to.have.lengthOf(1);
    });

    it('fires arc-complete on complete(), and not arc-close', async () => {
      // The operation finishing and the user closing the toast are different
      // events. A consumer awaiting the first must not be woken by the second.
      const el = await render('<arc-toast></arc-toast>');
      const events = [];
      el.addEventListener('arc-complete', (e) => events.push(['complete', e.detail.id]));
      el.addEventListener('arc-close', (e) => events.push(['close', e.detail.id]));
      const id = el.show({ message: 'Uploading', progress: 99 });
      await el.updateComplete;
      el.complete(id);
      await new Promise((r) => setTimeout(r, 350));
      expect(events).to.deep.equal([['complete', id]]);
    });

    it('fires arc-cancel from the cancel button, and calls onCancel', async () => {
      const el = await render('<arc-toast></arc-toast>');
      let cancelled = 0;
      const events = [];
      el.addEventListener('arc-cancel', (e) => events.push(e.detail.id));
      el.addEventListener('arc-close', () => events.push('close'));
      const id = el.show({ message: 'Uploading', progress: 20, onCancel: () => (cancelled += 1) });
      await el.updateComplete;
      el.shadowRoot.querySelector('[part~="cancel"]').click();
      await new Promise((r) => setTimeout(r, 350));
      expect(cancelled).to.equal(1);
      expect(events).to.deep.equal([id]);
    });

    it('still fires arc-close for an ordinary dismissal', async () => {
      // Anti-vacuity for the two `silent` paths above: the suppression is
      // scoped to complete() and cancel, not applied to _dismiss generally.
      const el = await render('<arc-toast></arc-toast>');
      const seen = [];
      el.addEventListener('arc-close', (e) => seen.push(e.detail.id));
      const id = el.show({ message: 'Saved' });
      await el.updateComplete;
      el.shadowRoot.querySelector('[part~="dismiss"]').click();
      await new Promise((r) => setTimeout(r, 350));
      expect(seen).to.deep.equal([id]);
    });
  });

  describe('arc-table + arc-data-table → arc-data-grid', () => {
    const rows = [{ a: '1', b: '2' }, { a: '3', b: '4' }];
    const columns = [{ key: 'a', label: 'A' }, { key: 'b', label: 'B' }];

    async function grid(attrs = '') {
      const el = await render(`<arc-data-grid ${attrs}></arc-data-grid>`);
      el.columns = columns;
      el.rows = rows;
      await el.updateComplete;
      return el;
    }

    it('stripes by default, as it always has', async () => {
      const el = await grid();
      const [odd, even] = [...el.shadowRoot.querySelectorAll('tbody tr')];
      expect(getComputedStyle(odd).backgroundColor).to.not.equal(getComputedStyle(even).backgroundColor);
    });

    it('turns stripes off with no-striped — what a plain arc-table looked like', async () => {
      // arc-table's `striped` was opt-in and this grid has always striped
      // unconditionally, so the flag defaults *on*: a merge is not the place to
      // restyle the survivor. no-striped is the migration path in the other
      // direction.
      const el = await grid('no-striped');
      const [odd, even] = [...el.shadowRoot.querySelectorAll('tbody tr')];
      expect(getComputedStyle(odd).backgroundColor).to.equal(getComputedStyle(even).backgroundColor);
    });

    it('tightens cells with density="compact", header and body together', async () => {
      const loose = await grid();
      const tight = await grid('density="compact"');
      for (const sel of ['th', 'td']) {
        const a = getComputedStyle(loose.shadowRoot.querySelector(sel)).paddingLeft;
        const b = getComputedStyle(tight.shadowRoot.querySelector(sel)).paddingLeft;
        expect(parseFloat(b), sel).to.be.lessThan(parseFloat(a));
      }
    });

    it('renders the same cell values arc-table did, from the object model', async () => {
      // The migration §3.1 calls the breaking part: positional arrays become
      // objects keyed by column. Same output, different input.
      const table = await render('<arc-table></arc-table>');
      table.columns = ['A', 'B'];
      table.rows = [['1', '2'], ['3', '4']];
      await table.updateComplete;
      const cells = (el) => [...el.shadowRoot.querySelectorAll('tbody td')].map((td) => td.textContent.trim());
      expect(cells(await grid())).to.deep.equal(cells(table));
    });
  });

  describe('arc-badge stays, and arc-tag gained info anyway', () => {
    it('gives arc-tag the info variant arc-badge had', async () => {
      const tag = await render('<arc-tag variant="info">x</arc-tag>');
      const badge = await render('<arc-badge variant="info">x</arc-badge>');
      expect(styleOf(tag, '.tag').color).to.equal(styleOf(badge, '.badge').color);
    });

    it('records why arc-badge was not merged: the two are not typographically the same', async () => {
      // The measurement that took row 3 out of 4.2. If a later change makes
      // these agree, the merge is unblocked and this test is the thing that
      // should fail to say so.
      const tag = await render('<arc-tag>x</arc-tag>');
      const badge = await render('<arc-badge>x</arc-badge>');
      const t = styleOf(tag, '.tag');
      const b = styleOf(badge, '.badge');
      expect(t.textTransform).to.equal('uppercase');
      expect(b.textTransform).to.equal('none');
      expect(t.fontFamily).to.not.equal(b.fontFamily);
    });
  });
});
