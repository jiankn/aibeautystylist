import type { SupportedLocale } from "../lib/i18n";
import type { BlogPost } from "./blogData";

type GeneratedBlogLocale =
  | "de-DE"
  | "fr-FR"
  | "ja-JP"
  | "ko-KR"
  | "zh-TW"
  | "es-ES"
  | "pt-BR";

interface LocalizedBlogSeed {
  readonly slug: string;
  readonly title: string;
  readonly summary: string;
  readonly takeaways: readonly string[];
  readonly category: string;
  readonly readTime: string;
  readonly coverAlt: string;
  readonly seoKeywords: readonly string[];
}

interface BlogUiCopy {
  readonly index: {
    readonly eyebrow: string;
    readonly title: string;
    readonly intro: string;
    readonly featured: string;
    readonly latest: string;
    readonly read: string;
    readonly editorial: string;
    readonly editorialBody: string;
    readonly standards: string;
    readonly author: string;
    readonly takeawayLabel: string;
    readonly takeaways: readonly string[];
  };
  readonly article: {
    readonly home: string;
    readonly blog: string;
    readonly breadcrumb: string;
    readonly updated: string;
    readonly read: string;
    readonly reviewed: string;
    readonly reviewedBody: string;
    readonly standards: string;
    readonly related: string;
    readonly takeaways: string;
    readonly sources: string;
    readonly sourcesNote: string;
    readonly sourceItemNote: string;
    readonly diagnosis: string;
    readonly tryon: string;
    readonly note: string;
  };
  readonly body: {
    readonly intentHeading: string;
    readonly intentText: string;
    readonly keywordHeading: string;
    readonly keywordText: string;
    readonly decisionHeading: string;
    readonly decisionText: string;
    readonly matrixHeading: string;
    readonly matrixRows: readonly [string, string][];
    readonly stepsHeading: string;
    readonly stepIntro: string;
    readonly stepLabels: readonly string[];
    readonly aiHeading: string;
    readonly aiText: string;
    readonly mistakesHeading: string;
    readonly checkLabels: readonly string[];
    readonly practiceHeading: string;
    readonly practiceText: string;
    readonly nextHeading: string;
    readonly nextText: string;
    readonly note: string;
  };
}

const slugs = [
  "how-to-determine-skin-undertone",
  "ai-tryon-vs-beauty-filters",
  "face-shape-and-makeup-gravity",
  "foundation-caking-troubleshooting",
  "hooded-eyes-makeup-placement",
  "five-minute-commute-makeup",
  "makeup-for-camera-and-real-life",
  "wedding-guest-makeup-plan",
  "lipstick-color-comparison",
  "ai-makeup-photo-guide",
] as const;

const uiCopy: Partial<Record<SupportedLocale, BlogUiCopy>> = {
  en: {
    index: {
      eyebrow: "Beauty notes",
      title: "Makeup decisions, explained without the hype",
      intro:
        "Practical notes for comparing color, placement, and AI-generated references with better judgment.",
      featured: "Start here",
      latest: "More useful reads",
      read: "Read article",
      editorial: "How this content is made",
      editorialBody:
        "Topics start from real makeup and AI try-on decisions. Safety-sensitive statements are checked against public authoritative sources, and articles are not published to meet a keyword or word-count quota.",
      standards: "Read AI use boundaries",
      author: "Editorial team",
      takeawayLabel: "What you will learn",
      takeaways: [
        "How to compare undertones without relying on one unreliable test",
        "How to turn an observation into practical color choices",
      ],
    },
    article: {
      home: "Home",
      blog: "Beauty notes",
      breadcrumb: "Breadcrumb",
      updated: "Updated",
      read: "read",
      reviewed: "Editorial review",
      reviewedBody:
        "Product education reviewed for practical use and clear AI boundaries.",
      standards: "Read AI use boundaries",
      related: "Continue reading",
      takeaways: "This article helps you",
      sources: "Sources and verification",
      sourcesNote:
        "Sources support safety-sensitive statements. Editorial frameworks and comparisons are original product education.",
      sourceItemNote:
        "Used to verify safety-sensitive or AI-boundary statements.",
      diagnosis: "Start a face diagnosis",
      tryon: "Try a makeup look",
      note: "Generated previews are visual references. Real results vary with products, lighting, and technique.",
    },
    body: {
      intentHeading: "Start with the decision, not the trend",
      intentText:
        "Use the keyword as a real question from a person, then turn it into a comparison you can test on your own face.",
      keywordHeading: "How the search terms fit this guide",
      keywordText:
        "The terms below are treated as user intent, not as words to repeat. They set the frame for color, placement, product, and AI-preview decisions.",
      decisionHeading: "Build a controlled comparison",
      decisionText:
        "A useful makeup note keeps light, angle, and product amount stable. Change one variable, record what changes, then decide whether the direction is worth trying in real life.",
      matrixHeading: "Decision matrix",
      matrixRows: [
        [
          "Color",
          "Check whether the color supports the face or becomes the first thing people notice.",
        ],
        [
          "Placement",
          "Compare where attention lands before adding more product.",
        ],
        ["Context", "Match the choice to work, photos, events, or daily wear."],
      ],
      stepsHeading: "A practical testing sequence",
      stepIntro:
        "Use the same baseline photo and keep the goal narrow enough to judge.",
      stepLabels: [
        "Set the baseline",
        "Change one variable",
        "Compare from distance",
        "Write the next action",
      ],
      aiHeading: "Where AI preview helps",
      aiText:
        "AI try-on is best for narrowing directions before you spend time or money. Treat it as a visual draft, then confirm texture, wear, and exact shade with real products.",
      mistakesHeading: "Common mistakes to avoid",
      checkLabels: [
        "Trusting one image",
        "Ignoring lighting",
        "Buying from a shade name only",
      ],
      practiceHeading: "Make the result usable",
      practiceText:
        "Save the observation in practical language: which area looked better, which condition changed the result, and what you would try next.",
      nextHeading: "Next step inside AI Beauty Stylist",
      nextText:
        "Use diagnosis for a structured read, then compare related looks in free try-on so the article becomes an action rather than a saved tab.",
      note: "Keep safety boundaries clear: do not use makeup previews for medical decisions, identity verification, or guaranteed purchase outcomes.",
    },
  },
  "zh-CN": {
    index: {
      eyebrow: "美妆笔记",
      title: "AI 试妆与妆容选择指南",
      intro:
        "用可执行的方法比较肤色倾向、妆容位置和 AI 生成参考，帮你更稳地判断要试什么妆。",
      featured: "从这里开始",
      latest: "继续阅读",
      read: "阅读全文",
      editorial: "这些内容如何产生",
      editorialBody:
        "选题来自真实的妆容与 AI 试妆决策问题；涉及安全边界的事实优先核对公开权威来源，不以批量关键词或固定字数作为发布目标。",
      standards: "查看 AI 使用边界",
      author: "编辑团队",
      takeawayLabel: "本文解决",
      takeaways: [
        "如何不用单一测试，更稳定地比较肤色倾向",
        "如何把观察结果转成可执行的彩妆选择",
      ],
    },
    article: {
      home: "首页",
      blog: "美妆笔记",
      breadcrumb: "面包屑导航",
      updated: "更新于",
      read: "阅读",
      reviewed: "编辑审核",
      reviewedBody: "产品教育内容围绕实际可用性和清晰的 AI 边界进行审核。",
      standards: "查看 AI 使用边界",
      related: "继续阅读",
      takeaways: "本文解决",
      sources: "参考与核验",
      sourcesNote:
        "外部来源用于核验安全相关事实；判断框架与对比方法由编辑团队整理。",
      sourceItemNote: "用于核验安全边界、AI 输出可靠性或化妆品使用提醒。",
      diagnosis: "开始妆容诊断",
      tryon: "选择妆容试妆",
      note: "生成预览仅供视觉参考，现实结果会受产品、光线和上妆手法影响。",
    },
    body: {
      intentHeading: "先判断任务，不急着追趋势",
      intentText:
        "把关键词当成真实用户的问题，而不是堆在正文里的词。它应该帮助你明确要比较颜色、位置、产品还是 AI 预览效果。",
      keywordHeading: "这些搜索词如何服务本文",
      keywordText:
        "下面的词来自关键词表，用来定义搜索意图。正文会围绕决策方法展开，而不是重复关键词。",
      decisionHeading: "建立可复核的对比",
      decisionText:
        "有效的妆容判断需要固定光线、角度和产品用量。一次只改一个变量，记录变化，再决定是否进入现实试色。",
      matrixHeading: "决策矩阵",
      matrixRows: [
        ["颜色", "观察颜色是否让五官更协调，而不是单独抢走注意力。"],
        ["位置", "先看视线落点，再决定是否需要加重。"],
        ["场景", "把通勤、拍照、约会或活动需求分开判断。"],
      ],
      stepsHeading: "实际测试顺序",
      stepIntro: "使用同一张基准照片，把目标缩小到可以判断的范围。",
      stepLabels: ["建立基准", "只改一个变量", "从正常距离比较", "写下下一步"],
      aiHeading: "AI 预览适合做什么",
      aiText:
        "AI 试妆适合在购买和正式上妆前缩小方向。它是视觉草稿，不是产品色号、持妆或肤感保证。",
      mistakesHeading: "避免常见误判",
      checkLabels: ["只相信一张图", "忽略光线变化", "只看色号名字购买"],
      practiceHeading: "把结果变成可用记录",
      practiceText:
        "记录要写成可执行语言：哪个区域变好、哪个条件影响结果、下一次具体试什么。",
      nextHeading: "在 AI Beauty Stylist 里的下一步",
      nextText:
        "先用诊断得到结构化观察，再到免费试妆比较相关妆容，让文章内容真正进入决策流程。",
      note: "保持安全边界：不要用妆容预览做医学判断、身份验证或购买效果保证。",
    },
  },
  "de-DE": {
    index: {
      eyebrow: "Beauty-Notizen",
      title: "Make-up Entscheidungen ohne leere Versprechen",
      intro:
        "Praxisnahe Guides für Farbe, Platzierung, KI Make-up Test und realistische nächste Schritte.",
      featured: "Hier starten",
      latest: "Weitere Guides",
      read: "Artikel lesen",
      editorial: "Wie diese Inhalte entstehen",
      editorialBody:
        "Die Themen kommen aus echten Make-up- und Try-on-Entscheidungen. Sicherheitsrelevante Aussagen werden gegen verlässliche Quellen geprüft.",
      standards: "AI-Grenzen lesen",
      author: "Redaktion",
      takeawayLabel: "Dieser Artikel hilft dir",
      takeaways: [
        "Unterton, Lippenfarbe und Gesichtsform kontrollierter zu vergleichen",
        "KI-Vorschauen als Entscheidungshilfe statt als Garantie zu nutzen",
      ],
    },
    article: {
      home: "Startseite",
      blog: "Beauty-Notizen",
      breadcrumb: "Breadcrumb",
      updated: "Aktualisiert",
      read: "Lesezeit",
      reviewed: "Redaktionelle Prüfung",
      reviewedBody:
        "Produktwissen mit Blick auf praktische Anwendung und klare AI-Grenzen geprüft.",
      standards: "AI-Grenzen lesen",
      related: "Weiterlesen",
      takeaways: "Dieser Artikel hilft dir",
      sources: "Quellen und Prüfung",
      sourcesNote:
        "Quellen stützen sicherheitsrelevante Aussagen; Frameworks und Vergleiche sind redaktionelle Produktbildung.",
      sourceItemNote:
        "Zur Prüfung von Sicherheitsgrenzen, AI-Zuverlässigkeit oder Kosmetikhinweisen genutzt.",
      diagnosis: "Gesichtsdiagnose starten",
      tryon: "Make-up Look testen",
      note: "Generierte Vorschauen sind visuelle Referenzen. Reale Ergebnisse hängen von Produkt, Licht und Technik ab.",
    },
    body: {
      intentHeading: "Mit der Entscheidung beginnen, nicht mit dem Trend",
      intentText:
        "Behandle die Suchanfrage als echte Frage einer Person. Daraus entsteht ein Vergleich, den du mit deinem eigenen Gesicht prüfen kannst.",
      keywordHeading: "Wie die Suchbegriffe in diesen Guide passen",
      keywordText:
        "Die Begriffe unten stammen aus der Keyword-Datei. Sie strukturieren die Suchintention, ohne den Text mit Wiederholungen zu füllen.",
      decisionHeading: "Einen kontrollierten Vergleich aufbauen",
      decisionText:
        "Halte Licht, Winkel und Produktmenge stabil. Ändere nur eine Variable, notiere den Unterschied und entscheide dann über den nächsten realen Test.",
      matrixHeading: "Entscheidungsmatrix",
      matrixRows: [
        [
          "Farbe",
          "Prüfe, ob die Farbe das Gesicht unterstützt oder zu dominant wird.",
        ],
        [
          "Platzierung",
          "Beobachte zuerst, wohin der Blick fällt, bevor du mehr Produkt hinzufügst.",
        ],
        [
          "Anlass",
          "Trenne Büro, Fotos, Events und Alltag, weil dieselbe Lösung nicht überall optimal ist.",
        ],
      ],
      stepsHeading: "Praktische Testreihenfolge",
      stepIntro:
        "Nutze dasselbe Basisfoto und halte das Ziel eng genug, damit du wirklich vergleichen kannst.",
      stepLabels: [
        "Basis festlegen",
        "Eine Variable ändern",
        "Aus normaler Distanz prüfen",
        "Nächsten Schritt notieren",
      ],
      aiHeading: "Wo KI-Vorschau hilft",
      aiText:
        "Ein KI Make-up Test hilft, Richtungen einzugrenzen, bevor du Zeit oder Geld investierst. Textur, Haltbarkeit und exakte Farbe musst du real prüfen.",
      mistakesHeading: "Häufige Fehler vermeiden",
      checkLabels: [
        "Einem einzigen Bild vertrauen",
        "Lichtwechsel ignorieren",
        "Nur nach Farbnamen kaufen",
      ],
      practiceHeading: "Das Ergebnis nutzbar machen",
      practiceText:
        "Schreibe die Beobachtung praktisch auf: welcher Bereich besser wirkte, welche Bedingung das Ergebnis veränderte und was du als Nächstes testen würdest.",
      nextHeading: "Nächster Schritt in AI Beauty Stylist",
      nextText:
        "Nutze die Diagnose für eine strukturierte Einschätzung und vergleiche danach passende Looks im kostenlosen Try-on.",
      note: "Sicherheitsgrenze: Make-up Vorschauen sind nicht für medizinische Entscheidungen, Identitätsprüfung oder Kaufgarantien gedacht.",
    },
  },
  "fr-FR": {
    index: {
      eyebrow: "Notes beauté",
      title: "Choisir son maquillage avec méthode",
      intro:
        "Des guides pratiques pour comparer couleur, placement, essai maquillage virtuel et limites de l'IA.",
      featured: "Commencer ici",
      latest: "Autres guides utiles",
      read: "Lire l'article",
      editorial: "Comment ce contenu est préparé",
      editorialBody:
        "Les sujets partent de décisions réelles de maquillage et d'essayage IA. Les points sensibles sont vérifiés avec des sources fiables.",
      standards: "Lire les limites de l'IA",
      author: "Équipe éditoriale",
      takeawayLabel: "Cet article vous aide à",
      takeaways: [
        "Comparer sous-ton, rouge à lèvres et forme du visage avec moins d'arbitraire",
        "Utiliser l'IA maquillage comme brouillon visuel, pas comme promesse",
      ],
    },
    article: {
      home: "Accueil",
      blog: "Notes beauté",
      breadcrumb: "Fil d'Ariane",
      updated: "Mis à jour",
      read: "lecture",
      reviewed: "Relecture éditoriale",
      reviewedBody:
        "Contenu éducatif relu pour l'usage pratique et les limites claires de l'IA.",
      standards: "Lire les limites de l'IA",
      related: "Continuer la lecture",
      takeaways: "Cet article vous aide à",
      sources: "Sources et vérification",
      sourcesNote:
        "Les sources soutiennent les points sensibles; les cadres de comparaison sont éditoriaux.",
      sourceItemNote:
        "Utilisé pour vérifier les limites de sécurité, la fiabilité IA ou les conseils cosmétiques.",
      diagnosis: "Lancer un diagnostic visage",
      tryon: "Essayer un look maquillage",
      note: "Les aperçus générés sont des références visuelles. Le résultat réel varie selon les produits, la lumière et la technique.",
    },
    body: {
      intentHeading: "Partir de la décision, pas de la tendance",
      intentText:
        "Traitez la requête comme une question réelle. Le but est de créer une comparaison que vous pouvez vérifier sur votre visage.",
      keywordHeading: "Comment les mots-clés cadrent ce guide",
      keywordText:
        "Les termes ci-dessous viennent du fichier de mots-clés. Ils servent à comprendre l'intention, pas à remplir le texte.",
      decisionHeading: "Construire une comparaison contrôlée",
      decisionText:
        "Gardez la lumière, l'angle et la quantité de produit stables. Changez une variable, observez l'effet, puis décidez du test réel.",
      matrixHeading: "Matrice de décision",
      matrixRows: [
        [
          "Couleur",
          "Vérifiez si la couleur soutient le visage ou prend toute l'attention.",
        ],
        [
          "Placement",
          "Regardez où l'oeil se pose avant d'ajouter de l'intensité.",
        ],
        ["Contexte", "Séparez bureau, photos, soirée et quotidien."],
      ],
      stepsHeading: "Séquence de test pratique",
      stepIntro:
        "Utilisez la même photo de départ et un objectif assez précis pour juger.",
      stepLabels: [
        "Fixer la base",
        "Changer une variable",
        "Comparer à distance normale",
        "Écrire l'action suivante",
      ],
      aiHeading: "Où l'aperçu IA est utile",
      aiText:
        "L'essai maquillage virtuel aide à réduire les options avant d'acheter. La texture, la tenue et la teinte exacte restent à vérifier avec de vrais produits.",
      mistakesHeading: "Erreurs fréquentes à éviter",
      checkLabels: [
        "Croire une seule image",
        "Ignorer la lumière",
        "Acheter seulement par nom de teinte",
      ],
      practiceHeading: "Transformer le résultat en note utile",
      practiceText:
        "Notez quel élément fonctionne, quelle condition change le rendu et quelle option tester ensuite.",
      nextHeading: "Étape suivante dans AI Beauty Stylist",
      nextText:
        "Commencez par un diagnostic, puis comparez les looks associés dans l'essayage gratuit.",
      note: "Gardez les limites claires: un aperçu maquillage ne sert pas au diagnostic médical, à l'identification ou à garantir un achat.",
    },
  },
  "ja-JP": {
    index: {
      eyebrow: "ビューティーノート",
      title: "似合うメイクを、感覚だけで決めない",
      intro:
        "パーソナルカラー、顔タイプ、AIメイク診断、バーチャルメイクを現実の判断につなげるための実用ガイド。",
      featured: "ここから読む",
      latest: "関連記事",
      read: "記事を読む",
      editorial: "編集方針",
      editorialBody:
        "テーマは実際のメイク選びとAI試着の判断から作成しています。安全に関わる内容は信頼できる情報で確認します。",
      standards: "AI利用の範囲を見る",
      author: "編集チーム",
      takeawayLabel: "この記事でわかること",
      takeaways: [
        "パーソナルカラーや似合うリップを比較で判断する方法",
        "AIメイク診断を現実の試し方につなげる方法",
      ],
    },
    article: {
      home: "ホーム",
      blog: "ビューティーノート",
      breadcrumb: "パンくず",
      updated: "更新日",
      read: "で読めます",
      reviewed: "編集レビュー",
      reviewedBody: "実用性とAIの境界が明確になるように編集確認しています。",
      standards: "AI利用の範囲を見る",
      related: "次に読む",
      takeaways: "この記事でわかること",
      sources: "参考情報",
      sourcesNote:
        "安全に関わる内容は外部情報を確認し、比較方法は編集チームが整理しています。",
      sourceItemNote:
        "安全性、AI結果の扱い、化粧品利用の注意点を確認するために使用。",
      diagnosis: "顔診断を始める",
      tryon: "メイクを試す",
      note: "生成プレビューは視覚的な参考です。実際の仕上がりは製品、光、塗り方で変わります。",
    },
    body: {
      intentHeading: "流行より先に、判断したいことを決める",
      intentText:
        "検索語は、ユーザーが本当に知りたいことの手がかりです。自分の顔で比べられる問いに変換して使います。",
      keywordHeading: "この記事で扱う検索意図",
      keywordText:
        "下の語句はキーワード表から選んだものです。本文では無理に繰り返さず、判断軸として使います。",
      decisionHeading: "比較できる条件をそろえる",
      decisionText:
        "光、角度、表情、使用量をそろえ、変える要素を一つにします。変化を記録してから現実の試し方に進みます。",
      matrixHeading: "判断マトリクス",
      matrixRows: [
        ["色", "色が顔全体を整えるのか、単独で目立ちすぎるのかを見る。"],
        ["位置", "濃くする前に、視線がどこへ向かうかを確認する。"],
        ["場面", "通勤、写真、イベント、日常を分けて判断する。"],
      ],
      stepsHeading: "実際の確認手順",
      stepIntro: "同じ基準写真を使い、判断できる範囲まで目的を絞ります。",
      stepLabels: [
        "基準を作る",
        "一つだけ変える",
        "通常距離で見る",
        "次の行動を書く",
      ],
      aiHeading: "AIプレビューが役立つ場面",
      aiText:
        "AIメイク診断やバーチャルメイクは、購入前に方向を絞るためのものです。質感、持ち、正確な色は現実で確認します。",
      mistakesHeading: "避けたい判断ミス",
      checkLabels: [
        "一枚の画像だけで決める",
        "照明差を無視する",
        "色名だけで買う",
      ],
      practiceHeading: "使える記録にする",
      practiceText:
        "どの部分が良く見えたか、どの条件で変わったか、次に何を試すかまで書くと判断が残ります。",
      nextHeading: "AI Beauty Stylistでの次のステップ",
      nextText:
        "診断で観察点を整理し、無料試着で関連するルックを比較してください。",
      note: "メイクプレビューは医療判断、本人確認、購入後の仕上がり保証には使わないでください。",
    },
  },
  "ko-KR": {
    index: {
      eyebrow: "뷰티 노트",
      title: "나에게 어울리는 메이크업을 더 정확히 고르는 법",
      intro:
        "퍼스널컬러, 얼굴형, AI 메이크업 진단, 가상 메이크업 체험을 실제 선택으로 연결하는 가이드입니다.",
      featured: "먼저 읽기",
      latest: "더 읽어보기",
      read: "글 읽기",
      editorial: "콘텐츠 제작 기준",
      editorialBody:
        "주제는 실제 메이크업 선택과 AI 체험 과정에서 나온 질문을 바탕으로 정리합니다. 안전 관련 내용은 신뢰 가능한 정보를 확인합니다.",
      standards: "AI 사용 범위 보기",
      author: "에디토리얼 팀",
      takeawayLabel: "이 글에서 얻을 것",
      takeaways: [
        "퍼스널컬러와 립 컬러를 한 번의 감으로 정하지 않는 방법",
        "AI 메이크업 결과를 현실적인 테스트로 연결하는 방법",
      ],
    },
    article: {
      home: "홈",
      blog: "뷰티 노트",
      breadcrumb: "이동 경로",
      updated: "업데이트",
      read: "읽기",
      reviewed: "에디토리얼 검토",
      reviewedBody:
        "실제 활용성과 명확한 AI 사용 범위를 기준으로 검토한 콘텐츠입니다.",
      standards: "AI 사용 범위 보기",
      related: "계속 읽기",
      takeaways: "이 글에서 얻을 것",
      sources: "출처와 검토",
      sourcesNote:
        "안전 관련 내용은 외부 자료로 확인하고, 비교 방식은 에디토리얼 팀이 정리했습니다.",
      sourceItemNote:
        "안전 경계, AI 결과 신뢰도 또는 화장품 사용 주의사항 확인에 사용했습니다.",
      diagnosis: "얼굴 진단 시작",
      tryon: "메이크업 룩 체험",
      note: "생성된 프리뷰는 시각 참고용입니다. 실제 결과는 제품, 조명, 사용법에 따라 달라집니다.",
    },
    body: {
      intentHeading: "트렌드보다 먼저 판단 기준을 정하기",
      intentText:
        "검색어는 실제 사용자의 고민을 보여줍니다. 그 고민을 내 얼굴에서 비교할 수 있는 질문으로 바꾸는 것이 핵심입니다.",
      keywordHeading: "이 글에서 쓰는 검색 의도",
      keywordText:
        "아래 표현은 키워드 파일에서 고른 것입니다. 반복 노출보다 색, 위치, 상황 판단의 기준으로 사용합니다.",
      decisionHeading: "비교 조건을 통제하기",
      decisionText:
        "조명, 각도, 표정, 제품 양을 고정하고 한 가지 요소만 바꿉니다. 변화가 보이면 현실 테스트로 이어갑니다.",
      matrixHeading: "판단 매트릭스",
      matrixRows: [
        ["색", "색이 얼굴을 살리는지, 혼자 튀는지 확인합니다."],
        ["위치", "더 진하게 하기 전에 시선이 어디로 가는지 봅니다."],
        ["상황", "출근, 사진, 행사, 데일리 상황을 분리해 판단합니다."],
      ],
      stepsHeading: "실제 테스트 순서",
      stepIntro: "같은 기준 사진을 사용하고 판단 가능한 목표로 좁힙니다.",
      stepLabels: [
        "기준 만들기",
        "하나만 바꾸기",
        "일상 거리에서 비교하기",
        "다음 행동 쓰기",
      ],
      aiHeading: "AI 프리뷰가 도움이 되는 지점",
      aiText:
        "AI 메이크업 진단과 가상 체험은 구매 전 방향을 좁히는 데 좋습니다. 질감, 지속력, 정확한 색은 실제 제품으로 확인해야 합니다.",
      mistakesHeading: "피해야 할 흔한 판단",
      checkLabels: [
        "한 장의 결과만 믿기",
        "조명 차이를 무시하기",
        "색 이름만 보고 구매하기",
      ],
      practiceHeading: "쓸 수 있는 기록으로 남기기",
      practiceText:
        "어느 부위가 좋아졌는지, 어떤 조건이 결과를 바꿨는지, 다음에 무엇을 시도할지까지 적습니다.",
      nextHeading: "AI Beauty Stylist에서 다음 단계",
      nextText:
        "진단으로 관찰 포인트를 정리한 뒤 무료 체험에서 관련 룩을 비교해 보세요.",
      note: "메이크업 프리뷰는 의료 판단, 신원 확인, 구매 결과 보장에 사용하지 마세요.",
    },
  },
  "zh-TW": {
    index: {
      eyebrow: "美妝筆記",
      title: "把 AI 試妝變成真正可用的妝容決策",
      intro:
        "用個人色彩、臉部分析、虛擬試妝和實際上妝邏輯，整理更適合自己的彩妝方向。",
      featured: "從這裡開始",
      latest: "繼續閱讀",
      read: "閱讀文章",
      editorial: "內容如何產生",
      editorialBody:
        "選題來自真實妝容決策與 AI 試妝使用問題；涉及安全邊界的內容會核對可信來源。",
      standards: "查看 AI 使用邊界",
      author: "編輯團隊",
      takeawayLabel: "本文幫你釐清",
      takeaways: [
        "如何用比較法判斷個人色彩與適合的口紅",
        "如何把 AI 妝容診斷轉成下一步試妝",
      ],
    },
    article: {
      home: "首頁",
      blog: "美妝筆記",
      breadcrumb: "麵包屑",
      updated: "更新於",
      read: "閱讀",
      reviewed: "編輯審核",
      reviewedBody: "內容已依實際可用性與 AI 使用邊界進行審核。",
      standards: "查看 AI 使用邊界",
      related: "繼續閱讀",
      takeaways: "本文幫你釐清",
      sources: "參考與核驗",
      sourcesNote: "外部來源用於核驗安全相關事實；比較框架由編輯團隊整理。",
      sourceItemNote: "用於核驗安全邊界、AI 結果可靠性或化妝品使用提醒。",
      diagnosis: "開始妝容診斷",
      tryon: "選擇妝容試妝",
      note: "生成預覽僅供視覺參考，實際效果會受產品、光線與手法影響。",
    },
    body: {
      intentHeading: "先定義問題，不急著跟風",
      intentText:
        "搜尋詞代表使用者真正想解決的問題。把它轉成可以在自己臉上比較的判斷，才有實際價值。",
      keywordHeading: "這些關鍵詞如何服務本文",
      keywordText:
        "以下詞來自關鍵詞表，用於定義搜尋意圖；正文不做堆疊，而是用來建立判斷脈絡。",
      decisionHeading: "建立可複核的比較",
      decisionText:
        "固定光線、角度、表情和用量，一次只改一個變量。記錄變化後，再決定要不要進入現實試色。",
      matrixHeading: "決策矩陣",
      matrixRows: [
        ["顏色", "觀察顏色是否讓五官更協調，而不是單獨搶眼。"],
        ["位置", "先看視線落點，再決定是否加重。"],
        ["場景", "把通勤、拍照、約會和正式活動分開判斷。"],
      ],
      stepsHeading: "實際測試順序",
      stepIntro: "用同一張基準照片，把目標縮小到可判斷的程度。",
      stepLabels: ["建立基準", "只改一個變量", "從正常距離比較", "寫下下一步"],
      aiHeading: "AI 預覽適合做什麼",
      aiText:
        "AI 妝容診斷與虛擬試妝適合在購買前縮小方向；質地、持妝與精確色號仍需要現實確認。",
      mistakesHeading: "避免常見誤判",
      checkLabels: ["只相信一張圖", "忽略光線差異", "只看色號名字購買"],
      practiceHeading: "把結果變成可用記錄",
      practiceText: "記錄哪個區域變好、什麼條件改變結果、下次具體要試什麼。",
      nextHeading: "在 AI Beauty Stylist 的下一步",
      nextText: "先用診斷整理觀察點，再到免費試妝比較相關妝容。",
      note: "請保持安全邊界：妝容預覽不能作為醫療判斷、身分驗證或購買效果保證。",
    },
  },
  "es-ES": {
    index: {
      eyebrow: "Notas de belleza",
      title: "Decidir tu maquillaje con más criterio",
      intro:
        "Guías prácticas para comparar colorimetría personal, forma del rostro, prueba de maquillaje virtual e IA maquillaje.",
      featured: "Empieza aquí",
      latest: "Más lecturas útiles",
      read: "Leer artículo",
      editorial: "Cómo se prepara este contenido",
      editorialBody:
        "Los temas salen de decisiones reales de maquillaje y prueba con IA. Los puntos sensibles se revisan con fuentes confiables.",
      standards: "Leer límites de IA",
      author: "Equipo editorial",
      takeawayLabel: "Este artículo te ayuda a",
      takeaways: [
        "Comparar tonos, labiales y forma del rostro sin depender de una sola foto",
        "Usar la prueba con IA como borrador visual, no como promesa",
      ],
    },
    article: {
      home: "Inicio",
      blog: "Notas de belleza",
      breadcrumb: "Ruta",
      updated: "Actualizado",
      read: "lectura",
      reviewed: "Revisión editorial",
      reviewedBody:
        "Contenido educativo revisado para uso práctico y límites claros de IA.",
      standards: "Leer límites de IA",
      related: "Seguir leyendo",
      takeaways: "Este artículo te ayuda a",
      sources: "Fuentes y verificación",
      sourcesNote:
        "Las fuentes respaldan puntos sensibles; los marcos de comparación son editoriales.",
      sourceItemNote:
        "Usado para verificar límites de seguridad, fiabilidad de IA o avisos cosméticos.",
      diagnosis: "Iniciar diagnóstico facial",
      tryon: "Probar un look",
      note: "Las vistas generadas son referencias visuales. El resultado real depende del producto, la luz y la técnica.",
    },
    body: {
      intentHeading: "Empieza por la decisión, no por la tendencia",
      intentText:
        "Trata la búsqueda como una pregunta real. El objetivo es convertirla en una comparación que puedas probar en tu rostro.",
      keywordHeading: "Cómo encajan estas palabras clave",
      keywordText:
        "Los términos vienen del archivo de keywords. Sirven para entender la intención, no para repetirlos sin aportar valor.",
      decisionHeading: "Construye una comparación controlada",
      decisionText:
        "Mantén luz, ángulo y cantidad de producto estables. Cambia una variable, observa el efecto y decide la siguiente prueba.",
      matrixHeading: "Matriz de decisión",
      matrixRows: [
        [
          "Color",
          "Comprueba si el color armoniza el rostro o se vuelve demasiado protagonista.",
        ],
        [
          "Colocación",
          "Mira hacia dónde va la atención antes de añadir intensidad.",
        ],
        ["Contexto", "Separa trabajo, fotos, eventos y uso diario."],
      ],
      stepsHeading: "Secuencia práctica de prueba",
      stepIntro:
        "Usa la misma foto base y un objetivo lo bastante concreto para juzgar.",
      stepLabels: [
        "Fijar la base",
        "Cambiar una variable",
        "Comparar a distancia normal",
        "Escribir la siguiente acción",
      ],
      aiHeading: "Dónde ayuda la vista previa con IA",
      aiText:
        "La prueba de maquillaje virtual ayuda a reducir opciones antes de comprar. La textura, duración y tonalidad exacta se confirman con productos reales.",
      mistakesHeading: "Errores comunes que conviene evitar",
      checkLabels: [
        "Creer una sola imagen",
        "Ignorar la luz",
        "Comprar solo por el nombre del tono",
      ],
      practiceHeading: "Convertir el resultado en una nota útil",
      practiceText:
        "Anota qué zona mejoró, qué condición cambió el resultado y qué probarías después.",
      nextHeading: "Siguiente paso en AI Beauty Stylist",
      nextText:
        "Empieza con un diagnóstico y luego compara looks relacionados en la prueba gratuita.",
      note: "Mantén claros los límites: una vista de maquillaje no sirve para decisiones médicas, identificación ni garantía de compra.",
    },
  },
  "pt-BR": {
    index: {
      eyebrow: "Notas de beleza",
      title: "Escolher maquiagem com mais critério",
      intro:
        "Guias práticos para comparar colorimetria pessoal, contorno facial, simulador de maquiagem e maquiagem virtual com IA.",
      featured: "Comece aqui",
      latest: "Mais leituras úteis",
      read: "Ler artigo",
      editorial: "Como este conteúdo é feito",
      editorialBody:
        "Os temas vêm de decisões reais de maquiagem e teste com IA. Pontos sensíveis são revisados com fontes confiáveis.",
      standards: "Ler limites da IA",
      author: "Equipe editorial",
      takeawayLabel: "Este artigo ajuda você a",
      takeaways: [
        "Comparar cor, batom e formato do rosto sem depender de uma só foto",
        "Usar maquiagem virtual com IA como rascunho visual, não como promessa",
      ],
    },
    article: {
      home: "Início",
      blog: "Notas de beleza",
      breadcrumb: "Caminho",
      updated: "Atualizado",
      read: "leitura",
      reviewed: "Revisão editorial",
      reviewedBody:
        "Conteúdo educativo revisado para uso prático e limites claros de IA.",
      standards: "Ler limites da IA",
      related: "Continuar lendo",
      takeaways: "Este artigo ajuda você a",
      sources: "Fontes e verificação",
      sourcesNote:
        "As fontes apoiam pontos sensíveis; os métodos de comparação são editoriais.",
      sourceItemNote:
        "Usado para verificar limites de segurança, confiabilidade da IA ou alertas cosméticos.",
      diagnosis: "Iniciar diagnóstico facial",
      tryon: "Testar um look",
      note: "As prévias geradas são referências visuais. O resultado real depende do produto, da luz e da técnica.",
    },
    body: {
      intentHeading: "Comece pela decisão, não pela tendência",
      intentText:
        "Trate a busca como uma pergunta real. O objetivo é transformar o termo em uma comparação que você possa testar no próprio rosto.",
      keywordHeading: "Como as palavras-chave entram neste guia",
      keywordText:
        "Os termos vêm do arquivo de keywords. Eles definem intenção de busca sem virar repetição vazia.",
      decisionHeading: "Monte uma comparação controlada",
      decisionText:
        "Mantenha luz, ângulo e quantidade de produto estáveis. Mude uma variável, observe o efeito e escolha o próximo teste.",
      matrixHeading: "Matriz de decisão",
      matrixRows: [
        [
          "Cor",
          "Veja se a cor harmoniza o rosto ou chama atenção demais sozinha.",
        ],
        [
          "Posicionamento",
          "Observe para onde o olhar vai antes de intensificar.",
        ],
        ["Contexto", "Separe trabalho, fotos, festa e uso diário."],
      ],
      stepsHeading: "Sequência prática de teste",
      stepIntro:
        "Use a mesma foto base e um objetivo específico o suficiente para julgar.",
      stepLabels: [
        "Definir a base",
        "Mudar uma variável",
        "Comparar em distância normal",
        "Anotar a próxima ação",
      ],
      aiHeading: "Onde a prévia com IA ajuda",
      aiText:
        "O simulador de maquiagem ajuda a reduzir opções antes da compra. Textura, duração e tom exato precisam ser confirmados com produtos reais.",
      mistakesHeading: "Erros comuns para evitar",
      checkLabels: [
        "Acreditar em uma imagem só",
        "Ignorar a luz",
        "Comprar apenas pelo nome da cor",
      ],
      practiceHeading: "Transforme o resultado em nota útil",
      practiceText:
        "Registre qual área melhorou, qual condição mudou o resultado e o que você testaria depois.",
      nextHeading: "Próximo passo no AI Beauty Stylist",
      nextText:
        "Comece pelo diagnóstico e depois compare looks relacionados no teste gratuito.",
      note: "Mantenha os limites claros: prévia de maquiagem não serve para decisão médica, identificação nem garantia de compra.",
    },
  },
};

// Keywords are selected from keyword-kd-results.csv and assigned by locale + article intent.
const localizedSeeds: Record<
  GeneratedBlogLocale,
  readonly LocalizedBlogSeed[]
> = {
  "de-DE": [
    {
      slug: slugs[0],
      title:
        "Unterton Haut bestimmen: passende Lippenstiftfarbe sicherer finden",
      summary:
        "Nutze Unterton, warme Hauttöne und kühle Hauttöne als Vergleichssystem, nicht als starres Etikett.",
      takeaways: [
        "Unterton Haut bestimmen mit Licht- und Farbvergleich",
        "passende Lippenstiftfarbe finden, ohne nur Farbnamen zu vertrauen",
      ],
      category: "Farbe",
      readTime: "7 Min.",
      coverAlt:
        "Farbvergleich mit Lippenstift und neutralem Licht zur Unterton-Bestimmung",
      seoKeywords: [
        "Unterton Haut bestimmen",
        "passende Lippenstiftfarbe finden",
        "Make-up für warme Hauttöne",
        "Make-up für kühle Hauttöne",
      ],
    },
    {
      slug: slugs[1],
      title: "KI Make-up Test oder Beauty Filter: Ergebnisse richtig lesen",
      summary:
        "Ein KI Make-up Test kann helfen, Looks zu vergleichen, ersetzt aber keine echte Produkt- und Lichtprüfung.",
      takeaways: [
        "KI Make-up Test von Beauty-Filtern unterscheiden",
        "virtuelles Make-up Testen mit realistischen Grenzen nutzen",
      ],
      category: "KI Make-up",
      readTime: "8 Min.",
      coverAlt:
        "Vergleich zwischen natürlichem Spiegelbild und KI Make-up Vorschau",
      seoKeywords: [
        "KI Make-up Test",
        "virtuelles Make-up Testen",
        "Make-up Simulator",
        "KI Make-up Beratung",
      ],
    },
    {
      slug: slugs[2],
      title: "Gesichtsform erkennen: Make-up über Blickführung planen",
      summary:
        "Statt Gesichter in starre Kategorien zu pressen, hilft eine Analyse von Linien, Licht und Fokus.",
      takeaways: [
        "Gesichtsform erkennen Make-up in konkrete Platzierung übersetzen",
        "contouring und Rouge nach Blickführung testen",
      ],
      category: "Platzierung",
      readTime: "7 Min.",
      coverAlt: "Rouge und Contour werden nach Gesichtsform verglichen",
      seoKeywords: [
        "Gesichtsform erkennen Make-up",
        "Make-up für runde Gesichter",
        "contouring",
        "welche Farbe steht mir",
      ],
    },
    {
      slug: slugs[3],
      title: "Foundation setzt sich ab: Reihenfolge gegen cakey Make-up",
      summary:
        "Wenn Foundation trocken, fleckig oder schwer wirkt, prüfe Hautzustand, Menge und Auftrag in einer festen Reihenfolge.",
      takeaways: [
        "beste Foundation für meinen Hautton nicht isoliert beurteilen",
        "Make-up für empfindliche Haut mit weniger Reibung testen",
      ],
      category: "Base",
      readTime: "7 Min.",
      coverAlt: "Foundation-Textur wird bei Tageslicht kontrolliert",
      seoKeywords: [
        "beste Foundation für meinen Hautton",
        "Make-up für empfindliche Haut",
        "Make-up Reihenfolge richtig",
        "häufige Schminkfehler",
      ],
    },
    {
      slug: slugs[4],
      title: "Make-up für Schlupflider: sichtbare Platzierung testen",
      summary:
        "Bei Schlupflidern entscheidet das geöffnete Auge, ob Liner, Schatten und Schimmer wirklich sichtbar bleiben.",
      takeaways: [
        "Make-up für schlupflider offenäugig planen",
        "dezenter Augenschmink ohne Überladung testen",
      ],
      category: "Augen",
      readTime: "7 Min.",
      coverAlt:
        "Augen-Make-up für Schlupflider wird mit geöffnetem Auge geprüft",
      seoKeywords: [
        "Make-up für schlupflider",
        "dezenter Augenschmink",
        "Augen Make-up Tipps",
        "Kajal vs. Eyeliner",
      ],
    },
    {
      slug: slugs[5],
      title: "5 Minuten Make-up: schnelle Routine für Alltag und Büro",
      summary:
        "Ein gutes schnelles Make-up priorisiert die Wirkung, nicht die Anzahl der Schritte.",
      takeaways: [
        "5 Minuten Make-up in eine feste Reihenfolge bringen",
        "Make-up fürs Büro und Alltag mit wenigen Produkten planen",
      ],
      category: "Routine",
      readTime: "6 Min.",
      coverAlt: "Schnelle Make-up Routine mit wenigen Produkten",
      seoKeywords: [
        "5 Minuten Make-up",
        "schnelles Make-up morgens",
        "Make-up fürs Büro",
        "Make-up für den Alltag",
      ],
    },
    {
      slug: slugs[6],
      title: "Foto-Make-up: was vor Kamera und im Alltag funktioniert",
      summary:
        "Make-up für Fotos braucht andere Kontraste als ein Look aus Gesprächsdistanz.",
      takeaways: [
        "Foto-Make-up mit Licht- und Distanzcheck testen",
        "Bewerbungsfoto Make-up und Reisepass-Foto Make-up trennen",
      ],
      category: "Foto",
      readTime: "7 Min.",
      coverAlt: "Make-up wird in Kamera- und Tageslicht verglichen",
      seoKeywords: [
        "Foto-Make-up",
        "Bewerbungsfoto Make-up",
        "Reisepass-Foto Make-up",
        "frischer Teint",
      ],
    },
    {
      slug: slugs[7],
      title: "Hochzeit Make-up als Gast: haltbar, festlich und reparierbar",
      summary:
        "Ein Gast-Look muss Foto, Essen, Temperatur und lange Tragezeit überstehen.",
      takeaways: [
        "Hochzeit Make-up Gast nach Eventdruck planen",
        "festliches Make-up mit einfacher Reparaturstrategie wählen",
      ],
      category: "Event",
      readTime: "7 Min.",
      coverAlt: "Festliches Make-up für Hochzeitsgäste",
      seoKeywords: [
        "Hochzeit Make-up Gast",
        "festliches Make-up",
        "Braut Make-up",
        "Abend-Make-up",
      ],
    },
    {
      slug: slugs[8],
      title: "Passende Lippenstiftfarbe finden: warm, kühl oder neutral",
      summary:
        "Lippenstift wirkt anders je nach Lippenfarbe, Licht, Sättigung und restlichem Make-up.",
      takeaways: [
        "passende Lippenstiftfarbe finden mit halbem Lippenvergleich",
        "langlebiger Lippenstift und Alltagstauglichkeit getrennt bewerten",
      ],
      category: "Lippen",
      readTime: "7 Min.",
      coverAlt: "Lippenstiftfarben werden bei gleichem Licht verglichen",
      seoKeywords: [
        "passende Lippenstiftfarbe finden",
        "langlebiger Lippenstift",
        "beste Lippenstift 2026",
        "welche Farbe steht mir",
      ],
    },
    {
      slug: slugs[9],
      title: "Virtuelles Make-up testen: bessere Fotos für KI Beratung",
      summary:
        "Ein klares Basisfoto macht virtuelle Make-up Tests stabiler und schützt gleichzeitig deine Privatsphäre.",
      takeaways: [
        "virtuelles Make-up Testen mit stabiler Foto-Basis vorbereiten",
        "KI Make-up Beratung nur mit geeigneten Bildern bewerten",
      ],
      category: "KI Praxis",
      readTime: "6 Min.",
      coverAlt: "Frontales Foto als Basis für virtuelles Make-up",
      seoKeywords: [
        "virtuelles Make-up Testen",
        "KI Make-up Beratung",
        "Hautanalyse KI",
        "persönliche Farbberatung online",
      ],
    },
  ],
  "fr-FR": [
    {
      slug: slugs[0],
      title: "Sous-ton de peau: choisir rouge à lèvres et couleurs",
      summary:
        "Le sous-ton aide à réduire les choix, mais il doit être comparé avec la lumière, la couvrance et la couleur naturelle des lèvres.",
      takeaways: [
        "relier rouge à lèvres pour teint chaud et teint froid à une méthode",
        "choisir son fond de teint sans dépendre d'une seule photo",
      ],
      category: "Couleur",
      readTime: "7 min",
      coverAlt: "Comparaison de couleurs de rouge à lèvres en lumière douce",
      seoKeywords: [
        "rouge à lèvres pour teint chaud",
        "rouge à lèvres pour teint froid",
        "choisir son fond de teint",
        "quelle couleur me va",
      ],
    },
    {
      slug: slugs[1],
      title: "Test maquillage virtuel et filtre beauté: comment lire le rendu",
      summary:
        "Un test maquillage virtuel peut inspirer une direction, mais il faut distinguer retouche, simulation et promesse produit.",
      takeaways: [
        "comparer test maquillage virtuel et filtre beauté",
        "utiliser IA maquillage avec une vérification réaliste",
      ],
      category: "IA maquillage",
      readTime: "8 min",
      coverAlt: "Comparaison entre miroir naturel et aperçu de maquillage IA",
      seoKeywords: [
        "test maquillage virtuel",
        "IA maquillage",
        "simulation maquillage en ligne",
        "essai maquillage avant achat",
      ],
    },
    {
      slug: slugs[2],
      title: "Maquillage pour visage rond: guider le regard sans figer",
      summary:
        "La forme du visage se travaille mieux avec les lignes, les zones de lumière et le point d'attention qu'avec une étiquette unique.",
      takeaways: [
        "adapter maquillage pour visage rond à la priorité du regard",
        "éviter les règles de contour trop générales",
      ],
      category: "Placement",
      readTime: "7 min",
      coverAlt: "Placement du blush et du contour sur le visage",
      seoKeywords: [
        "maquillage pour visage rond",
        "analyse visage maquillage",
        "quelle couleur me va",
        "maquillage élégant",
      ],
    },
    {
      slug: slugs[3],
      title: "Fond de teint qui marque: corriger texture, ordre et quantité",
      summary:
        "Quand le teint craquelle ou se sépare, le problème vient souvent de l'ordre des couches, de la peau du jour ou de la quantité.",
      takeaways: [
        "meilleur fond de teint pour ma peau ne se juge pas seul",
        "maquillage peau sensible avec moins de friction",
      ],
      category: "Teint",
      readTime: "7 min",
      coverAlt: "Texture du fond de teint examinée en lumière naturelle",
      seoKeywords: [
        "meilleur fond de teint pour ma peau",
        "maquillage peau sensible",
        "ordre maquillage étapes",
        "erreurs maquillage à éviter",
      ],
    },
    {
      slug: slugs[4],
      title: "Maquillage pour paupières tombantes: garder le regard visible",
      summary:
        "Le bon test se fait les yeux ouverts: c'est là que l'ombre, le liner et la lumière doivent rester lisibles.",
      takeaways: [
        "placer maquillage pour paupières tombantes au-dessus du pli",
        "choisir l'intensité sans alourdir le regard",
      ],
      category: "Yeux",
      readTime: "7 min",
      coverAlt: "Placement d'ombre pour paupières tombantes",
      seoKeywords: [
        "maquillage pour paupières tombantes",
        "palette ombres à paupières polyvalente",
        "tuto maquillage facile",
        "maquillage doux",
      ],
    },
    {
      slug: slugs[5],
      title: "Maquillage en 5 minutes: routine rapide et vraiment utile",
      summary:
        "Un maquillage rapide fonctionne quand les étapes sont classées par impact, pas par habitude.",
      takeaways: [
        "maquillage en 5 minutes avec priorité claire",
        "routine maquillage quotidienne sans surcharge",
      ],
      category: "Routine",
      readTime: "6 min",
      coverAlt: "Routine maquillage rapide avec peu de produits",
      seoKeywords: [
        "maquillage en 5 minutes",
        "maquillage rapide matin",
        "routine maquillage quotidienne",
        "maquillage pour le bureau",
      ],
    },
    {
      slug: slugs[6],
      title: "Maquillage pour photo: équilibre entre caméra et réalité",
      summary:
        "Un rendu qui fonctionne en photo ne doit pas forcément être plus chargé; il doit être vérifié avec la bonne distance et la bonne lumière.",
      takeaways: [
        "tester maquillage pour photo avec plusieurs lumières",
        "adapter contraste et brillance sans épaissir le teint",
      ],
      category: "Photo",
      readTime: "7 min",
      coverAlt: "Maquillage comparé en lumière intérieure et sur photo",
      seoKeywords: [
        "maquillage pour photo",
        "maquillage de jour",
        "teint lumineux",
        "teint frais",
      ],
    },
    {
      slug: slugs[7],
      title: "Maquillage invité mariage: tenir sans voler la scène",
      summary:
        "Un look d'invitée doit survivre à la durée, aux photos et aux retouches discrètes.",
      takeaways: [
        "maquillage invité mariage selon météo et photos",
        "choisir un point focal réparable",
      ],
      category: "Événement",
      readTime: "7 min",
      coverAlt: "Maquillage élégant pour invitée de mariage",
      seoKeywords: [
        "maquillage invité mariage",
        "maquillage de soirée",
        "maquillage élégant",
        "rouge à lèvres longue tenue",
      ],
    },
    {
      slug: slugs[8],
      title: "Choisir son rouge à lèvres: chaud, froid, nude ou intense",
      summary:
        "La bonne couleur se juge avec le visage entier, pas seulement sur la main ou dans le tube.",
      takeaways: [
        "relier rouge à lèvres pour teint chaud à l'ensemble du visage",
        "comparer tenue, bord et saturation",
      ],
      category: "Lèvres",
      readTime: "7 min",
      coverAlt: "Plusieurs rouges à lèvres comparés sur fond neutre",
      seoKeywords: [
        "rouge à lèvres pour teint chaud",
        "rouge à lèvres pour teint froid",
        "rouge à lèvres longue tenue",
        "meilleur rouge à lèvres 2026",
      ],
    },
    {
      slug: slugs[9],
      title: "Essai maquillage virtuel: préparer une photo fiable",
      summary:
        "La qualité de la photo change la fiabilité d'une simulation maquillage en ligne.",
      takeaways: [
        "préparer une base pour simulation maquillage en ligne",
        "protéger les informations privées avant l'upload",
      ],
      category: "IA pratique",
      readTime: "6 min",
      coverAlt: "Photo frontale utilisée pour un essai maquillage virtuel",
      seoKeywords: [
        "simulation maquillage en ligne",
        "essai maquillage avant achat",
        "diagnostic teint IA",
        "conseil maquillage personnalisé",
      ],
    },
  ],
  "ja-JP": [
    {
      slug: slugs[0],
      title: "パーソナルカラーと似合うリップカラーの見つけ方",
      summary:
        "イエベ、ブルベ、ニュートラルは固定ラベルではなく、色を絞るための比較軸として使います。",
      takeaways: [
        "パーソナルカラーを一枚の写真だけで決めない",
        "似合うリップカラーを全顔で比較する",
      ],
      category: "色選び",
      readTime: "7分",
      coverAlt: "自然光でリップカラーと肌色を比較している様子",
      seoKeywords: [
        "パーソナルカラー",
        "イエベ メイク",
        "ブルベ メイク",
        "似合うリップカラー",
      ],
    },
    {
      slug: slugs[1],
      title: "AIメイク診断とフィルターの違いを見極める",
      summary:
        "AIメイク診断は方向を見るためのもの。美肌加工や顔の変化と、実際のメイク効果を分けて判断します。",
      takeaways: [
        "AIメイク診断とバーチャルメイクの役割を分ける",
        "生成画像の信頼度をチェックする",
      ],
      category: "AIメイク",
      readTime: "8分",
      coverAlt: "鏡の顔とAIメイクプレビューを比較する画面",
      seoKeywords: [
        "AIメイク診断",
        "バーチャルメイク",
        "メイクシミュレーション",
        "似合うメイク 診断",
      ],
    },
    {
      slug: slugs[2],
      title: "顔タイプ診断だけに頼らないメイク重心の決め方",
      summary:
        "丸顔、面長などの名前より、視線がどこへ向かうかを見た方が実用的な配置を選びやすくなります。",
      takeaways: [
        "顔タイプ診断をメイク配置に落とし込む",
        "丸顔メイクや面長メイクを一つのルールにしない",
      ],
      category: "配置",
      readTime: "7分",
      coverAlt: "チークの位置を変えて顔の印象を比べる様子",
      seoKeywords: [
        "顔タイプ診断",
        "丸顔 メイク",
        "面長 メイク",
        "似合うチーク",
      ],
    },
    {
      slug: slugs[3],
      title: "ファンデが崩れる・乾く時のベースメイク確認順",
      summary:
        "乾燥しないファンデーションを探す前に、量、スキンケア、塗り方、光の条件を分けて確認します。",
      takeaways: [
        "乾燥しないファンデーションだけで解決しない原因を見る",
        "メイク順番と量を記録する",
      ],
      category: "ベース",
      readTime: "7分",
      coverAlt: "ベースメイクの質感を近くで確認している様子",
      seoKeywords: [
        "乾燥しないファンデーション",
        "メイク 順番",
        "メイク 失敗しない",
        "肌悩み別メイク",
      ],
    },
    {
      slug: slugs[4],
      title: "奥二重・一重メイクは開いた目で位置を決める",
      summary:
        "閉じた時にきれいなアイメイクより、開いた時に残るラインと影を優先します。",
      takeaways: [
        "奥二重メイクは見える範囲を先に確認する",
        "一重メイクでも色と線を分けて比べる",
      ],
      category: "アイメイク",
      readTime: "7分",
      coverAlt: "奥二重の目元でアイシャドウ位置を確認する様子",
      seoKeywords: [
        "奥二重 メイク",
        "一重 メイク",
        "アイメイク やり方",
        "涙袋メイク",
      ],
    },
    {
      slug: slugs[5],
      title: "5分メイクと時短メイクを失敗しにくくする順番",
      summary:
        "時間がない日は、全部を薄くやるより、効果が高い二つを先に決める方が安定します。",
      takeaways: [
        "5分メイクで省略しない軸を決める",
        "時短メイク手順を場面別に分ける",
      ],
      category: "時短",
      readTime: "6分",
      coverAlt: "短時間で使うメイク道具を並べた様子",
      seoKeywords: [
        "5分メイク",
        "時短メイク",
        "時短メイク 手順",
        "オフィスメイク",
      ],
    },
    {
      slug: slugs[6],
      title: "写真映えメイクと普段メイクを同時に成立させる",
      summary:
        "写真映えは濃さだけでは決まりません。距離、光、質感の見え方を分けて確認します。",
      takeaways: [
        "写真映えメイクを複数の光で確認する",
        "証明写真メイクと日常メイクを分けて考える",
      ],
      category: "写真",
      readTime: "7分",
      coverAlt: "スマートフォンでメイクの写りを確認する様子",
      seoKeywords: [
        "写真映えメイク",
        "証明写真メイク",
        "卒業式メイク",
        "透明感メイク",
      ],
    },
    {
      slug: slugs[7],
      title: "結婚式ゲストメイクは持ちと写真のバランスで選ぶ",
      summary:
        "長時間の式では、華やかさだけでなく直しやすさと写真での見え方が重要です。",
      takeaways: [
        "結婚式ゲストメイクを天候と時間で計画する",
        "崩れた時に直せる主役を決める",
      ],
      category: "イベント",
      readTime: "7分",
      coverAlt: "結婚式ゲスト向けの上品なメイク",
      seoKeywords: [
        "結婚式ゲストメイク",
        "パーティーメイク",
        "血色感メイク",
        "崩れないリップ",
      ],
    },
    {
      slug: slugs[8],
      title: "似合うリップカラーは半顔より全顔で決める",
      summary:
        "リップは元の唇の色、チーク、服、光で印象が変わります。単品ではなく全体で比較します。",
      takeaways: [
        "似合うリップカラーを全顔写真で見る",
        "おすすめリップを買う前に明度と彩度を分ける",
      ],
      category: "リップ",
      readTime: "7分",
      coverAlt: "複数のリップカラーを自然光で比較する様子",
      seoKeywords: [
        "似合うリップカラー",
        "おすすめリップ 2026",
        "崩れないリップ",
        "ブルベ メイク",
      ],
    },
    {
      slug: slugs[9],
      title: "バーチャルメイク用の写真を失敗しにくく撮る方法",
      summary:
        "AI診断やメイクシミュレーションは、入力写真の光と角度で安定感が大きく変わります。",
      takeaways: [
        "バーチャルメイクに向く基準写真を作る",
        "個人情報が写り込まないように確認する",
      ],
      category: "AI実践",
      readTime: "6分",
      coverAlt: "AIメイク用に正面写真を撮る様子",
      seoKeywords: [
        "バーチャルメイク",
        "メイクシミュレーション",
        "顔タイプ 診断 AI",
        "肌診断 AI",
      ],
    },
  ],
  "ko-KR": [
    {
      slug: slugs[0],
      title: "퍼스널컬러 메이크업과 웜톤 립 고르는 법",
      summary:
        "웜톤, 쿨톤은 고정 라벨이 아니라 색 선택을 줄이는 비교 기준으로 사용해야 합니다.",
      takeaways: [
        "퍼스널컬러 메이크업을 사진 한 장으로 결정하지 않기",
        "웜톤 립과 쿨톤 립을 같은 조건에서 비교하기",
      ],
      category: "컬러",
      readTime: "7분",
      coverAlt: "자연광에서 립 컬러와 피부톤을 비교하는 모습",
      seoKeywords: [
        "퍼스널컬러 메이크업",
        "웜톤 메이크업",
        "쿨톤 메이크업",
        "웜톤 립",
      ],
    },
    {
      slug: slugs[1],
      title: "AI 메이크업 진단과 필터 결과를 구분하는 법",
      summary:
        "AI 메이크업 앱은 방향을 좁히는 도구입니다. 보정, 얼굴 변화, 실제 메이크업 효과를 나눠 봐야 합니다.",
      takeaways: [
        "AI 메이크업 진단과 가상 메이크업 체험을 구분하기",
        "결과가 내 얼굴을 얼마나 보존하는지 확인하기",
      ],
      category: "AI 메이크업",
      readTime: "8분",
      coverAlt: "거울 이미지와 AI 메이크업 프리뷰를 비교하는 화면",
      seoKeywords: [
        "AI 메이크업 진단",
        "가상 메이크업 체험",
        "AI 메이크업 앱",
        "내 얼굴에 맞는 메이크업",
      ],
    },
    {
      slug: slugs[2],
      title: "얼굴형 메이크업은 시선의 흐름부터 정한다",
      summary:
        "둥근 얼굴, 긴 얼굴 같은 이름보다 선, 밝기, 컬러 면적이 시선을 어디로 보내는지 보는 편이 실용적입니다.",
      takeaways: [
        "얼굴형 메이크업을 시선 순서로 정리하기",
        "둥근 얼굴 메이크업과 긴 얼굴 메이크업을 한 규칙으로 보지 않기",
      ],
      category: "배치",
      readTime: "7분",
      coverAlt: "블러셔 위치를 바꿔 얼굴 인상을 비교하는 모습",
      seoKeywords: [
        "얼굴형 메이크업",
        "둥근 얼굴 메이크업",
        "긴 얼굴 메이크업",
        "얼굴형 분석",
      ],
    },
    {
      slug: slugs[3],
      title: "베이스가 들뜨고 갈라질 때 확인할 메이크업 순서",
      summary:
        "쿠션 파데 추천을 찾기 전에 피부 상태, 양, 도구, 파우더 위치를 분리해서 점검합니다.",
      takeaways: [
        "메이크업 순서를 바꿔 베이스 실패 원인 찾기",
        "쿠션 파데 추천보다 사용 조건을 먼저 보기",
      ],
      category: "베이스",
      readTime: "7분",
      coverAlt: "베이스 메이크업 질감을 가까이 확인하는 모습",
      seoKeywords: [
        "메이크업 순서",
        "쿠션 파데 추천",
        "메이크업 실수",
        "AI 피부 분석",
      ],
    },
    {
      slug: slugs[4],
      title: "홑꺼풀 메이크업은 눈을 뜬 상태에서 위치를 본다",
      summary:
        "감았을 때 예쁜 아이메이크업보다, 떴을 때 남는 선과 음영이 더 중요합니다.",
      takeaways: [
        "홑꺼풀 메이크업에서 보이는 영역 먼저 확인하기",
        "아이메이크업 방법을 눈 모양에 맞게 조정하기",
      ],
      category: "아이",
      readTime: "7분",
      coverAlt: "홑꺼풀 눈매에서 아이섀도우 위치를 확인하는 모습",
      seoKeywords: [
        "홑꺼풀 메이크업",
        "아이메이크업 방법",
        "눈 작은 얼굴 메이크업",
        "아이섀도우 팔레트 추천",
      ],
    },
    {
      slug: slugs[5],
      title: "5분 메이크업과 출근 메이크업을 안정적으로 만드는 법",
      summary:
        "빠른 메이크업은 단계를 줄이는 일이 아니라, 효과가 큰 순서로 배치하는 일입니다.",
      takeaways: [
        "5분 메이크업에서 핵심 두 단계를 정하기",
        "출근 메이크업과 등교 메이크업을 상황별로 나누기",
      ],
      category: "루틴",
      readTime: "6분",
      coverAlt: "출근 전 사용하는 간단한 메이크업 제품들",
      seoKeywords: [
        "5분 메이크업",
        "출근 메이크업",
        "빠른 메이크업",
        "간단한 메이크업",
      ],
    },
    {
      slug: slugs[6],
      title: "프로필 사진 메이크업과 일상 메이크업의 균형",
      summary:
        "사진용 메이크업은 무조건 진한 것이 아니라 빛, 거리, 질감을 따로 확인해야 합니다.",
      takeaways: [
        "프로필 사진 메이크업을 조명별로 확인하기",
        "데일리 메이크업과 사진용 대비를 분리하기",
      ],
      category: "사진",
      readTime: "7분",
      coverAlt: "휴대폰 카메라로 메이크업 표현을 확인하는 모습",
      seoKeywords: [
        "프로필 사진 메이크업",
        "데일리 메이크업",
        "글로우 메이크업",
        "비포 애프터 메이크업",
      ],
    },
    {
      slug: slugs[7],
      title: "웨딩 게스트 메이크업은 지속력과 수정 가능성이 핵심",
      summary:
        "오래 지속되는 행사에서는 예쁨만큼 사진, 식사, 온도, 수정 방법이 중요합니다.",
      takeaways: [
        "웨딩 게스트 메이크업을 시간과 날씨로 계획하기",
        "지속력 좋은 립스틱과 베이스 수정 전략 세우기",
      ],
      category: "행사",
      readTime: "7분",
      coverAlt: "웨딩 게스트를 위한 우아한 메이크업",
      seoKeywords: [
        "웨딩 게스트 메이크업",
        "파티 메이크업",
        "지속력 좋은 립스틱",
        "러블리 메이크업",
      ],
    },
    {
      slug: slugs[8],
      title: "웜톤 립과 쿨톤 립은 전 얼굴 사진으로 비교한다",
      summary:
        "립 컬러는 원래 입술색, 치크, 옷, 조명에 따라 달라집니다. 부분 발색만으로 결정하지 마세요.",
      takeaways: [
        "웜톤 립과 쿨톤 립을 같은 조명에서 비교하기",
        "인생 립스틱을 찾기 전 채도와 명도를 나누기",
      ],
      category: "립",
      readTime: "7분",
      coverAlt: "여러 립 컬러를 같은 조명에서 비교하는 모습",
      seoKeywords: ["웜톤 립", "쿨톤 립", "인생 립스틱", "추천 립스틱 2026"],
    },
    {
      slug: slugs[9],
      title: "가상 메이크업 체험용 사진을 잘 준비하는 법",
      summary:
        "AI 메이크업 결과는 입력 사진의 빛, 각도, 배경 정보에 크게 영향을 받습니다.",
      takeaways: [
        "가상 메이크업 체험에 맞는 기준 사진 만들기",
        "개인정보가 배경에 들어가지 않도록 확인하기",
      ],
      category: "AI 실전",
      readTime: "6분",
      coverAlt: "AI 메이크업 체험을 위해 정면 사진을 촬영하는 모습",
      seoKeywords: [
        "가상 메이크업 체험",
        "AI 메이크업 앱",
        "AI 피부 분석",
        "나에게 어울리는 메이크업",
      ],
    },
  ],
  "zh-TW": [
    {
      slug: slugs[0],
      title: "個人色彩與適合我的口紅：用比較法判斷冷暖調",
      summary:
        "個人色彩不是永久標籤，而是幫你縮小唇色、腮紅和眼妝方向的比較工具。",
      takeaways: [
        "用個人色彩判斷冷調與暖調彩妝",
        "把適合我的口紅轉成可複核的試色記錄",
      ],
      category: "色彩",
      readTime: "7 分鐘",
      coverAlt: "在自然光下比較不同口紅與膚色的協調度",
      seoKeywords: ["個人色彩", "適合我的口紅", "冷調膚色彩妝", "暖調膚色彩妝"],
    },
    {
      slug: slugs[1],
      title: "AI 妝容診斷和美顏濾鏡差在哪？先看清結果邊界",
      summary:
        "AI 妝容診斷可以幫助比較方向，但不能把生成圖直接當成現實效果保證。",
      takeaways: [
        "區分 AI 妝容診斷、虛擬試妝和美顏濾鏡",
        "用身分保留、光線和可實現度檢查結果",
      ],
      category: "AI 試妝",
      readTime: "8 分鐘",
      coverAlt: "比較原始自拍與 AI 試妝預覽畫面",
      seoKeywords: ["AI 妝容診斷", "虛擬試妝", "AI 彩妝推薦", "線上試妝"],
    },
    {
      slug: slugs[2],
      title: "圓臉彩妝不只靠修容：先決定妝容重心",
      summary:
        "比起替臉型貼標籤，觀察線條、明暗與色彩面積更能幫你調整視覺焦點。",
      takeaways: [
        "把圓臉彩妝和長臉彩妝轉成重心判斷",
        "用單變量照片比較腮紅與修容位置",
      ],
      category: "妝容位置",
      readTime: "7 分鐘",
      coverAlt: "調整腮紅與修容位置來比較臉部重心",
      seoKeywords: ["圓臉彩妝", "長臉彩妝", "臉部分析 彩妝", "化妝技巧"],
    },
    {
      slug: slugs[3],
      title: "不卡粉技巧：底妝浮粉、乾裂時先檢查這些順序",
      summary:
        "底妝問題通常不只來自粉底本身，也可能是保養、用量、工具和定妝位置互相影響。",
      takeaways: [
        "用不卡粉技巧分辨乾、油、厚重或搓泥",
        "把化妝順序和產品用量分開測試",
      ],
      category: "底妝",
      readTime: "7 分鐘",
      coverAlt: "近距離觀察底妝是否浮粉或卡紋",
      seoKeywords: ["不卡粉技巧", "化妝順序", "敏弱肌彩妝", "氣墊粉餅推薦"],
    },
    {
      slug: slugs[4],
      title: "單眼皮與內雙彩妝：眼妝位置要用睜眼狀態判斷",
      summary:
        "閉眼漂亮不代表睜眼看得到。眼線、眼影和亮片都要以睜眼後的位置為準。",
      takeaways: ["單眼皮彩妝先找可見範圍", "內雙彩妝要避免線條被摺痕吃掉"],
      category: "眼妝",
      readTime: "7 分鐘",
      coverAlt: "睜眼狀態下檢查眼影與眼線位置",
      seoKeywords: ["單眼皮彩妝", "內雙彩妝", "眼線怎麼畫", "眼影教學"],
    },
    {
      slug: slugs[5],
      title: "5分鐘快速出門妝：把日常妝容教學變成固定順序",
      summary: "快速妝不是每一步都做一點，而是先完成最能改變精神感的兩三步。",
      takeaways: [
        "建立 5分鐘快速出門妝的最低完成版",
        "把通勤妝與上班妝的優先順序分開",
      ],
      category: "日常",
      readTime: "6 分鐘",
      coverAlt: "快速出門妝使用的少量彩妝產品",
      seoKeywords: ["5分鐘快速出門妝", "日常妝容教學", "通勤妝", "上班妝"],
    },
    {
      slug: slugs[6],
      title: "證件照妝和畢業照妝容：照片與現實都要能成立",
      summary: "拍照妝不只是加重，而是要在鏡頭距離、光線和臉部紋理之間取平衡。",
      takeaways: [
        "用證件照妝檢查臉部對稱和乾淨度",
        "畢業照妝容要同時考慮遠景和近看",
      ],
      category: "拍照",
      readTime: "7 分鐘",
      coverAlt: "用手機檢查妝容在照片中的呈現",
      seoKeywords: ["證件照妝", "畢業照妝容", "清透妝", "妝前妝後對比"],
    },
    {
      slug: slugs[7],
      title: "婚禮賓客妝：持久、上鏡又不搶主角",
      summary: "婚禮妝容需要考慮拍照、用餐、天氣和補妝，不只是當下好看。",
      takeaways: [
        "婚禮賓客妝先判斷活動壓力",
        "用持久口紅推薦思路選擇可補妝焦點",
      ],
      category: "活動",
      readTime: "7 分鐘",
      coverAlt: "婚禮賓客適合的柔和精緻妝容",
      seoKeywords: ["婚禮賓客妝", "約會妝", "氛圍感妝容", "持久口紅推薦"],
    },
    {
      slug: slugs[8],
      title: "顯白口紅怎麼挑？先比較明度、彩度和原生唇色",
      summary:
        "顯白不是唯一標準。能讓氣色、五官和整體風格更協調，才更有日常價值。",
      takeaways: [
        "把顯白口紅拆成明度、彩度和冷暖",
        "適合我的口紅要看全臉，不只看手臂試色",
      ],
      category: "唇妝",
      readTime: "7 分鐘",
      coverAlt: "比較不同唇膏顏色在臉上的效果",
      seoKeywords: ["顯白口紅", "適合我的口紅", "霧面唇膏推薦", "2026口紅推薦"],
    },
    {
      slug: slugs[9],
      title: "虛擬試妝照片怎麼拍：讓 AI 彩妝推薦更穩定",
      summary:
        "AI 彩妝推薦是否有用，很大程度取決於輸入照片的光線、角度和背景干擾。",
      takeaways: ["為虛擬試妝準備一張穩定基準照", "上傳前檢查背景中的個人資訊"],
      category: "AI 實作",
      readTime: "6 分鐘",
      coverAlt: "為 AI 試妝準備正面基準照片",
      seoKeywords: ["虛擬試妝", "AI 彩妝推薦", "AI 膚質檢測", "臉部分析 彩妝"],
    },
  ],
  "es-ES": [
    {
      slug: slugs[0],
      title: "Colorimetría personal: qué labial me queda según mi tono",
      summary:
        "La colorimetría ayuda a reducir opciones, pero debe compararse con luz, profundidad de piel y color natural de labios.",
      takeaways: [
        "usar colorimetría personal online como punto de partida",
        "decidir qué labial me queda con fotos comparables",
      ],
      category: "Color",
      readTime: "7 min",
      coverAlt: "Comparación de labiales y tonos de piel con luz natural",
      seoKeywords: [
        "colorimetría personal online",
        "qué labial me queda",
        "labial para tono cálido",
        "labial para tono frío",
      ],
    },
    {
      slug: slugs[1],
      title: "Probador de maquillaje con IA: diferencia entre filtro y prueba",
      summary:
        "Un probador de maquillaje con IA puede orientar, pero hay que separar retoque, simulación y resultado alcanzable.",
      takeaways: [
        "distinguir probador de maquillaje con IA y filtro de belleza",
        "usar prueba de maquillaje virtual sin confundirla con garantía",
      ],
      category: "IA maquillaje",
      readTime: "8 min",
      coverAlt: "Comparación entre rostro real y simulador de maquillaje",
      seoKeywords: [
        "probador de maquillaje con IA",
        "prueba de maquillaje virtual",
        "simulador de maquillaje",
        "test de maquillaje en línea",
      ],
    },
    {
      slug: slugs[2],
      title: "Maquillaje según forma de tu rostro sin reglas rígidas",
      summary:
        "La forma del rostro se trabaja mejor con dirección de líneas, luz y foco visual que con etiquetas únicas.",
      takeaways: [
        "usar maquillaje según forma de tu rostro con criterio",
        "comparar contorno y rubor sin exagerar",
      ],
      category: "Colocación",
      readTime: "7 min",
      coverAlt: "Colocación de rubor y contorno según el rostro",
      seoKeywords: [
        "maquillaje según forma de tu rostro",
        "maquillaje para cara redonda",
        "maquillaje para cara alargada",
        "técnicas de contorno",
      ],
    },
    {
      slug: slugs[3],
      title: "Base que se cuartea: orden y errores de maquillaje",
      summary:
        "Antes de buscar otra base, separa piel del día, preparación, cantidad, herramienta y polvo.",
      takeaways: [
        "evitar errores de maquillaje que marcan textura",
        "elegir mejor base para mi tono de piel con pruebas reales",
      ],
      category: "Piel",
      readTime: "7 min",
      coverAlt: "Textura de base de maquillaje vista con luz natural",
      seoKeywords: [
        "errores de maquillaje",
        "mejor base para mi tono de piel",
        "maquillaje para piel seca",
        "orden de maquillaje",
      ],
    },
    {
      slug: slugs[4],
      title: "Maquillaje para párpados caídos y ojos pequeños",
      summary:
        "La colocación se decide con los ojos abiertos: ahí se ve si sombra, línea y luz siguen presentes.",
      takeaways: [
        "maquillaje para párpados caídos con zona visible",
        "maquillaje para ojos pequeños sin cerrar la mirada",
      ],
      category: "Ojos",
      readTime: "7 min",
      coverAlt: "Sombra de ojos colocada para párpados caídos",
      seoKeywords: [
        "maquillaje para párpados caídos",
        "maquillaje para ojos pequeños",
        "maquillaje de ojos fácil",
        "delineador para principiantes",
      ],
    },
    {
      slug: slugs[5],
      title: "Maquillaje fácil y rápido para trabajo y rutina diaria",
      summary:
        "Una rutina rápida funciona cuando prioriza impacto: piel puntual, mirada definida y color que devuelve vida.",
      takeaways: [
        "maquillaje fácil y rápido con pocos pasos",
        "maquillaje para el trabajo sin sobrecargar",
      ],
      category: "Rutina",
      readTime: "6 min",
      coverAlt: "Productos para maquillaje rápido de todos los días",
      seoKeywords: [
        "maquillaje fácil y rápido",
        "maquillaje para el trabajo",
        "rutina de maquillaje diaria",
        "maquillaje básico diario",
      ],
    },
    {
      slug: slugs[6],
      title: "Maquillaje para fotos: cámara, luz y vida real",
      summary:
        "El maquillaje para fotos no siempre necesita más producto; necesita contraste y brillo controlados para la distancia correcta.",
      takeaways: [
        "probar maquillaje para fotos con varias luces",
        "separar maquillaje de día y maquillaje editorial",
      ],
      category: "Foto",
      readTime: "7 min",
      coverAlt: "Maquillaje revisado en cámara de móvil",
      seoKeywords: [
        "maquillaje para fotos",
        "maquillaje de día",
        "piel luminosa",
        "antes y después maquillaje",
      ],
    },
    {
      slug: slugs[7],
      title: "Maquillaje para boda de invitada: bonito y retocable",
      summary:
        "Un look de invitada debe funcionar en fotos, durar durante la celebración y poder corregirse sin drama.",
      takeaways: [
        "maquillaje para boda de invitada según clima y duración",
        "elegir un foco que se pueda retocar",
      ],
      category: "Evento",
      readTime: "7 min",
      coverAlt: "Maquillaje elegante para invitada de boda",
      seoKeywords: [
        "maquillaje para boda de invitada",
        "maquillaje para fiesta",
        "labial de larga duración",
        "maquillaje elegante",
      ],
    },
    {
      slug: slugs[8],
      title: "Qué labial me queda: cálido, frío, nude o rosa empolvado",
      summary:
        "El labial cambia con el color natural de labios, rubor, ropa y luz. La comparación debe hacerse con el rostro completo.",
      takeaways: [
        "decidir qué labial me queda con fotos consistentes",
        "comparar rosa empolvado, nude caramelo y tonos más intensos",
      ],
      category: "Labios",
      readTime: "7 min",
      coverAlt: "Varios tonos de labial comparados sobre rostro completo",
      seoKeywords: [
        "qué labial me queda",
        "rosa empolvado labial",
        "labial nude caramelo",
        "mejor labial 2026",
      ],
    },
    {
      slug: slugs[9],
      title: "Prueba de maquillaje virtual: cómo tomar una buena foto",
      summary:
        "La foto de entrada determina si un simulador de maquillaje conserva tus rasgos y compara looks de forma útil.",
      takeaways: [
        "preparar una foto base para prueba de maquillaje virtual",
        "reducir distracciones y datos personales del fondo",
      ],
      category: "IA práctica",
      readTime: "6 min",
      coverAlt: "Foto frontal preparada para prueba de maquillaje virtual",
      seoKeywords: [
        "prueba de maquillaje virtual",
        "simulador de maquillaje",
        "diagnóstico de piel IA",
        "asesor de belleza IA",
      ],
    },
  ],
  "pt-BR": [
    {
      slug: slugs[0],
      title: "Colorimetria pessoal: qual batom combina comigo",
      summary:
        "Colorimetria ajuda a reduzir escolhas, mas precisa ser comparada com luz, profundidade da pele e cor natural dos lábios.",
      takeaways: [
        "usar colorimetria pessoal como ponto de partida",
        "decidir qual batom combina comigo com fotos comparáveis",
      ],
      category: "Cor",
      readTime: "7 min",
      coverAlt: "Comparação de batons e tons de pele em luz natural",
      seoKeywords: [
        "colorimetria pessoal",
        "qual batom combina comigo",
        "batom para pele morena",
        "batom para pele clara",
      ],
    },
    {
      slug: slugs[1],
      title: "Maquiagem virtual com IA: diferença entre filtro e teste",
      summary:
        "A maquiagem virtual com IA ajuda a visualizar direções, mas não deve ser confundida com filtro ou garantia de produto.",
      takeaways: [
        "comparar maquiagem virtual com IA e filtro de beleza",
        "usar simulador de maquiagem com limites realistas",
      ],
      category: "IA maquiagem",
      readTime: "8 min",
      coverAlt: "Comparação entre rosto real e prévia de maquiagem com IA",
      seoKeywords: [
        "maquiagem virtual com IA",
        "simulador de maquiagem",
        "teste de maquiagem virtual",
        "provador virtual de maquiagem",
      ],
    },
    {
      slug: slugs[2],
      title: "Contorno facial e maquiagem para rosto redondo sem exagero",
      summary:
        "Formato do rosto se trabalha melhor com luz, direção e foco visual do que com uma regra fixa de contorno.",
      takeaways: [
        "usar contorno facial com comparação de foco",
        "adaptar maquiagem para rosto redondo ao objetivo",
      ],
      category: "Posicionamento",
      readTime: "7 min",
      coverAlt: "Posição de blush e contorno em diferentes pontos do rosto",
      seoKeywords: [
        "contorno facial",
        "maquiagem para rosto redondo",
        "maquiagem para rosto oval",
        "como fazer contorno",
      ],
    },
    {
      slug: slugs[3],
      title: "Base que não craquela: ordem, pele e quantidade importam",
      summary:
        "Antes de trocar de base, separe preparo da pele, quantidade, ferramenta, pó e luz em testes pequenos.",
      takeaways: [
        "avaliar base que não craquela com rotina controlada",
        "entender maquiagem para pele seca e oleosa separadamente",
      ],
      category: "Pele",
      readTime: "7 min",
      coverAlt: "Textura da base observada em luz natural",
      seoKeywords: [
        "base que não craquela",
        "maquiagem para pele seca",
        "maquiagem para pele oleosa",
        "ordem da maquiagem",
      ],
    },
    {
      slug: slugs[4],
      title: "Maquiagem para pálpebras caídas: posição visível primeiro",
      summary:
        "Sombra e delineado precisam ser avaliados com os olhos abertos, porque é aí que o resultado aparece.",
      takeaways: [
        "posicionar maquiagem para pálpebras caídas acima da dobra",
        "usar esfumado e máscara sem fechar o olhar",
      ],
      category: "Olhos",
      readTime: "7 min",
      coverAlt: "Aplicação de sombra em pálpebra caída com olho aberto",
      seoKeywords: [
        "maquiagem para pálpebras caídas",
        "como fazer esfumado",
        "rímel para cílios curtos",
        "sombra em creme",
      ],
    },
    {
      slug: slugs[5],
      title: "Maquiagem rápida para trabalho, faculdade e dia a dia",
      summary:
        "Uma rotina rápida fica melhor quando começa pelo que mais muda o rosto, não pelo que você sempre fez.",
      takeaways: [
        "montar maquiagem rápida com poucos produtos",
        "separar maquiagem para o trabalho e make para faculdade",
      ],
      category: "Rotina",
      readTime: "6 min",
      coverAlt: "Produtos simples para maquiagem rápida de manhã",
      seoKeywords: [
        "maquiagem rápida",
        "maquiagem para o trabalho",
        "make para faculdade",
        "maquiagem básica para o dia",
      ],
    },
    {
      slug: slugs[6],
      title: "Maquiagem para fotos: câmera, pele glow e vida real",
      summary:
        "A maquiagem para fotos precisa funcionar na câmera sem ficar pesada demais de perto.",
      takeaways: [
        "testar maquiagem para fotos em várias luzes",
        "equilibrar pele glow com textura real",
      ],
      category: "Foto",
      readTime: "7 min",
      coverAlt: "Maquiagem sendo conferida na câmera do celular",
      seoKeywords: [
        "maquiagem para fotos",
        "maquiagem glow",
        "pele glow",
        "antes e depois maquiagem",
      ],
    },
    {
      slug: slugs[7],
      title: "Maquiagem para casamento como convidada: bonita e retocável",
      summary:
        "O look precisa aguentar fotos, calor, comida e retoques discretos durante o evento.",
      takeaways: [
        "planejar maquiagem para casamento convidada pela duração",
        "escolher batom e base fáceis de retocar",
      ],
      category: "Evento",
      readTime: "7 min",
      coverAlt: "Maquiagem elegante para convidada de casamento",
      seoKeywords: [
        "maquiagem para casamento",
        "maquiagem para festa",
        "batom vinho",
        "gloss labial",
      ],
    },
    {
      slug: slugs[8],
      title: "Qual batom combina comigo: nude, marrom, vinho ou gloss",
      summary:
        "O batom muda com a cor natural dos lábios, blush, roupa e luz. Compare com o rosto inteiro.",
      takeaways: [
        "decidir qual batom combina comigo com fotos consistentes",
        "comparar batom nude, marrom, vinho e gloss por contexto",
      ],
      category: "Lábios",
      readTime: "7 min",
      coverAlt: "Vários tons de batom comparados no rosto completo",
      seoKeywords: [
        "qual batom combina comigo",
        "batom nude para pele morena",
        "batom marrom",
        "melhor batom 2026",
      ],
    },
    {
      slug: slugs[9],
      title: "Simulador de maquiagem: como tirar uma boa foto para IA",
      summary:
        "A foto de entrada define se o simulador preserva seus traços e compara looks de maneira útil.",
      takeaways: [
        "preparar foto base para simulador de maquiagem",
        "proteger privacidade antes do upload",
      ],
      category: "IA prática",
      readTime: "6 min",
      coverAlt: "Foto frontal preparada para simulador de maquiagem",
      seoKeywords: [
        "simulador de maquiagem",
        "provador virtual de maquiagem",
        "análise de pele IA",
        "consultor de beleza IA",
      ],
    },
  ],
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function sentenceList(items: readonly string[]): string {
  return items.map((item) => `<strong>${escapeHtml(item)}</strong>`).join(", ");
}

function renderLocalizedContent(
  seed: LocalizedBlogSeed,
  copy: BlogUiCopy["body"],
  relatedSlugs: readonly string[],
): string {
  const primary = seed.seoKeywords[0] ?? seed.title;
  const secondary = seed.seoKeywords[1] ?? seed.category;
  const relatedA = relatedSlugs[0] ?? "ai-makeup-photo-guide";
  const relatedB = relatedSlugs[1] ?? "how-to-determine-skin-undertone";
  const matrixRows = copy.matrixRows
    .map(
      ([label, text], index) =>
        `<div><strong>${escapeHtml(label)}</strong><span>${escapeHtml(text)} ${escapeHtml(seed.takeaways[index % seed.takeaways.length] ?? seed.summary)}</span></div>`,
    )
    .join("");
  const steps = copy.stepLabels
    .map((label, index) => {
      const keyword =
        seed.seoKeywords[index % seed.seoKeywords.length] ?? primary;
      return `<li><strong>${escapeHtml(label)}:</strong> ${escapeHtml(keyword)} — ${escapeHtml(seed.takeaways[index % seed.takeaways.length] ?? seed.summary)}</li>`;
    })
    .join("");
  const checks = copy.checkLabels
    .map((label, index) => {
      const keyword =
        seed.seoKeywords[(index + 1) % seed.seoKeywords.length] ?? secondary;
      return `<li><strong>${escapeHtml(label)}:</strong> ${escapeHtml(keyword)} ${escapeHtml(seed.summary)}</li>`;
    })
    .join("");
  const keywordNotes = seed.seoKeywords
    .map((keyword, index) => {
      const takeaway =
        seed.takeaways[index % seed.takeaways.length] ?? seed.summary;
      const matrix =
        copy.matrixRows[index % copy.matrixRows.length]?.[1] ??
        copy.decisionText;
      return `<p><strong>${escapeHtml(keyword)}:</strong> ${escapeHtml(seed.title)}. ${escapeHtml(seed.summary)} ${escapeHtml(takeaway)} ${escapeHtml(matrix)} ${escapeHtml(copy.practiceText)}</p>`;
    })
    .join("");

  return `
      <p class="article-lead">${escapeHtml(seed.summary)} ${escapeHtml(copy.intentText)}</p>
      <h2>${escapeHtml(copy.intentHeading)}: ${escapeHtml(seed.title)}</h2>
      <p>${escapeHtml(copy.keywordText)} ${sentenceList(seed.seoKeywords)}.</p>
      <p>${escapeHtml(copy.decisionText)} ${escapeHtml(seed.takeaways[0] ?? seed.summary)}</p>
      <p>${escapeHtml(seed.title)}: ${sentenceList([primary, secondary])}. ${escapeHtml(copy.intentText)} ${escapeHtml(copy.keywordText)}</p>
      <p>${escapeHtml(copy.keywordText)} ${sentenceList(seed.seoKeywords)}. ${escapeHtml(copy.decisionText)} ${escapeHtml(copy.practiceText)} ${escapeHtml(seed.takeaways.join(" "))}</p>
      <h2>${escapeHtml(copy.keywordHeading)}: ${escapeHtml(seed.title)}</h2>
      <p>${escapeHtml(primary)} / ${escapeHtml(secondary)}: ${escapeHtml(seed.summary)}</p>
      <p>${escapeHtml(seed.takeaways[1] ?? seed.takeaways[0] ?? seed.summary)}. ${escapeHtml(copy.practiceText)}</p>
      ${keywordNotes}
      <h2>${escapeHtml(copy.decisionHeading)}: ${escapeHtml(seed.category)}</h2>
      <p>${escapeHtml(copy.stepIntro)} ${escapeHtml(seed.title)}.</p>
      <div class="article-matrix">${matrixRows}</div>
      <h2>${escapeHtml(copy.stepsHeading)}: ${escapeHtml(seed.title)}</h2>
      <p>${escapeHtml(copy.stepIntro)} ${escapeHtml(seed.title)}. ${escapeHtml(copy.nextText)}</p>
      <ol>${steps}</ol>
      <h2>${escapeHtml(copy.aiHeading)}: ${escapeHtml(seed.title)}</h2>
      <p>${escapeHtml(copy.aiText)} ${escapeHtml(seed.takeaways[0] ?? seed.summary)}</p>
      <p>${escapeHtml(copy.nextText)} <a href="/diagnosis">${escapeHtml(seed.category)}</a> · <a href="/tryon">${escapeHtml(secondary)}</a>.</p>
      <aside class="article-note"><strong>${escapeHtml(copy.aiHeading)}:</strong> ${escapeHtml(copy.note)}</aside>
      <h2>${escapeHtml(copy.mistakesHeading)}: ${escapeHtml(seed.title)}</h2>
      <p>${escapeHtml(copy.intentText)} ${escapeHtml(seed.summary)}</p>
      <ul>${checks}</ul>
      <h2>${escapeHtml(copy.practiceHeading)}: ${escapeHtml(seed.category)}</h2>
      <p>${escapeHtml(copy.practiceText)} ${escapeHtml(seed.takeaways[0] ?? seed.summary)}</p>
      <p>${escapeHtml(copy.nextText)} <a href="/blog/${escapeHtml(relatedA)}">${escapeHtml(seed.seoKeywords[2] ?? primary)}</a> · <a href="/blog/${escapeHtml(relatedB)}">${escapeHtml(seed.seoKeywords[3] ?? secondary)}</a>.</p>
      <h2>${escapeHtml(copy.nextHeading)}: ${escapeHtml(seed.title)}</h2>
      <p>${escapeHtml(copy.nextText)} ${escapeHtml(copy.note)} ${escapeHtml(seed.summary)}</p>
      <p>${escapeHtml(copy.note)} ${escapeHtml(seed.takeaways.join(" "))}</p>
    `;
}

export function getBlogUiCopy(locale: SupportedLocale): BlogUiCopy {
  return (
    uiCopy[locale] ??
    (locale === "es-419" ? uiCopy["es-ES"] : undefined) ??
    uiCopy.en!
  );
}

export function getGeneratedLocalizedPosts(
  locale: SupportedLocale,
  basePosts: readonly BlogPost[],
): BlogPost[] | undefined {
  const seedLocale = locale === "es-419" ? "es-ES" : locale;
  const seeds = localizedSeeds[seedLocale as GeneratedBlogLocale];
  if (!seeds) return undefined;

  const baseBySlug = new Map(basePosts.map((post) => [post.slug, post]));
  const copy = getBlogUiCopy(locale);

  return seeds.map((seed) => {
    const basePost = baseBySlug.get(seed.slug);
    if (!basePost) {
      throw new Error(
        `Missing base blog post for localized slug: ${seed.slug}`,
      );
    }

    return {
      ...basePost,
      title: seed.title,
      summary: seed.summary,
      takeaways: [...seed.takeaways],
      author: {
        name: copy.index.author,
        role: copy.article.reviewed,
      },
      category: seed.category,
      readTime: seed.readTime,
      coverAlt: seed.coverAlt,
      seoKeywords: [...seed.seoKeywords],
      sources: basePost.sources?.map((source) => ({
        ...source,
        note: copy.article.sourceItemNote,
      })),
      content: renderLocalizedContent(
        seed,
        copy.body,
        basePost.relatedSlugs ?? [],
      ),
    };
  });
}
