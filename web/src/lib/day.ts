/** The day palette by the clock in Baku (the café's time, not the visitor's). */
export const DAY_PALETTE = [
  { key: "seher", name: "Səhər", hex: "#C89B6D", rgb: "200 155 109", from: 6 },
  { key: "gunorta", name: "Günorta", hex: "#D9B56A", rgb: "217 181 106", from: 11 },
  { key: "axsam", name: "Axşam", hex: "#A8643A", rgb: "168 100 58", from: 16 },
  { key: "sheher", name: "Şəhər", hex: "#8E8A84", rgb: "142 138 132", from: 20 },
] as const;

export type DaySlot = (typeof DAY_PALETTE)[number];

export function bakuHour(now = new Date()) {
  try {
    return Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hourCycle: "h23", timeZone: "Asia/Baku" }).format(now));
  } catch {
    return now.getHours();
  }
}

export function daySlot(hour: number): DaySlot {
  if (hour >= 20 || hour < 6) return DAY_PALETTE[3];
  return [...DAY_PALETTE].reverse().find((d) => hour >= d.from) ?? DAY_PALETTE[0];
}
