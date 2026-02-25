import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Upload, Trash2, Download, Loader2, ChevronDown, RotateCcw } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import type { ThumbModel } from './CortesThumbBuilder';
import { PipAiGenerator } from './PipAiGenerator';
import { teamsBrasileirao } from '@/data/teams';
import { teamsPaulistao } from '@/data/teamsPaulistao';

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

/** Remove marcadores de highlight (*) para medição de texto. */
function stripHighlightMarkers(text: string): string {
  return text.replace(/\*/g, '');
}

/** Quebra texto em linhas que caibam em maxWidth, com suporte a word-break. */
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    // Word-break: se a palavra sozinha excede maxWidth, quebrar por caractere
    if (ctx.measureText(word).width > maxWidth) {
      if (current) { lines.push(current); current = ''; }
      let chunk = '';
      for (const char of word) {
        const test = chunk + char;
        if (ctx.measureText(test).width > maxWidth && chunk) {
          lines.push(chunk);
          chunk = char;
        } else {
          chunk = test;
        }
      }
      current = chunk;
      continue;
    }
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
  fontFamily: string,
  lineHeightRatio = 1.2
): number {
  let size = startSize;
  const cleanText = stripHighlightMarkers(text.toUpperCase());
  while (size > 20) {
    ctx.font = `800 ${size}px ${fontFamily}`;
    const lines = wrapText(ctx, cleanText, maxW);
    const totalH = lines.length * size * lineHeightRatio;
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
/**
 * Mapeia linhas calculadas com texto limpo de volta ao texto original (com marcadores *).
 * Percorre o texto original consumindo caracteres não-* correspondentes a cada linha limpa.
 */
function mapCleanLinesToOriginal(cleanLines: string[], originalText: string): string[] {
  const result: string[] = [];
  let origIdx = 0;
  let insideHighlight = false;
  for (const cleanLine of cleanLines) {
    let mapped = '';
    // Se estamos dentro de um highlight que veio da linha anterior, abrir * nesta linha
    if (insideHighlight) {
      mapped += '*';
    }
    let cleanCharIdx = 0;
    while (cleanCharIdx < cleanLine.length && origIdx < originalText.length) {
      const origChar = originalText[origIdx];
      if (origChar === '*') {
        mapped += origChar;
        insideHighlight = !insideHighlight;
        origIdx++;
      } else {
        mapped += origChar;
        origIdx++;
        cleanCharIdx++;
      }
    }
    // Capturar * restantes no final da linha (ex: fechamento de highlight)
    while (origIdx < originalText.length && originalText[origIdx] === '*') {
      mapped += '*';
      insideHighlight = !insideHighlight;
      origIdx++;
    }
    // Se a linha termina com highlight aberto, fechar para garantir pares completos
    if (insideHighlight) {
      mapped += '*';
      // insideHighlight continua true para abrir na próxima linha
    }
    result.push(mapped);
  }
  return result;
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
  paddingPx: number,
  lineHeightRatio = 1.2
) {
  const text = rawText.toUpperCase();
  const cleanText = stripHighlightMarkers(text);
  const innerW = areaW - paddingPx * 2;
  const innerH = areaH - paddingPx * 2;

  const fontSize = fitFontSize(ctx, text, innerW, innerH, startFontSize, fontFamily, lineHeightRatio);
  ctx.font = `800 ${fontSize}px ${fontFamily}`;
  const lineHeight = fontSize * lineHeightRatio;

  // Layout com texto limpo (sem marcadores)
  const cleanLines = wrapText(ctx, cleanText, innerW);
  // Mapear de volta ao texto original para manter highlights
  const lines = mapCleanLinesToOriginal(cleanLines, text);

  const totalH = cleanLines.length * lineHeight;

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
  pip2Image?: string | null;
  personCutout: string | null;
  person2Cutout: string | null;
  person3Cutout?: string | null;
  person4Cutout?: string | null;
  thumbText: string;
  thumbTextLeft: string;
  thumbTextRight: string;
  pipTransform: TransformState;
  pip2Transform?: TransformState;
  personTransform: TransformState;
  person2Transform: TransformState;
  person3Transform?: TransformState;
  person4Transform?: TransformState;
  pipFrame: PipFrameState;
  pip2Frame?: PipFrameState;
  bgImage?: string;
  logosImage?: string;
  textColor?: string;
  strokeColor?: string;
  pipBorderColor?: string;
  highlightColor?: string;
  customFontFamily?: string;
  divisoriaImage?: string;
  textBoxHeight?: number;
  quadrantVisibility?: boolean[];
}

interface CortesControlsProps {
  thumbModel: ThumbModel;
  onThumbModelChange: (model: ThumbModel) => void;
  allowAllModels?: boolean;
  allowJogoV1?: boolean;
  allowThumbPrincipal?: boolean;
  pipImage: string | null;
  pip2Image?: string | null;
  personCutout: string | null;
  person2Cutout: string | null;
  person3Cutout?: string | null;
  person4Cutout?: string | null;
  thumbText: string;
  thumbTextLeft: string;
  thumbTextRight: string;
  isRemovingBg: boolean;
  isRemovingBg2: boolean;
  isRemovingBg3?: boolean;
  isRemovingBg4?: boolean;
  isUpscalingPerson?: boolean;
  isUpscalingPerson2?: boolean;
  onUpscalePerson?: () => void;
  onUpscalePerson2?: () => void;
  pipTransform: TransformState;
  pip2Transform?: TransformState;
  personTransform: TransformState;
  person2Transform: TransformState;
  person3Transform?: TransformState;
  person4Transform?: TransformState;
  pipFrame: PipFrameState;
  pip2Frame?: PipFrameState;
  pipBaseScale: number;
  pip2BaseScale?: number;
  onPipUpload: (file: File) => void;
  onPip2Upload?: (file: File) => void;
  onPersonUpload: (file: File) => void;
  onPerson2Upload: (file: File) => void;
  onPerson3Upload?: (file: File) => void;
  onPerson4Upload?: (file: File) => void;
  onPersonDirectUpload: (file: File) => void;
  onPerson2DirectUpload: (file: File) => void;
  onTextChange: (text: string) => void;
  onTextLeftChange: (text: string) => void;
  onTextRightChange: (text: string) => void;
  onPipTransformChange: (t: Partial<TransformState>) => void;
  onPip2TransformChange?: (t: Partial<TransformState>) => void;
  onPersonTransformChange: (t: Partial<TransformState>) => void;
  onPerson2TransformChange: (t: Partial<TransformState>) => void;
  onPerson3TransformChange?: (t: Partial<TransformState>) => void;
  onPerson4TransformChange?: (t: Partial<TransformState>) => void;
  onPipFrameChange: (f: Partial<PipFrameState>) => void;
  onPip2FrameChange?: (f: Partial<PipFrameState>) => void;
  onClear: () => void;
  customBgImage: string | null;
  onBgUpload: (file: File) => void;
  canvasRef: React.RefObject<HTMLDivElement>;
  currentCanvasProps: CurrentCanvasProps;
  textBoxHeight: number;
  onTextBoxHeightChange: (h: number) => void;
  logosVariant?: 'positiva' | 'negativa';
  onLogosVariantChange?: (v: 'positiva' | 'negativa') => void;
  hasLogosNegative?: boolean;
  onPipFromBase64?: (base64: string) => void;
  quadrantVisibility?: boolean[];
  onQuadrantVisibilityChange?: (v: boolean[]) => void;
  onQuadrantPresetSelect?: (idx: number, url: string) => void;
  useQuadrantGrid?: boolean;
  tpHomeTeamId?: string | null;
  tpAwayTeamId?: string | null;
  onTpHomeTeamChange?: (id: string | null) => void;
  onTpAwayTeamChange?: (id: string | null) => void;
}

export const CortesControls = ({
  thumbModel,
  onThumbModelChange,
  allowAllModels = false,
  allowJogoV1 = false,
  allowThumbPrincipal = false,
  pipImage,
  pip2Image = null,
  personCutout,
  person2Cutout,
  person3Cutout = null,
  person4Cutout = null,
  thumbText,
  thumbTextLeft,
  thumbTextRight,
  isRemovingBg,
  isRemovingBg2,
  isRemovingBg3 = false,
  isRemovingBg4 = false,
  isUpscalingPerson = false,
  isUpscalingPerson2 = false,
  onUpscalePerson,
  onUpscalePerson2,
  pipTransform,
  pip2Transform = { x: 0, y: 0, scale: 1, rotation: 0 },
  personTransform,
  person2Transform,
  person3Transform = { x: 0, y: 0, scale: 1, rotation: 0 },
  person4Transform = { x: 0, y: 0, scale: 1, rotation: 0 },
  pipFrame,
  pip2Frame = { x: 67, y: 15.4, width: 30, height: 55 },
  pipBaseScale,
  pip2BaseScale = 1,
  onPipUpload,
  onPip2Upload,
  onPersonUpload,
  onPerson2Upload,
  onPerson3Upload,
  onPerson4Upload,
  onPersonDirectUpload,
  onPerson2DirectUpload,
  onTextChange,
  onTextLeftChange,
  onTextRightChange,
  onPipTransformChange,
  onPip2TransformChange,
  onPersonTransformChange,
  onPerson2TransformChange,
  onPerson3TransformChange,
  onPerson4TransformChange,
  onPipFrameChange,
  onPip2FrameChange,
  onClear,
  customBgImage,
  onBgUpload,
  canvasRef,
  currentCanvasProps,
  textBoxHeight,
  onTextBoxHeightChange,
  logosVariant = 'positiva',
  onLogosVariantChange,
  hasLogosNegative = false,
  onPipFromBase64,
  quadrantVisibility = [true, true, true, true],
  onQuadrantVisibilityChange,
  onQuadrantPresetSelect,
  useQuadrantGrid = false,
  tpHomeTeamId = null,
  tpAwayTeamId = null,
  onTpHomeTeamChange,
  onTpAwayTeamChange,
}: CortesControlsProps) => {
  const pipInputRef = useRef<HTMLInputElement>(null);
  const pip2InputRef = useRef<HTMLInputElement>(null);
  const personInputRef = useRef<HTMLInputElement>(null);
  const person2InputRef = useRef<HTMLInputElement>(null);
  const person3InputRef = useRef<HTMLInputElement>(null);
  const person4InputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);

  const QUADRANT_PRESETS = [
    { label: 'Beltrão', url: '/cortes/presets/beltrao.png' },
    { label: 'LFF', url: '/cortes/presets/lff.png' },
    { label: 'Simões', url: '/cortes/presets/simoes.png' },
    { label: 'Igor', url: '/cortes/presets/igor.png' },
    { label: 'Donan', url: '/cortes/presets/donan.png' },
    { label: 'Cazé', url: '/cortes/presets/caze.png' },
  ];

  const [showPipAdjust, setShowPipAdjust] = useState(false);
  const [showPip2Adjust, setShowPip2Adjust] = useState(false);
  const [showPerson1Adjust, setShowPerson1Adjust] = useState(false);
  const [showQuadrantsMenu, setShowQuadrantsMenu] = useState(true);
  const [showPerson2Adjust, setShowPerson2Adjust] = useState(false);
  const [showPerson3Adjust, setShowPerson3Adjust] = useState(false);
  const [showPerson4Adjust, setShowPerson4Adjust] = useState(false);
  const [showMeioLeftAdjust, setShowMeioLeftAdjust] = useState(false);
  const [showMeioRightAdjust, setShowMeioRightAdjust] = useState(false);

  const handleExport = async () => {
    const toastId = toast.loading('Gerando JPG...');
    try {
      const props = currentCanvasProps;
      const W = 1280, H = 720;

      // 1. Aguardar fontes e pré-carregar imagens em paralelo
      await document.fonts.ready;

      const [bgImg, logosImg, pipImg, pip2Img, personImg, person2Img, person3Img, person4Img, divisoriaImg] = await Promise.all([
        loadImage(props.bgImage || '/cortes/bg-corte.png'),
        loadImage(props.logosImage || '/cortes/logos-corte.png'),
        props.pipImage ? loadImage(props.pipImage) : Promise.resolve(null),
        props.pip2Image ? loadImage(props.pip2Image) : Promise.resolve(null),
        props.personCutout ? loadImage(props.personCutout) : Promise.resolve(null),
        props.person2Cutout ? loadImage(props.person2Cutout) : Promise.resolve(null),
        props.person3Cutout ? loadImage(props.person3Cutout) : Promise.resolve(null),
        props.person4Cutout ? loadImage(props.person4Cutout) : Promise.resolve(null),
        props.thumbModel === 'meio-a-meio' ? loadImage(props.divisoriaImage || '/cortes/divisoria-geral.png') : Promise.resolve(null),
      ]);

      // 2. Criar canvas 1280×720
      const canvas = document.createElement('canvas');
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext('2d')!;

      const thumbModel = props.thumbModel;
      const showPip = thumbModel === 'pip';
      const showPipDividido = thumbModel === 'pip-dividido';
      const showPerson2 = thumbModel === 'duas-pessoas';
      const showMeioAMeio = thumbModel === 'meio-a-meio';
      const showSoLettering = thumbModel === 'so-lettering';
      const showJogoV1 = thumbModel === 'jogo-v1';
      const showJogoPipDuplo = thumbModel === 'jogo-pip-duplo';
      const showThumbPrincipal = thumbModel === 'thumb-principal';
      // ── Layer 1: Background ─────────────────────────────────────────────
      // object-fit: cover
      const imgRatio = bgImg.naturalWidth / bgImg.naturalHeight;
      const canvasRatio = W / H;
      let sx = 0, sy = 0, sw = bgImg.naturalWidth, sh = bgImg.naturalHeight;
      if (imgRatio > canvasRatio) {
        sw = bgImg.naturalHeight * canvasRatio;
        sx = (bgImg.naturalWidth - sw) / 2;
      } else {
        sh = bgImg.naturalWidth / canvasRatio;
        sy = (bgImg.naturalHeight - sh) / 2;
      }
      ctx.drawImage(bgImg, sx, sy, sw, sh, 0, 0, W, H);

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

      // ── Layer 2: PIP dividido (single frame, two photos) ──────────────
      if (showPipDividido && (pipImg || pip2Img)) {
        const pip = props.pipFrame;
        const fx = (pip.x / 100) * W;
        const fy = (pip.y / 100) * H;
        const fw = (pip.width / 100) * W;
        const fh = (pip.height / 100) * H;
        const cx = fx + fw / 2;
        const cy = fy + fh / 2;
        const rotDeg = -1.2;
        const halfW = fw / 2;
        const dividerW = 4;

        // Draw left half image
        if (pipImg) {
          const t = props.pipTransform;
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate((rotDeg * Math.PI) / 180);
          ctx.beginPath();
          ctx.rect(-fw / 2, -fh / 2, halfW, fh);
          ctx.clip();
          const imgRatio = pipImg.naturalWidth / pipImg.naturalHeight;
          const contRatio = halfW / fh;
          let drawW: number, drawH: number;
          if (imgRatio > contRatio) { drawW = halfW; drawH = halfW / imgRatio; }
          else { drawH = fh; drawW = fh * imgRatio; }
          ctx.translate(-halfW / 2 + t.x, t.y);
          ctx.rotate((t.rotation * Math.PI) / 180);
          ctx.scale(t.scale, t.scale);
          ctx.drawImage(pipImg, -drawW / 2, -drawH / 2, drawW, drawH);
          ctx.restore();
        }

        // Draw right half image
        if (pip2Img) {
          const t = props.pip2Transform ?? { x: 0, y: 0, scale: 1, rotation: 0 };
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate((rotDeg * Math.PI) / 180);
          ctx.beginPath();
          ctx.rect(0, -fh / 2, halfW, fh);
          ctx.clip();
          const imgRatio = pip2Img.naturalWidth / pip2Img.naturalHeight;
          const contRatio = halfW / fh;
          let drawW: number, drawH: number;
          if (imgRatio > contRatio) { drawW = halfW; drawH = halfW / imgRatio; }
          else { drawH = fh; drawW = fh * imgRatio; }
          ctx.translate(halfW / 2 + t.x, t.y);
          ctx.rotate((t.rotation * Math.PI) / 180);
          ctx.scale(t.scale, t.scale);
          ctx.drawImage(pip2Img, -drawW / 2, -drawH / 2, drawW, drawH);
          ctx.restore();
        }

        // Draw border around entire frame
        const borderW = 10;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate((rotDeg * Math.PI) / 180);
        ctx.strokeStyle = props.pipBorderColor || '#D02046';
        ctx.lineWidth = borderW;
        ctx.strokeRect(-fw / 2, -fh / 2, fw, fh);
        // Vertical divider line in center
        ctx.beginPath();
        ctx.moveTo(0, -fh / 2);
        ctx.lineTo(0, fh / 2);
        ctx.lineWidth = dividerW;
        ctx.stroke();
        ctx.restore();
      }

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
      if (!showMeioAMeio && !showSoLettering && !showJogoV1 && !showJogoPipDuplo && !showThumbPrincipal && personImg) {
        const t = props.personTransform;
        const baseRight = showPerson2 ? -0.02 * W : -0.06 * W;
        const baseH = H * 1.08;
        const aspectRatio = personImg.naturalWidth / personImg.naturalHeight;
        const baseW = baseH * aspectRatio;
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
      if (showPerson2 && !showJogoV1 && !showJogoPipDuplo && !showThumbPrincipal && person2Img) {
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

      // ── Layer 3c: Jogo v1 & jogo-pip-duplo — 3 cutouts ──────────────────
      if (showJogoV1 || showJogoPipDuplo) {
        const drawJogoCutout = (
          img: HTMLImageElement,
          anchorX: number,
          topY: number,
          heightFrac: number,
          t: TransformState
        ) => {
          const bH = H * heightFrac;
          const aspect = img.naturalWidth / img.naturalHeight;
          const bW = bH * aspect;
          const cx = anchorX + t.x;
          const cy = topY + bH / 2 + t.y;
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate((t.rotation * Math.PI) / 180);
          ctx.scale(t.scale, t.scale);
          ctx.drawImage(img, -bW / 2, -bH / 2, bW, bH);
          ctx.restore();
        };

        const p1t = props.personTransform;
        const p2t = props.person2Transform;
        const p3t = props.person3Transform ?? { x: 0, y: 0, scale: 1, rotation: 0 };

        if (personImg)  drawJogoCutout(personImg,  W * 0.17, H * 0.05, 0.90, p1t);
        if (person2Img) drawJogoCutout(person2Img, W * 0.50, -H * 0.05, 1.05, p2t);
        if (person3Img) drawJogoCutout(person3Img, W * 0.83, H * 0.05, 0.90, p3t);
      }

      // ── Layer 3d: jogo-pip-duplo — 2 PIP frames (drawn below/above persons depending on z-order) ─
      if (showJogoPipDuplo) {
        const drawPipFrame = (
          img: HTMLImageElement | null,
          frame: PipFrameState,
          transform: TransformState,
          rotDeg: number
        ) => {
          if (!img) return;
          const fx = (frame.x / 100) * W;
          const fy = (frame.y / 100) * H;
          const fw = (frame.width / 100) * W;
          const fh = (frame.height / 100) * H;
          const cx = fx + fw / 2;
          const cy = fy + fh / 2;
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate((rotDeg * Math.PI) / 180);
          ctx.beginPath();
          ctx.rect(-fw / 2, -fh / 2, fw, fh);
          ctx.clip();
          const imgRatio = img.naturalWidth / img.naturalHeight;
          const contRatio = fw / fh;
          let drawW: number, drawH: number;
          if (imgRatio > contRatio) { drawW = fw; drawH = fw / imgRatio; }
          else { drawH = fh; drawW = fh * imgRatio; }
          ctx.translate(transform.x, transform.y);
          ctx.rotate((transform.rotation * Math.PI) / 180);
          ctx.scale(transform.scale, transform.scale);
          ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
          ctx.restore();
          // Borda
          const borderW = 10;
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate((rotDeg * Math.PI) / 180);
          ctx.strokeStyle = props.pipBorderColor || '#D02046';
          ctx.lineWidth = borderW;
          ctx.strokeRect(-fw / 2, -fh / 2, fw, fh);
          ctx.restore();
        };

        const pip1Frame = props.pipFrame;
        const pip2FrameVal = props.pip2Frame ?? { x: 67, y: 15.4, width: 30, height: 55 };
        const pip1T = props.pipTransform;
        const pip2T = props.pip2Transform ?? { x: 0, y: 0, scale: 1, rotation: 0 };

        drawPipFrame(pipImg, pip1Frame, pip1T, -1.2);
        drawPipFrame(pip2Img, pip2FrameVal, pip2T, 1.2);
      }

      // ── Layer 3f: Thumb Principal ──────────
      if (showThumbPrincipal && useQuadrantGrid) {
        const quadrants = [
          { x: 0, y: 0 },
          { x: W / 2, y: 0 },
          { x: 0, y: H / 2 },
          { x: W / 2, y: H / 2 },
        ];
        const cutouts = [
          { img: personImg, t: props.personTransform },
          { img: person2Img, t: props.person2Transform },
          { img: person3Img, t: props.person3Transform ?? { x: 0, y: 0, scale: 1, rotation: 0 } },
          { img: person4Img, t: props.person4Transform ?? { x: 0, y: 0, scale: 1, rotation: 0 } },
        ];
        const qW = W / 2;
        const qH = H / 2;
        const qVis = props.quadrantVisibility ?? [true, true, true, true];
        for (let i = 0; i < cutouts.length; i++) {
          const c = cutouts[i];
          if (!c.img || !qVis[i]) continue;
          const q = quadrants[i];
          ctx.save();
          ctx.beginPath();
          ctx.rect(q.x, q.y, qW, qH);
          ctx.clip();
          const drawH = qH * 2.112;
          const drawW = drawH * (c.img.naturalWidth / c.img.naturalHeight);
          const hOffset = (i === 0 || i === 2) ? -40 : 80;
          const dx = q.x + c.t.x + hOffset;
          const dy = q.y + c.t.y;
          ctx.translate(dx, dy);
          ctx.rotate((c.t.rotation * Math.PI) / 180);
          ctx.scale(c.t.scale, c.t.scale);
          ctx.drawImage(c.img, 0, 0, drawW, drawH);
          ctx.restore();
        }
      }

      // ── Layer 3f-alt: Thumb Principal — free cutouts ──────────
      if (showThumbPrincipal && !useQuadrantGrid) {
        const cutouts = [
          { img: personImg, t: props.personTransform },
          { img: person2Img, t: props.person2Transform },
          { img: person3Img, t: props.person3Transform ?? { x: 0, y: 0, scale: 1, rotation: 0 } },
          { img: person4Img, t: props.person4Transform ?? { x: 0, y: 0, scale: 1, rotation: 0 } },
        ];
        for (const c of cutouts) {
          if (!c.img) continue;
          const baseH = H * 1.08;
          const aspect = c.img.naturalWidth / c.img.naturalHeight;
          const baseW = baseH * aspect;
          const baseY = -0.02 * H;
          const cx = baseW / 2 + c.t.x;
          const cy = baseY + baseH / 2 + c.t.y;
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate((c.t.rotation * Math.PI) / 180);
          ctx.scale(c.t.scale, c.t.scale);
          ctx.drawImage(c.img, -baseW / 2, -baseH / 2, baseW, baseH);
          ctx.restore();
        }
      }

      // ── Layer 4: Gradiente inferior ─────────────────────────────────────
      if (!showThumbPrincipal) {
        const grad = ctx.createLinearGradient(0, H * 0.55, 0, H);
        grad.addColorStop(0, 'rgba(34,34,34,0)');
        grad.addColorStop(1, 'rgba(34,34,34,0.7)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, H * 0.55, W, H * 0.45);
      }

      // ── Layer 5: Logos ──────────────────────────────────────────────────
      ctx.drawImage(logosImg, 0, 0, W, H);

      // ── Layer 6: Texto ──────────────────────────────────────────────────
      const fontFamily = (props.customFontFamily || "'Clash Grotesk', sans-serif")
        .split(',')[0].trim().replace(/'/g, '');
      const textColor = props.textColor || '#F1E8D5';
      const strokeColor = props.strokeColor || '#0C0C20';
      const highlightColor = props.highlightColor || '#D02046';

      const bottomFrac = (props.textBoxHeight ?? 6) / 100;

      if (!showMeioAMeio && !(showThumbPrincipal && useQuadrantGrid) && props.thumbText) {
        const areaX = W * 0.02;
        const areaH = H * 0.38;
        const areaY = H - H * bottomFrac - areaH;
        const areaW = W * 0.96;
        drawAutoFitText(
          ctx, props.thumbText,
          areaX, areaY, areaW, areaH,
          200, fontFamily,
          textColor, highlightColor, strokeColor, 15,
          -2, 20
        );
      }

      // Thumb Principal — text inside circle
      if (showThumbPrincipal && useQuadrantGrid && props.thumbText) {
        const textW = 380;
        const textH = 200;
        const textX = W / 2 - textW / 2;
        const textY = H - H * bottomFrac - textH;
        drawAutoFitText(
          ctx, props.thumbText,
          textX, textY, textW, textH,
          200, fontFamily,
          textColor, '#00f2f4', strokeColor, 15,
          0, 10, 1.15
        );

        // Draw team crests below text
        if (tpHomeTeamId || tpAwayTeamId) {
          const allTeams = [...teamsBrasileirao, ...teamsPaulistao];
          const homeTeam = tpHomeTeamId ? allTeams.find(t => t.id === tpHomeTeamId) : null;
          const awayTeam = tpAwayTeamId ? allTeams.find(t => t.id === tpAwayTeamId) : null;
          const crestPromises: Promise<{ img: HTMLImageElement; team: typeof homeTeam }>[] = [];
          if (homeTeam) crestPromises.push(loadImage(homeTeam.crest_url).then(img => ({ img, team: homeTeam })));
          if (awayTeam) crestPromises.push(loadImage(awayTeam.crest_url).then(img => ({ img, team: awayTeam })));
          const crests = await Promise.all(crestPromises);
          const crestH = 173;
          const gap = -58;
          const totalW = crests.reduce((acc, c) => {
            const aspect = c.img.naturalWidth / c.img.naturalHeight;
            return acc + crestH * aspect;
          }, 0) + (crests.length > 1 ? gap : 0);
          let crestX = W / 2 - totalW / 2;
          const crestY = H - H * 0.176 - crestH;
          let crestIndex = 0;
          for (const c of crests) {
            const aspect = c.img.naturalWidth / c.img.naturalHeight;
            const cW = crestH * aspect;
            const offsetX = crestIndex === 0 ? 22 : -22;
            ctx.drawImage(c.img, crestX + offsetX, crestY, cW, crestH);
            crestX += cW + gap;
            crestIndex++;
          }
        }
      }

      if (showMeioAMeio) {
        if (props.thumbTextLeft) {
          const areaX = W * 0.01;
          const areaH = H * 0.40;
          const areaY = H - H * bottomFrac - areaH;
          const areaW = W * 0.47;
          drawAutoFitText(
            ctx, props.thumbTextLeft,
            areaX, areaY, areaW, areaH,
            160, fontFamily,
            textColor, highlightColor, strokeColor, 15,
            -2, 14
          );
        }
        if (props.thumbTextRight) {
          const areaX = W * 0.52;
          const areaH = H * 0.40;
          const areaY = H - H * bottomFrac - areaH;
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
      {/* Reset button */}
      <Button
        variant="outline"
        className="w-full border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
        onClick={onClear}
      >
        <RotateCcw className="w-4 h-4 mr-2" />
        Reverter todas as alterações
      </Button>

      {/* Model selector */}
      <div className="space-y-2">
        <Label className="font-semibold">Modelo</Label>
        <Select value={thumbModel} onValueChange={(v) => onThumbModelChange(v as ThumbModel)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pip">Com PIP</SelectItem>
            <SelectItem value="pip-dividido">Com PIP dividido</SelectItem>
            {allowJogoV1 && (
              <>
                <SelectItem value="jogo-v1">Jogo v1</SelectItem>
                <SelectItem value="jogo-pip-duplo">3 fotos + PIP duplo</SelectItem>
                <SelectItem value="so-lettering">Lettering simples</SelectItem>
              </>
            )}
            {allowAllModels && (
              <>
                <SelectItem value="duas-pessoas">Duas pessoas</SelectItem>
                <SelectItem value="meio-a-meio">Meio a meio</SelectItem>
                <SelectItem value="so-lettering">Lettering simples</SelectItem>
              </>
            )}
            {(allowAllModels || allowThumbPrincipal) && (
              <SelectItem value="thumb-principal">Thumb principal</SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Logo variant toggle */}
      {hasLogosNegative && thumbModel !== 'thumb-principal' && (
        <div className="space-y-2">
          <Label className="font-semibold">Versão da Logo</Label>
          <Select value={logosVariant} onValueChange={(v) => onLogosVariantChange?.(v as 'positiva' | 'negativa')}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="positiva">Positiva (branca)</SelectItem>
              <SelectItem value="negativa">Negativa (preta)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

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

          {onPipFromBase64 && (
            <PipAiGenerator onImageGenerated={onPipFromBase64} />
          )}

          {/* PIP Image Transform */}
          {pipImage && (
            <div className="space-y-3 p-3 rounded-lg border border-border bg-muted/30">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ajuste da imagem PIP</Label>
                <div className="flex items-center gap-2">
                  <Switch checked={showPipAdjust} onCheckedChange={setShowPipAdjust} />
                  <button onClick={() => onPipTransformChange({ x: 0, y: 0, scale: pipBaseScale, rotation: 0 })} className="text-muted-foreground hover:text-foreground transition-colors" title="Redefinir">
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              {showPipAdjust && (
                <>
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
                </>
              )}
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

      {/* PIP Dividido — duas fotos dentro de uma moldura */}
      {thumbModel === 'pip-dividido' && (
        <>
          {/* Foto esquerda */}
          <div className="space-y-2">
            <Label className="font-semibold">Imagem PIP esquerda</Label>
            <input ref={pipInputRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => e.target.files?.[0] && onPipUpload(e.target.files[0])} />
            <Button variant={pipImage ? 'secondary' : 'outline'} className="w-full"
              onClick={() => pipInputRef.current?.click()}>
              <Upload className="w-4 h-4 mr-2" />{pipImage ? 'Trocar foto esquerda' : 'Upload foto esquerda'}
            </Button>
          </div>
          {onPipFromBase64 && (
            <PipAiGenerator onImageGenerated={onPipFromBase64} />
          )}
          {pipImage && (
            <div className="space-y-3 p-3 rounded-lg border border-border bg-muted/30">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ajuste foto esquerda</Label>
                <div className="flex items-center gap-2">
                  <Switch checked={showPipAdjust} onCheckedChange={setShowPipAdjust} />
                  <button onClick={() => onPipTransformChange({ x: 0, y: 0, scale: 1, rotation: 0 })} className="text-muted-foreground hover:text-foreground transition-colors"><RotateCcw className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              {showPipAdjust && (
                <>
              <div><Label className="text-xs">Posição X: {pipTransform.x}px</Label><Slider value={[pipTransform.x]} onValueChange={([x]) => onPipTransformChange({ x })} min={-800} max={800} step={1} className="mt-1" /></div>
              <div><Label className="text-xs">Posição Y: {pipTransform.y}px</Label><Slider value={[pipTransform.y]} onValueChange={([y]) => onPipTransformChange({ y })} min={-800} max={800} step={1} className="mt-1" /></div>
              <div><Label className="text-xs">Zoom: {pipTransform.scale.toFixed(2)}x</Label><Slider value={[pipTransform.scale]} onValueChange={([scale]) => onPipTransformChange({ scale })} min={0.3} max={3} step={0.01} className="mt-1" /></div>
                </>
               )}
            </div>
          )}

          {/* Foto direita */}
          <div className="space-y-2">
            <Label className="font-semibold">Imagem PIP direita</Label>
            <input ref={pip2InputRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => e.target.files?.[0] && onPip2Upload(e.target.files[0])} />
            <Button variant={pip2Image ? 'secondary' : 'outline'} className="w-full"
              onClick={() => pip2InputRef.current?.click()}>
              <Upload className="w-4 h-4 mr-2" />{pip2Image ? 'Trocar foto direita' : 'Upload foto direita'}
            </Button>
          </div>
          {pip2Image && (
            <div className="space-y-3 p-3 rounded-lg border border-border bg-muted/30">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ajuste foto direita</Label>
                <div className="flex items-center gap-2">
                  <Switch checked={showPip2Adjust} onCheckedChange={setShowPip2Adjust} />
                  <button onClick={() => onPip2TransformChange({ x: 0, y: 0, scale: 1, rotation: 0 })} className="text-muted-foreground hover:text-foreground transition-colors"><RotateCcw className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              {showPip2Adjust && (
                <>
              <div><Label className="text-xs">Posição X: {pip2Transform.x}px</Label><Slider value={[pip2Transform.x]} onValueChange={([x]) => onPip2TransformChange({ x })} min={-800} max={800} step={1} className="mt-1" /></div>
              <div><Label className="text-xs">Posição Y: {pip2Transform.y}px</Label><Slider value={[pip2Transform.y]} onValueChange={([y]) => onPip2TransformChange({ y })} min={-800} max={800} step={1} className="mt-1" /></div>
              <div><Label className="text-xs">Zoom: {pip2Transform.scale.toFixed(2)}x</Label><Slider value={[pip2Transform.scale]} onValueChange={([scale]) => onPip2TransformChange({ scale })} min={0.3} max={3} step={0.01} className="mt-1" /></div>
                </>
               )}
            </div>
          )}

          {/* Moldura PIP única */}
          <div className="space-y-3 p-3 rounded-lg border border-border bg-muted/30">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Moldura PIP</Label>
            <div>
              <Label className="text-xs">Posição X: {pipFrame.x.toFixed(1)}%</Label>
              <Slider value={[pipFrame.x]} onValueChange={([x]) => onPipFrameChange({ x })} min={-20} max={80} step={0.1} className="mt-1" />
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
        </>
      )}

      {/* Jogo v1 — 3 cutout uploads */}
      {thumbModel === 'jogo-v1' && (
        <>
          {/* Pessoa 1 — esquerda */}
          <div className="space-y-2">
            <Label className="font-semibold">Foto 1 (esquerda)</Label>
            <input ref={personInputRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => e.target.files?.[0] && onPersonUpload(e.target.files[0])} />
            <Button variant={personCutout ? 'secondary' : 'outline'} className="w-full"
              disabled={isRemovingBg} onClick={() => personInputRef.current?.click()}>
              {isRemovingBg ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Removendo fundo...</>
                : <><Upload className="w-4 h-4 mr-2" />{personCutout ? 'Trocar foto 1' : 'Upload foto 1'}</>}
            </Button>
          </div>
          {personCutout && (
            <div className="space-y-3 p-3 rounded-lg border border-border bg-muted/30">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ajuste foto 1</Label>
                <div className="flex items-center gap-2">
                  <Switch checked={showPerson1Adjust} onCheckedChange={setShowPerson1Adjust} />
                  <button onClick={() => onPersonTransformChange({ x: 0, y: 0, scale: 1, rotation: 0 })} className="text-muted-foreground hover:text-foreground transition-colors"><RotateCcw className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              {showPerson1Adjust && (
                <>
              <div><Label className="text-xs">Posição X: {personTransform.x}px</Label><Slider value={[personTransform.x]} onValueChange={([x]) => onPersonTransformChange({ x })} min={-800} max={800} step={1} className="mt-1" /></div>
              <div><Label className="text-xs">Posição Y: {personTransform.y}px</Label><Slider value={[personTransform.y]} onValueChange={([y]) => onPersonTransformChange({ y })} min={-800} max={800} step={1} className="mt-1" /></div>
              <div><Label className="text-xs">Zoom: {personTransform.scale.toFixed(2)}x</Label><Slider value={[personTransform.scale]} onValueChange={([scale]) => onPersonTransformChange({ scale })} min={0.3} max={3} step={0.01} className="mt-1" /></div>
              <div><Label className="text-xs">Rotação: {personTransform.rotation}°</Label><Slider value={[personTransform.rotation]} onValueChange={([rotation]) => onPersonTransformChange({ rotation })} min={-180} max={180} step={1} className="mt-1" /></div>
                </>
               )}
            </div>
          )}

          {/* Pessoa 2 — centro (acima) */}
          <div className="space-y-2">
            <Label className="font-semibold">Foto 2 (centro — acima)</Label>
            <input ref={person2InputRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => e.target.files?.[0] && onPerson2Upload(e.target.files[0])} />
            <Button variant={person2Cutout ? 'secondary' : 'outline'} className="w-full"
              disabled={isRemovingBg2} onClick={() => person2InputRef.current?.click()}>
              {isRemovingBg2 ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Removendo fundo...</>
                : <><Upload className="w-4 h-4 mr-2" />{person2Cutout ? 'Trocar foto 2' : 'Upload foto 2'}</>}
            </Button>
          </div>
          {person2Cutout && (
            <div className="space-y-3 p-3 rounded-lg border border-border bg-muted/30">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ajuste foto 2</Label>
                <div className="flex items-center gap-2">
                  <Switch checked={showPerson2Adjust} onCheckedChange={setShowPerson2Adjust} />
                  <button onClick={() => onPerson2TransformChange({ x: 0, y: 0, scale: 1, rotation: 0 })} className="text-muted-foreground hover:text-foreground transition-colors"><RotateCcw className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              {showPerson2Adjust && (<>
              <div><Label className="text-xs">Posição X: {person2Transform.x}px</Label><Slider value={[person2Transform.x]} onValueChange={([x]) => onPerson2TransformChange({ x })} min={-800} max={800} step={1} className="mt-1" /></div>
              <div><Label className="text-xs">Posição Y: {person2Transform.y}px</Label><Slider value={[person2Transform.y]} onValueChange={([y]) => onPerson2TransformChange({ y })} min={-800} max={800} step={1} className="mt-1" /></div>
              <div><Label className="text-xs">Zoom: {person2Transform.scale.toFixed(2)}x</Label><Slider value={[person2Transform.scale]} onValueChange={([scale]) => onPerson2TransformChange({ scale })} min={0.3} max={3} step={0.01} className="mt-1" /></div>
              <div><Label className="text-xs">Rotação: {person2Transform.rotation}°</Label><Slider value={[person2Transform.rotation]} onValueChange={([rotation]) => onPerson2TransformChange({ rotation })} min={-180} max={180} step={1} className="mt-1" /></div>
              </>)}
            </div>
          )}

          {/* Pessoa 3 — direita */}
          <div className="space-y-2">
            <Label className="font-semibold">Foto 3 (direita)</Label>
            <input ref={person3InputRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => e.target.files?.[0] && onPerson3Upload?.(e.target.files[0])} />
            <Button variant={person3Cutout ? 'secondary' : 'outline'} className="w-full"
              disabled={isRemovingBg3} onClick={() => person3InputRef.current?.click()}>
              {isRemovingBg3 ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Removendo fundo...</>
                : <><Upload className="w-4 h-4 mr-2" />{person3Cutout ? 'Trocar foto 3' : 'Upload foto 3'}</>}
            </Button>
          </div>
          {person3Cutout && (
            <div className="space-y-3 p-3 rounded-lg border border-border bg-muted/30">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ajuste foto 3</Label>
                <div className="flex items-center gap-2">
                  <Switch checked={showPerson3Adjust} onCheckedChange={setShowPerson3Adjust} />
                  <button onClick={() => onPerson3TransformChange?.({ x: 0, y: 0, scale: 1, rotation: 0 })} className="text-muted-foreground hover:text-foreground transition-colors"><RotateCcw className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              {showPerson3Adjust && (<>
              <div><Label className="text-xs">Posição X: {person3Transform.x}px</Label><Slider value={[person3Transform.x]} onValueChange={([x]) => onPerson3TransformChange?.({ x })} min={-800} max={800} step={1} className="mt-1" /></div>
              <div><Label className="text-xs">Posição Y: {person3Transform.y}px</Label><Slider value={[person3Transform.y]} onValueChange={([y]) => onPerson3TransformChange?.({ y })} min={-800} max={800} step={1} className="mt-1" /></div>
              <div><Label className="text-xs">Zoom: {person3Transform.scale.toFixed(2)}x</Label><Slider value={[person3Transform.scale]} onValueChange={([scale]) => onPerson3TransformChange?.({ scale })} min={0.3} max={3} step={0.01} className="mt-1" /></div>
              <div><Label className="text-xs">Rotação: {person3Transform.rotation}°</Label><Slider value={[person3Transform.rotation]} onValueChange={([rotation]) => onPerson3TransformChange?.({ rotation })} min={-180} max={180} step={1} className="mt-1" /></div>
              </>)}
            </div>
          )}
        </>
      )}

      {/* jogo-pip-duplo — 3 fotos + 2 PIPs */}
      {thumbModel === 'jogo-pip-duplo' && (
        <>
          {/* Pessoa 1 — esquerda */}
          <div className="space-y-2">
            <Label className="font-semibold">Foto 1 (esquerda)</Label>
            <input ref={personInputRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => e.target.files?.[0] && onPersonUpload(e.target.files[0])} />
            <Button variant={personCutout ? 'secondary' : 'outline'} className="w-full"
              disabled={isRemovingBg} onClick={() => personInputRef.current?.click()}>
              {isRemovingBg ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Removendo fundo...</>
                : <><Upload className="w-4 h-4 mr-2" />{personCutout ? 'Trocar foto 1' : 'Upload foto 1'}</>}
            </Button>
          </div>
          {personCutout && (
            <div className="space-y-3 p-3 rounded-lg border border-border bg-muted/30">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ajuste foto 1</Label>
                <div className="flex items-center gap-2">
                  <Switch checked={showPerson1Adjust} onCheckedChange={setShowPerson1Adjust} />
                  <button onClick={() => onPersonTransformChange({ x: 0, y: 0, scale: 1, rotation: 0 })} className="text-muted-foreground hover:text-foreground transition-colors"><RotateCcw className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              {showPerson1Adjust && (<>
              <div><Label className="text-xs">Posição X: {personTransform.x}px</Label><Slider value={[personTransform.x]} onValueChange={([x]) => onPersonTransformChange({ x })} min={-800} max={800} step={1} className="mt-1" /></div>
              <div><Label className="text-xs">Posição Y: {personTransform.y}px</Label><Slider value={[personTransform.y]} onValueChange={([y]) => onPersonTransformChange({ y })} min={-800} max={800} step={1} className="mt-1" /></div>
              <div><Label className="text-xs">Zoom: {personTransform.scale.toFixed(2)}x</Label><Slider value={[personTransform.scale]} onValueChange={([scale]) => onPersonTransformChange({ scale })} min={0.3} max={3} step={0.01} className="mt-1" /></div>
              <div><Label className="text-xs">Rotação: {personTransform.rotation}°</Label><Slider value={[personTransform.rotation]} onValueChange={([rotation]) => onPersonTransformChange({ rotation })} min={-180} max={180} step={1} className="mt-1" /></div>
              </>)}
            </div>
          )}

          {/* Pessoa 2 — centro */}
          <div className="space-y-2">
            <Label className="font-semibold">Foto 2 (centro — acima)</Label>
            <input ref={person2InputRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => e.target.files?.[0] && onPerson2Upload(e.target.files[0])} />
            <Button variant={person2Cutout ? 'secondary' : 'outline'} className="w-full"
              disabled={isRemovingBg2} onClick={() => person2InputRef.current?.click()}>
              {isRemovingBg2 ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Removendo fundo...</>
                : <><Upload className="w-4 h-4 mr-2" />{person2Cutout ? 'Trocar foto 2' : 'Upload foto 2'}</>}
            </Button>
          </div>
          {person2Cutout && (
            <div className="space-y-3 p-3 rounded-lg border border-border bg-muted/30">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ajuste foto 2</Label>
                <div className="flex items-center gap-2">
                  <Switch checked={showPerson2Adjust} onCheckedChange={setShowPerson2Adjust} />
                  <button onClick={() => onPerson2TransformChange({ x: 0, y: 0, scale: 1, rotation: 0 })} className="text-muted-foreground hover:text-foreground transition-colors"><RotateCcw className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              {showPerson2Adjust && (<>
              <div><Label className="text-xs">Posição X: {person2Transform.x}px</Label><Slider value={[person2Transform.x]} onValueChange={([x]) => onPerson2TransformChange({ x })} min={-800} max={800} step={1} className="mt-1" /></div>
              <div><Label className="text-xs">Posição Y: {person2Transform.y}px</Label><Slider value={[person2Transform.y]} onValueChange={([y]) => onPerson2TransformChange({ y })} min={-800} max={800} step={1} className="mt-1" /></div>
              <div><Label className="text-xs">Zoom: {person2Transform.scale.toFixed(2)}x</Label><Slider value={[person2Transform.scale]} onValueChange={([scale]) => onPerson2TransformChange({ scale })} min={0.3} max={3} step={0.01} className="mt-1" /></div>
              <div><Label className="text-xs">Rotação: {person2Transform.rotation}°</Label><Slider value={[person2Transform.rotation]} onValueChange={([rotation]) => onPerson2TransformChange({ rotation })} min={-180} max={180} step={1} className="mt-1" /></div>
              </>)}
            </div>
          )}

          {/* Pessoa 3 — direita */}
          <div className="space-y-2">
            <Label className="font-semibold">Foto 3 (direita)</Label>
            <input ref={person3InputRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => e.target.files?.[0] && onPerson3Upload?.(e.target.files[0])} />
            <Button variant={person3Cutout ? 'secondary' : 'outline'} className="w-full"
              disabled={isRemovingBg3} onClick={() => person3InputRef.current?.click()}>
              {isRemovingBg3 ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Removendo fundo...</>
                : <><Upload className="w-4 h-4 mr-2" />{person3Cutout ? 'Trocar foto 3' : 'Upload foto 3'}</>}
            </Button>
          </div>
          {person3Cutout && (
            <div className="space-y-3 p-3 rounded-lg border border-border bg-muted/30">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ajuste foto 3</Label>
                <div className="flex items-center gap-2">
                  <Switch checked={showPerson3Adjust} onCheckedChange={setShowPerson3Adjust} />
                  <button onClick={() => onPerson3TransformChange?.({ x: 0, y: 0, scale: 1, rotation: 0 })} className="text-muted-foreground hover:text-foreground transition-colors"><RotateCcw className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              {showPerson3Adjust && (<>
              <div><Label className="text-xs">Posição X: {person3Transform.x}px</Label><Slider value={[person3Transform.x]} onValueChange={([x]) => onPerson3TransformChange?.({ x })} min={-800} max={800} step={1} className="mt-1" /></div>
              <div><Label className="text-xs">Posição Y: {person3Transform.y}px</Label><Slider value={[person3Transform.y]} onValueChange={([y]) => onPerson3TransformChange?.({ y })} min={-800} max={800} step={1} className="mt-1" /></div>
              <div><Label className="text-xs">Zoom: {person3Transform.scale.toFixed(2)}x</Label><Slider value={[person3Transform.scale]} onValueChange={([scale]) => onPerson3TransformChange?.({ scale })} min={0.3} max={3} step={0.01} className="mt-1" /></div>
              <div><Label className="text-xs">Rotação: {person3Transform.rotation}°</Label><Slider value={[person3Transform.rotation]} onValueChange={([rotation]) => onPerson3TransformChange?.({ rotation })} min={-180} max={180} step={1} className="mt-1" /></div>
              </>)}
            </div>
          )}

          {/* PIP 1 — esquerda */}
          <div className="space-y-2">
            <Label className="font-semibold">PIP esquerdo</Label>
            <input ref={pipInputRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => e.target.files?.[0] && onPipUpload(e.target.files[0])} />
            <Button variant={pipImage ? 'secondary' : 'outline'} className="w-full"
              onClick={() => pipInputRef.current?.click()}>
              <Upload className="w-4 h-4 mr-2" />{pipImage ? 'Trocar PIP esquerdo' : 'Upload PIP esquerdo'}
            </Button>
          </div>
          {onPipFromBase64 && (
            <PipAiGenerator onImageGenerated={onPipFromBase64} />
          )}
          {pipImage && (
            <div className="space-y-3 p-3 rounded-lg border border-border bg-muted/30">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ajuste PIP esquerdo</Label>
                <div className="flex items-center gap-2">
                  <Switch checked={showPipAdjust} onCheckedChange={setShowPipAdjust} />
                  <button onClick={() => onPipTransformChange({ x: 0, y: 0, scale: pipBaseScale, rotation: 0 })} className="text-muted-foreground hover:text-foreground transition-colors"><RotateCcw className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              {showPipAdjust && (<>
              <div><Label className="text-xs">Posição X: {pipTransform.x}px</Label><Slider value={[pipTransform.x]} onValueChange={([x]) => onPipTransformChange({ x })} min={-500} max={500} step={1} className="mt-1" /></div>
              <div><Label className="text-xs">Posição Y: {pipTransform.y}px</Label><Slider value={[pipTransform.y]} onValueChange={([y]) => onPipTransformChange({ y })} min={-500} max={500} step={1} className="mt-1" /></div>
              <div><Label className="text-xs">Zoom: {pipTransform.scale.toFixed(2)}x</Label><Slider value={[pipTransform.scale]} onValueChange={([scale]) => onPipTransformChange({ scale })} min={0.5} max={3} step={0.01} className="mt-1" /></div>
              </>)}
            </div>
          )}

          {/* Moldura compartilhada — proporcional e igual para os dois PIPs */}
          {(pipImage || pip2Image) && (
            <div className="space-y-3 p-3 rounded-lg border border-border bg-muted/30">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Moldura dos PIPs (proporcional)</Label>
                <button
                  onClick={() => onPipFrameChange({ x: 3.0, y: 15.4, width: 27.0, height: 55.0 })}
                  className="text-muted-foreground hover:text-foreground transition-colors" title="Redefinir">
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
              <div><Label className="text-xs">Posição X (esquerdo): {pipFrame.x.toFixed(1)}%</Label><Slider value={[pipFrame.x]} onValueChange={([x]) => onPipFrameChange({ x })} min={0} max={30} step={0.1} className="mt-1" /></div>
              <div><Label className="text-xs">Posição Y: {pipFrame.y.toFixed(1)}%</Label><Slider value={[pipFrame.y]} onValueChange={([y]) => onPipFrameChange({ y })} min={-20} max={80} step={0.1} className="mt-1" /></div>
              <div><Label className="text-xs">Largura: {pipFrame.width.toFixed(1)}%</Label><Slider value={[pipFrame.width]} onValueChange={([width]) => onPipFrameChange({ width })} min={10} max={45} step={0.1} className="mt-1" /></div>
              <div><Label className="text-xs">Altura: {pipFrame.height.toFixed(1)}%</Label><Slider value={[pipFrame.height]} onValueChange={([height]) => onPipFrameChange({ height })} min={10} max={90} step={0.1} className="mt-1" /></div>
            </div>
          )}


          {/* PIP 2 — direita */}
          <div className="space-y-2">
            <Label className="font-semibold">PIP direito</Label>
            <input ref={pip2InputRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => e.target.files?.[0] && onPip2Upload?.(e.target.files[0])} />
            <Button variant={pip2Image ? 'secondary' : 'outline'} className="w-full"
              onClick={() => pip2InputRef.current?.click()}>
              <Upload className="w-4 h-4 mr-2" />{pip2Image ? 'Trocar PIP direito' : 'Upload PIP direito'}
            </Button>
          </div>
          {pip2Image && (
            <div className="space-y-3 p-3 rounded-lg border border-border bg-muted/30">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ajuste PIP direito</Label>
                <div className="flex items-center gap-2">
                  <Switch checked={showPip2Adjust} onCheckedChange={setShowPip2Adjust} />
                  <button onClick={() => onPip2TransformChange?.({ x: 0, y: 0, scale: pip2BaseScale, rotation: 0 })} className="text-muted-foreground hover:text-foreground transition-colors"><RotateCcw className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              {showPip2Adjust && (<>
              <div><Label className="text-xs">Posição X: {pip2Transform.x}px</Label><Slider value={[pip2Transform.x]} onValueChange={([x]) => onPip2TransformChange?.({ x })} min={-500} max={500} step={1} className="mt-1" /></div>
              <div><Label className="text-xs">Posição Y: {pip2Transform.y}px</Label><Slider value={[pip2Transform.y]} onValueChange={([y]) => onPip2TransformChange?.({ y })} min={-500} max={500} step={1} className="mt-1" /></div>
              <div><Label className="text-xs">Zoom: {pip2Transform.scale.toFixed(2)}x</Label><Slider value={[pip2Transform.scale]} onValueChange={([scale]) => onPip2TransformChange?.({ scale })} min={0.5} max={3} step={0.01} className="mt-1" /></div>
              </>)}
            </div>
          )}
        </>
      )}

      {/* Thumb Principal — 4 quadrant uploads with visibility toggles */}
      {thumbModel === 'thumb-principal' && useQuadrantGrid && (
        <Collapsible open={showQuadrantsMenu} onOpenChange={setShowQuadrantsMenu} className="rounded-lg border border-border bg-muted/20 p-3">
          <CollapsibleTrigger className="flex w-full items-center justify-between">
            <Label className="font-semibold cursor-pointer">Quadrantes</Label>
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${showQuadrantsMenu ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 mt-3">
            {[
              { label: 'Quadrante 1 (↖)', cutout: personCutout, inputRef: personInputRef, isRemoving: isRemovingBg, onUpload: onPersonUpload, transform: personTransform, onTransformChange: onPersonTransformChange, showAdjust: showPerson1Adjust, setShowAdjust: setShowPerson1Adjust, idx: 0 },
              { label: 'Quadrante 2 (↗)', cutout: person2Cutout, inputRef: person2InputRef, isRemoving: isRemovingBg2, onUpload: onPerson2Upload, transform: person2Transform, onTransformChange: onPerson2TransformChange, showAdjust: showPerson2Adjust, setShowAdjust: setShowPerson2Adjust, idx: 1 },
              { label: 'Quadrante 3 (↙)', cutout: person3Cutout, inputRef: person3InputRef, isRemoving: isRemovingBg3, onUpload: onPerson3Upload!, transform: person3Transform, onTransformChange: onPerson3TransformChange!, showAdjust: showPerson3Adjust, setShowAdjust: setShowPerson3Adjust, idx: 2 },
              { label: 'Quadrante 4 (↘)', cutout: person4Cutout, inputRef: person4InputRef, isRemoving: isRemovingBg4, onUpload: onPerson4Upload!, transform: person4Transform, onTransformChange: onPerson4TransformChange!, showAdjust: showPerson4Adjust, setShowAdjust: setShowPerson4Adjust, idx: 3 },
            ].map((item) => (
              <div key={item.idx} className={`p-3 rounded-lg border border-border ${quadrantVisibility[item.idx] ? 'bg-muted/30' : 'bg-muted/10 opacity-60'}`}>
                <div className="flex items-center justify-between mb-2">
                  <Label className="font-semibold text-sm">{item.label}</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{quadrantVisibility[item.idx] ? 'Visível' : 'Oculto'}</span>
                    <Switch
                      checked={quadrantVisibility[item.idx]}
                      onCheckedChange={(checked) => {
                        const next = [...quadrantVisibility];
                        next[item.idx] = checked;
                        onQuadrantVisibilityChange?.(next);
                      }}
                    />
                  </div>
                </div>
                {quadrantVisibility[item.idx] && (
                  <div className="space-y-2">
                    <Select onValueChange={(url) => onQuadrantPresetSelect?.(item.idx, url)}>
                      <SelectTrigger className="w-full h-8 text-xs">
                        <SelectValue placeholder="Selecionar preset..." />
                      </SelectTrigger>
                      <SelectContent>
                        {QUADRANT_PRESETS.map((p) => (
                          <SelectItem key={p.url} value={p.url}>{p.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <input ref={item.inputRef} type="file" accept="image/*" className="hidden"
                      onChange={(e) => e.target.files?.[0] && item.onUpload(e.target.files[0])} />
                    <Button variant={item.cutout ? 'secondary' : 'outline'} className="w-full" size="sm"
                      disabled={item.isRemoving} onClick={() => item.inputRef.current?.click()}>
                      {item.isRemoving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Removendo fundo...</>
                        : <><Upload className="w-4 h-4 mr-2" />{item.cutout ? 'Trocar foto' : 'Upload foto'}</>}
                    </Button>
                    {item.cutout && (
                      <div className="space-y-3 p-2 rounded border border-border bg-background/50 mt-1">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ajuste</Label>
                          <div className="flex items-center gap-2">
                            <Switch checked={item.showAdjust} onCheckedChange={item.setShowAdjust} />
                            <button onClick={() => item.onTransformChange({ x: 0, y: 0, scale: 1, rotation: 0 })} className="text-muted-foreground hover:text-foreground transition-colors"><RotateCcw className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                        {item.showAdjust && (<>
                          <div><Label className="text-xs">X: {item.transform.x}px</Label><Slider value={[item.transform.x]} onValueChange={([x]) => item.onTransformChange({ x })} min={-800} max={800} step={1} className="mt-1" /></div>
                          <div><Label className="text-xs">Y: {item.transform.y}px</Label><Slider value={[item.transform.y]} onValueChange={([y]) => item.onTransformChange({ y })} min={-800} max={800} step={1} className="mt-1" /></div>
                          <div><Label className="text-xs">Zoom: {item.transform.scale.toFixed(2)}x</Label><Slider value={[item.transform.scale]} onValueChange={([scale]) => item.onTransformChange({ scale })} min={0.3} max={3} step={0.01} className="mt-1" /></div>
                          <div><Label className="text-xs">Rotação: {item.transform.rotation}°</Label><Slider value={[item.transform.rotation]} onValueChange={([rotation]) => item.onTransformChange({ rotation })} min={-180} max={180} step={1} className="mt-1" /></div>
                        </>)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Thumb Principal — Team crests (Roda de Bobo only) */}
      {thumbModel === 'thumb-principal' && useQuadrantGrid && (
        <div className="space-y-3">
          <Label className="font-semibold">Escudos</Label>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Time 1</Label>
              <Select value={tpHomeTeamId || ''} onValueChange={(v) => onTpHomeTeamChange?.(v || null)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Selecionar time" />
                </SelectTrigger>
                <SelectContent>
                  {[...teamsBrasileirao, ...teamsPaulistao]
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Time 2</Label>
              <Select value={tpAwayTeamId || ''} onValueChange={(v) => onTpAwayTeamChange?.(v || null)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Selecionar time" />
                </SelectTrigger>
                <SelectContent>
                  {[...teamsBrasileirao, ...teamsPaulistao]
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Thumb Principal — free photo uploads (non-quadrant) */}
      {thumbModel === 'thumb-principal' && !useQuadrantGrid && (
        <div className="space-y-3">
          <Label className="font-semibold">Fotos</Label>
          {[
            { label: 'Foto 1', cutout: personCutout, inputRef: personInputRef, isRemoving: isRemovingBg, onUpload: onPersonUpload, transform: personTransform, onTransformChange: onPersonTransformChange, showAdjust: showPerson1Adjust, setShowAdjust: setShowPerson1Adjust },
            { label: 'Foto 2', cutout: person2Cutout, inputRef: person2InputRef, isRemoving: isRemovingBg2, onUpload: onPerson2Upload, transform: person2Transform, onTransformChange: onPerson2TransformChange, showAdjust: showPerson2Adjust, setShowAdjust: setShowPerson2Adjust },
            { label: 'Foto 3', cutout: person3Cutout, inputRef: person3InputRef, isRemoving: isRemovingBg3, onUpload: onPerson3Upload!, transform: person3Transform, onTransformChange: onPerson3TransformChange!, showAdjust: showPerson3Adjust, setShowAdjust: setShowPerson3Adjust },
            { label: 'Foto 4', cutout: person4Cutout, inputRef: person4InputRef, isRemoving: isRemovingBg4, onUpload: onPerson4Upload!, transform: person4Transform, onTransformChange: onPerson4TransformChange!, showAdjust: showPerson4Adjust, setShowAdjust: setShowPerson4Adjust },
          ].map((item, idx) => (
            <div key={idx} className="p-3 rounded-lg border border-border bg-muted/30">
              <Label className="font-semibold text-sm mb-2 block">{item.label}</Label>
              <input ref={item.inputRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => e.target.files?.[0] && item.onUpload(e.target.files[0])} />
              <Button variant={item.cutout ? 'secondary' : 'outline'} className="w-full" size="sm"
                disabled={item.isRemoving} onClick={() => item.inputRef.current?.click()}>
                {item.isRemoving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Removendo fundo...</>
                  : <><Upload className="w-4 h-4 mr-2" />{item.cutout ? 'Trocar foto' : 'Upload foto'}</>}
              </Button>
              {item.cutout && (
                <div className="space-y-3 p-2 rounded border border-border bg-background/50 mt-1">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ajuste</Label>
                    <div className="flex items-center gap-2">
                      <Switch checked={item.showAdjust} onCheckedChange={item.setShowAdjust} />
                      <button onClick={() => item.onTransformChange({ x: 0, y: 0, scale: 1, rotation: 0 })} className="text-muted-foreground hover:text-foreground transition-colors"><RotateCcw className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                  {item.showAdjust && (<>
                    <div><Label className="text-xs">X: {item.transform.x}px</Label><Slider value={[item.transform.x]} onValueChange={([x]) => item.onTransformChange({ x })} min={-800} max={800} step={1} className="mt-1" /></div>
                    <div><Label className="text-xs">Y: {item.transform.y}px</Label><Slider value={[item.transform.y]} onValueChange={([y]) => item.onTransformChange({ y })} min={-800} max={800} step={1} className="mt-1" /></div>
                    <div><Label className="text-xs">Zoom: {item.transform.scale.toFixed(2)}x</Label><Slider value={[item.transform.scale]} onValueChange={([scale]) => item.onTransformChange({ scale })} min={0.3} max={3} step={0.01} className="mt-1" /></div>
                    <div><Label className="text-xs">Rotação: {item.transform.rotation}°</Label><Slider value={[item.transform.rotation]} onValueChange={([rotation]) => item.onTransformChange({ rotation })} min={-180} max={180} step={1} className="mt-1" /></div>
                  </>)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Person Upload (right side / single person) — pip, pip-dividido & duas-pessoas */}
      {thumbModel !== 'meio-a-meio' && thumbModel !== 'so-lettering' && thumbModel !== 'jogo-v1' && thumbModel !== 'jogo-pip-duplo' && thumbModel !== 'thumb-principal' && (
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
            {/* Botão Gemini Upscale — aparece somente se houver cutout */}
            {personCutout && onUpscalePerson && (
              <Button
                variant="outline"
                className="w-full border-primary/40 text-primary hover:bg-primary/10"
                disabled={isUpscalingPerson}
                onClick={onUpscalePerson}
              >
                {isUpscalingPerson ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Melhorando imagem...
                  </>
                ) : (
                  <>✨ Melhorar com Gemini</>
                )}
              </Button>
            )}
          </div>

          {/* Person Transform */}
          {personCutout && (
            <div className="space-y-3 p-3 rounded-lg border border-border bg-muted/30">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{thumbModel === 'duas-pessoas' ? 'Ajuste pessoa (direita)' : 'Ajuste da pessoa'}</Label>
                <div className="flex items-center gap-2">
                  <Switch checked={showPerson1Adjust} onCheckedChange={setShowPerson1Adjust} />
                  <button onClick={() => onPersonTransformChange({ x: 0, y: 0, scale: 1, rotation: 0 })} className="text-muted-foreground hover:text-foreground transition-colors" title="Redefinir">
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              {showPerson1Adjust && (
                <>
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
                </>
              )}
            </div>
          )}
        </>
      )}

      {/* Person 2 Upload — only for duas-pessoas model */}
      {thumbModel === 'duas-pessoas' && (
        <>
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
            {/* Botão Gemini Upscale para pessoa 2 */}
            {person2Cutout && onUpscalePerson2 && (
              <Button
                variant="outline"
                className="w-full border-primary/40 text-primary hover:bg-primary/10"
                disabled={isUpscalingPerson2}
                onClick={onUpscalePerson2}
              >
                {isUpscalingPerson2 ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Melhorando imagem...
                  </>
                ) : (
                  <>✨ Melhorar com Gemini</>
                )}
              </Button>
            )}
          </div>
          {person2Cutout && (
            <div className="space-y-3 p-3 rounded-lg border border-border bg-muted/30">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ajuste pessoa (esquerda)</Label>
                <div className="flex items-center gap-2">
                  <Switch checked={showPerson2Adjust} onCheckedChange={setShowPerson2Adjust} />
                  <button onClick={() => onPerson2TransformChange({ x: 0, y: 0, scale: 1, rotation: 0 })} className="text-muted-foreground hover:text-foreground transition-colors" title="Redefinir">
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              {showPerson2Adjust && (
                <>
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
                </>
              )}
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
                <div className="flex items-center gap-2">
                  <Switch checked={showMeioLeftAdjust} onCheckedChange={setShowMeioLeftAdjust} />
                  <button onClick={() => onPersonTransformChange({ x: 0, y: 0, scale: 1, rotation: 0 })} className="text-muted-foreground hover:text-foreground transition-colors" title="Redefinir">
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              {showMeioLeftAdjust && (
                <>
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
                </>
              )}
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
                <div className="flex items-center gap-2">
                  <Switch checked={showMeioRightAdjust} onCheckedChange={setShowMeioRightAdjust} />
                  <button onClick={() => onPerson2TransformChange({ x: 0, y: 0, scale: 1, rotation: 0 })} className="text-muted-foreground hover:text-foreground transition-colors" title="Redefinir">
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              {showMeioRightAdjust && (
                <>
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
                </>
              )}
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

      {/* Text box Y position slider — all models */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="font-semibold">Posição Y do texto</Label>
          <span className="text-xs text-muted-foreground">{textBoxHeight}%</span>
        </div>
        <Slider
          value={[textBoxHeight]}
          onValueChange={([h]) => onTextBoxHeightChange(h)}
          min={0}
          max={60}
          step={1}
          className="mt-1"
        />
      </div>

      {/* Background upload — only for so-lettering */}
      {thumbModel === 'so-lettering' && (
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
      )}

      {/* Actions */}
      <div className="pt-2">
        <Button className="w-full" onClick={handleExport}>
          <Download className="w-4 h-4 mr-2" />
          Exportar JPG
        </Button>
      </div>
    </div>
  );
};
