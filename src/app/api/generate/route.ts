import { InferenceClient } from "@huggingface/inference";
import { NextRequest, NextResponse } from "next/server";

// Initialize the HuggingFace Inference Client
const client = new InferenceClient(process.env.HF_TOKEN);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, steps = 5 } = body;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Prompt is required and must be a string" },
        { status: 400 }
      );
    }

    if (!process.env.HF_TOKEN) {
      return NextResponse.json(
        { error: "HuggingFace API token is not configured" },
        { status: 500 }
      );
    }

    // Clamp steps between 1 and 50
    const numSteps = Math.min(Math.max(Number(steps) || 25, 1), 50);

    // Generate image using free Stable Diffusion XL model
    // This runs on HuggingFace's free inference API
    const imageResult = await client.textToImage({
      model: "stabilityai/stable-diffusion-xl-base-1.0",
      inputs: prompt,
      parameters: { 
        num_inference_steps: numSteps,
      },
    });

    let base64: string;
    let mimeType: string = "image/png";

    // Type assertion needed as the actual runtime type can be Blob
    const image = imageResult as unknown;

    if (image && typeof image === "object" && "arrayBuffer" in image) {
      // It's a Blob-like object
      const blob = image as Blob;
      const arrayBuffer = await blob.arrayBuffer();
      base64 = Buffer.from(arrayBuffer).toString("base64");
      mimeType = blob.type || "image/png";
    } else if (typeof image === "string") {
      // Handle string responses
      if (image.startsWith("data:")) {
        // Already a data URL
        return NextResponse.json({
          success: true,
          image: image,
          prompt,
          steps: numSteps,
        });
      } else if (image.startsWith("http")) {
        // It's a URL - fetch and convert to base64
        const response = await fetch(image);
        const blob = await response.blob();
        const arrayBuffer = await blob.arrayBuffer();
        base64 = Buffer.from(arrayBuffer).toString("base64");
        mimeType = blob.type || "image/png";
      } else {
        // Assume it's raw base64
        base64 = image;
      }
    } else {
      throw new Error("Unexpected response format from image generation");
    }

    return NextResponse.json({
      success: true,
      image: `data:${mimeType};base64,${base64}`,
      prompt,
      steps: numSteps,
    });
  } catch (error) {
    console.error("Image generation error:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    
    return NextResponse.json(
      { 
        error: "Failed to generate image", 
        details: errorMessage 
      },
      { status: 500 }
    );
  }
}

export const runtime = "nodejs";
export const maxDuration = 60; // Allow up to 60 seconds for image generation
