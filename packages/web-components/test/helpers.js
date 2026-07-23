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
