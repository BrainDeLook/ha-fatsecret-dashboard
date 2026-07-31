import { copyFile, mkdir } from "node:fs/promises";

await mkdir("dist", { recursive: true });
await copyFile(
  "src/ha-fatsecret-dashboard.js",
  "dist/ha-fatsecret-dashboard.js",
);

console.log("Built dist/ha-fatsecret-dashboard.js");
