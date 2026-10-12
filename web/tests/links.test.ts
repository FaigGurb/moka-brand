import { test } from "node:test";
import assert from "node:assert/strict";
import { HOME, links } from "../src/lib/site.ts";

test("static page links keep the language and never point at the domain root", () => {
  for (const l of ["az", "en", "ru"] as const) {
    const L = links(l);
    for (const [k, v] of Object.entries(L)) {
      if (k === "repo") continue;
      assert.ok(!v.startsWith("//"), `${k} is protocol-relative`);
      if (k === "arCard" || k === "v1") continue;
      if (l !== "az" && !["menu", "privacy", "brand", "partners"].includes(k)) assert.ok(v.endsWith(`?lang=${l}`), `${k} keeps ?lang=${l}: ${v}`);
    }
    assert.ok(L.menu.startsWith(HOME[l]), "menu lives under the language home");
  }
});
