import { createCanvas, loadImage } from "https://deno.land/x/canvas@v1.4.2/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const APP_URL = "https://livemode-thumb.lovable.app";

async function fetchImage(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch image: ${url} (${res.status})`);
  const buf = await res.arrayBuffer();
  return loadImage(new Uint8Array(buf));
}

function roundRect(
  ctx: any,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
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
  ctx: any,
  img: any,
  cx: number,
  cy: number,
  maxW: number,
  maxH: number
) {
  const scale = Math.min(maxW / img.width(), maxH / img.height(), 1);
  const w = img.width() * scale;
  const h = img.height() * scale;
  ctx.drawImage(img, cx - w / 2, cy - h / 2, w, h);
}

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
      hexTimeA = "#000000",
      hexTimeB = "#000000",
      urlEscudoA,
      urlEscudoB,
      template = "europaleague",
    } = body;

    if (!urlEscudoA || !urlEscudoB) {
      return new Response(
        JSON.stringify({ error: "urlEscudoA and urlEscudoB are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
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
    gradL.addColorStop(0, hexTimeA);
    gradL.addColorStop(0.5, "rgba(0,0,0,0)");
    ctx.fillStyle = gradL;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();

    // 4. Right gradient overlay (mix-blend-mode: overlay)
    ctx.save();
    ctx.globalCompositeOperation = "overlay";
    const gradR = ctx.createLinearGradient(W, 0, 0, 0);
    gradR.addColorStop(0, hexTimeB);
    gradR.addColorStop(0.5, "rgba(0,0,0,0)");
    ctx.fillStyle = gradR;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();

    // 5. Glass panels (simplified - no blur in Deno canvas)
    const drawGlassPanel = (
      x: number,
      y: number,
      w: number,
      h: number,
      color: string
    ) => {
      ctx.save();
      roundRect(ctx, x, y, w, h, 12);
      ctx.clip();
      // Semi-transparent fill
      ctx.fillStyle = color + "33";
      ctx.fillRect(x, y, w, h);
      ctx.restore();
      // Border
      ctx.save();
      roundRect(ctx, x, y, w, h, 12);
      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    };

    drawGlassPanel(291, 319, 334, 437, hexTimeA);
    drawGlassPanel(655, 319, 334, 437, hexTimeB);
    drawGlassPanel(-30, H - 145 + H * 0.05, 280, 145, "#000000");

    // 6. Overlay panels PNG
    const overlayImg = await fetchImage(
      `${APP_URL}/kv/overlay-ao-vivo-panels.png`
    );
    ctx.drawImage(overlayImg, 0, 0, W, H);

    // 7. Team crests
    const crestA = await fetchImage(urlEscudoA);
    drawImageCentered(ctx, crestA, 458, 527, 400, 400);

    const crestB = await fetchImage(urlEscudoB);
    drawImageCentered(ctx, crestB, 822, 527, 400, 400);

    // 8. Logos overlay
    const isConference = template === "conferenceleague";
    const logosSrc = isConference
      ? `${APP_URL}/kv/logos-ao-vivo-conference.png`
      : `${APP_URL}/kv/logos-ao-vivo-europa.png`;
    const logosImg = await fetchImage(logosSrc);
    ctx.drawImage(logosImg, 0, 0, W, H);

    // 9. Export as PNG
    const pngBuffer = canvas.toBuffer();

    return new Response(pngBuffer, {
      headers: {
        ...corsHeaders,
        "Content-Type": "image/png",
        "Content-Disposition": "inline; filename=ao-vivo.png",
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
