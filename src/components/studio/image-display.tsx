"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface ImageDisplayProps {
  imageUrl: string | null;
  prompt: string | null;
  isLoading: boolean;
  error: string | null;
}

export function ImageDisplay({ imageUrl, prompt, isLoading, error }: ImageDisplayProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!imageUrl) return;
    
    setIsDownloading(true);
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ai-studio-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  // Empty state
  if (!imageUrl && !isLoading && !error) {
    return (
      <div className="aspect-square w-full rounded-2xl glass flex flex-col items-center justify-center gap-4 p-8">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary/60"
          >
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.086-3.086a2 2 0 00-2.828 0L6 21" />
          </svg>
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-foreground/80">No image yet</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            Enter a prompt and click generate to create your first AI image
          </p>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="aspect-square w-full rounded-2xl glass flex flex-col items-center justify-center gap-6 p-8 animate-pulse-glow">
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary animate-pulse"
            >
              <path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z" />
            </svg>
          </div>
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold gradient-text">Creating your image...</h3>
          <p className="text-sm text-muted-foreground">This may take a few seconds</p>
        </div>
        <div className="w-full max-w-xs h-2 rounded-full bg-muted overflow-hidden">
          <div className="h-full shimmer rounded-full" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="aspect-square w-full rounded-2xl glass flex flex-col items-center justify-center gap-4 p-8 border-destructive/30">
        <div className="w-20 h-20 rounded-full bg-destructive/20 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-destructive"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" x2="12" y1="8" y2="12" />
            <line x1="12" x2="12.01" y1="16" y2="16" />
          </svg>
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-destructive">Generation failed</h3>
          <p className="text-sm text-muted-foreground max-w-xs">{error}</p>
        </div>
      </div>
    );
  }

  // Image display
  return (
    <div className="space-y-4">
      <div className="relative aspect-square w-full rounded-2xl overflow-hidden glass glow-cyan">
        <Image
          src={imageUrl!}
          alt={prompt || "Generated image"}
          fill
          className="object-cover"
          unoptimized
        />
      </div>
      
      {prompt && (
        <p className="text-sm text-muted-foreground italic line-clamp-2">
          &ldquo;{prompt}&rdquo;
        </p>
      )}
      
      <Button
        onClick={handleDownload}
        disabled={isDownloading}
        variant="secondary"
        className="w-full h-12 font-medium"
      >
        {isDownloading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Downloading...
          </span>
        ) : (
          <span className="flex items-center gap-2">
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
            >
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" x2="12" y1="15" y2="3" />
            </svg>
            Download Image
          </span>
        )}
      </Button>
    </div>
  );
}

