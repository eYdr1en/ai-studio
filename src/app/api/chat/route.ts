import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai("gpt-4o"),
    system: "You are a helpful, creative AI assistant.",
    messages,
  });

  return result.toUIMessageStreamResponse();
}

export const runtime = "edge";
