import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Upload, Trash2, Download, Loader2, ChevronDown, RotateCcw } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import type { ThumbModel } from './CortesThumbBuilder';

// ─── Canvas Export Helpers ────────────────────────────────────────────────────

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/** Replica objectFit: contain + user transforms no Canvas. */
function drawContain(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  containerX: number,
  containerY: number,
  containerW: number,
  containerH: number,
  userScale: number,
  userX: number,
  userY: number,
  userRotation: number
) {
  const imgRatio = img.naturalWidth / img.naturalHeight;
  const containerRatio = containerW / containerH;
  let drawW: number, drawH: number;
  if (imgRatio > containerRatio) {
    drawW = containerW;
    drawH = containerW / imgRatio;
  } else {
    drawH = containerH;
    drawW = containerH * imgRatio;
  }
  const cx = containerX + containerW / 2 + userX;
  const cy = containerY + containerH / 2 + userY;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((userRotation * Math.PI) / 180);
  ctx.scale(userScale, userScale);
  ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
  ctx.restore();
}

/** Replica objectFit: cover + user transforms no Canvas (para meio-a-meio). */
function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  containerX: number,
  containerY: number,
  containerW: number,
  containerH: number,
  userScale: number,
  userX: number,
  userY: number,
  userRotation: number
) {
  const imgRatio = img.naturalWidth / img.naturalHeight;
  const containerRatio = containerW / containerH;
  let drawW: number, drawH: number;
  if (imgRatio > containerRatio) {
    drawH = containerH;
    drawW = containerH * imgRatio;
  } else {
    drawW = containerW;
    drawH = containerW / imgRatio;
  }
  const cx = containerX + containerW / 2 + userX;
  const cy = containerY + containerH / 2 + userY;
  ctx.save();
  ctx.rect(containerX, containerY, containerW, containerH);
  ctx.clip();
  ctx.translate(cx, cy);
  ctx.rotate((userRotation * Math.PI) / 180);
  ctx.scale(userScale, userScale);
  ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
  ctx.restore();
}

/** Quebra texto em linhas que caibam em maxWidth. */
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

/** Calcula o fontSize ideal (auto-fit) para o texto caber na área. */
function fitFontSize(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxW: number,
  maxH: number,
  startSize: number,
  fontFamily: string
): number {
  let size = startSize;
  const lineHeight = 1.2;
  while (size > 20) {
    ctx.font = `800 ${size}px ${fontFamily}`;
    const lines = wrapText(ctx, text.toUpperCase(), maxW);
    const totalH = lines.length * size * lineHeight;
    if (totalH <= maxH) break;
    size -= 2;
  }
  return size;
}

interface TextSegment { text: string; highlight: boolean; }

function parseHighlight(raw: string): TextSegment[] {
  return raw.split(/(\*[^*]+\*)/g).map((part) => ({
    text: part.startsWith('*') && part.endsWith('*') ? part.slice(1, -1) : part,
    highlight: part.startsWith('*') && part.endsWith('*'),
  }));
}

/**
 * Desenha texto multiline com auto-fit, highlight por segmentos e stroke via shadowBlur/shadowColor.
 * Replica exatamente o layout do CortesCanvas.
 */
function drawAutoFitText(
  ctx: CanvasRenderingContext2D,
  rawText: string,
  areaX: number,
  areaY: number,
  areaW: number,
  areaH: number,
  startFontSize: number,
  fontFamily: string,
  textColor: string,
  highlightColor: string,
  strokeColor: string,
  strokeRadius: number,
  rotationDeg: number,
  paddingPx: number
) {
  const text = rawText.toUpperCase();
  const innerW = areaW - paddingPx * 2;
  const innerH = areaH - paddingPx * 2;

  const fontSize = fitFontSize(ctx, text, innerW, innerH, startFontSize, fontFamily);
  ctx.font = `800 ${fontSize}px ${fontFamily}`;
  const lineHeight = fontSize * 1.2;
  const lines = wrapText(ctx, text, innerW);
  const totalH = lines.length * lineHeight;

  // Ancorado pelo bottom, idêntico ao CSS: bottom:6%, maxHeight:38%
  const centerX = areaX + areaW / 2;

  // startY: baseline da primeira linha ancorada no fundo da área (como CSS bottom)
  const startY = areaY + areaH - paddingPx - (totalH - fontSize * 0.8);

  ctx.save();
  ctx.translate(centerX, startY);
  ctx.rotate((rotationDeg * Math.PI) / 180);

  let lineY = 0;

  for (const line of lines) {
    // Medir linha completa para centrar X
    ctx.font = `800 ${fontSize}px ${fontFamily}`;
    const segments = parseHighlight(line);
    const totalLineW = segments.reduce((acc, seg) => {
      const extra = seg.highlight ? fontSize * 0.3 : 0; // 0.15em * 2
      return acc + ctx.measureText(seg.text).width + extra;
    }, 0);

    let segX = -totalLineW / 2;

    for (const seg of segments) {
      ctx.font = `800 ${fontSize}px ${fontFamily}`;
      const segW = ctx.measureText(seg.text).width;
      const extra = seg.highlight ? fontSize * 0.15 : 0;

      if (seg.highlight) segX += extra;

      // Stroke circular idêntico ao preview (32 text-shadows a 15px de raio)
      const strokeSteps = 32;
      const strokeRad = 15;
      ctx.fillStyle = strokeColor;
      for (let i = 0; i < strokeSteps; i++) {
        const angle = (2 * Math.PI * i) / strokeSteps;
        const ox = Math.cos(angle) * strokeRad;
        const oy = Math.sin(angle) * strokeRad;
        ctx.fillText(seg.text, segX + ox, lineY + oy);
      }

      // Texto principal por cima
      ctx.fillStyle = seg.highlight ? highlightColor : textColor;
      ctx.fillText(seg.text, segX, lineY);

      segX += segW + extra;
    }

    lineY += lineHeight;
  }

  ctx.restore();
}

interface TransformState {
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

interface PipFrameState {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CurrentCanvasProps {
  thumbModel: ThumbModel;
  pipImage: string | null;
  personCutout: string | null;
  person2Cutout: string | null;
  thumbText: string;
  thumbTextLeft: string;
  thumbTextRight: string;
  pipTransform: TransformState;
  personTransform: TransformState;
  person2Transform: TransformState;
  pipFrame: PipFrameState;
  bgImage?: string;
  logosImage?: string;
  textColor?: string;
  strokeColor?: string;
  pipBorderColor?: string;
  highlightColor?: string;
  customFontFamily?: string;
}

interface CortesControlsProps {
  thumbModel: ThumbModel;
  onThumbModelChange: (model: ThumbModel) => void;
  pipImage: string | null;
  personCutout: string | null;
  person2Cutout: string | null;
  thumbText: string;
  thumbTextLeft: string;
  thumbTextRight: string;
  isRemovingBg: boolean;
  isRemovingBg2: boolean;
  pipTransform: TransformState;
  personTransform: TransformState;
  person2Transform: TransformState;
  pipFrame: PipFrameState;
  pipBaseScale: number;
  onPipUpload: (file: File) => void;
  onPersonUpload: (file: File) => void;
  onPerson2Upload: (file: File) => void;
  onPersonDirectUpload: (file: File) => void;
  onPerson2DirectUpload: (file: File) => void;
  onTextChange: (text: string) => void;
  onTextLeftChange: (text: string) => void;
  onTextRightChange: (text: string) => void;
  onPipTransformChange: (t: Partial<TransformState>) => void;
  onPersonTransformChange: (t: Partial<TransformState>) => void;
  onPerson2TransformChange: (t: Partial<TransformState>) => void;
  onPipFrameChange: (f: Partial<PipFrameState>) => void;
  onClear: () => void;
  customBgImage: string | null;
  onBgUpload: (file: File) => void;
  canvasRef: React.RefObject<HTMLDivElement>;
  currentCanvasProps: CurrentCanvasProps;
}

export const CortesControls = ({
  thumbModel,
  onThumbModelChange,
  pipImage,
  personCutout,
  person2Cutout,
  thumbText,
  thumbTextLeft,
  thumbTextRight,
  isRemovingBg,
  isRemovingBg2,
  pipTransform,
  personTransform,
  person2Transform,
  pipFrame,
  pipBaseScale,
  onPipUpload,
  onPersonUpload,
  onPerson2Upload,
  onPersonDirectUpload,
  onPerson2DirectUpload,
  onTextChange,
  onTextLeftChange,
  onTextRightChange,
  onPipTransformChange,
  onPersonTransformChange,
  onPerson2TransformChange,
  onPipFrameChange,
  onClear,
  customBgImage,
  onBgUpload,
  canvasRef,
  currentCanvasProps,
}: CortesControlsProps) => {
  const pipInputRef = useRef<HTMLInputElement>(null);
  const personInputRef = useRef<HTMLInputElement>(null);
  const person2InputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    const toastId = toast.loading('Gerando JPG...');
    try {
      const props = currentCanvasProps;
      const W = 1280, H = 720;

      // 1. Aguardar fontes e pré-carregar imagens em paralelo
      await document.fonts.ready;

      const [bgImg, logosImg, pipImg, personImg, person2Img, divisoriaImg] = await Promise.all([
        loadImage(props.bgImage || '/cortes/bg-corte.png'),
        loadImage(props.logosImage || '/cortes/logos-corte.png'),
        props.pipImage ? loadImage(props.pipImage) : Promise.resolve(null),
        props.personCutout ? loadImage(props.personCutout) : Promise.resolve(null),
        props.person2Cutout ? loadImage(props.person2Cutout) : Promise.resolve(null),
        props.thumbModel === 'meio-a-meio' ? loadImage('/cortes/divisoria-geral.png') : Promise.resolve(null),
      ]);

      // 2. Criar canvas 1280×720
      const canvas = document.createElement('canvas');
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext('2d')!;

      const thumbModel = props.thumbModel;
      const showPip = thumbModel === 'pip';
      const showPerson2 = thumbModel === 'duas-pessoas';
      const showMeioAMeio = thumbModel === 'meio-a-meio';
      const showSoLettering = thumbModel === 'so-lettering';

      // ── Layer 1: Background ─────────────────────────────────────────────
      ctx.drawImage(bgImg, 0, 0, W, H);

      // ── Layer 2: PIP ────────────────────────────────────────────────────
      if (showPip && pipImg) {
        const pip = props.pipFrame;
        // Converter % para px
        const fx = (pip.x / 100) * W;
        const fy = (pip.y / 100) * H;
        const fw = (pip.width / 100) * W;
        const fh = (pip.height / 100) * H;

        // Clip + rotate do frame (-1.2deg como no CSS)
        const cx = fx + fw / 2;
        const cy = fy + fh / 2;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate((-1.2 * Math.PI) / 180);
        // Clip ao retângulo da moldura (após rotação)
        ctx.beginPath();
        ctx.rect(-fw / 2, -fh / 2, fw, fh);
        ctx.clip();
        // Desenhar imagem PIP com contain + transforms do usuário (em coordenadas locais ao frame)
        const t = props.pipTransform;
        const imgRatio = pipImg.naturalWidth / pipImg.naturalHeight;
        const containerRatio = fw / fh;
        let drawW: number, drawH: number;
        if (imgRatio > containerRatio) { drawW = fw; drawH = fw / imgRatio; }
        else { drawH = fh; drawW = fh * imgRatio; }
        ctx.translate(t.x, t.y);
        ctx.rotate((t.rotation * Math.PI) / 180);
        ctx.scale(t.scale, t.scale);
        ctx.drawImage(pipImg, -drawW / 2, -drawH / 2, drawW, drawH);
        ctx.restore();

        // Borda colorida do frame (strokeRect, replicando border: 10px solid)
        const borderW = 10;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate((-1.2 * Math.PI) / 180);
        ctx.strokeStyle = props.pipBorderColor || '#D02046';
        ctx.lineWidth = borderW;
        ctx.strokeRect(-fw / 2, -fh / 2, fw, fh);
        ctx.restore();
      }

      // ── Layer 2b/2c: Meio-a-meio ────────────────────────────────────────
      if (showMeioAMeio) {
        // Esquerda: objectFit cover, metade esquerda
        if (personImg) {
          ctx.save();
          drawCover(ctx, personImg, 0, 0, W / 2, H,
            props.personTransform.scale,
            props.personTransform.x,
            props.personTransform.y,
            props.personTransform.rotation);
          ctx.restore();
        }
        // Direita: objectFit cover, metade direita
        if (person2Img) {
          ctx.save();
          drawCover(ctx, person2Img, W / 2, 0, W / 2, H,
            props.person2Transform.scale,
            props.person2Transform.x,
            props.person2Transform.y,
            props.person2Transform.rotation);
          ctx.restore();
        }
      }

      // ── Layer 3: Person cutout (pip / duas-pessoas) ─────────────────────
      if (!showMeioAMeio && !showSoLettering && personImg) {
        const t = props.personTransform;
        // Posição base: right: -6% (pip) ou -2% (duas-pessoas), top: -2%, height: 108%
        const baseRight = showPerson2 ? -0.02 * W : -0.06 * W;
        const baseH = H * 1.08;
        const aspectRatio = personImg.naturalWidth / personImg.naturalHeight;
        const baseW = baseH * aspectRatio;
        // âncora no canto direito
        const baseX = W - baseRight - baseW;
        const baseY = -0.02 * H;
        const centerX = baseX + baseW / 2;
        const centerY = baseY + baseH / 2;
        ctx.save();
        ctx.translate(centerX + t.x, centerY + t.y);
        ctx.rotate((t.rotation * Math.PI) / 180);
        ctx.scale(t.scale, t.scale);
        ctx.drawImage(personImg, -baseW / 2, -baseH / 2, baseW, baseH);
        ctx.restore();
      }

      // Layer 3b: Person2 (esquerda, duas-pessoas)
      if (showPerson2 && person2Img) {
        const t = props.person2Transform;
        const baseH = H * 1.08;
        const aspectRatio = person2Img.naturalWidth / person2Img.naturalHeight;
        const baseW = baseH * aspectRatio;
        const baseX = -0.02 * W;
        const baseY = -0.02 * H;
        const centerX = baseX + baseW / 2;
        const centerY = baseY + baseH / 2;
        ctx.save();
        ctx.translate(centerX + t.x, centerY + t.y);
        ctx.rotate((t.rotation * Math.PI) / 180);
        ctx.scale(t.scale, t.scale);
        ctx.drawImage(person2Img, -baseW / 2, -baseH / 2, baseW, baseH);
        ctx.restore();
      }

      // ── Layer 2d: Divisória meio-a-meio ─────────────────────────────────
      if (showMeioAMeio && divisoriaImg) {
        const dH = H;
        const dW = divisoriaImg.naturalWidth * (dH / divisoriaImg.naturalHeight);
        ctx.drawImage(divisoriaImg, W / 2 - dW / 2, 0, dW, dH);
      }

      // ── Layer 4: Gradiente inferior ─────────────────────────────────────
      const grad = ctx.createLinearGradient(0, H * 0.55, 0, H);
      grad.addColorStop(0, 'rgba(34,34,34,0)');
      grad.addColorStop(1, 'rgba(34,34,34,0.7)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, H * 0.55, W, H * 0.45);

      // ── Layer 5: Logos ──────────────────────────────────────────────────
      ctx.drawImage(logosImg, 0, 0, W, H);

      // ── Layer 6: Texto ──────────────────────────────────────────────────
      const fontFamily = (props.customFontFamily || "'Clash Grotesk', sans-serif")
        .split(',')[0].trim().replace(/'/g, '');
      const textColor = props.textColor || '#F1E8D5';
      const strokeColor = props.strokeColor || '#0C0C20';
      const highlightColor = props.highlightColor || '#D02046';

      if (!showMeioAMeio && props.thumbText) {
        // Área: left:2%, bottom:6%, width:96%, maxHeight:38%, padding:20px
        const areaX = W * 0.02;
        const areaH = H * 0.38;
        const areaY = H - H * 0.06 - areaH;
        const areaW = W * 0.96;
        drawAutoFitText(
          ctx, props.thumbText,
          areaX, areaY, areaW, areaH,
          200, fontFamily,
          textColor, highlightColor, strokeColor, 15,
          -2, 20
        );
      }

      if (showMeioAMeio) {
        // Left text: left:1%, width:47%, bottom:6%, maxHeight:40%
        if (props.thumbTextLeft) {
          const areaX = W * 0.01;
          const areaH = H * 0.40;
          const areaY = H - H * 0.06 - areaH;
          const areaW = W * 0.47;
          drawAutoFitText(
            ctx, props.thumbTextLeft,
            areaX, areaY, areaW, areaH,
            160, fontFamily,
            textColor, highlightColor, strokeColor, 15,
            -2, 14
          );
        }
        // Right text: right:1%, width:47%, bottom:6%, maxHeight:40%
        if (props.thumbTextRight) {
          const areaX = W * 0.52;
          const areaH = H * 0.40;
          const areaY = H - H * 0.06 - areaH;
          const areaW = W * 0.47;
          drawAutoFitText(
            ctx, props.thumbTextRight,
            areaX, areaY, areaW, areaH,
            160, fontFamily,
            textColor, '#006892', strokeColor, 15,
            -2, 14
          );
        }
      }

      // 3. Export
      const timestamp = Date.now();
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `CORTE_${timestamp}.jpg`;
            link.click();
            URL.revokeObjectURL(url);
          }
        },
        'image/jpeg',
        0.95
      );

      toast.dismiss(toastId);
      toast.success('JPG exportado!');
    } catch (error) {
      console.error('Export error:', error);
      toast.dismiss(toastId);
      toast.error('Falha ao exportar JPG');
    }
  };

  return (
    <div className="space-y-5">
      {/* Model selector */}
      <div className="space-y-2">
        <Label className="font-semibold">Modelo</Label>
        <Select value={thumbModel} onValueChange={(v) => onThumbModelChange(v as ThumbModel)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pip">Com PIP</SelectItem>
            <SelectItem value="duas-pessoas">Duas pessoas</SelectItem>
            <SelectItem value="meio-a-meio">Meio a meio</SelectItem>
            <SelectItem value="so-lettering">Lettering simples</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* PIP Upload — only for pip model */}
      {thumbModel === 'pip' && (
        <>
          <div className="space-y-2">
            <Label className="font-semibold">Imagem PIP (frame do jogo)</Label>
            <input
              ref={pipInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && onPipUpload(e.target.files[0])}
            />
            <Button
              variant={pipImage ? 'secondary' : 'outline'}
              className="w-full"
              onClick={() => pipInputRef.current?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              {pipImage ? 'Trocar PIP' : 'Upload PIP'}
            </Button>
          </div>

          {/* PIP Image Transform */}
          {pipImage && (
            <div className="space-y-3 p-3 rounded-lg border border-border bg-muted/30">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ajuste da imagem PIP</Label>
                <button onClick={() => onPipTransformChange({ x: 0, y: 0, scale: pipBaseScale, rotation: 0 })} className="text-muted-foreground hover:text-foreground transition-colors" title="Redefinir">
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
              <div>
                <Label className="text-xs">Posição X: {pipTransform.x}px</Label>
                <Slider value={[pipTransform.x]} onValueChange={([x]) => onPipTransformChange({ x })} min={-500} max={500} step={1} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Posição Y: {pipTransform.y}px</Label>
                <Slider value={[pipTransform.y]} onValueChange={([y]) => onPipTransformChange({ y })} min={-500} max={500} step={1} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Zoom: {pipTransform.scale.toFixed(2)}x</Label>
                <Slider value={[pipTransform.scale]} onValueChange={([scale]) => onPipTransformChange({ scale })} min={0.5} max={3} step={0.01} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Rotação: {pipTransform.rotation}°</Label>
                <Slider value={[pipTransform.rotation]} onValueChange={([rotation]) => onPipTransformChange({ rotation })} min={-180} max={180} step={1} className="mt-1" />
              </div>
            </div>
          )}

          {/* PIP Frame Controls */}
          {pipImage && (
            <div className="space-y-3 p-3 rounded-lg border border-border bg-muted/30">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Moldura PIP</Label>
                <button onClick={() => onPipFrameChange({ x: 3.0, y: 15.4, width: 56.6, height: 64.3 })} className="text-muted-foreground hover:text-foreground transition-colors" title="Redefinir">
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
              <div>
                <Label className="text-xs">Posição X: {pipFrame.x.toFixed(1)}%</Label>
                <Slider value={[pipFrame.x]} onValueChange={([x]) => onPipFrameChange({ x })} min={-20} max={60} step={0.1} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Posição Y: {pipFrame.y.toFixed(1)}%</Label>
                <Slider value={[pipFrame.y]} onValueChange={([y]) => onPipFrameChange({ y })} min={-20} max={60} step={0.1} className="mt-1" />
              </div>

              <Collapsible>
                <CollapsibleTrigger className="flex items-center gap-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors w-full">
                  <ChevronDown className="w-3 h-3" />
                  Propriedades avançadas
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-3 pt-3">
                  <div>
                    <Label className="text-xs">Largura: {pipFrame.width.toFixed(1)}%</Label>
                    <Slider value={[pipFrame.width]} onValueChange={([width]) => onPipFrameChange({ width })} min={10} max={90} step={0.1} className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs">Altura: {pipFrame.height.toFixed(1)}%</Label>
                    <Slider value={[pipFrame.height]} onValueChange={([height]) => onPipFrameChange({ height })} min={10} max={90} step={0.1} className="mt-1" />
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          )}
        </>
      )}

      {/* Person Upload (right side / single person) — pip & duas-pessoas */}
      {thumbModel !== 'meio-a-meio' && thumbModel !== 'so-lettering' && (
        <>
          <div className="space-y-2">
            <Label className="font-semibold">{thumbModel === 'duas-pessoas' ? 'Pessoa (direita)' : 'Foto da pessoa'}</Label>
            <input
              ref={personInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && onPersonUpload(e.target.files[0])}
            />
            <Button
              variant={personCutout ? 'secondary' : 'outline'}
              className="w-full"
              disabled={isRemovingBg}
              onClick={() => personInputRef.current?.click()}
            >
              {isRemovingBg ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Removendo fundo...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  {personCutout ? 'Trocar pessoa' : 'Upload pessoa'}
                </>
              )}
            </Button>
          </div>

          {/* Person Transform */}
          {personCutout && (
            <div className="space-y-3 p-3 rounded-lg border border-border bg-muted/30">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{thumbModel === 'duas-pessoas' ? 'Ajuste pessoa (direita)' : 'Ajuste da pessoa'}</Label>
                <button onClick={() => onPersonTransformChange({ x: 0, y: 0, scale: 1, rotation: 0 })} className="text-muted-foreground hover:text-foreground transition-colors" title="Redefinir">
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
              <div>
                <Label className="text-xs">Posição X: {personTransform.x}px</Label>
                <Slider value={[personTransform.x]} onValueChange={([x]) => onPersonTransformChange({ x })} min={-800} max={800} step={1} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Posição Y: {personTransform.y}px</Label>
                <Slider value={[personTransform.y]} onValueChange={([y]) => onPersonTransformChange({ y })} min={-800} max={800} step={1} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Zoom: {personTransform.scale.toFixed(2)}x</Label>
                <Slider value={[personTransform.scale]} onValueChange={([scale]) => onPersonTransformChange({ scale })} min={0.3} max={3} step={0.01} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Rotação: {personTransform.rotation}°</Label>
                <Slider value={[personTransform.rotation]} onValueChange={([rotation]) => onPersonTransformChange({ rotation })} min={-180} max={180} step={1} className="mt-1" />
              </div>
            </div>
          )}
        </>
      )}

      {/* Person 2 Upload — only for duas-pessoas model */}
      {thumbModel === 'duas-pessoas' && (
        <>
          {/* Background photo upload */}
          <div className="space-y-2">
            <Label className="font-semibold">Foto de fundo</Label>
            <input
              ref={bgInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && onBgUpload(e.target.files[0])}
            />
            <Button
              variant={customBgImage ? 'secondary' : 'outline'}
              className="w-full"
              onClick={() => bgInputRef.current?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              {customBgImage ? 'Trocar fundo' : 'Upload fundo'}
            </Button>
          </div>

          <div className="space-y-2">
            <Label className="font-semibold">Pessoa (esquerda)</Label>
            <input
              ref={person2InputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && onPerson2Upload(e.target.files[0])}
            />
            <Button
              variant={person2Cutout ? 'secondary' : 'outline'}
              className="w-full"
              disabled={isRemovingBg2}
              onClick={() => person2InputRef.current?.click()}
            >
              {isRemovingBg2 ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Removendo fundo...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  {person2Cutout ? 'Trocar pessoa 2' : 'Upload pessoa 2'}
                </>
              )}
            </Button>
          </div>

          {/* Person 2 Transform */}
          {person2Cutout && (
            <div className="space-y-3 p-3 rounded-lg border border-border bg-muted/30">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ajuste pessoa (esquerda)</Label>
                <button onClick={() => onPerson2TransformChange({ x: 0, y: 0, scale: 1, rotation: 0 })} className="text-muted-foreground hover:text-foreground transition-colors" title="Redefinir">
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
              <div>
                <Label className="text-xs">Posição X: {person2Transform.x}px</Label>
                <Slider value={[person2Transform.x]} onValueChange={([x]) => onPerson2TransformChange({ x })} min={-800} max={800} step={1} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Posição Y: {person2Transform.y}px</Label>
                <Slider value={[person2Transform.y]} onValueChange={([y]) => onPerson2TransformChange({ y })} min={-800} max={800} step={1} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Zoom: {person2Transform.scale.toFixed(2)}x</Label>
                <Slider value={[person2Transform.scale]} onValueChange={([scale]) => onPerson2TransformChange({ scale })} min={0.3} max={3} step={0.01} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Rotação: {person2Transform.rotation}°</Label>
                <Slider value={[person2Transform.rotation]} onValueChange={([rotation]) => onPerson2TransformChange({ rotation })} min={-180} max={180} step={1} className="mt-1" />
              </div>
            </div>
          )}
        </>
      )}

      {/* Meio a meio — two direct image uploads (no bg removal) with transforms */}
      {thumbModel === 'meio-a-meio' && (
        <>
          {/* Left image */}
          <div className="space-y-2">
            <Label className="font-semibold">Imagem esquerda</Label>
            <input
              ref={personInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && onPersonDirectUpload(e.target.files[0])}
            />
            <Button
              variant={personCutout ? 'secondary' : 'outline'}
              className="w-full"
              onClick={() => personInputRef.current?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              {personCutout ? 'Trocar esquerda' : 'Upload esquerda'}
            </Button>
          </div>

          {/* Left Transform */}
          {personCutout && (
            <div className="space-y-3 p-3 rounded-lg border border-border bg-muted/30">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ajuste imagem esquerda</Label>
                <button onClick={() => onPersonTransformChange({ x: 0, y: 0, scale: 1, rotation: 0 })} className="text-muted-foreground hover:text-foreground transition-colors" title="Redefinir">
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
              <div>
                <Label className="text-xs">Posição X: {personTransform.x}px</Label>
                <Slider value={[personTransform.x]} onValueChange={([x]) => onPersonTransformChange({ x })} min={-640} max={640} step={1} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Posição Y: {personTransform.y}px</Label>
                <Slider value={[personTransform.y]} onValueChange={([y]) => onPersonTransformChange({ y })} min={-360} max={360} step={1} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Zoom: {personTransform.scale.toFixed(2)}x</Label>
                <Slider value={[personTransform.scale]} onValueChange={([scale]) => onPersonTransformChange({ scale })} min={0.5} max={3} step={0.01} className="mt-1" />
              </div>
            </div>
          )}

          {/* Right image */}
          <div className="space-y-2">
            <Label className="font-semibold">Imagem direita</Label>
            <input
              ref={person2InputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && onPerson2DirectUpload(e.target.files[0])}
            />
            <Button
              variant={person2Cutout ? 'secondary' : 'outline'}
              className="w-full"
              onClick={() => person2InputRef.current?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              {person2Cutout ? 'Trocar direita' : 'Upload direita'}
            </Button>
          </div>

          {/* Right Transform */}
          {person2Cutout && (
            <div className="space-y-3 p-3 rounded-lg border border-border bg-muted/30">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ajuste imagem direita</Label>
                <button onClick={() => onPerson2TransformChange({ x: 0, y: 0, scale: 1, rotation: 0 })} className="text-muted-foreground hover:text-foreground transition-colors" title="Redefinir">
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
              <div>
                <Label className="text-xs">Posição X: {person2Transform.x}px</Label>
                <Slider value={[person2Transform.x]} onValueChange={([x]) => onPerson2TransformChange({ x })} min={-640} max={640} step={1} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Posição Y: {person2Transform.y}px</Label>
                <Slider value={[person2Transform.y]} onValueChange={([y]) => onPerson2TransformChange({ y })} min={-360} max={360} step={1} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Zoom: {person2Transform.scale.toFixed(2)}x</Label>
                <Slider value={[person2Transform.scale]} onValueChange={([scale]) => onPerson2TransformChange({ scale })} min={0.5} max={3} step={0.01} className="mt-1" />
              </div>
            </div>
          )}

          {/* Meio a meio text fields */}
          <div className="space-y-2">
            <Label className="font-semibold">Texto esquerda</Label>
            <Textarea
              placeholder="Texto esquerdo..."
              value={thumbTextLeft}
              onChange={(e) => onTextLeftChange(e.target.value)}
              className="resize-none"
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label className="font-semibold">Texto direita</Label>
            <Textarea
              placeholder="Texto direito..."
              value={thumbTextRight}
              onChange={(e) => onTextRightChange(e.target.value)}
              className="resize-none"
              rows={2}
            />
          </div>
        </>
      )}

      {/* Single text field — pip, duas-pessoas & so-lettering */}
      {thumbModel !== 'meio-a-meio' && (
        <div className="space-y-2">
          <Label className="font-semibold">Texto da thumbnail</Label>
          <Textarea
            placeholder="Ex: MESSI *HUMILHA* DEFESA..."
            value={thumbText}
            onChange={(e) => onTextChange(e.target.value)}
            className="resize-none"
            rows={3}
          />
          <p className="text-xs text-muted-foreground">Use *asteriscos* para destacar palavras</p>
        </div>
      )}

      {/* Background upload — pip, meio-a-meio, so-lettering */}
      {thumbModel !== 'duas-pessoas' && (
        <div className="space-y-2">
          <Label className="font-semibold">
            Foto de fundo{thumbModel === 'so-lettering' ? '' : ' (opcional)'}
          </Label>
          <input
            ref={bgInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && onBgUpload(e.target.files[0])}
          />
          <Button
            variant={customBgImage ? 'secondary' : 'outline'}
            className="w-full"
            onClick={() => bgInputRef.current?.click()}
          >
            <Upload className="w-4 h-4 mr-2" />
            {customBgImage ? 'Trocar fundo' : 'Upload fundo'}
          </Button>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <Button variant="outline" className="flex-1" onClick={onClear}>
          <Trash2 className="w-4 h-4 mr-2" />
          Limpar
        </Button>
        <Button className="flex-1" onClick={handleExport}>
          <Download className="w-4 h-4 mr-2" />
          Exportar JPG
        </Button>
      </div>
    </div>
  );
};
