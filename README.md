# shlokkvaishnav.dev

Personal portfolio of **Shlok Vaishnav** — software engineer working across machine learning and systems. A space-instrument take on a portfolio: near-black sky, one gold telemetry accent, hairline rules, and a procedural starfield that responds to how you scroll.

**Live:** [shlokkvaishnav.dev](https://shlokkvaishnav.dev)

## Stack

- **Vite 6 + React 19 + strict TypeScript** — single page, no router
- **Tailwind CSS v4** — CSS-first `@theme` design tokens
- **GSAP ScrollTrigger + Lenis** — one rAF owner; scroll progress flows through a transient zustand store so scrolling never re-renders React
- **React Three Fiber** — orthographic point-sprite starfield with custom GLSL (develop-in, twinkle, velocity streaks, cursor gravity, depth grade); loaded in its own chunk on idle, after LCP
- **Fontsource subsets** — Instrument Serif · Inter Variable · IBM Plex Mono, self-hosted with metric-compatible fallbacks

## Architecture

```
src/
  content/     all copy and data, typed — the single source of truth
  sections/    Hero, About, Experience, Projects, Skills, Contact
  scene/       Canvas root, quality tiers (0–2), GLSL shaders
  animation/   Lenis+ScrollTrigger spine, scroll store, choreography
  exhibits/    one playable demo per project, lazy chunks
  eggs/        discovery registry, terminal, constellation, detectors
  components/  nav, progress rail, bracket engine, footer instruments
```

Notable decisions:

- **Playable exhibits.** Every project card demonstrates the real thing: a live k-NN probe with measured scan times (NanoDB), hold-to-ablate equation terms with ΔRMSE (Climate Equation Discovery), a weekly collaboration graph that surfaces silo risk (Meridian), and an actual logistic model behind sliders with a risk-reactive ECG (Cardiovascular Risk).
- **Tiered sky.** Tier 2 gets the full WebGL field; tier 1 fewer stars and capped DPR; tier 0, lost contexts, and `prefers-reduced-motion` get an instant CSS starfield. Reduced motion is a parallel design — final states, not missing features.
- **Motion grammar.** Mechanical elements (stamps, numerals, ticks) swap with no easing; physical elements (rules, ink, needles) arrive on expo/power curves. Gold only ever marks live data.
- **Discoveries.** Seven hidden finds persist in localStorage and light the footer tray. Start with <kbd>`</kbd> or <kbd>?</kbd> — or open the browser console.

## Development

```bash
npm install
npm run dev       # dev server (syncs font subsets first)
npm run build     # tsc -b + vite build → dist/
npm run lint      # eslint, zero warnings allowed
```

Deployed to GitHub Pages by `.github/workflows/deploy.yml` on every push to `main`; the custom domain rides along in `public/CNAME`.

## Colophon

Type: Instrument Serif, Inter, IBM Plex Mono (OFL, via Fontsource). Lunar phase and meteor-shower windows are computed locally — the site makes no network requests beyond its own assets.
