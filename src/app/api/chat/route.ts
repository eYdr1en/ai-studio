import { streamText, convertToModelMessages } from "ai";
import { google } from "@ai-sdk/google";

export async function POST(req: Request) {
  const { messages } = await req.json();

  // Convert UI messages (with parts) to model messages (with content)
  const modelMessages = await convertToModelMessages(messages);

  const result = streamText({
    model: google("gemini-2.0-flash"),
    system: "You are a helpful, creative AI assistant.",
    messages: modelMessages,
  });

  return result.toUIMessageStreamResponse();
}
