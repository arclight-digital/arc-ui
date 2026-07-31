import '@arclux/arc-ui/image-compare';
import type { Snippet } from 'svelte';
interface Props {
    position?: number;
    orientation?: 'horizontal' | 'vertical';
    beforeLabel?: string;
    afterLabel?: string;
    label?: string;
    /** <slot name="after"> — put slot="after" on the element inside. */
    after?: Snippet;
    /** <slot name="before"> — put slot="before" on the element inside. */
    before?: Snippet;
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
declare const ImageCompare: import("svelte").Component<Props, {}, "">;
type ImageCompare = ReturnType<typeof ImageCompare>;
export default ImageCompare;
