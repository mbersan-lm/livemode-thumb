

## Plan: Add default team colors to Ao Vivo gradients

### 1. Add `color` field to Team interface (`src/data/teams.ts`)
- Add optional `color?: string` to the `Team` interface

### 2. Add colors to Europa League teams (`src/data/teamsAoVivo.ts`)
- Add a vibrant representative `color` hex to each of the 36 teams (e.g., Aston Villa `#670E36`, Porto `#003893`, Roma `#C8102E`, etc.)
- Colors must be vibrant — avoid near-white or near-black values

### 3. Add colors to Conference League teams (`src/data/teamsConferenceLeague.ts`)
- Same approach for all Conference League teams

### 4. Auto-set gradient colors when team is selected (`src/pages/AoVivo.tsx`)
- In `handleMatchDataChange`, when `homeTeamId` changes, look up the team's `color` and call `setGradientLeftColor(team.color)` (fallback to current value if no color)
- When `awayTeamId` changes, do the same for `setGradientRightColor`
- User can still manually override via the existing color pickers

