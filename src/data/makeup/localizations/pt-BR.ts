import type { LocalizedAdvisor, LookLocalization } from "../audienceTypes";
import { enLocalizations } from "./en";

export const scenarioLabels = {
  daily: "Dia a dia",
  commute: "Trabalho",
  interview: "Entrevista",
  date: "Encontro",
  photo: "Foto",
  event: "Evento",
  evening: "Noite",
} as const;

export const finishFilterLabels = {
  all: "Todos",
  sheer: "Leve / Glow",
  natural: "Natural / Limpo",
  glow: "Viço",
  matte: "Matte suave / Baixa saturação",
  satin: "Satinado / Polido",
  photogenic: "Pronto para câmera",
  contour: "Contorno / Lift",
  professional: "Profissional",
} as const;

export const experienceLabels = {
  beginner: "Iniciante",
  intermediate: "Intermediário",
  advanced: "Avançado",
} as const;

export const uiLabels = {
  filterTitle: "Filtrar looks",
  filterScenario: "Ocasião",
  filterFinish: "Acabamento",
  filterExperience: "Dificuldade",
  clearFilters: "Redefinir filtros",
  viewResults: "Ver",
  looksCount: "looks",
  emptyTitle: "Nenhum look encontrado",
  emptyHint: "Remova um filtro ou redefina para ver todos os looks.",
  tryThisLook: "Testar este look",
  suitableFor: "Ideal para",
  keyPoints: "Pontos-chave",
  lookDetails: "Detalhes do look",
  makeupAnchors: "Técnicas principais",
  cautionTitle: "Atenção",
  inspirationLabel: "Mostrando",
  switchInspiration: "Trocar inspiração",
  allLooks: "Todos os looks",
  pageTitle: "Explore looks por ocasião",
  pageSubtitle:
    "Filtre maquiagens por ocasião, acabamento e dificuldade. Navegar é grátis; só o teste com selfie usa créditos.",
  discoverTitle: "Explorar looks de maquiagem | AI Beauty Stylist",
  discoverDescription:
    "Explore maquiagens para trabalho, encontro, foto e evento. Filtre por acabamento e dificuldade, depois envie uma selfie para ver a prévia por IA.",
  experienceFriendly: "Fácil",
} as const;

const titleOverrides: Record<string, string> = {
  beginner: "Natural para iniciantes",
  "bronze-evening": "Glam bronze noite",
  "burgundy-velvet": "Borgonha velvet",
  "candlelight-mauve": "Malva luz de vela",
  "champagne-gala": "Gala champanhe",
  "client-meeting-nude": "Nude para reunião",
  "cloud-skin-matte": "Pele nuvem matte",
  commute: "Glow pêssego trabalho",
  "creator-camera-glow": "Glow para câmera",
  date: "Look suave de encontro",
  "douyin-soft-focus": "Vibe soft focus",
  evening: "Noite polida",
  "executive-rose": "Rosa executivo",
  "five-minute-beginner": "Make de cinco minutos",
  "flash-proof-satin": "Satinado anti flash",
  "french-natural-chic": "Natural chic francês",
  "hooded-eyes-lift": "Lift para olhos encobertos",
  "interview-ready": "Pronta para entrevista",
  "jelly-lip-tint": "Lip tint jelly",
  "korean-dewy-glow": "Glow coreano",
  "korean-dewy-makeup": "Glow coreano leve",
  "latina-bronze-glam": "Glam bronze",
  "mature-skin-radiance": "Radiância para pele madura",
  "monolid-makeup": "Maquiagem para monolid",
  "no-makeup": "Look sem maquiagem",
  "olive-undertone-rose": "Rosa para subtom oliva",
  "passport-photo-clean": "Foto 3x4 limpa",
  "peach-beige-date": "Encontro pêssego bege",
  "peach-morning-glow": "Glow pêssego manhã",
  photogenic: "Soft focus fotogênico",
  refined: "Polido refinado",
  "reflective-lid-glow": "Glow refletivo na pálpebra",
  "romantic-pink": "Rosa romântico",
  "rose-milk-date": "Encontro rosa leite",
  "soft-berry-stain": "Berry stain suave",
  "soft-editorial": "Editorial suave",
  "soft-matte-everyday": "Matte suave diário",
  "summer-wedding-guest": "Convidada de casamento verão",
  "sunburn-satin-glow": "Glow satinado queimadinho",
  "vacation-bronze": "Bronze férias",
  "warm-nude-daily": "Nude quente diário",
  "watercolor-blush": "Blush aquarela",
  "wedding-guest": "Convidada de casamento",
  "weekend-glow": "Glow de fim de semana",
};

const scenarioMap: Record<string, string> = {
  Daily: scenarioLabels.daily,
  Commute: scenarioLabels.commute,
  Interview: scenarioLabels.interview,
  Date: scenarioLabels.date,
  Photo: scenarioLabels.photo,
  Event: scenarioLabels.event,
  Evening: scenarioLabels.evening,
};

const finishMap: Record<string, string> = {
  Airy: "Leve",
  Brightening: "Iluminado",
  "Camera Ready": "Pronto para câmera",
  Clean: "Limpo",
  Dewy: "Glow",
  Editorial: "Editorial",
  Effortless: "Descomplicado",
  Glowing: "Viçoso",
  Lifted: "Lift",
  Luminous: "Luminoso",
  Muted: "Baixa saturação",
  Natural: "Natural",
  Polished: "Polido",
  Professional: "Profissional",
  Quick: "Rápido",
  Radiant: "Radiante",
  Satin: "Satinado",
  Sculpted: "Contornado",
  Sheer: "Leve",
  Soft: "Suave",
  "Soft Focus": "Soft focus",
  "Soft Matte": "Matte suave",
  Velvet: "Velvet",
  Warm: "Quente",
};

const experienceMap: Record<string, string> = {
  Beginner: experienceLabels.beginner,
  Intermediate: experienceLabels.intermediate,
  Advanced: experienceLabels.advanced,
};

function recipeId(marketVariantId: string): string {
  return marketVariantId.split("--")[0] ?? marketVariantId;
}

function mapValues(values: string[], map: Record<string, string>): string[] {
  return values.map((value) => map[value] ?? value);
}

function buildAdvisor(
  title: string,
  scenarios: string[],
  finishes: string[],
): LocalizedAdvisor {
  return {
    fit: `${title} funciona bem para ${scenarios.join(", ")} quando você quer ficar mais arrumada sem perder naturalidade.`,
    effect: `Prioriza acabamento ${finishes.join(", ")} para equilibrar pele, olhar, boca e blush.`,
    anchors: [
      "Pele: camadas finas e correção localizada",
      "Olhos: definição perto dos cílios com bordas suaves",
      "Boca e blush: mesma família de cor para conectar o rosto",
    ],
    caution:
      "Se a cor aparecer antes dos seus traços, reduza intensidade ou área.",
    judge: [
      "A pele parece mais clara e descansada?",
      "Olhos e boca ficam equilibrados?",
      "As bordas parecem naturais de perto?",
    ],
  };
}

export const ptBRLocalizations: LookLocalization[] = enLocalizations.map(
  (item) => {
    const id = recipeId(item.marketVariantId);
    const title = titleOverrides[id] ?? item.title;
    const scenarios = mapValues(item.scenarios, scenarioMap);
    const finishLabels = mapValues(item.finishLabels, finishMap);
    return {
      ...item,
      locale: "pt-BR",
      title,
      summary: `${title} é um look para ${scenarios.join(", ")} com acabamento ${finishLabels.join(", ")}.`,
      imageAltTemplate: `Referência de maquiagem ${title}`,
      scenarios,
      finishLabels,
      experienceLabel:
        experienceMap[item.experienceLabel] ?? item.experienceLabel,
      advisor: buildAdvisor(title, scenarios, finishLabels),
    };
  },
);
