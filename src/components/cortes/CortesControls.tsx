import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Upload, Trash2, Download, Loader2, ChevronDown, RotateCcw } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';
import type { ThumbModel } from './CortesThumbBuilder';

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
  thumbModel: ThumbModel;
  onThumbModelChange: (model: ThumbModel) => void;
  pipImage: string | null;
  personCutout: string | null;
  person2Cutout: string | null;
  thumbText: string;
  thumbTextLeft: string;
  thumbTextRight: string;
  isRemovingBg: boolean;
  isRemovingBg2: boolean;
  pipTransform: TransformState;
  personTransform: TransformState;
  person2Transform: TransformState;
  pipFrame: PipFrameState;
  pipBaseScale: number;
  onPipUpload: (file: File) => void;
  onPersonUpload: (file: File) => void;
  onPerson2Upload: (file: File) => void;
  onPersonDirectUpload: (file: File) => void;
  onPerson2DirectUpload: (file: File) => void;
  onTextChange: (text: string) => void;
  onTextLeftChange: (text: string) => void;
  onTextRightChange: (text: string) => void;
  onPipTransformChange: (t: Partial<TransformState>) => void;
  onPersonTransformChange: (t: Partial<TransformState>) => void;
  onPerson2TransformChange: (t: Partial<TransformState>) => void;
  onPipFrameChange: (f: Partial<PipFrameState>) => void;
  onClear: () => void;
  customBgImage: string | null;
  onBgUpload: (file: File) => void;
  canvasRef: React.RefObject<HTMLDivElement>;
}

export const CortesControls = ({
  thumbModel,
  onThumbModelChange,
  pipImage,
  personCutout,
  person2Cutout,
  thumbText,
  thumbTextLeft,
  thumbTextRight,
  isRemovingBg,
  isRemovingBg2,
  pipTransform,
  personTransform,
  person2Transform,
  pipFrame,
  pipBaseScale,
  onPipUpload,
  onPersonUpload,
  onPerson2Upload,
  onPersonDirectUpload,
  onPerson2DirectUpload,
  onTextChange,
  onTextLeftChange,
  onTextRightChange,
  onPipTransformChange,
  onPersonTransformChange,
  onPerson2TransformChange,
  onPipFrameChange,
  onClear,
  customBgImage,
  onBgUpload,
  canvasRef,
}: CortesControlsProps) => {
  const pipInputRef = useRef<HTMLInputElement>(null);
  const personInputRef = useRef<HTMLInputElement>(null);
  const person2InputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);

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
        scrollX: -window.scrollX,
        scrollY: -window.scrollY,
        x: 0,
        y: 0,
        foreignObjectRendering: false,
        onclone: (clonedDoc) => {
          const el = clonedDoc.getElementById('CANVAS_CORTES');
          if (!el) return;

          // Neutraliza transforms de todos os ancestrais
          let parent = el.parentElement;
          while (parent && parent !== clonedDoc.body) {
            parent.style.transform = 'none';
            parent.style.position = 'static';
            (parent.style as any).zoom = '1';
            parent = parent.parentElement;
          }

          // Força o canvas clonado para a posição exata (0,0)
          el.style.position = 'fixed';
          el.style.top = '0';
          el.style.left = '0';
          el.style.transform = 'none';
          el.style.zIndex = '99999';
          el.style.margin = '0';
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
      {/* Model selector */}
      <div className="space-y-2">
        <Label className="font-semibold">Modelo</Label>
        <Select value={thumbModel} onValueChange={(v) => onThumbModelChange(v as ThumbModel)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pip">Com PIP</SelectItem>
            <SelectItem value="duas-pessoas">Duas pessoas</SelectItem>
            <SelectItem value="meio-a-meio">Meio a meio</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* PIP Upload — only for pip model */}
      {thumbModel === 'pip' && (
        <>
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
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ajuste da imagem PIP</Label>
                <button onClick={() => onPipTransformChange({ x: 0, y: 0, scale: pipBaseScale, rotation: 0 })} className="text-muted-foreground hover:text-foreground transition-colors" title="Redefinir">
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
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
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Moldura PIP</Label>
                <button onClick={() => onPipFrameChange({ x: 3.0, y: 15.4, width: 56.6, height: 64.3 })} className="text-muted-foreground hover:text-foreground transition-colors" title="Redefinir">
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
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
        </>
      )}

      {/* Person Upload (right side / single person) — pip & duas-pessoas */}
      {thumbModel !== 'meio-a-meio' && (
        <>
          <div className="space-y-2">
            <Label className="font-semibold">{thumbModel === 'duas-pessoas' ? 'Pessoa (direita)' : 'Foto da pessoa'}</Label>
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
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{thumbModel === 'duas-pessoas' ? 'Ajuste pessoa (direita)' : 'Ajuste da pessoa'}</Label>
                <button onClick={() => onPersonTransformChange({ x: 0, y: 0, scale: 1, rotation: 0 })} className="text-muted-foreground hover:text-foreground transition-colors" title="Redefinir">
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
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
        </>
      )}

      {/* Person 2 Upload — only for duas-pessoas model */}
      {thumbModel === 'duas-pessoas' && (
        <>
          {/* Background photo upload */}
          <div className="space-y-2">
            <Label className="font-semibold">Foto de fundo</Label>
            <input
              ref={bgInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && onBgUpload(e.target.files[0])}
            />
            <Button
              variant={customBgImage ? 'secondary' : 'outline'}
              className="w-full"
              onClick={() => bgInputRef.current?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              {customBgImage ? 'Trocar fundo' : 'Upload fundo'}
            </Button>
          </div>

          <div className="space-y-2">
            <Label className="font-semibold">Pessoa (esquerda)</Label>
            <input
              ref={person2InputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && onPerson2Upload(e.target.files[0])}
            />
            <Button
              variant={person2Cutout ? 'secondary' : 'outline'}
              className="w-full"
              disabled={isRemovingBg2}
              onClick={() => person2InputRef.current?.click()}
            >
              {isRemovingBg2 ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Removendo fundo...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  {person2Cutout ? 'Trocar pessoa 2' : 'Upload pessoa 2'}
                </>
              )}
            </Button>
          </div>

          {/* Person 2 Transform */}
          {person2Cutout && (
            <div className="space-y-3 p-3 rounded-lg border border-border bg-muted/30">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ajuste pessoa (esquerda)</Label>
                <button onClick={() => onPerson2TransformChange({ x: 0, y: 0, scale: 1, rotation: 0 })} className="text-muted-foreground hover:text-foreground transition-colors" title="Redefinir">
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
              <div>
                <Label className="text-xs">Posição X: {person2Transform.x}px</Label>
                <Slider value={[person2Transform.x]} onValueChange={([x]) => onPerson2TransformChange({ x })} min={-800} max={800} step={1} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Posição Y: {person2Transform.y}px</Label>
                <Slider value={[person2Transform.y]} onValueChange={([y]) => onPerson2TransformChange({ y })} min={-800} max={800} step={1} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Zoom: {person2Transform.scale.toFixed(2)}x</Label>
                <Slider value={[person2Transform.scale]} onValueChange={([scale]) => onPerson2TransformChange({ scale })} min={0.3} max={3} step={0.01} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Rotação: {person2Transform.rotation}°</Label>
                <Slider value={[person2Transform.rotation]} onValueChange={([rotation]) => onPerson2TransformChange({ rotation })} min={-180} max={180} step={1} className="mt-1" />
              </div>
            </div>
          )}
        </>
      )}

      {/* Meio a meio — two direct image uploads (no bg removal) with transforms */}
      {thumbModel === 'meio-a-meio' && (
        <>
          {/* Left image */}
          <div className="space-y-2">
            <Label className="font-semibold">Imagem esquerda</Label>
            <input
              ref={personInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && onPersonDirectUpload(e.target.files[0])}
            />
            <Button
              variant={personCutout ? 'secondary' : 'outline'}
              className="w-full"
              onClick={() => personInputRef.current?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              {personCutout ? 'Trocar imagem esquerda' : 'Upload imagem esquerda'}
            </Button>
          </div>

          {personCutout && (
            <div className="space-y-3 p-3 rounded-lg border border-border bg-muted/30">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ajuste imagem esquerda</Label>
                <button onClick={() => onPersonTransformChange({ x: 0, y: 0, scale: 1, rotation: 0 })} className="text-muted-foreground hover:text-foreground transition-colors" title="Redefinir">
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
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
            </div>
          )}

          {/* Right image */}
          <div className="space-y-2">
            <Label className="font-semibold">Imagem direita</Label>
            <input
              ref={person2InputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && onPerson2DirectUpload(e.target.files[0])}
            />
            <Button
              variant={person2Cutout ? 'secondary' : 'outline'}
              className="w-full"
              onClick={() => person2InputRef.current?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              {person2Cutout ? 'Trocar imagem direita' : 'Upload imagem direita'}
            </Button>
          </div>

          {person2Cutout && (
            <div className="space-y-3 p-3 rounded-lg border border-border bg-muted/30">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ajuste imagem direita</Label>
                <button onClick={() => onPerson2TransformChange({ x: 0, y: 0, scale: 1, rotation: 0 })} className="text-muted-foreground hover:text-foreground transition-colors" title="Redefinir">
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
              <div>
                <Label className="text-xs">Posição X: {person2Transform.x}px</Label>
                <Slider value={[person2Transform.x]} onValueChange={([x]) => onPerson2TransformChange({ x })} min={-800} max={800} step={1} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Posição Y: {person2Transform.y}px</Label>
                <Slider value={[person2Transform.y]} onValueChange={([y]) => onPerson2TransformChange({ y })} min={-800} max={800} step={1} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Zoom: {person2Transform.scale.toFixed(2)}x</Label>
                <Slider value={[person2Transform.scale]} onValueChange={([scale]) => onPerson2TransformChange({ scale })} min={0.3} max={3} step={0.01} className="mt-1" />
              </div>
            </div>
          )}
        </>
      )}

      {/* Text — single (pip / duas-pessoas) or dual (meio-a-meio) */}
      {thumbModel === 'meio-a-meio' ? (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label className="font-semibold">Texto esquerda</Label>
            <Textarea
              value={thumbTextLeft}
              onChange={(e) => onTextLeftChange(e.target.value)}
              placeholder="Digite o texto esquerdo..."
              className="min-h-[72px]"
            />
          </div>
          <div className="space-y-2">
            <Label className="font-semibold">Texto direita</Label>
            <Textarea
              value={thumbTextRight}
              onChange={(e) => onTextRightChange(e.target.value)}
              placeholder="Digite o texto direito..."
              className="min-h-[72px]"
            />
          </div>
          <p className="text-xs text-muted-foreground">Use <code className="bg-muted px-1 rounded">*asteriscos*</code> para destacar</p>
        </div>
      ) : (
        <div className="space-y-2">
          <Label className="font-semibold">Texto da thumbnail</Label>
          <Textarea
            value={thumbText}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder="Digite o texto..."
            className="min-h-[80px]"
          />
          <p className="text-xs text-muted-foreground">Use <code className="bg-muted px-1 rounded">*asteriscos*</code> para destacar em vermelho</p>
        </div>
      )}

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
