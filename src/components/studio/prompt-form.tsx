"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SettingsPanel } from "./settings-panel";

interface PromptFormProps {
  onGenerate: (prompt: string, steps: number) => Promise<void>;
  isLoading: boolean;
}

export function PromptForm({ onGenerate, isLoading }: PromptFormProps) {
  const [prompt, setPrompt] = useState("");
  const [steps, setSteps] = useState(25);
  const maxChars = 1000;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;
    await onGenerate(prompt.trim(), steps);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="prompt" className="text-base font-medium">
            Describe your image
          </Label>
          <span className="text-sm text-muted-foreground font-mono">
            {prompt.length}/{maxChars}
          </span>
        </div>
        <Textarea
          id="prompt"
          placeholder="A majestic dragon soaring through aurora borealis, digital art, highly detailed, cinematic lighting..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value.slice(0, maxChars))}
          className="min-h-[140px] resize-none bg-input/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 text-base placeholder:text-muted-foreground/50 transition-all duration-300"
          disabled={isLoading}
        />
      </div>

      <SettingsPanel steps={steps} onStepsChange={setSteps} disabled={isLoading} />

      <Button
        type="submit"
        disabled={!prompt.trim() || isLoading}
        className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <span className="flex items-center gap-3">
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Generating...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z" />
            </svg>
            Generate Image
          </span>
        )}
      </Button>
    </form>
  );
}

