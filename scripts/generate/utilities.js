import fs from 'node:fs';
import { generateUtilitiesCSS } from '../../shared/utilities.js';

// Same shape as generate-base-css.js: one source, written to the workspace copy
// and to the package that ships it.
const css = generateUtilitiesCSS();
fs.writeFileSync('shared/utilities.css', css);
fs.writeFileSync('packages/web-components/src/utilities.css', css);

const classes = (css.match(/^\.arc-/gm) || []).length;
console.log(`✓ utilities.css generated (${classes} classes)`);
