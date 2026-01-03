"use client";

import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

interface SettingsPanelProps {
  imageCount: number;
  onImageCountChange: (count: number) => void;
  disabled?: boolean;
}

export function SettingsPanel({ 
  imageCount, 
  onImageCountChange, 
  disabled 
}: SettingsPanelProps) {
  return (
    <div className="space-y-4 p-4 rounded-xl glass">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary"
          >
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.086-3.086a2 2 0 00-2.828 0L6 21" />
          </svg>
          Number of Images
        </Label>
        <span className="text-sm font-mono text-primary font-bold">{imageCount}</span>
      </div>
      
      <Slider
        value={[imageCount]}
        onValueChange={([value]) => onImageCountChange(value)}
        min={1}
        max={4}
        step={1}
        disabled={disabled}
        className="[&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary [&_[role=slider]]:shadow-lg [&_[role=slider]]:shadow-primary/30"
      />
      
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>1</span>
        <span>2</span>
        <span>3</span>
        <span>4</span>
      </div>
      
      <p className="text-xs text-muted-foreground/70 leading-relaxed">
        Generate up to 4 high-quality images at once with GPT Image 1.
      </p>
    </div>
  );
}
