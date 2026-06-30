import {
  saintDirectory,
  saintDirectoryById,
  normalizeSaintSearchText,
} from "@/lib/rosary/saintDirectory";
import type { SaintInvocations } from "@/lib/rosary/types";

const saintIdByNormalizedName = new Map(
  saintDirectory.flatMap((saint) => [
    [normalizeSaintName(saint.name), saint.id],
    ...(saint.aliases ?? []).map((alias) => [normalizeSaintName(alias), saint.id] as const),
  ]),
);

export function normalizeSaintName(value: string): string {
  return normalizeSaintSearchText(value);
}

export function getSaintDirectoryEntryByName(name: string) {
  const saintId = saintIdByNormalizedName.get(normalizeSaintName(name));

  return saintId ? saintDirectoryById[saintId] : undefined;
}

export function getSaintInvocationNames(invocations: SaintInvocations | undefined): string[] {
  return normalizeSaintInvocations(invocations).saints;
}

export function normalizeSaintInvocations(
  invocations: SaintInvocations | undefined,
): SaintInvocations {
  const selectedIds = uniqueValidSaintIds(invocations?.selectedSaintIds ?? []);
  const customSource =
    invocations?.customSaintInvocations && invocations.customSaintInvocations.length > 0
      ? invocations.customSaintInvocations
      : invocations?.saints ?? [];
  const customSaints: string[] = [];

  for (const saintName of customSource) {
    const trimmed = saintName.trim();

    if (!trimmed) {
      continue;
    }

    const directoryEntry = getSaintDirectoryEntryByName(trimmed);

    if (directoryEntry) {
      if (!selectedIds.includes(directoryEntry.id)) {
        selectedIds.push(directoryEntry.id);
      }
      continue;
    }

    if (!customSaints.some((saint) => normalizeSaintName(saint) === normalizeSaintName(trimmed))) {
      customSaints.push(trimmed);
    }
  }

  const selectedNames = selectedIds
    .map((saintId) => saintDirectoryById[saintId]?.name)
    .filter((name): name is string => Boolean(name));
  const saints = uniqueSaintNames([...selectedNames, ...customSaints]);

  return {
    enabled: Boolean(invocations?.enabled) && saints.length > 0,
    selectedSaintIds: selectedIds,
    customSaintInvocations: customSaints,
    saints,
  };
}

export function addManualSaintInvocation(
  invocations: SaintInvocations,
  saintName: string,
): SaintInvocations {
  const normalized = normalizeSaintInvocations(invocations);
  const trimmed = saintName.trim();

  if (!trimmed) {
    return normalized;
  }

  const directoryEntry = getSaintDirectoryEntryByName(trimmed);

  if (directoryEntry) {
    return setSelectedSaintInvocationIds(normalized, [
      ...normalized.selectedSaintIds,
      directoryEntry.id,
    ]);
  }

  return normalizeSaintInvocations({
    ...normalized,
    enabled: true,
    customSaintInvocations: [...normalized.customSaintInvocations, trimmed],
  });
}

export function addCommonSaintInvocations(
  invocations: SaintInvocations,
  commonSaints: string[],
): SaintInvocations {
  return commonSaints.reduce(
    (current, saintName) => addManualSaintInvocation(current, saintName),
    normalizeSaintInvocations(invocations),
  );
}

export function setSelectedSaintInvocationIds(
  invocations: SaintInvocations,
  selectedSaintIds: string[],
): SaintInvocations {
  const normalized = normalizeSaintInvocations(invocations);

  return normalizeSaintInvocations({
    ...normalized,
    enabled:
      selectedSaintIds.length > 0 ||
      normalized.customSaintInvocations.length > 0 ||
      normalized.enabled,
    selectedSaintIds,
    customSaintInvocations: normalized.customSaintInvocations,
  });
}

export function removeSaintInvocation(
  invocations: SaintInvocations,
  saintName: string,
): SaintInvocations {
  const normalized = normalizeSaintInvocations(invocations);
  const directoryEntry = getSaintDirectoryEntryByName(saintName);
  const normalizedName = normalizeSaintName(saintName);

  return normalizeSaintInvocations({
    ...normalized,
    selectedSaintIds: directoryEntry
      ? normalized.selectedSaintIds.filter((saintId) => saintId !== directoryEntry.id)
      : normalized.selectedSaintIds,
    customSaintInvocations: normalized.customSaintInvocations.filter(
      (saint) => normalizeSaintName(saint) !== normalizedName,
    ),
  });
}

function uniqueValidSaintIds(saintIds: string[]): string[] {
  return [...new Set(saintIds.filter((saintId) => saintDirectoryById[saintId]))];
}

function uniqueSaintNames(saints: string[]): string[] {
  const seen = new Set<string>();
  const nextSaints: string[] = [];

  for (const saint of saints) {
    const trimmed = saint.trim();
    const normalized = normalizeSaintName(trimmed);

    if (!trimmed || seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);
    nextSaints.push(trimmed);
  }

  return nextSaints;
}
