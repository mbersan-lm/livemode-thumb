import { useParams, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CortesThumbBuilder } from '@/components/cortes/CortesThumbBuilder';
import type { CortesProgram } from './CortesHub';

const CortesProgramBuilder = () => {
  const { id } = useParams<{ id: string }>();
  const [program, setProgram] = useState<CortesProgram | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      const { data, error } = await supabase
        .from('cortes_programs')
        .select('*')
        .eq('id', id)
        .single();
      if (error || !data) {
        setNotFound(true);
      } else {
        setProgram(data as CortesProgram);
        // Load custom font if exists
        if (data.font_url && data.font_family) {
          try {
            const font = new FontFace(data.font_family, `url(${data.font_url})`);
            await font.load();
            document.fonts.add(font);
          } catch (e) {
            console.error('Font load error:', e);
          }
        }
      }
      setLoading(false);
    };
    fetch();
  }, [id]);

  if (notFound) return <Navigate to="/cortes" replace />;
  if (loading) return <div className="h-screen bg-background flex items-center justify-center text-muted-foreground">Carregando...</div>;

  return (
    <CortesThumbBuilder
      programName={program!.name}
      bgImage={program!.bg_url || undefined}
      logosImage={program!.logos_url || undefined}
      logosNegativeImage={
        program!.name === 'Geral CazéTv' || program!.name === 'Geral CazéTv Brasil'
          ? '/cortes/logos-geral-negativa.png'
          : program!.name === 'Live CazéTv'
            ? '/cortes/logos-live-negativa.png'
            : program!.name === 'Roda de Bobo'
              ? '/cortes/logos-corte-negativo.png'
              : undefined
      }
      allowJogoV1={program!.name === 'Roda de Bobo'}
      allowChamadaPrincipal={program!.name === 'Geral CazéTv' || program!.name === 'Geral CazéTv Brasil'}
      divisoriaImage={program!.name === 'Geral CazéTv Brasil' ? '/cortes/divisoria-brasil.png' : undefined}
      textColor={program!.text_color}
      strokeColor={program!.stroke_color}
      pipBorderColor={program!.pip_border_color}
      highlightColor={program!.highlight_color}
      customFontFamily={program!.font_family || undefined}
      allowAllModels={program!.name === 'Geral CazéTv' || program!.name === 'Geral CazéTv Brasil'}
      backUrl="/cortes"
    />
  );
};

export default CortesProgramBuilder;
