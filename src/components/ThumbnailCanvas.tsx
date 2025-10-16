import { forwardRef } from 'react';
import { teams } from '@/data/teams';
import { PhotoTransform, MatchData } from '@/types/thumbnail';

interface ThumbnailCanvasProps {
  playerPhoto: string | null;
  photoTransform: PhotoTransform;
  matchData: MatchData;
}

export const ThumbnailCanvas = forwardRef<HTMLDivElement, ThumbnailCanvasProps>(
  ({ playerPhoto, photoTransform, matchData }, ref) => {
    const homeTeam = teams.find(t => t.id === matchData.homeTeamId);
    const awayTeam = teams.find(t => t.id === matchData.awayTeamId);

    const photoStyle = {
      transform: `
        translateX(${photoTransform.x}px)
        translateY(${photoTransform.y}px)
        scale(${photoTransform.scale})
        scaleX(${photoTransform.scaleX})
        scaleY(${photoTransform.scaleY})
      `.replace(/\s+/g, ' ').trim(),
    };

    return (
      <div 
        ref={ref}
        className="relative bg-black"
        style={{ width: '1280px', height: '720px' }}
      >
        {/* Player Photo Layer - Behind everything */}
        {playerPhoto && (
          <div 
            id="PLAYER_PHOTO"
            className="absolute right-0 top-0 w-[640px] h-[720px] overflow-visible origin-center"
            style={{ zIndex: 0 }}
          >
            <img 
              src={playerPhoto}
              alt="Player"
              className="w-full h-full object-cover"
              style={photoStyle}
            />
          </div>
        )}

        {/* KV Background - On top of photo */}
        <img 
          src="/kv/kv.png" 
          alt="Background KV"
          className="absolute left-0 top-0 pointer-events-none"
          style={{ width: '1280px', height: '720px', zIndex: 10 }}
        />

        {/* Match Info Group - On top of everything */}
        {homeTeam && awayTeam && (
          <div 
            id="MATCH"
            className="absolute left-[80px] top-[360px] flex items-center gap-6"
            style={{ zIndex: 20 }}
          >
            {/* Home Crest */}
            <img 
              id="HOME_CREST"
              src={homeTeam.crest_url}
              alt={homeTeam.name}
              className="h-[100px] w-auto max-w-[140px] object-contain"
            />

            {/* Scores */}
            <div className="flex items-center gap-4">
              <div 
                id="HOME_SCORE"
                className="text-white text-[72px] font-bold leading-none"
                style={{ fontFamily: 'Tusker Grotesk, sans-serif' }}
              >
                {matchData.homeScore}
              </div>
              <div 
                id="X_CHAR"
                className="text-[#CCFF00] text-[48px] font-bold leading-none"
                style={{ fontFamily: 'Tusker Grotesk, sans-serif' }}
              >
                x
              </div>
              <div 
                id="AWAY_SCORE"
                className="text-white text-[72px] font-bold leading-none"
                style={{ fontFamily: 'Tusker Grotesk, sans-serif' }}
              >
                {matchData.awayScore}
              </div>
            </div>

            {/* Away Crest */}
            <img 
              id="AWAY_CREST"
              src={awayTeam.crest_url}
              alt={awayTeam.name}
              className="h-[100px] w-auto max-w-[140px] object-contain"
            />
          </div>
        )}
      </div>
    );
  }
);

ThumbnailCanvas.displayName = 'ThumbnailCanvas';
