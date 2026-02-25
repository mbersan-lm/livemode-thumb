

## Plan: Update Edge Function for `competicao` and `modelo` Parameters

### What Changes

The edge function `generate-ao-vivo` will be updated to accept two new parameters and adjust the rendering accordingly.

### New Parameters

- **`competicao`** (string): Determines which logo overlay to use. Maps to the existing `template` parameter logic:
  - If contains "conference" → use Conference League logos
  - Otherwise → use Europa League logos
  - The text itself is NOT rendered on the image
- **`modelo`** (string): When set to `"sem narracao"`, applies the "Som Ambiente" overlay instead of the standard panels overlay

### Changes to `supabase/functions/generate-ao-vivo/index.ts`

1. **Extract new parameters** from the request body: `competicao` and `modelo`
2. **Use `competicao`** to determine which logo overlay to fetch (europa vs conference), working alongside the existing `template` parameter as a fallback
3. **When `modelo === "sem narracao"`**:
   - Skip rendering `overlay-ao-vivo-panels.png` (step 6 in current code)
   - After all other layers, render `overlay-som-ambiente.png` at the end (full canvas, like zIndex 100 in frontend)
4. **Keep everything else identical**: gradients, glass panels, crests, storage upload, JSON response

### Rendering Logic Summary

```text
Current flow:
  ... layers 1-5 ...
  6. overlay-ao-vivo-panels.png  ← ALWAYS drawn
  7. crests
  8. logos overlay (europa/conference)
  9. upload + return URL

Updated flow:
  ... layers 1-5 ...
  6. overlay-ao-vivo-panels.png  ← SKIP if modelo="sem narracao"
  7. crests
  8. logos overlay (selected by competicao OR template)
  9. overlay-som-ambiente.png    ← ADD if modelo="sem narracao"
  10. upload + return URL
```

### No Other Files Changed

Only the edge function file is modified. No frontend changes, no database changes, no new migrations.

