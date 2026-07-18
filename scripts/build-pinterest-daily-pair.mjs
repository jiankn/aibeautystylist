import { mkdir } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

const root = process.cwd();
const logoPath = path.join(root, "public/images/logo-256.png");

const pins = [
  {
    source: "tmp/pinterest-sources/passport-photo-no-flashback.png",
    cleanOutput: "public/images/pinterest/passport-photo-no-flashback.webp",
    pinOutput: "artifacts/pinterest/09-passport-photo-no-flashback.png",
    titleLine1: "Passport Photo",
    titleLine2: "Makeup",
    subtitle: "Clean under direct flash",
    supporting: "Preview before your appointment",
    cardTitle: "No flashback",
    cardBody: "Still looks like you",
    cta: "TRY THIS LOOK FREE",
  },
  {
    source: "tmp/pinterest-sources/glass-skin-not-greasy.png",
    cleanOutput: "public/images/pinterest/glass-skin-not-greasy.webp",
    pinOutput: "artifacts/pinterest/10-glass-skin-not-greasy.png",
    titleLine1: "Glass Skin",
    titleLine2: "Makeup",
    subtitle: "Luminous, not oily",
    supporting: "Preview your finish first",
    cardTitle: "Targeted glow",
    cardBody: "Real skin, no grease",
    cta: "TRY GLASS SKIN FREE",
  },
  {
    source: "tmp/pinterest-sources/first-date-soft-daylight.png",
    cleanOutput: "public/images/pinterest/first-date-soft-daylight.webp",
    pinOutput: "artifacts/pinterest/11-first-date-soft-daylight-makeup.png",
    titleLine1: "First Date",
    titleLine2: "Makeup",
    subtitle: "Soft, real-life pretty",
    supporting: "Preview before you go",
    cardTitle: "Still looks like you",
    cardBody: "Rose-milk softness",
    cta: "TRY DATE LOOK FREE",
  },
  {
    source: "tmp/pinterest-sources/summer-wedding-guest-heatproof.png",
    cleanOutput: "public/images/pinterest/summer-wedding-guest-heatproof.webp",
    pinOutput: "artifacts/pinterest/12-summer-wedding-guest-heatproof.png",
    titleLine1: "Summer Wedding",
    titleLine1FontSize: 62,
    titleLine2: "Makeup",
    subtitle: "Heat-safe, photo-ready",
    supporting: "Preview before the event",
    cardTitle: "Warm daylight",
    cardBody: "Coral glow, no shine",
    cta: "TRY EVENT LOOK FREE",
  },
  {
    source: "tmp/pinterest-sources/smudged-smoky-eyes-night.png",
    cleanOutput: "public/images/pinterest/smudged-smoky-eyes-night.webp",
    pinOutput: "artifacts/pinterest/13-smudged-smoky-eyes-night.png",
    titleLine1: "Smudged Smoky",
    titleLine1FontSize: 61,
    titleLine2: "Eyes",
    subtitle: "Soft edges. Strong impact.",
    supporting: "Preview the trend on your face",
    cardTitle: "2026 night trend",
    cardBody: "Lived-in, not messy",
    cta: "TRY SMOKY EYES FREE",
  },
  {
    source: "tmp/pinterest-sources/mature-skin-no-caking.png",
    cleanOutput: "public/images/pinterest/mature-skin-no-caking.webp",
    pinOutput: "artifacts/pinterest/14-mature-skin-no-caking.png",
    titleLine1: "Mature Skin",
    titleLine1FontSize: 67,
    titleLine2: "Makeup",
    subtitle: "Luminous, never cakey",
    supporting: "Preview before you apply",
    cardTitle: "Texture-friendly",
    cardBody: "Thin layers, real skin",
    cta: "TRY THIS LOOK FREE",
  },
  {
    source: "tmp/pinterest-sources/no-makeup-real-daylight.png",
    cleanOutput: "public/images/pinterest/no-makeup-real-daylight.webp",
    pinOutput: "artifacts/pinterest/15-no-makeup-real-daylight.png",
    titleLine1: "No-Makeup",
    titleLine1FontSize: 64,
    titleLine2: "Makeup",
    subtitle: "Real skin. Better rested.",
    supporting: "Check it in honest daylight",
    cardTitle: "2026 skin-first",
    cardBody: "Sheer, not bare",
    cta: "TRY THIS LOOK FREE",
  },
  {
    source: "tmp/pinterest-sources/olive-skin-muted-rose.png",
    cleanOutput: "public/images/pinterest/olive-skin-muted-rose.webp",
    pinOutput: "artifacts/pinterest/16-olive-skin-muted-rose.png",
    titleLine1: "Olive Skin",
    titleLine1FontSize: 67,
    titleLine2: "Rose Makeup",
    subtitle: "Muted rose. Never orange.",
    supporting: "Preview your undertone match",
    cardTitle: "Color harmony",
    cardBody: "No orange or grey",
    cta: "TRY OLIVE ROSE FREE",
  },
  {
    variant: "save-guide",
    source: "tmp/pinterest-sources/blush-placement-map.png",
    cleanOutput: "public/images/pinterest/blush-placement-map.webp",
    pinOutput: "artifacts/pinterest/17-blush-placement-map.png",
    photoHeight: 860,
    panelHeight: 640,
    title: "BLUSH PLACEMENT MAP",
    subtitle: "Lift, soften or freshen your face",
    cta: "SAVE THIS BLUSH MAP",
  },
  {
    variant: "lip-conversion",
    source: "tmp/pinterest-sources/jelly-lip-real-daylight.png",
    cleanOutput: "public/images/pinterest/jelly-lip-real-daylight.webp",
    pinOutput: "artifacts/pinterest/18-jelly-lip-real-daylight.png",
    titleLine1: "Jelly Lip",
    titleLine2: "Tint",
    subtitle: "Fresh color. Real daylight.",
    supporting: "See the finish on your face",
    cta: "TRY THIS LIP FREE",
  },
];

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function panelSvg(pin) {
  if (pin.variant === "save-guide") {
    const copy = Object.fromEntries(
      Object.entries(pin).map(([key, value]) => [
        key,
        typeof value === "string" ? escapeXml(value) : value,
      ]),
    );

    return Buffer.from(`
      <svg width="1000" height="640" viewBox="0 0 1000 640" xmlns="http://www.w3.org/2000/svg">
        <rect width="1000" height="640" fill="#fffaf8"/>
        <rect width="1000" height="4" fill="#df6c7a"/>

        <text x="116" y="65" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="700" fill="#211d21">AI Beauty Stylist</text>
        <text x="116" y="93" font-family="Arial, Helvetica, sans-serif" font-size="19" font-weight="700" fill="#405778">aibeautystylist.com</text>
        <rect x="748" y="40" width="190" height="42" rx="21" fill="#fffaf8" stroke="#df6c7a" stroke-width="2"/>
        <text x="843" y="67" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="700" fill="#c95161">MAKEUP MAP</text>

        <text x="56" y="157" font-family="Arial, Helvetica, sans-serif" font-size="50" font-weight="800" fill="#211d21">${copy.title}</text>
        <text x="56" y="198" font-family="Arial, Helvetica, sans-serif" font-size="27" font-weight="700" fill="#218878">${copy.subtitle}</text>
        <line x1="56" y1="224" x2="944" y2="224" stroke="#ead8d7" stroke-width="2"/>

        <g transform="translate(58 242)">
          <ellipse cx="78" cy="70" rx="52" ry="67" fill="#f8dfd3" stroke="#be8a7e" stroke-width="2"/>
          <path d="M51 57 Q60 52 68 57 M88 57 Q97 52 105 57" fill="none" stroke="#5e4b49" stroke-width="3" stroke-linecap="round"/>
          <path d="M78 62 L74 80 L82 80" fill="none" stroke="#9a7169" stroke-width="2" stroke-linecap="round"/>
          <path d="M62 94 Q78 103 94 94" fill="none" stroke="#a75668" stroke-width="3" stroke-linecap="round"/>
          <ellipse cx="103" cy="78" rx="27" ry="11" transform="rotate(-26 103 78)" fill="#df6c7a" opacity="0.58"/>
          <path d="M111 69 L133 47" stroke="#c95161" stroke-width="4" stroke-linecap="round"/>
          <path d="M126 48 L134 46 L132 55" fill="none" stroke="#c95161" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
          <text x="78" y="165" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="25" font-weight="800" fill="#122744">LIFT</text>
          <text x="78" y="197" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="700" fill="#596880">Sweep high</text>
          <text x="78" y="221" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="18" fill="#596880">toward temples</text>
        </g>

        <line x1="338" y1="252" x2="338" y2="478" stroke="#ead8d7" stroke-width="2"/>

        <g transform="translate(371 242)">
          <ellipse cx="78" cy="70" rx="52" ry="67" fill="#f8dfd3" stroke="#be8a7e" stroke-width="2"/>
          <path d="M51 57 Q60 52 68 57 M88 57 Q97 52 105 57" fill="none" stroke="#5e4b49" stroke-width="3" stroke-linecap="round"/>
          <path d="M78 62 L74 80 L82 80" fill="none" stroke="#9a7169" stroke-width="2" stroke-linecap="round"/>
          <path d="M62 94 Q78 103 94 94" fill="none" stroke="#a75668" stroke-width="3" stroke-linecap="round"/>
          <ellipse cx="42" cy="84" rx="23" ry="16" fill="#df6c7a" opacity="0.5"/>
          <ellipse cx="114" cy="84" rx="23" ry="16" fill="#df6c7a" opacity="0.5"/>
          <text x="78" y="165" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="25" font-weight="800" fill="#122744">SOFTEN</text>
          <text x="78" y="197" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="700" fill="#596880">Blend across</text>
          <text x="78" y="221" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="18" fill="#596880">the apples</text>
        </g>

        <line x1="651" y1="252" x2="651" y2="478" stroke="#ead8d7" stroke-width="2"/>

        <g transform="translate(684 242)">
          <ellipse cx="78" cy="70" rx="52" ry="67" fill="#f8dfd3" stroke="#be8a7e" stroke-width="2"/>
          <path d="M51 57 Q60 52 68 57 M88 57 Q97 52 105 57" fill="none" stroke="#5e4b49" stroke-width="3" stroke-linecap="round"/>
          <path d="M78 62 L74 80 L82 80" fill="none" stroke="#9a7169" stroke-width="2" stroke-linecap="round"/>
          <path d="M62 94 Q78 103 94 94" fill="none" stroke="#a75668" stroke-width="3" stroke-linecap="round"/>
          <ellipse cx="45" cy="70" rx="25" ry="10" transform="rotate(10 45 70)" fill="#df6c7a" opacity="0.46"/>
          <ellipse cx="111" cy="70" rx="25" ry="10" transform="rotate(-10 111 70)" fill="#df6c7a" opacity="0.46"/>
          <text x="78" y="165" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="25" font-weight="800" fill="#122744">FRESHEN</text>
          <text x="78" y="197" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="700" fill="#596880">Tap high</text>
          <text x="78" y="221" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="18" fill="#596880">under the eyes</text>
        </g>

        <rect x="56" y="532" width="510" height="66" rx="33" fill="#d92564"/>
        <text x="311" y="575" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="25" font-weight="800" letter-spacing="0.5" fill="#ffffff">${copy.cta}</text>
        <text x="610" y="557" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="700" fill="#122744">Preview your placement</text>
        <text x="610" y="585" font-family="Arial, Helvetica, sans-serif" font-size="19" fill="#596880">on your own selfie</text>
      </svg>
    `);
  }

  if (pin.variant === "lip-conversion") {
    const copy = Object.fromEntries(
      Object.entries(pin).map(([key, value]) => [
        key,
        typeof value === "string" ? escapeXml(value) : value,
      ]),
    );

    return Buffer.from(`
      <svg width="1000" height="500" viewBox="0 0 1000 500" xmlns="http://www.w3.org/2000/svg">
        <rect width="1000" height="500" fill="#fffaf8"/>
        <rect width="1000" height="4" fill="#cf4d68"/>

        <text x="125" y="70" font-family="Arial, Helvetica, sans-serif" font-size="29" font-weight="700" fill="#211d21">AI Beauty Stylist</text>
        <text x="125" y="99" font-family="Arial, Helvetica, sans-serif" font-size="19" font-weight="700" fill="#405778">aibeautystylist.com</text>
        <rect x="721" y="46" width="220" height="46" rx="23" fill="#fffaf8" stroke="#cf4d68" stroke-width="2"/>
        <text x="831" y="76" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="700" fill="#bd465f">REAL DAYLIGHT</text>

        <text x="64" y="202" font-family="Arial, Helvetica, sans-serif" font-size="72" font-weight="800" fill="#211d21">${copy.titleLine1}</text>
        <text x="64" y="283" font-family="Arial, Helvetica, sans-serif" font-size="76" font-weight="800" fill="#c84563">${copy.titleLine2}</text>
        <text x="64" y="332" font-family="Arial, Helvetica, sans-serif" font-size="29" font-weight="700" fill="#218878">${copy.subtitle}</text>
        <text x="64" y="370" font-family="Arial, Helvetica, sans-serif" font-size="22" fill="#5f565b">${copy.supporting}</text>

        <g transform="translate(650 166)">
          <circle cx="42" cy="27" r="27" fill="#d98991"/>
          <circle cx="124" cy="27" r="27" fill="#ad405d"/>
          <circle cx="206" cy="27" r="27" fill="#7c2f4c"/>
          <text x="42" y="76" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="15" font-weight="700" fill="#596880">SHEER</text>
          <text x="124" y="76" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="15" font-weight="700" fill="#596880">GLOSSY</text>
          <text x="206" y="76" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="15" font-weight="700" fill="#596880">STAIN</text>
        </g>

        <rect x="64" y="407" width="520" height="66" rx="33" fill="#d92564"/>
        <text x="324" y="450" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="25" font-weight="800" letter-spacing="0.5" fill="#ffffff">${copy.cta}</text>
        <text x="625" y="428" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="700" fill="#122744">One free selfie preview</text>
        <text x="625" y="457" font-family="Arial, Helvetica, sans-serif" font-size="19" fill="#596880">No sign-up first</text>
      </svg>
    `);
  }

  const copy = Object.fromEntries(
    Object.entries(pin).map(([key, value]) => [
      key,
      typeof value === "string" ? escapeXml(value) : value,
    ]),
  );

  return Buffer.from(`
    <svg width="1000" height="500" viewBox="0 0 1000 500" xmlns="http://www.w3.org/2000/svg">
      <rect width="1000" height="500" fill="#fffaf8"/>
      <rect width="1000" height="3" fill="#e56b7c"/>

      <text x="135" y="70" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="700" fill="#211d21">AI Beauty Stylist</text>
      <text x="135" y="100" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="700" fill="#405778">aibeautystylist.com</text>

      <rect x="700" y="48" width="230" height="48" rx="24" fill="#fffaf8" stroke="#e56b7c" stroke-width="2"/>
      <text x="815" y="79" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="700" fill="#cc5968">AI TRY-ON PREVIEW</text>

      <text x="70" y="185" font-family="Arial, Helvetica, sans-serif" font-size="${pin.titleLine1FontSize ?? 72}" font-weight="800" fill="#211d21">${copy.titleLine1}</text>
      <text x="70" y="270" font-family="Arial, Helvetica, sans-serif" font-size="72" font-weight="800" fill="#cc4f62">${copy.titleLine2}</text>
      <text x="70" y="326" font-family="Arial, Helvetica, sans-serif" font-size="31" font-weight="700" fill="#218878">${copy.subtitle}</text>
      <text x="70" y="368" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="400" fill="#5f565b">${copy.supporting}</text>

      <rect x="660" y="180" width="270" height="142" rx="18" fill="#fff3f4" stroke="#f2b4bc" stroke-width="2"/>
      <text x="690" y="226" font-family="Arial, Helvetica, sans-serif" font-size="23" font-weight="700" fill="#122744">${copy.cardTitle}</text>
      <text x="690" y="268" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="700" fill="#536783">${copy.cardBody}</text>

      <rect x="70" y="407" width="610" height="68" rx="34" fill="#d92564"/>
      <text x="375" y="451" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="27" font-weight="800" letter-spacing="1" fill="#ffffff">${copy.cta}</text>
      <text x="720" y="449" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="700" fill="#596880">One free selfie preview</text>
    </svg>
  `);
}

const requestedPins = new Set(process.argv.slice(2));
const pinsToBuild =
  requestedPins.size === 0
    ? pins
    : pins.filter(
        (pin) =>
          requestedPins.has(pin.pinOutput) ||
          requestedPins.has(path.basename(pin.pinOutput)),
      );

if (requestedPins.size > 0 && pinsToBuild.length !== requestedPins.size) {
  throw new Error("One or more requested Pin outputs were not found.");
}

for (const pin of pinsToBuild) {
  const sourcePath = path.join(root, pin.source);
  const cleanOutputPath = path.join(root, pin.cleanOutput);
  const pinOutputPath = path.join(root, pin.pinOutput);
  const photoHeight = pin.photoHeight ?? 1000;
  const panelHeight = pin.panelHeight ?? 500;
  if (photoHeight + panelHeight !== 1500) {
    throw new Error(`Invalid 2:3 layout for ${pin.pinOutput}`);
  }

  await mkdir(path.dirname(cleanOutputPath), { recursive: true });
  await mkdir(path.dirname(pinOutputPath), { recursive: true });

  await sharp(sourcePath)
    .rotate()
    .webp({ quality: 91, effort: 6, smartSubsample: true })
    .toFile(cleanOutputPath);

  const photo = await sharp(sourcePath)
    .rotate()
    .resize(1000, photoHeight, {
      fit: "cover",
      position: "centre",
      withoutEnlargement: false,
    })
    .png()
    .toBuffer();
  const logo = await sharp(logoPath).resize(52, 52).png().toBuffer();
  const logoTop = photoHeight + (pin.variant === "save-guide" ? 39 : 49);

  await sharp({
    create: {
      width: 1000,
      height: 1500,
      channels: 4,
      background: "#fffaf8",
    },
  })
    .composite([
      { input: photo, top: 0, left: 0 },
      { input: panelSvg(pin), top: photoHeight, left: 0 },
      {
        input: logo,
        top: logoTop,
        left:
          pin.variant === "save-guide"
            ? 52
            : pin.variant === "lip-conversion"
              ? 64
              : 70,
      },
    ])
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(pinOutputPath);

  console.log(`${pin.pinOutput} <- ${pin.source}`);
  console.log(`${pin.cleanOutput} <- ${pin.source}`);
}
