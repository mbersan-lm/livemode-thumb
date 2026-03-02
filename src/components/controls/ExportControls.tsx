import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { teams } from '@/data/teams';
import { MatchData, PhotoTransform } from '@/types/thumbnail';
import { exportViaServer } from '@/lib/serverExport';
import { TemplateType } from '@/data/templates';

interface ExportControlsProps {
  canvasRef: React.RefObject<HTMLDivElement>;
  canvasRefJogoCompleto: React.RefObject<HTMLDivElement>;
  matchData: MatchData;
  // State needed for server export
  playerPhoto: string | null;
  photoTransform: PhotoTransform;
  jogoCompletoPhoto: string | null;
  jogoCompletoPhotoTransform: PhotoTransform;
  template: TemplateType;
}

export const ExportControls = ({
  canvasRef,
  canvasRefJogoCompleto,
  matchData,
  playerPhoto,
  photoTransform,
  jogoCompletoPhoto,
  jogoCompletoPhotoTransform,
  template,
}: ExportControlsProps) => {
  const handleExportMelhoresMomentos = async () => {
    const homeTeam = teams.find(t => t.id === matchData.homeTeamId);
    const awayTeam = teams.find(t => t.id === matchData.awayTeamId);
    const filename = `MM_${homeTeam?.slug || 'home'}_${awayTeam?.slug || 'away'}_${matchData.homeScore}x${matchData.awayScore}.png`;

    await exportViaServer('melhores-momentos', {
      playerPhoto,
      photoTransform,
      matchData,
      template,
    }, filename);
  };

  const handleExportJogoCompleto = async () => {
    const homeTeam = teams.find(t => t.id === matchData.homeTeamId);
    const awayTeam = teams.find(t => t.id === matchData.awayTeamId);
    const filename = `JC_${homeTeam?.slug || 'home'}_${awayTeam?.slug || 'away'}.png`;

    await exportViaServer('jogo-completo', {
      playerPhoto: jogoCompletoPhoto,
      photoTransform: jogoCompletoPhotoTransform,
      matchData,
      template,
    }, filename);
  };

  return (
    <div className="space-y-4">
      <div className="p-4 bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground mb-2">Configurações de Exportação</p>
        <ul className="text-sm space-y-1">
          <li>• Resolução: 1280 × 720 px</li>
          <li>• Formato: PNG (server-side)</li>
        </ul>
      </div>

      <div className="space-y-2">
        <Button 
          onClick={handleExportMelhoresMomentos}
          className="w-full"
          size="lg"
        >
          <Download className="w-4 h-4 mr-2" />
          Exportar Melhores Momentos
        </Button>

        <Button 
          onClick={handleExportJogoCompleto}
          className="w-full"
          size="lg"
          variant="secondary"
        >
          <Download className="w-4 h-4 mr-2" />
          Exportar Jogo Completo
        </Button>
      </div>
    </div>
  );
};
