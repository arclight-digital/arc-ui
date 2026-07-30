import '@arclux/arc-ui/empty-state';
import type { Snippet } from 'svelte';
interface Props {
    heading?: string;
    description?: string;
    /** <slot name="icon"> — put slot="icon" on the element inside. */
    icon?: Snippet;
    /** <slot name="actions"> — put slot="actions" on the element inside. */
    actions?: Snippet;
    class?: string;
    id?: string;
    style?: string;
    title?: string;
    role?: string;
    slot?: string;
    part?: string;
    exportparts?: string;
    dir?: string;
    lang?: string;
    translate?: string;
    accesskey?: string;
    enterkeyhint?: string;
    inputmode?: string;
    popover?: string;
    contenteditable?: boolean | string;
    tabindex?: number;
    hidden?: boolean;
    inert?: boolean;
    draggable?: boolean;
    spellcheck?: boolean;
    autofocus?: boolean;
    [key: `data-${string}`]: unknown;
    [key: `aria-${string}`]: unknown;
    [key: `on${string}`]: unknown;
}
declare const EmptyState: import("svelte").Component<Props, {}, "">;
type EmptyState = ReturnType<typeof EmptyState>;
export default EmptyState;
