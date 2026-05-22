// P0.1: locale-aware mock data
// EN is the default user-facing copy. ZH retained for /zh route or AI prompt overrides.

export type Locale = 'en' | 'zh';

export interface TryOnProduct {
  sku: string;
  name: string;
  category: string;
  shade: string;
  price: string;
  why: string;
}

export interface TryOnStep {
  title: string;
  detail: string;
  avoid: string;
  selfCheck: string;
}

export interface TryOnLook {
  id: string;
  name: string;
  reason: string;
  scenario: string;
  difficulty: string;
  minutes: string;
  focus: string;
  finish: string;
  tutorialHeadline: string;
  tutorialSteps: TryOnStep[];
  commonMistakes: string[];
  selfChecks: string[];
  kit: {
    mustHave: TryOnProduct[];
    optional: TryOnProduct[];
    upgrade: TryOnProduct[];
  };
}

export interface TryOnPlan {
  diagnosis: {
    title: string;
    summary: string;
    faceNotes: string[];
  };
  looks: TryOnLook[];
  shareCard: {
    title: string;
    subtitle: string;
    badge: string;
    hashtags: string[];
    cta: string;
  };
}

const product = (
  sku: string,
  name: string,
  category: string,
  shade: string,
  price: string,
  why: string,
): TryOnProduct => ({ sku, name, category, shade, price, why });

const step = (title: string, detail: string, avoid: string, selfCheck: string): TryOnStep => ({
  title,
  detail,
  avoid,
  selfCheck,
});


// ─── EN catalog (default user-facing copy) ─────────────────────────────────
const planMapEn: Record<string, TryOnPlan> = {
  office: {
    diagnosis: {
      title: 'Warm-neutral undertone · Soft definition fit',
      summary: 'Your features suit low-intensity, structured looks. The goal is freshness and clarity, not heavy color.',
      faceNotes: [
        'A sheer, luminous base flatters you more than full coverage',
        'Brow and lash structure matters more than bold color',
        'Matching lip and cheek tones makes the look feel polished, not painted',
      ],
    },
    looks: [
      {
        id: 'office-glow',
        name: 'Office Glow',
        reason: 'Fastest way to look awake and put-together for commute and video calls.',
        scenario: 'Commute / Meeting',
        difficulty: 'Beginner',
        minutes: '8 min',
        focus: 'Complexion, brow-eye clarity',
        finish: 'Soft matte nude',
        tutorialHeadline: '8 minutes from bare-face to camera-ready office polish.',
        tutorialSteps: [
          step(
            'Sheer base, targeted concealer',
            'Float a thin layer of base, then concealer only under eyes, around the nose, and at the mouth corners.',
            "Don't paint the whole face one even tone — it flattens you.",
            'Step back from the mirror: skin looks even but you can still see real texture.',
          ),
          step(
            'Brow peak and lash root define the look',
            'Tidy the brow head-to-peak with a fine pencil, then press dark brown along the upper lash line.',
            "Don't drag the brow tail too far or rim the eye in black.",
            'Eyes closed: line is only at the root. Eyes open: brow-eye area reads sharper.',
          ),
          step(
            'Tiny highlight, precise placement',
            'Place highlight only under the eye triangle and the bridge of the nose. Small but exact.',
            "Don't shimmer the forehead, cheeks, and chin all at once.",
            'Front-on the face has dimension; from the side there are no obvious glitter patches.',
          ),
          step(
            'Nude-rose lip ties the look together',
            'Sheer lip first, then tap a touch onto the cheeks for an honest flush.',
            "Don't go saturated on the lip, and don't blush wide.",
            'Lip and mid-face read in the same family but the look still feels everyday.',
          ),
        ],
        commonMistakes: [
          'Heavy base makes the face look flat',
          'Long brow tails read aggressive',
          'Wide highlight reads as oily',
        ],
        selfChecks: [
          'Features look sharper on camera in meeting light',
          'Skin still feels real up close',
          'Lip is more alive than the bare lip but not stealing focus',
        ],
        kit: {
          mustHave: [
            product('sku-office-base', 'Skin Veil Tint', 'Sheer foundation', 'Neutral Linen', '$18', 'Commute calls for thin and even, not high-coverage mask.'),
            product('sku-office-brow', 'Precision Brow Pencil', 'Brow pencil', 'Soft Brown', '$12', 'Tidies the brow shape in seconds — instant polish.'),
            product('sku-office-lip', 'Rosy Nude Lip Cream', 'Lip color', 'Dusty Rose', '$16', 'A nude rose adds glow without committing to a "look".'),
          ],
          optional: [
            product('sku-office-shadow', 'Taupe Wash Mono', 'Single eyeshadow', 'Warm Taupe', '$11', 'A whisper of color in the socket for sharper days.'),
            product('sku-office-blush', 'Soft Flush Balm', 'Cream blush', 'Muted Petal', '$14', 'Lets you echo the lip color on the cheeks softly.'),
          ],
          upgrade: [
            product('sku-office-corrector', 'Under-eye Corrector Duo', 'Concealer palette', 'Peach + Neutral', '$24', 'For shadowy under-eyes that read tired on camera.'),
            product('sku-office-glow', 'Micro Glow Stick', 'Cream highlight', 'Champagne', '$22', 'Pinpoint highlight for video light.'),
          ],
        },
      },
      {
        id: 'quiet-luxury',
        name: 'Quiet Luxury Taupe',
        reason: 'For interviews and client meetings — sharp and capable, not heavy.',
        scenario: 'Interview / Client',
        difficulty: 'Intermediate',
        minutes: '12 min',
        focus: 'Bone structure, eye depth',
        finish: 'Champagne taupe',
        tutorialHeadline: 'Look composed and capable, without leaving "makeup" footprints.',
        tutorialSteps: [
          step(
            'Build the socket with taupe',
            'Sweep a soft taupe from the outer corner inward — sculpt, not smoke.',
            "Don't push the dark over the entire lid.",
            'Eyes open: dimension. Eyes closed: no obvious color block.',
          ),
          step(
            'Sharpen the lash root, not the eye line',
            'Stack a fine line at the lash root and groom the lashes — clean and crisp wins here.',
            "Don't draw a thick winged liner; it reads aggressive in interviews.",
            'Eyes feel more focused without looking "made up".',
          ),
          step(
            'Pinpoint highlight on the nose and cheekbone',
            'Highlight only at structural points, not across the face.',
            "Don't combine heavy contour and heavy highlight on the same day.",
            'Profile shows added structure; front-on has no glitter sheen.',
          ),
          step(
            'Bare-brown lip to anchor everything',
            'A muted brown nude finishes the look refined, never matronly.',
            "Don't pick a deep coffee shade — it tips into tired.",
            'Lip edges are clean and live in the same neutral taupe family as the eye.',
          ),
        ],
        commonMistakes: [
          'Going too dark with the taupe muddies the eye',
          'Heavy contour plus highlight ages the face',
          'Lip too saturated breaks the quiet-luxury feel',
        ],
        selfChecks: [
          'On camera you read capable, not stern',
          'Eyes feel focused, not "lined"',
          'Everything sits in the same taupe-neutral family',
        ],
        kit: {
          mustHave: [
            product('sku-quiet-shadow', 'Contour Taupe Quad', 'Eyeshadow palette', 'Taupe Edit', '$28', 'A taupe sculpt is the backbone of this look.'),
            product('sku-quiet-mascara', 'Root Lift Mascara', 'Mascara', 'Espresso', '$17', 'Better than thick liner for a refined presence.'),
            product('sku-quiet-lip', 'Velvet Nude Lipstick', 'Lipstick', 'Cashmere Brown', '$19', 'Low-saturation brown nudes carry the quiet-luxury vibe.'),
          ],
          optional: [
            product('sku-quiet-contour', 'Soft Sculpt Cream', 'Cream contour', 'Neutral Taupe', '$20', 'For flatter bone structure that needs definition.'),
            product('sku-quiet-browgel', 'Feather Brow Gel', 'Brow gel', 'Ash Brown', '$13', 'Adds hair-by-hair texture to the brow.'),
          ],
          upgrade: [
            product('sku-quiet-bright', 'Precision Brightener', 'Brightening pen', 'Vanilla Beige', '$23', 'Lifts under-eye shadows during long days.'),
            product('sku-quiet-setting', 'Blur Setting Mist', 'Setting mist', 'Soft Matte', '$21', 'Keeps the look composed through long meetings.'),
          ],
        },
      },
      {
        id: 'fresh-minimal',
        name: 'Fresh Minimal',
        reason: 'Lowest-risk look for first-timers — fewer steps, faster, hard to mess up.',
        scenario: 'Everyday / Beginner',
        difficulty: 'Beginner',
        minutes: '6 min',
        focus: 'Even skin, lip-cheek harmony',
        finish: 'Clean and natural',
        tutorialHeadline: 'Six minutes, four steps. Looks awake without effort.',
        tutorialSteps: [
          step(
            'Skip the full base, spot-conceal instead',
            'Cover only what bothers you. Let the rest of the skin be itself.',
            "Don't lay down full coverage and then chase imperfections.",
            'It looks like your skin had a good week, not like makeup.',
          ),
          step(
            'A whisper of blush for awake-face',
            'Sweep the cheekbone lightly, slightly higher than you think.',
            "Don't take the blush onto the nose or far across the face.",
            'When you smile your face lifts, no hot patch of color.',
          ),
          step(
            'Tinted lip balm pulls the mood together',
            'Press a thin layer, then tap the edges to soften.',
            "Don't aim for a sharp lip line — it fights the minimal look.",
            'Lips look healthy and live in the same family as the cheek.',
          ),
          step(
            'Tidy the edges and stop',
            'Clean under the eyes, around the nose and lip — no more product.',
            "Don't add another step at the last minute.",
            'First impression in the mirror is "fresh", not "made up".',
          ),
        ],
        commonMistakes: [
          'Beginners tend to add too many steps',
          'Heavy blush makes the face look puffy',
          'Stacking tinted balm gets greasy',
        ],
        selfChecks: [
          'You can repeat this in 6 minutes',
          'From a distance it just reads "good complexion"',
          'No fatigue at the end of the day',
        ],
        kit: {
          mustHave: [
            product('sku-fresh-concealer', 'Skin Match Concealer', 'Concealer', 'Light Neutral', '$15', 'Spot-conceal beats full coverage for beginners.'),
            product('sku-fresh-blush', 'Cloud Cream Blush', 'Cream blush', 'Nude Peach', '$14', 'Foolproof — fingertips are enough.'),
            product('sku-fresh-lip', 'Tinted Care Balm', 'Tinted balm', 'Rose Tea', '$10', 'Easy to top up, lowest daily friction.'),
          ],
          optional: [
            product('sku-fresh-brow', 'Soft Brow Mascara', 'Brow mascara', 'Natural Brown', '$12', 'For brows that already shape well, just need taming.'),
          ],
          upgrade: [
            product('sku-fresh-cushion', 'Bare Cushion Compact', 'Cushion foundation', 'Warm Ivory', '$25', 'Switch to this when you want fuller coverage occasionally.'),
          ],
        },
      },
    ],
    shareCard: {
      title: 'My AI Office Makeup Plan',
      subtitle: 'Less effort, more polished — every day.',
      badge: 'Work-ready glow',
      hashtags: ['#OfficeGlow', '#AIMakeupPlan', '#BeautyRoutine'],
      cta: 'Copy your plan to share, or open the full tutorial.',
    },
  },

  date: {
    diagnosis: {
      title: 'Cool olive undertone · Soft glam fit',
      summary: 'Cool berries, mauves and low-saturation pinks flatter you. Warm tones can make your skin read sallow.',
      faceNotes: [
        'Cool berries lift your complexion more than warm corals',
        'Under-eye and lip shape are the highest-leverage areas',
        'Low-saturation contour reads more refined than crisp lines',
      ],
    },
    looks: [
      {
        id: 'soft-glam',
        name: 'Soft Glam Berry',
        reason: 'A romantic, refined date-night feel — cared-for, not "done".',
        scenario: 'Dinner date / Evening',
        difficulty: 'Beginner',
        minutes: '10 min',
        focus: 'Lip-cheek harmony, under-eye life',
        finish: 'Velvet berry',
        tutorialHeadline: 'Refined and warm, never reads like a heavy made-up face.',
        tutorialSteps: [
          step(
            'Keep the base breathable',
            'Date-night makeup needs to hold up close, so even out tone but skip full coverage.',
            "Don't erase your skin texture in the name of perfection.",
            'Up close it still looks like good skin, not stage makeup.',
          ),
          step(
            'Low-saturation rose-taupe socket',
            'Wash the color across the socket and outer corner for soft depth.',
            "Don't drop bright magenta straight on the lid.",
            'Eye presence is gentle — color is felt, not seen first.',
          ),
          step(
            'Horizontal blush for atmosphere',
            'Keep the blush in the same berry family as the lip; build sideways, not down.',
            "Don't drop the blush low — it sags the face.",
            'When you smile the face stays light, never heavy.',
          ),
          step(
            'Berry lip with soft edges',
            'Build the center deeper, soften at the edges for that lit-from-within feel.',
            "Don't draw a hard lip line.",
            'Lip is felt without dominating the face.',
          ),
        ],
        commonMistakes: [
          'Berry too deep dulls the complexion',
          'Blush placed too low ages the face',
          'Heavy lid color kills the soft-glam feel',
        ],
        selfChecks: [
          'On camera the look reads softer than in the mirror',
          'Lip and cheek live in the same cool-berry family',
          'Edges look clean even up close',
        ],
        kit: {
          mustHave: [
            product('sku-date-shadow', 'Petal Taupe Duo', 'Eyeshadow', 'Rose Taupe', '$16', 'The mauve-pink wash is the mood of this look.'),
            product('sku-date-lip', 'Berry Blur Lip', 'Lipstick', 'Soft Berry', '$18', 'Carries the warmth of the look on the lip.'),
            product('sku-date-blush', 'Liquid Bloom Blush', 'Liquid blush', 'Cool Rose', '$15', 'A drop is enough to bring the face to life.'),
          ],
          optional: [
            product('sku-date-liner', 'Brown Silk Liner', 'Eyeliner', 'Mocha', '$13', 'Adds a finer eye-tail when you want sharper.'),
          ],
          upgrade: [
            product('sku-date-lashes', 'Soft Cluster Lash', 'False lashes', 'Natural Lift', '$22', 'For dinner light or photos.'),
            product('sku-date-highlight', 'Melt Glow Balm', 'Cream highlight', 'Rose Pearl', '$20', 'Pinpoint glow on the high points of the face.'),
          ],
        },
      },
      {
        id: 'clean-date',
        name: 'Clean Date Glow',
        reason: 'For when you want to look effortless and well-rested, not styled.',
        scenario: 'Daytime date / Coffee',
        difficulty: 'Beginner',
        minutes: '7 min',
        focus: 'Dewy skin, calm color',
        finish: 'Cream-skin clean',
        tutorialHeadline: 'You, on a great-skin day. Not a "made up" you.',
        tutorialSteps: [
          step(
            'Brighten and spot-conceal',
            'Lift the dull spots first; decide later if you actually need more.',
            "Don't chase flawless from the start.",
            'The dimmest areas are now lit, but the makeup is still featherweight.',
          ),
          step(
            'Lash root only, no liner',
            'A clean coat at the lash root reads more natural than visible liner.',
            "Don't load mascara on top and bottom both.",
            'Eyes pop a little — you can\'t tell what was done.',
          ),
          step(
            'One nude balm, lip and cheek',
            'A 2-in-1 product is the fastest way to get the "clean date" mood right.',
            "Don't let the blush trend orange.",
            'Lip and cheek are clearly the same color.',
          ),
          step(
            'Pinpoint glow on the bridge and inner corner',
            'Light only the spots that should reflect — keeps the look airy.',
            "Don't shimmer across the lid.",
            'When you turn your head you catch a hint of glow, never a flash.',
          ),
        ],
        commonMistakes: [
          'Adding too many camera-ready steps for a casual look',
          'Highlight too wide reads oily',
          'Mismatched lip and cheek looks busy',
        ],
        selfChecks: [
          'Reads fresh under daylight',
          'Skin stays believable up close',
          'You look like "you on a great day"',
        ],
        kit: {
          mustHave: [
            product('sku-clean-concealer', 'Bright Touch Concealer', 'Concealer', 'Neutral Peach', '$14', 'Resets the under-eye and corners of the mouth fast.'),
            product('sku-clean-duo', 'Lip + Cheek Tint', 'Lip + cheek', 'Bare Rose', '$17', 'One product covers both for the cleanest harmony.'),
            product('sku-clean-mascara', 'Clean Lift Mascara', 'Mascara', 'Soft Brown', '$15', 'Lash-root focus reads more natural.'),
          ],
          optional: [
            product('sku-clean-highlight', 'Dew Point Highlighter', 'Liquid highlight', 'Moon Glow', '$16', 'For people who want glow without shimmer.'),
          ],
          upgrade: [
            product('sku-clean-shimmer', 'Fine Pearl Shadow', 'Shimmer shadow', 'Champagne Pink', '$19', 'For daytime cafe shoots.'),
          ],
        },
      },
      {
        id: 'night-mauve',
        name: 'Night Mauve Focus',
        reason: 'For evening venues and low light — more presence, still clean edges.',
        scenario: 'Evening date / Bar',
        difficulty: 'Intermediate',
        minutes: '14 min',
        focus: 'Eye depth, lip presence',
        finish: 'Cool mauve',
        tutorialHeadline: 'More dimension under low light, without losing clean edges.',
        tutorialSteps: [
          step(
            'Deepen only the outer third',
            'Concentrate depth at the outer corner for a focused gaze.',
            "Don't ring the entire eye in dark color.",
            'Open eyes feel deeper while edges still read soft.',
          ),
          step(
            'Cool family from eye to lip',
            'Pick eye and lip colors from the same cool family for cohesion.',
            "Don't pair purple eye with orange lip.",
            'There is one color story from eye to lip.',
          ),
          step(
            'Cheekbone highlight, controlled area',
            'Light only the highest point of the cheekbone and bridge of the nose.',
            "Don't shimmer the apple of the cheek.",
            'You see structure under venue light, no powdery flatness.',
          ),
          step(
            'Tidy edges, stop adding',
            'Clean the outer corner and lip line; resist the urge to layer more.',
            "Don't stack another shade.",
            'From across the room features pop. Up close, edges are clean.',
          ),
        ],
        commonMistakes: [
          'Evening tempts heavier hands',
          'Cool eye + warm lip looks dirty',
          'Wide highlight magnifies texture',
        ],
        selfChecks: [
          'Holds up under venue light without going flat',
          'Lip anchors the look',
          'Edges stay clean',
        ],
        kit: {
          mustHave: [
            product('sku-night-shadow', 'Mauve Smoke Palette', 'Eyeshadow palette', 'Dusty Mauve', '$27', 'The cool mauve range is the spine of this look.'),
            product('sku-night-liner', 'Lip Shape Pencil', 'Lip pencil', 'Cool Rosewood', '$12', 'Adds presence and edge to the lip.'),
            product('sku-night-lip', 'Soft Matte Lip', 'Lipstick', 'Muted Plum', '$18', 'Holds the visual weight under low light.'),
          ],
          optional: [
            product('sku-night-contour', 'Micro Sculpt Powder', 'Powder contour', 'Soft Taupe', '$18', 'For added bone structure if needed.'),
          ],
          upgrade: [
            product('sku-night-setting', 'No-Shift Setting Powder', 'Setting powder', 'Translucent', '$23', 'Holds clean edges through warm rooms.'),
          ],
        },
      },
    ],
    shareCard: {
      title: 'My AI Date Night Beauty Plan',
      subtitle: 'Soft glam that actually fits me.',
      badge: 'Date-night mood',
      hashtags: ['#DateNightMakeup', '#SoftGlam', '#AIBeautyStylist'],
      cta: 'Copy your plan to share, or open the full tutorial.',
    },
  },

  photo: {
    diagnosis: {
      title: 'Neutral undertone · Camera-ready contrast fit',
      summary: 'On camera you benefit from a touch more brow, eye and lip contrast — but base must stay light, or it reads masked.',
      faceNotes: [
        'Cameras eat structure; you need a bit more definition than IRL',
        'Brow, eye and lip all need presence to balance',
        'Heavy base flattens you on screen',
      ],
    },
    looks: [
      {
        id: 'camera-glow',
        name: 'Camera Glow',
        reason: 'For everyday photos, headshots and social posts.',
        scenario: 'Photo / Social',
        difficulty: 'Beginner',
        minutes: '9 min',
        focus: 'Defined features, controlled glow',
        finish: 'Sharp natural',
        tutorialHeadline: 'More dimension on camera, still natural in person.',
        tutorialSteps: [
          step(
            'Even tone, keep texture',
            'Cameras need a more even base — but too much coverage looks fake on screen.',
            "Don't chase a fully matte, fully covered face.",
            'In photos the skin reads even; in person it still looks like skin.',
          ),
          step(
            'Brow framing matters most',
            'Strengthen peak and tail so the camera can read your face shape.',
            "Don't draw blocky angular brows.",
            'Photos read framed; in the mirror brows still feel like yours.',
          ),
          step(
            'Sharpen eye-tail and Cupid\'s bow',
            'These edges are what cameras lock onto. Refine them.',
            "Don't sharpen everything at once.",
            'Just clarifying eye-tail and lip peak makes the whole face crisper.',
          ),
          step(
            'Cheekbone highlight for camera lift',
            'A small placement adds depth without on-skin shimmer.',
            "Don't use chunky glitter highlights.",
            'Selfies show structure; you don\'t see "shine".',
          ),
        ],
        commonMistakes: [
          'Heavy base flattens cameras',
          'Hard brows steal the face',
          'Wrong highlight texture reads oily',
        ],
        selfChecks: [
          'Selfies feel sharper, not painted',
          'Real-life version is still wearable',
          'Highlight adds bone structure, not pores',
        ],
        kit: {
          mustHave: [
            product('sku-photo-foundation', 'Second Skin Foundation', 'Foundation', 'Neutral Beige', '$20', 'Cameras want more even tone.'),
            product('sku-photo-brow', 'Structure Brow Pencil', 'Brow pencil', 'Neutral Brown', '$13', 'Brows define face shape on camera.'),
            product('sku-photo-highlight', 'Lens Lift Highlighter', 'Highlight', 'Soft Champagne', '$18', 'Adds dimension without going to glitter.'),
          ],
          optional: [
            product('sku-photo-highlight2', 'Glow Dust Highlighter', 'Highlight', 'Champagne', '$17', 'For selfies and content shots.'),
          ],
          upgrade: [
            product('sku-photo-contour', 'Soft Focus Sculpt Palette', 'Sculpt palette', 'Neutral Sculpt', '$26', 'For headshots and covers.'),
          ],
        },
      },
      {
        id: 'editorial-soft',
        name: 'Editorial Soft Focus',
        reason: 'A more brand-ready, refined editorial feel.',
        scenario: 'Portrait / Content',
        difficulty: 'Intermediate',
        minutes: '15 min',
        focus: 'Bone structure, lip texture',
        finish: 'Soft-focus refined',
        tutorialHeadline: 'Brand-style restraint instead of dramatic glam.',
        tutorialSteps: [
          step(
            'Build the socket with cool taupe',
            'Forget saturation — get the structure right first.',
            "Don't let color overpower the feature itself.",
            'On camera the socket has structure with no obvious color block.',
          ),
          step(
            'Soft nose contour, careful blend',
            'Sculpt with shadow, not visible lines.',
            "Don't draw two parallel lines.",
            'In photos the nose reads taller; IRL nothing looks drawn on.',
          ),
          step(
            'Tighten the lip line',
            'Editorial polish often comes from edge-work, not color.',
            "Don't reach for a saturated bright shade.",
            'Lip outline is well-defined in the final image.',
          ),
          step(
            'Light highlight, leave room to breathe',
            'A small reflection lets the camera do the rest.',
            "Don't chase glow on the entire face.",
            'Final image reads soft-focus, not shiny.',
          ),
        ],
        commonMistakes: [
          'Hard contour kills the editorial feel',
          'Too many accents look like a beauty ad',
          'Sloppy lip line ruins the final image',
        ],
        selfChecks: [
          'Reads brand, not influencer',
          'Structure is present without exaggeration',
          'Lip line holds up under crop',
        ],
        kit: {
          mustHave: [
            product('sku-editorial-shadow', 'Studio Taupe Palette', 'Eyeshadow', 'Neutral Taupe', '$29', 'Brand-style imagery leans on structural neutrals.'),
            product('sku-editorial-lipliner', 'Velvet Edge Lip Pencil', 'Lip pencil', 'Beige Mauve', '$14', 'Holds the lip outline in-frame.'),
            product('sku-editorial-setting', 'Soft Blur Fixer', 'Setting fixer', 'Photo Finish', '$24', 'Helps the look stay clean over the shoot.'),
          ],
          optional: [
            product('sku-editorial-contour', 'Liquid Sculpt', 'Liquid contour', 'Stone Taupe', '$19', 'For the more practiced.'),
          ],
          upgrade: [
            product('sku-editorial-highlight', 'Pro Light Balm', 'Pro highlight', 'Silk Pearl', '$28', 'For content shoots and brand imagery.'),
          ],
        },
      },
      {
        id: 'flash-proof',
        name: 'Flash-proof Fresh',
        reason: 'For flash photography and bright venues.',
        scenario: 'Event / Bright light',
        difficulty: 'Intermediate',
        minutes: '11 min',
        focus: 'Oil control, layered structure, clean edges',
        finish: 'Clean semi-matte',
        tutorialHeadline: 'No flashback, no powdery face, structure intact under harsh light.',
        tutorialSteps: [
          step(
            'Control oil, then go light',
            'Stabilize the surface before adding base layers.',
            "Don't pile on foundation as your first move.",
            'Base is bonded to the skin without dryness or shine.',
          ),
          step(
            'Refine nose and under-eye',
            'These are the spots flash exposes most.',
            "Don't extend concealer too far.",
            'On flashed photos there are no visible layers or creases.',
          ),
          step(
            'Avoid heavy shimmer; keep semi-matte structure',
            'Let light shape the face naturally, instead of forcing glow.',
            "Don't highlight forehead and mid-face together.",
            'Flash photos read clean, not white-blown.',
          ),
          step(
            'Lip color holds the look',
            'Bright light needs a lip with weight to anchor the face.',
            "Don't pick a too-pale nude; flash will eat it.",
            'In photos the lip still has presence, in line with the look.',
          ),
        ],
        commonMistakes: [
          'Heavy highlight under flash flips the look',
          'Untreated oil reads dirty',
          'Pale lip drops out',
        ],
        selfChecks: [
          'Flash photos do not white-blow',
          'Base stays seated',
          'Lip carries the face',
        ],
        kit: {
          mustHave: [
            product('sku-flash-primer', 'Shine Control Primer', 'Mattifying primer', 'Clear', '$16', 'Anchors the makeup before bright light.'),
            product('sku-flash-concealer', 'Flex Wear Concealer', 'Concealer', 'Neutral Light', '$15', 'Best in nose and under-eye spots.'),
            product('sku-flash-lip', 'Semi Matte Lip Color', 'Lipstick', 'Warm Rosewood', '$17', 'Holds visual weight under flash.'),
          ],
          optional: [
            product('sku-flash-mist', 'Lock-in Setting Mist', 'Setting mist', 'Matte Hold', '$18', 'For long events.'),
          ],
          upgrade: [
            product('sku-flash-powder', 'Soft Blur Compact', 'Soft-focus powder', 'Translucent', '$24', 'For continuous flash sessions.'),
          ],
        },
      },
    ],
    shareCard: {
      title: 'My Camera-ready Makeup Diagnosis',
      subtitle: 'Sharper on camera, still natural in real life.',
      badge: 'Photo-ready finish',
      hashtags: ['#CameraReady', '#MakeupDiagnosis', '#BeautyCreator'],
      cta: 'Copy your plan to share, or open the full tutorial.',
    },
  },
};


// ─── ZH catalog (kept for /zh route or AI prompt overrides) ───────────────
const planMapZh: Record<string, TryOnPlan> = {
  office: {
    diagnosis: {
      title: '暖中性肤调 · 柔结构妆',
      summary: '你的五官更适合“低浓度但有结构”的妆容路线，重点不是堆颜色，而是提气色和清晰度。',
      faceNotes: ['底妆适合轻薄提亮', '眉眼结构比大面积色彩更关键', '唇颊同色能让整体更干净高级'],
    },
    looks: [
      {
        id: 'office-glow',
        name: 'Office Glow',
        reason: '最快提升精神感，适合通勤和视频会议。',
        scenario: '通勤 / 会议',
        difficulty: 'Beginner',
        minutes: '8 min',
        focus: '气色、眉眼清晰度',
        finish: '柔雾裸粉',
        tutorialHeadline: '8 分钟把精神感提起来的通勤妆路线。',
        tutorialSteps: [
          step('轻薄打底，只修需要被提亮的地方', '先铺一层薄底，再把遮瑕集中在眼下、鼻翼和嘴角，避免整脸盖厚。', '不要为了“均匀”把整张脸刷成同一块颜色。', '站远一点看，肤色是否更整齐但还能看到自然纹理。'),
          step('眉峰和睫毛根部决定精神感', '用细眉笔把眉头到眉峰的线条修顺，再用深棕色沿睫毛根部轻压一层存在感。', '不要把眉尾拉太长，也不要整圈画黑眼线。', '闭眼时看线条是否只在根部，睁眼后眉眼是否更清晰。'),
          step('用低面积提亮处理眼下和鼻梁', '提亮只放在眼下三角和鼻梁中段，范围小但位置准，会更高级。', '不要额头、苹果肌、下巴全部一起发亮。', '正面看脸中央有立体感，但侧面没有明显珠光块。'),
          step('裸粉豆沙唇收尾，让气色统一', '先薄涂唇色，再轻拍到颊侧做一点点呼应，形成自然情绪色。', '不要口红太饱和，也不要腮红面积过大。', '嘴唇和面中颜色能呼应，但整体仍然像日常妆。'),
        ],
        commonMistakes: ['底妆铺太厚导致脸平', '眉尾拉太长显凶', '提亮范围太大会像出油'],
        selfChecks: ['视频会议镜头下五官是否更清楚', '近看皮肤仍有真实感', '唇色是否比原唇更有气色但不过分抢戏'],
        kit: {
          mustHave: [
            product('sku-office-base', 'Skin Veil Tint', '轻薄粉底', 'Neutral Linen', '$18', '通勤场景更需要轻薄匀净，而不是高遮瑕假面。'),
            product('sku-office-brow', 'Precision Brow Pencil', '眉笔', 'Soft Brown', '$12', '快速把眉形理顺，几秒钟就能提升精神感。'),
            product('sku-office-lip', 'Rosy Nude Lip Cream', '口红', 'Dusty Rose', '$16', '豆沙裸粉最适合提升气色且不挑场景。'),
          ],
          optional: [],
          upgrade: [],
        },
      },
    ],
    shareCard: {
      title: 'My AI Office Makeup Plan',
      subtitle: 'Less effort, more polished every day.',
      badge: 'Work-ready glow',
      hashtags: ['#OfficeGlow', '#AIMakeupPlan', '#BeautyRoutine'],
      cta: '复制分享文案给朋友，或者继续进入教程细化动作。',
    },
  },
};

// ─── Public API ───────────────────────────────────────────────────────────
const catalogs: Record<Locale, Record<string, TryOnPlan>> = {
  en: planMapEn,
  // 缺失的 zh scenario 自动回退到 en，避免半英半中
  zh: new Proxy(planMapZh, {
    get(target, prop: string) {
      return target[prop] ?? planMapEn[prop] ?? planMapEn.office;
    },
  }) as Record<string, TryOnPlan>,
};

export function buildTryOnPlan(scenario: string = 'office', locale: Locale = 'en'): TryOnPlan {
  const map = catalogs[locale] ?? catalogs.en;
  return map[scenario] ?? map.office;
}

export function getAllLooks(locale: Locale = 'en'): TryOnLook[] {
  const map = catalogs[locale] ?? catalogs.en;
  return Object.values(map).flatMap((plan) => [...plan.looks]);
}

export function findLookById(id?: string | null, locale: Locale = 'en'): TryOnLook | undefined {
  if (!id) return undefined;
  return getAllLooks(locale).find((look) => look.id === id);
}
