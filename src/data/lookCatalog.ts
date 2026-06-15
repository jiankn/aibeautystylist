export type Experience = "新手" | "进阶";
export type Scenario =
  | "日常"
  | "通勤"
  | "面试"
  | "约会"
  | "拍照"
  | "活动"
  | "晚宴";

export interface LookCatalogItem {
  slug: string;
  title: string;
  image: string;
  imageAlt: string;
  scenarios: Scenario[];
  finish: string[];
  experience: Experience;
  intent: string;
  advisor: LookAdvisor;
}

export interface LookAdvisor {
  fit: string;
  effect: string;
  anchors: string[];
  caution: string;
  judge: string[];
}

export const lookCatalog: LookCatalogItem[] = [
  look("beginner", "新手自然妆", ["日常"], ["清透", "自然"], "新手"),
  look(
    "bronze-evening",
    "鎏金晚宴妆",
    ["晚宴", "活动"],
    ["暖调", "立体"],
    "进阶",
  ),
  look(
    "burgundy-velvet",
    "酒红丝绒妆",
    ["晚宴", "活动"],
    ["丝绒", "显气色"],
    "进阶",
  ),
  look(
    "candlelight-mauve",
    "烛光灰粉妆",
    ["约会", "晚宴"],
    ["柔雾", "低饱和"],
    "进阶",
  ),
  look(
    "champagne-gala",
    "香槟宴会妆",
    ["晚宴", "活动"],
    ["光泽", "精致"],
    "进阶",
  ),
  look(
    "client-meeting-nude",
    "客户会议裸妆",
    ["通勤", "面试"],
    ["自然", "专业"],
    "新手",
  ),
  look(
    "cloud-skin-matte",
    "云感柔雾妆",
    ["日常", "拍照"],
    ["柔雾", "轻盈"],
    "进阶",
  ),
  look("commute", "蜜桃气色妆", ["通勤", "面试"], ["清透", "显气色"], "新手"),
  look(
    "creator-camera-glow",
    "镜头光泽妆",
    ["拍照", "活动"],
    ["光泽", "上镜"],
    "进阶",
  ),
  look("date", "温柔约会妆", ["约会"], ["柔和", "显气色"], "新手"),
  look(
    "douyin-soft-focus",
    "柔焦氛围妆",
    ["拍照", "约会"],
    ["柔焦", "上镜"],
    "进阶",
  ),
  look("evening", "精致晚间妆", ["晚宴", "活动"], ["立体", "精致"], "进阶"),
  look(
    "executive-rose",
    "职场玫瑰妆",
    ["通勤", "面试"],
    ["专业", "显气色"],
    "进阶",
  ),
  look(
    "five-minute-beginner",
    "五分钟新手妆",
    ["日常", "通勤"],
    ["快速", "自然"],
    "新手",
  ),
  look(
    "flash-proof-satin",
    "闪光灯缎光妆",
    ["拍照", "活动"],
    ["缎光", "上镜"],
    "进阶",
  ),
  look(
    "french-natural-chic",
    "法式自然妆",
    ["日常", "约会"],
    ["自然", "松弛"],
    "进阶",
  ),
  look(
    "hooded-eyes-lift",
    "肿眼泡提拉眼妆",
    ["日常", "拍照"],
    ["提拉", "立体"],
    "进阶",
  ),
  look(
    "interview-ready",
    "面试精神妆",
    ["面试", "通勤"],
    ["专业", "显气色"],
    "新手",
  ),
  look(
    "jelly-lip-tint",
    "果冻唇妆",
    ["日常", "约会"],
    ["水润", "显气色"],
    "新手",
  ),
  look(
    "korean-dewy-glow",
    "韩系水光妆",
    ["日常", "约会"],
    ["水光", "清透"],
    "进阶",
  ),
  look(
    "korean-dewy-makeup",
    "韩系清透妆",
    ["日常", "约会"],
    ["清透", "水润"],
    "新手",
  ),
  look(
    "latina-bronze-glam",
    "拉丁暖金妆",
    ["晚宴", "活动"],
    ["暖调", "立体"],
    "进阶",
  ),
  look(
    "mature-skin-radiance",
    "熟龄焕亮妆",
    ["日常", "活动"],
    ["焕亮", "自然"],
    "进阶",
  ),
  look(
    "monolid-makeup",
    "单眼皮清透眼妆",
    ["日常", "通勤"],
    ["清透", "提神"],
    "新手",
  ),
  look("no-makeup", "清透裸妆", ["日常", "通勤"], ["清透", "自然"], "新手"),
  look(
    "olive-undertone-rose",
    "橄榄皮玫瑰妆",
    ["日常", "约会"],
    ["低饱和", "显气色"],
    "进阶",
  ),
  look(
    "passport-photo-clean",
    "证件照干净妆",
    ["拍照", "面试"],
    ["干净", "上镜"],
    "新手",
  ),
  look(
    "peach-beige-date",
    "蜜桃米色约会妆",
    ["约会"],
    ["柔和", "低饱和"],
    "新手",
  ),
  look(
    "peach-morning-glow",
    "晨光蜜桃妆",
    ["日常", "通勤"],
    ["清透", "显气色"],
    "新手",
  ),
  look("photogenic", "上镜柔焦妆", ["拍照", "活动"], ["柔焦", "上镜"], "新手"),
  look("refined", "轻熟精致妆", ["通勤", "活动"], ["精致", "立体"], "进阶"),
  look(
    "reflective-lid-glow",
    "闪耀眼皮光泽妆",
    ["拍照", "晚宴"],
    ["光泽", "上镜"],
    "进阶",
  ),
  look(
    "romantic-pink",
    "浪漫粉调妆",
    ["约会", "活动"],
    ["柔和", "显气色"],
    "新手",
  ),
  look("rose-milk-date", "玫瑰奶茶妆", ["约会"], ["柔雾", "低饱和"], "新手"),
  look(
    "soft-berry-stain",
    "柔莓染唇妆",
    ["日常", "约会"],
    ["柔和", "显气色"],
    "新手",
  ),
  look(
    "soft-editorial",
    "柔和编辑妆",
    ["拍照", "活动"],
    ["高级", "柔雾"],
    "进阶",
  ),
  look(
    "soft-matte-everyday",
    "日常柔雾妆",
    ["日常", "通勤"],
    ["柔雾", "自然"],
    "新手",
  ),
  look(
    "summer-wedding-guest",
    "夏日婚礼宾客妆",
    ["活动", "晚宴"],
    ["清透", "上镜"],
    "进阶",
  ),
  look(
    "sunburn-satin-glow",
    "晒后缎光妆",
    ["日常", "拍照"],
    ["缎光", "暖调"],
    "进阶",
  ),
  look(
    "vacation-bronze",
    "度假古铜妆",
    ["拍照", "活动"],
    ["暖调", "光泽"],
    "进阶",
  ),
  look(
    "warm-nude-daily",
    "暖调日常裸妆",
    ["日常", "通勤"],
    ["自然", "暖调"],
    "新手",
  ),
  look(
    "watercolor-blush",
    "水彩腮红妆",
    ["约会", "拍照"],
    ["清透", "显气色"],
    "进阶",
  ),
  look(
    "wedding-guest",
    "婚礼宾客妆",
    ["活动", "晚宴"],
    ["精致", "上镜"],
    "进阶",
  ),
  look(
    "weekend-glow",
    "周末光泽妆",
    ["日常", "约会"],
    ["光泽", "轻盈"],
    "新手",
  ),
];

function look(
  slug: string,
  title: string,
  scenarios: Scenario[],
  finish: string[],
  experience: Experience,
): LookCatalogItem {
  return {
    slug,
    title,
    image: `/images/look-${slug}.webp`,
    imageAlt: `${title}妆容参考图`,
    scenarios,
    finish,
    experience,
    intent: `${title}，适合${scenarios.join("、")}场景，重点呈现${finish.join("、")}妆效。`,
    advisor: buildLookAdvisor(title, scenarios, finish, experience),
  };
}

function buildLookAdvisor(
  title: string,
  scenarios: Scenario[],
  finish: string[],
  experience: Experience,
): LookAdvisor {
  const scenarioText = scenarios.join("、");
  const finishText = finish.join("、");

  return {
    fit: `${scenarioText}时，适合想要${getNeed(scenarios, finish)}的人；整体妆效偏${finishText}。`,
    effect: getEffect(finish, scenarios),
    anchors: getAnchors(finish, scenarios, experience),
    caution: getCaution(title, finish, scenarios),
    judge: getJudgePoints(finish, scenarios),
  };
}

function hasAny(items: readonly string[], targets: readonly string[]) {
  return targets.some((target) => items.includes(target));
}

function hasScenario(
  scenarios: readonly Scenario[],
  targets: readonly Scenario[],
) {
  return targets.some((target) => scenarios.includes(target));
}

function getNeed(scenarios: Scenario[], finish: string[]) {
  if (hasAny(finish, ["专业"]) || hasScenario(scenarios, ["面试", "通勤"])) {
    return "精神、干净，表达更稳";
  }
  if (hasAny(finish, ["上镜", "柔焦"]) || hasScenario(scenarios, ["拍照"])) {
    return "镜头里更稳、更立体";
  }
  if (hasScenario(scenarios, ["晚宴", "活动"])) {
    return "灯光下更有存在感";
  }
  if (hasScenario(scenarios, ["约会"])) {
    return "柔和亲近，但不显刻意";
  }
  return "快速提气色，妆感保持轻";
}

function getEffect(finish: string[], scenarios: Scenario[]) {
  if (hasAny(finish, ["专业"])) {
    return "眉眼线条更干净，唇颊把气色拉起来，看起来稳重但不浓。";
  }
  if (hasAny(finish, ["上镜"])) {
    return "强化面部光影和轮廓，减少镜头里的暗沉、浮粉和反光失控。";
  }
  if (hasAny(finish, ["柔焦"])) {
    return "弱化皮肤瑕疵和边界感，让照片里的妆面更柔和。";
  }
  if (hasAny(finish, ["光泽", "水光", "缎光", "焕亮"])) {
    return "保留皮肤的自然亮度，让面部看起来更饱满、更有新鲜感。";
  }
  if (hasAny(finish, ["丝绒", "柔雾", "低饱和", "高级"])) {
    return "降低油光和颜色冲突感，妆面更克制，也更容易显质感。";
  }
  if (hasAny(finish, ["暖调", "立体", "提拉", "精致"])) {
    return "加强轮廓和五官存在感，让脸部结构看起来更清楚。";
  }
  if (hasAny(finish, ["显气色", "柔和"])) {
    return "用唇颊色改善疲惫感，整体亲和度和精神感都会更明显。";
  }
  if (hasScenario(scenarios, ["日常", "通勤"])) {
    return "减少粉感，让皮肤看起来干净、轻薄，适合近距离日常场景。";
  }
  return "在保留本人五官的基础上，调整气色、轮廓和妆面干净度。";
}

function getAnchors(
  finish: string[],
  scenarios: Scenario[],
  experience: Experience,
) {
  const base = hasAny(finish, ["光泽", "水光", "缎光", "焕亮"])
    ? "底妆：局部提亮，避免满脸油光"
    : hasAny(finish, ["丝绒", "柔雾", "低饱和", "高级"])
      ? "底妆：半哑光，压油光保质感"
      : hasAny(finish, ["上镜"]) || hasScenario(scenarios, ["拍照"])
        ? "底妆：控反光，T 区少量定妆"
        : "底妆：薄涂，保留皮肤纹理";

  const eye = hasAny(finish, ["提拉"])
    ? "眉眼：眼尾轻提，弱化肿胀感"
    : hasAny(finish, ["专业"])
      ? "眉眼：线条干净，眼影不过界"
      : hasScenario(scenarios, ["晚宴", "活动"])
        ? "眉眼：加深眼尾，保留轮廓"
        : "眉眼：贴近睫毛，放大眼神";

  const lipCheek = hasAny(finish, ["显气色", "柔和", "清透"])
    ? "唇颊：同色系轻扫，先提气色"
    : hasAny(finish, ["低饱和", "柔雾", "丝绒"])
      ? "唇颊：低饱和色，边界要柔"
      : hasAny(finish, ["暖调", "立体"])
        ? "修容：暖调轻扫，别压暗肤色"
        : "唇色：和腮红统一，避免跳色";

  return experience === "新手"
    ? [base, eye, lipCheek]
    : [base, eye, `${lipCheek}，细节少量叠加`];
}

function getCaution(title: string, finish: string[], scenarios: Scenario[]) {
  if (hasAny(finish, ["光泽", "水光", "缎光", "焕亮"])) {
    return "如果你容易出油，生成后重点看 T 区反光；太亮就换柔雾或自然妆。";
  }
  if (hasAny(finish, ["低饱和", "柔雾"])) {
    return "如果你想要很强的提气色，它可能偏淡，生成后重点看唇颊存在感。";
  }
  if (hasScenario(scenarios, ["晚宴", "活动"])) {
    return "如果今天是严肃面试或保守通勤，它可能偏强，优先换通勤或面试妆。";
  }
  if (hasScenario(scenarios, ["面试", "通勤"])) {
    return "如果你想要强晚宴感或高饱和照片效果，它会偏克制。";
  }
  if (hasScenario(scenarios, ["拍照"])) {
    return "如果主要是近距离自然社交，镜头优化妆可能会略有存在感。";
  }
  return `如果生成后压肤色或显疲惫，${title}就不是最优先选择。`;
}

function getJudgePoints(finish: string[], scenarios: Scenario[]) {
  if (hasAny(finish, ["专业"]) || hasScenario(scenarios, ["面试"])) {
    return ["眉眼是否更精神", "唇颊是否提气色但不抢戏", "整体是否干净稳妥"];
  }
  if (hasAny(finish, ["上镜", "柔焦"]) || hasScenario(scenarios, ["拍照"])) {
    return ["镜头下是否更立体", "高光是否自然不过曝", "唇颊是否撑得住照片"];
  }
  if (hasScenario(scenarios, ["约会"])) {
    return ["唇颊是否柔和", "眼妆是否放大眼神", "整体是否亲近不厚重"];
  }
  if (hasScenario(scenarios, ["晚宴", "活动"])) {
    return ["轮廓是否更清楚", "颜色是否和场合匹配", "近看是否仍然干净"];
  }
  return ["气色是否更精神", "粉感是否轻", "五官优势是否更清楚"];
}

// ============================================================================
// 兼容层辅助函数
// 新代码请使用 src/data/makeup/resolveCatalog.ts 的 resolveLookCatalog()
// ============================================================================

/** 按 slug 查找旧目录条目 */
export function lookBySlug(slug: string): LookCatalogItem | undefined {
  return lookCatalog.find((item) => item.slug === slug);
}

/**
 * 按 recipeId 查找旧目录条目。
 * 在当前实现中 recipeId 与 slug 相同。
 */
export function lookByRecipeId(recipeId: string): LookCatalogItem | undefined {
  return lookCatalog.find((item) => item.slug === recipeId);
}
