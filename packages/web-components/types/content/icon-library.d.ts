declare const ArcIconLibrary_base: {
    new (...args: any[]): {
        [x: string]: any;
        connectedCallback(): void;
    };
    [x: string]: any;
};
/**
 * Switches the icon set every arc-icon on the page resolves against. Renders nothing itself —
 * put one anywhere in the document and it applies globally.
 *
 * @tag arc-icon-library
 * @status stable
 * @prop {'phosphor' | 'lucide'} name - Which icon library to resolve names against. An unrecognised value falls back to `phosphor`.
 */
export declare class ArcIconLibrary extends ArcIconLibrary_base {
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
    static properties: {
        name: {
            type: NumberConstructor | StringConstructor;
            reflect: boolean;
            attribute?: any;
            arc: {
                kind: string;
                values: string[];
                default: string;
                derived: boolean;
                numeric: boolean;
            };
        };
    };
    connectedCallback(): void;
    updated(changed: any): void;
    /** `name`, guaranteed to be a library `use()` accepts. */
    get _resolvedName(): "lucide" | "phosphor";
    render(): undefined;
}
export {};
