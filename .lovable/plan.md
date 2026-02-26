

### Plan: Replace Nantes crest only in Ao Vivo model

**Problem**: The Nantes crest needs to be different only in the Ao Vivo template, while keeping the existing crest for Melhores Momentos and Jogo Completo.

**Approach**: Add an optional `aoVivoCrestUrl` property to the Team interface, save the new crest file, and update the Ao Vivo canvas + edge function to prefer this property when rendering.

### Steps

1. **Copy uploaded crest to `public/crests/nantes-av.png`**

2. **Add `aoVivoCrestUrl` to Team interface** (`src/data/teams.ts`)
   - Add optional `aoVivoCrestUrl?: string` property

3. **Update Nantes entry in `teamsLigue1.ts`**
   - Add `aoVivoCrestUrl: '/crests/nantes-av.png'` to the Nantes team entry

4. **Update `ThumbnailCanvasAoVivo.tsx`**
   - In the Ligue 1 crest rendering blocks, use `(homeTeam as any).aoVivoCrestUrl || homeTeam.crest_url` instead of just `homeTeam.crest_url` (same for away)

5. **Update Edge Function** (`supabase/functions/generate-ao-vivo/index.ts`)
   - Add `aoVivoCrestUrl` to the Nantes entry in `ligue1Teams` registry so the automated pipeline uses the correct crest

