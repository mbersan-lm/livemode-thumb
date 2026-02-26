

## Plan: Fix Print Page to Render at 1920x1080

The canvas component is hardcoded at 1280x720. The external screenshot service captures whatever is on screen, so we need the rendered output to be exactly 1920x1080.

### Change: `src/pages/Print.tsx`

- Set the outer container to exactly `1920px × 1080px` (not `100vw/100vh`)
- Apply a fixed scale of `1920 / 1280 = 1.5` to the inner wrapper so the 1280x720 canvas fills 1920x1080 perfectly
- Remove the dynamic `window.innerWidth` resize logic — the dimensions are now fixed regardless of viewport
- Keep overflow hidden and no scrollbars

This ensures the screenshot service always captures a 1920x1080 frame with the thumbnail scaled proportionally to fill it.

