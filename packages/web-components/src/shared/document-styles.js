/**
 * Styles a component needs outside its shadow root, once per root.
 *
 * A component with light-DOM content its own ::slotted() rules can't reach
 * (arc-prose's list items and inline code) declares `static documentStyles`,
 * a CSS string. This puts it in the document, or in the shadow root the
 * element lives in, the first time an instance connects there. The server
 * renderer emits the same string, under the same attribute, into the page it
 * renders (ssr.js), and the check below finds it and adds nothing.
 */
export const DOCUMENT_STYLES_ATTR = 'data-arc-document-styles';

export function adoptDocumentStyles(element) {
  const css = element.constructor.documentStyles;
  if (!css) return;
  const root = element.getRootNode();
  const target = root instanceof ShadowRoot ? root : document.head;
  if (!target) return;
  const tag = element.localName;
  if (target.querySelector(`style[${DOCUMENT_STYLES_ATTR}="${tag}"]`)) return;
  // A server-rendered page puts it in <head>; a component inside a shadow
  // root still finds it there only if the root is the document.
  if (root === document && document.querySelector(`style[${DOCUMENT_STYLES_ATTR}="${tag}"]`))
    return;
  const style = document.createElement('style');
  style.setAttribute(DOCUMENT_STYLES_ATTR, tag);
  style.textContent = css;
  target.append(style);
}
