// Copies the static export (web/out) to the repository root, which GitHub Pages serves.
// Only files produced by the export are replaced; ar/, game/, v1/ and the repo's own files are never touched.
import { cpSync, existsSync, readdirSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const web = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(web, "out");
const root = join(web, "..");
const PROTECTED = new Set(["ar", "game", "club", "fonts", "docs", "vendor", "v1", "web", "README.md", "CLAUDE.md", ".git", ".gitattributes", ".nojekyll"]);

if (!existsSync(join(out, "index.html"))) {
  console.error("web/out/index.html not found — run `npm run build` first.");
  process.exit(1);
}

// Remove the previous export (_next chunks change names on every build).
for (const name of ["_next", "404", "404.html", "index.txt", "en", "ru", "brand"]) {
  const p = join(root, name);
  if (existsSync(p)) rmSync(p, { recursive: true, force: true });
}

for (const name of readdirSync(out)) {
  if (PROTECTED.has(name)) {
    console.warn(`skipped protected path: ${name}`);
    continue;
  }
  // replace each exported file/folder wholesale so renamed chunks or pages never linger
  rmSync(join(root, name), { recursive: true, force: true });
  cpSync(join(out, name), join(root, name), { recursive: true });
  console.log(`copied ${name}`);
}
console.log("Export copied to the repository root. Commit and push to publish on GitHub Pages.");
