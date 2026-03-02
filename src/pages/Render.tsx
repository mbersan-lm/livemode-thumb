import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ThumbnailCanvas } from '@/components/ThumbnailCanvas';
import { ThumbnailCanvasJogoCompleto } from '@/components/ThumbnailCanvasJogoCompleto';
import { ThumbnailCanvasAoVivo } from '@/components/ThumbnailCanvasAoVivo';
import { CortesCanvas } from '@/components/cortes/CortesCanvas';

declare global {
  interface Window {
    __EXPORT_STATE__?: any;
  }
}

const Render = () => {
  const { type } = useParams<{ type: string }>();
  const [state, setState] = useState<any>(null);
  const [ready, setReady] = useState(false);

  // Listen for state injection from Playwright
  useEffect(() => {
    const check = () => {
      if (window.__EXPORT_STATE__) {
        setState(window.__EXPORT_STATE__);
      }
    };
    // Check immediately and poll
    check();
    const interval = setInterval(check, 50);
    return () => clearInterval(interval);
  }, []);

  // Wait for fonts + images after state is set
  useEffect(() => {
    if (!state) return;

    const waitForReady = async () => {
      await document.fonts.ready;

      // Wait for all images in #export-frame to load
      const frame = document.getElementById('export-frame');
      if (frame) {
        const images = frame.querySelectorAll('img');
        await Promise.all(
          Array.from(images).map(
            (img) =>
              new Promise<void>((resolve) => {
                if (img.complete) return resolve();
                img.onload = () => resolve();
                img.onerror = () => resolve();
              })
          )
        );
      }

      // Small delay to ensure rendering is complete
      await new Promise((r) => setTimeout(r, 200));
      setReady(true);
    };

    waitForReady();
  }, [state]);

  if (!state) {
    return (
      <div
        style={{
          width: '100vw',
          height: '100vh',
          background: '#000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#666',
        }}
      >
        Aguardando estado...
      </div>
    );
  }

  const renderCanvas = () => {
    switch (type) {
      case 'melhores-momentos':
        return (
          <ThumbnailCanvas
            playerPhoto={state.playerPhoto}
            photoTransform={state.photoTransform}
            matchData={state.matchData}
            template={state.template}
          />
        );

      case 'jogo-completo':
        return (
          <ThumbnailCanvasJogoCompleto
            playerPhoto={state.jogoCompletoPhoto}
            photoTransform={state.jogoCompletoPhotoTransform}
            matchData={state.matchData}
            template={state.template}
          />
        );

      case 'ao-vivo':
        return (
          <ThumbnailCanvasAoVivo
            playerPhoto={null}
            photoTransform={{ x: 0, y: 0, scale: 1, scaleX: 1, scaleY: 1 }}
            photoLeft={state.photoLeft}
            photoLeftTransform={state.photoLeftTransform}
            photoRight={state.photoRight}
            photoRightTransform={state.photoRightTransform}
            matchData={state.matchData}
            template="europaleague"
            aoVivoTemplate={state.aoVivoTemplate}
            gradientLeftColor={state.gradientLeftColor}
            gradientRightColor={state.gradientRightColor}
            panelLeftColor={state.gradientLeftColor}
            panelRightColor={state.gradientRightColor}
            showSomAmbiente={state.showSomAmbiente}
          />
        );

      case 'cortes':
        return (
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
        );

      default:
        return <div style={{ color: '#f00' }}>Tipo desconhecido: {type}</div>;
    }
  };

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <div
        id="export-frame"
        data-ready={ready ? 'true' : 'false'}
        style={{ width: 1280, height: 720 }}
      >
        {renderCanvas()}
      </div>
    </div>
  );
};

export default Render;
