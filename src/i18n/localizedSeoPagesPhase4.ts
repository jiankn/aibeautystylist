import type {
  LocalizedSeoCategory,
  LocalizedSeoPage,
  LocalizedSeoSection,
} from "./localizedSeoPages";

type Phase4LanguageSlug = "es" | "pt-br";

interface PageSeed {
  readonly languageSlug: Phase4LanguageSlug;
  readonly groupKey: string;
  readonly path: string;
  readonly englishPath: string;
  readonly category: LocalizedSeoCategory;
  readonly keyword: string;
  readonly topic: string;
  readonly angle: string;
  readonly finish: string;
  readonly technique: string;
  readonly caution: string;
  readonly proof: string;
  readonly related?: readonly string[];
  readonly priority?: string;
  readonly intentSections?: readonly LocalizedSeoSection[];
}

interface LanguageCopy {
  readonly faqHeading: string;
  readonly relatedHeading: string;
  title(seed: PageSeed): string;
  description(seed: PageSeed): string;
  hero(seed: PageSeed): string;
  overviewTitle(seed: PageSeed): string;
  overview(seed: PageSeed): readonly string[];
  stepsTitle(seed: PageSeed): string;
  steps(seed: PageSeed): readonly { title: string; body: string }[];
  gridTitle(seed: PageSeed): string;
  grid(seed: PageSeed): readonly { title: string; body: string }[];
  tableTitle(seed: PageSeed): string;
  rows(
    seed: PageSeed,
  ): readonly { label: string; good: string; avoid: string }[];
  decisionTitle(seed: PageSeed): string;
  decisionRows(
    seed: PageSeed,
  ): readonly { label: string; good: string; avoid: string }[];
  highlight(seed: PageSeed): string;
  ctaTitle(seed: PageSeed): string;
  ctaText(seed: PageSeed): string;
  ctaLabel(seed: PageSeed): string;
  faq(seed: PageSeed): readonly { q: string; a: string }[];
}

function normalizePath(pathname: string): string {
  const value = pathname.startsWith("/") ? pathname : `/${pathname}`;
  try {
    const decoded = decodeURI(value);
    return decoded === "/" ? "/" : decoded.replace(/\/+$/, "");
  } catch {
    return value === "/" ? "/" : value.replace(/\/+$/, "");
  }
}

const esCopy: LanguageCopy = {
  faqHeading: "Preguntas frecuentes",
  relatedHeading: "También te puede interesar",
  title: (s) => `${s.keyword}: ${s.angle} | AI Beauty Stylist`,
  description: (s) =>
    `Guía práctica de ${s.keyword}: revisa ${s.topic}, ${s.finish} y ${s.technique} con una vista previa de IA antes de comprar o copiar un tutorial.`,
  hero: (s) =>
    `${s.topic} no se decide solo por una tendencia. Esta página te ayuda a evaluar ${s.keyword} con colores, ubicación y acabado pensados para tu propio rostro.`,
  overviewTitle: (s) => `Qué debe resolver ${s.keyword}`,
  overview: (s) => [
    `${s.keyword} funciona mejor cuando se piensa como una decisión de equilibrio, no como una lista de productos. El subtono, la forma de los ojos, el color natural de labios y la luz diaria cambian mucho el resultado. Por eso, ${s.angle} sirve para elegir mejor antes de aplicar más capas.`,
    `En ${s.topic}, ${s.finish} es más importante que el nombre de la tendencia. Un look que se ve perfecto en una modelo puede verse pesado, gris o demasiado brillante en otra cara. AI Beauty Stylist permite comparar la dirección sobre tu selfie para reducir pruebas innecesarias.`,
    `El resultado ideal debe hacer que el rostro se vea más claro y coherente, sin que el maquillaje sea lo primero que destaque. ${s.technique} convierte una idea general en una elección más personal y fácil de repetir.`,
  ],
  stepsTitle: () => "Cómo probarlo en cuatro pasos",
  steps: (s) => [
    {
      title: "Usa una foto limpia",
      body: `Evita filtros fuertes y contraluz. Para juzgar ${s.topic}, la piel, los ojos y los labios deben verse con luz estable.`,
    },
    {
      title: "Empieza con baja intensidad",
      body: `Toma ${s.finish} como punto de partida y sube el color solo si el rostro sigue equilibrado. En ${s.keyword}, menos producto suele dar más control.`,
    },
    {
      title: "Ajusta la zona clave",
      body: `${s.technique} debe adaptarse a tus párpados, pómulos y forma de labios. Un cambio pequeño de posición puede hacer que el look se vea natural.`,
    },
    {
      title: "Revisa señales de exceso",
      body: `Si aparece ${s.caution}, baja la saturación, reduce el área o cambia la textura antes de descartar todo el look.`,
    },
  ],
  gridTitle: () => "Señales de que el look sí encaja",
  grid: (s) => [
    {
      title: "Color conectado",
      body: `${s.finish} debe conversar con el cuello, el cabello y el color natural de labios.`,
    },
    {
      title: "Rasgos definidos",
      body: `${s.technique} debe aportar estructura sin dejar bordes duros ni sombras en bloque.`,
    },
    {
      title: "Uso real",
      body: `${s.proof} es la prueba práctica: el maquillaje tiene que funcionar fuera del espejo.`,
    },
  ],
  tableTitle: () => "Mejor dirección y errores a evitar",
  rows: (s) => [
    {
      label: "Base",
      good: "Capas finas y corrección puntual",
      avoid: "Cubrir todo el rostro con el mismo grosor",
    },
    {
      label: "Ojos",
      good: `${s.technique} con bordes difuminados`,
      avoid: "Líneas duras que cierran la mirada",
    },
    {
      label: "Labios y mejillas",
      good: `${s.finish} dentro de una misma temperatura de color`,
      avoid: "Dos puntos fuertes compitiendo al mismo tiempo",
    },
  ],
  decisionTitle: () => "Cómo decidir antes de aplicarlo",
  decisionRows: (s) => [
    {
      label: "Si tienes poco tiempo",
      good: `Mantén ${s.finish} como criterio y ajusta solo la zona que cambia más el rostro.`,
      avoid:
        "Probar varios colores y texturas a la vez hasta perder de vista qué mejora el resultado.",
    },
    {
      label: "Si habrá fotos",
      good: `Comprueba ${s.proof} y después cambia solo intensidad, brillo o área principal.`,
      avoid:
        "Decidir solo por el espejo de cerca, porque la cámara y la luz interior pueden endurecer el look.",
    },
    {
      label: "Si se ve forzado",
      good: `Simplifica ${s.technique} y baja bordes, saturación o cobertura antes de cambiar todo.`,
      avoid: `Compensar ${s.caution} con más producto o con un color todavía más fuerte.`,
    },
  ],
  highlight: (s) =>
    `${s.keyword} está bien logrado cuando primero se nota la armonía del rostro. Si ${s.caution} domina la imagen, conviene bajar color, rango o textura.`,
  ctaTitle: (s) => `Prueba ${s.keyword} en tu rostro`,
  ctaText: (s) =>
    `Sube una selfie y compara cómo se ve ${s.topic} con tu tono de piel, forma de rostro y luz habitual.`,
  ctaLabel: () => "Probar gratis",
  faq: (s) => [
    {
      q: `¿${s.keyword} sirve para principiantes?`,
      a: `Sí. Empieza con pocas variables: base ligera, un punto de color y una ubicación clara. La vista previa ayuda a detectar si el look se vuelve demasiado intenso.`,
    },
    {
      q: "¿Cómo evito que se vea recargado?",
      a: `Para ${s.topic}, trabaja en capas finas y conserva un solo foco. Si notas ${s.caution}, reduce intensidad antes de añadir más producto.`,
    },
    {
      q: "¿Por qué el mismo look se ve diferente en cada persona?",
      a: `El subtono, la textura de piel, la forma de ojos y el contraste natural cambian ${s.keyword}. Por eso conviene probarlo sobre tu propio rostro.`,
    },
  ],
};

const ptBrCopy: LanguageCopy = {
  faqHeading: "Perguntas frequentes",
  relatedHeading: "Veja também",
  title: (s) => `${s.keyword}: ${s.angle} | AI Beauty Stylist`,
  description: (s) =>
    `Guia prático de ${s.keyword}: veja ${s.topic}, ${s.finish} e ${s.technique} no seu rosto com prévia de IA antes de comprar ou seguir um tutorial.`,
  hero: (s) =>
    `${s.topic} não depende só de tendência. Esta página ajuda a avaliar ${s.keyword} com cor, posição e acabamento pensados para o seu rosto real.`,
  overviewTitle: (s) => `O que ${s.keyword} precisa resolver`,
  overview: (s) => [
    `${s.keyword} dá mais certo quando o objetivo é equilibrar o rosto, não acumular produtos. Subtom, formato dos olhos, cor natural dos lábios e luz do dia mudam bastante o resultado. Por isso, ${s.angle} ajuda a escolher melhor antes de aplicar mais camadas.`,
    `Em ${s.topic}, ${s.finish} pesa mais do que o nome da tendência. Um visual bonito em foto de referência pode ficar pesado, acinzentado ou brilhante demais em outra pessoa. Com AI Beauty Stylist, você compara a direção na sua selfie e evita tentativa sem critério.`,
    `O melhor resultado valoriza o rosto antes de chamar atenção para a maquiagem. ${s.technique} transforma uma ideia genérica em uma escolha mais pessoal, fácil de ajustar e repetir.`,
  ],
  stepsTitle: () => "Como testar em quatro passos",
  steps: (s) => [
    {
      title: "Use uma foto limpa",
      body: `Evite filtro forte e contraluz. Para avaliar ${s.topic}, pele, olhos e lábios precisam aparecer com luz estável.`,
    },
    {
      title: "Comece com pouca intensidade",
      body: `Use ${s.finish} como ponto de partida e aumente cor só se o rosto continuar equilibrado. Em ${s.keyword}, controle costuma importar mais que cobertura.`,
    },
    {
      title: "Ajuste a área principal",
      body: `${s.technique} deve acompanhar seu formato de pálpebra, maçãs do rosto e boca. Pequenas mudanças de posição alteram muito o resultado.`,
    },
    {
      title: "Procure sinais de excesso",
      body: `Se aparecer ${s.caution}, reduza saturação, área ou textura antes de trocar todo o visual.`,
    },
  ],
  gridTitle: () => "Sinais de que combina com você",
  grid: (s) => [
    {
      title: "Cor conectada",
      body: `${s.finish} precisa conversar com pescoço, cabelo e cor natural dos lábios.`,
    },
    {
      title: "Traços valorizados",
      body: `${s.technique} deve dar estrutura sem deixar marca dura ou bloco de sombra.`,
    },
    {
      title: "Contexto real",
      body: `${s.proof} é o teste principal: a maquiagem precisa funcionar fora da tela.`,
    },
  ],
  tableTitle: () => "Melhor caminho e o que evitar",
  rows: (s) => [
    {
      label: "Pele",
      good: "Camadas finas e correção localizada",
      avoid: "Cobrir o rosto todo com a mesma espessura",
    },
    {
      label: "Olhos",
      good: `${s.technique} com transição suave`,
      avoid: "Linha dura que pesa ou fecha o olhar",
    },
    {
      label: "Boca e blush",
      good: `${s.finish} dentro da mesma temperatura de cor`,
      avoid: "Dois focos fortes brigando entre si",
    },
  ],
  decisionTitle: () => "Como decidir antes de aplicar",
  decisionRows: (s) => [
    {
      label: "Quando há pouco tempo",
      good: `Mantenha ${s.finish} como critério e ajuste só a área que muda mais a expressão.`,
      avoid:
        "Testar várias cores e texturas ao mesmo tempo até não saber o que melhorou o resultado.",
    },
    {
      label: "Quando vai ter foto",
      good: `Confira ${s.proof} e depois mexa só em intensidade, brilho ou área principal.`,
      avoid:
        "Decidir apenas pelo espelho de perto, porque câmera e luz interna podem pesar o visual.",
    },
    {
      label: "Quando parece forçado",
      good: `Simplifique ${s.technique} e reduza bordas, saturação ou cobertura antes de trocar tudo.`,
      avoid: `Compensar ${s.caution} com mais produto ou uma cor ainda mais forte.`,
    },
  ],
  highlight: (s) =>
    `${s.keyword} funciona quando a harmonia do rosto aparece antes dos produtos. Se ${s.caution} chamar atenção, diminua cor, extensão ou textura.`,
  ctaTitle: (s) => `Teste ${s.keyword} no seu rosto`,
  ctaText: (s) =>
    `Envie uma selfie e compare como ${s.topic} fica no seu tom de pele, formato de rosto e luz do dia.`,
  ctaLabel: () => "Testar grátis",
  faq: (s) => [
    {
      q: `${s.keyword} é bom para iniciantes?`,
      a: `Sim. Comece com poucas decisões: pele leve, um ponto de cor e posicionamento claro. A prévia ajuda a ver quando o look passa do ponto.`,
    },
    {
      q: "Como evitar um resultado pesado?",
      a: `Para ${s.topic}, trabalhe em camadas finas e mantenha um foco principal. Se notar ${s.caution}, reduza a intensidade antes de acrescentar produto.`,
    },
    {
      q: "Por que o mesmo look muda de pessoa para pessoa?",
      a: `Subtom, textura de pele, formato dos olhos e contraste natural mudam ${s.keyword}. Testar no próprio rosto é mais confiável do que copiar uma referência.`,
    },
  ],
};

const copyByLanguage: Record<Phase4LanguageSlug, LanguageCopy> = {
  es: esCopy,
  "pt-br": ptBrCopy,
};

function priorityForCategory(category: LocalizedSeoCategory): string {
  if (category === "home") return "0.9";
  if (category === "product") return "0.8";
  if (category === "style" || category === "scenario") return "0.7";
  return "0.6";
}

function buildRelatedLinks(seed: PageSeed) {
  const labels: Record<Phase4LanguageSlug, Record<string, string>> = {
    es: {
      "/tryon-free": "Probador virtual",
      "/pricing": "Ver precios",
      "/ai-beauty-advisor": "Asesor de belleza IA",
      "/looks/natural-makeup": "Maquillaje natural",
      "/scenarios/office": "Maquillaje de oficina",
    },
    "pt-br": {
      "/tryon-free": "Teste virtual",
      "/pricing": "Ver preços",
      "/ai-beauty-advisor": "Consultor de beleza IA",
      "/looks/natural-makeup": "Maquiagem natural",
      "/scenarios/office": "Maquiagem para trabalho",
    },
  };
  const defaults = [
    "/tryon-free",
    "/ai-beauty-advisor",
    "/looks/natural-makeup",
    "/scenarios/office",
  ];
  const related = [...new Set([...(seed.related ?? []), ...defaults])].filter(
    (url) => normalizePath(url) !== normalizePath(seed.englishPath),
  );
  return related.slice(0, 5).map((url) => ({
    label: labels[seed.languageSlug][url] ?? url.replace(/^\//, ""),
    url,
  }));
}

function makePage(seed: PageSeed): LocalizedSeoPage {
  const copy = copyByLanguage[seed.languageSlug];
  return {
    languageSlug: seed.languageSlug,
    groupKey: seed.groupKey,
    path: normalizePath(seed.path),
    englishPath: normalizePath(seed.englishPath),
    category: seed.category,
    keyword: seed.keyword,
    topic: seed.topic,
    title: copy.title(seed),
    description: copy.description(seed),
    heroTitle: `${seed.keyword}: ${seed.angle}`,
    heroSubtitle: copy.hero(seed),
    ctaTitle: copy.ctaTitle(seed),
    ctaText: copy.ctaText(seed),
    ctaLabel: copy.ctaLabel(seed),
    faqHeading: copy.faqHeading,
    relatedHeading: copy.relatedHeading,
    sections: [
      {
        kind: "paragraphs",
        title: copy.overviewTitle(seed),
        paragraphs: copy.overview(seed),
      },
      ...(seed.intentSections ?? []),
      {
        kind: "steps",
        title: copy.stepsTitle(seed),
        items: copy.steps(seed),
      },
      {
        kind: "grid",
        title: copy.gridTitle(seed),
        items: copy.grid(seed),
      },
      {
        kind: "table",
        title: copy.tableTitle(seed),
        rows: copy.rows(seed),
      },
      {
        kind: "table",
        title: copy.decisionTitle(seed),
        rows: copy.decisionRows(seed),
      },
      {
        kind: "highlight",
        text: copy.highlight(seed),
      },
    ],
    faq: copy.faq(seed),
    relatedLinks: buildRelatedLinks(seed),
    priority: seed.priority ?? priorityForCategory(seed.category),
    changefreq: seed.category === "home" ? "weekly" : "monthly",
  };
}

const seeds: readonly PageSeed[] = [
  {
    languageSlug: "es",
    groupKey: "home",
    path: "/",
    englishPath: "/",
    category: "home",
    keyword: "colorimetría test",
    topic: "test de colorimetría y colores que favorecen",
    angle: "ver qué colores funcionan antes de elegir maquillaje",
    finish: "acabado natural, limpio y favorecedor",
    technique: "comparar tono de piel, forma del rostro y ocasión",
    caution: "un resultado que parezca filtro",
    proof: "que se vea bien en selfie y con luz diaria",
    related: ["/tryon-free", "/diagnosis", "/discover", "/pricing"],
  },
  {
    languageSlug: "es",
    groupKey: "try-on",
    path: "/probar-maquillaje",
    englishPath: "/tryon-free",
    category: "product",
    keyword: "probador de maquillaje virtual",
    topic: "ver un look de maquillaje sobre tu selfie",
    angle: "probar antes de comprar productos",
    finish: "vista previa realista con textura de piel",
    technique: "adaptar color e intensidad a tus rasgos",
    caution: "decidir solo por una foto de modelo",
    proof: "que el color funcione en tu tono y expresión",
    related: ["/ai-makeup-try-on", "/virtual-makeup-app"],
    intentSections: [
      {
        kind: "paragraphs",
        title: "Prueba de maquillaje online antes de comprar",
        paragraphs: [
          "Quien busca prueba de maquillaje suele querer reducir incertidumbre: saber si un color favorece, si una base se verá pesada o si un look funciona en su propio rostro. Esta página responde esa intención desde una prueba online, no desde una cita presencial con maquillador.",
          "La diferencia práctica es que puedes probar direcciones antes de invertir tiempo o dinero. Sube una selfie limpia, compara intensidad, labios, ojos y acabado, y guarda una referencia visual para decidir si el maquillaje merece pasar a la compra o a una prueba física.",
        ],
      },
      {
        kind: "table",
        title: "Prueba de maquillaje online vs prueba presencial",
        rows: [
          {
            label: "Antes de comprar",
            good: "Usa la prueba online para filtrar tonos, intensidad y estilo general.",
            avoid:
              "Comprar solo porque el color se ve bien en una modelo o en un tutorial.",
          },
          {
            label: "Antes de un evento",
            good: "Prueba varias direcciones en tu selfie y lleva una referencia clara al maquillador.",
            avoid:
              "Llegar a la prueba presencial sin saber si buscas natural, glow o más definición.",
          },
          {
            label: "Cuando no tienes productos",
            good: "Valida familias de color y acabado antes de elegir base, rubor o labial.",
            avoid:
              "Intentar copiar un look completo sin revisar subtono, luz y forma del rostro.",
          },
        ],
      },
    ],
  },
  {
    languageSlug: "es",
    groupKey: "pricing",
    path: "/precios",
    englishPath: "/pricing",
    category: "product",
    keyword: "precios del probador de maquillaje con IA",
    topic: "elegir un plan para probar, guardar y comparar looks",
    angle: "pagar solo por el uso que necesitas",
    finish: "recomendaciones claras sin compra impulsiva",
    technique: "separar pruebas por ocasión y frecuencia",
    caution: "elegir funciones que no usarás",
    proof: "saber cuántos looks quieres guardar al mes",
    related: ["/tryon-free", "/personalized-makeup-recommendation"],
  },
  {
    languageSlug: "es",
    groupKey: "advisor",
    path: "/asesor-belleza-ia",
    englishPath: "/ai-beauty-advisor",
    category: "product",
    keyword: "asesor de belleza con IA",
    topic: "recibir una orientación de maquillaje para tu rostro",
    angle: "convertir rasgos y ocasión en una decisión",
    finish: "look coherente con piel, ojos y labios",
    technique: "priorizar base, color y foco visual",
    caution: "seguir reglas genéricas sin mirar tu cara",
    proof: "que la recomendación se entienda y se pueda repetir",
    related: ["/diagnosis", "/tryon-free"],
  },
  {
    languageSlug: "es",
    groupKey: "recommendation",
    path: "/recomendacion-maquillaje-personalizada",
    englishPath: "/personalized-makeup-recommendation",
    category: "product",
    keyword: "recomendación de maquillaje personalizada",
    topic: "encontrar tonos y acabados que usarías de verdad",
    angle: "reducir compras que no combinan contigo",
    finish: "colores que no apaguen el rostro",
    technique: "comparar varias familias de color en la misma foto",
    caution: "comprar solo por un color viral",
    proof: "que labios, mejillas y ojos se vean conectados",
    related: ["/ai-beauty-advisor", "/pricing"],
  },
  {
    languageSlug: "es",
    groupKey: "style-natural",
    path: "/looks/maquillaje-natural",
    englishPath: "/looks/natural-makeup",
    category: "style",
    keyword: "maquillaje natural",
    topic: "verte arreglada sin que la base pese",
    angle: "mejorar el rostro sin cubrirlo todo",
    finish: "base fina y color suave",
    technique: "corregir por zonas y difuminar bordes",
    caution: "que el corrector se note más que la piel",
    proof: "que funcione de cerca y con luz natural",
    related: ["/scenarios/dia", "/looks/piel-luminosa", "/guides/paso-a-paso"],
    intentSections: [
      {
        kind: "paragraphs",
        title: "Maquillaje natural sin convertirlo en una capa pesada",
        paragraphs: [
          "La búsqueda maquillaje natural suele mezclar tres necesidades: una piel más pareja, color saludable y un acabado que no se note como máscara. Por eso esta página prioriza corrección por zonas, rubor suave y labios fáciles de retocar.",
          "Para que no sea una página fina, el enfoque no es solo mostrar una idea bonita. También se revisa cuándo conviene usar base ligera, cuándo basta con corrector y cómo conectar mejillas, labios y cejas para que el resultado siga siendo natural en luz diaria.",
        ],
      },
      {
        kind: "table",
        title: "Cómo adaptar el maquillaje natural",
        rows: [
          {
            label: "Piel apagada",
            good: "Base fina, rubor crema y labios suaves",
            avoid: "Tapar todo con alta cobertura",
          },
          {
            label: "Piel con brillo",
            good: "Sellar solo zona T y mantener mejillas flexibles",
            avoid: "Matificar toda la cara hasta perder textura",
          },
          {
            label: "Poco tiempo",
            good: "Cejas, corrector puntual y color en labios/mejillas",
            avoid: "Intentar un tutorial completo antes de salir",
          },
        ],
      },
    ],
  },
  {
    languageSlug: "es",
    groupKey: "style-dewy",
    path: "/looks/piel-luminosa",
    englishPath: "/looks/dewy-skin",
    category: "style",
    keyword: "maquillaje glow",
    topic: "crear una piel luminosa sin que parezca grasa",
    angle: "elegir dónde poner brillo",
    finish: "luminosidad fina en pómulos y centro del rostro",
    technique: "hidratar y sellar solo donde hace falta",
    caution: "mezclar brillo bonito con exceso de grasa",
    proof: "que la zona T no se vea quemada en foto",
    related: ["/scenarios/dia", "/for/piel-grasa", "/looks/maquillaje-mate"],
  },
  {
    languageSlug: "es",
    groupKey: "style-no-makeup",
    path: "/looks/maquillaje-sin-maquillaje",
    englishPath: "/looks/no-makeup-makeup",
    category: "style",
    keyword: "maquillaje sin maquillaje",
    topic: "parecer descansada sin señales evidentes de producto",
    angle: "ocultar solo lo necesario",
    finish: "piel real con cejas y labios definidos",
    technique: "usar puntos de corrección en lugar de capa completa",
    caution: "que una zona tapada se vea aislada",
    proof: "que nadie note dónde empieza la base",
  },
  {
    languageSlug: "es",
    groupKey: "style-soft-glam",
    path: "/looks/glam-suave",
    englishPath: "/looks/soft-glam",
    category: "style",
    keyword: "soft glam",
    topic: "dar presencia sin llegar a maquillaje de noche pesado",
    angle: "subir intensidad con bordes suaves",
    finish: "piel pulida, ojos definidos y labios equilibrados",
    technique: "profundizar la esquina externa y suavizar mejillas",
    caution: "que el contorno se vea como una línea",
    proof: "que el look funcione en foto y en persona",
    related: ["/scenarios/noche", "/scenarios/graduacion", "/scenarios/fotos"],
  },
  {
    languageSlug: "es",
    groupKey: "style-matte",
    path: "/looks/maquillaje-mate",
    englishPath: "/looks/matte-makeup",
    category: "style",
    keyword: "maquillaje mate",
    topic: "controlar brillo sin apagar la piel",
    angle: "mantener textura y frescura",
    finish: "mate suave con zonas estratégicas selladas",
    technique: "usar polvo solo en el centro y difuminar",
    caution: "que la piel se vea plana o reseca",
    proof: "que las expresiones no se vean acartonadas",
    related: ["/for/piel-grasa", "/looks/piel-luminosa", "/guides/paso-a-paso"],
  },
  {
    languageSlug: "es",
    groupKey: "style-clean-girl",
    path: "/looks/chica-limpia",
    englishPath: "/looks/clean-girl",
    category: "style",
    keyword: "maquillaje clean girl",
    topic: "lograr una imagen pulida y fresca",
    angle: "ordenar cejas, piel y color sin exceso",
    finish: "piel limpia, cejas peinadas y labios cómodos",
    technique: "usar crema en mejillas y labios para unir tonos",
    caution: "que lo simple parezca incompleto",
    proof: "que combine con peinado y ropa del día",
  },
  {
    languageSlug: "es",
    groupKey: "scenario-day",
    path: "/scenarios/dia",
    englishPath: "/scenarios/day-makeup",
    category: "scenario",
    keyword: "maquillaje de día",
    topic: "verse arreglada con luz natural sin recargar el rostro",
    angle: "priorizar piel fresca, cejas ordenadas y color suave",
    finish: "base ligera, rubor transparente y labios fáciles de retocar",
    technique: "bajar la cobertura y subir solo los puntos que dan vida",
    caution: "que el maquillaje se vea más fuerte al salir a la calle",
    proof: "que funcione en transporte, oficina, universidad y selfie",
    related: [
      "/looks/maquillaje-natural",
      "/looks/piel-luminosa",
      "/guides/paso-a-paso",
    ],
  },
  {
    languageSlug: "es",
    groupKey: "scenario-night",
    path: "/scenarios/noche",
    englishPath: "/scenarios/nighttime",
    category: "scenario",
    keyword: "maquillaje de noche",
    topic: "mantener presencia en luz baja, restaurante o fiesta",
    angle: "subir contraste sin perder equilibrio",
    finish: "ojos más definidos, piel pulida y labios con intención",
    technique: "reforzar la esquina externa, pestañas y rubor para cámara",
    caution: "que el look se vuelva pesado antes de llegar al evento",
    proof: "que luz cálida, flash y movimiento sigan favoreciendo",
    related: [
      "/looks/glam-suave",
      "/scenarios/graduacion",
      "/scenarios/primera-cita",
    ],
  },
  {
    languageSlug: "es",
    groupKey: "scenario-office",
    path: "/scenarios/oficina",
    englishPath: "/scenarios/office",
    category: "scenario",
    keyword: "maquillaje para oficina",
    topic: "verse profesional sin maquillaje pesado",
    angle: "mantener pulcritud durante la jornada",
    finish: "piel uniforme, cejas claras y color discreto",
    technique: "definir ojos con sombra suave en lugar de línea dura",
    caution: "que la cámara de videollamada apague el rostro",
    proof: "que funcione en reuniones y luz de oficina",
  },
  {
    languageSlug: "es",
    groupKey: "scenario-interview",
    path: "/scenarios/entrevista",
    englishPath: "/scenarios/interview",
    category: "scenario",
    keyword: "maquillaje para entrevista",
    topic: "dar una impresión clara y confiable",
    angle: "dejar que la expresión sea protagonista",
    finish: "base estable y color saludable",
    technique: "ordenar cejas, pestañas y labios sin exceso",
    caution: "que brillo o color distraigan",
    proof: "que se vea igual de bien online y presencial",
  },
  {
    languageSlug: "es",
    groupKey: "scenario-date",
    path: "/scenarios/primera-cita",
    englishPath: "/scenarios/first-date",
    category: "scenario",
    keyword: "maquillaje para primera cita",
    topic: "verse natural y favorecida de cerca",
    angle: "sumar suavidad sin perder tu estilo",
    finish: "rubor difuso y labios cómodos",
    technique: "abrir la mirada con pestañas y sombras ligeras",
    caution: "que la luz del restaurante intensifique demasiado el color",
    proof: "que se vea bien a distancia de conversación",
  },
  {
    languageSlug: "es",
    groupKey: "scenario-photo",
    path: "/scenarios/fotos",
    englishPath: "/scenarios/passport-photo",
    category: "scenario",
    keyword: "maquillaje para fotos",
    topic: "conservar color y estructura frente a cámara",
    angle: "compensar lo que la luz borra",
    finish: "base semi mate y rasgos algo más definidos",
    technique: "marcar cejas, línea de pestañas y labios con suavidad",
    caution: "que el flash borre el color",
    proof: "que el rostro no se vea plano en foto frontal",
  },
  {
    languageSlug: "es",
    groupKey: "scenario-graduation",
    path: "/scenarios/graduacion",
    englishPath: "/scenarios/graduation",
    category: "scenario",
    keyword: "maquillaje para graduación",
    topic: "verse bien en ceremonia, fiesta y fotos con flash",
    angle: "equilibrar duración, cámara y comodidad durante muchas horas",
    finish:
      "piel resistente, ojos definidos y labios que combinen con el vestido",
    technique:
      "probar intensidad en selfie, luz natural y flash antes del evento",
    caution: "copiar un maquillaje de fiesta que pese demasiado en tu rostro",
    proof: "que el look siga elegante en foto cercana, escenario y baile",
    related: ["/scenarios/noche", "/looks/glam-suave", "/scenarios/fotos"],
  },
  {
    languageSlug: "es",
    groupKey: "feature-hooded",
    path: "/for/ojos-encapotados",
    englishPath: "/for/hooded-eyes",
    category: "feature",
    keyword: "maquillaje para ojos encapotados",
    topic: "definir el ojo sin esconder el párpado",
    angle: "poner color donde se vea con el ojo abierto",
    finish: "sombra mate suave y pestañas levantadas",
    technique: "decidir la altura de sombra mirando de frente",
    caution: "que el delineado grueso pese el ojo",
    proof: "que la mirada se vea abierta al parpadear",
  },
  {
    languageSlug: "es",
    groupKey: "feature-mature",
    path: "/for/piel-madura",
    englishPath: "/for/mature-skin",
    category: "feature",
    keyword: "maquillaje para piel madura",
    topic: "sumar luz sin marcar textura",
    angle: "favorecer en lugar de cubrir de más",
    finish: "piel flexible y puntos de luz controlados",
    technique: "usar capas finas y cremosas",
    caution: "que el polvo se acumule en líneas",
    proof: "que el rostro se vea descansado al sonreír",
    related: ["/for/piel-grasa", "/looks/piel-luminosa", "/guides/paso-a-paso"],
  },
  {
    languageSlug: "es",
    groupKey: "feature-oily-skin",
    path: "/for/piel-grasa",
    englishPath: "/looks/matte-makeup",
    category: "feature",
    keyword: "maquillaje para piel grasa",
    topic: "controlar brillo sin que la base se vea pesada",
    angle: "separar preparación, textura y sellado por zonas",
    finish: "mate suave en zona T y piel flexible en mejillas",
    technique:
      "usar capas finas, primer puntual y polvo solo donde aparece grasa",
    caution: "cubrir todo el rostro con polvo hasta marcar textura",
    proof: "que la base no se abra en nariz, frente y barbilla",
    related: [
      "/looks/maquillaje-mate",
      "/looks/piel-luminosa",
      "/guides/paso-a-paso",
    ],
  },
  {
    languageSlug: "es",
    groupKey: "feature-olive",
    path: "/for/subtono-oliva",
    englishPath: "/for/olive-skin",
    category: "feature",
    keyword: "maquillaje para subtono oliva",
    topic: "evitar que los tonos se vean grises o naranjas",
    angle: "probar color por armonía real",
    finish: "rosas apagados, beige y tonos tierra equilibrados",
    technique: "comparar labial y rubor en la misma luz",
    caution: "elegir tonos demasiado rosados o anaranjados",
    proof: "que piel, labios y mejillas se vean conectados",
  },
  {
    languageSlug: "es",
    groupKey: "guide-beginner",
    path: "/guides/maquillaje-principiantes",
    englishPath: "/guides/beginner-tutorial",
    category: "guide",
    keyword: "maquillaje para principiantes",
    topic: "aprender una rutina simple que puedas repetir",
    angle: "empezar con pocos productos",
    finish: "piel ordenada y color natural",
    technique: "priorizar base ligera, cejas, pestañas y labios",
    caution: "copiar todos los pasos de un tutorial largo",
    proof: "que puedas repetirlo al día siguiente",
  },
  {
    languageSlug: "es",
    groupKey: "guide-steps",
    path: "/guides/paso-a-paso",
    englishPath: "/guides/apply-step-by-step",
    category: "guide",
    keyword: "maquillaje paso a paso",
    topic: "entender el orden y el propósito de cada paso",
    angle: "dejar de aplicar productos sin criterio",
    finish: "capas limpias y transiciones naturales",
    technique: "definir qué parte del rostro quieres mejorar",
    caution: "mezclar texturas en un orden difícil de corregir",
    proof: "que el método sea estable y repetible",
    intentSections: [
      {
        kind: "paragraphs",
        title: "Maquillaje paso a paso con intención clara",
        paragraphs: [
          "Quien busca maquillaje paso a paso no necesita otra lista genérica de productos. Necesita saber qué va primero, por qué ese paso existe y qué puede omitirse cuando el objetivo es una rutina rápida.",
          "La secuencia recomendada separa preparación, corrección, color y sellado. Así se evita mezclar crema, líquido y polvo en un orden que luego deja parches o hace que el maquillaje se vea pesado.",
        ],
      },
      {
        kind: "table",
        title: "Orden práctico por objetivo",
        rows: [
          {
            label: "Rutina diaria",
            good: "Preparar, corregir, cejas, pestañas y labios",
            avoid: "Contorno, baking y sombras fuertes sin necesidad",
          },
          {
            label: "Piel con textura",
            good: "Capas finas antes de sellar",
            avoid: "Polvo temprano sobre zonas todavía húmedas",
          },
          {
            label: "Foto o evento",
            good: "Probar intensidad en selfie antes de salir",
            avoid: "Subir todo el color en el último minuto",
          },
        ],
      },
    ],
  },
  {
    languageSlug: "es",
    groupKey: "feature-colorimetry-analysis",
    path: "/for/analisis-colorimetria",
    englishPath: "/blog/how-to-determine-skin-undertone",
    category: "feature",
    keyword: "análisis de colorimetría",
    topic: "test de colorimetría, subtono y colores de maquillaje",
    angle: "traducir el resultado en tonos que sí usarías",
    finish: "paleta coherente para base, rubor, ojos y labios",
    technique: "comparar frío, cálido y neutro en la misma selfie",
    caution: "usar una estación de color como respuesta única",
    proof: "que los tonos favorezcan rostro, cuello y luz diaria",
    related: [
      "/personalized-makeup-recommendation",
      "/tryon-free",
      "/looks/natural-makeup",
    ],
    intentSections: [
      {
        kind: "paragraphs",
        title: "Dónde encaja el análisis de colorimetría",
        paragraphs: [
          "El análisis de colorimetría funciona mejor como página de apoyo al test de colorimetría de la home. Aquí la intención no es repetir el test, sino explicar cómo llevar el resultado a maquillaje real.",
          "La página cubre colorimetría en base, rubor, sombras y labios para evitar una respuesta superficial. El usuario debe salir con criterios para elegir tonos y con una acción clara: probarlos sobre su propio rostro.",
        ],
      },
      {
        kind: "table",
        title: "De colorimetría a maquillaje",
        rows: [
          {
            label: "Subtono frío",
            good: "Rosas, malvas y marrones suaves",
            avoid: "Naranjas intensos que apagan la piel",
          },
          {
            label: "Subtono cálido",
            good: "Durazno, coral y tierra equilibrada",
            avoid: "Rosas azulados demasiado fríos",
          },
          {
            label: "Subtono neutro",
            good: "Probar intensidad y contraste antes de comprar",
            avoid: "Elegir solo por el nombre de la estación",
          },
        ],
      },
    ],
  },
  {
    languageSlug: "pt-br",
    groupKey: "home",
    path: "/",
    englishPath: "/",
    category: "home",
    keyword: "coloração pessoal",
    topic: "colorimetria pessoal, cartela de cores e maquiagem",
    angle: "descobrir a paleta antes de escolher o look",
    finish: "acabamento natural, limpo e valorizado",
    technique: "comparar tom de pele, formato do rosto e ocasião",
    caution: "resultado com cara de filtro",
    proof: "ficar bem na selfie e na luz do dia",
    related: ["/tryon-free", "/diagnosis", "/discover", "/pricing"],
  },
  {
    languageSlug: "pt-br",
    groupKey: "try-on",
    path: "/teste-maquiagem",
    englishPath: "/tryon-free",
    category: "product",
    keyword: "teste de maquiagem virtual",
    topic: "visualizar maquiagem na sua selfie",
    angle: "testar antes de comprar produto",
    finish: "prévia realista preservando textura da pele",
    technique: "adaptar cor e intensidade aos seus traços",
    caution: "decidir só por foto de modelo",
    proof: "a cor funcionar no seu tom e expressão",
    related: ["/ai-makeup-try-on", "/virtual-makeup-app"],
  },
  {
    languageSlug: "pt-br",
    groupKey: "pricing",
    path: "/precos",
    englishPath: "/pricing",
    category: "product",
    keyword: "preços do teste de maquiagem com IA",
    topic: "escolher um plano para testar, salvar e comparar looks",
    angle: "pagar pelo uso real",
    finish: "recomendação clara sem compra por impulso",
    technique: "separar testes por ocasião e frequência",
    caution: "assinar recursos que você não vai usar",
    proof: "saber quantos looks quer salvar por mês",
    related: ["/tryon-free", "/personalized-makeup-recommendation"],
  },
  {
    languageSlug: "pt-br",
    groupKey: "advisor",
    path: "/consultor-beleza-ia",
    englishPath: "/ai-beauty-advisor",
    category: "product",
    keyword: "consultor de beleza com IA",
    topic: "receber orientação de maquiagem para seu rosto",
    angle: "transformar traços e ocasião em decisão",
    finish: "look coerente com pele, olhos e boca",
    technique: "priorizar pele, cor e ponto focal",
    caution: "seguir regra genérica sem olhar seu rosto",
    proof: "a recomendação ser clara e repetível",
    related: ["/diagnosis", "/tryon-free"],
  },
  {
    languageSlug: "pt-br",
    groupKey: "recommendation",
    path: "/recomendacao-maquiagem-personalizada",
    englishPath: "/personalized-makeup-recommendation",
    category: "product",
    keyword: "recomendação de maquiagem personalizada",
    topic: "encontrar tons e acabamentos que você usaria de verdade",
    angle: "reduzir compras que não combinam com você",
    finish: "cores que não apagam o rosto",
    technique: "comparar famílias de cor na mesma foto",
    caution: "comprar só porque uma cor viralizou",
    proof: "boca, blush e olhos ficarem conectados",
    related: ["/ai-beauty-advisor", "/pricing"],
  },
  {
    languageSlug: "pt-br",
    groupKey: "feature-colorimetria",
    path: "/for/colorimetria",
    englishPath: "/personalized-makeup-recommendation",
    category: "feature",
    keyword: "colorimetria pessoal",
    topic: "descobrir quais cores favorecem seu rosto",
    angle: "usar a cartela como ponto de partida, não como regra rígida",
    finish: "batom, blush e sombra conectados ao seu tom de pele",
    technique:
      "comparar famílias quentes, frias, claras e profundas na mesma selfie",
    caution: "comprar produto só porque combina com uma estação de cor",
    proof: "o rosto parecer mais descansado sem mudar sua pele real",
    related: [
      "/recomendacao-maquiagem-personalizada",
      "/teste-maquiagem",
      "/consultor-beleza-ia",
    ],
    intentSections: [
      {
        kind: "paragraphs",
        title: "Colorimetria pessoal sem parar na cartela",
        paragraphs: [
          "Colorimetria pessoal tem volume alto, mas a intenção real não termina em saber uma estação. A usuária quer entender quais cores deixam o rosto mais descansado e quais tons de maquiagem valem testar.",
          "Esta página também cobre análise de coloração pessoal e teste de colorimetria como buscas de apoio. O foco é transformar a cartela em decisão prática para batom, blush, sombra e base, sempre validando na selfie.",
        ],
      },
      {
        kind: "table",
        title: "Como usar o teste de colorimetria",
        rows: [
          {
            label: "Batom",
            good: "Comparar nude, rosa, coral e vinho na mesma luz",
            avoid: "Comprar só porque a cor viralizou",
          },
          {
            label: "Blush",
            good: "Conectar temperatura com batom e tom de pele",
            avoid: "Usar uma cor isolada que aparece antes do rosto",
          },
          {
            label: "Base",
            good: "Checar profundidade, subtom e oxidação",
            avoid: "Escolher apenas pela foto da embalagem",
          },
        ],
      },
    ],
  },
  {
    languageSlug: "pt-br",
    groupKey: "style-natural",
    path: "/looks/maquiagem-natural",
    englishPath: "/looks/natural-makeup",
    category: "style",
    keyword: "maquiagem natural",
    topic: "parecer arrumada sem pesar a pele",
    angle: "melhorar o rosto sem cobrir tudo",
    finish: "pele leve e cor suave",
    technique: "corrigir por áreas e esfumar bordas",
    caution: "o corretivo aparecer mais que a pele",
    proof: "funcionar de perto e na luz natural",
    related: [
      "/scenarios/trabalho",
      "/looks/pele-glow",
      "/guides/passo-a-passo",
    ],
    intentSections: [
      {
        kind: "paragraphs",
        title: "Maquiagem natural para rotina real",
        paragraphs: [
          "Maquiagem natural não é ausência de maquiagem. A busca normalmente pede uma pele mais uniforme, aparência descansada e cor suficiente para parecer arrumada sem pesar.",
          "Por isso a página separa correção localizada, blush, sobrancelha e boca em decisões simples. O objetivo é que a usuária consiga adaptar o look para trabalho, luz do dia e selfie sem criar uma rotina longa demais.",
        ],
      },
      {
        kind: "table",
        title: "Ajustes por situação",
        rows: [
          {
            label: "Trabalho",
            good: "Pele leve, sobrancelha penteada e boca confortável",
            avoid: "Contorno marcado ou brilho fora de controle",
          },
          {
            label: "Foto rápida",
            good: "Subir um pouco blush e cílios",
            avoid: "Usar base grossa para compensar câmera",
          },
          {
            label: "Calor",
            good: "Selar centro do rosto e manter creme nas laterais",
            avoid: "Pó em excesso que marca textura",
          },
        ],
      },
    ],
  },
  {
    languageSlug: "pt-br",
    groupKey: "style-dewy",
    path: "/looks/pele-glow",
    englishPath: "/looks/dewy-skin",
    category: "style",
    keyword: "maquiagem pele glow",
    topic: "criar luminosidade sem parecer oleosa",
    angle: "escolher onde colocar brilho",
    finish: "glow fino nos pontos altos do rosto",
    technique: "hidratar e selar só onde precisa",
    caution: "misturar viço bonito com brilho excessivo",
    proof: "a zona T não estourar em foto",
  },
  {
    languageSlug: "pt-br",
    groupKey: "style-no-makeup",
    path: "/looks/maquiagem-sem-maquiagem",
    englishPath: "/looks/no-makeup-makeup",
    category: "style",
    keyword: "maquiagem sem maquiagem",
    topic: "parecer descansada sem marca evidente de produto",
    angle: "esconder só o necessário",
    finish: "pele real com sobrancelha e lábios definidos",
    technique: "corrigir em pontos em vez de cobrir tudo",
    caution: "uma área corrigida ficar isolada",
    proof: "ninguém notar onde a base começa",
  },
  {
    languageSlug: "pt-br",
    groupKey: "style-soft-glam",
    path: "/looks/glam-suave",
    englishPath: "/looks/soft-glam",
    category: "style",
    keyword: "soft glam",
    topic: "dar presença sem pesar como maquiagem de noite",
    angle: "aumentar intensidade com bordas suaves",
    finish: "pele polida, olhos definidos e boca equilibrada",
    technique: "aprofundar o canto externo e suavizar o blush",
    caution: "o contorno aparecer como linha",
    proof: "funcionar em foto e ao vivo",
  },
  {
    languageSlug: "pt-br",
    groupKey: "style-matte",
    path: "/looks/maquiagem-matte",
    englishPath: "/looks/matte-makeup",
    category: "style",
    keyword: "maquiagem matte",
    topic: "controlar brilho sem apagar a pele",
    angle: "manter textura e frescor",
    finish: "matte suave com pontos selados",
    technique: "usar pó só no centro e esfumar",
    caution: "a pele parecer plana ou ressecada",
    proof: "a expressão continuar natural",
  },
  {
    languageSlug: "pt-br",
    groupKey: "style-date-night",
    path: "/looks/encontro-a-noite",
    englishPath: "/looks/date-night",
    category: "style",
    keyword: "maquiagem para encontro à noite",
    topic: "valorizar o rosto em luz baixa",
    angle: "subir contraste sem endurecer",
    finish: "olhos suaves, pele polida e boca confortável",
    technique: "reforçar cílios e cor de lábios com moderação",
    caution: "o look ficar escuro demais em restaurante",
    proof: "a expressão continuar leve de perto",
  },
  {
    languageSlug: "pt-br",
    groupKey: "style-minimal",
    path: "/looks/minimalista",
    englishPath: "/looks/minimalist",
    category: "style",
    keyword: "maquiagem minimalista",
    topic: "usar poucos passos com resultado visível",
    angle: "ficar com o que muda mais o rosto",
    finish: "pele organizada, sobrancelha e boca",
    technique: "usar produto cremoso multiuso em boca e blush",
    caution: "o visual parecer inacabado",
    proof: "funcionar com uma nécessaire pequena",
  },
  {
    languageSlug: "pt-br",
    groupKey: "style-clean-girl",
    path: "/looks/clean-girl",
    englishPath: "/looks/clean-girl",
    category: "style",
    keyword: "maquiagem clean girl",
    topic: "conseguir uma imagem limpa e arrumada",
    angle: "organizar pele, sobrancelhas e cor sem excesso",
    finish: "pele fresca, sobrancelha penteada e lábios confortáveis",
    technique: "usar creme em blush e boca para unir tons",
    caution: "o simples parecer sem acabamento",
    proof: "combinar com cabelo e roupa do dia",
  },
  {
    languageSlug: "pt-br",
    groupKey: "scenario-work",
    path: "/scenarios/trabalho",
    englishPath: "/scenarios/office",
    category: "scenario",
    keyword: "maquiagem para trabalho",
    topic: "parecer profissional sem maquiagem pesada",
    angle: "manter aparência polida durante o dia",
    finish: "pele uniforme, sobrancelhas claras e cor discreta",
    technique: "definir olhos com sombra suave em vez de linha dura",
    caution: "a câmera de reunião apagar o rosto",
    proof: "funcionar em reunião, trajeto e escritório",
  },
  {
    languageSlug: "pt-br",
    groupKey: "scenario-interview",
    path: "/scenarios/entrevista",
    englishPath: "/scenarios/interview",
    category: "scenario",
    keyword: "maquiagem para entrevista",
    topic: "passar uma impressão clara e confiável",
    angle: "deixar a expressão ser protagonista",
    finish: "pele estável e cor saudável",
    technique: "organizar sobrancelhas, cílios e boca sem excesso",
    caution: "brilho ou cor distraírem",
    proof: "ficar bem online e presencialmente",
  },
  {
    languageSlug: "pt-br",
    groupKey: "scenario-date",
    path: "/scenarios/primeiro-encontro",
    englishPath: "/scenarios/first-date",
    category: "scenario",
    keyword: "maquiagem para primeiro encontro",
    topic: "parecer natural e favorecida de perto",
    angle: "somar suavidade sem perder seu estilo",
    finish: "blush difuso e boca confortável",
    technique: "abrir o olhar com cílios e sombra leve",
    caution: "a luz do restaurante deixar a cor forte demais",
    proof: "funcionar na distância de conversa",
  },
  {
    languageSlug: "pt-br",
    groupKey: "scenario-id-photo",
    path: "/scenarios/foto-3x4",
    englishPath: "/scenarios/passport-photo",
    category: "scenario",
    keyword: "maquiagem para foto 3x4",
    topic: "preservar cor e estrutura em foto frontal",
    angle: "compensar o que a luz apaga",
    finish: "pele semi matte e traços um pouco definidos",
    technique: "marcar sobrancelhas, raiz dos cílios e boca suavemente",
    caution: "o flash sumir com a cor",
    proof: "o rosto não ficar chapado na foto",
  },
  {
    languageSlug: "pt-br",
    groupKey: "scenario-wedding",
    path: "/scenarios/casamento-convidada",
    englishPath: "/scenarios/wedding-guest",
    category: "scenario",
    keyword: "maquiagem para casamento convidada",
    topic: "ficar arrumada em cerimônia e fotos",
    angle: "equilibrar elegância e duração",
    finish: "pele resistente, olhos definidos e boca confortável",
    technique: "reforçar cílios e blush para câmera",
    caution: "parecer mais pesada que a ocasião pede",
    proof: "segurar luz do dia, salão e foto em grupo",
  },
  {
    languageSlug: "pt-br",
    groupKey: "scenario-formatura",
    path: "/scenarios/formatura",
    englishPath: "/scenarios/graduation",
    category: "scenario",
    keyword: "maquiagem para formatura",
    topic: "ficar bem na cerimônia, na festa e nas fotos",
    angle: "equilibrar duração, flash e conforto para muitas horas",
    finish:
      "pele resistente, olhos definidos e boca que não briga com o vestido",
    technique:
      "testar a intensidade em selfie, luz natural e flash antes do evento",
    caution: "copiar uma maquiagem de festa que pesa demais no seu rosto",
    proof: "o look continuar elegante em foto de perto, palco e pista",
    related: [
      "/scenarios/casamento-convidada",
      "/looks/glam-suave",
      "/teste-maquiagem",
    ],
  },
  {
    languageSlug: "pt-br",
    groupKey: "scenario-quick",
    path: "/scenarios/rapida-5min",
    englishPath: "/scenarios/quick-5min",
    category: "scenario",
    keyword: "maquiagem rápida 5 minutos",
    topic: "ficar pronta com poucos produtos",
    angle: "seguir a ordem de maior impacto",
    finish: "pele corrigida, sobrancelha e cor",
    technique: "usar o mesmo tom em blush e boca",
    caution: "pressa deixar bordas aparentes",
    proof: "o rosto parecer organizado mesmo com pouco tempo",
  },
  {
    languageSlug: "pt-br",
    groupKey: "feature-hooded",
    path: "/for/olhos-encobertos",
    englishPath: "/for/hooded-eyes",
    category: "feature",
    keyword: "maquiagem para olhos encobertos",
    topic: "definir o olhar sem esconder a pálpebra",
    angle: "colocar cor onde aparece com o olho aberto",
    finish: "sombra matte suave e cílios levantados",
    technique: "decidir a altura da sombra olhando de frente",
    caution: "delineado grosso pesar o olho",
    proof: "o olhar continuar aberto ao piscar",
  },
  {
    languageSlug: "pt-br",
    groupKey: "feature-mature",
    path: "/for/pele-madura",
    englishPath: "/for/mature-skin",
    category: "feature",
    keyword: "maquiagem para pele madura",
    topic: "somar luminosidade sem marcar textura",
    angle: "valorizar em vez de cobrir demais",
    finish: "pele flexível e pontos de luz controlados",
    technique: "usar camadas finas e produtos cremosos",
    caution: "pó acumular em linhas",
    proof: "o rosto parecer descansado ao sorrir",
  },
  {
    languageSlug: "pt-br",
    groupKey: "feature-pele-morena",
    path: "/for/pele-morena",
    englishPath: "/for/dark-skin",
    category: "feature",
    keyword: "maquiagem para pele morena",
    topic: "escolher cores que valorizam pele morena sem apagar o rosto",
    angle: "comparar subtom, contraste e intensidade antes de comprar produto",
    finish: "pele viçosa, blush presente e batom em harmonia com o tom natural",
    technique:
      "testar batom, blush e sombra na mesma luz para evitar tons acinzentados",
    caution: "usar base clara demais ou nude que deixa a boca sem definição",
    proof: "a cor continuar bonita em selfie, luz natural e foto com flash",
  },
  {
    languageSlug: "pt-br",
    groupKey: "feature-olive",
    path: "/for/pele-oliva",
    englishPath: "/for/olive-skin",
    category: "feature",
    keyword: "maquiagem para pele oliva",
    topic: "evitar tons acinzentados ou alaranjados",
    angle: "testar cor pela harmonia real",
    finish: "rosas queimados, bege e terrosos equilibrados",
    technique: "comparar batom e blush na mesma luz",
    caution: "escolher tom rosa ou laranja demais",
    proof: "pele, boca e blush ficarem conectados",
  },
  {
    languageSlug: "pt-br",
    groupKey: "guide-beginner",
    path: "/guides/maquiagem-iniciantes",
    englishPath: "/guides/beginner-tutorial",
    category: "guide",
    keyword: "maquiagem para iniciantes",
    topic: "aprender uma rotina simples e repetível",
    angle: "começar com poucos produtos",
    finish: "pele organizada e cor natural",
    technique: "priorizar pele leve, sobrancelha, cílios e boca",
    caution: "copiar todos os passos de tutorial longo",
    proof: "conseguir repetir no dia seguinte",
  },
  {
    languageSlug: "pt-br",
    groupKey: "guide-steps",
    path: "/guides/passo-a-passo",
    englishPath: "/guides/apply-step-by-step",
    category: "guide",
    keyword: "maquiagem passo a passo",
    topic: "entender a ordem e o objetivo de cada etapa",
    angle: "parar de aplicar produtos sem critério",
    finish: "camadas limpas e transições naturais",
    technique: "definir que área do rosto você quer melhorar",
    caution: "misturar texturas em uma ordem difícil de corrigir",
    proof: "o método ser estável e repetível",
    intentSections: [
      {
        kind: "paragraphs",
        title: "Maquiagem passo a passo sem roteiro inflado",
        paragraphs: [
          "Maquiagem passo a passo precisa explicar ordem e objetivo, não apenas listar produto. O caminho mais útil é preparar, corrigir, colorir, definir e só então selar onde precisa.",
          "A página organiza a rotina para iniciante, dia a dia e foto. Assim o conteúdo responde à busca principal e ainda evita competir com a página de maquiagem básica, que fica focada na rotina curta.",
        ],
      },
      {
        kind: "table",
        title: "Sequência recomendada por uso",
        rows: [
          {
            label: "Dia a dia",
            good: "Preparação, corretivo pontual, sobrancelha, cílios e boca",
            avoid: "Tentar todos os passos de festa",
          },
          {
            label: "Evento",
            good: "Testar intensidade antes e reforçar pontos de foto",
            avoid: "Aumentar cobertura sem ver o conjunto",
          },
          {
            label: "Pele oleosa",
            good: "Texturas finas e pó só no centro",
            avoid: "Selar cedo demais e criar manchas",
          },
        ],
      },
    ],
  },
  {
    languageSlug: "pt-br",
    groupKey: "guide-routine",
    path: "/guides/rotina-basica",
    englishPath: "/guides/beginner-routine",
    category: "guide",
    keyword: "maquiagem básica",
    topic: "montar uma rotina básica de maquiagem para o dia a dia",
    angle: "começar pelo que muda mais o rosto",
    finish: "pele leve, sobrancelha organizada, cílios e boca conectados",
    technique: "preparar a pele e criar camadas finas em poucos passos",
    caution: "uma rotina simples virar uma lista longa de produtos",
    proof: "a maquiagem ficar pronta rápido e durar sem manchar",
    related: [
      "/guides/passo-a-passo",
      "/looks/maquiagem-natural",
      "/teste-maquiagem",
    ],
    intentSections: [
      {
        kind: "paragraphs",
        title: "Maquiagem básica com volume alto e intenção clara",
        paragraphs: [
          "Maquiagem básica tem busca maior que rotina básica de maquiagem porque a usuária quer uma resposta direta: o que comprar, o que aplicar primeiro e o que pode ficar de fora.",
          "Esta página deve funcionar como entrada para iniciantes. Ela cobre uma versão de cinco minutos, uma versão de dez minutos e o ponto em que vale ir para maquiagem passo a passo quando a pessoa quer aprender a ordem completa.",
        ],
      },
      {
        kind: "table",
        title: "O que entra na maquiagem básica",
        rows: [
          {
            label: "5 minutos",
            good: "Corretivo pontual, sobrancelha, cílios e boca/blush",
            avoid: "Base completa, contorno e sombra elaborada",
          },
          {
            label: "10 minutos",
            good: "Base fina, blush, máscara, sobrancelha e batom",
            avoid: "Adicionar produto sem saber o efeito",
          },
          {
            label: "Aprendizado",
            good: "Testar uma etapa por vez na selfie",
            avoid: "Comprar kit grande antes de entender a rotina",
          },
        ],
      },
    ],
  },
];

export const localizedSeoPagesPhase4: readonly LocalizedSeoPage[] =
  seeds.map(makePage);
