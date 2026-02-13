import { LitElement } from 'lit';
import { iconRegistry } from './icon-registry.js';

export class ArcIconLibrary extends LitElement {
  static properties = {
    name: { type: String, reflect: true },
  };

  constructor() {
    super();
    this.name = 'phosphor';
  }

  connectedCallback() {
    super.connectedCallback();
    iconRegistry.use(this.name);
  }

  updated(changed) {
    if (changed.has('name')) {
      iconRegistry.use(this.name);
    }
  }

  render() {
    return undefined;
  }
}

customElements.define('arc-icon-library', ArcIconLibrary);
