import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { teamsBrasileirao } from '@/data/teams';
import { teamsLigue1 } from '@/data/teamsLigue1';
import { teamsBundesliga } from '@/data/teamsBundesliga';
import { teamsSerieA } from '@/data/teamsSerieA';
import { teamsPaulistao } from '@/data/teamsPaulistao';
import { teamsEuropaLeague } from '@/data/teamsEuropaLeague';
import { teamsAoVivo } from '@/data/teamsAoVivo';
import { MatchData } from '@/types/thumbnail';
import { TemplateType } from '@/data/templates';
import { ActiveCanvas } from '@/components/controls/ViewControls';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TeamControlsProps {
  matchData: MatchData;
  onMatchDataChange: (data: Partial<MatchData>) => void;
  template: TemplateType;
  activeCanvas?: ActiveCanvas;
}

export const TeamControls = ({ matchData, onMatchDataChange, template, activeCanvas }: TeamControlsProps) => {
  const currentTeams = activeCanvas === 'av'
    ? teamsAoVivo
    : template === 'brasileirao' ? teamsBrasileirao : 
      template === 'bundesliga' ? teamsBundesliga :
      template === 'seriea' ? teamsSerieA :
      template === 'paulistao' ? teamsPaulistao :
      template === 'europaleague' ? teamsEuropaLeague :
      teamsLigue1;
  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="home-team">Time da Casa</Label>
        <Select 
          value={matchData.homeTeamId || ''} 
          onValueChange={(homeTeamId) => onMatchDataChange({ homeTeamId })}
        >
          <SelectTrigger id="home-team" className="mt-2">
            <SelectValue placeholder="Selecionar time da casa" />
          </SelectTrigger>
          <SelectContent>
            {currentTeams.map((team) => (
              <SelectItem key={team.id} value={team.id}>
                {team.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="away-team">Time Visitante</Label>
        <Select 
          value={matchData.awayTeamId || ''} 
          onValueChange={(awayTeamId) => onMatchDataChange({ awayTeamId })}
        >
          <SelectTrigger id="away-team" className="mt-2">
            <SelectValue placeholder="Selecionar time visitante" />
          </SelectTrigger>
          <SelectContent>
            {currentTeams.map((team) => (
              <SelectItem key={team.id} value={team.id}>
                {team.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {activeCanvas !== 'av' && (
        <>
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
            <div>
              <Label htmlFor="home-score">Placar Casa</Label>
              <Input
                id="home-score"
                type="number"
                min="0"
                value={matchData.homeScore}
                onChange={(e) => onMatchDataChange({ homeScore: parseInt(e.target.value) || 0 })}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="away-score">Placar Visitante</Label>
              <Input
                id="away-score"
                type="number"
                min="0"
                value={matchData.awayScore}
                onChange={(e) => onMatchDataChange({ awayScore: parseInt(e.target.value) || 0 })}
                className="mt-2"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <Label htmlFor="small-score-switch">Pênaltis</Label>
            <Switch
              id="small-score-switch"
              checked={matchData.showSmallScore}
              onCheckedChange={(checked) => onMatchDataChange({ showSmallScore: checked })}
            />
          </div>

          {matchData.showSmallScore && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="home-score-small">Home (menor)</Label>
                <Input
                  id="home-score-small"
                  type="number"
                  min="0"
                  value={matchData.homeScoreSmall}
                  onChange={(e) => onMatchDataChange({ homeScoreSmall: parseInt(e.target.value) || 0 })}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="away-score-small">Visitante (menor)</Label>
                <Input
                  id="away-score-small"
                  type="number"
                  min="0"
                  value={matchData.awayScoreSmall}
                  onChange={(e) => onMatchDataChange({ awayScoreSmall: parseInt(e.target.value) || 0 })}
                  className="mt-2"
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
