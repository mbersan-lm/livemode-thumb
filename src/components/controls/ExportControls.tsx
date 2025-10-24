import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { teams } from '@/data/teams';
import { MatchData } from '@/types/thumbnail';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';

interface ExportControlsProps {
  canvasRef: React.RefObject<HTMLDivElement>;
  canvasRefJogoCompleto: React.RefObject<HTMLDivElement>;
  matchData: MatchData;
}

export const ExportControls = ({ canvasRef, canvasRefJogoCompleto, matchData }: ExportControlsProps) => {
  const handleExportMelhoresMomentos = async () => {
    if (!canvasRef.current) {
      toast.error('Canvas not ready');
      return;
    }

    try {
      toast.loading('Generating Melhores Momentos JPG...');
      
      // Wait for fonts to load to avoid reflow
      await document.fonts.ready;
      
      // Get the exact position and size of the canvas element
      const rect = canvasRef.current.getBoundingClientRect();
      
      const canvas = await html2canvas(canvasRef.current, {
        width: 1280,
        height: 720,
        scale: 1,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#000000',
        logging: false,
        scrollX: 0,
        scrollY: 0,
        x: 0,
        y: 0,
        foreignObjectRendering: false,
        onclone: (clonedDoc) => {
          const canvas = clonedDoc.getElementById('CANVAS_1280x720');
          if (!canvas) return;
          
          // Neutralizar transforms dos ancestrais
          let parent = canvas.parentElement;
          while (parent) {
            parent.style.transform = 'none';
            (parent.style as any).zoom = '1';
            (parent.style as any).scale = '1';
            parent = parent.parentElement;
          }
          
          // Ajustar alinhamento vertical dos números apenas no export
          const homeScore = clonedDoc.getElementById('HOME_SCORE') as HTMLElement;
          const xChar = clonedDoc.getElementById('X_CHAR') as HTMLElement;
          const awayScore = clonedDoc.getElementById('AWAY_SCORE') as HTMLElement;
          
          // Aplicar translateY negativo para "levantar" os números
          const verticalAdjust = '-41px';
          
          if (homeScore) {
            homeScore.style.transform = `translateY(${verticalAdjust})`;
          }
          if (xChar) {
            xChar.style.transform = `translateY(${verticalAdjust})`;
          }
          if (awayScore) {
            awayScore.style.transform = `translateY(${verticalAdjust})`;
          }
        },
      });

      const homeTeam = teams.find(t => t.id === matchData.homeTeamId);
      const awayTeam = teams.find(t => t.id === matchData.awayTeamId);
      
      const filename = `MM_${homeTeam?.slug || 'home'}_${awayTeam?.slug || 'away'}_${matchData.homeScore}x${matchData.awayScore}.jpg`;

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          link.click();
          URL.revokeObjectURL(url);
          toast.success('Melhores Momentos JPG exported successfully!');
        }
      }, 'image/jpeg', 0.9);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export JPG');
    }
  };

  const handleExportJogoCompleto = async () => {
    if (!canvasRefJogoCompleto.current) {
      toast.error('Canvas not ready');
      return;
    }

    try {
      toast.loading('Generating Jogo Completo JPG...');
      
      await document.fonts.ready;
      
      const canvas = await html2canvas(canvasRefJogoCompleto.current, {
        width: 1280,
        height: 720,
        scale: 1,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#000000',
        logging: false,
        scrollX: 0,
        scrollY: 0,
        x: 0,
        y: 0,
        foreignObjectRendering: false,
        onclone: (clonedDoc) => {
          const canvas = clonedDoc.getElementById('CANVAS_JOGO_COMPLETO');
          if (!canvas) return;
          
          let parent = canvas.parentElement;
          while (parent) {
            parent.style.transform = 'none';
            (parent.style as any).zoom = '1';
            (parent.style as any).scale = '1';
            parent = parent.parentElement;
          }
        },
      });

      const homeTeam = teams.find(t => t.id === matchData.homeTeamId);
      const awayTeam = teams.find(t => t.id === matchData.awayTeamId);
      
      const filename = `JC_${homeTeam?.slug || 'home'}_${awayTeam?.slug || 'away'}.jpg`;

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          link.click();
          URL.revokeObjectURL(url);
          toast.success('Jogo Completo JPG exported successfully!');
        }
      }, 'image/jpeg', 0.9);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export Jogo Completo JPG');
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-4 bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground mb-2">Export Settings</p>
        <ul className="text-sm space-y-1">
          <li>• Resolution: 1280 × 720 px</li>
          <li>• Format: JPG</li>
          <li>• Quality: 90%</li>
        </ul>
      </div>

      <div className="space-y-2">
        <Button 
          onClick={handleExportMelhoresMomentos}
          className="w-full"
          size="lg"
        >
          <Download className="w-4 h-4 mr-2" />
          Export Melhores Momentos
        </Button>

        <Button 
          onClick={handleExportJogoCompleto}
          className="w-full"
          size="lg"
          variant="secondary"
        >
          <Download className="w-4 h-4 mr-2" />
          Export Jogo Completo
        </Button>
      </div>
    </div>
  );
};
