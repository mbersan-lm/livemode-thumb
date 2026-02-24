import { useNavigate } from 'react-router-dom';
import { Trophy, Tv, Radio, Scissors } from 'lucide-react';

const models = [
  {
    title: 'Melhores Momentos',
    description: 'Gere thumbnails para vídeos de melhores momentos de partidas.',
    icon: Trophy,
    path: '/melhores-momentos',
  },
  {
    title: 'Jogo Completo',
    description: 'Thumbnails para vídeos de jogos completos.',
    icon: Tv,
    path: '/jogo-completo',
  },
  {
    title: 'Ao Vivo',
    description: 'Thumbnails para transmissões ao vivo.',
    icon: Radio,
    path: '/ao-vivo',
  },
  {
    title: 'Cortes',
    description: 'Thumbnails para cortes de programas.',
    icon: Scissors,
    path: '/cortes',
  },
];

const Hub = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Gerador de Thumbnails
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Escolha o modelo para começar
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {models.map((model) => (
            <button
              key={model.path}
              onClick={() => navigate(model.path)}
              className="group rounded-xl border border-border bg-card p-6 text-left transition-all hover:border-primary/50 hover:bg-card/80 focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <model.icon className="w-8 h-8 text-primary mb-4 transition-transform group-hover:scale-110" />
              <h2 className="text-lg font-semibold text-foreground">{model.title}</h2>
              <p className="text-sm text-muted-foreground mt-1">{model.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Hub;
