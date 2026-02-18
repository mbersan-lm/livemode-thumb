import { Trash2 } from 'lucide-react';

interface ProgramCardProps {
  name: string;
  thumbType: string;
  previewColors: { text: string; stroke: string; pip: string };
  onClick: () => void;
  onDelete?: () => void;
}

export const ProgramCard = ({ name, thumbType, previewColors, onClick, onDelete }: ProgramCardProps) => {
  return (
    <div
      onClick={onClick}
      className="relative group bg-card border border-border rounded-xl p-5 cursor-pointer hover:border-foreground/20 transition-all min-h-[160px] flex flex-col justify-between"
    >
      {/* Color preview */}
      <div className="flex gap-2 mb-4">
        <div className="w-6 h-6 rounded-full border border-border" style={{ backgroundColor: previewColors.text }} title="Texto" />
        <div className="w-6 h-6 rounded-full border border-border" style={{ backgroundColor: previewColors.stroke }} title="Traçado" />
        <div className="w-6 h-6 rounded-full border border-border" style={{ backgroundColor: previewColors.pip }} title="PIP" />
      </div>

      <div>
        <h3 className="text-lg font-bold text-foreground">{name}</h3>
        <p className="text-xs text-muted-foreground mt-1">{thumbType}</p>
      </div>

      {onDelete && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all p-1"
          title="Excluir programa"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
