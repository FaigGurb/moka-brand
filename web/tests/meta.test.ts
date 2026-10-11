import { test } from "node:test";
import assert from "node:assert/strict";
import { pageMeta } from "../src/lib/meta.ts";

test("pages carry canonical, hreflang, OG image and stay noindex while a concept", () => {
  const m = pageMeta("en", "T", "D", "menu/");
  assert.equal(m.alternates?.canonical, "/en/menu/");
  const langs = m.alternates?.languages as Record<string, string>;
  assert.deepEqual(Object.keys(langs).sort(), ["az", "en", "ru", "x-default"]);
  assert.equal(langs.az, "/menu/");
  const og = m.openGraph as { images: { url: string }[] };
  assert.equal(og.images[0].url, "/og-en.png");
  assert.deepEqual(m.robots, { index: false, follow: false });
});
