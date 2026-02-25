import { useEffect, useRef, useState, forwardRef, useMemo } from 'react';

function generateStrokeShadow(radius: number, color: string, steps = 32): string {
  const shadows: string[] = [];
  for (let i = 0; i < steps; i++) {
    const angle = (2 * Math.PI * i) / steps;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    shadows.push(`${x.toFixed(1)}px ${y.toFixed(1)}px 0 ${color}`);
  }
  return shadows.join(', ');
}

import type { ThumbModel } from './CortesThumbBuilder';

interface CortesCanvasProps {
  thumbModel?: ThumbModel;
  pipImage: string | null;
  pip2Image?: string | null;
  personCutout: string | null;
  person2Cutout: string | null;
  person3Cutout?: string | null;
  person4Cutout?: string | null;
  thumbText: string;
  thumbTextLeft?: string;
  thumbTextRight?: string;
  pipTransform: { x: number; y: number; scale: number; rotation: number };
  pip2Transform?: { x: number; y: number; scale: number; rotation: number };
  personTransform: { x: number; y: number; scale: number; rotation: number };
  person2Transform: { x: number; y: number; scale: number; rotation: number };
  person3Transform?: { x: number; y: number; scale: number; rotation: number };
  person4Transform?: { x: number; y: number; scale: number; rotation: number };
  pipFrame: { x: number; y: number; width: number; height: number };
  pip2Frame?: { x: number; y: number; width: number; height: number };
  bgImage?: string;
  logosImage?: string;
  divisoriaImage?: string;
  textColor?: string;
  strokeColor?: string;
  pipBorderColor?: string;
  highlightColor?: string;
  customFontFamily?: string;
  textBoxHeight?: number;
  quadrantVisibility?: boolean[];
  useQuadrantGrid?: boolean;
}

export const CortesCanvas = forwardRef<HTMLDivElement, CortesCanvasProps>(
  ({ thumbModel = 'pip', pipImage, pip2Image = null, personCutout, person2Cutout, person3Cutout = null, person4Cutout = null,
     thumbText, thumbTextLeft = '', thumbTextRight = '',
     pipTransform, pip2Transform = { x: 0, y: 0, scale: 1, rotation: 0 },
     personTransform, person2Transform,
     person3Transform = { x: 0, y: 0, scale: 1, rotation: 0 },
     person4Transform = { x: 0, y: 0, scale: 1, rotation: 0 },
     pipFrame, pip2Frame = { x: 67, y: 15.4, width: 30, height: 55 },
     bgImage = '/cortes/bg-corte.png', logosImage = '/cortes/logos-corte.png',
     divisoriaImage = '/cortes/divisoria-geral.png',
     textColor = '#F1E8D5', strokeColor = '#0C0C20', pipBorderColor = '#D02046',
     highlightColor = '#D02046', customFontFamily = "'Clash Grotesk', sans-serif",
     textBoxHeight = 38, quadrantVisibility = [true, true, true, true], useQuadrantGrid = false }, ref) => {
   const showPip = thumbModel === 'pip';
   const showPipDividido = thumbModel === 'pip-dividido';
   const showPerson2 = thumbModel === 'duas-pessoas';
   const showJogoV1 = thumbModel === 'jogo-v1';
   const showJogoPipDuplo = thumbModel === 'jogo-pip-duplo';
    const showMeioAMeio = thumbModel === 'meio-a-meio';
    const showSoLettering = thumbModel === 'so-lettering';
    const showThumbPrincipal = thumbModel === 'thumb-principal';
    const textRef = useRef<HTMLDivElement>(null);
    const textLeftRef = useRef<HTMLDivElement>(null);
    const textRightRef = useRef<HTMLDivElement>(null);
    const [fontSize, setFontSize] = useState(200);
    const [fontSizeLeft, setFontSizeLeft] = useState(160);
    const [fontSizeRight, setFontSizeRight] = useState(160);
    const strokeShadow = useMemo(() => generateStrokeShadow(15, strokeColor, 32), [strokeColor]);

    useEffect(() => {
      if (!textRef.current || !thumbText) {
        setFontSize(200);
        return;
      }
      let size = 200;
      const el = textRef.current;
      el.style.fontSize = `${size}px`;
      while (el.scrollHeight > el.clientHeight && size > 20) {
        size -= 2;
        el.style.fontSize = `${size}px`;
      }
      setFontSize(size);
    }, [thumbText, textBoxHeight]);

    useEffect(() => {
      if (!textLeftRef.current || !thumbTextLeft) { setFontSizeLeft(160); return; }
      let size = 160;
      const el = textLeftRef.current;
      el.style.fontSize = `${size}px`;
      while (el.scrollHeight > el.clientHeight && size > 20) { size -= 2; el.style.fontSize = `${size}px`; }
      setFontSizeLeft(size);
    }, [thumbTextLeft, textBoxHeight]);

    useEffect(() => {
      if (!textRightRef.current || !thumbTextRight) { setFontSizeRight(160); return; }
      let size = 160;
      const el = textRightRef.current;
      el.style.fontSize = `${size}px`;
      while (el.scrollHeight > el.clientHeight && size > 20) { size -= 2; el.style.fontSize = `${size}px`; }
      setFontSizeRight(size);
    }, [thumbTextRight, textBoxHeight]);

    return (
      <div
        ref={ref}
        id="CANVAS_CORTES"
        style={{
          width: 1280,
          height: 720,
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: '#0C0C20',
        }}
      >
        {/* Layer 1: BG */}
        <img
          src={bgImage}
          alt=""
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 1,
          }}
        />

        {/* Layer 2: PIP */}
        {showPip && pipImage && (
          <div
            style={{
              position: 'absolute',
              left: `${pipFrame.x}%`,
              top: `${pipFrame.y}%`,
              width: `${pipFrame.width}%`,
              height: `${pipFrame.height}%`,
              border: `10px solid ${pipBorderColor}`,
              transform: 'rotate(-1.2deg)',
              overflow: 'hidden',
              zIndex: 2,
            }}
          >
          {(() => {
              const finalScale = pipTransform.scale;
              return (
                <img
                  src={pipImage}
                  alt=""
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    transform: `translate(-50%, -50%) translate(${pipTransform.x}px, ${pipTransform.y}px) scale(${finalScale}) rotate(${pipTransform.rotation}deg)`,
                    transformOrigin: 'center center',
                  }}
                />
              );
            })()}
          </div>
        )}

        {/* Layer 2: PIP dividido — single frame with two photos inside */}
        {showPipDividido && (pipImage || pip2Image) && (
          <div
            style={{
              position: 'absolute',
              left: `${pipFrame.x}%`,
              top: `${pipFrame.y}%`,
              width: `${pipFrame.width}%`,
              height: `${pipFrame.height}%`,
              border: `10px solid ${pipBorderColor}`,
              transform: 'rotate(-1.2deg)',
              overflow: 'hidden',
              zIndex: 2,
              display: 'flex',
            }}
          >
            {/* Left half */}
            <div style={{ width: '50%', height: '100%', overflow: 'hidden', position: 'relative' }}>
              {pipImage && (
                <img src={pipImage} alt="" style={{
                  position: 'absolute', left: '50%', top: '50%',
                  width: '100%', height: '100%', objectFit: 'contain',
                  transform: `translate(-50%, -50%) translate(${pipTransform.x}px, ${pipTransform.y}px) scale(${pipTransform.scale}) rotate(${pipTransform.rotation}deg)`,
                  transformOrigin: 'center center',
                }} />
              )}
            </div>
            {/* Vertical divider */}
            <div style={{ width: '4px', height: '100%', backgroundColor: pipBorderColor, flexShrink: 0 }} />
            {/* Right half */}
            <div style={{ width: '50%', height: '100%', overflow: 'hidden', position: 'relative' }}>
              {pip2Image && (
                <img src={pip2Image} alt="" style={{
                  position: 'absolute', left: '50%', top: '50%',
                  width: '100%', height: '100%', objectFit: 'contain',
                  transform: `translate(-50%, -50%) translate(${pip2Transform.x}px, ${pip2Transform.y}px) scale(${pip2Transform.scale}) rotate(${pip2Transform.rotation}deg)`,
                  transformOrigin: 'center center',
                }} />
              )}
            </div>
          </div>
        )}

        {/* Layer 3: Person cutout (right side) — pip, pip-dividido & duas-pessoas models */}
        {!showMeioAMeio && !showSoLettering && !showJogoV1 && !showJogoPipDuplo && !showThumbPrincipal && personCutout && (
          <img
            src={personCutout}
            alt=""
            style={{
              position: 'absolute',
              right: showPerson2 ? '-2%' : '-6%',
              top: '-2%',
              height: '108%',
              width: 'auto',
              zIndex: 3,
              transform: `translate(${personTransform.x}px, ${personTransform.y}px) scale(${personTransform.scale}) rotate(${personTransform.rotation}deg)`,
              transformOrigin: 'center center',
            }}
          />
        )}

        {/* Layer 3b: Person 2 cutout (left side) — duas-pessoas model */}
        {showPerson2 && !showSoLettering && !showJogoV1 && !showJogoPipDuplo && !showThumbPrincipal && person2Cutout && (
          <img
            src={person2Cutout}
            alt=""
            style={{
              position: 'absolute',
              left: '-2%',
              top: '-2%',
              height: '108%',
              width: 'auto',
              zIndex: 3,
              transform: `translate(${person2Transform.x}px, ${person2Transform.y}px) scale(${person2Transform.scale}) rotate(${person2Transform.rotation}deg)`,
              transformOrigin: 'center center',
            }}
          />
        )}

        {/* Layer 2b: Meio a meio — left image (clipped to left half) */}
        {showMeioAMeio && personCutout && (
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: '50%',
              height: '100%',
              overflow: 'hidden',
              zIndex: 2,
            }}
          >
            <img
              src={personCutout}
              alt=""
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center top',
                transform: `translate(-50%, -50%) translate(${personTransform.x}px, ${personTransform.y}px) scale(${personTransform.scale}) rotate(${personTransform.rotation}deg)`,
                transformOrigin: 'center center',
              }}
            />
          </div>
        )}

        {/* Layer 2c: Meio a meio — right image (clipped to right half) */}
        {showMeioAMeio && person2Cutout && (
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              width: '50%',
              height: '100%',
              overflow: 'hidden',
              zIndex: 2,
            }}
          >
            <img
              src={person2Cutout}
              alt=""
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center top',
                transform: `translate(-50%, -50%) translate(${person2Transform.x}px, ${person2Transform.y}px) scale(${person2Transform.scale}) rotate(${person2Transform.rotation}deg)`,
                transformOrigin: 'center center',
              }}
            />
          </div>
        )}

        {/* Layer 2d: Meio a meio — PNG divider (above images, below gradient) */}
        {showMeioAMeio && (
          <img
            src={divisoriaImage}
            alt=""
            style={{
              position: 'absolute',
              left: '50%',
              top: 0,
              transform: 'translateX(-50%)',
              height: '100%',
              width: 'auto',
              zIndex: 3,
              pointerEvents: 'none',
            }}
          />
        )}

        {/* Layer 2b: PIP duplo — left frame (jogo-pip-duplo) */}
        {showJogoPipDuplo && pipImage && (
          <div
            style={{
              position: 'absolute',
              left: `${pipFrame.x}%`,
              top: `${pipFrame.y}%`,
              width: `${pipFrame.width}%`,
              height: `${pipFrame.height}%`,
              border: `10px solid ${pipBorderColor}`,
              transform: 'rotate(-1.2deg)',
              overflow: 'hidden',
              zIndex: 2,
            }}
          >
            <img src={pipImage} alt="" style={{
              position: 'absolute', left: '50%', top: '50%',
              width: '100%', height: '100%', objectFit: 'contain',
              transform: `translate(-50%, -50%) translate(${pipTransform.x}px, ${pipTransform.y}px) scale(${pipTransform.scale}) rotate(${pipTransform.rotation}deg)`,
              transformOrigin: 'center center',
            }} />
          </div>
        )}

        {/* Layer 2c: PIP duplo — right frame (jogo-pip-duplo) */}
        {showJogoPipDuplo && pip2Image && (
          <div
            style={{
              position: 'absolute',
              left: `${pip2Frame.x}%`,
              top: `${pip2Frame.y}%`,
              width: `${pip2Frame.width}%`,
              height: `${pip2Frame.height}%`,
              border: `10px solid ${pipBorderColor}`,
              transform: 'rotate(1.2deg)',
              overflow: 'hidden',
              zIndex: 2,
            }}
          >
            <img src={pip2Image} alt="" style={{
              position: 'absolute', left: '50%', top: '50%',
              width: '100%', height: '100%', objectFit: 'contain',
              transform: `translate(-50%, -50%) translate(${pip2Transform.x}px, ${pip2Transform.y}px) scale(${pip2Transform.scale}) rotate(${pip2Transform.rotation}deg)`,
              transformOrigin: 'center center',
            }} />
          </div>
        )}

        {/* Layer 3e: Jogo v1 & jogo-pip-duplo — 3 cutouts */}
        {(showJogoV1 || showJogoPipDuplo) && personCutout && (
          <img
            src={personCutout}
            alt=""
            style={{
              position: 'absolute',
              left: '0%',
              top: '5%',
              height: '90%',
              width: 'auto',
              zIndex: 3,
              transform: `translate(${personTransform.x}px, ${personTransform.y}px) scale(${personTransform.scale}) rotate(${personTransform.rotation}deg)`,
              transformOrigin: 'center center',
            }}
          />
        )}
        {(showJogoV1 || showJogoPipDuplo) && person2Cutout && (
          <img
            src={person2Cutout}
            alt=""
            style={{
              position: 'absolute',
              left: '50%',
              top: '-5%',
              height: '105%',
              width: 'auto',
              zIndex: 4,
              transform: `translate(-50%, 0) translate(${person2Transform.x}px, ${person2Transform.y}px) scale(${person2Transform.scale}) rotate(${person2Transform.rotation}deg)`,
              transformOrigin: 'center center',
            }}
          />
        )}
        {(showJogoV1 || showJogoPipDuplo) && person3Cutout && (
          <img
            src={person3Cutout}
            alt=""
            style={{
              position: 'absolute',
              right: '0%',
              top: '5%',
              height: '90%',
              width: 'auto',
              zIndex: 3,
              transform: `translate(${person3Transform!.x}px, ${person3Transform!.y}px) scale(${person3Transform!.scale}) rotate(${person3Transform!.rotation}deg)`,
              transformOrigin: 'center center',
            }}
          />
        )}

        {/* Layer 3f: Thumb Principal — quadrant grid (Roda de Bobo) or free cutouts */}
        {showThumbPrincipal && useQuadrantGrid && (() => {
          const quadrants = [
            { left: '0%', top: '0%' },
            { left: '50%', top: '0%' },
            { left: '0%', top: '50%' },
            { left: '50%', top: '50%' },
          ];
          const cutouts = [
            { src: personCutout, t: personTransform },
            { src: person2Cutout, t: person2Transform },
            { src: person3Cutout, t: person3Transform },
            { src: person4Cutout, t: person4Transform },
          ];
          return cutouts.map((c, i) => c.src && quadrantVisibility[i] ? (
            <div
              key={`tp-${i}`}
              style={{
                position: 'absolute',
                left: quadrants[i].left,
                top: quadrants[i].top,
                width: '50%',
                height: '50%',
                overflow: 'hidden',
                zIndex: 3,
              }}
            >
              <img
                src={c.src}
                alt=""
                style={{
                  position: 'absolute',
                  left: (i === 0 || i === 2) ? -20 : 40,
                  top: 0,
                  height: '211.2%',
                  width: 'auto',
                  maxWidth: 'none',
                  transform: `translate(${c.t.x}px, ${c.t.y}px) scale(${c.t.scale}) rotate(${c.t.rotation}deg)`,
                  transformOrigin: '0 0',
                }}
              />
            </div>
          ) : null);
        })()}

        {/* Layer 3f-alt: Thumb Principal — free cutouts (Geral CazéTv) */}
        {showThumbPrincipal && !useQuadrantGrid && (() => {
          const cutouts = [
            { src: personCutout, t: personTransform, z: 3 },
            { src: person2Cutout, t: person2Transform, z: 4 },
            { src: person3Cutout, t: person3Transform, z: 5 },
            { src: person4Cutout, t: person4Transform, z: 6 },
          ];
          return cutouts.map((c, i) => c.src ? (
            <img
              key={`tp-free-${i}`}
              src={c.src}
              alt=""
              style={{
                position: 'absolute',
                left: 0,
                top: '-2%',
                height: '108%',
                width: 'auto',
                zIndex: c.z,
                transform: `translate(${c.t.x}px, ${c.t.y}px) scale(${c.t.scale}) rotate(${c.t.rotation}deg)`,
                transformOrigin: 'center center',
              }}
            />
          ) : null);
        })()}

        {/* Layer 3.5: Bottom gradient overlay */}
        {!showThumbPrincipal && (
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: '45%',
              background: 'linear-gradient(to top, rgba(34,34,34,0.7) 0%, rgba(34,34,34,0) 100%)',
              zIndex: 4,
              pointerEvents: 'none',
            }}
          />
        )}

        {/* Layer 3.8: Top-right corner gradient (behind logos) — exclusivo Geral CazéTv Brasil */}
        {divisoriaImage === '/cortes/divisoria-brasil.png' && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '40%',
              height: '35%',
              background: 'radial-gradient(ellipse at top right, #086932 0%, transparent 70%)',
              zIndex: 4,
              pointerEvents: 'none',
            }}
          />
        )}

        {/* Layer 4: Logos */}
        <img
          src={logosImage}
          alt=""
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 5,
            pointerEvents: 'none',
          }}
        />

        {/* Layer 5: Text — single (pip/duas-pessoas/so-lettering) — NOT thumb-principal */}
        {!showMeioAMeio && !(showThumbPrincipal && useQuadrantGrid) && thumbText && (
          <div
            ref={textRef}
            style={{
              position: 'absolute',
              left: '2%',
              bottom: `${textBoxHeight}%`,
              width: '96%',
              maxHeight: '38%',
              overflow: 'hidden',
              zIndex: 6,
              fontFamily: customFontFamily.includes(',') ? customFontFamily : `'${customFontFamily}', sans-serif`,
              fontWeight: 800,
              fontSize: `${fontSize}px`,
              lineHeight: 1.2,
              textAlign: 'center',
              color: textColor,
              textShadow: strokeShadow,
              textTransform: 'uppercase',
              transform: 'rotate(-2deg)',
              transformOrigin: 'center center',
              padding: '20px',
              boxSizing: 'border-box',
              wordBreak: 'break-word',
            } as React.CSSProperties}
          >
            {thumbText.split(/(\*[^*]+\*)/g).map((part, i) =>
              part.startsWith('*') && part.endsWith('*')
                ? <span key={i} style={{ color: highlightColor, marginLeft: '0.15em', marginRight: '0.15em' }}>{part.slice(1, -1)}</span>
                : part
            )}
          </div>
        )}

        {/* Layer 5tp: Text inside central circle — thumb-principal only */}
        {showThumbPrincipal && useQuadrantGrid && thumbText && (
          <div
            ref={textRef}
            style={{
              position: 'absolute',
              left: '50%',
              bottom: `${textBoxHeight}%`,
              width: 380,
              maxHeight: 200,
              overflow: 'hidden',
              zIndex: 6,
              fontFamily: customFontFamily.includes(',') ? customFontFamily : `'${customFontFamily}', sans-serif`,
              fontWeight: 800,
              fontSize: `${fontSize}px`,
              lineHeight: 1.15,
              textAlign: 'center',
              color: textColor,
              textShadow: strokeShadow,
              textTransform: 'uppercase',
              transform: 'translateX(-50%)',
              transformOrigin: 'center center',
              padding: '10px',
              boxSizing: 'border-box',
              wordBreak: 'break-word',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            } as React.CSSProperties}
          >
            <span>
              {thumbText.split(/(\*[^*]+\*)/g).map((part, i) =>
                part.startsWith('*') && part.endsWith('*')
                  ? <span key={i} style={{ color: highlightColor, marginLeft: '0.15em', marginRight: '0.15em' }}>{part.slice(1, -1)}</span>
                  : part
              )}
            </span>
          </div>
        )}

        {/* Layer 5b: Meio a meio — left text */}
        {showMeioAMeio && thumbTextLeft && (
          <div
            ref={textLeftRef}
            style={{
              position: 'absolute',
              left: '1%',
              bottom: `${textBoxHeight}%`,
              width: '47%',
              maxHeight: '40%',
              overflow: 'hidden',
              zIndex: 6,
              fontFamily: customFontFamily.includes(',') ? customFontFamily : `'${customFontFamily}', sans-serif`,
              fontWeight: 800,
              fontSize: `${fontSizeLeft}px`,
              lineHeight: 1.2,
              textAlign: 'center',
              color: textColor,
              textShadow: strokeShadow,
              textTransform: 'uppercase',
              transform: 'rotate(-2deg)',
              transformOrigin: 'center center',
              padding: '14px',
              boxSizing: 'border-box',
              wordBreak: 'break-word',
            } as React.CSSProperties}
          >
            {thumbTextLeft.split(/(\*[^*]+\*)/g).map((part, i) =>
              part.startsWith('*') && part.endsWith('*')
                ? <span key={i} style={{ color: highlightColor, marginLeft: '0.15em', marginRight: '0.15em' }}>{part.slice(1, -1)}</span>
                : part
            )}
          </div>
        )}

        {/* Layer 5c: Meio a meio — right text */}
        {showMeioAMeio && thumbTextRight && (
          <div
            ref={textRightRef}
            style={{
              position: 'absolute',
              right: '1%',
              bottom: `${textBoxHeight}%`,
              width: '47%',
              maxHeight: '40%',
              overflow: 'hidden',
              zIndex: 6,
              fontFamily: customFontFamily.includes(',') ? customFontFamily : `'${customFontFamily}', sans-serif`,
              fontWeight: 800,
              fontSize: `${fontSizeRight}px`,
              lineHeight: 1.2,
              textAlign: 'center',
              color: textColor,
              textShadow: strokeShadow,
              textTransform: 'uppercase',
              transform: 'rotate(-2deg)',
              transformOrigin: 'center center',
              padding: '14px',
              boxSizing: 'border-box',
              wordBreak: 'break-word',
            } as React.CSSProperties}
          >
            {thumbTextRight.split(/(\*[^*]+\*)/g).map((part, i) =>
              part.startsWith('*') && part.endsWith('*')
                ? <span key={i} style={{ color: highlightColor, marginLeft: '0.15em', marginRight: '0.15em' }}>{part.slice(1, -1)}</span>
                : part
            )}
          </div>
        )}
      </div>
    );
  }
);

CortesCanvas.displayName = 'CortesCanvas';
