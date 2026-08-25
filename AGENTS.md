# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

## Prototype-specific design direction

- Use `https://drab-guides-391061.framer.app` as the visual reference for the portfolio: compact dark editorial layout, independently scrolling About/Work panes on desktop, a single long flow with a sticky section switcher on mobile, and masonry-style project galleries.
- The user specifically likes the reference typography. Use Switzer for supported glyphs and a visually close Cyrillic fallback for Russian copy.
- Preserve Viktoria Matveeva's portfolio content, projects, resume, contact details, and existing local media assets when applying this design direction.
- Keep the untouched visual reference recreation available separately at `/reference` for side-by-side comparison with Viktoria's portfolio.
- Keep videos and embedded players clipped to the same corner radius as adjacent gallery images.
- In the «Вместе.ру» case, preserve each gallery asset's original composition and pink backing. Apply the shared small corner radius only to the outer gallery and lightbox containers; do not flatten, crop, or otherwise redraw the source images to create rounding.
- Keep «Карта разделов и функций Навигатора» at its original scale. Keep the established pink breathing room around «Сторис о новых функциях приложения» in both the gallery and full-screen viewer.
- Apply consistent Russian typography site-wide: keep short prepositions and conjunctions with the following word, em dashes with surrounding non-breaking spaces, and digit groups with non-breaking spaces, including text added during route changes.
- Keep contact links visually light like the Framer reference: regular weight, softened white, and a thin one-pixel underline.
- Use the same small outer media radius for «Манжерок» and «Другие работы и концепты» as for «Вместе.ру». Preserve the source image files and their scale; mask pre-existing transparent corners with matching container backgrounds instead of editing the images.
- Do not push or publish changes to GitHub until Viktoria explicitly says «заливай».
