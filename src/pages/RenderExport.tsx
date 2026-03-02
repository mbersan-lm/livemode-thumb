import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CortesCanvas } from '@/components/cortes/CortesCanvas';
import { ThumbnailCanvas } from '@/components/ThumbnailCanvas';
import { ThumbnailCanvasJogoCompleto } from '@/components/ThumbnailCanvasJogoCompleto';
import { ThumbnailCanvasAoVivo } from '@/components/ThumbnailCanvasAoVivo';

declare global {
  interface Window {
    __EXPORT_STATE__?: Record<string, any>;
    __EXPORT_STATE_READY__?: () => void;
  }
}

const RenderExport = () => {
  const { type } = useParams<{ type: string }>();
  const [state, setState] = useState<Record<string, any> | null>(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  // Listen for state injection from Playwright
  useEffect(() => {
    // Check if state was already set
    if (window.__EXPORT_STATE__) {
      setState(window.__EXPORT_STATE__);
      return;
    }

    // Otherwise expose a callback that Playwright will trigger
    window.__EXPORT_STATE_READY__ = () => {
      if (window.__EXPORT_STATE__) {
        setState(window.__EXPORT_STATE__);
      }
    };

    return () => {
      delete window.__EXPORT_STATE_READY__;
    };
  }, []);

  // Wait for all images and fonts to load, then signal ready
  useEffect(() => {
    if (!state) return;

    const waitForReady = async () => {
      // Wait for fonts
      await document.fonts.ready;

      // Wait for all images in #export-frame to load
      const frame = document.getElementById('export-frame');
      if (frame) {
        const imgs = frame.querySelectorAll('img');
        await Promise.all(
          Array.from(imgs).map(
            (img) =>
              new Promise<void>((resolve) => {
                if (img.complete) return resolve();
                img.onload = () => resolve();
                img.onerror = () => resolve();
              })
          )
        );
      }

      // Small delay for CSS paint
      await new Promise((r) => setTimeout(r, 300));

      setImagesLoaded(true);
    };

    waitForReady();
  }, [state]);

  // Mark ready for Playwright
  useEffect(() => {
    if (imagesLoaded) {
      const frame = document.getElementById('export-frame');
      if (frame) {
        frame.setAttribute('data-ready', 'true');
      }
    }
  }, [imagesLoaded]);

  if (!state) {
    return (
      <div
        id="export-frame"
        style={{ width: 1280, height: 720, background: '#000' }}
        data-ready="false"
      />
    );
  }

  return (
    <div
      style={{
        width: 1280,
        height: 720,
        overflow: 'hidden',
        position: 'relative',
        background: '#000',
      }}
    >
      <div
        id="export-frame"
        style={{ width: 1280, height: 720 }}
        data-ready="false"
      >
        {type === 'cortes' && (
          <CortesCanvas
            thumbModel={state.thumbModel}
            pipImage={state.pipImage}
            pip2Image={state.pip2Image}
            personCutout={state.personCutout}
            person2Cutout={state.person2Cutout}
            person3Cutout={state.person3Cutout}
            person4Cutout={state.person4Cutout}
            thumbText={state.thumbText}
            thumbTextLeft={state.thumbTextLeft}
            thumbTextRight={state.thumbTextRight}
            pipTransform={state.pipTransform}
            pip2Transform={state.pip2Transform}
            personTransform={state.personTransform}
            person2Transform={state.person2Transform}
            person3Transform={state.person3Transform}
            person4Transform={state.person4Transform}
            pipFrame={state.pipFrame}
            pip2Frame={state.pip2Frame}
            bgImage={state.bgImage}
            logosImage={state.logosImage}
            divisoriaImage={state.divisoriaImage}
            textColor={state.textColor}
            strokeColor={state.strokeColor}
            pipBorderColor={state.pipBorderColor}
            highlightColor={state.highlightColor}
            customFontFamily={state.customFontFamily}
            thumbPrincipalFontFamily={state.thumbPrincipalFontFamily}
            textBoxHeight={state.textBoxHeight}
            quadrantVisibility={state.quadrantVisibility}
            useQuadrantGrid={state.useQuadrantGrid}
            tpHomeTeamId={state.tpHomeTeamId}
            tpAwayTeamId={state.tpAwayTeamId}
            pipMeioDividido={state.pipMeioDividido}
          />
        )}

        {type === 'mm' && (
          <ThumbnailCanvas
            playerPhoto={state.playerPhoto}
            photoTransform={state.photoTransform}
            matchData={state.matchData}
            template={state.template}
          />
        )}

        {type === 'jc' && (
          <ThumbnailCanvasJogoCompleto
            playerPhoto={state.playerPhoto}
            photoTransform={state.photoTransform}
            matchData={state.matchData}
            template={state.template}
          />
        )}

        {type === 'ao-vivo' && (
          <ThumbnailCanvasAoVivo
            playerPhoto={state.playerPhoto}
            photoTransform={state.photoTransform}
            photoLeft={state.photoLeft}
            photoLeftTransform={state.photoLeftTransform}
            photoRight={state.photoRight}
            photoRightTransform={state.photoRightTransform}
            matchData={state.matchData}
            template={state.template}
            aoVivoTemplate={state.aoVivoTemplate}
            gradientLeftColor={state.gradientLeftColor}
            gradientRightColor={state.gradientRightColor}
            panelLeftColor={state.panelLeftColor}
            panelRightColor={state.panelRightColor}
            showSomAmbiente={state.showSomAmbiente}
          />
        )}
      </div>
    </div>
  );
};

export default RenderExport;
