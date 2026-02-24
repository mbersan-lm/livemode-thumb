import { forwardRef } from 'react';
import { Team, teamsBrasileirao } from '@/data/teams';
import { teamsLigue1 } from '@/data/teamsLigue1';
import { teamsBundesliga } from '@/data/teamsBundesliga';
import { teamsSerieA } from '@/data/teamsSerieA';
import { teamsPaulistao } from '@/data/teamsPaulistao';
import { teamsEuropaLeague } from '@/data/teamsEuropaLeague';
import { PhotoTransform, MatchData } from '@/types/thumbnail';
import { templates, TemplateType } from '@/data/templates';

interface ThumbnailCanvasAoVivoProps {
  playerPhoto: string | null;
  photoTransform: PhotoTransform;
  matchData: MatchData;
  template: TemplateType;
  gradientLeftColor: string;
  gradientRightColor: string;
}

export const ThumbnailCanvasAoVivo = forwardRef<HTMLDivElement, ThumbnailCanvasAoVivoProps>(
  ({ playerPhoto, photoTransform, matchData, template, gradientLeftColor, gradientRightColor }, ref) => {
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
        id="CANVAS_AO_VIVO"
        className="relative bg-black"
        style={{ 
          width: '1280px', 
          height: '720px', 
          overflow: 'hidden',
          boxSizing: 'content-box',
          transform: 'none'
        }}
      >
        {/* Player Photo Layer */}
        {playerPhoto && (
          <img 
            id="PLAYER_PHOTO_AV"
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

        {/* Left Gradient Overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 15,
            background: `linear-gradient(to right, ${gradientLeftColor} 0%, transparent 50%)`,
            mixBlendMode: 'overlay',
          }}
        />

        {/* Right Gradient Overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 15,
            background: `linear-gradient(to left, ${gradientRightColor} 0%, transparent 50%)`,
            mixBlendMode: 'overlay',
          }}
        />

        {/* KV Background - Ao Vivo */}
        <img 
          src="/kv/kv-ao-vivo.png"
          alt="Background KV Ao Vivo"
          className="absolute left-0 top-0 pointer-events-none"
          style={{ width: '1280px', height: '720px', objectFit: 'cover', zIndex: 10 }}
        />

        {/* Match Info */}
        {homeTeam && awayTeam && (
          <div 
            id="MATCH_ROW_AV"
            className="absolute left-[22px] top-[360px] flex items-center gap-[34px]"
            style={{ zIndex: 20, transform: 'none' }}
          >
            <img 
              src={homeTeam.crest_url}
              alt={homeTeam.name}
              className="h-auto w-auto object-contain -mr-[42px]"
              style={{ maxWidth: `${homeTeam.maxSize ?? 216}px`, maxHeight: `${homeTeam.maxSize ?? 216}px` }}
            />

            <div className="flex flex-col items-center">
              <div className="flex items-center gap-4">
                <div className="text-white font-bold" style={{ fontFamily: config.fontFamily, fontSize: config.scoreFontSize, lineHeight: '1', letterSpacing: '-0.01em' }}>
                  {matchData.homeScore}
                </div>
                <div className="font-bold" style={{ fontFamily: config.xFontFamily || config.fontFamily, fontSize: config.xFontSize, lineHeight: '1', letterSpacing: '-0.01em', color: config.xColor || '#C9FF2E' }}>
                  x
                </div>
                <div className="text-white font-bold" style={{ fontFamily: config.fontFamily, fontSize: config.scoreFontSize, lineHeight: '1', letterSpacing: '-0.01em' }}>
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
                  }}
                >
                  <span>({matchData.homeScoreSmall})</span>
                  <span style={{ color: config.xColor || '#C9FF2E', fontFamily: config.xFontFamily || config.fontFamily, fontSize: `${Math.round(parseInt(config.xFontSize) * 0.21)}px` }}>x</span>
                  <span>({matchData.awayScoreSmall})</span>
                </div>
              )}
            </div>

            <img 
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

ThumbnailCanvasAoVivo.displayName = 'ThumbnailCanvasAoVivo';
