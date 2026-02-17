import { LOGO_SQ } from './assets/logo-geometry.js';

const { cx, cy, coreR, innerR, outerR, arcPath, arcStroke } = LOGO_SQ;

const S = 0.75;
const logoCenterY = 850;
const tx = cx * (1 - S);
const ty = 800 - logoCenterY * S;

/**
 * Build the Arclight favicon SVG string.
 * Shared between the <arclight-favicon> component and the PNG generation script.
 */
export function buildFaviconSvg({ dark = false, bg = '', fg = '' } = {}) {
  let svgStr = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1600">
<style>
  :root { --bg: #0f0f1a; --fg: #e8e8ec; --st: #c8c8d8 }
  @media (prefers-color-scheme: light) { :root { --bg: #f0f0f4; --fg: #1a1a2e; --st: #2a2a3e } }
</style>
<defs>
  <linearGradient id="bg-grad" x1="0" y1="0" x2="1600" y2="1600" gradientUnits="userSpaceOnUse">
    <stop offset="0" stop-color="#0c1e5c"/>
    <stop offset="0.4" stop-color="#1a2d6e"/>
    <stop offset="0.7" stop-color="#1a1a3e"/>
    <stop offset="1" stop-color="#2d1560"/>
  </linearGradient>
  <radialGradient id="vignette" cx="800" cy="700" r="850" gradientUnits="userSpaceOnUse">
    <stop offset="0" stop-color="#000000" stop-opacity="0"/>
    <stop offset="0.7" stop-color="#000000" stop-opacity="0"/>
    <stop offset="1" stop-color="#000000" stop-opacity="0.5"/>
  </radialGradient>
  <filter id="ambient" x="-50%" y="-50%" width="200%" height="200%">
    <feGaussianBlur in="SourceGraphic" stdDeviation="80"/>
  </filter>
  <filter id="core-glow" x="-100%" y="-100%" width="300%" height="300%">
    <feGaussianBlur in="SourceGraphic" stdDeviation="40"/>
  </filter>
  <filter id="arc-glow" x="-30%" y="-30%" width="160%" height="160%">
    <feGaussianBlur in="SourceGraphic" stdDeviation="25"/>
  </filter>
  <radialGradient id="orb1" cx="${cx}" cy="${cy}" r="${outerR}" gradientUnits="userSpaceOnUse" gradientTransform="translate(${tx} ${ty}) scale(${S})">
    <stop offset="0" stop-color="#4d7ef7" stop-opacity="0.45"/>
    <stop offset="0.5" stop-color="#4d7ef7" stop-opacity="0.15"/>
    <stop offset="1" stop-color="#0f0f1a" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="orb2" cx="${cx}" cy="${cy}" r="${innerR}" gradientUnits="userSpaceOnUse" gradientTransform="translate(${tx} ${ty}) scale(${S})">
    <stop offset="0" stop-color="#4d7ef7" stop-opacity="0.4"/>
    <stop offset="0.4" stop-color="#a855f7" stop-opacity="0.15"/>
    <stop offset="1" stop-color="#0f0f1a" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="core" cx="${cx}" cy="${cy}" r="${coreR}" gradientUnits="userSpaceOnUse" gradientTransform="translate(${tx} ${ty}) scale(${S})">
    <stop offset="0" stop-color="#ffffff" stop-opacity="1"/>
    <stop offset="0.3" stop-color="#c8d8ff" stop-opacity="0.95"/>
    <stop offset="0.65" stop-color="#4d7ef7" stop-opacity="0.9"/>
    <stop offset="1" stop-color="#6b6ef7" stop-opacity="0.7"/>
  </radialGradient>
  <linearGradient id="arc-grad" x1="64" y1="1539" x2="1536" y2="1539" gradientUnits="userSpaceOnUse" gradientTransform="translate(${tx} ${ty}) scale(${S})">
    <stop offset="0" stop-color="#4d7ef7" stop-opacity="0.6"/>
    <stop offset="0.5" stop-color="#c8c8d8" stop-opacity="1"/>
    <stop offset="1" stop-color="#a855f7" stop-opacity="0.6"/>
  </linearGradient>
  <linearGradient id="ring1" x1="380" y1="100" x2="1220" y2="920" gradientUnits="userSpaceOnUse" gradientTransform="translate(${tx} ${ty}) scale(${S})">
    <stop offset="0" stop-color="#4d7ef7" stop-opacity="0.5"/>
    <stop offset="0.5" stop-color="#5d8af7" stop-opacity="0.3"/>
    <stop offset="1" stop-color="#a855f7" stop-opacity="0.15"/>
  </linearGradient>
  <linearGradient id="ring2" x1="500" y1="200" x2="1100" y2="820" gradientUnits="userSpaceOnUse" gradientTransform="translate(${tx} ${ty}) scale(${S})">
    <stop offset="0" stop-color="#4d7ef7" stop-opacity="0.5"/>
    <stop offset="0.5" stop-color="#6b6ef7" stop-opacity="0.3"/>
    <stop offset="1" stop-color="#a855f7" stop-opacity="0.15"/>
  </linearGradient>
</defs>
<rect width="1600" height="1600" rx="320" fill="url(#bg-grad)"/>
<rect width="1600" height="1600" rx="320" fill="url(#vignette)"/>
<g transform="translate(${tx} ${ty}) scale(${S})">
  <circle cx="${cx}" cy="${cy}" r="520" fill="#4d7ef7" opacity="0.22" filter="url(#ambient)"/>
  <circle cx="${cx}" cy="${cy}" r="330" fill="#6b6ef7" opacity="0.14" filter="url(#ambient)"/>
  <circle cx="${cx}" cy="${cy}" r="${outerR}" fill="url(#orb1)"/>
  <circle cx="${cx}" cy="${cy}" r="${outerR}" fill="none" stroke="url(#ring1)" stroke-width="12"/>
  <circle cx="${cx}" cy="${cy}" r="${innerR}" fill="url(#orb2)"/>
  <circle cx="${cx}" cy="${cy}" r="${innerR}" fill="none" stroke="url(#ring2)" stroke-width="12"/>
  <circle cx="${cx}" cy="${cy}" r="160" fill="#4d7ef7" opacity="0.55" filter="url(#core-glow)"/>
  <circle cx="${cx}" cy="${cy}" r="100" fill="#5d6ef7" opacity="0.35" filter="url(#core-glow)"/>
  <circle cx="${cx}" cy="${cy}" r="${coreR}" fill="url(#core)"/>
  <path d="${arcPath}" fill="none" stroke="#4d7ef7" stroke-width="${arcStroke}" stroke-linecap="round" opacity="0.3" filter="url(#arc-glow)"/>
  <path d="${arcPath}" fill="none" stroke="url(#arc-grad)" stroke-width="${arcStroke}" stroke-linecap="round"/>
</g>
</svg>`;

  if (bg) {
    svgStr = svgStr.replace(/--bg:\s*#[0-9a-f]+/gi, `--bg: ${bg}`);
  }
  if (fg) {
    svgStr = svgStr.replace(/--fg:\s*#[0-9a-f]+/gi, `--fg: ${fg}`);
    svgStr = svgStr.replace(/--st:\s*#[0-9a-f]+/gi, `--st: ${fg}`);
  }
  if (dark) {
    svgStr = svgStr.replace(/@media\s*\(prefers-color-scheme:\s*light\)\s*\{[^}]*\{[^}]*\}\s*\}/g, '');
  }

  return svgStr;
}
