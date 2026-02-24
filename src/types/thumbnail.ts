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
  homeScoreSmall: number;
  awayScoreSmall: number;
  showSmallScore: boolean;
}

export interface ThumbnailState {
  playerPhoto: string | null;
  photoTransform: PhotoTransform;
  jogoCompletoPhoto: string | null;
  jogoCompletoPhotoTransform: PhotoTransform;
  aoVivoImage1: string | null;
  aoVivoImage2: string | null;
  aoVivoTransform1: PhotoTransform;
  aoVivoTransform2: PhotoTransform;
  initialScaleAoVivo1: number;
  initialScaleAoVivo2: number;
  matchData: MatchData;
  initialScale: number;
  initialScaleJogoCompleto: number;
  template: 'brasileirao' | 'ligue1' | 'bundesliga' | 'seriea' | 'paulistao' | 'europaleague';
}
