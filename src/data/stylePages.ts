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
  longIntro?: string[];
  techniqueSections?: Array<{
    heading: string;
    body: string;
  }>;
  productGrades?: Array<{
    grade: string;
    item: string;
    why: string;
  }>;
  personalizationTips?: Array<{
    label: string;
    detail: string;
  }>;
  faqs?: Array<{
    question: string;
    answer: string;
  }>;
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
  focus?: string;
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
  {
    slug: 'monolid-makeup',
    title: 'Monolid Makeup Guide',
    description: 'A practical monolid makeup guide for visible eye shape, open-eye placement, lash-root definition, and soft lift without forcing a fake crease.',
    eyebrow: 'Monolid Makeup',
    headline: 'Build visible eye shape where open eyes can actually see it.',
    intro: 'Monolid makeup works best when it respects the eye structure instead of trying to copy crease-based tutorials. The goal is lift, brightness, and definition that remain visible when the eyes are open.',
    image: '/images/hero/look-monolid-makeup.webp',
    tryOnScenario: 'office',
    keyTraits: [
      'Eyes-open shadow mapping instead of closed-eye crease placement',
      'Soft gradient from lash root upward',
      'Thin liner or tight lash-root color that does not eat lid space',
      'Outer-corner lift with small, controlled depth',
      'Curl-focused lashes with extra attention to the center and outer third',
      'Balanced blush and lip so the eye is defined but not isolated',
    ],
    steps: [
      'Start with eye primer or a thin layer of concealer only where product transfers; keep the lid flexible, not heavy.',
      'Look straight into the mirror and mark the visible zone above the lash line before applying shadow.',
      'Press a soft taupe, beige-brown, or muted rose shade close to the lash root, then fade it upward in a vertical gradient.',
      'Add a slightly deeper brown only to the outer third, keeping the shape small and lifted rather than wide and smoky.',
      'Tightline or apply a very thin liner along the upper lashes; if the line becomes visible and thick, it will make the lid look smaller.',
      'Curl lashes in two stages, first at the base and then lightly through the middle, so the eye opens without relying on heavy liner.',
      'Place shimmer only at the inner corner or center of the mobile lid; avoid spreading reflective texture above the fold if it transfers.',
      'Keep brows softly lifted and not too blocky, because heavy brows can visually close the space between brow and eye.',
      'Finish with cheek and lip color in the same family so the face feels intentional, not just eye-focused.',
    ],
    avoid: [
      'Copying a deep cut crease that disappears when eyes open',
      'Thick black liner across the full lid',
      'Large glitter areas that transfer above the eye',
      'Over-darkening the lower lash line',
      'False lashes with a heavy band that points downward',
    ],
    bestFor: [
      'Monolid eye shapes',
      'Asian soft-definition makeup',
      'People whose eyeshadow disappears when they look straight ahead',
      'Everyday eye makeup that still shows in photos',
      'Beginners who want shape without a dramatic crease',
    ],
    productEssentials: [
      'Lightweight eye primer',
      'Matte taupe or beige-brown shadow',
      'Small detail brush',
      'Brown gel liner or tightline pencil',
      'Lash curler that fits the eye curve',
      'Lightweight lengthening mascara',
      'Soft rose or muted berry lip',
    ],
    longIntro: [
      'Most monolid makeup problems come from using a tutorial designed for a deep crease. When a tutorial says to place color in the crease, that instruction assumes the crease stays visible while the eye is open. On a monolid, that same color may hide, transfer, or turn into an unclear shadow. A better approach is to map the look with the eyes open first. The visible space becomes the guide, and the makeup supports the natural eye shape instead of fighting it.',
      'The most reliable monolid eye makeup is built as a gradient. The lash root gets the most definition, the middle lid gets a controlled wash of color, and the upper edge is blended until there is no hard stripe. This keeps the eye defined from conversational distance while avoiding the heavy black band that can make the lid look smaller. The gradient can be soft brown for work, rose taupe for dates, or deeper espresso for photos, but the structure stays the same.',
      'Liner is often the step that makes or breaks monolid makeup. A thick wing can look graphic in a close-up mirror, then disappear or point downward when the eyes relax. For most daily looks, tightlining or pressing liner directly into the lash root gives more payoff with less visual weight. If you want a wing, build a small outer lift while looking straight ahead, then connect only the outer third. The shape should lift the eye without covering the lid.',
      'Shimmer can be beautiful on monolids when it is placed with restraint. A small reflective point on the inner corner or center lid can make the eye look bright and dimensional. A large shimmer block, especially above the fold, can transfer quickly and make the eye look puffy under flash or office light. Texture matters too: fine satin is easier than chunky sparkle. If your lids are oily, use shimmer as an accent rather than the base of the look.',
      'Lashes do more work on monolid eyes than many people expect. A good curl can reveal eye shape before any shadow is added. The most flattering curl usually comes from a tool that fits the eye curve and from using mascara that holds lift without clumping. Heavy false lashes with a thick band can cast a shadow and push the eye downward. If you use lashes, choose short clusters on the outer third or a clear-band style that does not hide the lash root.',
      'The rest of the face should support the eye shape. When blush is too low or lips are too pale, the eye makeup can look disconnected. A soft rose, muted peach, berry stain, or brown-pink lip gives the face a color story and makes eye definition feel deliberate. AI try-on is useful here because monolid makeup changes dramatically with eye angle, brow distance, lid oil, and face contrast; testing the balance on your own face is safer than copying one reference image.',
    ],
    techniqueSections: [
      {
        heading: 'Map with eyes open first',
        body: 'Look straight ahead and decide where the shadow should still be visible. Apply the transition shade slightly higher than instinct suggests, but keep the color soft enough that it reads as structure rather than a fake crease.',
      },
      {
        heading: 'Use a vertical gradient',
        body: 'Keep the deepest color near the lash root, soften the middle, and fade the top edge. This creates depth without requiring a visible crease and photographs more naturally than a hard horizontal stripe.',
      },
      {
        heading: 'Keep liner thin and strategic',
        body: 'Tightline or press liner between lashes for daily makeup. For a lifted effect, add depth only to the outer third while looking straight ahead so the line does not collapse when the eye opens.',
      },
      {
        heading: 'Choose lash lift over lash weight',
        body: 'Curling, waterproof or tubing mascara, and lightweight outer-corner clusters usually flatter monolids more than dense strip lashes. The goal is upward movement, not a heavy shadow over the eye.',
      },
      {
        heading: 'Place shimmer where it will not transfer',
        body: 'Use fine shimmer on the inner corner or center lid. Avoid creamy glitter above the fold unless you have tested it for transfer, because one blink can move the shine into an unplanned area.',
      },
      {
        heading: 'Balance the lower face',
        body: 'Pair the eye with blush and lip color that have similar undertone. This prevents the eye from looking like a separate technique exercise and makes the overall makeup feel wearable.',
      },
    ],
    productGrades: [
      {
        grade: 'Must-have',
        item: 'Small matte shadow palette',
        why: 'A compact palette with beige, taupe, soft brown, and espresso lets you create gradients without relying on heavy shimmer or a cut crease.',
      },
      {
        grade: 'Must-have',
        item: 'Lash curler that fits your eye curve',
        why: 'The right curler opens the eye before liner is applied. A poor fit can pinch, miss corner lashes, or create an uneven curl.',
      },
      {
        grade: 'Worth upgrading',
        item: 'Smudge-resistant brown liner',
        why: 'A good liner should press into the lash root and stay there. Brown is often softer than black for daytime monolid definition.',
      },
      {
        grade: 'Nice-to-have',
        item: 'Individual outer-corner lash clusters',
        why: 'Short clusters can add lift without hiding the whole lid. They are easier to customize than a heavy strip lash.',
      },
      {
        grade: 'Skip for beginners',
        item: 'Chunky glitter cream',
        why: 'It can transfer above the eye quickly and make placement harder to control. Start with satin or fine shimmer first.',
      },
      {
        grade: 'Use carefully',
        item: 'Very black liquid liner',
        why: 'It can look polished in editorial makeup but easily becomes too thick for everyday monolid looks if the line is not extremely precise.',
      },
    ],
    personalizationTips: [
      {
        label: 'If your eyes look smaller after liner',
        detail: 'Move from visible liner to tightlining and concentrate depth on the outer third. Curl lashes again before deciding that you need more shadow.',
      },
      {
        label: 'If shadow disappears',
        detail: 'Blend the transition shade a little higher while looking straight ahead, then keep the edge diffused so it does not look like a stripe.',
      },
      {
        label: 'If makeup transfers',
        detail: 'Use less cream product on the lid, set only the transfer zone, and keep shimmer below the area where the lid folds during blinking.',
      },
      {
        label: 'If your face looks unbalanced',
        detail: 'Add a lip and cheek shade with enough depth. Monolid eye definition often looks better when the lower face carries soft color too.',
      },
      {
        label: 'If you wear glasses',
        detail: 'Increase lash-root definition and brow shape slightly, but avoid thick liner because frames already add visual weight around the eyes.',
      },
    ],
    faqs: [
      {
        question: 'What eyeshadow style is best for monolids?',
        answer: 'A soft vertical gradient usually works best: deepest near the lash root, lighter upward, and mapped with eyes open so the shape stays visible.',
      },
      {
        question: 'Should monolid makeup use eyeliner?',
        answer: 'Yes, but thinner is usually better. Tightlining or outer-third liner gives definition without covering the visible lid space.',
      },
      {
        question: 'How do I stop monolid eyeshadow from transferring?',
        answer: 'Use lightweight primer, avoid thick cream layers above the fold, and place shimmer where it will not rub when you blink.',
      },
      {
        question: 'Can monolid makeup look natural?',
        answer: 'Absolutely. Taupe shadow, curled lashes, soft brown liner, and coordinated lip-cheek color create natural definition without forcing a crease.',
      },
    ],
    relatedLinks: [
      { label: 'Try monolid makeup on your face', href: '/try-on?scenario=office&style=monolid-makeup' },
      { label: 'Hooded eyes makeup guide', href: '/scenarios/hooded-eyes-makeup' },
      { label: 'Asian soft definition style', href: '/try-on?scenario=office&style=asian-soft-definition-makeup&look=asian-refined' },
    ],
  },
  {
    slug: 'olive-skin-makeup',
    title: 'Olive Skin Makeup Guide',
    description: 'A detailed olive skin makeup guide for muted undertones, base matching, blush, bronzer, lipstick, and product choices that avoid grey or orange results.',
    eyebrow: 'Olive Skin Makeup',
    headline: 'Work with the green-gold undertone instead of covering it.',
    intro: 'Olive skin can look golden, green, grey, or neutral depending on light, which is why simple warm-versus-cool makeup advice often fails. The best olive skin makeup uses muted color, flexible base matching, and carefully chosen lip and cheek depth.',
    image: '/images/hero/look-olive-undertone-rose.webp',
    tryOnScenario: 'office',
    keyTraits: [
      'Muted rose, mauve-brown, berry, terracotta, and soft plum instead of neon color',
      'Base shades checked against the lower face and neck, not only the wrist',
      'Bronzer that adds dimension without turning orange',
      'Blush with enough depth to show but not so much white base that it turns chalky',
      'Lip colors that respect grey-green undertone',
      'Satin skin finish that keeps olive depth alive',
    ],
    steps: [
      'Identify whether your olive skin reads light, medium, tan, or deep first; depth changes the best blush and lip choices.',
      'Test base along the jaw and lower cheek in daylight, then check whether it turns orange, pink, or grey after a few minutes.',
      'Use thin base coverage and correct only redness or discoloration so the natural olive tone does not get masked.',
      'Choose blush from muted rose, dusty peach, mauve, terracotta rose, or berry-brown families depending on depth.',
      'Use bronzer carefully; if it turns orange, switch to a neutral sculpt or muted golden-brown shade.',
      'Pick lipstick with brown, rose, berry, or plum depth rather than milky pink or pale beige.',
      'Keep highlighter champagne, soft gold, or neutral pearl; avoid icy white if it makes the skin look grey.',
      'Check the final look in a phone photo because olive undertones often shift more on camera than in the mirror.',
    ],
    avoid: [
      'Milky pink blush with too much white base',
      'Orange bronzer used as a universal warmth fix',
      'Foundation chosen only from a warm or cool label',
      'Pale beige lipstick that makes the mouth disappear',
      'Grey contour that makes olive skin look tired',
    ],
    bestFor: [
      'Light olive skin that looks grey in many foundations',
      'Medium olive skin that turns orange with warm base products',
      'Tan olive skin that needs depth but not neon warmth',
      'People who look better in muted lipstick than bright lipstick',
      'Anyone whose makeup looks different in daylight and indoor light',
    ],
    productEssentials: [
      'Flexible olive-friendly foundation or skin tint',
      'Neutral corrector for redness or darkness',
      'Muted rose or terracotta cream blush',
      'Neutral brown sculpt shade',
      'Mauve-brown, rosewood, or berry lipstick',
      'Champagne or soft gold highlighter',
    ],
    longIntro: [
      'Olive skin is not simply warm skin. It often has a green, grey-gold, or muted cast that changes how color appears on the face. A lipstick that looks balanced in the tube can turn orange. A foundation labeled warm can become peach. A cool pink blush can look chalky or separate. This is why olive skin makeup needs a different system: start with muted color, test in real light, and judge whether the face looks clearer rather than just warmer.',
      'Base matching is the first challenge. Many olive undertones sit between standard foundation categories, so one shade may be too peach while the next looks too flat. Instead of covering the whole face with an imperfect match, use the thinnest base that evens the center of the face and blend outward. If the neck and chest are more olive than the face, the foundation should connect those areas rather than making the face look pink or orange in isolation.',
      'Blush is the fastest way to make olive skin look alive, but the wrong blush can make the undertone look muddy. Light olive skin often does well with muted rose, soft mauve, or gentle peach rose. Medium olive skin can carry rosewood, terracotta rose, and berry-brown. Tan and deep olive skin may need richer berry, plum, brick rose, or cocoa rose. The common thread is controlled saturation. Muted does not mean dull; it means the color has enough depth and softness to belong to the skin.',
      'Bronzer requires restraint on olive skin. Many bronzers are built with orange warmth, which can make olive undertones look artificial. If bronzer keeps turning orange, use a neutral golden-brown or soft sculpt shade instead. Apply it where the face naturally needs dimension rather than across every perimeter area. Olive skin often looks more expensive when warmth is selective and the cheek color provides life.',
      'Lipstick is where olive undertones become especially obvious. Milky pink can sit on top of the face, pale beige can erase the mouth, and bright coral can turn separate from the skin. Safer families include muted rose, mauve-brown, soft plum, rosewood, berry-brown, brick rose, and cocoa nude. The best shade depends on skin depth, natural lip color, and contrast level. When in doubt, choose one step deeper and more muted than the shade you first wanted to try.',
      'Olive skin makeup also benefits from a controlled finish. Too matte can make the face look flat or grey; too shiny can exaggerate uneven tone. Satin skin, cream blush, and a narrow highlight usually work better than a full powder finish. AI try-on is useful for olive skin because undertone shifts are personal: two people can both be olive and still need different lip depth, blush temperature, and bronzer intensity.',
    ],
    techniqueSections: [
      {
        heading: 'Check base against the lower face',
        body: 'Olive undertone often appears strongest around the jaw, neck, and lower cheek. Test foundation there and wait a few minutes before judging whether it turns peach, pink, orange, or grey.',
      },
      {
        heading: 'Use muted color as the default',
        body: 'Muted rose, mauve, terracotta rose, berry-brown, and plum usually integrate better than high-white pink or neon coral. The goal is clarity, not maximum brightness.',
      },
      {
        heading: 'Treat bronzer and contour separately',
        body: 'If orange bronzer makes the face look artificial, switch to neutral sculpt for shape and use blush or lipstick for warmth. Olive skin does not always need more orange.',
      },
      {
        heading: 'Avoid chalky contrast',
        body: 'Products with too much white base can look dusty on olive skin. Choose blush and lipstick with enough depth to be visible without sitting on top of the face.',
      },
      {
        heading: 'Use lip color to anchor the look',
        body: 'A rosewood, mauve-brown, berry, or cocoa rose lip can make olive skin look clearer immediately. If the mouth disappears, the whole face can look tired.',
      },
      {
        heading: 'Check daylight and camera light',
        body: 'Olive undertones shift under different light. A makeup look should be checked in daylight and in a phone photo before you decide that the product is wrong.',
      },
    ],
    productGrades: [
      {
        grade: 'Must-have',
        item: 'Olive-friendly skin tint or flexible foundation',
        why: 'A thin, flexible base is easier to blend into olive undertones than a heavy full-coverage formula in the wrong temperature.',
      },
      {
        grade: 'Must-have',
        item: 'Muted rose or terracotta cream blush',
        why: 'These shades add life without the chalkiness of milky pink or the separation of bright coral.',
      },
      {
        grade: 'Worth upgrading',
        item: 'Neutral sculpt shade',
        why: 'A neutral sculpt can replace orange bronzer when you need shape more than warmth.',
      },
      {
        grade: 'Must-have',
        item: 'Mauve-brown or rosewood lipstick',
        why: 'This lip family is one of the safest everyday anchors for olive skin because it adds depth without turning orange.',
      },
      {
        grade: 'Nice-to-have',
        item: 'Champagne highlighter',
        why: 'Soft champagne or neutral gold catches light without creating the grey cast that icy highlight can cause.',
      },
      {
        grade: 'Skip for many olive tones',
        item: 'Milky pastel blush',
        why: 'A high-white base can look chalky or separate, especially on medium, tan, or muted olive skin.',
      },
    ],
    personalizationTips: [
      {
        label: 'If foundation turns orange',
        detail: 'Move away from warm peach bases and test neutral, golden-neutral, or olive-labeled shades in thinner layers.',
      },
      {
        label: 'If blush looks dusty',
        detail: 'Choose a shade with more depth and less white base. Rosewood, terracotta rose, or berry-brown may look fresher than pastel pink.',
      },
      {
        label: 'If bronzer looks fake',
        detail: 'Use less bronzer and add shape with a neutral sculpt shade. Put warmth back through blush and lip instead.',
      },
      {
        label: 'If lipstick makes skin look green',
        detail: 'Lower the brightness and try muted rose, mauve-brown, soft plum, or berry with a brown base.',
      },
      {
        label: 'If the whole look feels flat',
        detail: 'Keep the base satin, add cheek color higher on the face, and choose a lip one step deeper than your bare lip.',
      },
    ],
    faqs: [
      {
        question: 'What makeup colors look best on olive skin?',
        answer: 'Muted rose, mauve-brown, terracotta rose, rosewood, berry-brown, soft plum, neutral brown, champagne, and soft gold are usually safer than milky pink or orange-heavy shades.',
      },
      {
        question: 'Why does foundation turn orange on olive skin?',
        answer: 'Many warm foundations are peach or yellow-orange rather than olive. When applied to green-grey undertones, they can oxidize or look visibly separate.',
      },
      {
        question: 'Can olive skin wear pink blush?',
        answer: 'Yes, but muted rose or dusty pink often works better than milky pastel pink. Medium and deeper olive skin usually needs more depth.',
      },
      {
        question: 'What lipstick should olive skin avoid?',
        answer: 'Very pale beige, milky pink, and bright orange-coral are common trouble shades because they can make olive skin look grey, green, or disconnected.',
      },
    ],
    relatedLinks: [
      { label: 'Try olive skin makeup', href: '/try-on?scenario=office&style=olive-skin-makeup' },
      { label: 'Olive skin lipstick shades', href: '/lipstick-shades/olive-skin-lipstick-shades' },
      { label: 'Office makeup guide', href: '/scenarios/office-makeup' },
    ],
  },
  {
    slug: 'deep-skin-makeup',
    title: 'Deep Skin Makeup Guide',
    description: 'A deep skin makeup guide for rich complexion work, visible blush, non-ashy nude lips, camera-safe highlight, and product choices with enough depth.',
    eyebrow: 'Deep Skin Makeup',
    headline: 'Choose depth, clarity, and glow that never turns ashy.',
    intro: 'Deep skin makeup is not about simply choosing darker products. The best result comes from undertone-aware base work, blush with enough pigment, lips with visible depth, and highlight that adds dimension without a grey cast.',
    image: '/images/hero/hero-inclusive-glow.webp',
    tryOnScenario: 'photo',
    keyTraits: [
      'Base tones that match undertone and depth instead of looking red, grey, or orange',
      'Pigmented blush placed high enough to lift the face',
      'Bronzer and sculpt shades that show on the skin without turning muddy',
      'Lipstick with brown, red, berry, plum, or cocoa depth',
      'Golden, bronze, copper, or neutral highlight instead of icy reflect',
      'Camera checks to make sure color remains visible under exposure',
    ],
    steps: [
      'Start with a base shade that matches the center of the face and still connects to the neck, chest, and perimeter.',
      'Correct darkness, hyperpigmentation, or uneven areas with thin targeted layers before applying foundation everywhere.',
      'Use foundation in flexible layers and keep natural dimension at the perimeter instead of flattening the entire face.',
      'Choose blush with visible pigment: berry, brick rose, deep coral, plum, terracotta, or rich rose depending on undertone.',
      'Apply blush higher and blend outward so the color lifts the face rather than sitting low on the cheek.',
      'Use bronzer or sculpt only if the shade actually shows; if it turns grey, red, or muddy, switch undertone rather than adding more.',
      'Pick lipstick that holds the mouth: cocoa rose, brown-red, deep berry, plum, brick, espresso nude, or rich rosewood.',
      'Use a lip liner close to your natural lip edge when wearing nude shades so the lip does not vanish in photos.',
      'Finish with controlled bronze, gold, or copper highlight on high points and avoid pale shimmer across textured areas.',
    ],
    avoid: [
      'Ashy nude lipstick without liner or depth',
      'Blush that is too pale to show after blending',
      'Grey contour that dulls the complexion',
      'Icy highlight that leaves a white cast',
      'Full-coverage base that removes natural dimension',
    ],
    bestFor: [
      'Deep and rich skin tones',
      'People who struggle with ashy nude products',
      'Camera-ready makeup for photos and events',
      'Warm, neutral, cool, or olive-deep undertones',
      'Anyone whose blush or bronzer disappears after blending',
    ],
    productEssentials: [
      'Undertone-aware foundation or skin tint',
      'Targeted corrector',
      'Pigmented berry, brick, plum, or terracotta blush',
      'Deep brown lip liner',
      'Cocoa nude, brown-red, or berry lipstick',
      'Bronze, gold, or copper highlighter',
    ],
    longIntro: [
      'Deep skin carries color beautifully, but it also exposes weak product depth quickly. A blush that looks vibrant in the pan may disappear after blending. A nude lipstick may look beige on lighter skin but grey on deep skin. A highlighter may look champagne in packaging but leave a pale stripe on the face. The key is not simply choosing the darkest version of a product; it is choosing enough pigment, enough warmth or coolness, and enough undertone clarity for the complexion.',
      'Base matching for deep skin often requires thinking about more than one area of the face. The center may be slightly lighter, the perimeter may be richer, and the chest may carry a different undertone than the jaw. A single heavy foundation layer can flatten that natural dimension. A better approach is to match the overall impression, correct uneven areas in thin layers, and preserve the depth that already gives the face shape. If the base looks grey, the shade may be too muted or too light. If it looks red or orange, the undertone may be wrong even if the depth is close.',
      'Corrector placement matters. Hyperpigmentation around the mouth, under-eye darkness, or uneven patches should be corrected only where needed. Using too much bright concealer can create a halo effect, while using no correction may make foundation look uneven. Peach, orange, red-brown, or neutral correctors can work depending on depth and discoloration. The corrector should disappear under base, not become a visible layer of warmth.',
      'Blush is one of the most powerful products for deep skin, but the shade must have enough presence. Rich berry, brick rose, burnt coral, terracotta, plum, raisin, and deep rose can all be beautiful. Placement is just as important as color: high blended blush lifts the face and connects to eye makeup, while low blush can make the face look tired. Cream blush can look fresh, powder blush can last longer, and layering the two can be ideal for long events.',
      'Bronzer and contour are not interchangeable. Bronzer should warm the face, while sculpt should shape the face. On deep skin, many sculpt shades are too grey and many bronzers are too red or too orange. If the product does not show, do not keep adding layers. Choose a richer undertone or skip the category entirely and let blush, lip, and highlight create dimension. The best deep skin makeup often looks intentional because each product has a clear job.',
      'Nude lipstick needs special attention. A flattering nude for deep skin is rarely pale beige alone. It usually needs brown, rose, cocoa, red, plum, or caramel depth, plus a liner that respects the natural lip edge. This is why cocoa rose, espresso nude, brown-red, deep berry, and plum-brown often look more polished than a light nude copied from another skin tone. If the lip turns grey, add warmth or depth. If it disappears, add liner or choose a richer shade.',
      'Highlight should look like light on the skin, not powder sitting on top. Bronze, gold, copper, rose-gold, and neutral champagne can all work, but the reflect should not be too pale. Use a small amount on cheekbones, bridge, inner corners, and cupid bow if desired. Avoid a wide stripe across texture or pores because strong contrast can make highlight look separate from the skin. A satin base with precise glow usually photographs better than all-over shimmer.',
      'AI try-on is especially helpful for deep skin because camera exposure can wash out color and change contrast. A look that appears bold in the mirror may look soft on camera, while a lip that seems dark in a close-up may look perfectly balanced from a few feet away. Testing blush, lip, highlight, and base together on your own face helps avoid the common mistake of judging one product in isolation.',
    ],
    techniqueSections: [
      {
        heading: 'Match depth and undertone separately',
        body: 'A foundation can be deep enough but still too red, orange, or grey. Test depth first, then adjust undertone so the base connects to the neck and chest.',
      },
      {
        heading: 'Correct only the uneven zones',
        body: 'Target discoloration around the mouth, under eyes, or hyperpigmented areas with thin corrector. This keeps the final base smooth without becoming mask-like.',
      },
      {
        heading: 'Choose blush that survives blending',
        body: 'If blush disappears after two minutes, the shade is too pale or too sheer. Deep berry, brick rose, plum, and terracotta usually hold better.',
      },
      {
        heading: 'Anchor nude lips with liner',
        body: 'A lip liner close to your natural lip edge keeps nude lipstick from looking chalky or unfinished. Blend liner inward before adding the lip shade.',
      },
      {
        heading: 'Use highlight in a richer reflect',
        body: 'Bronze, gold, copper, or neutral champagne usually looks more integrated than icy white. Keep the placement narrow for a polished glow.',
      },
      {
        heading: 'Check color in photos',
        body: 'Deep skin can lose blush and lip contrast under camera exposure. Take a phone photo before an event and deepen color if the face looks flat.',
      },
    ],
    productGrades: [
      {
        grade: 'Must-have',
        item: 'Undertone-aware base',
        why: 'The right undertone prevents the complexion from looking red, orange, or grey, especially around the center of the face.',
      },
      {
        grade: 'Must-have',
        item: 'Pigmented blush',
        why: 'Deep skin often needs blush with enough depth to remain visible after blending and in photos.',
      },
      {
        grade: 'Must-have',
        item: 'Deep brown lip liner',
        why: 'A liner makes nude, rose, berry, and brown lip shades look intentional instead of chalky.',
      },
      {
        grade: 'Worth upgrading',
        item: 'Cream-to-powder or layered blush system',
        why: 'Cream gives freshness and powder gives longevity, which is useful for long events and camera makeup.',
      },
      {
        grade: 'Nice-to-have',
        item: 'Bronze or copper highlighter',
        why: 'A richer reflective tone adds glow without the pale cast of icy highlighters.',
      },
      {
        grade: 'Skip',
        item: 'Pale beige nude lipstick alone',
        why: 'Without liner or depth, it often turns ashy and makes the mouth disappear.',
      },
    ],
    personalizationTips: [
      {
        label: 'If base looks grey',
        detail: 'The shade may be too light or too muted. Try a richer depth or a warmer-neutral undertone in thinner layers.',
      },
      {
        label: 'If blush disappears',
        detail: 'Choose more pigment, layer cream under powder, or move into berry, brick, plum, or terracotta families.',
      },
      {
        label: 'If nude lipstick looks ashy',
        detail: 'Use a deep brown liner, choose a nude with cocoa or rose depth, and avoid pale beige formulas without contrast.',
      },
      {
        label: 'If contour looks muddy',
        detail: 'Stop adding layers and switch undertone. You may need a richer neutral-brown sculpt rather than a grey contour.',
      },
      {
        label: 'If photos look flat',
        detail: 'Increase lip depth, blush visibility, and brow or lash definition before adding more foundation.',
      },
    ],
    faqs: [
      {
        question: 'What makeup colors look best on deep skin?',
        answer: 'Rich berry, plum, brick rose, terracotta, cocoa, brown-red, bronze, copper, gold, and rosewood shades usually hold depth well on deep skin.',
      },
      {
        question: 'How do I stop nude lipstick from looking ashy on deep skin?',
        answer: 'Use a deep brown liner and choose nude shades with cocoa, rose, red-brown, plum, or caramel depth rather than pale beige alone.',
      },
      {
        question: 'What blush works on deep skin?',
        answer: 'Pigmented berry, brick, plum, deep coral, raisin, terracotta, and rich rose blushes usually show better than pale pastel shades.',
      },
      {
        question: 'Should deep skin use highlighter?',
        answer: 'Yes. Choose bronze, gold, copper, rose-gold, or neutral champagne reflects and keep placement precise to avoid a pale cast.',
      },
    ],
    relatedLinks: [
      { label: 'Try deep skin makeup', href: '/try-on?scenario=photo&style=deep-skin-makeup' },
      { label: 'Deep skin lipstick shades', href: '/lipstick-shades/deep-skin-lipstick-shades' },
      { label: 'Photo-ready makeup guide', href: '/scenarios/photo-ready-makeup' },
    ],
  },
  {
    slug: 'korean-dewy-makeup',
    title: 'Korean Dewy Makeup Guide',
    description: 'A Korean dewy makeup guide for hydrated skin prep, cushion base, soft brows, gradient lips, controlled glow, and product choices that stay fresh.',
    eyebrow: 'Korean Dewy Makeup',
    headline: 'Make the glow look hydrated, clear, and intentional.',
    intro: 'Korean dewy makeup is not the same as putting highlighter everywhere. The look depends on hydrated skin prep, thin luminous base, soft eye definition, watercolor blush, and a blurred lip that makes the face look fresh rather than oily.',
    image: '/images/hero/look-korean-dewy-makeup.webp',
    tryOnScenario: 'office',
    keyTraits: [
      'Layered hydration before makeup',
      'Thin cushion or skin tint base with real skin visible',
      'Soft straight or softly arched brows',
      'Minimal eye depth with lifted lashes',
      'Watercolor blush and controlled cheek glow',
      'Gradient or blurred lip tint finish',
    ],
    steps: [
      'Start with hydrating skincare in thin layers: toner, essence or serum, moisturizer, and sunscreen if daytime.',
      'Let skincare settle before base so the cushion or tint grips the skin instead of sliding.',
      'Apply a thin luminous base from the center outward and spot-conceal only redness, darkness, or blemishes.',
      'Set only areas that crease or get oily, usually around the nose, under-eye, and center forehead.',
      'Keep brows soft and clean; fill gaps lightly instead of drawing a heavy sculpted brow.',
      'Use beige, peach, taupe, or soft brown shadow close to the lash line for definition without visible heaviness.',
      'Curl lashes and use mascara that holds lift; keep lower lashes clean or lightly defined.',
      'Blend cream or liquid blush high on the cheeks in peach, rose, lavender-pink, or muted coral depending on undertone.',
      'Create a gradient lip by concentrating tint in the center, then blur outward with balm or a fingertip.',
    ],
    avoid: [
      'All-over highlighter that looks greasy instead of hydrated',
      'Thick matte foundation that hides skin translucency',
      'Heavy contour that fights the soft K-beauty effect',
      'Overdrawn matte lips',
      'Too much powder on the cheeks and nose bridge',
    ],
    bestFor: [
      'Fresh everyday makeup',
      'K-beauty and glass-skin inspired looks',
      'Dry or normal skin that likes luminous finishes',
      'Soft photo makeup in natural light',
      'People who want glow without full glam',
    ],
    productEssentials: [
      'Hydrating toner or essence',
      'Lightweight moisturizer',
      'Dewy primer or luminous sunscreen',
      'Cushion foundation or skin tint',
      'Cream or liquid blush',
      'Lip tint or glossy balm',
      'Fine setting powder for small zones',
    ],
    longIntro: [
      'Korean dewy makeup is often misunderstood as a highlighter-heavy look, but the most flattering version begins before makeup. The glow should look like moisture moving through the skin, not a metallic stripe sitting on top. That means skincare texture, base thickness, powder placement, and blush finish all matter. When the skin prep is right, you need less foundation and less highlighter because the complexion already catches light naturally.',
      'The skin prep should be layered but not heavy. A hydrating toner or essence can add bounce, a serum can add slip or brightness, and moisturizer seals the skin so base applies smoothly. The mistake is applying too many rich layers and then immediately putting makeup on top. If the products have not settled, cushion foundation can move around, separate near the nose, or look oily by midday. Thin layers with short wait time usually create a cleaner glow than one thick cream.',
      'Base should be sheer and strategic. Korean dewy makeup often uses cushion foundation because it taps on thinly and keeps a luminous finish. The goal is not to erase every mark. Cover redness or darkness where needed, then let real skin show through the cheeks and perimeter. If you need more coverage, add it in small patches rather than applying a second full layer. This keeps the dewy effect elegant instead of heavy.',
      'Powder placement is the difference between dewy and greasy. The cheeks, upper cheekbone, and bridge can stay fresh, but the sides of the nose, under eyes, mouth corners, and center forehead may need a small amount of powder. Use a small brush rather than a large puff if you want control. A blurred center with hydrated cheeks gives the face dimension and prevents the glow from looking like oil.',
      'The eye makeup should support the softness. Beige, soft brown, peach, taupe, or rose-brown shades can define the lash line without creating a dramatic smoky eye. Lashes should look lifted and separated, not clumpy. Brows can be straight, softly arched, or natural, but they should not overpower the hydrated skin. The overall impression is clean, awake, and delicate rather than sculpted.',
      'Blush and lip color make the look feel alive. Watercolor blush placed high on the cheeks gives the skin a translucent flush. Peach, rose, lavender-pink, or muted coral can work depending on undertone and skin depth. The lip is usually blurred or gradient rather than sharply lined: tint goes in the center, edges are softened, and balm or gloss adds comfort. This creates a youthful finish without requiring a full glam lip.',
      'Korean dewy makeup needs climate adjustment. In dry weather, you may keep more hydration and use almost no powder. In humid weather, the same routine may turn oily unless you reduce skincare layers, use a gripping primer, and set the center of the face. The look should be adapted to your skin type rather than copied exactly from a reference image. Oily skin can still wear dewy makeup if glow is placed deliberately.',
      'AI try-on helps because dewy makeup is highly dependent on face shape, skin texture, undertone, and lighting. One person may need peach blush for freshness, while another needs rose or lavender to avoid looking yellow. One person may look best with a glossy gradient lip, while another needs a satin tint for balance. Testing the full color story on your own face is more useful than judging one product separately.',
    ],
    techniqueSections: [
      {
        heading: 'Build glow through skincare first',
        body: 'Use thin hydrating layers and let them settle. If the skin is already bouncy, base can stay lighter and the glow looks more believable.',
      },
      {
        heading: 'Tap base instead of dragging it',
        body: 'Cushion or sponge application keeps coverage thin and luminous. Dragging can disturb skincare and create uneven shine.',
      },
      {
        heading: 'Powder only the mobile zones',
        body: 'Set under eyes, nose sides, mouth corners, and center forehead if needed. Leave cheek glow intact so the look stays fresh.',
      },
      {
        heading: 'Keep color translucent',
        body: 'Use cream or liquid blush in light layers and avoid harsh contour. The color should look like it belongs under the skin.',
      },
      {
        heading: 'Blur the lip edge',
        body: 'Apply tint at the center, then soften outward. A blurred lip keeps the face youthful and works better with dewy skin than a hard matte outline.',
      },
      {
        heading: 'Adjust for humidity',
        body: 'In humid weather, reduce skincare layers, use a gripping primer, and powder the center earlier. Dewy should look fresh, not slippery.',
      },
    ],
    productGrades: [
      {
        grade: 'Must-have',
        item: 'Hydrating toner or essence',
        why: 'This creates the bouncy base that makes dewy makeup look like skin rather than surface shine.',
      },
      {
        grade: 'Must-have',
        item: 'Cushion foundation or luminous skin tint',
        why: 'Thin, tap-on coverage keeps the complexion translucent while evening the center of the face.',
      },
      {
        grade: 'Must-have',
        item: 'Cream or liquid blush',
        why: 'A watercolor cheek finish fits the Korean dewy effect better than a dry powder stripe.',
      },
      {
        grade: 'Worth upgrading',
        item: 'Fine setting powder',
        why: 'A refined powder lets you control shine in small zones without killing cheek glow.',
      },
      {
        grade: 'Nice-to-have',
        item: 'Glossy lip tint',
        why: 'It creates the blurred gradient lip finish that completes the soft dewy look.',
      },
      {
        grade: 'Skip for this look',
        item: 'Heavy matte contour palette',
        why: 'Strong sculpting fights the hydrated, translucent effect and can make the look feel dated.',
      },
    ],
    personalizationTips: [
      {
        label: 'If your skin looks oily',
        detail: 'Reduce skincare layers, powder the center of the face, and keep glow mainly on the upper cheeks.',
      },
      {
        label: 'If the base separates',
        detail: 'Let skincare settle longer and use less moisturizer under cushion foundation. Tap instead of rubbing.',
      },
      {
        label: 'If the look feels too pale',
        detail: 'Increase blush and lip depth slightly. Dewy makeup still needs enough color to keep the face awake.',
      },
      {
        label: 'If you have texture',
        detail: 'Avoid shimmer on textured areas and use hydration plus satin glow instead of metallic highlight.',
      },
      {
        label: 'If you have oily skin',
        detail: 'You can still wear this look, but use a semi-dewy base, strategic powder, and a glossy lip instead of shine everywhere.',
      },
    ],
    faqs: [
      {
        question: 'What is Korean dewy makeup?',
        answer: 'It is a fresh K-beauty-inspired makeup style built around hydrated skin, thin luminous base, soft eye definition, watercolor blush, and blurred lip tint.',
      },
      {
        question: 'How is Korean dewy makeup different from glass skin?',
        answer: 'Glass skin focuses heavily on translucent skin glow, while Korean dewy makeup includes a full soft color story with brows, lashes, blush, and gradient lips.',
      },
      {
        question: 'Can oily skin wear Korean dewy makeup?',
        answer: 'Yes, but oily skin should reduce heavy skincare layers, set the center of the face, and keep glow controlled on the cheeks rather than everywhere.',
      },
      {
        question: 'What lip works best with Korean dewy makeup?',
        answer: 'A glossy tint, blurred balm, or gradient lip stain works best because it keeps the face soft and fresh without a hard matte edge.',
      },
    ],
    relatedLinks: [
      { label: 'Try Korean dewy makeup', href: '/try-on?scenario=office&style=korean-dewy-makeup' },
      { label: 'Glass skin makeup guide', href: '/styles/glass-skin-makeup' },
      { label: 'Everyday natural makeup guide', href: '/scenarios/everyday-natural-makeup' },
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

export const styleNavigationItems: HomeStyleItem[] = [
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
    image: '/images/hero/look-refined.webp',
    imageAlt: 'Quiet luxury makeup style with taupe eyes and satin nude lip',
    tryOnScenario: 'office',
    lookSlug: 'quiet-taupe',
  },
  {
    slug: 'camera-ready-makeup',
    label: 'Camera Ready',
    image: '/images/hero/look-photogenic.webp',
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
  {
    slug: 'korean-dewy-glow-makeup',
    label: 'Korean Dewy Glow',
    image: '/images/hero/look-korean-dewy-glow.webp',
    imageAlt: 'Korean dewy glow makeup style with clear luminous skin',
    tryOnScenario: 'office',
    lookSlug: 'korean-dewy-glow',
  },
  {
    slug: 'french-natural-chic-makeup',
    label: 'French Natural',
    image: '/images/hero/look-french-natural-chic.webp',
    imageAlt: 'French natural chic makeup style with effortless polish',
    tryOnScenario: 'office',
    lookSlug: 'french-natural-chic',
  },
  {
    slug: 'douyin-soft-focus-makeup',
    label: 'Douyin Soft Focus',
    image: '/images/hero/look-douyin-soft-focus.webp',
    imageAlt: 'Douyin soft focus makeup style with bright camera-friendly features',
    tryOnScenario: 'photo',
    lookSlug: 'douyin-soft-focus',
  },
  {
    slug: 'latina-bronze-glam-makeup',
    label: 'Latina Bronze',
    image: '/images/hero/look-latina-bronze-glam.webp',
    imageAlt: 'Latina bronze glam makeup style with sculpted warmth',
    tryOnScenario: 'photo',
    lookSlug: 'latina-bronze-glam',
  },
  {
    slug: 'monochrome-rose-makeup',
    label: 'Monochrome Rose',
    image: '/images/hero/look-executive-rose.webp',
    imageAlt: 'Monochrome rose makeup style with coordinated rose tones',
    tryOnScenario: 'office',
    lookSlug: 'executive-rose',
  },
  {
    slug: 'olive-rose-balance-makeup',
    label: 'Olive Rose Balance',
    image: '/images/hero/look-olive-undertone-rose.webp',
    imageAlt: 'Olive rose balance makeup style for green-neutral undertones',
    tryOnScenario: 'office',
    lookSlug: 'olive-undertone-rose',
  },
  {
    slug: 'sunburn-blush-makeup',
    label: 'Sunburn Blush',
    image: '/images/hero/look-sunburn-satin-glow.webp',
    imageAlt: 'Sunburn blush makeup style with warm lifted cheek color',
    tryOnScenario: 'office',
    lookSlug: 'sunburn-satin-glow',
  },
  {
    slug: 'watercolor-blush-makeup',
    label: 'Watercolor Blush',
    image: '/images/hero/look-watercolor-blush.webp',
    imageAlt: 'Watercolor blush makeup style with diffused pink cheeks',
    tryOnScenario: 'date',
    lookSlug: 'watercolor-blush',
  },
  {
    slug: 'jelly-lip-makeup',
    label: 'Jelly Lip',
    image: '/images/hero/look-jelly-lip-tint.webp',
    imageAlt: 'Jelly lip makeup style with sheer glossy lip tint',
    tryOnScenario: 'date',
    lookSlug: 'jelly-lip-tint',
  },
  {
    slug: 'reflective-lid-makeup',
    label: 'Reflective Lid',
    image: '/images/hero/look-reflective-lid-glow.webp',
    imageAlt: 'Reflective lid makeup style with light-catching eye sheen',
    tryOnScenario: 'photo',
    lookSlug: 'reflective-lid-glow',
  },
  {
    slug: 'vacation-bronze-makeup',
    label: 'Vacation Bronze',
    image: '/images/hero/look-vacation-bronze.webp',
    imageAlt: 'Vacation bronze makeup style with sunlit sculpt',
    tryOnScenario: 'photo',
    lookSlug: 'vacation-bronze',
  },
  {
    slug: 'cloud-skin-makeup',
    label: 'Cloud Skin',
    image: '/images/hero/look-cloud-skin-matte.webp',
    imageAlt: 'Cloud skin makeup style with soft-focus matte complexion',
    tryOnScenario: 'office',
    lookSlug: 'cloud-skin-matte',
  },
  {
    slug: 'interview-ready-makeup',
    label: 'Interview Ready',
    image: '/images/hero/look-interview-ready.webp',
    imageAlt: 'Interview ready makeup style with calm structure',
    tryOnScenario: 'office',
    lookSlug: 'interview-ready',
  },
  {
    slug: 'passport-photo-makeup',
    label: 'Passport Photo',
    image: '/images/hero/look-passport-photo-clean.webp',
    imageAlt: 'Passport photo makeup style with ID-safe definition',
    tryOnScenario: 'photo',
    lookSlug: 'passport-photo-clean',
  },
  {
    slug: 'creator-glow-makeup',
    label: 'Creator Glow',
    image: '/images/hero/look-creator-camera-glow.webp',
    imageAlt: 'Creator glow makeup style with studio-friendly radiance',
    tryOnScenario: 'photo',
    lookSlug: 'creator-camera-glow',
  },
  {
    slug: 'five-minute-makeup',
    label: 'Five-Minute',
    image: '/images/hero/look-five-minute-beginner.webp',
    imageAlt: 'Five-minute makeup style with fast beginner-friendly polish',
    tryOnScenario: 'office',
    lookSlug: 'five-minute-beginner',
  },
  {
    slug: 'asian-soft-definition-makeup',
    label: 'Asian Soft Definition',
    image: '/images/hero/hero-asian-refined.webp',
    imageAlt: 'Asian soft definition makeup style with clean eye structure',
    tryOnScenario: 'office',
    lookSlug: 'asian-refined',
    focus: 'center 24%',
  },
  {
    slug: 'soft-berry-stain-makeup',
    label: 'Soft Berry Stain',
    image: '/images/hero/look-soft-berry-stain.webp',
    imageAlt: 'Soft berry stain makeup style with blurred berry lips',
    tryOnScenario: 'date',
    lookSlug: 'soft-berry-stain',
  },
  {
    slug: 'monolid-makeup',
    label: 'Monolid Makeup',
    image: '/images/hero/look-monolid-makeup.webp',
    imageAlt: 'Monolid makeup style with visible soft eye definition',
    tryOnScenario: 'office',
    lookSlug: 'asian-refined',
    focus: 'center 24%',
  },
  {
    slug: 'olive-skin-makeup',
    label: 'Olive Skin',
    image: '/images/hero/look-olive-undertone-rose.webp',
    imageAlt: 'Olive skin makeup style with muted rose undertone balance',
    tryOnScenario: 'office',
    lookSlug: 'olive-undertone-rose',
  },
  {
    slug: 'deep-skin-makeup',
    label: 'Deep Skin',
    image: '/images/hero/hero-inclusive-glow.webp',
    imageAlt: 'Deep skin makeup style with rich complexion glow',
    tryOnScenario: 'photo',
    lookSlug: 'wedding-guest',
    focus: '20% 24%',
  },
  {
    slug: 'korean-dewy-makeup',
    label: 'Korean Dewy',
    image: '/images/hero/look-korean-dewy-makeup.webp',
    imageAlt: 'Korean dewy makeup style with hydrated luminous skin',
    tryOnScenario: 'office',
    lookSlug: 'korean-dewy-glow',
  },
];

export const homeStyleItems = styleNavigationItems.slice(0, 18);
export const STYLE_NAV_TARGET_COUNT = styleNavigationItems.length;

// ──────────────────────────────────────────────────────────────────────────
// Style facets — multi-dimensional metadata used by Find Your Style picker.
// Kept separate from styleNavigationItems so SEO/data integrity stays intact.
// ──────────────────────────────────────────────────────────────────────────

export type StyleAesthetic = 'clean' | 'glow' | 'glam' | 'editorial' | 'camera' | 'event';
export type StyleEyeShape = 'monolid' | 'hooded' | 'mature';
export type StyleSkinTone = 'olive' | 'deep';
export type StyleDifficulty = '5min' | 'daily' | 'full';

export interface StyleFacet {
  aesthetic: StyleAesthetic;
  eyeShape?: StyleEyeShape;
  skinTone?: StyleSkinTone;
  difficulty: StyleDifficulty;
  personaTag?: string;
  hasGuide?: boolean;
  relatedLookSlugs?: string[];
}

export const aestheticOptions: Array<{ value: StyleAesthetic | 'all'; label: string; hint: string }> = [
  { value: 'all', label: 'All styles', hint: 'Browse every style direction' },
  { value: 'clean', label: 'Clean', hint: 'Skin-first, low-effort, fresh' },
  { value: 'glow', label: 'Glow', hint: 'K-beauty dewy, peach, juicy' },
  { value: 'glam', label: 'Glam', hint: 'Soft glam, bronze, evening' },
  { value: 'editorial', label: 'Editorial', hint: 'Quiet luxury, refined neutrals' },
  { value: 'camera', label: 'Camera', hint: 'Photo, video, ID-friendly' },
  { value: 'event', label: 'Event', hint: 'Wedding guest, gala, vacation' },
];

export const featureOptions: Array<{ value: string; label: string; kind: 'eyeShape' | 'skinTone' | 'difficulty' }> = [
  { value: '5min', label: '5-min', kind: 'difficulty' },
  { value: 'daily', label: 'Daily', kind: 'difficulty' },
  { value: 'full', label: 'Full look', kind: 'difficulty' },
  { value: 'monolid', label: 'Monolid', kind: 'eyeShape' },
  { value: 'hooded', label: 'Hooded eyes', kind: 'eyeShape' },
  { value: 'mature', label: 'Mature skin', kind: 'eyeShape' },
  { value: 'olive', label: 'Olive', kind: 'skinTone' },
  { value: 'deep', label: 'Deep', kind: 'skinTone' },
];

export const styleFacets: Record<string, StyleFacet> = {
  'clean-girl-makeup':         { aesthetic: 'clean',     difficulty: '5min',  personaTag: '5-min friendly',  hasGuide: true,  relatedLookSlugs: ['clean-girl', 'glass-skin', 'fresh-minimal', 'no-makeup', 'weekend-glow', 'soft-matte-everyday'] },
  'soft-glam-makeup':          { aesthetic: 'glam',      difficulty: 'full',  personaTag: 'Soft definition', hasGuide: true,  relatedLookSlugs: ['soft-glam', 'romantic-pink', 'berry-date', 'champagne-gala', 'wedding-guest'] },
  'glass-skin-makeup':         { aesthetic: 'glow',      difficulty: 'daily', personaTag: 'K-beauty',        hasGuide: true,  relatedLookSlugs: ['glass-skin', 'korean-dewy-glow', 'clean-girl', 'fresh-minimal'] },
  'no-makeup-makeup':          { aesthetic: 'clean',     difficulty: '5min',  personaTag: 'Invisible polish', hasGuide: true, relatedLookSlugs: ['no-makeup', 'fresh-minimal', 'soft-matte-everyday', 'cloud-skin-matte'] },
  'office-polished-makeup':    { aesthetic: 'editorial', difficulty: 'daily', personaTag: 'Quiet authority', hasGuide: true,  relatedLookSlugs: ['office-glow', 'client-meeting-nude', 'interview-ready', 'executive-rose', 'quiet-taupe'] },
  'romantic-date-makeup':      { aesthetic: 'glam',      difficulty: 'daily', personaTag: 'Warm flush',      hasGuide: true,  relatedLookSlugs: ['romantic-pink', 'berry-date', 'rose-milk-date', 'candlelight-mauve', 'peach-beige-date'] },
  'latte-makeup':              { aesthetic: 'editorial', difficulty: 'daily', personaTag: 'Warm neutral',                    relatedLookSlugs: ['warm-nude-daily', 'office-glow', 'soft-matte-everyday'] },
  'peach-glow-makeup':         { aesthetic: 'glow',      difficulty: '5min',  personaTag: 'Fresh peach',                     relatedLookSlugs: ['peach-morning-glow', 'sunburn-satin-glow', 'weekend-glow'] },
  'rose-milk-makeup':          { aesthetic: 'glow',      difficulty: 'daily', personaTag: 'Milky rose',                      relatedLookSlugs: ['rose-milk-date', 'romantic-pink', 'watercolor-blush'] },
  'quiet-luxury-makeup':       { aesthetic: 'editorial', difficulty: 'daily', personaTag: 'Quiet luxury',                    relatedLookSlugs: ['quiet-taupe', 'client-meeting-nude', 'executive-rose', 'office-glow'] },
  'camera-ready-makeup':       { aesthetic: 'camera',    difficulty: 'full',  personaTag: 'Photo balanced',                  relatedLookSlugs: ['photo-ready', 'flash-proof-satin', 'creator-camera-glow', 'zoom-polish'] },
  'flash-proof-makeup':        { aesthetic: 'camera',    difficulty: 'full',  personaTag: 'No flashback',                    relatedLookSlugs: ['flash-proof-satin', 'photo-ready', 'wedding-guest'] },
  'wedding-guest-makeup':      { aesthetic: 'event',     difficulty: 'full',  personaTag: 'Heat-safe polish',                relatedLookSlugs: ['wedding-guest', 'summer-wedding-guest', 'champagne-gala', 'soft-glam'] },
  'champagne-glow-makeup':     { aesthetic: 'event',     difficulty: 'full',  personaTag: 'Soft shimmer',                    relatedLookSlugs: ['champagne-gala', 'soft-editorial', 'reflective-lid-glow', 'wedding-guest'] },
  'bronze-glam-makeup':        { aesthetic: 'glam',      difficulty: 'full',  personaTag: 'Warm sculpt',                     relatedLookSlugs: ['bronze-evening', 'vacation-bronze', 'latina-bronze-glam', 'evening-gala'] },
  'burgundy-velvet-makeup':    { aesthetic: 'glam',      difficulty: 'full',  personaTag: 'Deep velvet',                     relatedLookSlugs: ['burgundy-velvet', 'evening-gala', 'soft-editorial'] },
  'mature-radiance-makeup':    { aesthetic: 'editorial', difficulty: 'daily', eyeShape: 'mature', personaTag: 'Mature skin', relatedLookSlugs: ['mature-skin-radiance', 'quiet-taupe', 'office-glow'] },
  'hooded-eye-lift-makeup':    { aesthetic: 'editorial', difficulty: 'daily', eyeShape: 'hooded', personaTag: 'Hooded lift', relatedLookSlugs: ['hooded-eyes-lift', 'office-glow', 'interview-ready'] },
  'korean-dewy-glow-makeup':   { aesthetic: 'glow',      difficulty: 'daily', personaTag: 'K-beauty',                        relatedLookSlugs: ['korean-dewy-glow', 'glass-skin', 'clean-girl'] },
  'french-natural-chic-makeup':{ aesthetic: 'clean',     difficulty: 'daily', personaTag: 'French chic',                     relatedLookSlugs: ['french-natural-chic', 'no-makeup', 'soft-matte-everyday', 'fresh-minimal'] },
  'douyin-soft-focus-makeup':  { aesthetic: 'camera',    difficulty: 'full',  personaTag: 'Camera sweet',                    relatedLookSlugs: ['douyin-soft-focus', 'creator-camera-glow', 'photo-ready'] },
  'latina-bronze-glam-makeup': { aesthetic: 'glam',      difficulty: 'full',  personaTag: 'Defined warmth',                  relatedLookSlugs: ['latina-bronze-glam', 'bronze-evening', 'vacation-bronze'] },
  'monochrome-rose-makeup':    { aesthetic: 'editorial', difficulty: 'daily', personaTag: 'Monochrome',                      relatedLookSlugs: ['executive-rose', 'romantic-pink', 'olive-undertone-rose'] },
  'olive-rose-balance-makeup': { aesthetic: 'editorial', difficulty: 'daily', skinTone: 'olive', personaTag: 'Olive balance', relatedLookSlugs: ['olive-undertone-rose', 'quiet-taupe', 'office-glow'] },
  'sunburn-blush-makeup':      { aesthetic: 'glow',      difficulty: '5min',  personaTag: 'Lifted blush',                    relatedLookSlugs: ['sunburn-satin-glow', 'peach-morning-glow', 'watercolor-blush'] },
  'watercolor-blush-makeup':   { aesthetic: 'glow',      difficulty: 'daily', personaTag: 'Diffused color',                  relatedLookSlugs: ['watercolor-blush', 'rose-milk-date', 'soft-berry-stain'] },
  'jelly-lip-makeup':          { aesthetic: 'glow',      difficulty: '5min',  personaTag: 'Sheer juicy lip',                 relatedLookSlugs: ['jelly-lip-tint', 'rose-milk-date', 'peach-beige-date'] },
  'reflective-lid-makeup':     { aesthetic: 'camera',    difficulty: 'full',  personaTag: 'Light-catching eyes',             relatedLookSlugs: ['reflective-lid-glow', 'champagne-gala', 'soft-editorial'] },
  'vacation-bronze-makeup':    { aesthetic: 'glam',      difficulty: 'full',  personaTag: 'Sunlit sculpt',                   relatedLookSlugs: ['vacation-bronze', 'bronze-evening', 'latina-bronze-glam'] },
  'cloud-skin-makeup':         { aesthetic: 'clean',     difficulty: 'daily', personaTag: 'Soft-focus base',                 relatedLookSlugs: ['cloud-skin-matte', 'soft-matte-everyday', 'no-makeup'] },
  'interview-ready-makeup':    { aesthetic: 'editorial', difficulty: 'daily', personaTag: 'Interview safe',                  relatedLookSlugs: ['interview-ready', 'office-glow', 'client-meeting-nude'] },
  'passport-photo-makeup':     { aesthetic: 'camera',    difficulty: 'daily', personaTag: 'ID-safe polish',                  relatedLookSlugs: ['passport-photo-clean', 'photo-ready', 'flash-proof-satin'] },
  'creator-glow-makeup':       { aesthetic: 'camera',    difficulty: 'full',  personaTag: 'Studio friendly',                 relatedLookSlugs: ['creator-camera-glow', 'photo-ready', 'douyin-soft-focus'] },
  'five-minute-makeup':        { aesthetic: 'clean',     difficulty: '5min',  personaTag: '5-min routine',                   relatedLookSlugs: ['five-minute-beginner', 'fresh-minimal', 'no-makeup', 'weekend-glow'] },
  'asian-soft-definition-makeup': { aesthetic: 'clean',  difficulty: 'daily', eyeShape: 'monolid', personaTag: 'Soft definition', relatedLookSlugs: ['asian-refined', 'clean-girl', 'glass-skin'] },
  'soft-berry-stain-makeup':   { aesthetic: 'glow',      difficulty: '5min',  personaTag: 'Blurred berry',                   relatedLookSlugs: ['soft-berry-stain', 'berry-date', 'watercolor-blush'] },
  'monolid-makeup':            { aesthetic: 'clean',     difficulty: 'daily', eyeShape: 'monolid', personaTag: 'Monolid friendly', hasGuide: true, relatedLookSlugs: ['asian-refined', 'clean-girl', 'glass-skin', 'office-glow'] },
  'olive-skin-makeup':         { aesthetic: 'editorial', difficulty: 'daily', skinTone: 'olive', personaTag: 'Olive undertone', hasGuide: true, relatedLookSlugs: ['olive-undertone-rose', 'quiet-taupe', 'soft-matte-everyday'] },
  'deep-skin-makeup':          { aesthetic: 'glam',      difficulty: 'full',  skinTone: 'deep',  personaTag: 'Deep skin glow', hasGuide: true, relatedLookSlugs: ['radiant-glow', 'wedding-guest', 'evening-gala', 'champagne-gala'] },
  'korean-dewy-makeup':        { aesthetic: 'glow',      difficulty: 'daily', personaTag: 'K-beauty dewy',  hasGuide: true,  relatedLookSlugs: ['korean-dewy-glow', 'glass-skin', 'clean-girl', 'jelly-lip-tint'] },
};

export interface StyleNavItemWithFacet extends HomeStyleItem, StyleFacet {
  guideHref?: string;
  lookCount: number;
}

export function getStyleFacet(slug: string): StyleFacet | undefined {
  return styleFacets[slug];
}

export function getStyleNavWithFacets(): StyleNavItemWithFacet[] {
  return styleNavigationItems.map((item) => {
    const facet = styleFacets[item.slug] ?? { aesthetic: 'editorial' as StyleAesthetic, difficulty: 'daily' as StyleDifficulty };
    const lookCount = facet.relatedLookSlugs?.length ?? 0;
    return {
      ...item,
      ...facet,
      guideHref: facet.hasGuide ? `/styles/${item.slug}` : undefined,
      lookCount,
    };
  });
}
