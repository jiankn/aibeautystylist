# SEO 关键词库存与落地规划 (2026-06-21)

## 数据口径

- `keyword-kd-results.csv` 作为可信 KD 数据源；已有关键词不再调用 AIsa/DataForSEO 复查。
- AIsa 只用于后续新增词、CSV 外词或缺失指标词的增量校验；DataForSEO 仅作为 AIsa 额度耗尽后的后备。
- 简体中文不进入本轮 AIsa 多语言关键词研究，但纳入本地化质量审计。

## 各语言关键词统计

| 语言 | 关键词库总数 | KD 已有 | 无 KD | KD 0-10 | KD 11-25 | KD 26-50 | KD 51+ | 当前源码 SEO 关键词数 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| en (English) | 75 | 53 | 22 | 50 | 2 | 1 | 0 | 44 |
| de (Deutsch) | 70 | 1 | 69 | 1 | 0 | 0 | 0 | 27 |
| fr (Français) | 61 | 28 | 33 | 25 | 0 | 2 | 1 | 30 |
| ja (日本語) | 76 | 48 | 28 | 41 | 4 | 2 | 1 | 46 |
| ko (한국어) | 72 | 32 | 40 | 23 | 1 | 3 | 5 | 39 |
| zh-TW (繁體中文) | 82 | 25 | 57 | 13 | 4 | 0 | 8 | 36 |
| es (Español) | 83 | 40 | 43 | 28 | 5 | 5 | 2 | 24 |
| pt-BR (Português do Brasil) | 90 | 60 | 30 | 55 | 2 | 1 | 2 | 28 |

## 实战落地规则

1. KD 0-10：优先做独立页，但必须满足单一搜索意图、独特 H1/meta/首屏回答、FAQ、内链和信息增益。
2. KD 11-25：只给 AI 工具词、场景词、人群词、新手教程词做二线页；风格泛词先观察。
3. 无 KD：不单独建页，放到已有强页面的 FAQ、步骤、对比表、相关链接里。
4. KD 50+：新站不硬打；只作为正文语义覆盖或后续品牌/外链增强后的目标。
5. 任何语言都不能只翻译英文页；标题和正文必须按当地搜索表达重写。

## 上线关键词分层

### en (English)

| 层级 | 关键词 | 类别 | KD | 落地方式 |
| --- | --- | --- | ---: | --- |
| core | AI makeup try-on | ai_tech |  | independent-page-or-existing-core |
| core | what makeup suits me | ai_tech | 0 | independent-page-or-existing-core |
| core | personal color analysis | core |  | independent-page-or-existing-core |
| core | before and after makeup | ai_tech | 0 | independent-page-or-existing-core |
| core | makeup tutorial for beginners | tutorial | 1 | independent-page-or-existing-core |
| next-page | office makeup look | scenario | 0 | scenario-landing-page |
| next-page | nighttime makeup look | scenario | 1 | scenario-landing-page |
| next-page | work makeup tutorial | scenario | 10 | scenario-landing-page |
| next-page | makeup for oval face | demographic | 0 | feature-or-for-page |
| next-page | makeup for square face | demographic | 0 | feature-or-for-page |
| next-page | makeup for heart shaped face | demographic | 0 | feature-or-for-page |
| next-page | contouring for face shape | demographic | 0 | feature-or-for-page |
| next-page | how to apply makeup step by step | tutorial | 0 | guide-or-blog-page |
| next-page | what makeup looks good on me | ai_tech | 0 | product-or-tool-page |
| next-page | virtual makeover | ai_tech | 6 | product-or-tool-page |
| next-page | best lipstick 2026 | product | 0 | product-or-tool-page |
| next-page | makeup brushes for beginners | product | 0 | product-or-tool-page |
| support-module | photo makeup / photoshoot makeup | scenario |  | section-faq-related-link |
| support-module | quick 5-minute makeup | scenario |  | section-faq-related-link |
| support-module | best lipstick for warm undertone | demographic |  | section-faq-related-link |
| support-module | best lipstick for cool undertone | demographic |  | section-faq-related-link |
| support-module | makeup for big eyes / small eyes | demographic |  | section-faq-related-link |
| support-module | 10 minute makeup tutorial | tutorial |  | section-faq-related-link |
| support-module | AI makeup app | ai_tech |  | section-faq-related-link |
| support-module | makeup filter AI | ai_tech |  | section-faq-related-link |

### de (Deutsch)

| 层级 | 关键词 | 类别 | KD | 落地方式 |
| --- | --- | --- | ---: | --- |
| core | KI Make-up Test | ai_tech |  | independent-page-or-existing-core |
| core | welches Make-up passt zu mir | ai_tech |  | independent-page-or-existing-core |
| core | Farbsaison bestimmen | ai_tech |  | independent-page-or-existing-core |
| core | Make-up Vorher-Nachher | core |  | independent-page-or-existing-core |
| core | Make-up für Anfänger | tutorial |  | independent-page-or-existing-core |
| support-module | Bewerbungsfoto Make-up | scenario |  | section-faq-related-link |
| support-module | Foto-Make-up | scenario |  | section-faq-related-link |
| support-module | Reisepass-Foto Make-up | scenario |  | section-faq-related-link |
| support-module | Make-up für den Alltag | scenario |  | section-faq-related-link |
| support-module | festliches Make-up | scenario |  | section-faq-related-link |
| support-module | Make-up für ovale Gesichter | demographic |  | section-faq-related-link |
| support-module | passende Lippenstiftfarbe finden | demographic |  | section-faq-related-link |
| support-module | Make-up für warme Hauttöne | demographic |  | section-faq-related-link |

### fr (Français)

| 层级 | 关键词 | 类别 | KD | 落地方式 |
| --- | --- | --- | ---: | --- |
| core | test maquillage virtuel | ai_tech |  | independent-page-or-existing-core |
| core | quel maquillage pour moi | ai_tech | 49 | independent-page-or-existing-core |
| core | diagnostic teint | core |  | independent-page-or-existing-core |
| core | avant après maquillage | core |  | independent-page-or-existing-core |
| core | maquillage pour débutantes | tutorial |  | independent-page-or-existing-core |
| next-page | maquillage entretien d'embauche | scenario | 0 | scenario-landing-page |
| next-page | maquillage soirée | scenario | 0 | scenario-landing-page |
| next-page | maquillage peau sensible | demographic | 0 | feature-or-for-page |
| next-page | quelle couleur me va | demographic | 0 | feature-or-for-page |
| next-page | apprendre à se maquiller | tutorial | 0 | guide-or-blog-page |
| next-page | rouge à lèvres longue tenue | product | 0 | product-or-tool-page |
| next-page | dupes maquillage | product | 0 | product-or-tool-page |
| support-module | maquillage rapide matin | scenario |  | section-faq-related-link |
| support-module | maquillage bal | scenario |  | section-faq-related-link |
| support-module | maquillage vacances | scenario |  | section-faq-related-link |
| support-module | rouge à lèvres pour teint chaud | demographic |  | section-faq-related-link |
| support-module | rouge à lèvres pour teint froid | demographic |  | section-faq-related-link |
| support-module | maquillage en 5 minutes | tutorial |  | section-faq-related-link |
| support-module | ordre maquillage étapes | tutorial |  | section-faq-related-link |
| support-module | maquillage naturel pas à pas | tutorial |  | section-faq-related-link |

### ja (日本語)

| 层级 | 关键词 | 类别 | KD | 落地方式 |
| --- | --- | --- | ---: | --- |
| core | AIメイク診断 | ai_tech |  | independent-page-or-existing-core |
| core | 似合うメイク | demographic | 3 | independent-page-or-existing-core |
| core | パーソナルカラー診断 | ai_tech | 2 | independent-page-or-existing-core |
| core | ビフォアアフターメイク | ai_tech |  | independent-page-or-existing-core |
| core | メイク 初心者 | tutorial | 0 | independent-page-or-existing-core |
| next-page | 卒業式メイク | scenario | 0 | scenario-landing-page |
| next-page | パーティーメイク | scenario | 0 | scenario-landing-page |
| next-page | イエベ メイク | demographic | 0 | feature-or-for-page |
| next-page | ブルベ メイク | demographic | 0 | feature-or-for-page |
| next-page | 丸顔 メイク | demographic | 0 | feature-or-for-page |
| next-page | 面長 メイク | demographic | 0 | feature-or-for-page |
| next-page | 奥二重 メイク | demographic | 0 | feature-or-for-page |
| next-page | 40代 メイク | demographic | 0 | feature-or-for-page |
| next-page | パーソナルカラー | demographic | 1 | feature-or-for-page |
| next-page | メイクの基本 | tutorial | 0 | guide-or-blog-page |
| next-page | メイクのコツ | tutorial | 0 | guide-or-blog-page |
| next-page | アイメイク やり方 | tutorial | 0 | guide-or-blog-page |
| support-module | 通勤メイク | scenario |  | section-faq-related-link |
| support-module | 大人世代メイク | demographic |  | section-faq-related-link |
| support-module | 肌悩み別メイク | demographic |  | section-faq-related-link |
| support-module | 似合うリップカラー | demographic |  | section-faq-related-link |
| support-module | 似合うチーク | demographic |  | section-faq-related-link |
| support-module | 簡単なメイク 初心者 | tutorial |  | section-faq-related-link |
| support-module | 自然なメイク やり方 | tutorial |  | section-faq-related-link |
| support-module | デイリーメイク 手順 | tutorial |  | section-faq-related-link |

### ko (한국어)

| 层级 | 关键词 | 类别 | KD | 落地方式 |
| --- | --- | --- | ---: | --- |
| core | AI 메이크업 진단 | ai_tech |  | independent-page-or-existing-core |
| core | 나에게 어울리는 메이크업 | ai_tech | 54 | independent-page-or-existing-core |
| core | 퍼스널컬러 진단 | core |  | independent-page-or-existing-core |
| core | 비포 애프터 메이크업 | ai_tech |  | independent-page-or-existing-core |
| core | 메이크업 초보 | tutorial | 53 | independent-page-or-existing-core |
| next-page | 퍼스널컬러 메이크업 | demographic | 0 | feature-or-for-page |
| next-page | 웜톤 메이크업 | demographic | 0 | feature-or-for-page |
| next-page | 웜톤 립 | demographic | 0 | feature-or-for-page |
| next-page | 퍼스널컬러 테스트 | ai_tech | 0 | product-or-tool-page |
| next-page | 올리브영 추천 | product | 0 | product-or-tool-page |
| next-page | 립글로스 추천 | product | 0 | product-or-tool-page |
| next-page | 쿠션 파데 추천 | product | 0 | product-or-tool-page |
| next-page | 아이섀도우 팔레트 추천 | product | 0 | product-or-tool-page |
| support-module | 여행 메이크업 | scenario |  | section-faq-related-link |
| support-module | 겨울쿨 메이크업 | demographic |  | section-faq-related-link |
| support-module | 여름쿨 메이크업 | demographic |  | section-faq-related-link |
| support-module | 얼굴형 메이크업 | demographic |  | section-faq-related-link |
| support-module | 둥근 얼굴 메이크업 | demographic |  | section-faq-related-link |
| support-module | 눈 작은 얼굴 메이크업 | demographic |  | section-faq-related-link |
| support-module | 피부톤 메이크업 | demographic |  | section-faq-related-link |
| support-module | 매일 메이크업 루틴 | tutorial |  | section-faq-related-link |

### zh-TW (繁體中文)

| 层级 | 关键词 | 类别 | KD | 落地方式 |
| --- | --- | --- | ---: | --- |
| core | AI 妝容診斷 | ai_tech |  | independent-page-or-existing-core |
| core | 什麼妝適合我 | ai_tech |  | independent-page-or-existing-core |
| core | 個人色彩診斷 | ai_tech | 0 | independent-page-or-existing-core |
| core | 妝前妝後對比 | ai_tech |  | independent-page-or-existing-core |
| core | 新手化妝教學 | tutorial | 0 | independent-page-or-existing-core |
| next-page | 開架口紅推薦 | product | 0 | product-or-tool-page |
| next-page | 寶雅口紅 | product | 0 | product-or-tool-page |
| next-page | 不沾杯口紅 | product | 0 | product-or-tool-page |
| support-module | 出遊妝容 | scenario |  | section-faq-related-link |
| support-module | 年夜飯妝容 | scenario |  | section-faq-related-link |
| support-module | 情人節妝容 | scenario |  | section-faq-related-link |
| support-module | 面試化妝技巧 | scenario |  | section-faq-related-link |
| support-module | 冷調膚色彩妝 | demographic |  | section-faq-related-link |
| support-module | 暖調膚色彩妝 | demographic |  | section-faq-related-link |
| support-module | 圓臉彩妝 | demographic |  | section-faq-related-link |
| support-module | 長臉彩妝 | demographic |  | section-faq-related-link |

### es (Español)

| 层级 | 关键词 | 类别 | KD | 落地方式 |
| --- | --- | --- | ---: | --- |
| core | prueba de maquillaje virtual | ai_tech |  | independent-page-or-existing-core |
| core | qué maquillaje me queda | ai_tech |  | independent-page-or-existing-core |
| core | análisis de color personal | ai_tech |  | independent-page-or-existing-core |
| core | antes y después maquillaje | ai_tech | 0 | independent-page-or-existing-core |
| core | maquillaje para principiantes | tutorial | 0 | independent-page-or-existing-core |
| next-page | maquillaje para fiesta | scenario | 0 | scenario-landing-page |
| next-page | maquillaje para cara redonda | demographic | 0 | feature-or-for-page |
| next-page | maquillaje para piel morena | demographic | 0 | feature-or-for-page |
| next-page | maquillaje para piel seca | demographic | 0 | feature-or-for-page |
| next-page | maquillaje para ojos pequeños | demographic | 0 | feature-or-for-page |
| next-page | maquillaje para párpados caídos | demographic | 0 | feature-or-for-page |
| next-page | orden de maquillaje | tutorial | 0 | guide-or-blog-page |
| next-page | maquillaje natural para principiantes | tutorial | 0 | guide-or-blog-page |
| next-page | maquillaje de ojos fácil | tutorial | 3 | guide-or-blog-page |
| next-page | maquillaje fácil y rápido | tutorial | 7 | guide-or-blog-page |
| next-page | rubor en crema | product | 0 | product-or-tool-page |
| support-module | maquillaje para una cita | scenario |  | section-faq-related-link |
| support-module | maquillaje para primer encuentro | scenario |  | section-faq-related-link |
| support-module | maquillaje para boda de invitada | scenario |  | section-faq-related-link |
| support-module | maquillaje rápido para todos los días | scenario |  | section-faq-related-link |
| support-module | labial para tono cálido | demographic |  | section-faq-related-link |
| support-module | labial para tono frío | demographic |  | section-faq-related-link |
| support-module | qué labial me queda | demographic |  | section-faq-related-link |
| support-module | maquillaje según forma de tu rostro | demographic |  | section-faq-related-link |

### pt-BR (Português do Brasil)

| 层级 | 关键词 | 类别 | KD | 落地方式 |
| --- | --- | --- | ---: | --- |
| core | teste de maquiagem virtual | ai_tech |  | independent-page-or-existing-core |
| core | qual maquiagem combina comigo | ai_tech |  | independent-page-or-existing-core |
| core | colorimetria pessoal | demographic | 0 | independent-page-or-existing-core |
| core | antes e depois maquiagem | ai_tech | 0 | independent-page-or-existing-core |
| core | maquiagem para iniciantes | tutorial | 0 | independent-page-or-existing-core |
| next-page | maquiagem para o trabalho | scenario | 0 | scenario-landing-page |
| next-page | maquiagem para entrevista de emprego | scenario | 0 | scenario-landing-page |
| next-page | maquiagem para fotos | scenario | 0 | scenario-landing-page |
| next-page | maquiagem rápida | scenario | 0 | scenario-landing-page |
| next-page | maquiagem para balada | scenario | 0 | scenario-landing-page |
| next-page | make para o dia | scenario | 0 | scenario-landing-page |
| next-page | maquiagem para rosto redondo | demographic | 0 | feature-or-for-page |
| next-page | maquiagem para rosto oval | demographic | 0 | feature-or-for-page |
| next-page | maquiagem para pele oleosa | demographic | 0 | feature-or-for-page |
| next-page | maquiagem para pele clara | demographic | 0 | feature-or-for-page |
| next-page | batom para pele morena | demographic | 0 | feature-or-for-page |
| next-page | batom para pele clara | demographic | 0 | feature-or-for-page |
| support-module | maquiagem para encontro / primeiro encontro | scenario |  | section-faq-related-link |
| support-module | maquiagem para casamento (convidada) | scenario |  | section-faq-related-link |
| support-module | maquiagem para Réveillon / Ano Novo | scenario |  | section-faq-related-link |
| support-module | qual batom combina comigo | demographic |  | section-faq-related-link |
| support-module | maquiagem em 15 minutos | tutorial |  | section-faq-related-link |
| support-module | rotina de maquiagem | tutorial |  | section-faq-related-link |
| support-module | maquiagem com poucos produtos | tutorial |  | section-faq-related-link |
| support-module | provador virtual de maquiagem | ai_tech |  | section-faq-related-link |

## 页面规划重点

- 英文：保持产品词和场景词为主，`what makeup suits me`、`AI makeup try-on`、`makeup for hooded eyes` 是转化链核心。
- 德语：隐私/可信表达很关键，`Make-up App Datenschutz` 等 trust 词不急于建页，但应进入 FAQ/隐私说明内链。
- 法语：避免硬卖，优先做自然妆、虚拟试妆、口红/肤色选择页。
- 日语：`似合うメイク`、`パーソナルカラー`、`垢抜け` 是主轴，页面需细致步骤和“自分に合う”判断逻辑。
- 韩语：`퍼스널컬러`、`데일리 메이크업`、`쿨톤/웜톤 립` 是主轴，首页运行时文案需要先母语化。
- 繁中：保留台湾常用词，`個人色彩`、`適合我的口紅`、`通勤妝`、`約會妝` 更适合转化。
- 西语：拉美/西班牙需分层，先做通用高意图词，区域词放内容模块。
- 巴葡：`maquiagem natural`、`pele glow`、`maquiagem para iniciantes`、`colorimetria pessoal` 值得优先扩页。
