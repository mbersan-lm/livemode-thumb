import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TemplateType } from '@/data/templates';

export type ActiveCanvas = 'mm' | 'jc' | 'av';

interface ViewControlsProps {
  activeCanvas: ActiveCanvas;
  onActiveCanvasChange: (canvas: ActiveCanvas) => void;
  template?: TemplateType;
}

export const ViewControls = ({
  activeCanvas,
  onActiveCanvasChange,
  template,
}: ViewControlsProps) => {
  const hideJogoCompleto = template === 'libertadores' || template === 'sulamericana';

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Thumbnail Ativa</label>
      <Tabs value={activeCanvas} onValueChange={(v) => onActiveCanvasChange(v as ActiveCanvas)}>
        <TabsList className={`w-full grid h-12 ${hideJogoCompleto ? 'grid-cols-1' : 'grid-cols-2'}`}>
          <TabsTrigger value="mm" className="text-sm font-semibold">Melhores Momentos</TabsTrigger>
          {!hideJogoCompleto && (
            <TabsTrigger value="jc" className="text-sm font-semibold">Jogo Completo</TabsTrigger>
          )}
        </TabsList>
      </Tabs>
    </div>
  );
};
