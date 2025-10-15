import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { teams } from '@/data/teams';
import { MatchData } from '@/types/thumbnail';
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
}

export const TeamControls = ({ matchData, onMatchDataChange }: TeamControlsProps) => {
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
            {teams.map((team) => (
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
            {teams.map((team) => (
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
