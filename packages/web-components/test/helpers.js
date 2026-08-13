/** Shared helpers for component tests. */

/** The actually-focused element, descending through nested shadow roots. */
export function deepActive() {
  let active = document.activeElement;
  while (active?.shadowRoot?.activeElement) {
    active = active.shadowRoot.activeElement;
  }
  return active;
}

/** Mount an element from an HTML string; returns the first element child. */
export function mount(htmlString) {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = htmlString;
  const el = wrapper.firstElementChild;
  document.body.appendChild(wrapper);
  return el;
}

/** Remove everything mounted into <body> between tests. */
export function cleanup() {
  document.body.innerHTML = '';
  // Page-scrolling tests leave the window offset; the next test's layout
  // assertions would then measure against a scrolled viewport.
  if (window.scrollY !== 0) window.scrollTo(0, 0);
}

/** Let pending microtasks (e.g. a component's updateComplete.then) flush. */
export function tick() {
  return new Promise((resolve) => setTimeout(resolve));
}

/** Dispatch a keydown on document, as a real key press would deliver it. */
export function pressKey(key, init = {}) {
  document.dispatchEvent(
    new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init })
  );
}

/**
 * Dispatch a keydown on a specific element.
 *
 * pressKey() goes to the document, which is right for global shortcuts and
 * wrong for a roving-tabindex widget: those read `e.target` to know which item
 * the key landed on, so the event has to start where the focus is.
 */
export function keyOn(target, key, init = {}) {
  // composed: true because real key events are — without it the event stops at
  // the shadow boundary and never reaches a listener bound on the host, which
  // is where several components put theirs.
  target.dispatchEvent(
    new KeyboardEvent('keydown', { key, bubbles: true, composed: true, cancelable: true, ...init })
  );
}

/** Wait one animation frame — for anything that coalesces work through rAF. */
export function nextFrame() {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

/** Wait real milliseconds. Prefer nextFrame()/tick(); use this only for timers. */
export function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Settle a component completely: its own render, pending microtasks, and any
 * observer or rAF-coalesced follow-up render those may have scheduled.
 *
 * Two update passes because the common shape here is read-in-callback →
 * set-state → render again: an observer fires during the first flush and the
 * work it schedules only lands on the second.
 */
export async function settle(el) {
  await el?.updateComplete;
  await tick();
  await nextFrame();
  await el?.updateComplete;
}

/**
 * One real pointer id, so setPointerCapture() accepts the gesture — it rejects
 * an id it has never seen, which silently drops every subsequent move.
 */
export const pointerInit = { bubbles: true, pointerId: 1, isPrimary: true, pointerType: 'mouse' };

/**
 * Drive a pointer gesture: down at the first point, a move per remaining point,
 * then up.
 *
 * `points` are PointerEvent inits (`{ clientX, clientY }`). Components that
 * listen for moves on the window rather than on the element they captured need
 * `moveTarget: window`; the default keeps the whole gesture on one element.
 */
export function drag(target, points, { moveTarget = target } = {}) {
  const [first, ...rest] = points;
  target.dispatchEvent(new PointerEvent('pointerdown', { ...pointerInit, ...first }));
  for (const point of rest) {
    moveTarget.dispatchEvent(new PointerEvent('pointermove', { ...pointerInit, ...point }));
  }
  moveTarget.dispatchEvent(new PointerEvent('pointerup', { ...pointerInit, ...(rest.at(-1) ?? first) }));
}

/**
 * Record contract events in fire order as `[kind, value]` pairs, where `kind`
 * is the event name minus its `arc-` prefix.
 *
 * The default pair is the v3 edit/commit contract: `arc-input` while a value is
 * being changed, `arc-change` once it is committed. Order is the assertion that
 * matters, so the entries stay a flat tuple that survives `deep.equal`.
 *
 * `whole: true` records the entire `detail` instead of `detail.value`, for the
 * controls that carry more than one key (arc-masked-input's `{value, formatted}`).
 */
export function record(el, names = ['arc-input', 'arc-change'], { whole = false } = {}) {
  const seen = [];
  for (const name of names) {
    const kind = name.startsWith('arc-') ? name.slice(4) : name;
    el.addEventListener(name, (e) => seen.push([kind, whole ? e.detail : e.detail?.value]));
  }
  return seen;
}

/** The entries of one kind from a record() log. */
export const only = (seen, kind) => seen.filter(([k]) => k === kind);

/**
 * Wait until `predicate()` is true, or fail after `timeout` ms.
 *
 * For anything driven by a real observer or a real timer, prefer this to
 * `wait(n)`. A fixed sleep encodes a guess about how busy the machine is:
 * carousel.test.js slept 120ms for a 30ms interval — four intervals of apparent
 * headroom — and still failed roughly 2 runs in 6 under full-suite load, where
 * it read as "auto-play is broken" rather than "the thread was busy".
 *
 * Returns true if the condition was met, so a caller can assert on it and get a
 * useful message rather than a timeout.
 *
 * The default deliberately sits below Mocha's own 2000ms: at parity the runner
 * kills the test first and the failure arrives as "Timeout of 2000ms exceeded"
 * with no indication of which condition never came true.
 */
export async function until(predicate, { timeout = 1200, step = 20 } = {}) {
  const deadline = performance.now() + timeout;
  while (performance.now() < deadline) {
    if (await predicate()) return true;
    await wait(step);
  }
  return false;
}

/**
 * Let an IntersectionObserver or ResizeObserver deliver.
 *
 * Both fire off the main thread and are delivered before paint, so two frames
 * plus a macrotask covers observation → callback → the render it schedules.
 * Real observers in a real browser, which is the point of running these here
 * rather than stubbing the constructor: a stub would assert our idea of when
 * they fire, not the browser's.
 */
export async function observed() {
  await nextFrame();
  await tick();
  await nextFrame();
}

/**
 * Put content on the page with spacers around it, and scroll the *window*.
 *
 * An IntersectionObserver created without a `root` observes against the
 * viewport, not against whatever scrollable ancestor you happen to build. A
 * nested `overflow:auto` box therefore reports the sentinel as clipped and
 * never-intersecting no matter how it is scrolled, which reads as the component
 * being broken. Scrolling the page is both the correct way to exercise these
 * and how they are actually used.
 *
 * Returns the wrapper, and resets the scroll position on cleanup().
 */
export function pageWith(innerHtml, { above = 0, below = 1500 } = {}) {
  const wrapper = document.createElement('div');
  wrapper.innerHTML =
    `<div style="height:${above}px"></div>${innerHtml}<div style="height:${below}px"></div>`;
  document.body.appendChild(wrapper);
  return wrapper;
}

/**
 * Whether `pnpm generate:icons` has been run.
 *
 * `src/icons/{phosphor,lucide}/` is gitignored — 3,408 generated modules is not
 * a diff anyone wants on an icon-library bump — so on a fresh checkout every
 * icon lookup 404s. Tests that resolve a real icon must skip rather than fail:
 * seventeen assertion errors about chevrons look like a broken suite, and a
 * suite that is red for a reason nobody has to act on trains people to re-run
 * instead of read.
 *
 * `pretest` regenerates them before `pnpm test`, so this only trips when
 * web-test-runner is invoked directly — an IDE runner, a watch task, a
 * single-file run. Mirrors the guard in scripts/smoke-test-wrappers.js.
 */
export async function generatedIconsPresent() {
  return fetch(new URL('../src/icons/phosphor/_resolver.js', import.meta.url)).then(
    (r) => r.ok,
    () => false
  );
}

/** Message pointing at the fix, so a skipped run says what to do about it. */
export const ICONS_MISSING = 'generated icon modules missing — run `pnpm generate:icons` first';

/**
 * Track live ResizeObserver observations across the whole page.
 *
 * Asks the question the teardown and reconnect sweeps actually care about — *is
 * this element being observed right now* — without reaching for a component's
 * private field. The earlier spelling of the teardown sweep asserted on
 * `el._resizeObserver`, which tied it to one particular way of holding the
 * observer and broke the moment ownership moved into a reactive controller
 * (finding #55) even though every component's behaviour was unchanged.
 *
 * The prototype is patched rather than the constructor, so components still get
 * real observers with real browser delivery. Call `restore()` in afterEach.
 */
export function spyResizeObserver() {
  const real = {
    observe: ResizeObserver.prototype.observe,
    unobserve: ResizeObserver.prototype.unobserve,
    disconnect: ResizeObserver.prototype.disconnect,
  };
  /** observer → the targets it is currently watching. */
  const live = new Map();
  /** Every observe() ever made, so a test can count re-subscriptions. */
  const calls = [];

  ResizeObserver.prototype.observe = function (target, ...rest) {
    if (!live.has(this)) live.set(this, new Set());
    live.get(this).add(target);
    calls.push(target);
    return real.observe.call(this, target, ...rest);
  };
  ResizeObserver.prototype.unobserve = function (target, ...rest) {
    live.get(this)?.delete(target);
    return real.unobserve.call(this, target, ...rest);
  };
  ResizeObserver.prototype.disconnect = function (...rest) {
    live.get(this)?.clear();
    return real.disconnect.call(this, ...rest);
  };

  // Counts the host itself as well as its shadow DOM and its light children:
  // arc-toolbar observes `this`, and scoping to the shadow root alone silently
  // reported it as observing nothing.
  const within = (el, targets) =>
    targets.filter((t) => el.contains(t) || el.shadowRoot?.contains(t)).length;

  return {
    /** How many elements belonging to `el` are under observation now. */
    liveCount: (el) => within(el, [...live.values()].flatMap((set) => [...set])),
    /** How many observe() calls have ever been made against anything `el` owns. */
    observeCalls: (el) => within(el, calls),
    restore: () => Object.assign(ResizeObserver.prototype, real),
  };
}

/**
 * The IntersectionObserver twin of spyResizeObserver().
 *
 * Same argument for existing: the alternative is reaching for a component's
 * `_observer` field, which asserts a *name* rather than a behaviour. That
 * coupling broke when arc-infinite-scroll moved onto the shared subscription
 * controller and stopped holding an observer of its own — the component was
 * more correct than before and three tests went red (finding #64).
 *
 * Ask whether an element is under observation *now*, not who is holding what.
 */
export function spyIntersectionObserver() {
  const real = {
    observe: IntersectionObserver.prototype.observe,
    unobserve: IntersectionObserver.prototype.unobserve,
    disconnect: IntersectionObserver.prototype.disconnect,
  };
  const live = new Map();
  const calls = [];

  IntersectionObserver.prototype.observe = function (target, ...rest) {
    if (!live.has(this)) live.set(this, new Set());
    live.get(this).add(target);
    calls.push(target);
    return real.observe.call(this, target, ...rest);
  };
  IntersectionObserver.prototype.unobserve = function (target, ...rest) {
    live.get(this)?.delete(target);
    return real.unobserve.call(this, target, ...rest);
  };
  IntersectionObserver.prototype.disconnect = function (...rest) {
    live.get(this)?.clear();
    return real.disconnect.call(this, ...rest);
  };

  const within = (el, targets) =>
    targets.filter((t) => el.contains(t) || el.shadowRoot?.contains(t)).length;

  return {
    liveCount: (el) => within(el, [...live.values()].flatMap((set) => [...set])),
    observeCalls: (el) => within(el, calls),
    /**
     * Is this exact node under observation? For components that watch elements
     * *outside* themselves — arc-anchor-nav observes document sections by id —
     * where scoping to the host counts zero and reads as "observing nothing".
     */
    isObserved: (node) => [...live.values()].some((set) => set.has(node)),
    restore: () => Object.assign(IntersectionObserver.prototype, real),
  };
}

/**
 * Make the component believe prefers-reduced-motion is active.
 *
 * Returns the restore function — call it in afterEach, or the stub leaks into
 * every later test in the file and quietly disables their animations too.
 */
export function stubReducedMotion(matches = true) {
  const real = window.matchMedia;
  window.matchMedia = (query) => ({
    matches: query.includes('prefers-reduced-motion') ? matches : false,
    media: query,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
  });
  return () => { window.matchMedia = real; };
}

/**
 * Load a real stylesheet into the page and wait for it.
 *
 * Seven test files hand-rolled this, each as a bare `link.onload` promise
 * awaited in a `before` hook — an unbounded network wait sitting under Mocha's
 * *implicit* 2000ms. Nothing in those files says 2000, so when the fetch loses
 * that race the whole file dies in its hook with "Timeout of 2000ms exceeded"
 * and no mention of a stylesheet. It reads as one arbitrary test failing.
 *
 * Measured, before believing it: across 21 loads at 24 concurrent pages with a
 * cold dev server and the cores otherwise busy, the worst fetch was 91ms. So
 * this cliff is nowhere near — it was a suspect in the flake hunt and it is
 * not the culprit. The deadline stays because an unbounded wait under a limit
 * nothing in the file mentions is worth removing on its own.
 *
 * Cached per page: the nested `before` in font-roles.test.js asks a second
 * time, and one <link> is enough.
 */
const sheets = new Map();

export function loadStylesheet(href, { timeout = 8000 } = {}) {
  if (sheets.has(href)) return sheets.get(href);

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;

  const loaded = new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`${href} did not load within ${timeout}ms — the dev server was slow, not the component`)),
      timeout,
    );
    const settle = (fn, arg) => { clearTimeout(timer); fn(arg); };
    link.onload = () => settle(resolve);
    link.onerror = () => settle(reject, new Error(`${href} failed to load`));
  });

  document.head.appendChild(link);
  sheets.set(href, loaded);
  return loaded;
}

/**
 * `before` hook that loads base.css, for the files whose assertions read tokens
 * that live at `:root` rather than on `:host`.
 *
 * The explicit `this.timeout` is the point: without it Mocha's 2000ms applies
 * and the 8s deadline above can never be reached, so the useful message never
 * gets a chance to print. A slow fetch should make the suite wait, not fail.
 */
export function useBaseCss() {
  before(async function () {
    this.timeout(15000);
    await loadStylesheet('/packages/web-components/src/base.css');
  });
}

/**
 * Wait until an element's box stops moving, then return it.
 *
 * `settle()` is a fixed two-frame wait, which is a guess about how long the
 * browser needs. For an overlay it is a guess about two different things at
 * once: whether PositionController has finished measuring and placing, and
 * whether the entry animation has finished running. arc-context-menu animates
 * in over 100ms — roughly six frames — so a rect read after settle() is read
 * mid-flight, and the value depends on how busy the machine was.
 *
 * That is the flake this repo chased across three sessions. It surfaced twice
 * with different symptoms from the same cause: a delta of ~0 when placement had
 * not started, and a delta 3px off when it had started but had not finished.
 *
 * Polls until two consecutive reads agree, so it costs one extra frame on an
 * idle machine and waits as long as it must on a busy one. Takes a getter, not
 * a node: an overlay is often torn down and rebuilt between opens.
 */
export async function stableRect(getNode, { timeout = 1200, step = 32 } = {}) {
  const deadline = performance.now() + timeout;
  let prev = getNode()?.getBoundingClientRect();

  while (performance.now() < deadline) {
    await wait(step);
    const next = getNode()?.getBoundingClientRect();
    if (!next) return prev;
    if (prev && Math.abs(next.left - prev.left) < 0.5 && Math.abs(next.top - prev.top) < 0.5) {
      return next;
    }
    prev = next;
  }
  return prev;
}
