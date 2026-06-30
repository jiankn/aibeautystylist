import type { SupportedLocale } from "../lib/i18n";

export interface LegalSection {
  readonly title: string;
  readonly body: string;
}

export interface LegalDocumentContent {
  readonly title: string;
  readonly description: string;
  readonly sections: readonly LegalSection[];
}

export interface LegalLocaleContent {
  readonly badge: string;
  readonly updatedLabel: string;
  readonly updated: string;
  readonly privacy: LegalDocumentContent;
  readonly terms: LegalDocumentContent;
  readonly disclaimer: LegalDocumentContent;
}

const content: Record<SupportedLocale, LegalLocaleContent> = {
  en: {
    badge: "Legal & privacy",
    updatedLabel: "Updated",
    updated: "June 30, 2026",
    privacy: {
      title: "Privacy Policy",
      description:
        "How AI Beauty Stylist handles selfies, generated results, account data, and service usage.",
      sections: [
        {
          title: "1. Scope and data controller",
          body: "This policy covers AI Beauty Stylist's discovery, diagnosis, try-on, sharing, account, support, and subscription features. Privacy requests can be sent to support@aibeautystylist.com.",
        },
        {
          title: "2. Data we process",
          body: "We process photos you choose to upload, generated results, diagnosis records, account and session identifiers, selected looks, task status, credits, support requests, and necessary security or error logs. Payment providers process card details; we do not store full card numbers.",
        },
        {
          title: "3. Why and how we use data",
          body: "Photos are processed only to provide a diagnosis or try-on you request. We do not use uploaded selfies for identity recognition, medical decisions, or model training without separate authorization.",
        },
        {
          title: "4. Retention, deletion, and sharing",
          body: "Selfies and other one-time original photos are deleted as soon as operationally practical and no later than 30 days under the storage lifecycle policy. A Premium reference template is private to its owner and remains available for reuse until the owner deletes it; deleting the template removes its stored reference image. Private-reference results cannot be published through our sharing tools. Product controls let you delete related results and records. We share only the minimum necessary data with vetted infrastructure, AI, storage, payment, and email providers.",
        },
        {
          title: "5. Cookies, rights, and contact",
          body: "Necessary cookies and local storage keep sessions, ownership, credits, and consent preferences working. You may request access, correction, deletion, or withdrawal of consent where applicable by contacting support@aibeautystylist.com.",
        },
      ],
    },
    terms: {
      title: "Terms of Service",
      description:
        "The rules, responsibilities, subscription terms, and service limits for AI Beauty Stylist.",
      sections: [
        {
          title: "1. Service and eligibility",
          body: "AI Beauty Stylist provides makeup discovery, AI diagnosis, virtual try-on, tutorials, and product suggestions. You must be legally able to use the service and may upload only photos you have permission to process.",
        },
        {
          title: "2. Acceptable use",
          body: "Do not use the service for identity recognition, medical or other high-risk decisions, harassment, unlawful content, security bypasses, bulk scraping, resale, reverse engineering, or disruption.",
        },
        {
          title: "3. AI output and user responsibility",
          body: "Generated content can be inaccurate and does not guarantee real-world makeup results. Review suggestions critically and verify product ingredients, suitability, and safety before use.",
        },
        {
          title: "4. Plans, credits, cancellation, and refunds",
          body: "The checkout page shows the binding plan, price, renewal period, and benefits. Subscription fees are generally non-refundable once AI generation credits or paid features have been used, except where required by law or approved after review. Cancellation stops the next renewal while current-period access remains. Failed, timed-out, or system-canceled generations return credits automatically; completed generations consume credits even if the result is not preferred.",
        },
        {
          title: "5. Rights, changes, and contact",
          body: "You retain rights to content you lawfully upload and grant us a limited license to process it for the requested service. We may change features for security, compliance, or product improvement. Questions can be sent to support@aibeautystylist.com.",
        },
      ],
    },
    disclaimer: {
      title: "AI Disclaimer",
      description:
        "Important limitations of AI analysis, makeup suggestions, and virtual try-on results.",
      sections: [
        {
          title: "1. Not medical or professional advice",
          body: "Skin-tone direction, facial observations, makeup placement, and product suggestions are beauty references only. They are not medical diagnoses, skin-health assessments, or professional advice.",
        },
        {
          title: "2. Results can be inaccurate",
          body: "Lighting, cameras, displays, pose, occlusion, skin texture, and model limitations can change colors, proportions, texture, and the perceived result.",
        },
        {
          title: "3. Reference images and generated results",
          body: "Catalog images demonstrate a makeup direction and are not generated from your selfie. Try-on results are generated for a specific task. Both are references rather than guarantees.",
        },
        {
          title: "4. Fairness and confidence",
          body: "AI quality can vary across skin tones, facial features, ages, and photo conditions. Stop relying on a result that appears unreasonable and retry with a clearer, evenly lit photo.",
        },
        {
          title: "5. Product and allergy safety",
          body: "Product and shade suggestions do not guarantee suitability, availability, or safety. Check ingredients, patch test where appropriate, and stop use if irritation occurs.",
        },
      ],
    },
  },
  "zh-CN": {
    badge: "法律与隐私",
    updatedLabel: "更新日期",
    updated: "2026 年 6 月 30 日",
    privacy: {
      title: "隐私政策",
      description:
        "说明 AI Beauty Stylist 如何处理自拍、生成结果、账户数据和服务使用信息。",
      sections: [
        {
          title: "1. 适用范围与联系渠道",
          body: "本政策适用于妆容发现、诊断、试妆、分享、账户、支持和订阅功能。隐私请求可发送至 support@aibeautystylist.com。",
        },
        {
          title: "2. 我们处理的数据",
          body: "我们会处理你主动上传的照片、生成结果、诊断记录、账户与会话标识、所选妆容、任务状态、额度、支持请求及必要的安全或错误日志。银行卡信息由支付服务商处理，我们不保存完整卡号。",
        },
        {
          title: "3. 数据用途与限制",
          body: "照片仅用于完成你主动发起的诊断或试妆。未经单独授权，我们不会将自拍用于身份识别、医疗判断或模型训练。",
        },
        {
          title: "4. 保存、删除与共享",
          body: "自拍及其他一次性原始照片会在运行允许的情况下尽快删除，并由存储生命周期策略保证最长不超过 30 天。Premium 私有参考妆容模板仅限账户本人访问，并会保留至本人主动删除；删除模板时会同时移除其参考图片。私有参考妆容的生成结果不能通过本站分享工具公开。你可通过产品入口删除相关结果和记录。我们仅向经过审核的基础设施、AI、存储、支付和邮件服务商提供完成服务所必需的数据。",
        },
        {
          title: "5. Cookie、用户权利与联系",
          body: "必要 Cookie 和本地存储用于维持会话、资源归属、额度和同意偏好。你可通过 support@aibeautystylist.com 提出访问、更正、删除或撤回同意等适用请求。",
        },
      ],
    },
    terms: {
      title: "服务条款",
      description:
        "使用 AI Beauty Stylist 时适用的规则、用户责任、订阅条款和服务边界。",
      sections: [
        {
          title: "1. 服务与使用资格",
          body: "AI Beauty Stylist 提供妆容发现、AI 诊断、虚拟试妆、教程和产品建议。你应具备合法使用服务的资格，并仅上传自己有权处理的照片。",
        },
        {
          title: "2. 可接受使用规则",
          body: "不得将服务用于身份识别、医疗或其他高风险决策、骚扰、违法内容、安全绕过、批量抓取、转售、逆向工程或干扰服务运行。",
        },
        {
          title: "3. AI 输出与用户责任",
          body: "生成内容可能不准确，也不保证现实上妆效果。采用建议前请自行判断，并核对产品成分、适用性与安全性。",
        },
        {
          title: "4. 计划、额度、取消与退款",
          body: "结账页展示的计划、价格、续费周期和权益为准。订阅费用在已使用 AI 生成额度或付费权益后通常不予退款，除非适用法律要求或经人工审核批准。取消订阅会停止下一次续费，当前已付周期权益继续保留。失败、超时或系统取消的生成任务会自动返还额度；已完成生成的任务即使结果不符合预期，也会消耗额度。",
        },
        {
          title: "5. 权利、变更与联系",
          body: "你保留对合法上传内容的权利，并授予我们为完成所请求服务而处理内容的有限许可。我们可能因安全、合规或产品改进调整功能。问题可发送至 support@aibeautystylist.com。",
        },
      ],
    },
    disclaimer: {
      title: "AI 免责声明",
      description: "请了解 AI 分析、妆容建议和虚拟试妆结果的重要局限。",
      sections: [
        {
          title: "1. 非医疗或专业意见",
          body: "肤色方向、面部观察、上妆位置和产品建议仅供美妆参考，不构成医疗诊断、皮肤健康判断或专业意见。",
        },
        {
          title: "2. 结果可能不准确",
          body: "光线、相机、显示器、姿态、遮挡、肤质和模型能力都会影响颜色、比例、质感和最终观感。",
        },
        {
          title: "3. 参考图与生成结果",
          body: "妆容库图片用于展示妆容方向，并非根据你的自拍生成；试妆结果针对具体任务生成。两者均为参考，不作效果保证。",
        },
        {
          title: "4. 公平性与置信度",
          body: "AI 在不同肤色、五官特征、年龄和拍摄条件下的表现可能不同。结果明显不合理时，请停止依赖并换用光线均匀的清晰照片重试。",
        },
        {
          title: "5. 产品与过敏安全",
          body: "产品和色号建议不保证适配、库存或安全。请核对成分，必要时进行局部测试，出现刺激时立即停止使用。",
        },
      ],
    },
  },
  "zh-TW": {
    badge: "法律與隱私",
    updatedLabel: "更新日期",
    updated: "2026 年 6 月 30 日",
    privacy: {
      title: "隱私政策",
      description:
        "說明 AI Beauty Stylist 如何處理自拍、生成結果、帳戶資料與服務使用資訊。",
      sections: [
        {
          title: "1. 適用範圍與聯絡方式",
          body: "本政策適用於妝容探索、診斷、試妝、分享、帳戶、支援與訂閱功能。隱私請求可寄至 support@aibeautystylist.com。",
        },
        {
          title: "2. 我們處理的資料",
          body: "我們處理你主動上傳的照片、生成結果、診斷紀錄、帳戶與工作階段識別碼、所選妝容、任務狀態、點數、支援請求及必要的安全或錯誤日誌。卡片資料由付款服務商處理，我們不保存完整卡號。",
        },
        {
          title: "3. 資料用途與限制",
          body: "照片僅用於完成你主動發起的診斷或試妝。未經額外授權，我們不會將自拍用於身分辨識、醫療判斷或模型訓練。",
        },
        {
          title: "4. 保存、刪除與分享",
          body: "自拍及其他一次性原始照片會在作業允許時儘快刪除，且依儲存生命週期政策最長不超過 30 天。Premium 私人參考妝容範本僅限帳戶本人存取，並保留至本人主動刪除；刪除範本時會一併移除參考圖片。私人參考妝容結果不能透過本站分享工具公開。你可透過產品控制刪除相關結果與紀錄。我們只向經審核的服務商提供完成服務所需的最少資料。",
        },
        {
          title: "5. Cookie、權利與聯絡",
          body: "必要 Cookie 與本機儲存用於維持工作階段、資源歸屬、點數與同意偏好。你可透過 support@aibeautystylist.com 提出適用的存取、更正、刪除或撤回同意請求。",
        },
      ],
    },
    terms: {
      title: "服務條款",
      description:
        "使用 AI Beauty Stylist 時適用的規則、使用者責任、訂閱條款與服務限制。",
      sections: [
        {
          title: "1. 服務與使用資格",
          body: "AI Beauty Stylist 提供妝容探索、AI 診斷、虛擬試妝、教學與產品建議。你必須具備合法使用服務的資格，且只能上傳你有權處理的照片。",
        },
        {
          title: "2. 可接受使用規則",
          body: "不得將服務用於身分辨識、醫療或其他高風險決策、騷擾、違法內容、安全繞過、大量擷取、轉售、逆向工程或干擾服務。",
        },
        {
          title: "3. AI 輸出與使用者責任",
          body: "生成內容可能不準確，也不保證真實上妝效果。採用建議前請自行判斷，並確認產品成分、適用性與安全性。",
        },
        {
          title: "4. 方案、點數、取消與退款",
          body: "以結帳頁顯示的方案、價格、續訂週期與權益為準。訂閱費用在已使用 AI 生成點數或付費權益後通常不予退款，除非適用法律要求或經人工審核批准。取消訂閱會停止下一次續費，目前已付週期權益繼續保留。失敗、逾時或系統取消的生成任務會自動返還點數；已完成生成的任務即使結果不符合預期，也會消耗點數。",
        },
        {
          title: "5. 權利、變更與聯絡",
          body: "你保留合法上傳內容的權利，並授予我們為提供所請求服務而處理內容的有限授權。問題可寄至 support@aibeautystylist.com。",
        },
      ],
    },
    disclaimer: {
      title: "AI 免責聲明",
      description: "請了解 AI 分析、妝容建議與虛擬試妝結果的重要限制。",
      sections: [
        {
          title: "1. 非醫療或專業意見",
          body: "膚色方向、臉部觀察、上妝位置與產品建議僅供美妝參考，不構成醫療診斷、皮膚健康判斷或專業意見。",
        },
        {
          title: "2. 結果可能不準確",
          body: "光線、相機、螢幕、姿勢、遮擋、膚質與模型限制都可能影響顏色、比例、質感與觀感。",
        },
        {
          title: "3. 參考圖與生成結果",
          body: "妝容庫圖片用於展示妝容方向，並非依你的自拍生成；試妝結果則針對特定任務生成。兩者皆為參考，不保證實際效果。",
        },
        {
          title: "4. 公平性與置信度",
          body: "AI 在不同膚色、臉部特徵、年齡與拍攝條件下的表現可能不同。結果明顯不合理時，請停止依賴並改用光線均勻的清晰照片重試。",
        },
        {
          title: "5. 產品與過敏安全",
          body: "產品與色號建議不保證適合、供貨或安全。請確認成分，必要時進行局部測試，發生刺激時立即停止使用。",
        },
      ],
    },
  },
  "de-DE": {
    badge: "Rechtliches & Datenschutz",
    updatedLabel: "Aktualisiert",
    updated: "30. Juni 2026",
    privacy: {
      title: "Datenschutzerklärung",
      description:
        "Wie AI Beauty Stylist Selfies, Ergebnisse, Kontodaten und Nutzungsdaten verarbeitet.",
      sections: [
        {
          title: "1. Geltungsbereich und Kontakt",
          body: "Diese Erklärung gilt für Entdecken, Diagnose, Try-on, Teilen, Konto, Support und Abonnements. Datenschutzanfragen gehen an support@aibeautystylist.com.",
        },
        {
          title: "2. Verarbeitete Daten",
          body: "Wir verarbeiten freiwillig hochgeladene Fotos, generierte Ergebnisse, Diagnosen, Konto- und Sitzungskennungen, ausgewählte Looks, Aufgabenstatus, Credits, Supportanfragen sowie notwendige Sicherheits- und Fehlerprotokolle. Vollständige Kartendaten speichern wir nicht.",
        },
        {
          title: "3. Zweck und Grenzen",
          body: "Fotos werden nur für eine von dir gestartete Diagnose oder ein Try-on verarbeitet. Ohne separate Einwilligung nutzen wir Selfies weder zur Identitätserkennung noch für medizinische Entscheidungen oder Modelltraining.",
        },
        {
          title: "4. Aufbewahrung, Löschung und Weitergabe",
          body: "Selfies und andere einmalig verwendete Originalfotos werden so schnell wie möglich und spätestens nach 30 Tagen gelöscht. Eine private Premium-Referenzvorlage ist nur für den Kontoinhaber zugänglich und bleibt bis zur Löschung durch ihn gespeichert; dabei wird auch das Referenzbild entfernt. Ergebnisse aus privaten Referenzen können nicht über unsere Freigabefunktionen veröffentlicht werden. Dienstleister erhalten nur die für den Dienst nötigen Daten.",
        },
        {
          title: "5. Cookies, Rechte und Kontakt",
          body: "Notwendige Cookies und lokaler Speicher sichern Sitzungen, Eigentum, Credits und Einwilligungen. Anfragen zu Auskunft, Berichtigung, Löschung oder Widerruf sendest du an support@aibeautystylist.com.",
        },
      ],
    },
    terms: {
      title: "Nutzungsbedingungen",
      description:
        "Regeln, Verantwortung, Abonnements und Grenzen von AI Beauty Stylist.",
      sections: [
        {
          title: "1. Dienst und Berechtigung",
          body: "AI Beauty Stylist bietet Make-up-Entdeckung, KI-Diagnose, virtuelles Try-on, Tutorials und Produkthinweise. Lade nur Fotos hoch, die du rechtmäßig verarbeiten darfst.",
        },
        {
          title: "2. Zulässige Nutzung",
          body: "Untersagt sind Identitätserkennung, medizinische oder andere Hochrisikoentscheidungen, Belästigung, rechtswidrige Inhalte, Umgehung von Sicherheit, Massenabruf, Weiterverkauf, Reverse Engineering und Störung des Dienstes.",
        },
        {
          title: "3. KI-Ergebnisse und Verantwortung",
          body: "Generierte Inhalte können ungenau sein und garantieren kein reales Make-up-Ergebnis. Prüfe Empfehlungen kritisch sowie Inhaltsstoffe, Eignung und Sicherheit eines Produkts.",
        },
        {
          title: "4. Pläne, Credits, Kündigung und Erstattung",
          body: "Maßgeblich sind Plan, Preis, Verlängerung und Leistungen im Checkout. Abogebühren sind in der Regel nicht erstattungsfähig, sobald KI-Generierungscredits oder kostenpflichtige Funktionen genutzt wurden, außer wenn geltendes Recht es verlangt oder eine Prüfung dies genehmigt. Eine Kündigung stoppt die nächste Verlängerung, während der Zugang im laufenden Zeitraum erhalten bleibt. Fehlgeschlagene, zeitüberschrittene oder vom System abgebrochene Generierungen geben Credits automatisch zurück; abgeschlossene Generierungen verbrauchen Credits, auch wenn das Ergebnis nicht gefällt.",
        },
        {
          title: "5. Rechte, Änderungen und Kontakt",
          body: "Du behältst Rechte an rechtmäßig hochgeladenen Inhalten und erteilst uns eine begrenzte Verarbeitungslizenz. Fragen gehen an support@aibeautystylist.com.",
        },
      ],
    },
    disclaimer: {
      title: "KI-Haftungsausschluss",
      description:
        "Wichtige Grenzen von KI-Analyse, Make-up-Empfehlungen und virtuellem Try-on.",
      sections: [
        {
          title: "1. Keine medizinische Beratung",
          body: "Hautton, Gesichtsbeobachtungen, Platzierung und Produkthinweise sind reine Beauty-Referenzen und keine medizinische Diagnose oder professionelle Beratung.",
        },
        {
          title: "2. Ergebnisse können ungenau sein",
          body: "Licht, Kamera, Bildschirm, Pose, Verdeckungen, Hautstruktur und Modellgrenzen können Farbe, Proportion und Textur verändern.",
        },
        {
          title: "3. Referenzen und generierte Ergebnisse",
          body: "Katalogbilder zeigen eine Make-up-Richtung und stammen nicht von deinem Selfie. Try-on-Ergebnisse werden für eine konkrete Aufgabe erzeugt. Beides sind Referenzen ohne Garantie.",
        },
        {
          title: "4. Fairness und Verlässlichkeit",
          body: "Die Qualität kann je nach Hautton, Gesichtszügen, Alter und Foto variieren. Verlasse dich nicht auf offensichtlich unplausible Ergebnisse und versuche es mit einem klareren Foto erneut.",
        },
        {
          title: "5. Produkt- und Allergiesicherheit",
          body: "Produkt- und Farbhinweise garantieren weder Eignung noch Verfügbarkeit oder Sicherheit. Prüfe Inhaltsstoffe, teste bei Bedarf lokal und beende die Nutzung bei Reizungen.",
        },
      ],
    },
  },
  "fr-FR": {
    badge: "Juridique et confidentialité",
    updatedLabel: "Mise à jour",
    updated: "30 juin 2026",
    privacy: {
      title: "Politique de confidentialité",
      description:
        "Comment AI Beauty Stylist traite les selfies, résultats, comptes et données d'utilisation.",
      sections: [
        {
          title: "1. Champ d'application et contact",
          body: "Cette politique couvre la découverte, le diagnostic, l'essai virtuel, le partage, le compte, l'assistance et l'abonnement. Écrivez à support@aibeautystylist.com pour toute demande liée à la confidentialité.",
        },
        {
          title: "2. Données traitées",
          body: "Nous traitons les photos envoyées volontairement, résultats générés, diagnostics, identifiants de compte et de session, looks choisis, état des tâches, crédits, demandes d'assistance et journaux nécessaires. Nous ne conservons pas les numéros de carte complets.",
        },
        {
          title: "3. Finalité et limites",
          body: "Les photos servent uniquement au diagnostic ou à l'essai demandé. Sans autorisation distincte, nous ne les utilisons ni pour reconnaître une identité, ni pour une décision médicale, ni pour entraîner un modèle.",
        },
        {
          title: "4. Conservation, suppression et partage",
          body: "Les selfies et autres photos originales à usage unique sont supprimés dès que possible et au plus tard sous 30 jours. Un modèle de référence Premium privé n'est accessible qu'à son propriétaire et reste enregistré jusqu'à ce qu'il le supprime, ce qui supprime aussi l'image de référence. Les résultats issus d'une référence privée ne peuvent pas être publiés avec nos outils de partage. Les prestataires ne reçoivent que les données nécessaires au service.",
        },
        {
          title: "5. Cookies, droits et contact",
          body: "Les cookies nécessaires et le stockage local maintiennent les sessions, droits d'accès, crédits et préférences. Pour exercer vos droits applicables, contactez support@aibeautystylist.com.",
        },
      ],
    },
    terms: {
      title: "Conditions d'utilisation",
      description:
        "Règles, responsabilités, abonnements et limites du service AI Beauty Stylist.",
      sections: [
        {
          title: "1. Service et éligibilité",
          body: "AI Beauty Stylist propose découverte, diagnostic IA, essai virtuel, tutoriels et suggestions produit. Vous devez avoir le droit d'utiliser le service et de traiter les photos envoyées.",
        },
        {
          title: "2. Utilisation acceptable",
          body: "Sont interdits la reconnaissance d'identité, les décisions médicales ou à haut risque, le harcèlement, les contenus illégaux, le contournement de sécurité, l'extraction massive, la revente, la rétro-ingénierie et la perturbation du service.",
        },
        {
          title: "3. Résultats IA et responsabilité",
          body: "Les contenus générés peuvent être inexacts et ne garantissent pas un résultat réel. Vérifiez les recommandations, ingrédients, compatibilités et règles de sécurité.",
        },
        {
          title: "4. Offres, crédits, résiliation et remboursement",
          body: "L'offre, le prix, le renouvellement et les avantages affichés au paiement font foi. Les frais d’abonnement ne sont généralement pas remboursables une fois que des crédits de génération IA ou des fonctionnalités payantes ont été utilisés, sauf obligation légale ou approbation après examen. La résiliation bloque le prochain renouvellement tout en conservant l’accès jusqu’à la fin de la période en cours. Les générations échouées, expirées ou annulées par le système restituent automatiquement les crédits; les générations terminées consomment des crédits même si le résultat ne vous convient pas.",
        },
        {
          title: "5. Droits, modifications et contact",
          body: "Vous conservez vos droits sur les contenus envoyés légalement et nous accordez une licence limitée pour fournir le service demandé. Questions : support@aibeautystylist.com.",
        },
      ],
    },
    disclaimer: {
      title: "Avertissement relatif à l'IA",
      description:
        "Limites importantes de l'analyse IA, des conseils maquillage et de l'essai virtuel.",
      sections: [
        {
          title: "1. Aucun avis médical",
          body: "Sous-ton, observations du visage, placement et produits sont des références beauté uniquement, sans valeur de diagnostic médical ni d'avis professionnel.",
        },
        {
          title: "2. Résultats potentiellement inexacts",
          body: "Lumière, caméra, écran, pose, occultations, texture de peau et limites du modèle peuvent modifier couleurs, proportions et rendu.",
        },
        {
          title: "3. Images de référence et résultats générés",
          body: "Les images du catalogue illustrent une direction et ne viennent pas de votre selfie. Les essais sont générés pour une tâche précise. Aucun ne garantit le résultat réel.",
        },
        {
          title: "4. Équité et fiabilité",
          body: "La qualité peut varier selon le teint, les traits, l'âge et la photo. Ne vous fiez pas à un résultat manifestement incohérent et réessayez avec une photo nette.",
        },
        {
          title: "5. Produits et allergies",
          body: "Les suggestions ne garantissent ni compatibilité, ni disponibilité, ni sécurité. Vérifiez les ingrédients, faites un test local si nécessaire et cessez l'utilisation en cas d'irritation.",
        },
      ],
    },
  },
  "ja-JP": {
    badge: "法務・プライバシー",
    updatedLabel: "更新日",
    updated: "2026年6月30日",
    privacy: {
      title: "プライバシーポリシー",
      description:
        "AI Beauty Stylist がセルフィー、生成結果、アカウント情報、利用情報を扱う方法。",
      sections: [
        {
          title: "1. 対象範囲と連絡先",
          body: "本ポリシーは、メイク探索、診断、バーチャル試着、共有、アカウント、サポート、サブスクリプションに適用されます。プライバシーに関する連絡先は support@aibeautystylist.com です。",
        },
        {
          title: "2. 処理するデータ",
          body: "任意でアップロードした写真、生成結果、診断記録、アカウント・セッション識別子、選択したメイク、タスク状態、クレジット、問い合わせ、必要なセキュリティ・エラーログを処理します。完全なカード番号は保存しません。",
        },
        {
          title: "3. 利用目的と制限",
          body: "写真は、利用者が依頼した診断または試着の提供にのみ使用します。別途許可がない限り、本人識別、医療判断、モデル学習には使用しません。",
        },
        {
          title: "4. 保存、削除、共有",
          body: "セルフィーなど一度だけ使用する元写真は、運用上可能な限り早く、遅くとも30日以内に削除します。Premium の非公開参照テンプレートは所有者だけがアクセスでき、所有者が削除するまで保存されます。削除時には参照画像も消去されます。非公開参照から生成した結果は当社の共有機能では公開できません。委託先にはサービス提供に必要な最小限のデータのみ共有します。",
        },
        {
          title: "5. Cookie、権利、連絡先",
          body: "必要な Cookie とローカルストレージは、セッション、所有権、クレジット、同意設定の維持に使います。適用される権利の請求は support@aibeautystylist.com へお送りください。",
        },
      ],
    },
    terms: {
      title: "利用規約",
      description:
        "AI Beauty Stylist を利用する際のルール、責任、サブスクリプション、サービス上の制限。",
      sections: [
        {
          title: "1. サービスと利用資格",
          body: "AI Beauty Stylist はメイク探索、AI診断、バーチャル試着、チュートリアル、商品提案を提供します。処理する権利を持つ写真のみアップロードしてください。",
        },
        {
          title: "2. 禁止される利用",
          body: "本人識別、医療その他の高リスク判断、嫌がらせ、違法コンテンツ、セキュリティ回避、大量取得、転売、リバースエンジニアリング、サービス妨害は禁止です。",
        },
        {
          title: "3. AI出力と利用者の責任",
          body: "生成内容は不正確な場合があり、実際のメイク結果を保証しません。提案を慎重に確認し、商品の成分、適合性、安全性を確認してください。",
        },
        {
          title: "4. プラン、クレジット、解約、返金",
          body: "決済画面に表示されるプラン、価格、更新期間、特典が適用されます。AI生成クレジットまたは有料機能の利用後、サブスクリプション料金は原則返金されません。ただし、適用法で求められる場合、または審査後に承認された場合を除きます。解約すると次回更新は停止し、現在の支払済み期間のアクセスは維持されます。失敗、タイムアウト、システムによるキャンセルの生成は自動でクレジットを返却します。完了した生成は、結果が希望と異なる場合でもクレジットを消費します。",
        },
        {
          title: "5. 権利、変更、連絡先",
          body: "適法にアップロードした内容の権利は利用者に残り、依頼されたサービス提供に必要な限定的処理許諾を当社に付与します。お問い合わせは support@aibeautystylist.com へ。",
        },
      ],
    },
    disclaimer: {
      title: "AIに関する免責事項",
      description: "AI分析、メイク提案、バーチャル試着結果に関する重要な制限。",
      sections: [
        {
          title: "1. 医療・専門的助言ではありません",
          body: "肌色の方向、顔の観察、配置、商品提案は美容上の参考であり、医療診断、肌の健康判断、専門的助言ではありません。",
        },
        {
          title: "2. 結果が不正確な場合があります",
          body: "光、カメラ、画面、姿勢、遮蔽、肌質、モデルの制限により、色、比率、質感、見え方が変化します。",
        },
        {
          title: "3. 参考画像と生成結果",
          body: "カタログ画像はメイク方向の参考で、セルフィーから生成されたものではありません。試着結果は個別タスク向けに生成されます。いずれも保証ではありません。",
        },
        {
          title: "4. 公平性と信頼度",
          body: "肌色、顔立ち、年齢、撮影条件により品質が変わる場合があります。不自然な結果には依存せず、明るく鮮明な写真で再試行してください。",
        },
        {
          title: "5. 商品とアレルギーの安全",
          body: "商品・色番の提案は適合性、在庫、安全性を保証しません。成分を確認し、必要に応じてパッチテストを行い、刺激があれば使用を中止してください。",
        },
      ],
    },
  },
  "ko-KR": {
    badge: "법률 및 개인정보",
    updatedLabel: "업데이트",
    updated: "2026년 6월 30일",
    privacy: {
      title: "개인정보 처리방침",
      description:
        "AI Beauty Stylist가 셀피, 생성 결과, 계정 및 사용 데이터를 처리하는 방법입니다.",
      sections: [
        {
          title: "1. 적용 범위 및 연락처",
          body: "본 방침은 메이크업 탐색, 진단, 가상 체험, 공유, 계정, 지원 및 구독 기능에 적용됩니다. 개인정보 요청은 support@aibeautystylist.com으로 보내 주세요.",
        },
        {
          title: "2. 처리하는 데이터",
          body: "직접 업로드한 사진, 생성 결과, 진단 기록, 계정 및 세션 식별자, 선택한 룩, 작업 상태, 크레딧, 지원 요청과 필요한 보안·오류 로그를 처리합니다. 전체 카드 번호는 저장하지 않습니다.",
        },
        {
          title: "3. 이용 목적 및 제한",
          body: "사진은 사용자가 요청한 진단 또는 가상 체험 제공에만 사용됩니다. 별도 허가 없이 신원 확인, 의료 판단 또는 모델 학습에 셀피를 사용하지 않습니다.",
        },
        {
          title: "4. 보관, 삭제 및 공유",
          body: "셀피 등 일회성 원본 사진은 가능한 한 빨리, 늦어도 30일 이내 삭제됩니다. Premium 비공개 참조 템플릿은 계정 소유자만 접근할 수 있으며 소유자가 삭제할 때까지 보관됩니다. 삭제 시 참조 이미지도 제거됩니다. 비공개 참조 결과는 서비스의 공유 기능으로 공개할 수 없습니다. 서비스 제공업체에는 필요한 최소 데이터만 공유합니다.",
        },
        {
          title: "5. 쿠키, 권리 및 연락처",
          body: "필수 쿠키와 로컬 저장소는 세션, 소유권, 크레딧 및 동의 설정 유지에 사용됩니다. 적용되는 권리 요청은 support@aibeautystylist.com으로 보내 주세요.",
        },
      ],
    },
    terms: {
      title: "서비스 이용약관",
      description:
        "AI Beauty Stylist 이용 규칙, 사용자 책임, 구독 및 서비스 제한입니다.",
      sections: [
        {
          title: "1. 서비스 및 이용 자격",
          body: "AI Beauty Stylist는 메이크업 탐색, AI 진단, 가상 체험, 튜토리얼 및 제품 제안을 제공합니다. 처리 권한이 있는 사진만 업로드해야 합니다.",
        },
        {
          title: "2. 허용되지 않는 사용",
          body: "신원 확인, 의료 또는 고위험 의사결정, 괴롭힘, 불법 콘텐츠, 보안 우회, 대량 수집, 재판매, 리버스 엔지니어링 및 서비스 방해는 금지됩니다.",
        },
        {
          title: "3. AI 결과와 사용자 책임",
          body: "생성 콘텐츠는 부정확할 수 있으며 실제 메이크업 결과를 보장하지 않습니다. 제안과 제품 성분, 적합성 및 안전성을 직접 확인하세요.",
        },
        {
          title: "4. 요금제, 크레딧, 해지 및 환불",
          body: "결제 화면의 요금제, 가격, 갱신 주기 및 혜택이 적용됩니다. AI 생성 크레딧 또는 유료 기능을 사용한 뒤에는 구독 요금이 일반적으로 환불되지 않습니다. 단, 관련 법률상 필요하거나 검토 후 승인된 경우는 예외입니다. 해지하면 다음 갱신이 중단되고 현재 결제 기간의 접근 권한은 유지됩니다. 실패, 시간 초과, 시스템에서 취소된 생성은 크레딧이 자동으로 반환됩니다. 완료된 생성은 결과가 기대와 달라도 크레딧을 사용합니다.",
        },
        {
          title: "5. 권리, 변경 및 연락처",
          body: "합법적으로 업로드한 콘텐츠의 권리는 사용자에게 있으며, 요청한 서비스 제공을 위한 제한적 처리 권한을 부여합니다. 문의: support@aibeautystylist.com.",
        },
      ],
    },
    disclaimer: {
      title: "AI 면책 고지",
      description:
        "AI 분석, 메이크업 제안 및 가상 체험 결과의 중요한 제한 사항입니다.",
      sections: [
        {
          title: "1. 의료 또는 전문 조언이 아님",
          body: "피부 톤 방향, 얼굴 관찰, 메이크업 위치 및 제품 제안은 뷰티 참고용이며 의료 진단, 피부 건강 판단 또는 전문 조언이 아닙니다.",
        },
        {
          title: "2. 결과가 부정확할 수 있음",
          body: "조명, 카메라, 화면, 자세, 가림, 피부 질감 및 모델 한계가 색상, 비율, 질감과 인상에 영향을 줄 수 있습니다.",
        },
        {
          title: "3. 참고 이미지와 생성 결과",
          body: "카탈로그 이미지는 메이크업 방향을 보여 주는 참고 자료이며 셀피에서 생성되지 않습니다. 가상 체험 결과는 특정 작업을 위해 생성됩니다. 둘 다 보장이 아닙니다.",
        },
        {
          title: "4. 공정성과 신뢰도",
          body: "피부 톤, 얼굴 특징, 나이 및 사진 조건에 따라 품질이 달라질 수 있습니다. 명백히 이상한 결과는 사용하지 말고 선명하고 고른 조명의 사진으로 다시 시도하세요.",
        },
        {
          title: "5. 제품 및 알레르기 안전",
          body: "제품과 색상 제안은 적합성, 재고 또는 안전을 보장하지 않습니다. 성분을 확인하고 필요한 경우 패치 테스트를 하며 자극이 발생하면 사용을 중단하세요.",
        },
      ],
    },
  },
  "es-ES": {
    badge: "Legal y privacidad",
    updatedLabel: "Actualizado",
    updated: "30 de junio de 2026",
    privacy: {
      title: "Política de privacidad",
      description:
        "Cómo AI Beauty Stylist trata selfies, resultados, cuentas y datos de uso.",
      sections: [
        {
          title: "1. Alcance y contacto",
          body: "Esta política cubre exploración, diagnóstico, prueba virtual, compartir, cuenta, soporte y suscripciones. Envía solicitudes de privacidad a support@aibeautystylist.com.",
        },
        {
          title: "2. Datos tratados",
          body: "Tratamos fotos que subes voluntariamente, resultados, diagnósticos, identificadores de cuenta y sesión, looks elegidos, estado de tareas, créditos, solicitudes de soporte y registros necesarios. No guardamos números completos de tarjeta.",
        },
        {
          title: "3. Finalidad y límites",
          body: "Las fotos se usan solo para el diagnóstico o la prueba que solicitas. Sin autorización independiente, no usamos selfies para reconocer identidad, tomar decisiones médicas ni entrenar modelos.",
        },
        {
          title: "4. Conservación, eliminación y uso compartido",
          body: "Los selfies y otras fotos originales de un solo uso se eliminan lo antes posible y, como máximo, en 30 días. Una plantilla de referencia Premium privada solo es accesible para su propietario y se conserva hasta que este la elimina; al hacerlo también se borra la imagen de referencia. Los resultados de referencias privadas no pueden publicarse con nuestras herramientas para compartir. Los proveedores reciben solo los datos mínimos necesarios.",
        },
        {
          title: "5. Cookies, derechos y contacto",
          body: "Las cookies necesarias y el almacenamiento local mantienen sesiones, propiedad, créditos y preferencias. Para ejercer derechos aplicables, escribe a support@aibeautystylist.com.",
        },
      ],
    },
    terms: {
      title: "Términos del servicio",
      description:
        "Reglas, responsabilidades, suscripciones y límites de AI Beauty Stylist.",
      sections: [
        {
          title: "1. Servicio y requisitos",
          body: "AI Beauty Stylist ofrece exploración de maquillaje, diagnóstico IA, prueba virtual, tutoriales y sugerencias de producto. Solo puedes subir fotos que tengas derecho a tratar.",
        },
        {
          title: "2. Uso aceptable",
          body: "Se prohíben el reconocimiento de identidad, decisiones médicas o de alto riesgo, acoso, contenido ilegal, evasión de seguridad, extracción masiva, reventa, ingeniería inversa y alteración del servicio.",
        },
        {
          title: "3. Resultados IA y responsabilidad",
          body: "El contenido generado puede ser inexacto y no garantiza un resultado real. Evalúa las sugerencias y verifica ingredientes, idoneidad y seguridad.",
        },
        {
          title: "4. Planes, créditos, cancelación y reembolsos",
          body: "Se aplican el plan, precio, renovación y ventajas mostrados al pagar. Las cuotas de suscripción generalmente no se reembolsan una vez usados créditos de generación con IA o funciones pagas, salvo que lo exija la ley aplicable o se apruebe tras revisión. Cancelar detiene la próxima renovación y mantiene el acceso del periodo actual. Las generaciones fallidas, agotadas o canceladas por el sistema devuelven créditos automáticamente; las generaciones completadas consumen créditos aunque el resultado no sea el preferido.",
        },
        {
          title: "5. Derechos, cambios y contacto",
          body: "Conservas los derechos sobre el contenido subido legalmente y nos das una licencia limitada para prestar el servicio solicitado. Contacto: support@aibeautystylist.com.",
        },
      ],
    },
    disclaimer: {
      title: "Aviso sobre inteligencia artificial",
      description:
        "Limitaciones importantes del análisis IA, las sugerencias y la prueba virtual.",
      sections: [
        {
          title: "1. No es consejo médico",
          body: "El subtono, las observaciones faciales, la colocación y los productos son referencias de belleza, no diagnósticos médicos ni asesoramiento profesional.",
        },
        {
          title: "2. Los resultados pueden ser inexactos",
          body: "La luz, cámara, pantalla, pose, obstrucciones, textura de piel y límites del modelo pueden cambiar color, proporciones y acabado.",
        },
        {
          title: "3. Referencias y resultados generados",
          body: "Las imágenes del catálogo muestran una dirección y no se generan con tu selfie. Las pruebas se generan para una tarea concreta. Ninguna garantiza el resultado real.",
        },
        {
          title: "4. Equidad y fiabilidad",
          body: "La calidad puede variar entre tonos de piel, rasgos, edades y fotos. No uses un resultado claramente incoherente y vuelve a probar con una foto nítida.",
        },
        {
          title: "5. Productos y alergias",
          body: "Las sugerencias no garantizan compatibilidad, disponibilidad ni seguridad. Revisa ingredientes, realiza una prueba local si procede y deja de usar el producto si aparece irritación.",
        },
      ],
    },
  },
  "es-419": {} as LegalLocaleContent,
  "pt-BR": {
    badge: "Legal e privacidade",
    updatedLabel: "Atualizado",
    updated: "30 de junho de 2026",
    privacy: {
      title: "Política de privacidade",
      description:
        "Como o AI Beauty Stylist trata selfies, resultados, contas e dados de uso.",
      sections: [
        {
          title: "1. Escopo e contato",
          body: "Esta política cobre descoberta, diagnóstico, teste virtual, compartilhamento, conta, suporte e assinaturas. Envie solicitações de privacidade para support@aibeautystylist.com.",
        },
        {
          title: "2. Dados tratados",
          body: "Tratamos fotos enviadas voluntariamente, resultados, diagnósticos, identificadores de conta e sessão, looks escolhidos, status de tarefas, créditos, solicitações de suporte e registros necessários. Não armazenamos números completos de cartão.",
        },
        {
          title: "3. Finalidade e limites",
          body: "As fotos são usadas apenas no diagnóstico ou teste solicitado. Sem autorização separada, não usamos selfies para reconhecer identidade, decisões médicas ou treinamento de modelos.",
        },
        {
          title: "4. Retenção, exclusão e compartilhamento",
          body: "Selfies e outras fotos originais de uso único são excluídos assim que possível e em até 30 dias. Um modelo de referência Premium privado só pode ser acessado pelo proprietário e permanece salvo até que ele o exclua; a exclusão também remove a imagem de referência. Resultados de referências privadas não podem ser publicados por nossas ferramentas de compartilhamento. Prestadores recebem apenas os dados mínimos necessários.",
        },
        {
          title: "5. Cookies, direitos e contato",
          body: "Cookies necessários e armazenamento local mantêm sessões, propriedade, créditos e preferências. Para exercer direitos aplicáveis, escreva para support@aibeautystylist.com.",
        },
      ],
    },
    terms: {
      title: "Termos de serviço",
      description:
        "Regras, responsabilidades, assinaturas e limites do AI Beauty Stylist.",
      sections: [
        {
          title: "1. Serviço e qualificação",
          body: "O AI Beauty Stylist oferece descoberta de maquiagem, diagnóstico por IA, teste virtual, tutoriais e sugestões de produtos. Envie apenas fotos que você tenha direito de tratar.",
        },
        {
          title: "2. Uso aceitável",
          body: "São proibidos reconhecimento de identidade, decisões médicas ou de alto risco, assédio, conteúdo ilegal, contorno de segurança, coleta em massa, revenda, engenharia reversa e interrupção do serviço.",
        },
        {
          title: "3. Resultados de IA e responsabilidade",
          body: "Conteúdo gerado pode ser impreciso e não garante um resultado real. Avalie as sugestões e verifique ingredientes, adequação e segurança.",
        },
        {
          title: "4. Planos, créditos, cancelamento e reembolso",
          body: "Valem o plano, preço, renovação e benefícios exibidos no checkout. As taxas de assinatura geralmente não são reembolsáveis após o uso de créditos de geração por IA ou recursos pagos, exceto quando exigido por lei aplicável ou aprovado após análise. Cancelar impede a próxima renovação e mantém o acesso do período atual. Gerações com falha, expiradas ou canceladas pelo sistema devolvem créditos automaticamente; gerações concluídas consomem créditos mesmo que o resultado não seja o preferido.",
        },
        {
          title: "5. Direitos, alterações e contato",
          body: "Você mantém os direitos sobre conteúdo enviado legalmente e nos concede licença limitada para prestar o serviço solicitado. Contato: support@aibeautystylist.com.",
        },
      ],
    },
    disclaimer: {
      title: "Aviso sobre inteligência artificial",
      description:
        "Limitações importantes da análise por IA, das sugestões e do teste virtual.",
      sections: [
        {
          title: "1. Não é orientação médica",
          body: "Subtom, observações faciais, posicionamento e produtos são referências de beleza, não diagnósticos médicos nem orientação profissional.",
        },
        {
          title: "2. Resultados podem ser imprecisos",
          body: "Luz, câmera, tela, pose, obstruções, textura da pele e limites do modelo podem alterar cor, proporção e acabamento.",
        },
        {
          title: "3. Referências e resultados gerados",
          body: "As imagens do catálogo mostram uma direção e não são geradas com sua selfie. Testes são gerados para uma tarefa específica. Nenhum garante o resultado real.",
        },
        {
          title: "4. Equidade e confiabilidade",
          body: "A qualidade pode variar entre tons de pele, traços, idades e fotos. Não use um resultado claramente incoerente e tente novamente com uma foto nítida.",
        },
        {
          title: "5. Produtos e alergias",
          body: "Sugestões não garantem compatibilidade, disponibilidade ou segurança. Confira ingredientes, faça teste local quando adequado e interrompa o uso em caso de irritação.",
        },
      ],
    },
  },
};

content["es-419"] = content["es-ES"];

export function getLegalLocaleContent(
  locale: SupportedLocale,
): LegalLocaleContent {
  return content[locale] ?? content.en;
}
