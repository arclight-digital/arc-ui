import { LitElement } from 'lit';
/**
 * @tag arc-icon-library
 */
export declare class ArcIconLibrary extends LitElement {
    name: string;
    static properties: {
        name: {
            type: StringConstructor;
            reflect: boolean;
        };
    };
    constructor();
    connectedCallback(): void;
    updated(changed: any): void;
    render(): undefined;
}
