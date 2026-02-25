import { forwardRef } from 'react';
import { Team, teamsBrasileirao } from '@/data/teams';
import { teamsLigue1 } from '@/data/teamsLigue1';
import { teamsBundesliga } from '@/data/teamsBundesliga';
import { teamsSerieA } from '@/data/teamsSerieA';
import { teamsPaulistao } from '@/data/teamsPaulistao';
import { teamsEuropaLeague } from '@/data/teamsEuropaLeague';
import { PhotoTransform, MatchData } from '@/types/thumbnail';
import { templates, TemplateType } from '@/data/templates';

interface ThumbnailCanvasJogoCompletoProps {
  playerPhoto: string | null;
  photoTransform: PhotoTransform;
  matchData: MatchData;
  template: TemplateType;
}

export const ThumbnailCanvasJogoCompleto = forwardRef<HTMLDivElement, ThumbnailCanvasJogoCompletoProps>(
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
          src={config.kvJogoCompletoPath} 
          alt="Background KV Jogo Completo"
          className="absolute left-0 top-0 pointer-events-none"
          style={{ height: '720px', objectFit: 'contain', objectPosition: 'left', zIndex: 10 }}
        />

        {/* Team Crests Only - No Scores */}
        {homeTeam && awayTeam && (
          <div 
            id="MATCH_ROW_JC"
            className={`absolute -left-[3px] ${template === 'ligue1' || template === 'bundesliga' || template === 'seriea' || template === 'paulistao' || template === 'europaleague' ? '-top-[20px]' : '-top-[15px]'} flex items-center`}
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
              className="h-auto w-auto object-contain"
              style={{ maxWidth: `${homeTeam.jcMaxSize ?? 322}px`, maxHeight: `${homeTeam.jcMaxSize ?? 322}px`, transform: [homeTeam.jcOffsetX ? `translateX(${homeTeam.jcOffsetX}px)` : '', homeTeam.jcOffsetY ? `translateY(${homeTeam.jcOffsetY}px)` : ''].filter(Boolean).join(' ') || undefined }}
            />

            {/* Away Crest */}
            <img 
              id="AWAY_CREST_JC"
              src={awayTeam.crest_url}
              alt={awayTeam.name}
              className="h-auto w-auto object-contain -ml-[70px]"
              style={{ maxWidth: `${awayTeam.jcMaxSize ?? 322}px`, maxHeight: `${awayTeam.jcMaxSize ?? 322}px`, transform: [awayTeam.jcOffsetX ? `translateX(${awayTeam.jcOffsetX}px)` : '', awayTeam.jcOffsetY ? `translateY(${awayTeam.jcOffsetY}px)` : ''].filter(Boolean).join(' ') || undefined }}
            />
          </div>
        )}
      </div>
    );
  }
);

ThumbnailCanvasJogoCompleto.displayName = 'ThumbnailCanvasJogoCompleto';
