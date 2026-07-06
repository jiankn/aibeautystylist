import { getCurrentLocale, type SupportedLocale } from "../lib/i18n";

export type PinterestConversionVariant = "workspace" | "quick5" | "softGlam";

export interface PinterestConversionStep {
  title: string;
  body: string;
}

export interface PinterestConversionCopy {
  kicker: string;
  title: string;
  body: string;
  imageAlt?: string;
  selectedLook?: string;
  selectedLookMeta: string;
  primaryLabel: string;
  secondaryLabel: string;
  proofPoints: readonly string[];
  steps: readonly PinterestConversionStep[];
  membershipTitle: string;
  membershipBody: string;
  membershipLabel: string;
  selectedLookLabel: string;
  proofAriaLabel: string;
  pathAriaLabel: string;
}

interface PinterestSharedCopy {
  selectedLookLabel: string;
  proofAriaLabel: string;
  pathAriaLabel: string;
  membershipLabel: string;
}

type PinterestLocaleCopy = PinterestSharedCopy & {
  variants: Record<
    PinterestConversionVariant,
    Omit<PinterestConversionCopy, keyof PinterestSharedCopy>
  >;
};

const en: PinterestLocaleCopy = {
  selectedLookLabel: "Selected look",
  proofAriaLabel: "Conversion proof points",
  pathAriaLabel: "Pinterest visitor path",
  membershipLabel: "Compare plans",
  variants: {
    workspace: {
      kicker: "Pinterest try-on path",
      title: "Try the look you came for",
      body: "You clicked from a makeup idea. Start with a guided AI preview, then compare whether the color, finish, and intensity fit your face.",
      selectedLookMeta: "Selfie preview, then save or upgrade",
      primaryLabel: "Start free preview",
      secondaryLabel: "Compare plans",
      proofPoints: [
        "Pinterest-ready idea",
        "Your selfie first",
        "Private by default",
        "Members compare more",
      ],
      steps: [
        {
          title: "Pick the look",
          body: "The page starts with a relevant makeup direction so you do not need to search the catalog again.",
        },
        {
          title: "Upload one selfie",
          body: "Use a clear front-facing photo, confirm consent, and generate a realistic style preview.",
        },
        {
          title: "Upgrade for decisions",
          body: "Subscribe when you want more generations, saved looks, HD downloads, and repeatable beauty planning.",
        },
      ],
      membershipTitle: "Why membership fits Pinterest visitors",
      membershipBody:
        "Free previews help you choose a direction. Membership is for comparing more looks, saving results, and downloading polished versions when you are ready to repeat the style.",
    },
    quick5: {
      kicker: "Pinterest quick-look path",
      title: "From saved idea to your face",
      body: "Pinterest gives you the idea. AI Beauty Stylist helps you decide if the five-minute version flatters your face, lighting, and daily routine before you commit.",
      imageAlt: "Five-minute natural makeup look preview on a woman",
      selectedLook: "Five-Minute Face",
      selectedLookMeta: "Natural, quick, work-ready",
      primaryLabel: "Preview this look",
      secondaryLabel: "See member benefits",
      proofPoints: [
        "Preselected look",
        "Selfie-based preview",
        "Free start",
        "Upgrade for more comparisons",
      ],
      steps: [
        {
          title: "Start with the Pin promise",
          body: "You clicked for a fast polished look, so this page keeps the routine focused on skin, brows, lashes, blush, and lip.",
        },
        {
          title: "Preview before applying",
          body: "Open the try-on with Five-Minute Face already selected, upload one selfie, and compare the direction on your own features.",
        },
        {
          title: "Subscribe when it saves time",
          body: "Membership makes sense when you want more generations, saved looks, HD downloads, and repeatable routines.",
        },
      ],
      membershipTitle: "Why membership fits Pinterest visitors",
      membershipBody:
        "Free previews help you choose a direction. Membership is for comparing more looks, saving results, and downloading polished versions when you are ready to repeat the style.",
    },
    softGlam: {
      kicker: "Pinterest soft glam path",
      title: "Make soft glam feel like you",
      body: "Soft glam can look elegant or too heavy depending on your features. Preview the rosy, diffused version first so you can judge color, eye definition, and lip balance on your own face.",
      imageAlt:
        "Soft glam makeup with warm neutral eyes, glowing skin, and rose lips",
      selectedLook: "Rose Milk Date",
      selectedLookMeta: "Soft glam, rosy neutral, date-ready",
      primaryLabel: "Preview this look",
      secondaryLabel: "See member benefits",
      proofPoints: [
        "Soft glam direction",
        "Rosy neutral palette",
        "Selfie-based preview",
        "Upgrade for comparisons",
      ],
      steps: [
        {
          title: "Match the Pin promise",
          body: "You clicked for soft glam, so this page focuses on balanced eyes, glowing skin, and a polished rose lip.",
        },
        {
          title: "Try a softer version first",
          body: "The CTA opens Rose Milk Date already selected, giving you a wearable soft glam starting point.",
        },
        {
          title: "Subscribe for comparison",
          body: "Membership helps when you want to compare warmer, cooler, lighter, and stronger glam directions.",
        },
      ],
      membershipTitle: "Why membership fits Pinterest visitors",
      membershipBody:
        "Free previews help you choose a direction. Membership is for comparing more looks, saving results, and downloading polished versions when you are ready to repeat the style.",
    },
  },
};

const zhCN: PinterestLocaleCopy = {
  selectedLookLabel: "已选妆容",
  proofAriaLabel: "转化信任点",
  pathAriaLabel: "Pinterest 访客路径",
  membershipLabel: "查看会员方案",
  variants: {
    workspace: {
      kicker: "Pinterest 试妆路径",
      title: "试试你刚点进来的妆容",
      body: "你是从一张妆容灵感图点进来的。先用 AI 做一次引导式预览，再判断颜色、妆感和浓淡是否适合你的脸。",
      selectedLookMeta: "先自拍试妆，再保存或升级",
      primaryLabel: "免费开始预览",
      secondaryLabel: "查看会员方案",
      proofPoints: [
        "承接 Pinterest 灵感",
        "先看自己上脸",
        "默认保护隐私",
        "会员可多方案对比",
      ],
      steps: [
        {
          title: "确认这款妆",
          body: "页面会先锁定你从 Pinterest 点进来的妆容方向，不需要重新翻妆容库。",
        },
        {
          title: "上传一张自拍",
          body: "用清晰正脸照片，确认授权后生成更接近真实上脸的妆效预览。",
        },
        {
          title: "为决策升级",
          body: "当你想多试几版、保存结果、下载高清图，或长期规划妆容时，再选择会员。",
        },
      ],
      membershipTitle: "为什么 Pinterest 用户适合开会员",
      membershipBody:
        "免费预览帮你判断方向。会员适合想多试几种妆、保存结果、下载更清晰版本，并把好看的妆容反复复用的人。",
    },
    quick5: {
      kicker: "Pinterest 快速妆路径",
      title: "从收藏灵感到上脸效果",
      body: "Pinterest 负责给你灵感，AI Beauty Stylist 帮你判断这套 5 分钟妆在你的脸、光线和日常场景里是否真的合适。",
      imageAlt: "一位女性的五分钟自然妆预览",
      selectedLook: "五分钟通勤妆",
      selectedLookMeta: "自然、快速、适合上班",
      primaryLabel: "预览这款妆",
      secondaryLabel: "查看会员权益",
      proofPoints: [
        "妆容已预选",
        "基于自拍预览",
        "免费开始",
        "升级后多方案对比",
      ],
      steps: [
        {
          title: "接住 Pin 的承诺",
          body: "你是为了快速又精致的妆容点进来，所以页面只聚焦底妆、眉眼、腮红和唇色这些高影响步骤。",
        },
        {
          title: "上妆前先预览",
          body: "打开试妆时已选好五分钟通勤妆，上传一张自拍就能看它是否适合你的五官。",
        },
        {
          title: "省时间时再订阅",
          body: "当你想多生成几版、保存常用妆容、下载高清结果，并重复使用一套日常流程时，会员更划算。",
        },
      ],
      membershipTitle: "为什么 Pinterest 用户适合开会员",
      membershipBody:
        "免费预览帮你判断方向。会员适合想多试几种妆、保存结果、下载更清晰版本，并把好看的妆容反复复用的人。",
    },
    softGlam: {
      kicker: "Pinterest 柔雾精致妆路径",
      title: "让柔雾精致妆更像你",
      body: "柔雾精致妆可能很高级，也可能在你的五官上显重。先预览玫瑰调的柔和版本，再判断眼妆、肤光和唇色是否平衡。",
      imageAlt: "暖调眼妆、透亮底妆和玫瑰唇色的柔雾精致妆",
      selectedLook: "玫瑰奶茶妆",
      selectedLookMeta: "柔雾精致、玫瑰裸调、适合约会",
      primaryLabel: "预览这款妆",
      secondaryLabel: "查看会员权益",
      proofPoints: [
        "柔雾精致方向",
        "玫瑰裸调配色",
        "基于自拍预览",
        "升级后对比更多版本",
      ],
      steps: [
        {
          title: "对齐 Pin 的期待",
          body: "你点击的是柔雾精致妆，所以页面重点放在平衡眼妆、透亮底妆和干净玫瑰唇。",
        },
        {
          title: "先试更柔和的一版",
          body: "按钮会直接打开玫瑰奶茶妆，先用一款更日常的 soft glam 作为起点。",
        },
        {
          title: "想对比时再订阅",
          body: "会员适合比较偏暖、偏冷、更淡或更浓的不同 glam 方向，避免只凭想象选妆。",
        },
      ],
      membershipTitle: "为什么 Pinterest 用户适合开会员",
      membershipBody:
        "免费预览帮你判断方向。会员适合想多试几种妆、保存结果、下载更清晰版本，并把好看的妆容反复复用的人。",
    },
  },
};

const zhTW: PinterestLocaleCopy = {
  selectedLookLabel: "已選妝容",
  proofAriaLabel: "轉化信任點",
  pathAriaLabel: "Pinterest 訪客路徑",
  membershipLabel: "查看會員方案",
  variants: {
    workspace: {
      kicker: "Pinterest 試妝路徑",
      title: "試試你剛點進來的妝容",
      body: "你是從一張妝容靈感圖點進來的。先用 AI 做一次引導式預覽，再判斷顏色、妝感和濃淡是否適合你的臉。",
      selectedLookMeta: "先自拍試妝，再儲存或升級",
      primaryLabel: "免費開始預覽",
      secondaryLabel: "查看會員方案",
      proofPoints: [
        "承接 Pinterest 靈感",
        "先看自己上臉",
        "預設保護隱私",
        "會員可多方案比較",
      ],
      steps: [
        {
          title: "確認這款妝",
          body: "頁面會先鎖定你從 Pinterest 點進來的妝容方向，不需要重新翻妝容庫。",
        },
        {
          title: "上傳一張自拍",
          body: "用清晰正臉照片，確認授權後生成更接近真實上臉的妝效預覽。",
        },
        {
          title: "為決策升級",
          body: "當你想多試幾版、儲存結果、下載高清圖，或長期規劃妝容時，再選擇會員。",
        },
      ],
      membershipTitle: "為什麼 Pinterest 使用者適合開會員",
      membershipBody:
        "免費預覽幫你判斷方向。會員適合想多試幾種妝、儲存結果、下載更清晰版本，並把好看的妝容反覆使用的人。",
    },
    quick5: {
      kicker: "Pinterest 快速妝路徑",
      title: "從收藏靈感到上臉效果",
      body: "Pinterest 負責給你靈感，AI Beauty Stylist 幫你判斷這套 5 分鐘妝在你的臉、光線和日常場景裡是否真的合適。",
      imageAlt: "一位女性的五分鐘自然妝預覽",
      selectedLook: "五分鐘通勤妝",
      selectedLookMeta: "自然、快速、適合上班",
      primaryLabel: "預覽這款妝",
      secondaryLabel: "查看會員權益",
      proofPoints: [
        "妝容已預選",
        "基於自拍預覽",
        "免費開始",
        "升級後多方案比較",
      ],
      steps: [
        {
          title: "接住 Pin 的承諾",
          body: "你是為了快速又精緻的妝容點進來，所以頁面只聚焦底妝、眉眼、腮紅和唇色這些高影響步驟。",
        },
        {
          title: "上妝前先預覽",
          body: "打開試妝時已選好五分鐘通勤妝，上傳一張自拍就能看它是否適合你的五官。",
        },
        {
          title: "省時間時再訂閱",
          body: "當你想多生成幾版、儲存常用妝容、下載高清結果，並重複使用一套日常流程時，會員更划算。",
        },
      ],
      membershipTitle: "為什麼 Pinterest 使用者適合開會員",
      membershipBody:
        "免費預覽幫你判斷方向。會員適合想多試幾種妝、儲存結果、下載更清晰版本，並把好看的妝容反覆使用的人。",
    },
    softGlam: {
      kicker: "Pinterest 柔霧精緻妝路徑",
      title: "讓柔霧精緻妝更像你",
      body: "柔霧精緻妝可能很高級，也可能在你的五官上顯重。先預覽玫瑰調的柔和版本，再判斷眼妝、膚光和唇色是否平衡。",
      imageAlt: "暖調眼妝、透亮底妝和玫瑰唇色的柔霧精緻妝",
      selectedLook: "玫瑰奶茶妝",
      selectedLookMeta: "柔霧精緻、玫瑰裸調、適合約會",
      primaryLabel: "預覽這款妝",
      secondaryLabel: "查看會員權益",
      proofPoints: [
        "柔霧精緻方向",
        "玫瑰裸調配色",
        "基於自拍預覽",
        "升級後比較更多版本",
      ],
      steps: [
        {
          title: "對齊 Pin 的期待",
          body: "你點擊的是柔霧精緻妝，所以頁面重點放在平衡眼妝、透亮底妝和乾淨玫瑰唇。",
        },
        {
          title: "先試更柔和的一版",
          body: "按鈕會直接打開玫瑰奶茶妝，先用一款更日常的 soft glam 作為起點。",
        },
        {
          title: "想比較時再訂閱",
          body: "會員適合比較偏暖、偏冷、更淡或更濃的不同 glam 方向，避免只憑想像選妝。",
        },
      ],
      membershipTitle: "為什麼 Pinterest 使用者適合開會員",
      membershipBody:
        "免費預覽幫你判斷方向。會員適合想多試幾種妝、儲存結果、下載更清晰版本，並把好看的妝容反覆使用的人。",
    },
  },
};

const ja: PinterestLocaleCopy = {
  selectedLookLabel: "選択中のメイク",
  proofAriaLabel: "安心して試せる理由",
  pathAriaLabel: "Pinterestから来た人の流れ",
  membershipLabel: "プランを見る",
  variants: {
    workspace: {
      kicker: "Pinterestからの試着ルート",
      title: "見に来たメイクをまず試す",
      body: "Pinterestのメイク案から来たなら、まずAIプレビューで自分の顔にのせてみましょう。色、質感、濃さが本当に合うかを確認できます。",
      selectedLookMeta: "自撮りで確認してから保存またはアップグレード",
      primaryLabel: "無料でプレビュー",
      secondaryLabel: "プランを見る",
      proofPoints: [
        "Pinterestの発想をそのまま試せる",
        "自分の顔で確認",
        "初期設定は非公開",
        "会員は比較回数が増える",
      ],
      steps: [
        {
          title: "ルックを選ぶ",
          body: "Pinterestで見た方向性に近いメイクから始まるので、カタログを探し直す必要がありません。",
        },
        {
          title: "自撮りを1枚アップロード",
          body: "正面からの明るい写真を使い、同意を確認してから自然なメイクプレビューを生成します。",
        },
        {
          title: "迷うときはアップグレード",
          body: "もっと生成したい、結果を保存したい、HDで残したい、定番メイクとして使い回したいときに会員プランが役立ちます。",
        },
      ],
      membershipTitle: "Pinterestユーザーに会員プランが合う理由",
      membershipBody:
        "無料プレビューで方向性を確認できます。会員プランは、複数のメイクを比べたい、結果を保存したい、きれいな画像で残して同じスタイルを再現したい人向けです。",
    },
    quick5: {
      kicker: "Pinterest時短メイクルート",
      title: "保存したアイデアを自分の顔へ",
      body: "Pinterestで見つけた5分メイクが、自分の顔、光、毎日の予定に合うかをAI Beauty Stylistで先に確認できます。",
      imageAlt: "女性の5分ナチュラルメイクのプレビュー",
      selectedLook: "5分フェイス",
      selectedLookMeta: "自然、時短、仕事にも使いやすい",
      primaryLabel: "このメイクをプレビュー",
      secondaryLabel: "会員特典を見る",
      proofPoints: [
        "ルックを事前選択",
        "自撮りで確認",
        "無料で開始",
        "アップグレードで比較を増やせる",
      ],
      steps: [
        {
          title: "Pinの期待に合わせる",
          body: "短時間できちんと見えるメイクを求めて来た人向けに、肌、眉、まつげ、チーク、リップだけに絞ります。",
        },
        {
          title: "塗る前に確認",
          body: "5分フェイスが選択された状態で試着を開き、自撮り1枚で自分の顔に合うかを見られます。",
        },
        {
          title: "時短になるなら会員へ",
          body: "複数回生成、保存、HDダウンロード、毎朝使える定番ルーティン化までしたいときに便利です。",
        },
      ],
      membershipTitle: "Pinterestユーザーに会員プランが合う理由",
      membershipBody:
        "無料プレビューで方向性を確認できます。会員プランは、複数のメイクを比べたい、結果を保存したい、きれいな画像で残して同じスタイルを再現したい人向けです。",
    },
    softGlam: {
      kicker: "Pinterestソフトグラムルート",
      title: "ソフトグラムを自分らしく",
      body: "ソフトグラムは上品にも、少し重くも見えます。まずローズ系の柔らかい仕上がりを試して、目元、肌のツヤ、リップのバランスを確認しましょう。",
      imageAlt: "温かみのある目元、ツヤ肌、ローズリップのソフトグラムメイク",
      selectedLook: "ローズミルクティーメイク",
      selectedLookMeta: "ソフトグラム、ローズニュートラル、デート向き",
      primaryLabel: "このメイクをプレビュー",
      secondaryLabel: "会員特典を見る",
      proofPoints: [
        "ソフトグラム方向",
        "ローズニュートラル",
        "自撮りで確認",
        "アップグレードで比較",
      ],
      steps: [
        {
          title: "Pinの期待に合わせる",
          body: "ソフトグラムを見て来た人向けに、整った目元、ツヤ肌、ローズリップに焦点を当てます。",
        },
        {
          title: "まず柔らかい版を試す",
          body: "ボタンを押すとローズミルクティーメイクが選ばれた状態で開き、普段使いしやすい出発点になります。",
        },
        {
          title: "比較したいときに会員へ",
          body: "暖色、寒色、薄め、濃いめなど、違うグラム方向を比べたいときに会員プランが役立ちます。",
        },
      ],
      membershipTitle: "Pinterestユーザーに会員プランが合う理由",
      membershipBody:
        "無料プレビューで方向性を確認できます。会員プランは、複数のメイクを比べたい、結果を保存したい、きれいな画像で残して同じスタイルを再現したい人向けです。",
    },
  },
};

const ko: PinterestLocaleCopy = {
  selectedLookLabel: "선택된 메이크업",
  proofAriaLabel: "전환 신뢰 포인트",
  pathAriaLabel: "Pinterest 방문자 흐름",
  membershipLabel: "요금제 보기",
  variants: {
    workspace: {
      kicker: "Pinterest 맞춤 체험 경로",
      title: "보고 온 메이크업을 바로 테스트하세요",
      body: "메이크업 아이디어를 보고 들어오셨다면, 먼저 AI 프리뷰로 내 얼굴에 어울리는지 확인해 보세요. 컬러, 질감, 강도를 비교할 수 있습니다.",
      selectedLookMeta: "셀피로 먼저 확인한 뒤 저장하거나 업그레이드",
      primaryLabel: "무료 프리뷰 시작",
      secondaryLabel: "요금제 보기",
      proofPoints: [
        "Pinterest 아이디어와 연결",
        "내 얼굴로 먼저 확인",
        "기본 비공개",
        "멤버는 더 많이 비교",
      ],
      steps: [
        {
          title: "룩 선택",
          body: "Pinterest에서 본 방향에 맞춘 메이크업으로 시작하므로 카탈로그를 다시 찾을 필요가 없습니다.",
        },
        {
          title: "셀피 한 장 업로드",
          body: "정면이 잘 보이는 사진을 사용하고 동의를 확인한 뒤 현실적인 스타일 프리뷰를 생성합니다.",
        },
        {
          title: "결정이 필요할 때 업그레이드",
          body: "더 많은 생성, 저장된 룩, HD 다운로드, 반복 가능한 뷰티 플랜이 필요할 때 구독하세요.",
        },
      ],
      membershipTitle: "Pinterest 방문자에게 멤버십이 맞는 이유",
      membershipBody:
        "무료 프리뷰는 방향을 고르는 데 충분합니다. 멤버십은 더 많은 룩을 비교하고, 결과를 저장하고, 선명한 버전으로 내려받아 같은 스타일을 반복하고 싶은 분에게 맞습니다.",
    },
    quick5: {
      kicker: "Pinterest 5분 메이크업 경로",
      title: "저장한 아이디어를 내 얼굴에",
      body: "Pinterest가 아이디어를 준다면, AI Beauty Stylist는 그 5분 메이크업이 내 얼굴, 조명, 일상에 어울리는지 먼저 보여줍니다.",
      imageAlt: "여성의 5분 내추럴 메이크업 프리뷰",
      selectedLook: "5분 데일리 페이스",
      selectedLookMeta: "자연스럽고 빠르며 출근에 적합",
      primaryLabel: "이 룩 미리보기",
      secondaryLabel: "멤버십 혜택 보기",
      proofPoints: [
        "룩 사전 선택",
        "셀피 기반 프리뷰",
        "무료 시작",
        "업그레이드로 더 많이 비교",
      ],
      steps: [
        {
          title: "Pin의 기대와 맞추기",
          body: "빠르고 단정한 룩을 보고 들어온 만큼, 피부, 눈썹, 속눈썹, 블러셔, 립에 집중합니다.",
        },
        {
          title: "바르기 전에 미리보기",
          body: "5분 데일리 페이스가 선택된 상태로 열리며, 셀피 한 장으로 내 이목구비에 맞는지 확인할 수 있습니다.",
        },
        {
          title: "시간을 아껴준다면 구독",
          body: "여러 번 생성하고, 자주 쓰는 룩을 저장하고, HD 결과를 내려받아 일상 루틴으로 쓰고 싶을 때 좋습니다.",
        },
      ],
      membershipTitle: "Pinterest 방문자에게 멤버십이 맞는 이유",
      membershipBody:
        "무료 프리뷰는 방향을 고르는 데 충분합니다. 멤버십은 더 많은 룩을 비교하고, 결과를 저장하고, 선명한 버전으로 내려받아 같은 스타일을 반복하고 싶은 분에게 맞습니다.",
    },
    softGlam: {
      kicker: "Pinterest 소프트 글램 경로",
      title: "소프트 글램을 나답게",
      body: "소프트 글램은 우아해 보일 수도, 내 얼굴에서는 무거워 보일 수도 있습니다. 먼저 로지 톤의 부드러운 버전으로 눈매, 피부 광, 립 밸런스를 확인하세요.",
      imageAlt:
        "따뜻한 뉴트럴 아이, 윤기 있는 피부, 로즈 립의 소프트 글램 메이크업",
      selectedLook: "로즈 밀크티 메이크업",
      selectedLookMeta: "소프트 글램, 로지 뉴트럴, 데이트 무드",
      primaryLabel: "이 룩 미리보기",
      secondaryLabel: "멤버십 혜택 보기",
      proofPoints: [
        "소프트 글램 방향",
        "로지 뉴트럴 팔레트",
        "셀피 기반 프리뷰",
        "업그레이드로 비교",
      ],
      steps: [
        {
          title: "Pin의 약속과 맞추기",
          body: "소프트 글램을 보고 들어온 만큼 균형 잡힌 눈매, 윤기 있는 피부, 정돈된 로즈 립에 집중합니다.",
        },
        {
          title: "더 부드러운 버전부터",
          body: "CTA를 누르면 로즈 밀크티 메이크업이 선택된 상태로 열려, 부담 없는 소프트 글램 출발점이 됩니다.",
        },
        {
          title: "비교하고 싶을 때 구독",
          body: "따뜻한 톤, 차가운 톤, 더 연한 버전, 더 강한 버전까지 비교하고 싶을 때 멤버십이 유용합니다.",
        },
      ],
      membershipTitle: "Pinterest 방문자에게 멤버십이 맞는 이유",
      membershipBody:
        "무료 프리뷰는 방향을 고르는 데 충분합니다. 멤버십은 더 많은 룩을 비교하고, 결과를 저장하고, 선명한 버전으로 내려받아 같은 스타일을 반복하고 싶은 분에게 맞습니다.",
    },
  },
};

const es: PinterestLocaleCopy = {
  selectedLookLabel: "Look seleccionado",
  proofAriaLabel: "Razones para probarlo",
  pathAriaLabel: "Ruta para visitantes de Pinterest",
  membershipLabel: "Ver planes",
  variants: {
    workspace: {
      kicker: "Ruta de prueba desde Pinterest",
      title: "Prueba el look que te trajo aquí",
      body: "Llegaste desde una idea de maquillaje. Empieza con una vista previa guiada por IA y compara si el color, el acabado y la intensidad favorecen tu rostro.",
      selectedLookMeta: "Prueba con tu selfie, luego guarda o mejora",
      primaryLabel: "Empezar gratis",
      secondaryLabel: "Ver planes",
      proofPoints: [
        "Idea lista para Pinterest",
        "Primero tu selfie",
        "Privado por defecto",
        "Los miembros comparan más",
      ],
      steps: [
        {
          title: "Elige el look",
          body: "La página empieza con una dirección de maquillaje relevante para que no tengas que volver a buscar en el catálogo.",
        },
        {
          title: "Sube una selfie",
          body: "Usa una foto frontal clara, confirma el consentimiento y genera una vista previa realista del estilo.",
        },
        {
          title: "Mejora para decidir",
          body: "Suscríbete cuando quieras más generaciones, looks guardados, descargas en HD y planificación de belleza repetible.",
        },
      ],
      membershipTitle: "Por qué la membresía encaja con Pinterest",
      membershipBody:
        "Las vistas previas gratuitas ayudan a elegir una dirección. La membresía es para comparar más looks, guardar resultados y descargar versiones pulidas cuando quieras repetir el estilo.",
    },
    quick5: {
      kicker: "Ruta de maquillaje rápido desde Pinterest",
      title: "De idea guardada a tu rostro",
      body: "Pinterest te da la idea. AI Beauty Stylist te ayuda a decidir si la versión de cinco minutos favorece tu rostro, tu luz y tu rutina diaria.",
      imageAlt:
        "Vista previa de maquillaje natural de cinco minutos en una mujer",
      selectedLook: "Rostro en cinco minutos",
      selectedLookMeta: "Natural, rápido y listo para el trabajo",
      primaryLabel: "Previsualizar este look",
      secondaryLabel: "Ver beneficios",
      proofPoints: [
        "Look preseleccionado",
        "Vista previa con selfie",
        "Inicio gratuito",
        "Mejora para comparar más",
      ],
      steps: [
        {
          title: "Empieza con la promesa del Pin",
          body: "Hiciste clic por un look rápido y pulido, así que la página se centra en piel, cejas, pestañas, rubor y labios.",
        },
        {
          title: "Previsualiza antes de maquillarte",
          body: "Abre la prueba con el look de cinco minutos ya seleccionado, sube una selfie y compáralo en tus propios rasgos.",
        },
        {
          title: "Suscríbete si te ahorra tiempo",
          body: "La membresía tiene sentido cuando quieres más generaciones, looks guardados, descargas en HD y rutinas repetibles.",
        },
      ],
      membershipTitle: "Por qué la membresía encaja con Pinterest",
      membershipBody:
        "Las vistas previas gratuitas ayudan a elegir una dirección. La membresía es para comparar más looks, guardar resultados y descargar versiones pulidas cuando quieras repetir el estilo.",
    },
    softGlam: {
      kicker: "Ruta soft glam desde Pinterest",
      title: "Haz que el soft glam se sienta tuyo",
      body: "El soft glam puede verse elegante o demasiado cargado según tus facciones. Prueba primero una versión rosada y difuminada para juzgar color, definición de ojos y equilibrio de labios.",
      imageAlt:
        "Maquillaje soft glam con ojos neutros cálidos, piel luminosa y labios rosados",
      selectedLook: "Soft glam rosa latte",
      selectedLookMeta: "Soft glam, rosa neutro, ideal para cita",
      primaryLabel: "Previsualizar este look",
      secondaryLabel: "Ver beneficios",
      proofPoints: [
        "Dirección soft glam",
        "Paleta rosa neutra",
        "Vista previa con selfie",
        "Mejora para comparar",
      ],
      steps: [
        {
          title: "Conecta con la promesa del Pin",
          body: "Llegaste por soft glam, así que la página se centra en ojos equilibrados, piel luminosa y un labio rosa pulido.",
        },
        {
          title: "Prueba primero una versión suave",
          body: "El botón abre un soft glam rosa latte ya seleccionado, un punto de partida fácil de usar.",
        },
        {
          title: "Suscríbete para comparar",
          body: "La membresía ayuda cuando quieres comparar direcciones más cálidas, frías, suaves o intensas.",
        },
      ],
      membershipTitle: "Por qué la membresía encaja con Pinterest",
      membershipBody:
        "Las vistas previas gratuitas ayudan a elegir una dirección. La membresía es para comparar más looks, guardar resultados y descargar versiones pulidas cuando quieras repetir el estilo.",
    },
  },
};

const fr: PinterestLocaleCopy = {
  selectedLookLabel: "Look sélectionné",
  proofAriaLabel: "Points de confiance",
  pathAriaLabel: "Parcours des visiteurs Pinterest",
  membershipLabel: "Voir les offres",
  variants: {
    workspace: {
      kicker: "Parcours d'essai Pinterest",
      title: "Essayez le look qui vous a fait cliquer",
      body: "Vous arrivez depuis une idée maquillage. Lancez une prévisualisation guidée par IA, puis vérifiez si la couleur, le fini et l'intensité conviennent à votre visage.",
      selectedLookMeta: "Aperçu sur selfie, puis sauvegarde ou upgrade",
      primaryLabel: "Essayer gratuitement",
      secondaryLabel: "Voir les offres",
      proofPoints: [
        "Idée alignée avec Pinterest",
        "Votre selfie d'abord",
        "Privé par défaut",
        "Les membres comparent plus",
      ],
      steps: [
        {
          title: "Choisir le look",
          body: "La page démarre avec une direction maquillage pertinente, sans vous demander de rechercher à nouveau dans le catalogue.",
        },
        {
          title: "Ajouter un selfie",
          body: "Utilisez une photo nette de face, confirmez votre consentement et générez un aperçu réaliste du style.",
        },
        {
          title: "Passer membre pour décider",
          body: "Abonnez-vous quand vous voulez plus de générations, des looks sauvegardés, des téléchargements HD et une routine beauté réutilisable.",
        },
      ],
      membershipTitle: "Pourquoi l'abonnement convient aux visiteurs Pinterest",
      membershipBody:
        "Les aperçus gratuits aident à choisir une direction. L'abonnement sert à comparer plus de looks, sauvegarder vos résultats et télécharger des versions soignées quand vous voulez reproduire le style.",
    },
    quick5: {
      kicker: "Parcours maquillage rapide Pinterest",
      title: "De l'idée enregistrée à votre visage",
      body: "Pinterest donne l'idée. AI Beauty Stylist vous aide à savoir si la version cinq minutes flatte votre visage, votre lumière et votre routine.",
      imageAlt: "Aperçu d'un maquillage naturel en cinq minutes sur une femme",
      selectedLook: "Teint prêt en cinq minutes",
      selectedLookMeta: "Naturel, rapide, adapté au travail",
      primaryLabel: "Prévisualiser ce look",
      secondaryLabel: "Voir les avantages",
      proofPoints: [
        "Look présélectionné",
        "Aperçu sur selfie",
        "Départ gratuit",
        "Upgrade pour comparer plus",
      ],
      steps: [
        {
          title: "Respecter la promesse du Pin",
          body: "Vous avez cliqué pour un look rapide et soigné, donc la page reste centrée sur le teint, les sourcils, les cils, le blush et les lèvres.",
        },
        {
          title: "Prévisualiser avant d'appliquer",
          body: "Ouvrez l'essai avec le look cinq minutes déjà sélectionné, ajoutez un selfie et comparez-le sur vos traits.",
        },
        {
          title: "S'abonner quand cela fait gagner du temps",
          body: "L'abonnement est utile pour générer plus de variantes, sauvegarder les looks, télécharger en HD et répéter vos routines.",
        },
      ],
      membershipTitle: "Pourquoi l'abonnement convient aux visiteurs Pinterest",
      membershipBody:
        "Les aperçus gratuits aident à choisir une direction. L'abonnement sert à comparer plus de looks, sauvegarder vos résultats et télécharger des versions soignées quand vous voulez reproduire le style.",
    },
    softGlam: {
      kicker: "Parcours soft glam Pinterest",
      title: "Rendre le soft glam vraiment personnel",
      body: "Le soft glam peut être élégant ou trop chargé selon vos traits. Essayez d'abord une version rosée et diffuse pour juger la couleur, le regard et l'équilibre des lèvres.",
      imageAlt:
        "Maquillage soft glam avec yeux neutres chauds, peau lumineuse et lèvres rosées",
      selectedLook: "Soft glam rose latte",
      selectedLookMeta: "Soft glam, rose neutre, prêt pour un rendez-vous",
      primaryLabel: "Prévisualiser ce look",
      secondaryLabel: "Voir les avantages",
      proofPoints: [
        "Direction soft glam",
        "Palette rose neutre",
        "Aperçu sur selfie",
        "Upgrade pour comparer",
      ],
      steps: [
        {
          title: "Reprendre la promesse du Pin",
          body: "Vous venez pour un soft glam, donc la page se concentre sur des yeux équilibrés, une peau lumineuse et une lèvre rose soignée.",
        },
        {
          title: "Essayer d'abord une version douce",
          body: "Le bouton ouvre un soft glam rose latte déjà sélectionné, un point de départ portable au quotidien.",
        },
        {
          title: "S'abonner pour comparer",
          body: "L'abonnement aide à comparer des directions plus chaudes, plus froides, plus légères ou plus intenses.",
        },
      ],
      membershipTitle: "Pourquoi l'abonnement convient aux visiteurs Pinterest",
      membershipBody:
        "Les aperçus gratuits aident à choisir une direction. L'abonnement sert à comparer plus de looks, sauvegarder vos résultats et télécharger des versions soignées quand vous voulez reproduire le style.",
    },
  },
};

const de: PinterestLocaleCopy = {
  selectedLookLabel: "Ausgewählter Look",
  proofAriaLabel: "Vertrauenspunkte",
  pathAriaLabel: "Pinterest-Besucherpfad",
  membershipLabel: "Tarife ansehen",
  variants: {
    workspace: {
      kicker: "Pinterest-Try-on-Pfad",
      title: "Teste den Look, wegen dem du hier bist",
      body: "Du kommst von einer Make-up-Idee. Starte mit einer geführten KI-Vorschau und prüfe, ob Farbe, Finish und Intensität zu deinem Gesicht passen.",
      selectedLookMeta: "Selfie-Vorschau, dann speichern oder upgraden",
      primaryLabel: "Kostenlos starten",
      secondaryLabel: "Tarife ansehen",
      proofPoints: [
        "Pinterest-Idee aufgegriffen",
        "Zuerst dein Selfie",
        "Standardmäßig privat",
        "Mitglieder vergleichen mehr",
      ],
      steps: [
        {
          title: "Look auswählen",
          body: "Die Seite startet mit einer passenden Make-up-Richtung, damit du nicht erneut im Katalog suchen musst.",
        },
        {
          title: "Ein Selfie hochladen",
          body: "Nutze ein klares Foto von vorn, bestätige deine Einwilligung und erzeuge eine realistische Stilvorschau.",
        },
        {
          title: "Für Entscheidungen upgraden",
          body: "Abonniere, wenn du mehr Generierungen, gespeicherte Looks, HD-Downloads und wiederholbare Beauty-Planung möchtest.",
        },
      ],
      membershipTitle: "Warum eine Mitgliedschaft zu Pinterest-Besuchern passt",
      membershipBody:
        "Kostenlose Vorschauen helfen bei der Richtung. Die Mitgliedschaft ist für alle, die mehr Looks vergleichen, Ergebnisse speichern und hochwertige Versionen herunterladen möchten.",
    },
    quick5: {
      kicker: "Pinterest-Pfad für schnelle Looks",
      title: "Von der gespeicherten Idee auf dein Gesicht",
      body: "Pinterest liefert die Idee. AI Beauty Stylist hilft dir zu prüfen, ob die Fünf-Minuten-Version zu deinem Gesicht, Licht und Alltag passt.",
      imageAlt: "Fünf-Minuten-Natural-Make-up als Vorschau auf einer Frau",
      selectedLook: "Fünf-Minuten-Face",
      selectedLookMeta: "Natürlich, schnell, arbeitstauglich",
      primaryLabel: "Diesen Look ansehen",
      secondaryLabel: "Mitgliedsvorteile ansehen",
      proofPoints: [
        "Look vorausgewählt",
        "Vorschau mit Selfie",
        "Kostenlos starten",
        "Upgrade für mehr Vergleiche",
      ],
      steps: [
        {
          title: "Mit dem Pin-Versprechen starten",
          body: "Du hast wegen eines schnellen, gepflegten Looks geklickt. Deshalb bleibt die Seite bei Haut, Brauen, Wimpern, Rouge und Lippen.",
        },
        {
          title: "Vor dem Schminken prüfen",
          body: "Öffne den Try-on mit bereits ausgewähltem Fünf-Minuten-Face, lade ein Selfie hoch und vergleiche den Look an deinen Gesichtszügen.",
        },
        {
          title: "Abonnieren, wenn es Zeit spart",
          body: "Die Mitgliedschaft lohnt sich für mehr Generierungen, gespeicherte Looks, HD-Downloads und wiederholbare Routinen.",
        },
      ],
      membershipTitle: "Warum eine Mitgliedschaft zu Pinterest-Besuchern passt",
      membershipBody:
        "Kostenlose Vorschauen helfen bei der Richtung. Die Mitgliedschaft ist für alle, die mehr Looks vergleichen, Ergebnisse speichern und hochwertige Versionen herunterladen möchten.",
    },
    softGlam: {
      kicker: "Pinterest-Soft-Glam-Pfad",
      title: "Soft Glam, der nach dir aussieht",
      body: "Soft Glam kann elegant wirken oder zu schwer aussehen. Prüfe zuerst eine rosige, weich verblendete Version, um Farbe, Augenbetonung und Lippenbalance zu bewerten.",
      imageAlt:
        "Soft-Glam-Make-up mit warmen neutralen Augen, leuchtender Haut und rosigen Lippen",
      selectedLook: "Rose-Milk-Date",
      selectedLookMeta: "Soft Glam, rosig-neutral, date-ready",
      primaryLabel: "Diesen Look ansehen",
      secondaryLabel: "Mitgliedsvorteile ansehen",
      proofPoints: [
        "Soft-Glam-Richtung",
        "Rosig-neutrale Palette",
        "Vorschau mit Selfie",
        "Upgrade für Vergleiche",
      ],
      steps: [
        {
          title: "Das Pin-Versprechen treffen",
          body: "Du hast für Soft Glam geklickt. Die Seite fokussiert deshalb ausgewogene Augen, leuchtende Haut und eine gepflegte rosige Lippe.",
        },
        {
          title: "Zuerst weicher testen",
          body: "Der Button öffnet Rose-Milk-Date bereits ausgewählt und gibt dir einen tragbaren Soft-Glam-Startpunkt.",
        },
        {
          title: "Für Vergleiche abonnieren",
          body: "Die Mitgliedschaft hilft beim Vergleich von wärmeren, kühleren, leichteren und intensiveren Glam-Richtungen.",
        },
      ],
      membershipTitle: "Warum eine Mitgliedschaft zu Pinterest-Besuchern passt",
      membershipBody:
        "Kostenlose Vorschauen helfen bei der Richtung. Die Mitgliedschaft ist für alle, die mehr Looks vergleichen, Ergebnisse speichern und hochwertige Versionen herunterladen möchten.",
    },
  },
};

const ptBR: PinterestLocaleCopy = {
  selectedLookLabel: "Look selecionado",
  proofAriaLabel: "Pontos de confiança",
  pathAriaLabel: "Caminho para visitantes do Pinterest",
  membershipLabel: "Ver planos",
  variants: {
    workspace: {
      kicker: "Caminho de teste do Pinterest",
      title: "Experimente o look que trouxe você até aqui",
      body: "Você chegou por uma ideia de maquiagem. Comece com uma prévia guiada por IA e compare se a cor, o acabamento e a intensidade combinam com o seu rosto.",
      selectedLookMeta: "Prévia com selfie, depois salve ou faça upgrade",
      primaryLabel: "Começar prévia grátis",
      secondaryLabel: "Ver planos",
      proofPoints: [
        "Ideia pronta para Pinterest",
        "Sua selfie primeiro",
        "Privado por padrão",
        "Membros comparam mais",
      ],
      steps: [
        {
          title: "Escolha o look",
          body: "A página começa com uma direção de maquiagem relevante, sem você precisar procurar de novo no catálogo.",
        },
        {
          title: "Envie uma selfie",
          body: "Use uma foto frontal nítida, confirme o consentimento e gere uma prévia realista do estilo.",
        },
        {
          title: "Faça upgrade para decidir",
          body: "Assine quando quiser mais gerações, looks salvos, downloads em HD e planejamento de beleza repetível.",
        },
      ],
      membershipTitle:
        "Por que a assinatura combina com visitantes do Pinterest",
      membershipBody:
        "As prévias grátis ajudam a escolher uma direção. A assinatura é para comparar mais looks, salvar resultados e baixar versões bem acabadas quando você quiser repetir o estilo.",
    },
    quick5: {
      kicker: "Caminho de maquiagem rápida do Pinterest",
      title: "Da ideia salva para o seu rosto",
      body: "O Pinterest dá a ideia. O AI Beauty Stylist ajuda você a decidir se a versão de cinco minutos combina com seu rosto, sua luz e sua rotina.",
      imageAlt: "Prévia de maquiagem natural de cinco minutos em uma mulher",
      selectedLook: "Rosto em cinco minutos",
      selectedLookMeta: "Natural, rápido e pronto para o trabalho",
      primaryLabel: "Pré-visualizar este look",
      secondaryLabel: "Ver benefícios",
      proofPoints: [
        "Look pré-selecionado",
        "Prévia com selfie",
        "Início grátis",
        "Upgrade para comparar mais",
      ],
      steps: [
        {
          title: "Comece pela promessa do Pin",
          body: "Você clicou por um look rápido e polido, então a página foca em pele, sobrancelhas, cílios, blush e lábios.",
        },
        {
          title: "Veja antes de aplicar",
          body: "Abra o teste com o look de cinco minutos já selecionado, envie uma selfie e compare no seu próprio rosto.",
        },
        {
          title: "Assine quando economizar tempo",
          body: "A assinatura faz sentido quando você quer mais gerações, looks salvos, downloads em HD e rotinas repetíveis.",
        },
      ],
      membershipTitle:
        "Por que a assinatura combina com visitantes do Pinterest",
      membershipBody:
        "As prévias grátis ajudam a escolher uma direção. A assinatura é para comparar mais looks, salvar resultados e baixar versões bem acabadas quando você quiser repetir o estilo.",
    },
    softGlam: {
      kicker: "Caminho soft glam do Pinterest",
      title: "Faça o soft glam parecer seu",
      body: "O soft glam pode ficar elegante ou pesado demais dependendo dos seus traços. Teste primeiro uma versão rosada e esfumada para julgar cor, olhos e equilíbrio dos lábios.",
      imageAlt:
        "Maquiagem soft glam com olhos neutros quentes, pele iluminada e lábios rosados",
      selectedLook: "Soft glam rosa latte",
      selectedLookMeta: "Soft glam, rosa neutro, clima de date",
      primaryLabel: "Pré-visualizar este look",
      secondaryLabel: "Ver benefícios",
      proofPoints: [
        "Direção soft glam",
        "Paleta rosa neutra",
        "Prévia com selfie",
        "Upgrade para comparar",
      ],
      steps: [
        {
          title: "Conecte com a promessa do Pin",
          body: "Você veio pelo soft glam, então a página foca em olhos equilibrados, pele iluminada e lábio rosado polido.",
        },
        {
          title: "Teste primeiro uma versão suave",
          body: "O botão abre o soft glam rosa latte já selecionado, um ponto de partida fácil de usar no dia a dia.",
        },
        {
          title: "Assine para comparar",
          body: "A assinatura ajuda quando você quer comparar direções mais quentes, frias, leves ou intensas.",
        },
      ],
      membershipTitle:
        "Por que a assinatura combina com visitantes do Pinterest",
      membershipBody:
        "As prévias grátis ajudam a escolher uma direção. A assinatura é para comparar mais looks, salvar resultados e baixar versões bem acabadas quando você quiser repetir o estilo.",
    },
  },
};

const copyByLocale: Record<SupportedLocale, PinterestLocaleCopy> = {
  en,
  "zh-CN": zhCN,
  "zh-TW": zhTW,
  "ja-JP": ja,
  "ko-KR": ko,
  "es-ES": es,
  "es-419": es,
  "fr-FR": fr,
  "de-DE": de,
  "pt-BR": ptBR,
};

export function getPinterestConversionCopy(
  variant: PinterestConversionVariant,
  locale: SupportedLocale = getCurrentLocale(),
): PinterestConversionCopy {
  const localized = copyByLocale[locale] ?? en;
  const variantCopy = localized.variants[variant] ?? en.variants[variant];

  return {
    ...variantCopy,
    selectedLookLabel: localized.selectedLookLabel,
    proofAriaLabel: localized.proofAriaLabel,
    pathAriaLabel: localized.pathAriaLabel,
    membershipLabel: localized.membershipLabel,
  };
}
