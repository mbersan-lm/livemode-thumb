import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { teams } from '@/data/teams';
import { MatchData, PhotoTransform } from '@/types/thumbnail';
import { serverExport } from '@/lib/serverExport';
import { TemplateType } from '@/data/templates';
import { ActiveCanvas } from '@/components/controls/ViewControls';

interface ExportControlsProps {
  canvasRef: React.RefObject<HTMLDivElement>;
  canvasRefJogoCompleto: React.RefObject<HTMLDivElement>;
  matchData: MatchData;
  playerPhoto: string | null;
  photoTransform: PhotoTransform;
  jogoCompletoPhoto: string | null;
  jogoCompletoPhotoTransform: PhotoTransform;
  template: TemplateType;
  activeCanvas: ActiveCanvas;
}

export const ExportControls = ({
  matchData,
  playerPhoto,
  photoTransform,
  jogoCompletoPhoto,
  jogoCompletoPhotoTransform,
  template,
  activeCanvas,
}: ExportControlsProps) => {
  const handleExport = async () => {
    const homeTeam = teams.find(t => t.id === matchData.homeTeamId);
    const awayTeam = teams.find(t => t.id === matchData.awayTeamId);

    if (activeCanvas === 'jc') {
      const filename = `JC_${homeTeam?.slug || 'home'}_${awayTeam?.slug || 'away'}.jpg`;
      await serverExport('jogo-completo', {
        jogoCompletoPhoto,
        jogoCompletoPhotoTransform,
        matchData,
        template,
      }, filename);
    } else {
      const filename = `MM_${homeTeam?.slug || 'home'}_${awayTeam?.slug || 'away'}_${matchData.homeScore}x${matchData.awayScore}.jpg`;
      await serverExport('melhores-momentos', {
        playerPhoto,
        photoTransform,
        matchData,
        template,
      }, filename);
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-4 bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground mb-2">Configurações de Exportação</p>
        <ul className="text-sm space-y-1">
          <li>• Resolução: 1280 × 720 px</li>
          <li>• Formato: JPG</li>
          <li>• Qualidade: 90%</li>
        </ul>
      </div>

      <Button 
        onClick={handleExport}
        className="w-full"
        size="lg"
      >
        <Download className="w-4 h-4 mr-2" />
        Exportar
      </Button>
    </div>
  );
};
