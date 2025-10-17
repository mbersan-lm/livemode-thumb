export type TemplateType = 'brasileirao' | 'ligue1';

export interface Template {
  id: TemplateType;
  name: string;
  kvPath: string;
  fontFamily: string;
  scoreFontSize: string;
  xFontSize: string;
}

export const templates: Record<TemplateType, Template> = {
  brasileirao: {
    id: 'brasileirao',
    name: 'Brasileirão',
    kvPath: '/kv/kv.png',
    fontFamily: 'Tusker Grotesk, sans-serif',
    scoreFontSize: '140px',
    xFontSize: '110px',
  },
  ligue1: {
    id: 'ligue1',
    name: 'Ligue 1',
    kvPath: '/kv/kv-ligue1.png',
    fontFamily: 'Gilroy ExtraBold, sans-serif',
    scoreFontSize: '140px',
    xFontSize: '110px',
  },
};
