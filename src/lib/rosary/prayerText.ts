import type { Prayer, PrayerId, PrayerLanguage, PrayerVariant } from "@/lib/rosary/types";

export function normalizePrayerText(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function normalizePrayerTextForCards(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

export function getPrayerIncipit(prayer: Prayer, language?: PrayerLanguage): string {
  const variant = getPrayerVariant(prayer, language);
  return variant.incipit || makeIncipit(variant.text);
}

export function getCompactPrayerText(prayer: Prayer, language?: PrayerLanguage): string {
  const variant = getPrayerVariant(prayer, language);
  return variant.shortText ?? variant.incipit ?? makeIncipit(variant.text);
}

export function getFullPrayerTextForCards(prayer: Prayer, language?: PrayerLanguage): string {
  return normalizePrayerTextForCards(getPrayerVariant(prayer, language).text);
}

export function formatPrayerOptionLabel(prayer: Prayer, language?: PrayerLanguage): string {
  const variant = getPrayerVariant(prayer, language);
  return `${variant.title} - ${getPrayerIncipit(prayer, language)}`;
}

export function getPrayerVariant(prayer: Prayer, language: PrayerLanguage = "en"): PrayerVariant {
  const variant = prayer.variants?.[language] ?? prayer.variants?.en;

  return {
    language: variant?.language ?? "en",
    title: variant?.title ?? prayer.title,
    incipit: variant?.incipit ?? prayer.incipit,
    text: variant?.text ?? prayer.text,
    shortText: variant?.shortText ?? prayer.shortText,
  };
}

export function getPrayerLanguage(
  prayerId: PrayerId,
  prayerLanguageById?: Partial<Record<PrayerId, PrayerLanguage>>,
): PrayerLanguage {
  return normalizePrayerLanguage(prayerLanguageById?.[prayerId]);
}

export function normalizePrayerLanguage(value: unknown): PrayerLanguage {
  return value === "la" || value === "es" ? value : "en";
}

export function hasPrayerVariant(prayer: Prayer, language: PrayerLanguage): boolean {
  return Boolean(prayer.variants?.[language]);
}

export const latinPrayerIds: PrayerId[] = [
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
];

function makeIncipit(text: string): string {
  const words = normalizePrayerTextForCards(text).split(" ").slice(0, 6).join(" ");
  return words.endsWith("...") ? words : `${words}...`;
}

export function isPrayerId(value: unknown): value is PrayerId {
  if (typeof value !== "string") {
    return false;
  }

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
