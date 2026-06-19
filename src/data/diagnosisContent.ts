import type { SupportedLocale } from "../lib/i18n";
import { t } from "../lib/i18n";

type Pair = readonly [string, string];

interface DiagnosisCore {
  readonly metaTitle: string;
  readonly metaDescription: string;
  readonly kicker: string;
  readonly title: string;
  readonly titleLines: readonly [string, string];
  readonly subtitle: string;
  readonly trust: readonly Pair[];
  readonly previewTitle: string;
  readonly previewStats: readonly Pair[];
  readonly previewNotes: readonly string[];
  readonly outcomeTitle: string;
  readonly outcomeSubtitle: string;
  readonly outcomes: readonly Pair[];
  readonly uploadTitle: string;
  readonly uploadSubtitle: string;
  readonly guideTitle: string;
  readonly guide: readonly string[];
  readonly resultKeywords: string;
  readonly resultNotice: string;
  readonly recommendTitle: string;
  readonly recommendSubtitle: string;
  readonly historyKicker: string;
  readonly historyTitle: string;
  readonly historySubtitle: string;
  readonly historyEmptyTitle: string;
  readonly historyEmptyBody: string;
  readonly historyEmptyMeta: readonly Pair[];
}

const localized: Partial<Record<SupportedLocale, DiagnosisCore>> = {
  "de-DE": {
    metaTitle: "KI-Gesichtsdiagnose | AI Beauty Stylist",
    metaDescription:
      "Analysiere Hautton, Gesichtsstruktur und Make-up-Richtung vor dem virtuellen Try-on.",
    kicker: "KI-Gesichtsdiagnose",
    title: "Verstehe dein Gesicht, bevor du einen Look testest",
    titleLines: ["Verstehe dein Gesicht", "bevor du einen Look testest"],
    subtitle:
      "Lade nach deiner Einwilligung ein klares Selfie hoch. Der Bericht übersetzt sichtbare Merkmale, Unterton und Anlass in konkrete Make-up-Richtungen.",
    trust: [
      [
        "Ein Credit",
        "Diagnose und Try-on nutzen dieselben monatlichen Credits.",
      ],
      [
        "Privater Ablauf",
        "Selfies werden erst nach ausdrücklicher Einwilligung verarbeitet.",
      ],
      [
        "Direkt nutzbar",
        "Jeder Bericht führt zu Looks, die du sofort testen kannst.",
      ],
    ],
    previewTitle: "Warm-neutraler Hautton mit sanfter Rosé-Richtung",
    previewStats: [
      ["Unterton", "Neutral-warm"],
      ["Schwerpunkt", "Weiche Struktur"],
      ["Finish", "Satin-Rosé"],
    ],
    previewNotes: [
      "Grundierung dünn halten und echte Hautstruktur bewahren.",
      "Gedämpftes Rosé auf Lippen und Wangen bringt Frische.",
      "Tagsüber schwere kühle Grautöne am Auge vermeiden.",
    ],
    outcomeTitle: "Was der Bericht liefert",
    outcomeSubtitle:
      "Eine Diagnose ist nützlich, wenn sie Auswahl und Bewertung von Make-up beschleunigt.",
    outcomes: [
      [
        "Farbe",
        "Hautton, Unterton und Farbrichtung für Teint, Lippen und Wangen.",
      ],
      ["Struktur", "Hinweise für Brauen, Liner, Kontur und Highlight."],
      ["Richtung", "Drei Make-up-Richtungen mit Farben und Warnhinweisen."],
    ],
    uploadTitle: "Neue Diagnose starten",
    uploadSubtitle:
      "Nutze ein frontales Selfie in natürlichem Licht ohne starke Filter, Sonnenbrille oder extreme Winkel.",
    guideTitle: "Foto-Check",
    guide: [
      "Gesicht zur Kamera, beide Augen sichtbar",
      "Sauberes Licht ohne Farbfilter",
      "Haar nicht vor der Hauptkontur",
    ],
    resultKeywords: "Deine Beauty-Schlüsselwörter",
    resultNotice:
      "KI-Vorschläge sind nur Beauty-Referenzen und keine medizinische oder professionelle Beratung.",
    recommendTitle: "Passende Looks zu dieser Diagnose",
    recommendSubtitle:
      "Teste eine Richtung aus dem Bericht, statt blind zu wählen.",
    historyKicker: "Gespeicherte Berichte",
    historyTitle: "Diagnoseverlauf",
    historySubtitle: "Frühere Berichte bleiben verfügbar, bis du sie löschst.",
    historyEmptyTitle: "Noch keine gespeicherten Diagnosen",
    historyEmptyBody:
      "Nach der ersten Diagnose werden Unterton, Schwerpunkt, Farbrichtung und passende Looks hier gespeichert.",
    historyEmptyMeta: [
      ["Kontext behalten", "Prüfe den letzten Bericht vor einem neuen Look."],
      [
        "Schnell vergleichen",
        "Vergleiche Unterton, Schwerpunkt und Stilrichtung.",
      ],
      ["Du entscheidest", "Lösche nicht mehr benötigte Berichte."],
    ],
  },
  "fr-FR": {
    metaTitle: "Diagnostic facial IA | AI Beauty Stylist",
    metaDescription:
      "Analysez teint, structure du visage et direction maquillage avant l'essai virtuel.",
    kicker: "Diagnostic facial IA",
    title: "Comprendre votre visage avant d'essayer un look",
    titleLines: ["Comprendre votre visage", "avant d'essayer un look"],
    subtitle:
      "Après votre accord, importez un selfie net. Le rapport transforme traits visibles, sous-ton et occasion en directions maquillage concrètes.",
    trust: [
      [
        "Un crédit",
        "Diagnostic et essai utilisent les mêmes crédits mensuels.",
      ],
      [
        "Parcours privé",
        "Les selfies sont traités après consentement explicite.",
      ],
      [
        "Action immédiate",
        "Chaque rapport mène à des looks que vous pouvez essayer.",
      ],
    ],
    previewTitle: "Sous-ton chaud-neutre et direction rose douce",
    previewStats: [
      ["Sous-ton", "Neutre chaud"],
      ["Point fort", "Structure douce"],
      ["Fini", "Rose satiné"],
    ],
    previewNotes: [
      "Gardez une base fine et la texture naturelle de la peau.",
      "Un rose atténué sur lèvres et joues réveille le teint.",
      "Évitez un gris froid trop dense sur les yeux en journée.",
    ],
    outcomeTitle: "Ce que fournit le rapport",
    outcomeSubtitle:
      "Le diagnostic est utile s'il accélère le choix et l'évaluation du maquillage.",
    outcomes: [
      [
        "Couleur",
        "Profondeur, sous-ton et direction colorée pour teint, lèvres et joues.",
      ],
      ["Structure", "Repères pour sourcils, liner, contour et lumière."],
      [
        "Direction",
        "Trois directions maquillage avec couleurs et précautions.",
      ],
    ],
    uploadTitle: "Lancer un nouveau diagnostic",
    uploadSubtitle:
      "Utilisez un selfie de face, en lumière naturelle, sans filtre fort, lunettes ni angle extrême.",
    guideTitle: "Vérification de la photo",
    guide: [
      "Visage face à l'objectif et yeux visibles",
      "Lumière propre sans filtre coloré",
      "Cheveux dégagés du contour principal",
    ],
    resultKeywords: "Vos mots-clés beauté",
    resultNotice:
      "Les suggestions IA sont des références beauté, pas un avis médical ou professionnel.",
    recommendTitle: "Looks adaptés à ce diagnostic",
    recommendSubtitle:
      "Essayez une direction du rapport plutôt que de choisir au hasard.",
    historyKicker: "Rapports enregistrés",
    historyTitle: "Historique des diagnostics",
    historySubtitle:
      "Les rapports précédents restent disponibles jusqu'à leur suppression.",
    historyEmptyTitle: "Aucun diagnostic enregistré",
    historyEmptyBody:
      "Après un premier diagnostic, sous-ton, structure, couleurs et looks adaptés seront conservés ici.",
    historyEmptyMeta: [
      [
        "Conserver le contexte",
        "Relisez le dernier rapport avant un nouveau look.",
      ],
      ["Comparer rapidement", "Comparez sous-ton, structure et direction."],
      ["Vous gardez le contrôle", "Supprimez les rapports devenus inutiles."],
    ],
  },
  "ja-JP": {
    metaTitle: "AI顔診断 | AI Beauty Stylist",
    metaDescription:
      "バーチャルメイクの前に、肌色、顔立ち、似合うメイク方向を分析します。",
    kicker: "AI顔診断",
    title: "メイクを試す前に、自分の顔を理解",
    titleLines: ["メイクを試す前に", "自分の顔を理解"],
    subtitle:
      "同意後に明るく鮮明なセルフィーをアップロード。見える特徴、アンダートーン、シーンを具体的なメイク方向に整理します。",
    trust: [
      ["1クレジット", "診断と試着は同じ月間クレジットを使います。"],
      ["プライベートな処理", "セルフィーは明確な同意後にのみ処理されます。"],
      ["すぐに試せる", "各レポートからおすすめメイクを試せます。"],
    ],
    previewTitle: "ニュートラルウォーム肌にやわらかなローズ",
    previewStats: [
      ["アンダートーン", "ニュートラルウォーム"],
      ["メイクの焦点", "やわらかな立体感"],
      ["おすすめ質感", "サテンローズ"],
    ],
    previewNotes: [
      "ベースは薄くして自然な肌質を残す。",
      "唇と頬にくすみローズを使い、明るい印象へ。",
      "日中は重いクールグレーのアイシャドウを避ける。",
    ],
    outcomeTitle: "レポートで分かること",
    outcomeSubtitle: "診断は、メイクを早く選び、判断するために使います。",
    outcomes: [
      ["色", "肌の明るさとアンダートーンから、ベース・唇・頬の色方向を提案。"],
      ["骨格", "眉、アイライン、輪郭、ハイライトの位置を整理。"],
      ["方向", "おすすめ色と注意点を含む3つのメイク方向。"],
    ],
    uploadTitle: "新しい診断を始める",
    uploadSubtitle:
      "自然光の正面セルフィーを使用し、強いフィルター、サングラス、極端な横顔は避けてください。",
    guideTitle: "写真チェック",
    guide: [
      "カメラを正面にして両目を見せる",
      "色フィルターのない均一な光",
      "顔の輪郭に髪がかからないようにする",
    ],
    resultKeywords: "あなたのビューティーキーワード",
    resultNotice:
      "AI提案は美容上の参考であり、医療・専門的助言ではありません。",
    recommendTitle: "診断に合うおすすめメイク",
    recommendSubtitle: "推測ではなく、レポートに近い方向から試せます。",
    historyKicker: "保存したレポート",
    historyTitle: "診断履歴",
    historySubtitle: "以前のレポートは削除するまで確認できます。",
    historyEmptyTitle: "保存された診断はまだありません",
    historyEmptyBody:
      "診断を完了すると、アンダートーン、重点、色方向、おすすめメイクがここに保存されます。",
    historyEmptyMeta: [
      ["前回の内容を確認", "新しいメイクを選ぶ前にレポートを見返せます。"],
      ["すばやく比較", "アンダートーン、重点、スタイル方向を比較。"],
      ["自分で管理", "不要なレポートはいつでも削除できます。"],
    ],
  },
  "ko-KR": {
    metaTitle: "AI 얼굴 진단 | AI Beauty Stylist",
    metaDescription:
      "가상 메이크업 전에 피부 톤, 얼굴 구조 및 어울리는 메이크업 방향을 분석합니다.",
    kicker: "AI 얼굴 진단",
    title: "룩을 체험하기 전에 내 얼굴 이해하기",
    titleLines: ["룩을 체험하기 전에", "내 얼굴 이해하기"],
    subtitle:
      "동의 후 선명한 셀피를 업로드하세요. 보고서가 보이는 특징, 언더톤 및 상황을 구체적인 메이크업 방향으로 정리합니다.",
    trust: [
      ["1 크레딧", "진단과 가상 체험은 같은 월간 크레딧을 사용합니다."],
      ["비공개 처리", "셀피는 명확한 동의 후에만 처리됩니다."],
      ["바로 실행", "각 보고서에서 추천 룩을 바로 체험할 수 있습니다."],
    ],
    previewTitle: "뉴트럴 웜 피부와 부드러운 로즈 방향",
    previewStats: [
      ["언더톤", "뉴트럴 웜"],
      ["메이크업 초점", "부드러운 구조"],
      ["추천 마무리", "새틴 로즈"],
    ],
    previewNotes: [
      "베이스를 얇게 유지하고 실제 피부 질감을 살리세요.",
      "입술과 볼에 차분한 로즈를 사용해 생기를 더하세요.",
      "낮에는 무거운 쿨 그레이 아이섀도를 피하세요.",
    ],
    outcomeTitle: "보고서가 제공하는 것",
    outcomeSubtitle:
      "진단은 메이크업을 더 빠르게 선택하고 판단하도록 돕습니다.",
    outcomes: [
      [
        "색상",
        "피부 밝기와 언더톤을 바탕으로 베이스, 입술, 볼 색상을 제안합니다.",
      ],
      ["구조", "눈썹, 아이라인, 윤곽 및 하이라이트 위치를 정리합니다."],
      ["방향", "추천 색상과 주의점을 포함한 세 가지 메이크업 방향입니다."],
    ],
    uploadTitle: "새 진단 시작",
    uploadSubtitle:
      "자연광에서 정면 셀피를 사용하고 강한 필터, 선글라스 및 극단적인 측면 각도를 피하세요.",
    guideTitle: "사진 확인",
    guide: [
      "카메라를 정면으로 보고 양쪽 눈 보이기",
      "색상 필터 없는 고른 조명",
      "머리카락이 얼굴 윤곽을 가리지 않게 하기",
    ],
    resultKeywords: "나의 뷰티 키워드",
    resultNotice: "AI 제안은 뷰티 참고용이며 의료 또는 전문 조언이 아닙니다.",
    recommendTitle: "진단과 어울리는 추천 룩",
    recommendSubtitle: "추측하지 말고 보고서와 가까운 방향부터 체험하세요.",
    historyKicker: "저장된 보고서",
    historyTitle: "진단 기록",
    historySubtitle: "이전 보고서는 삭제할 때까지 확인할 수 있습니다.",
    historyEmptyTitle: "저장된 진단 보고서가 없습니다",
    historyEmptyBody:
      "진단을 완료하면 언더톤, 초점, 색상 방향 및 추천 룩이 여기에 저장됩니다.",
    historyEmptyMeta: [
      ["이전 맥락 확인", "새 룩을 선택하기 전에 최근 보고서를 확인하세요."],
      ["빠른 비교", "언더톤, 초점 및 스타일 방향을 비교하세요."],
      ["직접 관리", "필요 없는 보고서는 언제든 삭제하세요."],
    ],
  },
  "zh-TW": {
    metaTitle: "AI 臉部妝容診斷 | AI Beauty Stylist",
    metaDescription: "在虛擬試妝前分析膚色、臉部結構與適合的妝容方向。",
    kicker: "AI 臉部妝容診斷",
    title: "先了解自己的臉，再選擇要試的妝",
    titleLines: ["先了解自己的臉", "再選擇要試的妝"],
    subtitle:
      "同意後上傳一張清晰自拍，報告會把可見特徵、膚色方向與場合需求整理成具體妝容建議。",
    trust: [
      ["1 點數", "診斷與試妝使用同一套每月點數。"],
      ["私密流程", "自拍只在你明確同意後進入處理。"],
      ["可以立即行動", "每份報告都會連結到可直接試妝的風格。"],
    ],
    previewTitle: "暖中性膚色，適合柔和玫瑰方向",
    previewStats: [
      ["膚色方向", "中性偏暖"],
      ["妝容重點", "柔和輪廓"],
      ["推薦質感", "緞光玫瑰"],
    ],
    previewNotes: [
      "底妝保持輕薄並保留真實肌膚質感。",
      "唇頰使用低飽和玫瑰色增加精神。",
      "日間避免大面積冷灰眼影。",
    ],
    outcomeTitle: "報告會提供什麼",
    outcomeSubtitle: "診斷的目的，是幫助你更快選擇與判斷妝容。",
    outcomes: [
      ["色彩", "參考膚色深淺與冷暖，提供底妝、唇色與腮紅方向。"],
      ["結構", "整理眉型、眼線、輪廓與打亮位置。"],
      ["方向", "提供三個妝容方向，包含推薦色與注意事項。"],
    ],
    uploadTitle: "開始新的診斷",
    uploadSubtitle:
      "請使用自然光下的正面清晰自拍，避免強烈濾鏡、墨鏡或大角度側臉。",
    guideTitle: "照片檢查",
    guide: [
      "正對鏡頭並讓雙眼清楚可見",
      "使用乾淨光線並避免偏色濾鏡",
      "頭髮不要遮擋主要臉部輪廓",
    ],
    resultKeywords: "你的美妝關鍵字",
    resultNotice: "AI 建議僅供美妝參考，不構成醫療或專業意見。",
    recommendTitle: "符合診斷方向的妝容",
    recommendSubtitle: "從接近報告的方向開始，比盲選更省時間。",
    historyKicker: "已儲存報告",
    historyTitle: "診斷紀錄",
    historySubtitle: "先前的報告會保留到你主動刪除。",
    historyEmptyTitle: "目前沒有已儲存的診斷",
    historyEmptyBody:
      "完成一次診斷後，膚色方向、妝容重點、色彩方向與推薦妝容會保留在這裡。",
    historyEmptyMeta: [
      ["保留脈絡", "選擇新妝容前可先查看最近報告。"],
      ["快速比較", "比較膚色方向、妝容重點與風格方向。"],
      ["自行管理", "不需要的報告可隨時刪除。"],
    ],
  },
  "es-ES": {
    metaTitle: "Diagnóstico facial IA | AI Beauty Stylist",
    metaDescription:
      "Analiza tono de piel, estructura facial y dirección de maquillaje antes de la prueba virtual.",
    kicker: "Diagnóstico facial IA",
    title: "Entiende tu rostro antes de probar un look",
    titleLines: ["Entiende tu rostro", "antes de probar un look"],
    subtitle:
      "Tras dar tu consentimiento, sube una selfie nítida. El informe convierte rasgos visibles, subtono y ocasión en direcciones concretas.",
    trust: [
      [
        "Un crédito",
        "Diagnóstico y prueba usan los mismos créditos mensuales.",
      ],
      [
        "Flujo privado",
        "Las selfies solo se procesan con consentimiento explícito.",
      ],
      ["Acción inmediata", "Cada informe conecta con looks que puedes probar."],
    ],
    previewTitle: "Subtono neutro cálido con dirección rosa suave",
    previewStats: [
      ["Subtono", "Neutro cálido"],
      ["Enfoque", "Estructura suave"],
      ["Acabado", "Rosa satinado"],
    ],
    previewNotes: [
      "Mantén la base ligera y conserva la textura real.",
      "Usa rosa apagado en labios y mejillas para dar vitalidad.",
      "Evita una sombra gris fría muy intensa durante el día.",
    ],
    outcomeTitle: "Qué aporta el informe",
    outcomeSubtitle:
      "El diagnóstico sirve para elegir y evaluar maquillaje más rápido.",
    outcomes: [
      [
        "Color",
        "Profundidad, subtono y dirección para base, labios y mejillas.",
      ],
      ["Estructura", "Pautas para cejas, delineado, contorno e iluminador."],
      ["Dirección", "Tres direcciones con colores y precauciones."],
    ],
    uploadTitle: "Iniciar un nuevo diagnóstico",
    uploadSubtitle:
      "Usa una selfie frontal con luz natural, sin filtros fuertes, gafas de sol ni ángulos extremos.",
    guideTitle: "Comprobación de foto",
    guide: [
      "Mira a cámara y muestra ambos ojos",
      "Usa luz limpia sin filtros de color",
      "Mantén el pelo fuera del contorno principal",
    ],
    resultKeywords: "Tus palabras clave de belleza",
    resultNotice:
      "Las sugerencias IA son referencias de belleza, no asesoramiento médico o profesional.",
    recommendTitle: "Looks adecuados para este diagnóstico",
    recommendSubtitle:
      "Prueba una dirección del informe en lugar de elegir al azar.",
    historyKicker: "Informes guardados",
    historyTitle: "Historial de diagnósticos",
    historySubtitle:
      "Los informes anteriores siguen disponibles hasta que los borres.",
    historyEmptyTitle: "Aún no hay diagnósticos guardados",
    historyEmptyBody:
      "Tras completar un diagnóstico, aquí se guardarán subtono, enfoque, dirección y looks adecuados.",
    historyEmptyMeta: [
      [
        "Conservar contexto",
        "Revisa el último informe antes de elegir otro look.",
      ],
      ["Comparar rápido", "Compara subtono, enfoque y dirección."],
      ["Tú controlas", "Borra informes cuando ya no sean útiles."],
    ],
  },
  "pt-BR": {
    metaTitle: "Diagnóstico facial por IA | AI Beauty Stylist",
    metaDescription:
      "Analise tom de pele, estrutura facial e direção de maquiagem antes do teste virtual.",
    kicker: "Diagnóstico facial por IA",
    title: "Entenda seu rosto antes de testar um look",
    titleLines: ["Entenda seu rosto", "antes de testar um look"],
    subtitle:
      "Após o consentimento, envie uma selfie nítida. O relatório transforma traços visíveis, subtom e ocasião em direções concretas.",
    trust: [
      ["Um crédito", "Diagnóstico e teste usam os mesmos créditos mensais."],
      [
        "Fluxo privado",
        "Selfies são processadas apenas com consentimento explícito.",
      ],
      ["Ação imediata", "Cada relatório leva a looks que você pode testar."],
    ],
    previewTitle: "Subtom neutro quente com direção rosa suave",
    previewStats: [
      ["Subtom", "Neutro quente"],
      ["Foco", "Estrutura suave"],
      ["Acabamento", "Rosa acetinado"],
    ],
    previewNotes: [
      "Mantenha a base leve e preserve a textura real.",
      "Use rosa suave nos lábios e bochechas para dar vida.",
      "Evite sombra cinza fria muito intensa durante o dia.",
    ],
    outcomeTitle: "O que o relatório oferece",
    outcomeSubtitle:
      "O diagnóstico ajuda a escolher e avaliar maquiagem mais rápido.",
    outcomes: [
      ["Cor", "Profundidade, subtom e direção para base, lábios e bochechas."],
      [
        "Estrutura",
        "Pontos para sobrancelhas, delineado, contorno e iluminador.",
      ],
      ["Direção", "Três direções com cores e cuidados."],
    ],
    uploadTitle: "Iniciar novo diagnóstico",
    uploadSubtitle:
      "Use uma selfie frontal com luz natural, sem filtros fortes, óculos escuros ou ângulos extremos.",
    guideTitle: "Verificação da foto",
    guide: [
      "Olhe para a câmera e mostre os dois olhos",
      "Use luz limpa sem filtro de cor",
      "Mantenha o cabelo fora do contorno principal",
    ],
    resultKeywords: "Suas palavras-chave de beleza",
    resultNotice:
      "Sugestões de IA são referências de beleza, não orientação médica ou profissional.",
    recommendTitle: "Looks adequados ao diagnóstico",
    recommendSubtitle:
      "Teste uma direção do relatório em vez de escolher ao acaso.",
    historyKicker: "Relatórios salvos",
    historyTitle: "Histórico de diagnósticos",
    historySubtitle:
      "Relatórios anteriores ficam disponíveis até serem excluídos.",
    historyEmptyTitle: "Ainda não há diagnósticos salvos",
    historyEmptyBody:
      "Após concluir um diagnóstico, subtom, foco, direção e looks adequados serão salvos aqui.",
    historyEmptyMeta: [
      [
        "Manter contexto",
        "Revise o último relatório antes de escolher outro look.",
      ],
      ["Comparar rápido", "Compare subtom, foco e direção."],
      ["Você controla", "Exclua relatórios quando não forem mais úteis."],
    ],
  },
};

localized["es-419"] = localized["es-ES"];

const text = (section: "workspace" | "tryon", key: string) =>
  String(
    (t as (section: "workspace" | "tryon", key: string) => unknown)(
      section,
      key,
    ),
  );

const quotaExhaustedCopy = (locale: SupportedLocale) => {
  if (locale === "zh-CN") {
    return {
      label: "本月额度已用完",
      note: "本月生成额度已用完，可分享或升级获取更多额度。",
    };
  }
  if (locale === "zh-TW") {
    return {
      label: "本月額度已用完",
      note: "本月生成額度已用完，可分享或升級取得更多額度。",
    };
  }
  return {
    label: "Monthly credits used up",
    note: "Monthly generation credits are used up. Share or upgrade to get more credits.",
  };
};

export function getLocalizedDiagnosisContent(locale: SupportedLocale) {
  const core = localized[locale];
  if (!core) return undefined;
  const exhaustedCopy = quotaExhaustedCopy(locale);
  return {
    ...core,
    startCta: core.uploadTitle,
    plansCta: text("workspace", "viewPlans"),
    previewLabel: core.kicker,
    previewAlt: core.previewTitle,
    quotaTitle: text("workspace", "monthlyQuota"),
    quotaLoading: text("tryon", "loading"),
    consent: text("tryon", "consentCheckbox"),
    uploadCta: core.uploadTitle,
    recommendMore: text("workspace", "openFullCatalog"),
    tryLook: text("workspace", "startTryon"),
    historyLoading: text("tryon", "loading"),
    historyEmptyCta: core.uploadTitle,
    historyEmptySecondary: text("workspace", "browseLooks"),
    client: {
      quotaGuest: text("tryon", "loginToUseQuota"),
      quotaGuestNote: text("tryon", "loginToUseDesc"),
      quotaRemainingPrefix: `${text("workspace", "remaining")}: `,
      quotaRemainingSuffix: "",
      quotaExhausted: exhaustedCopy.label,
      quotaExhaustedNote: exhaustedCopy.note,
      quotaExhaustedCta: exhaustedCopy.label,
      loginCta: text("tryon", "loginToUpload"),
      uploadCta: core.uploadTitle,
      tryLook: text("workspace", "startTryon"),
      uploadFlowNotReady: text("tryon", "uploadFlowNotReady"),
      uploading: text("tryon", "uploading"),
      confirming: text("tryon", "confirmingPhotoNotice"),
      creating: text("tryon", "creatingTask"),
      analyzing: text("tryon", "aiAnalyzing"),
      generating: text("tryon", "generatingImage"),
      running: text("tryon", "aiAnalyzing"),
      complete: text("tryon", "complete"),
      timeout: text("tryon", "timeout"),
      failed: text("tryon", "failed"),
      historyFailed: text("tryon", "historyLoadFailed"),
      viewDetail: core.historyTitle,
      delete: text("tryon", "delete"),
      confirmDelete: text("tryon", "confirmDeleteResult"),
      reportTitle: core.kicker,
    },
  };
}
