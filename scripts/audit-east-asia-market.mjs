import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const rootDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const looksDir = path.join(rootDir, "public", "images", "looks");
const thumbsDir = path.join(looksDir, "thumbs");

const allRecipeIds = [
  "beginner",
  "bronze-evening",
  "burgundy-velvet",
  "candlelight-mauve",
  "champagne-gala",
  "client-meeting-nude",
  "cloud-skin-matte",
  "commute",
  "creator-camera-glow",
  "date",
  "douyin-soft-focus",
  "evening",
  "executive-rose",
  "five-minute-beginner",
  "flash-proof-satin",
  "french-natural-chic",
  "hooded-eyes-lift",
  "interview-ready",
  "jelly-lip-tint",
  "korean-dewy-glow",
  "korean-dewy-makeup",
  "latina-bronze-glam",
  "mature-skin-radiance",
  "monolid-makeup",
  "no-makeup",
  "olive-undertone-rose",
  "passport-photo-clean",
  "peach-beige-date",
  "peach-morning-glow",
  "photogenic",
  "refined",
  "reflective-lid-glow",
  "romantic-pink",
  "rose-milk-date",
  "soft-berry-stain",
  "soft-editorial",
  "soft-matte-everyday",
  "summer-wedding-guest",
  "sunburn-satin-glow",
  "vacation-bronze",
  "warm-nude-daily",
  "watercolor-blush",
  "wedding-guest",
  "weekend-glow",
];

const generatedGlobalDiverseIds = [
  "client-meeting-nude",
  "date",
  "hooded-eyes-lift",
  "korean-dewy-glow",
  "passport-photo-clean",
  "rose-milk-date",
];

function missingFiles(recipeIds, suffix, dir) {
  return recipeIds
    .map((recipeId) => `${recipeId}--${suffix}.webp`)
    .filter((fileName) => !existsSync(path.join(dir, fileName)));
}

const missingEastAsiaAssets = missingFiles(allRecipeIds, "east-asia", looksDir);
const missingEastAsiaThumbs = missingFiles(
  allRecipeIds,
  "east-asia",
  thumbsDir,
);
const missingGlobalDiverseAssets = missingFiles(
  generatedGlobalDiverseIds,
  "global-diverse",
  looksDir,
);
const missingGlobalDiverseThumbs = missingFiles(
  generatedGlobalDiverseIds,
  "global-diverse",
  thumbsDir,
);

console.log("East Asia market audit");
console.log(`East Asia looks checked: ${allRecipeIds.length}`);
console.log(`Missing east-asia assets: ${missingEastAsiaAssets.length}`);
console.log(`Missing east-asia thumbnails: ${missingEastAsiaThumbs.length}`);
console.log(
  `Global-diverse generated looks checked: ${generatedGlobalDiverseIds.length}`,
);
console.log(
  `Missing global-diverse generated assets: ${missingGlobalDiverseAssets.length}`,
);
console.log(
  `Missing global-diverse generated thumbnails: ${missingGlobalDiverseThumbs.length}`,
);

const failures = [
  ["Missing east-asia assets", missingEastAsiaAssets],
  ["Missing east-asia thumbnails", missingEastAsiaThumbs],
  ["Missing global-diverse generated assets", missingGlobalDiverseAssets],
  ["Missing global-diverse generated thumbnails", missingGlobalDiverseThumbs],
].filter(([, files]) => files.length > 0);

if (failures.length > 0) {
  for (const [label, files] of failures) {
    console.error(`\n${label}:`);
    for (const file of files) console.error(`- ${file}`);
  }
  process.exit(1);
}
