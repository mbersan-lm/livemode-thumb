import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

async function describeReferenceImages(
  images: string[],
  apiKey: string
): Promise<string> {
  const contentParts: any[] = [
    {
      type: "text",
      text: "Describe these reference images in detail. Focus on: visual style, dominant colors, composition, objects/subjects, lighting, atmosphere, textures, and mood. Be very detailed and specific. Return ONLY the description text, nothing else.",
    },
  ];

  for (const img of images) {
    contentParts.push({
      type: "image_url",
      image_url: { url: img },
    });
  }

  const response = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        {
          role: "system",
          content:
            "You are an image analysis assistant. Describe images in rich visual detail for use as reference in image generation. Focus on style, colors, composition, subjects, lighting, and atmosphere.",
        },
        { role: "user", content: contentParts },
      ],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("Stage 1 (describe) error:", response.status, text);
    throw new Error(`Stage 1 failed: ${response.status}`);
  }

  const data = await response.json();
  const description = data.choices?.[0]?.message?.content || "";
  return description;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, reference_images } = await req.json();

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

    const hasRefs = reference_images && Array.isArray(reference_images) && reference_images.length > 0;

    console.log("Payload size (bytes):", JSON.stringify({ prompt, reference_images }).length);

    // Stage 1: Describe reference images (if any)
    let referenceDescription = "";
    if (hasRefs) {
      console.log(`Describing ${reference_images.length} reference images...`);
      try {
        referenceDescription = await describeReferenceImages(reference_images, LOVABLE_API_KEY);
        console.log("Reference description length:", referenceDescription.length);
      } catch (e) {
        console.error("Stage 1 error:", e);
        // Continue without description rather than failing entirely
      }
    }

    // Stage 2: Generate image using TEXT-ONLY prompt
    let finalPrompt = prompt;
    if (referenceDescription) {
      finalPrompt = `${prompt}\n\nUse the following visual reference as inspiration for the style, colors, composition and mood:\n${referenceDescription}`;
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
            content: `Generate a high-quality image in 16:9 aspect ratio (1280x720 pixels). The image should be photographic/realistic style, vivid colors, high detail. Do NOT include any text or watermarks in the image.\n\nPrompt: ${finalPrompt}`,
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
      console.error("Stage 2 (generate) error:", response.status, text);
      return new Response(
        JSON.stringify({ error: "Erro no gateway de IA" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

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
