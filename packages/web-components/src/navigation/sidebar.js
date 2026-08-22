import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { hydrateSlots } from '../shared/hydrate-slots.js';
import { DeclaredPropsMixin, flag, oneOf } from '../shared/props.js';

/**
 * Collapsible navigation sidebar with grouped sections, heading labels, and active link
 * highlighting. Ideal for documentation sites, admin panels, and any layout that needs persistent
 * vertical navigation.
 *
 * @tag arc-sidebar
 * @status stable
 * @requires arc-sidebar-section
 * @requires arc-sidebar-link
 * @requires arc-icon
 * @prop {'left' | 'right'} position - Controls which side the sidebar appears on. Moves the border line to the opposite edge.
 * @prop {string} active - The href of the currently active sidebar link. Used to highlight the matching link with accent styling.
 * @prop {boolean} collapsed - When true, collapses the sidebar away entirely: width 0 with its contents clipped, which is the right behaviour for a rail that slides out of the way but is not an icon-only mode. For a persistent icon rail — the VS Code activity-bar shape — use `arc-rail`, which is a different component with its own labels and tooltips.
 * @prop {string} width - Width of the sidebar. Accepts any CSS length value. Unset by default, which lets the rail fill whatever container it is placed in — including `arc-app-shell`, whose own rail is 280px wide and reads `--sidebar-width`. Set this only for a standalone sidebar; inside the shell the wrapper wins, and the token is the way to move both together.
 * @prop {boolean} glow - Enables an accent glow effect on the active sidebar link for enhanced visual emphasis.
 * @fires arc-navigate - Fired when a sidebar link is clicked
 * @slot - Default content.
 * @csspart base - The root element.
 * @csspart sidebar
 * @csspart section
 * @csspart toggle
 * @csspart heading
 * @csspart links
 * @csspart link
 * @csspart link-icon
 * @csspart heading-icon
 */
export class ArcSidebar extends DeclaredPropsMixin(LitElement) {
  static properties = {
    active: { type: String, reflect: true },
    collapsed: flag(false),
    position: oneOf(['left', 'right']),
    width: { type: String },
    glow: flag(false),
    label: { type: String },
    _sections: { state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        /* grid, not block: the one visible child is .sidebar, and a grid item
           stretches to the host box. It used to reach full height through
           .sidebar { min-height: 100% }, which resolves against the host's
           *height* — definite when the sidebar stands alone, auto inside
           arc-app-shell, whose ::slotted rule forces it. So the rail filled the
           page everywhere except the layout it ships with. Finding #91. */
        display: grid;
        /* The ambient wash behind the rail. Inputs on :host because that is
           where the shape token is declared — see shared/tokens.js. */
        --lobe-rgb: var(--accent-primary-rgb);
        --lobe-alpha: 0.03;
        --lobe-extent: 60%;
        --lobe-shape: ellipse at 100% 10%;
        position: sticky;
        top: var(--nav-height);
        height: calc(100vh - var(--nav-height));
        /* Declared, defaulted to 280px, and read by nothing: no styleMap, no
           custom property, no :host([width]) selector. The 280px a consumer
           saw came from .shell__sidebar in arc-app-shell, so the prop appeared
           to work right up until someone passed a different value, at which
           point it was silently ignored. Finding #92. */
        width: var(--_width, auto);
        overflow-y: auto;
        overflow-x: hidden;
        scrollbar-width: thin;
        scrollbar-color: var(--border-default) transparent;
      }

      :host([collapsed]) { width: 0; overflow: hidden; }

      .sidebar {
        display: flex;
        flex-direction: column;
        gap: var(--space-md);
        padding: var(--space-lg);
        position: relative;
        box-sizing: border-box;
      }

      /* Ambient glow — faint accent bleed from the right edge */
      :host([glow]) .sidebar::before {
        content: '';
        position: absolute;
        top: 0;
        inset-inline-end: 0;
        width: 80%;
        height: 50%;
        background: var(--lobe-ambient);
        pointer-events: none;
      }

      /* Border line — solid default (right edge) */
      .sidebar::after {
        content: '';
        position: absolute;
        top: 0;
        inset-inline-end: 0;
        bottom: 0;
        width: 1px;
        background: var(--divider);
      }

      /* Right position — border on left edge */
      :host([position="right"]) .sidebar::after {
        right: auto;
        left: 0;
      }

      /* Mirrored: the wash comes from the edge the rail is docked to. On :host
         with the other inputs — see shared/tokens.js. */
      :host([position="right"]) { --lobe-shape: ellipse at 0% 10%; }
      :host([position="right"][glow]) .sidebar::before {
        right: auto;
        left: 0;
      }

      /* Glow border variant */
      :host([glow]) .sidebar::after {
        background: var(--glow-line-blue);
        opacity: 0.6;
      }

      /* ── Section ── */
      .sidebar__section {
        display: flex;
        flex-direction: column;
      }

      /* ── Static heading (non-collapsible) ── */
      /* The gradient lives on the inner text span, not here: background-clip
         text with a transparent fill clips every descendant, so an icon placed
         inside a gradient-painted box renders as nothing at all. */
      .sidebar__heading {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        font-family: var(--font-label);
        font-weight: var(--font-label-weight, 600);
        font-size: var(--_text-xs);
        letter-spacing: var(--label-spacing);
        text-transform: uppercase;
        padding: var(--space-sm);
        margin-bottom: var(--space-xs);
      }

      .sidebar__heading-text {
        background: var(--gradient-accent-text);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      /* Headings read as one rank, so their icons stay quieter than the link
         icons below them rather than competing for the same attention. */
      .sidebar__heading-icon {
        color: var(--text-ghost);
        flex-shrink: 0;
        -webkit-text-fill-color: unset;
      }

      /* ── Collapsible heading (toggle) ── */
      .sidebar__toggle {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        font-family: var(--font-label);
        font-weight: var(--font-label-weight, 600);
        font-size: var(--_text-xs);
        letter-spacing: var(--label-spacing);
        text-transform: uppercase;
        padding: var(--space-sm);
        margin-bottom: 2px; /* cosmetic micro-spacing */
        border-radius: var(--radius-sm);
        border: none;
        background: none;
        cursor: pointer;
        user-select: none;
        transition: background var(--transition-fast);
        width: 100%;
        text-align: start;
      }

      .sidebar__toggle:hover {
        background: var(--surface-hover);
        box-shadow: var(--interactive-hover);
      }

      .sidebar__toggle:focus-visible {
        outline: none;
        box-shadow: var(--interactive-focus);
      }

      .sidebar__toggle-label {
        background: var(--gradient-accent-text);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .sidebar__toggle-count {
        font-family: var(--font-mono);
        font-size: var(--_text-xs);
        font-weight: var(--font-mono-weight, 400);
        letter-spacing: normal;
        color: var(--text-ghost);
        -webkit-text-fill-color: var(--text-ghost);
        margin-inline-start: auto;
      }

      .sidebar__chevron {
        color: var(--text-ghost);
        flex-shrink: 0;
        transition: transform var(--transition-fast);
        -webkit-text-fill-color: unset;
      }

      .sidebar__chevron--closed {
        transform: rotate(-90deg);
      }

      /* ── Links container ── */
      /* The links sit a step inside their heading, and the rail marks the group
         they belong to. Structural and neutral by rule: one flat --divider that
         never takes a color, a weight or a state from whichever link is
         active. A left edge that tracks the current item is banned outright —
         the active row says "here" with tint and accent text, as everywhere
         else in the system. */
      .sidebar__links {
        display: flex;
        flex-direction: column;
        gap: 1px;
        margin-inline-start: var(--space-sm);
        padding-inline-start: var(--space-sm);
        border-inline-start: 1px solid var(--divider);
      }

      .sidebar__links--hidden {
        display: none;
      }

      /* ── Link ── */
      .sidebar__link {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-family: var(--font-body);
        font-size: var(--_text-sm);
        font-weight: var(--field-weight, 400);
        color: var(--text-muted);
        text-decoration: none;
        /* Logical, now that the container carries the indent. The four-value
           shorthand this replaces ended in a physical padding-left, which put
           the inset on the wrong edge in RTL. */
        padding-block: var(--touch-pad);
        padding-inline: var(--nav-row-inset) var(--space-md);
        border-radius: var(--radius-sm);
        cursor: pointer;
        transition:
          color var(--transition-fast),
          background var(--transition-fast),
          box-shadow var(--transition-fast);
        border: none;
        background: none;
        text-align: start;
      }

      .sidebar__link-body {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        min-width: 0;
      }

      /* Heading and link glyphs match in size; what separates the two ranks is
         the heading's uppercase gradient text and the ghosted heading icon
         against the link icon's willingness to take the accent when active. */
      .sidebar__heading-icon,
      .sidebar__link-icon {
        flex-shrink: 0;
      }

      /* Ghosted by default so the label stays the thing being read; the icon is
         a landmark you find on the second pass, not competition for the first. */
      .sidebar__link-icon {
        color: var(--text-ghost);
        flex-shrink: 0;
        transition: color var(--transition-fast);
      }

      .sidebar__link:hover .sidebar__link-icon {
        color: var(--text-secondary);
      }

      .sidebar__link[aria-current="page"] .sidebar__link-icon {
        color: var(--interactive);
      }

      .sidebar__link-arrow {
        opacity: 0;
        color: var(--text-ghost);
        font-size: var(--_text-sm);
        flex-shrink: 0;
        transition: opacity var(--transition-fast), transform var(--transition-fast), color var(--transition-fast);
        transform: translateX(-2px);
      }

      /* The external marker is the one arrow that does not wait for a hover.
         Its job is to warn you where the link goes *before* you commit to it,
         and a glyph that only appears once the pointer is already there has
         missed the moment. Ghosted rather than hidden, so it reads as a
         property of the destination and not as an active state. */
      .sidebar__link-arrow--external {
        opacity: 0.55;
        transform: none;
      }

      .sidebar__link:hover .sidebar__link-arrow {
        opacity: 1;
        transform: translateX(0);
        color: var(--text-secondary);
      }

      .sidebar__link[aria-current="page"] .sidebar__link-arrow {
        opacity: 1;
        transform: translateX(0);
        color: var(--interactive);
      }

      /* Before the active rule: equal specificity, so the later selector wins,
         and a nested link that was the current page rendered ghost-grey. */
      .sidebar__link--nested {
        font-size: var(--_text-xs);
        color: var(--text-ghost);
      }


      .sidebar__link:hover {
        color: var(--text-primary);
        background: var(--surface-hover);
        box-shadow: inset 2px 0 6px rgba(var(--interactive-rgb), 0.08);
      }

      /* Active link */
      .sidebar__link[aria-current="page"] {
        color: var(--interactive);
        background: var(--accent-primary-subtle);
        font-weight: var(--font-body-weight, 500);
      }

      :host([glow]) .sidebar__link[aria-current="page"] {
        box-shadow: inset 6px 0 12px -6px rgba(var(--interactive-rgb), 0.15);
      }

      .sidebar__link:focus-visible {
        outline: none;
        box-shadow: var(--interactive-focus);
      }

      .sidebar__slot-host { display: none; }
    `,
  ];

  constructor() {
    super();
    this.active = '';
    // Empty, not '280px'. The old default described the shell's rail rather
    // than this component's own behaviour, which is to fill its container —
    // and a default nothing applied was indistinguishable from one that did.
    this.width = '';
    this.label = 'Sidebar navigation';
    this._sections = [];
  }

  _onSlotChange(e) {
    this._sections = e.target
      .assignedElements({ flatten: true })
      .filter((el) => el.tagName === 'ARC-SIDEBAR-SECTION');
    this.requestUpdate();
  }

  _handleClick(e, href) {
    this.active = href;
    const nav = new CustomEvent('arc-navigate', {
      detail: { href },
      bubbles: true,
      composed: true,
      cancelable: true,
    });
    this.dispatchEvent(nav);
    // If a listener handled navigation (e.g. SPA router), prevent the <a> default
    if (nav.defaultPrevented) {
      e.preventDefault();
    }
  }

  _toggleSection(section) {
    section.toggle();
    this.requestUpdate();
  }

  /** The slotchange DSD swallows — see shared/hydrate-slots.js. */
  updated(changed) {
    if (changed.has('width')) {
      this.style.setProperty('--_width', this.width || 'auto');
    }
  }

  firstUpdated() {
    hydrateSlots(this);
  }

  render() {
    return html`
      <div part="base" class="sidebar__slot-host">
        <slot @slotchange=${this._onSlotChange}></slot>
      </div>
      <nav class="sidebar" part="sidebar" aria-label=${this.label}>
        ${this._sections.map((section) => {
          const links = section.links;
          const isCollapsible = section.collapsible;
          const isOpen = section.open;

          return html`
            <div class="sidebar__section" part="section">
              ${
                section.heading
                  ? isCollapsible
                    ? html`
                    <button
                      class="sidebar__toggle"
                      @click=${() => this._toggleSection(section)}
                      aria-expanded=${String(isOpen)}
                      part="toggle"
                    >
                      ${
                        section.icon
                          ? html`<arc-icon class="sidebar__heading-icon" part="heading-icon" name=${section.icon} size="sm"></arc-icon>`
                          : ''
                      }
                      <span class="sidebar__toggle-label">${section.heading}</span>
                      <span class="sidebar__toggle-count">${links.length}</span>
                      <svg class="sidebar__chevron ${isOpen ? '' : 'sidebar__chevron--closed'}" viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
                        <path d="M4.5 6L8 9.5L11.5 6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </button>`
                    : html`
                    <div class="sidebar__heading" part="heading">
                      ${
                        section.icon
                          ? html`<arc-icon class="sidebar__heading-icon" part="heading-icon" name=${section.icon} size="sm"></arc-icon>`
                          : ''
                      }
                      <span class="sidebar__heading-text">${section.heading}</span>
                    </div>`
                  : ''
              }
              <div class="sidebar__links ${!isOpen && isCollapsible ? 'sidebar__links--hidden' : ''}" part="links">
                ${links.map((link) => {
                  const level = link.level || 0;
                  return html`
                  <a
                    class="sidebar__link ${level > 0 ? 'sidebar__link--nested' : ''}"
                    href=${link.resolvedHref}
                    aria-current=${this.active === link.resolvedHref || link.active ? 'page' : 'false'}
                    @click=${(e) => this._handleClick(e, link.resolvedHref)}
                    part="link"
                    style=${
                      level > 0
                        ? `padding-inline-start: calc(var(--nav-row-inset) + ${level * 12}px)`
                        : ''
                    }
                  >
                    <span class="sidebar__link-body">
                      ${
                        link.icon
                          ? html`<arc-icon class="sidebar__link-icon" part="link-icon" name=${link.icon} size="sm"></arc-icon>`
                          : ''
                      }
                      <span>${link.label}</span>
                    </span>
                    ${
                      link.external
                        ? html`
                        <svg class="sidebar__link-arrow sidebar__link-arrow--external" viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
                          <path d="M6.5 3H3.5A0.5 0.5 0 003 3.5v9a0.5 0.5 0 00.5.5h9a0.5 0.5 0 00.5-.5v-3" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                          <path d="M9.5 2.5H13.5V6.5M13.5 2.5L7.5 8.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>`
                        : html`
                        <svg class="sidebar__link-arrow" viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
                          <path d="M6 4L10 8L6 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>`
                    }
                  </a>
                `;
                })}
              </div>
            </div>
          `;
        })}
      </nav>
    `;
  }
}
