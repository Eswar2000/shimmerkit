// Emits a standalone dist/styles.css from the single source of truth (STYLES).
// Importing the built ESM entry is safe in Node: custom-element registration is
// guarded behind a browser check, so nothing touches HTMLElement here.
import { STYLES } from "../dist/index.js";
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
await writeFile(join(root, "dist", "styles.css"), STYLES, "utf8");
console.log("shimmerkit: wrote dist/styles.css");
