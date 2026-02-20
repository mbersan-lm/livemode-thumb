import { Upload, Maximize2, RotateCcw, Expand, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PhotoTransform } from '@/types/thumbnail';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PhotoControlsProps {
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
}

export const PhotoControls = ({ 
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
}: PhotoControlsProps) => {
  const [isExpanding, setIsExpanding] = useState(false);
  const [isExpandingJC, setIsExpandingJC] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onPhotoUpload(file);
  };

  const handleJogoCompletoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onJogoCompletoPhotoUpload(file);
  };

  const handleCenter = () => onTransformChange({ x: 0, y: 0 });
  const handleReset = () => onTransformChange({ x: 0, y: 0, scale: initialScale, scaleX: 1, scaleY: 1 });
  const handleJogoCompletoCenter = () => onJogoCompletoTransformChange({ x: 0, y: 0 });
  const handleJogoCompletoReset = () => onJogoCompletoTransformChange({ x: 0, y: 0, scale: initialScaleJogoCompleto, scaleX: 1, scaleY: 1 });

  const compositeImageOntoCanvas = (photo: string, transform: PhotoTransform): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 1280;
        canvas.height = 720;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas context not available'));

        // Transparent background (no fillRect = fully transparent)
        ctx.clearRect(0, 0, 1280, 720);

        // Mirror the CSS transform logic:
        // position: left 50%, top 50% → center = (640, 360)
        // transform: translate(-50%, -50%) translateX(x) translateY(y) scale(s) scaleX(sx) scaleY(sy)
        const centerX = 640;
        const centerY = 360;
        const effectiveScaleX = transform.scale * transform.scaleX;
        const effectiveScaleY = transform.scale * transform.scaleY;
        const drawW = img.naturalWidth * effectiveScaleX;
        const drawH = img.naturalHeight * effectiveScaleY;
        const finalX = centerX + transform.x - drawW / 2;
        const finalY = centerY + transform.y - drawH / 2;

        ctx.drawImage(img, finalX, finalY, drawW, drawH);

        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => reject(new Error('Falha ao carregar imagem'));
      img.src = photo;
    });
  };

  const handleAiExpand = async (
    photo: string | null,
    transform: PhotoTransform,
    setter: (url: string) => void,
    resetTransform: () => void,
    setLoading: (v: boolean) => void,
  ) => {
    if (!photo) {
      toast.error('Faça upload de uma foto primeiro');
      return;
    }
    setLoading(true);
    try {
      // Composite the image onto a 1280x720 canvas with current transform
      // so PhotoRoom only fills the transparent/empty areas
      const compositeBase64 = await compositeImageOntoCanvas(photo, transform);

      const { data, error } = await supabase.functions.invoke('photoroom-ai-expand', {
        body: { image_base64: compositeBase64, output_width: 1280, output_height: 720 },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setter(data.result_base64);
      resetTransform();
      toast.success('Imagem expandida com IA!');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao expandir imagem');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Tabs defaultValue="melhores-momentos" className="w-full">
      <TabsList className="w-full grid grid-cols-2 mb-6">
        <TabsTrigger value="melhores-momentos">Melhores Momentos</TabsTrigger>
        <TabsTrigger value="jogo-completo">Jogo Completo</TabsTrigger>
      </TabsList>

      {/* Melhores Momentos Photo Controls */}
      <TabsContent value="melhores-momentos" className="space-y-6">
        <div>
          <Label htmlFor="photo-upload" className="cursor-pointer">
            <div className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-border rounded-lg hover:border-primary transition-colors">
              <Upload className="w-5 h-5" />
              <span>Upload Player Photo</span>
            </div>
            <input 
              id="photo-upload"
              type="file" 
              accept="image/png,image/jpeg,image/jpg"
              className="hidden"
              onChange={handleFileUpload}
            />
          </Label>
        </div>

        <div className="space-y-4">
          <div>
            <Label>Position X: {photoTransform.x}px</Label>
            <Slider
              value={[photoTransform.x]}
              onValueChange={([x]) => onTransformChange({ x })}
              min={-1500}
              max={1500}
              step={1}
              className="mt-2"
            />
          </div>

          <div>
            <Label>Position Y: {photoTransform.y}px</Label>
            <Slider
              value={[photoTransform.y]}
              onValueChange={([y]) => onTransformChange({ y })}
              min={-1500}
              max={1500}
              step={1}
              className="mt-2"
            />
          </div>

          <div>
            <Label>Uniform Zoom: {photoTransform.scale.toFixed(2)}x</Label>
            <Slider
              value={[photoTransform.scale]}
              onValueChange={([scale]) => onTransformChange({ scale })}
              min={Math.min(initialScale * 0.9, 0.1)}
              max={2.5}
              step={0.01}
              className="mt-2"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-border space-y-2">
          <h4 className="text-sm font-semibold mb-3">Quick Actions</h4>
          <Button
            onClick={() => handleAiExpand(
              playerPhoto,
              photoTransform,
              onPlayerPhotoReplace,
              () => onTransformChange({ x: 0, y: 0, scale: 1, scaleX: 1, scaleY: 1 }),
              setIsExpanding,
            )}
            variant="outline"
            className="w-full"
            disabled={isExpanding || !playerPhoto}
          >
            {isExpanding ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Expand className="w-4 h-4 mr-2" />
            )}
            {isExpanding ? 'Expandindo...' : 'AI Expand (1280×720)'}
          </Button>
          <Button onClick={handleCenter} variant="outline" className="w-full">
            <Maximize2 className="w-4 h-4 mr-2" />
            Center
          </Button>
          <Button onClick={handleReset} variant="outline" className="w-full">
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset All
          </Button>
        </div>
      </TabsContent>

      {/* Jogo Completo Photo Controls */}
      <TabsContent value="jogo-completo" className="space-y-6">
        <div>
          <Label htmlFor="jogo-completo-photo-upload" className="cursor-pointer">
            <div className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-border rounded-lg hover:border-primary transition-colors">
              <Upload className="w-5 h-5" />
              <span>Upload Player Photo (Jogo Completo)</span>
            </div>
            <input 
              id="jogo-completo-photo-upload"
              type="file" 
              accept="image/png,image/jpeg,image/jpg"
              className="hidden"
              onChange={handleJogoCompletoFileUpload}
            />
          </Label>
        </div>

        <div className="space-y-4">
          <div>
            <Label>Position X: {jogoCompletoPhotoTransform.x}px</Label>
            <Slider
              value={[jogoCompletoPhotoTransform.x]}
              onValueChange={([x]) => onJogoCompletoTransformChange({ x })}
              min={-1500}
              max={1500}
              step={1}
              className="mt-2"
            />
          </div>

          <div>
            <Label>Position Y: {jogoCompletoPhotoTransform.y}px</Label>
            <Slider
              value={[jogoCompletoPhotoTransform.y]}
              onValueChange={([y]) => onJogoCompletoTransformChange({ y })}
              min={-1500}
              max={1500}
              step={1}
              className="mt-2"
            />
          </div>

          <div>
            <Label>Uniform Zoom: {jogoCompletoPhotoTransform.scale.toFixed(2)}x</Label>
            <Slider
              value={[jogoCompletoPhotoTransform.scale]}
              onValueChange={([scale]) => onJogoCompletoTransformChange({ scale })}
              min={Math.min(initialScaleJogoCompleto * 0.9, 0.1)}
              max={2.5}
              step={0.01}
              className="mt-2"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-border space-y-2">
          <h4 className="text-sm font-semibold mb-3">Quick Actions</h4>
          <Button
            onClick={() => handleAiExpand(
              jogoCompletoPhoto,
              jogoCompletoPhotoTransform,
              onJogoCompletoPhotoReplace,
              () => onJogoCompletoTransformChange({ x: 0, y: 0, scale: 1, scaleX: 1, scaleY: 1 }),
              setIsExpandingJC,
            )}
            variant="outline"
            className="w-full"
            disabled={isExpandingJC || !jogoCompletoPhoto}
          >
            {isExpandingJC ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Expand className="w-4 h-4 mr-2" />
            )}
            {isExpandingJC ? 'Expandindo...' : 'AI Expand (1280×720)'}
          </Button>
          <Button onClick={handleJogoCompletoCenter} variant="outline" className="w-full">
            <Maximize2 className="w-4 h-4 mr-2" />
            Center
          </Button>
          <Button onClick={handleJogoCompletoReset} variant="outline" className="w-full">
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset All
          </Button>
        </div>
      </TabsContent>
    </Tabs>
  );
};
