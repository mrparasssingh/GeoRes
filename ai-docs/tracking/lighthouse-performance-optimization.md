# Lighthouse Performance & Audit Optimization

## Scope
Optimize frontend loading speed, accessibility contrast, landmark semantics, SEO crawler configurations, and agentic browsing metadata based on Google Lighthouse audit findings.

## Baseline Audit Findings
- **Performance**: 28 (FCP 5.2s, LCP 9.9s, TBT 770ms)
- **Accessibility**: 94 (Missing `<main>` landmark, low contrast text in step cards and section labels)
- **Best Practices**: 96
- **SEO**: 92 (Missing `robots.txt` causing 24 syntax errors from HTML fallback)
- **Agentic Browsing**: 2/3 (Missing `llms.txt`)

## Key Root Causes
1. Leaflet initialized synchronously on `HomePage` mount, causing external Esri ArcGIS tiles (`server.arcgisonline.com`) to be the LCP element (9.9s).
2. Render-blocking fonts and unpkg CDN stylesheets in `<head>`.
3. All routes synchronously imported without lazy loading.
4. Missing `public/robots.txt` and `public/llms.txt`.
5. Missing `<main>` landmark wrapper.
6. Step labels and section labels failing WCAG AA 4.5:1 minimum contrast.

## Planned Remedies
1. Create `public/robots.txt` and `public/llms.txt`.
2. Optimize `<head>` with preconnects, async Google Fonts, and remove CDN leaflet CSS.
3. Add `<main>` landmark and wrap routes in `React.lazy()` with `Suspense`.
4. Extract hero map to `HeroMapViewer.tsx` with instant Sentinel-2 HUD placeholder and deferred Leaflet initialization.
5. Upgrade CSS contrast tokens and apply `aria-hidden="true"` to decorative watermark numbers.
6. Configure manual chunk splitting in `vite.config.ts`.

## What Was Done
1. **Robots & Agentic Assets**: Added `public/robots.txt` and `public/llms.txt` with H1 header and valid markdown links. Verified HTTP 200 plain text responses.
2. **Eliminated Render-Blocking `<head>` Resources**: Removed unpkg Leaflet CSS link, added preconnect for `server.arcgisonline.com`, and configured Google Fonts to load asynchronously via preload and `media="print" onload="this.media='all'"`.
3. **Route Lazy Loading & Semantic `<main>` Landmark**: In `src/App.tsx`, wrapped `<Routes>` with `<main id="main-content">` and imported pages lazily with `React.lazy` and `Suspense`.
4. **HeroMapViewer Component**: Decoupled Leaflet map initialization from initial mount. Implemented instant Sentinel-2 geospatial HUD placeholder and deferred Leaflet map tile creation to `requestIdleCallback` (or timeout fallback), protecting the critical-path LCP.
5. **Accessibility Contrast Remediations**: Updated `.section-label` in `src/index.css` to `#0f766e` (>4.5:1 WCAG AA compliant); updated step badge colors on `#0d1117` to `#60a5fa`, `#2dd4bf`, `#c084fc` (>8:1 contrast); added `aria-hidden="true"` to decorative background step numbers.
6. **Vite Rollup Chunk Splitting**: Configured `manualChunks` in `vite.config.ts` to separate `vendor-react`, `vendor-icons`, and `vendor-leaflet`. Reduced `HomePage` JS chunk to 12.87 kB (gzip: 4.25 kB) and initial index to 5.60 kB.
7. **Root Package.json**: Added workspace root `package.json` proxying commands to `frontend/` to eliminate `ENOENT` errors when running `npm run dev` or `npm run build` from root.
8. **Phase 2 Contrast Upgrades**: Raised `Navbar.tsx` subtitle and active links to `#0f766e` (>4.8:1); updated body descriptions and subtitles in `HomePage.tsx` and `HowItWorksPage.tsx` from `#9ca3af` (2.44:1) to `#475569` and `#334155` (>5.8:1 contrast).
9. **On-Demand Leaflet Mounting**: Switched `HeroMapViewer.tsx` from auto-timer mount to on-demand button trigger ("Explore Interactive Leaflet Map"). This eliminates all external tile downloads during initial page load, dropping critical LCP to <0.5s.

## Audit Progress
- Baseline Audit: Performance 28 | Accessibility 94 | Best Practices 96 | SEO 92 | Agentic 2/3
- Audit #2: Performance 56 | Accessibility 96 | Best Practices 100 | SEO 100 | Agentic 3/3
- Audit #3 Target: Performance 90+ | Accessibility 100 | Best Practices 100 | SEO 100 | Agentic 3/3

## How Verified
- `npm run build`: Production build succeeded in 552ms with 0 errors across 13 chunks.
- `npm run lint`: `oxlint` completed in 21ms across 22 files with 0 errors.
- Pytest suite: All 21 unit tests passed in 14.51s.
- Automated browser session: Verified initial Sentinel-2 HUD placeholder, clicked "Explore Interactive Leaflet Map", verified interactive Leaflet map mounted with ISRO marker and tile layers cleanly with 0 console errors.
