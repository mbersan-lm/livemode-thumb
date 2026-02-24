import { Label } from '@/components/ui/label';
import { useState } from 'react';

interface AoVivoGradientControlsProps {
  gradientLeftColor: string;
  gradientRightColor: string;
  onGradientLeftColorChange: (color: string) => void;
  onGradientRightColorChange: (color: string) => void;
}

export const AoVivoGradientControls = ({
  gradientLeftColor,
  gradientRightColor,
  onGradientLeftColorChange,
  onGradientRightColorChange,
}: AoVivoGradientControlsProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Gradiente Esquerdo</Label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={gradientLeftColor}
            onChange={(e) => onGradientLeftColorChange(e.target.value)}
            className="w-10 h-10 rounded-md border border-border cursor-pointer bg-transparent"
          />
          <input
            type="text"
            value={gradientLeftColor}
            onChange={(e) => onGradientLeftColorChange(e.target.value)}
            className="flex-1 h-10 rounded-md border border-input bg-background px-3 text-sm font-mono"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Gradiente Direito</Label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={gradientRightColor}
            onChange={(e) => onGradientRightColorChange(e.target.value)}
            className="w-10 h-10 rounded-md border border-border cursor-pointer bg-transparent"
          />
          <input
            type="text"
            value={gradientRightColor}
            onChange={(e) => onGradientRightColorChange(e.target.value)}
            className="flex-1 h-10 rounded-md border border-input bg-background px-3 text-sm font-mono"
          />
        </div>
      </div>
    </div>
  );
};
