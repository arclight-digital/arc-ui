import { generateTokensCSS } from '../shared/tokens.js';
import fs from 'node:fs';

const css = generateTokensCSS();
fs.writeFileSync('shared/tokens.css', css);
fs.writeFileSync('packages/web-components/src/tokens.css', css);
console.log('✓ tokens.css generated');
