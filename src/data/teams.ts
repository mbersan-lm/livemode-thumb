export interface Team {
  id: string;
  name: string;
  slug: string;
  crest_url: string;
  maxSize?: number;    // sobrescreve max-w e max-h em Melhores Momentos
  jcMaxSize?: number;  // sobrescreve max-w e max-h em Jogo Completo
  jcOffsetY?: number;  // offset vertical em px no Jogo Completo
}

export const teamsBrasileirao: Team[] = [
  { id: '21', name: 'Athletico-PR', slug: 'athleticopr', crest_url: '/crests/athleticopr.png' },
  { id: '1', name: 'Atlético', slug: 'atletico', crest_url: '/crests/atletico.png', jcMaxSize: 290, jcOffsetY: 16 },
  { id: '2', name: 'Bahia', slug: 'bahia', crest_url: '/crests/bahia.png', jcMaxSize: 306, jcOffsetY: 16 },
  { id: '3', name: 'Botafogo', slug: 'botafogo', crest_url: '/crests/botafogo.png' },
  { id: '22', name: 'Chapecoense', slug: 'chapecoense', crest_url: '/crests/chapecoense.png' },
  { id: '5', name: 'Corinthians', slug: 'corinthians', crest_url: '/crests/corinthians.png' },
  { id: '23', name: 'Coritiba', slug: 'coritiba', crest_url: '/crests/coritiba.png' },
  { id: '6', name: 'Cruzeiro', slug: 'cruzeiro', crest_url: '/crests/cruzeiro.png' },
  { id: '7', name: 'Flamengo', slug: 'flamengo', crest_url: '/crests/flamengo.png' },
  { id: '8', name: 'Fluminense', slug: 'fluminense', crest_url: '/crests/fluminense.png' },
  { id: '10', name: 'Grêmio', slug: 'gremio', crest_url: '/crests/gremio.png' },
  { id: '11', name: 'Internacional', slug: 'internacional', crest_url: '/crests/internacional.png' },
  { id: '13', name: 'Mirassol', slug: 'mirassol', crest_url: '/crests/mirassol.png' },
  { id: '14', name: 'Palmeiras', slug: 'palmeiras', crest_url: '/crests/palmeiras.png' },
  { id: '15', name: 'Red Bull Bragantino', slug: 'redbullbragantino', crest_url: '/crests/redbullbragantino.png' },
  { id: '24', name: 'Remo', slug: 'remo', crest_url: '/crests/remo.png' },
  { id: '16', name: 'Santos', slug: 'santos', crest_url: '/crests/santos.png', jcOffsetY: 16 },
  { id: '17', name: 'São Paulo', slug: 'saopaulo', crest_url: '/crests/saopaulo.png' },
  { id: '19', name: 'Vasco', slug: 'vasco', crest_url: '/crests/vasco.png' },
  { id: '20', name: 'Vitória', slug: 'vitoria', crest_url: '/crests/vitoria.png' },
];

// Manter export teams para compatibilidade
export const teams = teamsBrasileirao;
