import type { Metadata } from "next";
import { Site } from "@/components/Site";
import { DICTS } from "@/i18n/dict";

export const metadata: Metadata = {
  title: DICTS.ru.meta.title,
  description: DICTS.ru.meta.description,
  alternates: { languages: { az: "/moka-brand/", en: "/moka-brand/en/", ru: "/moka-brand/ru/" } },
};

export default function Page() {
  return <Site locale="ru" />;
}
