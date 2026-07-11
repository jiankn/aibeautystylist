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

for (const pin of pins) {
  const sourcePath = path.join(root, pin.source);
  const cleanOutputPath = path.join(root, pin.cleanOutput);
  const pinOutputPath = path.join(root, pin.pinOutput);

  await mkdir(path.dirname(cleanOutputPath), { recursive: true });
  await mkdir(path.dirname(pinOutputPath), { recursive: true });

  await sharp(sourcePath)
    .rotate()
    .webp({ quality: 91, effort: 6, smartSubsample: true })
    .toFile(cleanOutputPath);

  const photo = await sharp(sourcePath)
    .rotate()
    .resize(1000, 1000, {
      fit: "cover",
      position: "centre",
      withoutEnlargement: false,
    })
    .png()
    .toBuffer();
  const logo = await sharp(logoPath).resize(52, 52).png().toBuffer();

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
      { input: panelSvg(pin), top: 1000, left: 0 },
      { input: logo, top: 1049, left: 70 },
    ])
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(pinOutputPath);

  console.log(`${pin.pinOutput} <- ${pin.source}`);
  console.log(`${pin.cleanOutput} <- ${pin.source}`);
}
