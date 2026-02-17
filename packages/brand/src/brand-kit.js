import { brandColors } from './brand-palette.js';

export { brandColors };

export const brandAssets = [
  {
    name: 'Logo (small)',
    filename: 'logo-sm.svg',
    description: 'Compact logo for inline use, favicons, and small spaces',
    category: 'logo',
  },
  {
    name: 'Logo (large)',
    filename: 'logo-lg.svg',
    description: 'Full-size logo with gradient rings for hero sections',
    category: 'logo',
  },
  {
    name: 'Logo Square (small)',
    filename: 'logo-sq-sm.svg',
    description: 'Square-cropped logo for favicons and app icons',
    category: 'logo',
  },
  {
    name: 'Logo Square (large)',
    filename: 'logo-sq-lg.svg',
    description: 'Square-cropped logo, large version',
    category: 'logo',
  },
  {
    name: 'Wordmark',
    filename: 'wordmark.svg',
    description: 'ARCLIGHT text wordmark with outlined letterforms',
    category: 'wordmark',
  },
  {
    name: 'Logo + Wordmark (inline)',
    filename: 'logo-wordmark-inline.svg',
    description: 'Horizontal lockup — logo left, wordmark right',
    category: 'lockup',
  },
  {
    name: 'Logo + Wordmark (stacked)',
    filename: 'logo-wordmark-stacked.svg',
    description: 'Vertical lockup — logo top, wordmark bottom',
    category: 'lockup',
  },
];

export const brandFonts = {
  display: { family: 'Tektur', weight: '400 900', usage: 'Headings, labels, badges' },
  body: { family: 'Host Grotesk', weight: '100 900', usage: 'Body text, wordmark' },
};
