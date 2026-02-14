/**
 * Returns a unicode status icon for the given variant.
 * Shared by Alert and Toast.
 */
export function getStatusIcon(variant) {
  switch (variant) {
    case 'success': return '\u2713';
    case 'warning': return '\u26A0';
    case 'error':   return '\u2717';
    default:        return '\u2139';
  }
}
