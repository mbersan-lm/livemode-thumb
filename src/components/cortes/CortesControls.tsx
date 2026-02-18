import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Upload, Trash2, Download, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';

interface CortesControlsProps {
  pipImage: string | null;
  personCutout: string | null;
  thumbText: string;
  isRemovingBg: boolean;
  onPipUpload: (file: File) => void;
  onPersonUpload: (file: File) => void;
  onTextChange: (text: string) => void;
  onClear: () => void;
  canvasRef: React.RefObject<HTMLDivElement>;
}

export const CortesControls = ({
  pipImage,
  personCutout,
  thumbText,
  isRemovingBg,
  onPipUpload,
  onPersonUpload,
  onTextChange,
  onClear,
  canvasRef,
}: CortesControlsProps) => {
  const pipInputRef = useRef<HTMLInputElement>(null);
  const personInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    if (!canvasRef.current) {
      toast.error('Canvas not ready');
      return;
    }

    try {
      toast.loading('Gerando JPG...');
      await document.fonts.ready;

      const canvas = await html2canvas(canvasRef.current, {
        width: 1280,
        height: 720,
        scale: 1,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#0C0C20',
        logging: false,
        scrollX: 0,
        scrollY: 0,
        x: 0,
        y: 0,
        foreignObjectRendering: false,
        onclone: (clonedDoc) => {
          const el = clonedDoc.getElementById('CANVAS_CORTES');
          if (!el) return;
          let parent = el.parentElement;
          while (parent) {
            parent.style.transform = 'none';
            (parent.style as any).zoom = '1';
            (parent.style as any).scale = '1';
            parent = parent.parentElement;
          }
        },
      });

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
            toast.dismiss();
            toast.success('JPG exportado!');
          }
        },
        'image/jpeg',
        0.9
      );
    } catch (error) {
      console.error('Export error:', error);
      toast.dismiss();
      toast.error('Falha ao exportar JPG');
    }
  };

  return (
    <div className="space-y-5">
      {/* PIP Upload */}
      <div className="space-y-2">
        <Label>Imagem PIP (frame do jogo)</Label>
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

      {/* Person Upload */}
      <div className="space-y-2">
        <Label>Foto da pessoa</Label>
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

      {/* Text */}
      <div className="space-y-2">
        <Label>Texto da thumbnail</Label>
        <Textarea
          value={thumbText}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder="Digite o texto..."
          className="min-h-[80px]"
        />
      </div>

      {/* Actions */}
      <div className="space-y-2 pt-2">
        <Button onClick={handleExport} className="w-full" size="lg">
          <Download className="w-4 h-4 mr-2" />
          Baixar JPG
        </Button>
        <Button onClick={onClear} variant="ghost" className="w-full">
          <Trash2 className="w-4 h-4 mr-2" />
          Limpar tudo
        </Button>
      </div>
    </div>
  );
};
