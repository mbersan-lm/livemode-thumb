import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { teams } from '@/data/teams';
import { MatchData } from '@/types/thumbnail';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';

interface ExportControlsProps {
  canvasRef: React.RefObject<HTMLDivElement>;
  matchData: MatchData;
}

export const ExportControls = ({ canvasRef, matchData }: ExportControlsProps) => {
  const handleExport = async () => {
    if (!canvasRef.current) {
      toast.error('Canvas not ready');
      return;
    }

    try {
      toast.loading('Generating PNG...');
      
      const canvas = await html2canvas(canvasRef.current, {
        width: 1280,
        height: 720,
        scale: 1,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#000000',
      });

      const homeTeam = teams.find(t => t.id === matchData.homeTeamId);
      const awayTeam = teams.find(t => t.id === matchData.awayTeamId);
      
      const filename = `MM_${homeTeam?.slug || 'home'}_${awayTeam?.slug || 'away'}_${matchData.homeScore}x${matchData.awayScore}.png`;

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          link.click();
          URL.revokeObjectURL(url);
          toast.success('PNG exported successfully!');
        }
      }, 'image/png');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export PNG');
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-4 bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground mb-2">Export Settings</p>
        <ul className="text-sm space-y-1">
          <li>• Resolution: 1280 × 720 px</li>
          <li>• Format: PNG</li>
          <li>• Quality: Maximum</li>
        </ul>
      </div>

      <Button 
        onClick={handleExport}
        className="w-full"
        size="lg"
      >
        <Download className="w-4 h-4 mr-2" />
        Export PNG
      </Button>
    </div>
  );
};
