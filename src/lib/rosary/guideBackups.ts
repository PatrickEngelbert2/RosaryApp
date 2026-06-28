import { normalizeRosaryConfig } from "@/lib/rosary/configUtils";
import {
  normalizeStoredGuideCardCustomizations,
  normalizeStoredRosaryConfigs,
} from "@/lib/rosary/storageSchema";
import type { GuideCardCustomization, UserRosaryConfig } from "@/lib/rosary/types";

export const GUIDE_BACKUP_APP_ID = "walk-the-rosary";
export const GUIDE_BACKUP_VERSION = 1;

export type GuideBackupType = "single-guide" | "all-guides";

export type GuideBackupFile = {
  app: typeof GUIDE_BACKUP_APP_ID;
  version: typeof GUIDE_BACKUP_VERSION;
  exportedAt: string;
  type: GuideBackupType;
  guides: UserRosaryConfig[];
  cardCustomizations: GuideCardCustomization[];
};

export type GuideBackupImportResult = {
  guides: UserRosaryConfig[];
  cardCustomizations: GuideCardCustomization[];
  importedGuideCount: number;
  importedCustomizationCount: number;
  remappedGuideIds: Record<string, string>;
};

export type GuideBackupImportFailure = {
  ok: false;
  message: string;
};

export type GuideBackupImportSuccess = {
  ok: true;
  result: GuideBackupImportResult;
};

export type GuideBackupImportOutcome = GuideBackupImportSuccess | GuideBackupImportFailure;

const INVALID_BACKUP_MESSAGE =
  "This backup file could not be imported. It may be from an incompatible preview version.";

export function createGuideBackupFile(input: {
  type: GuideBackupType;
  guides: UserRosaryConfig[];
  cardCustomizations?: GuideCardCustomization[];
  exportedAt?: Date;
}): GuideBackupFile {
  const guideIds = new Set(input.guides.map((guide) => guide.id));
  const relatedCustomizations = (input.cardCustomizations ?? []).filter((customization) =>
    guideIds.has(customization.guideId),
  );

  return {
    app: GUIDE_BACKUP_APP_ID,
    version: GUIDE_BACKUP_VERSION,
    exportedAt: (input.exportedAt ?? new Date()).toISOString(),
    type: input.type,
    guides: input.guides.map((guide) => normalizeRosaryConfig(guide)),
    cardCustomizations: relatedCustomizations,
  };
}

export function createGuideBackupFilename(name: string, type: GuideBackupType): string {
  if (type === "all-guides") {
    return "walk-the-rosary-guides-backup.json";
  }

  return `walk-the-rosary-${slugify(name || "guide")}.json`;
}

export function parseGuideBackupJson(text: string): GuideBackupImportOutcome {
  try {
    return validateGuideBackupFile(JSON.parse(text));
  } catch {
    return {
      ok: false,
      message: INVALID_BACKUP_MESSAGE,
    };
  }
}

export function validateGuideBackupFile(value: unknown): GuideBackupImportOutcome {
  if (!isBackupRecord(value)) {
    return {
      ok: false,
      message: INVALID_BACKUP_MESSAGE,
    };
  }

  const guideResult = normalizeStoredRosaryConfigs({
    schemaVersion: 2,
    items: value.guides,
  });
  const customizationResult = normalizeStoredGuideCardCustomizations({
    schemaVersion: 2,
    items: value.cardCustomizations ?? [],
  });

  if (guideResult.items.length === 0) {
    return {
      ok: false,
      message: INVALID_BACKUP_MESSAGE,
    };
  }

  const guideIds = new Set(guideResult.items.map((guide) => guide.id));

  return {
    ok: true,
    result: {
      guides: guideResult.items,
      cardCustomizations: customizationResult.items.filter((customization) =>
        guideIds.has(customization.guideId),
      ),
      importedGuideCount: guideResult.items.length,
      importedCustomizationCount: customizationResult.items.length,
      remappedGuideIds: {},
    },
  };
}

export function prepareGuideBackupImport(input: {
  backup: Pick<GuideBackupFile, "guides" | "cardCustomizations">;
  existingGuides: UserRosaryConfig[];
  existingCustomizations?: GuideCardCustomization[];
  createId: (prefix: string) => string;
  now?: Date;
}): GuideBackupImportResult {
  const existingGuideIds = new Set(input.existingGuides.map((guide) => guide.id));
  const usedGuideIds = new Set(existingGuideIds);
  const usedNames = new Set(input.existingGuides.map((guide) => normalizeName(guide.name)));
  const now = (input.now ?? new Date()).toISOString();
  const remappedGuideIds: Record<string, string> = {};
  const importedGuides = input.backup.guides.map((guide) => {
    const originalId = guide.id;
    const guideId = usedGuideIds.has(originalId) ? createUniqueId("rosary-config", usedGuideIds, input.createId) : originalId;
    const name = createUniqueName(guide.name, usedNames, guideId !== originalId);

    usedGuideIds.add(guideId);
    usedNames.add(normalizeName(name));

    if (guideId !== originalId) {
      remappedGuideIds[originalId] = guideId;
    }

    return normalizeRosaryConfig({
      ...guide,
      id: guideId,
      name,
      createdAt: guideId === originalId ? guide.createdAt : now,
      updatedAt: now,
    });
  });
  const importedGuideIds = new Set(importedGuides.map((guide) => guide.id));
  const importedCustomizations = input.backup.cardCustomizations
    .map((customization) => ({
      ...customization,
      guideId: remappedGuideIds[customization.guideId] ?? customization.guideId,
      updatedAt: now,
    }))
    .filter((customization) => importedGuideIds.has(customization.guideId));

  return {
    guides: [...input.existingGuides, ...importedGuides],
    cardCustomizations: [
      ...(input.existingCustomizations ?? []).filter(
        (customization) => !importedGuideIds.has(customization.guideId),
      ),
      ...importedCustomizations,
    ],
    importedGuideCount: importedGuides.length,
    importedCustomizationCount: importedCustomizations.length,
    remappedGuideIds,
  };
}

function isBackupRecord(value: unknown): value is Partial<GuideBackupFile> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    (value as Partial<GuideBackupFile>).app === GUIDE_BACKUP_APP_ID &&
    (value as Partial<GuideBackupFile>).version === GUIDE_BACKUP_VERSION &&
    ((value as Partial<GuideBackupFile>).type === "single-guide" ||
      (value as Partial<GuideBackupFile>).type === "all-guides") &&
    typeof (value as Partial<GuideBackupFile>).exportedAt === "string" &&
    Array.isArray((value as Partial<GuideBackupFile>).guides)
  );
}

function createUniqueId(
  prefix: string,
  usedIds: Set<string>,
  createId: (prefix: string) => string,
): string {
  let nextId = createId(prefix);

  while (usedIds.has(nextId)) {
    nextId = createId(prefix);
  }

  return nextId;
}

function createUniqueName(name: string, usedNames: Set<string>, forceCopy: boolean): string {
  const baseName = name.trim() || "Imported Rosary Guide";

  if (!forceCopy && !usedNames.has(normalizeName(baseName))) {
    return baseName;
  }

  let copyIndex = 1;
  let candidate = `${baseName} Copy`;

  while (usedNames.has(normalizeName(candidate))) {
    copyIndex += 1;
    candidate = `${baseName} Copy ${copyIndex}`;
  }

  return candidate;
}

function normalizeName(name: string): string {
  return name.trim().toLocaleLowerCase();
}

function slugify(value: string): string {
  const slug = value
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);

  return slug || "guide";
}
