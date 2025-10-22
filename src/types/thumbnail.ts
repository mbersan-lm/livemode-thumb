export interface PhotoTransform {
  x: number;
  y: number;
  scale: number;
  scaleX: number;
  scaleY: number;
}

export interface MatchData {
  homeTeamId: string | null;
  awayTeamId: string | null;
  homeScore: number;
  awayScore: number;
}

export interface ThumbnailState {
  playerPhoto: string | null;
  photoTransform: PhotoTransform;
  matchData: MatchData;
  initialScale: number;
  template: 'brasileirao' | 'ligue1' | 'bundesliga';
}
