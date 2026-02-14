import { tokens, lightTokens, generateTokensCSS } from '../shared/tokens.js';
import fs from 'node:fs';

/* ── 1. Generate tokens.css ── */
const css = generateTokensCSS();
fs.writeFileSync('shared/tokens.css', css);
fs.writeFileSync('packages/web-components/src/tokens.css', css);
console.log('✓ tokens.css generated');

/* ── 2. Generate shiki-themes.js (baked hex values, no runtime token import) ── */
const hex = (rgb) => '#' + rgb.match(/\d+/g).map(n => (+n).toString(16).padStart(2, '0')).join('');

function makeTheme(name, type, c) {
  return {
    name, type,
    colors: {
      'editor.background': hex(c.bgSurface),
      'editor.foreground': hex(c.textSecondary),
    },
    settings: [
      { settings: { foreground: hex(c.textSecondary) } },
      { scope: ['comment', 'punctuation.definition.comment'],
        settings: { foreground: hex(c.textGhost), fontStyle: 'italic' } },
      { scope: ['keyword', 'storage.type', 'storage.modifier'],
        settings: { foreground: hex(c.accentBlue) } },
      { scope: ['string', 'string.quoted'],
        settings: { foreground: hex(c.success) } },
      { scope: ['constant.numeric', 'constant.language'],
        settings: { foreground: hex(c.accentViolet) } },
      { scope: ['entity.name.function', 'support.function'],
        settings: { foreground: hex(c.textPrimary) } },
      { scope: ['variable', 'variable.other', 'variable.parameter'],
        settings: { foreground: hex(c.textSecondary) } },
      { scope: ['entity.name.type', 'support.type', 'entity.name.class'],
        settings: { foreground: hex(c.accentBlue) } },
      { scope: ['punctuation', 'meta.brace'],
        settings: { foreground: hex(c.textMuted) } },
      { scope: ['keyword.operator', 'keyword.operator.assignment'],
        settings: { foreground: hex(c.textMuted) } },
      { scope: ['entity.name.tag'],
        settings: { foreground: hex(c.accentBlue) } },
      { scope: ['entity.other.attribute-name'],
        settings: { foreground: hex(c.accentViolet) } },
      { scope: ['support.class', 'entity.other.inherited-class'],
        settings: { foreground: hex(c.success) } },
      { scope: ['meta.import', 'keyword.control.import', 'keyword.control.from', 'keyword.control.export'],
        settings: { foreground: hex(c.accentBlue) } },
      { scope: ['string.regexp'],
        settings: { foreground: hex(c.warning) } },
      { scope: ['markup.heading'],
        settings: { foreground: hex(c.textPrimary), fontStyle: 'bold' } },
      { scope: ['markup.bold'],
        settings: { fontStyle: 'bold' } },
      { scope: ['markup.italic'],
        settings: { fontStyle: 'italic' } },
      { scope: ['markup.inline.raw', 'markup.fenced_code'],
        settings: { foreground: hex(c.success) } },
    ],
  };
}

const dark  = tokens.color;
const light = { ...tokens.color, ...lightTokens.color };

const shikiSrc = `/* Generated from shared/tokens.js — do not edit by hand */
export const arcDark  = ${JSON.stringify(makeTheme('arc-dark',  'dark',  dark),  null, 2)};
export const arcLight = ${JSON.stringify(makeTheme('arc-light', 'light', light), null, 2)};
`;

fs.writeFileSync('packages/web-components/src/content/shiki-themes.js', shikiSrc);
console.log('✓ shiki-themes.js generated');
