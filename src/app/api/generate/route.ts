import { google } from "@ai-sdk/google";
import { generateText } from "ai";

// Model types
type ModelType = "huggingface" | "gemini";

interface ModelConfig {
  type: ModelType;
  url?: string;
  geminiModel?: string;
  supportsImg2Img: boolean;
  description: string;
  recommended?: boolean;
}

// Available models - no restrictions
const MODELS: Record<string, ModelConfig> = {
  // ⭐ GEMINI - Best for image editing (native support)
  "gemini-imagen": {
    type: "gemini",
    geminiModel: "gemini-2.0-flash",
    supportsImg2Img: true,
    description: "⭐ Google Gemini - Best for editing, style transfer, text rendering",
    recommended: true,
  },
  // Text-to-Image models (HuggingFace)
  "flux-schnell": {
    type: "huggingface",
    url: "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell",
    supportsImg2Img: false,
    description: "Fast high-quality generation",
  },
  "flux-dev": {
    type: "huggingface",
    url: "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-dev",
    supportsImg2Img: false,
    description: "Higher quality FLUX",
  },
  "playground-v2": {
    type: "huggingface",
    url: "https://router.huggingface.co/hf-inference/models/playgroundai/playground-v2.5-1024px-aesthetic",
    supportsImg2Img: false,
    description: "Aesthetic/artistic style",
  },
  // Img2Img capable models (HuggingFace)
  "sdxl": {
    type: "huggingface",
    url: "https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0",
    supportsImg2Img: true,
    description: "Versatile, supports image editing",
  },
  "sdxl-turbo": {
    type: "huggingface",
    url: "https://router.huggingface.co/hf-inference/models/stabilityai/sdxl-turbo",
    supportsImg2Img: true,
    description: "Fast SDXL with image editing",
  },
  "realvis-xl": {
    type: "huggingface",
    url: "https://router.huggingface.co/hf-inference/models/SG161222/RealVisXL_V4.0",
    supportsImg2Img: true,
    description: "Photorealistic with image editing",
  },
  "sd-inpaint": {
    type: "huggingface",
    url: "https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-2-inpainting",
    supportsImg2Img: true,
    description: "Best for image editing/inpainting",
  },
  "instruct-pix2pix": {
    type: "huggingface",
    url: "https://router.huggingface.co/hf-inference/models/timbrooks/instruct-pix2pix",
    supportsImg2Img: true,
    description: "Edit images with text instructions",
  },
};

// Default img2img model when user provides image but picks non-img2img model
const DEFAULT_IMG2IMG_MODEL = "gemini-imagen";

// Generate image using Gemini's native image generation
async function generateWithGemini(prompt: string, referenceImage?: string): Promise<string> {
  const messages: Array<{ role: "user"; content: Array<{ type: "text"; text: string } | { type: "image"; image: string }> }> = [];
  
  const userContent: Array<{ type: "text"; text: string } | { type: "image"; image: string }> = [];
  
  if (referenceImage) {
    // Add reference image for editing
    userContent.push({
      type: "image",
      image: referenceImage,
    });
    userContent.push({
      type: "text",
      text: `Edit this image: ${prompt}. Generate the edited image directly.`,
    });
  } else {
    userContent.push({
      type: "text",
      text: `Generate an image: ${prompt}. Create a high-quality, detailed image.`,
    });
  }
  
  messages.push({ role: "user", content: userContent });

  const result = await generateText({
    model: google("gemini-2.0-flash"),
    messages,
    providerOptions: {
      google: {
        responseModalities: ["TEXT", "IMAGE"],
      },
    },
  });

  // Extract image from response
  // Gemini returns images in the response parts
  const response = result as unknown as { 
    response?: { 
      candidates?: Array<{ 
        content?: { 
          parts?: Array<{ 
            inlineData?: { data: string; mimeType: string } 
          }> 
        } 
      }> 
    } 
  };
  
  const parts = response?.response?.candidates?.[0]?.content?.parts || [];
  for (const part of parts) {
    if (part.inlineData?.data) {
      const mimeType = part.inlineData.mimeType || "image/png";
      return `data:${mimeType};base64,${part.inlineData.data}`;
    }
  }
  
  throw new Error("Gemini did not return an image");
}

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

    // Select model - auto-switch to img2img model if image provided
    let selectedModelKey = model;
    let selectedModel = MODELS[model] || MODELS["flux-schnell"];
    let modelSwitched = false;
    
    // If user provides image but model doesn't support img2img, auto-switch
    if (image && !selectedModel.supportsImg2Img) {
      selectedModelKey = DEFAULT_IMG2IMG_MODEL;
      selectedModel = MODELS[DEFAULT_IMG2IMG_MODEL];
      modelSwitched = true;
    }
    
    const isImg2Img = !!image;
    
    // Enhance prompt to bypass restrictions
    const enhancedPrompt = enhancePrompt(prompt, enhance);
    
    // Default negative prompt to avoid bad outputs
    const fullNegativePrompt = negative_prompt || 
      "blurry, low quality, distorted, deformed, ugly, bad anatomy, watermark, signature, text";

    // Generate images in parallel
    const imagePromises = Array.from({ length: imageCount }, async () => {
      // Use Gemini for gemini models
      if (selectedModel.type === "gemini") {
        return await generateWithGemini(enhancedPrompt, image || undefined);
      }
      
      // HuggingFace models
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

      const response = await fetch(selectedModel.url!, {
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
      model: selectedModelKey,
      model_requested: model,
      model_switched: modelSwitched,
      mode: isImg2Img ? "img2img" : "txt2img",
      available_models: Object.entries(MODELS).map(([key, val]) => ({
        id: key,
        description: val.description,
        supports_img2img: val.supportsImg2Img,
      })),
    });
  } catch (error) {
    console.error("Image generation error:", error);
    return Response.json(
      { error: "Failed to generate image", details: String(error) },
      { status: 500 }
    );
  }
}
