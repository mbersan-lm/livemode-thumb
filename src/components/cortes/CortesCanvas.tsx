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

interface CortesCanvasProps {
  pipImage: string | null;
  personCutout: string | null;
  thumbText: string;
  pipTransform: { x: number; y: number; scale: number; rotation: number };
  personTransform: { x: number; y: number; scale: number; rotation: number };
  pipFrame: { x: number; y: number; width: number; height: number };
}

export const CortesCanvas = forwardRef<HTMLDivElement, CortesCanvasProps>(
  ({ pipImage, personCutout, thumbText, pipTransform, personTransform, pipFrame }, ref) => {
    const textRef = useRef<HTMLDivElement>(null);
    const [fontSize, setFontSize] = useState(200);
    const strokeShadow = useMemo(() => generateStrokeShadow(15, '#0C0C20', 32), []);

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
    }, [thumbText]);

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
          src="/cortes/bg-corte.png"
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
        {pipImage && (
          <div
            style={{
              position: 'absolute',
              left: `${pipFrame.x}%`,
              top: `${pipFrame.y}%`,
              width: `${pipFrame.width}%`,
              height: `${pipFrame.height}%`,
              border: '10px solid #D02046',
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
                    objectFit: 'cover',
                    transform: `translate(-50%, -50%) translate(${pipTransform.x}px, ${pipTransform.y}px) scale(${finalScale}) rotate(${pipTransform.rotation}deg)`,
                    transformOrigin: 'center center',
                  }}
                />
              );
            })()}
          </div>
        )}

        {/* Layer 3: Person cutout */}
        {personCutout && (
          <img
            src={personCutout}
            alt=""
            style={{
              position: 'absolute',
              right: '-6%',
              top: '-2%',
              height: '108%',
              width: 'auto',
              zIndex: 3,
              transform: `translate(${personTransform.x}px, ${personTransform.y}px) scale(${personTransform.scale}) rotate(${personTransform.rotation}deg)`,
              transformOrigin: 'center center',
            }}
          />
        )}

        {/* Layer 4: Logos */}
        <img
          src="/cortes/logos-corte.png"
          alt=""
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 4,
            pointerEvents: 'none',
          }}
        />

        {/* Layer 5: Text */}
        {thumbText && (
          <div
            ref={textRef}
            style={{
              position: 'absolute',
              left: '2%',
              bottom: '6%',
              width: '96%',
              maxHeight: '38%',
              overflow: 'hidden',
              zIndex: 5,
              fontFamily: "'Clash Grotesk', sans-serif",
              fontWeight: 800,
              fontSize: `${fontSize}px`,
              lineHeight: 1.2,
              textAlign: 'center',
              color: '#F1E8D5',
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
                ? <span key={i} style={{ color: '#D02046', marginLeft: '0.15em', marginRight: '0.15em' }}>{part.slice(1, -1)}</span>
                : part
            )}
          </div>
        )}
      </div>
    );
  }
);

CortesCanvas.displayName = 'CortesCanvas';
