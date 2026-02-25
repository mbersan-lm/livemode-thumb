

## Problem

The `getCrestMaxSize` function in `src/pages/AoVivo.tsx` (line 95-103) returns a flat `400px` for all Conference League teams. The preview component (`ThumbnailCanvasAoVivo.tsx`) has the `cl35` check for 280px, but the native canvas export does not.

## Solution

Update the `getCrestMaxSize` function to handle the AZ Alkmaar (`cl35`) case, returning `280` instead of `400`.

### Change in `src/pages/AoVivo.tsx` (line 96)

Replace:
```typescript
if (isConference) return 400;
```

With:
```typescript
if (isConference) {
  if (teamId === 'cl35') return 280;
  return 400;
}
```

This ensures the exported JPG matches the preview for AZ Alkmaar's crest size.

