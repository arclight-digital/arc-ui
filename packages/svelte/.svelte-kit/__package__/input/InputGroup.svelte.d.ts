import '@arclux/arc-ui/input-group';
import type { Snippet } from 'svelte';
interface Props {
    size?: 'sm' | 'md' | 'lg';
    /** <slot name="prefix"> — put slot="prefix" on the element inside. */
    prefix?: Snippet;
    /** <slot name="suffix"> — put slot="suffix" on the element inside. */
    suffix?: Snippet;
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
declare const InputGroup: import("svelte").Component<Props, {}, "">;
type InputGroup = ReturnType<typeof InputGroup>;
export default InputGroup;
