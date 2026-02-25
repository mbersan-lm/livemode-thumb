

## Plan: Fix Glass Panel Blur and Crest Sizes in Edge Function

### Problems Identified

Comparing the frontend export (`src/pages/AoVivo.tsx` lines 206-260) with the edge function (`supabase/functions/generate-ao-vivo/index.ts` lines 239-275):

**1. No blur effect on glass panels**
The frontend captures the current canvas into a temp canvas, clips to each panel shape, draws the temp canvas with `ctx.filter = 'blur(20px)'`, then fills with semi-transparent color. The edge function just fills with color -- no blur simulation at all.

**2. Crest sizes too small**
The frontend uses per-team size overrides via `getCrestMaxSize()`:
- Europa League default: **500px** (with exceptions: Brann 248px, Celta de Vigo 315px, Real Betis 400px, Malmo 450px, Nottingham Forest 360px)
- Conference League default: **400px** (with exception: AZ Alkmaar 280px)

The edge function hardcodes **400px** for all teams in both competitions.

### Changes to `supabase/functions/generate-ao-vivo/index.ts`

**A. Add blur simulation to `drawGlassPanel`**

Replicate the frontend technique:
1. Before drawing glass panels, snapshot the current canvas into a temp canvas
2. In `drawGlassPanel`, clip to the rounded rect, apply `ctx.filter = 'blur(20px)'`, draw the snapshot, reset filter, then fill with semi-transparent color, then draw border

```text
Before (simplified):
  clip → fill color → border

After (matching frontend):
  clip → filter blur(20px) → drawImage(snapshot) → filter none → fill color → restore → border
```

**B. Add crest size lookup**

Add a `getCrestMaxSize` function mirroring the frontend logic, using the team name as key. Update the two `drawImageCentered` calls to use the resolved max size instead of hardcoded 400.

The size map will use team names (since that's what the new payload provides):
- `"BRANN"` → 248
- `"CELTA DE VIGO"` → 315
- `"NOTTINGHAM FOREST"` → 360
- `"REAL BETIS"` → 400
- `"MALMÖ"` → 450
- `"AZ ALKMAAR"` → 280 (conference)
- Europa League default → 500
- Conference League default → 400

### No Other Files Changed

Only the edge function is modified. No frontend, database, or migration changes.

