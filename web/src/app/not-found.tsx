import type { Metadata } from "next";
import { Logo } from "@/components/Logo";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const metadata: Metadata = { title: "404 — MOKA", robots: { index: false } };

// One static 404 for every language: the cup did not reach the line.
export default function NotFound() {
  const rows = [
    { lang: "az", t: "Bu səhifə xəttə çatmadı.", a: "Ana səhifəyə qayıt", href: `${BASE}/` },
    { lang: "en", t: "This page didn't reach the line.", a: "Back to the home page", href: `${BASE}/en/` },
    { lang: "ru", t: "Эта страница не дошла до линии.", a: "Вернуться на главную", href: `${BASE}/ru/` },
  ];
  return (
    <main className="flex min-h-[100svh] flex-col justify-center bg-espresso px-5 py-16 text-paper md:px-10">
      <div className="mx-auto w-full max-w-[1100px]">
        <Logo className="h-7 w-auto" />
        <p className="mt-12 font-[family-name:var(--font-display)] text-[clamp(96px,22vw,260px)] leading-none font-medium tracking-[-0.04em]">404</p>
        <div className="my-8 h-[3px] w-full bg-gradient-to-r from-glow via-gunorta to-transparent" aria-hidden="true" />
        <ul className="grid gap-6 md:grid-cols-3">
          {rows.map((r) => (
            <li key={r.lang} lang={r.lang} className="flex flex-col gap-3">
              <p className="text-xl leading-snug">{r.t}</p>
              <a href={r.href} className="text-[13px] font-bold tracking-[0.14em] text-glow uppercase underline-offset-4 hover:underline">
                {r.a} →
              </a>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
