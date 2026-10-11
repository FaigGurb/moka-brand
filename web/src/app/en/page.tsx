import type { Metadata } from "next";
import { Site } from "@/components/Site";
import { DICTS } from "@/i18n/dict";

export const metadata: Metadata = {
  title: DICTS.en.meta.title,
  description: DICTS.en.meta.description,
  alternates: { languages: { az: "/moka-brand/", en: "/moka-brand/en/", ru: "/moka-brand/ru/" } },
};

export default function Page() {
  return <Site locale="en" />;
}
