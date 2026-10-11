import { test } from "node:test";
import assert from "node:assert/strict";
import { bakuHour, daySlot } from "../src/lib/day.ts";

test("day palette follows the clock", () => {
  const names = [0, 5, 6, 10, 11, 15, 16, 19, 20, 23].map((h) => daySlot(h).name);
  assert.deepEqual(names, ["Şəhər", "Şəhər", "Səhər", "Səhər", "Günorta", "Günorta", "Axşam", "Axşam", "Şəhər", "Şəhər"]);
});

test("hour is taken in Baku time (UTC+4)", () => {
  assert.equal(bakuHour(new Date("2026-10-11T20:30:00Z")), 0);
  assert.equal(bakuHour(new Date("2026-10-11T05:00:00Z")), 9);
});
