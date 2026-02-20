import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

    const { image_base64 } = await req.json();
    if (!image_base64) throw new Error('image_base64 is required');

    // Strip data URL prefix if present
    const base64Data = image_base64.includes(',') ? image_base64.split(',')[1] : image_base64;
    const mimeType = image_base64.startsWith('data:image/png') ? 'image/png' : 'image/jpeg';

    // Step 1: Analyze the image with Gemini vision to extract visual context
    console.log('Step 1: Analyzing image with Gemini vision...');
    const visionRes = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this sports/football image and describe in 2-3 sentences: the dominant colors of the jersey/kit, the lighting style (bright daylight, dramatic shadows, evening, etc.), the overall atmosphere and mood (energetic, celebratory, intense, etc.), and if there is a visible stadium or environment. Be concise and factual. Do NOT describe the person. Focus only on colors, lighting, environment and mood.',
              },
              {
                type: 'image_url',
                image_url: { url: `data:${mimeType};base64,${base64Data}` },
              },
            ],
          },
        ],
      }),
    });

    if (!visionRes.ok) {
      if (visionRes.status === 429) throw new Error('Rate limit exceeded. Please try again later.');
      if (visionRes.status === 402) throw new Error('Insufficient credits. Please add funds to your workspace.');
      throw new Error(`Vision model error: ${visionRes.status}`);
    }

    const visionData = await visionRes.json();
    const imageContext = visionData.choices?.[0]?.message?.content ?? '';
    console.log('Image context extracted:', imageContext);

    // Step 2: Generate the cinematic background
    console.log('Step 2: Generating cinematic background...');
    const generationPrompt = `Generate a cinematic 16:9 YouTube thumbnail background image at 1280x720 pixels.

Visual context from the reference image: ${imageContext}

Requirements:
- Dramatic, high-contrast cinematic environment inspired by the colors and mood above
- Stadium atmosphere with dynamic lighting — golden hour, floodlights, or dramatic shadows
- Soft bokeh depth of field creating beautiful background blur
- The CENTER AREA of the image must be CLEAN, LOW-DETAIL, and SLIGHTLY BLURRED — this is critical as a subject will be overlaid there
- Avoid any strong patterns, busy textures, or high-contrast elements in the center zone
- Energetic, professional look suitable for a high-CTR YouTube thumbnail
- No text of any kind
- No logos or brand marks
- No people or human figures
- No foreground objects
- Rich colors, cinematic grade, atmospheric and immersive`;

    const genRes = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-pro-image-preview',
        messages: [
          {
            role: 'user',
            content: generationPrompt,
          },
        ],
        modalities: ['image', 'text'],
      }),
    });

    if (!genRes.ok) {
      if (genRes.status === 429) throw new Error('Rate limit exceeded. Please try again later.');
      if (genRes.status === 402) throw new Error('Insufficient credits. Please add funds to your workspace.');
      throw new Error(`Image generation error: ${genRes.status}`);
    }

    const genData = await genRes.json();
    const generatedImage = genData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!generatedImage) {
      throw new Error('No image was generated. Please try again.');
    }

    return new Response(JSON.stringify({ result_base64: generatedImage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err: any) {
    console.error('ai-cinematic-bg error:', err);
    return new Response(JSON.stringify({ error: err.message ?? 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
