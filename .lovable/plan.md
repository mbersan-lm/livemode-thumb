

## Plan: Add Ligue 1 to Ao Vivo thumbnail

### 1. Add `color` to Ligue 1 teams (`src/data/teamsLigue1.ts`)
Add vibrant hex colors to all 18 teams (e.g., PSG `#004170`, Lyon `#1F3D7A`, Monaco `#E2001A`, Marseille `#2FAEE0`, Lille `#D32027`, etc.). Avoid near-white/near-black.

### 2. Expand `AoVivoTemplate` type (`src/components/ThumbnailCanvasAoVivo.tsx`)
- Change type from `'europaleague' | 'conferenceleague'` to `'europaleague' | 'conferenceleague' | 'ligue1'`
- Import `teamsLigue1` and add it to team resolution: `aoVivoTemplate === 'ligue1' ? teamsLigue1 : ...`
- Add Ligue 1 crest rendering block (same pattern as Europa/Conference, default max size 400px, with overrides for Lens and Lorient using their existing `maxSize` values)
- Add Ligue 1 logos overlay using `logos-ao-vivo-ligue1.png` (user will upload this file)

### 3. Update `AoVivo.tsx` page
- Import `teamsLigue1`
- Add `'ligue1'` to `aoVivoTemplate` state type
- Update `handleMatchDataChange` team lookup to include Ligue 1: `aoVivoTemplate === 'ligue1' ? teamsLigue1 : ...`
- Update `getCrestMaxSize` to handle Ligue 1 teams (use `maxSize` from teamsLigue1 data for Lens/Lorient overrides)
- Update export logic (`handleExportAoVivo`) to resolve teams from Ligue 1 list and use correct logos overlay
- Add `<SelectItem value="ligue1">Ligue 1</SelectItem>` to the template selector

### 4. Update `Print.tsx` route
- Import `teamsLigue1`
- Detect `competicao` containing "ligue" to set `aoVivoTemplate` to `'ligue1'` and use `teamsLigue1` for team resolution

### 5. Update Edge Function (`supabase/functions/generate-ao-vivo/index.ts`)
- Add `ligue1Teams` registry with all 18 teams, slugs, crest paths and colors
- Update `findTeam` to search Ligue 1 when `competicao` contains "ligue"
- Add Ligue 1 logo overlay fetch and crest size overrides (Lens 262, Lorient 227)

### 6. User action required
Upload `logos-ao-vivo-ligue1.png` to `public/kv/`

