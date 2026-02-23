import { useState, useRef, useEffect } from 'react';
import { CortesCanvas } from './CortesCanvas';
import { CortesControls } from './CortesControls';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 720;

const DEFAULT_PIP_TRANSFORM = { x: 0, y: 0, scale: 1, rotation: 0 };
const DEFAULT_PERSON_TRANSFORM = { x: 0, y: 0, scale: 1, rotation: 0 };
const DEFAULT_PERSON2_TRANSFORM = { x: 0, y: 0, scale: 1, rotation: 0 };
const DEFAULT_PERSON3_TRANSFORM = { x: 0, y: 0, scale: 1, rotation: 0 };
const DEFAULT_PERSON4_TRANSFORM = { x: 0, y: 0, scale: 1, rotation: 0 };
const DEFAULT_PIP_FRAME = { x: 3.0, y: 15.4, width: 56.6, height: 64.3 };
// Para jogo-pip-duplo: ambos os PIPs compartilham width, height e y. pip2.x é calculado automaticamente.
const DEFAULT_DUPLO_PIP_X = 3.0;
const DEFAULT_DUPLO_PIP_Y = 15.4;
const DEFAULT_DUPLO_PIP_WIDTH = 27.0;
const DEFAULT_DUPLO_PIP_HEIGHT = 55.0;
const DEFAULT_PIP1_DUPLO_FRAME = { x: DEFAULT_DUPLO_PIP_X, y: DEFAULT_DUPLO_PIP_Y, width: DEFAULT_DUPLO_PIP_WIDTH, height: DEFAULT_DUPLO_PIP_HEIGHT };
const DEFAULT_PIP2_FRAME = { x: 100 - DEFAULT_DUPLO_PIP_X - DEFAULT_DUPLO_PIP_WIDTH, y: DEFAULT_DUPLO_PIP_Y, width: DEFAULT_DUPLO_PIP_WIDTH, height: DEFAULT_DUPLO_PIP_HEIGHT };

export type ThumbModel = 'pip' | 'pip-dividido' | 'duas-pessoas' | 'meio-a-meio' | 'so-lettering' | 'jogo-v1' | 'jogo-pip-duplo' | 'chamada-principal';

interface CortesThumbBuilderProps {
  programName?: string;
  bgImage?: string;
  logosImage?: string;
  logosNegativeImage?: string;
  divisoriaImage?: string;
  textColor?: string;
  strokeColor?: string;
  pipBorderColor?: string;
  highlightColor?: string;
  customFontFamily?: string;
  backUrl?: string;
  allowAllModels?: boolean;
  allowJogoV1?: boolean;
  allowChamadaPrincipal?: boolean;
}

export const CortesThumbBuilder = ({
  programName = 'Roda de Bobo',
  bgImage,
  logosImage,
  logosNegativeImage,
  divisoriaImage,
  textColor,
  strokeColor,
  pipBorderColor,
  highlightColor,
  customFontFamily,
  backUrl = '/',
  allowAllModels = false,
  allowJogoV1 = false,
  allowChamadaPrincipal = false,
}: CortesThumbBuilderProps) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const [canvasScale, setCanvasScale] = useState(0.5);

  const [thumbModel, setThumbModel] = useState<ThumbModel>('pip');
  const [pipImage, setPipImage] = useState<string | null>(null);
  const [personCutout, setPersonCutout] = useState<string | null>(null);
  const [person2Cutout, setPerson2Cutout] = useState<string | null>(null);
  const [person3Cutout, setPerson3Cutout] = useState<string | null>(null);
  const [person4Cutout, setPerson4Cutout] = useState<string | null>(null);
  const [thumbText, setThumbText] = useState('');
  const [thumbTextLeft, setThumbTextLeft] = useState('');
  const [thumbTextRight, setThumbTextRight] = useState('');
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const [isRemovingBg2, setIsRemovingBg2] = useState(false);
  const [isRemovingBg3, setIsRemovingBg3] = useState(false);
  const [isRemovingBg4, setIsRemovingBg4] = useState(false);
  const [isUpscalingPerson, setIsUpscalingPerson] = useState(false);
  const [isUpscalingPerson2, setIsUpscalingPerson2] = useState(false);

  const [pipTransform, setPipTransform] = useState(DEFAULT_PIP_TRANSFORM);
  const [personTransform, setPersonTransform] = useState(DEFAULT_PERSON_TRANSFORM);
  const [person2Transform, setPerson2Transform] = useState(DEFAULT_PERSON2_TRANSFORM);
  const [person3Transform, setPerson3Transform] = useState(DEFAULT_PERSON3_TRANSFORM);
  const [person4Transform, setPerson4Transform] = useState(DEFAULT_PERSON4_TRANSFORM);
  const [pipFrame, setPipFrame] = useState(DEFAULT_PIP_FRAME);
  const [pipBaseScale, setPipBaseScale] = useState(1);
  const [textBoxHeight, setTextBoxHeight] = useState(6);
  const [pip2Image, setPip2Image] = useState<string | null>(null);
  const [pip2Transform, setPip2Transform] = useState(DEFAULT_PIP_TRANSFORM);
  const [pip2Frame, setPip2Frame] = useState(DEFAULT_PIP2_FRAME);
  const [pip2BaseScale, setPip2BaseScale] = useState(1);
  const [customBgImage, setCustomBgImage] = useState<string | null>(null);
  const [logosVariant, setLogosVariant] = useState<'positiva' | 'negativa'>('positiva');
  const activeLogosImage = logosVariant === 'negativa' && logosNegativeImage ? logosNegativeImage : logosImage;

  const handleBgUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => setCustomBgImage(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    const updateScale = () => {
      const availableWidth = window.innerWidth >= 768
        ? (window.innerWidth / 2) - 32
        : window.innerWidth - 16;
      setCanvasScale(Math.min(availableWidth / CANVAS_WIDTH, 0.85));
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  const applyPipAutoScale = (dataUrl: string) => {
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

  const handlePipUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => applyPipAutoScale(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handlePipFromBase64 = (base64: string) => {
    applyPipAutoScale(base64);
  };

  const removeBg = async (file: File): Promise<string> => {
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
    return data.result_base64;
  };

  const removeBgFromBase64 = async (base64: string): Promise<string> => {
    const { data, error } = await supabase.functions.invoke('photoroom-remove-bg', {
      body: { image_base64: base64 },
    });
    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    return data.result_base64;
  };

  const handlePersonUpload = async (file: File) => {
    setIsRemovingBg(true);
    try {
      setPersonCutout(await removeBg(file));
      toast.success('Fundo removido!');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao remover fundo');
    } finally {
      setIsRemovingBg(false);
    }
  };

  const handlePerson2Upload = async (file: File) => {
    setIsRemovingBg2(true);
    try {
      setPerson2Cutout(await removeBg(file));
      toast.success('Fundo removido (pessoa 2)!');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao remover fundo');
    } finally {
      setIsRemovingBg2(false);
    }
  };

  const handlePerson3Upload = async (file: File) => {
    setIsRemovingBg3(true);
    try {
      setPerson3Cutout(await removeBg(file));
      toast.success('Fundo removido (pessoa 3)!');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao remover fundo');
    } finally {
      setIsRemovingBg3(false);
    }
  };

  const handlePerson4Upload = async (file: File) => {
    setIsRemovingBg4(true);
    try {
      setPerson4Cutout(await removeBg(file));
      toast.success('Fundo removido (pessoa 4)!');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao remover fundo');
    } finally {
      setIsRemovingBg4(false);
    }
  };

  const handlePersonDirectUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => setPersonCutout(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handlePerson2DirectUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => setPerson2Cutout(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleUpscalePerson = async () => {
    if (!personCutout) return;
    setIsUpscalingPerson(true);
    try {
      const { data, error } = await supabase.functions.invoke('gemini-upscale', {
        body: { image_base64: personCutout },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const upscaled = data.result_base64;
      try {
        const noBg = await removeBgFromBase64(upscaled);
        setPersonCutout(noBg);
        toast.success('Imagem melhorada e fundo removido!');
      } catch {
        setPersonCutout(upscaled);
        toast.warning('Imagem melhorada, mas erro ao remover fundo.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Erro ao melhorar imagem com Gemini');
    } finally {
      setIsUpscalingPerson(false);
    }
  };

  const handleUpscalePerson2 = async () => {
    if (!person2Cutout) return;
    setIsUpscalingPerson2(true);
    try {
      const { data, error } = await supabase.functions.invoke('gemini-upscale', {
        body: { image_base64: person2Cutout },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const upscaled = data.result_base64;
      try {
        const noBg = await removeBgFromBase64(upscaled);
        setPerson2Cutout(noBg);
        toast.success('Pessoa 2 melhorada e fundo removido!');
      } catch {
        setPerson2Cutout(upscaled);
        toast.warning('Pessoa 2 melhorada, mas erro ao remover fundo.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Erro ao melhorar imagem com Gemini');
    } finally {
      setIsUpscalingPerson2(false);
    }
  };

  const handlePip2Upload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setPip2Image(dataUrl);
      const img = new window.Image();
      img.onload = () => {
        const containerPixelW = (pip2Frame.width / 100) * CANVAS_WIDTH;
        const containerPixelH = (pip2Frame.height / 100) * CANVAS_HEIGHT;
        const containerRatio = containerPixelW / containerPixelH;
        const imageRatio = img.naturalWidth / img.naturalHeight;
        const autoScale = Math.max(containerRatio / imageRatio, imageRatio / containerRatio) + 0.05;
        setPip2BaseScale(autoScale);
        setPip2Transform(prev => ({ ...prev, scale: autoScale }));
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleClear = () => {
    setPipImage(null);
    setPip2Image(null);
    setPersonCutout(null);
    setPerson2Cutout(null);
    setPerson3Cutout(null);
    setPerson4Cutout(null);
    setThumbText('');
    setThumbTextLeft('');
    setThumbTextRight('');
    setPipTransform(DEFAULT_PIP_TRANSFORM);
    setPip2Transform(DEFAULT_PIP_TRANSFORM);
    setPersonTransform(DEFAULT_PERSON_TRANSFORM);
    setPerson2Transform(DEFAULT_PERSON2_TRANSFORM);
    setPerson3Transform(DEFAULT_PERSON3_TRANSFORM);
    setPerson4Transform(DEFAULT_PERSON4_TRANSFORM);
    setPipFrame(DEFAULT_PIP_FRAME);
    setPip2Frame(DEFAULT_PIP2_FRAME);
    setPipBaseScale(1);
    setPip2BaseScale(1);
    setCustomBgImage(null);
    setTextBoxHeight(6);
  };

  const scaledHeight = CANVAS_HEIGHT * canvasScale;

  return (
    <div className="h-screen bg-background flex flex-col md:flex-row overflow-hidden">
      <div
        className={`flex items-center justify-center overflow-hidden bg-black shrink-0 ${isMobile ? '' : 'md:w-1/2'}`}
        style={isMobile ? { height: scaledHeight + 8, minHeight: scaledHeight + 8 } : undefined}
      >
        <div style={{ transform: `scale(${canvasScale})`, transformOrigin: 'center' }}>
           <CortesCanvas
            ref={canvasRef}
            thumbModel={thumbModel}
            pipImage={pipImage}
            pip2Image={pip2Image}
            personCutout={personCutout}
            person2Cutout={person2Cutout}
            person3Cutout={person3Cutout}
            person4Cutout={person4Cutout}
            thumbText={thumbText}
            thumbTextLeft={thumbTextLeft}
            thumbTextRight={thumbTextRight}
            pipTransform={pipTransform}
            pip2Transform={pip2Transform}
            personTransform={personTransform}
            person2Transform={person2Transform}
            person3Transform={person3Transform}
            person4Transform={person4Transform}
            pipFrame={pipFrame}
            pip2Frame={pip2Frame}
            bgImage={customBgImage || bgImage}
            logosImage={activeLogosImage}
            divisoriaImage={divisoriaImage}
            textColor={textColor}
            strokeColor={strokeColor}
            pipBorderColor={pipBorderColor}
            highlightColor={highlightColor}
            customFontFamily={customFontFamily}
            textBoxHeight={textBoxHeight}
          />
        </div>
      </div>

      <div className="w-full md:w-1/2 bg-card border-t md:border-t-0 md:border-l border-border flex flex-col flex-1 md:flex-none overflow-hidden">
        <div className="p-4 md:p-6 pb-3 md:pb-4 border-b border-border flex items-center justify-between shrink-0">
          <div>
          <h1 className="text-xl font-bold tracking-tight">{programName}</h1>
            <p className="text-xs text-muted-foreground mt-1">Gerador de Thumbnails</p>
          </div>
          <a href={backUrl}>
            <Button variant="outline" size="sm" className="gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5" /> Voltar
            </Button>
          </a>
        </div>

        <div className="p-3 md:p-5 flex-1 overflow-y-auto">
          <CortesControls
            thumbModel={thumbModel}
            onThumbModelChange={setThumbModel}
            allowAllModels={allowAllModels}
            allowJogoV1={allowJogoV1}
            allowChamadaPrincipal={allowChamadaPrincipal}
            pipImage={pipImage}
            pip2Image={pip2Image}
            personCutout={personCutout}
            person2Cutout={person2Cutout}
            person3Cutout={person3Cutout}
            person4Cutout={person4Cutout}
            thumbText={thumbText}
            thumbTextLeft={thumbTextLeft}
            thumbTextRight={thumbTextRight}
            isRemovingBg={isRemovingBg}
            isRemovingBg2={isRemovingBg2}
            isRemovingBg3={isRemovingBg3}
            isRemovingBg4={isRemovingBg4}
            isUpscalingPerson={isUpscalingPerson}
            isUpscalingPerson2={isUpscalingPerson2}
            onUpscalePerson={handleUpscalePerson}
            onUpscalePerson2={handleUpscalePerson2}
            pipTransform={pipTransform}
            pip2Transform={pip2Transform}
            personTransform={personTransform}
            person2Transform={person2Transform}
            person3Transform={person3Transform}
            person4Transform={person4Transform}
            pipFrame={pipFrame}
            pip2Frame={pip2Frame}
            pipBaseScale={pipBaseScale}
            pip2BaseScale={pip2BaseScale}
            onPipUpload={handlePipUpload}
            onPip2Upload={handlePip2Upload}
            onPersonUpload={handlePersonUpload}
            onPerson2Upload={handlePerson2Upload}
            onPerson3Upload={handlePerson3Upload}
            onPerson4Upload={handlePerson4Upload}
            onPersonDirectUpload={handlePersonDirectUpload}
            onPerson2DirectUpload={handlePerson2DirectUpload}
            onTextChange={setThumbText}
            onTextLeftChange={setThumbTextLeft}
            onTextRightChange={setThumbTextRight}
            onPipTransformChange={(t) => setPipTransform((prev) => ({ ...prev, ...t }))}
            onPip2TransformChange={(t) => setPip2Transform((prev) => ({ ...prev, ...t }))}
            onPersonTransformChange={(t) => setPersonTransform((prev) => ({ ...prev, ...t }))}
            onPerson2TransformChange={(t) => setPerson2Transform((prev) => ({ ...prev, ...t }))}
            onPerson3TransformChange={(t) => setPerson3Transform((prev) => ({ ...prev, ...t }))}
            onPerson4TransformChange={(t) => setPerson4Transform((prev) => ({ ...prev, ...t }))}
            onPipFrameChange={(f) => {
              if (thumbModel === 'jogo-pip-duplo') {
                // Sincroniza width, height, y; pip2.x é sempre espelhado
                setPipFrame((pip1Prev) => {
                  const pip1Next = { ...pip1Prev, ...f };
                  setPip2Frame((pip2Prev) => {
                    const pip2Next = { ...pip2Prev };
                    if (f.width !== undefined) pip2Next.width = pip1Next.width;
                    if (f.height !== undefined) pip2Next.height = pip1Next.height;
                    if (f.y !== undefined) pip2Next.y = pip1Next.y;
                    pip2Next.x = 100 - pip1Next.x - pip1Next.width;
                    return pip2Next;
                  });
                  return pip1Next;
                });
              } else {
                setPipFrame((prev) => ({ ...prev, ...f }));
              }
            }}
            onPip2FrameChange={(f) => setPip2Frame((prev) => ({ ...prev, ...f }))}
            customBgImage={customBgImage}
            onBgUpload={handleBgUpload}
            onClear={handleClear}
            canvasRef={canvasRef}
            logosVariant={logosVariant}
            onLogosVariantChange={setLogosVariant}
            hasLogosNegative={!!logosNegativeImage}
            textBoxHeight={textBoxHeight}
            onTextBoxHeightChange={setTextBoxHeight}
            onPipFromBase64={handlePipFromBase64}
            currentCanvasProps={{
              thumbModel,
              pipImage,
              pip2Image,
              personCutout,
              person2Cutout,
              person3Cutout,
              person4Cutout,
              thumbText,
              thumbTextLeft,
              thumbTextRight,
              pipTransform,
              pip2Transform,
              personTransform,
              person2Transform,
              person3Transform,
              person4Transform,
              pipFrame,
              pip2Frame,
              bgImage: customBgImage || bgImage,
              logosImage: activeLogosImage,
              divisoriaImage,
              textColor,
              strokeColor,
              pipBorderColor,
              highlightColor,
              customFontFamily,
              textBoxHeight,
            }}
          />
        </div>
      </div>
    </div>
  );
};
