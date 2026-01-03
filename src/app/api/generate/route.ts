export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, count = 1 } = body;

    if (!prompt || typeof prompt !== "string") {
      return Response.json({ error: "Prompt is required" }, { status: 400 });
    }

    const imageCount = Math.min(Math.max(Number(count) || 1, 1), 4);
    const HF_TOKEN = process.env.HF_TOKEN;

    if (!HF_TOKEN) {
      return Response.json({ error: "HF_TOKEN not configured" }, { status: 500 });
    }

    // Generate images in parallel
    const imagePromises = Array.from({ length: imageCount }, async () => {
      const response = await fetch(
        "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${HF_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              num_inference_steps: 4,
              guidance_scale: 0,
            },
          }),
        }
      );

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
