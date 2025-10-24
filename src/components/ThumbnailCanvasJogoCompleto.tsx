import { forwardRef } from 'react';
import { teamsBrasileirao } from '@/data/teams';
import { teamsLigue1 } from '@/data/teamsLigue1';
import { teamsBundesliga } from '@/data/teamsBundesliga';
import { teamsSerieA } from '@/data/teamsSerieA';
import { PhotoTransform, MatchData } from '@/types/thumbnail';
import { TemplateType } from '@/data/templates';

interface ThumbnailCanvasJogoCompletoProps {
  playerPhoto: string | null;
  photoTransform: PhotoTransform;
  matchData: MatchData;
  template: TemplateType;
}

export const ThumbnailCanvasJogoCompleto = forwardRef<HTMLDivElement, ThumbnailCanvasJogoCompletoProps>(
  ({ playerPhoto, photoTransform, matchData, template }, ref) => {
    const currentTeams = 
      template === 'brasileirao' ? teamsBrasileirao : 
      template === 'bundesliga' ? teamsBundesliga :
      template === 'seriea' ? teamsSerieA :
      teamsLigue1;
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
        id="CANVAS_JOGO_COMPLETO"
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
            id="PLAYER_PHOTO_JC"
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

        {/* KV Background - Jogo Completo */}
        <img 
          src="/kv/kv-jogo-completo.png" 
          alt="Background KV Jogo Completo"
          className="absolute left-0 top-0 pointer-events-none"
          style={{ height: '720px', objectFit: 'contain', objectPosition: 'left', zIndex: 10 }}
        />

        {/* Team Crests Only - No Scores */}
        {homeTeam && awayTeam && (
          <div 
            id="MATCH_ROW_JC"
            className={`absolute left-[22px] ${template === 'ligue1' || template === 'bundesliga' || template === 'seriea' ? '-top-[20px]' : 'top-[5px]'} flex items-center gap-[70px]`}
            style={{ 
              zIndex: 20,
              transform: 'none'
            }}
          >
            {/* Home Crest */}
            <img 
              id="HOME_CREST_JC"
              src={homeTeam.crest_url}
              alt={homeTeam.name}
              className="h-auto w-auto max-w-[322px] max-h-[322px] object-contain"
            />

            {/* Away Crest */}
            <img 
              id="AWAY_CREST_JC"
              src={awayTeam.crest_url}
              alt={awayTeam.name}
              className="h-auto w-auto max-w-[322px] max-h-[322px] object-contain"
            />
          </div>
        )}
      </div>
    );
  }
);

ThumbnailCanvasJogoCompleto.displayName = 'ThumbnailCanvasJogoCompleto';
