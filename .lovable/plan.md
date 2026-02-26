

## Plan: Use team colors as default gradients in the edge function

### Change: `supabase/functions/generate-ao-vivo/index.ts`

**Add a `color` field to each team entry in the registries** (`europaLeagueTeams` and `conferenceLeagueTeams`), mirroring the exact hex values from `teamsAoVivo.ts` and `teamsConferenceLeague.ts`.

Update the `TeamEntry` interface:
```typescript
interface TeamEntry { slug: string; crest_url: string; color: string; }
```

**Use team color as fallback** instead of `#000000` (lines ~197-198). When teams are resolved by name, use `teamA.color` / `teamB.color` as defaults:
```typescript
// Before:
const colorA = hexTimeA || "#000000";
const colorB = hexTimeB || "#000000";

// After: resolved inside the name-based branch
const colorA = hexTimeA || teamA.color;
const colorB = hexTimeB || teamB.color;
```

This ensures the webhook-generated thumbnails use the same vibrant, balanced team colors we just implemented on the frontend.

