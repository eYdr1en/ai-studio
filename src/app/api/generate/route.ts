import { generateImage } from "ai";
import { openai } from "@ai-sdk/openai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, count = 1 } = body;

    if (!prompt || typeof prompt !== "string") {
      return Response.json({ error: "Prompt is required" }, { status: 400 });
    }

    // DALL-E 3 only supports n=1, DALL-E 2 supports up to 10
    const imageCount = Math.min(Math.max(Number(count) || 1, 1), 4);

    const result = await generateImage({
      model: openai.image("dall-e-3"),
      prompt,
      n: imageCount,
      size: "1024x1024",
    });

    const imageUrls = result.images.map((img) => 
      `data:image/png;base64,${img.base64}`
    );

    return Response.json({
      success: true,
      images: imageUrls,
      prompt,
      count: imageCount,
    });
  } catch (error) {
    console.error("Image generation error:", error);
    return Response.json(
      { error: "Failed to generate image", details: String(error) },
      { status: 500 }
    );
  }
}
