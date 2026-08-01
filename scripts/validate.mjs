import { access, readFile } from "node:fs/promises";

const manifest = JSON.parse(await readFile("hacs.json", "utf8"));
const packageMetadata = JSON.parse(await readFile("package.json", "utf8"));
if (manifest.name !== "FatSecret Dashboard Card") {
  throw new Error("Unexpected HACS display name");
}
if (manifest.filename !== "ha-fatsecret-dashboard.js") {
  throw new Error("hacs.json filename must match the repository artifact");
}

const artifact = `dist/${manifest.filename}`;
await access(artifact);
const source = await readFile(artifact, "utf8");
for (const marker of [
  'customElements.define("fatsecret-dashboard-card"',
  "window.customCards",
  "history/history_during_period",
  "const TRANSLATIONS",
  "grid-template-columns:repeat(3, 1fr)",
]) {
  if (!source.includes(marker)) {
    throw new Error(`Missing expected artifact marker: ${marker}`);
  }
}

if (!source.includes("en: Object.freeze") || !source.includes("ru: Object.freeze")) {
  throw new Error("English and Russian translations must be present");
}
if (source.includes("#ff9f43")) {
  throw new Error("Legacy orange accent is still present");
}
if (source.includes(".macros { grid-template-columns:1fr; }")) {
  throw new Error("Macronutrients must stay in one horizontal row");
}
if (!source.includes(`const CARD_VERSION = "${packageMetadata.version}"`)) {
  throw new Error("Card and package versions must match");
}

console.log("HACS manifest and distribution artifact are valid");
