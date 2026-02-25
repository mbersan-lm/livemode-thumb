import { Trash2, Pencil } from 'lucide-react';

interface ProgramCardProps {
  name: string;
  thumbType: string;
  previewColors: { text: string; stroke: string; pip: string };
  logoUrl?: string;
  bgImageUrl?: string;
  onClick: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const ProgramCard = ({ name, thumbType, previewColors, logoUrl, bgImageUrl, onClick, onEdit, onDelete }: ProgramCardProps) => {
  const hasCustomCard = !!(logoUrl && bgImageUrl);

  return (
    <div
      onClick={onClick}
      className="relative group border border-border rounded-xl cursor-pointer hover:border-foreground/20 transition-all min-h-[160px] flex flex-col justify-between overflow-hidden"
      style={!hasCustomCard ? { backgroundColor: 'hsl(var(--card))', padding: '1.25rem' } : undefined}
    >
      {hasCustomCard ? (
        <>
          {/* BG at 70% opacity */}
          <div className="absolute inset-0" style={{ backgroundImage: `url(${bgImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.7 }} />
          {/* Centered logo */}
          <div className="relative z-10 flex-1 flex items-center justify-center p-5">
            <img src={logoUrl} alt={name} className="h-14 w-auto" style={{ maxWidth: 'none' }} />
          </div>
        </>
      ) : (
        <>
          <div className="flex gap-2 mb-4">
            <div className="w-6 h-6 rounded-full border border-border" style={{ backgroundColor: previewColors.text }} title="Texto" />
            <div className="w-6 h-6 rounded-full border border-border" style={{ backgroundColor: previewColors.stroke }} title="Traçado" />
            <div className="w-6 h-6 rounded-full border border-border" style={{ backgroundColor: previewColors.pip }} title="PIP" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">{name}</h3>
            <p className="text-xs mt-1 text-muted-foreground">{thumbType}</p>
          </div>
        </>
      )}

      {(onEdit || onDelete) && (
        <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
          {onEdit && (
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className="text-muted-foreground hover:text-foreground transition-colors p-1"
              title="Editar programa"
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="text-muted-foreground hover:text-destructive transition-colors p-1"
              title="Excluir programa"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
