

## Plan: Create `/print` Route for External Screenshot Service

### Summary

Create a new page at `/print` that reads query string parameters, resolves team data internally, and renders only the `ThumbnailCanvasAoVivo` component in "sem narracao" mode -- no UI, no scrollbar, full viewport.

### New File: `src/pages/Print.tsx`

- Read query params: `timeA`, `timeB`, `competicao`, `modelo`
- Determine competition: if `competicao` contains "conference" → use `teamsConferenceLeague`, otherwise → `teamsAoVivo`
- Find teams by name (case-insensitive partial match against the team arrays)
- Render `ThumbnailCanvasAoVivo` with:
  - `showSomAmbiente = true` (always "sem narracao" mode)
  - `aoVivoTemplate` = `'conferenceleague'` or `'europaleague'` based on `competicao`
  - `gradientLeftColor` / `gradientRightColor` / `panelLeftColor` / `panelRightColor` = `#000000`
  - No player photos (null)
  - `matchData` populated with the resolved team IDs
- Page styling: `overflow: hidden`, no padding/margin, body scrollbar hidden via useEffect
- The 1280x720 canvas scaled to fill the viewport using CSS `transform: scale()` calculated from `window.innerWidth / 1280`

### Edit: `src/App.tsx`

- Add route: `<Route path="/print" element={<Print />} />`

### Example URL

```
https://livemode-thumb.lovable.app/print?timeA=GENK&timeB=DINAMO ZAGREB&competicao=Europa League&modelo=sem narracao
```

### No backend changes. No Edge Function changes.

