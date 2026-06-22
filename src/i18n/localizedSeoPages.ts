import type { LanguageSlug } from "./config";
import {
  footerSeoTargets,
  localizedFooterSeoPages,
} from "./localizedFooterSeoPages";
import { localizedSeoPagesPhase3 } from "./localizedSeoPagesPhase3";
import { localizedSeoPagesPhase4 } from "./localizedSeoPagesPhase4";

export type SeoLanguageSlug =
  | "zh-cn"
  | "de"
  | "fr"
  | "ja"
  | "ko"
  | "zh-tw"
  | "es"
  | "pt-br";
export type Phase2LanguageSlug = Extract<SeoLanguageSlug, "de" | "fr" | "ja">;
export type LocalizedSeoCategory =
  | "home"
  | "product"
  | "style"
  | "scenario"
  | "feature"
  | "guide";

export interface LocalizedSeoSection {
  readonly kind: "paragraphs" | "steps" | "grid" | "table" | "highlight";
  readonly title?: string;
  readonly paragraphs?: readonly string[];
  readonly items?: readonly { title: string; body: string }[];
  readonly rows?: readonly { label: string; good: string; avoid: string }[];
  readonly text?: string;
}

export interface LocalizedSeoAsset {
  readonly src: string;
  readonly alt: string;
  readonly caption: string;
}

export interface LocalizedSeoPage {
  readonly languageSlug: SeoLanguageSlug;
  readonly groupKey: string;
  readonly path: string;
  readonly englishPath: string;
  readonly category: LocalizedSeoCategory;
  readonly keyword: string;
  readonly topic: string;
  readonly title: string;
  readonly description: string;
  readonly heroTitle: string;
  readonly heroSubtitle: string;
  readonly heroImage?: string;
  readonly ogImage?: string;
  readonly contentAssetsHeading?: string;
  readonly contentAssets?: readonly LocalizedSeoAsset[];
  readonly ctaTitle: string;
  readonly ctaText: string;
  readonly ctaLabel: string;
  readonly faqHeading: string;
  readonly relatedHeading: string;
  readonly sections: readonly LocalizedSeoSection[];
  readonly faq: readonly { q: string; a: string }[];
  readonly relatedLinks: readonly { label: string; url: string }[];
  readonly priority: string;
  readonly changefreq: string;
}

interface PageSeed {
  readonly languageSlug: Phase2LanguageSlug;
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

const deCopy: LanguageCopy = {
  faqHeading: "Häufige Fragen",
  relatedHeading: "Weitere passende Seiten",
  title: (s) => `${s.keyword}: ${s.angle} | AI Beauty Stylist`,
  description: (s) =>
    `${s.keyword} als klarer, alltagstauglicher Leitfaden: ${s.topic}, ${s.finish} und ${s.technique} mit KI-Vorschau statt Bauchgefühl planen.`,
  hero: (s) =>
    `${s.topic} braucht keine starre Regel. Diese Seite zeigt, wie du ${s.keyword} mit ruhigen Farben, realistischer Platzierung und einer Vorschau auf deinem eigenen Gesicht entscheidest.`,
  overviewTitle: (s) => `Worum es bei ${s.keyword} wirklich geht`,
  overview: (s) => [
    `${s.keyword} funktioniert am besten, wenn der Look nicht isoliert betrachtet wird. Entscheidend sind Gesichtszüge, Kontrast, Unterton, Licht und der Moment, in dem du den Look tragen willst. ${s.angle} bedeutet deshalb nicht mehr Produkt, sondern bessere Entscheidungen vor dem Auftragen.`,
    `Für ${s.topic} ist ${s.finish} wichtiger als ein Trendname. Ein Look kann auf Social Media schön wirken und im Büro, auf Fotos oder bei Tageslicht trotzdem zu hart sein. AI Beauty Stylist hilft, diese Lücke zu schließen, weil du Varianten auf deinem eigenen Gesicht vergleichst, bevor du Zeit oder Produkte investierst.`,
    `Der praktische Maßstab ist einfach: Der Look soll erkennbar gepflegt wirken, ohne deine natürlichen Proportionen zu überdecken. ${s.technique} ist dabei der Hebel, der aus einer allgemeinen Idee eine persönliche Empfehlung macht.`,
  ],
  stepsTitle: () => "So planst du den Look in vier Schritten",
  steps: (s) => [
    {
      title: "Ausgangsbild neutral halten",
      body: `Nutze ein helles Foto ohne starken Filter und achte darauf, dass Haut, Augenpartie und Lippen gut sichtbar sind. Nur so lässt sich ${s.topic} realistisch beurteilen.`,
    },
    {
      title: "Farbintensität begrenzen",
      body: `Starte mit ${s.finish} und erhöhe die Intensität erst, wenn das Gesicht noch ausgewogen wirkt. Bei ${s.keyword} ist ein sauberer Übergang meist wichtiger als maximale Deckkraft.`,
    },
    {
      title: "Platzierung anpassen",
      body: `${s.technique} sollte sich an deiner Lidform, Wangenhöhe und Lippenform orientieren. Kleine Verschiebungen verändern oft mehr als ein komplett anderes Produkt.`,
    },
    {
      title: "Vorher-nachher vergleichen",
      body: `Prüfe, ob ${s.caution} sichtbar wird. Wenn der Look nur in einem Winkel überzeugt, ist er noch nicht stabil genug für Alltag, Fotos oder einen wichtigen Termin.`,
    },
  ],
  gridTitle: () => "Woran du eine gute Variante erkennst",
  grid: (s) => [
    {
      title: "Farbklima",
      body: `${s.finish} sollte mit Hals, Haarfarbe und natürlicher Lippenfarbe zusammenarbeiten, statt dagegen zu kämpfen.`,
    },
    {
      title: "Kontur",
      body: `${s.technique} gibt Struktur, ohne dass Linien sichtbar bleiben oder das Gesicht schmaler wirken muss als es ist.`,
    },
    {
      title: "Anlass",
      body: `${s.proof} ist der wichtigste Test: Der Look muss in der Situation funktionieren, nicht nur im Spiegel.`,
    },
  ],
  tableTitle: () => "Besser so statt zu viel auf einmal",
  rows: (s) => [
    {
      label: "Teint",
      good: "Dünne Schichten und punktuelle Korrektur",
      avoid: "Vollflächige Deckkraft, die jede Hautstruktur betont",
    },
    {
      label: "Augen",
      good: `${s.technique} mit weichen Übergängen`,
      avoid: "Harte Linien, die Lidform und Blickrichtung verkleinern",
    },
    {
      label: "Lippen/Wangen",
      good: `${s.finish} in einer zusammenhängenden Farbfamilie`,
      avoid: "Mehrere starke Farbakzente ohne klare Priorität",
    },
  ],
  decisionTitle: () => "Entscheidung vor dem Auftragen",
  decisionRows: (s) => [
    {
      label: "Wenn du wenig Zeit hast",
      good: `Bleibe bei ${s.finish} und prüfe nur die Stellen, die im Gesicht sofort auffallen.`,
      avoid:
        "Mehrere neue Farben gleichzeitig testen und danach nicht mehr erkennen, was wirklich geholfen hat.",
    },
    {
      label: "Wenn Fotos wichtig sind",
      good: `${s.proof} separat prüfen und danach Intensität oder Glanz nur punktuell anpassen.`,
      avoid:
        "Den Spiegel als einzigen Maßstab nutzen, obwohl Kamera, Blitz und Abstand die Wirkung verändern.",
    },
    {
      label: "Wenn der Look kippt",
      good: `${s.technique} vereinfachen und zuerst die Übergänge weicher machen.`,
      avoid: `${s.caution} ignorieren und mit mehr Produkt ausgleichen wollen.`,
    },
  ],
  highlight: (s) =>
    `Merke: ${s.keyword} ist dann gelungen, wenn zuerst dein Gesicht stimmig wirkt und erst danach einzelne Produkte auffallen. ${s.caution} ist das Signal, die Intensität zu reduzieren.`,
  ctaTitle: (s) => `${s.keyword} auf deinem Gesicht testen`,
  ctaText: (s) =>
    `Lade ein Selfie hoch und vergleiche, wie ${s.topic} mit deiner Gesichtsform, deinem Unterton und deinem Licht wirkt.`,
  ctaLabel: () => "Kostenlos ausprobieren",
  faq: (s) => [
    {
      q: `Ist ${s.keyword} für Anfänger geeignet?`,
      a: `Ja, wenn du mit wenigen Variablen beginnst: ein Teintprodukt, ein weicher Farbakzent und eine klare Platzierung. Die KI-Vorschau hilft dir, Übertreibungen früh zu erkennen.`,
    },
    {
      q: "Welche Produkte brauche ich zuerst?",
      a: `Für ${s.topic} reichen meist Teintausgleich, ein cremiges Wangenprodukt, Mascara oder Brauengel und eine Lippenfarbe. Erst danach lohnt es sich, Spezialprodukte zu ergänzen.`,
    },
    {
      q: "Warum sieht derselbe Look bei mir anders aus?",
      a: `Unterton, Augenform, Hautstruktur und Kontrast verändern die Wirkung. Deshalb bewertet diese Seite ${s.keyword} nicht als starre Vorlage, sondern als anpassbare Richtung.`,
    },
  ],
};

const frCopy: LanguageCopy = {
  faqHeading: "Questions fréquentes",
  relatedHeading: "Pages liées",
  title: (s) => `${s.keyword} : ${s.angle} | AI Beauty Stylist`,
  description: (s) =>
    `${s.keyword} expliqué avec une approche concrète : ${s.topic}, ${s.finish} et ${s.technique} à vérifier sur votre visage avant d'acheter ou de reproduire un tuto.`,
  hero: (s) =>
    `${s.topic} ne se résume pas à une tendance. Ce guide aide à choisir ${s.keyword} avec des couleurs crédibles, des placements adaptés et une prévisualisation IA centrée sur votre visage.`,
  overviewTitle: (s) => `Ce que ${s.keyword} doit vraiment résoudre`,
  overview: (s) => [
    `${s.keyword} réussit quand le maquillage répond à une situation précise. La lumière, le contraste naturel, la forme des yeux et le sous-ton changent beaucoup le résultat. ${s.angle} sert donc à réduire les essais inutiles, pas à imposer une règle unique.`,
    `Pour ${s.topic}, la priorité est ${s.finish}. Un rendu flatteur en photo de produit peut devenir trop marqué dans la vraie vie. La prévisualisation IA donne un point de comparaison plus utile, car elle montre l'équilibre global du visage.`,
    `Le bon résultat doit rester lisible de près comme de loin. ${s.technique} permet de garder de la structure sans perdre la fraîcheur du visage, surtout lorsque le look doit tenir plusieurs heures.`,
  ],
  stepsTitle: () => "Méthode simple en quatre étapes",
  steps: (s) => [
    {
      title: "Partir d'une photo neutre",
      body: `Choisissez une image nette, sans filtre fort, avec le visage bien éclairé. C'est la base pour juger ${s.topic} sans être trompé par la lumière.`,
    },
    {
      title: "Limiter la première intensité",
      body: `Commencez par ${s.finish}, puis augmentez seulement si le visage garde son équilibre. Pour ${s.keyword}, une nuance trop forte se voit très vite.`,
    },
    {
      title: "Ajuster les zones clés",
      body: `${s.technique} doit suivre votre morphologie : paupières, pommettes, contour de la bouche et zones d'ombre naturelles.`,
    },
    {
      title: "Comparer avant de valider",
      body: `Regardez si ${s.caution} apparaît. Si le rendu ne fonctionne que sous un seul angle, mieux vaut adoucir la couleur ou déplacer le point focal.`,
    },
  ],
  gridTitle: () => "Les signaux d'un rendu réussi",
  grid: (s) => [
    {
      title: "Couleur",
      body: `${s.finish} doit s'accorder au cou, aux lèvres naturelles et à la couleur des cheveux.`,
    },
    {
      title: "Placement",
      body: `${s.technique} crée de la définition sans bord visible ni effet masque.`,
    },
    {
      title: "Contexte",
      body: `${s.proof} reste le meilleur test : le maquillage doit servir le moment, pas seulement le miroir.`,
    },
  ],
  tableTitle: () => "À privilégier et à éviter",
  rows: (s) => [
    {
      label: "Teint",
      good: "Corrections fines et texture visible",
      avoid: "Couche uniforme qui fige les expressions",
    },
    {
      label: "Yeux",
      good: `${s.technique} avec des contours diffus`,
      avoid: "Trait trop graphique qui ferme le regard",
    },
    {
      label: "Lèvres/Joues",
      good: `${s.finish} dans une même harmonie`,
      avoid: "Deux accents forts qui se concurrencent",
    },
  ],
  decisionTitle: () => "Comment trancher avant d'appliquer",
  decisionRows: (s) => [
    {
      label: "Temps limité",
      good: `Garder ${s.finish} comme priorité et ne corriger que les zones qui changent vraiment l'équilibre du visage.`,
      avoid:
        "Ajouter plusieurs nouveautés en même temps, puis ne plus savoir ce qui a rendu le résultat plus lourd.",
    },
    {
      label: "Photo ou événement",
      good: `Vérifier ${s.proof}, puis ajuster seulement l'intensité, la brillance ou la zone principale.`,
      avoid:
        "Se fier uniquement au miroir alors que la distance, le flash ou la lumière intérieure modifient le rendu.",
    },
    {
      label: "Résultat trop visible",
      good: `Simplifier ${s.technique} et adoucir les transitions avant de changer toute la routine.`,
      avoid: `Compenser ${s.caution} avec plus de produit ou une couleur encore plus forte.`,
    },
  ],
  highlight: (s) =>
    `Repère utile : ${s.keyword} fonctionne quand on remarque d'abord l'équilibre du visage. Si ${s.caution} domine, le look doit être simplifié.`,
  ctaTitle: (s) => `Tester ${s.keyword} sur votre visage`,
  ctaText: (s) =>
    `Importez une photo et comparez ${s.topic} avec votre sous-ton, votre forme de visage et votre lumière habituelle.`,
  ctaLabel: () => "Essayer gratuitement",
  faq: (s) => [
    {
      q: `${s.keyword} convient-il aux débutantes ?`,
      a: `Oui, si vous commencez par peu de produits et une intention claire. La prévisualisation aide à voir si la couleur, la couvrance ou le placement deviennent trop présents.`,
    },
    {
      q: "Comment éviter un résultat trop chargé ?",
      a: `Pour ${s.topic}, gardez un seul point focal et travaillez en couches fines. Il vaut mieux ajouter un détail que devoir corriger une intensité excessive.`,
    },
    {
      q: "Pourquoi le résultat change-t-il selon les personnes ?",
      a: `Le sous-ton, la forme des yeux, la texture de peau et le contraste naturel modifient ${s.keyword}. C'est précisément pour cela qu'un essai sur votre visage est plus fiable qu'un tuto générique.`,
    },
  ],
};

const jaCopy: LanguageCopy = {
  faqHeading: "よくある質問",
  relatedHeading: "関連ページ",
  title: (s) => `${s.keyword}：${s.angle} | AI Beauty Stylist`,
  description: (s) =>
    `${s.keyword}を自分の顔で考えるガイド。${s.topic}、${s.finish}、${s.technique}をAIプレビューで確認し、似合う方向を絞り込みます。`,
  hero: (s) =>
    `${s.topic}は流行名だけでは決まりません。${s.keyword}を、肌の色、目元の形、光の当たり方に合わせて確認できるように整理しました。`,
  overviewTitle: (s) => `${s.keyword}で大切にしたいこと`,
  overview: (s) => [
    `${s.keyword}は、色を足すことよりも顔全体のバランスを見ることが重要です。肌の明るさ、目元の影、唇の色、普段の服装によって、同じメイクでも印象は大きく変わります。${s.angle}を意識すると、必要な調整が見えやすくなります。`,
    `${s.topic}では${s.finish}が仕上がりを左右します。写真ではきれいに見える濃さでも、日常の光では強く見えることがあります。AI Beauty Stylistでは、自分の顔にのせた状態で比較できるため、失敗しやすい色や位置を事前に確認できます。`,
    `目指すのは、メイクだけが浮かず、表情と一緒に自然に見えることです。${s.technique}を調整すると、同じ色でも印象がやわらかくなり、自分らしさを残した仕上がりになります。`,
  ],
  stepsTitle: () => "試すときの4ステップ",
  steps: (s) => [
    {
      title: "写真の条件を整える",
      body: `強いフィルターを避け、顔全体が明るく見える写真を使います。${s.topic}の判断は、光が安定しているほど正確になります。`,
    },
    {
      title: "最初は薄く見る",
      body: `${s.finish}を基準にして、足りない部分だけ強くします。${s.keyword}は最初から濃くすると、似合う要素が見えにくくなります。`,
    },
    {
      title: "位置を微調整する",
      body: `${s.technique}は目の形、頬の高さ、唇の厚みに合わせて変えます。数ミリの違いでも印象は変わります。`,
    },
    {
      title: "違和感を確認する",
      body: `${s.caution}が目立つ場合は、色を弱めるか範囲を狭くします。自然光と室内光の両方で見るのがおすすめです。`,
    },
  ],
  gridTitle: () => "似合って見えるサイン",
  grid: (s) => [
    {
      title: "色のなじみ",
      body: `${s.finish}が首元や元の唇色とつながって見えると、顔全体が明るく見えます。`,
    },
    {
      title: "立体感",
      body: `${s.technique}で影や光を足しても、線として残らないことが大切です。`,
    },
    {
      title: "使う場面",
      body: `${s.proof}で違和感がなければ、実際の予定にも取り入れやすくなります。`,
    },
  ],
  tableTitle: () => "やること・避けたいこと",
  rows: (s) => [
    {
      label: "ベース",
      good: "薄い補正と必要な部分だけのカバー",
      avoid: "顔全体を同じ厚みで覆うこと",
    },
    {
      label: "目元",
      good: `${s.technique}をぼかしてなじませる`,
      avoid: "強い線で目の形を小さく見せること",
    },
    {
      label: "血色",
      good: `${s.finish}を同じトーンでまとめる`,
      avoid: "頬と唇をどちらも主役にしすぎること",
    },
  ],
  decisionTitle: () => "塗る前に決める判断表",
  decisionRows: (s) => [
    {
      label: "時間がない日",
      good: `${s.finish}を優先し、顔全体ではなく印象が変わる部分だけ確認します。`,
      avoid:
        "新しい色や質感を一度に増やして、どこが似合ったのか分からなくなること。",
    },
    {
      label: "写真に残る日",
      good: `${s.proof}を先に見て、強さ・ツヤ・範囲のどれか一つだけ調整します。`,
      avoid:
        "鏡で近くから見た印象だけで決め、距離や照明で濃く見える可能性を見落とすこと。",
    },
    {
      label: "違和感がある時",
      good: `${s.technique}を簡単にして、境目や色の強さを一段下げます。`,
      avoid: `${s.caution}のまま、さらに重ねて解決しようとすること。`,
    },
  ],
  highlight: (s) =>
    `${s.keyword}は、メイクの存在より先に顔全体の調和が見えると成功です。${s.caution}が気になる場合は、色・範囲・質感のどれかを一段引きます。`,
  ctaTitle: (s) => `${s.keyword}を自分の顔で試す`,
  ctaText: (s) =>
    `写真をアップロードして、${s.topic}が自分の顔立ち、肌色、普段の光でどう見えるか確認できます。`,
  ctaLabel: () => "無料で試す",
  faq: (s) => [
    {
      q: `${s.keyword}は初心者でもできますか？`,
      a: `できます。最初は色数を少なくし、ベース、目元、血色のどれを主役にするか決めると失敗しにくくなります。`,
    },
    {
      q: "濃く見えないようにするには？",
      a: `${s.topic}では、薄い層を重ねて確認することが大切です。AIプレビューで${s.caution}が見えたら、色を弱めるか範囲を狭くします。`,
    },
    {
      q: "同じメイクなのに人によって違うのはなぜ？",
      a: `肌の明るさ、目の形、唇の色、顔の立体感が違うためです。${s.keyword}はテンプレートではなく、自分の特徴に合わせて調整するほうが自然に見えます。`,
    },
  ],
};

const copyByLanguage: Record<Phase2LanguageSlug, LanguageCopy> = {
  de: deCopy,
  fr: frCopy,
  ja: jaCopy,
};

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

function priorityForCategory(category: LocalizedSeoCategory): string {
  if (category === "home") return "0.9";
  if (category === "product") return "0.8";
  if (category === "style" || category === "scenario") return "0.7";
  return "0.6";
}

function buildRelatedLinks(seed: PageSeed) {
  const labels: Record<Phase2LanguageSlug, Record<string, string>> = {
    de: {
      "/tryon-free": "Virtuell testen",
      "/pricing": "Preise ansehen",
      "/ai-beauty-advisor": "Make-up Beratung",
      "/looks/natural-makeup": "Natürliches Make-up",
      "/scenarios/office": "Büro Make-up",
    },
    fr: {
      "/tryon-free": "Essai virtuel",
      "/pricing": "Tarifs",
      "/ai-beauty-advisor": "Conseil maquillage",
      "/looks/natural-makeup": "Maquillage naturel",
      "/scenarios/office": "Maquillage bureau",
    },
    ja: {
      "/tryon-free": "バーチャルメイク",
      "/pricing": "料金を見る",
      "/ai-beauty-advisor": "AIメイク診断",
      "/looks/natural-makeup": "ナチュラルメイク",
      "/scenarios/office": "オフィスメイク",
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

const seeds: readonly PageSeed[] = [
  {
    languageSlug: "de",
    groupKey: "home",
    path: "/",
    englishPath: "/",
    category: "home",
    keyword: "Farbtyp bestimmen",
    topic: "Farbberatung, Unterton und welcher Farbtyp bin ich",
    angle: "Make-up Farben direkt auf deinem Selfie prüfen",
    finish: "ein natürlicher, gepflegter Eindruck",
    technique: "sanfte Platzierung von Teint, Augen und Lippen",
    caution: "ein Filtereffekt oder zu harte Kontraste",
    proof: "Tageslicht, Selfie und Terminrealität",
    related: ["/tryon-free", "/discover", "/diagnosis", "/pricing"],
  },
  {
    languageSlug: "de",
    groupKey: "try-on",
    path: "/try-on",
    englishPath: "/tryon-free",
    category: "product",
    keyword: "virtuelles Make-up Testen",
    topic: "Make-up Varianten direkt auf deinem Selfie",
    angle: "Looks prüfen, bevor du Produkte kaufst",
    finish: "realistische Hautstruktur statt Beauty-Filter",
    technique: "Vorher-nachher Vergleich mit klarer Lichtkontrolle",
    caution: "Farben nur auf einem Modell funktionieren",
    proof: "dein eigenes Foto mit deinem Unterton",
    related: ["/ai-makeup-try-on", "/virtual-makeup-app", "/ai-beauty-advisor"],
  },
  {
    languageSlug: "de",
    groupKey: "pricing",
    path: "/pricing",
    englishPath: "/pricing",
    category: "product",
    keyword: "persönliche Make-up Beratung",
    topic: "Abo, Credits und Beauty-Beratung planen",
    angle: "entscheiden, welches Paket zu deinem Nutzungsverhalten passt",
    finish: "transparente Empfehlungen ohne Produktdruck",
    technique: "Credits nach Anlass, Häufigkeit und Detailtiefe einteilen",
    caution: "ein Plan mehr kostet, als du wirklich nutzt",
    proof: "wie oft du Looks testen oder speichern willst",
    related: ["/tryon-free", "/personalized-makeup-recommendation"],
  },
  {
    languageSlug: "de",
    groupKey: "tutorial",
    path: "/tutorial",
    englishPath: "/guides/beginner-tutorial",
    category: "guide",
    keyword: "Make-up für Anfänger",
    topic: "eine einfache Reihenfolge für den ersten sicheren Look",
    angle: "ohne überfüllte Routine starten",
    finish: "sauberer Teint, weiche Augen und frische Lippen",
    technique: "Schritte nach Wirkung statt nach Produktlisten ordnen",
    caution: "zu viele Produkte gleichzeitig getestet werden",
    proof: "du den Look in zehn Minuten wiederholen kannst",
    related: ["/guides/beginner-routine", "/guides/apply-step-by-step"],
  },
  {
    languageSlug: "de",
    groupKey: "membership",
    path: "/membership",
    englishPath: "/personalized-makeup-recommendation",
    category: "product",
    keyword: "Farbberatung online",
    topic: "Unterton, Kontrast und passende Produktfarben",
    angle: "Empfehlungen speichern und gezielt vergleichen",
    finish: "Farben, die neben Haut und Lippen ruhig wirken",
    technique: "Farbgruppen nach Selfie, Anlass und Präferenz sortieren",
    caution: "Trendfarben deinen Unterton überdecken",
    proof: "mehrere Looks in derselben Farbfamilie stabil bleiben",
    related: ["/ai-beauty-advisor", "/pricing"],
  },
  {
    languageSlug: "de",
    groupKey: "style-natural",
    path: "/looks/natürlich",
    englishPath: "/looks/natural-makeup",
    category: "style",
    keyword: "Natürliches Make-up",
    topic: "ein frischer Look, der nicht geschminkt aussieht",
    angle: "deine Haut sichtbar lassen",
    finish: "transparenter Teint und leise Farbübergänge",
    technique: "Cremeprodukte dünn einarbeiten",
    caution: "Puder oder Concealer die Haut flach wirken lassen",
    proof: "Nahaufnahme und Tageslicht gleich ruhig wirken",
  },
  {
    languageSlug: "de",
    groupKey: "style-minimal",
    path: "/looks/dezent",
    englishPath: "/looks/minimalist",
    category: "style",
    keyword: "Dezent Schminken",
    topic: "ein reduzierter Look für Arbeit, Uni oder Alltag",
    angle: "wenige Produkte mit sichtbarer Wirkung nutzen",
    finish: "leichte Definition ohne harte Linien",
    technique: "Brauen, Wimpern und Wangen als Hauptachsen setzen",
    caution: "der Look unfertig statt bewusst reduziert wirkt",
    proof: "du ihn ohne Spiegelstress auffrischen kannst",
  },
  {
    languageSlug: "de",
    groupKey: "style-elegant",
    path: "/looks/elegant",
    englishPath: "/looks/soft-glam",
    category: "style",
    keyword: "Elegantes Make-up",
    topic: "ein gepflegter Look für Abend, Dinner oder Event",
    angle: "weich glamourös statt schwer geschminkt wirken",
    finish: "satinierter Teint und definierte Augen",
    technique: "Schimmer sparsam an Lichtpunkten platzieren",
    caution: "Glamour die Gesichtszüge überdeckt",
    proof: "Fotos mit Blitz und Innenlicht stabil bleiben",
  },
  {
    languageSlug: "de",
    groupKey: "scenario-office",
    path: "/scenarios/buero",
    englishPath: "/scenarios/office",
    category: "scenario",
    keyword: "Make-up fürs Büro",
    topic: "ein professioneller Look für lange Arbeitstage",
    angle: "frisch aussehen, ohne zu auffällig zu sein",
    finish: "haltbarer Teint mit kontrolliertem Glanz",
    technique: "Augen weich definieren und Lippen neutral halten",
    caution: "Kamera oder Neonlicht den Teint grau macht",
    proof: "Meetings, Bildschirm und Tageslicht zusammenpassen",
  },
  {
    languageSlug: "de",
    groupKey: "scenario-interview",
    path: "/scenarios/vorstellungsgespraech",
    englishPath: "/scenarios/interview",
    category: "scenario",
    keyword: "Vorstellungsgespräch Make-up",
    topic: "ein ruhiger, kompetenter Eindruck im Gespräch",
    angle: "Aufmerksamkeit auf Gesicht und Stimme lenken",
    finish: "klarer Teint und matte, gepflegte Details",
    technique: "Rötungen neutralisieren und Augen offen halten",
    caution: "ein Lippen- oder Augenakzent ablenkt",
    proof: "der Look auf Webcam und vor Ort gleich wirkt",
  },
  {
    languageSlug: "de",
    groupKey: "scenario-date",
    path: "/scenarios/date",
    englishPath: "/scenarios/first-date",
    category: "scenario",
    keyword: "Date Make-up",
    topic: "ein nahbarer Look für ein erstes Treffen",
    angle: "weich, frisch und trotzdem du selbst bleiben",
    finish: "lebendige Wangen und leichte Lippenfarbe",
    technique: "Wärme im Gesicht aufbauen, ohne Konturen zu überziehen",
    caution: "der Look im Restaurantlicht zu dunkel wird",
    proof: "Nahdistanz und Selfie beide natürlich wirken",
  },
  {
    languageSlug: "de",
    groupKey: "scenario-wedding-guest",
    path: "/scenarios/hochzeit",
    englishPath: "/scenarios/wedding-guest",
    category: "scenario",
    keyword: "Hochzeit Make-up Gast",
    topic: "ein festlicher Look, der nicht mit der Braut konkurriert",
    angle: "fototauglich und elegant bleiben",
    finish: "sanfter Glow und lange Haltbarkeit",
    technique: "Wangen, Augen und Lippen in einer Farbfamilie halten",
    caution: "Blitzlicht Glanz oder Textur betont",
    proof: "Zeremonie, Essen und Tanz überstehen",
    related: ["/scenarios/braut", "/looks/elegant", "/for/hauttyp-bestimmen"],
  },
  {
    languageSlug: "de",
    groupKey: "scenario-bridal",
    path: "/scenarios/braut",
    englishPath: "/scenarios/bridal-makeup",
    category: "scenario",
    keyword: "Braut Make-up",
    topic:
      "einen haltbaren Hochzeitslook für Standesamt, Fotos und Feier planen",
    angle:
      "vor dem Termin prüfen, welche Intensität auf dem eigenen Gesicht elegant wirkt",
    finish:
      "strahlender Teint, weiche Augen und Lippen, die Kuss und Fotos überstehen",
    technique: "Tageslicht, Blitz und Innenlicht getrennt vergleichen",
    caution: "ein Trendlook auf Fotos schwerer wirkt als im Spiegel",
    proof: "Nahaufnahme, Gruppenfoto und Abendlicht zusammenpassen",
    related: [
      "/scenarios/hochzeit",
      "/looks/elegant",
      "/for/hauttyp-bestimmen",
      "/try-on",
    ],
  },
  {
    languageSlug: "de",
    groupKey: "scenario-quick",
    path: "/scenarios/schnell-morgens",
    englishPath: "/scenarios/quick-5min",
    category: "scenario",
    keyword: "Schnelles Make-up morgens",
    topic: "ein fertiger Eindruck in wenigen Minuten",
    angle: "die drei wirksamsten Schritte zuerst setzen",
    finish: "wacher Teint und geordnete Brauen",
    technique: "Multitasking-Produkte für Wangen und Lippen nutzen",
    caution: "Eile zu sichtbaren Kanten führt",
    proof: "der Look auch ohne perfektes Licht funktioniert",
  },
  {
    languageSlug: "de",
    groupKey: "feature-round-face",
    path: "/for/rundes-gesicht",
    englishPath: "/for/round-face",
    category: "feature",
    keyword: "Make-up für runde Gesichter",
    topic: "mehr Länge und sanfte Struktur im Gesicht",
    angle: "Kontur ohne harte Schatten setzen",
    finish: "vertikale Lichtpunkte und weiche Wangenfarbe",
    technique: "Blush leicht nach oben ziehen",
    caution: "runde Flächen durch zentralen Glanz breiter wirken",
    proof: "Frontansicht und Dreiviertelansicht ausgewogen bleiben",
  },
  {
    languageSlug: "de",
    groupKey: "feature-hooded-eyes",
    path: "/for/schlupflider",
    englishPath: "/for/hooded-eyes",
    category: "feature",
    keyword: "Make-up für Schlupflider",
    topic: "sichtbare Definition bei wenig Lidfläche",
    angle: "den Blick öffnen, ohne dicke Linien",
    finish: "weiche Schatten oberhalb der Lidfalte",
    technique: "Mascara und Lidschatten bei geöffnetem Auge platzieren",
    caution: "Eyeliner auf dem beweglichen Lid verschwindet",
    proof: "der Blick auch frontal offen wirkt",
  },
  {
    languageSlug: "de",
    groupKey: "feature-mature-skin",
    path: "/for/reife-haut",
    englishPath: "/for/mature-skin",
    category: "feature",
    keyword: "Make-up für reife Haut",
    topic: "Frische und Definition ohne schwere Textur",
    angle: "Leuchtkraft statt Deckkraft priorisieren",
    finish: "cremige Produkte und gezielter Puder",
    technique: "feine Linien nicht mit Produkt füllen",
    caution: "matte Schichten Trockenheit betonen",
    proof: "Mimik natürlich bleibt",
  },
  {
    languageSlug: "de",
    groupKey: "feature-lipstick-color",
    path: "/for/lippenstift-farbe",
    englishPath: "/blog/lipstick-color-comparison",
    category: "feature",
    keyword: "Welche Lippenstiftfarbe passt zu mir",
    topic: "Lippenfarben nach Unterton und Kontrast auswählen",
    angle: "Fehlkäufe durch Voransicht vermeiden",
    finish: "Farbe, die Zähne, Haut und Augen ruhiger wirken lässt",
    technique: "Rosenholz, Beere, Koralle oder Nude gezielt vergleichen",
    caution: "der Lippenstift vor dem Gesicht wahrgenommen wird",
    proof: "dünn und deckend aufgetragen stimmig bleibt",
    related: [
      "/for/hauttyp-bestimmen",
      "/tryon-free",
      "/personalized-makeup-recommendation",
    ],
    intentSections: [
      {
        kind: "paragraphs",
        title: "Welcher Lippenstift passt zu mir?",
        paragraphs: [
          "Die Suche welcher Lippenstift passt zu mir ist keine reine Produktfrage. Entscheidend sind Unterton, natürliche Lippenfarbe, Zahnwirkung und wie viel Kontrast dein Gesicht verträgt.",
          "Diese Seite trennt deshalb Alltagsfarbe, Statement-Farbe und Foto-Lippenstift. So entsteht mehr Nutzwert als bei einer Liste beliebter Nuancen, weil jede Farbe gegen dein eigenes Gesicht geprüft wird.",
        ],
      },
      {
        kind: "table",
        title: "Lippenfarbe nach Wirkung auswählen",
        rows: [
          {
            label: "Alltag",
            good: "Rosenholz, Soft Nude oder gedämpftes Korall",
            avoid: "Zu helle Nudes, die die Lippen verschwinden lassen",
          },
          {
            label: "Frischer wirken",
            good: "Blush und Lippen in derselben Farbfamilie testen",
            avoid: "Kühlen Lippenstift mit sehr warmem Rouge mischen",
          },
          {
            label: "Fotos",
            good: "Deckkraft und Rand in Selfie-Licht prüfen",
            avoid: "Nur Handrücken-Swatch als Entscheidung nutzen",
          },
        ],
      },
    ],
  },
  {
    languageSlug: "de",
    groupKey: "feature-undertone",
    path: "/for/hauttyp-bestimmen",
    englishPath: "/blog/how-to-determine-skin-undertone",
    category: "feature",
    keyword: "welche Farbe steht mir",
    topic:
      "Hauttyp und Unterton bestimmen, um Basis, Rouge und Lippenfarbe sicherer zu wählen",
    angle: "Farben nach kühl, warm oder neutral praktisch einordnen",
    finish: "Farben, die nicht grau oder orange kippen",
    technique: "mehrere Farbfamilien im gleichen Licht vergleichen",
    caution: "ein einzelner Venentest zu falschen Schlüssen führt",
    proof: "Foundation und Lippenfarbe nebeneinander harmonieren",
    related: ["/for/lippenstift-farbe", "/membership", "/try-on"],
    intentSections: [
      {
        kind: "paragraphs",
        title: "Unterton Haut bestimmen und Foundation Farbe finden",
        paragraphs: [
          "Welche Farbe steht mir ist die breite Frage. Dahinter stehen oft drei konkrete Suchintentionen: Unterton Haut bestimmen, Foundation Farbe finden und herausfinden, welches Make-up passt zu mir.",
          "Diese Seite beantwortet die Frage deshalb nicht mit einer starren Typisierung. Sie zeigt, wie du warme, kühle und neutrale Farbfamilien unter gleichem Licht vergleichst und danach Lippen, Rouge und Foundation zusammen prüfst.",
        ],
      },
      {
        kind: "table",
        title: "Farben nach Unterton prüfen",
        rows: [
          {
            label: "Kühler Unterton",
            good: "Rosenholz, Mauve, weiche Beeren und neutrale Base",
            avoid: "Sehr gelbe Foundation oder orange Lippenfarbe",
          },
          {
            label: "Warmer Unterton",
            good: "Pfirsich, Koralle, warmer Beige-Ton",
            avoid: "Bläuliche Rosatöne, die den Teint grau machen",
          },
          {
            label: "Neutral/Olive",
            good: "Sättigung und Tiefe getrennt testen",
            avoid: "Nur nach hell/dunkel wählen",
          },
        ],
      },
    ],
  },
  {
    languageSlug: "fr",
    groupKey: "home",
    path: "/",
    englishPath: "/",
    category: "home",
    keyword: "test colorimétrie",
    topic: "colorimétrie test, palette et couleurs de maquillage",
    angle: "vérifier les couleurs sur votre visage",
    finish: "rendu naturel, lumineux et crédible",
    technique: "comparaison avant-après avec sous-ton et contexte",
    caution: "un filtre embellit sans aider à choisir",
    proof: "lumière du jour, selfie et usage réel concordent",
    related: ["/tryon-free", "/diagnosis", "/discover", "/pricing"],
  },
  {
    languageSlug: "fr",
    groupKey: "try-on",
    path: "/try-on",
    englishPath: "/tryon-free",
    category: "product",
    keyword: "essai virtuel maquillage",
    topic: "tester plusieurs styles sur votre photo",
    angle: "comparer avant d'acheter",
    finish: "texture de peau réaliste",
    technique: "adaptation de la couleur aux traits du visage",
    caution: "un rendu modèle ne se transpose pas à votre visage",
    proof: "votre propre photo sert de référence",
    related: ["/virtual-makeup-app", "/ai-makeup-try-on"],
  },
  {
    languageSlug: "fr",
    groupKey: "pricing",
    path: "/pricing",
    englishPath: "/pricing",
    category: "product",
    keyword: "conseil maquillage personnalisé",
    topic: "choisir un plan selon vos essais et vos besoins",
    angle: "payer pour les usages réellement utiles",
    finish: "recommandations claires sans surconsommation",
    technique: "organiser les crédits par événement et niveau de détail",
    caution: "un abonnement dépasse votre rythme réel",
    proof: "le nombre de looks sauvegardés justifie le plan",
    related: ["/tryon-free", "/personalized-makeup-recommendation"],
  },
  {
    languageSlug: "fr",
    groupKey: "tutorial",
    path: "/tutorial",
    englishPath: "/guides/beginner-tutorial",
    category: "guide",
    keyword: "maquillage pour débutantes",
    topic: "apprendre une routine simple et répétable",
    angle: "commencer sans liste interminable de produits",
    finish: "teint frais, regard défini et lèvres faciles",
    technique: "classer les gestes par effet visible",
    caution: "trop de nouveautés rendent le résultat difficile à comprendre",
    proof: "vous pouvez refaire le look sans tutoriel",
    related: ["/guides/easy-everyday", "/guides/apply-step-by-step"],
  },
  {
    languageSlug: "fr",
    groupKey: "membership",
    path: "/membership",
    englishPath: "/personalized-makeup-recommendation",
    category: "product",
    keyword: "diagnostic de sous-ton",
    topic: "trouver les couleurs cohérentes avec votre peau",
    angle: "conserver des recommandations qui évoluent avec vos essais",
    finish: "nuances qui ne grisent pas le teint",
    technique: "comparer froid, chaud et neutre sur la même photo",
    caution: "un seul test de couleur donne une conclusion trop rapide",
    proof: "teint, blush et rouge à lèvres restent cohérents",
    related: ["/ai-beauty-advisor", "/pricing"],
  },
  {
    languageSlug: "fr",
    groupKey: "style-natural",
    path: "/looks/naturel",
    englishPath: "/looks/natural-makeup",
    category: "style",
    keyword: "maquillage naturel",
    topic: "un visage frais, lumineux et proche de vous",
    angle: "corriger sans couvrir tout le visage",
    finish: "teint transparent, blush fondu et lèvres faciles",
    technique: "corriger par zones avec des couches fines",
    caution: "la couvrance ou le correcteur se voient avant la peau",
    proof: "le résultat reste discret en pleine lumière",
    related: [
      "/scenarios/jour",
      "/looks/teint-lumineux",
      "/guides/tuto-facile",
    ],
    intentSections: [
      {
        kind: "paragraphs",
        title: "Maquillage naturel sans effet masque",
        paragraphs: [
          "Maquillage naturel est une requête large, mais l'intention est précise : paraître plus fraîche sans que le fond de teint, l'anti-cernes ou la poudre prennent toute la place.",
          "La page traite donc le teint, les sourcils, le blush et les lèvres comme une routine adaptable. Elle évite le contenu mince en montrant quoi faire selon la texture de peau, la lumière du jour et le temps disponible.",
        ],
      },
      {
        kind: "table",
        title: "Adapter le maquillage naturel",
        rows: [
          {
            label: "Peu de temps",
            good: "Anti-cernes ciblé, sourcils, cils et lèvres",
            avoid: "Routine complète qui devient irréaliste",
          },
          {
            label: "Peau texturée",
            good: "Couches fines et poudre seulement au centre",
            avoid: "Couvrance uniforme sur tout le visage",
          },
          {
            label: "Photo ou visio",
            good: "Renforcer légèrement blush et cils",
            avoid: "Rendre le teint plus épais pour compenser la caméra",
          },
        ],
      },
    ],
  },
  {
    languageSlug: "fr",
    groupKey: "style-dewy",
    path: "/looks/teint-lumineux",
    englishPath: "/looks/dewy-skin",
    category: "style",
    keyword: "Teint Lumineux",
    topic: "un éclat maîtrisé sans effet gras",
    angle: "placer la lumière au bon endroit",
    finish: "glow fin sur les zones hautes",
    technique: "hydrater puis poudrer seulement le centre",
    caution: "la brillance agrandit les pores en photo",
    proof: "joues lumineuses et zone T contrôlée",
  },
  {
    languageSlug: "fr",
    groupKey: "style-elegant",
    path: "/looks/elegant",
    englishPath: "/looks/soft-glam",
    category: "style",
    keyword: "Maquillage Élégant",
    topic: "un rendu sophistiqué mais souple",
    angle: "structurer sans durcir",
    finish: "satin doux et regard travaillé",
    technique: "dégradés bruns, lumière fine et bouche nette",
    caution: "le contraste devient trop cérémonial",
    proof: "photo, dîner et lumière intérieure restent flatteurs",
  },
  {
    languageSlug: "fr",
    groupKey: "style-nude",
    path: "/looks/nude",
    englishPath: "/looks/no-makeup-makeup",
    category: "style",
    keyword: "Maquillage Nude",
    topic: "des couleurs proches de votre carnation",
    angle: "corriger sans changer le visage",
    finish: "beige rosé, brun doux ou pêche selon sous-ton",
    technique: "choisir une nuance au-dessus de la couleur naturelle",
    caution: "le nude devient gris ou trop clair",
    proof: "les lèvres ne disparaissent pas sur photo",
  },
  {
    languageSlug: "fr",
    groupKey: "style-evening",
    path: "/looks/soiree",
    englishPath: "/scenarios/nighttime",
    category: "style",
    keyword: "Maquillage de Soirée",
    topic: "un look visible dans une lumière plus basse",
    angle: "ajouter de l'intensité sans perdre l'équilibre",
    finish: "regard plus profond et teint durable",
    technique: "renforcer les cils et le coin externe",
    caution: "le teint devient trop lourd avant la fin de soirée",
    proof: "flash, lumière chaude et mouvement restent propres",
  },
  {
    languageSlug: "fr",
    groupKey: "style-minimal",
    path: "/looks/minimaliste",
    englishPath: "/looks/minimalist",
    category: "style",
    keyword: "Maquillage Minimaliste",
    topic: "un maximum d'effet avec peu de gestes",
    angle: "garder seulement ce qui change le visage",
    finish: "peau nette, sourcils ordonnés et lèvres souples",
    technique: "un produit multi-usage pour joues et lèvres",
    caution: "le look paraît incomplet",
    proof: "le résultat tient dans une trousse compacte",
  },
  {
    languageSlug: "fr",
    groupKey: "style-fresh",
    path: "/looks/teint-frais",
    englishPath: "/looks/glowy",
    category: "style",
    keyword: "Teint Frais",
    topic: "réveiller le visage sans maquillage lourd",
    angle: "donner de la vitalité en quelques points",
    finish: "rose, pêche ou baie très diffus",
    technique: "remonter le blush vers les tempes",
    caution: "la couleur reste posée au centre des joues",
    proof: "le visage semble reposé même en lumière froide",
  },
  {
    languageSlug: "fr",
    groupKey: "style-bridal",
    path: "/looks/mariee",
    englishPath: "/scenarios/wedding-guest",
    category: "style",
    keyword: "Maquillage Mariée",
    topic: "un rendu doux, durable et photographiable",
    angle: "garder l'émotion du visage visible",
    finish: "teint lumineux contrôlé et regard défini",
    technique: "superposer fines couches longue tenue",
    caution: "le maquillage vieillit sous le flash",
    proof: "cérémonie, photos et repas restent cohérents",
  },
  {
    languageSlug: "fr",
    groupKey: "scenario-office",
    path: "/scenarios/bureau",
    englishPath: "/scenarios/office",
    category: "scenario",
    keyword: "Maquillage pour le Bureau",
    topic: "un look professionnel pour la journée",
    angle: "sembler reposée sans attirer toute l'attention",
    finish: "matité légère et traits adoucis",
    technique: "définir cils et sourcils avant la couleur",
    caution: "néons ou webcam ternissent le teint",
    proof: "réunion, écran et lumière naturelle restent flatteurs",
  },
  {
    languageSlug: "fr",
    groupKey: "scenario-interview",
    path: "/scenarios/entretien",
    englishPath: "/scenarios/interview",
    category: "scenario",
    keyword: "Maquillage Entretien d'Emploi",
    topic: "un visage clair et confiant pour l'entretien",
    angle: "soutenir le regard sans distraire",
    finish: "teint uniforme, lèvres sobres et regard ouvert",
    technique: "neutraliser rougeurs et ombres sous les yeux",
    caution: "un détail trop mode prend le dessus",
    proof: "présentiel et visio donnent le même message",
  },
  {
    languageSlug: "fr",
    groupKey: "scenario-first-date",
    path: "/scenarios/premier-rendez-vous",
    englishPath: "/scenarios/first-date",
    category: "scenario",
    keyword: "Maquillage Premier Rendez-vous",
    topic: "un rendu doux pour une rencontre",
    angle: "montrer votre style sans surjouer",
    finish: "bonne mine et lèvres confortables",
    technique: "placer la couleur près du centre du visage",
    caution: "la bouche ou les yeux deviennent trop dominants",
    proof: "proximité, restaurant et selfie restent naturels",
  },
  {
    languageSlug: "fr",
    groupKey: "scenario-photo",
    path: "/scenarios/photo",
    englishPath: "/scenarios/passport-photo",
    category: "scenario",
    keyword: "Maquillage pour Photo",
    topic: "un maquillage lisible par l'appareil",
    angle: "garder du relief malgré l'éclairage",
    finish: "matité ciblée et couleur légèrement renforcée",
    technique: "définir sourcils, cils et contours doux",
    caution: "le flash efface les nuances trop subtiles",
    proof: "photo frontale et lumière latérale restent équilibrées",
  },
  {
    languageSlug: "fr",
    groupKey: "scenario-wedding-guest",
    path: "/scenarios/mariage",
    englishPath: "/scenarios/wedding-guest",
    category: "scenario",
    keyword: "maquillage invité mariage",
    topic: "un look habillé mais respectueux du contexte",
    angle: "être photogénique sans voler la scène",
    finish: "éclat doux et tenue longue durée",
    technique: "accorder lèvres, joues et tenue",
    caution: "la brillance ressort sur les photos de groupe",
    proof: "cérémonie, repas et soirée tiennent ensemble",
  },
  {
    languageSlug: "fr",
    groupKey: "scenario-day",
    path: "/scenarios/jour",
    englishPath: "/looks/clean-girl",
    category: "scenario",
    keyword: "Maquillage de Jour",
    topic: "un maquillage léger pour la lumière naturelle",
    angle: "rester frais sans retouches complexes",
    finish: "peau souple et couleur transparente",
    technique: "poser les produits là où le visage capte la lumière",
    caution: "le maquillage paraît plus fort dehors",
    proof: "extérieur, transport et bureau restent cohérents",
  },
  {
    languageSlug: "fr",
    groupKey: "feature-round-face",
    path: "/for/visage-rond",
    englishPath: "/for/round-face",
    category: "feature",
    keyword: "Maquillage pour Visage Rond",
    topic: "allonger visuellement sans durcir",
    angle: "placer blush et lumière en diagonale",
    finish: "structure douce sur les pommettes",
    technique: "étirer la couleur vers les tempes",
    caution: "le centre du visage paraît plus large",
    proof: "face et trois-quarts restent équilibrés",
  },
  {
    languageSlug: "fr",
    groupKey: "feature-deep-skin",
    path: "/for/peau-mate",
    englishPath: "/for/dark-skin",
    category: "feature",
    keyword: "Maquillage pour Peau Mate",
    topic: "valoriser la profondeur du teint",
    angle: "éviter les nuances cendrées",
    finish: "couleurs riches et lumière chaude",
    technique: "choisir blush et lèvres avec assez de saturation",
    caution: "les produits trop clairs grisent le visage",
    proof: "teint, cou et lèvres restent harmonieux",
  },
  {
    languageSlug: "fr",
    groupKey: "feature-fair-skin",
    path: "/for/peau-claire",
    englishPath: "/for/fair-skin",
    category: "feature",
    keyword: "Maquillage pour Peau Claire",
    topic: "apporter couleur sans contraste excessif",
    angle: "doser la saturation avec précision",
    finish: "rose, pêche ou taupe en voile",
    technique: "appliquer puis estomper au-delà des bords visibles",
    caution: "une nuance foncée prend toute la place",
    proof: "la peau reste lumineuse et non rougie",
  },
  {
    languageSlug: "fr",
    groupKey: "feature-hooded-eyes",
    path: "/for/paupieres-tombantes",
    englishPath: "/for/hooded-eyes",
    category: "feature",
    keyword: "maquillage pour paupières tombantes",
    topic: "placer fard, liner et lumière là où le regard reste visible",
    angle: "dessiner une zone ouverte au-dessus du pli naturel",
    finish: "regard lifté sans trait épais ni matière qui transfère",
    technique: "travailler les yeux ouverts pour poser l'ombre au bon endroit",
    caution: "le maquillage disparaît dès que les yeux sont ouverts",
    proof: "face au miroir et en selfie, la couleur reste visible",
  },
  {
    languageSlug: "fr",
    groupKey: "feature-mature-skin",
    path: "/for/peau-mature",
    englishPath: "/for/mature-skin",
    category: "feature",
    keyword: "maquillage peau mature",
    topic: "garder fraîcheur et définition sans marquer les ridules",
    angle: "privilégier l'hydratation, la lumière douce et les couches fines",
    finish: "teint souple, blush crème et poudre uniquement ciblée",
    technique: "presser les textures au lieu de les tirer sur la peau",
    caution: "les fonds de teint mats et épais accentuent la texture",
    proof: "sourire, lumière du jour et photo restent flatteurs",
  },
  {
    languageSlug: "fr",
    groupKey: "feature-foundation",
    path: "/for/choisir-fond-de-teint",
    englishPath: "/blog/foundation-caking-troubleshooting",
    category: "feature",
    keyword: "choisir son fond de teint",
    topic: "trouver une teinte, une couvrance et un sous-ton cohérents",
    angle: "éviter démarcation, oxydation et effet matière",
    finish: "fond de teint qui reste relié au cou et à la texture réelle",
    technique: "tester sous-ton, profondeur, couvrance et oxydation",
    caution: "la teinte s'oxyde ou crée une démarcation au cou",
    proof: "cou, visage et lumière du jour correspondent",
    related: ["/for/analyse-colorimetrie", "/tryon-free", "/looks/naturel"],
    intentSections: [
      {
        kind: "paragraphs",
        title: "Choisir son fond de teint avec des critères visibles",
        paragraphs: [
          "Choisir son fond de teint a une intention plus commerciale que les pages de look. La page doit donc aider à réduire les erreurs avant achat : mauvais sous-ton, mauvaise profondeur, couvrance trop lourde ou oxydation.",
          "Le contenu reste honnête : l'outil aide à visualiser une direction de teint et de maquillage, mais ne promet pas de trouver automatiquement une référence exacte de marque.",
        ],
      },
      {
        kind: "table",
        title: "Checklist avant d'acheter",
        rows: [
          {
            label: "Sous-ton",
            good: "Comparer froid, chaud et neutre sur le visage",
            avoid: "Choisir uniquement sur le poignet",
          },
          {
            label: "Profondeur",
            good: "Vérifier visage, cou et lumière du jour",
            avoid: "Prendre une teinte plus claire par habitude",
          },
          {
            label: "Texture",
            good: "Adapter couvrance à la peau réelle",
            avoid: "Ajouter de la couvrance pour masquer chaque détail",
          },
        ],
      },
    ],
  },
  {
    languageSlug: "fr",
    groupKey: "feature-colorimetry-analysis",
    path: "/for/analyse-colorimetrie",
    englishPath: "/blog/how-to-determine-skin-undertone",
    category: "feature",
    keyword: "analyse colorimétrie",
    topic: "colorimétrie en ligne, sous-ton et couleurs de maquillage",
    angle: "passer du diagnostic couleur aux choix de maquillage",
    finish: "palette cohérente pour teint, blush, yeux et lèvres",
    technique: "comparer froid, chaud, neutre et intensité sur la même photo",
    caution: "une saison de couleur remplace l'observation du visage",
    proof: "les couleurs restent flatteuses en selfie et en lumière du jour",
    related: [
      "/personalized-makeup-recommendation",
      "/for/choisir-fond-de-teint",
      "/tryon-free",
    ],
    intentSections: [
      {
        kind: "paragraphs",
        title: "Analyse colorimétrie et colorimétrie en ligne",
        paragraphs: [
          "Cette page soutient le test colorimétrie de la page d'accueil sans le dupliquer. L'objectif est d'expliquer comment une analyse colorimétrie devient utile pour choisir rouge à lèvres, blush, fard et fond de teint.",
          "Colorimétrie en ligne ne doit pas rester une étiquette abstraite. Le contenu relie sous-ton, contraste, saturation et contexte réel afin que l'utilisateur puisse tester les couleurs sur son propre visage.",
        ],
      },
      {
        kind: "table",
        title: "Transformer l'analyse en choix maquillage",
        rows: [
          {
            label: "Lèvres",
            good: "Tester rose, bois de rose, corail ou baie selon sous-ton",
            avoid: "Suivre une couleur tendance sans comparer au visage",
          },
          {
            label: "Blush",
            good: "Relier température du blush et couleur des lèvres",
            avoid: "Choisir une teinte isolée sur la main",
          },
          {
            label: "Teint",
            good: "Vérifier fond de teint avec cou et lumière naturelle",
            avoid: "Utiliser la saison colorimétrique comme seule réponse",
          },
        ],
      },
    ],
  },
  {
    languageSlug: "fr",
    groupKey: "guide-beginner",
    path: "/guides/debutantes",
    englishPath: "/guides/beginner-tutorial",
    category: "guide",
    keyword: "Maquillage pour Débutantes",
    topic: "une première routine sans surcharge",
    angle: "apprendre les gestes dans le bon ordre",
    finish: "résultat propre et facile à corriger",
    technique: "commencer par teint, cils, joues et lèvres",
    caution: "un produit raté oblige à tout recommencer",
    proof: "le look devient répétable en semaine",
  },
  {
    languageSlug: "fr",
    groupKey: "guide-easy",
    path: "/guides/tuto-facile",
    englishPath: "/guides/easy-everyday",
    category: "guide",
    keyword: "Tuto Maquillage Facile",
    topic: "un tutoriel court pour le quotidien",
    angle: "voir rapidement ce qui change le visage",
    finish: "bonne mine simple et nette",
    technique: "utiliser les doigts pour fondre les textures crème",
    caution: "le tuto devient trop long pour être utilisé",
    proof: "vous pouvez le refaire avant de sortir",
  },
  {
    languageSlug: "fr",
    groupKey: "guide-routine",
    path: "/guides/routine-quotidienne",
    englishPath: "/guides/beginner-routine",
    category: "guide",
    keyword: "Routine Maquillage Quotidienne",
    topic: "stabiliser une routine qui vous ressemble",
    angle: "répéter les bons gestes sans réfléchir",
    finish: "teint régulier et points de couleur maîtrisés",
    technique: "préparer une séquence fixe de produits",
    caution: "chaque matin devient une expérimentation",
    proof: "le résultat varie peu d'un jour à l'autre",
  },
  {
    languageSlug: "fr",
    groupKey: "guide-mistakes",
    path: "/guides/erreurs-eviter",
    englishPath: "/guides/mistakes-avoid",
    category: "guide",
    keyword: "Erreurs Maquillage à Éviter",
    topic: "corriger ce qui alourdit le visage",
    angle: "repérer les erreurs avant de changer tous les produits",
    finish: "textures fines et transitions propres",
    technique: "réduire la quantité puis ajuster la zone",
    caution: "vous accusez la couleur alors que la pose est en cause",
    proof: "le même produit paraît meilleur après correction",
  },
  {
    languageSlug: "ja",
    groupKey: "home",
    path: "/",
    englishPath: "/",
    category: "home",
    keyword: "似合うメイク 診断",
    topic: "AIメイク診断とバーチャルメイク",
    angle: "自分に合う方向を先に確認する",
    finish: "自然で清潔感のある仕上がり",
    technique: "顔立ち、肌色、シーンを合わせて比較する",
    caution: "フィルター感が強くなること",
    proof: "日常光と写真の両方で違和感がないこと",
    related: ["/tryon-free", "/diagnosis", "/discover", "/pricing"],
  },
  {
    languageSlug: "ja",
    groupKey: "try-on",
    path: "/try-on",
    englishPath: "/tryon-free",
    category: "product",
    keyword: "バーチャルメイク",
    topic: "自分の写真でメイクを試すこと",
    angle: "買う前に似合うか確認する",
    finish: "肌の質感を残した自然なプレビュー",
    technique: "色と位置を顔立ちに合わせる",
    caution: "モデル画像だけで判断してしまうこと",
    proof: "自分の肌色と表情で見られること",
    related: ["/ai-makeup-try-on", "/virtual-makeup-app"],
  },
  {
    languageSlug: "ja",
    groupKey: "pricing",
    path: "/pricing",
    englishPath: "/pricing",
    category: "product",
    keyword: "AIメイク診断 プラン",
    topic: "診断、保存、比較に使うプラン選び",
    angle: "必要な回数に合わせて選ぶ",
    finish: "無駄な購入を減らす色選び",
    technique: "シーン別に試す回数を分ける",
    caution: "使わない機能まで選ぶこと",
    proof: "保存したいメイク数が明確なこと",
    related: ["/tryon-free", "/personalized-makeup-recommendation"],
  },
  {
    languageSlug: "ja",
    groupKey: "tutorial",
    path: "/tutorial",
    englishPath: "/guides/beginner-tutorial",
    category: "guide",
    keyword: "メイク初心者",
    topic: "基本の順番と失敗しにくい練習",
    angle: "少ない道具で始める",
    finish: "清潔感のあるベースと自然な血色",
    technique: "効果が見えやすい順に進める",
    caution: "一度に多くの工程を足すこと",
    proof: "翌日も同じ手順で再現できること",
    related: ["/guides/beginner-routine", "/guides/apply-step-by-step"],
  },
  {
    languageSlug: "ja",
    groupKey: "membership",
    path: "/membership",
    englishPath: "/personalized-makeup-recommendation",
    category: "product",
    keyword: "似合う色診断",
    topic: "自分に似合うコスメを探すこと",
    angle: "色の方向を保存して比較する",
    finish: "肌がくすみにくい色合わせ",
    technique: "同じ写真で複数の色を見比べる",
    caution: "流行色だけで選ぶこと",
    proof: "リップ、チーク、アイカラーがつながること",
    related: ["/ai-beauty-advisor", "/pricing"],
  },
  {
    languageSlug: "ja",
    groupKey: "feature-personal-color-diagnosis",
    path: "/for/パーソナルカラー",
    englishPath: "/personalized-makeup-recommendation",
    category: "feature",
    keyword: "パーソナルカラー診断",
    topic: "自分に似合う色を顔映りで確かめること",
    angle: "タイプ名だけで決めず、肌が明るく見える方向を比べる",
    finish: "リップ、チーク、アイカラーが自然につながる色合わせ",
    technique: "同じ写真で黄み、青み、明度、彩度を分けて比較する",
    caution: "無料診断のタイプ名だけでコスメを買うこと",
    proof: "顔色が沈まず、首や髪色とも浮かないこと",
    related: [
      "/guides/パーソナルカラー診断",
      "/membership",
      "/try-on",
      "/diagnosis",
    ],
  },
  {
    languageSlug: "ja",
    groupKey: "feature-face-type-diagnosis",
    path: "/for/顔タイプ",
    englishPath: "/personalized-makeup-recommendation",
    category: "feature",
    keyword: "顔タイプ診断",
    topic: "顔立ちに合うメイクの重心を決めること",
    angle: "顔タイプ名をそのまま信じず、眉、目元、唇の位置で調整する",
    finish: "輪郭とパーツの強さがそろった自然な印象",
    technique: "正面写真で余白、目幅、頬の高さ、唇の存在感を比較する",
    caution: "似合うと言われた系統を全部濃く入れること",
    proof: "近距離でも写真でも顔の印象がちぐはぐに見えないこと",
    related: ["/membership", "/try-on", "/looks/垢抜け", "/guides/やり方"],
  },
  {
    languageSlug: "ja",
    groupKey: "style-natural",
    path: "/looks/ナチュラル",
    englishPath: "/looks/natural-makeup",
    category: "style",
    keyword: "ナチュラルメイク",
    topic: "素肌感を残した普段のメイク",
    angle: "作り込みすぎず整える",
    finish: "薄いベースと自然な血色",
    technique: "クリーム系を少量ずつなじませる",
    caution: "カバーしすぎて厚く見えること",
    proof: "近くで見ても境目が出ないこと",
  },
  {
    languageSlug: "ja",
    groupKey: "style-polished",
    path: "/looks/垢抜け",
    englishPath: "/looks/clean-girl",
    category: "style",
    keyword: "垢抜けメイク",
    topic: "今っぽく整った印象を作ること",
    angle: "古く見える重さを抜く",
    finish: "抜け感のある眉と軽いツヤ",
    technique: "眉、まつ毛、血色の位置を更新する",
    caution: "昔の囲み目や濃い色が残ること",
    proof: "服や髪型とも印象がそろうこと",
  },
  {
    languageSlug: "ja",
    groupKey: "style-clear",
    path: "/looks/清楚",
    englishPath: "/looks/no-makeup-makeup",
    category: "style",
    keyword: "清楚メイク",
    topic: "きちんと感とやわらかさの両立",
    angle: "主張を抑えて品よく見せる",
    finish: "透明感のある肌と控えめな目元",
    technique: "ラインよりもまつ毛と影で整える",
    caution: "色が強くなって清楚感が消えること",
    proof: "学校、職場、写真で浮かないこと",
  },
  {
    languageSlug: "ja",
    groupKey: "style-dewy",
    path: "/looks/ツヤ肌",
    englishPath: "/looks/dewy-skin",
    category: "style",
    keyword: "ツヤ肌メイク",
    topic: "うるおって見えるベース作り",
    angle: "光を足す場所を選ぶ",
    finish: "頬の高い位置だけ自然に光る肌",
    technique: "保湿後に中心だけ軽く押さえる",
    caution: "テカリとツヤが混ざること",
    proof: "写真で鼻周りが光りすぎないこと",
  },
  {
    languageSlug: "ja",
    groupKey: "style-matte",
    path: "/looks/マット",
    englishPath: "/looks/matte-makeup",
    category: "style",
    keyword: "マットメイク",
    topic: "さらっと整った肌に見せること",
    angle: "乾燥感を出さずに落ち着かせる",
    finish: "ふんわりした質感と控えめな光",
    technique: "粉を中心だけに使う",
    caution: "肌が平面的に見えること",
    proof: "表情が動いても粉っぽくないこと",
  },
  {
    languageSlug: "ja",
    groupKey: "style-korean",
    path: "/looks/韓国風",
    englishPath: "/looks/glass-skin",
    category: "style",
    keyword: "韓国風メイク",
    topic: "透明感と整ったパーツ感",
    angle: "ツヤと血色を軽く重ねる",
    finish: "薄いベース、涙袋、やわらかいリップ",
    technique: "下まぶたと頬をつなげて見せる",
    caution: "白く明るくしすぎること",
    proof: "肌色に合った透明感が残ること",
  },
  {
    languageSlug: "ja",
    groupKey: "style-drugstore",
    path: "/looks/プチプラ",
    englishPath: "/guides/drugstore-beginners",
    category: "style",
    keyword: "プチプラメイク",
    topic: "手に取りやすいコスメで作るメイク",
    angle: "価格より似合う色を優先する",
    finish: "日常で使いやすい質感",
    technique: "まずリップとチークの色を合わせる",
    caution: "安さだけで色を増やすこと",
    proof: "少ない商品でも統一感が出ること",
  },
  {
    languageSlug: "ja",
    groupKey: "style-translucent",
    path: "/looks/透明感",
    englishPath: "/looks/glowy",
    category: "style",
    keyword: "透明感メイク",
    topic: "くすみを抑えて軽く見せること",
    angle: "白さではなく濁りの少なさを作る",
    finish: "淡い血色と明るい目元",
    technique: "青み、黄み、彩度を顔色で調整する",
    caution: "明るい色で顔が浮くこと",
    proof: "首とのつながりが自然なこと",
  },
  {
    languageSlug: "ja",
    groupKey: "style-no-makeup",
    path: "/looks/ノーメイク風",
    englishPath: "/looks/no-makeup-makeup",
    category: "style",
    keyword: "ノーメイク風メイク",
    topic: "すっぴんに近く見せる補正",
    angle: "塗っている感を出さない",
    finish: "肌色に近い補正と透明な毛流れ",
    technique: "点で隠して面で塗らない",
    caution: "隠した部分だけ浮くこと",
    proof: "近距離でも境目が見えないこと",
  },
  {
    languageSlug: "ja",
    groupKey: "style-adult-natural",
    path: "/looks/大人ナチュラル",
    englishPath: "/for/mature-skin",
    category: "style",
    keyword: "大人ナチュラルメイク",
    topic: "落ち着きと明るさを両立すること",
    angle: "若作りではなく整える",
    finish: "しっとりした肌とやわらかい輪郭",
    technique: "影を足しすぎず光を選ぶ",
    caution: "マットすぎて疲れて見えること",
    proof: "表情がやわらかく見えること",
  },
  {
    languageSlug: "ja",
    groupKey: "style-blood",
    path: "/looks/血色感",
    englishPath: "/looks/date-night",
    category: "style",
    keyword: "血色感メイク",
    topic: "顔色を明るく健康的に見せること",
    angle: "頬と唇の温度をそろえる",
    finish: "内側からにじむような色",
    technique: "チークを広げすぎず中心をぼかす",
    caution: "赤みが強すぎて幼く見えること",
    proof: "室内でも顔色が沈まないこと",
  },
  {
    languageSlug: "ja",
    groupKey: "style-aurora",
    path: "/looks/オーロラ肌",
    englishPath: "/looks/glass-skin",
    category: "style",
    keyword: "オーロラ肌メイク",
    topic: "光を含んだような肌印象",
    angle: "偏光感を上品に使う",
    finish: "細かいツヤと透明感",
    technique: "ハイライトを頬骨と目頭に少量置く",
    caution: "ラメが毛穴を目立たせること",
    proof: "動いたときだけ光が見えること",
  },
  {
    languageSlug: "ja",
    groupKey: "scenario-office",
    path: "/scenarios/オフィス",
    englishPath: "/scenarios/office",
    category: "scenario",
    keyword: "オフィスメイク",
    topic: "仕事の日に使いやすいメイク",
    angle: "清潔感と落ち着きを両立する",
    finish: "控えめなツヤと整った眉",
    technique: "目元を線ではなく影で締める",
    caution: "画面越しに顔色が悪く見えること",
    proof: "会議、通勤、昼休みで崩れにくいこと",
  },
  {
    languageSlug: "ja",
    groupKey: "scenario-interview",
    path: "/scenarios/面接",
    englishPath: "/scenarios/interview",
    category: "scenario",
    keyword: "面接メイク",
    topic: "信頼感を出すためのメイク",
    angle: "表情がはっきり見えるようにする",
    finish: "均一な肌と自然な血色",
    technique: "眉と目元を丁寧に整える",
    caution: "色やラメが印象を邪魔すること",
    proof: "対面でもオンラインでも同じ印象になること",
  },
  {
    languageSlug: "ja",
    groupKey: "scenario-id-photo",
    path: "/scenarios/証明写真",
    englishPath: "/scenarios/passport-photo",
    category: "scenario",
    keyword: "証明写真メイク",
    topic: "写真で顔色と輪郭を整えること",
    angle: "正面から見た立体感を作る",
    finish: "マット寄りの肌と少し強めの血色",
    technique: "眉、まつ毛、リップラインを補正する",
    caution: "ライトで色が飛ぶこと",
    proof: "正面写真で目元と口元がぼやけないこと",
  },
  {
    languageSlug: "ja",
    groupKey: "scenario-date",
    path: "/scenarios/デート",
    englishPath: "/scenarios/first-date",
    category: "scenario",
    keyword: "デートメイク",
    topic: "近距離で自然に見えるメイク",
    angle: "やわらかさと自分らしさを残す",
    finish: "血色のある頬とツヤを少し足した唇",
    technique: "目元を強くしすぎずまつ毛で見せる",
    caution: "暗い照明で色が濃く見えること",
    proof: "会話中の距離でも自然なこと",
  },
  {
    languageSlug: "ja",
    groupKey: "scenario-photogenic",
    path: "/scenarios/写真映え",
    englishPath: "/scenarios/passport-photo",
    category: "scenario",
    keyword: "写真映えメイク",
    topic: "写真で立体感と血色を残すこと",
    angle: "カメラで薄く見える部分を補う",
    finish: "少し強めのまつ毛とチーク",
    technique: "光が当たる部分と影を整理する",
    caution: "実物より写真でのっぺり見えること",
    proof: "自撮りと他撮りの両方で顔色が残ること",
  },
  {
    languageSlug: "ja",
    groupKey: "scenario-quick",
    path: "/scenarios/時短",
    englishPath: "/scenarios/quick-5min",
    category: "scenario",
    keyword: "時短メイク",
    topic: "短時間で外に出られる顔に整えること",
    angle: "効果の大きい順に仕上げる",
    finish: "肌補正、眉、血色を優先",
    technique: "マルチカラーを頬と唇に使う",
    caution: "急いで境目が残ること",
    proof: "5分後でもまとまって見えること",
  },
  {
    languageSlug: "ja",
    groupKey: "scenario-five-min",
    path: "/scenarios/5分",
    englishPath: "/scenarios/quick-5min",
    category: "scenario",
    keyword: "5分メイク",
    topic: "最低限で印象を変えること",
    angle: "省く工程を決めておく",
    finish: "疲れを隠すポイント補正",
    technique: "コンシーラー、眉、リップを固定化する",
    caution: "全部を中途半端に塗ること",
    proof: "鏡を見る時間が短くても安定すること",
  },
  {
    languageSlug: "ja",
    groupKey: "scenario-travel",
    path: "/scenarios/旅行",
    englishPath: "/scenarios/vacation",
    category: "scenario",
    keyword: "旅行メイク",
    topic: "荷物を減らして写真にも残るメイク",
    angle: "崩れにくさと軽さを両立する",
    finish: "日差しに合うツヤと血色",
    technique: "少ないアイテムを複数用途で使う",
    caution: "普段と違う光で色が浮くこと",
    proof: "屋外、移動、写真で同じ印象が続くこと",
  },
  {
    languageSlug: "ja",
    groupKey: "feature-round-face",
    path: "/for/丸顔",
    englishPath: "/for/round-face",
    category: "feature",
    keyword: "丸顔メイク",
    topic: "丸みを生かしながら縦の印象を作ること",
    angle: "影より位置で調整する",
    finish: "斜めに入れたチークと控えめなハイライト",
    technique: "頬の中心を避けて外側へぼかす",
    caution: "顔の中央が広く見えること",
    proof: "正面でも横幅だけが目立たないこと",
  },
  {
    languageSlug: "ja",
    groupKey: "feature-monolid",
    path: "/for/一重",
    englishPath: "/for/single-eyelids",
    category: "feature",
    keyword: "一重 メイク",
    topic: "目元の存在感を自然に出すこと",
    angle: "線よりまつ毛と影で見せる",
    finish: "目を開けた状態で見えるグラデーション",
    technique: "黒目上と目尻を中心に調整する",
    caution: "太いラインが隠れて重く見えること",
    proof: "瞬きしても目元がきれいに見えること",
  },
  {
    languageSlug: "ja",
    groupKey: "feature-inner-double",
    path: "/for/奥二重",
    englishPath: "/for/hooded-eyes",
    category: "feature",
    keyword: "奥二重メイク",
    topic: "二重幅をつぶさず目元を整えること",
    angle: "見える範囲に色を置く",
    finish: "細い締め色と明るい下まぶた",
    technique: "目を開けたまま位置を決める",
    caution: "濃い色が二重幅を隠すこと",
    proof: "正面で目が小さく見えないこと",
  },
  {
    languageSlug: "ja",
    groupKey: "feature-warm",
    path: "/for/イエベ",
    englishPath: "/blog/how-to-determine-skin-undertone",
    category: "feature",
    keyword: "イエベメイク",
    topic: "黄み寄りの肌に合う色を選ぶこと",
    angle: "温かみを濁らせない",
    finish: "コーラル、ベージュ、ブラウンの統一感",
    technique: "リップとチークの温度をそろえる",
    caution: "青みが強く顔色が沈むこと",
    proof: "肌が明るく健康的に見えること",
  },
  {
    languageSlug: "ja",
    groupKey: "feature-cool",
    path: "/for/ブルベ",
    englishPath: "/blog/how-to-determine-skin-undertone",
    category: "feature",
    keyword: "ブルベメイク",
    topic: "冷たさをきれいに見せる色選び",
    angle: "透明感を濁らせない",
    finish: "ローズ、モーヴ、グレージュの軽さ",
    technique: "黄みを足しすぎず血色を作る",
    caution: "暖色で肌がくすむこと",
    proof: "白目と肌が澄んで見えること",
  },
  {
    languageSlug: "ja",
    groupKey: "feature-tear-bag",
    path: "/for/涙袋",
    englishPath: "/looks/glass-skin",
    category: "feature",
    keyword: "涙袋メイク",
    topic: "下まぶたに自然な立体感を出すこと",
    angle: "盛るより影を細く入れる",
    finish: "明るい影と細かい光",
    technique: "黒目下を中心に短く入れる",
    caution: "ラメや影が太く見えること",
    proof: "笑ったときだけ自然にふくらむこと",
  },
  {
    languageSlug: "ja",
    groupKey: "guide-beginner",
    path: "/guides/初心者",
    englishPath: "/guides/beginner-tutorial",
    category: "guide",
    keyword: "メイク初心者",
    topic: "最初に覚える基本ステップ",
    angle: "失敗しにくい順番で練習する",
    finish: "整った肌と自然な血色",
    technique: "ベース、眉、まつ毛、リップに絞る",
    caution: "動画通りに全部まねること",
    proof: "自分の顔で理由がわかること",
  },
  {
    languageSlug: "ja",
    groupKey: "guide-how-to",
    path: "/guides/やり方",
    englishPath: "/guides/apply-step-by-step",
    category: "guide",
    keyword: "メイクのやり方",
    topic: "手順ごとの目的を理解すること",
    angle: "なんとなく塗る状態から抜ける",
    finish: "工程ごとに整った仕上がり",
    technique: "塗る前にどこを変えたいか決める",
    caution: "順番が崩れて修正しにくくなること",
    proof: "同じ手順で再現できること",
  },
  {
    languageSlug: "ja",
    groupKey: "guide-order",
    path: "/guides/順番",
    englishPath: "/guides/beginner-routine",
    category: "guide",
    keyword: "メイク 順番",
    topic: "崩れにくいメイクの流れ",
    angle: "先に整える場所を決める",
    finish: "ベースからポイントまで自然につながる",
    technique: "スキンケア後に薄い層を重ねる",
    caution: "粉とクリームの順番が混ざること",
    proof: "時間がたってもムラが出にくいこと",
  },
  {
    languageSlug: "ja",
    groupKey: "guide-color-analysis",
    path: "/guides/パーソナルカラー診断",
    englishPath: "/blog/how-to-determine-skin-undertone",
    category: "guide",
    keyword: "パーソナルカラー診断 無料",
    topic: "似合う色の方向を試すこと",
    angle: "診断名より顔映りを見る",
    finish: "肌が明るく見える色合わせ",
    technique: "同じ明るさで複数色を比較する",
    caution: "タイプ名だけでコスメを選ぶこと",
    proof: "リップとチークを変えても調和すること",
  },
  {
    languageSlug: "ja",
    groupKey: "guide-cosmetics",
    path: "/guides/似合うコスメ",
    englishPath: "/personalized-makeup-recommendation",
    category: "guide",
    keyword: "自分に似合うコスメを探す",
    topic: "顔立ちと色に合う商品方向を絞ること",
    angle: "口コミだけで選ばない",
    finish: "使う場面まで合うコスメ選び",
    technique: "色、質感、濃さを分けて確認する",
    caution: "人気色が自分には強すぎること",
    proof: "手持ち服や普段の光でも使いやすいこと",
  },
];

const zhCnSeoPages: readonly LocalizedSeoPage[] = [
  {
    languageSlug: "zh-cn",
    groupKey: "home",
    path: "/",
    englishPath: "/",
    category: "home",
    keyword: "AI 妆容诊断",
    topic: "虚拟试妆与适合我的妆容判断",
    title: "AI 妆容诊断：先看自己脸上的效果 | AI Beauty Stylist",
    description:
      "用 AI Beauty Stylist 在自己的自拍上预览妆容方向，结合肤色、脸型、场景和真实光线，先判断适不适合再试妆。",
    heroTitle: "AI 妆容诊断：先看自己脸上的效果",
    heroSubtitle:
      "把肤色、脸型、场景和妆感强度放在一起比较，在自己的脸上预览自然、可信、适合日常使用的妆容方向。",
    ctaTitle: "用自己的脸试试 AI 妆容诊断",
    ctaText: "上传自拍，比较不同妆容在你的肤色、五官和日常光线下是否自然。",
    ctaLabel: "免费试妆",
    faqHeading: "常见问题",
    relatedHeading: "延伸阅读",
    sections: [
      {
        kind: "paragraphs",
        title: "AI 妆容诊断真正要解决的问题",
        paragraphs: [
          "适合的妆容不是把流行模板直接套到脸上，而是看肤色冷暖、脸部比例、眼型、唇色和使用场景是否协调。AI Beauty Stylist 的重点是先帮你在自己的脸上比较方向，减少盲目试色和照搬教程。",
          "首页作为简体中文入口，需要能被搜索引擎识别为独立语言版本，因此这里保留明确的中文搜索意图、中文标题和自引用路径。",
        ],
      },
      {
        kind: "highlight",
        text: "判断一个妆容是否适合，先看脸整体是否更协调，再看单个产品或流行关键词是否突出。",
      },
    ],
    faq: [
      {
        q: "AI 妆容诊断会替我决定唯一妆容吗？",
        a: "不会。它更适合用来比较方向，比如日常、通勤、约会或拍照妆感，帮助你判断颜色、强度和位置是否适合自己的脸。",
      },
      {
        q: "为什么要用自己的自拍预览？",
        a: "同一个妆容会被肤色、五官比例、眼型和光线影响。用自拍预览比只看模特图或热门色号更接近自己的使用场景。",
      },
    ],
    relatedLinks: [
      { label: "免费试妆", url: "/tryon-free" },
      { label: "AI 妆容诊断", url: "/diagnosis" },
      { label: "妆容灵感", url: "/discover" },
      { label: "价格方案", url: "/pricing" },
    ],
    priority: "0.9",
    changefreq: "weekly",
  },
  {
    languageSlug: "zh-cn",
    groupKey: "guide-order",
    path: "/guides/化妆顺序",
    englishPath: "/guides/beginner-routine",
    category: "guide",
    keyword: "化妆顺序",
    topic: "底妆、眼妆和唇颊之间更稳定的上妆流程",
    title: "化妆顺序：先护肤还是先底妆？| AI Beauty Stylist",
    description:
      "了解适合新手和日常妆的化妆顺序：从护肤、底妆、眼妆到唇颊，用自己的自拍预览妆感，减少卡粉、斑驳和颜色过重。",
    heroTitle: "化妆顺序：让妆容更服帖的基础流程",
    heroSubtitle:
      "化妆顺序不是把所有产品都堆上脸，而是先判断皮肤状态、妆感强度和当天场景，再决定护肤、底妆、眼妆、唇颊的先后和厚薄。",
    ctaTitle: "用自己的脸检查化妆顺序",
    ctaText:
      "上传自拍，比较自然妆、通勤妆或拍照妆在你脸上的妆感，再决定哪些步骤需要保留或简化。",
    ctaLabel: "免费试妆",
    faqHeading: "常见问题",
    relatedHeading: "延伸阅读",
    sections: [
      {
        kind: "paragraphs",
        title: "化妆顺序先解决什么问题",
        paragraphs: [
          "稳定的化妆顺序，核心是让护肤、底妆、眼妆和唇颊互相配合。先确认皮肤是否干燥、出油或泛红，再决定底妆厚度，比直接照搬视频步骤更可靠。",
          "如果底妆容易卡粉或斑驳，通常不是多加一个产品就能解决。更应该检查护肤是否吸收、液体和膏状产品是否先于粉状产品、眼妆和唇颊是否抢走了整体平衡。",
          "AI Beauty Stylist 适合在练习或购买前做方向比较。你可以先看不同妆感在自己脸上是否自然，再决定当天要保留完整步骤，还是只做底妆、眉眼和唇颊重点。",
        ],
      },
      {
        kind: "steps",
        title: "日常化妆的 4 个基础顺序",
        items: [
          {
            title: "先让护肤稳定",
            body: "保湿、防晒或妆前产品需要轻薄并充分贴合。表面太油或太湿时直接上底妆，更容易搓泥、结块或不均匀。",
          },
          {
            title: "底妆薄层开始",
            body: "先用少量粉底或遮瑕处理最影响气色的区域，再看是否需要补第二层。新手不建议一开始全脸厚涂。",
          },
          {
            title: "再整理眉眼结构",
            body: "眉毛、睫毛和眼影决定精神感。眼妆可以轻一点，但边界要干净，避免眼线过粗让整体妆容变重。",
          },
          {
            title: "最后统一唇颊颜色",
            body: "腮红和唇色要和底妆、眼妆在同一强度里。颜色太跳时，脸会先看到妆，而不是看到整体气色。",
          },
        ],
      },
      {
        kind: "grid",
        title: "什么时候需要调整顺序",
        items: [
          {
            title: "底妆斑驳",
            body: "先减少护肤层数，等防晒成膜后再上底妆，膏状产品放在散粉之前完成。",
          },
          {
            title: "妆感太重",
            body: "把重点缩到一个区域，例如只强化眉眼或唇颊，底妆改成局部修正。",
          },
          {
            title: "出门时间很短",
            body: "保留防晒、局部遮瑕、眉毛、睫毛和唇颊色，跳过需要长时间晕染的步骤。",
          },
        ],
      },
      {
        kind: "table",
        title: "建议顺序和常见误区",
        rows: [
          {
            label: "护肤",
            good: "轻薄保湿，等表面稳定后再上妆",
            avoid: "多层护肤没吸收就直接叠底妆",
          },
          {
            label: "底妆",
            good: "少量多次，先修正最明显区域",
            avoid: "为了遮瑕全脸同样厚度",
          },
          {
            label: "定妆",
            good: "膏状和液体产品完成后再局部定妆",
            avoid: "粉状产品太早上，后续再叠膏状腮红",
          },
          {
            label: "唇颊",
            good: "用同一色调统一气色",
            avoid: "眼妆、腮红和唇色同时很强",
          },
        ],
      },
      {
        kind: "highlight",
        text: "好的化妆顺序应该让皮肤、眉眼和唇颊看起来协调，而不是让某一个步骤特别突出。先薄后厚、先液膏后粉、先整体后细节，是最稳的判断方式。",
      },
    ],
    faq: [
      {
        q: "新手一定要按照完整化妆顺序吗？",
        a: "不一定。新手可以先保留护肤、防晒、局部底妆、眉毛、睫毛和唇颊色，等这些稳定后再加入眼影、修容或高光。",
      },
      {
        q: "先遮瑕还是先粉底？",
        a: "日常妆可以先薄粉底，再对明显瑕疵局部遮瑕。若只有少量瑕疵，也可以只遮瑕不全脸粉底。",
      },
      {
        q: "为什么上完散粉后腮红变斑驳？",
        a: "如果你用的是膏状或液体腮红，通常应在散粉前完成。粉状腮红则适合在定妆后少量叠加。",
      },
      {
        q: "AI 试妆能替代实际练习吗？",
        a: "不能完全替代。AI 预览适合先判断妆感方向和颜色强度，真实持妆、质地和手法仍需要在自己皮肤上练习确认。",
      },
    ],
    relatedLinks: [
      { label: "新手化妆教程", url: "/guides/beginner-tutorial" },
      { label: "一步一步化妆", url: "/guides/apply-step-by-step" },
      { label: "日常自然妆", url: "/looks/natural-makeup" },
      { label: "免费试妆", url: "/tryon-free" },
    ],
    priority: "0.6",
    changefreq: "monthly",
  },
];

const legacyLocalizedSeoPages: readonly LocalizedSeoPage[] = [
  ...zhCnSeoPages,
  ...seeds.map(makePage),
  ...localizedSeoPagesPhase3,
  ...localizedSeoPagesPhase4,
];

const footerSeoEnglishPaths = new Set(
  footerSeoTargets.map((target) => target.englishPath),
);

export const localizedSeoPages: readonly LocalizedSeoPage[] = [
  ...legacyLocalizedSeoPages.filter(
    (page) => !footerSeoEnglishPaths.has(page.englishPath),
  ),
  ...localizedFooterSeoPages,
];

const routeKey = (languageSlug: string, path: string) =>
  `${languageSlug}:${normalizePath(path)}`;

const pagesByRoute = new Map<string, LocalizedSeoPage>(
  localizedSeoPages.map((page) => [
    routeKey(page.languageSlug, page.path),
    page,
  ]),
);

const pagesByEnglishPath = new Map<string, LocalizedSeoPage[]>();

for (const page of localizedSeoPages) {
  pagesByEnglishPath.set(page.englishPath, [
    ...(pagesByEnglishPath.get(page.englishPath) ?? []),
    page,
  ]);
}

export function getLocalizedSeoPageByRoute(
  languageSlug: string | null | undefined,
  path: string,
): LocalizedSeoPage | undefined {
  if (!languageSlug || languageSlug === "en") return undefined;
  return pagesByRoute.get(routeKey(languageSlug, path));
}

export function hasLocalizedSeoPageForRoute(
  languageSlug: string | null | undefined,
  path: string,
): boolean {
  return Boolean(getLocalizedSeoPageByRoute(languageSlug, path));
}

export function getLocalizedSeoPagesByLanguage(languageSlug: string) {
  return localizedSeoPages.filter((page) => page.languageSlug === languageSlug);
}

function uniquePagesByLanguage(
  pages: readonly LocalizedSeoPage[],
  preferredPage?: LocalizedSeoPage,
): LocalizedSeoPage[] {
  const seen = new Set<string>();
  const orderedPages = preferredPage ? [preferredPage, ...pages] : pages;
  return orderedPages.filter((page) => {
    if (seen.has(page.languageSlug)) return false;
    seen.add(page.languageSlug);
    return true;
  });
}

export function getLocalizedSeoGroupForRoute(
  languageSlug: string,
  path: string,
): { englishPath: string; pages: readonly LocalizedSeoPage[] } | undefined {
  if (languageSlug === "en") {
    const pages = pagesByEnglishPath.get(normalizePath(path));
    if (!pages?.length) return undefined;
    return {
      englishPath: normalizePath(path),
      pages: uniquePagesByLanguage(pages),
    };
  }

  const page = getLocalizedSeoPageByRoute(languageSlug, path);
  if (!page) return undefined;
  const relatedPages = pagesByEnglishPath.get(page.englishPath) ?? [page];
  return {
    englishPath: page.englishPath,
    pages: uniquePagesByLanguage(relatedPages, page),
  };
}

export function getLocalizedPathForRoute(
  sourceLanguageSlug: string,
  routePath: string,
  targetLanguageSlug: LanguageSlug | string,
): string | undefined {
  const sourceGroup = getLocalizedSeoGroupForRoute(
    sourceLanguageSlug,
    routePath,
  );

  if (targetLanguageSlug === "en") {
    return sourceGroup?.englishPath;
  }

  if (sourceGroup) {
    return sourceGroup.pages.find(
      (page) => page.languageSlug === targetLanguageSlug,
    )?.path;
  }

  const targetPages = pagesByEnglishPath.get(normalizePath(routePath));
  return targetPages?.find((page) => page.languageSlug === targetLanguageSlug)
    ?.path;
}
