export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, count = 1, image, strength = 0.75 } = body;

    if (!prompt || typeof prompt !== "string") {
      return Response.json({ error: "Prompt is required" }, { status: 400 });
    }

    const imageCount = Math.min(Math.max(Number(count) || 1, 1), 4);
    const HF_TOKEN = process.env.HF_TOKEN;

    if (!HF_TOKEN) {
      return Response.json({ error: "HF_TOKEN not configured" }, { status: 500 });
    }

    // Use different model based on whether reference image is provided
    const isImg2Img = !!image;
    const modelUrl = isImg2Img
      ? "https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-refiner-1.0"
      : "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell";

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
          inputs: prompt,
          parameters: {
            image: imageBase64,
            strength: strength, // 0.0 = keep original, 1.0 = completely change
            guidance_scale: 7.5,
          },
        };
      } else {
        requestBody = {
          inputs: prompt,
        };
      }

      const response = await fetch(modelUrl, {
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
      prompt,
      count: imageCount,
      mode: isImg2Img ? "img2img" : "txt2img",
    });
  } catch (error) {
    console.error("Image generation error:", error);
    return Response.json(
      { error: "Failed to generate image", details: String(error) },
      { status: 500 }
    );
  }
}
