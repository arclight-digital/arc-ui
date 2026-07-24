/**
 * releases.ts — one entry per published release, newest first.
 *
 * Drives /rss.xml. Dates are npm publish dates (`npm view @arclux/arc-ui
 * time`); titles match the changelog section headings. When cutting a
 * release: add the entry here alongside the changelog section.
 */
export interface Release {
  version: string;
  /** ISO date (YYYY-MM-DD) the version was published to npm. */
  date: string;
  title: string;
}

/** Anchor id on /docs/changelog for a version, e.g. "v2-3-0". */
export function anchorFor(version: string): string {
  return `v${version.replace(/\./g, '-')}`;
}

export const releases: Release[] = [
  { version: '2.7.0', date: '2026-07-23', title: 'Editor Autocomplete, Typed Events & Dev Warnings' },
  { version: '2.6.0', date: '2026-07-23', title: 'Form Submission Across Shadow Boundaries' },
  { version: '2.5.0', date: '2026-07-23', title: 'Keyboard-First Command Palette & Browser Tests' },
  { version: '2.4.0', date: '2026-07-23', title: 'Command Palette Groups & Keyword Search' },
  { version: '2.3.1', date: '2026-07-23', title: 'Republish With Vendored Icons' },
  { version: '2.3.0', date: '2026-07-23', title: 'Zero Axe Violations, Prism 2.0 & Discoverability' },
  { version: '2.2.0', date: '2026-07-13', title: 'Dashboard Suite, Native Forms & Accessibility Overhaul' },
  { version: '2.1.0', date: '2026-02-17', title: 'Export Namespace Fix' },
  { version: '2.0.1', date: '2026-02-17', title: 'Export Fixes & Build Pipeline' },
  { version: '2.0.0', date: '2026-02-17', title: 'Design System Overhaul' },
  { version: '1.11.0', date: '2026-02-15', title: 'Footer Containment & Layout Improvements' },
  { version: '1.10.2', date: '2026-02-15', title: 'Top Bar Containment & Brand Integration' },
  { version: '1.10.1', date: '2026-02-15', title: 'Tier Reorganization & API Cleanup' },
  { version: '1.10.0', date: '2026-02-15', title: 'The Big Component Update' },
  { version: '1.9.2', date: '2026-02-14', title: 'Top Bar Container Alignment' },
  { version: '1.9.1', date: '2026-02-14', title: 'Fix Icon Loading in Production Builds' },
  { version: '1.9.0', date: '2026-02-14', title: 'Per-Icon Lazy Loading' },
  { version: '1.8.6', date: '2026-02-14', title: 'Theme Toggle Icon-Only Size Fix' },
  { version: '1.8.5', date: '2026-02-14', title: 'Theme Toggle Padding Fix' },
  { version: '1.8.4', date: '2026-02-14', title: 'Mobile Touch Targets, Code Block Fix' },
  { version: '1.8.3', date: '2026-02-14', title: 'Rename tokens.css → base.css, FOUC Prevention' },
  { version: '1.8.2', date: '2026-02-14', title: 'Missing Subpath Exports' },
  { version: '1.8.1', date: '2026-02-14', title: 'Tree-Shaking Bugfix' },
  { version: '1.8.0', date: '2026-02-14', title: 'Tree-Shakeable Components' },
  { version: '1.7.2', date: '2026-02-14', title: 'Themeable Syntax Highlighting' },
  { version: '1.7.1', date: '2026-02-14', title: 'Token Consolidation' },
  { version: '1.7.0', date: '2026-02-14', title: 'Code Block Variants' },
  { version: '1.6.0', date: '2026-02-14', title: 'New Component Props' },
  { version: '1.5.2', date: '2026-02-14', title: 'Bug Fixes' },
  { version: '1.5.1', date: '2026-02-14', title: 'Bug Fixes' },
  { version: '1.5.0', date: '2026-02-14', title: 'Utility Props Sweep' },
  { version: '1.4.0', date: '2026-02-14', title: 'Component Composition & Token Infrastructure' },
  { version: '1.3.0', date: '2026-02-14', title: 'Visual Refinements' },
  { version: '1.2.0', date: '2026-02-14', title: 'Component Enhancements' },
  { version: '1.1.0', date: '2026-02-13', title: 'New Components & Enhancements' },
  { version: '1.0.0', date: '2026-02-13', title: 'Initial Release' },
];
