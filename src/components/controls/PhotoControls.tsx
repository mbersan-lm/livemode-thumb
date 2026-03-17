import { Upload, Maximize2, RotateCcw, Expand, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { PhotoTransform } from '@/types/thumbnail';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ActiveCanvas } from '@/components/controls/ViewControls';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  // Ao Vivo left/right
  aoVivoPhotoLeft?: string | null;
  aoVivoPhotoLeftTransform?: PhotoTransform;
  initialScaleAoVivoLeft?: number;
  onAoVivoPhotoLeftUpload?: (file: File) => void;
  onAoVivoPhotoLeftTransformChange?: (transform: Partial<PhotoTransform>) => void;
  onAoVivoPhotoLeftReplace?: (dataUrl: string) => void;
  aoVivoPhotoRight?: string | null;
  aoVivoPhotoRightTransform?: PhotoTransform;
  initialScaleAoVivoRight?: number;
  onAoVivoPhotoRightUpload?: (file: File) => void;
  onAoVivoPhotoRightTransformChange?: (transform: Partial<PhotoTransform>) => void;
  onAoVivoPhotoRightReplace?: (dataUrl: string) => void;
}

const PhotoSliders = ({
  transform,
  initialScale,
  onTransformChange,
  photo,
  onReplace,
  label,
}: {
  transform: PhotoTransform;
  initialScale: number;
  onTransformChange: (t: Partial<PhotoTransform>) => void;
  photo: string | null;
  onReplace: (dataUrl: string) => void;
  label: string;
}) => {
  const [isExpanding, setIsExpanding] = useState(false);

  const handleAiExpand = async () => {
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
      onReplace(data.result_base64);
      onTransformChange({ x: 0, y: 0, scale: 1, scaleX: 1, scaleY: 1 });
      toast.success('Imagem expandida com IA!');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao expandir imagem');
    } finally {
      setIsExpanding(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Horizontal: {transform.x}px</Label>
        <Slider value={[transform.x]} onValueChange={([x]) => onTransformChange({ x })} min={-1500} max={1500} step={1} className="mt-2" />
      </div>
      <div>
        <Label>Vertical: {transform.y}px</Label>
        <Slider value={[transform.y]} onValueChange={([y]) => onTransformChange({ y })} min={-1500} max={1500} step={1} className="mt-2" />
      </div>
      <div>
        <Label>Zoom: {transform.scale.toFixed(2)}x</Label>
        <Slider value={[transform.scale]} onValueChange={([scale]) => onTransformChange({ scale })} min={Math.min(initialScale * 0.9, 0.1)} max={2.5} step={0.01} className="mt-2" />
      </div>
      <div className="pt-4 border-t border-border space-y-2">
        <Button onClick={handleAiExpand} variant="outline" className="w-full" disabled={isExpanding || !photo}>
          {isExpanding ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Expand className="w-4 h-4 mr-2" />}
          {isExpanding ? 'Expandindo...' : 'Expandir com IA (1280×720)'}
        </Button>
        <Button onClick={() => onTransformChange({ x: 0, y: 0 })} variant="outline" className="w-full">
          <Maximize2 className="w-4 h-4 mr-2" />
          Centralizar
        </Button>
        <Button onClick={() => onTransformChange({ x: 0, y: 0, scale: initialScale, scaleX: 1, scaleY: 1 })} variant="outline" className="w-full">
          <RotateCcw className="w-4 h-4 mr-2" />
          Redefinir Tudo
        </Button>
      </div>
    </div>
  );
};

export const PhotoControls = (props: PhotoControlsProps) => {
  const {
    activeCanvas,
    photoTransform, initialScale, onTransformChange, onPhotoUpload, playerPhoto, onPlayerPhotoReplace,
    jogoCompletoPhoto, jogoCompletoPhotoTransform, initialScaleJogoCompleto, onJogoCompletoTransformChange, onJogoCompletoPhotoUpload, onJogoCompletoPhotoReplace,
    aoVivoPhotoLeft, aoVivoPhotoLeftTransform, initialScaleAoVivoLeft, onAoVivoPhotoLeftUpload, onAoVivoPhotoLeftTransformChange, onAoVivoPhotoLeftReplace,
    aoVivoPhotoRight, aoVivoPhotoRightTransform, initialScaleAoVivoRight, onAoVivoPhotoRightUpload, onAoVivoPhotoRightTransformChange, onAoVivoPhotoRightReplace,
  } = props;

  // For MM and JC canvases, use the existing single-photo flow
  if (activeCanvas !== 'av') {
    const isMM = activeCanvas === 'mm';
    const currentPhoto = isMM ? playerPhoto : jogoCompletoPhoto;
    const currentTransform = isMM ? photoTransform : jogoCompletoPhotoTransform;
    const currentInitialScale = isMM ? initialScale : initialScaleJogoCompleto;
    const currentOnTransformChange = isMM ? onTransformChange : onJogoCompletoTransformChange;
    const currentOnUpload = isMM ? onPhotoUpload : onJogoCompletoPhotoUpload;
    const currentOnReplace = isMM ? onPlayerPhotoReplace : onJogoCompletoPhotoReplace;

    return (
      <div className="space-y-6">
        <div>
          <Label htmlFor="photo-upload" className="cursor-pointer">
            <div className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-border rounded-lg hover:border-primary transition-colors">
              <Upload className="w-5 h-5" />
              <span>Enviar Foto do Jogador</span>
            </div>
            <input id="photo-upload" type="file" accept="image/png,image/jpeg,image/jpg" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) currentOnUpload(f); }} key={activeCanvas} />
          </Label>
        </div>
        <PhotoSliders transform={currentTransform} initialScale={currentInitialScale} onTransformChange={currentOnTransformChange} photo={currentPhoto} onReplace={currentOnReplace} label="" />
      </div>
    );
  }

  // Ao Vivo: two photo slots (left & right)
  const defaultTransform: PhotoTransform = { x: 0, y: 0, scale: 1, scaleX: 1, scaleY: 1 };

  const UploadBox = ({ id, label, onUpload }: { id: string; label: string; onUpload: (f: File) => void }) => (
    <Label htmlFor={id} className="cursor-pointer">
      <div className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-border rounded-lg hover:border-primary transition-colors">
        <Upload className="w-4 h-4" />
        <span className="text-sm">{label}</span>
      </div>
      <input id={id} type="file" accept="image/png,image/jpeg,image/jpg" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f); }} key={id} />
    </Label>
  );

  return (
    <div className="space-y-4">
      <Tabs defaultValue="left" className="w-full">
        <TabsList className="w-full grid grid-cols-2 h-9">
          <TabsTrigger value="left" className="text-xs">Foto Esquerda</TabsTrigger>
          <TabsTrigger value="right" className="text-xs">Foto Direita</TabsTrigger>
        </TabsList>

        <TabsContent value="left" className="mt-4 space-y-4">
          {onAoVivoPhotoLeftUpload && <UploadBox id="photo-left" label="Enviar Foto Esquerda" onUpload={onAoVivoPhotoLeftUpload} />}
          {onAoVivoPhotoLeftTransformChange && onAoVivoPhotoLeftReplace && (
            <PhotoSliders
              transform={aoVivoPhotoLeftTransform ?? defaultTransform}
              initialScale={initialScaleAoVivoLeft ?? 0.5}
              onTransformChange={onAoVivoPhotoLeftTransformChange}
              photo={aoVivoPhotoLeft ?? null}
              onReplace={onAoVivoPhotoLeftReplace}
              label="Esquerda"
            />
          )}
        </TabsContent>

        <TabsContent value="right" className="mt-4 space-y-4">
          {onAoVivoPhotoRightUpload && <UploadBox id="photo-right" label="Enviar Foto Direita" onUpload={onAoVivoPhotoRightUpload} />}
          {onAoVivoPhotoRightTransformChange && onAoVivoPhotoRightReplace && (
            <PhotoSliders
              transform={aoVivoPhotoRightTransform ?? defaultTransform}
              initialScale={initialScaleAoVivoRight ?? 0.5}
              onTransformChange={onAoVivoPhotoRightTransformChange}
              photo={aoVivoPhotoRight ?? null}
              onReplace={onAoVivoPhotoRightReplace}
              label="Direita"
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};