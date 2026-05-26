export interface StylePage {
  slug: string;
  title: string;
  description: string;
  eyebrow: string;
  headline: string;
  intro: string;
  image: string;
  tryOnScenario: 'office' | 'date' | 'photo';
  keyTraits: string[];
  steps: string[];
  avoid: string[];
  bestFor: string[];
  productEssentials: string[];
  relatedLinks: Array<{
    label: string;
    href: string;
  }>;
}

export interface HomeStyleItem {
  slug: string;
  label: string;
  image: string;
  imageAlt: string;
  tryOnScenario: 'office' | 'date' | 'photo';
  lookSlug: string;
}

export const stylePages: StylePage[] = [
  {
    slug: 'clean-girl-makeup',
    title: 'Clean Girl Makeup Guide',
    description: 'Master the clean girl aesthetic — dewy skin, brushed brows, glossy lips. AI-guided steps for a natural "no-makeup" makeup look.',
    eyebrow: 'Clean Girl',
    headline: 'The art of looking effortless — with intention.',
    intro: 'Clean girl makeup is about skin that glows from within, brows that frame without dominating, and a glossy lip that says you woke up like this. The trick is precision disguised as ease.',
    image: '/images/hero/style-clean-girl.webp',
    tryOnScenario: 'office',
    keyTraits: ['Dewy, second-skin base', 'Brushed-up feathered brows', 'Minimal eye — just curled lashes', 'Cream blush placed high', 'Clear or nude gloss finish'],
    steps: [
      'Start with moisturized skin and a skin-tint or tinted sunscreen — skip full foundation.',
      'Brush brows upward with a clear gel; fill only sparse gaps with light hair-like strokes.',
      'Curl lashes and apply one coat of brown or clear mascara.',
      'Dab cream blush on the apples and blend upward toward temples.',
      'Finish with a clear or nude-pink lip gloss for the signature wet look.',
    ],
    avoid: ['Heavy powder that kills the dewy finish', 'Visible eyeshadow or liner', 'Matte lips — they break the fresh illusion', 'Over-contoured cheeks'],
    bestFor: ['Everyday errands & coffee runs', 'Work-from-home video calls', 'Weekend brunch', 'Anyone who wants to look polished in under 5 minutes'],
    productEssentials: ['Skin tint or tinted moisturizer', 'Clear brow gel', 'Cream blush stick', 'Lip gloss (clear or nude pink)', 'Brown mascara'],
    relatedLinks: [
      { label: 'Try clean girl look', href: '/try-on?scenario=office&style=clean-girl-makeup' },
      { label: 'Neutral undertone lip shades', href: '/lipstick-shades/neutral-undertone-lipstick-shades' },
      { label: 'Beginner makeup guide', href: '/scenarios/beginner-makeup' },
    ],
  },
  {
    slug: 'soft-glam-makeup',
    title: 'Soft Glam Makeup Guide',
    description: 'Achieve the soft glam look — sculpted yet wearable, with warm bronzed eyes and satin lips. Step-by-step AI guidance.',
    eyebrow: 'Soft Glam',
    headline: 'Glamour that whispers, never shouts.',
    intro: 'Soft glam takes the drama of a full glam look and dials it back to wearable. Think: blended warm tones, sculpted cheeks, defined lashes, and a satin nude lip that ties it all together.',
    image: '/images/hero/style-soft-glam.webp',
    tryOnScenario: 'date',
    keyTraits: ['Flawless medium-coverage base', 'Warm neutral eye with soft crease depth', 'Defined lashes — individual or strip', 'Sculpted cheekbone with soft bronzer', 'Satin nude or mauve lip'],
    steps: [
      'Build a medium-coverage base with concealer only where needed — under-eye and nose wings.',
      'Apply warm taupe in the crease, then deepen the outer V with a soft brown.',
      'Line the upper lash line thinly and apply volumizing mascara or lash strips.',
      'Sculpt cheekbones with a cool-toned bronzer; add a luminous highlight on the high points.',
      'Line lips with a nude-brown pencil, fill with a satin nude-rose lipstick.',
    ],
    avoid: ['Cool-toned or frosty shadows that fight the warmth', 'Heavy black smoky eye — too editorial for soft glam', 'Overly glossy lip that competes with the eye', 'Harsh contour lines left unblended'],
    bestFor: ['Date nights & dinner parties', 'Weddings as a guest', 'Birthday celebrations', 'Any evening where you want to glow without being "done up"'],
    productEssentials: ['Medium-coverage foundation', 'Warm neutral eyeshadow palette', 'Brown or black volumizing mascara', 'Cream bronzer & highlighter', 'Nude-rose satin lipstick'],
    relatedLinks: [
      { label: 'Try soft glam look', href: '/try-on?scenario=date&style=soft-glam-makeup' },
      { label: 'Warm undertone lip shades', href: '/lipstick-shades/warm-undertone-lipstick-shades' },
      { label: 'Evening event guide', href: '/scenarios/evening-event-makeup' },
    ],
  },
  {
    slug: 'no-makeup-makeup',
    title: 'No-Makeup Makeup Guide',
    description: 'The "your skin but better" approach — subtle correction, invisible technique, maximum freshness. AI-powered personalization.',
    eyebrow: 'No-Makeup Makeup',
    headline: 'The most technical look is the one nobody notices.',
    intro: 'No-makeup makeup requires the most skill precisely because the result should be invisible. Every product disappears into skin. The goal is correction without detection.',
    image: '/images/hero/look-no-makeup.webp',
    tryOnScenario: 'office',
    keyTraits: ['Undetectable base — spot-concealed only', 'Skin-matching brow fill', 'Tightlined (invisible) lash line', 'Pinched-cheek flush effect', 'Lip balm or MLBB shade'],
    steps: [
      'Skip foundation. Use a color-correcting concealer only on dark spots, redness, and under-eye shadows.',
      'Set only the T-zone with a translucent powder — leave cheeks dewy.',
      'Tightline the upper waterline with a nude or brown pencil to thicken lash appearance without visible liner.',
      'Use a sheer wash of blush that mimics a natural flush — think one shade deeper than your skin.',
      'Apply a "my lips but better" shade — a lipstick that matches your natural lip color with slight enhancement.',
    ],
    avoid: ['Any visible shimmer or sparkle', 'Defined lip lines', 'Obvious mascara clumps', 'Anything with a visible edge or boundary'],
    bestFor: ['Workplace with conservative dress codes', 'First impressions where trust matters', '"I don\'t wear makeup" people who want subtle polish', 'Hot weather when less is more'],
    productEssentials: ['Color-correcting concealer', 'Translucent setting powder (T-zone only)', 'Nude waterline pencil', 'Sheer cream blush', 'MLBB lipstick or tinted lip balm'],
    relatedLinks: [
      { label: 'Try no-makeup look', href: '/try-on?scenario=office&style=no-makeup-makeup' },
      { label: 'Fair skin lip shades', href: '/lipstick-shades/fair-skin-lipstick-shades' },
      { label: 'Everyday natural guide', href: '/scenarios/everyday-natural-makeup' },
    ],
  },
  {
    slug: 'glass-skin-makeup',
    title: 'Glass Skin Makeup Guide',
    description: 'Achieve the coveted K-beauty glass skin effect — luminous, bouncy, translucent. AI-personalized hydration and glow strategy.',
    eyebrow: 'Glass Skin',
    headline: 'Skin so luminous it looks lit from within.',
    intro: 'Glass skin is not about piling on highlighter. It is about layered hydration, minimal powder, and strategic light-catching placement that makes skin look translucent and bouncy like a water droplet.',
    image: '/images/hero/style-glass-skin.webp',
    tryOnScenario: 'office',
    keyTraits: ['Multi-layer hydration prep', 'Sheer luminous base — barely-there coverage', 'No powder zones on cheeks and nose bridge', 'Liquid or cream highlighter on high points', 'Gradient lip with blurred edges'],
    steps: [
      'Layer hydrating toner, essence, and a dewy primer on damp skin — this is 70% of the result.',
      'Mix a luminous foundation with moisturizer for a sheer, wet-look base.',
      'Apply liquid highlighter on cheekbones, nose bridge, and cupid\'s bow — blend edges until seamless.',
      'Use only cream products for cheek color; powder will kill the glass effect.',
      'Create a gradient lip: concentrate color at the center and blur outward with a finger.',
    ],
    avoid: ['Any matte or powder-finish products on cheeks', 'Heavy coverage that hides skin texture', 'Chunky glitter highlighter', 'Over-setting with powder'],
    bestFor: ['K-beauty enthusiasts', 'Dewy skin lovers in any climate', 'Photo-ready skin for soft lighting', 'Spring and summer fresh-face days'],
    productEssentials: ['Hydrating essence/toner', 'Dewy primer', 'Luminous sheer foundation or cushion', 'Liquid highlighter', 'Cream blush', 'Lip tint for gradient application'],
    relatedLinks: [
      { label: 'Try glass skin look', href: '/try-on?scenario=office&style=glass-skin-makeup' },
      { label: 'Medium skin lip shades', href: '/lipstick-shades/medium-skin-lipstick-shades' },
      { label: 'Photo-ready makeup guide', href: '/scenarios/photo-ready-makeup' },
    ],
  },
  {
    slug: 'romantic-date-makeup',
    title: 'Romantic Date Makeup Guide',
    description: 'A soft, warm makeup look for dates — rosy cheeks, doe eyes, and kissable lips. AI-personalized to your features.',
    eyebrow: 'Romantic Date',
    headline: 'Soft, warm, and unapologetically pretty.',
    intro: 'Date makeup should make you feel confident without looking like you tried too hard. The secret formula: warm rosy tones, doe-eyed lashes, dewy skin, and a lip color that survives a kiss.',
    image: '/images/hero/look-romantic-pink.webp',
    tryOnScenario: 'date',
    keyTraits: ['Dewy luminous base', 'Rosy pink blush draped across cheeks', 'Soft shimmer on inner corners and lids', 'Curled, fanned-out lashes', 'Rose or berry lip with satin finish'],
    steps: [
      'Create a dewy base — use illuminating primer under a light-coverage foundation.',
      'Apply pink or peach shimmer on the inner corners and center of lids for a doe-eyed effect.',
      'Drape rosy blush from apples up toward temples — this creates a youthful flushed look.',
      'Curl lashes dramatically and apply 2 coats of lengthening mascara on upper lashes only.',
      'Choose a rose or soft berry lip with a satin finish — long-wearing formula for obvious reasons.',
    ],
    avoid: ['Harsh contour that creates shadows in dim lighting', 'Dark or smoky eyes that close off the gaze', 'Matte lip that feels dry and doesn\'t survive contact', 'Too much powder that photographs flat'],
    bestFor: ['First dates', 'Anniversary dinners', 'Candle-lit settings', 'Anytime you want to look approachable and radiant'],
    productEssentials: ['Illuminating primer', 'Pink shimmer eyeshadow', 'Rose cream blush', 'Lengthening mascara', 'Long-wear satin rose lipstick'],
    relatedLinks: [
      { label: 'Try romantic date look', href: '/try-on?scenario=date&style=romantic-date-makeup' },
      { label: 'Cool undertone lip shades', href: '/lipstick-shades/cool-undertone-lipstick-shades' },
      { label: 'Date night scenario guide', href: '/scenarios/date-night-makeup' },
    ],
  },
  {
    slug: 'office-polished-makeup',
    title: 'Office Polished Makeup Guide',
    description: 'A refined, professional makeup look for the workplace — structured, understated, and commanding. AI-tailored to your features.',
    eyebrow: 'Office Polished',
    headline: 'Authority in subtlety — structured elegance for the boardroom.',
    intro: 'Office polished goes beyond basic office makeup. It is about intentional structure: defined brows that frame your arguments, skin that reads healthy under fluorescent light, and color choices that command without distracting.',
    image: '/images/hero/look-client-meeting-nude.webp',
    tryOnScenario: 'office',
    keyTraits: ['Perfected skin with controlled shine', 'Architecturally defined brows', 'Taupe or soft brown eye definition', 'Subtle contour for face structure', 'Muted rose or nude-brown lip'],
    steps: [
      'Apply a semi-matte foundation with a damp sponge — build coverage only where needed.',
      'Set the T-zone and under-eye with a fine translucent powder for crease-proof wear.',
      'Define brows with precise, hair-like strokes — this is the most impactful single step.',
      'Apply taupe eyeshadow in the crease and a thin brown line along the upper lashes.',
      'Choose a muted rose or nude-brown lip with a satin-matte finish that lasts through meetings.',
    ],
    avoid: ['Visible shimmer or glitter in professional settings', 'Bold lip colors that become the focal point', 'Heavy bronzer that reads as "weekend" in office light', 'Undone brows that weaken the structured intention'],
    bestFor: ['Client-facing meetings', 'Presentations and speaking', 'Corporate environments', 'Days when you need confidence from your reflection'],
    productEssentials: ['Semi-matte foundation', 'Translucent setting powder', 'Brow pencil (precise tip)', 'Taupe matte eyeshadow', 'Muted rose satin-matte lipstick'],
    relatedLinks: [
      { label: 'Try office polished look', href: '/try-on?scenario=office&style=office-polished-makeup' },
      { label: 'Olive skin lip shades', href: '/lipstick-shades/olive-skin-lipstick-shades' },
      { label: 'Interview makeup guide', href: '/scenarios/interview-makeup' },
    ],
  },
];

const stylePageBySlug = new Map(stylePages.map((page) => [page.slug, page]));

function getStylePagesBySlugs(slugs: string[]) {
  return slugs
    .map((slug) => stylePageBySlug.get(slug))
    .filter((page): page is StylePage => Boolean(page));
}

export const homeStylePages = getStylePagesBySlugs([
  'clean-girl-makeup',
  'soft-glam-makeup',
  'glass-skin-makeup',
  'no-makeup-makeup',
  'office-polished-makeup',
  'romantic-date-makeup',
]);

export const homeStyleItems: HomeStyleItem[] = [
  {
    slug: 'clean-girl-makeup',
    label: 'Clean Girl',
    image: '/images/hero/style-clean-girl.webp',
    imageAlt: 'Clean girl makeup style with glossy skin and brushed brows',
    tryOnScenario: 'office',
    lookSlug: 'clean-girl',
  },
  {
    slug: 'soft-glam-makeup',
    label: 'Soft Glam',
    image: '/images/hero/style-soft-glam.webp',
    imageAlt: 'Soft glam makeup style with warm eyes and satin nude lip',
    tryOnScenario: 'date',
    lookSlug: 'soft-glam',
  },
  {
    slug: 'glass-skin-makeup',
    label: 'Glass Skin',
    image: '/images/hero/style-glass-skin.webp',
    imageAlt: 'Glass skin makeup style with luminous dewy complexion',
    tryOnScenario: 'office',
    lookSlug: 'glass-skin',
  },
  {
    slug: 'no-makeup-makeup',
    label: 'No-Makeup',
    image: '/images/hero/look-no-makeup.webp',
    imageAlt: 'No-makeup makeup style with invisible polish',
    tryOnScenario: 'office',
    lookSlug: 'no-makeup',
  },
  {
    slug: 'office-polished-makeup',
    label: 'Office Polish',
    image: '/images/hero/look-client-meeting-nude.webp',
    imageAlt: 'Office polished makeup style with quiet authority',
    tryOnScenario: 'office',
    lookSlug: 'client-meeting-nude',
  },
  {
    slug: 'romantic-date-makeup',
    label: 'Romantic Date',
    image: '/images/hero/look-romantic-pink.webp',
    imageAlt: 'Romantic date makeup style with warm flushed cheeks',
    tryOnScenario: 'date',
    lookSlug: 'romantic-pink',
  },
  {
    slug: 'latte-makeup',
    label: 'Latte Makeup',
    image: '/images/hero/look-warm-nude-daily.webp',
    imageAlt: 'Latte makeup style with warm nude tones',
    tryOnScenario: 'office',
    lookSlug: 'warm-nude-daily',
  },
  {
    slug: 'peach-glow-makeup',
    label: 'Peach Glow',
    image: '/images/hero/look-peach-morning-glow.webp',
    imageAlt: 'Peach glow makeup style with fresh peach cheeks',
    tryOnScenario: 'office',
    lookSlug: 'peach-morning-glow',
  },
  {
    slug: 'rose-milk-makeup',
    label: 'Rose Milk',
    image: '/images/hero/look-rose-milk-date.webp',
    imageAlt: 'Rose milk makeup style with soft milky rose tones',
    tryOnScenario: 'date',
    lookSlug: 'rose-milk-date',
  },
  {
    slug: 'quiet-luxury-makeup',
    label: 'Quiet Luxury',
    image: '/images/hero/look-refined.png',
    imageAlt: 'Quiet luxury makeup style with taupe eyes and satin nude lip',
    tryOnScenario: 'office',
    lookSlug: 'quiet-taupe',
  },
  {
    slug: 'camera-ready-makeup',
    label: 'Camera Ready',
    image: '/images/hero/look-photogenic.png',
    imageAlt: 'Camera ready makeup style with balanced photo definition',
    tryOnScenario: 'photo',
    lookSlug: 'photo-ready',
  },
  {
    slug: 'flash-proof-makeup',
    label: 'Flash-Proof',
    image: '/images/hero/look-flash-proof-satin.webp',
    imageAlt: 'Flash-proof makeup style with satin camera-safe finish',
    tryOnScenario: 'photo',
    lookSlug: 'flash-proof-satin',
  },
  {
    slug: 'wedding-guest-makeup',
    label: 'Wedding Guest',
    image: '/images/hero/look-wedding-guest.webp',
    imageAlt: 'Wedding guest makeup style with rosewood polish',
    tryOnScenario: 'photo',
    lookSlug: 'wedding-guest',
  },
  {
    slug: 'champagne-glow-makeup',
    label: 'Champagne Glow',
    image: '/images/hero/look-champagne-gala.webp',
    imageAlt: 'Champagne glow makeup style with soft event shimmer',
    tryOnScenario: 'photo',
    lookSlug: 'champagne-gala',
  },
  {
    slug: 'bronze-glam-makeup',
    label: 'Bronze Glam',
    image: '/images/hero/look-bronze-evening.webp',
    imageAlt: 'Bronze glam makeup style with warm sculpted depth',
    tryOnScenario: 'photo',
    lookSlug: 'bronze-evening',
  },
  {
    slug: 'burgundy-velvet-makeup',
    label: 'Burgundy Velvet',
    image: '/images/hero/look-burgundy-velvet.webp',
    imageAlt: 'Burgundy velvet makeup style with deep event color',
    tryOnScenario: 'photo',
    lookSlug: 'burgundy-velvet',
  },
  {
    slug: 'mature-radiance-makeup',
    label: 'Mature Radiance',
    image: '/images/hero/look-mature-skin-radiance.webp',
    imageAlt: 'Mature radiance makeup style with soft lifted glow',
    tryOnScenario: 'office',
    lookSlug: 'mature-skin-radiance',
  },
  {
    slug: 'hooded-eye-lift-makeup',
    label: 'Hooded Eye Lift',
    image: '/images/hero/look-hooded-eyes-lift.webp',
    imageAlt: 'Hooded eye lift makeup style with visible eye structure',
    tryOnScenario: 'office',
    lookSlug: 'hooded-eyes-lift',
  },
];
