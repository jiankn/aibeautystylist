import type { AppLocale } from "../i18n/config";
import type { PlanCode } from "../lib/plans";

type TextPair = [string, string];
type TextTriple = [string, string, string];

interface PlanContent {
  badge: string;
  audience: string;
  reason: string;
  features: string[];
}

export interface LocalizedPricingContent {
  featureText: {
    yes: string;
    no: string;
    freeCta: string;
    upgradeCta: string;
    manageCta: string;
    currentPlan: string;
  };
  copy: {
    kicker: string;
    billingMonthly: string;
    billingYearly: string;
    yearlySave: string;
    included: string;
    monthlyUnit: string;
    yearlyUnit: string;
    popular: string;
    premiumRibbon: string;
    decisionHelperTitle: string;
    decisionHelperLead: string;
    decisionHelperItems: TextPair[];
    heroPoints: TextPair[];
    planContent: Record<PlanCode, PlanContent>;
    proofKicker: string;
    proofTitle: string;
    proofSubtitle: string;
    proofCta: string;
    proof: TextTriple[];
    compareTitle: string;
    compareSubtitle: string;
    mobileCompareTitle: string;
    mobileCompareSubtitle: string;
    mobileCompareCredits: string;
    mobileCompareDetails: string;
    mobilePlanCta: Record<PlanCode, string>;
    faqTitle: string;
    faq: TextPair[];
    policyTitle: string;
    policyText: string;
    policyKicker: string;
    policyFacts: TextPair[];
    policySupportLead: string;
    policySupportCta: string;
    checkoutTitle: string;
    checkoutCopy: string;
    checkoutCancel: string;
    checkoutConfirm: string;
    toastBillingMissing: string;
    toastCheckoutFailed: string;
    toastPortalFailed: string;
    checkoutSuccess: string;
    checkoutCancelNotice: string;
  };
  comparisonLabels: {
    credits: string;
    diagnosis: string;
    tryon: string;
    hd: string;
    tutorials: string;
    priority: string;
    history: string;
    catalog: string;
  };
}

const de: LocalizedPricingContent = {
  featureText: {
    yes: "Enthalten",
    no: "Nicht enthalten",
    freeCta: "Kostenlos starten",
    upgradeCta: "Upgrade wählen",
    manageCta: "Abo verwalten",
    currentPlan: "Aktueller Plan",
  },
  copy: {
    kicker: "Pläne",
    billingMonthly: "Monatlich",
    billingYearly: "Jährlich",
    yearlySave: "2 Monate sparen",
    included: "Enthalten",
    monthlyUnit: "/ Monat",
    yearlyUnit: "/ Jahr",
    popular: "Bestes Preis-Leistungs-Verhältnis",
    premiumRibbon: "Für häufige Nutzung",
    decisionHelperTitle: "Welcher Plan passt zu dir?",
    decisionHelperLead:
      "Für regelmäßige Nutzung ist Pro meist der beste Start.",
    decisionHelperItems: [
      ["Free", "Zum Prüfen von Ablauf und Ergebnisqualität."],
      ["Pro", "Für wöchentliche Try-ons, Diagnosen und HD-Downloads."],
      ["Premium", "Für Tempo, vollständigen Katalog und längere Historie."],
    ],
    heroPoints: [
      [
        "Ein Credit-Modell",
        "Eine Diagnose oder ein Try-on nutzt einen Credit.",
      ],
      [
        "Erstattung bei Fehlern",
        "Fehlgeschlagene, abgebrochene oder zeitüberschrittene Aufgaben werden automatisch erstattet.",
      ],
      [
        "Jederzeit kündbar",
        "Die Vorteile bleiben bis zum Ende des bezahlten Zeitraums aktiv.",
      ],
    ],
    planContent: {
      free: {
        badge: "Test",
        audience: "Für den ersten Produkttest",
        reason: "Prüfe kostenlos, ob Ablauf und Bildqualität zu dir passen.",
        features: [
          "3 Credits pro Monat",
          "Diagnose und Try-on verfügbar",
          "Standard-Vorschau",
          "Täglicher Share-Bonus",
        ],
      },
      pro: {
        badge: "Am praktischsten",
        audience: "Für regelmäßige Alltags-Looks",
        reason:
          "Genug Credits für wöchentliche Tests, Diagnosen und HD-Ergebnisse.",
        features: [
          "70 Credits pro Monat",
          "HD-Downloads",
          "Detaillierte Make-up-Anleitungen",
          "Mehrere Anlässe vergleichen",
        ],
      },
      premium: {
        badge: "Komplett",
        audience: "Für häufige Nutzung und Beauty-Exploration",
        reason:
          "Für schnelle Iterationen, mehr gespeicherten Kontext und vollen Look-Zugang.",
        features: [
          "150 Credits pro Monat",
          "Prioritätswarteschlange",
          "Langfristige Historie",
          "Vollständiger Look-Katalog",
          "HD-Downloads und Anleitungen",
        ],
      },
    },
    proofKicker: "Mehr Nutzen durch Upgrade",
    proofTitle: "Weniger Fehlkäufe durch bessere Vergleiche",
    proofSubtitle:
      "Entscheidend ist, wie viele Optionen du vergleichen, speichern und später wiederverwenden kannst.",
    proofCta: "Alle Planunterschiede ansehen",
    proof: [
      [
        "Vergleichbare Optionen",
        "3 → 70 → 150 Credits / Monat",
        "Vom ersten Test bis zum Vergleich mehrerer Looks und Anlässe.",
      ],
      [
        "Nutzbare Ergebnisse",
        "Standard-Vorschau → HD und Anleitungen",
        "Speichere Ergebnisse und setze den Look leichter um.",
      ],
      [
        "Generierung und Historie",
        "Standard → Priorität und Langzeit-Historie",
        "Premium unterstützt häufige Tests und Event-Vorbereitung.",
      ],
    ],
    compareTitle: "Pläne vergleichen",
    compareSubtitle: "Für alle Generierungen gelten dieselben Credit-Regeln.",
    mobileCompareTitle: "Nach Nutzungshäufigkeit wählen",
    mobileCompareSubtitle:
      "Wähle zuerst den passenden Plan und öffne Details nur bei Bedarf.",
    mobileCompareCredits: "Credits / Monat",
    mobileCompareDetails: "Alle Funktionen vergleichen",
    mobilePlanCta: {
      free: "Kostenlos starten",
      pro: "Pro wählen",
      premium: "Premium wählen",
    },
    faqTitle: "Fragen vor dem Upgrade",
    faq: [
      [
        "Kann ich nach dem Abschluss kündigen?",
        "Ja. Die Vorteile bleiben bis zum Ende des laufenden Abrechnungszeitraums aktiv.",
      ],
      [
        "Haben Diagnosen eigene Credits?",
        "Nein. Diagnose und Try-on nutzen dieselben monatlichen Credits.",
      ],
      [
        "Was passiert bei einer fehlgeschlagenen Generierung?",
        "Fehlgeschlagene, abgebrochene oder zeitüberschrittene Aufgaben erstatten den reservierten Credit automatisch.",
      ],
      [
        "Darf ich Downloads kommerziell nutzen?",
        "Standardmäßig ist die persönliche Nutzung erlaubt. Kommerzielle Nutzung benötigt eine separate Freigabe.",
      ],
    ],
    policyTitle: "Abrechnung und Regeln",
    policyText:
      "Abos verlängern sich automatisch. Du kannst im Kundenportal kündigen. Bezahlte Gebühren werden nicht erstattet; eine Kündigung verhindert die nächste Verlängerung.",
    policyKicker: "Klare Abrechnung",
    policyFacts: [
      [
        "Verlängerung",
        "Automatische Verlängerung im gewählten Abrechnungszeitraum",
      ],
      [
        "Nach der Kündigung",
        "Vorteile bleiben bis zum Ende des bezahlten Zeitraums aktiv",
      ],
      ["Erstattung", "Bezahlte Abogebühren werden nicht erstattet"],
    ],
    policySupportLead: "Noch Fragen zu Abrechnung oder Kündigung?",
    policySupportCta: "Support kontaktieren",
    checkoutTitle: "Abo bestätigen",
    checkoutCopy:
      "Du wirst zu Stripe Checkout weitergeleitet. Das Abo verlängert sich automatisch im gewählten Zeitraum.",
    checkoutCancel: "Abbrechen",
    checkoutConfirm: "Weiter zur Zahlung",
    toastBillingMissing: "Die Zahlungsfunktion ist noch nicht konfiguriert.",
    toastCheckoutFailed:
      "Checkout konnte nicht gestartet werden. Bitte später erneut versuchen.",
    toastPortalFailed: "Die Aboverwaltung konnte nicht geöffnet werden.",
    checkoutSuccess:
      "Zahlung abgeschlossen. Die Aktualisierung des Plans kann kurz dauern.",
    checkoutCancelNotice: "Checkout wurde abgebrochen.",
  },
  comparisonLabels: {
    credits: "Monatliche Credits",
    diagnosis: "KI-Diagnose nutzt Credits",
    tryon: "KI-Try-on nutzt Credits",
    hd: "HD-Download",
    tutorials: "Make-up-Anleitungen",
    priority: "Prioritätswarteschlange",
    history: "Langfristige Historie",
    catalog: "Vollständiger Look-Katalog",
  },
};

const fr: LocalizedPricingContent = {
  featureText: {
    yes: "Inclus",
    no: "Non inclus",
    freeCta: "Commencer gratuitement",
    upgradeCta: "Choisir l’offre",
    manageCta: "Gérer l’abonnement",
    currentPlan: "Offre actuelle",
  },
  copy: {
    kicker: "Offres",
    billingMonthly: "Mensuel",
    billingYearly: "Annuel",
    yearlySave: "Économisez 2 mois",
    included: "Inclus",
    monthlyUnit: "/ mois",
    yearlyUnit: "/ an",
    popular: "Meilleur rapport qualité-prix",
    premiumRibbon: "Pour un usage fréquent",
    decisionHelperTitle: "Quelle offre vous convient ?",
    decisionHelperLead: "Pro est généralement le meilleur point de départ.",
    decisionHelperItems: [
      ["Free", "Pour valider le parcours et la qualité des résultats."],
      [
        "Pro",
        "Pour les essais hebdomadaires, diagnostics et téléchargements HD.",
      ],
      [
        "Premium",
        "Pour la vitesse, le catalogue complet et un historique plus long.",
      ],
    ],
    heroPoints: [
      [
        "Un seul système de crédits",
        "Un diagnostic ou un essai utilise un crédit.",
      ],
      [
        "Crédit rendu en cas d’échec",
        "Les tâches échouées, annulées ou expirées sont remboursées automatiquement.",
      ],
      [
        "Résiliation à tout moment",
        "Les avantages restent actifs jusqu’à la fin de la période payée.",
      ],
    ],
    planContent: {
      free: {
        badge: "Essai",
        audience: "Pour découvrir le produit",
        reason:
          "Vérifiez gratuitement si le parcours et la qualité d’image vous conviennent.",
        features: [
          "3 crédits par mois",
          "Diagnostic et essai disponibles",
          "Aperçu standard",
          "Bonus quotidien après partage",
        ],
      },
      pro: {
        badge: "Le plus utile",
        audience: "Pour créer régulièrement des looks",
        reason:
          "Assez de crédits pour des essais hebdomadaires, des diagnostics et la HD.",
        features: [
          "70 crédits par mois",
          "Téléchargements HD",
          "Tutoriels détaillés",
          "Comparaison de plusieurs occasions",
        ],
      },
      premium: {
        badge: "Complet",
        audience: "Pour les utilisatrices fréquentes et créatrices",
        reason:
          "Pour itérer plus vite, conserver plus de contexte et accéder à tous les looks.",
        features: [
          "150 crédits par mois",
          "File prioritaire",
          "Historique longue durée",
          "Catalogue complet",
          "Téléchargements HD et tutoriels",
        ],
      },
    },
    proofKicker: "L’expérience après mise à niveau",
    proofTitle: "Réduisez les essais inutiles avant de choisir",
    proofSubtitle:
      "La différence tient au nombre d’options comparables, à la qualité des résultats et au contexte conservé.",
    proofCta: "Voir la comparaison complète",
    proof: [
      [
        "Options à comparer",
        "3 → 70 → 150 crédits / mois",
        "Passez d’un premier test à la comparaison de plusieurs looks.",
      ],
      [
        "Résultats utilisables",
        "Aperçu standard → HD et tutoriels",
        "Conservez les résultats utiles et reproduisez plus facilement le look.",
      ],
      [
        "Génération et historique",
        "Standard → priorité et historique long",
        "Premium facilite les essais fréquents et la préparation d’événements.",
      ],
    ],
    compareTitle: "Comparer les offres",
    compareSubtitle:
      "Toutes les générations suivent les mêmes règles de crédits.",
    mobileCompareTitle: "Choisir selon votre fréquence d’essai",
    mobileCompareSubtitle:
      "Commencez par l’offre adaptée, puis ouvrez le détail si nécessaire.",
    mobileCompareCredits: "Crédits / mois",
    mobileCompareDetails: "Comparer toutes les fonctions",
    mobilePlanCta: {
      free: "Commencer gratuitement",
      pro: "Choisir Pro",
      premium: "Choisir Premium",
    },
    faqTitle: "Questions avant de choisir",
    faq: [
      [
        "Puis-je résilier après l’abonnement ?",
        "Oui. Les avantages restent actifs jusqu’à la fin de la période de facturation en cours.",
      ],
      [
        "Les diagnostics utilisent-ils des crédits séparés ?",
        "Non. Le diagnostic et l’essai utilisent les mêmes crédits mensuels.",
      ],
      [
        "Que se passe-t-il si la génération échoue ?",
        "Les tâches échouées, annulées ou expirées rendent automatiquement le crédit réservé.",
      ],
      [
        "Puis-je utiliser les images à des fins commerciales ?",
        "L’usage personnel est autorisé par défaut. L’usage commercial nécessite une autorisation distincte.",
      ],
    ],
    policyTitle: "Facturation et conditions",
    policyText:
      "Les abonnements se renouvellent automatiquement. Vous pouvez résilier depuis le portail client. Les montants payés ne sont pas remboursés, mais la résiliation empêche le prochain renouvellement.",
    policyKicker: "Facturation transparente",
    policyFacts: [
      ["Renouvellement", "Renouvellement automatique selon le cycle choisi"],
      [
        "Après résiliation",
        "Les avantages restent actifs jusqu’à la fin de la période payée",
      ],
      [
        "Remboursements",
        "Les frais d’abonnement déjà payés ne sont pas remboursés",
      ],
    ],
    policySupportLead: "Une question sur la facturation ou la résiliation ?",
    policySupportCta: "Contacter l’assistance",
    checkoutTitle: "Confirmer l’abonnement",
    checkoutCopy:
      "Vous serez redirigé vers Stripe Checkout. L’abonnement se renouvelle automatiquement selon le cycle choisi.",
    checkoutCancel: "Annuler",
    checkoutConfirm: "Continuer vers le paiement",
    toastBillingMissing: "La facturation n’est pas encore configurée.",
    toastCheckoutFailed:
      "Impossible de lancer le paiement. Réessayez plus tard.",
    toastPortalFailed: "Impossible d’ouvrir la gestion de l’abonnement.",
    checkoutSuccess:
      "Paiement terminé. La mise à jour de l’offre peut prendre un moment.",
    checkoutCancelNotice: "Le paiement a été annulé.",
  },
  comparisonLabels: {
    credits: "Crédits mensuels",
    diagnosis: "Le diagnostic IA utilise des crédits",
    tryon: "L’essai IA utilise des crédits",
    hd: "Téléchargement HD",
    tutorials: "Tutoriels maquillage",
    priority: "File prioritaire",
    history: "Historique longue durée",
    catalog: "Catalogue complet",
  },
};

const ja: LocalizedPricingContent = {
  featureText: {
    yes: "含まれる",
    no: "含まれない",
    freeCta: "無料で始める",
    upgradeCta: "プランを選ぶ",
    manageCta: "サブスクリプションを管理",
    currentPlan: "現在のプラン",
  },
  copy: {
    kicker: "料金プラン",
    billingMonthly: "月払い",
    billingYearly: "年払い",
    yearlySave: "2か月分お得",
    included: "含まれる機能",
    monthlyUnit: "/ 月",
    yearlyUnit: "/ 年",
    popular: "おすすめ",
    premiumRibbon: "高頻度利用向け",
    decisionHelperTitle: "どのプランが合うか迷っていますか？",
    decisionHelperLead: "定期的に使うなら、まず Pro がおすすめです。",
    decisionHelperItems: [
      ["Free", "操作の流れと結果品質を確認するためのプランです。"],
      ["Pro", "週ごとの試着、診断、HD保存に適しています。"],
      ["Premium", "速度、全カタログ、長期履歴が必要な方向けです。"],
    ],
    heroPoints: [
      ["共通クレジット", "診断または試着1回につき1クレジットを使用します。"],
      [
        "失敗時は返却",
        "失敗、タイムアウト、キャンセル時は自動で返却されます。",
      ],
      [
        "いつでも解約可能",
        "解約後も支払済み期間の終了まで特典を利用できます。",
      ],
    ],
    planContent: {
      free: {
        badge: "お試し",
        audience: "初めて製品を確認する方",
        reason: "AIの流れと画像品質が自分に合うか無料で確認できます。",
        features: [
          "月3クレジット",
          "AI診断と試着を利用可能",
          "標準プレビュー品質",
          "シェアによる毎日の追加クレジット",
        ],
      },
      pro: {
        badge: "使いやすい",
        audience: "日常メイクを定期的に試す方",
        reason: "週ごとの比較、診断、HD結果に十分なクレジットです。",
        features: [
          "月70クレジット",
          "HDダウンロード",
          "詳しいメイク手順",
          "複数シーンの比較に最適",
        ],
      },
      premium: {
        badge: "フル機能",
        audience: "高頻度利用や美容探索をする方",
        reason: "すばやい比較、より長い履歴、全ルックへのアクセス向けです。",
        features: [
          "月150クレジット",
          "優先キュー",
          "長期履歴",
          "全ルックカタログ",
          "HDダウンロードと手順",
        ],
      },
    },
    proofKicker: "アップグレード後の体験",
    proofTitle: "比較を増やしてメイク選びの失敗を減らす",
    proofSubtitle:
      "比較できる数、結果の使いやすさ、保存できる履歴がプランごとの主な違いです。",
    proofCta: "プラン比較をすべて見る",
    proof: [
      [
        "比較できる回数",
        "3 → 70 → 150 クレジット / 月",
        "1回の確認から複数シーンの比較へ広げられます。",
      ],
      [
        "活用できる結果",
        "標準プレビュー → HDと手順",
        "結果を保存し、実際のメイクで再現しやすくなります。",
      ],
      [
        "生成と履歴",
        "標準 → 優先処理と長期履歴",
        "Premiumは高頻度の比較やイベント準備に適しています。",
      ],
    ],
    compareTitle: "プラン比較",
    compareSubtitle: "すべての生成機能で同じクレジットルールを使用します。",
    mobileCompareTitle: "試着頻度でプランを選ぶ",
    mobileCompareSubtitle:
      "最適なプランから確認し、必要な場合だけ詳細を開いてください。",
    mobileCompareCredits: "月間クレジット",
    mobileCompareDetails: "すべての機能を比較",
    mobilePlanCta: {
      free: "無料で始める",
      pro: "Proを選ぶ",
      premium: "Premiumを選ぶ",
    },
    faqTitle: "アップグレード前の質問",
    faq: [
      [
        "契約後に解約できますか？",
        "はい。現在の請求期間が終わるまで特典を利用できます。",
      ],
      [
        "診断用クレジットは別ですか？",
        "いいえ。診断と試着は同じ月間クレジットを使用します。",
      ],
      [
        "生成に失敗した場合は？",
        "失敗、タイムアウト、キャンセルされたタスクは予約クレジットを自動返却します。",
      ],
      [
        "画像を商用利用できますか？",
        "標準では個人利用に対応しています。商用利用には別途許可が必要です。",
      ],
    ],
    policyTitle: "請求と利用条件",
    policyText:
      "サブスクリプションは自動更新されます。カスタマーポータルからいつでも解約できます。支払済み料金は返金されませんが、解約すると次回更新は行われません。",
    policyKicker: "明確な請求ルール",
    policyFacts: [
      ["更新", "選択した請求周期で自動更新"],
      ["解約後", "支払済み期間の終了まで特典を利用可能"],
      ["返金", "支払済みサブスクリプション料金は返金対象外"],
    ],
    policySupportLead: "請求や解約について質問がありますか？",
    policySupportCta: "サポートに連絡",
    checkoutTitle: "サブスクリプションを確認",
    checkoutCopy:
      "Stripe Checkoutへ移動します。選択した請求周期で自動更新されます。",
    checkoutCancel: "キャンセル",
    checkoutConfirm: "支払いへ進む",
    toastBillingMissing: "請求機能はまだ設定されていません。",
    toastCheckoutFailed: "支払いを開始できません。後でもう一度お試しください。",
    toastPortalFailed: "サブスクリプション管理を開けません。",
    checkoutSuccess:
      "支払いが完了しました。プラン反映まで少し時間がかかる場合があります。",
    checkoutCancelNotice: "支払いをキャンセルしました。",
  },
  comparisonLabels: {
    credits: "月間クレジット",
    diagnosis: "AI診断でクレジットを使用",
    tryon: "AI試着でクレジットを使用",
    hd: "HDダウンロード",
    tutorials: "メイク手順",
    priority: "優先キュー",
    history: "長期履歴",
    catalog: "全ルックカタログ",
  },
};

const ko: LocalizedPricingContent = {
  featureText: {
    yes: "포함",
    no: "미포함",
    freeCta: "무료로 시작",
    upgradeCta: "플랜 선택",
    manageCta: "구독 관리",
    currentPlan: "현재 플랜",
  },
  copy: {
    kicker: "요금제",
    billingMonthly: "월간",
    billingYearly: "연간",
    yearlySave: "2개월 절약",
    included: "포함 기능",
    monthlyUnit: "/ 월",
    yearlyUnit: "/ 년",
    popular: "가장 합리적인 선택",
    premiumRibbon: "자주 사용하는 분께",
    decisionHelperTitle: "어떤 플랜이 맞는지 고민되나요?",
    decisionHelperLead: "정기적으로 사용한다면 Pro부터 시작해 보세요.",
    decisionHelperItems: [
      ["Free", "사용 흐름과 결과 품질을 확인하는 용도입니다."],
      ["Pro", "주간 체험, 진단, HD 다운로드에 적합합니다."],
      ["Premium", "속도, 전체 카탈로그, 긴 기록이 필요할 때 적합합니다."],
    ],
    heroPoints: [
      [
        "하나의 크레딧 체계",
        "진단 또는 가상 메이크업 1회에 크레딧 1개를 사용합니다.",
      ],
      ["실패 시 반환", "실패, 시간 초과, 취소된 작업은 자동으로 반환됩니다."],
      ["언제든 해지", "해지 후에도 결제 기간 종료까지 혜택이 유지됩니다."],
    ],
    planContent: {
      free: {
        badge: "체험",
        audience: "처음 제품을 확인하는 사용자",
        reason: "AI 흐름과 이미지 품질이 맞는지 무료로 확인하세요.",
        features: [
          "월 3 크레딧",
          "AI 진단과 가상 메이크업 사용",
          "표준 미리보기 품질",
          "공유 시 일일 추가 크레딧",
        ],
      },
      pro: {
        badge: "실용적",
        audience: "일상 룩을 정기적으로 만드는 사용자",
        reason: "주간 비교, 진단, HD 결과에 충분한 크레딧을 제공합니다.",
        features: [
          "월 70 크레딧",
          "HD 다운로드",
          "상세 메이크업 튜토리얼",
          "여러 상황 비교에 적합",
        ],
      },
      premium: {
        badge: "전체 기능",
        audience: "고빈도 사용자와 뷰티 탐색 사용자",
        reason: "빠른 반복, 더 긴 기록, 전체 룩 접근을 위한 플랜입니다.",
        features: [
          "월 150 크레딧",
          "우선 처리",
          "장기 기록",
          "전체 룩 카탈로그",
          "HD 다운로드와 튜토리얼",
        ],
      },
    },
    proofKicker: "업그레이드 경험",
    proofTitle: "비교를 늘려 시행착오를 줄이세요",
    proofSubtitle:
      "비교 가능한 선택지, 결과 활용도, 저장되는 기록이 플랜의 핵심 차이입니다.",
    proofCta: "전체 플랜 비교 보기",
    proof: [
      [
        "비교 가능한 횟수",
        "3 → 70 → 150 크레딧 / 월",
        "한 번의 확인에서 여러 상황과 룩 비교로 확장합니다.",
      ],
      [
        "활용 가능한 결과",
        "표준 미리보기 → HD와 튜토리얼",
        "유용한 결과를 저장하고 실제 메이크업으로 재현하세요.",
      ],
      [
        "생성과 기록",
        "표준 → 우선 처리와 장기 기록",
        "Premium은 잦은 비교와 행사 준비에 적합합니다.",
      ],
    ],
    compareTitle: "플랜 비교",
    compareSubtitle: "모든 생성 기능은 같은 크레딧 규칙을 따릅니다.",
    mobileCompareTitle: "사용 빈도에 맞춰 선택",
    mobileCompareSubtitle:
      "가장 적합한 플랜부터 보고 필요할 때 상세 기능을 펼치세요.",
    mobileCompareCredits: "월간 크레딧",
    mobileCompareDetails: "전체 기능 비교",
    mobilePlanCta: {
      free: "무료로 시작",
      pro: "Pro 선택",
      premium: "Premium 선택",
    },
    faqTitle: "업그레이드 전 질문",
    faq: [
      [
        "구독 후 해지할 수 있나요?",
        "네. 현재 결제 기간이 끝날 때까지 혜택이 유지됩니다.",
      ],
      [
        "진단 크레딧은 별도인가요?",
        "아니요. 진단과 가상 메이크업은 같은 월간 크레딧을 사용합니다.",
      ],
      [
        "생성에 실패하면 어떻게 되나요?",
        "실패, 시간 초과, 취소된 작업은 예약 크레딧을 자동으로 반환합니다.",
      ],
      [
        "다운로드 이미지를 상업적으로 사용할 수 있나요?",
        "기본적으로 개인 사용을 지원하며 상업적 사용에는 별도 허가가 필요합니다.",
      ],
    ],
    policyTitle: "결제 및 정책",
    policyText:
      "구독은 자동 갱신됩니다. 고객 포털에서 언제든 해지할 수 있습니다. 이미 결제된 금액은 환불되지 않지만 해지하면 다음 갱신이 중단됩니다.",
    policyKicker: "명확한 결제 규칙",
    policyFacts: [
      ["갱신", "선택한 결제 주기에 따라 자동 갱신"],
      ["해지 후", "결제 기간 종료까지 혜택 유지"],
      ["환불", "이미 결제된 구독 요금은 환불되지 않음"],
    ],
    policySupportLead: "결제나 해지에 대해 궁금한 점이 있나요?",
    policySupportCta: "지원팀 문의",
    checkoutTitle: "구독 확인",
    checkoutCopy:
      "Stripe Checkout으로 이동합니다. 선택한 결제 주기에 따라 구독이 자동 갱신됩니다.",
    checkoutCancel: "취소",
    checkoutConfirm: "결제로 이동",
    toastBillingMissing: "결제 기능이 아직 설정되지 않았습니다.",
    toastCheckoutFailed: "결제를 시작할 수 없습니다. 잠시 후 다시 시도하세요.",
    toastPortalFailed: "구독 관리 페이지를 열 수 없습니다.",
    checkoutSuccess:
      "결제가 완료되었습니다. 플랜 반영에 잠시 시간이 걸릴 수 있습니다.",
    checkoutCancelNotice: "결제가 취소되었습니다.",
  },
  comparisonLabels: {
    credits: "월간 크레딧",
    diagnosis: "AI 진단 크레딧 사용",
    tryon: "가상 메이크업 크레딧 사용",
    hd: "HD 다운로드",
    tutorials: "메이크업 튜토리얼",
    priority: "우선 처리",
    history: "장기 기록",
    catalog: "전체 룩 카탈로그",
  },
};

const zhTW: LocalizedPricingContent = {
  featureText: {
    yes: "包含",
    no: "不包含",
    freeCta: "免費開始",
    upgradeCta: "選擇方案",
    manageCta: "管理訂閱",
    currentPlan: "目前方案",
  },
  copy: {
    kicker: "會員方案",
    billingMonthly: "月繳",
    billingYearly: "年繳",
    yearlySave: "省 2 個月",
    included: "包含功能",
    monthlyUnit: "/ 月",
    yearlyUnit: "/ 年",
    popular: "最推薦",
    premiumRibbon: "適合高頻使用",
    decisionHelperTitle: "不確定選哪個方案？",
    decisionHelperLead: "一般定期使用者可先從 Pro 開始。",
    decisionHelperItems: [
      ["Free", "用來確認操作流程與結果品質。"],
      ["Pro", "適合每週試妝、診斷與 HD 下載。"],
      ["Premium", "適合需要速度、完整妝容庫與長期紀錄。"],
    ],
    heroPoints: [
      ["統一點數", "一次診斷或一次試妝使用 1 點。"],
      ["失敗返還", "失敗、逾時或取消的任務會自動返還點數。"],
      ["隨時取消", "取消後權益保留至已付費週期結束。"],
    ],
    planContent: {
      free: {
        badge: "體驗",
        audience: "第一次確認產品的使用者",
        reason: "免費確認 AI 流程與圖片品質是否適合你。",
        features: [
          "每月 3 點",
          "可使用 AI 診斷與試妝",
          "標準預覽品質",
          "每日分享可獲額外點數",
        ],
      },
      pro: {
        badge: "實用",
        audience: "定期探索日常妝容的使用者",
        reason: "足夠每週比較、診斷並保存 HD 結果。",
        features: ["每月 70 點", "HD 下載", "詳細彩妝教學", "適合比較多種情境"],
      },
      premium: {
        badge: "完整",
        audience: "高頻試妝與彩妝探索使用者",
        reason: "適合快速比較、更長紀錄與完整妝容庫。",
        features: [
          "每月 150 點",
          "優先佇列",
          "長期紀錄",
          "完整妝容庫",
          "HD 下載與教學",
        ],
      },
    },
    proofKicker: "升級後的體驗",
    proofTitle: "增加比較，減少反覆試錯",
    proofSubtitle: "方案差異在於可比較次數、結果用途與可保留的紀錄。",
    proofCta: "查看完整方案比較",
    proof: [
      [
        "可比較次數",
        "3 → 70 → 150 點 / 月",
        "從確認一次結果到比較多種情境與妝容。",
      ],
      [
        "可使用結果",
        "標準預覽 → HD 與教學",
        "保存有用結果並轉化為可實際重現的妝容。",
      ],
      [
        "生成與紀錄",
        "標準 → 優先與長期紀錄",
        "Premium 適合高頻嘗試與活動準備。",
      ],
    ],
    compareTitle: "方案比較",
    compareSubtitle: "所有生成功能都遵循相同點數規則。",
    mobileCompareTitle: "依試妝頻率選擇",
    mobileCompareSubtitle: "先看最適合的方案，需要時再展開完整功能。",
    mobileCompareCredits: "每月點數",
    mobileCompareDetails: "比較全部功能",
    mobilePlanCta: {
      free: "免費開始",
      pro: "選擇 Pro",
      premium: "選擇 Premium",
    },
    faqTitle: "升級前常見問題",
    faq: [
      ["訂閱後可以取消嗎？", "可以。權益會保留至目前計費週期結束。"],
      ["診斷點數是分開計算嗎？", "不是。診斷與試妝使用相同的每月點數。"],
      ["生成失敗會怎樣？", "失敗、逾時或取消的任務會自動返還預留點數。"],
      ["下載圖片可以商用嗎？", "預設支援個人使用；商業使用需要另外授權。"],
    ],
    policyTitle: "扣款與政策",
    policyText:
      "訂閱會自動續費，可在客戶入口隨時取消。已支付費用不退款，但取消後不會產生下一期扣款。",
    policyKicker: "清楚的訂閱規則",
    policyFacts: [
      ["續費", "依選擇的月繳或年繳週期自動續費"],
      ["取消後", "權益保留至已付費週期結束"],
      ["退款", "已支付的訂閱費用不予退款"],
    ],
    policySupportLead: "對扣款或取消仍有疑問？",
    policySupportCta: "聯絡支援",
    checkoutTitle: "確認訂閱",
    checkoutCopy: "你將前往 Stripe Checkout。訂閱會依選擇的計費週期自動續費。",
    checkoutCancel: "取消",
    checkoutConfirm: "前往付款",
    toastBillingMissing: "付款功能尚未設定。",
    toastCheckoutFailed: "無法開始付款，請稍後再試。",
    toastPortalFailed: "無法開啟訂閱管理。",
    checkoutSuccess: "付款完成，方案更新可能需要一些時間。",
    checkoutCancelNotice: "付款已取消。",
  },
  comparisonLabels: {
    credits: "每月點數",
    diagnosis: "AI 診斷使用點數",
    tryon: "AI 試妝使用點數",
    hd: "HD 下載",
    tutorials: "彩妝教學",
    priority: "優先佇列",
    history: "長期紀錄",
    catalog: "完整妝容庫",
  },
};

const es: LocalizedPricingContent = {
  featureText: {
    yes: "Incluido",
    no: "No incluido",
    freeCta: "Empezar gratis",
    upgradeCta: "Elegir plan",
    manageCta: "Gestionar suscripción",
    currentPlan: "Plan actual",
  },
  copy: {
    kicker: "Planes",
    billingMonthly: "Mensual",
    billingYearly: "Anual",
    yearlySave: "Ahorra 2 meses",
    included: "Incluye",
    monthlyUnit: "/ mes",
    yearlyUnit: "/ año",
    popular: "Mejor opción",
    premiumRibbon: "Para uso frecuente",
    decisionHelperTitle: "¿Qué plan te conviene?",
    decisionHelperLead: "Pro suele ser el mejor inicio para un uso regular.",
    decisionHelperItems: [
      ["Free", "Para validar el flujo y la calidad del resultado."],
      ["Pro", "Para pruebas semanales, diagnósticos y descargas HD."],
      ["Premium", "Para más velocidad, catálogo completo e historial largo."],
    ],
    heroPoints: [
      [
        "Un solo sistema de créditos",
        "Un diagnóstico o una prueba usa un crédito.",
      ],
      [
        "Devolución si falla",
        "Las tareas fallidas, canceladas o agotadas se reembolsan automáticamente.",
      ],
      [
        "Cancela cuando quieras",
        "Los beneficios siguen activos hasta el final del periodo pagado.",
      ],
    ],
    planContent: {
      free: {
        badge: "Prueba",
        audience: "Para conocer el producto",
        reason:
          "Comprueba gratis si el flujo de IA y la calidad de imagen te sirven.",
        features: [
          "3 créditos al mes",
          "Diagnóstico y prueba virtual",
          "Vista previa estándar",
          "Crédito extra diario al compartir",
        ],
      },
      pro: {
        badge: "Más útil",
        audience: "Para crear looks con regularidad",
        reason:
          "Créditos suficientes para pruebas semanales, diagnósticos y resultados HD.",
        features: [
          "70 créditos al mes",
          "Descargas HD",
          "Tutoriales detallados",
          "Comparación de varias ocasiones",
        ],
      },
      premium: {
        badge: "Completo",
        audience: "Para uso frecuente y exploración de belleza",
        reason:
          "Pensado para iterar rápido, guardar más contexto y acceder a todos los looks.",
        features: [
          "150 créditos al mes",
          "Cola prioritaria",
          "Historial a largo plazo",
          "Catálogo completo",
          "Descargas HD y tutoriales",
        ],
      },
    },
    proofKicker: "La experiencia al mejorar",
    proofTitle: "Compara más y reduce las pruebas innecesarias",
    proofSubtitle:
      "La diferencia está en cuántas opciones comparas, cómo usas los resultados y cuánto historial conservas.",
    proofCta: "Ver comparación completa",
    proof: [
      [
        "Opciones para comparar",
        "3 → 70 → 150 créditos / mes",
        "Pasa de validar un resultado a comparar looks para varias ocasiones.",
      ],
      [
        "Resultados utilizables",
        "Vista previa → HD y tutoriales",
        "Guarda resultados útiles y conviértelos en maquillaje reproducible.",
      ],
      [
        "Generación e historial",
        "Estándar → prioridad e historial largo",
        "Premium facilita pruebas frecuentes y preparación de eventos.",
      ],
    ],
    compareTitle: "Comparar planes",
    compareSubtitle:
      "Todas las generaciones siguen las mismas reglas de créditos.",
    mobileCompareTitle: "Elige según tu frecuencia de uso",
    mobileCompareSubtitle:
      "Empieza por el plan adecuado y abre los detalles cuando los necesites.",
    mobileCompareCredits: "Créditos / mes",
    mobileCompareDetails: "Comparar todas las funciones",
    mobilePlanCta: {
      free: "Empezar gratis",
      pro: "Elegir Pro",
      premium: "Elegir Premium",
    },
    faqTitle: "Preguntas antes de mejorar",
    faq: [
      [
        "¿Puedo cancelar después de suscribirme?",
        "Sí. Los beneficios siguen activos hasta el final del periodo de facturación actual.",
      ],
      [
        "¿El diagnóstico usa créditos separados?",
        "No. El diagnóstico y la prueba virtual usan los mismos créditos mensuales.",
      ],
      [
        "¿Qué pasa si falla la generación?",
        "Las tareas fallidas, canceladas o agotadas devuelven automáticamente el crédito reservado.",
      ],
      [
        "¿Puedo usar las imágenes comercialmente?",
        "El uso personal está permitido por defecto. El uso comercial requiere autorización adicional.",
      ],
    ],
    policyTitle: "Facturación y condiciones",
    policyText:
      "Las suscripciones se renuevan automáticamente. Puedes cancelar desde el portal del cliente. Los pagos realizados no se reembolsan, pero cancelar evita la siguiente renovación.",
    policyKicker: "Facturación clara",
    policyFacts: [
      ["Renovación", "Renovación automática según el ciclo elegido"],
      [
        "Después de cancelar",
        "Los beneficios siguen activos hasta terminar el periodo pagado",
      ],
      ["Reembolsos", "Las cuotas ya pagadas no se reembolsan"],
    ],
    policySupportLead: "¿Tienes dudas sobre pagos o cancelación?",
    policySupportCta: "Contactar soporte",
    checkoutTitle: "Confirmar suscripción",
    checkoutCopy:
      "Irás a Stripe Checkout. La suscripción se renueva automáticamente según el ciclo elegido.",
    checkoutCancel: "Cancelar",
    checkoutConfirm: "Continuar al pago",
    toastBillingMissing: "La facturación aún no está configurada.",
    toastCheckoutFailed: "No se pudo iniciar el pago. Inténtalo más tarde.",
    toastPortalFailed: "No se pudo abrir la gestión de la suscripción.",
    checkoutSuccess:
      "Pago completado. El plan puede tardar un momento en actualizarse.",
    checkoutCancelNotice: "El pago fue cancelado.",
  },
  comparisonLabels: {
    credits: "Créditos mensuales",
    diagnosis: "El diagnóstico IA usa créditos",
    tryon: "La prueba IA usa créditos",
    hd: "Descarga HD",
    tutorials: "Tutoriales de maquillaje",
    priority: "Cola prioritaria",
    history: "Historial a largo plazo",
    catalog: "Catálogo completo",
  },
};

const ptBR: LocalizedPricingContent = {
  featureText: {
    yes: "Incluído",
    no: "Não incluído",
    freeCta: "Começar grátis",
    upgradeCta: "Escolher plano",
    manageCta: "Gerenciar assinatura",
    currentPlan: "Plano atual",
  },
  copy: {
    kicker: "Planos",
    billingMonthly: "Mensal",
    billingYearly: "Anual",
    yearlySave: "Economize 2 meses",
    included: "Incluído",
    monthlyUnit: "/ mês",
    yearlyUnit: "/ ano",
    popular: "Melhor custo-benefício",
    premiumRibbon: "Para uso frequente",
    decisionHelperTitle: "Qual plano combina com você?",
    decisionHelperLead: "Pro costuma ser o melhor começo para uso regular.",
    decisionHelperItems: [
      ["Free", "Para validar o fluxo e a qualidade do resultado."],
      ["Pro", "Para testes semanais, diagnósticos e downloads HD."],
      ["Premium", "Para mais velocidade, catálogo completo e histórico longo."],
    ],
    heroPoints: [
      ["Um sistema de créditos", "Um diagnóstico ou teste usa um crédito."],
      [
        "Crédito devolvido em falhas",
        "Tarefas com falha, canceladas ou expiradas são reembolsadas automaticamente.",
      ],
      [
        "Cancele quando quiser",
        "Os benefícios ficam ativos até o fim do período pago.",
      ],
    ],
    planContent: {
      free: {
        badge: "Teste",
        audience: "Para conhecer o produto",
        reason:
          "Confirme grátis se o fluxo de IA e a qualidade da imagem atendem você.",
        features: [
          "3 créditos por mês",
          "Diagnóstico e teste virtual",
          "Prévia padrão",
          "Crédito extra diário ao compartilhar",
        ],
      },
      pro: {
        badge: "Mais útil",
        audience: "Para criar looks com frequência",
        reason:
          "Créditos suficientes para testes semanais, diagnósticos e resultados HD.",
        features: [
          "70 créditos por mês",
          "Downloads HD",
          "Tutoriais detalhados",
          "Comparação de várias ocasiões",
        ],
      },
      premium: {
        badge: "Completo",
        audience: "Para uso frequente e exploração de beleza",
        reason:
          "Feito para testar mais rápido, guardar contexto e acessar todos os looks.",
        features: [
          "150 créditos por mês",
          "Fila prioritária",
          "Histórico de longo prazo",
          "Catálogo completo",
          "Downloads HD e tutoriais",
        ],
      },
    },
    proofKicker: "A experiência após o upgrade",
    proofTitle: "Compare mais e reduza tentativas desnecessárias",
    proofSubtitle:
      "A diferença está na quantidade de opções, no uso dos resultados e no histórico salvo.",
    proofCta: "Ver comparação completa",
    proof: [
      [
        "Opções para comparar",
        "3 → 70 → 150 créditos / mês",
        "Passe de validar um resultado para comparar looks em várias ocasiões.",
      ],
      [
        "Resultados utilizáveis",
        "Prévia padrão → HD e tutoriais",
        "Salve resultados úteis e transforme-os em maquiagem reproduzível.",
      ],
      [
        "Geração e histórico",
        "Padrão → prioridade e histórico longo",
        "Premium facilita testes frequentes e preparação para eventos.",
      ],
    ],
    compareTitle: "Comparar planos",
    compareSubtitle: "Todas as gerações seguem as mesmas regras de créditos.",
    mobileCompareTitle: "Escolha pela frequência de uso",
    mobileCompareSubtitle:
      "Comece pelo plano adequado e abra os detalhes quando precisar.",
    mobileCompareCredits: "Créditos / mês",
    mobileCompareDetails: "Comparar todos os recursos",
    mobilePlanCta: {
      free: "Começar grátis",
      pro: "Escolher Pro",
      premium: "Escolher Premium",
    },
    faqTitle: "Perguntas antes do upgrade",
    faq: [
      [
        "Posso cancelar depois de assinar?",
        "Sim. Os benefícios ficam ativos até o fim do período de cobrança atual.",
      ],
      [
        "O diagnóstico usa créditos separados?",
        "Não. O diagnóstico e o teste virtual usam os mesmos créditos mensais.",
      ],
      [
        "O que acontece se a geração falhar?",
        "Tarefas com falha, canceladas ou expiradas devolvem automaticamente o crédito reservado.",
      ],
      [
        "Posso usar as imagens comercialmente?",
        "O uso pessoal é permitido por padrão. O uso comercial exige autorização separada.",
      ],
    ],
    policyTitle: "Cobrança e condições",
    policyText:
      "As assinaturas são renovadas automaticamente. Você pode cancelar no portal do cliente. Valores pagos não são reembolsados, mas o cancelamento impede a próxima renovação.",
    policyKicker: "Cobrança transparente",
    policyFacts: [
      ["Renovação", "Renovação automática no ciclo escolhido"],
      ["Após cancelar", "Os benefícios ficam ativos até o fim do período pago"],
      ["Reembolsos", "As taxas de assinatura já pagas não são reembolsadas"],
    ],
    policySupportLead: "Ainda tem dúvidas sobre cobrança ou cancelamento?",
    policySupportCta: "Falar com o suporte",
    checkoutTitle: "Confirmar assinatura",
    checkoutCopy:
      "Você será direcionado ao Stripe Checkout. A assinatura é renovada automaticamente no ciclo escolhido.",
    checkoutCancel: "Cancelar",
    checkoutConfirm: "Continuar para o pagamento",
    toastBillingMissing: "A cobrança ainda não está configurada.",
    toastCheckoutFailed:
      "Não foi possível iniciar o pagamento. Tente novamente mais tarde.",
    toastPortalFailed: "Não foi possível abrir o gerenciamento da assinatura.",
    checkoutSuccess:
      "Pagamento concluído. A atualização do plano pode levar alguns instantes.",
    checkoutCancelNotice: "O pagamento foi cancelado.",
  },
  comparisonLabels: {
    credits: "Créditos mensais",
    diagnosis: "Diagnóstico com IA usa créditos",
    tryon: "Teste com IA usa créditos",
    hd: "Download HD",
    tutorials: "Tutoriais de maquiagem",
    priority: "Fila prioritária",
    history: "Histórico de longo prazo",
    catalog: "Catálogo completo",
  },
};

const localizedPricingContent: Partial<
  Record<AppLocale, LocalizedPricingContent>
> = {
  "de-DE": de,
  "fr-FR": fr,
  "ja-JP": ja,
  "ko-KR": ko,
  "zh-TW": zhTW,
  "es-ES": es,
  "es-419": es,
  "pt-BR": ptBR,
};

export function getLocalizedPricingContent(
  locale: AppLocale,
): LocalizedPricingContent | undefined {
  return localizedPricingContent[locale];
}
