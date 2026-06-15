import type { LocalizedAdvisor, LookLocalization } from "../audienceTypes";
import { enLocalizations } from "./en";

export const scenarioLabels = {
  daily: "데일리",
  commute: "출근",
  interview: "면접",
  date: "데이트",
  photo: "사진",
  event: "행사",
  evening: "저녁",
} as const;

export const finishFilterLabels = {
  all: "전체",
  sheer: "시어 / 촉촉함",
  natural: "내추럴 / 클린",
  glow: "광채",
  matte: "소프트 매트 / 저채도",
  satin: "윤광 / 정돈된",
  photogenic: "사진 준비",
  contour: "윤곽 / 리프팅",
  professional: "프로페셔널",
} as const;

export const experienceLabels = {
  beginner: "초보",
  intermediate: "중급",
  advanced: "고급",
} as const;

export const uiLabels = {
  filterTitle: "룩 필터",
  filterScenario: "상황",
  filterFinish: "마무리감",
  filterExperience: "난이도",
  clearFilters: "필터 초기화",
  viewResults: "보기",
  looksCount: "개 룩",
  emptyTitle: "조건에 맞는 룩이 없습니다",
  emptyHint: "필터를 줄이거나 초기화해서 전체 룩을 확인해 보세요.",
  tryThisLook: "이 룩 시도하기",
  suitableFor: "추천 상황",
  keyPoints: "포인트",
  lookDetails: "룩 상세",
  makeupAnchors: "핵심 테크닉",
  cautionTitle: "주의할 점",
  inspirationLabel: "표시 기준",
  switchInspiration: "기준 변경",
  allLooks: "전체 룩",
  pageTitle: "상황별 메이크업 룩 탐색",
  pageSubtitle:
    "상황, 마무리감, 난이도로 메이크업 룩을 살펴보세요. 탐색은 무료이며 셀피 시도에만 크레딧이 사용됩니다.",
  discoverTitle: "메이크업 룩 탐색 | AI Beauty Stylist",
  discoverDescription:
    "출근, 데이트, 사진, 행사 메이크업 룩을 살펴보세요. 마무리감과 난이도로 필터링한 뒤 셀피로 AI 미리보기를 확인할 수 있습니다.",
  experienceFriendly: "쉬움",
} as const;

const titleOverrides: Record<string, string> = {
  beginner: "내추럴 비기너",
  "bronze-evening": "브론즈 이브닝 글램",
  "burgundy-velvet": "버건디 벨벳",
  "candlelight-mauve": "캔들라이트 모브",
  "champagne-gala": "샴페인 갈라",
  "client-meeting-nude": "클라이언트 미팅 누드",
  "cloud-skin-matte": "클라우드 스킨 매트",
  commute: "피치 글로우 출근",
  "creator-camera-glow": "크리에이터 카메라 글로우",
  date: "소프트 데이트 룩",
  "douyin-soft-focus": "소프트 포커스 무드",
  evening: "폴리시드 이브닝",
  "executive-rose": "이그제큐티브 로즈",
  "five-minute-beginner": "5분 메이크업",
  "flash-proof-satin": "플래시 프루프 새틴",
  "french-natural-chic": "프렌치 내추럴 시크",
  "hooded-eyes-lift": "눈매 리프트 메이크업",
  "interview-ready": "인터뷰 레디",
  "jelly-lip-tint": "젤리 립 틴트",
  "korean-dewy-glow": "K-뷰티 물광 글로우",
  "korean-dewy-makeup": "K-뷰티 시어 글로우",
  "latina-bronze-glam": "브론즈 글램",
  "mature-skin-radiance": "성숙한 피부 광채",
  "monolid-makeup": "홑꺼풀 아이 메이크업",
  "no-makeup": "꾸안꾸 메이크업",
  "olive-undertone-rose": "올리브 언더톤 로즈",
  "passport-photo-clean": "증명사진 클린",
  "peach-beige-date": "피치 베이지 데이트",
  "peach-morning-glow": "모닝 피치 글로우",
  photogenic: "포토제닉 소프트 포커스",
  refined: "정돈된 폴리시드",
  "reflective-lid-glow": "리플렉티브 리드 글로우",
  "romantic-pink": "로맨틱 핑크",
  "rose-milk-date": "로즈 밀크 데이트",
  "soft-berry-stain": "소프트 베리 스테인",
  "soft-editorial": "소프트 에디토리얼",
  "soft-matte-everyday": "소프트 매트 데일리",
  "summer-wedding-guest": "여름 하객 메이크업",
  "sunburn-satin-glow": "선번 새틴 글로우",
  "vacation-bronze": "바캉스 브론즈",
  "warm-nude-daily": "웜 누드 데일리",
  "watercolor-blush": "워터컬러 블러셔",
  "wedding-guest": "하객 메이크업",
  "weekend-glow": "주말 글로우",
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
  Airy: "가벼운",
  Brightening: "화사한",
  "Camera Ready": "사진 준비",
  Clean: "깔끔한",
  Dewy: "촉촉한",
  Editorial: "에디토리얼",
  Effortless: "이지",
  Glowing: "광채",
  Lifted: "리프팅",
  Luminous: "윤광",
  Muted: "저채도",
  Natural: "내추럴",
  Polished: "정돈된",
  Professional: "프로페셔널",
  Quick: "빠른",
  Radiant: "광채",
  Satin: "새틴",
  Sculpted: "윤곽",
  Sheer: "시어",
  Soft: "부드러운",
  "Soft Focus": "소프트 포커스",
  "Soft Matte": "소프트 매트",
  Velvet: "벨벳",
  Warm: "웜",
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
  const scenarioText = scenarios.join(", ");
  const finishText = finishes.join(", ");
  return {
    fit: `${title}은 ${scenarioText} 상황에서 자연스럽게 완성도를 높이고 싶을 때 잘 맞습니다.`,
    effect: `${finishText} 질감을 중심으로 얼굴빛, 눈매, 입술과 치크의 균형을 정리해 줍니다.`,
    anchors: [
      "베이스: 피부 결을 남기고 필요한 부분만 얇게 보정",
      "눈매: 라인보다 속눈썹과 음영으로 또렷함 조절",
      "립/치크: 같은 톤 안에서 혈색을 연결",
    ],
    caution:
      "미리보기에서 색이 먼저 튀거나 얼굴이 납작해 보이면 강도와 범위를 한 단계 낮추세요.",
    judge: [
      "얼굴빛이 더 맑아 보이나요?",
      "눈매와 입술이 균형 있게 보이나요?",
      "가까이 봐도 경계가 자연스러운가요?",
    ],
  };
}

export const koLocalizations: LookLocalization[] = enLocalizations.map(
  (item) => {
    const id = recipeId(item.marketVariantId);
    const title = titleOverrides[id] ?? item.title;
    const scenarios = mapValues(item.scenarios, scenarioMap);
    const finishLabels = mapValues(item.finishLabels, finishMap);
    return {
      ...item,
      locale: "ko-KR",
      title,
      summary: `${title}은 ${scenarios.join(", ")} 상황에 맞춘 ${finishLabels.join(", ")} 메이크업입니다.`,
      imageAltTemplate: `${title} 메이크업 참고 이미지`,
      scenarios,
      finishLabels,
      experienceLabel:
        experienceMap[item.experienceLabel] ?? item.experienceLabel,
      advisor: buildAdvisor(title, scenarios, finishLabels),
    };
  },
);
