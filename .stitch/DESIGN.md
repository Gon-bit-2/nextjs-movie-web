---
name: Cinematic Dark Editorial
colors:
  surface: '#131316'
  surface-dim: '#131316'
  surface-bright: '#39393c'
  surface-container-lowest: '#0e0e11'
  surface-container-low: '#1b1b1e'
  surface-container: '#201f22'
  surface-container-high: '#2a2a2d'
  surface-container-highest: '#353438'
  on-surface: '#e5e1e6'
  on-surface-variant: '#e9bcb6'
  inverse-surface: '#e5e1e6'
  inverse-on-surface: '#303033'
  outline: '#af8782'
  outline-variant: '#5e3f3b'
  surface-tint: '#ffb4aa'
  primary: '#ffb4aa'
  on-primary: '#690003'
  primary-container: '#e50914'
  on-primary-container: '#fff7f6'
  inverse-primary: '#c0000c'
  secondary: '#ffd65b'
  on-secondary: '#3d2f00'
  secondary-container: '#e7b900'
  on-secondary-container: '#5f4a00'
  tertiary: '#c7c5d0'
  on-tertiary: '#303038'
  tertiary-container: '#72717b'
  on-tertiary-container: '#faf7ff'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdad5'
  primary-fixed-dim: '#ffb4aa'
  on-primary-fixed: '#410001'
  on-primary-fixed-variant: '#930007'
  secondary-fixed: '#ffe08b'
  secondary-fixed-dim: '#f0c110'
  on-secondary-fixed: '#241a00'
  on-secondary-fixed-variant: '#584400'
  tertiary-fixed: '#e4e1ec'
  tertiary-fixed-dim: '#c7c5d0'
  on-tertiary-fixed: '#1b1b23'
  on-tertiary-fixed-variant: '#46464f'
  background: '#131316'
  on-background: '#e5e1e6'
  surface-variant: '#353438'
typography:
  display-xl:
    fontFamily: Oswald
    fontSize: 72px
    fontWeight: '700'
    lineHeight: 76px
    letterSpacing: 0.02em
  display-xl-mobile:
    fontFamily: Oswald
    fontSize: 44px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: 0.02em
  headline-lg:
    fontFamily: Oswald
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: 0.02em
  headline-lg-mobile:
    fontFamily: Oswald
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: 0.02em
  headline-md:
    fontFamily: Oswald
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 30px
    letterSpacing: 0.01em
  headline-sm:
    fontFamily: Oswald
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: 0.02em
  rank-number:
    fontFamily: Oswald
    fontSize: 120px
    fontWeight: '700'
    lineHeight: 100px
    letterSpacing: -0.04em
  body-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Be Vietnam Pro
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Be Vietnam Pro
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.02em
  label-md:
    fontFamily: Be Vietnam Pro
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.04em
  label-sm:
    fontFamily: Be Vietnam Pro
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-tablet: 1.5rem
  gutter-desktop: 2rem
  margin: 1rem
  margin-tablet: 2rem
  margin-desktop: 4rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style
The brand personality captures the prestige, drama, and immersion of a premier film theater translated to the screen. Tailored for modern Vietnamese cinephiles and digital entertainment seekers, the visual tone evokes an authoritative, curated cinema experience. 

The aesthetic is **Cinematic Dark Editorial with Glassmorphic Overlays**. It leans heavily into deep obsidian shadows, high-impact condensed typographic billing blocks, precision hairline borders, and vivid theatrical crimson accents. Interfaces prioritize imagery and narrative atmosphere, establishing a high visual hierarchy where artwork takes center stage against obsidian depths.

## Colors
The palette evokes the dim interior of a projection theater, maximizing image radiance and contrast:

- **Primary Canvas (`#0A0A0D`)**: Deep Cinema Obsidian. Absorbs ambient light and grounds the experience.
- **Card / Surface (`#14141A`)**: Theater Surface. Used for baseline structural modules, list panels, and resting card backgrounds.
- **Elevated Surface (`#1E1E26`)**: Elevated Slate. Used for active modals, dropdowns, floating controls, and hover layers.
- **Borders & Dividers (`rgba(255, 255, 255, 0.08)`)**: Crisp Hairline borders providing structural definition without visual clutter.
- **Primary Text (`#F2F2F5`)**: Crisp Off-White for dominant legibility across all dark surfaces.
- **Secondary Text (`#9A9AA8`)**: Muted Mist for metadata, running times, cast roles, and supplementary labels.
- **Primary Accent (`#E50914`)**: Cinema Red. Reserved for high-priority calls to action (Watch Now, Subscribe), active tab indicators, and progress tracks.
- **Secondary / Rating Accent (`#F5C518`)**: IMDb Gold. Exclusively applied to rating badges, awards, and critic stars.

## Typography
Typographic rules follow editorial film marketing standards:

- **Oswald** provides dramatic, condensed impact. Use Oswald in uppercase for main billboard titles, section dividers, collection headers, and the prominent Top 10 numbered rankings (`rank-number`).
- **Be Vietnam Pro** delivers precise, native rendering for Vietnamese diacritics and complex script glyphs. It is used exclusively across narrative synopses, UI controls, video player overlays, metadata, and timestamps.
- Ensure all uppercase uses of Oswald feature subtle positive letter spacing (`0.01em` to `0.04em`) to maintain legibility.

## Layout & Spacing
The layout follows a fluid 12-column grid anchored by wide outer canvas margins that evoke a widescreen cinematic canvas. 

- **Desktop (1200px+)**: 12 columns, 32px gutters, 64px horizontal canvas margins. Media horizontal carousels extend edge-to-edge with right-side peek to invite horizontal scroll.
- **Tablet (768px - 1199px)**: 8 columns, 24px gutters, 32px margins. Two-to-three column card matrices.
- **Mobile (< 768px)**: 4 columns, 16px gutters, 16px margins. Posters shift to 2-column grids or high-density horizontal snap-swipes.
- Use `space-xs` and `space-sm` for tag clusters, star ratings, and button icon gaps.
- Use `space-md` for component internal padding.
- Use `space-lg` and `space-xl` strictly for macro separation between featured categories, curated editorial rows, and billboard hero trailers.

## Elevation & Depth
Depth is constructed through ambient darkness, tinted lighting, and glassmorphic blurs rather than standard drop shadows:

- **Baseline Level (0dp)**: Canvas obsidian `#0A0A0D`.
- **Card Level (1dp)**: Theater surface `#14141A` bounded by a `1px solid rgba(255, 255, 255, 0.08)` hairline border.
- **Elevated / Hover Level (2dp)**: Slate surface `#1E1E26` with a soft crimson ambient halo on primary interactive elements: `box-shadow: 0 12px 32px -8px rgba(229, 9, 20, 0.35)`.
- **Glass Overlays**: Floating bottom player controls, sticky headers, and quick-detail bottom sheets use `background: rgba(10, 10, 13, 0.72)` paired with `backdrop-filter: blur(16px)` and a `1px` top/border hairline `rgba(255, 255, 255, 0.08)`.

## Shapes
Geometry is precise and modern, featuring 10px (`0.625rem`) rounded borders for all standard cards, media posters, video tiles, and primary modal containers to soften the severe dark aesthetic without appearing overly casual.

- **Posters and Thumbnails**: Strict 10px curvature.
- **Buttons and Inputs**: 8px (`0.5rem`) soft corners for balanced density.
- **Chips, Badges, and Player Scrubbers**: Fully rounded pill shapes (`9999px`) to distinguish interactive metadata from media tiles.

## Components

### Buttons
- **Primary CTA ("Xem Phim" / Watch Now)**: Cinema Red (`#E50914`) background, Crisp Off-White text (`#F2F2F5`), Oswald uppercase semi-bold font. Includes a subtle crimson ambient glow on hover (`box-shadow: 0 4px 20px rgba(229, 9, 20, 0.4)`).
- **Secondary CTA ("Chi Tiết" / More Info)**: Glassmorphic background `rgba(255, 255, 255, 0.1)`, hairline border `rgba(255, 255, 255, 0.2)`, off-white text, transitioning to solid `#1E1E26` on hover.

### Media Cards & Posters
- **Movie Poster Card**: 2:3 aspect ratio with a 10px border radius, resting on `#14141A` with a hairline stroke `rgba(255, 255, 255, 0.08)`. Hover triggers a scale transformation (1.04x) with an elevated slate rim and a soft vertical gradient scrim (`rgba(10,10,13,0.9)` at bottom to transparent at center).
- **Billboard Hero**: Full-bleed cinematic wide container with a gradient fade to obsidian `#0A0A0D` along the bottom and left edges, overlaying title artwork, metadata chips, and action buttons.

### Chips & Metadata Badges
- **IMDb Rating Badge**: IMDb Gold (`#F5C518`) text, high-density black background (`#0A0A0D`), gold border `rgba(245, 197, 24, 0.3)`. Pill-shaped.
- **Resolution / Audio Tags (4K, Dolby Atmos, Phụ Đề)**: Ghost styling with `rgba(255, 255, 255, 0.06)` background, muted mist text (`#9A9AA8`), and crisp hairline borders. 4px rounded corners.

### Top 10 Ranking Module
- Utilizes the `rank-number` typographic token in Oswald. Numbers are outlined or filled with subtle gradient strokes positioned behind the overlapping poster card to signify editorial ranking order.

### Inputs & Search
- Inputs feature `#14141A` fill, hairline borders, muted mist placeholder text, and expand on focus with an active Cinema Red hairline outline and a low-opacity crimson glow.

### Video Player Controls
- Docked or floating glassmorphic strip (`rgba(10, 10, 13, 0.85)` + 20px blur) with Cinema Red progress sliders, off-white icon glyphs, and high-contrast tooltip timestamps.
