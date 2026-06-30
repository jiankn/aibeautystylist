import type { AppLocale } from "../i18n/config";

export interface TutorialStep {
  order: number;
  title: string;
  /** 面部区域 */
  region: "base" | "eyes" | "brows" | "cheeks" | "lips" | "contour";
  /** 使用的工具/产品类型 */
  tool: string;
  /** 具体动作说明 */
  action: string;
  /** 常见错误提醒 */
  errorWarning?: string;
  /** 自检点 */
  selfCheck?: string;
  /** 是否为 Pro+ 专属步骤（Free 用户仅能看前 3 步） */
  premiumOnly?: boolean;
}

export interface Tutorial {
  id: string;
  lookSlug: string;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedMinutes: number;
  steps: TutorialStep[];
}

export interface TutorialUiCopy {
  ariaLabel: string;
  regions: Record<TutorialStep["region"], string>;
  difficulties: Record<Tutorial["difficulty"], string>;
  estimatedMinutes: string;
  stepCount: string;
  toolLabel: string;
  warningLabel: string;
  selfCheckLabel: string;
  lockedText: string;
  remainingSteps: string;
  viewPlans: string;
}

type TutorialLanguage =
  | "en"
  | "zh-CN"
  | "zh-TW"
  | "de"
  | "fr"
  | "ja"
  | "ko"
  | "es"
  | "pt-BR";

interface LocalizedStep {
  title: string;
  tool: string;
  action: string;
  errorWarning?: string;
  selfCheck?: string;
}

interface LocalizedTutorial {
  title: string;
  description: string;
  steps: LocalizedStep[];
}

interface TutorialLocaleContent {
  ui: TutorialUiCopy;
  tutorials: Record<"commute" | "no-makeup", LocalizedTutorial>;
}

const stepBlueprints = {
  commute: [
    { region: "base" },
    { region: "brows" },
    { region: "eyes" },
    { region: "cheeks", premiumOnly: true },
    { region: "lips", premiumOnly: true },
    { region: "base", premiumOnly: true },
  ],
  "no-makeup": [
    { region: "base" },
    { region: "base" },
    { region: "brows" },
    { region: "cheeks", premiumOnly: true },
    { region: "lips", premiumOnly: true },
    { region: "eyes", premiumOnly: true },
  ],
} as const;

const tutorialMeta = {
  commute: { id: "tut-commute", estimatedMinutes: 5 },
  "no-makeup": { id: "tut-no-makeup", estimatedMinutes: 8 },
} as const;

const localeContent: Record<TutorialLanguage, TutorialLocaleContent> = {
  en: {
    ui: {
      ariaLabel: "Makeup tutorial",
      regions: {
        base: "Base",
        eyes: "Eyes",
        brows: "Brows",
        cheeks: "Blush",
        lips: "Lips",
        contour: "Contour",
      },
      difficulties: {
        beginner: "Beginner-friendly",
        intermediate: "Intermediate",
        advanced: "Advanced",
      },
      estimatedMinutes: "Estimated {minutes} min",
      stepCount: "{count} steps",
      toolLabel: "Tool",
      warningLabel: "Tip",
      selfCheckLabel: "Check",
      lockedText: "Unlock all steps with Pro",
      remainingSteps: "{count} more steps are available with Pro or Premium",
      viewPlans: "View plans",
    },
    tutorials: {
      commute: {
        title: "Everyday Work Makeup Tutorial",
        description: "Create a fresh, natural workday look in 5 minutes",
        steps: [
          {
            title: "Base",
            tool: "Cushion / lightweight foundation",
            action:
              "Apply a thin layer over the face and pat it in with your fingertips",
            errorWarning:
              "Avoid applying too much, which can make the base break up",
            selfCheck:
              "From a distance, does the base look barely noticeable? It should",
          },
          {
            title: "Brows",
            tool: "Brow pencil / brow powder",
            action:
              "Follow the direction of the hairs and lightly fill any gaps",
            errorWarning: "Avoid a heavy brow front or harsh outline",
            selfCheck: "Do both brows look balanced?",
          },
          {
            title: "Eyeshadow",
            tool: "Neutral brown / milk-tea eyeshadow",
            action:
              "Sweep one shade over the lid and soften the edges with a fingertip",
            errorWarning: "Avoid shades with large glitter particles",
            selfCheck: "Can you still see the color when your eyes are open?",
          },
          {
            title: "Blush",
            tool: "Peach / milk-tea blush",
            action:
              "Sweep lightly over the apples of the cheeks and blend toward the temples",
            errorWarning: "Start with less and build only if needed",
            selfCheck: "Does it look like a natural, healthy flush?",
          },
          {
            title: "Lips",
            tool: "Lip tint / lip balm",
            action: "Apply at the center, then blend outward with a fingertip",
            errorWarning:
              "Deep lipstick shades can overpower an everyday work look",
            selfCheck: "Does the shade complement your skin tone?",
          },
          {
            title: "Set",
            tool: "Loose powder / setting spray",
            action:
              "Press powder onto the T-zone and mist setting spray over the face",
            selfCheck: "Does the finish look fresh rather than oily?",
          },
        ],
      },
      "no-makeup": {
        title: "No-Makeup Makeup Tutorial",
        description:
          "Create naturally healthy-looking skin without visible makeup",
        steps: [
          {
            title: "Prep and moisturize",
            tool: "Moisturizer / primer",
            action:
              "Apply a thin layer over the face and wait 2 minutes for it to absorb",
            selfCheck: "Does the skin look luminous but not oily?",
          },
          {
            title: "Sheer base",
            tool: "Tone-up cream / lightweight foundation",
            action: "Use small amounts and pat outward with a makeup sponge",
            errorWarning:
              "A heavy base is the quickest way to lose the no-makeup effect",
            selfCheck: "Are your pores still faintly visible? They should be",
          },
          {
            title: "Natural brows",
            tool: "Brow powder / clear brow gel",
            action: "Fill only the gaps, then brush the hairs into place",
            selfCheck: "Do your brows look naturally well-shaped?",
          },
          {
            title: "Cream blush",
            tool: "Cream blush",
            action:
              "Tap a small amount onto the apples of the cheeks and blend",
            selfCheck: "Does it resemble a natural post-exercise flush?",
          },
          {
            title: "Tinted lips",
            tool: "Tinted lip balm",
            action: "Apply directly for a natural wash of color",
          },
          {
            title: "Lifted lashes",
            tool: "Eyelash curler + clear mascara",
            action: "Curl the lashes, then brush on one coat of clear mascara",
            selfCheck: "Do your eyes look brighter and more awake?",
          },
        ],
      },
    },
  },
  "zh-CN": {
    ui: {
      ariaLabel: "妆容教程",
      regions: {
        base: "底妆",
        eyes: "眼妆",
        brows: "眉部",
        cheeks: "腮红",
        lips: "唇妆",
        contour: "修容",
      },
      difficulties: {
        beginner: "新手友好",
        intermediate: "进阶",
        advanced: "高阶",
      },
      estimatedMinutes: "预计 {minutes} 分钟",
      stepCount: "共 {count} 步",
      toolLabel: "工具",
      warningLabel: "提醒",
      selfCheckLabel: "自检",
      lockedText: "升级 Pro 解锁完整步骤",
      remainingSteps: "还有 {count} 个步骤可在 Pro 或 Premium 方案查看",
      viewPlans: "查看会员方案",
    },
    tutorials: {
      commute: {
        title: "通勤妆容教程",
        description: "5 分钟打造清爽自然的通勤妆",
        steps: [
          {
            title: "底妆",
            tool: "气垫 / 轻薄粉底液",
            action: "薄涂全脸，指腹轻拍至贴肤",
            errorWarning: "避免涂太厚导致脱妆",
            selfCheck: "远看是否有明显妆感？不应该有",
          },
          {
            title: "眉毛",
            tool: "眉笔 / 眉粉",
            action: "顺着毛流轻描眉形，填补空隙",
            errorWarning: "避免眉头过重或边界太硬",
            selfCheck: "两边眉毛是否对称？",
          },
          {
            title: "眼影",
            tool: "大地色 / 奶茶色眼影",
            action: "单色铺满眼窝，指腹晕染边缘",
            errorWarning: "避免选择闪片太大的颜色",
            selfCheck: "睁眼是否还能看到颜色？",
          },
          {
            title: "腮红",
            tool: "蜜桃色 / 奶茶色腮红",
            action: "笑肌最高点轻扫，向太阳穴方向晕开",
            errorWarning: "用量宜少不宜多",
            selfCheck: "是否像自然的好气色？",
          },
          {
            title: "唇妆",
            tool: "唇釉 / 润唇膏",
            action: "涂抹中心后用指腹向外晕开",
            errorWarning: "通勤妆不建议用深色唇膏",
            selfCheck: "颜色是否衬肤色？",
          },
          {
            title: "定妆",
            tool: "散粉 / 定妆喷雾",
            action: "T 区轻扑散粉，全脸喷定妆喷雾",
            selfCheck: "妆面是否清爽不油腻？",
          },
        ],
      },
      "no-makeup": {
        title: "伪素颜教程",
        description: "打造看不出化了妆的自然好皮肤",
        steps: [
          {
            title: "妆前保湿",
            tool: "保湿面霜 / 妆前乳",
            action: "全脸薄涂保湿，等待 2 分钟吸收",
            selfCheck: "皮肤是否有光泽但不油？",
          },
          {
            title: "底妆",
            tool: "素颜霜 / 轻薄粉底液",
            action: "少量多次，海绵蛋轻拍推开",
            errorWarning: "素颜妆最忌讳底妆太厚",
            selfCheck: "能否看到自己的毛孔？应该若隐若现",
          },
          {
            title: "野生眉",
            tool: "眉粉 / 透明眉膏",
            action: "只填补空隙，用眉刷梳理毛流",
            selfCheck: "是否看起来像天生好眉形？",
          },
          {
            title: "奶油腮红",
            tool: "膏状腮红",
            action: "指腹取少量点在笑肌，拍开晕染",
            selfCheck: "像不像刚运动完的自然红？",
          },
          {
            title: "润唇",
            tool: "有色润唇膏",
            action: "直接涂抹，打造自然唇色",
          },
          {
            title: "卷翘睫毛",
            tool: "睫毛夹 + 透明睫毛膏",
            action: "夹翘后刷一层透明睫毛膏固定",
            selfCheck: "睁大眼睛是否更有神？",
          },
        ],
      },
    },
  },
  "zh-TW": {
    ui: {
      ariaLabel: "妝容教學",
      regions: {
        base: "底妝",
        eyes: "眼妝",
        brows: "眉部",
        cheeks: "腮紅",
        lips: "唇妝",
        contour: "修容",
      },
      difficulties: {
        beginner: "新手友善",
        intermediate: "進階",
        advanced: "高階",
      },
      estimatedMinutes: "預計 {minutes} 分鐘",
      stepCount: "共 {count} 步",
      toolLabel: "工具",
      warningLabel: "提醒",
      selfCheckLabel: "自我檢查",
      lockedText: "升級 Pro 解鎖完整步驟",
      remainingSteps: "還有 {count} 個步驟可在 Pro 或 Premium 方案查看",
      viewPlans: "查看會員方案",
    },
    tutorials: {
      commute: {
        title: "通勤妝容教學",
        description: "5 分鐘打造清爽自然的通勤妝",
        steps: [
          {
            title: "底妝",
            tool: "氣墊 / 輕薄粉底液",
            action: "薄塗全臉，以指腹輕拍至貼膚",
            errorWarning: "避免塗得太厚而導致脫妝",
            selfCheck: "遠看是否有明顯妝感？不應該有",
          },
          {
            title: "眉毛",
            tool: "眉筆 / 眉粉",
            action: "順著毛流輕描眉形並填補空隙",
            errorWarning: "避免眉頭過重或邊界太硬",
            selfCheck: "兩邊眉毛是否對稱？",
          },
          {
            title: "眼影",
            tool: "大地色 / 奶茶色眼影",
            action: "以單色鋪滿眼窩，再用指腹暈染邊緣",
            errorWarning: "避免選擇亮片過大的顏色",
            selfCheck: "睜眼後是否仍看得到顏色？",
          },
          {
            title: "腮紅",
            tool: "蜜桃色 / 奶茶色腮紅",
            action: "輕掃笑肌最高點，往太陽穴方向暈開",
            errorWarning: "用量宜少不宜多",
            selfCheck: "看起來是否像自然的好氣色？",
          },
          {
            title: "唇妝",
            tool: "唇釉 / 潤唇膏",
            action: "塗在唇部中央，再用指腹向外暈開",
            errorWarning: "通勤妝不建議使用深色唇膏",
            selfCheck: "顏色是否襯膚色？",
          },
          {
            title: "定妝",
            tool: "蜜粉 / 定妝噴霧",
            action: "T 字部位輕撲蜜粉，全臉噴上定妝噴霧",
            selfCheck: "妝面是否清爽不油膩？",
          },
        ],
      },
      "no-makeup": {
        title: "偽素顏教學",
        description: "打造看不出化妝痕跡的自然好膚質",
        steps: [
          {
            title: "妝前保濕",
            tool: "保濕面霜 / 妝前乳",
            action: "全臉薄塗保濕，等待 2 分鐘吸收",
            selfCheck: "肌膚是否有光澤但不油膩？",
          },
          {
            title: "底妝",
            tool: "素顏霜 / 輕薄粉底液",
            action: "少量多次，以美妝蛋輕拍推開",
            errorWarning: "偽素顏妝最忌諱底妝太厚",
            selfCheck: "是否仍隱約看得到毛孔？應該要看得到",
          },
          {
            title: "自然眉",
            tool: "眉粉 / 透明眉膏",
            action: "只填補空隙，再用眉刷梳理毛流",
            selfCheck: "看起來是否像天生的好眉形？",
          },
          {
            title: "奶油腮紅",
            tool: "膏狀腮紅",
            action: "指腹取少量點在笑肌，再輕拍暈開",
            selfCheck: "是否像運動後的自然紅潤？",
          },
          {
            title: "潤唇",
            tool: "有色潤唇膏",
            action: "直接塗抹，打造自然唇色",
          },
          {
            title: "捲翹睫毛",
            tool: "睫毛夾 + 透明睫毛膏",
            action: "夾翹後刷上一層透明睫毛膏定型",
            selfCheck: "眼睛看起來是否更有神？",
          },
        ],
      },
    },
  },
  de: {
    ui: {
      ariaLabel: "Make-up-Tutorial",
      regions: {
        base: "Teint",
        eyes: "Augen",
        brows: "Brauen",
        cheeks: "Rouge",
        lips: "Lippen",
        contour: "Kontur",
      },
      difficulties: {
        beginner: "Anfängerfreundlich",
        intermediate: "Mittel",
        advanced: "Fortgeschritten",
      },
      estimatedMinutes: "Ca. {minutes} Min.",
      stepCount: "{count} Schritte",
      toolLabel: "Produkt",
      warningLabel: "Tipp",
      selfCheckLabel: "Prüfen",
      lockedText: "Alle Schritte mit Pro freischalten",
      remainingSteps:
        "{count} weitere Schritte sind mit Pro oder Premium verfügbar",
      viewPlans: "Tarife ansehen",
    },
    tutorials: {
      commute: {
        title: "Alltags-Make-up fürs Büro",
        description: "Ein frischer, natürlicher Büro-Look in 5 Minuten",
        steps: [
          {
            title: "Teint",
            tool: "Cushion / leichte Foundation",
            action:
              "Dünn im ganzen Gesicht auftragen und mit den Fingerspitzen einklopfen",
            errorWarning:
              "Nicht zu viel auftragen, damit die Foundation nicht fleckig wird",
            selfCheck:
              "Ist der Teint aus der Entfernung kaum sichtbar? So soll es sein",
          },
          {
            title: "Brauen",
            tool: "Brauenstift / Brauenpuder",
            action: "Der Wuchsrichtung folgen und Lücken leicht auffüllen",
            errorWarning:
              "Den Brauenansatz nicht zu dunkel und die Kontur nicht zu hart zeichnen",
            selfCheck: "Wirken beide Brauen ausgeglichen?",
          },
          {
            title: "Lidschatten",
            tool: "Brauner / milchtee-farbener Lidschatten",
            action:
              "Eine Farbe auf dem Lid verteilen und die Ränder mit dem Finger verblenden",
            errorWarning: "Farben mit groben Glitzerpartikeln vermeiden",
            selfCheck: "Ist die Farbe bei geöffneten Augen noch sichtbar?",
          },
          {
            title: "Rouge",
            tool: "Pfirsichfarbenes / milchtee-farbenes Rouge",
            action:
              "Leicht auf die Wangenknochen geben und zu den Schläfen verblenden",
            errorWarning:
              "Mit wenig Produkt beginnen und nur bei Bedarf aufbauen",
            selfCheck: "Sieht es nach natürlicher Frische aus?",
          },
          {
            title: "Lippen",
            tool: "Liptint / Lippenpflege",
            action:
              "In der Lippenmitte auftragen und mit dem Finger nach außen verblenden",
            errorWarning:
              "Sehr dunkle Lippenfarben können für den Büroalltag zu dominant wirken",
            selfCheck: "Passt die Farbe zu deinem Hautton?",
          },
          {
            title: "Fixieren",
            tool: "Loser Puder / Fixierspray",
            action:
              "Die T-Zone leicht abpudern und das Gesicht mit Fixierspray besprühen",
            selfCheck: "Wirkt das Finish frisch statt ölig?",
          },
        ],
      },
      "no-makeup": {
        title: "No-Make-up-Make-up-Tutorial",
        description: "Natürlich schöne Haut ohne sichtbares Make-up",
        steps: [
          {
            title: "Feuchtigkeit",
            tool: "Feuchtigkeitscreme / Primer",
            action: "Dünn im Gesicht auftragen und 2 Minuten einziehen lassen",
            selfCheck: "Strahlt die Haut, ohne ölig zu wirken?",
          },
          {
            title: "Leichte Basis",
            tool: "Tone-up-Creme / leichte Foundation",
            action:
              "In kleinen Mengen auftragen und mit einem Schwämmchen einklopfen",
            errorWarning: "Eine dicke Basis zerstört den No-Make-up-Effekt",
            selfCheck:
              "Sind die Poren noch leicht sichtbar? Das sollten sie sein",
          },
          {
            title: "Natürliche Brauen",
            tool: "Brauenpuder / transparentes Brauengel",
            action: "Nur Lücken auffüllen und die Härchen in Form bürsten",
            selfCheck: "Sehen die Brauen von Natur aus gut geformt aus?",
          },
          {
            title: "Creme-Rouge",
            tool: "Creme-Rouge",
            action: "Eine kleine Menge auf die Wangen tupfen und verblenden",
            selfCheck: "Sieht es wie eine natürliche Röte nach Bewegung aus?",
          },
          {
            title: "Getönte Lippen",
            tool: "Getönte Lippenpflege",
            action:
              "Direkt auftragen, um einen natürlichen Farbton zu erhalten",
          },
          {
            title: "Geschwungene Wimpern",
            tool: "Wimpernzange + transparente Mascara",
            action:
              "Wimpern biegen und mit einer Schicht transparenter Mascara fixieren",
            selfCheck: "Wirken die Augen wacher und ausdrucksvoller?",
          },
        ],
      },
    },
  },
  fr: {
    ui: {
      ariaLabel: "Tutoriel maquillage",
      regions: {
        base: "Teint",
        eyes: "Yeux",
        brows: "Sourcils",
        cheeks: "Blush",
        lips: "Lèvres",
        contour: "Contour",
      },
      difficulties: {
        beginner: "Adapté aux débutants",
        intermediate: "Intermédiaire",
        advanced: "Avancé",
      },
      estimatedMinutes: "Environ {minutes} min",
      stepCount: "{count} étapes",
      toolLabel: "Produit",
      warningLabel: "Conseil",
      selfCheckLabel: "Vérification",
      lockedText: "Débloquez toutes les étapes avec Pro",
      remainingSteps:
        "{count} étapes supplémentaires sont disponibles avec Pro ou Premium",
      viewPlans: "Voir les offres",
    },
    tutorials: {
      commute: {
        title: "Tutoriel maquillage quotidien professionnel",
        description:
          "Un maquillage frais et naturel pour le travail en 5 minutes",
        steps: [
          {
            title: "Teint",
            tool: "Cushion / fond de teint léger",
            action:
              "Appliquez une fine couche sur le visage puis tapotez du bout des doigts",
            errorWarning:
              "Évitez de trop charger pour ne pas faire migrer le teint",
            selfCheck:
              "Le maquillage est-il à peine visible de loin ? Il devrait l’être",
          },
          {
            title: "Sourcils",
            tool: "Crayon / poudre à sourcils",
            action:
              "Suivez le sens des poils et comblez légèrement les espaces",
            errorWarning:
              "Évitez une tête de sourcil trop foncée ou un contour trop net",
            selfCheck: "Les deux sourcils paraissent-ils équilibrés ?",
          },
          {
            title: "Fard à paupières",
            tool: "Fard brun neutre / couleur thé au lait",
            action:
              "Étalez une teinte sur la paupière et estompez les bords au doigt",
            errorWarning: "Évitez les teintes à grosses paillettes",
            selfCheck:
              "La couleur reste-t-elle visible lorsque les yeux sont ouverts ?",
          },
          {
            title: "Blush",
            tool: "Blush pêche / couleur thé au lait",
            action:
              "Balayez le haut des pommettes puis estompez vers les tempes",
            errorWarning:
              "Commencez par peu de produit et intensifiez si nécessaire",
            selfCheck: "Le résultat ressemble-t-il à un éclat naturel ?",
          },
          {
            title: "Lèvres",
            tool: "Encre à lèvres / baume",
            action:
              "Appliquez au centre puis estompez vers l’extérieur avec le doigt",
            errorWarning:
              "Une teinte très foncée peut dominer un maquillage de travail",
            selfCheck: "La couleur met-elle votre carnation en valeur ?",
          },
          {
            title: "Fixation",
            tool: "Poudre libre / spray fixateur",
            action: "Poudrez légèrement la zone T puis vaporisez le fixateur",
            selfCheck: "Le fini est-il frais plutôt que brillant ?",
          },
        ],
      },
      "no-makeup": {
        title: "Tutoriel maquillage effet peau nue",
        description: "Une peau naturellement éclatante sans maquillage visible",
        steps: [
          {
            title: "Hydratation",
            tool: "Crème hydratante / base",
            action: "Appliquez une fine couche et laissez pénétrer 2 minutes",
            selfCheck: "La peau est-elle lumineuse sans être grasse ?",
          },
          {
            title: "Base légère",
            tool: "Crème correctrice / fond de teint léger",
            action:
              "Travaillez par petites quantités en tapotant avec une éponge",
            errorWarning:
              "Un teint trop épais annule immédiatement l’effet peau nue",
            selfCheck:
              "Les pores restent-ils légèrement visibles ? Ils devraient l’être",
          },
          {
            title: "Sourcils naturels",
            tool: "Poudre / gel transparent à sourcils",
            action: "Comblez seulement les espaces puis brossez les poils",
            selfCheck:
              "Les sourcils semblent-ils naturellement bien dessinés ?",
          },
          {
            title: "Blush crème",
            tool: "Blush crème",
            action:
              "Tapotez une petite quantité sur les pommettes puis estompez",
            selfCheck:
              "Le résultat rappelle-t-il une rougeur naturelle après l’effort ?",
          },
          {
            title: "Lèvres teintées",
            tool: "Baume à lèvres teinté",
            action: "Appliquez directement pour une couleur naturelle",
          },
          {
            title: "Cils recourbés",
            tool: "Recourbe-cils + mascara transparent",
            action:
              "Recourbez les cils puis fixez avec une couche de mascara transparent",
            selfCheck: "Le regard paraît-il plus ouvert et éveillé ?",
          },
        ],
      },
    },
  },
  ja: {
    ui: {
      ariaLabel: "メイクチュートリアル",
      regions: {
        base: "ベース",
        eyes: "アイ",
        brows: "眉",
        cheeks: "チーク",
        lips: "リップ",
        contour: "コントゥア",
      },
      difficulties: {
        beginner: "初心者向け",
        intermediate: "中級",
        advanced: "上級",
      },
      estimatedMinutes: "目安 {minutes} 分",
      stepCount: "全 {count} ステップ",
      toolLabel: "使用アイテム",
      warningLabel: "ポイント",
      selfCheckLabel: "セルフチェック",
      lockedText: "Proで全ステップを解除",
      remainingSteps: "残り {count} ステップはProまたはPremiumで閲覧できます",
      viewPlans: "プランを見る",
    },
    tutorials: {
      commute: {
        title: "通勤メイクチュートリアル",
        description: "5分で仕上げる、清潔感のあるナチュラル通勤メイク",
        steps: [
          {
            title: "ベース",
            tool: "クッション / 薄づきファンデーション",
            action:
              "顔全体に薄くのばし、指先でやさしくたたき込んで密着させます",
            errorWarning: "厚塗りは崩れの原因になるため避けましょう",
            selfCheck: "少し離れて見たとき、メイク感がほとんどありませんか？",
          },
          {
            title: "眉",
            tool: "アイブロウペンシル / パウダー",
            action: "毛流れに沿って形を軽く描き、隙間だけを埋めます",
            errorWarning:
              "眉頭を濃くしすぎたり、輪郭をくっきり描きすぎないようにします",
            selfCheck: "左右の眉はバランスよく見えますか？",
          },
          {
            title: "アイシャドウ",
            tool: "ブラウン / ミルクティーカラーのアイシャドウ",
            action: "単色をまぶた全体に広げ、指で境目をぼかします",
            errorWarning: "大粒ラメの色は避けましょう",
            selfCheck: "目を開けた状態でも色が見えますか？",
          },
          {
            title: "チーク",
            tool: "ピーチ / ミルクティーカラーのチーク",
            action: "頬の高い位置に軽くのせ、こめかみに向かってぼかします",
            errorWarning: "少量から始め、必要な分だけ重ねましょう",
            selfCheck: "自然な血色に見えますか？",
          },
          {
            title: "リップ",
            tool: "リップティント / リップバーム",
            action: "唇の中央に塗り、指で外側へぼかします",
            errorWarning: "通勤メイクでは濃すぎる色を避けると自然です",
            selfCheck: "肌色になじむ色ですか？",
          },
          {
            title: "仕上げ",
            tool: "ルースパウダー / フィックスミスト",
            action: "Tゾーンにパウダーを軽くのせ、顔全体にミストを吹きかけます",
            selfCheck: "べたつかず、清潔感のある仕上がりですか？",
          },
        ],
      },
      "no-makeup": {
        title: "すっぴん風メイクチュートリアル",
        description: "メイク感を見せずに、自然にきれいな肌をつくります",
        steps: [
          {
            title: "保湿",
            tool: "保湿クリーム / 化粧下地",
            action: "顔全体に薄く塗り、2分ほどなじませます",
            selfCheck: "肌はツヤがあり、べたついていませんか？",
          },
          {
            title: "薄づきベース",
            tool: "トーンアップクリーム / 薄づきファンデーション",
            action: "少量ずつスポンジでたたき込むように広げます",
            errorWarning: "厚塗りはすっぴん風の仕上がりを損ないます",
            selfCheck: "毛穴がうっすら見えていますか？それが自然です",
          },
          {
            title: "ナチュラル眉",
            tool: "アイブロウパウダー / 透明眉マスカラ",
            action: "隙間だけを埋め、ブラシで毛流れを整えます",
            selfCheck: "生まれつき整った眉のように見えますか？",
          },
          {
            title: "クリームチーク",
            tool: "クリームチーク",
            action: "少量を頬に置き、指でたたくようにぼかします",
            selfCheck: "運動後のような自然な血色ですか？",
          },
          {
            title: "色つきリップ",
            tool: "色つきリップバーム",
            action: "そのまま塗り、自然な唇の色をつくります",
          },
          {
            title: "上向きまつ毛",
            tool: "ビューラー + 透明マスカラ",
            action: "まつ毛を上げ、透明マスカラを一度塗って固定します",
            selfCheck: "目元が明るく、いきいきと見えますか？",
          },
        ],
      },
    },
  },
  ko: {
    ui: {
      ariaLabel: "메이크업 튜토리얼",
      regions: {
        base: "베이스",
        eyes: "아이",
        brows: "브로우",
        cheeks: "블러셔",
        lips: "립",
        contour: "컨투어",
      },
      difficulties: {
        beginner: "초보자용",
        intermediate: "중급",
        advanced: "고급",
      },
      estimatedMinutes: "예상 {minutes}분",
      stepCount: "총 {count}단계",
      toolLabel: "사용 제품",
      warningLabel: "팁",
      selfCheckLabel: "셀프 체크",
      lockedText: "Pro에서 전체 단계 잠금 해제",
      remainingSteps: "나머지 {count}단계는 Pro 또는 Premium에서 볼 수 있어요",
      viewPlans: "요금제 보기",
    },
    tutorials: {
      commute: {
        title: "출근 메이크업 튜토리얼",
        description: "5분 만에 완성하는 산뜻하고 자연스러운 출근 메이크업",
        steps: [
          {
            title: "베이스",
            tool: "쿠션 / 가벼운 파운데이션",
            action: "얼굴 전체에 얇게 바르고 손끝으로 가볍게 두드려 밀착시켜요",
            errorWarning: "너무 두껍게 바르면 쉽게 무너질 수 있어요",
            selfCheck: "멀리서 봤을 때 화장한 티가 거의 나지 않나요?",
          },
          {
            title: "눈썹",
            tool: "아이브로우 펜슬 / 파우더",
            action: "결을 따라 가볍게 모양을 잡고 빈 곳만 채워요",
            errorWarning:
              "눈썹 앞머리를 진하게 하거나 경계를 딱딱하게 그리지 마세요",
            selfCheck: "양쪽 눈썹의 균형이 맞나요?",
          },
          {
            title: "아이섀도",
            tool: "브라운 / 밀크티 컬러 아이섀도",
            action: "한 가지 색을 눈두덩에 펴 바르고 손가락으로 경계를 풀어요",
            errorWarning: "입자가 큰 글리터 컬러는 피하세요",
            selfCheck: "눈을 떴을 때도 색이 보이나요?",
          },
          {
            title: "블러셔",
            tool: "피치 / 밀크티 컬러 블러셔",
            action:
              "볼의 가장 높은 곳에 가볍게 바르고 관자놀이 쪽으로 블렌딩해요",
            errorWarning: "소량부터 시작해 필요한 만큼만 더하세요",
            selfCheck: "자연스럽고 건강한 혈색처럼 보이나요?",
          },
          {
            title: "립",
            tool: "립 틴트 / 립밤",
            action: "입술 중앙에 바른 뒤 손가락으로 바깥쪽까지 펴요",
            errorWarning:
              "출근 메이크업에는 너무 진한 립 컬러를 피하는 것이 좋아요",
            selfCheck: "피부 톤과 잘 어울리는 색인가요?",
          },
          {
            title: "고정",
            tool: "루스 파우더 / 픽서",
            action: "T존에 파우더를 가볍게 누르고 얼굴 전체에 픽서를 뿌려요",
            selfCheck: "번들거리지 않고 산뜻하게 마무리됐나요?",
          },
        ],
      },
      "no-makeup": {
        title: "노메이크업 메이크업 튜토리얼",
        description: "화장한 티 없이 자연스럽고 건강한 피부를 연출해요",
        steps: [
          {
            title: "보습",
            tool: "보습 크림 / 프라이머",
            action: "얼굴 전체에 얇게 바르고 2분간 흡수시켜요",
            selfCheck: "피부에 윤기가 나지만 번들거리지는 않나요?",
          },
          {
            title: "얇은 베이스",
            tool: "톤업 크림 / 가벼운 파운데이션",
            action: "소량씩 여러 번 스펀지로 두드려 펴요",
            errorWarning: "두꺼운 베이스는 노메이크업 효과를 가장 먼저 망쳐요",
            selfCheck: "모공이 은은하게 보이나요? 그래야 자연스러워요",
          },
          {
            title: "자연스러운 눈썹",
            tool: "아이브로우 파우더 / 투명 브로우 젤",
            action: "빈 곳만 채우고 브러시로 결을 정돈해요",
            selfCheck: "원래부터 모양이 좋은 눈썹처럼 보이나요?",
          },
          {
            title: "크림 블러셔",
            tool: "크림 블러셔",
            action: "소량을 볼에 찍고 손끝으로 두드려 펴요",
            selfCheck: "운동 후처럼 자연스러운 혈색인가요?",
          },
          {
            title: "생기 있는 입술",
            tool: "컬러 립밤",
            action: "그대로 발라 자연스러운 입술 색을 만들어요",
          },
          {
            title: "컬링 속눈썹",
            tool: "뷰러 + 투명 마스카라",
            action: "속눈썹을 올린 뒤 투명 마스카라를 한 번 발라 고정해요",
            selfCheck: "눈매가 더 또렷하고 생기 있어 보이나요?",
          },
        ],
      },
    },
  },
  es: {
    ui: {
      ariaLabel: "Tutorial de maquillaje",
      regions: {
        base: "Base",
        eyes: "Ojos",
        brows: "Cejas",
        cheeks: "Rubor",
        lips: "Labios",
        contour: "Contorno",
      },
      difficulties: {
        beginner: "Ideal para principiantes",
        intermediate: "Intermedio",
        advanced: "Avanzado",
      },
      estimatedMinutes: "Aprox. {minutes} min",
      stepCount: "{count} pasos",
      toolLabel: "Producto",
      warningLabel: "Consejo",
      selfCheckLabel: "Comprueba",
      lockedText: "Desbloquea todos los pasos con Pro",
      remainingSteps: "Hay {count} pasos más disponibles con Pro o Premium",
      viewPlans: "Ver planes",
    },
    tutorials: {
      commute: {
        title: "Tutorial de maquillaje diario para el trabajo",
        description: "Un look fresco y natural para trabajar en 5 minutos",
        steps: [
          {
            title: "Base",
            tool: "Cushion / base ligera",
            action:
              "Aplica una capa fina por todo el rostro y presiona suavemente con las yemas",
            errorWarning:
              "Evita aplicar demasiado para que la base no se cuartee",
            selfCheck: "¿La base apenas se nota a distancia? Así debería verse",
          },
          {
            title: "Cejas",
            tool: "Lápiz / polvo de cejas",
            action:
              "Sigue la dirección del vello y rellena ligeramente los espacios",
            errorWarning:
              "Evita marcar demasiado el inicio o crear bordes duros",
            selfCheck: "¿Ambas cejas se ven equilibradas?",
          },
          {
            title: "Sombra",
            tool: "Sombra marrón neutra / color té con leche",
            action:
              "Extiende un tono sobre el párpado y difumina los bordes con el dedo",
            errorWarning: "Evita los tonos con partículas grandes de brillo",
            selfCheck: "¿El color sigue visible con los ojos abiertos?",
          },
          {
            title: "Rubor",
            tool: "Rubor melocotón / color té con leche",
            action:
              "Pásalo suavemente por los pómulos y difumina hacia las sienes",
            errorWarning:
              "Empieza con poco producto y añade solo si hace falta",
            selfCheck: "¿Parece un rubor saludable y natural?",
          },
          {
            title: "Labios",
            tool: "Tinta labial / bálsamo",
            action: "Aplica en el centro y difumina hacia fuera con el dedo",
            errorWarning:
              "Los tonos muy oscuros pueden dominar un look de trabajo",
            selfCheck: "¿El tono favorece tu color de piel?",
          },
          {
            title: "Fijación",
            tool: "Polvo suelto / spray fijador",
            action:
              "Presiona polvo sobre la zona T y rocía fijador por el rostro",
            selfCheck: "¿El acabado se ve fresco en lugar de graso?",
          },
        ],
      },
      "no-makeup": {
        title: "Tutorial de maquillaje efecto cara lavada",
        description:
          "Consigue una piel naturalmente saludable sin maquillaje visible",
        steps: [
          {
            title: "Hidratación",
            tool: "Crema hidratante / prebase",
            action: "Aplica una capa fina y espera 2 minutos a que se absorba",
            selfCheck: "¿La piel se ve luminosa pero no grasa?",
          },
          {
            title: "Base ligera",
            tool: "Crema perfeccionadora / base ligera",
            action: "Usa poca cantidad y extiéndela a toques con una esponja",
            errorWarning:
              "Una base gruesa elimina rápidamente el efecto cara lavada",
            selfCheck: "¿Los poros siguen ligeramente visibles? Así debe ser",
          },
          {
            title: "Cejas naturales",
            tool: "Polvo de cejas / gel transparente",
            action: "Rellena solo los espacios y peina el vello",
            selfCheck: "¿Las cejas parecen naturalmente bien definidas?",
          },
          {
            title: "Rubor en crema",
            tool: "Rubor en crema",
            action:
              "Pon una pequeña cantidad en las mejillas y difumina a toques",
            selfCheck: "¿Parece el rubor natural después de hacer ejercicio?",
          },
          {
            title: "Labios con color",
            tool: "Bálsamo labial con color",
            action: "Aplícalo directamente para conseguir un tono natural",
          },
          {
            title: "Pestañas curvadas",
            tool: "Rizador + máscara transparente",
            action:
              "Riza las pestañas y fíjalas con una capa de máscara transparente",
            selfCheck: "¿La mirada se ve más abierta y despierta?",
          },
        ],
      },
    },
  },
  "pt-BR": {
    ui: {
      ariaLabel: "Tutorial de maquiagem",
      regions: {
        base: "Pele",
        eyes: "Olhos",
        brows: "Sobrancelhas",
        cheeks: "Blush",
        lips: "Lábios",
        contour: "Contorno",
      },
      difficulties: {
        beginner: "Ideal para iniciantes",
        intermediate: "Intermediário",
        advanced: "Avançado",
      },
      estimatedMinutes: "Cerca de {minutes} min",
      stepCount: "{count} etapas",
      toolLabel: "Produto",
      warningLabel: "Dica",
      selfCheckLabel: "Confira",
      lockedText: "Desbloqueie todas as etapas com o Pro",
      remainingSteps: "Mais {count} etapas estão disponíveis no Pro ou Premium",
      viewPlans: "Ver planos",
    },
    tutorials: {
      commute: {
        title: "Tutorial de maquiagem para o trabalho",
        description: "Um visual leve e natural para o trabalho em 5 minutos",
        steps: [
          {
            title: "Pele",
            tool: "Cushion / base leve",
            action:
              "Aplique uma camada fina no rosto e dê leves batidinhas com as pontas dos dedos",
            errorWarning:
              "Evite excesso para a base não acumular nem craquelar",
            selfCheck: "De longe, a base quase não aparece? Esse é o objetivo",
          },
          {
            title: "Sobrancelhas",
            tool: "Lápis / sombra para sobrancelhas",
            action: "Siga o sentido dos fios e preencha levemente as falhas",
            errorWarning:
              "Evite pesar no início da sobrancelha ou marcar demais o contorno",
            selfCheck: "As duas sobrancelhas parecem equilibradas?",
          },
          {
            title: "Sombra",
            tool: "Sombra marrom neutra / cor de chá com leite",
            action:
              "Espalhe uma cor pela pálpebra e esfume as bordas com o dedo",
            errorWarning: "Evite cores com partículas grandes de glitter",
            selfCheck: "A cor ainda aparece quando os olhos estão abertos?",
          },
          {
            title: "Blush",
            tool: "Blush pêssego / cor de chá com leite",
            action: "Passe levemente nas maçãs e esfume em direção às têmporas",
            errorWarning: "Comece com pouco e aumente apenas se necessário",
            selfCheck: "Parece um rubor natural e saudável?",
          },
          {
            title: "Lábios",
            tool: "Lip tint / hidratante labial",
            action: "Aplique no centro e espalhe para fora com o dedo",
            errorWarning:
              "Tons muito escuros podem pesar na maquiagem de trabalho",
            selfCheck: "A cor valoriza o seu tom de pele?",
          },
          {
            title: "Fixação",
            tool: "Pó solto / spray fixador",
            action: "Pressione o pó na zona T e borrife o fixador no rosto",
            selfCheck: "O acabamento está leve em vez de oleoso?",
          },
        ],
      },
      "no-makeup": {
        title: "Tutorial de maquiagem efeito natural",
        description: "Crie uma pele naturalmente bonita sem maquiagem aparente",
        steps: [
          {
            title: "Hidratação",
            tool: "Hidratante / primer",
            action: "Aplique uma camada fina e espere 2 minutos para absorver",
            selfCheck: "A pele está luminosa sem parecer oleosa?",
          },
          {
            title: "Base suave",
            tool: "Creme tonalizante / base leve",
            action:
              "Use pequenas quantidades e espalhe com batidinhas de esponja",
            errorWarning: "Uma camada grossa tira rapidamente o efeito natural",
            selfCheck:
              "Os poros continuam levemente visíveis? Eles devem ficar",
          },
          {
            title: "Sobrancelhas naturais",
            tool: "Sombra / gel transparente para sobrancelhas",
            action: "Preencha apenas as falhas e penteie os fios",
            selfCheck: "As sobrancelhas parecem naturalmente bem desenhadas?",
          },
          {
            title: "Blush cremoso",
            tool: "Blush cremoso",
            action:
              "Aplique uma pequena quantidade nas maçãs e esfume com batidinhas",
            selfCheck: "Parece um rubor natural depois de se exercitar?",
          },
          {
            title: "Lábios com cor",
            tool: "Hidratante labial com cor",
            action: "Aplique diretamente para obter uma cor natural",
          },
          {
            title: "Cílios curvados",
            tool: "Curvex + máscara transparente",
            action:
              "Curve os cílios e fixe com uma camada de máscara transparente",
            selfCheck: "Os olhos parecem mais abertos e despertos?",
          },
        ],
      },
    },
  },
};

const languageByLocale: Record<AppLocale, TutorialLanguage> = {
  en: "en",
  "zh-CN": "zh-CN",
  "zh-TW": "zh-TW",
  "de-DE": "de",
  "fr-FR": "fr",
  "ja-JP": "ja",
  "ko-KR": "ko",
  "es-ES": "es",
  "es-419": "es",
  "pt-BR": "pt-BR",
};

function getLocaleContent(locale: AppLocale): TutorialLocaleContent {
  return localeContent[languageByLocale[locale] ?? "en"];
}

export function getTutorialUiCopy(locale: AppLocale): TutorialUiCopy {
  return getLocaleContent(locale).ui;
}

export function getTutorialByLookSlug(
  lookSlug: string,
  locale: AppLocale = "en",
): Tutorial | undefined {
  if (lookSlug !== "commute" && lookSlug !== "no-makeup") return undefined;

  const localized = getLocaleContent(locale).tutorials[lookSlug];
  const blueprints = stepBlueprints[lookSlug];
  const meta = tutorialMeta[lookSlug];

  return {
    id: meta.id,
    lookSlug,
    title: localized.title,
    description: localized.description,
    difficulty: "beginner",
    estimatedMinutes: meta.estimatedMinutes,
    steps: localized.steps.map((step, index) => {
      const blueprint = blueprints[index];
      return {
        ...step,
        order: index + 1,
        region: blueprint.region,
        premiumOnly:
          "premiumOnly" in blueprint ? blueprint.premiumOnly : undefined,
      };
    }),
  };
}
