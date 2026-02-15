import satori from 'satori';
import sharp from 'sharp';
import fs from 'node:fs';
import type { APIRoute } from 'astro';
import { components } from '../data/components/index';
import { tokens } from '../../../shared/tokens.js';

const pkg = JSON.parse(fs.readFileSync(new URL('../../../packages/web-components/package.json', import.meta.url), 'utf-8'));

export const prerender = true;

// Token-derived colors
const blue = tokens.color.accentPrimary;
const blueRgb = tokens.rgb.accentPrimary;
const teal = '#14b8a6';
const tealRgb = '20,184,166';
const violet = tokens.color.accentSecondary;
const violetRgb = tokens.rgb.accentSecondary;

// Generate dot grid — brighter near center, fading to edges
function dotGrid(cols: number, rows: number, spacing: number, offsetX: number, offsetY: number) {
  const dots = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cx = (c - cols / 2) / (cols / 2);
      const cy = (r - rows / 2) / (rows / 2);
      const dist = Math.sqrt(cx * cx + cy * cy);
      const opacity = Math.max(0, 0.18 - dist * 0.12);
      if (opacity < 0.02) continue;

      dots.push({
        type: 'div' as const,
        props: {
          style: {
            position: 'absolute' as const,
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

function statCard(value: string, label: string, accentColor: string, accentRgb: string) {
  return {
    type: 'div' as const,
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative' as const,
        width: '220px',
        height: '120px',
        borderRadius: tokens.radius.lg,
        border: `1px solid rgba(${accentRgb}, 0.2)`,
        background: `linear-gradient(180deg, rgba(${accentRgb}, 0.08) 0%, rgba(${accentRgb}, 0.02) 100%)`,
        gap: '8px',
      },
      children: [
        {
          type: 'div' as const,
          props: {
            style: {
              fontSize: '40px',
              fontWeight: 800,
              fontFamily: 'Host Grotesk',
              color: accentColor,
              lineHeight: 1,
            },
            children: value,
          },
        },
        {
          type: 'div' as const,
          props: {
            style: {
              fontSize: '14px',
              fontWeight: 600,
              fontFamily: 'Tektur',
              letterSpacing: '3px',
              color: 'rgba(255,255,255,0.35)',
              textTransform: 'uppercase' as const,
            },
            children: label,
          },
        },
      ],
    },
  };
}

export const GET: APIRoute = async () => {
  const fontBody = fs.readFileSync('public/fonts/hostgrotesk-latin.ttf');
  const fontBodyBold = fs.readFileSync('public/fonts/hostgrotesk-800-latin.ttf');
  const fontAccent = fs.readFileSync('public/fonts/tektur-latin.ttf');

  const dots = dotGrid(40, 22, 30, 0, 0);

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
        children: [
          // Dot grid
          ...dots,

          // Ambient glow — blue (top-left) — full-canvas div with offset gradient
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
                background: `radial-gradient(circle at 10% 10%, rgba(${blueRgb},0.18) 0%, transparent 50%)`,
              },
            },
          },
          // Ambient glow — violet (center-top, adds depth)
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
                background: `radial-gradient(circle at 50% 15%, rgba(${violetRgb},0.08) 0%, transparent 45%)`,
              },
            },
          },
          // Ambient glow — teal (bottom-right) — full-canvas div with offset gradient
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
                background: `radial-gradient(circle at 90% 90%, rgba(${tealRgb},0.15) 0%, transparent 50%)`,
              },
            },
          },
          // Center spotlight — warm white bloom behind title
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
                background: 'radial-gradient(ellipse at 50% 30%, rgba(255,255,255,0.04) 0%, transparent 45%)',
              },
            },
          },
          // Title glow — soft colored bloom behind "ARC UI"
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
                background: `radial-gradient(ellipse at 50% 25%, rgba(${blueRgb},0.1) 0%, rgba(${tealRgb},0.05) 30%, transparent 55%)`,
              },
            },
          },

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
          // Top edge glow — gradient bloom along the top border
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                top: '0',
                left: '15%',
                right: '15%',
                height: '1px',
                background: `linear-gradient(90deg, transparent, rgba(${blueRgb},0.5), rgba(${violetRgb},0.3), rgba(${tealRgb},0.4), transparent)`,
              },
            },
          },
          // Bottom edge glow — subtle accent along bottom border
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                bottom: '0',
                left: '20%',
                right: '20%',
                height: '1px',
                background: `linear-gradient(90deg, transparent, rgba(${tealRgb},0.3), rgba(${blueRgb},0.2), transparent)`,
              },
            },
          },

          // Main content
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: '1',
                marginTop: '-160px',
              },
              children: [
                // ARC UI
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      alignItems: 'baseline',
                    },
                    children: [
                      {
                        type: 'div' as const,
                        props: {
                          style: {
                            fontSize: '172px',
                            fontWeight: 800,
                            fontFamily: 'Host Grotesk',
                            letterSpacing: '-4px',
                            background: `linear-gradient(90deg, ${blue} 0%, ${teal} 100%)`,
                            backgroundClip: 'text',
                            color: 'transparent',
                            lineHeight: 1,
                          },
                          children: 'ARC UI',
                        },
                      },
                    ],
                  },
                },
                // Divider — thicker with bloom
                {
                  type: 'div',
                  props: {
                    style: {
                      position: 'relative' as const,
                      width: '580px',
                      height: '12px',
                      marginTop: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    },
                    children: [
                      // Bloom layer
                      {
                        type: 'div' as const,
                        props: {
                          style: {
                            position: 'absolute' as const,
                            width: '100%',
                            height: '12px',
                            borderRadius: '6px',
                            background: `linear-gradient(90deg, transparent, rgba(${blueRgb},0.15), rgba(${tealRgb},0.1), transparent)`,
                          },
                        },
                      },
                      // Crisp line
                      {
                        type: 'div' as const,
                        props: {
                          style: {
                            position: 'absolute' as const,
                            width: '100%',
                            height: '2px',
                            background: `linear-gradient(90deg, transparent, ${blue}, ${teal}, transparent)`,
                          },
                        },
                      },
                    ],
                  },
                },
                // Tagline
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: '22px',
                      fontWeight: 500,
                      fontFamily: 'Tektur',
                      letterSpacing: '6px',
                      color: 'rgba(255,255,255,0.4)',
                      marginTop: '16px',
                      textTransform: 'uppercase' as const,
                    },
                    children: 'ARC Reactive Components',
                  },
                },
                // Description
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: '22px',
                      fontWeight: 400,
                      fontFamily: 'Host Grotesk',
                      color: tokens.color.textSecondary,
                      marginTop: '10px',
                    },
                    children: 'Lit Web Components with code generation for every framework',
                  },
                },
              ],
            },
          },

          // Stats row — styled cards
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                bottom: '80px',
                display: 'flex',
                gap: '16px',
                alignItems: 'center',
              },
              children: [
                statCard(String(components.length), 'Components', blue, blueRgb),
                statCard('7', 'Frameworks', teal, tealRgb),
                statCard('0', 'Dependencies', blue, blueRgb),
                statCard('2', 'Themes', teal, tealRgb),
              ],
            },
          },

          // Version badge — bottom-right
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                bottom: '16px',
                right: '24px',
                display: 'flex',
                alignItems: 'center',
                padding: '6px 18px',
                borderRadius: tokens.radius.full,
                border: `1px solid rgba(${blueRgb},0.3)`,
                background: `rgba(${blueRgb},0.08)`,
                fontSize: '16px',
                fontWeight: 600,
                fontFamily: 'Host Grotesk',
                color: blue,
              },
              children: `v${pkg.version}`,
            },
          },

          // URL — bottom-left
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                bottom: '18px',
                left: '24px',
                fontSize: '16px',
                fontWeight: 400,
                fontFamily: 'Host Grotesk',
                letterSpacing: '1px',
                color: 'rgba(255,255,255,0.45)',
              },
              children: 'arcui.dev',
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Host Grotesk', data: fontBody, weight: 400, style: 'normal' as const },
        { name: 'Host Grotesk', data: fontBodyBold, weight: 800, style: 'normal' as const },
        { name: 'Tektur', data: fontAccent, style: 'normal' as const },
      ],
    },
  );

  const png = await sharp(Buffer.from(svg)).png().toBuffer();

  return new Response(png, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
