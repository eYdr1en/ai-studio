"use client";

import { useState } from "react";
import { PromptForm } from "@/components/studio/prompt-form";
import { ImageDisplay } from "@/components/studio/image-display";
import { Chat } from "@/components/studio/chat";

type Mode = "image" | "chat";

interface GenerationResult {
  images: string[];
  prompt: string;
}

export default function Home() {
  const [mode, setMode] = useState<Mode>("image");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerationResult | null>(null);

  const handleGenerate = async (prompt: string, count: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt, count }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || "Failed to generate image");
      }

      setResult({
        images: data.images,
        prompt: data.prompt,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen animated-gradient">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary-foreground"
              >
                <path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">AI Studio</h1>
              <p className="text-xs text-muted-foreground">Powered by OpenAI</p>
            </div>
          </div>
          
          {/* Mode Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-xl glass">
            <button
              onClick={() => setMode("image")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === "image"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                  <circle cx="9" cy="9" r="2" />
                  <path d="m21 15-3.086-3.086a2 2 0 00-2.828 0L6 21" />
                </svg>
                Images
              </span>
            </button>
            <button
              onClick={() => setMode("chat")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === "chat"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                Chat
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12 space-y-4">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              <span className="gradient-text">
                {mode === "image" ? "Create Stunning" : "Chat with"}
              </span>
              <br />
              <span className="text-foreground">
                {mode === "image" ? "AI Images" : "GPT-4o"}
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {mode === "image"
                ? "Generate high-quality images with GPT Image 1. Create up to 4 images at once."
                : "Have natural conversations with GPT-4o Mini. Ask anything - coding, writing, brainstorming, or general questions."}
            </p>
          </div>

          {mode === "image" ? (
            /* Image Generation Mode */
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
              {/* Left Column - Input */}
              <div className="space-y-6">
                <div className="glass rounded-2xl p-6 sm:p-8 space-y-2">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-sm font-medium text-muted-foreground">
                      GPT Image 1 (High Quality)
                    </span>
                  </div>
                  <PromptForm onGenerate={handleGenerate} isLoading={isLoading} />
                </div>

                {/* Tips Card */}
                <div className="glass rounded-2xl p-6 space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-accent"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 16v-4" />
                      <path d="M12 8h.01" />
                    </svg>
                    Pro Tips
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      Be specific with details: lighting, style, mood, colors
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      Add art style keywords: digital art, oil painting, photography
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      Generate multiple images to find the perfect variation
                    </li>
                  </ul>
                </div>
              </div>

              {/* Right Column - Output */}
              <div className="lg:sticky lg:top-24">
                <div className="glass rounded-2xl p-6 sm:p-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Generated Images</h3>
                    {result && result.images.length > 0 && (
                      <span className="text-xs text-muted-foreground font-mono px-2 py-1 rounded-md bg-muted/50">
                        {result.images.length} image{result.images.length > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                  <ImageDisplay
                    images={result?.images || []}
                    prompt={result?.prompt || null}
                    isLoading={isLoading}
                    error={error}
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Chat Mode */
            <div className="max-w-4xl mx-auto">
              <div className="glass rounded-2xl p-6 sm:p-8">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-sm font-medium text-muted-foreground">
                    GPT-4o Mini
                  </span>
                </div>
                <Chat />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="glass border-t border-border/30 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>
              Built with{" "}
              <a
                href="https://nextjs.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Next.js
              </a>
              {" "}and{" "}
              <a
                href="https://sdk.vercel.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Vercel AI SDK
              </a>
            </p>
            <p className="flex items-center gap-1.5">
              <span>Powered by</span>
              <a
                href="https://openai.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                OpenAI
              </a>
              <span>via</span>
              <a
                href="https://vercel.com/ai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Vercel AI Gateway
              </a>
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
