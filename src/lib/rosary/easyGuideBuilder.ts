import type {
  GuideCardLayoutOptions,
  MysterySetId,
  PrayerId,
  PrayerLanguage,
  UserRosaryConfig,
} from "@/lib/rosary/types";
import {
  createDefaultUserConfigFromTemplate,
  normalizeRosaryConfig,
} from "@/lib/rosary/configUtils";
import { commonSaintInvocations } from "@/lib/rosary/commonSaintInvocations";
import { getTodaysMysteries } from "@/lib/rosary/getTodaysMysteries";
import { normalizeGuideCardLayoutOptions } from "@/lib/rosary/cardUtils";

export type EasyGuidePurpose = "self" | "walk-group" | "printable-cards" | "simple";
export type EasyGuideMysteryChoice = "today" | MysterySetId;
export type EasyGuideHelpLevel = "simple" | "complete" | "beginner";
export type EasyGuideLanguageChoice = "none" | "choose" | "unsure";
export type EasyGuideSaintChoice = "none" | "common" | "custom";
export type EasyGuidePrintIntent = "not-now" | "pocket" | "larger" | "unsure";

export type EasyGuideAnswers = {
  purpose: EasyGuidePurpose;
  mysteryChoice: EasyGuideMysteryChoice;
  helpLevel: EasyGuideHelpLevel;
  languageChoice: EasyGuideLanguageChoice;
  prayerLanguageById: Partial<Record<PrayerId, PrayerLanguage>>;
  closingPrayerIds: PrayerId[];
  saintChoice: EasyGuideSaintChoice;
  customSaints: string[];
  printIntent: EasyGuidePrintIntent;
  guideName: string;
};

export type EasyGuideResult = {
  config: UserRosaryConfig;
  defaultName: string;
  guideCardLayoutOptions: GuideCardLayoutOptions;
};

export const standardEasyClosingPrayerIds: PrayerId[] = [
  "hail-holy-queen",
  "closing-prayer",
];

export { commonSaintInvocations } from "@/lib/rosary/commonSaintInvocations";

export const defaultEasyGuideAnswers: EasyGuideAnswers = {
  purpose: "simple",
  mysteryChoice: "today",
  helpLevel: "complete",
  languageChoice: "none",
  prayerLanguageById: {},
  closingPrayerIds: standardEasyClosingPrayerIds,
  saintChoice: "none",
  customSaints: [],
  printIntent: "unsure",
  guideName: "",
};

export function createUserRosaryConfigFromWizardAnswers(
  answers: EasyGuideAnswers,
  date = new Date(),
): EasyGuideResult {
  const templateId =
    answers.purpose === "walk-group" || answers.purpose === "printable-cards"
      ? "rosary-walk-leader"
      : "standard-rosary";
  const baseConfig = createDefaultUserConfigFromTemplate(templateId);
  const selectedMysterySetId =
    answers.mysteryChoice === "today"
      ? getTodaysMysteries(date).id
      : answers.mysteryChoice;
  const mysterySetMode = answers.mysteryChoice === "today" ? "today" : "manual";
  const defaultName = buildDefaultEasyGuideName(answers);
  const selectedClosingPrayerIds = sanitizeClosingPrayerIds(answers.closingPrayerIds);
  const saints = buildSaintInvocations(answers);

  const config = normalizeRosaryConfig({
    ...baseConfig,
    name: answers.guideName.trim() || defaultName,
    baseTemplateId: templateId,
    selectedMysterySetId,
    mysterySetMode,
    selectedClosingPrayerIds,
    saintInvocations: {
      enabled: saints.length > 0,
      saints,
      selectedSaintIds: [],
      customSaintInvocations: saints,
    },
    prayerLanguageById: buildPrayerLanguageById(answers),
    preferences: {
      ...baseConfig.preferences,
      defaultCollapseKnownPrayers: answers.helpLevel !== "beginner",
      includeOptionalClosingPrayers: selectedClosingPrayerIds,
      showLeaderNotes: templateId === "rosary-walk-leader",
      showRepeatedPrayersIndividually: answers.helpLevel === "beginner",
    },
  });

  return {
    config,
    defaultName,
    guideCardLayoutOptions: buildGuideCardLayoutOptions(answers),
  };
}

function buildPrayerLanguageById(answers: EasyGuideAnswers): Partial<Record<PrayerId, PrayerLanguage>> {
  if (answers.languageChoice !== "choose") {
    return {};
  }

  return Object.fromEntries(
    Object.entries(answers.prayerLanguageById)
      .filter((entry): entry is [PrayerId, PrayerLanguage] => entry[1] === "la" || entry[1] === "es"),
  ) as Partial<Record<PrayerId, PrayerLanguage>>;
}

export function buildDefaultEasyGuideName(answers: EasyGuideAnswers): string {
  const mysteryTitle =
    answers.mysteryChoice === "today"
      ? "Today's"
      : `${capitalize(answers.mysteryChoice)} Mysteries`;

  if (answers.printIntent === "pocket") {
    return "Pocket Card Rosary Guide";
  }

  if (answers.purpose === "walk-group") {
    return `${mysteryTitle} Rosary Walk Guide`;
  }

  if (answers.purpose === "printable-cards") {
    return `${mysteryTitle} Group Rosary Guide`;
  }

  if (answers.mysteryChoice === "today") {
    return `${mysteryTitle} Rosary Guide`;
  }

  return `${mysteryTitle} Guide`;
}

function buildGuideCardLayoutOptions(answers: EasyGuideAnswers): GuideCardLayoutOptions {
  const fullPrayerIds: PrayerId[] =
    answers.helpLevel === "simple"
      ? []
      : answers.helpLevel === "complete"
        ? ["apostles-creed"]
        : [
            "apostles-creed",
            "our-father",
            "hail-mary",
            "glory-be",
            "hail-holy-queen",
            "closing-prayer",
          ];

  const cardSize: GuideCardLayoutOptions["cardSize"] =
    answers.printIntent === "larger"
      ? "wide-2"
      : answers.printIntent === "pocket"
        ? "pocket-4"
        : "pocket-4";

  return normalizeGuideCardLayoutOptions({
    cardSize,
    cardCount: cardSize === "wide-2" ? 2 : 4,
    fullPrayerIds,
    includeOverflowWarnings: true,
  });
}

function sanitizeClosingPrayerIds(prayerIds: PrayerId[]): PrayerId[] {
  const allowedIds: PrayerId[] = [
    "hail-holy-queen",
    "closing-prayer",
    "memorare",
    "st-michael-prayer",
  ];
  const selected = prayerIds.filter((id) => allowedIds.includes(id));

  return selected.length > 0 ? [...new Set(selected)] : standardEasyClosingPrayerIds;
}

function buildSaintInvocations(answers: EasyGuideAnswers): string[] {
  if (answers.saintChoice === "none") {
    return [];
  }

  const saints =
    answers.saintChoice === "common" ? commonSaintInvocations : answers.customSaints;

  return [...new Set(saints.map((saint) => saint.trim()).filter(Boolean))];
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
