import { generateImage } from "ai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, count = 1 } = body;

    if (!prompt || typeof prompt !== "string") {
      return Response.json({ error: "Prompt is required" }, { status: 400 });
    }

    const imageCount = Math.min(Math.max(Number(count) || 1, 1), 4);

    const result = await generateImage({
      model: "google/gemini-3-pro-image",
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

export const runtime = "edge";
