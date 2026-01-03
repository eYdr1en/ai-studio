"use client";

import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

interface SettingsPanelProps {
  steps: number;
  onStepsChange: (steps: number) => void;
  disabled?: boolean;
}

export function SettingsPanel({ steps, onStepsChange, disabled }: SettingsPanelProps) {
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
            <path d="M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.08a2 2 0 01-1-1.74v-.5a2 2 0 011-1.74l.15-.09a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          Inference Steps
        </Label>
        <span className="text-sm font-mono text-primary font-bold">{steps}</span>
      </div>
      
      <Slider
        value={[steps]}
        onValueChange={([value]) => onStepsChange(value)}
        min={1}
        max={50}
        step={1}
        disabled={disabled}
        className="[&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary [&_[role=slider]]:shadow-lg [&_[role=slider]]:shadow-primary/30"
      />
      
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Fast (10)</span>
        <span>Balanced (25)</span>
        <span>Quality (50)</span>
      </div>
      
      <p className="text-xs text-muted-foreground/70 leading-relaxed">
        More steps = higher quality but slower generation. For SDXL, 20-30 steps usually provide optimal results.
      </p>
    </div>
  );
}

