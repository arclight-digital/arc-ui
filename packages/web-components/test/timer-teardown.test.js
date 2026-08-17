/**
 * The timer-driven components, swept for the contract they all share: whatever
 * they schedule must not outlive them.
 *
 * A `setInterval` that survives disconnect is the quietest leak a component
 * library can ship. Nothing fails, nothing logs — the callback keeps firing
 * against a detached element for the life of the document, holding its shadow
 * root and every listener with it, and in an app that routes it accumulates one
 * per visit. arc-time-ago re-rendering a removed node every 30 seconds is
 * invisible until a long session gets slow.
 *
 * Rather than trusting each component's own `disconnectedCallback`, this counts
 * the timers the browser actually holds, by wrapping the global scheduling
 * functions for the life of one mount. That means it catches a timer started
 * anywhere — in a controller, in a promise continuation, in a helper — not only
 * the ones a component remembered to store on a field it also remembered to
 * clear.
 *
 * The listener half of the same contract is here too: a component that binds to
 * `document` or `window` must let go on the way out, for the same reason.
 */
import { expect } from '@esm-bundle/chai';
import { mount, cleanup, settle, nextFrame } from './helpers.js';

import '../src/feedback/hover-card.register.js';
import '../src/data/countdown-timer.register.js';
import '../src/typography/time-ago.register.js';
import '../src/typography/typewriter.register.js';
import '../src/input/hotkey.register.js';
import '../src/input/copy-button.register.js';
import '../src/feedback/connection-status.register.js';
import '../src/feedback/toast.register.js';

afterEach(() => cleanup());

/**
 * Components that schedule work, with markup that gets them scheduling.
 *
 * A far-future `target` and `live` are the switches that make the timer-driven
 * ones actually start a timer; without them the sweep would pass by testing
 * nothing.
 */
const TIMED = [
  ['arc-hover-card', '<arc-hover-card open-delay="20"><span>t</span></arc-hover-card>'],
  ['arc-countdown-timer', '<arc-countdown-timer target="2099-01-01T00:00:00Z"></arc-countdown-timer>'],
  ['arc-time-ago', '<arc-time-ago live datetime="2026-07-31T00:00:00Z"></arc-time-ago>'],
  ['arc-typewriter', '<arc-typewriter text="hello there"></arc-typewriter>'],
  ['arc-hotkey', '<arc-hotkey keys="ctrl+k"></arc-hotkey>'],
  ['arc-copy-button', '<arc-copy-button value="x"></arc-copy-button>'],
  ['arc-connection-status', '<arc-connection-status></arc-connection-status>'],
  ['arc-toast', '<arc-toast></arc-toast>'],
];

/**
 * Track every timer and global listener created while `run` executes.
 *
 * `run` receives a `rawWait` that schedules through the *real* setTimeout, so
 * the harness's own waiting never lands in the count. That is what lets the
 * anti-vacuity guard below assert the component scheduled something: with the
 * harness mixed in, every case would look active whether or not the component
 * did anything, and a component that quietly stopped scheduling would keep
 * passing a teardown test that no longer tests teardown.
 */
async function withScheduling(run) {
  const live = new Set();
  const created = { count: 0 };
  const listeners = [];
  const realSetTimeout = window.setTimeout;
  const realSetInterval = window.setInterval;
  const realClearTimeout = window.clearTimeout;
  const realClearInterval = window.clearInterval;
  const docAdd = document.addEventListener.bind(document);
  const docRemove = document.removeEventListener.bind(document);
  const winAdd = window.addEventListener.bind(window);
  const winRemove = window.removeEventListener.bind(window);

  const rawWait = (ms) => new Promise((r) => realSetTimeout.call(window, r, ms));

  window.setTimeout = (fn, ms, ...rest) => {
    created.count += 1;
    const id = realSetTimeout.call(window, (...a) => { live.delete(id); fn?.(...a); }, ms, ...rest);
    live.add(id);
    return id;
  };
  window.setInterval = (fn, ms, ...rest) => {
    created.count += 1;
    const id = realSetInterval.call(window, fn, ms, ...rest);
    live.add(id);
    return id;
  };
  window.clearTimeout = (id) => { live.delete(id); return realClearTimeout.call(window, id); };
  window.clearInterval = (id) => { live.delete(id); return realClearInterval.call(window, id); };
  document.addEventListener = (t, f, o) => { listeners.push(['document', t, f, o]); return docAdd(t, f, o); };
  window.addEventListener = (t, f, o) => { listeners.push(['window', t, f, o]); return winAdd(t, f, o); };
  document.removeEventListener = (t, f, o) => {
    const i = listeners.findIndex((l) => l[0] === 'document' && l[1] === t && l[2] === f);
    if (i > -1) listeners.splice(i, 1);
    return docRemove(t, f, o);
  };
  window.removeEventListener = (t, f, o) => {
    const i = listeners.findIndex((l) => l[0] === 'window' && l[1] === t && l[2] === f);
    if (i > -1) listeners.splice(i, 1);
    return winRemove(t, f, o);
  };

  try {
    await run(rawWait);
  } finally {
    Object.assign(window, {
      setTimeout: realSetTimeout,
      setInterval: realSetInterval,
      clearTimeout: realClearTimeout,
      clearInterval: realClearInterval,
    });
    document.addEventListener = docAdd;
    document.removeEventListener = docRemove;
    window.addEventListener = winAdd;
    window.removeEventListener = winRemove;
  }
  return { live, listeners, created: created.count };
}

describe('timer and listener teardown', () => {
  for (const [tag, markup] of TIMED) {
    it(`${tag} leaves nothing scheduled after it is removed`, async () => {
      let el;
      const { live, created, listeners } = await withScheduling(async (rawWait) => {
        el = mount(markup);
        await settle(el);
        // Long enough for a first tick to schedule the next one, which is where
        // a self-rescheduling timer would otherwise escape the count.
        await rawWait(60);
        el.remove();
        await nextFrame();
        await rawWait(30);
      });

      // Anti-vacuity: a component that schedules nothing and binds nothing
      // passes a teardown assertion without exercising any teardown.
      expect(
        created + listeners.length,
        `${tag} scheduled nothing and bound nothing — this case tests no teardown`,
      ).to.be.greaterThan(0);

      expect(
        [...live].length,
        `${tag} left ${live.size} timer(s) running after removal`,
      ).to.equal(0);
    });

    it(`${tag} releases its document and window listeners`, async () => {
      let el;
      const { listeners } = await withScheduling(async (rawWait) => {
        el = mount(markup);
        await settle(el);
        await rawWait(30);
        el.remove();
        await nextFrame();
      });

      const leaked = listeners.map((l) => `${l[0]}:${l[1]}`);
      expect(leaked, `${tag} left listener(s) bound: ${leaked.join(', ')}`).to.have.lengthOf(0);
    });
  }
});
