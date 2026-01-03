import { streamText, convertToModelMessages } from "ai";
import { google } from "@ai-sdk/google";

// Vercel serverless function config
export const maxDuration = 30; // Maximum duration for chat responses

export async function POST(req: Request) {
  try {
    // Check for required environment variable
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return Response.json(
        { 
          error: "Google AI API key not configured",
          details: "Please add GOOGLE_GENERATIVE_AI_API_KEY to your environment variables"
        },
        { status: 500 }
      );
    }

    const { messages } = await req.json();

    // Convert UI messages (with parts) to model messages (with content)
    const modelMessages = await convertToModelMessages(messages);

    const result = streamText({
      model: google("gemini-2.0-flash"),
      system: "You are a helpful, creative AI assistant.",
      messages: modelMessages,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Chat error:", error);
    return Response.json(
      { 
        error: "Failed to generate response", 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}
