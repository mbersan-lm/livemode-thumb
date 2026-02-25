## Problem

The user wants a backend endpoint (Supabase Edge Function) that receives a POST request with team parameters (names, colors, crest URLs) and returns a generated "Ao Vivo" thumbnail as a JPG image -- for use in n8n webhook automation.

## Challenge: Server-Side Rendering

The current "Ao Vivo" thumbnail is composed of multiple layers:

1. Black background (1280x720)
2. KV background image (`/kv/kv-ao-vivo.png`)
3. Left and right gradient overlays with `mix-blend-mode: overlay`
4. Glass panels with `backdrop-filter: blur(20px)` (simulated in export)
5. Overlay panels PNG (`/kv/overlay-ao-vivo-panels.png`)
6. Two team crests (centered in glass panels at positions 458,527 and 822,527)
7. Logos overlay (`/kv/logos-ao-vivo-europa.png`)

The frontend export already uses a **Native Canvas API** approach (not html2canvas), which translates well to server-side rendering. However, Supabase Edge Functions run on Deno and do not have access to the browser Canvas API or DOM.

## Approach: Deno Canvas + Image Composition

We will use `jsr:@aspect/canvas` (or `https://deno.land/x/canvas/mod.ts`), a Deno-native Canvas implementation that provides the same Canvas 2D API used in the frontend export. This avoids the need for Puppeteer (too heavy for edge functions) or Satori (designed for SVG/text, not image compositing).

### Static Assets

The overlay PNGs (`kv-ao-vivo.png`, `overlay-ao-vivo-panels.png`, `logos-ao-vivo-europa.png`, `logos-ao-vivo-conference.png`) are hosted on the published app URL. The edge function will fetch them from `https://livemode-thumb.lovable.app/kv/...`. Team crests come from external URLs provided in the request body.

## Plan

### 1. Create Edge Function `supabase/functions/generate-ao-vivo/index.ts`

**Input (POST JSON body):**

```json
{
  "nomeTimeA": "LYON",
  "nomeTimeB": "PORTO",
  "hexTimeA": "#000066",
  "hexTimeB": "#003399",
  "urlEscudoA": "https://example.com/lyon.png",
  "urlEscudoB": "https://example.com/porto.png",
  "template": "europaleague"
}
```

- `template` is optional, defaults to `"europaleague"` (alternative: `"conferenceleague"`)

**Logic (mirrors the existing `handleExportAoVivo` function):**

1. Create a 1280x720 canvas
2. Fill black background
3. Load and draw KV background from published URL
4. Draw left gradient overlay using `hexTimeA` with overlay composite operation
5. Draw right gradient overlay using `hexTimeB` with overlay composite operation
6. Simulate glass panels (blur + semi-transparent fill + border)
7. Draw overlay panels PNG
8. Load and draw team crests from `urlEscudoA` / `urlEscudoB`, centered at (458,527) and (822,527), max size 400px
9. Draw logos overlay (europa or conference)
10. Encode as PNG and return binary response

**Output:** JPG binary with `Content-Type: image/jpg`

### 2. Update `supabase/config.toml`

Add JWT verification disabled for public webhook access:

```toml
[functions.generate-ao-vivo]
verify_jwt = false
```

### 3. Technical Details

- **Canvas library**: `https://deno.land/x/canvas@v1.4.2/mod.ts` -- provides `createCanvas`, `loadImage` compatible with standard Canvas API
- **Image loading**: Fetch static assets from the published app URL and team crests from provided URLs
- **Glass panel simulation**: Same approach as frontend -- capture canvas state, apply blur filter within clipped regions, draw semi-transparent fills and borders
- **No authentication required**: This is a public webhook endpoint for n8n integration
- **Response**: Direct JPG binary (most useful for automation pipelines)

### 4. Endpoint URL

Once deployed, the endpoint will be:

```
https://sgpzvgpmqshxlrowopto.supabase.co/functions/v1/generate-ao-vivo
```

### Limitations

- The Deno canvas library's `blur` filter support may be limited. If blur simulation fails, the glass panels will be rendered with semi-transparent colored rectangles and white borders (visually close, without the frosted glass effect).
- No player photos in the automated version (only crests, gradients, and overlays).