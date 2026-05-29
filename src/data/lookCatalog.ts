export type LookScenario = 'office' | 'date' | 'photo';
export type LookCategory = 'daily' | 'date' | 'photo' | 'event' | 'beginner' | 'feature';

export const LOOK_LIBRARY_TARGET_COUNT = 48;

export interface LookCatalogItem {
  slug: string;
  title: string;
  tone: string;
  image: string;
  imageAlt: string;
  scenario: LookScenario;
  category: LookCategory;
  focus: string;
  intent: string;
}

export const lookFilters: Array<{ label: string; value: LookCategory | 'all' }> = [
  { label: 'All', value: 'all' },
  { label: 'Daily', value: 'daily' },
  { label: 'Date', value: 'date' },
  { label: 'Photo', value: 'photo' },
  { label: 'Event', value: 'event' },
  { label: 'Beginner', value: 'beginner' },
  { label: 'Feature', value: 'feature' },
];

export const lookCatalogItems: LookCatalogItem[] = [
  {
    slug: 'office-glow',
    title: 'Office Glow',
    tone: 'Polished daily',
    image: '/images/hero/look-commute.webp',
    imageAlt: 'Office glow makeup with polished skin and muted rose lip',
    scenario: 'office',
    category: 'daily',
    focus: 'center 26%',
    intent: 'polished daily work makeup with thin base, sharper brows, and muted rose lips',
  },
  {
    slug: 'clean-girl',
    title: 'Clean Girl',
    tone: 'Glossy skin',
    image: '/images/hero/style-clean-girl.webp',
    imageAlt: 'Clean girl makeup with glossy skin, lifted brows, and soft nude lips',
    scenario: 'office',
    category: 'daily',
    focus: 'center 24%',
    intent: 'minimal glossy skin, brushed brows, cream blush, and a clear nude lip',
  },
  {
    slug: 'fresh-minimal',
    title: 'Fresh Minimal',
    tone: 'Beginner safe',
    image: '/images/hero/look-beginner.webp',
    imageAlt: 'Fresh minimal beginner makeup with natural skin and soft glossy lip',
    scenario: 'office',
    category: 'beginner',
    focus: 'center 24%',
    intent: 'beginner-friendly fresh skin with invisible correction and soft lip balm color',
  },
  {
    slug: 'no-makeup',
    title: 'No-Makeup',
    tone: 'Invisible polish',
    image: '/images/hero/look-no-makeup.webp',
    imageAlt: 'No-makeup makeup with subtle skin correction and barely there color',
    scenario: 'office',
    category: 'beginner',
    focus: 'center 24%',
    intent: 'your-skin-but-better correction, invisible brow fill, and a my-lips-but-better shade',
  },
  {
    slug: 'glass-skin',
    title: 'Glass Skin',
    tone: 'Dewy finish',
    image: '/images/hero/style-glass-skin.webp',
    imageAlt: 'Glass skin makeup with luminous base and soft gradient lip',
    scenario: 'office',
    category: 'daily',
    focus: 'center 24%',
    intent: 'K-beauty inspired translucent glow, hydrated skin, cream cheek, and gradient lip',
  },
  {
    slug: 'quiet-taupe',
    title: 'Quiet Taupe',
    tone: 'Refined neutral',
    image: '/images/hero/look-refined.webp',
    imageAlt: 'Quiet taupe makeup with sculpted cheeks and satin nude lip',
    scenario: 'office',
    category: 'daily',
    focus: 'center 24%',
    intent: 'quiet luxury neutral makeup with taupe eyes, refined cheek definition, and satin nude lips',
  },
  {
    slug: 'soft-glam',
    title: 'Soft Glam',
    tone: 'Romantic glow',
    image: '/images/hero/style-soft-glam.webp',
    imageAlt: 'Soft glam makeup with warm eyes and satin nude rose lip',
    scenario: 'date',
    category: 'date',
    focus: 'center 24%',
    intent: 'wearable soft glam with warm depth, sculpted cheekbones, and satin rose nude lips',
  },
  {
    slug: 'berry-date',
    title: 'Berry Date',
    tone: 'Close-up pretty',
    image: '/images/hero/look-date.webp',
    imageAlt: 'Soft berry date night makeup with glossy skin and berry lips',
    scenario: 'date',
    category: 'date',
    focus: 'center 24%',
    intent: 'dewy date makeup with soft eye depth and berry lip-cheek harmony',
  },
  {
    slug: 'romantic-pink',
    title: 'Romantic Pink',
    tone: 'Warm flush',
    image: '/images/hero/look-romantic-pink.webp',
    imageAlt: 'Romantic pink makeup with warm flushed cheeks and soft lips',
    scenario: 'date',
    category: 'date',
    focus: 'center 24%',
    intent: 'warm rosy date makeup with doe eyes, flushed cheeks, and satin rose lips',
  },
  {
    slug: 'photo-ready',
    title: 'Photo Ready',
    tone: 'Camera balanced',
    image: '/images/hero/look-photogenic.webp',
    imageAlt: 'Photo ready makeup with defined eyes and camera balanced lip',
    scenario: 'photo',
    category: 'photo',
    focus: 'center 22%',
    intent: 'camera-balanced complexion, defined eyes, controlled shine, and a lip that holds on camera',
  },
  {
    slug: 'zoom-polish',
    title: 'Zoom Polish',
    tone: 'Clear on camera',
    image: '/images/hero/hero-polished-elegant.webp',
    imageAlt: 'Zoom polished makeup with clear brows and balanced skin',
    scenario: 'photo',
    category: 'photo',
    focus: '75% 24%',
    intent: 'video-call friendly makeup with clear brows, smooth complexion, and enough lip color to read on screen',
  },
  {
    slug: 'radiant-glow',
    title: 'Radiant Glow',
    tone: 'Luminous depth',
    image: '/images/hero/hero-inclusive-glow.webp',
    imageAlt: 'Radiant glow makeup with luminous skin and dimensional cheeks',
    scenario: 'photo',
    category: 'photo',
    focus: '20% 24%',
    intent: 'luminous camera glow with skin radiance, soft contour, and dimensional lip-cheek color',
  },
  {
    slug: 'wedding-guest',
    title: 'Wedding Guest',
    tone: 'Rosewood polish',
    image: '/images/hero/look-wedding-guest.webp',
    imageAlt: 'Wedding guest makeup with rosewood lip and photo-ready eyes',
    scenario: 'photo',
    category: 'event',
    focus: 'center 22%',
    intent: 'wedding guest makeup with rosewood polish, defined lashes, and flash-safe complexion',
  },
  {
    slug: 'evening-gala',
    title: 'Evening Gala',
    tone: 'Deep event glam',
    image: '/images/hero/look-evening.webp',
    imageAlt: 'Evening gala makeup with burgundy smoky eyes and deep satin lip',
    scenario: 'photo',
    category: 'event',
    focus: 'center 20%',
    intent: 'deep event glam with smoky definition, sculpted cheeks, and a rich satin lip',
  },
  {
    slug: 'soft-editorial',
    title: 'Soft Editorial',
    tone: 'Statement eyes',
    image: '/images/hero/look-soft-editorial.webp',
    imageAlt: 'Soft editorial makeup with statement eyes and restrained lip color',
    scenario: 'photo',
    category: 'event',
    focus: 'center 20%',
    intent: 'soft editorial makeup with statement eyes, refined skin, and restrained lips',
  },
  {
    slug: 'interview-ready',
    title: 'Interview Ready',
    tone: 'Calm structure',
    image: '/images/hero/look-interview-ready.webp',
    imageAlt: 'Interview ready makeup with structured brows and muted lip',
    scenario: 'office',
    category: 'daily',
    focus: 'center 24%',
    intent: 'interview makeup with calm structure, matte control, defined brows, and muted rose lips',
  },
  {
    slug: 'asian-refined',
    title: 'Asian Refined',
    tone: 'Clean definition',
    image: '/images/hero/hero-asian-refined.webp',
    imageAlt: 'Asian refined makeup with clean eye definition and satin skin',
    scenario: 'office',
    category: 'daily',
    focus: 'center 24%',
    intent: 'clean refined makeup for softer eye definition, balanced cheek color, and satin skin',
  },
  {
    slug: 'weekend-glow',
    title: 'Weekend Glow',
    tone: 'Easy fresh face',
    image: '/images/hero/look-weekend-glow.webp',
    imageAlt: 'Weekend glow makeup with fresh skin and effortless color',
    scenario: 'office',
    category: 'beginner',
    focus: 'center 24%',
    intent: 'easy weekend glow with hydrated skin, cream blush, and a low-effort glossy lip',
  },
  {
    slug: 'soft-matte-everyday',
    title: 'Soft Matte Everyday',
    tone: 'Natural blur',
    image: '/images/hero/look-soft-matte-everyday.webp',
    imageAlt: 'Soft matte everyday makeup with blurred skin and natural lip',
    scenario: 'office',
    category: 'daily',
    focus: 'center 24%',
    intent: 'natural blurred complexion, soft matte finish, feathered brows, and a comfortable nude lip',
  },
  {
    slug: 'warm-nude-daily',
    title: 'Warm Nude Daily',
    tone: 'Soft warmth',
    image: '/images/hero/look-warm-nude-daily.webp',
    imageAlt: 'Warm nude daily makeup with subtle warmth and soft definition',
    scenario: 'office',
    category: 'daily',
    focus: 'center 24%',
    intent: 'warm nude everyday makeup with beige-brown eyes, soft cheek warmth, and warm nude lips',
  },
  {
    slug: 'peach-morning-glow',
    title: 'Peach Morning Glow',
    tone: 'Fresh peach',
    image: '/images/hero/look-peach-morning-glow.webp',
    imageAlt: 'Peach morning glow makeup with fresh cheeks and luminous skin',
    scenario: 'office',
    category: 'daily',
    focus: 'center 24%',
    intent: 'fresh peach morning makeup with luminous skin, peach cream blush, and sheer peach lips',
  },
  {
    slug: 'client-meeting-nude',
    title: 'Client Meeting Nude',
    tone: 'Quiet authority',
    image: '/images/hero/look-client-meeting-nude.webp',
    imageAlt: 'Client meeting nude makeup with quiet authority and polished features',
    scenario: 'office',
    category: 'daily',
    focus: 'center 24%',
    intent: 'client meeting makeup with quiet authority, controlled shine, structured brows, and professional nude lips',
  },
  {
    slug: 'executive-rose',
    title: 'Executive Rose',
    tone: 'Structured rose',
    image: '/images/hero/look-executive-rose.webp',
    imageAlt: 'Executive rose makeup with structured cheeks and rose lip',
    scenario: 'office',
    category: 'daily',
    focus: 'center 24%',
    intent: 'executive rose makeup with structured cheeks, refined eyes, and muted rose lips',
  },
  {
    slug: 'passport-photo-clean',
    title: 'Passport Photo Clean',
    tone: 'ID-safe polish',
    image: '/images/hero/look-passport-photo-clean.webp',
    imageAlt: 'Passport photo clean makeup with balanced skin and natural definition',
    scenario: 'photo',
    category: 'photo',
    focus: 'center 22%',
    intent: 'ID-photo safe makeup with even skin, natural brow definition, and no distracting shimmer',
  },
  {
    slug: 'flash-proof-satin',
    title: 'Flash-Proof Satin',
    tone: 'No flashback',
    image: '/images/hero/look-flash-proof-satin.webp',
    imageAlt: 'Flash-proof satin makeup with camera-safe complexion and satin lip',
    scenario: 'photo',
    category: 'photo',
    focus: 'center 22%',
    intent: 'flash-proof satin makeup with controlled powder, soft contour, and satin lip color',
  },
  {
    slug: 'creator-camera-glow',
    title: 'Creator Camera Glow',
    tone: 'Studio friendly',
    image: '/images/hero/look-creator-camera-glow.webp',
    imageAlt: 'Creator camera glow makeup with studio-friendly skin and defined features',
    scenario: 'photo',
    category: 'photo',
    focus: 'center 24%',
    intent: 'creator camera makeup with skin glow that survives lighting, defined eyes, and balanced lip color',
  },
  {
    slug: 'candlelight-mauve',
    title: 'Candlelight Mauve',
    tone: 'Low-light soft',
    image: '/images/hero/look-candlelight-mauve.webp',
    imageAlt: 'Candlelight mauve makeup with soft depth for low light',
    scenario: 'date',
    category: 'date',
    focus: 'center 24%',
    intent: 'low-light date makeup with mauve eye depth, soft cheek glow, and mauve rose lips',
  },
  {
    slug: 'rose-milk-date',
    title: 'Rose Milk Date',
    tone: 'Milky rose',
    image: '/images/hero/look-rose-milk-date.webp',
    imageAlt: 'Rose milk date makeup with milky rose cheeks and lips',
    scenario: 'date',
    category: 'date',
    focus: 'center 24%',
    intent: 'milky rose date makeup with soft skin, airy lashes, and rose milk lip color',
  },
  {
    slug: 'peach-beige-date',
    title: 'Peach Beige Date',
    tone: 'Warm close-up',
    image: '/images/hero/look-peach-beige-date.webp',
    imageAlt: 'Peach beige date makeup with warm close-up friendly color',
    scenario: 'date',
    category: 'date',
    focus: 'center 24%',
    intent: 'warm peach beige date makeup with close-up friendly skin and soft lip-cheek harmony',
  },
  {
    slug: 'bronze-evening',
    title: 'Bronze Evening',
    tone: 'Warm sculpt',
    image: '/images/hero/look-bronze-evening.webp',
    imageAlt: 'Bronze evening makeup with warm sculpt and deep eyes',
    scenario: 'photo',
    category: 'event',
    focus: 'center 20%',
    intent: 'bronze evening makeup with warm sculpt, soft smoky eyes, and bronzed nude lips',
  },
  {
    slug: 'burgundy-velvet',
    title: 'Burgundy Velvet',
    tone: 'Deep velvet',
    image: '/images/hero/look-burgundy-velvet.webp',
    imageAlt: 'Burgundy velvet makeup with deep eyes and rich satin lip',
    scenario: 'photo',
    category: 'event',
    focus: 'center 20%',
    intent: 'burgundy velvet event makeup with deep eye structure, polished skin, and rich satin lips',
  },
  {
    slug: 'champagne-gala',
    title: 'Champagne Gala',
    tone: 'Soft shimmer',
    image: '/images/hero/look-champagne-gala.webp',
    imageAlt: 'Champagne gala makeup with soft shimmer and event polish',
    scenario: 'photo',
    category: 'event',
    focus: 'center 22%',
    intent: 'champagne gala makeup with soft shimmer, lifted lashes, and elegant rose nude lips',
  },
  {
    slug: 'five-minute-beginner',
    title: 'Five-Minute Beginner',
    tone: 'Fast routine',
    image: '/images/hero/look-five-minute-beginner.webp',
    imageAlt: 'Five-minute beginner makeup with fast fresh skin and easy color',
    scenario: 'office',
    category: 'beginner',
    focus: 'center 24%',
    intent: 'five-minute beginner routine with tinted moisturizer, brow gel, mascara, cream blush, and balm',
  },
  {
    slug: 'olive-undertone-rose',
    title: 'Olive Undertone Rose',
    tone: 'Balanced rose',
    image: '/images/hero/look-olive-undertone-rose.webp',
    imageAlt: 'Olive undertone rose makeup balanced for green-neutral skin undertones',
    scenario: 'office',
    category: 'feature',
    focus: 'center 24%',
    intent: 'rose makeup balanced for olive undertones, avoiding chalky pink and orange warmth',
  },
  {
    slug: 'hooded-eyes-lift',
    title: 'Hooded Eyes Lift',
    tone: 'Visible lift',
    image: '/images/hero/look-hooded-eyes-lift.webp',
    imageAlt: 'Hooded eyes lift makeup with visible eye structure and clean definition',
    scenario: 'office',
    category: 'feature',
    focus: 'center 24%',
    intent: 'hooded-eye friendly lift with visible crease placement, tight lash definition, and clean cheek color',
  },
  {
    slug: 'mature-skin-radiance',
    title: 'Mature Skin Radiance',
    tone: 'Soft radiance',
    image: '/images/hero/look-mature-skin-radiance.webp',
    imageAlt: 'Mature skin radiance makeup with soft glow and smooth definition',
    scenario: 'office',
    category: 'feature',
    focus: 'center 24%',
    intent: 'radiant mature skin makeup with thin base, soft definition, cream texture, and lifted lip color',
  },
  {
    slug: 'sunburn-satin-glow',
    title: 'Sunburn Satin Glow',
    tone: 'Warm blush lift',
    image: '/images/hero/look-sunburn-satin-glow.webp',
    imageAlt: 'Sunburn satin glow makeup with warm lifted blush and fresh summer skin',
    scenario: 'office',
    category: 'daily',
    focus: 'center 24%',
    intent: 'summer sun-kissed blush across high cheeks and nose bridge, satin skin, soft brows, and sheer warm lips',
  },
  {
    slug: 'watercolor-blush',
    title: 'Watercolor Blush',
    tone: 'Diffused color',
    image: '/images/hero/look-watercolor-blush.webp',
    imageAlt: 'Watercolor blush makeup with diffused pink cheeks and soft skin',
    scenario: 'date',
    category: 'date',
    focus: 'center 24%',
    intent: 'soft watercolor blush veil with transparent skin, blurred edges, airy lashes, and muted rose lips',
  },
  {
    slug: 'jelly-lip-tint',
    title: 'Jelly Lip Tint',
    tone: 'Sheer juicy lip',
    image: '/images/hero/look-jelly-lip-tint.webp',
    imageAlt: 'Jelly lip tint makeup with juicy sheer lips and fresh cheeks',
    scenario: 'date',
    category: 'date',
    focus: 'center 24%',
    intent: 'fresh sheer makeup centered on a glossy jelly lip tint, cream cheek color, and clean eye definition',
  },
  {
    slug: 'reflective-lid-glow',
    title: 'Reflective Lid Glow',
    tone: 'Light-catching eyes',
    image: '/images/hero/look-reflective-lid-glow.webp',
    imageAlt: 'Reflective lid glow makeup with light-catching eyelids and polished skin',
    scenario: 'photo',
    category: 'event',
    focus: 'center 22%',
    intent: 'photo-friendly reflective eyelid sheen with refined lashes, controlled complexion glow, and soft neutral lips',
  },
  {
    slug: 'vacation-bronze',
    title: 'Vacation Bronze',
    tone: 'Sunlit sculpt',
    image: '/images/hero/look-vacation-bronze.webp',
    imageAlt: 'Vacation bronze makeup with sunlit sculpt and warm nude lips',
    scenario: 'photo',
    category: 'event',
    focus: 'center 20%',
    intent: 'vacation bronze makeup with warm sculpt, golden cheek warmth, soft smoky lash line, and bronzed nude lips',
  },
  {
    slug: 'summer-wedding-guest',
    title: 'Summer Wedding Guest',
    tone: 'Heat-safe polish',
    image: '/images/hero/look-summer-wedding-guest.webp',
    imageAlt: 'Summer wedding guest makeup with heat-safe rose polish and defined lashes',
    scenario: 'photo',
    category: 'event',
    focus: 'center 22%',
    intent: 'summer wedding guest makeup with heat-safe satin complexion, rosewood cheek-lip harmony, and photo-stable eyes',
  },
  {
    slug: 'soft-berry-stain',
    title: 'Soft Berry Stain',
    tone: 'Blurred berry',
    image: '/images/hero/look-soft-berry-stain.webp',
    imageAlt: 'Soft berry stain makeup with blurred berry lips and gentle eye definition',
    scenario: 'date',
    category: 'date',
    focus: 'center 24%',
    intent: 'soft berry lip stain with blurred edges, balanced cheek color, and gentle close-up friendly eye definition',
  },
  {
    slug: 'cloud-skin-matte',
    title: 'Cloud Skin Matte',
    tone: 'Soft-focus base',
    image: '/images/hero/look-cloud-skin-matte.webp',
    imageAlt: 'Cloud skin matte makeup with soft-focus complexion and natural lip',
    scenario: 'office',
    category: 'daily',
    focus: 'center 24%',
    intent: 'soft-focus cloud skin complexion, natural matte control, diffused blush, feathered brows, and comfortable nude lips',
  },
  {
    slug: 'korean-dewy-glow',
    title: 'Korean Dewy Glow',
    tone: 'Clear skin glow',
    image: '/images/hero/look-korean-dewy-glow.webp',
    imageAlt: 'Korean dewy glow makeup with clear luminous skin and soft lip tint',
    scenario: 'office',
    category: 'daily',
    focus: 'center 24%',
    intent: 'K-beauty dewy glow with clear luminous base, soft straight brows, subtle aegyo-friendly eye light, and gentle lip tint',
  },
  {
    slug: 'french-natural-chic',
    title: 'French Natural Chic',
    tone: 'Effortless polish',
    image: '/images/hero/look-french-natural-chic.webp',
    imageAlt: 'French natural chic makeup with effortless skin and soft lip color',
    scenario: 'office',
    category: 'daily',
    focus: 'center 24%',
    intent: 'French natural makeup with barely corrected skin, softly defined brows, understated cheeks, and an effortless lip focus',
  },
  {
    slug: 'douyin-soft-focus',
    title: 'Douyin Soft Focus',
    tone: 'Camera sweet',
    image: '/images/hero/look-douyin-soft-focus.webp',
    imageAlt: 'Douyin soft focus makeup with bright eyes, lifted cheeks, and soft camera glow',
    scenario: 'photo',
    category: 'photo',
    focus: 'center 22%',
    intent: 'soft-focus camera makeup with brightened eyes, lifted blush placement, delicate liner, and dimensional but wearable lips',
  },
  {
    slug: 'latina-bronze-glam',
    title: 'Latina Bronze Glam',
    tone: 'Defined warmth',
    image: '/images/hero/look-latina-bronze-glam.webp',
    imageAlt: 'Latina bronze glam makeup with sculpted warmth and defined eyes',
    scenario: 'photo',
    category: 'event',
    focus: 'center 20%',
    intent: 'bronze glam with sculpted warmth, defined eyes, lifted lashes, soft contour, and glossy nude-brown lips',
  },
];

const lookBySlug = new Map(lookCatalogItems.map((look) => [look.slug, look]));

export function getLookBySlug(slug?: string | null) {
  if (!slug) return undefined;
  return lookBySlug.get(slug);
}

export function getLooksBySlugs(slugs: string[]) {
  return slugs.map((slug) => lookBySlug.get(slug)).filter((look): look is LookCatalogItem => Boolean(look));
}

export function buildLookTryOnHref(look: LookCatalogItem) {
  return `/try-on?scenario=${look.scenario}&look=${look.slug}`;
}

export const homeInspirationLooks = getLooksBySlugs([
  'office-glow',
  'passport-photo-clean',
  'interview-ready',
  'creator-camera-glow',
  'soft-matte-everyday',
  'weekend-glow',
  'executive-rose',
  'berry-date',
  'candlelight-mauve',
  'peach-beige-date',
  'radiant-glow',
  'zoom-polish',
  'evening-gala',
  'soft-editorial',
  'asian-refined',
  'olive-undertone-rose',
]);

export const quickTryOnLooks = getLooksBySlugs([
  'clean-girl',
  'office-glow',
  'soft-glam',
  'passport-photo-clean',
  'client-meeting-nude',
  'champagne-gala',
]);

// ──────────────────────────────────────────────────────────────────────────
// Weekly trending — used by Trending This Week (Get Inspired) on the home page.
// `weeklyInspirationGroups` rotates editorial themes — keeps the home page
// feeling fresh week over week so users come back to scan.
// ──────────────────────────────────────────────────────────────────────────

export interface WeeklyInspirationGroup {
  id: string;
  label: string;
  blurb: string;
  lookSlugs: string[];
}

export const weeklyInspirationUpdatedAt = '2026-05-26';

export const weeklyInspirationGroups: WeeklyInspirationGroup[] = [
  {
    id: 'trending',
    label: 'Trending this week',
    blurb: 'The looks the community keeps coming back to right now.',
    lookSlugs: ['clean-girl', 'office-glow', 'soft-glam', 'korean-dewy-glow'],
  },
  {
    id: 'editor-office',
    label: "Editor's pick: Quiet office mornings",
    blurb: 'A polished but invisible edit our team rotates through Monday to Wednesday.',
    lookSlugs: ['interview-ready', 'soft-matte-everyday', 'executive-rose', 'client-meeting-nude'],
  },
  {
    id: 'date-drop',
    label: 'Date night drop',
    blurb: 'Close-up friendly looks that hold up under candlelight and phone flash.',
    lookSlugs: ['berry-date', 'romantic-pink', 'rose-milk-date', 'candlelight-mauve'],
  },
  {
    id: 'camera-safe',
    label: 'Camera-safe edit',
    blurb: 'For Zoom, photos, ID shots, and any time the lens is the audience.',
    lookSlugs: ['photo-ready', 'flash-proof-satin', 'creator-camera-glow', 'passport-photo-clean'],
  },
];

function fallbackTries(): number {
  return 0;
}

export function getWeeklyTries(slug: string, weeklyTriesBySlug: Record<string, number> = {}): number {
  return weeklyTriesBySlug[slug] ?? fallbackTries();
}

export interface WeeklyInspirationCard extends LookCatalogItem {
  weeklyTries: number;
  trendingRank: number; // 0 = no rank badge, 1+ = top N badge
}

export interface ResolvedWeeklyInspirationGroup {
  id: string;
  label: string;
  blurb: string;
  cards: WeeklyInspirationCard[];
}

export function getWeeklyInspirationLookSlugs(): string[] {
  return Array.from(new Set(weeklyInspirationGroups.flatMap((group) => group.lookSlugs)));
}

export function getWeeklyInspirationGroups(weeklyTriesBySlug: Record<string, number> = {}): ResolvedWeeklyInspirationGroup[] {
  // Build a flat list once so we can compute trending rank by tries.
  const allCards: WeeklyInspirationCard[] = weeklyInspirationGroups
    .flatMap((group) => group.lookSlugs)
    .map((slug) => lookBySlug.get(slug))
    .filter((look): look is LookCatalogItem => Boolean(look))
    .map((look) => ({ ...look, weeklyTries: getWeeklyTries(look.slug, weeklyTriesBySlug), trendingRank: 0 }));

  const ranked = [...allCards].filter((card) => card.weeklyTries > 0).sort((a, b) => b.weeklyTries - a.weeklyTries).slice(0, 3);
  ranked.forEach((card, idx) => {
    const target = allCards.find((c) => c.slug === card.slug);
    if (target) target.trendingRank = idx + 1;
  });

  return weeklyInspirationGroups.map((group) => ({
    id: group.id,
    label: group.label,
    blurb: group.blurb,
    cards: group.lookSlugs
      .map((slug) => allCards.find((c) => c.slug === slug))
      .filter((card): card is WeeklyInspirationCard => Boolean(card)),
  }));
}
