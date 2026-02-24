import { useState, useRef, useEffect } from 'react';
import { ThumbnailCanvasAoVivo, AoVivoTemplate } from '@/components/ThumbnailCanvasAoVivo';
import { TeamControls } from '@/components/controls/TeamControls';
import { ExportControls } from '@/components/controls/ExportControls';
import { AoVivoGradientControls } from '@/components/controls/AoVivoGradientControls';
import { PhotoControls } from '@/components/controls/PhotoControls';
import { PhotoTransform, ThumbnailState } from '@/types/thumbnail';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 720;

const AoVivo = () => {
  const canvasRefAoVivo = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const [aoVivoTemplate, setAoVivoTemplate] = useState<AoVivoTemplate>('europaleague');
  const [mobileScale, setMobileScale] = useState(0.3);
  const [gradientLeftColor, setGradientLeftColor] = useState('#000000');
  const [gradientRightColor, setGradientRightColor] = useState('#000000');
  const [showSomAmbiente, setShowSomAmbiente] = useState(false);

  const [photoLeft, setPhotoLeft] = useState<string | null>(null);
  const [photoLeftTransform, setPhotoLeftTransform] = useState<PhotoTransform>({ x: 0, y: 0, scale: 1, scaleX: 1, scaleY: 1 });
  const [initialScaleLeft, setInitialScaleLeft] = useState(0.5);

  const [photoRight, setPhotoRight] = useState<string | null>(null);
  const [photoRightTransform, setPhotoRightTransform] = useState<PhotoTransform>({ x: 0, y: 0, scale: 1, scaleX: 1, scaleY: 1 });
  const [initialScaleRight, setInitialScaleRight] = useState(0.5);

  const [matchData, setMatchData] = useState({
    homeTeamId: null as string | null,
    awayTeamId: null as string | null,
    homeScore: 0,
    awayScore: 0,
    homeScoreSmall: 0,
    awayScoreSmall: 0,
    showSmallScore: false,
  });

  const handleLeftPhotoUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const scale0 = Math.min(640 / img.naturalWidth, 720 / img.naturalHeight);
        setPhotoLeft(e.target?.result as string);
        setInitialScaleLeft(scale0);
        setPhotoLeftTransform({ x: 0, y: 0, scale: scale0, scaleX: 1, scaleY: 1 });
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleRightPhotoUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const scale0 = Math.min(640 / img.naturalWidth, 720 / img.naturalHeight);
        setPhotoRight(e.target?.result as string);
        setInitialScaleRight(scale0);
        setPhotoRightTransform({ x: 0, y: 0, scale: scale0, scaleX: 1, scaleY: 1 });
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleMatchDataChange = (data: Partial<typeof matchData>) => {
    setMatchData(prev => ({ ...prev, ...data }));
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
      <div
        className={`flex items-center justify-center overflow-hidden bg-black ${isMobile ? '' : 'md:w-1/2'}`}
        style={isMobile ? { height: scaledHeight + 8, minHeight: scaledHeight + 8 } : undefined}
      >
        <div className="flex items-center justify-center">
          <div style={{ transform: `scale(${canvasScale})`, transformOrigin: 'center' }}>
            <ThumbnailCanvasAoVivo
              ref={canvasRefAoVivo}
              playerPhoto={null}
              photoTransform={{ x: 0, y: 0, scale: 1, scaleX: 1, scaleY: 1 }}
              photoLeft={photoLeft}
              photoLeftTransform={photoLeftTransform}
              photoRight={photoRight}
              photoRightTransform={photoRightTransform}
              matchData={matchData}
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
      </div>

      <div className="w-full md:w-1/2 bg-card border-t md:border-t-0 md:border-l border-border overflow-y-auto flex flex-col flex-1 md:flex-none">
        <div className="p-4 md:p-6 pb-3 md:pb-4 border-b border-border flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Ao Vivo</h1>
            <p className="text-xs text-muted-foreground mt-1">Gerador de Thumbnails</p>
          </div>
          <a href="/">
            <Button variant="outline" size="sm" className="gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5" /> Hub
            </Button>
          </a>
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

          <Tabs defaultValue="teams" className="w-full">
            <TabsList className="w-full grid h-10 grid-cols-3">
              <TabsTrigger value="photo" className="text-xs">Foto</TabsTrigger>
              <TabsTrigger value="teams" className="text-xs">Times</TabsTrigger>
              <TabsTrigger value="export" className="text-xs">Exportar</TabsTrigger>
            </TabsList>

            <TabsContent value="photo" className="mt-5">
              <PhotoControls
                activeCanvas="av"
                photoTransform={{ x: 0, y: 0, scale: 1, scaleX: 1, scaleY: 1 }}
                initialScale={0.5}
                onTransformChange={() => {}}
                onPhotoUpload={() => {}}
                playerPhoto={null}
                jogoCompletoPhoto={null}
                jogoCompletoPhotoTransform={{ x: 0, y: 0, scale: 1, scaleX: 1, scaleY: 1 }}
                initialScaleJogoCompleto={0.5}
                onJogoCompletoTransformChange={() => {}}
                onJogoCompletoPhotoUpload={() => {}}
                onPlayerPhotoReplace={() => {}}
                onJogoCompletoPhotoReplace={() => {}}
                aoVivoPhotoLeft={photoLeft}
                aoVivoPhotoLeftTransform={photoLeftTransform}
                initialScaleAoVivoLeft={initialScaleLeft}
                onAoVivoPhotoLeftUpload={handleLeftPhotoUpload}
                onAoVivoPhotoLeftTransformChange={(t) => setPhotoLeftTransform(prev => ({ ...prev, ...t }))}
                onAoVivoPhotoLeftReplace={(dataUrl) => { setPhotoLeft(dataUrl); setPhotoLeftTransform({ x: 0, y: 0, scale: 1, scaleX: 1, scaleY: 1 }); }}
                aoVivoPhotoRight={photoRight}
                aoVivoPhotoRightTransform={photoRightTransform}
                initialScaleAoVivoRight={initialScaleRight}
                onAoVivoPhotoRightUpload={handleRightPhotoUpload}
                onAoVivoPhotoRightTransformChange={(t) => setPhotoRightTransform(prev => ({ ...prev, ...t }))}
                onAoVivoPhotoRightReplace={(dataUrl) => { setPhotoRight(dataUrl); setPhotoRightTransform({ x: 0, y: 0, scale: 1, scaleX: 1, scaleY: 1 }); }}
              />
            </TabsContent>

            <TabsContent value="teams" className="mt-5">
              <TeamControls
                matchData={matchData}
                onMatchDataChange={handleMatchDataChange}
                template="europaleague"
                activeCanvas="av"
                aoVivoTemplate={aoVivoTemplate}
              />
            </TabsContent>

            <TabsContent value="export" className="mt-5">
              <ExportControls
                canvasRef={canvasRefAoVivo}
                canvasRefJogoCompleto={canvasRefAoVivo}
                matchData={matchData}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AoVivo;
