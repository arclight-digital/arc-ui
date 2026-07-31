import { generateTokensCSS } from '../../shared/tokens.js';
import { findComponentTags } from '../lib/component-tags.js';
import fs from 'node:fs';

// Tags come from the component sources so the :not(:defined) guard stays scoped
// to elements ARC actually defines — see renderUndefinedGuard in tokens.js.
const css = generateTokensCSS({ tags: findComponentTags() });
fs.writeFileSync('shared/base.css', css);
fs.writeFileSync('packages/web-components/src/base.css', css);
console.log('✓ base.css generated');
