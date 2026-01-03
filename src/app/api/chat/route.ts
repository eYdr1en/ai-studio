import { streamText } from "ai";

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: "google/gemini-3-pro-chat",
    system: "You are a helpful, creative AI assistant.",
    messages,
  });

  return result.toTextStreamResponse();
}

export const runtime = "edge";
