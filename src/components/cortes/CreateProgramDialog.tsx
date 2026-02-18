import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CreateProgramDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

export const CreateProgramDialog = ({ open, onOpenChange, onCreated }: CreateProgramDialogProps) => {
  const [name, setName] = useState('');
  const [fontFile, setFontFile] = useState<File | null>(null);
  const [bgFile, setBgFile] = useState<File | null>(null);
  const [logosFile, setLogosFile] = useState<File | null>(null);
  const [textColor, setTextColor] = useState('#F1E8D5');
  const [strokeColor, setStrokeColor] = useState('#0C0C20');
  const [pipBorderColor, setPipBorderColor] = useState('#D02046');
  const [highlightColor, setHighlightColor] = useState('#D02046');
  const [saving, setSaving] = useState(false);

  const uploadFile = async (file: File, folder: string): Promise<string | null> => {
    const ext = file.name.split('.').pop();
    const path = `${folder}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from('cortes-assets').upload(path, file);
    if (error) {
      console.error('Upload error:', error);
      return null;
    }
    const { data: urlData } = supabase.storage.from('cortes-assets').getPublicUrl(path);
    return urlData.publicUrl;
  };

  const handleSave = async () => {
    if (!name.trim()) { toast.error('Dê um nome ao programa'); return; }
    if (!bgFile) { toast.error('Anexe a imagem de fundo (KV)'); return; }
    if (!logosFile) { toast.error('Anexe a imagem de logos'); return; }

    setSaving(true);
    try {
      const [fontUrl, bgUrl, logosUrl] = await Promise.all([
        fontFile ? uploadFile(fontFile, 'fonts') : Promise.resolve(null),
        uploadFile(bgFile, 'backgrounds'),
        uploadFile(logosFile, 'logos'),
      ]);

      if (!bgUrl || !logosUrl) throw new Error('Falha no upload dos arquivos');

      const fontFamily = fontFile ? `CustomFont-${crypto.randomUUID().slice(0, 8)}` : null;

      const { error } = await supabase.from('cortes_programs').insert({
        name: name.trim(),
        thumb_type: 'pip',
        font_url: fontUrl,
        font_family: fontFamily,
        bg_url: bgUrl,
        logos_url: logosUrl,
        text_color: textColor,
        stroke_color: strokeColor,
        pip_border_color: pipBorderColor,
        highlight_color: highlightColor,
      });

      if (error) throw error;

      toast.success('Programa criado!');
      resetForm();
      onCreated();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Erro ao salvar programa');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setName('');
    setFontFile(null);
    setBgFile(null);
    setLogosFile(null);
    setTextColor('#F1E8D5');
    setStrokeColor('#0C0C20');
    setPipBorderColor('#D02046');
    setHighlightColor('#D02046');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Programa</DialogTitle>
          <DialogDescription>Configure o nome, assets e cores do novo programa de cortes.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Name */}
          <div className="space-y-1.5">
            <Label>Nome do programa</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Geral CazéTV" />
          </div>

          {/* Thumb type */}
          <div className="space-y-1.5">
            <Label>Tipo de thumb</Label>
            <div className="text-sm text-muted-foreground bg-muted rounded-md px-3 py-2">Corte com PIP</div>
          </div>

          {/* Font upload */}
          <div className="space-y-1.5">
            <Label>Fonte personalizada (.ttf/.otf) — opcional</Label>
            <FileUploadButton file={fontFile} onFile={setFontFile} accept=".ttf,.otf" label="Fonte" />
          </div>

          {/* BG upload */}
          <div className="space-y-1.5">
            <Label>Imagem de fundo (KV) *</Label>
            <FileUploadButton file={bgFile} onFile={setBgFile} accept="image/*" label="Fundo" />
          </div>

          {/* Logos upload */}
          <div className="space-y-1.5">
            <Label>Imagem de logos *</Label>
            <FileUploadButton file={logosFile} onFile={setLogosFile} accept="image/*" label="Logos" />
          </div>

          {/* Colors */}
          <div className="grid grid-cols-2 gap-3">
            <ColorPicker label="Cor do texto" value={textColor} onChange={setTextColor} />
            <ColorPicker label="Cor do traçado" value={strokeColor} onChange={setStrokeColor} />
            <ColorPicker label="Borda PIP" value={pipBorderColor} onChange={setPipBorderColor} />
            <ColorPicker label="Texto destaque" value={highlightColor} onChange={setHighlightColor} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={saving}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const FileUploadButton = ({ file, onFile, accept, label }: { file: File | null; onFile: (f: File) => void; accept: string; label: string }) => (
  <label className="flex items-center gap-2 cursor-pointer border border-input rounded-md px-3 py-2 hover:bg-muted/50 transition-colors">
    <Upload className="w-4 h-4 text-muted-foreground shrink-0" />
    <span className="text-sm truncate">{file ? file.name : `Upload ${label}`}</span>
    <input type="file" accept={accept} className="hidden" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
  </label>
);

const ColorPicker = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
  <div className="space-y-1.5">
    <Label className="text-xs">{label}</Label>
    <div className="flex items-center gap-2">
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent" />
      <span className="text-xs text-muted-foreground font-mono">{value}</span>
    </div>
  </div>
);
