import { LitElement } from 'lit';
import { iconRegistry } from './icon-registry.js';
import { DeclaredPropsMixin, oneOf } from '../shared/props.js';

/**
 * Switches the icon set every arc-icon on the page resolves against. Renders nothing itself —
 * put one anywhere in the document and it applies globally.
 *
 * @tag arc-icon-library
 * @status stable
 * @prop {'phosphor' | 'lucide'} name - Which icon library to resolve names against. An unrecognised value falls back to `phosphor`.
 */
export class ArcIconLibrary extends DeclaredPropsMixin(LitElement) {
  /**
   * Declared rather than a bare `{ type: String }` — finding #79. `use()`
   * throws on anything it does not know, and the call sits in
   * `connectedCallback`, where a custom-element reaction's exception is
   * *reported globally rather than propagated*: `<arc-icon-library
   * name="feather">` raised during element upgrade, nothing at the call site
   * could catch it, and the element's connect was abandoned partway through.
   * `oneOf` normalises the typo to the default instead, which is what every
   * other enum in the library already does.
   */
  static properties = {
    name: oneOf(['phosphor', 'lucide']),
  };

  connectedCallback() {
    super.connectedCallback();
    // Normalisation runs in the mixin's hostUpdate, which is *after* connect —
    // so read the declared contract directly rather than trusting the raw
    // property on this one call.
    iconRegistry.use(this._resolvedName);
  }

  updated(changed) {
    if (changed.has('name')) {
      iconRegistry.use(this._resolvedName);
    }
  }

  /** `name`, guaranteed to be a library `use()` accepts. */
  get _resolvedName() {
    return this.name === 'lucide' ? 'lucide' : 'phosphor';
  }

  render() {
    return undefined;
  }
}
