import { access, readFile } from "node:fs/promises";

const manifest = JSON.parse(await readFile("hacs.json", "utf8"));
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
]) {
  if (!source.includes(marker)) {
    throw new Error(`Missing expected artifact marker: ${marker}`);
  }
}

console.log("HACS manifest and distribution artifact are valid");
