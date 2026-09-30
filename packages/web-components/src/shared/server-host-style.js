import { isServer } from 'lit';

/**
 * On the server, write inline styles onto the host's `style` attribute.
 *
 * Some components size or place their own host from a prop: arc-icon's
 * numeric `size`, arc-center's `max-width`, arc-sticky's `offset`,
 * arc-sidebar's `width`. In the browser they set `this.style` from
 * updated(), which the server never runs, so a server-rendered one kept its
 * default box until its script arrived. The server does run willUpdate, and
 * lit-ssr writes the host's attributes after it, so a component calls this
 * from willUpdate and the declarations arrive in the page. It does nothing in
 * the browser, where updated() goes on doing the work.
 *
 * @param {HTMLElement} host
 * @param {Record<string, string | null | undefined>} declarations Property
 *   (a custom property or a CSS property name) to value; empty values skip.
 */
export function serverHostStyle(host, declarations) {
  if (!isServer) return;
  const set = Object.entries(declarations).filter(
    ([, v]) => v !== null && v !== undefined && v !== '',
  );
  if (!set.length) return;
  const existing = (host.getAttribute('style') ?? '').trim();
  const joined = set.map(([k, v]) => `${k}: ${v}`).join('; ');
  host.setAttribute('style', existing ? `${existing.replace(/;?$/, ';')} ${joined}` : joined);
}
