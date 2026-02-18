import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Upload, Trash2, Download, Loader2, ChevronDown } from 'lucide-react';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';

interface TransformState {
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

interface PipFrameState {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CortesControlsProps {
  pipImage: string | null;
  personCutout: string | null;
  thumbText: string;
  isRemovingBg: boolean;
  pipTransform: TransformState;
  personTransform: TransformState;
  pipFrame: PipFrameState;
  onPipUpload: (file: File) => void;
  onPersonUpload: (file: File) => void;
  onTextChange: (text: string) => void;
  onPipTransformChange: (t: Partial<TransformState>) => void;
  onPersonTransformChange: (t: Partial<TransformState>) => void;
  onPipFrameChange: (f: Partial<PipFrameState>) => void;
  onClear: () => void;
  canvasRef: React.RefObject<HTMLDivElement>;
}

export const CortesControls = ({
  pipImage,
  personCutout,
  thumbText,
  isRemovingBg,
  pipTransform,
  personTransform,
  pipFrame,
  onPipUpload,
  onPersonUpload,
  onTextChange,
  onPipTransformChange,
  onPersonTransformChange,
  onPipFrameChange,
  onClear,
  canvasRef,
}: CortesControlsProps) => {
  const pipInputRef = useRef<HTMLInputElement>(null);
  const personInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    if (!canvasRef.current) {
      toast.error('Canvas not ready');
      return;
    }

    try {
      toast.loading('Gerando JPG...');
      await document.fonts.ready;

      const canvas = await html2canvas(canvasRef.current, {
        width: 1280,
        height: 720,
        scale: 1,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#0C0C20',
        logging: false,
        scrollX: 0,
        scrollY: 0,
        x: 0,
        y: 0,
        foreignObjectRendering: false,
        onclone: (clonedDoc) => {
          const el = clonedDoc.getElementById('CANVAS_CORTES');
          if (!el) return;
          let parent = el.parentElement;
          while (parent) {
            parent.style.transform = 'none';
            (parent.style as any).zoom = '1';
            (parent.style as any).scale = '1';
            parent = parent.parentElement;
          }
        },
      });

      const timestamp = Date.now();
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `CORTE_${timestamp}.jpg`;
            link.click();
            URL.revokeObjectURL(url);
            toast.dismiss();
            toast.success('JPG exportado!');
          }
        },
        'image/jpeg',
        0.9
      );
    } catch (error) {
      console.error('Export error:', error);
      toast.dismiss();
      toast.error('Falha ao exportar JPG');
    }
  };

  return (
    <div className="space-y-5">
      {/* PIP Upload */}
      <div className="space-y-2">
        <Label className="font-semibold">Imagem PIP (frame do jogo)</Label>
        <input
          ref={pipInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && onPipUpload(e.target.files[0])}
        />
        <Button
          variant={pipImage ? 'secondary' : 'outline'}
          className="w-full"
          onClick={() => pipInputRef.current?.click()}
        >
          <Upload className="w-4 h-4 mr-2" />
          {pipImage ? 'Trocar PIP' : 'Upload PIP'}
        </Button>
      </div>

      {/* PIP Image Transform */}
      {pipImage && (
        <div className="space-y-3 p-3 rounded-lg border border-border bg-muted/30">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ajuste da imagem PIP</Label>
          <div>
            <Label className="text-xs">Posição X: {pipTransform.x}px</Label>
            <Slider value={[pipTransform.x]} onValueChange={([x]) => onPipTransformChange({ x })} min={-500} max={500} step={1} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Posição Y: {pipTransform.y}px</Label>
            <Slider value={[pipTransform.y]} onValueChange={([y]) => onPipTransformChange({ y })} min={-500} max={500} step={1} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Zoom: {pipTransform.scale.toFixed(2)}x</Label>
            <Slider value={[pipTransform.scale]} onValueChange={([scale]) => onPipTransformChange({ scale })} min={0.5} max={3} step={0.01} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Rotação: {pipTransform.rotation}°</Label>
            <Slider value={[pipTransform.rotation]} onValueChange={([rotation]) => onPipTransformChange({ rotation })} min={-180} max={180} step={1} className="mt-1" />
          </div>
        </div>
      )}

      {/* PIP Frame Controls */}
      {pipImage && (
        <div className="space-y-3 p-3 rounded-lg border border-border bg-muted/30">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Moldura PIP</Label>
          <div>
            <Label className="text-xs">Posição X: {pipFrame.x.toFixed(1)}%</Label>
            <Slider value={[pipFrame.x]} onValueChange={([x]) => onPipFrameChange({ x })} min={-20} max={60} step={0.1} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Posição Y: {pipFrame.y.toFixed(1)}%</Label>
            <Slider value={[pipFrame.y]} onValueChange={([y]) => onPipFrameChange({ y })} min={-20} max={60} step={0.1} className="mt-1" />
          </div>

          <Collapsible>
            <CollapsibleTrigger className="flex items-center gap-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors w-full">
              <ChevronDown className="w-3 h-3" />
              Propriedades avançadas
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 pt-3">
              <div>
                <Label className="text-xs">Largura: {pipFrame.width.toFixed(1)}%</Label>
                <Slider value={[pipFrame.width]} onValueChange={([width]) => onPipFrameChange({ width })} min={10} max={90} step={0.1} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Altura: {pipFrame.height.toFixed(1)}%</Label>
                <Slider value={[pipFrame.height]} onValueChange={([height]) => onPipFrameChange({ height })} min={10} max={90} step={0.1} className="mt-1" />
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      )}

      {/* Person Upload */}
      <div className="space-y-2">
        <Label className="font-semibold">Foto da pessoa</Label>
        <input
          ref={personInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && onPersonUpload(e.target.files[0])}
        />
        <Button
          variant={personCutout ? 'secondary' : 'outline'}
          className="w-full"
          disabled={isRemovingBg}
          onClick={() => personInputRef.current?.click()}
        >
          {isRemovingBg ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Removendo fundo...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              {personCutout ? 'Trocar pessoa' : 'Upload pessoa'}
            </>
          )}
        </Button>
      </div>

      {/* Person Transform */}
      {personCutout && (
        <div className="space-y-3 p-3 rounded-lg border border-border bg-muted/30">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ajuste da pessoa</Label>
          <div>
            <Label className="text-xs">Posição X: {personTransform.x}px</Label>
            <Slider value={[personTransform.x]} onValueChange={([x]) => onPersonTransformChange({ x })} min={-800} max={800} step={1} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Posição Y: {personTransform.y}px</Label>
            <Slider value={[personTransform.y]} onValueChange={([y]) => onPersonTransformChange({ y })} min={-800} max={800} step={1} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Zoom: {personTransform.scale.toFixed(2)}x</Label>
            <Slider value={[personTransform.scale]} onValueChange={([scale]) => onPersonTransformChange({ scale })} min={0.3} max={3} step={0.01} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Rotação: {personTransform.rotation}°</Label>
            <Slider value={[personTransform.rotation]} onValueChange={([rotation]) => onPersonTransformChange({ rotation })} min={-180} max={180} step={1} className="mt-1" />
          </div>
        </div>
      )}

      {/* Text */}
      <div className="space-y-2">
        <Label className="font-semibold">Texto da thumbnail</Label>
        <Textarea
          value={thumbText}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder="Digite o texto..."
          className="min-h-[80px]"
        />
      </div>

      {/* Actions */}
      <div className="space-y-2 pt-2">
        <Button onClick={handleExport} className="w-full" size="lg">
          <Download className="w-4 h-4 mr-2" />
          Baixar JPG
        </Button>
        <Button onClick={onClear} variant="ghost" className="w-full">
          <Trash2 className="w-4 h-4 mr-2" />
          Limpar tudo
        </Button>
      </div>
    </div>
  );
};
