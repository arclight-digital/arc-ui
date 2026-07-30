import '@arclux/arc-ui/input';
import type { Snippet } from 'svelte';
interface Props {
    type?: 'text' | 'email' | 'tel' | 'url' | 'password';
    name?: string;
    label?: string;
    placeholder?: string;
    value?: string;
    disabled?: boolean;
    required?: boolean;
    error?: string;
    size?: 'sm' | 'md' | 'lg';
    multiline?: boolean;
    rows?: number;
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
declare const Input: import("svelte").Component<Props, {}, "value">;
type Input = ReturnType<typeof Input>;
export default Input;
