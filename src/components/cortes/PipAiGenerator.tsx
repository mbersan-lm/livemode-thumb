import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles, Paperclip, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const resizeImage = (dataUrl: string, maxSize = 512, quality = 0.7): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > maxSize || height > maxSize) {
        if (width > height) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        } else {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
};

interface PipAiGeneratorProps {
  onImageGenerated: (base64DataUrl: string) => void;
}

export const PipAiGenerator = ({ onImageGenerated }: PipAiGeneratorProps) => {
  const [prompt, setPrompt] = useState('');
  const [referenceImages, setReferenceImages] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAttachImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const dataUrl = ev.target?.result as string;
        try {
          const resized = await resizeImage(dataUrl);
          setReferenceImages((prev) => [...prev, resized]);
        } catch {
          setReferenceImages((prev) => [...prev, dataUrl]);
        }
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setReferenceImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Digite um prompt para gerar a imagem');
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('gemini-generate-pip', {
        body: {
          prompt: prompt.trim(),
          reference_images: referenceImages.length > 0 ? referenceImages : undefined,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const imageBase64 = data.image_base64;
      if (!imageBase64) throw new Error('Nenhuma imagem retornada');

      onImageGenerated(imageBase64);
      toast.success('Imagem gerada com sucesso!');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao gerar imagem com IA');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-3">
      <Label className="text-xs font-semibold flex items-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5" />
        Gerar PIP com IA
      </Label>

      <Textarea
        placeholder="Descreva a imagem... ex: campo de futebol lotado à noite com holofotes"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="min-h-[60px] text-xs resize-none"
        disabled={isGenerating}
      />

      {/* Reference images */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleAttachImages}
      />

      {referenceImages.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {referenceImages.map((img, i) => (
            <div key={i} className="relative w-12 h-12 rounded overflow-hidden border border-border">
              <img src={img} alt={`ref-${i}`} className="w-full h-full object-cover" />
              <button
                onClick={() => removeImage(i)}
                className="absolute top-0 right-0 bg-background/80 rounded-bl p-0.5"
                type="button"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="text-xs"
          onClick={() => fileInputRef.current?.click()}
          disabled={isGenerating}
          type="button"
        >
          <Paperclip className="w-3.5 h-3.5 mr-1" />
          Referência
        </Button>

        <Button
          size="sm"
          className="text-xs flex-1"
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          type="button"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
              Gerando...
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              Gerar com IA
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
