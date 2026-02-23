import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { FileUploadButton, ColorPicker } from './CreateProgramDialog';
import type { CortesProgram } from '@/pages/CortesHub';

interface EditProgramDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  program: CortesProgram;
  onSaved: () => void;
}

export const EditProgramDialog = ({ open, onOpenChange, program, onSaved }: EditProgramDialogProps) => {
  const [name, setName] = useState(program.name);
  const [fontFile, setFontFile] = useState<File | null>(null);
  const [bgFile, setBgFile] = useState<File | null>(null);
  const [logosFile, setLogosFile] = useState<File | null>(null);
  const [textColor, setTextColor] = useState(program.text_color);
  const [strokeColor, setStrokeColor] = useState(program.stroke_color);
  const [pipBorderColor, setPipBorderColor] = useState(program.pip_border_color);
  const [highlightColor, setHighlightColor] = useState(program.highlight_color);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setName(program.name);
      setTextColor(program.text_color);
      setStrokeColor(program.stroke_color);
      setPipBorderColor(program.pip_border_color);
      setHighlightColor(program.highlight_color);
      setFontFile(null);
      setBgFile(null);
      setLogosFile(null);
    }
  }, [open, program]);

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

    setSaving(true);
    try {
      const [fontUrl, bgUrl, logosUrl] = await Promise.all([
        fontFile ? uploadFile(fontFile, 'fonts') : Promise.resolve(null),
        bgFile ? uploadFile(bgFile, 'backgrounds') : Promise.resolve(null),
        logosFile ? uploadFile(logosFile, 'logos') : Promise.resolve(null),
      ]);

      const updates: Record<string, any> = {
        name: name.trim(),
        text_color: textColor,
        stroke_color: strokeColor,
        pip_border_color: pipBorderColor,
        highlight_color: highlightColor,
      };

      if (bgUrl) updates.bg_url = bgUrl;
      if (logosUrl) updates.logos_url = logosUrl;
      if (fontUrl) {
        updates.font_url = fontUrl;
        updates.font_family = `CustomFont-${crypto.randomUUID().slice(0, 8)}`;
      }

      const { error } = await supabase.from('cortes_programs').update(updates).eq('id', program.id);
      if (error) throw error;

      toast.success('Programa atualizado!');
      onSaved();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Programa</DialogTitle>
          <DialogDescription>Altere nome, cores e assets do programa.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Nome do programa</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label>Fonte personalizada (.ttf/.otf) — opcional</Label>
            <FileUploadButton file={fontFile} onFile={setFontFile} accept=".ttf,.otf" label={program.font_url ? 'Trocar Fonte' : 'Fonte'} />
            {program.font_url && !fontFile && <span className="text-xs text-muted-foreground">Fonte atual mantida</span>}
          </div>

          <div className="space-y-1.5">
            <Label>Imagem de fundo (KV)</Label>
            <FileUploadButton file={bgFile} onFile={setBgFile} accept="image/*" label={program.bg_url ? 'Trocar Fundo' : 'Fundo'} />
            {program.bg_url && !bgFile && <span className="text-xs text-muted-foreground">Fundo atual mantido</span>}
          </div>

          <div className="space-y-1.5">
            <Label>Imagem de logos</Label>
            <FileUploadButton file={logosFile} onFile={setLogosFile} accept="image/*" label={program.logos_url ? 'Trocar Logos' : 'Logos'} />
            {program.logos_url && !logosFile && <span className="text-xs text-muted-foreground">Logos atual mantida</span>}
          </div>

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
