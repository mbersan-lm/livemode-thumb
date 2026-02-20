import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const UPSCALE_PROMPT = `Enhance the image to true photorealistic realism while fully preserving composition, proportions, identity, and emotion.
No beautification, stylization, or facial changes.
Add natural imperfections: subtle asymmetry, uneven eyes/brows/lips, realistic skin texture with pores, fine lines, tiny blemishes, mild discoloration, uneven tones, and natural micro-shadows.
No smooth or plastic skin.
Improve clarity and depth without over-sharpening.
Enhance micro-details: hair strands, fabric fibers, wrinkles, dust, wear, fingerprints, reflections.
Use natural real-world lighting with imperfect shadows and soft highlights.
Ultra-high-resolution, clean upscale, authentic photographic look.
Keep the composition EXACTLY the same. Do not move, resize, crop, or reframe anything. Preserve any transparent background exactly as-is.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image_base64 } = await req.json();

    if (!image_base64) {
      return new Response(
        JSON.stringify({ error: "image_base64 is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Ensure image_base64 is a valid data URL
    const imageUrl = image_base64.startsWith("data:")
      ? image_base64
      : `data:image/png;base64,${image_base64}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-pro-image-preview",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: UPSCALE_PROMPT,
              },
              {
                type: "image_url",
                image_url: { url: imageUrl },
              },
            ],
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições atingido. Tente novamente em instantes." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes. Adicione créditos para continuar." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      throw new Error(`AI gateway returned ${response.status}: ${errText}`);
    }

    const data = await response.json();

    // Try to extract image from the response
    // The Gemini image model may return image data in different formats
    let resultBase64: string | null = null;

    // Check choices[0].message.content for image parts
    const content = data?.choices?.[0]?.message?.content;
    if (Array.isArray(content)) {
      for (const part of content) {
        if (part.type === "image_url" && part.image_url?.url) {
          resultBase64 = part.image_url.url;
          break;
        }
      }
    }

    // Fallback: check images field
    if (!resultBase64) {
      const images = data?.choices?.[0]?.message?.images;
      if (Array.isArray(images) && images.length > 0) {
        resultBase64 = images[0]?.image_url?.url || images[0]?.url || null;
      }
    }

    if (!resultBase64) {
      console.error("Unexpected response structure:", JSON.stringify(data).slice(0, 500));
      throw new Error("Não foi possível extrair a imagem da resposta do Gemini.");
    }

    return new Response(
      JSON.stringify({ result_base64: resultBase64 }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("gemini-upscale error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
