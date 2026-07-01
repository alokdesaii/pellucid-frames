# Pellucid Frames — High-End Video Storytelling

This repository contains the source code for the official website of **Pellucid Frames**, a premium video storytelling agency. The site showcases a cinematic, motion-driven experience featuring interactive elements, WebGL shaders, scroll-driven animations, and a retro-tech aesthetic.

## Tech Stack

- **Core & Templating:** HTML5 & React 18 (loaded via unpkg CDN)
- **Styling:** Tailwind CSS (configured in-browser) & Vanilla CSS for custom layouts and animations
- **Script Processing:** Babel Standalone for in-browser JSX parsing (ideal for rapid prototyping and no-build local environments)
- **3D & Graphics:** Three.js (via unpkg CDN) for volumetric light rays and plasma orb WebGL shaders
- **Icons:** Custom SVG icon set (`icons.jsx`) matching Lucide design guidelines
- **State & Customization:** Self-contained Custom Web Component (`<image-slot>`) for draggable and persistent image layouts

---

## Workspace Structure

The project code is organized as follows:

```bash
 pellucid-frames/website/
 ├── assets/                      # SVG logos and symbols
 ├── css/                         # Visual styling directory
 │   └── styles.css               # Main visual and atmospheric styles
 ├── src/                         # React JSX components and core scripts
 │   ├── about.jsx                # About page component
 │   ├── app.jsx                  # Main page chrome, Nav, and overlay menu
 │   ├── bubble.jsx               # WebGL/Three.js simplex noise plasma bubble
 │   ├── cta.jsx                  # Scroll-driven linear-interpolated CTA component
 │   ├── footer.jsx               # Footer block with animated borders & branding
 │   ├── icons.jsx                # Inline Lucide-style SVG icon wrapper
 │   ├── image-slot.js            # Draggable and zoomable image custom component
 │   ├── intro.jsx                # 3-2-1 film countdown intro sequence
 │   ├── lightrays.jsx            # WebGL/Three.js volumetric lightrays shader
 │   ├── manifesto.jsx            # Scroll character-splitting reveal manifesto
 │   ├── orbit.jsx                # Ellipse elliptical offset orbit works carousel
 │   ├── retrotv.jsx              # Interactive 3D retro television centerpiece
 │   └── scrollscene.jsx          # Radial blast scroll track controller
 ├── uploads/                     # Content video and image assets
 │   ├── about/                   # About page content images
 │   └── ...
 ├── index.html                   # Main page entry point
 ├── about.html                   # About page entry point
 ├── ARCHITECTURE.md              # Technical architecture specs
 ├── DESIGN.md                    # Visual guidelines and brand design tokens
 ├── README.md                    # Project README and quick start
 └── package.json                 # Project configuration and script runner
```

---

## Local Development

Since the site handles JSX compilation in the browser via Babel, you do not need to install local npm packages to edit or build the site. However, to prevent CORS issues with CDN files and local state storage, you should run a local development server.

### 1. Launch a Local Web Server
You can spin up a quick server using Python or node. Run the following command from the project root directory:

```bash
# Using Node's npx http-server
npx http-server -p 8080 -c-1

# Or using Python 3
python3 -m http.server 8080
```

Open `http://localhost:8080/index.html` in your browser.

### 2. Custom Images & Persistence
The layout makes extensive use of the custom component `<image-slot>` in `src/orbit.jsx`. 
- Outside of development runtime, these slots display text labels.
- In local development, you can drag and drop any image (`.png`, `.jpg`, `.webp`, `.avif`) directly onto these slots to fill them.
- Once filled, you can double-click to reposition and scale the image.
- Image states and crop paths are written directly to a sidecar file named `.image-slots.state.json` inside the directory using the local development file bridge.

---

## Testing Guidelines

> [!IMPORTANT]
> **Manual Verification Only:** AI agents must not perform automated browser testing (e.g., using browser subagents, screenshots, or DOM inspection tools) unless explicitly requested by the user. All testing is conducted manually by the user.

---

## Documentation Index

For details on the branding design language and component architecture:
1. [DESIGN.md](DESIGN.md) — Comprehensive style guide, colors, typography, textures, and guidelines.
2. [ARCHITECTURE.md](ARCHITECTURE.md) — Deep dive into components, shader mathematics, scroll physics, and interaction logic.

