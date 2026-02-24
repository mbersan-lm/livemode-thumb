import { Upload, Maximize2, RotateCcw, Expand, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { PhotoTransform } from '@/types/thumbnail';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ActiveCanvas } from '@/components/controls/ViewControls';

interface PhotoControlsProps {
  activeCanvas: ActiveCanvas;
  photoTransform: PhotoTransform;
  initialScale: number;
  onTransformChange: (transform: Partial<PhotoTransform>) => void;
  onPhotoUpload: (file: File) => void;
  playerPhoto: string | null;
  jogoCompletoPhoto: string | null;
  jogoCompletoPhotoTransform: PhotoTransform;
  initialScaleJogoCompleto: number;
  onJogoCompletoTransformChange: (transform: Partial<PhotoTransform>) => void;
  onJogoCompletoPhotoUpload: (file: File) => void;
  onPlayerPhotoReplace: (dataUrl: string) => void;
  onJogoCompletoPhotoReplace: (dataUrl: string) => void;
  // AO VIVO props
  aoVivoImage1: string | null;
  aoVivoImage2: string | null;
  aoVivoTransform1: PhotoTransform;
  aoVivoTransform2: PhotoTransform;
  initialScaleAoVivo1: number;
  initialScaleAoVivo2: number;
  onAoVivoTransform1Change: (transform: Partial<PhotoTransform>) => void;
  onAoVivoTransform2Change: (transform: Partial<PhotoTransform>) => void;
  onAoVivoImage1Upload: (file: File) => void;
  onAoVivoImage2Upload: (file: File) => void;
  onAoVivoImage1Replace: (dataUrl: string) => void;
  onAoVivoImage2Replace: (dataUrl: string) => void;
}

export const PhotoControls = (props: PhotoControlsProps) => {
  const {
    activeCanvas,
    photoTransform, initialScale, onTransformChange, onPhotoUpload, playerPhoto,
    jogoCompletoPhoto, jogoCompletoPhotoTransform, initialScaleJogoCompleto,
    onJogoCompletoTransformChange, onJogoCompletoPhotoUpload,
    onPlayerPhotoReplace, onJogoCompletoPhotoReplace,
    aoVivoImage1, aoVivoImage2, aoVivoTransform1, aoVivoTransform2,
    initialScaleAoVivo1, initialScaleAoVivo2,
    onAoVivoTransform1Change, onAoVivoTransform2Change,
    onAoVivoImage1Upload, onAoVivoImage2Upload,
    onAoVivoImage1Replace, onAoVivoImage2Replace,
  } = props;

  const [isExpanding, setIsExpanding] = useState(false);

  const handleAiExpand = async (photo: string | null, setter: (url: string) => void, resetTransform: () => void) => {
    if (!photo) {
      toast.error('Faça upload de uma foto primeiro');
      return;
    }
    setIsExpanding(true);
    try {
      const { data, error } = await supabase.functions.invoke('photoroom-ai-expand', {
        body: { image_base64: photo, output_width: 1280, output_height: 720 },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setter(data.result_base64);
      resetTransform();
      toast.success('Imagem expandida com IA!');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao expandir imagem');
    } finally {
      setIsExpanding(false);
    }
  };

  // AO VIVO: render dual upload controls
  if (activeCanvas === 'av') {
    return (
      <div className="space-y-8">
        {[1, 2].map((idx) => {
          const image = idx === 1 ? aoVivoImage1 : aoVivoImage2;
          const transform = idx === 1 ? aoVivoTransform1 : aoVivoTransform2;
          const initScale = idx === 1 ? initialScaleAoVivo1 : initialScaleAoVivo2;
          const onTransform = idx === 1 ? onAoVivoTransform1Change : onAoVivoTransform2Change;
          const onUpload = idx === 1 ? onAoVivoImage1Upload : onAoVivoImage2Upload;
          const onReplace = idx === 1 ? onAoVivoImage1Replace : onAoVivoImage2Replace;

          return (
            <div key={idx} className="space-y-4 pb-4 border-b border-border last:border-b-0">
              <h4 className="text-sm font-semibold">Imagem {idx}</h4>
              <Label htmlFor={`av-upload-${idx}`} className="cursor-pointer">
                <div className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-border rounded-lg hover:border-primary transition-colors">
                  <Upload className="w-4 h-4" />
                  <span className="text-sm">Enviar Imagem {idx}</span>
                </div>
                <input
                  id={`av-upload-${idx}`}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onUpload(file);
                  }}
                />
              </Label>

              <div className="space-y-3">
                <div>
                  <Label className="text-xs">Posição X: {transform.x}px</Label>
                  <Slider value={[transform.x]} onValueChange={([x]) => onTransform({ x })} min={-1500} max={1500} step={1} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Posição Y: {transform.y}px</Label>
                  <Slider value={[transform.y]} onValueChange={([y]) => onTransform({ y })} min={-1500} max={1500} step={1} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Zoom: {transform.scale.toFixed(2)}x</Label>
                  <Slider value={[transform.scale]} onValueChange={([scale]) => onTransform({ scale })} min={Math.min(initScale * 0.9, 0.1)} max={2.5} step={0.01} className="mt-1" />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => onTransform({ x: 0, y: 0 })} variant="outline" size="sm" className="flex-1">
                  <Maximize2 className="w-3 h-3 mr-1" /> Centralizar
                </Button>
                <Button onClick={() => onTransform({ x: 0, y: 0, scale: initScale, scaleX: 1, scaleY: 1 })} variant="outline" size="sm" className="flex-1">
                  <RotateCcw className="w-3 h-3 mr-1" /> Redefinir
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // MM / JC controls (existing logic)
  const isMM = activeCanvas === 'mm';
  const currentPhoto = isMM ? playerPhoto : jogoCompletoPhoto;
  const currentTransform = isMM ? photoTransform : jogoCompletoPhotoTransform;
  const currentInitialScale = isMM ? initialScale : initialScaleJogoCompleto;
  const currentOnTransformChange = isMM ? onTransformChange : onJogoCompletoTransformChange;
  const currentOnUpload = isMM ? onPhotoUpload : onJogoCompletoPhotoUpload;
  const currentOnReplace = isMM ? onPlayerPhotoReplace : onJogoCompletoPhotoReplace;
  const currentResetTransform = () => currentOnTransformChange({ x: 0, y: 0, scale: currentInitialScale, scaleX: 1, scaleY: 1 });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) currentOnUpload(file);
  };

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="photo-upload" className="cursor-pointer">
          <div className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-border rounded-lg hover:border-primary transition-colors">
            <Upload className="w-5 h-5" />
            <span>Enviar Foto do Jogador</span>
          </div>
          <input 
            id="photo-upload"
            type="file" 
            accept="image/png,image/jpeg,image/jpg"
            className="hidden"
            onChange={handleFileUpload}
            key={activeCanvas}
          />
        </Label>
      </div>

      <div className="space-y-4">
        <div>
          <Label>Posição X: {currentTransform.x}px</Label>
          <Slider value={[currentTransform.x]} onValueChange={([x]) => currentOnTransformChange({ x })} min={-1500} max={1500} step={1} className="mt-2" />
        </div>
        <div>
          <Label>Posição Y: {currentTransform.y}px</Label>
          <Slider value={[currentTransform.y]} onValueChange={([y]) => currentOnTransformChange({ y })} min={-1500} max={1500} step={1} className="mt-2" />
        </div>
        <div>
          <Label>Zoom: {currentTransform.scale.toFixed(2)}x</Label>
          <Slider value={[currentTransform.scale]} onValueChange={([scale]) => currentOnTransformChange({ scale })} min={Math.min(currentInitialScale * 0.9, 0.1)} max={2.5} step={0.01} className="mt-2" />
        </div>
      </div>

      <div className="pt-4 border-t border-border space-y-2">
        <h4 className="text-sm font-semibold mb-3">Ações Rápidas</h4>
        <Button
          onClick={() => handleAiExpand(currentPhoto, currentOnReplace, () => currentOnTransformChange({ x: 0, y: 0, scale: 1, scaleX: 1, scaleY: 1 }))}
          variant="outline"
          className="w-full"
          disabled={isExpanding || !currentPhoto}
        >
          {isExpanding ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Expand className="w-4 h-4 mr-2" />}
          {isExpanding ? 'Expandindo...' : 'Expandir com IA (1280×720)'}
        </Button>
        <Button onClick={() => currentOnTransformChange({ x: 0, y: 0 })} variant="outline" className="w-full">
          <Maximize2 className="w-4 h-4 mr-2" /> Centralizar
        </Button>
        <Button onClick={currentResetTransform} variant="outline" className="w-full">
          <RotateCcw className="w-4 h-4 mr-2" /> Redefinir Tudo
        </Button>
      </div>
    </div>
  );
};
