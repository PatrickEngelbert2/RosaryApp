export const commonSaintInvocations = [
  "Saint Joseph",
  "Our Lady of the Rosary",
  "Saint John Paul II",
  "Saint Michael the Archangel",
  "All holy angels and saints",
];

export function appendCommonSaintInvocations(
  currentSaints: string[],
  commonSaints: string[] = commonSaintInvocations,
): string[] {
  const normalizedExisting = new Set(
    currentSaints.map((saint) => normalizeSaintName(saint)),
  );
  const nextSaints = [...currentSaints.map((saint) => saint.trim()).filter(Boolean)];

  for (const saint of commonSaints) {
    const trimmed = saint.trim();
    const normalized = normalizeSaintName(trimmed);

    if (!trimmed || normalizedExisting.has(normalized)) {
      continue;
    }

    normalizedExisting.add(normalized);
    nextSaints.push(trimmed);
  }

  return nextSaints;
}

function normalizeSaintName(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}
