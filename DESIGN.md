# Design System & Brand Identity

This document defines the branding guidelines, color palette, typography, visual effects, and design parameters for the **Pellucid Frames** website. Adherence to this design system ensures visual integrity and consistent premium aesthetics as the site evolves.

---

## Brand Tone & Identity

Pellucid Frames is a premium video storytelling agency. The design tone is **cinematic, high-contrast, immersive, and retro-futuristic**. 
- **Pellucid** means translucently clear or easy to understand. The layout uses high-contrast typography, clear geometric alignments, and raw mechanical overlays to communicate clarity and precision.
- **Cinematic Atmosphere** is established via an ultra-dark canvas, volumetric light, organic textures (grain, CRT glow), and smooth motion curves that make the digital screen feel like physical projection.

---

## Color System

The website relies on a stark, three-color palette layered with semantic opacities.

### Core Swatches

| Name | Hex Code | Role | Context / Notes |
| :--- | :--- | :--- | :--- |
| **Ink** | `#000000` | Canvas / Base | Deep shadows, backing layers, and pure black elements. |
| **Paper** | `#F9EFE8` | Typography / Lines | Warm, organic off-white (RGB: `249, 239, 232`). Avoid pure `#FFF`. |
| **Volt** | `#FDDA10` | Accent / Highlight | Vibrant neon yellow/lime. Used for keyframes, active states, and focus. |

### Opacity Variables (Paper Scale)

Rather than introducing grey values, structural sub-elements and typography gradients are built using translucent layers of the **Paper** swatch over black:

```css
:root {
  --ink: #000;
  --paper: #F9EFE8;
  --volt: #FDDA10;
  
  --paper-50: rgba(249, 239, 232, 0.50);  /* Secondary text / description copy */
  --paper-25: rgba(249, 239, 232, 0.25);  /* Subtle chrome, inactive borders, scroll dots */
  --paper-12: rgba(249, 239, 232, 0.12);  /* Inactive slots, thin bounding boxes */
  --paper-06: rgba(249, 239, 232, 0.06);  /* Card container backing fills */
  --line:     rgba(249, 239, 232, 0.10);  /* Section horizontal/vertical divider lines */
}
```

---

## Typography

Typography establishes an editorial hierarchy with a high contrast between wide sans-serif and narrow monospaced faces.

### Fonts

1. **Display Font:** `Geologica`
   - **Characteristics:** Geometric sans-serif with a wide stance, wide-open counters, and clean apertures.
   - **Weights:** Light (`300`), Regular (`400`), Medium (`500`), SemiBold (`600`), Bold (`700`), ExtraBold (`800`), Black (`900`).
   - **Usage:** Headlines, wordmarks, big display quotes, section kickers.
2. **Mono Font:** `JetBrains Mono`
   - **Characteristics:** Tech-oriented, high-legibility monospaced typeface.
   - **Weights:** Regular (`400`), Medium (`500`), SemiBold (`600`).
   - **Usage:** Technical meta-readouts (e.g., OSDs, channel tags), scroll indicators, structural tags, labels.

---

## Textures & Atmosphere

Visual depth is achieved through layering textures over raw CSS/WebGL components.

### 1. Film Grain
A fixed overlay simulates organic analog film emulsion. It blocks pointer events and shifts coordinates at high speeds to avoid tiling artifacts.

- **Implementation:** Custom SVG fractal noise turbulence filter embedded as a repeating background image.
- **CSS Class:** `.grain`
- **Animation:** `grain 6s steps(6) infinite`
- **Opacity:** `0.05`

### 2. CRT Television Frame
The centerpiece retro-television mimics a physical cathode-ray tube monitor using three layered effects:

- **Scanlines (`.crt-scan`):** Repeating CSS linear gradients (`rgba(0,0,0,0.18)`).
- **Sweep Animation:** A vertical gradient beam sweeps down the screen (`sweep 5s linear infinite`).
- **Noise overlay (`.crt-noise`):** Tiny fractal grain animation at `0.06` opacity (`flick 1.6s steps(4) infinite`).
- **Vignette (`.crt-vignette`):** Deep radial shadow inset (`box-shadow: inset 0 0 70px rgba(0,0,0,0.85)`) to create the curved tube corner distortion.

### 3. Glassmorphic Overlays
Borders use hairline opacities, and sticky navigation headers implement blur backing:

- **CSS:** `backdrop-filter: blur(14px); background: rgba(0,0,0,0.6);`

---

## Layout, Grid & Alignment Rules

- **Rhythm & Spacing:** Avoid arbitrary dimensions. Padding and margin elements scale dynamically using viewport clamps (e.g., `clamp(20px, 4vw, 52px)`).
- **Safe Title Boundary:** In keeping with the video theme, structural details feature active crosshair brackets (`.cm-tl`, `.cm-tr`, `.cm-bl`, `.cm-br`) matching the **16:9 safe zone** guidelines.
- **Layout Flow:** Pinned sections use `sticky` positioning and full-viewport layouts (`100svh`) to keep animations relative to the viewport container.

---

## Motion & Transitions

- **Base Transitions:** Hover effects use a standard `0.25s` to `0.3s` duration with custom cubic beziers for organic velocity.
- **Scroll Interpolation:** Large-scale movements (the Retro TV zoom, the cube blast, the CTA text color transition) map scroll percentage directly to transform values via requestAnimationFrame, bypassing standard CSS timelines.
- **Reduced Motion:** If a user prefers reduced motion, animations must immediately settle into their final states (implemented via `window.matchMedia("(prefers-reduced-motion: reduce)")` checks).

---

## Editorial Spread System (About Page)

The **About Page** (`about.html` / `src/about.jsx`) shifts the website's tone from a dark 3D motion-driven homepage to a stark, high-contrast, type-driven editorial spread inspired by modern typographic design (e.g., Studio Herrström).

### 1. Visual Rhythm & Layout
- **Hero Video Masking:** The background video `uploads/about_hero_bg.mp4` is set to `20%` opacity, filtered with `grayscale(1) contrast(1.08) brightness(0.85)` to guarantee legibility of the off-white overlay text.
- **Two-Column Editorial Grid:** Bounded by `1480px` max-width. It divides sections using a grid structure:
  ```css
  grid-template-columns: minmax(0, 3.2fr) minmax(0, 8.8fr);
  gap: clamp(28px, 5vw, 96px);
  ```
- **Sticky Labels:** Monospaced indexes (e.g., `01`, `Meaning`) use sticky positioning (`top: 110px`) so they remain locked to the viewport while the main paragraph blocks scroll by.
- **Grayscale Figures:** Photographic images (`fig. 01`, `fig. 02`) are presented in raw grayscale with high contrast (`filter: grayscale(1) contrast(1.05)`) to align with the cinematic brand aesthetic.

### 2. Micro-Animations & Hover States
- **Services List Interaction:** Hovering over a service line item shifts its text color to Volt (`var(--volt)`) and slides an arrow into view (`translateX(0)` from `-6px` and fades opacity from `0` to `1`).
- **Closing CTA Button:** Hovering over the mailto link translates the arrow to the right (`translateX(10px)`) and glows the underline from paper white to Volt.

---

## Interactive Component Specifications

### 1. Retro Television Centerpiece
- **Parallax Tilt:** Responds dynamically to mouse coordinates. Transforms the TV face up to $\pm 10^\circ$ relative to center coordinates (`--rx` / `--ry`).
- **Physical Knob Dials:** Controls channel presets. Dial notches rotate visually based on selected index. Active channel notches trigger a Volt outline glow:
  ```css
  box-shadow: 0 0 0 1px var(--volt), 0 0 14px rgba(253, 218, 16, .4);
  ```

### 2. Scroll Indicator Navigation (ScrollNav)
- **Side Panel Indicator:** Renders vertical dots on the right viewport edge.
- **Active State Dots:** Uses an active class (`.sn-on`) to grow the dot diameter and project a Volt glow (`box-shadow: 0 0 8px var(--volt)`), while displaying the monospaced uppercase section tag.

### 3. Draggable `<image-slot>` Component
- **Aesthetic Slots:** Rendered in-viewport with dashed wireframe borders (`border: 1px dashed var(--paper-25)`) and centered monospaced labels.
- **Drag-Over State:** Triggers a transition to Volt outline borders when a valid image is dragged over the container.
- **Reframe overlay:** Double-clicking launches an active cropping box showing corner handles and dragging cursor overlays to guide user alignment.
