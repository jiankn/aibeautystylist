export interface LipstickShadePage {
  slug: string;
  title: string;
  description: string;
  eyebrow: string;
  headline: string;
  intro: string;
  bestShades: Array<{
    name: string;
    hex: string;
    why: string;
  }>;
  avoid: string[];
  testSteps: string[];
  productLogic: string[];
  relatedLinks: Array<{
    label: string;
    href: string;
  }>;
}

export const lipstickShadePages: LipstickShadePage[] = [
  {
    slug: 'warm-undertone-lipstick-shades',
    title: 'Best Lipstick Shades for Warm Undertones',
    description: 'Find warm-undertone lipstick shades that brighten golden, peach, and yellow-based skin without turning orange or dull.',
    eyebrow: 'Warm Undertone',
    headline: 'Choose warmth with control: peach, rosewood, soft brick, and caramel nude.',
    intro: 'Warm undertones usually glow with lipstick shades that have peach, terracotta, caramel, or warm rose in the base. The safest result is warm but not neon.',
    bestShades: [
      { name: 'Peach Rose', hex: '#C9796D', why: 'Adds warmth without pushing the face into orange.' },
      { name: 'Soft Brick', hex: '#A85245', why: 'Gives definition and works well for office or photo makeup.' },
      { name: 'Caramel Nude', hex: '#B5725D', why: 'A nude that does not erase the lips on warm skin.' },
    ],
    avoid: ['Blue-based bubblegum pink', 'Grey mauve with no warmth', 'Pale beige that erases the mouth'],
    testSteps: ['Check the shade next to the cheek, not only on the wrist.', 'Look at the face in daylight and phone camera light.', 'If teeth look yellower, move toward rosewood instead of orange.'],
    productLogic: ['Cream or satin textures are easiest for daily wear.', 'Use the same color family for blush to keep the face coherent.', 'For photos, choose one step deeper than your daily nude.'],
    relatedLinks: [
      { label: 'Office makeup guide', href: '/scenarios/office-makeup' },
      { label: 'Everyday natural makeup guide', href: '/scenarios/everyday-natural-makeup' },
      { label: 'Find your shade', href: '/tools/shade-finder' },
    ],
  },
  {
    slug: 'cool-undertone-lipstick-shades',
    title: 'Best Lipstick Shades for Cool Undertones',
    description: 'A practical guide to cool-undertone lipstick shades, including rose, berry, mauve, and blue-red families.',
    eyebrow: 'Cool Undertone',
    headline: 'Blue-based rose, berry, mauve, and soft red will usually look cleaner.',
    intro: 'Cool undertones often look clearer with lipstick shades that have blue, rose, berry, or mauve bases. The key is avoiding orange warmth that can make skin look sallow.',
    bestShades: [
      { name: 'Blue Rose', hex: '#A94D64', why: 'Brightens the face without becoming too pink.' },
      { name: 'Soft Berry', hex: '#8F3E5C', why: 'Adds date-night presence while staying refined.' },
      { name: 'Cool Mauve', hex: '#936071', why: 'A daily shade for cool or olive-cool complexions.' },
    ],
    avoid: ['Coral orange', 'Yellow beige nude', 'Warm brown with too much red-orange'],
    testSteps: ['Compare rose and coral side by side near the mouth.', 'Choose the one that makes the whites of the eyes look clearer.', 'If the face looks grey, deepen the berry instead of adding warmth.'],
    productLogic: ['Mauve is the safest everyday family.', 'Berry works better than coral for evening color.', 'Blue-red is usually cleaner than tomato red.'],
    relatedLinks: [
      { label: 'Date night makeup guide', href: '/scenarios/date-night-makeup' },
      { label: 'Soft Glam Berry tutorial', href: '/tutorials/soft-glam' },
      { label: 'Find your shade', href: '/tools/shade-finder' },
    ],
  },
  {
    slug: 'neutral-undertone-lipstick-shades',
    title: 'Best Lipstick Shades for Neutral Undertones',
    description: 'Choose lipstick shades for neutral undertones with balanced rose, nude, berry, and red options for daily and photo makeup.',
    eyebrow: 'Neutral Undertone',
    headline: 'Balanced rose, rose-brown, soft red, and muted berry give the most flexibility.',
    intro: 'Neutral undertones can wear more shade families, but the best result still depends on contrast, lip depth, and the lighting where the makeup will be seen.',
    bestShades: [
      { name: 'Balanced Rose', hex: '#B45F68', why: 'Works across office, date, and everyday looks.' },
      { name: 'Rose Brown', hex: '#9D5D55', why: 'Adds definition without becoming too warm or too cool.' },
      { name: 'Soft Red', hex: '#B13F3C', why: 'A cleaner red that does not overpower neutral skin.' },
    ],
    avoid: ['Too-pale nude', 'Neon pink', 'Very grey mauve if the face already reads muted'],
    testSteps: ['Test the shade in daylight first.', 'Take a phone photo to see whether the lip disappears.', 'If both warm and cool shades work, pick based on outfit and scenario.'],
    productLogic: ['Neutral skin can use lipstick to decide the whole color story.', 'Keep blush in the same family as the lip.', 'For camera makeup, add a lip pencil to keep the edge clear.'],
    relatedLinks: [
      { label: 'Photo-ready makeup guide', href: '/scenarios/photo-ready-makeup' },
      { label: 'Camera Glow tutorial', href: '/tutorials/camera-glow' },
      { label: 'Find your shade', href: '/tools/shade-finder' },
    ],
  },
  {
    slug: 'olive-skin-lipstick-shades',
    title: 'Best Lipstick Shades for Olive Skin',
    description: 'Lipstick shade guidance for olive skin, including muted rose, berry, brown-pink, and why some bright colors look wrong.',
    eyebrow: 'Olive Skin',
    headline: 'Muted rose, berry, mauve-brown, and soft plum usually look more expensive.',
    intro: 'Olive skin has a green or grey-gold cast that can make simple warm/cool advice fail. Muted shades often look better than bright ones because they respect the skin depth.',
    bestShades: [
      { name: 'Muted Rose', hex: '#9E5A63', why: 'Adds life without fighting the olive base.' },
      { name: 'Soft Plum', hex: '#754052', why: 'Gives evening depth without turning orange.' },
      { name: 'Mauve Brown', hex: '#8B5C58', why: 'A daily shade that stays grounded on olive skin.' },
    ],
    avoid: ['Milky pink', 'Pure orange coral', 'Very pale beige nude'],
    testSteps: ['Test shades against the lower face, not the arm.', 'If the face looks green, avoid the shade.', 'If the mouth looks separate from the face, lower the saturation.'],
    productLogic: ['Muted is usually safer than bright.', 'Cool berry works for evening if the base is not too purple.', 'Brown-pink is often better than beige nude.'],
    relatedLinks: [
      { label: 'Hooded eyes makeup guide', href: '/scenarios/hooded-eyes-makeup' },
      { label: 'Night Mauve Focus tutorial', href: '/tutorials/night-mauve' },
      { label: 'Find your shade', href: '/tools/shade-finder' },
    ],
  },
  {
    slug: 'fair-skin-lipstick-shades',
    title: 'Best Lipstick Shades for Fair Skin',
    description: 'A fair-skin lipstick guide for soft rose, peach, berry, and red shades that add color without overpowering the face.',
    eyebrow: 'Fair Skin',
    headline: 'Soft rose, petal pink, peach nude, and clear berry add life without harshness.',
    intro: 'Fair skin can be overpowered quickly. The best lipstick shade usually depends on undertone and contrast level, not just how light the skin is.',
    bestShades: [
      { name: 'Petal Rose', hex: '#C47784', why: 'A soft daily shade that wakes up fair skin.' },
      { name: 'Peach Nude', hex: '#D08878', why: 'Good for warm fair skin when beige looks flat.' },
      { name: 'Clear Berry', hex: '#9A3C5A', why: 'Adds evening contrast without a heavy dark lip.' },
    ],
    avoid: ['Brown nude that looks muddy', 'Very dark matte lip without eye structure', 'Concealer nude'],
    testSteps: ['Check whether the lip becomes the only thing you see.', 'Pair deeper lips with brow and lash definition.', 'If the face looks red, choose muted rose instead of bright pink.'],
    productLogic: ['Sheer textures are easiest for beginners.', 'A stronger lip needs balanced brows.', 'Cream blush should echo the lip family.'],
    relatedLinks: [
      { label: 'Beginner makeup guide', href: '/scenarios/beginner-makeup' },
      { label: 'Fresh Minimal tutorial', href: '/tutorials/fresh-minimal' },
      { label: 'Find your shade', href: '/tools/shade-finder' },
    ],
  },
  {
    slug: 'medium-skin-lipstick-shades',
    title: 'Best Lipstick Shades for Medium Skin',
    description: 'Lipstick shades for medium skin tones, including rosewood, terracotta, berry-brown, and balanced nude options.',
    eyebrow: 'Medium Skin',
    headline: 'Rosewood, terracotta, berry-brown, and caramel nude usually hold the face well.',
    intro: 'Medium skin often needs enough lip depth to avoid disappearing, but not so much saturation that the lip dominates every look.',
    bestShades: [
      { name: 'Rosewood', hex: '#9D514A', why: 'A reliable daily shade with enough depth.' },
      { name: 'Terracotta Rose', hex: '#B15E45', why: 'Flatters warm medium skin without becoming neon.' },
      { name: 'Berry Brown', hex: '#7C3F4B', why: 'Adds evening weight while staying wearable.' },
    ],
    avoid: ['Milky pink', 'Grey beige', 'Lip shades lighter than the natural lip edge'],
    testSteps: ['Check the lip against the natural lip border.', 'If the shade looks chalky, go deeper or warmer.', 'For office makeup, pick rosewood before beige nude.'],
    productLogic: ['Depth matters more than brightness.', 'Lip pencil helps nude shades stay visible.', 'Berry-brown works well for events and photos.'],
    relatedLinks: [
      { label: 'Mature skin makeup guide', href: '/scenarios/mature-skin-makeup' },
      { label: 'Quiet Luxury Taupe tutorial', href: '/tutorials/quiet-luxury' },
      { label: 'Find your shade', href: '/tools/shade-finder' },
    ],
  },
  {
    slug: 'tan-skin-lipstick-shades',
    title: 'Best Lipstick Shades for Tan Skin',
    description: 'A tan-skin lipstick shade guide for caramel rose, brick, warm berry, and deeper nude colors that do not turn ashy.',
    eyebrow: 'Tan Skin',
    headline: 'Caramel rose, soft brick, warm berry, and cocoa nude keep tan skin alive.',
    intro: 'Tan skin often looks best when lipstick has enough brown, red, or berry depth. Too-light nudes can turn ashy and make the mouth disappear.',
    bestShades: [
      { name: 'Caramel Rose', hex: '#A86452', why: 'A daily nude that still carries color.' },
      { name: 'Soft Brick', hex: '#994737', why: 'Adds warmth and structure for photos.' },
      { name: 'Warm Berry', hex: '#883B4E', why: 'A richer option for evening without looking flat.' },
    ],
    avoid: ['Pale beige nude', 'Milky peach', 'Chalky pink'],
    testSteps: ['Apply the shade and look at the mouth from three feet away.', 'If the lip edge disappears, add lip pencil or depth.', 'Check whether the shade still shows in a phone photo.'],
    productLogic: ['Brown undertones are your friend.', 'Creamy textures keep depth from looking dry.', 'For evening, berry with warmth is usually safer than pure purple.'],
    relatedLinks: [
      { label: 'Evening event makeup guide', href: '/scenarios/evening-event-makeup' },
      { label: 'Night Mauve Focus tutorial', href: '/tutorials/night-mauve' },
      { label: 'Find your shade', href: '/tools/shade-finder' },
    ],
  },
  {
    slug: 'deep-skin-lipstick-shades',
    title: 'Best Lipstick Shades for Deep Skin',
    description: 'Lipstick shade guidance for deep skin tones, including berry, brown-red, plum, and rich nude colors with enough visible depth.',
    eyebrow: 'Deep Skin',
    headline: 'Rich berry, brown-red, plum, cocoa rose, and deep nude keep the lip visible.',
    intro: 'Deep skin can carry strong lip color beautifully, but the shade still needs the right undertone. The biggest mistake is choosing a nude that is too pale or too grey.',
    bestShades: [
      { name: 'Cocoa Rose', hex: '#74433E', why: 'A grounded daily shade that does not turn ashy.' },
      { name: 'Brown Red', hex: '#7E2F2B', why: 'A polished red family that holds depth.' },
      { name: 'Deep Berry', hex: '#5F263F', why: 'Adds evening presence and works well in photos.' },
    ],
    avoid: ['Pale pink without a liner', 'Grey beige nude', 'Thin sheer shades that vanish'],
    testSteps: ['Check whether the lip is still visible in camera light.', 'Use lip liner when testing nude shades.', 'If the shade looks grey, choose more red, berry, or brown depth.'],
    productLogic: ['Pigment and depth matter more than brightness.', 'A liner can make lighter shades wearable.', 'Rich satin textures often photograph better than flat matte.'],
    relatedLinks: [
      { label: 'Wedding guest makeup guide', href: '/scenarios/wedding-guest-makeup' },
      { label: 'Flash-proof Fresh tutorial', href: '/tutorials/flash-proof' },
      { label: 'Find your shade', href: '/tools/shade-finder' },
    ],
  },
  {
    slug: 'asian-skin-lipstick-shades',
    title: 'Best Lipstick Shades for Asian Skin',
    description: 'A practical lipstick shade guide for Asian skin tones, covering warm, cool, neutral, olive, fair, medium, and deep Asian complexions.',
    eyebrow: 'Asian Skin',
    headline: 'Rose-brown, muted coral, soft berry, and tea rose usually look cleaner than chalky nude.',
    intro: 'Asian skin is not one undertone. It can be fair and cool, medium and olive, tan and golden, or deep and neutral. The most reliable lipstick shades respect both undertone and contrast level instead of assuming every Asian complexion needs the same peach or red.',
    bestShades: [
      { name: 'Tea Rose', hex: '#B76A68', why: 'Adds natural brightness without looking too pink or too orange.' },
      { name: 'Rose Brown', hex: '#8F554D', why: 'Grounds the lip on olive, neutral, and medium Asian skin tones.' },
      { name: 'Soft Berry', hex: '#8A3D58', why: 'Gives visible color for cool, fair, or evening looks without becoming harsh.' },
    ],
    avoid: ['Concealer beige nude', 'Milky pink with a white base', 'Neon coral that turns orange on olive skin'],
    testSteps: [
      'Check the shade against your lower face and natural lip edge, not only on the wrist.',
      'Take one daylight photo and one indoor photo because Asian undertones often shift under warm bulbs.',
      'If your face looks grey, choose more rose or brown depth; if it looks orange, lower the coral and add berry or mauve.',
    ],
    productLogic: [
      'Fair Asian skin often needs soft rose, tea rose, or clear berry rather than beige nude.',
      'Medium and olive Asian skin usually handles rose-brown, muted coral, mauve-brown, and terracotta rose better than pale pink.',
      'Tan and deep Asian skin needs enough brown, red, berry, or cocoa depth so the mouth stays visible in photos.',
    ],
    relatedLinks: [
      { label: 'Monolid makeup guide', href: '/styles/monolid-makeup' },
      { label: 'Korean dewy makeup guide', href: '/styles/korean-dewy-makeup' },
      { label: 'Find your undertone first', href: '/tools/undertone-quiz' },
    ],
  },
];
