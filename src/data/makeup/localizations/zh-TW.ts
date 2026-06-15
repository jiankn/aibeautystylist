import type { LocalizedAdvisor, LookLocalization } from "../audienceTypes";
import { enLocalizations } from "./en";

export const scenarioLabels = {
  daily: "日常",
  commute: "通勤",
  interview: "面試",
  date: "約會",
  photo: "拍照",
  event: "活動",
  evening: "晚間",
} as const;

export const finishFilterLabels = {
  all: "全部",
  sheer: "清透 / 水潤",
  natural: "自然 / 乾淨",
  glow: "光澤",
  matte: "柔霧 / 低飽和",
  satin: "透亮 / 精緻",
  photogenic: "上鏡",
  contour: "輪廓 / 提拉",
  professional: "專業",
} as const;

export const experienceLabels = {
  beginner: "新手",
  intermediate: "中階",
  advanced: "進階",
} as const;

export const uiLabels = {
  filterTitle: "篩選妝容",
  filterScenario: "情境",
  filterFinish: "妝感",
  filterExperience: "難度",
  clearFilters: "重設篩選",
  viewResults: "查看",
  looksCount: "個妝容",
  emptyTitle: "沒有符合條件的妝容",
  emptyHint: "試著取消部分篩選，或重設後查看全部妝容。",
  tryThisLook: "試試這個妝容",
  suitableFor: "適合",
  keyPoints: "重點",
  lookDetails: "妝容細節",
  makeupAnchors: "核心技巧",
  cautionTitle: "注意事項",
  inspirationLabel: "顯示依據",
  switchInspiration: "切換依據",
  allLooks: "全部妝容",
  pageTitle: "依情境探索妝容",
  pageSubtitle:
    "依照情境、妝感與難度瀏覽妝容。瀏覽不消耗額度，只有自拍試妝會使用點數。",
  discoverTitle: "探索妝容 | AI Beauty Stylist",
  discoverDescription:
    "瀏覽通勤、約會、拍照和活動妝容。依妝感與難度篩選，再上傳自拍查看 AI 試妝預覽。",
  experienceFriendly: "友善",
} as const;

const titleOverrides: Record<string, string> = {
  beginner: "自然新手妝",
  "bronze-evening": "古銅晚宴妝",
  "burgundy-velvet": "酒紅絲絨妝",
  "candlelight-mauve": "燭光莫蘭迪妝",
  "champagne-gala": "香檳晚宴妝",
  "client-meeting-nude": "客戶會議裸妝",
  "cloud-skin-matte": "雲霧柔霧肌",
  commute: "通勤蜜桃光",
  "creator-camera-glow": "創作者鏡頭光",
  date: "柔和約會妝",
  "douyin-soft-focus": "柔焦氛圍妝",
  evening: "精緻晚宴妝",
  "executive-rose": "高階玫瑰妝",
  "five-minute-beginner": "五分鐘妝容",
  "flash-proof-satin": "閃光燈友善緞光妝",
  "french-natural-chic": "法式自然妝",
  "hooded-eyes-lift": "眼型提拉妝",
  "interview-ready": "面試妝容",
  "jelly-lip-tint": "果凍唇妝",
  "korean-dewy-glow": "韓系水光妝",
  "korean-dewy-makeup": "韓系清透光",
  "latina-bronze-glam": "古銅光澤妝",
  "mature-skin-radiance": "熟齡肌光澤妝",
  "monolid-makeup": "單眼皮眼妝",
  "no-makeup": "偽素顏妝",
  "olive-undertone-rose": "橄欖膚色玫瑰妝",
  "passport-photo-clean": "證件照乾淨妝",
  "peach-beige-date": "蜜桃米色約會妝",
  "peach-morning-glow": "早晨蜜桃光",
  photogenic: "上鏡柔焦妝",
  refined: "精緻俐落妝",
  "reflective-lid-glow": "眼皮反光妝",
  "romantic-pink": "浪漫粉色妝",
  "rose-milk-date": "玫瑰奶茶約會妝",
  "soft-berry-stain": "柔和莓果唇",
  "soft-editorial": "柔霧編輯感妝",
  "soft-matte-everyday": "日常柔霧妝",
  "summer-wedding-guest": "夏日婚禮賓客妝",
  "sunburn-satin-glow": "日曬緞光妝",
  "vacation-bronze": "度假古銅妝",
  "warm-nude-daily": "暖裸日常妝",
  "watercolor-blush": "水彩腮紅妝",
  "wedding-guest": "婚禮賓客妝",
  "weekend-glow": "週末光澤妝",
};

const scenarioMap: Record<string, string> = {
  Daily: scenarioLabels.daily,
  Commute: scenarioLabels.commute,
  Interview: scenarioLabels.interview,
  Date: scenarioLabels.date,
  Photo: scenarioLabels.photo,
  Event: scenarioLabels.event,
  Evening: scenarioLabels.evening,
};

const finishMap: Record<string, string> = {
  Airy: "輕盈",
  Brightening: "提亮",
  "Camera Ready": "上鏡",
  Clean: "乾淨",
  Dewy: "水潤",
  Editorial: "編輯感",
  Effortless: "輕鬆",
  Glowing: "光澤",
  Lifted: "提拉",
  Luminous: "透亮",
  Muted: "低飽和",
  Natural: "自然",
  Polished: "精緻",
  Professional: "專業",
  Quick: "快速",
  Radiant: "光采",
  Satin: "緞光",
  Sculpted: "輪廓",
  Sheer: "清透",
  Soft: "柔和",
  "Soft Focus": "柔焦",
  "Soft Matte": "柔霧",
  Velvet: "絲絨",
  Warm: "暖調",
};

const experienceMap: Record<string, string> = {
  Beginner: experienceLabels.beginner,
  Intermediate: experienceLabels.intermediate,
  Advanced: experienceLabels.advanced,
};

function recipeId(marketVariantId: string): string {
  return marketVariantId.split("--")[0] ?? marketVariantId;
}

function mapValues(values: string[], map: Record<string, string>): string[] {
  return values.map((value) => map[value] ?? value);
}

function buildAdvisor(
  title: string,
  scenarios: string[],
  finishes: string[],
): LocalizedAdvisor {
  const scenarioText = scenarios.join("、");
  const finishText = finishes.join("、");
  return {
    fit: `${title}適合用在${scenarioText}，想讓妝容更完整但不失去真實臉部狀態時可以優先嘗試。`,
    effect: `以${finishText}妝感整理膚色、眼神和唇頰比例，讓整體看起來更協調。`,
    anchors: [
      "底妝：薄層修飾，保留皮膚紋理",
      "眼妝：用睫毛和陰影增加精神，避免線條過硬",
      "唇頰：保持同一色彩溫度，讓血色自然連接",
    ],
    caution:
      "如果預覽中顏色比五官更搶眼，或臉部變得扁平，先降低濃度或縮小範圍。",
    judge: [
      "臉色是否更乾淨明亮？",
      "眼神和唇色是否平衡？",
      "近看時邊界是否自然？",
    ],
  };
}

export const zhTWLocalizations: LookLocalization[] = enLocalizations.map(
  (item) => {
    const id = recipeId(item.marketVariantId);
    const title = titleOverrides[id] ?? item.title;
    const scenarios = mapValues(item.scenarios, scenarioMap);
    const finishLabels = mapValues(item.finishLabels, finishMap);
    return {
      ...item,
      locale: "zh-TW",
      title,
      summary: `${title}是適合${scenarios.join("、")}情境的${finishLabels.join("、")}妝容。`,
      imageAltTemplate: `${title}妝容參考圖`,
      scenarios,
      finishLabels,
      experienceLabel:
        experienceMap[item.experienceLabel] ?? item.experienceLabel,
      advisor: buildAdvisor(title, scenarios, finishLabels),
    };
  },
);
