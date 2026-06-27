import type {
  GuideCardCustomization,
  GuideCardLayoutOptions,
  PrayerId,
  PrayerLanguage,
  RosaryCardSet,
  UserRosaryConfig,
} from "@/lib/rosary/types";
import { normalizeGuideCardLayoutOptions } from "@/lib/rosary/cardUtils";
import { normalizeRosaryConfig } from "@/lib/rosary/configUtils";
import { isPrayerId, normalizePrayerLanguage } from "@/lib/rosary/prayerText";

const CONFIGS_KEY = "rosary-walks:rosary-configs:v1";
const ACTIVE_CONFIG_KEY = "rosary-walks:active-config:v1";
const CARD_SETS_KEY = "rosary-walks:card-sets:v1";
const ACTIVE_CARD_SET_KEY = "rosary-walks:active-card-set:v1";
const GUIDE_CARD_OPTIONS_KEY = "rosary-walks:guide-card-options:v1";
const GUIDE_CARD_SELECTED_GUIDE_KEY = "rosary-walks:guide-card-selected-guide:v1";
const GUIDE_CARD_CUSTOMIZATIONS_KEY = "rosary-walks:guide-card-customizations:v1";

function canUseLocalStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readJson<T>(key: string, fallback: T): T {
  if (!canUseLocalStorage()) {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }

    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): boolean {
  if (!canUseLocalStorage()) {
    return false;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function getSavedRosaryConfigs(): UserRosaryConfig[] {
  const configs = readJson<UserRosaryConfig[]>(CONFIGS_KEY, []);
  return Array.isArray(configs) ? configs.map(normalizeRosaryConfig) : [];
}

export function saveRosaryConfig(config: UserRosaryConfig): boolean {
  const normalizedConfig = normalizeRosaryConfig({
    ...config,
    updatedAt: new Date().toISOString(),
  });
  const configs = getSavedRosaryConfigs();
  const existing = configs.find((item) => item.id === normalizedConfig.id);
  const nextConfig = {
    ...normalizedConfig,
    createdAt: existing?.createdAt ?? normalizedConfig.createdAt,
  };
  const next = [...configs.filter((item) => item.id !== nextConfig.id), nextConfig];
  const saved = writeJson(CONFIGS_KEY, next);
  setActiveRosaryConfig(nextConfig.id);
  return saved;
}

export function updateRosaryConfig(config: UserRosaryConfig): boolean {
  return saveRosaryConfig(config);
}

export function deleteRosaryConfig(id: string): boolean {
  const configs = getSavedRosaryConfigs().filter((config) => config.id !== id);
  const saved = writeJson(CONFIGS_KEY, configs);
  const activeId = readJson<string | null>(ACTIVE_CONFIG_KEY, null);

  if (activeId === id) {
    if (configs[0]) {
      setActiveRosaryConfig(configs[0].id);
    } else {
      writeJson(ACTIVE_CONFIG_KEY, null);
    }
  }

  return saved;
}

export function getActiveRosaryConfig(): UserRosaryConfig | undefined {
  const activeId = readJson<string | null>(ACTIVE_CONFIG_KEY, null);
  return getSavedRosaryConfigs().find((config) => config.id === activeId);
}

export function setActiveRosaryConfig(id: string): boolean {
  return writeJson(ACTIVE_CONFIG_KEY, id);
}

export function getSavedCardSets(): RosaryCardSet[] {
  const cardSets = readJson<RosaryCardSet[]>(CARD_SETS_KEY, []);
  return Array.isArray(cardSets) ? cardSets : [];
}

export function saveCardSet(cardSet: RosaryCardSet): boolean {
  const cardSets = getSavedCardSets();
  const next = [...cardSets.filter((item) => item.id !== cardSet.id), cardSet];
  const saved = writeJson(CARD_SETS_KEY, next);
  setActiveCardSet(cardSet.id);
  return saved;
}

export function updateCardSet(cardSet: RosaryCardSet): boolean {
  return saveCardSet(cardSet);
}

export function deleteCardSet(id: string): boolean {
  const cardSets = getSavedCardSets().filter((cardSet) => cardSet.id !== id);
  return writeJson(CARD_SETS_KEY, cardSets);
}

export function getActiveCardSet(): RosaryCardSet | undefined {
  const activeId = readJson<string | null>(ACTIVE_CARD_SET_KEY, null);
  return getSavedCardSets().find((cardSet) => cardSet.id === activeId);
}

export function setActiveCardSet(id: string): boolean {
  return writeJson(ACTIVE_CARD_SET_KEY, id);
}

export function getGuideCardLayoutOptions(): GuideCardLayoutOptions {
  return normalizeGuideCardLayoutOptions(readJson<Partial<GuideCardLayoutOptions>>(GUIDE_CARD_OPTIONS_KEY, {}));
}

export function saveGuideCardLayoutOptions(options: GuideCardLayoutOptions): boolean {
  return writeJson(GUIDE_CARD_OPTIONS_KEY, normalizeGuideCardLayoutOptions(options));
}

export function getGuideCardSelectedGuideId(): string | null {
  return readJson<string | null>(GUIDE_CARD_SELECTED_GUIDE_KEY, null);
}

export function saveGuideCardSelectedGuideId(id: string): boolean {
  return writeJson(GUIDE_CARD_SELECTED_GUIDE_KEY, id);
}

export function createEmptyGuideCardCustomization(guideId: string): GuideCardCustomization {
  return {
    guideId,
    itemOrder: [],
    removedItemIds: [],
    fullPrayerOverrides: {},
    prayerLanguageOverrides: {},
    textOverrides: {},
    updatedAt: new Date().toISOString(),
  };
}

export function getGuideCardCustomizations(): GuideCardCustomization[] {
  const customizations = readJson<GuideCardCustomization[]>(GUIDE_CARD_CUSTOMIZATIONS_KEY, []);

  return Array.isArray(customizations)
    ? customizations.filter((customization) => Boolean(customization.guideId)).map(normalizeGuideCardCustomization)
    : [];
}

export function getGuideCardCustomization(guideId: string): GuideCardCustomization {
  return (
    getGuideCardCustomizations().find((customization) => customization.guideId === guideId) ??
    createEmptyGuideCardCustomization(guideId)
  );
}

export function saveGuideCardCustomization(customization: GuideCardCustomization): boolean {
  const nextCustomization = {
    ...customization,
    itemOrder: [...new Set(customization.itemOrder)],
    removedItemIds: [...new Set(customization.removedItemIds)],
    fullPrayerOverrides: { ...customization.fullPrayerOverrides },
    prayerLanguageOverrides: normalizePrayerLanguageOverrides(customization.prayerLanguageOverrides),
    textOverrides: { ...customization.textOverrides },
    updatedAt: new Date().toISOString(),
  };
  const customizations = getGuideCardCustomizations();
  const next = [
    ...customizations.filter((item) => item.guideId !== nextCustomization.guideId),
    nextCustomization,
  ];

  return writeJson(GUIDE_CARD_CUSTOMIZATIONS_KEY, next);
}

function normalizeGuideCardCustomization(customization: GuideCardCustomization): GuideCardCustomization {
  return {
    ...customization,
    itemOrder: Array.isArray(customization.itemOrder) ? customization.itemOrder : [],
    removedItemIds: Array.isArray(customization.removedItemIds) ? customization.removedItemIds : [],
    fullPrayerOverrides: customization.fullPrayerOverrides ?? {},
    prayerLanguageOverrides: normalizePrayerLanguageOverrides(customization.prayerLanguageOverrides),
    textOverrides: customization.textOverrides ?? {},
    updatedAt: customization.updatedAt ?? new Date().toISOString(),
  };
}

function normalizePrayerLanguageOverrides(
  overrides: Partial<Record<PrayerId, PrayerLanguage | "guide-default">> | undefined,
): Partial<Record<PrayerId, PrayerLanguage | "guide-default">> {
  if (!overrides) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(overrides)
      .filter(([prayerId]) => isPrayerId(prayerId))
      .map(([prayerId, language]) => [
        prayerId,
        language === "guide-default" ? "guide-default" : normalizePrayerLanguage(language),
      ]),
  ) as Partial<Record<PrayerId, PrayerLanguage | "guide-default">>;
}

export function resetGuideCardCustomization(guideId: string): boolean {
  return writeJson(
    GUIDE_CARD_CUSTOMIZATIONS_KEY,
    getGuideCardCustomizations().filter((customization) => customization.guideId !== guideId),
  );
}
