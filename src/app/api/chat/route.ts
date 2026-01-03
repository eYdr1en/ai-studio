import { streamText, convertToModelMessages } from "ai";
import { openai } from "@ai-sdk/openai";

export async function POST(req: Request) {
  const { messages } = await req.json();

  // Convert UI messages (with parts) to model messages (with content)
  const modelMessages = await convertToModelMessages(messages);

  const result = streamText({
    model: openai("gpt-4o"),
    system: "You are a helpful, creative AI assistant.",
    messages: modelMessages,
  });

  return result.toUIMessageStreamResponse();
}
