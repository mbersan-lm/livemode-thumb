import { useState, useRef, useEffect } from 'react';
import { ThumbnailCanvasAoVivo, AoVivoTemplate } from '@/components/ThumbnailCanvasAoVivo';
import { TeamControls } from '@/components/controls/TeamControls';
import { AoVivoGradientControls } from '@/components/controls/AoVivoGradientControls';
import { PhotoControls } from '@/components/controls/PhotoControls';
import { PhotoTransform, ThumbnailState } from '@/types/thumbnail';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Download } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { teamsAoVivo } from '@/data/teamsAoVivo';
import { teamsConferenceLeague } from '@/data/teamsConferenceLeague';
import { toast } from 'sonner';

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

  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  const getCrestMaxSize = (teamId: string | null, isConference: boolean): number => {
    if (isConference) return 400;
    if (teamId === 'av5') return 248;
    if (teamId === 'av6') return 315;
    if (teamId === 'av29') return 400;
    if (teamId === 'av21') return 450;
    if (teamId === 'av24') return 360;
    return 500;
  };

  const drawImageCentered = (
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    cx: number,
    cy: number,
    maxW: number,
    maxH: number
  ) => {
    const scale = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight, 1);
    const w = img.naturalWidth * scale;
    const h = img.naturalHeight * scale;
    ctx.drawImage(img, cx - w / 2, cy - h / 2, w, h);
  };

  const drawPhotoLayer = (
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    anchorX: number,
    anchorY: number,
    transform: PhotoTransform
  ) => {
    ctx.save();
    ctx.translate(anchorX, anchorY);
    ctx.translate(transform.x, transform.y);
    ctx.scale(transform.scale * (transform.scaleX ?? 1), transform.scale * (transform.scaleY ?? 1));
    ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
    ctx.restore();
  };

  const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  };

  const handleExportAoVivo = async () => {
    try {
      toast.loading('Gerando JPG Ao Vivo...');

      const W = 1280;
      const H = 720;
      const canvas = document.createElement('canvas');
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext('2d')!;

      // 1. Black background
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, W, H);

      // 2. Player photo (z:0) — usually null in Ao Vivo but support it
      // (skipped — playerPhoto is always null in current usage)

      // 3. Left photo (z:5)
      if (photoLeft) {
        const img = await loadImage(photoLeft);
        drawPhotoLayer(ctx, img, W * 0.25, H * 0.5, photoLeftTransform);
      }

      // 4. Right photo (z:5)
      if (photoRight) {
        const img = await loadImage(photoRight);
        drawPhotoLayer(ctx, img, W * 0.75, H * 0.5, photoRightTransform);
      }

      // 5. KV background (z:10) — drawn as cover
      const kvSrc = '/kv/kv-ao-vivo.png';
      const kvImg = await loadImage(kvSrc);
      ctx.drawImage(kvImg, 0, 0, W, H);

      // 6. Left gradient overlay (z:15, mix-blend-mode: overlay)
      ctx.save();
      ctx.globalCompositeOperation = 'overlay';
      const gradL = ctx.createLinearGradient(0, 0, W, 0);
      gradL.addColorStop(0, gradientLeftColor);
      gradL.addColorStop(0.5, 'transparent');
      ctx.fillStyle = gradL;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();

      // 7. Right gradient overlay (z:15, mix-blend-mode: overlay)
      ctx.save();
      ctx.globalCompositeOperation = 'overlay';
      const gradR = ctx.createLinearGradient(W, 0, 0, 0);
      gradR.addColorStop(0, gradientRightColor);
      gradR.addColorStop(0.5, 'transparent');
      ctx.fillStyle = gradR;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();

      // 8. Glass panels (z:16) — semi-transparent with border
      const drawGlassPanel = (x: number, y: number, w: number, h: number, color: string) => {
        ctx.save();
        roundRect(ctx, x, y, w, h, 12);
        ctx.fillStyle = color + '33';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.35)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
      };

      drawGlassPanel(291, 319, 334, 437, gradientLeftColor);
      drawGlassPanel(655, 319, 334, 437, gradientRightColor);
      drawGlassPanel(-30, H - 145 + (H * 0.05), 280, 145, '#000000');

      // 9. Overlay panels PNG (z:17)
      if (!showSomAmbiente) {
        const overlayImg = await loadImage('/kv/overlay-ao-vivo-panels.png');
        ctx.drawImage(overlayImg, 0, 0, W, H);
      }

      // 10. Team crests (z:50)
      const isConference = aoVivoTemplate === 'conferenceleague';
      const currentTeams = isConference ? teamsConferenceLeague : teamsAoVivo;
      const homeTeam = currentTeams.find(t => t.id === matchData.homeTeamId);
      const awayTeam = currentTeams.find(t => t.id === matchData.awayTeamId);

      if (homeTeam) {
        const crestImg = await loadImage(homeTeam.crest_url);
        const maxSize = getCrestMaxSize(matchData.homeTeamId, isConference);
        drawImageCentered(ctx, crestImg, 458, 527, maxSize, maxSize);
      }
      if (awayTeam) {
        const crestImg = await loadImage(awayTeam.crest_url);
        const maxSize = getCrestMaxSize(matchData.awayTeamId, isConference);
        drawImageCentered(ctx, crestImg, 822, 527, maxSize, maxSize);
      }

      // 11. Logos (z:60)
      const logosSrc = isConference
        ? '/kv/logos-ao-vivo-conference.png'
        : '/kv/logos-ao-vivo-europa.png';
      const logosImg = await loadImage(logosSrc);
      ctx.drawImage(logosImg, 0, 0, W, H);

      // 12. Som ambiente overlay (z:100)
      if (showSomAmbiente) {
        const somImg = await loadImage('/kv/overlay-som-ambiente.png');
        ctx.drawImage(somImg, 0, 0, W, H);
      }

      // Export
      const filename = `AO-VIVO_${homeTeam?.name?.replace(/\s+/g, '-') || 'home'}_${awayTeam?.name?.replace(/\s+/g, '-') || 'away'}.jpg`;
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          link.click();
          URL.revokeObjectURL(url);
          toast.success('JPG exportado!');
        }
      }, 'image/jpeg', 0.92);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Falha ao exportar JPG');
    }
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

          <TeamControls
            matchData={matchData}
            onMatchDataChange={handleMatchDataChange}
            template="europaleague"
            activeCanvas="av"
            aoVivoTemplate={aoVivoTemplate}
          />

          <div className="mt-5">
            <Button
              onClick={handleExportAoVivo}
              className="w-full"
              size="lg"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar JPG
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AoVivo;
