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

export const blue = tokens.color.accentPrimary;
export const blueRgb = tokens.rgb.accentPrimary;
export const teal = '#14b8a6';
export const tealRgb = '20,184,166';
export const violet = tokens.color.accentSecondary;
export const violetRgb = tokens.rgb.accentSecondary;

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

/** Ambient glows, center blooms, border, and edge glows — in paint order. */
export function backgroundLayers(): Node[] {
  return [
    ...dotGrid(40, 22, 30, 0, 0),
    // Ambient glow — blue (top-left)
    layer(`radial-gradient(circle at 10% 10%, rgba(${blueRgb},0.22) 0%, transparent 50%)`),
    // Ambient glow — violet (center-top, adds depth)
    layer(`radial-gradient(circle at 50% 15%, rgba(${violetRgb},0.12) 0%, transparent 45%)`),
    // Ambient glow — teal (bottom-right)
    layer(`radial-gradient(circle at 90% 90%, rgba(${tealRgb},0.18) 0%, transparent 50%)`),
    // Center spotlight — bloom behind title
    layer('radial-gradient(ellipse at 50% 30%, rgba(255,255,255,0.05) 0%, transparent 45%)'),
    // Title glow — strong colored bloom behind the headline
    layer(`radial-gradient(ellipse at 50% 28%, rgba(${blueRgb},0.14) 0%, rgba(${violetRgb},0.06) 30%, transparent 55%)`),
    // Border
    {
      type: 'div',
      props: {
        style: {
          position: 'absolute',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          border: `1px solid rgba(${blueRgb},0.2)`,
        },
      },
    },
    // Top edge glow
    {
      type: 'div',
      props: {
        style: {
          position: 'absolute',
          top: '0',
          left: '10%',
          right: '10%',
          height: '2px',
          background: `linear-gradient(90deg, transparent, rgba(${blueRgb},0.6), rgba(${violetRgb},0.4), rgba(${tealRgb},0.5), transparent)`,
        },
      },
    },
    // Top edge bloom (wider, softer)
    {
      type: 'div',
      props: {
        style: {
          position: 'absolute',
          top: '0',
          left: '15%',
          right: '15%',
          height: '20px',
          background: `linear-gradient(90deg, transparent, rgba(${blueRgb},0.08), rgba(${violetRgb},0.06), rgba(${tealRgb},0.06), transparent)`,
        },
      },
    },
    // Bottom edge glow
    {
      type: 'div',
      props: {
        style: {
          position: 'absolute',
          bottom: '0',
          left: '15%',
          right: '15%',
          height: '2px',
          background: `linear-gradient(90deg, transparent, rgba(${tealRgb},0.4), rgba(${blueRgb},0.3), transparent)`,
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
      { name: 'Tektur', data: font('tektur-latin.ttf'), style: 'normal' },
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
  accent?: 'blue' | 'violet' | 'teal';
}

export interface PageCard {
  /** Small uppercase kicker pills, e.g. [Component] [Input] [Hybrid] or [Docs]. */
  pills: KickerPill[];
  title: string;
  description: string;
  /** Show the seven framework pills under the description (component cards). */
  showFrameworks?: boolean;
}

const accents = {
  blue: { rgb: blueRgb, text: 'rgba(255,255,255,0.6)' },
  violet: { rgb: violetRgb, text: `rgba(${violetRgb},0.95)` },
  teal: { rgb: tealRgb, text: `rgba(${tealRgb},0.95)` },
} as const;

function kickerPill(pill: KickerPill): Node {
  const accent = accents[pill.accent ?? 'blue'];
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
        fontFamily: 'Tektur',
        letterSpacing: '3px',
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
                background: `linear-gradient(135deg, rgba(255,255,255,0.95) 0%, ${blue} 50%, ${violet} 100%)`,
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
                      background: `linear-gradient(90deg, transparent, rgba(${blueRgb},0.18), rgba(${violetRgb},0.12), rgba(${tealRgb},0.1), transparent)`,
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
                      background: `linear-gradient(90deg, transparent, ${blue}, ${violet}, ${teal}, transparent)`,
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
