import '@arclux/arc-ui/auth-shell';
import type { Snippet } from 'svelte';
interface Props {
    variant?: 'centered' | 'split';
    /** <slot name="logo"> — put slot="logo" on the element inside. */
    logo?: Snippet;
    /** <slot name="footer"> — put slot="footer" on the element inside. */
    footer?: Snippet;
    /** <slot name="aside"> — put slot="aside" on the element inside. */
    aside?: Snippet;
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
declare const AuthShell: import("svelte").Component<Props, {}, "">;
type AuthShell = ReturnType<typeof AuthShell>;
export default AuthShell;
