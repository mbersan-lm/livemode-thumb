import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronDown, Settings2 } from 'lucide-react';
import { useState } from 'react';

const BLEND_MODES = [
  { value: 'normal', label: 'Normal' },
  { value: 'multiply', label: 'Multiply' },
  { value: 'screen', label: 'Screen' },
  { value: 'overlay', label: 'Overlay' },
  { value: 'darken', label: 'Darken' },
  { value: 'lighten', label: 'Lighten' },
  { value: 'color-dodge', label: 'Color Dodge' },
  { value: 'color-burn', label: 'Color Burn' },
  { value: 'hard-light', label: 'Hard Light' },
  { value: 'soft-light', label: 'Soft Light' },
  { value: 'difference', label: 'Difference' },
  { value: 'hue', label: 'Hue' },
  { value: 'saturation', label: 'Saturation' },
  { value: 'color', label: 'Color' },
  { value: 'luminosity', label: 'Luminosity' },
];

interface AoVivoGradientControlsProps {
  gradientLeftColor: string;
  gradientRightColor: string;
  onGradientLeftColorChange: (color: string) => void;
  onGradientRightColorChange: (color: string) => void;
  gradientLeftBlend: string;
  gradientRightBlend: string;
  onGradientLeftBlendChange: (blend: string) => void;
  onGradientRightBlendChange: (blend: string) => void;
}

export const AoVivoGradientControls = ({
  gradientLeftColor,
  gradientRightColor,
  onGradientLeftColorChange,
  onGradientRightColorChange,
  gradientLeftBlend,
  gradientRightBlend,
  onGradientLeftBlendChange,
  onGradientRightBlendChange,
}: AoVivoGradientControlsProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="border border-border rounded-lg">
      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted/50 transition-colors rounded-lg">
        <div className="flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-semibold">Configurações Avançadas — Ao Vivo</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </CollapsibleTrigger>
      <CollapsibleContent className="px-3 pb-3 space-y-4">
        {/* Gradiente Esquerdo */}
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
          <div>
            <Label className="text-xs text-muted-foreground">Modo de Mesclagem</Label>
            <Select value={gradientLeftBlend} onValueChange={onGradientLeftBlendChange}>
              <SelectTrigger className="w-full mt-1 h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BLEND_MODES.map((mode) => (
                  <SelectItem key={mode.value} value={mode.value} className="text-xs">
                    {mode.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Gradiente Direito */}
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
          <div>
            <Label className="text-xs text-muted-foreground">Modo de Mesclagem</Label>
            <Select value={gradientRightBlend} onValueChange={onGradientRightBlendChange}>
              <SelectTrigger className="w-full mt-1 h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BLEND_MODES.map((mode) => (
                  <SelectItem key={mode.value} value={mode.value} className="text-xs">
                    {mode.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
