import { useState, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ThumbnailCanvas } from '@/components/ThumbnailCanvas';
import { ThumbnailCanvasJogoCompleto } from '@/components/ThumbnailCanvasJogoCompleto';
import { PhotoControls } from '@/components/controls/PhotoControls';
import { TeamControls } from '@/components/controls/TeamControls';
import { ExportControls } from '@/components/controls/ExportControls';
import { TemplateControls } from '@/components/controls/TemplateControls';
import { ThumbnailState } from '@/types/thumbnail';
import { TemplateType } from '@/data/templates';

const Index = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const canvasRefJogoCompleto = useRef<HTMLDivElement>(null);
  
  const [state, setState] = useState<ThumbnailState>({
    playerPhoto: null,
    photoTransform: {
      x: 0,
      y: 0,
      scale: 1,
      scaleX: 1,
      scaleY: 1,
    },
    jogoCompletoPhoto: null,
    jogoCompletoPhotoTransform: {
      x: 0,
      y: 0,
      scale: 1,
      scaleX: 1,
      scaleY: 1,
    },
    matchData: {
      homeTeamId: null,
      awayTeamId: null,
      homeScore: 0,
      awayScore: 0,
    },
    initialScale: 0.5,
    initialScaleJogoCompleto: 0.5,
    template: 'brasileirao',
  });

  const handlePhotoUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Compute initial scale to fit entire image inside 1280×720 (contain)
        const scale0 = Math.min(1280 / img.naturalWidth, 720 / img.naturalHeight);
        
        setState(prev => ({
          ...prev,
          playerPhoto: e.target?.result as string,
          initialScale: scale0,
          photoTransform: {
            x: 0,
            y: 0,
            scale: scale0,
            scaleX: 1,
            scaleY: 1,
          },
        }));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleJogoCompletoPhotoUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const scale0 = Math.min(1280 / img.naturalWidth, 720 / img.naturalHeight);
        
        setState(prev => ({
          ...prev,
          jogoCompletoPhoto: e.target?.result as string,
          initialScaleJogoCompleto: scale0,
          jogoCompletoPhotoTransform: {
            x: 0,
            y: 0,
            scale: scale0,
            scaleX: 1,
            scaleY: 1,
          },
        }));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleTransformChange = (transform: Partial<typeof state.photoTransform>) => {
    setState(prev => ({
      ...prev,
      photoTransform: { ...prev.photoTransform, ...transform },
    }));
  };

  const handleJogoCompletoTransformChange = (transform: Partial<typeof state.jogoCompletoPhotoTransform>) => {
    setState(prev => ({
      ...prev,
      jogoCompletoPhotoTransform: { ...prev.jogoCompletoPhotoTransform, ...transform },
    }));
  };

  const handleMatchDataChange = (data: Partial<typeof state.matchData>) => {
    setState(prev => ({
      ...prev,
      matchData: { ...prev.matchData, ...data },
    }));
  };

  const handleTemplateChange = (template: TemplateType) => {
    setState(prev => ({
      ...prev,
      template,
      matchData: {
        ...prev.matchData,
        homeTeamId: null,
        awayTeamId: null,
      },
    }));
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Main Canvas Area */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <div className="flex flex-col gap-8">
          {/* Thumbnail Melhores Momentos */}
          <ThumbnailCanvas
            ref={canvasRef}
            playerPhoto={state.playerPhoto}
            photoTransform={state.photoTransform}
            matchData={state.matchData}
            template={state.template}
          />
          
          {/* Thumbnail Jogo Completo */}
          <ThumbnailCanvasJogoCompleto
            ref={canvasRefJogoCompleto}
            playerPhoto={state.jogoCompletoPhoto}
            photoTransform={state.jogoCompletoPhotoTransform}
            matchData={state.matchData}
            template={state.template}
          />
        </div>
      </div>

      {/* Controls Sidebar */}
      <div className="w-[400px] bg-card border-l border-border overflow-y-auto">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-2">Melhores Momentos</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Thumbnail Generator
          </p>

          <Tabs defaultValue="template" className="w-full">
            <TabsList className="w-full grid grid-cols-4">
              <TabsTrigger value="template">Template</TabsTrigger>
              <TabsTrigger value="photo">Photo</TabsTrigger>
              <TabsTrigger value="teams">Teams</TabsTrigger>
              <TabsTrigger value="export">Export</TabsTrigger>
            </TabsList>

            <TabsContent value="template" className="mt-6">
              <TemplateControls
                currentTemplate={state.template}
                onTemplateChange={handleTemplateChange}
              />
            </TabsContent>

            <TabsContent value="photo" className="mt-6">
              <PhotoControls
                photoTransform={state.photoTransform}
                initialScale={state.initialScale}
                onTransformChange={handleTransformChange}
                onPhotoUpload={handlePhotoUpload}
                jogoCompletoPhotoTransform={state.jogoCompletoPhotoTransform}
                initialScaleJogoCompleto={state.initialScaleJogoCompleto}
                onJogoCompletoTransformChange={handleJogoCompletoTransformChange}
                onJogoCompletoPhotoUpload={handleJogoCompletoPhotoUpload}
              />
            </TabsContent>

            <TabsContent value="teams" className="mt-6">
              <TeamControls
                matchData={state.matchData}
                onMatchDataChange={handleMatchDataChange}
                template={state.template}
              />
            </TabsContent>

            <TabsContent value="export" className="mt-6">
              <ExportControls
                canvasRef={canvasRef}
                canvasRefJogoCompleto={canvasRefJogoCompleto}
                matchData={state.matchData}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Index;
