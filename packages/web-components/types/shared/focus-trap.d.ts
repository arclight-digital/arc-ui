/**
 * Collect focusable elements under `node` in composed-tree order.
 * Walks into shadow roots and follows slot assignments.
 */
export declare function collectFocusable(node: any, out?: any[]): any[];
/** The actually-focused element, descending through nested shadow roots. */
export declare function deepActiveElement(): Element | null;
/**
 * Handle a Tab keydown so focus cycles within `container`.
 * Call from the overlay's keydown handler when open.
 */
export declare function trapTabKey(e: any, container: any): void;
/** Focus the first focusable element under `container`, else the container. */
export declare function focusFirst(container: any): void;
