import { Label } from '@/components/ui/label';

interface AoVivoGradientControlsProps {
  gradientLeftColor: string;
  gradientRightColor: string;
  onGradientLeftColorChange: (color: string) => void;
  onGradientRightColorChange: (color: string) => void;
  panelLeftColor: string;
  panelRightColor: string;
  onPanelLeftColorChange: (color: string) => void;
  onPanelRightColorChange: (color: string) => void;
}

export const AoVivoGradientControls = ({
  gradientLeftColor,
  gradientRightColor,
  onGradientLeftColorChange,
  onGradientRightColorChange,
  panelLeftColor,
  panelRightColor,
  onPanelLeftColorChange,
  onPanelRightColorChange,
}: AoVivoGradientControlsProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Gradiente Esquerdo</Label>
        <div className="flex items-center gap-3">
          <input type="color" value={gradientLeftColor} onChange={(e) => onGradientLeftColorChange(e.target.value)} className="w-10 h-10 rounded-md border border-border cursor-pointer bg-transparent" />
          <input type="text" value={gradientLeftColor} onChange={(e) => onGradientLeftColorChange(e.target.value)} className="flex-1 h-10 rounded-md border border-input bg-background px-3 text-sm font-mono" />
        </div>
      </div>
      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Gradiente Direito</Label>
        <div className="flex items-center gap-3">
          <input type="color" value={gradientRightColor} onChange={(e) => onGradientRightColorChange(e.target.value)} className="w-10 h-10 rounded-md border border-border cursor-pointer bg-transparent" />
          <input type="text" value={gradientRightColor} onChange={(e) => onGradientRightColorChange(e.target.value)} className="flex-1 h-10 rounded-md border border-input bg-background px-3 text-sm font-mono" />
        </div>
      </div>
      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Painel Esquerdo</Label>
        <div className="flex items-center gap-3">
          <input type="color" value={panelLeftColor} onChange={(e) => onPanelLeftColorChange(e.target.value)} className="w-10 h-10 rounded-md border border-border cursor-pointer bg-transparent" />
          <input type="text" value={panelLeftColor} onChange={(e) => onPanelLeftColorChange(e.target.value)} className="flex-1 h-10 rounded-md border border-input bg-background px-3 text-sm font-mono" />
        </div>
      </div>
      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Painel Direito</Label>
        <div className="flex items-center gap-3">
          <input type="color" value={panelRightColor} onChange={(e) => onPanelRightColorChange(e.target.value)} className="w-10 h-10 rounded-md border border-border cursor-pointer bg-transparent" />
          <input type="text" value={panelRightColor} onChange={(e) => onPanelRightColorChange(e.target.value)} className="flex-1 h-10 rounded-md border border-input bg-background px-3 text-sm font-mono" />
        </div>
      </div>
    </div>
  );
};
