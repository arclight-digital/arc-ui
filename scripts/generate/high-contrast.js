import fs from 'node:fs';
import { generateHighContrastCSS } from '../../shared/tokens.js';

fs.writeFileSync(
  'packages/web-components/src/themes/high-contrast.css',
  generateHighContrastCSS(),
);
console.log('✓ themes/high-contrast.css generated');
