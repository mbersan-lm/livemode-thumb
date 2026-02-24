import { forwardRef } from 'react';
import { Team } from '@/data/teams';
import { teamsAoVivo } from '@/data/teamsAoVivo';
import { PhotoTransform, MatchData } from '@/types/thumbnail';
import { templates, TemplateType } from '@/data/templates';

interface ThumbnailCanvasAoVivoProps {
  playerPhoto: string | null;
  photoTransform: PhotoTransform;
  photoLeft: string | null;
  photoLeftTransform: PhotoTransform;
  photoRight: string | null;
  photoRightTransform: PhotoTransform;
  matchData: MatchData;
  template: TemplateType;
  gradientLeftColor: string;
  gradientRightColor: string;
  panelLeftColor: string;
  panelRightColor: string;
}

export const ThumbnailCanvasAoVivo = forwardRef<HTMLDivElement, ThumbnailCanvasAoVivoProps>(
  ({ playerPhoto, photoTransform, photoLeft, photoLeftTransform, photoRight, photoRightTransform, matchData, template, gradientLeftColor, gradientRightColor, panelLeftColor, panelRightColor }, ref) => {
    const config = templates[template];
    const currentTeams = teamsAoVivo;
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

    const photoLeftStyle = {
      transform: `
        translate(-50%, -50%)
        translateX(${photoLeftTransform.x}px)
        translateY(${photoLeftTransform.y}px)
        scale(${photoLeftTransform.scale})
        scaleX(${photoLeftTransform.scaleX})
        scaleY(${photoLeftTransform.scaleY})
      `.replace(/\s+/g, ' ').trim(),
    };

    const photoRightStyle = {
      transform: `
        translate(-50%, -50%)
        translateX(${photoRightTransform.x}px)
        translateY(${photoRightTransform.y}px)
        scale(${photoRightTransform.scale})
        scaleX(${photoRightTransform.scaleX})
        scaleY(${photoRightTransform.scaleY})
      `.replace(/\s+/g, ' ').trim(),
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

        {/* Left Photo Layer - behind panels, above base */}
        {photoLeft && (
          <img 
            src={photoLeft}
            alt="Left player"
            className="absolute"
            style={{
              left: '25%',
              top: '50%',
              maxWidth: 'none',
              maxHeight: 'none',
              objectFit: 'unset',
              transformOrigin: 'center center',
              zIndex: 5,
              ...photoLeftStyle,
            }}
          />
        )}

        {/* Right Photo Layer - behind panels, above base */}
        {photoRight && (
          <img 
            src={photoRight}
            alt="Right player"
            className="absolute"
            style={{
              left: '75%',
              top: '50%',
              maxWidth: 'none',
              maxHeight: 'none',
              objectFit: 'unset',
              transformOrigin: 'center center',
              zIndex: 5,
              ...photoRightStyle,
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

        {/* Overlay PNG above gradients */}
        <img
          src="/kv/overlay-ao-vivo-panels.png"
          alt="Overlay panels"
          className="absolute left-0 top-0 pointer-events-none"
          style={{ width: '1280px', height: '720px', objectFit: 'cover', zIndex: 17 }}
        />

        {/* Glass Panel Left */}
        <div
          className="absolute pointer-events-none"
          style={{
            left: '291px',
            top: '319px',
            width: '334px',
            height: '437px',
            backgroundColor: `${panelLeftColor}33`,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid white',
            borderRadius: '12px',
            zIndex: 16,
          }}
        />

        {/* Glass Panel Right */}
        <div
          className="absolute pointer-events-none"
          style={{
            left: '655px',
            top: '319px',
            width: '334px',
            height: '437px',
            backgroundColor: `${panelRightColor}33`,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid white',
            borderRadius: '12px',
            zIndex: 16,
          }}
        />

        {/* Glass Panel Bottom-Left (Black) */}
        <div
          className="absolute pointer-events-none"
          style={{
            left: '-30px',
            bottom: '-5%',
            width: '280px',
            height: '145px',
            backgroundColor: '#00000033',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid white',
            borderRadius: '12px',
            zIndex: 16,
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
