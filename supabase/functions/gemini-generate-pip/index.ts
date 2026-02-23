import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

async function describeReferenceImages(
  apiKey: string,
  images: string[],
  userPrompt: string
): Promise<string> {
  const contentParts: any[] = [
    {
      type: "text",
      text: `The user wants to generate an image with this prompt: "${userPrompt}". They attached reference images below. Describe each reference image in detail — colors, composition, lighting, subjects, style, mood — so that another AI model can recreate a similar aesthetic without seeing the originals. Be specific and visual. Write in English.`,
    },
  ];

  for (const img of images) {
    if (typeof img === "string" && img.length > 0) {
      contentParts.push({
        type: "image_url",
        image_url: { url: img },
      });
    }
  }

  const resp = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        {
          role: "user",
          content: contentParts,
        },
      ],
    }),
  });

  if (!resp.ok) {
    const t = await resp.text();
    console.error("Vision describe error:", resp.status, t);
    throw new Error("Não foi possível analisar as imagens de referência.");
  }

  const data = await resp.json();
  return data.choices?.[0]?.message?.content || "";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.text();
    console.log("Payload size (bytes):", body.length);

    if (body.length > 5 * 1024 * 1024) {
      return new Response(
        JSON.stringify({ error: "Payload muito grande. Reduza o tamanho das imagens de referência." }),
        { status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { prompt, reference_images } = JSON.parse(body);

    if (!prompt || typeof prompt !== "string") {
      return new Response(
        JSON.stringify({ error: "prompt is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Step 1: If reference images exist, describe them with a vision model
    let referenceDescription = "";
    const hasRefs = reference_images && Array.isArray(reference_images) && reference_images.length > 0;

    if (hasRefs) {
      console.log("Describing", reference_images.length, "reference images...");
      referenceDescription = await describeReferenceImages(LOVABLE_API_KEY, reference_images, prompt);
      console.log("Reference description length:", referenceDescription.length);
    }

    // Step 2: Generate image with text-only prompt (enriched with reference descriptions)
    let enrichedPrompt = prompt;
    if (referenceDescription) {
      enrichedPrompt = `${prompt}\n\nIMPORTANT VISUAL REFERENCES — match the style, mood, colors, and composition described below:\n${referenceDescription}`;
    }

    const response = await fetch(GATEWAY_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-pro-image-preview",
        messages: [
          {
            role: "system",
            content:
              "You are an image generation assistant. Generate exactly one image based on the user's description. The image MUST be in 16:9 aspect ratio. Make it photographic, high quality, vivid and detailed. Do not add any text overlays or watermarks.",
          },
          {
            role: "user",
            content: `Generate a high-quality image in 16:9 aspect ratio (1280x720 pixels). The image should be photographic/realistic style, vivid colors, high detail. Do NOT include any text or watermarks in the image.\n\nPrompt: ${enrichedPrompt}`,
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit excedido. Tente novamente em alguns segundos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes. Adicione créditos ao workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(
        JSON.stringify({ error: "Erro no gateway de IA" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();

    // Try multiple paths to find the generated image
    let imageUrl: string | undefined;
    imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl) {
      const content = data.choices?.[0]?.message?.content;
      if (Array.isArray(content)) {
        for (const part of content) {
          if (part.type === "image_url" && part.image_url?.url) {
            imageUrl = part.image_url.url;
            break;
          }
          if (part.type === "image" && part.image_url?.url) {
            imageUrl = part.image_url.url;
            break;
          }
          if (part.inline_data?.data) {
            imageUrl = `data:${part.inline_data.mime_type || "image/png"};base64,${part.inline_data.data}`;
            break;
          }
        }
      }
    }

    if (!imageUrl) {
      imageUrl = data.choices?.[0]?.images?.[0]?.url;
    }

    if (!imageUrl) {
      console.error("No image found. Response:", JSON.stringify(data).substring(0, 500));
      return new Response(
        JSON.stringify({ error: "Nenhuma imagem foi gerada. Tente outro prompt." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ image_base64: imageUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("gemini-generate-pip error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
