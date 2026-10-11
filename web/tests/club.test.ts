// MOKA Club (static /club/club.js) runs in the browser; load it in a VM with a fake localStorage.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

function club() {
  const store = new Map<string, string>();
  const window: Record<string, unknown> = { dispatchEvent() {} };
  const ctx = {
    window,
    localStorage: { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => store.set(k, v), removeItem: (k: string) => store.delete(k) },
    CustomEvent: class {
      type: string;
      constructor(type: string) {
        this.type = type;
      }
    },
    Date, Math, JSON,
  };
  vm.runInNewContext(readFileSync(new URL("../../club/club.js", import.meta.url), "utf8"), ctx);
  return window.MokaClub as {
    award: (s: string, p: number) => { added: number; capped: boolean; passport: boolean; total: number };
    claim: (id: string) => { code: string; exp: number } | null;
    state: () => { points: number; passport: boolean };
    reset: () => void;
    DAILY_CAP: number;
  };
}

test("daily cap per source", () => {
  const c = club();
  assert.equal(c.award("line", 80).added, 80);
  const r = c.award("line", 80);
  assert.equal(r.added, 20);
  assert.ok(r.capped);
  assert.equal(c.award("line", 10).added, 0);
  assert.equal(c.award("rain", 30).added, 30, "other sources have their own cap");
});

test("passport bonus once all six experiences are stamped", () => {
  const c = club();
  let last;
  for (const s of ["line", "rain", "memory", "arCard", "arTable", "arSelfie"]) last = c.award(s, 0);
  assert.ok(last!.passport);
  assert.equal(c.state().points, 100);
  assert.equal(c.award("line", 0).passport, false, "bonus is paid only once");
});

test("claiming spends points and returns a well-formed code", () => {
  const c = club();
  assert.equal(c.claim("size"), null, "not enough points");
  c.award("line", 100); c.award("rain", 100);
  const code = c.claim("size")!;
  assert.match(code.code, /^MOKA-[A-Z0-9]{4}-[A-Z0-9]{2}$/);
  assert.equal(c.state().points, 50);
  assert.ok(code.exp > Date.now());
});
