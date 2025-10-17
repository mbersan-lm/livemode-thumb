import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { templates, TemplateType } from '@/data/templates';

interface TemplateControlsProps {
  currentTemplate: TemplateType;
  onTemplateChange: (template: TemplateType) => void;
}

export const TemplateControls = ({ currentTemplate, onTemplateChange }: TemplateControlsProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label>Select Template</Label>
        <Select value={currentTemplate} onValueChange={(value) => onTemplateChange(value as TemplateType)}>
          <SelectTrigger className="mt-2">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.values(templates).map((template) => (
              <SelectItem key={template.id} value={template.id}>
                {template.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border border-border p-4 bg-muted/50">
        <p className="text-sm text-muted-foreground">
          Each template has its own:
        </p>
        <ul className="mt-2 text-sm space-y-1 text-muted-foreground">
          <li>• Background design (KV)</li>
          <li>• Team selection</li>
          <li>• Score font style</li>
        </ul>
      </div>
    </div>
  );
};
