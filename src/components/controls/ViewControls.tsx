import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutGrid, Columns, Maximize2 } from 'lucide-react';

export type ViewMode = 'side-by-side' | 'stacked' | 'individual';
export type ActiveCanvas = 'mm' | 'jc';

interface ViewControlsProps {
  viewMode: ViewMode;
  activeCanvas: ActiveCanvas;
  onViewModeChange: (mode: ViewMode) => void;
  onActiveCanvasChange: (canvas: ActiveCanvas) => void;
}

export const ViewControls = ({
  viewMode,
  activeCanvas,
  onViewModeChange,
  onActiveCanvasChange,
}: ViewControlsProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Modo de Visualização</label>
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant={viewMode === 'side-by-side' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onViewModeChange('side-by-side')}
            className="flex flex-col items-center gap-1 h-auto py-3"
          >
            <Columns className="h-4 w-4" />
            <span className="text-xs">Lado a Lado</span>
          </Button>
          
          <Button
            variant={viewMode === 'stacked' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onViewModeChange('stacked')}
            className="flex flex-col items-center gap-1 h-auto py-3"
          >
            <LayoutGrid className="h-4 w-4" />
            <span className="text-xs">Empilhado</span>
          </Button>
          
          <Button
            variant={viewMode === 'individual' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onViewModeChange('individual')}
            className="flex flex-col items-center gap-1 h-auto py-3"
          >
            <Maximize2 className="h-4 w-4" />
            <span className="text-xs">Individual</span>
          </Button>
        </div>
      </div>

      {viewMode === 'individual' && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Thumbnail Ativa</label>
          <Tabs value={activeCanvas} onValueChange={(v) => onActiveCanvasChange(v as ActiveCanvas)}>
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="mm">Melhores Momentos</TabsTrigger>
              <TabsTrigger value="jc">Jogo Completo</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      )}
    </div>
  );
};
