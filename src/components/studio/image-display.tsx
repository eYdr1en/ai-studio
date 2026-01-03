"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface ImageDisplayProps {
  images: string[];
  prompt: string | null;
  isLoading: boolean;
  error: string | null;
}

export function ImageDisplay({ images, prompt, isLoading, error }: ImageDisplayProps) {
  const [downloadingIndex, setDownloadingIndex] = useState<number | null>(null);

  const handleDownload = async (imageUrl: string, index: number) => {
    setDownloadingIndex(index);
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ai-studio-${Date.now()}-${index + 1}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setDownloadingIndex(null);
    }
  };

  const handleDownloadAll = async () => {
    for (let i = 0; i < images.length; i++) {
      await handleDownload(images[i], i);
    }
  };

  // Empty state
  if (images.length === 0 && !isLoading && !error) {
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
          <h3 className="text-lg font-semibold gradient-text">Creating your images...</h3>
          <p className="text-sm text-muted-foreground">Powered by FLUX AI ⚡</p>
        </div>
        <div className="w-full max-w-xs h-2 rounded-full bg-muted overflow-hidden">
          <div className="h-full shimmer rounded-full" />
        </div>
      </div>
    );
  }

  // Error state - improved with better styling and details
  if (error) {
    // Parse error for better display
    const isApiKeyError = error.toLowerCase().includes('api key') || error.toLowerCase().includes('apikey');
    const isNetworkError = error.toLowerCase().includes('network') || error.toLowerCase().includes('fetch');
    const isRateLimitError = error.toLowerCase().includes('rate') || error.toLowerCase().includes('limit') || error.toLowerCase().includes('429');
    
    let errorTitle = "Generation Failed";
    let errorIcon = "⚠️";
    let suggestion = "";
    
    if (isApiKeyError) {
      errorTitle = "API Key Required";
      errorIcon = "🔑";
      suggestion = "Add OPENAI_API_KEY to .env.local for this feature.";
    } else if (isNetworkError) {
      errorTitle = "Connection Error";
      errorIcon = "🌐";
      suggestion = "Check your internet connection and try again.";
    } else if (isRateLimitError) {
      errorTitle = "Rate Limited";
      errorIcon = "⏳";
      suggestion = "Too many requests. Please wait a moment and try again.";
    }
    
    return (
      <div className="w-full rounded-2xl glass border border-red-500/30 bg-red-500/5 p-6 space-y-4">
        {/* Error Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center text-2xl">
            {errorIcon}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-red-400">{errorTitle}</h3>
            <p className="text-xs text-muted-foreground">Image generation encountered an error</p>
          </div>
        </div>
        
        {/* Error Message Box */}
        <div className="rounded-lg bg-black/30 border border-red-500/20 p-4 font-mono text-sm">
          <div className="flex items-start gap-2">
            <span className="text-red-400 select-none">❯</span>
            <p className="text-red-300/90 break-all">{error}</p>
          </div>
        </div>
        
        {/* Suggestion */}
        {suggestion && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-500">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 16v-4"/>
              <path d="M12 8h.01"/>
            </svg>
            <span>{suggestion}</span>
          </div>
        )}
        
        {/* Retry hint */}
        <p className="text-xs text-muted-foreground/70 text-center pt-2">
          Try a different model or modify your prompt
        </p>
      </div>
    );
  }

  // Single image display
  if (images.length === 1) {
    return (
      <div className="space-y-4">
        <div className="relative aspect-square w-full rounded-2xl overflow-hidden glass glow-cyan">
          <Image
            src={images[0]}
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
          onClick={() => handleDownload(images[0], 0)}
          disabled={downloadingIndex === 0}
          variant="secondary"
          className="w-full h-12 font-medium"
        >
          {downloadingIndex === 0 ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Downloading...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

  // Multiple images grid
  return (
    <div className="space-y-4">
      <div className={`grid gap-3 ${images.length === 2 ? "grid-cols-2" : images.length === 3 ? "grid-cols-2" : "grid-cols-2"}`}>
        {images.map((imageUrl, index) => (
          <div key={index} className="relative aspect-square rounded-xl overflow-hidden glass glow-cyan group">
            <Image
              src={imageUrl}
              alt={`Generated image ${index + 1}`}
              fill
              className="object-cover"
              unoptimized
            />
            <button
              onClick={() => handleDownload(imageUrl, index)}
              disabled={downloadingIndex === index}
              className="absolute bottom-2 right-2 p-2 rounded-lg bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
            >
              {downloadingIndex === index ? (
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" x2="12" y1="15" y2="3" />
                </svg>
              )}
            </button>
          </div>
        ))}
      </div>
      
      {prompt && (
        <p className="text-sm text-muted-foreground italic line-clamp-2">
          &ldquo;{prompt}&rdquo;
        </p>
      )}
      
      <Button
        onClick={handleDownloadAll}
        disabled={downloadingIndex !== null}
        variant="secondary"
        className="w-full h-12 font-medium"
      >
        <span className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" x2="12" y1="15" y2="3" />
          </svg>
          Download All ({images.length})
        </span>
      </Button>
    </div>
  );
}
