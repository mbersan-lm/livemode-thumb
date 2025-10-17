import { forwardRef } from 'react';
import { teamsBrasileirao } from '@/data/teams';
import { teamsLigue1 } from '@/data/teamsLigue1';
import { PhotoTransform, MatchData } from '@/types/thumbnail';
import { templates, TemplateType } from '@/data/templates';

interface ThumbnailCanvasProps {
  playerPhoto: string | null;
  photoTransform: PhotoTransform;
  matchData: MatchData;
  template: TemplateType;
}

export const ThumbnailCanvas = forwardRef<HTMLDivElement, ThumbnailCanvasProps>(
  ({ playerPhoto, photoTransform, matchData, template }, ref) => {
    const config = templates[template];
    const currentTeams = template === 'brasileirao' ? teamsBrasileirao : teamsLigue1;
    const homeTeam = currentTeams.find(t => t.id === matchData.homeTeamId);
    const awayTeam = currentTeams.find(t => t.id === matchData.awayTeamId);

    const photoStyle = {
      transform: `
        translate(-50%, -50%)
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
        id="CANVAS_1280x720"
        className="relative bg-black"
        style={{ 
          width: '1280px', 
          height: '720px', 
          overflow: 'hidden',
          boxSizing: 'content-box',
          transform: 'none'
        }}
      >
        {/* Player Photo Layer - Behind everything */}
        {playerPhoto && (
          <img 
            id="PLAYER_PHOTO"
            src={playerPhoto}
            alt="Player"
            className="absolute"
            style={{
              left: '50%',
              top: '50%',
              maxWidth: 'none',
              maxHeight: 'none',
              objectFit: 'unset',
              transformOrigin: 'center center',
              zIndex: 0,
              ...photoStyle,
            }}
          />
        )}

        {/* KV Background - On top of photo */}
        <img 
          src={config.kvPath} 
          alt="Background KV"
          className="absolute left-0 top-0 pointer-events-none"
          style={{ width: '1280px', height: '720px', objectFit: 'contain', zIndex: 10 }}
        />

        {/* Match Info Group - On top of everything */}
        {homeTeam && awayTeam && (
          <div 
            id="MATCH_ROW"
            className="absolute left-[22px] top-[360px] flex items-center gap-[34px]"
            style={{ 
              zIndex: 20,
              transform: 'none'
            }}
          >
            {/* Home Crest */}
            <img 
              id="HOME_CREST"
              src={homeTeam.crest_url}
              alt={homeTeam.name}
              className="h-auto w-auto max-w-[216px] max-h-[216px] object-contain -mr-[42px]"
            />

            {/* Scores */}
            <div className="flex items-center gap-4">
              <div 
                id="HOME_SCORE"
                className="text-white font-bold"
                style={{ 
                  fontFamily: config.fontFamily,
                  fontSize: config.scoreFontSize,
                  lineHeight: '1',
                  letterSpacing: '-0.01em'
                }}
              >
                {matchData.homeScore}
              </div>
              <div 
                id="X_CHAR"
                className="text-[#C9FF2E] font-bold"
                style={{ 
                  fontFamily: config.fontFamily,
                  fontSize: config.xFontSize,
                  lineHeight: '1',
                  letterSpacing: '-0.01em'
                }}
              >
                x
              </div>
              <div 
                id="AWAY_SCORE"
                className="text-white font-bold"
                style={{ 
                  fontFamily: config.fontFamily,
                  fontSize: config.scoreFontSize,
                  lineHeight: '1',
                  letterSpacing: '-0.01em'
                }}
              >
                {matchData.awayScore}
              </div>
            </div>

            {/* Away Crest */}
            <img 
              id="AWAY_CREST"
              src={awayTeam.crest_url}
              alt={awayTeam.name}
              className="h-auto w-auto max-w-[216px] max-h-[216px] object-contain -ml-[42px]"
            />
          </div>
        )}
      </div>
    );
  }
);

ThumbnailCanvas.displayName = 'ThumbnailCanvas';
