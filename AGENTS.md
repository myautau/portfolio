# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

## Prototype-specific design direction

- Use `https://drab-guides-391061.framer.app` as the visual reference for the portfolio: compact dark editorial layout, independently scrolling About/Work panes on desktop, a single long flow with a sticky section switcher on mobile, and masonry-style project galleries.
- The user specifically likes the reference typography. Use Switzer for supported glyphs and a visually close Cyrillic fallback for Russian copy.
- Preserve Viktoria Matveeva's portfolio content, projects, resume, contact details, and existing local media assets when applying this design direction.
- Keep the untouched visual reference recreation available separately at `/reference` for side-by-side comparison with Viktoria's portfolio.
- Route changes on mobile and desktop should feel like the Framer reference: fade the current page with a slight blur and lift, reveal the next page softly from below, and always start the destination at the top without visibly scrolling the outgoing page.
- Freeze document scrolling during route handoff so navigation never shows a scroll-to-top jump.
- Reset document scroll in a route-keyed layout effect, before the incoming page paints; never defer it to a later animation frame.
- Match the Framer reference's gallery reveal behavior: each media card appears once when it enters the active scroll viewport, with opacity-only spring-like easing over roughly 1.5 seconds, no lift, scale, blur, or stagger. On mobile, cards reveal sequentially down the single column as the page scrolls.
- Keep videos and embedded players clipped to the same corner radius as adjacent gallery images.
- Animate video lightbox openings with a uniform scale so a landscape gallery preview never distorts the media while expanding.
- In the «Вместе.ру» case, preserve each gallery asset's original composition and pink backing. Apply the shared small corner radius only to the outer gallery and lightbox containers; do not flatten, crop, or otherwise redraw the source images to create rounding.
- In «Вместе.ру», use the same pink backing behind embedded video frames so dark iframe or player corners never show through.
- Keep «Карта разделов и функций Навигатора» at its original scale. Keep the established pink breathing room around «Сторис о новых функциях приложения» in both the gallery and full-screen viewer.
- Apply consistent Russian typography site-wide: keep short prepositions and conjunctions with the following word, em dashes with surrounding non-breaking spaces, and digit groups with non-breaking spaces, including text added during route changes.
- Keep contact links and «Все проекты» visually light like the Framer reference: regular weight, softened white, and a thin one-pixel underline that always inherits the text color. On hover, both text and underline use the reference color `#ababab`.
- Use the same small outer media radius for «Манжерок» and «Другие работы и концепты» as for «Вместе.ру». Preserve the source image files and their scale; mask pre-existing transparent corners with matching container backgrounds instead of editing the images.
- Do not push or publish changes to GitHub until Viktoria explicitly says «заливай».
- On the mobile homepage, keep project-card containers slightly taller than square so phone mockups have breathing room and do not overlap the captions.
- On the mobile homepage, position phone mockups slightly above the vertical center to keep the top gap compact.
- On mobile, use a consistent 16px horizontal gutter for text blocks, project cards, galleries, resume, contacts, and internal case pages.
- In mobile full-screen galleries, support horizontal swipe navigation and pinch/pan for image and video material; cap image zoom at native source resolution to avoid soft upscaling.
- In mobile full-screen galleries, keep the material title, «Закрыть», navigation arrows, and counter visible as a fixed layer above the media; every newly opened or swiped slide starts from the same unzoomed top position.
- On mobile, keep both the homepage «Обо мне / Работы» switcher and case «О проекте / Галерея» switcher fixed to the viewport top, outside animated route containers.
- Keep both mobile switchers compact with 12.5px labels, matching the mobile «Назад» button typography.
- Hide the case «О проекте / Галерея» switcher while the mobile gallery lightbox is open; the lightbox title, close control, arrows, and counter must remain fixed and visible above the media.
- Keep the gallery lightbox close to the Framer dark theme: a uniform dark backdrop without backdrop blur, restrained media shadow, and a shared-element opening transition from the selected card.
- Reveal gallery cards once as they enter the scroll viewport, using a restrained Framer-like fade, upward motion, and slight blur reduction with a short stagger.
- On mobile, keep experience role titles, company names, and dates at the same readable scale.
- On mobile, match the «Назад» button typography and compact height to the top section switcher.
- Keep project «Направление» values in Russian for consistency; retain only proper technology names such as Web3 in their established spelling.
- In case sections, keep the gap between a subsection heading and its description compact at 10px.
- On returning to the homepage from a project, replay the same restrained fade, upward motion, blur reduction, and short stagger used for the project gallery cards.
