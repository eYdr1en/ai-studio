"use client";

import { useState, useRef, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SettingsPanel } from "./settings-panel";

// Available AI models for image generation
const AI_MODELS = [
  { id: "gpt-image-1", name: "GPT Image 1", description: "BEST quality via OpenRouter", badge: "🏆 Best" },
  { id: "flux", name: "FLUX", description: "Fast high-quality (FREE)", badge: "⚡ FREE" },
  { id: "flux-realism", name: "FLUX Realism", description: "Photorealistic (FREE)", badge: "📷 FREE" },
  { id: "flux-anime", name: "FLUX Anime", description: "Anime style (FREE)", badge: "🎭 FREE" },
  { id: "flux-3d", name: "FLUX 3D", description: "3D render style (FREE)", badge: "🎮 FREE" },
  { id: "turbo", name: "Turbo", description: "Super fast (FREE)", badge: "🚀 FREE" },
  { id: "gpt-image-direct", name: "GPT Image (Direct)", description: "Direct OpenAI (needs verification)", badge: "🔑" },
];

interface PromptFormProps {
  onGenerate: (prompt: string, count: number, image?: string, model?: string) => Promise<void>;
  isLoading: boolean;
}

export function PromptForm({ onGenerate, isLoading }: PromptFormProps) {
  const [prompt, setPrompt] = useState("");
  const [imageCount, setImageCount] = useState(1);
  const [selectedModel, setSelectedModel] = useState("flux");
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const maxChars = 1000;

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Handle file selection
  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const base64 = await fileToBase64(file);
    setReferenceImage(base64);
  };

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) await handleFileSelect(file);
  }, []);

  // File input change handler
  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await handleFileSelect(file);
  };

  // Remove reference image
  const removeReferenceImage = () => {
    setReferenceImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;
    await onGenerate(prompt.trim(), imageCount, referenceImage || undefined, selectedModel);
  };

  const currentModel = AI_MODELS.find(m => m.id === selectedModel) || AI_MODELS[0];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* AI Model Selector */}
      <div className="space-y-3">
        <Label className="text-base font-medium">AI Model</Label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowModelDropdown(!showModelDropdown)}
            disabled={isLoading}
            className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-input/50 border border-border/50 hover:border-primary/30 transition-all duration-300 text-left disabled:opacity-50"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z"/>
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">{currentModel.name}</span>
                  {currentModel.badge && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      {currentModel.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{currentModel.description}</p>
              </div>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-muted-foreground transition-transform ${showModelDropdown ? 'rotate-180' : ''}`}>
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </button>
          
          {/* Dropdown */}
          {showModelDropdown && (
            <div className="absolute z-50 w-full mt-2 py-2 rounded-xl bg-background/95 backdrop-blur-xl border border-border/50 shadow-xl max-h-[300px] overflow-y-auto">
              {AI_MODELS.map((model) => (
                <button
                  key={model.id}
                  type="button"
                  onClick={() => {
                    setSelectedModel(model.id);
                    setShowModelDropdown(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-primary/5 transition-colors text-left ${
                    selectedModel === model.id ? 'bg-primary/10' : ''
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{model.name}</span>
                      {model.badge && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          {model.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{model.description}</p>
                  </div>
                  {selectedModel === model.id && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reference Image Drop Zone */}
      <div className="space-y-3">
        <Label className="text-base font-medium">
          Reference Image (optional)
        </Label>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-4 transition-all duration-300 cursor-pointer ${
            isDragging
              ? "border-primary bg-primary/10"
              : referenceImage
              ? "border-primary/50 bg-primary/5"
              : "border-border/50 hover:border-primary/30 hover:bg-input/30"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
            disabled={isLoading}
          />
          
          {referenceImage ? (
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={referenceImage}
                  alt="Reference"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  Reference image loaded
                </p>
                <p className="text-xs text-muted-foreground">
                  Image will be used for img2img generation
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  removeReferenceImage();
                }}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                </svg>
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" x2="12" y1="3" y2="15"/>
                </svg>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">
                  Drop image here or click to upload
                </p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG, WEBP up to 10MB
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Prompt Input */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="prompt" className="text-base font-medium">
            {referenceImage ? "Describe the changes" : "Describe your image"}
          </Label>
          <span className="text-sm text-muted-foreground font-mono">
            {prompt.length}/{maxChars}
          </span>
        </div>
        <Textarea
          id="prompt"
          placeholder={referenceImage 
            ? "Make it look cyberpunk, add neon lights, change the background to a futuristic city..."
            : "A majestic dragon soaring through aurora borealis, digital art, highly detailed, cinematic lighting..."
          }
          value={prompt}
          onChange={(e) => setPrompt(e.target.value.slice(0, maxChars))}
          className="min-h-[140px] resize-none bg-input/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 text-base placeholder:text-muted-foreground/50 transition-all duration-300"
          disabled={isLoading}
        />
      </div>

      <SettingsPanel 
        imageCount={imageCount} 
        onImageCountChange={setImageCount} 
        disabled={isLoading} 
      />

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
            Generating {imageCount > 1 ? `${imageCount} images` : "image"}...
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
            Generate {imageCount > 1 ? `${imageCount} Images` : "Image"}
          </span>
        )}
      </Button>
    </form>
  );
}
