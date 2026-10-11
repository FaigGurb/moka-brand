// Links to the static pages that live beside the Next.js export (AR demo, game, previous site).
const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const LINKS = {
  ar: `${base}/ar/`,
  arCard: `${base}/ar/target.png`,
  game: `${base}/game/`,
  v1: `${base}/v1/`,
  repo: "https://github.com/FaigGurb/moka-brand",
};

export const NAV = [
  { href: "#konsepsiya", label: "Konsepsiya" },
  { href: "#reng", label: "Rəng" },
  { href: "#qovurma", label: "Qovurma" },
  { href: "#paket", label: "Paketlər" },
  { href: "#kafe", label: "Kafedə" },
  { href: "#tecrube", label: "AR və oyun" },
];
