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
  aoVivoPhoto: string | null;
  aoVivoPhotoTransform: PhotoTransform;
  initialScaleAoVivo: number;
  onAoVivoTransformChange: (transform: Partial<PhotoTransform>) => void;
  onAoVivoPhotoUpload: (file: File) => void;
  onAoVivoPhotoReplace: (dataUrl: string) => void;
}

export const PhotoControls = ({ 
  activeCanvas,
  photoTransform, 
  initialScale,
  onTransformChange,
  onPhotoUpload,
  playerPhoto,
  jogoCompletoPhoto,
  jogoCompletoPhotoTransform,
  initialScaleJogoCompleto,
  onJogoCompletoTransformChange,
  onJogoCompletoPhotoUpload,
  onPlayerPhotoReplace,
  onJogoCompletoPhotoReplace,
  aoVivoPhoto,
  aoVivoPhotoTransform,
  initialScaleAoVivo,
  onAoVivoTransformChange,
  onAoVivoPhotoUpload,
  onAoVivoPhotoReplace,
}: PhotoControlsProps) => {
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

  // Determine which set of controls to show
  const isMM = activeCanvas === 'mm';
  const isJC = activeCanvas === 'jc';
  const currentPhoto = isMM ? playerPhoto : isJC ? jogoCompletoPhoto : aoVivoPhoto;
  const currentTransform = isMM ? photoTransform : isJC ? jogoCompletoPhotoTransform : aoVivoPhotoTransform;
  const currentInitialScale = isMM ? initialScale : isJC ? initialScaleJogoCompleto : initialScaleAoVivo;
  const currentOnTransformChange = isMM ? onTransformChange : isJC ? onJogoCompletoTransformChange : onAoVivoTransformChange;
  const currentOnUpload = isMM ? onPhotoUpload : isJC ? onJogoCompletoPhotoUpload : onAoVivoPhotoUpload;
  const currentOnReplace = isMM ? onPlayerPhotoReplace : isJC ? onJogoCompletoPhotoReplace : onAoVivoPhotoReplace;
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
          <Slider
            value={[currentTransform.x]}
            onValueChange={([x]) => currentOnTransformChange({ x })}
            min={-1500}
            max={1500}
            step={1}
            className="mt-2"
          />
        </div>

        <div>
          <Label>Posição Y: {currentTransform.y}px</Label>
          <Slider
            value={[currentTransform.y]}
            onValueChange={([y]) => currentOnTransformChange({ y })}
            min={-1500}
            max={1500}
            step={1}
            className="mt-2"
          />
        </div>

        <div>
          <Label>Zoom: {currentTransform.scale.toFixed(2)}x</Label>
          <Slider
            value={[currentTransform.scale]}
            onValueChange={([scale]) => currentOnTransformChange({ scale })}
            min={Math.min(currentInitialScale * 0.9, 0.1)}
            max={2.5}
            step={0.01}
            className="mt-2"
          />
        </div>
      </div>

      <div className="pt-4 border-t border-border space-y-2">
        <h4 className="text-sm font-semibold mb-3">Ações Rápidas</h4>
        <Button
          onClick={() => handleAiExpand(
            currentPhoto,
            currentOnReplace,
            () => currentOnTransformChange({ x: 0, y: 0, scale: 1, scaleX: 1, scaleY: 1 }),
          )}
          variant="outline"
          className="w-full"
          disabled={isExpanding || !currentPhoto}
        >
          {isExpanding ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Expand className="w-4 h-4 mr-2" />
          )}
          {isExpanding ? 'Expandindo...' : 'Expandir com IA (1280×720)'}
        </Button>
        <Button onClick={() => currentOnTransformChange({ x: 0, y: 0 })} variant="outline" className="w-full">
          <Maximize2 className="w-4 h-4 mr-2" />
          Centralizar
        </Button>
        <Button onClick={currentResetTransform} variant="outline" className="w-full">
          <RotateCcw className="w-4 h-4 mr-2" />
          Redefinir Tudo
        </Button>
      </div>
    </div>
  );
};
