// Every language must have exactly the same copy structure as Azerbaijani (the source).
import { test } from "node:test";
import assert from "node:assert/strict";
import { DICTS, LOCALES } from "../src/i18n/dict.ts";

function shape(v: unknown, path = "", out: string[] = []): string[] {
  if (Array.isArray(v)) {
    out.push(`${path}[${v.length}]`);
    v.forEach((x, i) => shape(x, `${path}[${i}]`, out));
  } else if (v && typeof v === "object") {
    for (const k of Object.keys(v).sort()) shape((v as Record<string, unknown>)[k], `${path}.${k}`, out);
  } else out.push(`${path}:${typeof v}`);
  return out;
}

test("en and ru have the same shape as az", () => {
  const az = shape(DICTS.az);
  for (const l of LOCALES) assert.deepEqual(shape(DICTS[l]), az, `shape mismatch in ${l}`);
});

test("no empty strings except deliberate blanks", () => {
  // the Azerbaijani day-palette subtitles are intentionally empty (the names are already Azerbaijani)
  const allowed = /^\.day\.slides\[\d\]\.sub$|^\.beans/;
  // food descriptions stay blank until MOKA sends its real menu (no invented dishes)
  const blank = /^\.menu\.items\.food\[\d\]\.desc$/;
  for (const l of LOCALES) {
    const walk = (v: unknown, p: string) => {
      if (typeof v === "string") assert.ok(v.trim() !== "" || blank.test(p) || (l === "az" && allowed.test(p)), `${l}${p} is empty`);
      else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) walk(x, Array.isArray(v) ? `${p}[${k}]` : `${p}.${k}`);
    };
    walk(DICTS[l], "");
  }
});

test("Azerbaijani copy uses Azerbaijani letters, not look-alikes", () => {
  const text = JSON.stringify(DICTS.az);
  assert.ok(text.includes("ə"), "schwa present");
  assert.ok(!/[ǝƏ̈]/.test(text.replace(/Ə/g, "")), "no turned-e (U+01DD) look-alike");
});
