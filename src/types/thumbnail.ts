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
  aoVivoPhoto: string | null;
  aoVivoPhotoTransform: PhotoTransform;
  aoVivoPhotoLeft: string | null;
  aoVivoPhotoLeftTransform: PhotoTransform;
  aoVivoPhotoRight: string | null;
  aoVivoPhotoRightTransform: PhotoTransform;
  matchData: MatchData;
  initialScale: number;
  initialScaleJogoCompleto: number;
  initialScaleAoVivo: number;
  initialScaleAoVivoLeft: number;
  initialScaleAoVivoRight: number;
  template: 'brasileirao' | 'ligue1' | 'bundesliga' | 'seriea' | 'paulistao' | 'europaleague';
}
