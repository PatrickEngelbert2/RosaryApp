import type { Prayer, PrayerId } from "@/lib/rosary/types";

export function normalizePrayerText(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function normalizePrayerTextForCards(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

export function getPrayerIncipit(prayer: Prayer): string {
  return prayer.incipit || makeIncipit(prayer.text);
}

export function getCompactPrayerText(prayer: Prayer): string {
  return getPrayerIncipit(prayer);
}

export function getFullPrayerTextForCards(prayer: Prayer): string {
  return normalizePrayerTextForCards(prayer.text);
}

export function formatPrayerOptionLabel(prayer: Prayer): string {
  return `${prayer.title} - ${getPrayerIncipit(prayer)}`;
}

function makeIncipit(text: string): string {
  const words = normalizePrayerTextForCards(text).split(" ").slice(0, 6).join(" ");
  return words.endsWith("...") ? words : `${words}...`;
}

export function isPrayerId(value: string): value is PrayerId {
  return [
    "sign-of-the-cross",
    "apostles-creed",
    "our-father",
    "hail-mary",
    "glory-be",
    "fatima-prayer",
    "hail-holy-queen",
    "closing-prayer",
    "memorare",
    "st-michael-prayer",
  ].includes(value);
}
