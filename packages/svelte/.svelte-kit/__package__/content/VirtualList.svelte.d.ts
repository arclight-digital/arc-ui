import '@arclux/arc-ui/virtual-list';
import type { Snippet } from 'svelte';
interface Props {
    /** The full data array. Only the visible slice is rendered. */
    items: unknown[];
    /** Renders one row. Called only for rows currently on screen. */
    row: Snippet<[unknown, number]>;
    /** Row height in pixels. Must match what actually renders. */
    itemHeight?: number;
    /** Rows rendered above and below the viewport, to cover fast scrolling. */
    overscan?: number;
    /** Called when the visible range changes. `end` is exclusive. */
    onrangechange?: (range: {
        start: number;
        end: number;
    }) => void;
    class?: string;
    id?: string;
    style?: string;
    [key: `data-${string}`]: unknown;
    [key: `aria-${string}`]: unknown;
}
declare const VirtualList: import("svelte").Component<Props, {}, "">;
type VirtualList = ReturnType<typeof VirtualList>;
export default VirtualList;
