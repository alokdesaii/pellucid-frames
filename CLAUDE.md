# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development

**No build step required.** Babel compiles JSX in the browser. To start the dev server:

```bash
npx http-server -p 8080 -c-1
# or
python3 -m http.server 8080
```

Open `http://localhost:8080/index.html`. The `-c-1` flag disables caching — important since there's no build fingerprinting.

**Manual testing only.** Do not use automated browser testing, screenshots, or DOM inspection tools unless explicitly requested by the user.

## Architecture

No bundler, no framework CLI, no node runtime in production. The entire stack runs in the browser:

- **React 18 + Babel Standalone** loaded from unpkg CDN. JSX files are loaded as `type="text/babel"` scripts and compiled on page load.
- **Component registration:** Each `src/*.jsx` file attaches itself to `window` (e.g., `Object.assign(window, { ScrollScene })`). This is how components reference each other across files — there are no ES module imports.
- **Three.js (v0.160.0)** via CDN for WebGL contexts in `lightrays.jsx` (volumetric rays shader) and `bubble.jsx` (simplex noise plasma orb).
- **`<image-slot>` custom element** (`src/image-slot.js`) — a vanilla Web Component for drag-and-drop image placement with crop/reframe. Persists state to `.image-slots.state.json` via `window.omelette` (a local dev file bridge). Slots appear as text labels in production.

### Pages

- `index.html` → main page, loads all `src/*.jsx` components
- `about.html` → about page, loads `src/about.jsx`

### Component load order matters

`index.html` loads scripts sequentially. `app.jsx` is last and depends on all other components being registered on `window` first. When adding a new component, add its `<script type="text/babel">` tag before `app.jsx`.

### Scroll architecture

`scrollscene.jsx` manages the main scroll-driven animation. It uses a `requestAnimationFrame` loop reading a tall scroll track element's `getBoundingClientRect()` to compute progress `p ∈ [0,1]`. All child animations (TV zoom, cube radial blast) derive from this single `p` value. `manifesto.jsx` and `cta.jsx` use the same pattern independently for their sections.

## Design System

Three colors only — never introduce new ones:

| Token | Value | Use |
|---|---|---|
| `--ink` | `#000000` | Background/base |
| `--paper` | `#F9EFE8` | Text/lines |
| `--volt` | `#FDDA10` | Accent/active states |

Sub-tones are done with opacity: `--paper-50`, `--paper-25`, `--paper-12`, `--paper-06`, `--line`. Never use grey hex values.

**Fonts:** `Geologica` (display/headlines) and `JetBrains Mono` (OSD labels, tech readouts, indicators). Both loaded from Google Fonts in the HTML `<head>`.

Full design and component math specs: `DESIGN.md` and `ARCHITECTURE.md`.
