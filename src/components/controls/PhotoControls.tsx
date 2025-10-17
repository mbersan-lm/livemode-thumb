import { Upload, Maximize2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { PhotoTransform } from '@/types/thumbnail';

interface PhotoControlsProps {
  photoTransform: PhotoTransform;
  initialScale: number;
  onTransformChange: (transform: Partial<PhotoTransform>) => void;
  onPhotoUpload: (file: File) => void;
}

export const PhotoControls = ({ 
  photoTransform, 
  initialScale,
  onTransformChange,
  onPhotoUpload 
}: PhotoControlsProps) => {
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onPhotoUpload(file);
    }
  };

  const handleCenter = () => {
    onTransformChange({ x: 0, y: 0 });
  };

  const handleFillRight = () => {
    onTransformChange({ scale: 1.5, x: 0, y: 0 });
  };

  const handleReset = () => {
    onTransformChange({ 
      x: 0, 
      y: 0, 
      scale: initialScale, 
      scaleX: 1, 
      scaleY: 1 
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="photo-upload" className="cursor-pointer">
          <div className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-border rounded-lg hover:border-primary transition-colors">
            <Upload className="w-5 h-5" />
            <span>Upload Player Photo</span>
          </div>
          <input 
            id="photo-upload"
            type="file" 
            accept="image/png,image/jpeg,image/jpg"
            className="hidden"
            onChange={handleFileUpload}
          />
        </Label>
      </div>

      <div className="space-y-4">
        <div>
          <Label>Position X: {photoTransform.x}px</Label>
          <Slider
            value={[photoTransform.x]}
            onValueChange={([x]) => onTransformChange({ x })}
            min={-600}
            max={600}
            step={1}
            className="mt-2"
          />
        </div>

        <div>
          <Label>Position Y: {photoTransform.y}px</Label>
          <Slider
            value={[photoTransform.y]}
            onValueChange={([y]) => onTransformChange({ y })}
            min={-600}
            max={600}
            step={1}
            className="mt-2"
          />
        </div>

        <div>
          <Label>Uniform Zoom: {photoTransform.scale.toFixed(2)}x</Label>
          <Slider
            value={[photoTransform.scale]}
            onValueChange={([scale]) => onTransformChange({ scale })}
            min={Math.min(initialScale * 0.9, 0.1)}
            max={2.5}
            step={0.01}
            className="mt-2"
          />
        </div>
      </div>

      <div className="pt-4 border-t border-border">
        <h4 className="text-sm font-semibold mb-4">Stretch (Non-uniform)</h4>
        <div className="space-y-4">
          <div>
            <Label>Width Scale: {photoTransform.scaleX.toFixed(2)}x</Label>
            <Slider
              value={[photoTransform.scaleX]}
              onValueChange={([scaleX]) => onTransformChange({ scaleX })}
              min={0.75}
              max={1.25}
              step={0.01}
              className="mt-2"
            />
          </div>

          <div>
            <Label>Height Scale: {photoTransform.scaleY.toFixed(2)}x</Label>
            <Slider
              value={[photoTransform.scaleY]}
              onValueChange={([scaleY]) => onTransformChange({ scaleY })}
              min={0.75}
              max={1.25}
              step={0.01}
              className="mt-2"
            />
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-border space-y-2">
        <h4 className="text-sm font-semibold mb-3">Quick Actions</h4>
        <Button onClick={handleCenter} variant="outline" className="w-full">
          <Maximize2 className="w-4 h-4 mr-2" />
          Center
        </Button>
        <Button onClick={handleFillRight} variant="outline" className="w-full">
          <Maximize2 className="w-4 h-4 mr-2" />
          Fill Right Area
        </Button>
        <Button onClick={handleReset} variant="outline" className="w-full">
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset All
        </Button>
      </div>
    </div>
  );
};
