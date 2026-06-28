import { normalizeGuideCardLayoutOptions } from "@/lib/rosary/cardUtils";
import { normalizeRosaryConfig } from "@/lib/rosary/configUtils";
import { isPrayerId, normalizePrayerLanguage } from "@/lib/rosary/prayerText";
import type {
  GuideCardCustomItem,
  GuideCardCustomItemKind,
  GuideCardCustomization,
  GuideCardLayoutOptions,
  MysterySetId,
  PrayerId,
  PrayerLanguage,
  RosaryCardSet,
  UserRosaryConfig,
} from "@/lib/rosary/types";

export const STORAGE_SCHEMA_VERSION = 2;

export const STORAGE_RECOVERY_MESSAGE =
  "Your saved Walk the Rosary data was from an older preview version or could not be loaded. Please create a new guide.";

type StoredCollection<T> = {
  schemaVersion: typeof STORAGE_SCHEMA_VERSION;
  items: T[];
};

export type StorageNormalizationResult<T> = {
  items: T[];
  recovered: boolean;
};

export function createStoredCollection<T>(items: T[]): StoredCollection<T> {
  return {
    schemaVersion: STORAGE_SCHEMA_VERSION,
    items,
  };
}

export function normalizeStoredRosaryConfigs(value: unknown): StorageNormalizationResult<UserRosaryConfig> {
  const { items, recovered } = unwrapCollection(value);
  const normalized = items
    .map((item) => normalizeStoredRosaryConfig(item))
    .filter((item): item is UserRosaryConfig => Boolean(item));

  return {
    items: normalized,
    recovered: recovered || normalized.length !== items.length,
  };
}

export function normalizeStoredGuideCardCustomizations(
  value: unknown,
): StorageNormalizationResult<GuideCardCustomization> {
  const { items, recovered } = unwrapCollection(value);
  const normalized = items
    .map((item) => normalizeStoredGuideCardCustomization(item))
    .filter((item): item is GuideCardCustomization => Boolean(item));

  return {
    items: normalized,
    recovered: recovered || normalized.length !== items.length,
  };
}

export function normalizeStoredCardSets(value: unknown): StorageNormalizationResult<RosaryCardSet> {
  const { items, recovered } = unwrapCollection(value);
  const normalized = items
    .map((item) => normalizeStoredCardSet(item))
    .filter((item): item is RosaryCardSet => Boolean(item));

  return {
    items: normalized,
    recovered: recovered || normalized.length !== items.length,
  };
}

export function normalizeStoredGuideCardLayoutOptions(value: unknown): GuideCardLayoutOptions {
  return normalizeGuideCardLayoutOptions(isRecord(value) ? value : {});
}

export function normalizeStoredGuideCardSelectedGuideId(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function unwrapCollection(value: unknown): StorageNormalizationResult<unknown> {
  if (Array.isArray(value)) {
    return {
      items: value,
      recovered: true,
    };
  }

  if (
    isRecord(value) &&
    value.schemaVersion === STORAGE_SCHEMA_VERSION &&
    Array.isArray(value.items)
  ) {
    return {
      items: value.items,
      recovered: false,
    };
  }

  return {
    items: [],
    recovered: value != null,
  };
}

function normalizeStoredRosaryConfig(value: unknown): UserRosaryConfig | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  if (
    !isNonEmptyString(value.id) ||
    !isNonEmptyString(value.name) ||
    !isNonEmptyString(value.baseTemplateId) ||
    !isNonEmptyString(value.createdAt) ||
    !isNonEmptyString(value.updatedAt) ||
    !Array.isArray(value.steps) ||
    !isMysterySetId(value.selectedMysterySetId) ||
    !isMysterySetMode(value.mysterySetMode)
  ) {
    return undefined;
  }

  return normalizeRosaryConfig(value as UserRosaryConfig);
}

export function normalizeStoredGuideCardCustomization(
  value: unknown,
): GuideCardCustomization | undefined {
  if (!isRecord(value) || !isNonEmptyString(value.guideId)) {
    return undefined;
  }

  return {
    guideId: value.guideId,
    itemOrder: stringArray(value.itemOrder),
    removedItemIds: stringArray(value.removedItemIds),
    fullPrayerOverrides: normalizeFullPrayerOverrides(value.fullPrayerOverrides),
    prayerLanguageOverrides: normalizePrayerLanguageOverrides(value.prayerLanguageOverrides),
    customItems: normalizeCustomItems(value.customItems),
    textOverrides: normalizeTextOverrides(value.textOverrides),
    updatedAt: isNonEmptyString(value.updatedAt) ? value.updatedAt : new Date().toISOString(),
  };
}

function normalizeStoredCardSet(value: unknown): RosaryCardSet | undefined {
  if (
    !isRecord(value) ||
    !isNonEmptyString(value.id) ||
    !isNonEmptyString(value.name) ||
    !isNonEmptyString(value.createdAt) ||
    !isNonEmptyString(value.updatedAt) ||
    typeof value.cardCount !== "number" ||
    !isRecord(value.masterCard) ||
    !Array.isArray(value.cardSlots)
  ) {
    return undefined;
  }

  return value as RosaryCardSet;
}

function normalizeFullPrayerOverrides(value: unknown): Partial<Record<PrayerId, boolean>> {
  if (!isRecord(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value)
      .filter(([prayerId]) => isPrayerId(prayerId))
      .map(([prayerId, enabled]) => [prayerId, Boolean(enabled)]),
  ) as Partial<Record<PrayerId, boolean>>;
}

export function normalizePrayerLanguageOverrides(
  value: unknown,
): Partial<Record<PrayerId, PrayerLanguage | "guide-default">> {
  if (!isRecord(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value)
      .filter(([prayerId]) => isPrayerId(prayerId))
      .map(([prayerId, language]) => [
        prayerId,
        language === "guide-default" ? "guide-default" : normalizePrayerLanguage(language),
      ]),
  ) as Partial<Record<PrayerId, PrayerLanguage | "guide-default">>;
}

function normalizeCustomItems(value: unknown): GuideCardCustomItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => normalizeCustomItem(item))
    .filter((item): item is GuideCardCustomItem => Boolean(item));
}

function normalizeCustomItem(value: unknown): GuideCardCustomItem | undefined {
  if (
    !isRecord(value) ||
    !isNonEmptyString(value.id) ||
    !isCustomItemKind(value.kind) ||
    !isNonEmptyString(value.sectionId) ||
    typeof value.text !== "string"
  ) {
    return undefined;
  }

  const prayerId = isPrayerId(value.prayerId) ? value.prayerId : undefined;

  if (value.kind === "prayer" && !prayerId) {
    return undefined;
  }

  return {
    id: value.id,
    kind: value.kind,
    sectionId: value.sectionId,
    text: value.text,
    prayerId,
    prayerLanguage: normalizePrayerLanguage(value.prayerLanguage),
    printMode: value.printMode === "full" ? "full" : "short",
    createdAt: isNonEmptyString(value.createdAt) ? value.createdAt : new Date().toISOString(),
  };
}

function isCustomItemKind(value: unknown): value is GuideCardCustomItemKind {
  return (
    value === "section" ||
    value === "note" ||
    value === "leader-note" ||
    value === "intention" ||
    value === "saint-invocation" ||
    value === "prayer" ||
    value === "custom-text"
  );
}

function normalizeTextOverrides(value: unknown): Record<string, string> {
  if (!isRecord(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).filter(
      (entry): entry is [string, string] => typeof entry[1] === "string",
    ),
  );
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? [...new Set(value.filter((item): item is string => typeof item === "string"))]
    : [];
}

function isMysterySetId(value: unknown): value is MysterySetId {
  return value === "joyful" || value === "luminous" || value === "sorrowful" || value === "glorious";
}

function isMysterySetMode(value: unknown): value is UserRosaryConfig["mysterySetMode"] {
  return value === "today" || value === "manual";
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
