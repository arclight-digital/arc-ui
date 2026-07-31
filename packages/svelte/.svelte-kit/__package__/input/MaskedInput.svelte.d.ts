import '@arclux/arc-ui/masked-input';
import type { Snippet } from 'svelte';
interface Props {
    mask?: string;
    value?: string;
    placeholderChar?: string;
    label?: string;
    name?: string;
    disabled?: boolean;
    required?: boolean;
    autocomplete?: string;
    error?: string;
    size?: 'sm' | 'md' | 'lg';
    /** <slot name="prefix"> — put slot="prefix" on the element inside. */
    prefix?: Snippet;
    /** <slot name="suffix"> — put slot="suffix" on the element inside. */
    suffix?: Snippet;
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
declare const MaskedInput: import("svelte").Component<Props, {}, "value">;
type MaskedInput = ReturnType<typeof MaskedInput>;
export default MaskedInput;
