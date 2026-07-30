import '@arclux/arc-ui/label';
import type { Snippet } from 'svelte';
interface Props {
    for?: string;
    required?: boolean;
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    /** <slot name="tooltip"> — put slot="tooltip" on the element inside. */
    tooltip?: Snippet;
    /** <slot name="description"> — put slot="description" on the element inside. */
    description?: Snippet;
    children?: Snippet;
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
declare const Label: import("svelte").Component<Props, {}, "">;
type Label = ReturnType<typeof Label>;
export default Label;
