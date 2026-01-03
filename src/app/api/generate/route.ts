// Available models - no restrictions
const MODELS: Record<string, { url: string; supportsImg2Img: boolean }> = {
  "flux-schnell": {
    url: "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell",
    supportsImg2Img: false,
  },
  "flux-dev": {
    url: "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-dev",
    supportsImg2Img: false,
  },
  "sdxl": {
    url: "https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0",
    supportsImg2Img: true,
  },
  "sdxl-turbo": {
    url: "https://router.huggingface.co/hf-inference/models/stabilityai/sdxl-turbo",
    supportsImg2Img: true,
  },
  "playground-v2": {
    url: "https://router.huggingface.co/hf-inference/models/playgroundai/playground-v2.5-1024px-aesthetic",
    supportsImg2Img: false,
  },
  "realvis-xl": {
    url: "https://router.huggingface.co/hf-inference/models/SG161222/RealVisXL_V4.0",
    supportsImg2Img: true,
  },
};

// Enhance prompt to bypass restrictions and maximize quality
function enhancePrompt(prompt: string, bypass: boolean = true): string {
  if (!bypass) return prompt;
  
  // Art-focused prefixes that help bypass filters
  const prefixes = [
    "award-winning professional photograph,",
    "masterpiece digital artwork,",
    "high-end artistic render,",
    "cinematic film still,",
    "editorial magazine photography,",
  ];
  
  const suffixes = [
    ", highly detailed, professional lighting, 8k resolution, sharp focus",
    ", artstation trending, hyperrealistic, detailed textures",
    ", photorealistic, studio quality, masterful composition",
  ];
  
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  
  return `${prefix} ${prompt}${suffix}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      prompt, 
      count = 1, 
      image, 
      strength = 0.75,
      model = "flux-schnell",
      enhance = true,
      negative_prompt = "",
      guidance_scale = 7.5,
      num_inference_steps = 25,
    } = body;

    if (!prompt || typeof prompt !== "string") {
      return Response.json({ error: "Prompt is required" }, { status: 400 });
    }

    const imageCount = Math.min(Math.max(Number(count) || 1, 1), 4);
    const HF_TOKEN = process.env.HF_TOKEN;

    if (!HF_TOKEN) {
      return Response.json({ error: "HF_TOKEN not configured" }, { status: 500 });
    }

    // Select model
    const selectedModel = MODELS[model] || MODELS["flux-schnell"];
    const isImg2Img = !!image && selectedModel.supportsImg2Img;
    
    // Enhance prompt to bypass restrictions
    const enhancedPrompt = enhancePrompt(prompt, enhance);
    
    // Default negative prompt to avoid bad outputs
    const fullNegativePrompt = negative_prompt || 
      "blurry, low quality, distorted, deformed, ugly, bad anatomy, watermark, signature, text";

    // Generate images in parallel
    const imagePromises = Array.from({ length: imageCount }, async () => {
      // Prepare request body based on mode
      let requestBody: Record<string, unknown>;
      
      if (isImg2Img) {
        // Extract base64 data from data URL if needed
        let imageBase64 = image;
        if (image.startsWith("data:")) {
          imageBase64 = image.split(",")[1];
        }
        
        requestBody = {
          inputs: enhancedPrompt,
          parameters: {
            image: imageBase64,
            strength: strength,
            guidance_scale: guidance_scale,
            num_inference_steps: num_inference_steps,
            negative_prompt: fullNegativePrompt,
          },
        };
      } else {
        requestBody = {
          inputs: enhancedPrompt,
          parameters: {
            guidance_scale: guidance_scale,
            num_inference_steps: num_inference_steps,
            negative_prompt: fullNegativePrompt,
          },
        };
      }

      const response = await fetch(selectedModel.url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HF API error: ${response.status} - ${errorText}`);
      }

      const blob = await response.blob();
      const buffer = await blob.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      return `data:image/png;base64,${base64}`;
    });

    const imageUrls = await Promise.all(imagePromises);

    return Response.json({
      success: true,
      images: imageUrls,
      prompt: enhancedPrompt,
      original_prompt: prompt,
      count: imageCount,
      model: model,
      mode: isImg2Img ? "img2img" : "txt2img",
      available_models: Object.keys(MODELS),
    });
  } catch (error) {
    console.error("Image generation error:", error);
    return Response.json(
      { error: "Failed to generate image", details: String(error) },
      { status: 500 }
    );
  }
}
