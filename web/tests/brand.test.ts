import { test } from "node:test";
import assert from "node:assert/strict";
import { BRAND } from "../src/i18n/brand.ts";
import { cmyk, contrast } from "../src/lib/color.ts";

const shape = (v: unknown, p = ""): string[] =>
  Array.isArray(v) ? [`${p}[${v.length}]`, ...v.flatMap((x, i) => shape(x, `${p}[${i}]`))]
  : v && typeof v === "object" ? Object.keys(v).sort().flatMap((k) => shape((v as Record<string, unknown>)[k], `${p}.${k}`))
  : [`${p}:${typeof v}`];

test("brand book copy has the same shape in az, en, ru", () => {
  assert.deepEqual(shape(BRAND.en), shape(BRAND.az));
  assert.deepEqual(shape(BRAND.ru), shape(BRAND.az));
});

test("WCAG contrast maths", () => {
  assert.equal(Math.round(contrast("#000000", "#FFFFFF")), 21);
  assert.ok(contrast("#1B1714", "#F5F1EA") > 15);
  assert.equal(contrast("#C89B6D", "#C89B6D"), 1);
});

test("CMYK conversion", () => {
  assert.deepEqual(cmyk("#000000"), [0, 0, 0, 100]);
  assert.deepEqual(cmyk("#FFFFFF"), [0, 0, 0, 0]);
  assert.deepEqual(cmyk("#FF0000"), [0, 100, 100, 0]);
});
