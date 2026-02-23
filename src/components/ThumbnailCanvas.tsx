import { forwardRef } from 'react';
import { Team, teamsBrasileirao } from '@/data/teams';
import { teamsLigue1 } from '@/data/teamsLigue1';
import { teamsBundesliga } from '@/data/teamsBundesliga';
import { teamsSerieA } from '@/data/teamsSerieA';
import { teamsPaulistao } from '@/data/teamsPaulistao';
import { teamsEuropaLeague } from '@/data/teamsEuropaLeague';
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
    const currentTeams = 
      template === 'brasileirao' ? teamsBrasileirao : 
      template === 'bundesliga' ? teamsBundesliga :
      template === 'seriea' ? teamsSerieA :
      template === 'paulistao' ? teamsPaulistao :
      template === 'europaleague' ? teamsEuropaLeague :
      teamsLigue1;
    const homeTeam = currentTeams.find(t => t.id === matchData.homeTeamId) as Team | undefined;
    const awayTeam = currentTeams.find(t => t.id === matchData.awayTeamId) as Team | undefined;

    const photoStyle = {
      transform: `
        translate(-50%, -50%)
        translateX(${photoTransform.x}px)
        translateY(${photoTransform.y}px)
        scale(${photoTransform.scale})
        scaleX(${photoTransform.scaleX})
        scaleY(${photoTransform.scaleY})
      `.replace(/\s+/g, ' ').trim(),
      ...(photoTransform.x < -30 && {
        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 150px)',
        maskImage: 'linear-gradient(to right, transparent 0%, black 150px)',
      })
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
          style={{ height: '720px', objectFit: 'contain', objectPosition: 'left', zIndex: 10 }}
        />

        {/* Match Info Group - On top of everything */}
        {homeTeam && awayTeam && (
          <div 
            id="MATCH_ROW"
            className={`absolute left-[22px] ${template === 'ligue1' || template === 'bundesliga' || template === 'seriea' || template === 'paulistao' || template === 'europaleague' ? 'top-[335px]' : 'top-[360px]'} flex items-center gap-[34px]`}
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
              className="h-auto w-auto object-contain -mr-[42px]"
              style={{ maxWidth: `${homeTeam.maxSize ?? 216}px`, maxHeight: `${homeTeam.maxSize ?? 216}px` }}
            />

            {/* Scores */}
            <div className="flex flex-col items-center">
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
                  className="font-bold"
                  style={{ 
                    fontFamily: config.xFontFamily || config.fontFamily,
                    fontSize: config.xFontSize,
                    lineHeight: '1',
                    letterSpacing: '-0.01em',
                    color: config.xColor || '#C9FF2E',
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

              {matchData.showSmallScore && (
                <div 
                  className="flex items-center gap-3 text-white font-bold"
                  style={{
                    fontFamily: config.fontFamily,
                    fontSize: `${Math.round(parseInt(config.scoreFontSize) * 0.245)}px`,
                    lineHeight: '1',
                    marginTop: '4px',
                    transform: template === 'seriea' ? 'translateX(2%)' : template === 'brasileirao' ? 'translateX(-3%)' : template === 'bundesliga' ? 'translateX(-3%)' : template === 'paulistao' ? 'translateX(-3%)' : template === 'europaleague' ? 'translateX(-3%)' : 'translateX(-15%)',
                  }}
                >
                  <span>({matchData.homeScoreSmall})</span>
                  <span style={{ color: config.xColor || '#C9FF2E', fontFamily: config.xFontFamily || config.fontFamily, fontSize: `${Math.round(parseInt(config.xFontSize) * 0.21)}px` }}>x</span>
                  <span>({matchData.awayScoreSmall})</span>
                </div>
              )}
            </div>

            {/* Away Crest */}
            <img 
              id="AWAY_CREST"
              src={awayTeam.crest_url}
              alt={awayTeam.name}
              className="h-auto w-auto object-contain -ml-[42px]"
              style={{ maxWidth: `${awayTeam.maxSize ?? 216}px`, maxHeight: `${awayTeam.maxSize ?? 216}px` }}
            />
          </div>
        )}
      </div>
    );
  }
);

ThumbnailCanvas.displayName = 'ThumbnailCanvas';
