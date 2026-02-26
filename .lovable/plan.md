

## Plan: Update `/print` page layout

### Change: `src/pages/Print.tsx`

- Wrap `ThumbnailCanvasAoVivo` in a div with `id="thumbnail-container"` sized exactly 1280×720
- Remove the dynamic scale logic and resize listener
- Center the container on the page using flexbox on the outer wrapper
- Keep `overflow: hidden` on body and the container

