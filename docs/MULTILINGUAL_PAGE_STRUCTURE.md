# 多语言页面架构 — SEO 落地方案

> 基于 609 个关键词的 KD 查询结果 + PRD 四阶段路线图
> 调研时间：2026-06-14 | 数据来源：DataForSEO API（Google US/DE/FR/JP/KR/TW/ES/BR）

---

## 一、核心架构决策

### 1.1 URL 结构

```
/                           → 英文首页（x-default）
/try-on                     → 英文试妆页
/pricing                    → 英文定价页
/blog/{slug}                → 英文博客

/de/                        → 德语首页
/de/try-on                  → 德语试妆页
/de/{slug}                  → 德语 SEO 页面

/fr/                        → 法语首页
/fr/try-on                  → 法语试妆页
/fr/{slug}                  → 法语 SEO 页面

... 其他语言同理
```

### 1.2 页面分层模型

```
┌─────────────────────────────────────────────┐
│ L1 产品页面（所有语言必须）                      │
│   首页、试妆页、定价页、教程页、会员页              │
├─────────────────────────────────────────────┤
│ L2 风格页（KD≤10 的 style 词）                  │
│   每种语言的妆容风格独立页，如 /en/looks/soft-glam │
├─────────────────────────────────────────────┤
│ L3 场景页（KD≤10 的 scenario 词）               │
│   按场景的 SEO 页，如 /en/scenarios/interview    │
├─────────────────────────────────────────────┤
│ L4 人群/特征页（KD≤10 的 demographic 词）        │
│   按肤型/脸型的 SEO 页，如 /en/for/hooded-eyes   │
├─────────────────────────────────────────────┤
│ L5 教程/产品页（KD≤10 的 tutorial/product 词）  │
│   教程和产品推荐页，如 /en/guides/beginner       │
└─────────────────────────────────────────────┘
```

### 1.3 KD 无数据的词怎么处理？

322 个关键词没有 KD 数据（搜索量不足，DataForSEO 不计算），**不做独立 SEO 页**。

处理方式：
- 作为 L2 风格页或 L3 场景页内的 **推荐区块**
- 作为 L4 人群页内的 **常见问题（FAQ）**
- 作为首页灵感图区的 **风格标签**
- 作为 try-on 页的 **推荐妆容列表**

---

## 二、Phase 1 — 英文（en）

> 状态：75 个关键词 | 50 个极低 KD（0-10） | 2 个低 KD（11-25） | 1 个中 KD（26-50）

### 2.1 L1 产品页面（5 个）

| 页面 | URL | 目标关键词 |
|------|-----|-----------|
| 首页 | `/` | AI makeup try-on, personalized tutorial, before and after |
| 试妆页 | `/try-on` | virtual makeover, AI makeup try-on, shade match AI |
| 定价页 | `/pricing` | AI beauty advisor, virtual makeover |
| 教程页 | `/tutorial` | makeup tutorial for beginners |
| 会员页 | `/membership` | personalized makeup recommendation |

### 2.2 L2 风格页（10 个）— KD 全 ≤ 10

| 风格 slug | 标题关键词 | KD | 对应妆容库 |
|-----------|-----------|----|-----------|
| soft-glam | Soft Glam Makeup | 0 | soft-glam |
| natural-makeup | Natural Makeup Look | 4 | natural-daily |
| no-makeup-makeup | No-Makeup Makeup Look | 5 | bare-beauty |
| dewy-skin | Dewy Skin Makeup | 4 | dewy-glow |
| matte-makeup | Matte Makeup Look | 0 | soft-matte |
| date-night | Date Night Makeup | 0 | candlelight-mauve |
| minimalist | Minimalist Makeup | 0 | peach-morning-glow |
| glass-skin | Glass Skin Makeup | 0 | peach-morning-glow |
| clean-girl | Clean Girl Makeup | (无 KD) | clean-everyday |
| glowy | Glowy Makeup | 0 | dewy-glow |

### 2.3 L3 场景页（10 个）— KD 全 ≤ 10

| 场景 slug | 标题关键词 | KD |
|-----------|-----------|----|
| interview | Interview Makeup | 0 |
| office | Office Makeup Look | 0 |
| first-date | First Date Makeup | 0 |
| passport-photo | Passport Photo Makeup | 6 |
| wedding-guest | Wedding Guest Makeup | 0 |
| prom | Prom Makeup | 0 |
| graduation | Graduation Makeup | 0 |
| vacation | Vacation Makeup | 8 |
| quick-5min | Quick 5-Minute Makeup | (无 KD) |
| nighttime | Nighttime Makeup Look | 1 |

### 2.4 L4 人群/特征页（8 个）— KD 全 ≤ 10

| 特征 slug | 标题关键词 | KD |
|-----------|-----------|----|
| hooded-eyes | Makeup for Hooded Eyes | 0 |
| round-face | Makeup for Round Face | 0 |
| mature-skin | Makeup for Mature Skin | 0 |
| dark-skin | Makeup for Dark Skin | 0 |
| olive-skin | Makeup for Olive Skin Tone | 0 |
| fair-skin | Makeup for Fair Skin | 0 |
| single-eyelids | Makeup for Single Eyelids | (无 KD) |
| face-shape-contour | Contouring for Face Shape | 0 |

### 2.5 L5 教程/产品页（8 个）

| slug | 标题关键词 | KD |
|------|-----------|----|
| beginner-tutorial | Makeup Tutorial for Beginners | 1 |
| how-to-apply | How to Apply Makeup Step by Step | (无 KD) |
| beginner-routine | Beginner Makeup Routine | 1 |
| easy-everyday | Easy Everyday Makeup | 2 |
| natural-makeup-how | How to Do Natural Makeup | 9 |
| makeup-essentials | Basic Makeup Essentials | 2 |
| mistakes-avoid | Makeup Mistakes to Avoid | 36（高竞争，养词策略） |
| drugstore-beginners | Drugstore Makeup for Beginners | 2 |

### Phase 1 总计：41 个可索引页面 + 22 个无 KD 长尾词（作为页面内区块）

---

## 三、Phase 2 — 德语 / 法语 / 日语

### 3.1 德语（de）

> 状态：70 个关键词 | 1 个极低 KD | 69 个无 KD 数据
> 注意：德语搜索量整体低，但 KD 也极低。长尾词多，说明市场空白大，早期进入有优势。

#### L1 产品页面（5 个）

| 页面 | URL | 目标关键词 |
|------|-----|-----------|
| 首页 | `/de/` | KI Make-up Test, Make-up Beratung |
| 试妆页 | `/de/try-on` | virtuelles Make-up Testen |
| 定价页 | `/de/pricing` | persönliche Make-up Beratung |
| 教程页 | `/de/tutorial` | Make-up für Anfänger |
| 会员页 | `/de/membership` | Farbberatung online |

#### L2 风格页（3 个）

| 风格 slug | 标题关键词 | KD |
|-----------|-----------|----|
| natürlich | Natürliches Make-up | (无 KD) |
| dezent | Dezent Schminken | 0 |
| elegant | Elegantes Make-up | (无 KD) |

#### L3 场景页（5 个）

| 场景 slug | 标题关键词 | KD |
|-----------|-----------|----|
| buero | Make-up fürs Büro | (无 KD) |
| vorstellungsgespraech | Vorstellungsgespräch Make-up | (无 KD) |
| date | Date Make-up | (无 KD) |
| hochzeit | Hochzeit Make-up Gast | (无 KD) |
| schnell-morgens | Schnelles Make-up morgens | (无 KD) |

#### L4 人群/特征页（5 个）

| 特征 slug | 标题关键词 | KD |
|-----------|-----------|----|
| rundes-gesicht | Make-up für runde Gesichter | (无 KD) |
| schlupflider | Make-up für Schlupflider | (无 KD) |
| reife-haut | Make-up für reife Haut | (无 KD) |
| lippenstift-farbe | Welche Lippenstiftfarbe passt zu mir | (无 KD) |
| hauttyp-bestimmen | Hauttyp und Unterton bestimmen | (无 KD) |

#### 德语总计：18 个可索引页面

---

### 3.2 法语（fr）

> 状态：61 个关键词 | 25 个极低 KD | 3 个高 KD

#### L1 产品页面（5 个）

| 页面 | URL | 目标关键词 |
|------|-----|-----------|
| 首页 | `/fr/` | test maquillage virtuel, diagnostic teint IA |
| 试妆页 | `/fr/try-on` | essai virtuel maquillage |
| 定价页 | `/fr/pricing` | conseil maquillage personnalisé |
| 教程页 | `/fr/tutorial` | maquillage pour débutantes |
| 会员页 | `/fr/membership` | diagnostic de sous-ton |

#### L2 风格页（8 个）

| 风格 slug | 标题关键词 | KD |
|-----------|-----------|----|
| naturel | Maquillage Naturel | 0 |
| teint-lumineux | Teint Lumineux | 0 |
| elegant | Maquillage Élégant | 0 |
| nude | Maquillage Nude | 0 |
| soiree | Maquillage de Soirée | 0 |
| minimaliste | Maquillage Minimaliste | 0 |
| teint-frais | Teint Frais | 0 |
| mariee | Maquillage Mariée | 0 |

#### L3 场景页（6 个）

| 场景 slug | 标题关键词 | KD |
|-----------|-----------|----|
| bureau | Maquillage pour le Bureau | (无 KD) |
| entretien | Maquillage Entretien d'Emploi | 0 |
| premier-rendez-vous | Maquillage Premier Rendez-vous | 48（高竞争，养词） |
| photo | Maquillage pour Photo | 0 |
| mariage-invite | Maquillage Invité Mariage | 0 |
| jour | Maquillage de Jour | 0 |

#### L4 人群/特征页（4 个）

| 特征 slug | 标题关键词 | KD |
|-----------|-----------|----|
| visage-rond | Maquillage pour Visage Rond | 0 |
| peau-mate | Maquillage pour Peau Mate | 0 |
| peau-claire | Maquillage pour Peau Claire | 0 |
| choisir-fond-de-teint | Choisir son Fond de Teint | 0 |

#### L5 教程/产品页（4 个）

| slug | 标题关键词 | KD |
|------|-----------|----|
| debutantes | Maquillage pour Débutantes | (无 KD) |
| tuto-facile | Tuto Maquillage Facile | 2 |
| routine-quotidienne | Routine Maquillage Quotidienne | (无 KD) |
| erreurs-eviter | Erreurs Maquillage à Éviter | (无 KD) |

#### 法语总计：27 个可索引页面

---

### 3.3 日语（ja）

> 状态：76 个关键词 | 41 个极低 KD | 4 个低 KD | 3 个高 KD
> 注意：日语 KD:0 的词极其多，是 KD 最友好的语言之一。

#### L1 产品页面（5 个）

| 页面 | URL | 目标关键词 |
|------|-----|-----------|
| 首页 | `/ja/` | AIメイク診断、似合うメイク診断 |
| 试妆页 | `/ja/try-on` | バーチャルメイク、メイクシミュレーション |
| 定价页 | `/ja/pricing` | パーソナルカラー診断 |
| 教程页 | `/ja/tutorial` | メイク初心者、メークのやり方 |
| 会员页 | `/ja/membership` | 似合う色診断、自分に似合うコスメ |

#### L2 风格页（12 个）

| 风格 slug | 标题关键词 | KD |
|-----------|-----------|----|
| ナチュラル | ナチュラルメイク | 0 |
| 垢抜け | 垢抜けメイク | 0 |
| 清楚 | 清楚メイク | 0 |
| ツヤ肌 | ツヤ肌メイク | 0 |
| マット | マットメイク | 0 |
| 韓国風 | 韓国風メイク | 0 |
| プチプラ | プチプラメイク | 0 |
| 透明感 | 透明感メイク | 0 |
| ノーメイク風 | ノーメイク風メイク | (无 KD) |
| 大人ナチュラル | 大人ナチュラルメイク | (无 KD) |
| 血色感 | 血色感メイク | 21（中竞争） |
| オーロラ肌 | オーロラ肌メイク | (无 KD) |

#### L3 场景页（8 个）

| 场景 slug | 标题关键词 | KD |
|-----------|-----------|----|
| オフィス | オフィスメイク | 0 |
| 面接 | 面接メイク | 0 |
| 証明写真 | 証明写真メイク | 0 |
| デート | デートメイク | 0 |
| 写真映え | 写真映えメイク | 0 |
| 時短 | 時短メイク | 0 |
| 5分 | 5分メイク | 0 |
| 旅行 | 旅行メイク | (无 KD) |

#### L4 人群/特征页（6 个）

| 特征 slug | 标题关键词 | KD |
|-----------|-----------|----|
| 丸顔 | 丸顔メイク | (无 KD) |
| 一重 | 一重メイク | (无 KD) |
| 奥二重 | 奥二重メイク | (无 KD) |
| イエベ | イエベメイク | (无 KD) |
| ブルベ | ブルベメイク | (无 KD) |
| 涙袋 | 涙袋メイク | (无 KD) |

#### L5 教程/产品页（5 个）

| slug | 标题关键词 | KD |
|------|-----------|----|
| 初心者 | メイク初心者 | 0 |
| やり方 | メイクのやり方 | (无 KD) |
| 順番 | メイク順番 | (无 KD) |
| パーソナルカラー診断 | パーソナルカラー診断 無料 | 32（中竞争，高流量词） |
| 似合うコスメ | 自分に似合うコスメを探す | 0 |

#### 日语总计：36 个可索引页面

---

## 四、Phase 3 — 韩语 / 繁中

### 4.1 韩语（ko）

> 状态：72 个关键词 | 23 个极低 KD | 1 个低 KD | 8 个高 KD
> 注意：高竞争词集中在日常场景（출근 메이크업 KD:60），但这些是流量最大的词。用极低 KD 长尾词养站。

#### L1 产品页面（5 个）

| 页面 | URL | 目标关键词 |
|------|-----|-----------|
| 首页 | `/ko/` | AI 메이크업 진단, 나에게 어울리는 메이크업 |
| 试妆页 | `/ko/try-on` | 가상 메이크업 체험, AI 메이크업 앱 |
| 定价页 | `/ko/pricing` | 퍼스널컬러 진단 AI |
| 教程页 | `/ko/tutorial` | 메이크업 초보, 메이크업 순서 |
| 会员页 | `/ko/membership` | AI 피부 분석, 퍼스널컬러 테스트 |

#### L2 风格页（8 个）

| 风格 slug | 标题关键词 | KD |
|-----------|-----------|----|
| 데일리 | 데일리 메이크업 | 0 |
| 글로우 | 글로우 메이크업 | 0 |
| 내추럴 | 내추럴 메이크업 | 0 |
| 속광 | 속광 메이크업 | 0 |
| 청순 | 청순 메이크업 | 0 |
| 미니멀 | 미니멀 메이크업 | (无 KD) |
| 결광 | 결광 메이크업 | (无 KD) |
| 렌더링 | 렌더링 미감 메이크업 | (无 KD) |

#### L3 场景页（6 个）

| 场景 slug | 标题关键词 | KD |
|-----------|-----------|----|
| 면접 | 면접 메이크업 | 0 |
| 프로필 | 프로필 사진 메이크업 | 0 |
| 졸업식 | 졸업식 메이크업 | 0 |
| 파티 | 파티 메이크업 | 0 |
| 빠른 | 빠른 메이크업 | (无 KD) |
| 소개팅 | 소개팅 메이크업 | (无 KD) |

#### L4 人群/特征页（6 个）

| 特征 slug | 标题关键词 | KD |
|-----------|-----------|----|
| 퍼스널컬러 | 퍼스널컬러 메이크업 | 0 |
| 웜톤 | 웜톤 메이크업 | 0 |
| 쿨톤 | 쿨톤 메이크업 | 0 |
| 봄웜 | 봄웜 메이크업 | 0 |
| 홑꺼풀 | 홑꺼풀 메이크업 | (无 KD) |
| 쿨톤립 | 쿨톤 립 | 0 |

#### L5 教程/产品页（4 个）

| slug | 标题关键词 | KD |
|------|-----------|----|
| 메이크업-순서 | 메이크업 순서 | (无 KD) |
| 기초-방법 | 기초 메이크업 방법 | (无 KD) |
| 간단한 | 간단한 메이크업 | 53（高竞争，养词） |
| 인생-립스틱 | 인생 립스틱 | (无 KD) |

#### 韩语总计：29 个可索引页面

---

### 4.2 繁体中文（zh-TW）

> 状态：82 个关键词 | 13 个极低 KD | 4 个低 KD | 8 个高 KD
> 注意：高竞争词集中在"推薦"类词（唇膏推薦 KD:54），但教程类和"個人色彩"类 KD 极低。

#### L1 产品页面（5 个）

| 页面 | URL | 目标关键词 |
|------|-----|-----------|
| 首页 | `/zh-tw/` | AI 妝容診斷、虛擬試妝、適合我的妝容 |
| 试妆页 | `/zh-tw/try-on` | 虛擬試妝、線上試妝 |
| 定价页 | `/zh-tw/pricing` | AI 彩妝推薦、個人色彩診斷 |
| 教程页 | `/zh-tw/tutorial` | 新手化妝教學、化妝步驟 |
| 会员页 | `/zh-tw/membership` | 個人色彩診斷、AI 美妝顧問 |

#### L2 风格页（4 个）

| 风格 slug | 标题关键词 | KD |
|-----------|-----------|----|
| 日系 | 日系妝容 | 0 |
| 清透 | 清透妝 | (无 KD) |
| 偽素顏 | 偽素顏妝 | (无 KD) |
| 氛圍感 | 氛圍感妝容 | (无 KD) |

#### L3 场景页（4 个）

| 场景 slug | 标题关键词 | KD |
|-----------|-----------|----|
| 證件照 | 證件照妝 | 15（低竞争） |
| 快速出門 | 快速出門妝 | (无 KD) |
| 相親 | 相親妝容 | (无 KD) |
| 畢業照 | 畢業照妝容 | (无 KD) |

#### L4 人群/特征页（4 个）

| 特征 slug | 标题关键词 | KD |
|-----------|-----------|----|
| 個人色彩 | 個人色彩 | 0 |
| 內雙 | 內雙彩妝 | (无 KD) |
| 腫眼泡 | 腫眼泡彩妝 | (无 KD) |
| 適合我 | 適合我的口紅 | (无 KD) |

#### L5 教程/产品页（7 个）

| slug | 标题关键词 | KD |
|------|-----------|----|
| 新手教學 | 新手化妝教學 | 0 |
| 步驟 | 化妝步驟 | 0 |
| 順序 | 化妝順序 | 0 |
| 技巧 | 化妝技巧 | 0 |
| 眼線 | 眼線怎麼畫 | 0 |
| 眉毛 | 眉毛怎麼畫 | 0 |
| 眼影 | 眼影教學 | 0 |

#### 繁中总计：24 个可索引页面

---

## 五、Phase 4 — 西语 / 葡语

### 5.1 西语（es）

> 状态：83 个关键词 | 28 个极低 KD | 5 个低 KD | 7 个高 KD

#### 页面规划（20 个可索引页）

| 类型 | 数量 | 示例页面 |
|------|------|---------|
| L1 产品 | 5 | `/es/`, `/es/try-on`, `/es/pricing`, `/es/tutorial`, `/es/membership` |
| L2 风格 | 6 | maquillaje natural, maquillaje glow, piel luminosa, labios jugosos, maquillaje de noche, maquillaje editorial |
| L3 场景 | 4 | maquillaje para fotos, maquillaje para fiesta, maquillaje para graduación, maquillaje de carnaval |
| L4 人群 | 3 | cara redonda, piel morena, piel madura |
| L5 教程 | 2 | maquillaje paso a paso, maquillaje para principiantes |

### 5.2 葡语（pt-BR）

> 状态：90 个关键词 | 55 个极低 KD | 2 个低 KD | 3 个高 KD
> 葡语是 KD 最友好的语言之一，55 个极低 KD 词，可以大量建页。

#### 页面规划（25 个可索引页）

| 类型 | 数量 | 示例页面 |
|------|------|---------|
| L1 产品 | 5 | `/pt-br/`, `/pt-br/try-on`, `/pt-br/pricing`, `/pt-br/tutorial`, `/pt-br/membership` |
| L2 风格 | 8 | maquiagem natural, maquiagem glow, make glow, maquiagem leve, maquiagem para festa, maquiagem de noiva, maquiagem artística, maquiagem minimalista |
| L3 场景 | 6 | maquiagem para o trabalho, maquiagem para entrevista, maquiagem para carnaval, maquiagem para Réveillon, maquiagem para formatura, maquiagem para balada |
| L4 人群 | 3 | maquiagem para pele morena, maquiagem para pele negra, maquiagem para rosto redondo |
| L5 教程 | 3 | maquiagem para iniciantes, maquiagem passo a passo, como se maquiar |

---

## 六、各语言页面数量汇总

| 语言 | Phase | L1 产品 | L2 风格 | L3 场景 | L4 人群 | L5 教程 | 总计 |
|------|-------|:-------:|:-------:|:-------:|:-------:|:-------:|:----:|
| en | P1 | 5 | 10 | 10 | 8 | 8 | **41** |
| de | P2 | 5 | 3 | 5 | 5 | 0 | **18** |
| fr | P2 | 5 | 8 | 6 | 4 | 4 | **27** |
| ja | P2 | 5 | 12 | 8 | 6 | 5 | **36** |
| ko | P3 | 5 | 8 | 6 | 6 | 4 | **29** |
| zh-TW | P3 | 5 | 4 | 4 | 4 | 7 | **24** |
| es | P4 | 5 | 6 | 4 | 3 | 2 | **20** |
| pt-BR | P4 | 5 | 8 | 6 | 3 | 3 | **25** |
| **合计** | | **40** | **59** | **49** | **39** | **33** | **220** |

> 220 个可索引页面。加上 KD 无数据的 322 个长尾词作为页面内区块，实际内容覆盖 540+ 关键词。

---

## 七、每个页面的模板结构

### 7.1 L2 风格页模板

```
┌────────────────────────────────────┐
│ H1: [风格名称] — [一句话价值主张]     │
│ Hero 图: 该风格的妆容参考图            │
│                                    │
│ 段落 1: 什么是 [风格名]？适合谁？      │
│ 段落 2: 这个风格的 3-5 个关键特征     │
│                                    │
│ → CTA: "试一下这个风格适不适合你"     │
│   （跳转 /try-on?look=[style]）     │
│                                    │
│ FAQ: 3-5 个常见问题                  │
│ 内部链接: 相关风格 + 相关产品推荐     │
└────────────────────────────────────┘
```

### 7.2 L3 场景页模板

```
┌────────────────────────────────────┐
│ H1: [场景]怎么化？[场景]妆容指南       │
│ Hero 图: 该场景的妆容效果              │
│                                    │
│ 段落 1: 这个场景的妆容要点             │
│ 段落 2: 3-5 步快速方案                │
│                                    │
│ → CTA: "上传照片看看这个场景适不适合你" │
│   （跳转 /try-on?scenario=[scene]）  │
│                                    │
│ FAQ: 3-5 个常见问题                  │
│ 内部链接: 相关场景 + 适合的风格        │
└────────────────────────────────────┘
```

### 7.3 L4 人群页模板

```
┌────────────────────────────────────┐
│ H1: [脸型/肤色]怎么化？专属妆容指南     │
│ Hero 图: 该肤型/脸型的妆容效果          │
│                                    │
│ 段落 1: 你的 [特征] 需要什么？        │
│ 段落 2: 3-5 个专属技巧                │
│                                    │
│ → CTA: "AI 诊断你的特征，定制妆容方案"  │
│   （跳转 /try-on?demographic=[type]） │
│                                    │
│ FAQ: 3-5 个常见问题                  │
│ 内部链接: 推荐妆容 + 相关特征          │
└────────────────────────────────────┘
```

---

## 八、hreflang 互指规则

每个页面必须在 HTML `<head>` 中输出所有语言版本的 hreflang：

```html
<!-- 以 /en/looks/soft-glam 为例 -->
<link rel="alternate" hreflang="en" href="https://example.com/looks/soft-glam" />
<link rel="alternate" hreflang="de" href="https://example.com/de/looks/natürlich" />
<link rel="alternate" hreflang="fr" href="https://example.com/fr/looks/maquillage-naturel" />
<link rel="alternate" hreflang="ja" href="https://example.com/ja/looks/ナチュラル" />
<link rel="alternate" hreflang="ko" href="https://example.com/ko/looks/내추럴" />
<link rel="alternate" hreflang="zh-Hant" href="https://example.com/zh-tw/looks/日系" />
<link rel="alternate" hreflang="x-default" href="https://example.com/looks/soft-glam" />
```

**规则：**
1. 每种语言只 hreflang 到 **对应内容最相似的页面**，不需要 1:1 翻译
2. 如果某语言没有对应页面，hreflang 中不包含该语言
3. 必须有 `x-default` 指向英文主站
4. 繁中用 `zh-Hant`（不是 `zh-tw`）

---

## 九、Sitemap 策略

```
sitemap-index.xml
├── sitemap-en.xml      （41 个页面）
├── sitemap-de.xml      （18 个页面）
├── sitemap-fr.xml      （27 个页面）
├── sitemap-ja.xml      （36 个页面）
├── sitemap-ko.xml      （29 个页面）
├── sitemap-zh-tw.xml   （24 个页面）
├── sitemap-es.xml      （20 个页面）
└── sitemap-pt-br.xml   （25 个页面）
```

### 页面进入 sitemap 的准入条件（必须全部满足）

- [ ] 有独特 title（非英文翻译，符合当地搜索表达）
- [ ] 有独特 H1（直接回答用户任务或困惑）
- [ ] 有独特首屏文案（用户 3 秒内知道这页能帮他做什么）
- [ ] 有至少 1 个内部入口链接
- [ ] self-canonical 正确
- [ ] 有结构化数据（FAQPage / HowTo / Article 等）
- [ ] 有 300+ 字独特正文内容
- [ ] 有 CTA 导向试妆转化

---

## 十、执行优先级

### 第一批（现在 → 英文站上线）

| 任务 | 页面数 | 优先级 |
|------|--------|--------|
| L1 英文产品页面 | 5 | P0 |
| L2 英文风格页（KD≤10 的 10 个） | 10 | P0 |
| L3 英文场景页（KD≤10 的 10 个） | 10 | P1 |
| L4 英文人群页（KD≤10 的 8 个） | 8 | P1 |
| L5 英文教程页（KD≤10 的 8 个） | 8 | P2 |
| 多语言路由 + hreflang 预埋 | - | P0 |

### 第二批（英文站有转化数据后）

| 任务 | 页面数 | 优先级 |
|------|--------|--------|
| 德语 18 页 | 18 | P1 |
| 法语 27 页 | 27 | P1 |
| 日语 36 页 | 36 | P1 |
| 语言切换器 UI | - | P0 |

### 第三批

| 任务 | 页面数 | 优先级 |
|------|--------|--------|
| 韩语 29 页 | 29 | P2 |
| 繁中 24 页 | 24 | P2 |

### 第四批

| 任务 | 页面数 | 优先级 |
|------|--------|--------|
| 西语 20 页 | 20 | P3 |
| 葡语 25 页 | 25 | P3 |

---

> **文档维护**：每次新增语言后，必须更新此文档的页面列表和 sitemap 索引。
> KD 数据每季度重新查询一次，根据实际排名情况调整页面优先级。
