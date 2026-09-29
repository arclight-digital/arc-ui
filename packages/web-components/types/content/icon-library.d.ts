declare const ArcIconLibrary_base: {
    new (...args: any[]): {
        [x: string]: any;
        connectedCallback(): void;
        shouldUpdate(changed: any): any;
    };
    [x: string]: any;
    [HYDRATING]: boolean;
};
/**
 * Switches the icon set every arc-icon on the page resolves against. Renders nothing itself.
 * Put one anywhere in the document and it applies globally.
 *
 * @tag arc-icon-library
 * @status stable
 * @prop {string} name - Which registered icon library to resolve names against: `phosphor` or `lucide` from `@arclux/arc-ui-icons`, or the name a custom library was registered under.
 */
export declare class ArcIconLibrary extends ArcIconLibrary_base {
    name: string;
    /**
     * A bare string, not `oneOf`, reversing finding #79 on purpose.
     *
     * #79 was that `use()` threw on an unknown name, and this call sits in
     * `connectedCallback`, where a custom-element reaction's exception is
     * *reported globally rather than propagated*: nothing at the call site could
     * catch it, and the element's connect was abandoned partway through.
     * `oneOf(['phosphor', 'lucide'])` normalised the name before `use()` saw it.
     *
     * Since 4.7 `use()` does not throw. Libraries register themselves, so `use()`
     * takes a name whether or not its pack has been imported yet, and `get()`
     * does the complaining, since it can say what *is* registered. The set of
     * valid names is open, and `oneOf` would silently rewrite a consumer's own
     * registered library to `phosphor`: the same blank-icons-and-silence failure
     * #79 was about, aimed at the other end.
     */
    static properties: {
        name: {
            type: StringConstructor;
            reflect: boolean;
        };
    };
    constructor();
    connectedCallback(): void;
    updated(changed: any): void;
    /**
     * An empty `name` selects nothing rather than resetting to a default: the
     * element is inert until it is told a library, and a page that has already
     * chosen one should not have it cleared by an `<arc-icon-library>` that has
     * not been given its attribute yet.
     */
    _select(): void;
    render(): undefined;
}
export {};
