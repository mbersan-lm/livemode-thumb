export type TemplateType = 'brasileirao' | 'ligue1' | 'bundesliga' | 'seriea' | 'paulistao' | 'europaleague' | 'libertadores' | 'kingsleague';

export interface Template {
  id: TemplateType;
  name: string;
  kvPath: string;
  kvJogoCompletoPath: string;
  fontFamily: string;
  scoreFontSize: string;
  xFontSize: string;
  xFontFamily?: string;
  xColor?: string;
}

export const templates: Record<TemplateType, Template> = {
  brasileirao: {
    id: 'brasileirao',
    name: 'Brasileirão',
    kvPath: '/kv/kv.png',
    kvJogoCompletoPath: '/kv/kv-jogo-completo.png',
    fontFamily: 'Tusker Grotesk, sans-serif',
    scoreFontSize: '140px',
    xFontSize: '110px',
  },
  ligue1: {
    id: 'ligue1',
    name: 'Ligue 1',
    kvPath: '/kv/kv-ligue1.png',
    kvJogoCompletoPath: '/kv/kv-jogo-completo-ligue1.png',
    fontFamily: 'Gilroy ExtraBold, sans-serif',
    scoreFontSize: '140px',
    xFontSize: '110px',
    xFontFamily: 'Gilroy Medium, sans-serif',
    xColor: '#FFFFFF',
  },
  bundesliga: {
    id: 'bundesliga',
    name: 'Bundesliga',
    kvPath: '/kv/kv-bundesliga.png',
    kvJogoCompletoPath: '/kv/kv-jogo-completo-bundesliga.png',
    fontFamily: 'Gilroy ExtraBold, sans-serif',
    scoreFontSize: '140px',
    xFontSize: '110px',
    xFontFamily: 'Gilroy Medium, sans-serif',
    xColor: '#FFFFFF',
  },
  seriea: {
    id: 'seriea',
    name: 'Serie A',
    kvPath: '/kv/kv-seriea.png',
    kvJogoCompletoPath: '/kv/kv-jogo-completo-seriea.png',
    fontFamily: 'Gilroy ExtraBold, sans-serif',
    scoreFontSize: '140px',
    xFontSize: '110px',
    xFontFamily: 'Gilroy Medium, sans-serif',
    xColor: '#FFFFFF',
  },
  paulistao: {
    id: 'paulistao',
    name: 'Paulistão',
    kvPath: '/kv/kv-paulistao.png',
    kvJogoCompletoPath: '/kv/kv-jogo-completo-paulistao.png',
    fontFamily: 'Gilroy ExtraBold, sans-serif',
    scoreFontSize: '140px',
    xFontSize: '110px',
    xFontFamily: 'Gilroy Medium, sans-serif',
    xColor: '#FFFFFF',
  },
  europaleague: {
    id: 'europaleague',
    name: 'Europa League',
    kvPath: '/kv/kv-europa-league.png',
    kvJogoCompletoPath: '/kv/kv-jogo-completo-europa-league.png',
    fontFamily: 'Gilroy ExtraBold, sans-serif',
    scoreFontSize: '140px',
    xFontSize: '110px',
    xFontFamily: 'Gilroy Medium, sans-serif',
    xColor: '#FFFFFF',
  },
  libertadores: {
    id: 'libertadores',
    name: 'Libertadores',
    kvPath: '/kv/kv-libertadores.png',
    kvJogoCompletoPath: '/kv/kv-jogo-completo-libertadores.png',
    fontFamily: 'Gilroy ExtraBold, sans-serif',
    scoreFontSize: '140px',
    xFontSize: '110px',
    xFontFamily: 'Gilroy Medium, sans-serif',
    xColor: '#FFFFFF',
  },
  kingsleague: {
    id: 'kingsleague',
    name: 'Kings League',
    kvPath: '/kv/kv-kingsleague.png',
    kvJogoCompletoPath: '',
    fontFamily: 'Gilroy ExtraBold, sans-serif',
    scoreFontSize: '140px',
    xFontSize: '110px',
    xFontFamily: 'Gilroy Medium, sans-serif',
    xColor: '#FFFFFF',
  },
};
