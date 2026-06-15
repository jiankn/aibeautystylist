import type { SupportedLocale } from "../lib/i18n";

type Pair = readonly [string, string];

export interface AboutContent {
  readonly eyebrow: string;
  readonly title: string;
  readonly intro: string;
  readonly primary: string;
  readonly secondary: string;
  readonly promiseTitle: string;
  readonly promiseLead: string;
  readonly promises: readonly Pair[];
  readonly processTitle: string;
  readonly process: readonly Pair[];
  readonly boundariesTitle: string;
  readonly boundariesLead: string;
  readonly boundaries: readonly Pair[];
  readonly trustTitle: string;
  readonly trustLead: string;
  readonly trustLinks: readonly Pair[];
  readonly ctaTitle: string;
  readonly ctaBody: string;
}

export interface FaqContent {
  readonly groups: readonly {
    readonly id: string;
    readonly title: string;
    readonly items: readonly Pair[];
  }[];
  readonly copy: {
    readonly metaTitle: string;
    readonly title: string;
    readonly description: string;
    readonly eyebrow: string;
    readonly search: string;
    readonly searchPlaceholder: string;
    readonly noResults: string;
    readonly supportTitle: string;
    readonly supportBody: string;
    readonly supportCta: string;
  };
}

export interface SupportContent {
  readonly metaTitle: string;
  readonly title: string;
  readonly description: string;
  readonly eyebrow: string;
  readonly intro: string;
  readonly formTitle: string;
  readonly formDesc: string;
  readonly name: string;
  readonly email: string;
  readonly topic: string;
  readonly message: string;
  readonly namePlaceholder: string;
  readonly messagePlaceholder: string;
  readonly choose: string;
  readonly topics: readonly Pair[];
  readonly submit: string;
  readonly submitting: string;
  readonly privacy: string;
  readonly privacyLink: string;
  readonly successTitle: string;
  readonly successBody: string;
  readonly another: string;
  readonly directTitle: string;
  readonly directItems: readonly Pair[];
  readonly emailTitle: string;
  readonly emailBody: string;
  readonly browseFaq: string;
  readonly response: string;
}

interface SupportingLocaleContent {
  readonly about: AboutContent;
  readonly faq: FaqContent;
  readonly support: SupportContent;
}

const localized: Partial<Record<SupportedLocale, SupportingLocaleContent>> = {
  "de-DE": {
    about: {
      eyebrow: "Über das Produkt",
      title: "Make-up-Richtungen klar vergleichen, bevor du dich entscheidest",
      intro:
        "AI Beauty Stylist zeigt Looks auf deinem Foto, erklärt passende Entscheidungen und hilft, Inspiration in einen realistischen Plan zu übersetzen.",
      primary: "Look ausprobieren",
      secondary: "Diagnose ansehen",
      promiseTitle: "Wofür das Produkt entwickelt wurde",
      promiseLead:
        "Ein visuelles Planungswerkzeug zwischen Inspiration und Kaufentscheidung, ohne Garantie für reale Ergebnisse.",
      promises: [
        [
          "Deine Identität bewahren",
          "Empfehlungen arbeiten mit deinen sichtbaren Merkmalen statt mit einem Standardgesicht.",
        ],
        [
          "Vergleiche erleichtern",
          "Prüfe Farbe, Finish und Intensität, bevor du Zeit oder Geld investierst.",
        ],
        [
          "Ergebnisse nutzbar machen",
          "Diagnosen und Look-Seiten erklären konkrete nächste Schritte.",
        ],
      ],
      processTitle: "So läuft eine Sitzung ab",
      process: [
        ["Ziel wählen", "Beginne mit Anlass, Look oder einer Diagnosefrage."],
        [
          "Mit Einwilligung hochladen",
          "Ein Selfie wird erst nach deiner Bestätigung verarbeitet.",
        ],
        [
          "Kritisch prüfen",
          "Beziehe Licht, Produkte, Technik und Bildschirmfarbe in die Entscheidung ein.",
        ],
      ],
      boundariesTitle: "Klare Grenzen",
      boundariesLead:
        "Vertrauen braucht Klarheit darüber, was KI nicht entscheiden kann.",
      boundaries: [
        [
          "Keine medizinische Diagnose",
          "Das Produkt ersetzt keine medizinische Fachperson.",
        ],
        [
          "Keine Attraktivitätsbewertung",
          "Wir bewerten Gesichter nicht nach einer universellen Norm.",
        ],
        [
          "Keine perfekte Farbübereinstimmung",
          "Kamera, Display, Licht und reale Produkte verändern das Ergebnis.",
        ],
        [
          "Keine Nutzung ohne Erlaubnis",
          "Fotos werden nur nach Einwilligung verarbeitet und können gelöscht werden.",
        ],
      ],
      trustTitle: "Produkt- und Datenversprechen",
      trustLead:
        "Wichtige Regeln sind offen dokumentiert und vor dem Upload einsehbar.",
      trustLinks: [
        ["/privacy", "Foto- und Datenschutz"],
        ["/ai-disclaimer", "Grenzen und angemessene KI-Nutzung"],
        ["/terms", "Nutzungsbedingungen"],
        ["/support", "Hilfe oder Anliegen einreichen"],
      ],
      ctaTitle: "Starte mit einer konkreten Frage",
      ctaBody:
        "Vergleiche einen Look oder führe zuerst eine Gesichtsdiagnose durch.",
    },
    faq: {
      copy: {
        metaTitle: "Hilfezentrum | AI Beauty Stylist",
        title: "Antwort finden und direkt weitermachen",
        description:
          "Klare Antworten zu Try-on, Diagnose, Fotos, Credits und Abonnements.",
        eyebrow: "Hilfezentrum",
        search: "Hilfe durchsuchen",
        searchPlaceholder: "Fotos, Credits, Abonnement suchen...",
        noResults:
          "Keine passende Antwort. Nutze ein anderes Wort oder kontaktiere den Support.",
        supportTitle: "Noch nicht gelöst?",
        supportBody:
          "Erstelle ein Ticket mit Seite, Schritten, erwartetem Ergebnis und relevanter Aufgaben- oder Bestellnummer.",
        supportCta: "Support kontaktieren",
      },
      groups: [
        {
          id: "getting-started",
          title: "Produkt verwenden",
          items: [
            [
              "Wofür ist AI Beauty Stylist gedacht?",
              "Zum Vergleichen von Make-up-Richtungen auf deinem Foto und zum Verstehen praktischer Farb-, Finish- und Platzierungshinweise.",
            ],
            [
              "Wie sollte mein Foto aussehen?",
              "Nutze gleichmäßiges Frontlicht, zeige die wichtigsten Gesichtszüge und vermeide starke Filter.",
            ],
          ],
        },
        {
          id: "privacy",
          title: "Fotos und Datenschutz",
          items: [
            [
              "Wann wird mein Selfie verarbeitet?",
              "Erst nachdem du den Fotohinweis bestätigst und einen Upload startest.",
            ],
            [
              "Kann ich Fotos und Ergebnisse löschen?",
              "Ja. Verfügbare Löschfunktionen entfernen Original, Ergebnis und zugehörige Aufzeichnungen.",
            ],
          ],
        },
        {
          id: "billing",
          title: "Credits und Abonnement",
          items: [
            [
              "Wann wird ein Credit verwendet?",
              "Bei einer erfolgreich generierten Diagnose oder einem Try-on. Das Durchsuchen von Looks kostet keinen Credit.",
            ],
            [
              "Wie kündige ich?",
              "Öffne nach der Anmeldung dein Konto und verwalte dort das Abonnement.",
            ],
          ],
        },
        {
          id: "troubleshooting",
          title: "Probleme lösen",
          items: [
            [
              "Das Ergebnis sieht nicht wie ich aus. Was tun?",
              "Versuche ein klares, frontales Foto mit gleichmäßigem Licht und ohne Beauty-Filter.",
            ],
            [
              "Eine Aufgabe hängt fest. Was tun?",
              "Aktualisiere den Status, versuche es erneut oder kontaktiere den Support mit der Aufgaben-ID.",
            ],
          ],
        },
      ],
    },
    support: {
      metaTitle: "Support | AI Beauty Stylist",
      title: "Support, der beim Problem beginnt",
      description:
        "Beschreibe, was passiert ist und was du erwartet hast. Wir erstellen ein nachvollziehbares Ticket.",
      eyebrow: "Support",
      intro:
        "Sende bei Konto-, Abrechnungs-, Diagnose- oder Try-on-Problemen eine klare Anfrage. Ein Foto ist nicht nötig.",
      formTitle: "Support-Ticket erstellen",
      formDesc:
        "Pflichtfelder sind markiert. Keine Passwörter oder Kartendaten eintragen.",
      name: "Name",
      email: "Kontakt-E-Mail",
      topic: "Thema",
      message: "Was ist passiert?",
      namePlaceholder: "Wie dürfen wir dich ansprechen?",
      messagePlaceholder:
        "Beschreibe Schritte, Ergebnis und Erwartung. Füge bei Bedarf eine Bestell- oder Aufgaben-ID hinzu.",
      choose: "Thema wählen",
      topics: [
        ["billing", "Abrechnung und Abonnement"],
        ["tryon", "Try-on-Generierung"],
        ["diagnosis", "KI-Diagnose"],
        ["account", "Kontozugriff"],
        ["cooperation", "Geschäftliche Anfrage"],
        ["other", "Sonstiges Feedback"],
      ],
      submit: "Ticket senden",
      submitting: "Wird gesendet...",
      privacy:
        "Mit dem Senden dürfen wir diese Angaben zur Bearbeitung verwenden.",
      privacyLink: "Datenschutzerklärung",
      successTitle: "Dein Ticket ist in der Warteschlange",
      successBody: "Bewahre diese Ticketnummer auf:",
      another: "Weitere Anfrage senden",
      directTitle: "Vor dem Senden",
      directItems: [
        [
          "Konto schützen",
          "Sende niemals Passwörter, Codes oder vollständige Kartendaten.",
        ],
        [
          "Reproduktion erleichtern",
          "Nenne Seite, Schritte, erwartetes Ergebnis und relevante IDs.",
        ],
        [
          "Fotoprobleme",
          "Beschreibe das Problem, ohne ein Selfie per E-Mail zu senden.",
        ],
      ],
      emailTitle: "Lieber per E-Mail?",
      emailBody: "Sende dieselben Angaben an support@aibeautystylist.com.",
      browseFaq: "Häufige Antworten ansehen",
      response:
        "Anfragen werden der Reihe nach geprüft; komplexe Fälle können länger dauern.",
    },
  },
  "fr-FR": {
    about: {
      eyebrow: "À propos du produit",
      title: "Comparer clairement les directions maquillage avant de choisir",
      intro:
        "AI Beauty Stylist montre des looks sur votre photo, explique les choix utiles et transforme l'inspiration en plan réaliste.",
      primary: "Essayer un look",
      secondary: "Voir le diagnostic",
      promiseTitle: "Ce que le produit cherche à résoudre",
      promiseLead:
        "Un outil de planification visuelle entre inspiration et achat, sans garantie de résultat réel.",
      promises: [
        [
          "Préserver votre identité",
          "Les conseils s'appuient sur vos traits visibles, sans imposer un visage standard.",
        ],
        [
          "Comparer plus facilement",
          "Vérifiez couleur, fini et intensité avant d'investir du temps ou de l'argent.",
        ],
        [
          "Passer à l'action",
          "Les diagnostics et pages look expliquent les prochaines décisions concrètes.",
        ],
      ],
      processTitle: "Déroulement d'une session",
      process: [
        [
          "Choisir un objectif",
          "Commencez par une occasion, un look ou une question de diagnostic.",
        ],
        [
          "Importer avec consentement",
          "Le selfie n'est traité qu'après votre confirmation.",
        ],
        [
          "Évaluer avec recul",
          "Tenez compte de la lumière, des produits, de la technique et de l'écran.",
        ],
      ],
      boundariesTitle: "Nos limites explicites",
      boundariesLead:
        "La confiance exige de dire clairement ce que l'IA ne peut pas décider.",
      boundaries: [
        [
          "Pas de diagnostic médical",
          "Le produit ne remplace pas un professionnel de santé.",
        ],
        [
          "Pas de note d'attractivité",
          "Nous ne classons pas les visages selon une norme universelle.",
        ],
        [
          "Pas de correspondance couleur parfaite",
          "Caméra, écran, lumière et produits réels modifient le rendu.",
        ],
        [
          "Pas d'utilisation sans autorisation",
          "Les photos sont traitées après consentement et peuvent être supprimées.",
        ],
      ],
      trustTitle: "Engagements produit et données",
      trustLead:
        "Les règles importantes sont documentées et consultables avant l'import.",
      trustLinks: [
        ["/privacy", "Photos et confidentialité"],
        ["/ai-disclaimer", "Limites et usage approprié de l'IA"],
        ["/terms", "Conditions d'utilisation"],
        ["/support", "Demander de l'aide"],
      ],
      ctaTitle: "Commencer par une question concrète",
      ctaBody: "Comparez un look ou lancez d'abord un diagnostic du visage.",
    },
    faq: {
      copy: {
        metaTitle: "Centre d'aide | AI Beauty Stylist",
        title: "Trouver la réponse et reprendre votre tâche",
        description:
          "Réponses claires sur l'essai, le diagnostic, les photos, les crédits et l'abonnement.",
        eyebrow: "Centre d'aide",
        search: "Rechercher dans l'aide",
        searchPlaceholder: "Rechercher photos, crédits, abonnement...",
        noResults:
          "Aucune réponse correspondante. Essayez un autre mot ou contactez l'assistance.",
        supportTitle: "Toujours bloqué ?",
        supportBody:
          "Créez un ticket avec la page, les étapes, le résultat attendu et tout identifiant utile.",
        supportCta: "Contacter l'assistance",
      },
      groups: [
        {
          id: "getting-started",
          title: "Utiliser le produit",
          items: [
            [
              "À quoi sert AI Beauty Stylist ?",
              "À comparer des directions maquillage sur votre photo et comprendre des conseils concrets de couleur, fini et placement.",
            ],
            [
              "Comment prendre la photo ?",
              "Utilisez une lumière frontale régulière, gardez les traits visibles et évitez les filtres forts.",
            ],
          ],
        },
        {
          id: "privacy",
          title: "Photos et confidentialité",
          items: [
            [
              "Quand mon selfie est-il traité ?",
              "Uniquement après confirmation de l'avis photo et démarrage de l'import.",
            ],
            [
              "Puis-je supprimer mes données ?",
              "Oui. Les contrôles disponibles suppriment l'original, le résultat et les enregistrements liés.",
            ],
          ],
        },
        {
          id: "billing",
          title: "Crédits et abonnement",
          items: [
            [
              "Quand un crédit est-il utilisé ?",
              "Lorsqu'un diagnostic ou un essai est généré avec succès. Parcourir les looks ne consomme rien.",
            ],
            [
              "Comment résilier ?",
              "Connectez-vous, ouvrez votre compte et utilisez la gestion de l'abonnement.",
            ],
          ],
        },
        {
          id: "troubleshooting",
          title: "Dépannage",
          items: [
            [
              "Le résultat ne me ressemble pas. Que faire ?",
              "Réessayez avec une photo nette, de face, bien éclairée et sans filtre beauté.",
            ],
            [
              "Une tâche reste bloquée. Que faire ?",
              "Actualisez son état, réessayez ou contactez l'assistance avec l'identifiant de tâche.",
            ],
          ],
        },
      ],
    },
    support: {
      metaTitle: "Assistance | AI Beauty Stylist",
      title: "Une assistance qui part du problème",
      description:
        "Décrivez ce qui s'est passé et le résultat attendu. Nous créerons un ticket traçable.",
      eyebrow: "Assistance",
      intro:
        "Pour un problème de compte, paiement, diagnostic ou essai, envoyez une demande claire. Aucune photo n'est nécessaire.",
      formTitle: "Créer un ticket",
      formDesc:
        "Les champs obligatoires sont indiqués. N'ajoutez aucun mot de passe ni numéro de carte.",
      name: "Nom",
      email: "E-mail de contact",
      topic: "Type de problème",
      message: "Que s'est-il passé ?",
      namePlaceholder: "Comment devons-nous vous appeler ?",
      messagePlaceholder:
        "Décrivez les étapes, le résultat et l'attente. Ajoutez un identifiant utile si nécessaire.",
      choose: "Choisir un type",
      topics: [
        ["billing", "Paiement et abonnement"],
        ["tryon", "Génération d'essai"],
        ["diagnosis", "Diagnostic IA"],
        ["account", "Accès au compte"],
        ["cooperation", "Demande commerciale"],
        ["other", "Autre retour"],
      ],
      submit: "Envoyer le ticket",
      submitting: "Envoi...",
      privacy:
        "En envoyant, vous acceptez l'utilisation de ces informations pour répondre.",
      privacyLink: "Politique de confidentialité",
      successTitle: "Votre ticket est dans la file d'assistance",
      successBody: "Conservez ce numéro :",
      another: "Envoyer une autre demande",
      directTitle: "Avant l'envoi",
      directItems: [
        [
          "Protégez votre compte",
          "N'envoyez jamais mots de passe, codes ou carte complète.",
        ],
        [
          "Aidez-nous à reproduire",
          "Indiquez page, étapes, résultat attendu et identifiants utiles.",
        ],
        [
          "Problèmes de photo",
          "Décrivez le problème sans envoyer votre selfie par e-mail.",
        ],
      ],
      emailTitle: "Vous préférez l'e-mail ?",
      emailBody: "Envoyez les mêmes détails à support@aibeautystylist.com.",
      browseFaq: "Voir les réponses fréquentes",
      response:
        "Les demandes sont traitées dans l'ordre; les cas complexes peuvent prendre plus de temps.",
    },
  },
  "ja-JP": {
    about: {
      eyebrow: "製品について",
      title: "決める前に、メイクの方向を自分の顔で比較",
      intro:
        "AI Beauty Stylistは、自分の写真でメイクを比較し、似合う理由と実生活で使える選択を整理します。",
      primary: "メイクを試す",
      secondary: "診断を見る",
      promiseTitle: "この製品が目指すこと",
      promiseLead:
        "インスピレーションと購入判断の間をつなぐ視覚的な計画ツールです。実際の結果を保証するものではありません。",
      promises: [
        [
          "自分らしさを残す",
          "見える特徴に合わせて提案し、同じ顔を押しつけません。",
        ],
        [
          "比較を簡単にする",
          "時間やお金を使う前に、色・質感・濃さを確認できます。",
        ],
        [
          "次の行動につなげる",
          "診断とメイクページで、具体的な選択理由を説明します。",
        ],
      ],
      processTitle: "利用の流れ",
      process: [
        ["目的を選ぶ", "シーン、メイク、診断したいことから始めます。"],
        ["同意してアップロード", "写真は確認後にのみ処理されます。"],
        ["結果を冷静に確認", "光、商品、技術、画面の色を考慮して判断します。"],
      ],
      boundariesTitle: "明確にしている制限",
      boundariesLead: "信頼のために、AIが決められないことも明示します。",
      boundaries: [
        ["医療診断ではありません", "医療専門家の代わりにはなりません。"],
        ["魅力度を採点しません", "顔を共通の美の基準で評価しません。"],
        [
          "完全な色一致ではありません",
          "カメラ、画面、光、実物の商品で結果は変わります。",
        ],
        ["無断で写真を使いません", "写真は同意後に処理され、削除できます。"],
      ],
      trustTitle: "製品とデータの約束",
      trustLead: "重要なルールは公開し、アップロード前に確認できます。",
      trustLinks: [
        ["/privacy", "写真とプライバシー"],
        ["/ai-disclaimer", "AIの制限と適切な利用"],
        ["/terms", "利用規約"],
        ["/support", "相談・サポート"],
      ],
      ctaTitle: "具体的な疑問から始める",
      ctaBody: "気になるメイクを比較するか、先に顔診断を行えます。",
    },
    faq: {
      copy: {
        metaTitle: "ヘルプセンター | AI Beauty Stylist",
        title: "答えを見つけて、すぐに続ける",
        description:
          "試着、診断、写真、クレジット、サブスクリプションに関する回答。",
        eyebrow: "ヘルプセンター",
        search: "ヘルプを検索",
        searchPlaceholder: "写真、クレジット、サブスクリプションを検索...",
        noResults:
          "一致する回答がありません。別の言葉で検索するか、サポートへお問い合わせください。",
        supportTitle: "まだ解決しませんか？",
        supportBody:
          "ページ、手順、期待した結果、関連するタスク・注文番号を添えてお問い合わせください。",
        supportCta: "サポートへ連絡",
      },
      groups: [
        {
          id: "getting-started",
          title: "製品の使い方",
          items: [
            [
              "AI Beauty Stylistで何ができますか？",
              "自分の写真でメイク方向を比較し、色、質感、配置の具体的な提案を確認できます。",
            ],
            [
              "写真はどう撮ればよいですか？",
              "正面から均一な光を当て、顔を見せ、強いフィルターを避けてください。",
            ],
          ],
        },
        {
          id: "privacy",
          title: "写真とプライバシー",
          items: [
            [
              "写真はいつ処理されますか？",
              "写真処理の案内に同意してアップロードを開始した後だけです。",
            ],
            [
              "写真と結果は削除できますか？",
              "はい。利用可能な削除機能で元写真、結果、関連記録を削除できます。",
            ],
          ],
        },
        {
          id: "billing",
          title: "クレジットとサブスクリプション",
          items: [
            [
              "クレジットはいつ使われますか？",
              "診断または試着が正常に生成されたときです。メイクを見るだけでは消費しません。",
            ],
            [
              "解約方法は？",
              "ログイン後にアカウントを開き、サブスクリプション管理を使用してください。",
            ],
          ],
        },
        {
          id: "troubleshooting",
          title: "トラブル対応",
          items: [
            [
              "結果が自分に見えません。どうすればよいですか？",
              "正面、均一な光、フィルターなしの鮮明な写真で再試行してください。",
            ],
            [
              "タスクが終わりません。どうすればよいですか？",
              "状態を更新し、再試行するか、タスクIDを添えてサポートへ連絡してください。",
            ],
          ],
        },
      ],
    },
    support: {
      metaTitle: "サポート | AI Beauty Stylist",
      title: "問題から始めるサポート",
      description:
        "起きたことと期待した結果を教えてください。追跡可能なチケットを作成します。",
      eyebrow: "サポート",
      intro:
        "アカウント、支払い、診断、試着の問題は、内容を明確にして送信してください。写真は不要です。",
      formTitle: "サポートチケットを作成",
      formDesc:
        "必須項目が表示されています。パスワードやカード情報は入力しないでください。",
      name: "お名前",
      email: "連絡用メール",
      topic: "問題の種類",
      message: "何が起きましたか？",
      namePlaceholder: "お呼びする名前",
      messagePlaceholder:
        "操作、起きたこと、期待した結果を説明し、必要なら注文・タスクIDを追加してください。",
      choose: "問題の種類を選択",
      topics: [
        ["billing", "支払い・サブスクリプション"],
        ["tryon", "試着の生成"],
        ["diagnosis", "AI診断"],
        ["account", "アカウントアクセス"],
        ["cooperation", "ビジネスのお問い合わせ"],
        ["other", "その他"],
      ],
      submit: "チケットを送信",
      submitting: "送信中...",
      privacy:
        "送信すると、回答のためにこの情報を使用することに同意したものとみなされます。",
      privacyLink: "プライバシーポリシー",
      successTitle: "チケットを受け付けました",
      successBody: "確認用にこの番号を保存してください：",
      another: "別の問い合わせを送信",
      directTitle: "送信前の確認",
      directItems: [
        [
          "アカウントを守る",
          "パスワード、確認コード、カード番号を送信しないでください。",
        ],
        [
          "再現に必要な情報",
          "ページ、手順、期待した結果、関連IDを記載してください。",
        ],
        [
          "写真に関する問題",
          "セルフィーをメールせず、現象だけを説明できます。",
        ],
      ],
      emailTitle: "メールをご希望ですか？",
      emailBody: "同じ内容を support@aibeautystylist.com へ送信してください。",
      browseFaq: "よくある回答を見る",
      response:
        "お問い合わせは順番に確認します。複雑なケースは時間がかかる場合があります。",
    },
  },
  "ko-KR": {
    about: {
      eyebrow: "제품 소개",
      title: "결정하기 전에 메이크업 방향을 선명하게 비교하세요",
      intro:
        "AI Beauty Stylist는 내 사진에서 룩을 비교하고, 어울리는 이유와 실제로 적용할 선택을 정리합니다.",
      primary: "메이크업 체험",
      secondary: "진단 보기",
      promiseTitle: "제품이 해결하려는 문제",
      promiseLead:
        "영감과 구매 결정 사이를 연결하는 시각적 계획 도구이며 실제 결과를 보장하지 않습니다.",
      promises: [
        [
          "나만의 특징 유지",
          "보이는 얼굴 특징을 바탕으로 제안하며 하나의 표준 얼굴을 강요하지 않습니다.",
        ],
        [
          "쉬운 비교",
          "시간과 비용을 쓰기 전에 색상, 마무리, 강도를 확인합니다.",
        ],
        [
          "실행 가능한 결과",
          "진단과 룩 페이지에서 다음 선택을 구체적으로 설명합니다.",
        ],
      ],
      processTitle: "이용 흐름",
      process: [
        ["목표 선택", "상황, 룩 또는 진단 질문에서 시작합니다."],
        ["동의 후 업로드", "셀피는 확인 후에만 처리됩니다."],
        [
          "비판적으로 검토",
          "조명, 제품, 기술 및 화면 색상을 고려해 판단합니다.",
        ],
      ],
      boundariesTitle: "명확한 한계",
      boundariesLead: "신뢰를 위해 AI가 결정할 수 없는 것도 분명히 밝힙니다.",
      boundaries: [
        ["의료 진단 아님", "의료 전문가를 대신하지 않습니다."],
        ["외모 점수 없음", "얼굴을 하나의 미 기준으로 평가하지 않습니다."],
        [
          "완벽한 색상 일치 없음",
          "카메라, 화면, 조명, 실제 제품에 따라 결과가 달라집니다.",
        ],
        [
          "허가 없는 사진 사용 없음",
          "사진은 동의 후 처리되며 삭제할 수 있습니다.",
        ],
      ],
      trustTitle: "제품 및 데이터 약속",
      trustLead: "중요한 규칙은 공개되어 업로드 전에 확인할 수 있습니다.",
      trustLinks: [
        ["/privacy", "사진 및 개인정보"],
        ["/ai-disclaimer", "AI 한계 및 적절한 사용"],
        ["/terms", "서비스 이용약관"],
        ["/support", "도움 요청"],
      ],
      ctaTitle: "구체적인 질문부터 시작",
      ctaBody: "룩을 비교하거나 먼저 얼굴 진단을 실행하세요.",
    },
    faq: {
      copy: {
        metaTitle: "도움말 센터 | AI Beauty Stylist",
        title: "답을 찾고 바로 작업을 계속하세요",
        description:
          "가상 체험, 진단, 사진, 크레딧 및 구독에 대한 명확한 답변.",
        eyebrow: "도움말 센터",
        search: "도움말 검색",
        searchPlaceholder: "사진, 크레딧, 구독 검색...",
        noResults:
          "일치하는 답변이 없습니다. 다른 단어를 사용하거나 지원팀에 문의하세요.",
        supportTitle: "아직 해결되지 않았나요?",
        supportBody:
          "페이지, 단계, 예상 결과 및 관련 작업·주문 ID를 포함해 문의하세요.",
        supportCta: "지원팀 문의",
      },
      groups: [
        {
          id: "getting-started",
          title: "제품 사용",
          items: [
            [
              "AI Beauty Stylist는 무엇을 하나요?",
              "내 사진에서 메이크업 방향을 비교하고 색상, 마무리 및 위치 제안을 이해하도록 돕습니다.",
            ],
            [
              "사진은 어떻게 찍나요?",
              "고른 정면 조명을 사용하고 얼굴 특징을 보이며 강한 필터를 피하세요.",
            ],
          ],
        },
        {
          id: "privacy",
          title: "사진 및 개인정보",
          items: [
            [
              "셀피는 언제 처리되나요?",
              "사진 처리 안내에 동의하고 업로드를 시작한 후에만 처리됩니다.",
            ],
            [
              "사진과 결과를 삭제할 수 있나요?",
              "예. 제공되는 삭제 기능으로 원본, 결과 및 관련 기록을 삭제할 수 있습니다.",
            ],
          ],
        },
        {
          id: "billing",
          title: "크레딧 및 구독",
          items: [
            [
              "크레딧은 언제 사용되나요?",
              "진단 또는 체험이 성공적으로 생성될 때입니다. 룩 탐색은 크레딧을 사용하지 않습니다.",
            ],
            [
              "구독은 어떻게 해지하나요?",
              "로그인 후 계정을 열고 구독 관리 기능을 사용하세요.",
            ],
          ],
        },
        {
          id: "troubleshooting",
          title: "문제 해결",
          items: [
            [
              "결과가 나처럼 보이지 않습니다.",
              "고른 조명, 정면, 필터 없는 선명한 사진으로 다시 시도하세요.",
            ],
            [
              "작업이 완료되지 않습니다.",
              "상태를 새로고침하고 재시도하거나 작업 ID와 함께 지원팀에 문의하세요.",
            ],
          ],
        },
      ],
    },
    support: {
      metaTitle: "지원 | AI Beauty Stylist",
      title: "문제에서 시작하는 지원",
      description:
        "무슨 일이 있었고 무엇을 기대했는지 알려 주세요. 추적 가능한 티켓을 생성합니다.",
      eyebrow: "지원",
      intro:
        "계정, 결제, 진단 또는 체험 문제는 명확하게 작성해 보내 주세요. 사진은 필요하지 않습니다.",
      formTitle: "지원 티켓 만들기",
      formDesc:
        "필수 항목이 표시됩니다. 비밀번호나 카드 정보를 입력하지 마세요.",
      name: "이름",
      email: "연락처 이메일",
      topic: "문제 유형",
      message: "무슨 일이 있었나요?",
      namePlaceholder: "어떻게 불러 드릴까요?",
      messagePlaceholder:
        "단계, 실제 결과, 예상 결과를 설명하고 필요한 경우 주문·작업 ID를 추가하세요.",
      choose: "문제 유형 선택",
      topics: [
        ["billing", "결제 및 구독"],
        ["tryon", "가상 체험 생성"],
        ["diagnosis", "AI 진단"],
        ["account", "계정 접근"],
        ["cooperation", "비즈니스 문의"],
        ["other", "기타 의견"],
      ],
      submit: "티켓 제출",
      submitting: "제출 중...",
      privacy: "제출하면 문의 답변을 위해 이 정보를 사용하는 데 동의합니다.",
      privacyLink: "개인정보 처리방침",
      successTitle: "티켓이 지원 대기열에 등록되었습니다",
      successBody: "확인을 위해 이 번호를 보관하세요:",
      another: "다른 문의 제출",
      directTitle: "제출 전 확인",
      directItems: [
        [
          "계정 보호",
          "비밀번호, 인증 코드 또는 전체 카드 정보를 보내지 마세요.",
        ],
        ["재현 정보", "페이지, 단계, 예상 결과 및 관련 ID를 포함하세요."],
        ["사진 문제", "셀피를 이메일로 보내지 않고 현상만 설명할 수 있습니다."],
      ],
      emailTitle: "이메일을 선호하나요?",
      emailBody: "같은 내용을 support@aibeautystylist.com으로 보내 주세요.",
      browseFaq: "자주 묻는 답변 보기",
      response:
        "문의는 순서대로 검토되며 복잡한 사례는 시간이 더 걸릴 수 있습니다.",
    },
  },
  "zh-TW": {
    about: {
      eyebrow: "關於產品",
      title: "做決定前，先把妝容方向看清楚",
      intro:
        "AI Beauty Stylist 幫助你在自己的照片上比較妝容、理解適合的原因，並把靈感轉成可執行的選擇。",
      primary: "開始試妝",
      secondary: "查看診斷",
      promiseTitle: "產品要解決什麼問題",
      promiseLead:
        "這是一個位於靈感與購買決策之間的視覺規劃工具，不保證真實妝效。",
      promises: [
        ["保留你的辨識度", "建議會配合可見的臉部特徵，而不是套用單一標準臉。"],
        ["更容易比較", "花費時間或金錢前，先確認色彩、質感與濃度。"],
        ["讓結果可執行", "診斷與妝容頁會說明具體的下一步。"],
      ],
      processTitle: "一次體驗如何完成",
      process: [
        ["選擇目標", "從場合、妝容或診斷問題開始。"],
        ["同意後上傳", "自拍只會在你確認後進入處理。"],
        ["帶著判斷查看", "把光線、產品、手法與螢幕色差納入考量。"],
      ],
      boundariesTitle: "明確的產品界線",
      boundariesLead: "可信的 AI 產品也要說清楚不能替你決定什麼。",
      boundaries: [
        ["不做醫療診斷", "產品不能取代醫療專業人員。"],
        ["不評分外貌", "我們不以單一美麗標準評量臉部。"],
        ["不保證完全色準", "相機、螢幕、光線與實體產品都會改變結果。"],
        ["不在未授權時使用照片", "照片只在同意後處理，並可刪除。"],
      ],
      trustTitle: "產品與資料承諾",
      trustLead: "重要規則會公開，讓你在上傳前查看。",
      trustLinks: [
        ["/privacy", "照片與隱私處理"],
        ["/ai-disclaimer", "AI 限制與適當使用"],
        ["/terms", "服務條款"],
        ["/support", "提出問題或取得協助"],
      ],
      ctaTitle: "從一個具體問題開始",
      ctaBody: "比較一個妝容，或先完成一次臉部診斷。",
    },
    faq: {
      copy: {
        metaTitle: "幫助中心 | AI Beauty Stylist",
        title: "先找到答案，再繼續完成任務",
        description: "集中解答試妝、診斷、照片、點數與訂閱問題。",
        eyebrow: "幫助中心",
        search: "搜尋幫助內容",
        searchPlaceholder: "搜尋照片、點數、訂閱...",
        noResults: "沒有符合的答案，請更換關鍵字或聯絡支援團隊。",
        supportTitle: "問題仍未解決？",
        supportBody:
          "建立支援工單，並寫清頁面、步驟、預期結果和相關任務或訂單編號。",
        supportCta: "聯絡支援",
      },
      groups: [
        {
          id: "getting-started",
          title: "使用產品",
          items: [
            [
              "AI Beauty Stylist 適合做什麼？",
              "它能在你的照片上比較妝容方向，並說明色彩、質感與上妝位置建議。",
            ],
            [
              "怎樣拍照比較合適？",
              "使用均勻正面光線、保持五官清楚，並避免強烈濾鏡。",
            ],
          ],
        },
        {
          id: "privacy",
          title: "照片與隱私",
          items: [
            [
              "自拍什麼時候會被處理？",
              "只有在你確認照片處理說明並開始上傳後。",
            ],
            [
              "可以刪除照片與結果嗎？",
              "可以。產品提供的刪除功能可移除原圖、結果與相關紀錄。",
            ],
          ],
        },
        {
          id: "billing",
          title: "點數與訂閱",
          items: [
            [
              "何時會使用點數？",
              "診斷或試妝成功生成時。瀏覽妝容不會消耗點數。",
            ],
            ["如何取消訂閱？", "登入後開啟帳戶，使用管理訂閱功能。"],
          ],
        },
        {
          id: "troubleshooting",
          title: "故障處理",
          items: [
            [
              "結果不像本人怎麼辦？",
              "請改用光線均勻、正面、無美顏濾鏡的清晰照片重試。",
            ],
            [
              "任務一直沒有完成怎麼辦？",
              "重新整理狀態、重試，或帶著任務編號聯絡支援。",
            ],
          ],
        },
      ],
    },
    support: {
      metaTitle: "聯絡支援 | AI Beauty Stylist",
      title: "從問題本身開始的支援",
      description: "告訴我們發生的情況與預期結果，系統會建立可追蹤的工單。",
      eyebrow: "支援中心",
      intro: "帳戶、帳單、診斷或試妝問題，請提交一則清楚的請求。無需上傳自拍。",
      formTitle: "建立支援工單",
      formDesc: "必填欄位已標示。請勿填寫密碼或完整卡片資訊。",
      name: "如何稱呼你",
      email: "聯絡電子郵件",
      topic: "問題類型",
      message: "發生了什麼？",
      namePlaceholder: "例如：林女士",
      messagePlaceholder:
        "說明操作步驟、實際結果與預期結果；必要時附上訂單或任務編號。",
      choose: "選擇問題類型",
      topics: [
        ["billing", "帳單與訂閱"],
        ["tryon", "試妝生成"],
        ["diagnosis", "AI 診斷"],
        ["account", "帳戶存取"],
        ["cooperation", "商務合作"],
        ["other", "其他意見"],
      ],
      submit: "提交工單",
      submitting: "提交中...",
      privacy: "提交即表示你同意我們使用這些資訊處理並回覆請求。",
      privacyLink: "隱私政策",
      successTitle: "工單已進入支援佇列",
      successBody: "後續聯絡請保留此工單編號：",
      another: "再提交一則",
      directTitle: "提交前請確認",
      directItems: [
        ["保護帳戶", "不要傳送密碼、驗證碼或完整卡片資訊。"],
        ["幫助我們重現", "寫清頁面、步驟、預期結果與相關編號。"],
        ["照片問題", "只需描述現象，不必透過電子郵件傳送自拍。"],
      ],
      emailTitle: "偏好電子郵件？",
      emailBody: "可將相同資訊寄至 support@aibeautystylist.com。",
      browseFaq: "先查看常見問題",
      response: "請求會依序處理；複雜案例可能需要更多時間。",
    },
  },
  "es-ES": {
    about: {
      eyebrow: "Sobre el producto",
      title: "Compara direcciones de maquillaje antes de decidir",
      intro:
        "AI Beauty Stylist muestra looks en tu foto, explica decisiones útiles y convierte la inspiración en un plan realista.",
      primary: "Probar un look",
      secondary: "Ver diagnóstico",
      promiseTitle: "Qué busca resolver el producto",
      promiseLead:
        "Una herramienta visual entre inspiración y compra, sin garantizar resultados reales.",
      promises: [
        [
          "Conservar tu identidad",
          "Las sugerencias trabajan con tus rasgos visibles, sin imponer un rostro estándar.",
        ],
        [
          "Comparar con facilidad",
          "Revisa color, acabado e intensidad antes de invertir tiempo o dinero.",
        ],
        [
          "Convertir resultados en acción",
          "Los diagnósticos y looks explican los próximos pasos.",
        ],
      ],
      processTitle: "Cómo funciona una sesión",
      process: [
        [
          "Elegir un objetivo",
          "Empieza por una ocasión, un look o una pregunta de diagnóstico.",
        ],
        [
          "Subir con consentimiento",
          "La selfie solo se procesa después de tu confirmación.",
        ],
        [
          "Revisar con criterio",
          "Ten en cuenta luz, productos, técnica y color de pantalla.",
        ],
      ],
      boundariesTitle: "Límites claros",
      boundariesLead: "La confianza exige explicar qué no puede decidir la IA.",
      boundaries: [
        [
          "No es diagnóstico médico",
          "El producto no sustituye a un profesional médico.",
        ],
        [
          "No puntúa el atractivo",
          "No clasificamos rostros según una norma universal.",
        ],
        [
          "No garantiza color perfecto",
          "Cámara, pantalla, luz y productos físicos cambian el resultado.",
        ],
        [
          "No usa fotos sin permiso",
          "Las fotos se procesan tras el consentimiento y se pueden borrar.",
        ],
      ],
      trustTitle: "Compromisos de producto y datos",
      trustLead:
        "Las reglas importantes están documentadas y disponibles antes de subir una foto.",
      trustLinks: [
        ["/privacy", "Fotos y privacidad"],
        ["/ai-disclaimer", "Límites y uso adecuado de IA"],
        ["/terms", "Términos del servicio"],
        ["/support", "Solicitar ayuda"],
      ],
      ctaTitle: "Empieza con una pregunta concreta",
      ctaBody: "Compara un look o ejecuta primero un diagnóstico facial.",
    },
    faq: {
      copy: {
        metaTitle: "Centro de ayuda | AI Beauty Stylist",
        title: "Encuentra la respuesta y sigue con tu tarea",
        description:
          "Respuestas sobre prueba virtual, diagnóstico, fotos, créditos y suscripción.",
        eyebrow: "Centro de ayuda",
        search: "Buscar en ayuda",
        searchPlaceholder: "Buscar fotos, créditos, suscripción...",
        noResults:
          "No hay respuestas coincidentes. Prueba otra palabra o contacta con soporte.",
        supportTitle: "¿Aún no se resolvió?",
        supportBody:
          "Crea un ticket con la página, pasos, resultado esperado y cualquier ID relevante.",
        supportCta: "Contactar con soporte",
      },
      groups: [
        {
          id: "getting-started",
          title: "Usar el producto",
          items: [
            [
              "¿Para qué sirve AI Beauty Stylist?",
              "Ayuda a comparar direcciones de maquillaje en tu foto y entender sugerencias de color, acabado y colocación.",
            ],
            [
              "¿Cómo debo tomar la foto?",
              "Usa luz frontal uniforme, deja visibles los rasgos y evita filtros intensos.",
            ],
          ],
        },
        {
          id: "privacy",
          title: "Fotos y privacidad",
          items: [
            [
              "¿Cuándo se procesa mi selfie?",
              "Solo después de confirmar el aviso de fotos e iniciar la subida.",
            ],
            [
              "¿Puedo borrar fotos y resultados?",
              "Sí. Los controles disponibles eliminan original, resultado y registros relacionados.",
            ],
          ],
        },
        {
          id: "billing",
          title: "Créditos y suscripción",
          items: [
            [
              "¿Cuándo se usa un crédito?",
              "Cuando un diagnóstico o prueba se genera correctamente. Explorar looks no consume créditos.",
            ],
            [
              "¿Cómo cancelo?",
              "Inicia sesión, abre tu cuenta y usa la gestión de suscripción.",
            ],
          ],
        },
        {
          id: "troubleshooting",
          title: "Solución de problemas",
          items: [
            [
              "El resultado no se parece a mí. ¿Qué hago?",
              "Vuelve a probar con una foto nítida, frontal, bien iluminada y sin filtro.",
            ],
            [
              "Una tarea está bloqueada. ¿Qué hago?",
              "Actualiza el estado, reintenta o contacta con soporte indicando el ID.",
            ],
          ],
        },
      ],
    },
    support: {
      metaTitle: "Soporte | AI Beauty Stylist",
      title: "Soporte que empieza por el problema",
      description:
        "Cuéntanos qué pasó y qué esperabas. Crearemos un ticket rastreable.",
      eyebrow: "Soporte",
      intro:
        "Para problemas de cuenta, pago, diagnóstico o prueba, envía una solicitud clara. No hace falta una foto.",
      formTitle: "Crear ticket de soporte",
      formDesc:
        "Los campos obligatorios están marcados. No incluyas contraseñas ni datos de tarjeta.",
      name: "Nombre",
      email: "Correo de contacto",
      topic: "Tipo de problema",
      message: "¿Qué pasó?",
      namePlaceholder: "¿Cómo debemos llamarte?",
      messagePlaceholder:
        "Describe pasos, resultado y expectativa. Incluye un ID de pedido o tarea si procede.",
      choose: "Elegir tipo",
      topics: [
        ["billing", "Pago y suscripción"],
        ["tryon", "Generación de prueba"],
        ["diagnosis", "Diagnóstico IA"],
        ["account", "Acceso a cuenta"],
        ["cooperation", "Consulta comercial"],
        ["other", "Otros comentarios"],
      ],
      submit: "Enviar ticket",
      submitting: "Enviando...",
      privacy: "Al enviar, aceptas que usemos esta información para responder.",
      privacyLink: "Política de privacidad",
      successTitle: "Tu ticket está en la cola de soporte",
      successBody: "Guarda este número:",
      another: "Enviar otra solicitud",
      directTitle: "Antes de enviar",
      directItems: [
        [
          "Protege tu cuenta",
          "Nunca envíes contraseñas, códigos o datos completos de tarjeta.",
        ],
        [
          "Ayúdanos a reproducirlo",
          "Incluye página, pasos, resultado esperado e IDs relevantes.",
        ],
        [
          "Problemas con fotos",
          "Describe el problema sin enviar tu selfie por correo.",
        ],
      ],
      emailTitle: "¿Prefieres correo?",
      emailBody: "Envía los mismos datos a support@aibeautystylist.com.",
      browseFaq: "Ver respuestas frecuentes",
      response:
        "Las solicitudes se revisan por orden; los casos complejos pueden tardar más.",
    },
  },
  "pt-BR": {
    about: {
      eyebrow: "Sobre o produto",
      title: "Compare direções de maquiagem antes de decidir",
      intro:
        "O AI Beauty Stylist mostra looks na sua foto, explica escolhas úteis e transforma inspiração em um plano realista.",
      primary: "Testar um look",
      secondary: "Ver diagnóstico",
      promiseTitle: "O que o produto busca resolver",
      promiseLead:
        "Uma ferramenta visual entre inspiração e compra, sem garantir resultados reais.",
      promises: [
        [
          "Preservar sua identidade",
          "As sugestões trabalham com seus traços visíveis, sem impor um rosto padrão.",
        ],
        [
          "Comparar com facilidade",
          "Confira cor, acabamento e intensidade antes de investir tempo ou dinheiro.",
        ],
        [
          "Transformar resultado em ação",
          "Diagnósticos e páginas de look explicam os próximos passos.",
        ],
      ],
      processTitle: "Como funciona uma sessão",
      process: [
        [
          "Escolher um objetivo",
          "Comece por uma ocasião, um look ou uma pergunta de diagnóstico.",
        ],
        [
          "Enviar com consentimento",
          "A selfie só é processada após sua confirmação.",
        ],
        [
          "Avaliar com critério",
          "Considere luz, produtos, técnica e cor da tela.",
        ],
      ],
      boundariesTitle: "Limites claros",
      boundariesLead: "Confiança exige explicar o que a IA não pode decidir.",
      boundaries: [
        [
          "Não é diagnóstico médico",
          "O produto não substitui um profissional de saúde.",
        ],
        [
          "Não dá nota de beleza",
          "Não classificamos rostos por um padrão universal.",
        ],
        [
          "Não garante cor perfeita",
          "Câmera, tela, luz e produtos físicos alteram o resultado.",
        ],
        [
          "Não usa fotos sem permissão",
          "Fotos são processadas após consentimento e podem ser excluídas.",
        ],
      ],
      trustTitle: "Compromissos de produto e dados",
      trustLead:
        "As regras importantes são documentadas e podem ser lidas antes do envio.",
      trustLinks: [
        ["/privacy", "Fotos e privacidade"],
        ["/ai-disclaimer", "Limites e uso adequado de IA"],
        ["/terms", "Termos de serviço"],
        ["/support", "Solicitar ajuda"],
      ],
      ctaTitle: "Comece com uma pergunta concreta",
      ctaBody: "Compare um look ou faça primeiro um diagnóstico facial.",
    },
    faq: {
      copy: {
        metaTitle: "Central de ajuda | AI Beauty Stylist",
        title: "Encontre a resposta e continue sua tarefa",
        description:
          "Respostas sobre teste virtual, diagnóstico, fotos, créditos e assinatura.",
        eyebrow: "Central de ajuda",
        search: "Buscar ajuda",
        searchPlaceholder: "Buscar fotos, créditos, assinatura...",
        noResults:
          "Nenhuma resposta encontrada. Tente outra palavra ou fale com o suporte.",
        supportTitle: "Ainda não resolveu?",
        supportBody:
          "Crie um ticket com página, passos, resultado esperado e IDs relevantes.",
        supportCta: "Falar com o suporte",
      },
      groups: [
        {
          id: "getting-started",
          title: "Usar o produto",
          items: [
            [
              "Para que serve o AI Beauty Stylist?",
              "Ajuda a comparar direções de maquiagem na sua foto e entender sugestões de cor, acabamento e posicionamento.",
            ],
            [
              "Como devo tirar a foto?",
              "Use luz frontal uniforme, deixe os traços visíveis e evite filtros fortes.",
            ],
          ],
        },
        {
          id: "privacy",
          title: "Fotos e privacidade",
          items: [
            [
              "Quando minha selfie é processada?",
              "Somente após confirmar o aviso de fotos e iniciar o envio.",
            ],
            [
              "Posso excluir fotos e resultados?",
              "Sim. Os controles disponíveis removem original, resultado e registros relacionados.",
            ],
          ],
        },
        {
          id: "billing",
          title: "Créditos e assinatura",
          items: [
            [
              "Quando um crédito é usado?",
              "Quando um diagnóstico ou teste é gerado com sucesso. Explorar looks não usa créditos.",
            ],
            [
              "Como cancelar?",
              "Entre, abra sua conta e use o gerenciamento da assinatura.",
            ],
          ],
        },
        {
          id: "troubleshooting",
          title: "Solução de problemas",
          items: [
            [
              "O resultado não parece comigo. O que fazer?",
              "Tente uma foto nítida, frontal, bem iluminada e sem filtro.",
            ],
            [
              "Uma tarefa está travada. O que fazer?",
              "Atualize o status, tente novamente ou fale com o suporte informando o ID.",
            ],
          ],
        },
      ],
    },
    support: {
      metaTitle: "Suporte | AI Beauty Stylist",
      title: "Suporte que começa pelo problema",
      description:
        "Conte o que aconteceu e o que esperava. Criaremos um ticket rastreável.",
      eyebrow: "Suporte",
      intro:
        "Para problemas de conta, cobrança, diagnóstico ou teste, envie uma solicitação clara. Não é preciso foto.",
      formTitle: "Criar ticket de suporte",
      formDesc:
        "Campos obrigatórios estão marcados. Não inclua senhas nem dados do cartão.",
      name: "Nome",
      email: "E-mail de contato",
      topic: "Tipo de problema",
      message: "O que aconteceu?",
      namePlaceholder: "Como devemos chamar você?",
      messagePlaceholder:
        "Descreva passos, resultado e expectativa. Inclua ID de pedido ou tarefa se necessário.",
      choose: "Escolher tipo",
      topics: [
        ["billing", "Cobrança e assinatura"],
        ["tryon", "Geração de teste"],
        ["diagnosis", "Diagnóstico por IA"],
        ["account", "Acesso à conta"],
        ["cooperation", "Consulta comercial"],
        ["other", "Outro comentário"],
      ],
      submit: "Enviar ticket",
      submitting: "Enviando...",
      privacy:
        "Ao enviar, você concorda com o uso destas informações para responder.",
      privacyLink: "Política de privacidade",
      successTitle: "Seu ticket está na fila de suporte",
      successBody: "Guarde este número:",
      another: "Enviar outra solicitação",
      directTitle: "Antes de enviar",
      directItems: [
        [
          "Proteja sua conta",
          "Nunca envie senhas, códigos ou dados completos do cartão.",
        ],
        [
          "Ajude a reproduzir",
          "Inclua página, passos, resultado esperado e IDs relevantes.",
        ],
        [
          "Problemas com fotos",
          "Descreva o problema sem enviar sua selfie por e-mail.",
        ],
      ],
      emailTitle: "Prefere e-mail?",
      emailBody: "Envie os mesmos detalhes para support@aibeautystylist.com.",
      browseFaq: "Ver respostas frequentes",
      response:
        "Solicitações são analisadas em ordem; casos complexos podem levar mais tempo.",
    },
  },
};

localized["es-419"] = localized["es-ES"];

export function getLocalizedAboutContent(
  locale: SupportedLocale,
): AboutContent | undefined {
  return localized[locale]?.about;
}

export function getLocalizedFaqContent(
  locale: SupportedLocale,
): FaqContent | undefined {
  return localized[locale]?.faq;
}

export function getLocalizedSupportContent(
  locale: SupportedLocale,
): SupportContent | undefined {
  return localized[locale]?.support;
}
