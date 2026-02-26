import { createCanvas, loadImage } from "https://deno.land/x/canvas@v1.4.2/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.97.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const APP_URL = "https://livemode-thumb.lovable.app";

// ── Team registry (name → crest slug) ──────────────────────────────
interface TeamEntry { slug: string; crest_url: string; color: string; }

const europaLeagueTeams: Record<string, TeamEntry> = {
  "ASTON VILLA":        { slug: "av-aston-villa",        crest_url: "/crests/av-aston-villa.png", color: "#670E36" },
  "BASEL":              { slug: "av-basel",               crest_url: "/crests/av-basel.png", color: "#D41F2C" },
  "BOLOGNA":            { slug: "av-bologna",             crest_url: "/crests/av-bologna.png", color: "#1A2F68" },
  "BRAGA":              { slug: "av-braga",               crest_url: "/crests/av-braga.png", color: "#C8102E" },
  "BRANN":              { slug: "av-brann",               crest_url: "/crests/av-brann.png", color: "#D42A2A" },
  "CELTA DE VIGO":      { slug: "av-celta-de-vigo",       crest_url: "/crests/av-celta-de-vigo.png", color: "#8BBCE8" },
  "CELTICS":            { slug: "av-celtics",             crest_url: "/crests/av-celtics.png", color: "#1B8A3D" },
  "DINAMO ZAGREB":      { slug: "av-dinamo-zagreb",       crest_url: "/crests/av-dinamo-zagreb.png", color: "#1C3F94" },
  "ESTRELA VERMELHA":   { slug: "av-estrela-vermelha",    crest_url: "/crests/av-estrela-vermelha.png", color: "#E2001A" },
  "FENERBAHÇE":         { slug: "av-fenerbahce",          crest_url: "/crests/av-fenerbahce.png", color: "#FFED00" },
  "FERENCVÁROS":        { slug: "av-ferencvaros",         crest_url: "/crests/av-ferencvaros.png", color: "#00843D" },
  "FEYENOORD":          { slug: "av-feyenoord",           crest_url: "/crests/av-feyenoord.png", color: "#E3001B" },
  "FREIBURGO":          { slug: "av-freiburgo",           crest_url: "/crests/av-freiburgo.png", color: "#D40027" },
  "FSCB":               { slug: "av-fscb",                crest_url: "/crests/av-fscb.png", color: "#E4002B" },
  "GENK":               { slug: "av-genk",                crest_url: "/crests/av-genk.png", color: "#0053A0" },
  "GO AHEAD EAGLES":    { slug: "av-go-ahead-eagles",     crest_url: "/crests/av-go-ahead-eagles.png", color: "#E3001B" },
  "LILLE":              { slug: "av-lille",                crest_url: "/crests/av-lille.png", color: "#D32027" },
  "LUDOGORETS":         { slug: "av-ludogorets",          crest_url: "/crests/av-ludogorets.png", color: "#006B3F" },
  "LYON":               { slug: "av-lyon",                crest_url: "/crests/av-lyon.png", color: "#1F3D7A" },
  "MACCABI TEL AVIV":   { slug: "av-maccabi",             crest_url: "/crests/av-maccabi.png", color: "#F5C518" },
  "MALMÖ":              { slug: "av-malmo",               crest_url: "/crests/av-malmo.png", color: "#75C8E5" },
  "MIDTJYLLAND":        { slug: "av-midtjylland",         crest_url: "/crests/av-midtjylland.png", color: "#D4213D" },
  "NICE":               { slug: "av-nice",                crest_url: "/crests/av-nice.png", color: "#C8102E" },
  "NOTTINGHAM FOREST":  { slug: "av-nottingham-forest",   crest_url: "/crests/av-nottingham-forest.png", color: "#DD0000" },
  "PANATHINAIKOS":      { slug: "av-panathinaikos",       crest_url: "/crests/av-panathinaikos.png", color: "#006633" },
  "PAOK":               { slug: "av-paok",                crest_url: "/crests/av-paok.png", color: "#2D2D2D" },
  "PORTO":              { slug: "av-porto",               crest_url: "/crests/av-porto.png", color: "#003893" },
  "RANGERS":            { slug: "av-rangers",             crest_url: "/crests/av-rangers.png", color: "#0055B7" },
  "REAL BETIS":         { slug: "av-real-betis",           crest_url: "/crests/av-real-betis.png", color: "#00954C" },
  "RED BULL SALZBURG":  { slug: "av-red-bull-salzburg",    crest_url: "/crests/av-red-bull-salzburg.png", color: "#D71920" },
  "ROMA":               { slug: "av-roma",                crest_url: "/crests/av-roma.png", color: "#C8102E" },
  "STURM GRAZ":         { slug: "av-sturm-graz",          crest_url: "/crests/av-sturm-graz.png", color: "#2D2D2D" },
  "UTRECHT":            { slug: "av-utrecht",             crest_url: "/crests/av-utrecht.png", color: "#D4213D" },
  "VfB STUTTGART":      { slug: "av-vfb-stuttgart",        crest_url: "/crests/av-vfb-stuttgart.png", color: "#E32219" },
  "VIKTORIA PLZEŇ":     { slug: "av-viktoria-plzen",      crest_url: "/crests/av-viktoria-plzen.png", color: "#D4213D" },
  "YOUNG BOYS":         { slug: "av-young-boys",           crest_url: "/crests/av-young-boys.png", color: "#FFD200" },
};

const conferenceLeagueTeams: Record<string, TeamEntry> = {
  "ABERDEEN":           { slug: "cl-aberdeen",            crest_url: "/crests/cl-aberdeen.png", color: "#D4213D" },
  "AZ ALKMAAR":         { slug: "cl-az-alkmaar",          crest_url: "/crests/cl-az-alkmaar.png", color: "#CC0000" },
  "AEK ATENAS":         { slug: "cl-aek-atenas",          crest_url: "/crests/cl-aek-atenas.png", color: "#FFD200" },
  "AEK LARNACA":        { slug: "cl-aek-larnaca",         crest_url: "/crests/cl-aek-larnaca.png", color: "#006B3F" },
  "BRATISLAVA":         { slug: "cl-bratislava",           crest_url: "/crests/cl-bratislava.png", color: "#0055A4" },
  "BREIÐABLIK":         { slug: "cl-breidablik",           crest_url: "/crests/cl-breidablik.png", color: "#1E90FF" },
  "CELJE":              { slug: "cl-celje",                crest_url: "/crests/cl-celje.png", color: "#FFD200" },
  "CRAIOVA":            { slug: "cl-craiova",              crest_url: "/crests/cl-craiova.png", color: "#003DA5" },
  "CRYSTAL PALACE":     { slug: "cl-crystal-palace",       crest_url: "/crests/cl-crystal-palace.png", color: "#1B458F" },
  "DRITA":              { slug: "cl-drita",                crest_url: "/crests/cl-drita.png", color: "#0055A4" },
  "FIORENTINA":         { slug: "cl-fiorentina",           crest_url: "/crests/cl-fiorentina.png", color: "#6A28B1" },
  "HÄCKEN":             { slug: "cl-hacken",               crest_url: "/crests/cl-hacken.png", color: "#FFD200" },
  "HAMRUN SPARTANS":    { slug: "cl-hamrun-spartans",      crest_url: "/crests/cl-hamrun-spartans.png", color: "#D4213D" },
  "JAGIELLONIA":        { slug: "cl-jagiellonia",          crest_url: "/crests/cl-jagiellonia.png", color: "#FFD200" },
  "KuPS":               { slug: "cl-kups",                 crest_url: "/crests/cl-kups.png", color: "#FFD200" },
  "LAUSANNE SPORT":     { slug: "cl-lausanne-sport",       crest_url: "/crests/cl-lausanne-sport.png", color: "#003DA5" },
  "LECH POZNAŃ":        { slug: "cl-lech-poznan",          crest_url: "/crests/cl-lech-poznan.png", color: "#004B93" },
  "LEGIA VARSÓVIA":     { slug: "cl-legia-varsovia",       crest_url: "/crests/cl-legia-varsovia.png", color: "#006B3F" },
  "LINCOLN RED IMPS":   { slug: "cl-lincoln-red-imps",     crest_url: "/crests/cl-lincoln-red-imps.png", color: "#E2001A" },
  "MAINZ":              { slug: "cl-mainz",                crest_url: "/crests/cl-mainz.png", color: "#C8102E" },
  "NOAH":               { slug: "cl-noah",                 crest_url: "/crests/cl-noah.png", color: "#E25822" },
  "OMONIA":             { slug: "cl-omonia",               crest_url: "/crests/cl-omonia.png", color: "#00843D" },
  "RAKÓW":              { slug: "cl-rakow",                crest_url: "/crests/cl-rakow.png", color: "#D4213D" },
  "RAPID VIENA":        { slug: "cl-rapid-viena",          crest_url: "/crests/cl-rapid-viena.png", color: "#006B3F" },
  "RAYO VALLECANO":     { slug: "cl-rayo-vallecano",       crest_url: "/crests/cl-rayo-vallecano.png", color: "#E4002B" },
  "RIJEKA":             { slug: "cl-rijeka",               crest_url: "/crests/cl-rijeka.png", color: "#0055A4" },
  "SAMSUNSPOR":         { slug: "cl-samsunspor",           crest_url: "/crests/cl-samsunspor.png", color: "#D4213D" },
  "SHAKHTAR DONETSK":   { slug: "cl-shakhtar-donetsk",     crest_url: "/crests/cl-shakhtar-donetsk.png", color: "#F26522" },
  "SHAMROCK ROVERS":    { slug: "cl-shamrock-rovers",      crest_url: "/crests/cl-shamrock-rovers.png", color: "#006B3F" },
  "SHELBOURNE":         { slug: "cl-shelbourne",           crest_url: "/crests/cl-shelbourne.png", color: "#D4213D" },
  "SHKËNDIJA":          { slug: "cl-shkendija",            crest_url: "/crests/cl-shkendija.png", color: "#D4213D" },
  "SIGMA":              { slug: "cl-sigma",                crest_url: "/crests/cl-sigma.png", color: "#0055A4" },
  "SPARTA PRAGA":       { slug: "cl-sparta-praga",         crest_url: "/crests/cl-sparta-praga.png", color: "#8B0000" },
  "STRASBOURG":         { slug: "cl-strasbourg",           crest_url: "/crests/cl-strasbourg.png", color: "#0055A4" },
  "ZRINJSKI":           { slug: "cl-zrinjski",             crest_url: "/crests/cl-zrinjski.png", color: "#D4213D" },
};

function findTeam(name: string, isConference: boolean): TeamEntry | null {
  const registry = isConference ? conferenceLeagueTeams : europaLeagueTeams;
  const upper = name.toUpperCase();
  for (const [key, entry] of Object.entries(registry)) {
    if (key.toUpperCase() === upper) return entry;
  }
  for (const [key, entry] of Object.entries(registry)) {
    if (key.toUpperCase().includes(upper) || upper.includes(key.toUpperCase())) return entry;
  }
  return null;
}

// ── Crest size overrides (matching frontend) ────────────────────────
const europaLeagueSizeOverrides: Record<string, number> = {
  "BRANN": 248,
  "CELTA DE VIGO": 315,
  "NOTTINGHAM FOREST": 360,
  "REAL BETIS": 400,
  "MALMÖ": 450,
  "MALMO": 450,
};

const conferenceLeagueSizeOverrides: Record<string, number> = {
  "AZ ALKMAAR": 280,
  "CRAIOVA": 440,
};

function getCrestMaxSize(teamName: string, isConference: boolean): number {
  const upper = teamName.toUpperCase();
  if (isConference) {
    return conferenceLeagueSizeOverrides[upper] ?? 400;
  }
  return europaLeagueSizeOverrides[upper] ?? 500;
}

// ── Helpers ─────────────────────────────────────────────────────────

async function fetchImage(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch image: ${url} (${res.status})`);
  const buf = await res.arrayBuffer();
  return loadImage(new Uint8Array(buf));
}

function roundRect(
  ctx: any, x: number, y: number, w: number, h: number, r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawImageCentered(
  ctx: any, img: any, cx: number, cy: number, maxW: number, maxH: number
) {
  const scale = Math.min(maxW / img.width(), maxH / img.height(), 1);
  const w = img.width() * scale;
  const h = img.height() * scale;
  ctx.drawImage(img, cx - w / 2, cy - h / 2, w, h);
}

// ── Main handler ────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const {
      nomeTimeA = "",
      nomeTimeB = "",
      competicao = "",
      modelo = "",
      // Legacy params (backward compat)
      hexTimeA,
      hexTimeB,
      urlEscudoA,
      urlEscudoB,
      template = "europaleague",
    } = body;

    const isConference = competicao
      ? competicao.toLowerCase().includes("conference")
      : template === "conferenceleague";

    // Resolve teams: new payload (by name) or legacy (direct URLs)
    let resolvedCrestA: string;
    let resolvedCrestB: string;
    let colorA = hexTimeA || "#000000";
    let colorB = hexTimeB || "#000000";

    if (nomeTimeA && nomeTimeB) {
      const teamA = findTeam(nomeTimeA, isConference);
      const teamB = findTeam(nomeTimeB, isConference);
      if (!teamA) {
        return new Response(
          JSON.stringify({ error: `Time não encontrado: "${nomeTimeA}"` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (!teamB) {
        return new Response(
          JSON.stringify({ error: `Time não encontrado: "${nomeTimeB}"` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      resolvedCrestA = `${APP_URL}${teamA.crest_url}`;
      resolvedCrestB = `${APP_URL}${teamB.crest_url}`;
      if (!hexTimeA) colorA = teamA.color;
      if (!hexTimeB) colorB = teamB.color;
    } else if (urlEscudoA && urlEscudoB) {
      resolvedCrestA = urlEscudoA;
      resolvedCrestB = urlEscudoB;
    } else {
      return new Response(
        JSON.stringify({ error: "Envie nomeTimeA/nomeTimeB ou urlEscudoA/urlEscudoB" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const W = 1280;
    const H = 720;
    const canvas = createCanvas(W, H);
    const ctx = canvas.getContext("2d");

    // 1. Black background
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, W, H);

    // 2. KV background
    const kvImg = await fetchImage(`${APP_URL}/kv/kv-ao-vivo.png`);
    ctx.drawImage(kvImg, 0, 0, W, H);

    // 3. Left gradient overlay (mix-blend-mode: overlay)
    ctx.save();
    ctx.globalCompositeOperation = "overlay";
    const gradL = ctx.createLinearGradient(0, 0, W, 0);
    gradL.addColorStop(0, colorA);
    gradL.addColorStop(0.5, "rgba(0,0,0,0)");
    ctx.fillStyle = gradL;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();

    // 4. Right gradient overlay (mix-blend-mode: overlay)
    ctx.save();
    ctx.globalCompositeOperation = "overlay";
    const gradR = ctx.createLinearGradient(W, 0, 0, 0);
    gradR.addColorStop(0, colorB);
    gradR.addColorStop(0.5, "rgba(0,0,0,0)");
    ctx.fillStyle = gradR;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();

    // 5. Glass panels with blur simulation (matching frontend)
    // Capture current canvas state for blur effect
    const tempCanvas = createCanvas(W, H);
    const tempCtx = tempCanvas.getContext("2d");
    tempCtx.drawImage(canvas, 0, 0);

    const drawGlassPanel = (
      x: number, y: number, w: number, h: number, color: string
    ) => {
      ctx.save();
      roundRect(ctx, x, y, w, h, 12);
      ctx.clip();
      // Draw blurred background within clipped area
      ctx.filter = "blur(20px)";
      ctx.drawImage(tempCanvas, 0, 0);
      ctx.filter = "none";
      // Semi-transparent fill
      ctx.fillStyle = color + "33";
      ctx.fillRect(x, y, w, h);
      ctx.restore();
      // Border (drawn outside clip)
      ctx.save();
      roundRect(ctx, x, y, w, h, 12);
      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    };

    drawGlassPanel(291, 319, 334, 437, colorA);
    drawGlassPanel(655, 319, 334, 437, colorB);
    drawGlassPanel(-30, H - 145 + H * 0.05, 280, 145, "#000000");

    // 6. Overlay panels PNG (skip if modelo = "sem narracao")
    const isSemNarracao = modelo === "sem narracao";
    if (!isSemNarracao) {
      const overlayImg = await fetchImage(
        `${APP_URL}/kv/overlay-ao-vivo-panels.png`
      );
      ctx.drawImage(overlayImg, 0, 0, W, H);
    }

    // 7. Team crests with dynamic sizing
    const maxSizeA = getCrestMaxSize(nomeTimeA || "", isConference);
    const maxSizeB = getCrestMaxSize(nomeTimeB || "", isConference);

    const crestA = await fetchImage(resolvedCrestA);
    drawImageCentered(ctx, crestA, 458, 527, maxSizeA, maxSizeA);

    const crestB = await fetchImage(resolvedCrestB);
    drawImageCentered(ctx, crestB, 822, 527, maxSizeB, maxSizeB);

    // 8. Logos overlay
    const logosSrc = isConference
      ? `${APP_URL}/kv/logos-ao-vivo-conference.png`
      : `${APP_URL}/kv/logos-ao-vivo-europa.png`;
    const logosImg = await fetchImage(logosSrc);
    ctx.drawImage(logosImg, 0, 0, W, H);

    // 9. Som Ambiente overlay (add if modelo = "sem narracao")
    if (isSemNarracao) {
      const somAmbienteImg = await fetchImage(
        `${APP_URL}/kv/overlay-som-ambiente.png`
      );
      ctx.drawImage(somAmbienteImg, 0, 0, W, H);
    }

    // 9. Upload to Storage and return public URL
    const pngBuffer = canvas.toBuffer();

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const rand = Math.random().toString(36).substring(2, 8);
    const fileName = `ao-vivo/${Date.now()}-${rand}.png`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("thumbnails")
      .upload(fileName, pngBuffer, {
        contentType: "image/png",
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    const { data: urlData } = supabaseAdmin.storage
      .from("thumbnails")
      .getPublicUrl(fileName);

    return new Response(JSON.stringify({ url: urlData.publicUrl }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error generating thumbnail:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
