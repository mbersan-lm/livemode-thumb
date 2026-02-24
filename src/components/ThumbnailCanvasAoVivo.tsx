import { forwardRef } from 'react';
import { PhotoTransform } from '@/types/thumbnail';
import { TemplateType, templates } from '@/data/templates';

interface ThumbnailCanvasAoVivoProps {
  image1: string | null;
  image2: string | null;
  image1Transform: PhotoTransform;
  image2Transform: PhotoTransform;
  template: TemplateType;
}

export const ThumbnailCanvasAoVivo = forwardRef<HTMLDivElement, ThumbnailCanvasAoVivoProps>(
  ({ image1, image2, image1Transform, image2Transform, template }, ref) => {
    const currentTemplate = templates[template];

    const makePhotoStyle = (t: PhotoTransform) => ({
      transform: `translate(-50%, -50%) translateX(${t.x}px) translateY(${t.y}px) scale(${t.scale}) scaleX(${t.scaleX}) scaleY(${t.scaleY})`,
    });

    return (
      <div
        ref={ref}
        id="CANVAS_AO_VIVO"
        className="relative"
        style={{
          width: '1280px',
          height: '720px',
          overflow: 'hidden',
          boxSizing: 'content-box',
          transform: 'none',
          background: '#000000',
        }}
      >
        {/* KV Background */}
        <img
          src={currentTemplate.kvPath}
          alt="Background"
          style={{
            position: 'absolute',
            inset: 0,
            width: '1280px',
            height: '720px',
            objectFit: 'cover',
            zIndex: 0,
          }}
        />

        {/* AO VIVO text */}
        <div
          style={{
            position: 'absolute',
            top: '36px',
            left: 0,
            right: 0,
            textAlign: 'center',
            fontFamily: "'Tusker Grotesk', sans-serif",
            fontSize: '160px',
            fontWeight: 600,
            color: '#FFFFFF',
            lineHeight: '1',
            letterSpacing: '0.02em',
            zIndex: 5,
          }}
        >
          AO VIVO
        </div>

        {/* Two image panels */}
        <div
          style={{
            position: 'absolute',
            top: '210px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '40px',
            zIndex: 2,
          }}
        >
          {/* Panel 1 */}
          <div
            style={{
              width: '540px',
              height: '380px',
              borderRadius: '16px',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {image1 && (
              <img
                src={image1}
                alt="Image 1"
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  maxWidth: 'none',
                  maxHeight: 'none',
                  objectFit: 'unset',
                  transformOrigin: 'center center',
                  ...makePhotoStyle(image1Transform),
                }}
              />
            )}
          </div>

          {/* Panel 2 */}
          <div
            style={{
              width: '540px',
              height: '380px',
              borderRadius: '16px',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {image2 && (
              <img
                src={image2}
                alt="Image 2"
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  maxWidth: 'none',
                  maxHeight: 'none',
                  objectFit: 'unset',
                  transformOrigin: 'center center',
                  ...makePhotoStyle(image2Transform),
                }}
              />
            )}
          </div>
        </div>

        {/* Logos overlay */}
        <img
          src="/cortes/logos-live-negativa.png"
          alt="Logos"
          className="absolute pointer-events-none"
          style={{
            left: 0,
            top: 0,
            width: '1280px',
            height: '720px',
            objectFit: 'contain',
            zIndex: 10,
          }}
        />
      </div>
    );
  }
);

ThumbnailCanvasAoVivo.displayName = 'ThumbnailCanvasAoVivo';
