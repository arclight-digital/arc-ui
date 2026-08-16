/**
 * Returns a unicode status icon for the given variant.
 * Shared by Alert and Toast.
 */
export function getStatusIcon(variant) {
  switch (variant) {
    case 'success':
      return '\u2713';
    case 'warning':
      return '\u26A0';
    case 'error':
      return '\u2717';
    // Absorbed from arc-callout with the `tip` variant (4.2). It shares the
    // success color ramp — statusVars has said so since v2 — but not its icon:
    // a tick means "this worked", and a tip has not happened.
    //
    // A geometric mark rather than the light bulb arc-callout drew, because the
    // other four here are unicode symbols that inherit `color` and U+1F4A1 is an
    // emoji that would render in its own palette at its own weight. Consumers
    // who want the bulb slot their own icon in — which is the other thing this
    // merge brought over from arc-callout.
    case 'tip':
      return '\u2726';
    default:
      return '\u2139';
  }
}
