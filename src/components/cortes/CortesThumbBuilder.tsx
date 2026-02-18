import { useState, useRef, useEffect } from 'react';
import { CortesCanvas } from './CortesCanvas';
import { CortesControls } from './CortesControls';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 720;

const DEFAULT_PIP_TRANSFORM = { x: 0, y: 0, scale: 1, rotation: 0 };
const DEFAULT_PERSON_TRANSFORM = { x: 0, y: 0, scale: 1, rotation: 0 };
const DEFAULT_PIP_FRAME = { x: 3.0, y: 15.4, width: 56.6, height: 64.3 };

export const CortesThumbBuilder = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const [canvasScale, setCanvasScale] = useState(0.5);

  const [pipImage, setPipImage] = useState<string | null>(null);
  const [personCutout, setPersonCutout] = useState<string | null>(null);
  const [thumbText, setThumbText] = useState('');
  const [isRemovingBg, setIsRemovingBg] = useState(false);

  const [pipTransform, setPipTransform] = useState(DEFAULT_PIP_TRANSFORM);
  const [personTransform, setPersonTransform] = useState(DEFAULT_PERSON_TRANSFORM);
  const [pipFrame, setPipFrame] = useState(DEFAULT_PIP_FRAME);
  const [pipBaseScale, setPipBaseScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      const availableWidth = window.innerWidth >= 768
        ? window.innerWidth - 380 - 32
        : window.innerWidth - 16;
      setCanvasScale(Math.min(availableWidth / CANVAS_WIDTH, 0.85));
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  const handlePipUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setPipImage(dataUrl);

      const img = new window.Image();
      img.onload = () => {
        const containerPixelW = (pipFrame.width / 100) * CANVAS_WIDTH;
        const containerPixelH = (pipFrame.height / 100) * CANVAS_HEIGHT;
        const containerRatio = containerPixelW / containerPixelH;
        const imageRatio = img.naturalWidth / img.naturalHeight;
        const autoScale = Math.max(
          containerRatio / imageRatio,
          imageRatio / containerRatio
        ) + 0.05;
        setPipBaseScale(autoScale);
        setPipTransform(prev => ({ ...prev, scale: autoScale }));
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handlePersonUpload = async (file: File) => {
    setIsRemovingBg(true);
    try {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve) => {
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });

      const { data, error } = await supabase.functions.invoke('photoroom-remove-bg', {
        body: { image_base64: base64 },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setPersonCutout(data.result_base64);
      toast.success('Fundo removido!');
    } catch (err: any) {
      console.error('Remove BG error:', err);
      toast.error(err.message || 'Erro ao remover fundo');
    } finally {
      setIsRemovingBg(false);
    }
  };

  const handleClear = () => {
    setPipImage(null);
    setPersonCutout(null);
    setThumbText('');
    setPipTransform(DEFAULT_PIP_TRANSFORM);
    setPersonTransform(DEFAULT_PERSON_TRANSFORM);
    setPipFrame(DEFAULT_PIP_FRAME);
    setPipBaseScale(1);
  };

  const scaledHeight = CANVAS_HEIGHT * canvasScale;

  return (
    <div className="h-screen bg-background flex flex-col md:flex-row overflow-hidden">
      <div
        className={`flex items-center justify-center overflow-hidden bg-[hsl(240_10%_6%)] shrink-0 ${isMobile ? '' : 'flex-1'}`}
        style={isMobile ? { height: scaledHeight + 8, minHeight: scaledHeight + 8 } : undefined}
      >
        <div style={{ transform: `scale(${canvasScale})`, transformOrigin: 'center' }}>
          <CortesCanvas
            ref={canvasRef}
            pipImage={pipImage}
            personCutout={personCutout}
            thumbText={thumbText}
            pipTransform={pipTransform}
            personTransform={personTransform}
            pipFrame={pipFrame}
          />
        </div>
      </div>

      <div className="w-full md:w-[380px] bg-card border-t md:border-t-0 md:border-l border-border flex flex-col flex-1 md:flex-none overflow-hidden">
        <div className="p-4 md:p-6 pb-3 md:pb-4 border-b border-border flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Cortes</h1>
            <p className="text-xs text-muted-foreground mt-1">Thumbnail Generator</p>
          </div>
          <a href="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            ← Melhores Momentos
          </a>
        </div>

        <div className="p-3 md:p-5 flex-1 overflow-y-auto">
          <CortesControls
            pipImage={pipImage}
            personCutout={personCutout}
            thumbText={thumbText}
            isRemovingBg={isRemovingBg}
            pipTransform={pipTransform}
            personTransform={personTransform}
            pipFrame={pipFrame}
            pipBaseScale={pipBaseScale}
            onPipUpload={handlePipUpload}
            onPersonUpload={handlePersonUpload}
            onTextChange={setThumbText}
            onPipTransformChange={(t) => setPipTransform((prev) => ({ ...prev, ...t }))}
            onPersonTransformChange={(t) => setPersonTransform((prev) => ({ ...prev, ...t }))}
            onPipFrameChange={(f) => setPipFrame((prev) => ({ ...prev, ...f }))}
            onClear={handleClear}
            canvasRef={canvasRef}
          />
        </div>
      </div>
    </div>
  );
};
