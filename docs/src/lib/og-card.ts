/**
 * og-card.ts — shared satori scaffolding for every OG image on the site.
 *
 * The homepage card (src/pages/og-image.png.ts) and the per-page cards
 * (src/pages/og/[card].png.ts) both build on the primitives here so the
 * background treatment, chrome, and fonts stay identical across all cards.
 */
import satori from 'satori';
import sharp from 'sharp';
import fs from 'node:fs';
import { tokens } from '../../../shared/tokens.js';
import { version } from '../data/site-stats';

/* The docs site is not the library's default theme. global.css overrides
   --accent-secondary to teal for this site, so the palette people actually
   see is blue → teal — while tokens.color.accentSecondary is the library
   default, violet. Reading the library token here painted every card in a
   colour the site never shows, and then hardcoded teal beside it, so the
   cards carried three accents to the site's two.
   Parsed rather than copied, for the same reason site-stats derives its
   numbers: a constant here would drift the first time the theme moved. */
function docsAccentSecondary(): { hex: string; rgb: string } {
  const css = fs.readFileSync('src/styles/global.css', 'utf-8');
  const rgb = css.match(/:root\s*\{[^}]*--accent-secondary-rgb:\s*([\d,\s]+);/)?.[1];
  if (!rgb) throw new Error('og-card: no --accent-secondary-rgb in global.css :root');
  const parts = rgb.split(',').map((n) => Number(n.trim()));
  return {
    hex: `rgb(${parts.join(', ')})`,
    rgb: parts.join(','),
  };
}

const secondary = docsAccentSecondary();

export const blue = tokens.color.accentPrimary;
export const blueRgb = tokens.rgb.accentPrimary;
export const teal = secondary.hex;
export const tealRgb = secondary.rgb;

type Node = { type: string; props: Record<string, unknown> };

// Generate dot grid — brighter near center, fading to edges
export function dotGrid(cols: number, rows: number, spacing: number, offsetX: number, offsetY: number) {
  const dots: Node[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cx = (c - cols / 2) / (cols / 2);
      const cy = (r - rows / 2) / (rows / 2);
      const dist = Math.sqrt(cx * cx + cy * cy);
      const opacity = Math.max(0, 0.18 - dist * 0.12);
      if (opacity < 0.02) continue;

      dots.push({
        type: 'div',
        props: {
          style: {
            position: 'absolute',
            left: `${offsetX + c * spacing}px`,
            top: `${offsetY + r * spacing}px`,
            width: '2px',
            height: '2px',
            borderRadius: '50%',
            background: `rgba(255,255,255,${opacity})`,
          },
        },
      });
    }
  }
  return dots;
}

function layer(background: string): Node {
  return {
    type: 'div',
    props: {
      style: { position: 'absolute', top: '0', left: '0', width: '100%', height: '100%', background },
    },
  };
}

/* The hero's light, without the hero's tunnel.

   Streaks radiating from a vanishing point were tried here and taken out.
   The tunnel reads as depth on the site because it moves and because the
   canvas blooms it; satori has neither — no filters, no animation — so what
   survives the render is thin diagonal lines across the type, which is
   scratches, not depth. The parts of the treatment that do survive a static
   render are the colour and the falloff, and those are what is left.

   The lobes are the site's, at the site's positions — blue from the left,
   teal from the lower right, and the floor glow the whole thing sits on. The
   card used to light its own corners instead (10% 10%, 90% 90%), which put
   the brightest pixels exactly where a social platform crops and rounds.

   Gone too: the 1px accent border and the coloured top and bottom edge
   glows, which framed the card like a component demo. The only frame left is
   a neutral hairline, so the card does not dissolve into a dark timeline. */
export function backgroundLayers(): Node[] {
  return [
    ...dotGrid(40, 22, 30, 0, 0),
    // Ambient — blue from the left
    layer(`radial-gradient(ellipse 80% 62% at 20% 38%, rgba(${blueRgb},0.2) 0%, transparent 70%)`),
    // Ambient — teal from the lower right
    layer(`radial-gradient(ellipse 62% 80% at 82% 58%, rgba(${tealRgb},0.18) 0%, transparent 70%)`),
    // The floor it sits on
    layer(`radial-gradient(ellipse 64% 34% at 50% 102%, rgba(${blueRgb},0.14) 0%, transparent 64%)`),
    /* The dark middle. Same shape as the hero's, and the same reason for the
       stop list: a ramp that ends abruptly leaves a corner in the curve that
       reads as an ellipse drawn on the card, so this one is still falling at
       every radius and reaches nothing exactly where it runs out. */
    layer(
      'radial-gradient(ellipse 62% 58% at 50% 42%,' +
        ' rgba(3,3,7,0.72) 0%,' +
        ' rgba(3,3,7,0.42) 38%,' +
        ' rgba(3,3,7,0.16) 66%,' +
        ' rgba(3,3,7,0.04) 84%,' +
        ' transparent 100%)',
    ),
    // Settles the card into a dark feed rather than framing it
    {
      type: 'div',
      props: {
        style: {
          position: 'absolute',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          border: '1px solid rgba(255,255,255,0.07)',
        },
      },
    },
  ];
}

/** arcui.dev top-left + version badge top-right. */
export function chrome(): Node[] {
  return [
    {
      type: 'div',
      props: {
        style: {
          position: 'absolute',
          top: '18px',
          right: '24px',
          display: 'flex',
          alignItems: 'center',
          padding: '7px 20px',
          borderRadius: tokens.radius.full,
          border: `1px solid rgba(${blueRgb},0.3)`,
          background: `rgba(${blueRgb},0.08)`,
          fontSize: '22px',
          fontWeight: 600,
          fontFamily: 'Host Grotesk',
          color: blue,
        },
        children: `v${version}`,
      },
    },
    {
      type: 'div',
      props: {
        style: {
          position: 'absolute',
          top: '24px',
          left: '24px',
          fontSize: '22px',
          fontWeight: 400,
          fontFamily: 'Host Grotesk',
          letterSpacing: '1px',
          color: 'rgba(255,255,255,0.45)',
        },
        children: 'arcui.dev',
      },
    },
  ];
}

// Font buffers are cached across the whole build (177+ pages hit this).
let fontsCache: { name: string; data: Buffer; weight?: number; style: 'normal' }[] | null = null;
export function loadFonts() {
  if (!fontsCache) {
    // cwd-relative (build runs from docs/): import.meta.url would resolve
    // inside dist/ once this module is bundled.
    const font = (file: string) => fs.readFileSync(`public/fonts/${file}`);
    fontsCache = [
      { name: 'Host Grotesk', data: font('hostgrotesk-latin.ttf'), weight: 400, style: 'normal' },
      { name: 'Host Grotesk', data: font('hostgrotesk-800-latin.ttf'), weight: 800, style: 'normal' },
      { name: 'Tomorrow', data: font('tomorrow-600-latin.ttf'), weight: 600, style: 'normal' },
    ];
  }
  return fontsCache;
}

/** Render a full 1200×630 card (background + chrome + content) to PNG. */
export async function renderCard(content: Node[]): Promise<Buffer> {
  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: tokens.color.bgDeep,
          position: 'relative',
        },
        children: [...backgroundLayers(), ...content, ...chrome()],
      },
    },
    { width: 1200, height: 630, fonts: loadFonts() },
  );
  return sharp(Buffer.from(svg)).png().toBuffer();
}

/** Trim a long description to something that fits a social card. */
function clampText(text: string, max = 170): string {
  if (text.length <= max) return text;
  const firstSentence = text.match(/^[^.!?]+[.!?]/)?.[0];
  if (firstSentence && firstSentence.length <= max) return firstSentence;
  const cut = text.slice(0, max);
  return `${cut.slice(0, cut.lastIndexOf(' '))}…`;
}

function titleFontSize(title: string): number {
  if (title.length <= 12) return 118;
  if (title.length <= 18) return 94;
  return 74;
}

export interface KickerPill {
  text: string;
  accent?: 'neutral' | 'primary' | 'secondary';
}

export interface PageCard {
  /** Small uppercase kicker pills, e.g. [Component] [Input] [Hybrid] or [Docs]. */
  pills: KickerPill[];
  title: string;
  description: string;
  /** Show the seven framework pills under the description (component cards). */
  showFrameworks?: boolean;
}

/* Three pill treatments out of a two-colour palette. There used to be a
   third colour to spend — the tier pill was violet and the interactivity
   pill teal — but the site only has blue and teal, so those two rendered
   identically once the palette was corrected. The distinction is carried by
   whether the text takes the accent, not by adding a colour the brand does
   not have: neutral reads as a label, the two accent treatments read as
   values. */
const accents = {
  neutral: { rgb: blueRgb, text: 'rgba(255,255,255,0.6)' },
  primary: { rgb: blueRgb, text: `rgba(${blueRgb},0.95)` },
  secondary: { rgb: tealRgb, text: `rgba(${tealRgb},0.95)` },
} as const;

function kickerPill(pill: KickerPill): Node {
  const accent = accents[pill.accent ?? 'neutral'];
  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        alignItems: 'center',
        padding: '8px 22px',
        borderRadius: tokens.radius.full,
        border: `1px solid rgba(${accent.rgb}, 0.3)`,
        background: `rgba(${accent.rgb}, 0.08)`,
        fontSize: '21px',
        fontWeight: 600,
        fontFamily: 'Tomorrow',
        letterSpacing: '1px',
        textTransform: 'uppercase',
        color: accent.text,
      },
      children: pill.text,
    },
  };
}

function frameworkPill(name: string): Node {
  return {
    type: 'div',
    props: {
      style: {
        padding: '7px 18px',
        borderRadius: tokens.radius.md,
        border: `1px solid rgba(${blueRgb}, 0.15)`,
        background: `rgba(${blueRgb}, 0.06)`,
        fontSize: '21px',
        fontWeight: 500,
        fontFamily: 'Host Grotesk',
        color: 'rgba(255,255,255,0.5)',
      },
      children: name,
    },
  };
}

/** Render the standard secondary card: pill · big title · divider · description. */
export function pageCardPng(card: PageCard): Promise<Buffer> {
  const content: Node[] = [
    {
      type: 'div',
      props: {
        style: {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: '1',
          maxWidth: '1040px',
        },
        children: [
          // Kicker pill row
          {
            type: 'div',
            props: {
              style: { display: 'flex', gap: '12px', marginBottom: '34px' },
              children: card.pills.map(kickerPill),
            },
          },
          // Title
          {
            type: 'div',
            props: {
              style: {
                fontSize: `${titleFontSize(card.title)}px`,
                fontWeight: 800,
                fontFamily: 'Host Grotesk',
                letterSpacing: '-2px',
                textAlign: 'center',
                background: `linear-gradient(135deg, rgba(255,255,255,0.95) 0%, ${blue} 50%, ${teal} 100%)`,
                backgroundClip: 'text',
                color: 'transparent',
                // Roomy line box + bottom padding so descenders (g, y, p)
                // don't get clipped by satori's background-clip:text bounds.
                lineHeight: 1.25,
                paddingBottom: '8px',
              },
              children: card.title,
            },
          },
          // Divider — with bloom
          {
            type: 'div',
            props: {
              style: {
                position: 'relative',
                width: '480px',
                height: '16px',
                marginTop: '26px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      position: 'absolute',
                      width: '100%',
                      height: '16px',
                      borderRadius: '8px',
                      background: `linear-gradient(90deg, transparent, rgba(${blueRgb},0.18), rgba(${tealRgb},0.12), transparent)`,
                    },
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      position: 'absolute',
                      width: '100%',
                      height: '2px',
                      background: `linear-gradient(90deg, transparent, ${blue}, ${teal}, transparent)`,
                    },
                  },
                },
              ],
            },
          },
          // Description
          {
            type: 'div',
            props: {
              style: {
                fontSize: '29px',
                fontWeight: 400,
                fontFamily: 'Host Grotesk',
                color: 'rgba(255,255,255,0.55)',
                marginTop: '30px',
                letterSpacing: '0.3px',
                lineHeight: 1.45,
                textAlign: 'center',
                maxWidth: '920px',
              },
              children: clampText(card.description),
            },
          },
          ...(card.showFrameworks
            ? [
                {
                  type: 'div',
                  props: {
                    style: { display: 'flex', gap: '10px', marginTop: '34px' },
                    children: ['React', 'Vue', 'Svelte', 'Angular', 'Solid', 'Preact', 'HTML'].map(frameworkPill),
                  },
                } satisfies Node,
              ]
            : []),
        ],
      },
    },
  ];
  return renderCard(content);
}
