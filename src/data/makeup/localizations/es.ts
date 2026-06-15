import type { LocalizedAdvisor, LookLocalization } from "../audienceTypes";
import { enLocalizations } from "./en";

export const scenarioLabels = {
  daily: "Diario",
  commute: "Trabajo",
  interview: "Entrevista",
  date: "Cita",
  photo: "Foto",
  event: "Evento",
  evening: "Noche",
} as const;

export const finishFilterLabels = {
  all: "Todos",
  sheer: "Ligero / Luminoso",
  natural: "Natural / Limpio",
  glow: "Con brillo saludable",
  matte: "Mate suave / Apagado",
  satin: "Satinado / Pulido",
  photogenic: "Listo para cámara",
  contour: "Definido / Elevado",
  professional: "Profesional",
} as const;

export const experienceLabels = {
  beginner: "Principiante",
  intermediate: "Intermedio",
  advanced: "Avanzado",
} as const;

export const uiLabels = {
  filterTitle: "Filtrar looks",
  filterScenario: "Ocasión",
  filterFinish: "Acabado",
  filterExperience: "Dificultad",
  clearFilters: "Restablecer filtros",
  viewResults: "Ver",
  looksCount: "looks",
  emptyTitle: "No hay looks que coincidan",
  emptyHint: "Quita un filtro o restablece para ver todos los looks.",
  tryThisLook: "Probar este look",
  suitableFor: "Ideal para",
  keyPoints: "Puntos clave",
  lookDetails: "Detalles del look",
  makeupAnchors: "Técnicas clave",
  cautionTitle: "Precaución",
  inspirationLabel: "Mostrando",
  switchInspiration: "Cambiar inspiración",
  allLooks: "Todos los looks",
  pageTitle: "Explora looks por ocasión",
  pageSubtitle:
    "Filtra maquillaje por ocasión, acabado y dificultad. Navegar es gratis; solo la prueba con selfie usa créditos.",
  discoverTitle: "Explorar looks de maquillaje | AI Beauty Stylist",
  discoverDescription:
    "Explora looks de trabajo, cita, foto y evento. Filtra por acabado y dificultad, luego sube una selfie para ver una prueba de IA.",
  experienceFriendly: "Fácil",
} as const;

const titleOverrides: Record<string, string> = {
  beginner: "Natural para principiantes",
  "bronze-evening": "Glam bronce de noche",
  "burgundy-velvet": "Borgoña terciopelo",
  "candlelight-mauve": "Malva luz de vela",
  "champagne-gala": "Gala champán",
  "client-meeting-nude": "Nude para reunión",
  "cloud-skin-matte": "Piel nube mate",
  commute: "Brillo durazno para trabajo",
  "creator-camera-glow": "Brillo para cámara",
  date: "Look suave de cita",
  "douyin-soft-focus": "Efecto soft focus",
  evening: "Noche pulida",
  "executive-rose": "Rosa ejecutivo",
  "five-minute-beginner": "Rostro en cinco minutos",
  "flash-proof-satin": "Satinado anti flash",
  "french-natural-chic": "Natural chic francés",
  "hooded-eyes-lift": "Lift para ojos encapotados",
  "interview-ready": "Listo para entrevista",
  "jelly-lip-tint": "Tinte jelly de labios",
  "korean-dewy-glow": "Glow coreano",
  "korean-dewy-makeup": "Brillo coreano ligero",
  "latina-bronze-glam": "Glam bronce",
  "mature-skin-radiance": "Luminosidad para piel madura",
  "monolid-makeup": "Maquillaje para monolid",
  "no-makeup": "Look sin maquillaje",
  "olive-undertone-rose": "Rosa para subtono oliva",
  "passport-photo-clean": "Foto ID limpia",
  "peach-beige-date": "Cita durazno beige",
  "peach-morning-glow": "Brillo durazno de mañana",
  photogenic: "Soft focus fotogénico",
  refined: "Pulido refinado",
  "reflective-lid-glow": "Brillo reflectante en párpado",
  "romantic-pink": "Rosa romántico",
  "rose-milk-date": "Cita rosa leche",
  "soft-berry-stain": "Tinte baya suave",
  "soft-editorial": "Editorial suave",
  "soft-matte-everyday": "Mate suave diario",
  "summer-wedding-guest": "Invitada de boda de verano",
  "sunburn-satin-glow": "Glow satinado tostado",
  "vacation-bronze": "Bronce de vacaciones",
  "warm-nude-daily": "Nude cálido diario",
  "watercolor-blush": "Rubor acuarela",
  "wedding-guest": "Invitada de boda",
  "weekend-glow": "Glow de fin de semana",
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
  Airy: "Ligero",
  Brightening: "Iluminador",
  "Camera Ready": "Listo para cámara",
  Clean: "Limpio",
  Dewy: "Luminoso",
  Editorial: "Editorial",
  Effortless: "Sin esfuerzo",
  Glowing: "Brillante",
  Lifted: "Elevado",
  Luminous: "Luminoso",
  Muted: "Apagado",
  Natural: "Natural",
  Polished: "Pulido",
  Professional: "Profesional",
  Quick: "Rápido",
  Radiant: "Radiante",
  Satin: "Satinado",
  Sculpted: "Definido",
  Sheer: "Ligero",
  Soft: "Suave",
  "Soft Focus": "Soft focus",
  "Soft Matte": "Mate suave",
  Velvet: "Terciopelo",
  Warm: "Cálido",
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
    fit: `${title} funciona bien para ${scenarios.join(", ")} cuando quieres verte más pulida sin perder naturalidad.`,
    effect: `Prioriza un acabado ${finishes.join(", ")} para equilibrar piel, mirada, labios y mejillas.`,
    anchors: [
      "Base: capas finas y corrección puntual",
      "Ojos: definición cerca de pestañas y bordes suaves",
      "Labios y mejillas: misma familia de color para unir el rostro",
    ],
    caution:
      "Si el color destaca antes que tus rasgos, baja intensidad o reduce el área.",
    judge: [
      "¿La piel se ve más clara y descansada?",
      "¿Ojos y labios mantienen equilibrio?",
      "¿Los bordes se ven naturales de cerca?",
    ],
  };
}

export const esLocalizations: LookLocalization[] = enLocalizations.map(
  (item) => {
    const id = recipeId(item.marketVariantId);
    const title = titleOverrides[id] ?? item.title;
    const scenarios = mapValues(item.scenarios, scenarioMap);
    const finishLabels = mapValues(item.finishLabels, finishMap);
    return {
      ...item,
      locale: "es-ES",
      title,
      summary: `${title} es un look para ${scenarios.join(", ")} con acabado ${finishLabels.join(", ")}.`,
      imageAltTemplate: `Referencia de maquillaje ${title}`,
      scenarios,
      finishLabels,
      experienceLabel:
        experienceMap[item.experienceLabel] ?? item.experienceLabel,
      advisor: buildAdvisor(title, scenarios, finishLabels),
    };
  },
);
