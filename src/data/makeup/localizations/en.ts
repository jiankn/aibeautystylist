// ============================================================================
// 英文本地化 — 44 个妆容的英文标题、场景标签和顾问建议
// ============================================================================

import type { LookLocalization, LocalizedAdvisor } from "../audienceTypes";

/** 英文场景标签 */
export const scenarioLabels = {
  daily: "Daily",
  commute: "Commute",
  interview: "Interview",
  date: "Date",
  photo: "Photo",
  event: "Event",
  evening: "Evening",
} as const;

/** 英文妆感筛选标签 */
export const finishFilterLabels = {
  all: "All",
  sheer: "Sheer / Dewy",
  natural: "Natural / Clean",
  glow: "Glow",
  matte: "Soft Matte / Muted",
  satin: "Luminous / Polished",
  photogenic: "Camera Ready",
  contour: "Sculpted / Lifted",
  professional: "Professional",
} as const;

/** 英文难度标签 */
export const experienceLabels = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
} as const;

/** 英文 UI 文案 */
export const uiLabels = {
  filterTitle: "Filter Looks",
  filterScenario: "Scenario",
  filterFinish: "Finish",
  filterExperience: "Difficulty",
  clearFilters: "Reset Filters",
  viewResults: "View",
  looksCount: "looks",
  emptyTitle: "No matching looks",
  emptyHint: "Try removing a filter or resetting to see all looks.",
  tryThisLook: "Try This Look",
  suitableFor: "Best for",
  keyPoints: "Focus on",
  lookDetails: "Look Details",
  makeupAnchors: "Key Techniques",
  cautionTitle: "Caution",
  inspirationLabel: "Showing",
  switchInspiration: "Switch Inspiration",
  allLooks: "All Looks",
  pageTitle: "Discover Looks by Scenario",
  pageSubtitle:
    "Browse makeup looks by scenario, finish, and difficulty. Browsing is free — only your selfie try-on uses credits.",
  discoverTitle: "Discover Makeup Looks | AI Beauty Stylist",
  discoverDescription:
    "Browse commute, date, photo, and event makeup looks. Filter by finish and difficulty, then upload a selfie for an AI try-on preview.",
  experienceFriendly: "Friendly",
} as const;

function advisor(
  fit: string,
  effect: string,
  anchors: string[],
  caution: string,
  judge: string[],
): LocalizedAdvisor {
  return { fit, effect, anchors, caution, judge };
}

export const enLocalizations: LookLocalization[] = [
  loc(
    "beginner--global-diverse",
    "Natural Beginner",
    ["Daily"],
    ["Sheer", "Natural"],
    "Beginner",
    advisor(
      "For daily wear — suits those who want a quick color boost with minimal makeup feel.",
      "Reduces powder appearance while keeping skin clean and lightweight for close-up settings.",
      [
        "Base: thin application, preserve skin texture",
        "Eyes: close to lash line, enhance gaze",
        "Lips & cheeks: same tone family, light sweep for color",
      ],
      "If the result looks dull or washes out your complexion, try a different look.",
      [
        "Does complexion look brighter?",
        "Is the powder feel minimal?",
        "Are features gently enhanced?",
      ],
    ),
  ),
  loc(
    "bronze-evening--global-diverse",
    "Bronze Evening Glam",
    ["Evening", "Event"],
    ["Warm", "Sculpted"],
    "Advanced",
    advisor(
      "For evenings and events — ideal for commanding presence under lighting.",
      "Enhances contour and feature definition, making facial structure more visible.",
      [
        "Base: thin application, preserve skin texture",
        "Eyes: deepen outer corner, maintain contour",
        "Contour: warm-toned light sweep, avoid darkening skin tone",
      ],
      "May be too strong for conservative commutes or interviews — switch to an office look.",
      [
        "Is the contour more defined?",
        "Do colors match the occasion?",
        "Does it still look clean up close?",
      ],
    ),
  ),
  loc(
    "burgundy-velvet--global-diverse",
    "Burgundy Velvet",
    ["Evening", "Event"],
    ["Velvet", "Glowing"],
    "Advanced",
    advisor(
      "For evenings and events — commands attention while maintaining elegance.",
      "Reduces oiliness and color clashing for a more refined, textured finish.",
      [
        "Base: semi-matte, control oil while keeping quality",
        "Eyes: deepen outer corner, maintain contour",
        "Lips & cheeks: muted tones with soft edges",
      ],
      "Too intense for conservative settings — switch to a commute or interview look.",
      [
        "Is the contour more defined?",
        "Do colors match the occasion?",
        "Does it still look clean up close?",
      ],
    ),
  ),
  loc(
    "candlelight-mauve--global-diverse",
    "Candlelight Mauve",
    ["Date", "Evening"],
    ["Soft Matte", "Muted"],
    "Advanced",
    advisor(
      "For dates — soft and approachable without looking overly done.",
      "Reduces oiliness and color clashing for a more refined, textured finish.",
      [
        "Base: semi-matte, control oil while keeping quality",
        "Eyes: close to lash line, enhance gaze",
        "Lips & cheeks: muted tones with soft edges",
      ],
      "If you want stronger color, this may feel too muted — check lips and cheeks.",
      [
        "Are lips and cheeks soft?",
        "Does eye makeup enhance gaze?",
        "Is the overall feel approachable?",
      ],
    ),
  ),
  loc(
    "champagne-gala--global-diverse",
    "Champagne Gala",
    ["Evening", "Event"],
    ["Luminous", "Polished"],
    "Advanced",
    advisor(
      "For evening galas — brings radiance and sophistication under lighting.",
      "Preserves natural skin luminosity, making the face look fuller and fresher.",
      [
        "Base: targeted highlight, avoid full-face oiliness",
        "Eyes: deepen outer corner, maintain contour",
        "Lip color: coordinate with blush to avoid clashing",
      ],
      "If you're oily, check T-zone reflections — switch to matte if too shiny.",
      [
        "Is the contour more defined?",
        "Do colors match the occasion?",
        "Does it still look clean up close?",
      ],
    ),
  ),
  loc(
    "client-meeting-nude--global-diverse",
    "Client Meeting Nude",
    ["Commute", "Interview"],
    ["Natural", "Professional"],
    "Beginner",
    advisor(
      "For commute and meetings — clean, polished, and confident.",
      "Brows and eyes look cleaner; lips and cheeks lift complexion without being heavy.",
      [
        "Base: thin application, preserve skin texture",
        "Eyes: clean lines, eyeshadow within bounds",
        "Lips & cheeks: same tone family, light sweep for color",
      ],
      "If you want a strong evening or high-saturation photo effect, this will feel restrained.",
      [
        "Do brows and eyes look more alert?",
        "Do lips and cheeks add color without stealing focus?",
        "Is the overall feel clean and reliable?",
      ],
    ),
  ),
  loc(
    "cloud-skin-matte--global-diverse",
    "Cloud Skin Matte",
    ["Daily", "Photo"],
    ["Soft Matte", "Airy"],
    "Advanced",
    advisor(
      "For daily and photo — a refined matte without heaviness.",
      "Reduces oiliness and color clashing for a more refined, textured finish.",
      [
        "Base: semi-matte, control oil while keeping quality",
        "Eyes: close to lash line, enhance gaze",
        "Lips & cheeks: muted tones with soft edges",
      ],
      "If you want strong color, this may feel too muted — check lips and cheeks.",
      [
        "Does complexion look brighter?",
        "Is the powder feel minimal?",
        "Are features gently enhanced?",
      ],
    ),
  ),
  loc(
    "commute--global-diverse",
    "Peach Glow Commute",
    ["Commute", "Interview"],
    ["Sheer", "Glowing"],
    "Beginner",
    advisor(
      "For commute and interviews — polished yet effortless color.",
      "Improves tired appearance with lip and cheek color for a friendlier, more alert look.",
      [
        "Base: thin application, preserve skin texture",
        "Eyes: clean lines, eyeshadow within bounds",
        "Lips & cheeks: same tone family, light sweep for color",
      ],
      "If you want a strong evening or high-saturation photo effect, this will feel restrained.",
      [
        "Do brows and eyes look more alert?",
        "Do lips and cheeks add color without stealing focus?",
        "Is the overall feel clean and reliable?",
      ],
    ),
  ),
  loc(
    "creator-camera-glow--global-diverse",
    "Creator Camera Glow",
    ["Photo", "Event"],
    ["Luminous", "Camera Ready"],
    "Advanced",
    advisor(
      "For photos and events — maximizes on-camera radiance.",
      "Preserves natural skin luminosity, making the face look fuller and fresher.",
      [
        "Base: targeted highlight, avoid full-face oiliness",
        "Eyes: close to lash line, enhance gaze",
        "Lip color: coordinate with blush to avoid clashing",
      ],
      "If you're oily, check T-zone reflections — switch to matte if too shiny.",
      [
        "Does it look more sculpted on camera?",
        "Is the highlight natural without overexposure?",
        "Do lips and cheeks hold up in photos?",
      ],
    ),
  ),
  loc(
    "date--global-diverse",
    "Soft Date Look",
    ["Date"],
    ["Soft", "Glowing"],
    "Beginner",
    advisor(
      "For dates — warm, approachable, and naturally flattering.",
      "Improves tired appearance with lip and cheek color for a friendlier, more alert look.",
      [
        "Base: thin application, preserve skin texture",
        "Eyes: close to lash line, enhance gaze",
        "Lips & cheeks: same tone family, light sweep for color",
      ],
      "If the result looks dull or washes out your complexion, try a different look.",
      [
        "Are lips and cheeks soft?",
        "Does eye makeup enhance gaze?",
        "Is the overall feel approachable?",
      ],
    ),
  ),
  loc(
    "douyin-soft-focus--global-diverse",
    "Soft Focus Vibe",
    ["Photo", "Date"],
    ["Soft Focus", "Camera Ready"],
    "Advanced",
    advisor(
      "For photos and dates — softens skin imperfections for a dreamy finish.",
      "Softens skin imperfections and boundaries for a smoother photo finish.",
      [
        "Base: control reflections, light T-zone setting",
        "Eyes: close to lash line, enhance gaze",
        "Lips & cheeks: same tone family, light sweep for color",
      ],
      "For close-up natural socializing, camera-optimized makeup may feel slightly heavy.",
      [
        "Does it look more sculpted on camera?",
        "Is the highlight natural without overexposure?",
        "Do lips and cheeks hold up in photos?",
      ],
    ),
  ),
  loc(
    "evening--global-diverse",
    "Polished Evening",
    ["Evening", "Event"],
    ["Sculpted", "Polished"],
    "Advanced",
    advisor(
      "For evening events — refined glamour with visible structure.",
      "Enhances contour and feature definition, making facial structure more visible.",
      [
        "Base: thin application, preserve skin texture",
        "Eyes: deepen outer corner, maintain contour",
        "Contour: warm-toned light sweep, avoid darkening skin tone",
      ],
      "Too strong for conservative commutes or interviews — switch to an office look.",
      [
        "Is the contour more defined?",
        "Do colors match the occasion?",
        "Does it still look clean up close?",
      ],
    ),
  ),
  loc(
    "executive-rose--global-diverse",
    "Executive Rose",
    ["Commute", "Interview"],
    ["Professional", "Glowing"],
    "Advanced",
    advisor(
      "For work — confident rose tones that command and flatter.",
      "Brows and eyes look cleaner; lips and cheeks lift complexion without being heavy.",
      [
        "Base: thin application, preserve skin texture",
        "Eyes: clean lines, eyeshadow within bounds",
        "Lips & cheeks: same tone family, light sweep for color",
      ],
      "If you want a strong evening or high-saturation photo effect, this will feel restrained.",
      [
        "Do brows and eyes look more alert?",
        "Do lips and cheeks add color without stealing focus?",
        "Is the overall feel clean and reliable?",
      ],
    ),
  ),
  loc(
    "five-minute-beginner--global-diverse",
    "Five-Minute Face",
    ["Daily", "Commute"],
    ["Quick", "Natural"],
    "Beginner",
    advisor(
      "For busy mornings — maximum impact in minimum time.",
      "Reduces powder appearance while keeping skin clean and lightweight for close-up settings.",
      [
        "Base: thin application, preserve skin texture",
        "Eyes: close to lash line, enhance gaze",
        "Lips & cheeks: same tone family, light sweep for color",
      ],
      "If the result looks dull or washes out your complexion, try a different look.",
      [
        "Does complexion look brighter?",
        "Is the powder feel minimal?",
        "Are features gently enhanced?",
      ],
    ),
  ),
  loc(
    "flash-proof-satin--global-diverse",
    "Flash-Proof Satin",
    ["Photo", "Event"],
    ["Satin", "Camera Ready"],
    "Advanced",
    advisor(
      "For photos and events — controls flash reflections for a flawless camera finish.",
      "Enhances facial light and shadow, reducing dullness, caking, and uncontrolled reflections.",
      [
        "Base: control reflections, light T-zone setting",
        "Eyes: close to lash line, enhance gaze",
        "Lips & cheeks: same tone family, light sweep for color",
      ],
      "For close-up natural socializing, camera-optimized makeup may feel slightly heavy.",
      [
        "Does it look more sculpted on camera?",
        "Is the highlight natural without overexposure?",
        "Do lips and cheeks hold up in photos?",
      ],
    ),
  ),
  loc(
    "french-natural-chic--global-diverse",
    "French Natural Chic",
    ["Daily", "Date"],
    ["Natural", "Effortless"],
    "Advanced",
    advisor(
      "For daily and dates — the coveted French 'barely there' elegance.",
      "Reduces powder appearance while keeping skin clean and lightweight for close-up settings.",
      [
        "Base: thin application, preserve skin texture",
        "Eyes: close to lash line, enhance gaze",
        "Lips & cheeks: same tone family, light sweep for color",
      ],
      "If the result looks dull or washes out your complexion, try a different look.",
      [
        "Does complexion look brighter?",
        "Is the powder feel minimal?",
        "Are features gently enhanced?",
      ],
    ),
  ),
  loc(
    "hooded-eyes-lift--global-diverse",
    "Hooded Eyes Lift",
    ["Daily", "Photo"],
    ["Lifted", "Sculpted"],
    "Advanced",
    advisor(
      "For hooded or puffy lids — eye techniques that lift and define.",
      "Enhances contour and feature definition, making facial structure more visible.",
      [
        "Base: thin application, preserve skin texture",
        "Eyes: gentle outer lift, reduce puffiness",
        "Lips & cheeks: same tone family, light sweep for color",
      ],
      "If the result looks dull or washes out your complexion, try a different look.",
      [
        "Does complexion look brighter?",
        "Is the powder feel minimal?",
        "Are features gently enhanced?",
      ],
    ),
  ),
  loc(
    "interview-ready--global-diverse",
    "Interview Ready",
    ["Interview", "Commute"],
    ["Professional", "Glowing"],
    "Beginner",
    advisor(
      "For interviews — alert, clean, and confidence-inspiring.",
      "Brows and eyes look cleaner; lips and cheeks lift complexion without being heavy.",
      [
        "Base: thin application, preserve skin texture",
        "Eyes: clean lines, eyeshadow within bounds",
        "Lips & cheeks: same tone family, light sweep for color",
      ],
      "If you want a strong evening or high-saturation photo effect, this will feel restrained.",
      [
        "Do brows and eyes look more alert?",
        "Do lips and cheeks add color without stealing focus?",
        "Is the overall feel clean and reliable?",
      ],
    ),
  ),
  loc(
    "jelly-lip-tint--global-diverse",
    "Jelly Lip Tint",
    ["Daily", "Date"],
    ["Dewy", "Glowing"],
    "Beginner",
    advisor(
      "For daily and dates — glossy, juicy lips that brighten the whole face.",
      "Improves tired appearance with lip and cheek color for a friendlier, more alert look.",
      [
        "Base: thin application, preserve skin texture",
        "Eyes: close to lash line, enhance gaze",
        "Lips & cheeks: same tone family, light sweep for color",
      ],
      "If the result looks dull or washes out your complexion, try a different look.",
      [
        "Does complexion look brighter?",
        "Is the powder feel minimal?",
        "Are features gently enhanced?",
      ],
    ),
  ),
  loc(
    "korean-dewy-glow--global-diverse",
    "K-Beauty Dewy Glow",
    ["Daily", "Date"],
    ["Dewy", "Sheer"],
    "Advanced",
    advisor(
      "For daily and dates — the coveted glass-skin finish.",
      "Preserves natural skin luminosity, making the face look fuller and fresher.",
      [
        "Base: targeted highlight, avoid full-face oiliness",
        "Eyes: close to lash line, enhance gaze",
        "Lips & cheeks: same tone family, light sweep for color",
      ],
      "If you're oily, check T-zone reflections — switch to matte if too shiny.",
      [
        "Are lips and cheeks soft?",
        "Does eye makeup enhance gaze?",
        "Is the overall feel approachable?",
      ],
    ),
  ),
  loc(
    "korean-dewy-makeup--global-diverse",
    "K-Beauty Sheer Glow",
    ["Daily", "Date"],
    ["Sheer", "Dewy"],
    "Beginner",
    advisor(
      "For daily and dates — effortless Korean-inspired freshness.",
      "Preserves natural skin luminosity, making the face look fuller and fresher.",
      [
        "Base: targeted highlight, avoid full-face oiliness",
        "Eyes: close to lash line, enhance gaze",
        "Lips & cheeks: same tone family, light sweep for color",
      ],
      "If you're oily, check T-zone reflections — switch to matte if too shiny.",
      [
        "Are lips and cheeks soft?",
        "Does eye makeup enhance gaze?",
        "Is the overall feel approachable?",
      ],
    ),
  ),
  loc(
    "latina-bronze-glam--global-diverse",
    "Bronze Glam",
    ["Evening", "Event"],
    ["Warm", "Sculpted"],
    "Advanced",
    advisor(
      "For evenings and events — warm bronze tones with visible contour.",
      "Enhances contour and feature definition, making facial structure more visible.",
      [
        "Base: thin application, preserve skin texture",
        "Eyes: deepen outer corner, maintain contour",
        "Contour: warm-toned light sweep, avoid darkening skin tone",
      ],
      "Too strong for conservative commutes or interviews — switch to an office look.",
      [
        "Is the contour more defined?",
        "Do colors match the occasion?",
        "Does it still look clean up close?",
      ],
    ),
  ),
  loc(
    "mature-skin-radiance--global-diverse",
    "Mature Skin Radiance",
    ["Daily", "Event"],
    ["Radiant", "Natural"],
    "Advanced",
    advisor(
      "For mature skin — strategic radiance that flatters without emphasizing texture.",
      "Preserves natural skin luminosity, making the face look fuller and fresher.",
      [
        "Base: targeted highlight, avoid full-face oiliness",
        "Eyes: close to lash line, enhance gaze",
        "Lips & cheeks: same tone family, light sweep for color",
      ],
      "If you're oily, check T-zone reflections — switch to matte if too shiny.",
      [
        "Does complexion look brighter?",
        "Is the powder feel minimal?",
        "Are features gently enhanced?",
      ],
    ),
  ),
  loc(
    "monolid-makeup--global-diverse",
    "Monolid Eye Makeup",
    ["Daily", "Commute"],
    ["Sheer", "Brightening"],
    "Beginner",
    advisor(
      "For monolids and inner double eyelids — designed to complement your eye shape.",
      "Reduces powder appearance while keeping skin clean and lightweight for close-up settings.",
      [
        "Base: thin application, preserve skin texture",
        "Eyes: close to lash line, enhance gaze",
        "Lips & cheeks: same tone family, light sweep for color",
      ],
      "If the result looks dull or washes out your complexion, try a different look.",
      [
        "Does complexion look brighter?",
        "Is the powder feel minimal?",
        "Are features gently enhanced?",
      ],
    ),
  ),
  loc(
    "no-makeup--global-diverse",
    "No-Makeup Look",
    ["Daily", "Commute"],
    ["Sheer", "Natural"],
    "Beginner",
    advisor(
      "For a 'your skin but better' effect — virtually invisible makeup.",
      "Reduces powder appearance while keeping skin clean and lightweight for close-up settings.",
      [
        "Base: thin application, preserve skin texture",
        "Eyes: close to lash line, enhance gaze",
        "Lips & cheeks: same tone family, light sweep for color",
      ],
      "If the result looks dull or washes out your complexion, try a different look.",
      [
        "Does complexion look brighter?",
        "Is the powder feel minimal?",
        "Are features gently enhanced?",
      ],
    ),
  ),
  loc(
    "olive-undertone-rose--global-diverse",
    "Olive Undertone Rose",
    ["Daily", "Date"],
    ["Muted", "Glowing"],
    "Advanced",
    advisor(
      "Optimized for olive undertones — rose tones that actually flatter.",
      "Improves tired appearance with lip and cheek color for a friendlier, more alert look.",
      [
        "Base: thin application, preserve skin texture",
        "Eyes: close to lash line, enhance gaze",
        "Lips & cheeks: muted tones with soft edges",
      ],
      "If you want stronger color, this may feel too muted — check lips and cheeks.",
      [
        "Are lips and cheeks soft?",
        "Does eye makeup enhance gaze?",
        "Is the overall feel approachable?",
      ],
    ),
  ),
  loc(
    "passport-photo-clean--global-diverse",
    "Passport Photo Clean",
    ["Photo", "Interview"],
    ["Clean", "Camera Ready"],
    "Beginner",
    advisor(
      "For ID photos and headshots — clean and professional under any flash.",
      "Enhances facial light and shadow, reducing dullness, caking, and uncontrolled reflections.",
      [
        "Base: control reflections, light T-zone setting",
        "Eyes: clean lines, eyeshadow within bounds",
        "Lips & cheeks: same tone family, light sweep for color",
      ],
      "For close-up natural socializing, camera-optimized makeup may feel slightly heavy.",
      [
        "Does it look more sculpted on camera?",
        "Is the highlight natural without overexposure?",
        "Do lips and cheeks hold up in photos?",
      ],
    ),
  ),
  loc(
    "peach-beige-date--global-diverse",
    "Peach Beige Date",
    ["Date"],
    ["Soft", "Muted"],
    "Beginner",
    advisor(
      "For dates — warm peach and beige tones that feel effortless.",
      "Improves tired appearance with lip and cheek color for a friendlier, more alert look.",
      [
        "Base: thin application, preserve skin texture",
        "Eyes: close to lash line, enhance gaze",
        "Lips & cheeks: same tone family, light sweep for color",
      ],
      "If you want stronger color, this may feel too muted — check lips and cheeks.",
      [
        "Are lips and cheeks soft?",
        "Does eye makeup enhance gaze?",
        "Is the overall feel approachable?",
      ],
    ),
  ),
  loc(
    "peach-morning-glow--global-diverse",
    "Morning Peach Glow",
    ["Daily", "Commute"],
    ["Sheer", "Glowing"],
    "Beginner",
    advisor(
      "For mornings — fresh peach tones that wake up your complexion.",
      "Improves tired appearance with lip and cheek color for a friendlier, more alert look.",
      [
        "Base: thin application, preserve skin texture",
        "Eyes: close to lash line, enhance gaze",
        "Lips & cheeks: same tone family, light sweep for color",
      ],
      "If the result looks dull or washes out your complexion, try a different look.",
      [
        "Does complexion look brighter?",
        "Is the powder feel minimal?",
        "Are features gently enhanced?",
      ],
    ),
  ),
  loc(
    "photogenic--global-diverse",
    "Photogenic Soft Focus",
    ["Photo", "Event"],
    ["Soft Focus", "Camera Ready"],
    "Beginner",
    advisor(
      "For photos and events — beginner-friendly camera optimization.",
      "Softens skin imperfections and boundaries for a smoother photo finish.",
      [
        "Base: control reflections, light T-zone setting",
        "Eyes: close to lash line, enhance gaze",
        "Lips & cheeks: same tone family, light sweep for color",
      ],
      "For close-up natural socializing, camera-optimized makeup may feel slightly heavy.",
      [
        "Does it look more sculpted on camera?",
        "Is the highlight natural without overexposure?",
        "Do lips and cheeks hold up in photos?",
      ],
    ),
  ),
  loc(
    "refined--global-diverse",
    "Refined Polished",
    ["Commute", "Event"],
    ["Polished", "Sculpted"],
    "Advanced",
    advisor(
      "For commute and events — effortlessly sophisticated and sculpted.",
      "Enhances contour and feature definition, making facial structure more visible.",
      [
        "Base: thin application, preserve skin texture",
        "Eyes: deepen outer corner, maintain contour",
        "Contour: warm-toned light sweep, avoid darkening skin tone",
      ],
      "If the result looks dull or washes out your complexion, try a different look.",
      [
        "Does complexion look brighter?",
        "Is the powder feel minimal?",
        "Are features gently enhanced?",
      ],
    ),
  ),
  loc(
    "reflective-lid-glow--global-diverse",
    "Reflective Lid Glow",
    ["Photo", "Evening"],
    ["Luminous", "Camera Ready"],
    "Advanced",
    advisor(
      "For photos and evenings — dazzling lid shimmer with controlled radiance.",
      "Preserves natural skin luminosity, making the face look fuller and fresher.",
      [
        "Base: targeted highlight, avoid full-face oiliness",
        "Eyes: close to lash line, enhance gaze",
        "Lips & cheeks: same tone family, light sweep for color",
      ],
      "If you're oily, check T-zone reflections — switch to matte if too shiny.",
      [
        "Does it look more sculpted on camera?",
        "Is the highlight natural without overexposure?",
        "Do lips and cheeks hold up in photos?",
      ],
    ),
  ),
  loc(
    "romantic-pink--global-diverse",
    "Romantic Pink",
    ["Date", "Event"],
    ["Soft", "Glowing"],
    "Beginner",
    advisor(
      "For dates and events — feminine pink tones that feel warm and inviting.",
      "Improves tired appearance with lip and cheek color for a friendlier, more alert look.",
      [
        "Base: thin application, preserve skin texture",
        "Eyes: close to lash line, enhance gaze",
        "Lips & cheeks: same tone family, light sweep for color",
      ],
      "If the result looks dull or washes out your complexion, try a different look.",
      [
        "Are lips and cheeks soft?",
        "Does eye makeup enhance gaze?",
        "Is the overall feel approachable?",
      ],
    ),
  ),
  loc(
    "rose-milk-date--global-diverse",
    "Rose Milk Date",
    ["Date"],
    ["Soft Matte", "Muted"],
    "Beginner",
    advisor(
      "For dates — rosy milk tea tones for a softly sophisticated feel.",
      "Reduces oiliness and color clashing for a more refined, textured finish.",
      [
        "Base: semi-matte, control oil while keeping quality",
        "Eyes: close to lash line, enhance gaze",
        "Lips & cheeks: muted tones with soft edges",
      ],
      "If you want stronger color, this may feel too muted — check lips and cheeks.",
      [
        "Are lips and cheeks soft?",
        "Does eye makeup enhance gaze?",
        "Is the overall feel approachable?",
      ],
    ),
  ),
  loc(
    "soft-berry-stain--global-diverse",
    "Soft Berry Stain",
    ["Daily", "Date"],
    ["Soft", "Glowing"],
    "Beginner",
    advisor(
      "For daily and dates — berry-stained lips that look naturally vibrant.",
      "Improves tired appearance with lip and cheek color for a friendlier, more alert look.",
      [
        "Base: thin application, preserve skin texture",
        "Eyes: close to lash line, enhance gaze",
        "Lips & cheeks: same tone family, light sweep for color",
      ],
      "If the result looks dull or washes out your complexion, try a different look.",
      [
        "Does complexion look brighter?",
        "Is the powder feel minimal?",
        "Are features gently enhanced?",
      ],
    ),
  ),
  loc(
    "soft-editorial--global-diverse",
    "Soft Editorial",
    ["Photo", "Event"],
    ["Editorial", "Soft Matte"],
    "Advanced",
    advisor(
      "For photos and events — editorial elegance with controlled restraint.",
      "Reduces oiliness and color clashing for a more refined, textured finish.",
      [
        "Base: semi-matte, control oil while keeping quality",
        "Eyes: deepen outer corner, maintain contour",
        "Lips & cheeks: muted tones with soft edges",
      ],
      "For close-up natural socializing, camera-optimized makeup may feel slightly heavy.",
      [
        "Does it look more sculpted on camera?",
        "Is the highlight natural without overexposure?",
        "Do lips and cheeks hold up in photos?",
      ],
    ),
  ),
  loc(
    "soft-matte-everyday--global-diverse",
    "Soft Matte Everyday",
    ["Daily", "Commute"],
    ["Soft Matte", "Natural"],
    "Beginner",
    advisor(
      "For daily and commute — oil-controlled matte that still looks alive.",
      "Reduces oiliness and color clashing for a more refined, textured finish.",
      [
        "Base: semi-matte, control oil while keeping quality",
        "Eyes: close to lash line, enhance gaze",
        "Lips & cheeks: muted tones with soft edges",
      ],
      "If you want stronger color, this may feel too muted — check lips and cheeks.",
      [
        "Does complexion look brighter?",
        "Is the powder feel minimal?",
        "Are features gently enhanced?",
      ],
    ),
  ),
  loc(
    "summer-wedding-guest--global-diverse",
    "Summer Wedding Guest",
    ["Event", "Evening"],
    ["Sheer", "Camera Ready"],
    "Advanced",
    advisor(
      "For summer weddings — heat-proof elegance that photographs beautifully.",
      "Enhances facial light and shadow, reducing dullness, caking, and uncontrolled reflections.",
      [
        "Base: control reflections, light T-zone setting",
        "Eyes: deepen outer corner, maintain contour",
        "Lips & cheeks: same tone family, light sweep for color",
      ],
      "Too strong for conservative commutes or interviews — switch to an office look.",
      [
        "Is the contour more defined?",
        "Do colors match the occasion?",
        "Does it still look clean up close?",
      ],
    ),
  ),
  loc(
    "sunburn-satin-glow--global-diverse",
    "Sunburn Satin Glow",
    ["Daily", "Photo"],
    ["Satin", "Warm"],
    "Advanced",
    advisor(
      "For daily and photos — a sun-kissed satin finish with warmth.",
      "Preserves natural skin luminosity, making the face look fuller and fresher.",
      [
        "Base: targeted highlight, avoid full-face oiliness",
        "Eyes: close to lash line, enhance gaze",
        "Lips & cheeks: same tone family, light sweep for color",
      ],
      "If you're oily, check T-zone reflections — switch to matte if too shiny.",
      [
        "Does complexion look brighter?",
        "Is the powder feel minimal?",
        "Are features gently enhanced?",
      ],
    ),
  ),
  loc(
    "vacation-bronze--global-diverse",
    "Vacation Bronze",
    ["Photo", "Event"],
    ["Warm", "Luminous"],
    "Advanced",
    advisor(
      "For vacation photos — golden bronze glow that screams holiday.",
      "Preserves natural skin luminosity, making the face look fuller and fresher.",
      [
        "Base: targeted highlight, avoid full-face oiliness",
        "Eyes: close to lash line, enhance gaze",
        "Contour: warm-toned light sweep, avoid darkening skin tone",
      ],
      "If you're oily, check T-zone reflections — switch to matte if too shiny.",
      [
        "Does it look more sculpted on camera?",
        "Is the highlight natural without overexposure?",
        "Do lips and cheeks hold up in photos?",
      ],
    ),
  ),
  loc(
    "warm-nude-daily--global-diverse",
    "Warm Nude Daily",
    ["Daily", "Commute"],
    ["Natural", "Warm"],
    "Beginner",
    advisor(
      "For daily and commute — warm nude tones that suit most skin tones.",
      "Reduces powder appearance while keeping skin clean and lightweight for close-up settings.",
      [
        "Base: thin application, preserve skin texture",
        "Eyes: close to lash line, enhance gaze",
        "Lips & cheeks: same tone family, light sweep for color",
      ],
      "If the result looks dull or washes out your complexion, try a different look.",
      [
        "Does complexion look brighter?",
        "Is the powder feel minimal?",
        "Are features gently enhanced?",
      ],
    ),
  ),
  loc(
    "watercolor-blush--global-diverse",
    "Watercolor Blush",
    ["Date", "Photo"],
    ["Sheer", "Glowing"],
    "Advanced",
    advisor(
      "For dates and photos — diffused watercolor blush for a dreamy flush.",
      "Improves tired appearance with lip and cheek color for a friendlier, more alert look.",
      [
        "Base: thin application, preserve skin texture",
        "Eyes: close to lash line, enhance gaze",
        "Lips & cheeks: same tone family, light sweep for color",
      ],
      "For close-up natural socializing, camera-optimized makeup may feel slightly heavy.",
      [
        "Are lips and cheeks soft?",
        "Does eye makeup enhance gaze?",
        "Is the overall feel approachable?",
      ],
    ),
  ),
  loc(
    "wedding-guest--global-diverse",
    "Wedding Guest",
    ["Event", "Evening"],
    ["Polished", "Camera Ready"],
    "Advanced",
    advisor(
      "For weddings — timeless elegance that holds up all day and night.",
      "Enhances contour and feature definition, making facial structure more visible.",
      [
        "Base: thin application, preserve skin texture",
        "Eyes: deepen outer corner, maintain contour",
        "Contour: warm-toned light sweep, avoid darkening skin tone",
      ],
      "Too strong for conservative commutes or interviews — switch to an office look.",
      [
        "Is the contour more defined?",
        "Do colors match the occasion?",
        "Does it still look clean up close?",
      ],
    ),
  ),
  loc(
    "weekend-glow--global-diverse",
    "Weekend Glow",
    ["Daily", "Date"],
    ["Luminous", "Airy"],
    "Beginner",
    advisor(
      "For weekends — laid-back luminosity that feels effortless.",
      "Preserves natural skin luminosity, making the face look fuller and fresher.",
      [
        "Base: targeted highlight, avoid full-face oiliness",
        "Eyes: close to lash line, enhance gaze",
        "Lips & cheeks: same tone family, light sweep for color",
      ],
      "If you're oily, check T-zone reflections — switch to matte if too shiny.",
      [
        "Are lips and cheeks soft?",
        "Does eye makeup enhance gaze?",
        "Is the overall feel approachable?",
      ],
    ),
  ),
];

function loc(
  marketVariantId: string,
  title: string,
  scenarios: string[],
  finishLabels: string[],
  experienceLabel: string,
  adv: LocalizedAdvisor,
): LookLocalization {
  return {
    marketVariantId,
    locale: "en",
    title,
    summary: `${title} — ideal for ${scenarios.join(", ").toLowerCase()} scenarios with a ${finishLabels.join(", ").toLowerCase()} finish.`,
    imageAltTemplate: `${title} makeup reference`,
    scenarios,
    finishLabels,
    experienceLabel,
    advisor: adv,
  };
}

export function getEnLocalization(
  marketVariantId: string,
): LookLocalization | undefined {
  return enLocalizations.find((l) => l.marketVariantId === marketVariantId);
}
