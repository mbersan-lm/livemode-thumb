

## Plan: Limit text Y position to bottom half of canvas

The `textBoxHeight` slider currently allows values 0–60%, controlling the `bottom` CSS position of the text block. To keep text in the bottom half, cap the max at 50% for all models **except** Thumb Principal with quadrant grid (Roda de Bobo), which keeps its current 0–60% range.

### Change: `src/components/cortes/CortesControls.tsx` (~line 2030-2034)

- Compute `maxTextY` based on model: if `thumbModel === 'thumb-principal' && useQuadrantGrid` → max 60, otherwise → max 50
- Update the Slider's `max` prop to use `maxTextY`
- Clamp current `textBoxHeight` if it exceeds the new max (optional safeguard in the onChange)

