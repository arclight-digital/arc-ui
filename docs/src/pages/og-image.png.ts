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
        border: `1px solid rgba(${accentRgb}, 0.25)`,
        background: `linear-gradient(180deg, rgba(${accentRgb}, 0.1) 0%, rgba(${accentRgb}, 0.03) 100%)`,
        gap: '6px',
      },
      children: [
        {
          type: 'div' as const,
          props: {
            style: {
              fontSize: '44px',
              fontWeight: 800,
              fontFamily: 'Host Grotesk',
              background: `linear-gradient(135deg, ${accentColor}, rgba(255,255,255,0.9))`,
              backgroundClip: 'text',
              color: 'transparent',
              lineHeight: 1,
            },
            children: value,
          },
        },
        // Mini gradient rule
        {
          type: 'div' as const,
          props: {
            style: {
              width: '24px',
              height: '2px',
              borderRadius: '1px',
              background: `linear-gradient(90deg, ${accentColor}, rgba(${accentRgb}, 0.3))`,
            },
          },
        },
        {
          type: 'div' as const,
          props: {
            style: {
              fontSize: '18px',
              fontWeight: 600,
              fontFamily: 'Tektur',
              letterSpacing: '3px',
              color: 'rgba(255,255,255,0.4)',
              textTransform: 'uppercase' as const,
            },
            children: label,
          },
        },
      ],
    },
  };
}

function frameworkPill(name: string) {
  return {
    type: 'div' as const,
    props: {
      style: {
        padding: '6px 16px',
        borderRadius: tokens.radius.md,
        border: `1px solid rgba(${blueRgb}, 0.15)`,
        background: `rgba(${blueRgb}, 0.06)`,
        fontSize: '18px',
        fontWeight: 500,
        fontFamily: 'Host Grotesk',
        color: 'rgba(255,255,255,0.5)',
      },
      children: name,
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

          // Ambient glow — blue (top-left)
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
                background: `radial-gradient(circle at 10% 10%, rgba(${blueRgb},0.22) 0%, transparent 50%)`,
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
                background: `radial-gradient(circle at 50% 15%, rgba(${violetRgb},0.12) 0%, transparent 45%)`,
              },
            },
          },
          // Ambient glow — teal (bottom-right)
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
                background: `radial-gradient(circle at 90% 90%, rgba(${tealRgb},0.18) 0%, transparent 50%)`,
              },
            },
          },
          // Center spotlight — bloom behind title
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
                background: 'radial-gradient(ellipse at 50% 30%, rgba(255,255,255,0.05) 0%, transparent 45%)',
              },
            },
          },
          // Title glow — strong colored bloom behind "ARC UI"
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
                background: `radial-gradient(ellipse at 50% 28%, rgba(${blueRgb},0.14) 0%, rgba(${violetRgb},0.06) 30%, transparent 55%)`,
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
                marginTop: '-140px',
              },
              children: [
                // v2.0 pill
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px 20px 6px 8px',
                      borderRadius: tokens.radius.full,
                      border: `1px solid rgba(${blueRgb}, 0.3)`,
                      background: `rgba(${blueRgb}, 0.08)`,
                      marginBottom: '14px',
                    },
                    children: [
                      {
                        type: 'div' as const,
                        props: {
                          style: {
                            padding: '2px 10px',
                            borderRadius: tokens.radius.full,
                            background: `linear-gradient(135deg, ${blue}, ${violet})`,
                            fontSize: '18px',
                            fontWeight: 700,
                            fontFamily: 'Host Grotesk',
                            color: 'white',
                            letterSpacing: '0.5px',
                          },
                          children: 'v2.0',
                        },
                      },
                      {
                        type: 'div' as const,
                        props: {
                          style: {
                            fontSize: '18px',
                            fontWeight: 500,
                            fontFamily: 'Host Grotesk',
                            color: 'rgba(255,255,255,0.6)',
                          },
                          children: 'Components that glow.',
                        },
                      },
                    ],
                  },
                },
                // ARC UI title
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
                            background: `linear-gradient(135deg, rgba(255,255,255,0.95) 0%, ${blue} 50%, ${violet} 100%)`,
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
                // Divider — with bloom
                {
                  type: 'div',
                  props: {
                    style: {
                      position: 'relative' as const,
                      width: '580px',
                      height: '16px',
                      marginTop: '10px',
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
                            height: '16px',
                            borderRadius: '8px',
                            background: `linear-gradient(90deg, transparent, rgba(${blueRgb},0.18), rgba(${violetRgb},0.12), rgba(${tealRgb},0.1), transparent)`,
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
                      fontSize: '24px',
                      fontWeight: 400,
                      fontFamily: 'Host Grotesk',
                      color: 'rgba(255,255,255,0.55)',
                      marginTop: '10px',
                      letterSpacing: '0.5px',
                    },
                    children: 'One source of truth. Seven framework targets.',
                  },
                },
                // Framework pills row
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      gap: '8px',
                      marginTop: '10px',
                    },
                    children: [
                      frameworkPill('React'),
                      frameworkPill('Vue'),
                      frameworkPill('Svelte'),
                      frameworkPill('Angular'),
                      frameworkPill('Solid'),
                      frameworkPill('Preact'),
                      frameworkPill('HTML'),
                    ],
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
                bottom: '65px',
                display: 'flex',
                gap: '16px',
                alignItems: 'center',
              },
              children: [
                statCard(String(components.length), 'Components', blue, blueRgb),
                statCard('7', 'Frameworks', violet, violetRgb),
                statCard('0', 'Dependencies', teal, tealRgb),
                statCard('160+', 'Tokens', blue, blueRgb),
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
                fontSize: '18px',
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
                fontSize: '18px',
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
