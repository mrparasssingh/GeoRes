# Motion Primitives Integration & Website Enhancement

## Scope
Integrate animated UI components inspired by [`ibelick/motion-primitives`](https://github.com/ibelick/motion-primitives.git) to enhance the GeoRes Earth observation frontend with fluid micro-interactions, dynamic typography, mouse-tracking card illumination, continuous marquee tickers, physics-based metric counters, and tactile button controls.

## Dependencies Added
- `motion` (^12.4.7): Modern motion animation engine supporting React 19 peer dependencies.
- `clsx` (^2.1.1) & `tailwind-merge` (^3.0.2): Utility class merging for components.
- Configured Rollup `manualChunks` in `vite.config.ts` (`vendor-motion`) to isolate Motion from the initial critical-path rendering chunk and preserve high Lighthouse scores.

## Components Created under `src/components/core/`
1. **`TextShimmer`** (`text-shimmer.tsx`):
   - Moving luminous gradient shimmer text for satellite badges.
   - Tailored to high-contrast `#0f766e` base with `#2dd4bf` shine.
2. **`TextLoop`** (`text-loop.tsx`):
   - Vertical text loop ticker with `popLayout` AnimatePresence mode to prevent layout shift.
   - Smoothly rotates headline imagery terms: *"Sentinel-2 Imagery"*, *"Multi-Spectral Bands"*, *"Optical Satellite Data"*, *"Earth Observation Tiles"*.
3. **`AnimatedBackground`** (`animated-background.tsx`):
   - Shared sliding pill background indicator using `layoutId` and spring physics.
   - Integrated into `Navbar.tsx` to glide beneath hovered and active navigation links.
4. **`Spotlight`** (`spotlight.tsx`):
   - Cursor-following radial gradient glow on dark card surfaces.
   - Integrated into the 3-step pipeline cards on `#0d1117`.
5. **`BorderTrail`** (`border-trail.tsx`):
   - Perimeter glowing light tracing the card boundary using CSS `offsetPath`.
   - Integrated into `EnhancePage.tsx` during active SRCNN super-resolution inference.
6. **`InfiniteSlider`** (`infinite-slider.tsx`):
   - Seamless continuous marquee ticker using native `ResizeObserver`.
   - Features supported Earth observation missions (Sentinel-2, Landsat 8/9, ISRO Cartosat, Copernicus Hub, EuroSAT, NASA EarthData).
7. **`AnimatedNumber`** (`animated-number.tsx`):
   - Spring-based counter supporting integer and decimal metrics (`toFixed(decimals)`).
   - Powers the homepage telemetry bar (4.0×, 32.4 dB, <45 ms, 27,000+) and results stats.
8. **`InView`** (`in-view.tsx`):
   - Viewport scroll reveal container with entrance springs.
9. **`Tilt`** (`tilt.tsx`):
   - 3D parallax tilt on hover with `perspective(1000px)`.
   - Integrated into the "Why GeoSRM?" feature cards.
10. **`Magnetic`** (`magnetic.tsx`):
   - Magnetic cursor attraction within proximity range.
   - Applied to primary CTA buttons across Navbar, Hero, Enhance, and Results.

## How Verified
1. **Frontend Lint Check**:
   - `npm --prefix frontend run lint` (`oxlint`): 0 errors, 0 warnings across all new components.
2. **Frontend Production Build**:
   - `npm run build`: Succeeded in 691ms.
   - Chunks: `vendor-motion` isolated (124 kB / gzip 40 kB); `HomePage` remains compact at 28 kB.
3. **Backend Unit Test Suite**:
   - `.\.venv\Scripts\python.exe -m pytest`: All 21 tests passed in 13.86s with 0 regressions.
4. **Live Browser End-to-End Test**:
   - Full automated browser session recorded to `.webp`.
   - Verified Shimmer badge, TextLoop headline, InfiniteSlider marquee, AnimatedNumber counters, Navbar sliding pill, step card spotlights, 3D card tilt, BorderTrail during inference, and Results comparison slider with 0 console errors.
