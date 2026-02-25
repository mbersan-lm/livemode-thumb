import satori, { init as initSatori } from "https://esm.sh/satori@0.10.14/wasm";
import initYoga from "https://esm.sh/yoga-wasm-web@0.3.3";
import { Resvg, initWasm } from "https://esm.sh/@resvg/resvg-wasm@2.6.2";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.97.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const APP_URL = "https://livemode-thumb.lovable.app";

// ── Team registry (name → crest slug) ──────────────────────────────
interface TeamEntry { slug: string; crest_url: string; }

const europaLeagueTeams: Record<string, TeamEntry> = {
  "ASTON VILLA":        { slug: "av-aston-villa",        crest_url: "/crests/av-aston-villa.png" },
  "BASEL":              { slug: "av-basel",               crest_url: "/crests/av-basel.png" },
  "BOLOGNA":            { slug: "av-bologna",             crest_url: "/crests/av-bologna.png" },
  "BRAGA":              { slug: "av-braga",               crest_url: "/crests/av-braga.png" },
  "BRANN":              { slug: "av-brann",               crest_url: "/crests/av-brann.png" },
  "CELTA DE VIGO":      { slug: "av-celta-de-vigo",       crest_url: "/crests/av-celta-de-vigo.png" },
  "CELTICS":            { slug: "av-celtics",             crest_url: "/crests/av-celtics.png" },
  "DINAMO ZAGREB":      { slug: "av-dinamo-zagreb",       crest_url: "/crests/av-dinamo-zagreb.png" },
  "ESTRELA VERMELHA":   { slug: "av-estrela-vermelha",    crest_url: "/crests/av-estrela-vermelha.png" },
  "FENERBAHÇE":         { slug: "av-fenerbahce",          crest_url: "/crests/av-fenerbahce.png" },
  "FERENCVÁROS":        { slug: "av-ferencvaros",         crest_url: "/crests/av-ferencvaros.png" },
  "FEYENOORD":          { slug: "av-feyenoord",           crest_url: "/crests/av-feyenoord.png" },
  "FREIBURGO":          { slug: "av-freiburgo",           crest_url: "/crests/av-freiburgo.png" },
  "FSCB":               { slug: "av-fscb",                crest_url: "/crests/av-fscb.png" },
  "GENK":               { slug: "av-genk",                crest_url: "/crests/av-genk.png" },
  "GO AHEAD EAGLES":    { slug: "av-go-ahead-eagles",     crest_url: "/crests/av-go-ahead-eagles.png" },
  "LILLE":              { slug: "av-lille",                crest_url: "/crests/av-lille.png" },
  "LUDOGORETS":         { slug: "av-ludogorets",          crest_url: "/crests/av-ludogorets.png" },
  "LYON":               { slug: "av-lyon",                crest_url: "/crests/av-lyon.png" },
  "MACCABI TEL AVIV":   { slug: "av-maccabi",             crest_url: "/crests/av-maccabi.png" },
  "MALMÖ":              { slug: "av-malmo",               crest_url: "/crests/av-malmo.png" },
  "MIDTJYLLAND":        { slug: "av-midtjylland",         crest_url: "/crests/av-midtjylland.png" },
  "NICE":               { slug: "av-nice",                crest_url: "/crests/av-nice.png" },
  "NOTTINGHAM FOREST":  { slug: "av-nottingham-forest",   crest_url: "/crests/av-nottingham-forest.png" },
  "PANATHINAIKOS":      { slug: "av-panathinaikos",       crest_url: "/crests/av-panathinaikos.png" },
  "PAOK":               { slug: "av-paok",                crest_url: "/crests/av-paok.png" },
  "PORTO":              { slug: "av-porto",               crest_url: "/crests/av-porto.png" },
  "RANGERS":            { slug: "av-rangers",             crest_url: "/crests/av-rangers.png" },
  "REAL BETIS":         { slug: "av-real-betis",           crest_url: "/crests/av-real-betis.png" },
  "RED BULL SALZBURG":  { slug: "av-red-bull-salzburg",    crest_url: "/crests/av-red-bull-salzburg.png" },
  "ROMA":               { slug: "av-roma",                crest_url: "/crests/av-roma.png" },
  "STURM GRAZ":         { slug: "av-sturm-graz",          crest_url: "/crests/av-sturm-graz.png" },
  "UTRECHT":            { slug: "av-utrecht",             crest_url: "/crests/av-utrecht.png" },
  "VfB STUTTGART":      { slug: "av-vfb-stuttgart",        crest_url: "/crests/av-vfb-stuttgart.png" },
  "VIKTORIA PLZEŇ":     { slug: "av-viktoria-plzen",      crest_url: "/crests/av-viktoria-plzen.png" },
  "YOUNG BOYS":         { slug: "av-young-boys",           crest_url: "/crests/av-young-boys.png" },
};

const conferenceLeagueTeams: Record<string, TeamEntry> = {
  "ABERDEEN":           { slug: "cl-aberdeen",            crest_url: "/crests/cl-aberdeen.png" },
  "AZ ALKMAAR":         { slug: "cl-az-alkmaar",          crest_url: "/crests/cl-az-alkmaar.png" },
  "AEK ATENAS":         { slug: "cl-aek-atenas",          crest_url: "/crests/cl-aek-atenas.png" },
  "AEK LARNACA":        { slug: "cl-aek-larnaca",         crest_url: "/crests/cl-aek-larnaca.png" },
  "BRATISLAVA":         { slug: "cl-bratislava",           crest_url: "/crests/cl-bratislava.png" },
  "BREIÐABLIK":         { slug: "cl-breidablik",           crest_url: "/crests/cl-breidablik.png" },
  "CELJE":              { slug: "cl-celje",                crest_url: "/crests/cl-celje.png" },
  "CRAIOVA":            { slug: "cl-craiova",              crest_url: "/crests/cl-craiova.png" },
  "CRYSTAL PALACE":     { slug: "cl-crystal-palace",       crest_url: "/crests/cl-crystal-palace.png" },
  "DRITA":              { slug: "cl-drita",                crest_url: "/crests/cl-drita.png" },
  "FIORENTINA":         { slug: "cl-fiorentina",           crest_url: "/crests/cl-fiorentina.png" },
  "HÄCKEN":             { slug: "cl-hacken",               crest_url: "/crests/cl-hacken.png" },
  "HAMRUN SPARTANS":    { slug: "cl-hamrun-spartans",      crest_url: "/crests/cl-hamrun-spartans.png" },
  "JAGIELLONIA":        { slug: "cl-jagiellonia",          crest_url: "/crests/cl-jagiellonia.png" },
  "KuPS":               { slug: "cl-kups",                 crest_url: "/crests/cl-kups.png" },
  "LAUSANNE SPORT":     { slug: "cl-lausanne-sport",       crest_url: "/crests/cl-lausanne-sport.png" },
  "LECH POZNAŃ":        { slug: "cl-lech-poznan",          crest_url: "/crests/cl-lech-poznan.png" },
  "LEGIA VARSÓVIA":     { slug: "cl-legia-varsovia",       crest_url: "/crests/cl-legia-varsovia.png" },
  "LINCOLN RED IMPS":   { slug: "cl-lincoln-red-imps",     crest_url: "/crests/cl-lincoln-red-imps.png" },
  "MAINZ":              { slug: "cl-mainz",                crest_url: "/crests/cl-mainz.png" },
  "NOAH":               { slug: "cl-noah",                 crest_url: "/crests/cl-noah.png" },
  "OMONIA":             { slug: "cl-omonia",               crest_url: "/crests/cl-omonia.png" },
  "RAKÓW":              { slug: "cl-rakow",                crest_url: "/crests/cl-rakow.png" },
  "RAPID VIENA":        { slug: "cl-rapid-viena",          crest_url: "/crests/cl-rapid-viena.png" },
  "RAYO VALLECANO":     { slug: "cl-rayo-vallecano",       crest_url: "/crests/cl-rayo-vallecano.png" },
  "RIJEKA":             { slug: "cl-rijeka",               crest_url: "/crests/cl-rijeka.png" },
  "SAMSUNSPOR":         { slug: "cl-samsunspor",           crest_url: "/crests/cl-samsunspor.png" },
  "SHAKHTAR DONETSK":   { slug: "cl-shakhtar-donetsk",     crest_url: "/crests/cl-shakhtar-donetsk.png" },
  "SHAMROCK ROVERS":    { slug: "cl-shamrock-rovers",      crest_url: "/crests/cl-shamrock-rovers.png" },
  "SHELBOURNE":         { slug: "cl-shelbourne",           crest_url: "/crests/cl-shelbourne.png" },
  "SHKËNDIJA":          { slug: "cl-shkendija",            crest_url: "/crests/cl-shkendija.png" },
  "SIGMA":              { slug: "cl-sigma",                crest_url: "/crests/cl-sigma.png" },
  "SPARTA PRAGA":       { slug: "cl-sparta-praga",         crest_url: "/crests/cl-sparta-praga.png" },
  "STRASBOURG":         { slug: "cl-strasbourg",           crest_url: "/crests/cl-strasbourg.png" },
  "ZRINJSKI":           { slug: "cl-zrinjski",             crest_url: "/crests/cl-zrinjski.png" },
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

async function toDataUri(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch: ${url} (${res.status})`);
  const buf = new Uint8Array(await res.arrayBuffer());
  // Encode to base64 in chunks to avoid stack overflow
  let binary = "";
  const chunkSize = 8192;
  for (let i = 0; i < buf.length; i += chunkSize) {
    const chunk = buf.subarray(i, Math.min(i + chunkSize, buf.length));
    for (let j = 0; j < chunk.length; j++) {
      binary += String.fromCharCode(chunk[j]);
    }
  }
  const b64 = btoa(binary);
  const ct = res.headers.get("content-type") || "image/png";
  return `data:${ct};base64,${b64}`;
}

// ── WASM initialization (cached across requests) ────────────────────
let wasmReady = false;

async function ensureWasm() {
  if (wasmReady) return;
  try {
    const [yogaWasm] = await Promise.all([
      fetch("https://unpkg.com/yoga-wasm-web@0.3.3/dist/yoga.wasm").then(r => r.arrayBuffer()),
      initWasm(
        fetch("https://unpkg.com/@resvg/resvg-wasm@2.6.2/index_bg.wasm")
      ),
    ]);
    const yoga = await initYoga(yogaWasm);
    initSatori(yoga);
    wasmReady = true;
  } catch (e) {
    // May already be initialized from a previous invocation in the same isolate
    if (String(e).includes("Already initialized")) {
      wasmReady = true;
    } else {
      throw e;
    }
  }
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
    await ensureWasm();

    const body = await req.json();
    const {
      nomeTimeA = "",
      nomeTimeB = "",
      competicao = "",
      modelo = "",
      hexTimeA,
      hexTimeB,
      urlEscudoA,
      urlEscudoB,
      template = "europaleague",
    } = body;

    const isConference = competicao
      ? competicao.toLowerCase().includes("conference")
      : template === "conferenceleague";

    let resolvedCrestA: string;
    let resolvedCrestB: string;
    const colorA = hexTimeA || "#000000";
    const colorB = hexTimeB || "#000000";

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
    } else if (urlEscudoA && urlEscudoB) {
      resolvedCrestA = urlEscudoA;
      resolvedCrestB = urlEscudoB;
    } else {
      return new Response(
        JSON.stringify({ error: "Envie nomeTimeA/nomeTimeB ou urlEscudoA/urlEscudoB" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const isSemNarracao = modelo === "sem narracao";
    const logosSrc = isConference
      ? `${APP_URL}/kv/logos-ao-vivo-conference.png`
      : `${APP_URL}/kv/logos-ao-vivo-europa.png`;

    const maxSizeA = getCrestMaxSize(nomeTimeA || "", isConference);
    const maxSizeB = getCrestMaxSize(nomeTimeB || "", isConference);

    // Prefetch all images as data URIs in parallel
    const fetchPromises: Record<string, Promise<string>> = {
      kvBg: toDataUri(`${APP_URL}/kv/kv-ao-vivo.png`),
      crestA: toDataUri(resolvedCrestA),
      crestB: toDataUri(resolvedCrestB),
      logos: toDataUri(logosSrc),
    };
    if (!isSemNarracao) {
      fetchPromises.panels = toDataUri(`${APP_URL}/kv/overlay-ao-vivo-panels.png`);
    }
    if (isSemNarracao) {
      fetchPromises.somAmbiente = toDataUri(`${APP_URL}/kv/overlay-som-ambiente.png`);
    }

    // Also fetch a font (satori requires at least one)
    const fontPromise = fetch(`${APP_URL}/fonts/Gilroy-Medium.ttf`).then(r => r.arrayBuffer());

    const keys = Object.keys(fetchPromises);
    const values = await Promise.all(Object.values(fetchPromises));
    const imgs: Record<string, string> = {};
    keys.forEach((k, i) => { imgs[k] = values[i]; });
    const fontData = await fontPromise;

    // ── Build satori element tree ────────────────────────────────────
    const W = 1280;
    const H = 720;

    // Helper to create absolute-positioned full-size image layer
    const fullImg = (src: string) => ({
      type: "img",
      props: {
        src,
        width: W,
        height: H,
        style: { position: "absolute" as const, top: 0, left: 0, width: W, height: H },
      },
    });

    const children: any[] = [
      // 1. KV background
      fullImg(imgs.kvBg),

      // 2. Left gradient (approximates overlay blend-mode)
      {
        type: "div",
        props: {
          style: {
            position: "absolute" as const,
            top: 0, left: 0, width: W, height: H,
            backgroundImage: `linear-gradient(to right, ${colorA}, rgba(0,0,0,0) 50%)`,
            opacity: 0.5,
          },
        },
      },

      // 3. Right gradient
      {
        type: "div",
        props: {
          style: {
            position: "absolute" as const,
            top: 0, left: 0, width: W, height: H,
            backgroundImage: `linear-gradient(to left, ${colorB}, rgba(0,0,0,0) 50%)`,
            opacity: 0.5,
          },
        },
      },

      // 4. Glass panel A
      {
        type: "div",
        props: {
          style: {
            position: "absolute" as const,
            left: 291, top: 319, width: 334, height: 437,
            backgroundColor: "rgba(0,0,0,0.2)",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.35)",
          },
        },
      },

      // 5. Glass panel B
      {
        type: "div",
        props: {
          style: {
            position: "absolute" as const,
            left: 655, top: 319, width: 334, height: 437,
            backgroundColor: "rgba(0,0,0,0.2)",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.35)",
          },
        },
      },

      // 6. Bottom-left panel
      {
        type: "div",
        props: {
          style: {
            position: "absolute" as const,
            left: -30, top: Math.round(H - 145 + H * 0.05), width: 280, height: 145,
            backgroundColor: "rgba(0,0,0,0.2)",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.35)",
          },
        },
      },
    ];

    // 7. Overlay panels (if not sem narracao)
    if (imgs.panels) {
      children.push(fullImg(imgs.panels));
    }

    // 8. Crest A (centered at 458, 527)
    children.push({
      type: "img",
      props: {
        src: imgs.crestA,
        width: maxSizeA,
        height: maxSizeA,
        style: {
          position: "absolute" as const,
          left: Math.round(458 - maxSizeA / 2),
          top: Math.round(527 - maxSizeA / 2),
          width: maxSizeA,
          height: maxSizeA,
          objectFit: "contain" as const,
        },
      },
    });

    // 9. Crest B (centered at 822, 527)
    children.push({
      type: "img",
      props: {
        src: imgs.crestB,
        width: maxSizeB,
        height: maxSizeB,
        style: {
          position: "absolute" as const,
          left: Math.round(822 - maxSizeB / 2),
          top: Math.round(527 - maxSizeB / 2),
          width: maxSizeB,
          height: maxSizeB,
          objectFit: "contain" as const,
        },
      },
    });

    // 10. Logos overlay
    children.push(fullImg(imgs.logos));

    // 11. Som ambiente overlay (if sem narracao)
    if (imgs.somAmbiente) {
      children.push(fullImg(imgs.somAmbiente));
    }

    const element = {
      type: "div",
      props: {
        style: {
          width: W,
          height: H,
          display: "flex" as const,
          position: "relative" as const,
          backgroundColor: "black",
        },
        children,
      },
    };

    // ── Render SVG with satori ───────────────────────────────────────
    const svg = await satori(element, {
      width: W,
      height: H,
      fonts: [
        {
          name: "Gilroy",
          data: fontData,
          style: "normal" as const,
          weight: 400,
        },
      ],
    });

    // ── Convert SVG to PNG with resvg ────────────────────────────────
    const resvg = new Resvg(svg, {
      fitTo: { mode: "width" as const, value: W },
    });
    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();

    // ── Upload to Storage and return public URL ──────────────────────
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
