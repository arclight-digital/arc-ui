import { generateTokensCSS } from '../shared/tokens.js';
import fs from 'node:fs';

const css = generateTokensCSS();
fs.writeFileSync('shared/base.css', css);
fs.writeFileSync('packages/web-components/src/base.css', css);
console.log('✓ base.css generated');
