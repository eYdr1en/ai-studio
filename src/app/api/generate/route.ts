import { InferenceClient } from "@huggingface/inference";
import { NextRequest, NextResponse } from "next/server";

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

    // Clamp steps between 1 and 20
    const numSteps = Math.min(Math.max(Number(steps) || 5, 1), 20);

    // Generate image using FLUX.2-dev-Turbo with auto provider
    const image = await client.textToImage({
      provider: "auto",
      model: "fal/FLUX.2-dev-Turbo",
      inputs: prompt,
      parameters: { num_inference_steps: numSteps },
    });

    // The image is a Blob - convert to base64
    const arrayBuffer = await image.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const mimeType = image.type || "image/png";

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
export const maxDuration = 60;
