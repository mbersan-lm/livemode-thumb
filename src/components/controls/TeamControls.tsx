import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { teamsBrasileirao } from '@/data/teams';
import { teamsLigue1 } from '@/data/teamsLigue1';
import { teamsBundesliga } from '@/data/teamsBundesliga';
import { teamsSerieA } from '@/data/teamsSerieA';
import { teamsPaulistao } from '@/data/teamsPaulistao';
import { teamsEuropaLeague } from '@/data/teamsEuropaLeague';
import { MatchData } from '@/types/thumbnail';
import { TemplateType } from '@/data/templates';
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
}

export const TeamControls = ({ matchData, onMatchDataChange, template }: TeamControlsProps) => {
  const currentTeams = 
    template === 'brasileirao' ? teamsBrasileirao : 
    template === 'bundesliga' ? teamsBundesliga :
    template === 'seriea' ? teamsSerieA :
    template === 'paulistao' ? teamsPaulistao :
    template === 'europaleague' ? teamsEuropaLeague :
    teamsLigue1;
  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="home-team">Home Team</Label>
        <Select 
          value={matchData.homeTeamId || ''} 
          onValueChange={(homeTeamId) => onMatchDataChange({ homeTeamId })}
        >
          <SelectTrigger id="home-team" className="mt-2">
            <SelectValue placeholder="Select home team" />
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
        <Label htmlFor="away-team">Away Team</Label>
        <Select 
          value={matchData.awayTeamId || ''} 
          onValueChange={(awayTeamId) => onMatchDataChange({ awayTeamId })}
        >
          <SelectTrigger id="away-team" className="mt-2">
            <SelectValue placeholder="Select away team" />
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

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
        <div>
          <Label htmlFor="home-score">Home Score</Label>
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
          <Label htmlFor="away-score">Away Score</Label>
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
    </div>
  );
};
