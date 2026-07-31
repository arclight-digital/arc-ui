/**
 * og-image.png — the site's front-door social card.
 *
 * The background, chrome and fonts come from lib/og-card.ts, which is the
 * whole reason that module exists ("so the background treatment, chrome, and
 * fonts stay identical across all cards"). This route used to carry its own
 * copy of every one of them — dot grid, glows, border, edge lines, font
 * loading — so a change to the shared treatment silently skipped the one card
 * most people ever see. Only what is unique to the front door lives here: the
 * wordmark, the promise, and the stats.
 */
import type { APIRoute } from 'astro';
import { tokens } from '../../../shared/tokens.js';
import { blue, blueRgb, teal, tealRgb, renderCard } from '../lib/og-card';
import {
  componentCount,
  frameworks,
  frameworkCount,
  buildSteps,
  tokenCount,
  versionShort,
} from '../data/site-stats';

export const prerender = true;

type Node = { type: string; props: Record<string, unknown> };

function statCard(value: string, label: string, accentColor: string, accentRgb: string): Node {
  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        width: '250px',
        height: '120px',
        borderRadius: tokens.radius.lg,
        border: `1px solid rgba(${accentRgb}, 0.25)`,
        background: `linear-gradient(180deg, rgba(${accentRgb}, 0.1) 0%, rgba(${accentRgb}, 0.03) 100%)`,
        gap: '6px',
      },
      children: [
        {
          type: 'div',
          props: {
            style: {
              fontSize: '58px',
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
        {
          type: 'div',
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
          type: 'div',
          props: {
            style: {
              fontSize: '21px',
              fontWeight: 600,
              fontFamily: 'Tomorrow',
              letterSpacing: '1px',
              color: 'rgba(255,255,255,0.4)',
              textTransform: 'uppercase',
            },
            children: label,
          },
        },
      ],
    },
  };
}

function frameworkPill(name: string): Node {
  return {
    type: 'div',
    props: {
      style: {
        padding: '8px 20px',
        borderRadius: tokens.radius.md,
        border: `1px solid rgba(${blueRgb}, 0.15)`,
        background: `rgba(${blueRgb}, 0.06)`,
        fontSize: '24px',
        fontWeight: 500,
        fontFamily: 'Host Grotesk',
        color: 'rgba(255,255,255,0.5)',
      },
      children: name,
    },
  };
}

export const GET: APIRoute = async () => {
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
          marginTop: '-132px',
        },
        children: [
          // Version pill
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 24px 8px 10px',
                borderRadius: tokens.radius.full,
                border: `1px solid rgba(${blueRgb}, 0.3)`,
                background: `rgba(${blueRgb}, 0.08)`,
                marginBottom: '20px',
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      padding: '3px 13px',
                      borderRadius: tokens.radius.full,
                      background: `linear-gradient(135deg, ${blue}, ${teal})`,
                      fontSize: '23px',
                      fontWeight: 700,
                      fontFamily: 'Host Grotesk',
                      color: 'white',
                      letterSpacing: '0.5px',
                    },
                    children: versionShort,
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: '23px',
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
          // ARC UI
          {
            type: 'div',
            props: {
              style: {
                fontSize: '172px',
                fontWeight: 800,
                fontFamily: 'Host Grotesk',
                letterSpacing: '-4px',
                background: `linear-gradient(135deg, rgba(255,255,255,0.95) 0%, ${blue} 50%, ${teal} 100%)`,
                backgroundClip: 'text',
                color: 'transparent',
                lineHeight: 1,
              },
              children: 'ARC UI',
            },
          },
          // Divider — bloom under a crisp line
          {
            type: 'div',
            props: {
              style: {
                position: 'relative',
                width: '580px',
                height: '16px',
                marginTop: '14px',
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
          // Promise
          {
            type: 'div',
            props: {
              style: {
                fontSize: '31px',
                fontWeight: 400,
                fontFamily: 'Host Grotesk',
                color: 'rgba(255,255,255,0.55)',
                marginTop: '20px',
                letterSpacing: '0.5px',
              },
              children: 'One source of truth. Seven framework targets.',
            },
          },
          // Framework pills
          {
            type: 'div',
            props: {
              style: { display: 'flex', gap: '10px', marginTop: '28px' },
              children: frameworks.map(frameworkPill),
            },
          },
        ],
      },
    },
    // Stats
    {
      type: 'div',
      props: {
        style: {
          position: 'absolute',
          bottom: '38px',
          display: 'flex',
          gap: '20px',
          alignItems: 'center',
        },
        children: [
          statCard(String(componentCount), 'Components', blue, blueRgb),
          statCard(String(frameworkCount), 'Frameworks', teal, tealRgb),
          statCard(String(buildSteps), 'Build Steps', blue, blueRgb),
          statCard(String(tokenCount), 'Design Tokens', teal, tealRgb),
        ],
      },
    },
  ];

  const png = await renderCard(content);

  // No Cache-Control here: this route is prerendered to a static file, so the
  // host serves it with its own headers and anything set here is discarded.
  // Cache busting is the ?v= release stamp on the og:image tag in BaseLayout.
  return new Response(png, {
    headers: { 'Content-Type': 'image/png' },
  });
};
