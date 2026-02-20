import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('PHOTOROOM_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'PHOTOROOM_API_KEY not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { image_base64, output_width = 1280, output_height = 720 } = await req.json();
    if (!image_base64) {
      return new Response(JSON.stringify({ error: 'image_base64 is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Decode base64 to binary
    const base64Data = image_base64.includes(',') ? image_base64.split(',')[1] : image_base64;
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const formData = new FormData();
    formData.append('imageFile', new Blob([bytes], { type: 'image/png' }), 'image.png');
    formData.append('outputSize', `${output_width}x${output_height}`);
    formData.append('referenceBox', 'originalImage');
    formData.append('removeBackground', 'false');
    formData.append('expand.mode', 'ai.auto');

    const response = await fetch('https://image-api.photoroom.com/v2/edit', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('PhotoRoom AI Expand error:', response.status, errorText);
      return new Response(JSON.stringify({ error: `PhotoRoom API error: ${response.status} - ${errorText}` }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const resultBuffer = new Uint8Array(await response.arrayBuffer());
    // Chunk to avoid call stack overflow
    let binary = '';
    const chunkSize = 8192;
    for (let i = 0; i < resultBuffer.length; i += chunkSize) {
      binary += String.fromCharCode(...resultBuffer.subarray(i, i + chunkSize));
    }
    const resultBase64 = btoa(binary);

    return new Response(JSON.stringify({ result_base64: `data:image/png;base64,${resultBase64}` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
