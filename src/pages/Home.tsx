import { useNavigate } from 'react-router-dom';
import { Radio, Scissors } from 'lucide-react';
import FlyingBees from '@/components/FlyingBees';

const cards = [
  {
    title: 'Melhores Momentos & Jogo Completo',
    description: 'Gere thumbnails para vídeos de melhores momentos e jogos completos',
    icon: null as any,
    customIcon: '/images/mm-icon.png',
    path: '/melhores-momentos',
  },
  {
    title: 'Ao Vivo',
    description: 'Crie thumbnails para transmissões ao vivo',
    icon: Radio,
    path: '/ao-vivo',
  },
  {
    title: 'Cortes',
    description: 'Monte thumbnails para cortes de programas',
    icon: Scissors,
    path: '/cortes',
  },
];

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative">
      <FlyingBees />
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12 flex flex-col items-center">
          <img
            src="/images/thumb-the-creator-logo.png"
            alt="Thumb The Creator"
            className="max-w-[360px] w-full mb-6"
          />
          <p className="text-muted-foreground text-lg">
            Escolha o modelo para começar
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {cards.map((card) => (
            <button
              key={card.path}
              onClick={() => navigate(card.path)}
              className="group relative rounded-2xl border border-border bg-card p-8 text-left transition-all hover:border-foreground/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {(card as any).customIcon ? (
                <img src={(card as any).customIcon} alt="" className="w-[5.625rem] h-[5.625rem] object-contain mb-5 grayscale group-hover:grayscale-0 transition-all" />
              ) : (
                <card.icon className="w-10 h-10 text-muted-foreground group-hover:text-foreground transition-colors mb-5" />
              )}
              <h2 className="text-lg font-bold text-foreground mb-2">{card.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {card.description}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
