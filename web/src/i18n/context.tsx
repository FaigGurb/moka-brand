"use client";

import { createContext, useContext, useEffect, type ReactNode } from "react";
import { DICTS, type Dict, type Locale } from "./dict";

const Ctx = createContext<{ locale: Locale; t: Dict }>({ locale: "az", t: DICTS.az });

export function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  // One static root layout serves all languages, so the document language is set here.
  useEffect(() => {
    document.documentElement.lang = locale;
    try {
      localStorage.setItem("moka-lang", locale);
    } catch {
      /* storage unavailable: nothing to remember */
    }
  }, [locale]);
  return <Ctx.Provider value={{ locale, t: DICTS[locale] }}>{children}</Ctx.Provider>;
}

export const useI18n = () => useContext(Ctx);
