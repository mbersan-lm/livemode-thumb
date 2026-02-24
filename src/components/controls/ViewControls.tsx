import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export type ActiveCanvas = 'mm' | 'jc' | 'av';

interface ViewControlsProps {
  activeCanvas: ActiveCanvas;
  onActiveCanvasChange: (canvas: ActiveCanvas) => void;
}

export const ViewControls = ({
  activeCanvas,
  onActiveCanvasChange,
}: ViewControlsProps) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Thumbnail Ativa</label>
      <Tabs value={activeCanvas} onValueChange={(v) => onActiveCanvasChange(v as ActiveCanvas)}>
        <TabsList className="w-full grid grid-cols-3 h-12">
          <TabsTrigger value="mm" className="text-sm font-semibold">Melhores Momentos</TabsTrigger>
          <TabsTrigger value="jc" className="text-sm font-semibold">Jogo Completo</TabsTrigger>
          <TabsTrigger value="av" className="text-sm font-semibold">Ao Vivo</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};
