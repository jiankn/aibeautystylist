export interface ScenarioPage {
  slug: string;
  title: string;
  description: string;
  eyebrow: string;
  headline: string;
  intro: string;
  image: string;
  tryOnScenario: 'office' | 'date' | 'photo';
  tryOnLook: string;
  steps: string[];
  avoid: string[];
  bestFor: string[];
  decisionGuide: Array<{
    label: string;
    detail: string;
  }>;
  productPriorities: string[];
  timeRequired: {
    quick: string;
    full: string;
    touchUp: string;
  };
  commonMistakes: Array<{
    mistake: string;
    fix: string;
  }>;
  routine: Array<{
    label: string;
    items: string[];
  }>;
  faqs: Array<{
    question: string;
    answer: string;
  }>;
  relatedLinks: Array<{
    label: string;
    href: string;
  }>;
}

type ScenarioPageBase = Omit<ScenarioPage, 'timeRequired' | 'commonMistakes' | 'routine' | 'faqs'>;

const baseScenarioPages: ScenarioPageBase[] = [
  {
    slug: 'office-makeup',
    title: 'Office Makeup Try-On Guide',
    description: 'A polished, low-effort office makeup routine with AI try-on guidance, beginner-safe steps, and product priorities.',
    eyebrow: 'Office Makeup',
    headline: 'Look awake, polished, and still like yourself in office light.',
    intro: 'The office version of good makeup is not more makeup. It is controlled skin, sharper brows, clean lash roots, and a lip color that adds energy without stealing focus.',
    image: '/images/hero/look-client-meeting-nude.webp',
    tryOnScenario: 'office',
    tryOnLook: 'client-meeting-nude',
    steps: [
      'Keep base thin and correct only the shadows that make you look tired.',
      'Use brow and lash-root definition before adding visible eyeshadow.',
      'Choose a nude rose or soft brown lip that also works as a cheek reference.',
      'Check the result under window light or video-call light before adding more.',
    ],
    avoid: ['Full-coverage base that flattens the face', 'Hard black liner for daytime meetings', 'Lip and cheek colors from different families'],
    bestFor: ['Video calls', 'Daily office light', 'Low-maintenance routines', 'Beginners who want polish without heavy color'],
    decisionGuide: [
      { label: 'If your face reads tired', detail: 'Start with under-eye, nose-wing, and mouth-corner correction before adding color.' },
      { label: 'If you look flat on camera', detail: 'Add brow structure and lash-root definition before contour.' },
      { label: 'If the lip feels too visible', detail: 'Move toward muted rose, rose-brown, or soft nude rather than beige.' },
    ],
    productPriorities: ['Sheer base', 'Precision brow pencil', 'Brown lash-root liner', 'Muted rose-nude lip', 'Small cream highlight'],
    relatedLinks: [
      { label: 'Office Glow tutorial', href: '/tutorials/office-glow' },
      { label: 'Warm undertone lipstick shades', href: '/lipstick-shades/warm-undertone-lipstick-shades' },
      { label: 'Try your office look', href: '/try-on?scenario=office&look=client-meeting-nude' },
    ],
  },
  {
    slug: 'interview-makeup',
    title: 'Interview Makeup Try-On Guide',
    description: 'A calm, capable interview makeup plan focused on refined structure, soft color, and confidence on camera or in person.',
    eyebrow: 'Interview Makeup',
    headline: 'Build a composed look that reads capable, not overdone.',
    intro: 'Interview makeup needs restraint. The goal is clarity: refined skin, focused eyes, controlled shine, and a lip that supports your presence.',
    image: '/images/hero/look-interview-ready.webp',
    tryOnScenario: 'office',
    tryOnLook: 'interview-ready',
    steps: [
      'Start with skin correction and avoid visible layers around the mouth and nose.',
      'Use taupe or soft brown to shape the socket without creating a smoky eye.',
      'Keep blush higher and softer so the face reads lifted.',
      'Use a muted nude or rose-brown lip with clean edges.',
    ],
    avoid: ['Over-contouring', 'Heavy shimmer', 'Bright lip color that becomes the whole look'],
    bestFor: ['Job interviews', 'Client presentations', 'Professional headshots', 'People who need structure without glamour'],
    decisionGuide: [
      { label: 'If the interview is on camera', detail: 'Use slightly more brow and lash definition than you would in person.' },
      { label: 'If your face gets shiny fast', detail: 'Set only the center of the face and leave the perimeter natural.' },
      { label: 'If you are unsure about color', detail: 'Choose taupe, soft brown, rose-brown, or muted nude families.' },
    ],
    productPriorities: ['Skin tint', 'Under-eye corrector', 'Taupe shadow', 'Soft brown mascara', 'Rose-brown lipstick'],
    relatedLinks: [
      { label: 'Quiet Luxury Taupe tutorial', href: '/tutorials/quiet-luxury' },
      { label: 'Neutral undertone lipstick shades', href: '/lipstick-shades/neutral-undertone-lipstick-shades' },
      { label: 'Office makeup guide', href: '/scenarios/office-makeup' },
    ],
  },
  {
    slug: 'date-night-makeup',
    title: 'Date Night Makeup Try-On Guide',
    description: 'A soft date-night makeup guide with close-up friendly skin, lip-cheek harmony, and AI personalized look matching.',
    eyebrow: 'Date Night Makeup',
    headline: 'Create softness up close without losing definition.',
    intro: 'Date-night makeup works best when the skin still looks real and the color story feels intentional. Lip and cheek harmony matters more than dramatic color.',
    image: '/images/hero/look-candlelight-mauve.webp',
    tryOnScenario: 'date',
    tryOnLook: 'candlelight-mauve',
    steps: [
      'Keep the base breathable and focus correction around the under-eye area.',
      'Use low-saturation rose, mauve, or berry tones based on undertone.',
      'Soften lip edges instead of drawing a hard line.',
      'Use small highlights only where light should naturally catch.',
    ],
    avoid: ['Blush placed too low', 'Warm orange tones on cool undertones', 'Hard lip lines for a soft-glam look'],
    bestFor: ['Dinner dates', 'Coffee dates', 'Low-light venues', 'Soft glam without heavy contour'],
    decisionGuide: [
      { label: 'If the date is daytime', detail: 'Use balm textures, clean lashes, and a lip-cheek product.' },
      { label: 'If the date is evening', detail: 'Add outer-corner depth and a lip with more presence.' },
      { label: 'If your undertone is cool or olive', detail: 'Use berry, mauve, or cool rose instead of coral.' },
    ],
    productPriorities: ['Brightening concealer', 'Rose-taupe shadow', 'Cream blush', 'Soft berry lip', 'Fine highlighter'],
    relatedLinks: [
      { label: 'Soft Glam Berry tutorial', href: '/tutorials/soft-glam' },
      { label: 'Cool undertone lipstick shades', href: '/lipstick-shades/cool-undertone-lipstick-shades' },
      { label: 'Try date-night AI look', href: '/try-on?scenario=date&look=candlelight-mauve' },
    ],
  },
  {
    slug: 'bridal-makeup',
    title: 'Bridal Makeup Try-On Guide',
    description: 'A bridal soft-glam makeup guide for long-wear glow, camera balance, and step-by-step AI beauty planning.',
    eyebrow: 'Bridal Makeup',
    headline: 'Plan a camera-ready glow that still feels personal.',
    intro: 'Bridal makeup has to survive emotion, lighting, photos, and close-up moments. The safest path is structured softness: long-wear skin, defined eyes, and a lip that will not disappear on camera.',
    image: '/images/hero/look-champagne-gala.webp',
    tryOnScenario: 'photo',
    tryOnLook: 'champagne-gala',
    steps: [
      'Use thin layers and set only the areas that crease or shine quickly.',
      'Add eye depth gradually, keeping the center of the lid clean and bright.',
      'Choose a lip shade with enough weight for photos but enough softness for close-up moments.',
      'Run a full try-on before the event and save the final kit.',
    ],
    avoid: ['Untested products on the day', 'Flashback from heavy powder', 'A lip color too pale for photography'],
    bestFor: ['Brides', 'Bridal trials', 'Engagement photos', 'Long-wear soft glam'],
    decisionGuide: [
      { label: 'If photos are the priority', detail: 'Increase lip weight and brow definition while keeping base thin.' },
      { label: 'If the event is emotional', detail: 'Choose long-wear eye products and avoid untested cream layers.' },
      { label: 'If the dress is minimal', detail: 'Let skin and lip carry polish rather than heavy eye color.' },
    ],
    productPriorities: ['Long-wear primer', 'Flexible concealer', 'Neutral sculpt shade', 'Photo-safe powder', 'Rosewood lip'],
    relatedLinks: [
      { label: 'Flash-proof Fresh tutorial', href: '/tutorials/flash-proof' },
      { label: 'Photo-ready makeup guide', href: '/scenarios/photo-ready-makeup' },
      { label: 'Try bridal AI look', href: '/try-on?scenario=photo&look=champagne-gala' },
    ],
  },
  {
    slug: 'wedding-guest-makeup',
    title: 'Wedding Guest Makeup Guide',
    description: 'A wedding guest makeup guide for polished photos, comfortable wear, and color that supports your outfit without competing.',
    eyebrow: 'Wedding Guest Makeup',
    headline: 'Look polished in photos without looking like you are in the bridal party.',
    intro: 'Wedding guest makeup should be durable, flattering, and respectful of the event. The right look has more structure than daily makeup but less drama than bridal glam.',
    image: '/images/hero/look-wedding-guest.webp',
    tryOnScenario: 'photo',
    tryOnLook: 'wedding-guest',
    steps: [
      'Balance outfit color with a lip family that does not fight the fabric.',
      'Use semi-matte skin so photos stay clean through long indoor light.',
      'Build eye shape with brown or taupe before adding shimmer.',
      'Carry one lip product and one powder touch-up for the event.',
    ],
    avoid: ['Bridal-level white shimmer', 'A lip color that clashes with the outfit', 'Foundation that has not been flash-tested'],
    bestFor: ['Wedding guests', 'Evening receptions', 'Family photos', 'Long event days'],
    decisionGuide: [
      { label: 'If your outfit is bright', detail: 'Keep the lip muted and let blush connect the face to the outfit.' },
      { label: 'If your outfit is neutral', detail: 'Use rosewood, berry, or soft red to avoid looking washed out.' },
      { label: 'If there will be flash', detail: 'Skip heavy shimmer and use a semi-matte anchor lip.' },
    ],
    productPriorities: ['Semi-matte base', 'Soft sculpt shade', 'Brown liner', 'Rosewood lipstick', 'Blot powder'],
    relatedLinks: [
      { label: 'Flash-proof Fresh tutorial', href: '/tutorials/flash-proof' },
      { label: 'Deep skin lipstick shades', href: '/lipstick-shades/deep-skin-lipstick-shades' },
      { label: 'Bridal makeup guide', href: '/scenarios/bridal-makeup' },
    ],
  },
  {
    slug: 'zoom-meeting-makeup',
    title: 'Zoom Meeting Makeup Guide',
    description: 'A video-call makeup routine for clearer features, controlled shine, and natural color under webcam lighting.',
    eyebrow: 'Zoom Makeup',
    headline: 'Use less makeup in real life and more structure where the camera needs it.',
    intro: 'Webcams flatten the face and exaggerate shine. A good Zoom routine puts definition at the brow, lash root, under-eye, and lip while keeping everything else thin.',
    image: '/images/hero/look-creator-camera-glow.webp',
    tryOnScenario: 'photo',
    tryOnLook: 'creator-camera-glow',
    steps: [
      'Correct under-eye and mouth-corner shadows first.',
      'Groom brows and press color into the upper lash root.',
      'Use a lip shade one step stronger than your bare lip.',
      'Powder only the center of the forehead, nose, and chin.',
    ],
    avoid: ['Pale beige lips', 'Too much shimmer near the camera', 'Skipping brows because they look fine in the mirror'],
    bestFor: ['Remote meetings', 'Webinars', 'Online interviews', 'Creators recording talking-head videos'],
    decisionGuide: [
      { label: 'If you look washed out', detail: 'Raise lip saturation before adding eye makeup.' },
      { label: 'If the face looks wide', detail: 'Add brow peak and outer lash definition to pull attention upward.' },
      { label: 'If the forehead shines', detail: 'Use powder only in the center so skin does not look dry.' },
    ],
    productPriorities: ['Peach corrector', 'Brow gel', 'Brown mascara', 'Rose-brown lip', 'Transparent powder'],
    relatedLinks: [
      { label: 'Office Glow tutorial', href: '/tutorials/office-glow' },
      { label: 'Interview makeup guide', href: '/scenarios/interview-makeup' },
      { label: 'Try video-call look', href: '/try-on?scenario=photo&look=creator-camera-glow' },
    ],
  },
  {
    slug: 'everyday-natural-makeup',
    title: 'Everyday Natural Makeup Guide',
    description: 'A natural everyday makeup guide for breathable skin, easy lip-cheek harmony, and repeatable beginner-safe steps.',
    eyebrow: 'Everyday Natural',
    headline: 'Look like yourself on a better-skin day.',
    intro: 'Natural makeup fails when it becomes a full routine pretending to be simple. The best daily version uses fewer products, better placement, and color harmony.',
    image: '/images/hero/look-soft-matte-everyday.webp',
    tryOnScenario: 'office',
    tryOnLook: 'soft-matte-everyday',
    steps: [
      'Spot-conceal instead of covering the whole face.',
      'Use one lip-cheek color so the face reads calm.',
      'Choose brown mascara or brow gel if black feels too visible.',
      'Stop when the first impression is fresh, not finished.',
    ],
    avoid: ['Too many small steps', 'Blush dragged low', 'Full matte base for a natural look'],
    bestFor: ['Daily errands', 'School-safe polish', 'First makeup routines', 'People who dislike heavy base'],
    decisionGuide: [
      { label: 'If you are a beginner', detail: 'Start with concealer, lip-cheek tint, brows, and mascara only.' },
      { label: 'If blush looks obvious', detail: 'Move placement higher and choose a lower-saturation shade.' },
      { label: 'If the base feels heavy', detail: 'Use less base and more targeted correction.' },
    ],
    productPriorities: ['Spot concealer', 'Cream blush', 'Tinted balm', 'Brow mascara', 'Lightweight setting mist'],
    relatedLinks: [
      { label: 'Fresh Minimal tutorial', href: '/tutorials/fresh-minimal' },
      { label: 'Fair skin lipstick shades', href: '/lipstick-shades/fair-skin-lipstick-shades' },
      { label: 'Beginner makeup guide', href: '/scenarios/beginner-makeup' },
    ],
  },
  {
    slug: 'beginner-makeup',
    title: 'Beginner Makeup Guide',
    description: 'A beginner makeup guide that reduces product confusion and gives a simple order for base, brows, lips, and cheeks.',
    eyebrow: 'Beginner Makeup',
    headline: 'Start with the four steps that change the face most.',
    intro: 'Beginners usually buy too many products and lose control of the result. A better first routine focuses on correction, brow shape, lip-cheek color, and one eye-defining step.',
    image: '/images/hero/look-five-minute-beginner.webp',
    tryOnScenario: 'office',
    tryOnLook: 'five-minute-beginner',
    steps: [
      'Pick one problem to correct instead of trying to perfect the whole face.',
      'Use brow gel or a fine pencil before buying eye palettes.',
      'Choose a lip color that can also guide blush placement.',
      'Practice the same routine for one week before adding new products.',
    ],
    avoid: ['Buying a full kit at once', 'Using black liner before learning lash-root placement', 'Changing every product after one bad attempt'],
    bestFor: ['Complete beginners', 'People restarting makeup', 'Minimal product budgets', 'Anyone overwhelmed by tutorials'],
    decisionGuide: [
      { label: 'If you only buy three things', detail: 'Buy concealer, lip-cheek color, and brow product first.' },
      { label: 'If tutorials feel too fast', detail: 'Ignore eyeshadow until base, brow, and lip balance feel repeatable.' },
      { label: 'If the result looks wrong', detail: 'Check placement before blaming the product color.' },
    ],
    productPriorities: ['Concealer', 'Lip-cheek tint', 'Brow pencil', 'Brown mascara', 'Sheer powder'],
    relatedLinks: [
      { label: 'Fresh Minimal tutorial', href: '/tutorials/fresh-minimal' },
      { label: 'Shade Finder tool', href: '/tools/shade-finder' },
      { label: 'Everyday natural makeup guide', href: '/scenarios/everyday-natural-makeup' },
    ],
  },
  {
    slug: 'photo-ready-makeup',
    title: 'Photo-Ready Makeup Guide',
    description: 'A photo-ready makeup guide for sharper brows, better lip presence, controlled glow, and natural-looking camera definition.',
    eyebrow: 'Photo Makeup',
    headline: 'Give the camera structure without making real life look heavy.',
    intro: 'Cameras reduce detail. Photo-ready makeup needs slightly more brow, lash, lip, and cheekbone structure, while the base stays thin enough to look believable.',
    image: '/images/hero/look-flash-proof-satin.webp',
    tryOnScenario: 'photo',
    tryOnLook: 'flash-proof-satin',
    steps: [
      'Even the skin tone but leave real texture visible.',
      'Strengthen brow peak and lash root so the face has a frame.',
      'Use highlight only on structural high points.',
      'Choose a lip shade that does not disappear under camera exposure.',
    ],
    avoid: ['Full-coverage mask base', 'Blocky brows', 'Pale nude lips in photos'],
    bestFor: ['Profile photos', 'Creator content', 'Family photos', 'Headshots that still feel natural'],
    decisionGuide: [
      { label: 'If selfies look flat', detail: 'Add structure at brows, lash root, cheekbone, and lip before adding color.' },
      { label: 'If pores show too much', detail: 'Use less shimmer and a finer highlight texture.' },
      { label: 'If lips disappear', detail: 'Move from beige nude to rosewood, berry, or soft brick.' },
    ],
    productPriorities: ['Second-skin foundation', 'Brow pencil', 'Fine highlighter', 'Lip pencil', 'Setting mist'],
    relatedLinks: [
      { label: 'Camera Glow tutorial', href: '/tutorials/camera-glow' },
      { label: 'Neutral undertone lipstick shades', href: '/lipstick-shades/neutral-undertone-lipstick-shades' },
      { label: 'Try photo AI look', href: '/try-on?scenario=photo&look=flash-proof-satin' },
    ],
  },
  {
    slug: 'evening-event-makeup',
    title: 'Evening Event Makeup Guide',
    description: 'An evening event makeup guide for low-light definition, longer wear, and lip color that anchors the face.',
    eyebrow: 'Evening Event',
    headline: 'Add presence for low light while keeping edges controlled.',
    intro: 'Evening makeup needs more contrast than daytime makeup, but not more product everywhere. The best event look deepens the outer eye, anchors the lip, and controls shine.',
    image: '/images/hero/look-burgundy-velvet.webp',
    tryOnScenario: 'photo',
    tryOnLook: 'burgundy-velvet',
    steps: [
      'Deepen the outer third of the eye instead of darkening the whole lid.',
      'Use a lip shade with enough weight to hold the face in low light.',
      'Keep highlight narrow and avoid shimmer on textured areas.',
      'Set mobile areas such as under-eye, nose, and mouth corners.',
    ],
    avoid: ['Dark color around the entire eye', 'Cool eye paired with orange lip', 'Wide highlight across pores'],
    bestFor: ['Dinners', 'Parties', 'Low-light venues', 'People who want more presence than daily makeup'],
    decisionGuide: [
      { label: 'If the venue is dim', detail: 'Increase lip and lash-root contrast before adding shimmer.' },
      { label: 'If your outfit is dark', detail: 'Use a lip with enough saturation to avoid looking tired.' },
      { label: 'If your skin has texture', detail: 'Keep glow strategic and avoid highlight on the apple of the cheek.' },
    ],
    productPriorities: ['Mauve or brown shadow', 'Lip pencil', 'Soft matte lipstick', 'Setting powder', 'Controlled highlighter'],
    relatedLinks: [
      { label: 'Night Mauve Focus tutorial', href: '/tutorials/night-mauve' },
      { label: 'Date night makeup guide', href: '/scenarios/date-night-makeup' },
      { label: 'Tan skin lipstick shades', href: '/lipstick-shades/tan-skin-lipstick-shades' },
    ],
  },
  {
    slug: 'mature-skin-makeup',
    title: 'Mature Skin Makeup Guide',
    description: 'A mature skin makeup guide focused on thin layers, lifted placement, softened powder, and color that restores life without heaviness.',
    eyebrow: 'Mature Skin',
    headline: 'Use thinner layers, higher placement, and softer edges.',
    intro: 'Mature skin usually looks best when makeup adds light and structure without collecting in texture. Placement matters more than coverage.',
    image: '/images/hero/look-mature-skin-radiance.webp',
    tryOnScenario: 'office',
    tryOnLook: 'mature-skin-radiance',
    steps: [
      'Use hydrating prep and thin base layers instead of full coverage.',
      'Place blush slightly higher to lift the face visually.',
      'Use soft brown definition rather than hard black liner.',
      'Choose lip color with life, but avoid dry formulas that emphasize lines.',
    ],
    avoid: ['Matte full-coverage base', 'Powder across the whole face', 'Dark hard lip lines'],
    bestFor: ['Mature skin', 'Dry texture', 'Soft lifting makeup', 'Professional daily routines'],
    decisionGuide: [
      { label: 'If base settles in lines', detail: 'Reduce foundation and correct only uneven zones.' },
      { label: 'If cheeks look low', detail: 'Move blush higher and keep it soft at the edge.' },
      { label: 'If lips look smaller', detail: 'Use a creamy rosewood or berry-brown with softened edges.' },
    ],
    productPriorities: ['Hydrating primer', 'Flexible concealer', 'Cream blush', 'Soft brown liner', 'Cream lipstick'],
    relatedLinks: [
      { label: 'Quiet Luxury Taupe tutorial', href: '/tutorials/quiet-luxury' },
      { label: 'Medium skin lipstick shades', href: '/lipstick-shades/medium-skin-lipstick-shades' },
      { label: 'Office makeup guide', href: '/scenarios/office-makeup' },
    ],
  },
  {
    slug: 'hooded-eyes-makeup',
    title: 'Hooded Eyes Makeup Guide',
    description: 'A hooded eyes makeup guide for visible structure, lifted lash definition, and eyeshadow placement that works when eyes are open.',
    eyebrow: 'Hooded Eyes',
    headline: 'Place the structure where open eyes can actually see it.',
    intro: 'Hooded eyes often lose eyeshadow when the eyes open. The solution is not more shadow, but higher placement, lash-root definition, and controlled outer lift.',
    image: '/images/hero/look-hooded-eyes-lift.webp',
    tryOnScenario: 'office',
    tryOnLook: 'hooded-eyes-lift',
    steps: [
      'Map the socket with eyes open before applying depth.',
      'Keep dark color on the outer third and close to the lash root.',
      'Use small upward lift at the outer corner instead of a thick wing.',
      'Brighten the inner eye carefully without spreading shimmer too wide.',
    ],
    avoid: ['Following closed-eye crease tutorials', 'Thick liner that eats lid space', 'Large shimmer blocks above the fold'],
    bestFor: ['Hooded eyelids', 'Monolid-adjacent eye shapes', 'Soft lifted eye looks', 'People whose shadow disappears'],
    decisionGuide: [
      { label: 'If shadow disappears', detail: 'Place transition color slightly above the natural fold with eyes open.' },
      { label: 'If liner makes eyes smaller', detail: 'Use tight lash-root color and lift the outer third only.' },
      { label: 'If shimmer transfers', detail: 'Keep shimmer near the inner lid or center, not across the fold.' },
    ],
    productPriorities: ['Matte taupe shadow', 'Brown gel liner', 'Lengthening mascara', 'Small detail brush', 'Soft rose lip'],
    relatedLinks: [
      { label: 'Night Mauve Focus tutorial', href: '/tutorials/night-mauve' },
      { label: 'Olive skin lipstick shades', href: '/lipstick-shades/olive-skin-lipstick-shades' },
      { label: 'Try hooded eyes look', href: '/try-on?scenario=office&look=hooded-eyes-lift' },
    ],
  },
];

type ScenarioPageEnrichment = Pick<ScenarioPage, 'timeRequired' | 'commonMistakes' | 'routine' | 'faqs'>;

const scenarioEnrichmentBySlug: Record<string, ScenarioPageEnrichment> = {
  'office-makeup': {
    timeRequired: {
      quick: '5-7 minutes for concealer, brows, lashes, cheek color, and lip.',
      full: '12-15 minutes when you include skin prep, base correction, and light setting.',
      touchUp: '60 seconds: blot the center of the face, refresh lip, and brush brows back into place.',
    },
    commonMistakes: [
      { mistake: 'Using a full glam base to look more professional.', fix: 'Keep coverage thin and correct only tired-looking shadows so skin still moves in daylight.' },
      { mistake: 'Choosing beige nude lipstick that erases the mouth on video calls.', fix: 'Use muted rose, rose-brown, or soft brick one step deeper than your bare lip.' },
      { mistake: 'Skipping brows because the eye makeup is minimal.', fix: 'Add brow structure first; it frames the face more quietly than extra eyeshadow.' },
    ],
    routine: [
      { label: 'Before work', items: ['Moisturize and let sunscreen settle before base.', 'Spot-correct under-eye, nose wings, and mouth corners.', 'Choose one lip-cheek color family before applying blush.'] },
      { label: 'Day-of touch-up', items: ['Blot before powder so the base does not cake.', 'Reapply lip from the center outward for a softer office edge.', 'Check the face under the same light used for calls.'] },
    ],
    faqs: [
      { question: 'What is the safest office makeup color family?', answer: 'Muted rose, rose-brown, taupe, and soft brown usually look polished without becoming distracting in workplace light.' },
      { question: 'Should office makeup be matte or dewy?', answer: 'Use a satin finish: controlled shine through the T-zone with a little freshness on the cheeks so the face does not look flat.' },
    ],
  },
  'interview-makeup': {
    timeRequired: {
      quick: '7-10 minutes if you focus on under-eye correction, brows, lashes, blush, and lip.',
      full: '18-22 minutes for skin prep, balanced base, soft eye structure, and camera checks.',
      touchUp: '2 minutes before the interview: powder shine, clean lip edges, and comb brows.',
    },
    commonMistakes: [
      { mistake: 'Trying a new statement look on the interview day.', fix: 'Use familiar formulas and add confidence through cleaner placement, not stronger color.' },
      { mistake: 'Applying too much shimmer near the eyes.', fix: 'Use matte taupe or soft brown to create definition that reads calm on camera.' },
      { mistake: 'Leaving the lip too pale under webcam exposure.', fix: 'Choose rose-brown or muted nude with enough depth to define the mouth while speaking.' },
    ],
    routine: [
      { label: 'Night before', items: ['Lay out only the products you know wear well.', 'Avoid new exfoliants or masks that may cause redness.', 'Test the lip color in the lighting where the interview will happen.'] },
      { label: 'Interview day', items: ['Start earlier than usual so base layers can settle.', 'Take one phone photo or camera preview before adding more product.', 'Keep blotting paper and lip color nearby for the final check.'] },
    ],
    faqs: [
      { question: 'Is red lipstick okay for an interview?', answer: 'A red can work in creative settings, but muted rose, rose-brown, or soft nude is safer when you want the conversation to stay on your answers.' },
      { question: 'How much eye makeup is best for an interview?', answer: 'Use enough brow, lash-root, and socket definition for clarity, but avoid smoky depth that changes your expression.' },
    ],
  },
  'date-night-makeup': {
    timeRequired: {
      quick: '8-10 minutes for breathable base, blush, lashes, soft lip, and highlight.',
      full: '20-25 minutes when adding outer-corner depth, perfected skin, and longer-wear lip prep.',
      touchUp: '90 seconds: soften lip edges, tap blush back high on the cheek, and remove excess shine.',
    },
    commonMistakes: [
      { mistake: 'Making the lip and cheek unrelated.', fix: 'Pick the lip first, then choose blush from the same rose, berry, peach, or mauve family.' },
      { mistake: 'Over-highlighting for candlelight.', fix: 'Keep glow small and smooth on cheekbones rather than across texture or pores.' },
      { mistake: 'Using a hard lip line for a soft date look.', fix: 'Blur the outer edge with a fingertip or brush while keeping color concentrated at the center.' },
    ],
    routine: [
      { label: 'Before the date', items: ['Prep lips early with balm, then blot before color.', 'Apply base in thin layers so skin looks close-up friendly.', 'Check blush placement from conversational distance, not just close mirror distance.'] },
      { label: 'During the date', items: ['Carry the lip product rather than the whole kit.', 'Press, do not rub, when blotting around the mouth.', 'Refresh only the lip center if you want the look to stay soft.'] },
    ],
    faqs: [
      { question: 'What makeup looks best for a dinner date?', answer: 'Soft skin, lifted blush, clean lashes, and a lip-cheek color family with slightly more depth than daytime makeup usually works best.' },
      { question: 'Should date-night makeup be glossy?', answer: 'Gloss can look fresh, but satin or balm textures are easier to maintain if you want the lip to survive food and drinks.' },
    ],
  },
  'bridal-makeup': {
    timeRequired: {
      quick: '25-30 minutes only for a simplified civil ceremony or trial refresh.',
      full: '60-90 minutes including skin prep, layered base, eye definition, lashes, lip, and photography checks.',
      touchUp: '3-5 minutes between ceremony and photos for tears, lip, powder, and cheek balance.',
    },
    commonMistakes: [
      { mistake: 'Choosing a lip that looks pretty in person but disappears in photos.', fix: 'Test the shade under camera exposure and choose rosewood, soft berry, or deeper nude if needed.' },
      { mistake: 'Adding powder everywhere for longevity.', fix: 'Set only mobile or shiny zones and keep the perimeter flexible so skin still looks alive.' },
      { mistake: 'Skipping a full wear test.', fix: 'Run a trial with similar lighting, tears, food, and several hours of wear before the event.' },
    ],
    routine: [
      { label: 'Before the wedding', items: ['Do a full trial and photograph it in daylight, indoor light, and flash.', 'Avoid new skincare actives during the final week.', 'Create a touch-up kit with lip, powder, cotton swabs, and lash glue if needed.'] },
      { label: 'Wedding day', items: ['Give each cream layer time to set before powder.', 'Use waterproof eye products where tears are likely.', 'Touch up lips before portraits, speeches, and evening photos.'] },
    ],
    faqs: [
      { question: 'How do I make bridal makeup last all day?', answer: 'Use thin layers, targeted setting, long-wear eye products, and a planned touch-up kit instead of relying on one heavy layer.' },
      { question: 'What bridal lip color photographs best?', answer: 'Rosewood, muted berry, balanced rose, and deeper nude shades usually photograph better than very pale beige or clear gloss alone.' },
    ],
  },
  'wedding-guest-makeup': {
    timeRequired: {
      quick: '12-15 minutes for base balance, brows, lashes, blush, and a photo-safe lip.',
      full: '30-40 minutes for long-wear skin, eye shape, outfit color matching, and flash checks.',
      touchUp: '2 minutes after dinner: blot, refresh lip, and soften any creasing around the nose.',
    },
    commonMistakes: [
      { mistake: 'Matching makeup too literally to the outfit.', fix: 'Echo the outfit temperature while keeping lip and cheek wearable on your skin tone.' },
      { mistake: 'Using bridal-level shimmer.', fix: 'Choose satin glow or fine highlight so you look polished without competing with the bride.' },
      { mistake: 'Forgetting flash photography.', fix: 'Avoid SPF-heavy white cast, chunky shimmer, and untested powder before the event.' },
    ],
    routine: [
      { label: 'Before the event', items: ['Test the lip next to the outfit color.', 'Photograph the base with flash if evening photos are likely.', 'Pack blot powder and the exact lip product used.'] },
      { label: 'At the reception', items: ['Blot before reapplying powder.', 'Refresh lipstick before group photos.', 'Clean under-eye fallout gently instead of layering concealer.'] },
    ],
    faqs: [
      { question: 'Can a wedding guest wear bold lipstick?', answer: 'Yes, if the rest of the look stays polished and the shade supports your outfit rather than becoming the entire focus.' },
      { question: 'What makeup should wedding guests avoid?', answer: 'Avoid bridal-white shimmer, untested base products, and lip colors that clash strongly with the outfit in photos.' },
    ],
  },
  'zoom-meeting-makeup': {
    timeRequired: {
      quick: '4-6 minutes for under-eye correction, brows, lashes, lip, and center-face powder.',
      full: '10-14 minutes when you add base balance, blush placement, and camera lighting checks.',
      touchUp: '30-45 seconds before joining: powder shine, deepen lip if needed, and lift brows.',
    },
    commonMistakes: [
      { mistake: 'Applying makeup based only on the mirror.', fix: 'Check the actual webcam preview because cameras flatten color and exaggerate shine.' },
      { mistake: 'Using pale nude lip color.', fix: 'Choose a lip one step stronger than your bare lip so your mouth stays clear while speaking.' },
      { mistake: 'Putting shimmer close to the camera.', fix: 'Keep highlight minimal and powder only the center of the face.' },
    ],
    routine: [
      { label: 'Before the call', items: ['Turn on the same light you will use during the meeting.', 'Correct shadows around eyes and mouth before adding blush.', 'Check whether brows and lips are visible in the preview window.'] },
      { label: 'Between calls', items: ['Blot forehead and nose rather than adding layers.', 'Refresh lip if the camera washes you out.', 'Move closer to soft front light before changing the makeup.'] },
    ],
    faqs: [
      { question: 'Why do I look washed out on Zoom?', answer: 'Webcam exposure reduces contrast, so brows, lash roots, cheeks, and lips often need slightly more structure than they do in person.' },
      { question: 'Do I need foundation for video calls?', answer: 'Usually no. Targeted concealer, controlled shine, and stronger facial framing matter more than full foundation.' },
    ],
  },
  'everyday-natural-makeup': {
    timeRequired: {
      quick: '3-5 minutes with concealer, lip-cheek tint, brows, and mascara.',
      full: '8-12 minutes when you add skin prep, light setting, and refined placement.',
      touchUp: '30 seconds: tap balm or tint on lips, blend cheek edges, and brush brows.',
    },
    commonMistakes: [
      { mistake: 'Using too many products for a natural look.', fix: 'Keep the routine to a few high-impact steps and repeat the same placement daily.' },
      { mistake: 'Covering the whole face because one area is uneven.', fix: 'Spot-correct only the area that needs help and leave good skin bare.' },
      { mistake: 'Dragging blush too low.', fix: 'Place color higher and softer so the face looks fresh instead of heavy.' },
    ],
    routine: [
      { label: 'Morning', items: ['Start with hydrated skin so sheer products blend quickly.', 'Use one tint to connect lips and cheeks.', 'Stop before the makeup looks finished; natural makeup should still show skin.'] },
      { label: 'Later in the day', items: ['Refresh tinted balm instead of rebuilding the base.', 'Mist or tap moisturizer on dry patches before adding concealer.', 'Remove mascara smudges before adding more eye product.'] },
    ],
    faqs: [
      { question: 'What are the only products I need for everyday natural makeup?', answer: 'Most people can start with concealer, lip-cheek tint, brow gel or pencil, mascara, and a light powder or mist.' },
      { question: 'How do I keep natural makeup from looking dull?', answer: 'Use a coordinated lip-cheek color and avoid over-powdering the cheeks so the face keeps dimension.' },
    ],
  },
  'beginner-makeup': {
    timeRequired: {
      quick: '5 minutes for a starter routine: concealer, brows, lip-cheek tint, and mascara.',
      full: '15-20 minutes while learning placement and correcting mistakes slowly.',
      touchUp: '1 minute: blend edges, clean mascara, and reapply lip-cheek color lightly.',
    },
    commonMistakes: [
      { mistake: 'Buying every product before understanding placement.', fix: 'Master concealer, brows, lip-cheek color, and lashes before adding palettes or contour.' },
      { mistake: 'Changing the whole routine after one bad try.', fix: 'Repeat the same simple routine for a week and adjust one variable at a time.' },
      { mistake: 'Using black liner too early.', fix: 'Start with brown mascara or tight lash-root color because it is easier to control.' },
    ],
    routine: [
      { label: 'Practice routine', items: ['Apply makeup when you are not rushed so you can learn your face.', 'Take one photo in daylight to see placement objectively.', 'Write down the product order that gave the cleanest result.'] },
      { label: 'Day-of routine', items: ['Use only products you have practiced with.', 'Keep cotton swabs nearby for mascara or lip cleanup.', 'Stop at four steps if the result already looks fresher.'] },
    ],
    faqs: [
      { question: 'What makeup should a beginner buy first?', answer: 'Start with concealer, a lip-cheek tint, brow product, mascara, and a sheer powder if you get shiny.' },
      { question: 'Should beginners learn contour?', answer: 'Not first. Brow shape, base correction, blush placement, and lip balance change the face more predictably.' },
    ],
  },
  'photo-ready-makeup': {
    timeRequired: {
      quick: '10-12 minutes for brows, lip, cheek structure, under-eye correction, and powder control.',
      full: '25-35 minutes including base testing, eye definition, controlled highlight, and camera checks.',
      touchUp: '2 minutes before photos: blot, re-edge lips, fix under-eye creasing, and check symmetry.',
    },
    commonMistakes: [
      { mistake: 'Using heavy coverage to look better in photos.', fix: 'Keep base thin and add structure with brows, lashes, cheeks, and lip instead.' },
      { mistake: 'Choosing a lip that disappears under exposure.', fix: 'Pick a shade with enough rosewood, berry, brick, or brown depth for the camera.' },
      { mistake: 'Highlighting textured areas.', fix: 'Keep highlight fine and narrow on structural high points only.' },
    ],
    routine: [
      { label: 'Before photos', items: ['Test the look with the same camera or phone if possible.', 'Check whether the lip and brows remain visible from a few feet away.', 'Use powder only where shine becomes distracting.'] },
      { label: 'On set or before shooting', items: ['Blot before every powder touch-up.', 'Reapply lip pencil if the edge fades.', 'Look at a test shot before adding more shimmer or coverage.'] },
    ],
    faqs: [
      { question: 'What makeup makes photos look better?', answer: 'Visible brows, clean lash roots, balanced cheeks, a defined lip, and controlled shine usually matter more than heavy foundation.' },
      { question: 'How do I avoid flashback?', answer: 'Avoid untested SPF-heavy base, excessive pale powder, and chunky highlight; test with flash before the event if possible.' },
    ],
  },
  'evening-event-makeup': {
    timeRequired: {
      quick: '12-15 minutes for outer-eye depth, lip anchor, blush, and shine control.',
      full: '30-45 minutes for long-wear base, layered eye shape, lip lining, and event lighting checks.',
      touchUp: '2 minutes: reapply lip, blot center-face shine, and blend any crease near the outer eye.',
    },
    commonMistakes: [
      { mistake: 'Darkening the whole eye for evening impact.', fix: 'Keep depth on the outer third and lash root so the eyes stay lifted.' },
      { mistake: 'Pairing a cool eye with an orange lip by accident.', fix: 'Choose one color temperature and keep eye, cheek, and lip families connected.' },
      { mistake: 'Using wide highlight in low light.', fix: 'Use narrow glow and let lip depth create the main event presence.' },
    ],
    routine: [
      { label: 'Before the event', items: ['Decide whether the lip or eye will be the anchor.', 'Prime areas that crease or shine rather than the entire face heavily.', 'Check the look in lower light before adding more dark shadow.'] },
      { label: 'During the event', items: ['Touch up lipstick before photos and after food.', 'Blot the nose and chin without flattening cheek glow.', 'Use a clean fingertip to soften outer-eye creasing if needed.'] },
    ],
    faqs: [
      { question: 'How do I make evening makeup look elegant, not heavy?', answer: 'Add contrast selectively: outer eye, lash root, lip, and cheekbone. Leave the base thinner than you think.' },
      { question: 'What lipstick works for evening events?', answer: 'Rosewood, muted berry, soft brick, plum-brown, and satin deep nude shades hold the face well in dim light.' },
    ],
  },
  'mature-skin-makeup': {
    timeRequired: {
      quick: '7-10 minutes for hydration, targeted concealer, lifted blush, soft liner, and creamy lip.',
      full: '20-30 minutes when you include skin prep, thin base layers, brow refinement, and careful setting.',
      touchUp: '1-2 minutes: press away creasing, add lip moisture, and refresh blush high on the cheek.',
    },
    commonMistakes: [
      { mistake: 'Using matte full coverage to hide texture.', fix: 'Use flexible thin layers and correct only uneven areas so skin looks smoother in motion.' },
      { mistake: 'Powdering the whole face.', fix: 'Set only crease-prone or shiny zones and leave cheeks softly radiant.' },
      { mistake: 'Keeping blush too low.', fix: 'Place blush slightly higher and blend upward for a more lifted effect.' },
    ],
    routine: [
      { label: 'Before makeup', items: ['Give moisturizer time to settle before base.', 'Use less foundation than usual and add concealer only where needed.', 'Choose cream or satin textures for cheeks and lips.'] },
      { label: 'During wear', items: ['Press creasing smooth before adding more product.', 'Refresh lips with creamy color rather than dry matte layers.', 'Use a small brush for powder only where shine distracts.'] },
    ],
    faqs: [
      { question: 'What foundation finish is best for mature skin?', answer: 'Flexible satin or natural finishes usually look smoother than flat matte or very shiny textures.' },
      { question: 'Should mature skin avoid shimmer?', answer: 'Not completely. Use fine glow on smooth high points and avoid chunky shimmer on textured areas.' },
    ],
  },
  'hooded-eyes-makeup': {
    timeRequired: {
      quick: '6-8 minutes for eyes-open mapping, lash-root liner, mascara, blush, and lip.',
      full: '18-25 minutes for primer, socket placement, outer-corner lift, detail blending, and transfer checks.',
      touchUp: '1 minute: clean transfer, reinforce the outer third, and curl lashes if needed.',
    },
    commonMistakes: [
      { mistake: 'Following crease placement with eyes closed.', fix: 'Map shadow with eyes open so the structure remains visible.' },
      { mistake: 'Using thick liner across the whole lid.', fix: 'Keep liner tight at the lash root and lift only the outer third.' },
      { mistake: 'Putting shimmer across the fold.', fix: 'Concentrate shimmer on the inner or center lid where it will not transfer as easily.' },
    ],
    routine: [
      { label: 'Before applying shadow', items: ['Prime the lid lightly and set only where transfer happens.', 'Look straight ahead and mark the visible socket zone.', 'Use small brushes so color stays controlled.'] },
      { label: 'After a few hours', items: ['Check for transfer above the fold.', 'Clean smudges before adding more liner.', 'Refresh mascara at the outer lashes only if the eye needs lift.'] },
    ],
    faqs: [
      { question: 'Where should eyeshadow go on hooded eyes?', answer: 'Place transition and depth slightly above the natural fold while looking straight ahead, then keep darker color near the outer lash root.' },
      { question: 'Is winged liner good for hooded eyes?', answer: 'A small outer lift or tightline is usually easier than a thick wing because it preserves visible lid space.' },
    ],
  },
};

export const scenarioPages: ScenarioPage[] = baseScenarioPages.map((page) => {
  const enrichment = scenarioEnrichmentBySlug[page.slug];

  if (!enrichment) {
    throw new Error(`Missing scenario enrichment for ${page.slug}`);
  }

  return {
    ...page,
    ...enrichment,
  };
});
