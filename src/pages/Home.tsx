import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Film, Radio, Scissors } from 'lucide-react';

const models = [
  {
    title: 'Melhores Momentos',
    description: 'Thumbnail para vídeos de melhores momentos com placar e escudos',
    icon: Play,
    path: '/melhores-momentos',
  },
  {
    title: 'Jogo Completo',
    description: 'Thumbnail para vídeos de jogo completo com escudos dos times',
    icon: Film,
    path: '/jogo-completo',
  },
  {
    title: 'Ao Vivo',
    description: 'Thumbnail para transmissões ao vivo com fotos e gradientes',
    icon: Radio,
    path: '/ao-vivo',
  },
  {
    title: 'Cortes',
    description: 'Gerador de thumbnails para cortes de programas',
    icon: Scissors,
    path: '/cortes',
  },
];

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Gerador de Thumbnails
          </h1>
          <p className="text-muted-foreground text-sm">
            Selecione o modelo que deseja utilizar
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {models.map((model) => (
            <Card
              key={model.path}
              className="group cursor-pointer border-border hover:border-primary/60 transition-all duration-200 hover:shadow-lg hover:shadow-primary/5"
              onClick={() => navigate(model.path)}
            >
              <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <model.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground text-base">{model.title}</h2>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{model.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
