import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ProgramCard } from '@/components/cortes/ProgramCard';
import { CreateProgramDialog } from '@/components/cortes/CreateProgramDialog';
import { Button } from '@/components/ui/button';
import { Plus, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export interface CortesProgram {
  id: string;
  name: string;
  thumb_type: string;
  font_url: string | null;
  font_family: string | null;
  bg_url: string | null;
  logos_url: string | null;
  text_color: string;
  stroke_color: string;
  pip_border_color: string;
  created_at: string;
}

const CortesHub = () => {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState<CortesProgram[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchPrograms = async () => {
    const { data, error } = await supabase
      .from('cortes_programs')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) {
      toast.error('Erro ao carregar programas');
      console.error(error);
    } else {
      setPrograms(data as CortesProgram[]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchPrograms(); }, []);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('cortes_programs').delete().eq('id', id);
    if (error) {
      toast.error('Erro ao excluir');
    } else {
      toast.success('Programa excluído');
      setPrograms(prev => prev.filter(p => p.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Cortes</h1>
            <p className="text-sm text-muted-foreground mt-1">Escolha um programa para gerar thumbnails</p>
          </div>
          <a href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Melhores Momentos
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Roda de Bobo — hardcoded */}
          <ProgramCard
            name="Roda de Bobo"
            thumbType="Corte com PIP"
            previewColors={{ text: '#F1E8D5', stroke: '#0C0C20', pip: '#D02046' }}
            onClick={() => navigate('/cortes/roda-de-bobo')}
          />

          {/* Custom programs from DB */}
          {programs.map(p => (
            <ProgramCard
              key={p.id}
              name={p.name}
              thumbType="Corte com PIP"
              previewColors={{ text: p.text_color, stroke: p.stroke_color, pip: p.pip_border_color }}
              onClick={() => navigate(`/cortes/${p.id}`)}
              onDelete={() => handleDelete(p.id)}
            />
          ))}

          {/* Add new */}
          <button
            onClick={() => setDialogOpen(true)}
            className="border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 p-8 text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors min-h-[160px]"
          >
            <Plus className="w-8 h-8" />
            <span className="text-sm font-medium">Novo Programa</span>
          </button>
        </div>

        {loading && <p className="text-muted-foreground text-center mt-8">Carregando...</p>}
      </div>

      <CreateProgramDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreated={() => { fetchPrograms(); setDialogOpen(false); }}
      />
    </div>
  );
};

export default CortesHub;
