import type {
  GuideCardCustomization,
  GuideCardLayoutOptions,
  RosaryCardSet,
  UserRosaryConfig,
} from "@/lib/rosary/types";
import { normalizeRosaryConfig } from "@/lib/rosary/configUtils";
import {
  STORAGE_RECOVERY_MESSAGE,
  createStoredCollection,
  normalizeStoredCardSets,
  normalizeStoredGuideCardCustomizations,
  normalizeStoredGuideCardLayoutOptions,
  normalizeStoredGuideCardSelectedGuideId,
  normalizeStoredRosaryConfigs,
  normalizeStoredGuideCardCustomization,
} from "@/lib/rosary/storageSchema";

const CONFIGS_KEY = "rosary-walks:rosary-configs:v1";
const ACTIVE_CONFIG_KEY = "rosary-walks:active-config:v1";
const CARD_SETS_KEY = "rosary-walks:card-sets:v1";
const ACTIVE_CARD_SET_KEY = "rosary-walks:active-card-set:v1";
const GUIDE_CARD_OPTIONS_KEY = "rosary-walks:guide-card-options:v1";
const GUIDE_CARD_SELECTED_GUIDE_KEY = "rosary-walks:guide-card-selected-guide:v1";
const GUIDE_CARD_CUSTOMIZATIONS_KEY = "rosary-walks:guide-card-customizations:v1";
const STORAGE_RECOVERY_NOTICE_KEY = "rosary-walks:storage-recovery-notice:v1";

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

function readUnknownJson(key: string): { value: unknown; invalid: boolean } {
  if (!canUseLocalStorage()) {
    return { value: undefined, invalid: false };
  }

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return { value: undefined, invalid: false };
    }

    return { value: JSON.parse(raw), invalid: false };
  } catch {
    window.localStorage.removeItem(key);
    recordStorageRecovery();
    return { value: undefined, invalid: true };
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

function recordStorageRecovery() {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage?.setItem(STORAGE_RECOVERY_NOTICE_KEY, STORAGE_RECOVERY_MESSAGE);
  } catch {
    // Recovery notices are helpful but not required for app safety.
  }
}

export function getStorageRecoveryNotice(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.sessionStorage?.getItem(STORAGE_RECOVERY_NOTICE_KEY) ?? null;
  } catch {
    return null;
  }
}

export function clearStorageRecoveryNotice(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage?.removeItem(STORAGE_RECOVERY_NOTICE_KEY);
  } catch {
    // Ignore storage access failures.
  }
}

export function getSavedRosaryConfigs(): UserRosaryConfig[] {
  const stored = readUnknownJson(CONFIGS_KEY);
  const result = normalizeStoredRosaryConfigs(stored.value);

  if (stored.invalid || result.recovered) {
    recordStorageRecovery();
    writeJson(CONFIGS_KEY, createStoredCollection(result.items));
  }

  return result.items;
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
  const saved = writeJson(CONFIGS_KEY, createStoredCollection(next));
  setActiveRosaryConfig(nextConfig.id);
  return saved;
}

export function updateRosaryConfig(config: UserRosaryConfig): boolean {
  return saveRosaryConfig(config);
}

export function deleteRosaryConfig(id: string): boolean {
  const configs = getSavedRosaryConfigs().filter((config) => config.id !== id);
  const saved = writeJson(CONFIGS_KEY, createStoredCollection(configs));
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
  const stored = readUnknownJson(CARD_SETS_KEY);
  const result = normalizeStoredCardSets(stored.value);

  if (stored.invalid || result.recovered) {
    recordStorageRecovery();
    writeJson(CARD_SETS_KEY, createStoredCollection(result.items));
  }

  return result.items;
}

export function saveCardSet(cardSet: RosaryCardSet): boolean {
  const cardSets = getSavedCardSets();
  const next = [...cardSets.filter((item) => item.id !== cardSet.id), cardSet];
  const saved = writeJson(CARD_SETS_KEY, createStoredCollection(next));
  setActiveCardSet(cardSet.id);
  return saved;
}

export function updateCardSet(cardSet: RosaryCardSet): boolean {
  return saveCardSet(cardSet);
}

export function deleteCardSet(id: string): boolean {
  const cardSets = getSavedCardSets().filter((cardSet) => cardSet.id !== id);
  return writeJson(CARD_SETS_KEY, createStoredCollection(cardSets));
}

export function getActiveCardSet(): RosaryCardSet | undefined {
  const activeId = readJson<string | null>(ACTIVE_CARD_SET_KEY, null);
  return getSavedCardSets().find((cardSet) => cardSet.id === activeId);
}

export function setActiveCardSet(id: string): boolean {
  return writeJson(ACTIVE_CARD_SET_KEY, id);
}

export function getGuideCardLayoutOptions(): GuideCardLayoutOptions {
  return normalizeStoredGuideCardLayoutOptions(readJson<unknown>(GUIDE_CARD_OPTIONS_KEY, {}));
}

export function saveGuideCardLayoutOptions(options: GuideCardLayoutOptions): boolean {
  return writeJson(GUIDE_CARD_OPTIONS_KEY, normalizeStoredGuideCardLayoutOptions(options));
}

export function getGuideCardSelectedGuideId(): string | null {
  return normalizeStoredGuideCardSelectedGuideId(readJson<unknown>(GUIDE_CARD_SELECTED_GUIDE_KEY, null));
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
    customItems: [],
    textOverrides: {},
    updatedAt: new Date().toISOString(),
  };
}

export function getGuideCardCustomizations(): GuideCardCustomization[] {
  const stored = readUnknownJson(GUIDE_CARD_CUSTOMIZATIONS_KEY);
  const result = normalizeStoredGuideCardCustomizations(stored.value);

  if (stored.invalid || result.recovered) {
    recordStorageRecovery();
    writeJson(GUIDE_CARD_CUSTOMIZATIONS_KEY, createStoredCollection(result.items));
  }

  return result.items;
}

export function getGuideCardCustomization(guideId: string): GuideCardCustomization {
  return (
    getGuideCardCustomizations().find((customization) => customization.guideId === guideId) ??
    createEmptyGuideCardCustomization(guideId)
  );
}

export function saveGuideCardCustomization(customization: GuideCardCustomization): boolean {
  const normalizedCustomization = normalizeStoredGuideCardCustomization(customization);

  if (!normalizedCustomization) {
    return false;
  }

  const nextCustomization: GuideCardCustomization = {
    ...normalizedCustomization,
    updatedAt: new Date().toISOString(),
  };
  const customizations = getGuideCardCustomizations();
  const next = [
    ...customizations.filter((item) => item.guideId !== nextCustomization.guideId),
    nextCustomization,
  ];

  return writeJson(GUIDE_CARD_CUSTOMIZATIONS_KEY, createStoredCollection(next));
}

export function resetGuideCardCustomization(guideId: string): boolean {
  return writeJson(
    GUIDE_CARD_CUSTOMIZATIONS_KEY,
    createStoredCollection(
      getGuideCardCustomizations().filter((customization) => customization.guideId !== guideId),
    ),
  );
}
