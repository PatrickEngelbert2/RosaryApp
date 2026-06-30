import { saintDirectoryById } from "@/lib/rosary/saintDirectory";
import { normalizeSaintName } from "@/lib/rosary/saintInvocations";

export const commonSaintInvocationIds = [
  "saint-joseph",
  "our-lady-of-the-rosary",
  "saint-john-paul-ii",
  "saint-michael-the-archangel",
  "all-holy-angels-and-saints",
];

export const commonSaintInvocations = commonSaintInvocationIds.map(
  (saintId) => saintDirectoryById[saintId].name,
);

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
