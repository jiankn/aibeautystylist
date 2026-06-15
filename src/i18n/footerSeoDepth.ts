import type {
  LocalizedSeoAsset,
  LocalizedSeoSection,
  SeoLanguageSlug,
} from "./localizedSeoPages";

type DepthSpec = {
  readonly languageSlug: SeoLanguageSlug;
  readonly englishPath: string;
  readonly keyword: string;
  readonly topic: string;
};

type Detail = readonly [
  goal: string,
  technique: string,
  avoid: string,
  proof: string,
];

type DepthCopy = {
  readonly visualHeading: string;
  readonly visualRoles: readonly [string, string, string];
  overviewTitle(spec: DepthSpec): string;
  overview(spec: DepthSpec, detail: Detail): readonly string[];
  stepsTitle(spec: DepthSpec): string;
  stepTitles: readonly [string, string, string, string];
  stepBodies(spec: DepthSpec, detail: Detail): readonly string[];
  signalsTitle(spec: DepthSpec): string;
  signalTitles: readonly [string, string, string];
  signalBodies(spec: DepthSpec, detail: Detail): readonly string[];
  matrixTitle(spec: DepthSpec): string;
  matrixLabels: readonly [string, string, string, string];
  highlight(spec: DepthSpec, detail: Detail): string;
  faq(spec: DepthSpec, detail: Detail): readonly { q: string; a: string }[];
};

const detailsByLanguage: Record<SeoLanguageSlug, Record<string, Detail>> = {
  "zh-cn": {
    "/ai-makeup-try-on": [
      "在自己的自拍上比较颜色、浓度和位置，而不是复制模特效果",
      "使用无滤镜正面照，每次只改变一个变量并保留对照",
      "把虚拟预览当成具体产品在真实皮肤上的完全复刻",
      "选中的方向在正面、近距离和日常光线下都协调",
    ],
    "/virtual-makeup-app": [
      "完成上传、选妆、比较和决定的完整流程",
      "先筛选两到三个相近方向，再逐项比较颜色与质地",
      "同时切换太多妆容元素，最后无法判断差异来源",
      "能够清楚说明为什么保留某个方向并放弃其他方向",
    ],
    "/looks/soft-glam": [
      "在精致感和日常可穿性之间保持平衡",
      "用柔和棕灰眼影、清晰睫毛和低饱和唇颊建立层次",
      "叠加过深轮廓、浓重亮片和边界生硬的唇线",
      "近看有细节，退远后仍先看到脸而不是妆",
    ],
    "/looks/natural-makeup": [
      "均匀肤色并提升精神感，同时保留真实皮肤纹理",
      "局部遮瑕、梳理眉毛，并让唇颊保持同一色温",
      "用厚底妆和全脸高光制造所谓自然感",
      "自然光下肤色连贯，表情变化时没有明显粉感",
    ],
    "/looks/no-makeup-makeup": [
      "让修饰难以被察觉，而不是让脸看起来没有生气",
      "只在需要处点状遮瑕，用透明眉胶和接近原生唇色的产品",
      "大面积遮盖、明显腮红边界或过度提亮眼下",
      "近距离看不到产品边界，但疲态和色差得到改善",
    ],
    "/looks/dewy-skin": [
      "获得有水分感的光泽，同时控制油光和毛孔放大",
      "把光泽集中在颧骨、眼下外侧和唇峰，T 区保持克制",
      "全脸使用同样强度的高光或厚重油润底妆",
      "转动脸部时光泽移动，静止正面不会泛油",
    ],
    "/looks/glass-skin": [
      "做出平整通透的反光层次，而不是单纯增加亮度",
      "薄层保湿底妆配合局部提亮，并保持眉眼和唇妆干净",
      "用粗颗粒闪粉覆盖毛孔或忽略肤色不均",
      "柔光和室内光下都能看到平滑光泽而非镜面油光",
    ],
    "/looks/clean-girl": [
      "用少量步骤形成整洁、利落且可重复的日常形象",
      "梳起眉毛、薄层底妆、柔和轮廓并保留一个血色重点",
      "把紧绷高光、过度提拉和单一脸型当成标准",
      "十分钟内能够复现，并与发型和服装保持一致",
    ],
    "/scenarios/interview": [
      "让表情清晰、可靠，并在面对面和视频面试中保持一致",
      "均匀肤色、整理眉形，并用低反光唇颊色提升气色",
      "使用强闪、过深轮廓或需要频繁整理的产品",
      "摄像头和室内灯下眼神清楚、肤色稳定且不过度抢眼",
    ],
    "/scenarios/office": [
      "在通勤、会议和长时间工作中保持整洁与舒适",
      "选择耐磨薄底妆、清晰眉毛和可快速补涂的唇色",
      "依赖难维护的高光、易晕染眼妆或过厚底妆",
      "午后只需少量吸油和补唇即可恢复状态",
    ],
    "/scenarios/first-date": [
      "在近距离交流中呈现柔和、真实且有记忆点的状态",
      "保留皮肤质感，以睫毛、柔和腮红和舒适唇色为重点",
      "尝试从未穿戴过的浓重妆容或容易沾杯的厚唇妆",
      "室内、街灯和近距离下都自然，吃喝后仍容易整理",
    ],
    "/scenarios/passport-photo": [
      "让正面证件照中的五官清楚、肤色均匀且符合真实本人",
      "使用哑光薄底妆、明确眉形和略高于日常的唇颊对比",
      "反光高光、改变脸型的重修容或遮挡眼睛的妆法",
      "闪光灯下不过曝，黑白或缩略尺寸中五官仍可辨认",
    ],
    "/scenarios/wedding-guest": [
      "在长时间活动和拍照中保持精致，同时不抢过新人",
      "根据服装颜色统一唇颊，使用耐久底妆并准备小型补妆包",
      "复制新娘妆、使用过强亮片或忽略白天到晚宴的光线变化",
      "仪式、合照和晚宴灯光下都协调，数小时后仍容易修复",
    ],
    "/scenarios/prom": [
      "在正式服装、舞池灯光和大量拍照中保留个性与清晰度",
      "先确定礼服色彩，再选择一个眼妆或唇妆重点并做好定妆",
      "同时堆叠强眼妆、强唇色和强高光导致画面失焦",
      "正面照、侧面照和低光环境中都能看清五官层次",
    ],
  },
  "zh-tw": {
    "/ai-makeup-try-on": [
      "在自己的自拍比較顏色、濃度與位置",
      "使用無濾鏡正面照，每次只改一個變數",
      "把虛擬預覽當成實體產品的完全複製",
      "正面、近距離與日常光線都協調",
    ],
    "/virtual-makeup-app": [
      "完成上傳、選妝、比較與決定的完整流程",
      "先篩選兩到三個相近方向再逐項比較",
      "同時切換太多元素而無法判斷差異",
      "能清楚說明保留與放棄每個方向的原因",
    ],
    "/looks/soft-glam": [
      "兼顧精緻感與日常可穿性",
      "用柔和棕灰眼影、清楚睫毛與低飽和唇頰建立層次",
      "過深修容、濃重亮片與生硬唇線",
      "近看有細節，遠看仍先看到臉",
    ],
    "/looks/natural-makeup": [
      "均勻膚色並提升精神感，同時保留真實肌理",
      "局部遮瑕、整理眉毛並統一唇頰色溫",
      "用厚底妝和全臉高光製造自然感",
      "自然光下膚色連貫且表情沒有粉感",
    ],
    "/looks/no-makeup-makeup": [
      "讓修飾不易被察覺但不顯疲倦",
      "點狀遮瑕、透明眉膠與接近原生唇色的產品",
      "大面積遮蓋、明顯腮紅邊界與過亮眼下",
      "近距離看不到邊界但色差獲得改善",
    ],
    "/looks/dewy-skin": [
      "保留水分感光澤並控制油光",
      "把光澤集中在顴骨與唇峰，T 字部位保持克制",
      "全臉同強度高光或厚重油潤底妝",
      "轉動臉時光澤移動，正面不泛油",
    ],
    "/looks/glass-skin": [
      "做出平整通透的反光層次",
      "薄層保濕底妝配合局部提亮並保持眉眼乾淨",
      "粗顆粒亮粉覆蓋毛孔或忽略膚色不均",
      "柔光與室內光都呈現平滑而非油亮",
    ],
    "/looks/clean-girl": [
      "用少量步驟形成整潔利落的日常形象",
      "梳整眉毛、薄底妝、柔和輪廓並保留一個血色重點",
      "把緊繃高光與單一臉型當成標準",
      "十分鐘內能重現並與髮型服裝一致",
    ],
    "/scenarios/interview": [
      "讓表情清楚可靠並適用面對面與視訊面試",
      "均勻膚色、整理眉型並使用低反光唇頰色",
      "強亮片、過深修容與需頻繁整理的產品",
      "鏡頭與室內燈下眼神清楚且膚色穩定",
    ],
    "/scenarios/office": [
      "在通勤、會議與長時間工作中保持整潔舒適",
      "使用耐磨薄底妝、清楚眉毛與易補的唇色",
      "難維護高光、易暈眼妝與過厚底妝",
      "午後只需少量吸油與補唇即可恢復",
    ],
    "/scenarios/first-date": [
      "在近距離交流中呈現柔和真實的狀態",
      "保留肌理，以睫毛、柔和腮紅與舒適唇色為重點",
      "首次嘗試濃妝或容易沾杯的厚唇妝",
      "室內、街燈與近距離都自然且容易整理",
    ],
    "/scenarios/passport-photo": [
      "讓正面證件照五官清楚、膚色均勻且像本人",
      "啞光薄底妝、明確眉型與略高的唇頰對比",
      "反光高光、重修容或遮擋眼睛的妝法",
      "閃光燈下不過曝且縮圖中五官仍可辨認",
    ],
    "/scenarios/wedding-guest": [
      "長時間活動與拍照中保持精緻但不搶新人",
      "依服裝統一唇頰、使用耐久底妝並準備補妝包",
      "複製新娘妝、過強亮片或忽略光線變化",
      "儀式、合照與晚宴光線都協調且容易修復",
    ],
    "/scenarios/prom": [
      "在正式服裝、舞池燈光與拍照中保留個性",
      "先確定禮服色彩，再選一個眼妝或唇妝重點",
      "同時堆疊強眼妝、強唇色與強高光",
      "正面、側面與低光照片都看得清五官層次",
    ],
  },
  de: {
    "/ai-makeup-try-on": [
      "Farbe, Intensität und Platzierung auf dem eigenen Selfie vergleichen",
      "Ein ungefiltertes Frontfoto nutzen und jeweils nur eine Variable ändern",
      "Die Vorschau als exakte Wiedergabe eines realen Produkts behandeln",
      "Die gewählte Richtung wirkt frontal, aus der Nähe und im Alltag stimmig",
    ],
    "/virtual-makeup-app": [
      "Upload, Auswahl, Vergleich und Entscheidung als klaren Ablauf nutzen",
      "Zwei bis drei ähnliche Richtungen auswählen und gezielt vergleichen",
      "Zu viele Elemente gleichzeitig wechseln",
      "Die Entscheidung lässt sich mit konkreten Unterschieden begründen",
    ],
    "/looks/soft-glam": [
      "Eleganz und Alltagstauglichkeit ausbalancieren",
      "Weiche Taupe-Töne, definierte Wimpern und gedeckte Lippen-Wangen-Farben verbinden",
      "Zu harte Kontur, groben Glitzer und scharfe Lippenlinien",
      "Aus der Nähe sind Details sichtbar, aus Distanz bleibt das Gesicht im Fokus",
    ],
    "/looks/natural-makeup": [
      "Den Teint ausgleichen und echte Hautstruktur erhalten",
      "Punktuell abdecken, Brauen ordnen und Lippen sowie Wangen farblich verbinden",
      "Schwere Foundation und flächigen Highlighter als natürlich verkaufen",
      "Bei Tageslicht bleibt der Teint zusammenhängend und beweglich",
    ],
    "/looks/no-makeup-makeup": [
      "Korrektur unsichtbar machen, ohne müde zu wirken",
      "Concealer punktuell, transparentes Brauengel und lippennahe Farben einsetzen",
      "Großflächige Deckkraft, harte Rougeränder und stark aufgehellte Augenpartien",
      "Aus der Nähe sind keine Produktränder sichtbar",
    ],
    "/looks/dewy-skin": [
      "Feuchtigkeitsglanz erzeugen und Fettglanz kontrollieren",
      "Glanz auf Wangenknochen und Lippenbogen konzentrieren, T-Zone ruhig halten",
      "Überall gleich starken Highlighter oder eine schwere ölige Basis",
      "Der Glanz bewegt sich mit dem Gesicht und wirkt frontal nicht fettig",
    ],
    "/looks/glass-skin": [
      "Eine glatte, transparente Lichtreflexion statt bloßer Helligkeit schaffen",
      "Dünne hydratisierende Schichten mit gezielter Aufhellung kombinieren",
      "Groben Glitzer über Poren legen oder ungleichmäßigen Teint ignorieren",
      "Weiches und künstliches Licht zeigen eine glatte statt ölige Oberfläche",
    ],
    "/looks/clean-girl": [
      "Mit wenigen Schritten einen klaren wiederholbaren Alltagslook schaffen",
      "Brauen anheben, Basis dünn halten und nur einen Frischepunkt setzen",
      "Straffen Glanz und eine einzige Gesichtsform zum Standard machen",
      "Der Look lässt sich in zehn Minuten mit Kleidung und Haaren verbinden",
    ],
    "/scenarios/interview": [
      "Mimik klar und vertrauenswürdig in Präsenz und Video zeigen",
      "Teint ausgleichen, Brauen ordnen und reflexarme Lippen-Wangen-Farben wählen",
      "Starken Glitzer, harte Kontur und pflegeintensive Produkte",
      "Kamera und Raumlicht zeigen klare Augen und stabilen Teint",
    ],
    "/scenarios/office": [
      "Pendeln, Meetings und lange Arbeitstage gepflegt und bequem überstehen",
      "Dünne haltbare Basis, klare Brauen und leicht auffrischbare Lippenfarbe wählen",
      "Empfindlichen Highlighter, verschmierende Augenprodukte und dicke Basis",
      "Am Nachmittag reichen Abpudern und Lippenkorrektur",
    ],
    "/scenarios/first-date": [
      "Aus Gesprächsnähe weich, echt und einprägsam wirken",
      "Hautstruktur erhalten und Wimpern, sanftes Rouge sowie bequeme Lippen betonen",
      "Ungewohnte starke Looks oder stark abfärbende Lippenprodukte",
      "Innenraum, Straßenlicht und Nähe wirken natürlich und leicht korrigierbar",
    ],
    "/scenarios/passport-photo": [
      "Im frontalen Dokumentfoto klar, gleichmäßig und erkennbar bleiben",
      "Matte dünne Basis, definierte Brauen und etwas mehr Lippen-Wangen-Kontrast nutzen",
      "Reflektierenden Highlighter, starke Gesichtsveränderung und verdeckte Augen",
      "Blitz überbelichtet nicht und Merkmale bleiben klein dargestellt lesbar",
    ],
    "/scenarios/wedding-guest": [
      "Über Stunden und auf Fotos elegant wirken, ohne das Brautpaar zu überstrahlen",
      "Lippen und Wangen zur Kleidung abstimmen und ein kleines Auffrischset planen",
      "Braut-Make-up kopieren, starken Glitzer oder Lichtwechsel ignorieren",
      "Zeremonie, Gruppenfoto und Abendlicht bleiben stimmig",
    ],
    "/scenarios/prom": [
      "Mit Abendkleidung, Tanzlicht und vielen Fotos klar und persönlich wirken",
      "Kleidfarbe zuerst festlegen und nur Augen oder Lippen zum Fokus machen",
      "Starke Augen, Lippen und Highlighter gleichzeitig stapeln",
      "Front-, Profil- und Low-Light-Fotos zeigen erkennbare Gesichtszüge",
    ],
  },
  fr: {
    "/ai-makeup-try-on": [
      "Comparer couleur, intensité et placement sur son propre selfie",
      "Utiliser une photo de face sans filtre et modifier une variable à la fois",
      "Prendre l'aperçu pour une reproduction exacte d'un produit réel",
      "La direction reste cohérente de face, de près et en lumière quotidienne",
    ],
    "/virtual-makeup-app": [
      "Suivre un parcours clair de l'import au choix final",
      "Présélectionner deux ou trois directions proches puis les comparer",
      "Changer trop d'éléments en même temps",
      "Le choix final peut être expliqué par des différences précises",
    ],
    "/looks/soft-glam": [
      "Équilibrer sophistication et facilité à porter",
      "Relier taupes doux, cils définis et couleurs lèvres-joues peu saturées",
      "Contour dur, grosses paillettes et ligne de lèvres rigide",
      "Les détails existent de près mais le visage reste prioritaire de loin",
    ],
    "/looks/natural-makeup": [
      "Uniformiser le teint tout en gardant la texture réelle",
      "Corriger localement, structurer les sourcils et relier lèvres et joues",
      "Utiliser fond de teint épais et highlighter partout",
      "À la lumière du jour le teint reste continu et vivant",
    ],
    "/looks/no-makeup-makeup": [
      "Rendre la correction difficile à détecter sans paraître fatiguée",
      "Cacher par points, fixer les sourcils et rester proche de la couleur naturelle des lèvres",
      "Couverture globale, bord de blush visible et dessous des yeux trop clair",
      "De près les limites de produit ne se voient pas",
    ],
    "/looks/dewy-skin": [
      "Créer un éclat hydraté tout en contrôlant la brillance",
      "Concentrer la lumière sur pommettes et arc de Cupidon, calmer la zone T",
      "Mettre le même niveau de lumière sur tout le visage",
      "La lumière bouge avec le visage sans effet gras de face",
    ],
    "/looks/glass-skin": [
      "Créer une réflexion lisse et translucide plutôt qu'ajouter seulement de la lumière",
      "Superposer des couches hydratantes fines et éclaircir localement",
      "Couvrir les pores de grosses paillettes ou ignorer les irrégularités",
      "Lumière douce et intérieure montrent une surface lisse non huileuse",
    ],
    "/looks/clean-girl": [
      "Créer avec peu d'étapes une image nette et répétable",
      "Brosser les sourcils, garder une base fine et choisir un seul point de fraîcheur",
      "Imposer un éclat tendu ou une seule forme de visage",
      "Le look se refait en dix minutes et s'accorde aux cheveux et vêtements",
    ],
    "/scenarios/interview": [
      "Rendre l'expression claire et fiable en présentiel comme en vidéo",
      "Uniformiser le teint, structurer les sourcils et choisir des couleurs peu réfléchissantes",
      "Paillettes fortes, contour dur et produits à surveiller souvent",
      "Caméra et lumière intérieure gardent les yeux lisibles et le teint stable",
    ],
    "/scenarios/office": [
      "Rester soignée et confortable pendant transport, réunions et longue journée",
      "Choisir base fine durable, sourcils clairs et rouge à lèvres facile à retoucher",
      "Highlighter fragile, yeux qui coulent et base trop épaisse",
      "Une légère retouche de poudre et de lèvres suffit l'après-midi",
    ],
    "/scenarios/first-date": [
      "Paraître douce, réelle et mémorable à distance de conversation",
      "Garder la texture et privilégier cils, blush doux et lèvres confortables",
      "Tester un maquillage intense inédit ou une bouche épaisse qui transfère",
      "Intérieur, rue et proximité restent naturels et faciles à retoucher",
    ],
    "/scenarios/passport-photo": [
      "Rester identifiable avec traits lisibles et teint uniforme sur photo frontale",
      "Utiliser base mate fine, sourcils nets et contraste lèvres-joues légèrement renforcé",
      "Highlighter réfléchissant, contour transformant ou yeux masqués",
      "Le flash ne surexpose pas et les traits restent lisibles en petit format",
    ],
    "/scenarios/wedding-guest": [
      "Rester élégante pendant des heures et en photo sans rivaliser avec les mariés",
      "Accorder lèvres et joues à la tenue, choisir une base durable et prévoir une retouche",
      "Copier le maquillage de mariée, trop scintiller ou oublier les changements de lumière",
      "Cérémonie, photos de groupe et dîner restent harmonieux",
    ],
    "/scenarios/prom": [
      "Garder personnalité et lisibilité avec tenue formelle, piste et photos",
      "Choisir d'abord la couleur de la tenue puis un seul focus yeux ou lèvres",
      "Cumuler yeux forts, bouche forte et highlighter fort",
      "Face, profil et faible lumière montrent des traits clairs",
    ],
  },
  ja: {
    "/ai-makeup-try-on": [
      "自分のセルフィーで色、強さ、位置を比較する",
      "フィルターなしの正面写真で一度に一要素だけ変える",
      "プレビューを実物コスメの完全な再現と考える",
      "正面、近距離、日常光で同じ方向が自然に見える",
    ],
    "/virtual-makeup-app": [
      "アップロードから比較、決定まで迷わず進める",
      "近い2〜3方向に絞って色と質感を比較する",
      "多くの要素を同時に変えて違いが分からなくなる",
      "残す方向と外す方向の理由を説明できる",
    ],
    "/looks/soft-glam": [
      "上品さと日常の使いやすさを両立する",
      "柔らかいトープ、整えたまつ毛、低彩度のリップとチークをつなぐ",
      "濃すぎる輪郭、大粒ラメ、硬いリップライン",
      "近くでは丁寧、離れると顔が先に見える",
    ],
    "/looks/natural-makeup": [
      "肌色を整えながら本来の肌質を残す",
      "部分補正、眉の毛流れ、同じ温度のリップとチークを使う",
      "厚いベースと全顔ハイライトで自然に見せる",
      "自然光で肌色がつながり表情に粉感がない",
    ],
    "/looks/no-makeup-makeup": [
      "疲れて見せず補正だけを目立たなくする",
      "点で隠し透明眉ジェルと元の唇に近い色を使う",
      "広い範囲のカバー、はっきりしたチーク境界、明るすぎる目の下",
      "近距離でも製品の境界が見えない",
    ],
    "/looks/dewy-skin": [
      "うるおいのツヤを出しながら皮脂感を抑える",
      "頬骨と唇の山に光を集めTゾーンは控える",
      "全顔に同じ強さのハイライトを置く",
      "顔を動かすと光が動き正面では脂っぽくない",
    ],
    "/looks/glass-skin": [
      "明るさだけでなく平らで透明な反射を作る",
      "薄い保湿ベースと部分的な明るさを重ねる",
      "粗いラメで毛穴を覆い色むらを無視する",
      "柔らかい光と室内光でなめらかに見える",
    ],
    "/looks/clean-girl": [
      "少ない工程で清潔感のある日常像を再現する",
      "眉を整え薄いベースと一つの血色ポイントに絞る",
      "強い引き上げ感や一つの顔型を基準にする",
      "10分以内で髪型や服とも自然につながる",
    ],
    "/scenarios/interview": [
      "対面とオンラインで表情を明確かつ信頼できる印象にする",
      "肌を均一にし眉を整え反射の少ないリップとチークを使う",
      "強いラメ、濃い輪郭、頻繁な直しが必要な製品",
      "カメラと室内灯で目元が明確で肌色が安定する",
    ],
    "/scenarios/office": [
      "通勤、会議、長時間勤務で清潔感と快適さを保つ",
      "薄く持続するベース、整った眉、直しやすいリップを選ぶ",
      "維持しにくいツヤ、にじむ目元、厚いベース",
      "午後は軽い皮脂調整とリップだけで戻せる",
    ],
    "/scenarios/first-date": [
      "会話の距離で柔らかく自然で印象に残る",
      "肌質を残し、まつ毛、柔らかいチーク、快適なリップを中心にする",
      "初めての濃いメイクや移りやすい厚いリップ",
      "室内、街灯、近距離で自然で直しやすい",
    ],
    "/scenarios/passport-photo": [
      "正面の証明写真で本人らしく五官と肌色を明確にする",
      "薄いマットベース、明確な眉、少し強めの唇と頬の対比を使う",
      "反射するハイライト、顔型を変える濃い陰影、目を隠すメイク",
      "フラッシュで白飛びせず小さい画像でも五官が分かる",
    ],
    "/scenarios/wedding-guest": [
      "長時間と写真で上品さを保ち新郎新婦より目立たない",
      "服の色に唇と頬を合わせ持続するベースと小さな直しセットを用意する",
      "花嫁メイクのコピー、強いラメ、昼夜の光変化の無視",
      "式、集合写真、夜の照明で調和し直しやすい",
    ],
    "/scenarios/prom": [
      "正装、ダンス照明、多くの写真で個性と明確さを保つ",
      "ドレス色を先に決め目元か唇の一方だけを主役にする",
      "強い目元、唇、ハイライトを同時に重ねる",
      "正面、横顔、暗い写真で五官の層が見える",
    ],
  },
  ko: {
    "/ai-makeup-try-on": [
      "내 셀피에서 색, 강도, 위치를 비교하기",
      "필터 없는 정면 사진에서 한 번에 한 요소만 바꾸기",
      "가상 미리보기를 실제 제품의 완전한 재현으로 보기",
      "정면, 가까운 거리, 일상 조명에서 같은 방향이 자연스러움",
    ],
    "/virtual-makeup-app": [
      "업로드, 선택, 비교, 결정까지 흐름을 완성하기",
      "가까운 두세 방향으로 좁힌 뒤 색과 질감을 비교하기",
      "많은 요소를 동시에 바꿔 차이 원인을 잃는 것",
      "남긴 방향과 제외한 방향의 이유를 설명할 수 있음",
    ],
    "/looks/soft-glam": [
      "세련됨과 일상 활용도를 균형 있게 맞추기",
      "부드러운 토프, 또렷한 속눈썹, 저채도 립과 치크를 연결하기",
      "너무 짙은 윤곽, 큰 글리터, 딱딱한 립 라인",
      "가까이서는 디테일이 보이고 멀리서는 얼굴이 먼저 보임",
    ],
    "/looks/natural-makeup": [
      "피부 톤을 정돈하면서 실제 피부결을 남기기",
      "부분 커버, 눈썹 결, 같은 온도의 립과 치크를 사용하기",
      "두꺼운 베이스와 얼굴 전체 하이라이트",
      "자연광에서 피부 톤이 이어지고 표정에 가루 느낌이 없음",
    ],
    "/looks/no-makeup-makeup": [
      "피곤해 보이지 않으면서 보정은 들키지 않게 하기",
      "점으로 가리고 투명 브로 젤과 원래 입술색에 가까운 색을 쓰기",
      "넓은 커버, 선명한 블러시 경계, 지나치게 밝은 눈 밑",
      "가까운 거리에서도 제품 경계가 보이지 않음",
    ],
    "/looks/dewy-skin": [
      "수분 광은 살리고 유분 광은 조절하기",
      "광을 광대와 입술 산에 집중하고 T존은 차분하게 두기",
      "얼굴 전체에 같은 강도의 하이라이트를 쓰기",
      "얼굴을 움직일 때 광이 이동하고 정면은 번들거리지 않음",
    ],
    "/looks/glass-skin": [
      "단순 밝기보다 매끈하고 투명한 반사를 만들기",
      "얇은 보습 베이스와 부분 밝힘을 겹치기",
      "굵은 펄로 모공을 덮거나 피부 톤 얼룩을 무시하기",
      "부드러운 빛과 실내 조명에서 기름지지 않고 매끈함",
    ],
    "/looks/clean-girl": [
      "적은 단계로 깔끔하고 반복 가능한 일상 이미지를 만들기",
      "눈썹을 정리하고 얇은 베이스와 한 가지 혈색 포인트만 쓰기",
      "강한 리프팅 광과 하나의 얼굴형을 기준으로 삼기",
      "10분 안에 재현되고 헤어와 옷에도 연결됨",
    ],
    "/scenarios/interview": [
      "대면과 화상 면접에서 표정을 또렷하고 신뢰감 있게 보이기",
      "피부를 균일하게 하고 눈썹과 반사 적은 립 치크를 정리하기",
      "강한 글리터, 짙은 윤곽, 자주 손봐야 하는 제품",
      "카메라와 실내등에서 눈빛과 피부 톤이 안정적임",
    ],
    "/scenarios/office": [
      "출근, 회의, 긴 근무 시간 동안 깔끔하고 편안하게 유지하기",
      "얇고 지속력 있는 베이스, 정돈된 눈썹, 수정 쉬운 립을 고르기",
      "유지 어려운 광, 번지는 눈 화장, 두꺼운 베이스",
      "오후에 유분과 립만 가볍게 수정하면 회복됨",
    ],
    "/scenarios/first-date": [
      "대화 거리에서 부드럽고 진짜 같으며 기억에 남기",
      "피부결을 남기고 속눈썹, 부드러운 블러시, 편한 립에 집중하기",
      "처음 시도하는 진한 룩이나 쉽게 묻는 두꺼운 립",
      "실내, 거리 조명, 가까운 거리에서 자연스럽고 수정 쉬움",
    ],
    "/scenarios/passport-photo": [
      "정면 증명사진에서 본인답게 이목구비와 피부 톤을 분명히 하기",
      "얇은 매트 베이스, 선명한 눈썹, 조금 강한 립 치크 대비를 쓰기",
      "반사 하이라이트, 얼굴형을 바꾸는 진한 윤곽, 눈을 가리는 화장",
      "플래시에서 하얗게 뜨지 않고 작은 사진에서도 이목구비가 보임",
    ],
    "/scenarios/wedding-guest": [
      "긴 일정과 사진에서 우아함을 유지하되 신랑 신부보다 튀지 않기",
      "옷 색에 립과 치크를 맞추고 지속 베이스와 작은 수정 파우치를 준비하기",
      "신부 메이크업 복사, 강한 글리터, 낮과 밤 조명 변화 무시",
      "예식, 단체 사진, 저녁 조명에서 조화롭고 수정하기 쉬움",
    ],
    "/scenarios/prom": [
      "정장, 댄스 조명, 많은 사진에서 개성과 선명함을 유지하기",
      "드레스 색을 먼저 정하고 눈이나 입술 한 곳만 포인트로 쓰기",
      "강한 눈, 입술, 하이라이트를 동시에 쌓기",
      "정면, 옆모습, 저조도 사진에서 이목구비 층이 보임",
    ],
  },
  es: {
    "/ai-makeup-try-on": [
      "Comparar color, intensidad y ubicación sobre tu propia selfie",
      "Usar una foto frontal sin filtro y cambiar una variable cada vez",
      "Tomar la vista previa como reproducción exacta de un producto físico",
      "La dirección elegida funciona de frente, de cerca y con luz diaria",
    ],
    "/virtual-makeup-app": [
      "Completar un flujo claro de subida, selección, comparación y decisión",
      "Reducir a dos o tres direcciones cercanas antes de comparar",
      "Cambiar demasiados elementos al mismo tiempo",
      "Puedes explicar por qué conservas una dirección y descartas otra",
    ],
    "/looks/soft-glam": [
      "Equilibrar sofisticación y facilidad de uso diario",
      "Unir tonos topo suaves, pestañas definidas y labios-mejillas de baja saturación",
      "Contorno duro, brillo grueso y línea de labios rígida",
      "De cerca hay detalle y a distancia el rostro sigue siendo protagonista",
    ],
    "/looks/natural-makeup": [
      "Unificar el tono y conservar textura real de piel",
      "Corregir por zonas, ordenar cejas y conectar labios y mejillas",
      "Usar base gruesa e iluminador en todo el rostro",
      "Con luz natural el tono se ve continuo y la expresión no se empolva",
    ],
    "/looks/no-makeup-makeup": [
      "Hacer invisible la corrección sin parecer cansada",
      "Cubrir por puntos, usar gel transparente y tonos cercanos al labio natural",
      "Cobertura global, borde visible de rubor y ojera demasiado clara",
      "De cerca no se ven límites de producto",
    ],
    "/looks/dewy-skin": [
      "Crear brillo hidratado y controlar la apariencia grasa",
      "Concentrar luz en pómulos y arco de Cupido, calmar la zona T",
      "Aplicar el mismo nivel de iluminador en toda la cara",
      "La luz se mueve con el rostro sin verse grasa de frente",
    ],
    "/looks/glass-skin": [
      "Crear una reflexión lisa y translúcida, no solo más brillo",
      "Superponer hidratación fina e iluminar zonas concretas",
      "Cubrir poros con brillo grueso o ignorar tono desigual",
      "Luz suave e interior muestran una superficie lisa no aceitosa",
    ],
    "/looks/clean-girl": [
      "Crear con pocos pasos una imagen limpia y repetible",
      "Peinar cejas, mantener base fina y elegir un solo punto de frescura",
      "Imponer brillo tenso o una sola forma de rostro",
      "Se reproduce en diez minutos y encaja con pelo y ropa",
    ],
    "/scenarios/interview": [
      "Mostrar expresión clara y fiable en persona y por vídeo",
      "Uniformar piel, ordenar cejas y usar labios-mejillas de baja reflexión",
      "Brillo fuerte, contorno duro y productos que exigen retoques frecuentes",
      "Cámara y luz interior mantienen ojos claros y tono estable",
    ],
    "/scenarios/office": [
      "Mantener comodidad y aspecto cuidado durante transporte, reuniones y jornada larga",
      "Elegir base fina duradera, cejas claras y labial fácil de retocar",
      "Iluminador delicado, ojos que se corren y base gruesa",
      "Por la tarde basta retirar brillo y retocar labios",
    ],
    "/scenarios/first-date": [
      "Verse suave, real y memorable a distancia de conversación",
      "Conservar textura y priorizar pestañas, rubor suave y labios cómodos",
      "Estrenar un look intenso o labios gruesos que transfieren",
      "Interior, calle y cercanía se ven naturales y fáciles de retocar",
    ],
    "/scenarios/passport-photo": [
      "Seguir reconocible con rasgos claros y tono uniforme en foto frontal",
      "Usar base mate fina, cejas definidas y algo más de contraste en labios y mejillas",
      "Iluminador reflectante, contorno transformador o maquillaje que tapa los ojos",
      "El flash no sobreexpone y los rasgos se leen en tamaño pequeño",
    ],
    "/scenarios/wedding-guest": [
      "Mantener elegancia durante horas y fotos sin competir con la pareja",
      "Coordinar labios y mejillas con la ropa, usar base duradera y llevar retoque",
      "Copiar maquillaje de novia, usar brillo fuerte u olvidar cambios de luz",
      "Ceremonia, foto de grupo y cena siguen armoniosas",
    ],
    "/scenarios/prom": [
      "Conservar personalidad y definición con vestido formal, pista y muchas fotos",
      "Elegir primero el color del vestido y un solo foco en ojos o labios",
      "Acumular ojos, labios e iluminador intensos",
      "Frente, perfil y poca luz muestran rasgos claros",
    ],
  },
  "pt-br": {
    "/ai-makeup-try-on": [
      "Comparar cor, intensidade e posição na própria selfie",
      "Usar foto frontal sem filtro e mudar uma variável por vez",
      "Tratar a prévia como cópia exata de um produto físico",
      "A direção funciona de frente, de perto e na luz do dia",
    ],
    "/virtual-makeup-app": [
      "Completar um fluxo claro de envio, escolha, comparação e decisão",
      "Reduzir para duas ou três direções próximas antes de comparar",
      "Mudar elementos demais ao mesmo tempo",
      "Você consegue explicar por que manteve uma direção e descartou outra",
    ],
    "/looks/soft-glam": [
      "Equilibrar sofisticação e facilidade para usar no dia a dia",
      "Unir tons taupe suaves, cílios definidos e lábios-bochechas de baixa saturação",
      "Contorno duro, brilho grosso e linha labial rígida",
      "De perto há detalhe e de longe o rosto continua protagonista",
    ],
    "/looks/natural-makeup": [
      "Uniformizar o tom e manter textura real da pele",
      "Corrigir por áreas, organizar sobrancelhas e conectar boca e blush",
      "Usar base grossa e iluminador no rosto todo",
      "Na luz natural o tom fica contínuo e a expressão sem pó aparente",
    ],
    "/looks/no-makeup-makeup": [
      "Deixar a correção invisível sem parecer cansada",
      "Cobrir por pontos, usar gel transparente e tons próximos da boca natural",
      "Cobertura total, borda visível de blush e área dos olhos clara demais",
      "De perto não aparecem limites de produto",
    ],
    "/looks/dewy-skin": [
      "Criar viço hidratado e controlar aparência oleosa",
      "Concentrar luz nas maçãs e arco do cupido, mantendo a zona T calma",
      "Aplicar o mesmo nível de iluminador no rosto inteiro",
      "A luz se move com o rosto sem ficar oleosa de frente",
    ],
    "/looks/glass-skin": [
      "Criar reflexão lisa e translúcida, não apenas brilho",
      "Sobrepor hidratação fina e iluminar pontos específicos",
      "Cobrir poros com brilho grosso ou ignorar tom desigual",
      "Luz suave e interna mostram superfície lisa sem oleosidade",
    ],
    "/looks/clean-girl": [
      "Criar com poucos passos uma imagem limpa e repetível",
      "Pentear sobrancelhas, manter base fina e escolher um único ponto de frescor",
      "Impor brilho esticado ou um único formato de rosto",
      "É possível repetir em dez minutos e combinar com cabelo e roupa",
    ],
    "/scenarios/interview": [
      "Mostrar expressão clara e confiável presencialmente e por vídeo",
      "Uniformizar pele, organizar sobrancelhas e usar boca-blush de baixo reflexo",
      "Brilho forte, contorno duro e produtos que exigem retoques frequentes",
      "Câmera e luz interna mantêm olhos claros e tom estável",
    ],
    "/scenarios/office": [
      "Manter conforto e aparência cuidada em transporte, reuniões e jornada longa",
      "Escolher base fina durável, sobrancelhas claras e batom fácil de retocar",
      "Iluminador delicado, olhos que borram e base grossa",
      "À tarde basta controlar óleo e retocar a boca",
    ],
    "/scenarios/first-date": [
      "Parecer suave, real e memorável à distância de conversa",
      "Manter textura e priorizar cílios, blush suave e boca confortável",
      "Estrear visual intenso ou lábios grossos que transferem",
      "Interior, rua e proximidade ficam naturais e fáceis de ajustar",
    ],
    "/scenarios/passport-photo": [
      "Continuar reconhecível com traços claros e tom uniforme na foto frontal",
      "Usar base matte fina, sobrancelhas definidas e mais contraste em boca e blush",
      "Iluminador refletivo, contorno transformador ou maquiagem cobrindo olhos",
      "O flash não estoura e os traços continuam legíveis em tamanho pequeno",
    ],
    "/scenarios/wedding-guest": [
      "Manter elegância por horas e fotos sem competir com o casal",
      "Coordenar boca e blush com roupa, usar base durável e levar retoque",
      "Copiar maquiagem de noiva, usar brilho forte ou ignorar mudanças de luz",
      "Cerimônia, foto em grupo e jantar continuam harmoniosos",
    ],
    "/scenarios/prom": [
      "Manter personalidade e definição com roupa formal, pista e muitas fotos",
      "Escolher primeiro a cor do vestido e um único foco em olhos ou boca",
      "Acumular olhos, boca e iluminador intensos",
      "Frente, perfil e pouca luz mostram traços claros",
    ],
  },
};

const copyByLanguage: Record<SeoLanguageSlug, DepthCopy> = {
  "zh-cn": {
    visualHeading: "用三种画面检查真实效果",
    visualRoles: ["方向参考", "妆效细节", "真实场景复核"],
    overviewTitle: (s) => `${s.keyword}的直接答案`,
    overview: (s, d) => [
      `${s.keyword}真正要解决的是：${d[0]}。这决定了页面不能只展示一张完成图，还需要说明颜色、位置、质地和使用场景之间的取舍。`,
      `最关键的执行方法是${d[1]}。先把这一项做对，再增加其他细节，能够更快判断${s.topic}是否适合自己的肤色、五官比例和日常习惯。`,
      `需要主动避开的信号是${d[2]}。如果出现这一情况，先降低浓度、缩小范围或更换质地，而不是继续增加产品。`,
    ],
    stepsTitle: (s) => `${s.keyword}的实操顺序`,
    stepTitles: ["先定义目标", "执行关键技巧", "排查失败信号", "完成真实验收"],
    stepBodies: (_s, d) => [
      `把目标写清楚：${d[0]}。先确定使用场景、准备时间和希望保留的个人特征。`,
      `围绕“${d[1]}”完成第一版，只改变必要的颜色、位置和强度。`,
      `重点寻找“${d[2]}”。一旦出现，就回退一个变量并重新比较。`,
      `最终标准是${d[3]}。满足后再决定产品、教程或需要保存的试妆方向。`,
    ],
    signalsTitle: () => "三个值得保留的判断信号",
    signalTitles: ["目标一致", "方法可复现", "真实环境成立"],
    signalBodies: (_s, d) => [d[0], d[1], d[3]],
    matrixTitle: (s) => `${s.keyword}决策矩阵`,
    matrixLabels: ["目标", "关键方法", "需要避免", "验收标准"],
    highlight: (s, d) =>
      `${s.keyword}不是复制一张参考图。只有当${d[3]}，这个方向才值得继续练习或购买对应产品。`,
    faq: (s, d) => [
      {
        q: `${s.keyword}最先应该调整什么？`,
        a: `先调整最影响整体判断的一项：${d[1]}。不要同时改变底妆、眼妆和唇色。`,
      },
      {
        q: `如何判断${s.keyword}已经过头？`,
        a: `当出现${d[2]}时，说明需要降低浓度、范围或反光强度。`,
      },
      {
        q: `${s.keyword}怎样才算通过真实验收？`,
        a: `标准是${d[3]}，而不只是完成图在单一滤镜中好看。`,
      },
      {
        q: `应该先买产品还是先试方向？`,
        a: `先用现有产品或虚拟预览确认颜色、位置和强度方向，再购买更具体的产品。`,
      },
    ],
  },
  "zh-tw": {
    visualHeading: "用三種畫面檢查真實效果",
    visualRoles: ["方向參考", "妝效細節", "真實情境複核"],
    overviewTitle: (s) => `${s.keyword}的直接答案`,
    overview: (s, d) => [
      `${s.keyword}真正要處理的是：${d[0]}。因此不能只看一張完成圖，還要判斷顏色、位置、質地和場合。`,
      `最重要的執行方法是${d[1]}。先完成這一項，再增加其他細節，較容易判斷${s.topic}是否適合自己。`,
      `需要避開的訊號是${d[2]}。出現時先降低濃度、縮小範圍或調整質地。`,
    ],
    stepsTitle: (s) => `${s.keyword}實作順序`,
    stepTitles: ["先定義目標", "執行關鍵技巧", "排查失敗訊號", "完成真實驗收"],
    stepBodies: (_s, d) => [
      `先寫清楚目標：${d[0]}。`,
      `圍繞「${d[1]}」完成第一版，只改必要變數。`,
      `尋找「${d[2]}」，出現時回退一個變數。`,
      `最後以${d[3]}作為是否保留的標準。`,
    ],
    signalsTitle: () => "三個值得保留的判斷訊號",
    signalTitles: ["目標一致", "方法可重現", "真實環境成立"],
    signalBodies: (_s, d) => [d[0], d[1], d[3]],
    matrixTitle: (s) => `${s.keyword}決策矩陣`,
    matrixLabels: ["目標", "關鍵方法", "需要避免", "驗收標準"],
    highlight: (s, d) =>
      `${s.keyword}不是複製參考圖；只有當${d[3]}，這個方向才值得繼續。`,
    faq: (s, d) => [
      {
        q: `${s.keyword}最先調整什麼？`,
        a: `先調整${d[1]}，不要同時改動所有區域。`,
      },
      {
        q: `怎麼判斷妝感過頭？`,
        a: `出現${d[2]}時，就要降低濃度、範圍或反光。`,
      },
      { q: `怎樣算通過真實驗收？`, a: `標準是${d[3]}。` },
      {
        q: "先買產品還是先試方向？",
        a: "先確認顏色、位置與強度方向，再購買產品。",
      },
    ],
  },
  de: {
    visualHeading: "Drei visuelle Prüfungen für die Praxis",
    visualRoles: ["Richtung", "Finish im Detail", "Prüfung im Alltag"],
    overviewTitle: (s) => `Die direkte Antwort zu ${s.keyword}`,
    overview: (s, d) => [
      `${s.keyword} soll vor allem ${d[0]}. Deshalb reicht ein fertiges Referenzbild nicht; Farbe, Platzierung, Textur und Nutzungssituation müssen zusammen bewertet werden.`,
      `Der wichtigste Hebel ist: ${d[1]}. Wenn dieser Schritt stimmt, lässt sich ${s.topic} gezielter an Gesicht, Hautton und Routine anpassen.`,
      `Ein klares Warnsignal ist ${d[2]}. Dann sollte zuerst Intensität, Fläche oder Textur reduziert werden, statt mehr Produkt aufzutragen.`,
    ],
    stepsTitle: (s) => `${s.keyword} praktisch prüfen`,
    stepTitles: [
      "Ziel festlegen",
      "Schlüsseltechnik anwenden",
      "Warnsignal prüfen",
      "Im Alltag abnehmen",
    ],
    stepBodies: (_s, d) => [
      `Ziel: ${d[0]}. Anlass, Zeit und natürliche Merkmale zuerst festlegen.`,
      `Eine erste Version nur mit dem Prinzip „${d[1]}“ erstellen.`,
      `Gezielt nach „${d[2]}“ suchen und bei Bedarf eine Variable zurücknehmen.`,
      `Bestanden ist der Look, wenn ${d[3]}.`,
    ],
    signalsTitle: () => "Drei Signale für eine gute Entscheidung",
    signalTitles: [
      "Ziel erfüllt",
      "Wiederholbare Methode",
      "Alltagstest bestanden",
    ],
    signalBodies: (_s, d) => [d[0], d[1], d[3]],
    matrixTitle: (s) => `Entscheidungsmatrix für ${s.keyword}`,
    matrixLabels: ["Ziel", "Schlüsseltechnik", "Vermeiden", "Abnahme"],
    highlight: (s, d) =>
      `${s.keyword} ist keine Kopie eines Referenzbilds. Erst wenn ${d[3]}, lohnt sich die weitere Übung oder der Produktkauf.`,
    faq: (s, d) => [
      {
        q: `Was sollte ich bei ${s.keyword} zuerst ändern?`,
        a: `Beginne mit ${d[1]} und ändere nicht mehrere Gesichtsbereiche gleichzeitig.`,
      },
      {
        q: `Woran erkenne ich zu viel ${s.keyword}?`,
        a: `Das Warnsignal ist ${d[2]}. Reduziere dann Intensität, Fläche oder Reflexion.`,
      },
      { q: `Wann ist ${s.keyword} alltagstauglich?`, a: `Wenn ${d[3]}.` },
      {
        q: "Erst Produkte kaufen oder Richtung testen?",
        a: "Zuerst Farbe, Platzierung und Intensität testen; danach gezielt kaufen.",
      },
    ],
  },
  fr: {
    visualHeading: "Trois contrôles visuels utiles",
    visualRoles: ["Direction", "Détail du fini", "Vérification réelle"],
    overviewTitle: (s) => `La réponse directe pour ${s.keyword}`,
    overview: (s, d) => [
      `${s.keyword} doit surtout permettre de ${d[0]}. Une seule photo finale ne suffit donc pas : couleur, placement, texture et contexte doivent être jugés ensemble.`,
      `Le levier principal est de ${d[1]}. Une fois ce point maîtrisé, ${s.topic} devient plus facile à adapter au visage et aux habitudes réelles.`,
      `Le signal à éviter est ${d[2]}. S'il apparaît, réduisez d'abord intensité, zone ou texture avant d'ajouter du produit.`,
    ],
    stepsTitle: (s) => `Ordre pratique pour ${s.keyword}`,
    stepTitles: [
      "Définir l'objectif",
      "Appliquer la technique clé",
      "Chercher le signal d'échec",
      "Valider en situation",
    ],
    stepBodies: (_s, d) => [
      `Objectif : ${d[0]}. Précisez occasion, temps et traits à conserver.`,
      `Créez une première version autour de « ${d[1]} » sans changer trop de variables.`,
      `Cherchez « ${d[2]} » et revenez en arrière si nécessaire.`,
      `Le résultat est validé lorsque ${d[3]}.`,
    ],
    signalsTitle: () => "Trois signaux à conserver",
    signalTitles: [
      "Objectif cohérent",
      "Méthode reproductible",
      "Test réel réussi",
    ],
    signalBodies: (_s, d) => [d[0], d[1], d[3]],
    matrixTitle: (s) => `Matrice de décision : ${s.keyword}`,
    matrixLabels: ["Objectif", "Méthode clé", "À éviter", "Validation"],
    highlight: (s, d) =>
      `${s.keyword} ne consiste pas à copier une référence. La direction mérite d'être gardée seulement lorsque ${d[3]}.`,
    faq: (s, d) => [
      {
        q: `Que faut-il ajuster en premier pour ${s.keyword} ?`,
        a: `Commencez par ${d[1]} sans changer toutes les zones à la fois.`,
      },
      {
        q: `Comment reconnaître un résultat trop chargé ?`,
        a: `Le signal principal est ${d[2]}. Réduisez intensité, zone ou reflet.`,
      },
      { q: `Quand le résultat est-il validé ?`, a: `Lorsque ${d[3]}.` },
      {
        q: "Faut-il acheter avant de tester ?",
        a: "Testez d'abord couleur, placement et intensité, puis achetez de façon ciblée.",
      },
    ],
  },
  ja: {
    visualHeading: "3つの画像で仕上がりを確認",
    visualRoles: ["方向の参考", "質感の詳細", "実際の場面で確認"],
    overviewTitle: (s) => `${s.keyword}の結論`,
    overview: (s, d) => [
      `${s.keyword}で最も大切なのは${d[0]}ことです。完成写真一枚だけではなく、色、位置、質感、使う場面を一緒に判断する必要があります。`,
      `重要な方法は${d[1]}ことです。ここを先に整えると、${s.topic}が自分の顔立ちや日常に合うか確認しやすくなります。`,
      `避けたいサインは${d[2]}ことです。見えた場合は製品を足す前に、濃さ、範囲、質感を一段下げます。`,
    ],
    stepsTitle: (s) => `${s.keyword}の実践順序`,
    stepTitles: [
      "目的を決める",
      "重要な方法を使う",
      "失敗サインを探す",
      "実際の環境で確認",
    ],
    stepBodies: (_s, d) => [
      `目的は${d[0]}こと。場面、時間、残したい特徴を先に決めます。`,
      `「${d[1]}」を中心に最初の形を作り、一度に多くを変えません。`,
      `「${d[2]}」が見えたら一つ前の状態に戻して比較します。`,
      `最終基準は${d[3]}ことです。`,
    ],
    signalsTitle: () => "残す価値がある3つのサイン",
    signalTitles: ["目的に合う", "再現できる", "実際の光で成立"],
    signalBodies: (_s, d) => [d[0], d[1], d[3]],
    matrixTitle: (s) => `${s.keyword}の判断表`,
    matrixLabels: ["目的", "重要な方法", "避けること", "確認基準"],
    highlight: (s, d) =>
      `${s.keyword}は参考画像のコピーではありません。${d[3]}ときに初めて残す価値があります。`,
    faq: (s, d) => [
      {
        q: `${s.keyword}で最初に変える場所は？`,
        a: `まず${d[1]}ことに集中し、複数の場所を同時に変えないでください。`,
      },
      {
        q: "濃すぎるサインは？",
        a: `${d[2]}場合は濃さ、範囲、反射を下げます。`,
      },
      { q: "実際に使える基準は？", a: `${d[3]}ことです。` },
      {
        q: "先に商品を買うべきですか？",
        a: "先に色、位置、強さの方向を確認してから選びます。",
      },
    ],
  },
  ko: {
    visualHeading: "세 가지 이미지로 실제 효과 확인",
    visualRoles: ["방향 참고", "질감 디테일", "실제 상황 점검"],
    overviewTitle: (s) => `${s.keyword}의 직접 답변`,
    overview: (s, d) => [
      `${s.keyword}의 핵심은 ${d[0]}입니다. 완성 사진 한 장만 보지 말고 색, 위치, 질감, 사용 상황을 함께 판단해야 합니다.`,
      `가장 중요한 방법은 ${d[1]}입니다. 이 단계를 먼저 맞추면 ${s.topic}이 내 얼굴과 일상에 맞는지 더 쉽게 볼 수 있습니다.`,
      `피해야 할 신호는 ${d[2]}입니다. 보이면 제품을 더하기 전에 강도, 범위, 질감을 한 단계 낮추세요.`,
    ],
    stepsTitle: (s) => `${s.keyword} 실전 순서`,
    stepTitles: [
      "목표 정하기",
      "핵심 방법 적용",
      "실패 신호 확인",
      "실제 환경 검수",
    ],
    stepBodies: (_s, d) => [
      `목표는 ${d[0]}입니다. 상황, 시간, 남길 특징을 먼저 정하세요.`,
      `“${d[1]}”를 중심으로 첫 버전을 만들고 한 번에 많이 바꾸지 않습니다.`,
      `“${d[2]}”가 보이면 한 변수를 이전 상태로 돌려 비교합니다.`,
      `최종 기준은 ${d[3]}입니다.`,
    ],
    signalsTitle: () => "남길 가치가 있는 세 가지 신호",
    signalTitles: ["목표 일치", "재현 가능한 방법", "실제 환경 통과"],
    signalBodies: (_s, d) => [d[0], d[1], d[3]],
    matrixTitle: (s) => `${s.keyword} 결정표`,
    matrixLabels: ["목표", "핵심 방법", "피할 점", "검수 기준"],
    highlight: (s, d) =>
      `${s.keyword}는 참고 사진 복사가 아닙니다. ${d[3]}일 때 계속 연습하거나 제품을 고를 가치가 있습니다.`,
    faq: (s, d) => [
      {
        q: `${s.keyword}에서 먼저 바꿀 것은?`,
        a: `${d[1]}에 먼저 집중하고 여러 부위를 동시에 바꾸지 마세요.`,
      },
      {
        q: "과한 결과를 어떻게 알 수 있나요?",
        a: `${d[2]}가 보이면 강도, 범위, 반사를 낮추세요.`,
      },
      { q: "실제 사용 가능한 기준은?", a: `${d[3]}입니다.` },
      {
        q: "제품부터 사야 하나요?",
        a: "색, 위치, 강도 방향을 먼저 확인한 뒤 제품을 고르세요.",
      },
    ],
  },
  es: {
    visualHeading: "Tres controles visuales para decidir",
    visualRoles: [
      "Dirección",
      "Detalle del acabado",
      "Prueba en contexto real",
    ],
    overviewTitle: (s) => `Respuesta directa sobre ${s.keyword}`,
    overview: (s, d) => [
      `${s.keyword} debe servir para ${d[0]}. Por eso una sola foto final no basta: color, ubicación, textura y contexto deben evaluarse juntos.`,
      `La técnica principal es ${d[1]}. Al resolverla primero, ${s.topic} se adapta mejor al rostro y a la rutina real.`,
      `La señal que debes evitar es ${d[2]}. Si aparece, reduce intensidad, área o textura antes de añadir producto.`,
    ],
    stepsTitle: (s) => `Orden práctico para ${s.keyword}`,
    stepTitles: [
      "Definir el objetivo",
      "Aplicar la técnica clave",
      "Buscar la señal de fallo",
      "Validar en situación real",
    ],
    stepBodies: (_s, d) => [
      `Objetivo: ${d[0]}. Define ocasión, tiempo y rasgos que quieres conservar.`,
      `Crea una primera versión alrededor de “${d[1]}” sin cambiar demasiadas variables.`,
      `Busca “${d[2]}” y retrocede una variable si aparece.`,
      `El resultado queda validado cuando ${d[3]}.`,
    ],
    signalsTitle: () => "Tres señales que merece la pena conservar",
    signalTitles: [
      "Objetivo coherente",
      "Método repetible",
      "Prueba real superada",
    ],
    signalBodies: (_s, d) => [d[0], d[1], d[3]],
    matrixTitle: (s) => `Matriz de decisión: ${s.keyword}`,
    matrixLabels: ["Objetivo", "Método clave", "Evitar", "Validación"],
    highlight: (s, d) =>
      `${s.keyword} no consiste en copiar una referencia. La dirección merece conservarse cuando ${d[3]}.`,
    faq: (s, d) => [
      {
        q: `¿Qué debo ajustar primero en ${s.keyword}?`,
        a: `Empieza por ${d[1]} sin cambiar todas las zonas a la vez.`,
      },
      {
        q: "¿Cómo sé si el resultado está recargado?",
        a: `La señal es ${d[2]}. Reduce intensidad, área o reflejo.`,
      },
      { q: "¿Cuándo está validado?", a: `Cuando ${d[3]}.` },
      {
        q: "¿Compro productos antes de probar?",
        a: "Prueba primero color, ubicación e intensidad y compra después con criterio.",
      },
    ],
  },
  "pt-br": {
    visualHeading: "Três controles visuais para decidir",
    visualRoles: ["Direção", "Detalhe do acabamento", "Teste em contexto real"],
    overviewTitle: (s) => `Resposta direta sobre ${s.keyword}`,
    overview: (s, d) => [
      `${s.keyword} precisa servir para ${d[0]}. Por isso uma única foto final não basta: cor, posição, textura e contexto devem ser avaliados juntos.`,
      `A técnica principal é ${d[1]}. Resolvendo isso primeiro, ${s.topic} se adapta melhor ao rosto e à rotina real.`,
      `O sinal a evitar é ${d[2]}. Se aparecer, reduza intensidade, área ou textura antes de acrescentar produto.`,
    ],
    stepsTitle: (s) => `Ordem prática para ${s.keyword}`,
    stepTitles: [
      "Definir o objetivo",
      "Aplicar a técnica principal",
      "Procurar o sinal de falha",
      "Validar em situação real",
    ],
    stepBodies: (_s, d) => [
      `Objetivo: ${d[0]}. Defina ocasião, tempo e traços que quer manter.`,
      `Crie uma primeira versão em torno de “${d[1]}” sem mudar variáveis demais.`,
      `Procure “${d[2]}” e volte uma variável se aparecer.`,
      `O resultado fica validado quando ${d[3]}.`,
    ],
    signalsTitle: () => "Três sinais que vale manter",
    signalTitles: [
      "Objetivo coerente",
      "Método repetível",
      "Teste real aprovado",
    ],
    signalBodies: (_s, d) => [d[0], d[1], d[3]],
    matrixTitle: (s) => `Matriz de decisão: ${s.keyword}`,
    matrixLabels: ["Objetivo", "Método principal", "Evitar", "Validação"],
    highlight: (s, d) =>
      `${s.keyword} não é copiar uma referência. A direção vale ser mantida quando ${d[3]}.`,
    faq: (s, d) => [
      {
        q: `O que ajustar primeiro em ${s.keyword}?`,
        a: `Comece por ${d[1]} sem mudar todas as áreas ao mesmo tempo.`,
      },
      {
        q: "Como saber se o resultado ficou pesado?",
        a: `O sinal é ${d[2]}. Reduza intensidade, área ou reflexo.`,
      },
      { q: "Quando está validado?", a: `Quando ${d[3]}.` },
      {
        q: "Compro produtos antes de testar?",
        a: "Teste primeiro cor, posição e intensidade e compre depois com critério.",
      },
    ],
  },
};

const eastAsianLanguages = new Set<SeoLanguageSlug>([
  "zh-cn",
  "zh-tw",
  "ja",
  "ko",
]);

const globalAssets: Record<string, readonly string[]> = {
  "/ai-makeup-try-on": [
    "/images/article-ai-tryon-comparison.webp",
    "/images/article-ai-photo-baseline.webp",
    "/images/article-camera-real-life.webp",
  ],
  "/virtual-makeup-app": [
    "/images/article-ai-photo-baseline.webp",
    "/images/article-ai-tryon-comparison.webp",
    "/images/article-camera-real-life.webp",
  ],
  "/looks/soft-glam": [
    "/images/look-candlelight-mauve.webp",
    "/images/look-burgundy-velvet.webp",
    "/images/look-soft-editorial.webp",
  ],
  "/looks/natural-makeup": [
    "/images/look-french-natural-chic.webp",
    "/images/look-peach-morning-glow.webp",
    "/images/look-warm-nude-daily.webp",
  ],
  "/looks/no-makeup-makeup": [
    "/images/look-no-makeup.webp",
    "/images/look-beginner.webp",
    "/images/look-five-minute-beginner.webp",
  ],
  "/looks/dewy-skin": [
    "/images/look-korean-dewy-glow.webp",
    "/images/look-weekend-glow.webp",
    "/images/look-sunburn-satin-glow.webp",
  ],
  "/looks/glass-skin": [
    "/images/look-korean-dewy-makeup-before.webp",
    "/images/look-korean-dewy-makeup.webp",
    "/images/look-reflective-lid-glow.webp",
  ],
  "/looks/clean-girl": [
    "/images/look-soft-matte-everyday.webp",
    "/images/look-commute.webp",
    "/images/look-client-meeting-nude.webp",
  ],
  "/scenarios/interview": [
    "/images/look-interview-ready.webp",
    "/images/look-client-meeting-nude.webp",
    "/images/look-executive-rose.webp",
  ],
  "/scenarios/office": [
    "/images/look-commute.webp",
    "/images/look-client-meeting-nude.webp",
    "/images/look-five-minute-beginner.webp",
  ],
  "/scenarios/first-date": [
    "/images/look-date.webp",
    "/images/look-rose-milk-date.webp",
    "/images/look-peach-beige-date.webp",
  ],
  "/scenarios/passport-photo": [
    "/images/look-passport-photo-clean.webp",
    "/images/look-flash-proof-satin.webp",
    "/images/look-photogenic.webp",
  ],
  "/scenarios/wedding-guest": [
    "/images/look-wedding-guest.webp",
    "/images/look-summer-wedding-guest.webp",
    "/images/look-champagne-gala.webp",
  ],
  "/scenarios/prom": [
    "/images/look-champagne-gala.webp",
    "/images/look-evening.webp",
    "/images/look-burgundy-velvet.webp",
  ],
};

const englishVisualRoles = {
  product: [
    {
      label: "Input and direction",
      caption:
        "Start with a clear, unfiltered photo and define the direction before comparing results.",
    },
    {
      label: "AI comparison",
      caption:
        "Compare placement, color, and intensity one variable at a time instead of judging a filter effect.",
    },
    {
      label: "Real-world validation",
      caption:
        "Confirm the selected direction still works in everyday light and camera conditions.",
    },
  ],
  look: [
    {
      label: "Overall direction",
      caption:
        "Use the reference to judge the complete balance before copying individual details.",
    },
    {
      label: "Finish and placement",
      caption:
        "Check texture, placement, and intensity at closer range so the finish stays intentional.",
    },
    {
      label: "Wearability check",
      caption:
        "Confirm the look still supports the face under realistic light and viewing distance.",
    },
  ],
  scenario: [
    {
      label: "Scenario reference",
      caption:
        "Judge whether the complete look matches the setting, clothing, and intended impression.",
    },
    {
      label: "Long-wear detail",
      caption:
        "Check the areas most likely to fade, transfer, or need a quick touch-up during the event.",
    },
    {
      label: "Photo and lighting check",
      caption:
        "Validate the look in the lighting and camera conditions expected for the occasion.",
    },
  ],
} as const;

const eastAssets: Record<string, readonly string[]> = {
  "/ai-makeup-try-on": globalAssets["/ai-makeup-try-on"]!,
  "/virtual-makeup-app": globalAssets["/virtual-makeup-app"]!,
  "/looks/soft-glam": [
    "/images/looks/candlelight-mauve--east-asia.webp",
    "/images/looks/burgundy-velvet--east-asia.webp",
    "/images/looks/soft-editorial--east-asia.webp",
  ],
  "/looks/natural-makeup": [
    "/images/looks/french-natural-chic--east-asia.webp",
    "/images/looks/peach-morning-glow--east-asia.webp",
    "/images/looks/warm-nude-daily--east-asia.webp",
  ],
  "/looks/no-makeup-makeup": [
    "/images/looks/no-makeup--east-asia.webp",
    "/images/looks/beginner--east-asia.webp",
    "/images/looks/five-minute-beginner--east-asia.webp",
  ],
  "/looks/dewy-skin": [
    "/images/looks/korean-dewy-glow--east-asia.webp",
    "/images/looks/weekend-glow--east-asia.webp",
    "/images/looks/sunburn-satin-glow--east-asia.webp",
  ],
  "/looks/glass-skin": [
    "/images/look-korean-dewy-makeup-before.webp",
    "/images/looks/korean-dewy-makeup--east-asia.webp",
    "/images/looks/reflective-lid-glow--east-asia.webp",
  ],
  "/looks/clean-girl": [
    "/images/looks/soft-matte-everyday--east-asia.webp",
    "/images/looks/commute--east-asia.webp",
    "/images/looks/client-meeting-nude--east-asia.webp",
  ],
  "/scenarios/interview": [
    "/images/looks/interview-ready--east-asia.webp",
    "/images/looks/client-meeting-nude--east-asia.webp",
    "/images/looks/executive-rose--east-asia.webp",
  ],
  "/scenarios/office": [
    "/images/looks/commute--east-asia.webp",
    "/images/looks/client-meeting-nude--east-asia.webp",
    "/images/looks/five-minute-beginner--east-asia.webp",
  ],
  "/scenarios/first-date": [
    "/images/looks/date--east-asia.webp",
    "/images/looks/rose-milk-date--east-asia.webp",
    "/images/looks/peach-beige-date--east-asia.webp",
  ],
  "/scenarios/passport-photo": [
    "/images/looks/passport-photo-clean--east-asia.webp",
    "/images/looks/flash-proof-satin--east-asia.webp",
    "/images/looks/photogenic--east-asia.webp",
  ],
  "/scenarios/wedding-guest": [
    "/images/looks/wedding-guest--east-asia.webp",
    "/images/looks/summer-wedding-guest--east-asia.webp",
    "/images/looks/champagne-gala--east-asia.webp",
  ],
  "/scenarios/prom": [
    "/images/looks/champagne-gala--east-asia.webp",
    "/images/looks/evening--east-asia.webp",
    "/images/looks/burgundy-velvet--east-asia.webp",
  ],
};

export function getEnglishFooterSeoAssets(
  englishPath: string,
  title: string,
): readonly LocalizedSeoAsset[] {
  const assetPaths = globalAssets[englishPath] ?? [];
  const roleGroup = englishPath.startsWith("/looks/")
    ? englishVisualRoles.look
    : englishPath.startsWith("/scenarios/")
      ? englishVisualRoles.scenario
      : englishVisualRoles.product;
  const topic = title.split(/:|—/)[0]?.trim() || title;

  return assetPaths.map((src, index) => ({
    src,
    alt: `${topic}: ${roleGroup[index]?.label ?? "visual reference"}`,
    caption:
      roleGroup[index]?.caption ??
      "Use this visual reference to validate the direction before applying it.",
  }));
}

export function buildFooterSeoDepth(spec: DepthSpec): {
  readonly sections: readonly LocalizedSeoSection[];
  readonly faq: readonly { q: string; a: string }[];
  readonly contentAssetsHeading: string;
  readonly contentAssets: readonly LocalizedSeoAsset[];
} {
  const detail = detailsByLanguage[spec.languageSlug][spec.englishPath];
  if (!detail) {
    throw new Error(
      `Missing footer SEO depth profile: ${spec.languageSlug}:${spec.englishPath}`,
    );
  }
  const copy = copyByLanguage[spec.languageSlug];
  const stepBodies = copy.stepBodies(spec, detail);
  const signalBodies = copy.signalBodies(spec, detail);
  const rows = copy.matrixLabels.map((label, index) => ({
    label,
    good: index === 2 ? detail[3] : detail[index as 0 | 1 | 2 | 3],
    avoid: index === 2 ? detail[2] : index === 3 ? detail[2] : detail[2],
  }));
  const assetMap = eastAsianLanguages.has(spec.languageSlug)
    ? eastAssets
    : globalAssets;
  const assetPaths = assetMap[spec.englishPath] ?? [];
  return {
    sections: [
      {
        kind: "paragraphs",
        title: copy.overviewTitle(spec),
        paragraphs: copy.overview(spec, detail),
      },
      {
        kind: "steps",
        title: copy.stepsTitle(spec),
        items: copy.stepTitles.map((title, index) => ({
          title,
          body: stepBodies[index]!,
        })),
      },
      {
        kind: "grid",
        title: copy.signalsTitle(spec),
        items: copy.signalTitles.map((title, index) => ({
          title,
          body: signalBodies[index]!,
        })),
      },
      {
        kind: "table",
        title: copy.matrixTitle(spec),
        rows,
      },
      {
        kind: "highlight",
        text: copy.highlight(spec, detail),
      },
    ],
    faq: copy.faq(spec, detail),
    contentAssetsHeading: copy.visualHeading,
    contentAssets: assetPaths.map((src, index) => ({
      src,
      alt: `${spec.keyword}: ${copy.visualRoles[index]}`,
      caption: `${copy.visualRoles[index]}: ${detail[index === 0 ? 0 : index === 1 ? 1 : 3]}`,
    })),
  };
}
