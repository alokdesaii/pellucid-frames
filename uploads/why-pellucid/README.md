# Why Pellucid — hero ring images

Drop 30 images here named `card-01.jpg` through `card-30.jpg`.

- Any card without a matching file shows a numbered placeholder instead.
- Recommended: landscape 3:2 crop (e.g. 600×400). Other ratios are cropped to fill.
- Filenames must match exactly (zero-padded, lowercase `.jpg`). To use a
  different extension, update the `src` in `src/why-pellucid.jsx`.

Ring layout (see `WP_RING_DEFS` in `src/why-pellucid.jsx`):
- card-01 … card-06 → inner ring
- card-07 … card-16 → middle ring
- card-17 … card-30 → outer ring

## Parallax bands (sections below the hero)

Drop `parallax-01.jpg` and `parallax-02.jpg` here — the full-bleed scrolling
image bands between the story sections. Until then they show a placeholder.

- Recommended: large landscape, at least 2000px wide (they cover full width and
  scroll with parallax, so give them height headroom).
