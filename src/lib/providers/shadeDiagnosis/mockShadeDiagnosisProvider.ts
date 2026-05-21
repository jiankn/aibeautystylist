export interface ShadeDiagnosisResult {
  diagnosis: string;
  summary: string;
  reasons: string[];
  product: {
    name: string;
    copy: string;
  };
}

export interface ShadeDiagnosisProvider {
  readonly name: string;
  getDiagnosis: (undertone?: string) => Promise<ShadeDiagnosisResult>;
}

const diagnosisMap: Record<string, ShadeDiagnosisResult> = {
  cool: {
    diagnosis: 'Cool undertone · Soft berry fit',
    summary: '你更适合冷调玫瑰、柔莓和灰粉系，过暖橘调会削弱通透感。',
    reasons: ['优先冷调灰粉和柔莓色', '提升唇部与眼下气色', '从低对比度的日常妆开始更稳'],
    product: {
      name: 'MAC Lipstick · Mehr',
      copy: '适合作为第一支安全牌，气色提升明显，也方便衔接日常教程。',
    },
  },
  warm: {
    diagnosis: 'Warm undertone · Peach nude fit',
    summary: '你更适合蜜桃、暖裸和柔棕调，能显得更亲和、更有活力。',
    reasons: ['优先蜜桃和暖裸系', '眼唇保持柔和暖调一致', '避免偏灰调口红压气色'],
    product: {
      name: 'Charlotte Tilbury · Pillow Talk Medium',
      copy: '暖调豆沙系更贴合你的面部氛围，也方便延展到通勤与约会场景。',
    },
  },
  neutral: {
    diagnosis: 'Neutral undertone · Balanced nude fit',
    summary: '你可以在玫瑰裸粉和柔棕之间灵活切换，关键是控制整体浓度。',
    reasons: ['适合平衡型裸调', '优先做整体协调，不必堆色', '根据场景切换唇色深浅'],
    product: {
      name: 'NARS Powermatte · American Woman',
      copy: '是兼顾日常和正式场景的平衡型选择，适合当作基础唇色。',
    },
  },
  olive: {
    diagnosis: 'Olive undertone · Muted mauve fit',
    summary: '你适合低饱和冷调的灰粉、藕粉和柔莓色，能避免肤色被映得发黄。',
    reasons: ['优先低饱和冷调唇色', '避免过亮暖橘让肤色显浊', '通过唇颊同色提升整体干净度'],
    product: {
      name: 'Rare Beauty Kind Words · Humble',
      copy: '低饱和柔粉更适合橄榄调肌肤，既提气色又不容易显脏。',
    },
  },
};

export const mockShadeDiagnosisProvider: ShadeDiagnosisProvider = {
  name: 'mock',
  async getDiagnosis(undertone = 'cool') {
    return diagnosisMap[undertone] ?? diagnosisMap.cool;
  },
};
