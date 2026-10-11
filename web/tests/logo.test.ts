import { test } from "node:test";
import assert from "node:assert/strict";
import { CUT_BOTTOM, CUT_TOP, LETTERS, halves } from "../src/lib/logo.ts";

test("every letter is split by the signature line", () => {
  for (const l of LETTERS) {
    const h = halves(l.poly);
    assert.ok(h.top.length >= 3 && h.bottom.length >= 3, `${l.id} has two halves`);
    assert.ok(h.top.every(([, y]) => y <= CUT_TOP + 1e-9), `${l.id} top stays above the line`);
    assert.ok(h.bottom.every(([, y]) => y >= CUT_BOTTOM - 1e-9), `${l.id} bottom stays below the line`);
  }
});

test("the static AR helper mirrors the site geometry", async () => {
  const art = await import("../../ar/shared/moka-art.js");
  assert.equal(art.CUT_TOP, CUT_TOP);
  assert.equal(art.CUT_BOTTOM, CUT_BOTTOM);
  for (const l of LETTERS.filter((x) => x.id !== "O")) {
    const other = art.LETTERS.find((x: { id: string }) => x.id === l.id);
    assert.deepEqual(other.poly, l.poly, `${l.id} polygon differs between web/ and ar/`);
  }
});
