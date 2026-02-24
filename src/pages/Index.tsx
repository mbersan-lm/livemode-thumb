import { useState, useRef, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ThumbnailCanvas } from '@/components/ThumbnailCanvas';
import { ThumbnailCanvasJogoCompleto } from '@/components/ThumbnailCanvasJogoCompleto';
import { ThumbnailCanvasAoVivo } from '@/components/ThumbnailCanvasAoVivo';
import { PhotoControls } from '@/components/controls/PhotoControls';
import { TeamControls } from '@/components/controls/TeamControls';
import { ExportControls } from '@/components/controls/ExportControls';
import { AoVivoGradientControls } from '@/components/controls/AoVivoGradientControls';
import { TemplateControls } from '@/components/controls/TemplateControls';
import { ViewControls, ActiveCanvas } from '@/components/controls/ViewControls';
import { ThumbnailState, PhotoTransform } from '@/types/thumbnail';
import { TemplateType } from '@/data/templates';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ArrowRight } from 'lucide-react';
import { AoVivoTemplate } from '@/components/ThumbnailCanvasAoVivo';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 720;

const Index = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const canvasRefJogoCompleto = useRef<HTMLDivElement>(null);
  const canvasRefAoVivo = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  
  const [activeCanvas, setActiveCanvas] = useState<ActiveCanvas>('mm');
  const [aoVivoTemplate, setAoVivoTemplate] = useState<AoVivoTemplate>('europaleague');
  const [mobileScale, setMobileScale] = useState(0.3);
  const [gradientLeftColor, setGradientLeftColor] = useState('#000000');
  const [gradientRightColor, setGradientRightColor] = useState('#000000');
  const [panelLeftColor, setPanelLeftColor] = useState('#c0c0c0');
  const [panelRightColor, setPanelRightColor] = useState('#c0c0c0');
  const [showSomAmbiente, setShowSomAmbiente] = useState(false);
  
  const [state, setState] = useState<ThumbnailState>({
    playerPhoto: null,
    photoTransform: {
      x: 0,
      y: 0,
      scale: 1,
      scaleX: 1,
      scaleY: 1,
    },
    jogoCompletoPhoto: null,
    jogoCompletoPhotoTransform: {
      x: 0,
      y: 0,
      scale: 1,
      scaleX: 1,
      scaleY: 1,
    },
    aoVivoPhoto: null,
    aoVivoPhotoTransform: {
      x: 0,
      y: 0,
      scale: 1,
      scaleX: 1,
      scaleY: 1,
    },
    aoVivoPhotoLeft: null,
    aoVivoPhotoLeftTransform: {
      x: 0,
      y: 0,
      scale: 1,
      scaleX: 1,
      scaleY: 1,
    },
    aoVivoPhotoRight: null,
    aoVivoPhotoRightTransform: {
      x: 0,
      y: 0,
      scale: 1,
      scaleX: 1,
      scaleY: 1,
    },
    matchData: {
      homeTeamId: null,
      awayTeamId: null,
      homeScore: 0,
      awayScore: 0,
      homeScoreSmall: 0,
      awayScoreSmall: 0,
      showSmallScore: false,
    },
    initialScale: 0.5,
    initialScaleJogoCompleto: 0.5,
    initialScaleAoVivo: 0.5,
    initialScaleAoVivoLeft: 0.5,
    initialScaleAoVivoRight: 0.5,
    template: 'brasileirao',
  });

  const handlePhotoUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const scale0 = Math.min(1280 / img.naturalWidth, 720 / img.naturalHeight);
        setState(prev => ({
          ...prev,
          playerPhoto: e.target?.result as string,
          initialScale: scale0,
          photoTransform: { x: 0, y: 0, scale: scale0, scaleX: 1, scaleY: 1 },
        }));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleJogoCompletoPhotoUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const scale0 = Math.min(1280 / img.naturalWidth, 720 / img.naturalHeight);
        setState(prev => ({
          ...prev,
          jogoCompletoPhoto: e.target?.result as string,
          initialScaleJogoCompleto: scale0,
          jogoCompletoPhotoTransform: { x: 0, y: 0, scale: scale0, scaleX: 1, scaleY: 1 },
        }));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

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

  const handleTransformChange = (transform: Partial<typeof state.photoTransform>) => {
    setState(prev => ({ ...prev, photoTransform: { ...prev.photoTransform, ...transform } }));
  };

  const handleJogoCompletoTransformChange = (transform: Partial<typeof state.jogoCompletoPhotoTransform>) => {
    setState(prev => ({ ...prev, jogoCompletoPhotoTransform: { ...prev.jogoCompletoPhotoTransform, ...transform } }));
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

  const handleTemplateChange = (template: TemplateType) => {
    setState(prev => ({
      ...prev,
      template,
      matchData: { ...prev.matchData, homeTeamId: null, awayTeamId: null },
    }));
  };

  useEffect(() => {
    const updateScale = () => {
      const availableWidth = window.innerWidth >= 768
        ? (window.innerWidth / 2) - 32
        : window.innerWidth - 16;
      const scale = Math.min(availableWidth / CANVAS_WIDTH, 0.85);
      setMobileScale(scale);
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  const canvasScale = mobileScale;
  const scaledHeight = CANVAS_HEIGHT * canvasScale;

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Main Canvas Area */}
      <div
        className={`flex items-center justify-center overflow-hidden bg-black ${isMobile ? '' : 'md:w-1/2'}`}
        style={isMobile ? { height: scaledHeight + 8, minHeight: scaledHeight + 8 } : undefined}
      >
        <div className="flex items-center justify-center">
          {activeCanvas === 'mm' ? (
            <div style={{ transform: `scale(${canvasScale})`, transformOrigin: 'center' }}>
              <ThumbnailCanvas
                ref={canvasRef}
                playerPhoto={state.playerPhoto}
                photoTransform={state.photoTransform}
                matchData={state.matchData}
                template={state.template}
              />
            </div>
          ) : activeCanvas === 'jc' ? (
            <div style={{ transform: `scale(${canvasScale})`, transformOrigin: 'center' }}>
              <ThumbnailCanvasJogoCompleto
                ref={canvasRefJogoCompleto}
                playerPhoto={state.jogoCompletoPhoto}
                photoTransform={state.jogoCompletoPhotoTransform}
                matchData={state.matchData}
                template={state.template}
              />
            </div>
          ) : (
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
          )}
        </div>
      </div>

      <div className="w-full md:w-1/2 bg-card border-t md:border-t-0 md:border-l border-border overflow-y-auto flex flex-col flex-1 md:flex-none">
        <div className="p-4 md:p-6 pb-3 md:pb-4 border-b border-border flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Melhores Momentos</h1>
            <p className="text-xs text-muted-foreground mt-1">
              Gerador de Thumbnails
            </p>
          </div>
          <a href="/cortes">
            <Button variant="outline" size="sm" className="gap-1.5">
              Cortes <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </a>
        </div>

        <div className="p-3 md:p-5 flex-1">
          {/* Canvas Switcher */}
          <div className="mb-5">
            <ViewControls
              activeCanvas={activeCanvas}
              onActiveCanvasChange={setActiveCanvas}
            />
          </div>

          {activeCanvas === 'av' && (
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
                <Switch
                  id="som-ambiente"
                  checked={showSomAmbiente}
                  onCheckedChange={setShowSomAmbiente}
                />
                <Label htmlFor="som-ambiente" className="text-sm cursor-pointer">Som ambiente</Label>
              </div>
            </div>
          )}

          <Tabs defaultValue="template" className="w-full">
            <TabsList className={`w-full grid h-10 ${activeCanvas === 'av' ? 'grid-cols-2' : 'grid-cols-4'}`}>
              {activeCanvas !== 'av' && <TabsTrigger value="template" className="text-xs">Template</TabsTrigger>}
              {activeCanvas !== 'av' && <TabsTrigger value="photo" className="text-xs">Foto</TabsTrigger>}
              <TabsTrigger value="teams" className="text-xs">Times</TabsTrigger>
              <TabsTrigger value="export" className="text-xs">Exportar</TabsTrigger>
            </TabsList>

            <TabsContent value="template" className="mt-5">
              <TemplateControls
                currentTemplate={state.template}
                onTemplateChange={handleTemplateChange}
              />
            </TabsContent>

            <TabsContent value="photo" className="mt-5">
              <PhotoControls
                activeCanvas={activeCanvas}
                photoTransform={state.photoTransform}
                initialScale={state.initialScale}
                onTransformChange={handleTransformChange}
                onPhotoUpload={handlePhotoUpload}
                playerPhoto={state.playerPhoto}
                jogoCompletoPhoto={state.jogoCompletoPhoto}
                jogoCompletoPhotoTransform={state.jogoCompletoPhotoTransform}
                initialScaleJogoCompleto={state.initialScaleJogoCompleto}
                onJogoCompletoTransformChange={handleJogoCompletoTransformChange}
                onJogoCompletoPhotoUpload={handleJogoCompletoPhotoUpload}
                onPlayerPhotoReplace={(dataUrl) => setState(prev => ({ ...prev, playerPhoto: dataUrl, photoTransform: { x: 0, y: 0, scale: 1, scaleX: 1, scaleY: 1 } }))}
                onJogoCompletoPhotoReplace={(dataUrl) => setState(prev => ({ ...prev, jogoCompletoPhoto: dataUrl, jogoCompletoPhotoTransform: { x: 0, y: 0, scale: 1, scaleX: 1, scaleY: 1 } }))}
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
              <TeamControls
                matchData={state.matchData}
                onMatchDataChange={handleMatchDataChange}
                template={state.template}
                activeCanvas={activeCanvas}
                aoVivoTemplate={aoVivoTemplate}
              />
            </TabsContent>

            <TabsContent value="export" className="mt-5">
              <ExportControls
                canvasRef={canvasRef}
                canvasRefJogoCompleto={canvasRefJogoCompleto}
                matchData={state.matchData}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Index;
