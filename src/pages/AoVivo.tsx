import { useState, useRef, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ThumbnailCanvasAoVivo, AoVivoTemplate } from '@/components/ThumbnailCanvasAoVivo';
import { PhotoControls } from '@/components/controls/PhotoControls';
import { TeamControls } from '@/components/controls/TeamControls';
import { AoVivoGradientControls } from '@/components/controls/AoVivoGradientControls';
import { ThumbnailState, PhotoTransform } from '@/types/thumbnail';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 720;

const AoVivo = () => {
  const canvasRefAoVivo = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [mobileScale, setMobileScale] = useState(0.3);
  const [aoVivoTemplate, setAoVivoTemplate] = useState<AoVivoTemplate>('europaleague');
  const [gradientLeftColor, setGradientLeftColor] = useState('#000000');
  const [gradientRightColor, setGradientRightColor] = useState('#000000');
  const [showSomAmbiente, setShowSomAmbiente] = useState(false);

  const [state, setState] = useState<ThumbnailState>({
    playerPhoto: null,
    photoTransform: { x: 0, y: 0, scale: 1, scaleX: 1, scaleY: 1 },
    jogoCompletoPhoto: null,
    jogoCompletoPhotoTransform: { x: 0, y: 0, scale: 1, scaleX: 1, scaleY: 1 },
    aoVivoPhoto: null,
    aoVivoPhotoTransform: { x: 0, y: 0, scale: 1, scaleX: 1, scaleY: 1 },
    aoVivoPhotoLeft: null,
    aoVivoPhotoLeftTransform: { x: 0, y: 0, scale: 1, scaleX: 1, scaleY: 1 },
    aoVivoPhotoRight: null,
    aoVivoPhotoRightTransform: { x: 0, y: 0, scale: 1, scaleX: 1, scaleY: 1 },
    matchData: {
      homeTeamId: null, awayTeamId: null,
      homeScore: 0, awayScore: 0,
      homeScoreSmall: 0, awayScoreSmall: 0,
      showSmallScore: false,
    },
    initialScale: 0.5,
    initialScaleJogoCompleto: 0.5,
    initialScaleAoVivo: 0.5,
    initialScaleAoVivoLeft: 0.5,
    initialScaleAoVivoRight: 0.5,
    template: 'europaleague',
  });

  const handleAoVivoLeftPhotoUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const scale0 = Math.min(640 / img.naturalWidth, 720 / img.naturalHeight);
        setState(prev => ({
          ...prev,
          aoVivoPhotoLeft: e.target?.result as string,
          initialScaleAoVivoLeft: scale0,
          aoVivoPhotoLeftTransform: { x: 0, y: 0, scale: scale0, scaleX: 1, scaleY: 1 },
        }));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleAoVivoRightPhotoUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const scale0 = Math.min(640 / img.naturalWidth, 720 / img.naturalHeight);
        setState(prev => ({
          ...prev,
          aoVivoPhotoRight: e.target?.result as string,
          initialScaleAoVivoRight: scale0,
          aoVivoPhotoRightTransform: { x: 0, y: 0, scale: scale0, scaleX: 1, scaleY: 1 },
        }));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleAoVivoLeftTransformChange = (transform: Partial<PhotoTransform>) => {
    setState(prev => ({ ...prev, aoVivoPhotoLeftTransform: { ...prev.aoVivoPhotoLeftTransform, ...transform } }));
  };

  const handleAoVivoRightTransformChange = (transform: Partial<PhotoTransform>) => {
    setState(prev => ({ ...prev, aoVivoPhotoRightTransform: { ...prev.aoVivoPhotoRightTransform, ...transform } }));
  };

  const handleMatchDataChange = (data: Partial<typeof state.matchData>) => {
    setState(prev => ({ ...prev, matchData: { ...prev.matchData, ...data } }));
  };

  useEffect(() => {
    const updateScale = () => {
      const availableWidth = window.innerWidth >= 768
        ? (window.innerWidth / 2) - 32
        : window.innerWidth - 16;
      setMobileScale(Math.min(availableWidth / CANVAS_WIDTH, 0.85));
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  const canvasScale = mobileScale;
  const scaledHeight = CANVAS_HEIGHT * canvasScale;

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      <div
        className={`flex items-center justify-center overflow-hidden bg-black ${isMobile ? '' : 'md:w-1/2'}`}
        style={isMobile ? { height: scaledHeight + 8, minHeight: scaledHeight + 8 } : undefined}
      >
        <div style={{ transform: `scale(${canvasScale})`, transformOrigin: 'center' }}>
          <ThumbnailCanvasAoVivo
            ref={canvasRefAoVivo}
            playerPhoto={state.aoVivoPhoto}
            photoTransform={state.aoVivoPhotoTransform}
            photoLeft={state.aoVivoPhotoLeft}
            photoLeftTransform={state.aoVivoPhotoLeftTransform}
            photoRight={state.aoVivoPhotoRight}
            photoRightTransform={state.aoVivoPhotoRightTransform}
            matchData={state.matchData}
            template="europaleague"
            aoVivoTemplate={aoVivoTemplate}
            gradientLeftColor={gradientLeftColor}
            gradientRightColor={gradientRightColor}
            panelLeftColor={gradientLeftColor}
            panelRightColor={gradientRightColor}
            showSomAmbiente={showSomAmbiente}
          />
        </div>
      </div>

      <div className="w-full md:w-1/2 bg-card border-t md:border-t-0 md:border-l border-border overflow-y-auto flex flex-col flex-1 md:flex-none">
        <div className="p-4 md:p-6 pb-3 md:pb-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Ao Vivo</h1>
              <p className="text-xs text-muted-foreground mt-1">Gerador de Thumbnails</p>
            </div>
          </div>
        </div>

        <div className="p-3 md:p-5 flex-1">
          <div className="mb-5 space-y-4">
            <div>
              <Label className="text-xs font-medium mb-2 block">Template Ao Vivo</Label>
              <Select
                value={aoVivoTemplate}
                onValueChange={(val: AoVivoTemplate) => {
                  setAoVivoTemplate(val);
                  handleMatchDataChange({ homeTeamId: null, awayTeamId: null });
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="europaleague">Europa League</SelectItem>
                  <SelectItem value="conferenceleague">Conference League</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <AoVivoGradientControls
              gradientLeftColor={gradientLeftColor}
              gradientRightColor={gradientRightColor}
              onGradientLeftColorChange={setGradientLeftColor}
              onGradientRightColorChange={setGradientRightColor}
            />
            <div className="flex items-center gap-2">
              <Switch id="som-ambiente" checked={showSomAmbiente} onCheckedChange={setShowSomAmbiente} />
              <Label htmlFor="som-ambiente" className="text-sm cursor-pointer">Som ambiente</Label>
            </div>
          </div>

          <Tabs defaultValue="photo" className="w-full">
            <TabsList className="w-full grid grid-cols-2 h-10">
              <TabsTrigger value="photo" className="text-xs">Fotos</TabsTrigger>
              <TabsTrigger value="teams" className="text-xs">Times</TabsTrigger>
            </TabsList>

            <TabsContent value="photo" className="mt-5">
              <PhotoControls
                activeCanvas="av"
                photoTransform={state.photoTransform}
                initialScale={state.initialScale}
                onTransformChange={() => {}}
                onPhotoUpload={() => {}}
                playerPhoto={null}
                jogoCompletoPhoto={null}
                jogoCompletoPhotoTransform={state.jogoCompletoPhotoTransform}
                initialScaleJogoCompleto={state.initialScaleJogoCompleto}
                onJogoCompletoTransformChange={() => {}}
                onJogoCompletoPhotoUpload={() => {}}
                onPlayerPhotoReplace={() => {}}
                onJogoCompletoPhotoReplace={() => {}}
                aoVivoPhotoLeft={state.aoVivoPhotoLeft}
                aoVivoPhotoLeftTransform={state.aoVivoPhotoLeftTransform}
                initialScaleAoVivoLeft={state.initialScaleAoVivoLeft}
                onAoVivoPhotoLeftUpload={handleAoVivoLeftPhotoUpload}
                onAoVivoPhotoLeftTransformChange={handleAoVivoLeftTransformChange}
                onAoVivoPhotoLeftReplace={(dataUrl) => setState(prev => ({ ...prev, aoVivoPhotoLeft: dataUrl, aoVivoPhotoLeftTransform: { x: 0, y: 0, scale: 1, scaleX: 1, scaleY: 1 } }))}
                aoVivoPhotoRight={state.aoVivoPhotoRight}
                aoVivoPhotoRightTransform={state.aoVivoPhotoRightTransform}
                initialScaleAoVivoRight={state.initialScaleAoVivoRight}
                onAoVivoPhotoRightUpload={handleAoVivoRightPhotoUpload}
                onAoVivoPhotoRightTransformChange={handleAoVivoRightTransformChange}
                onAoVivoPhotoRightReplace={(dataUrl) => setState(prev => ({ ...prev, aoVivoPhotoRight: dataUrl, aoVivoPhotoRightTransform: { x: 0, y: 0, scale: 1, scaleX: 1, scaleY: 1 } }))}
              />
            </TabsContent>

            <TabsContent value="teams" className="mt-5">
              <TeamControls matchData={state.matchData} onMatchDataChange={handleMatchDataChange} template={state.template} activeCanvas="av" aoVivoTemplate={aoVivoTemplate} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AoVivo;
