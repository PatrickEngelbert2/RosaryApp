import { prayersById } from "@/content/prayers";
import { createDefaultUserConfigFromTemplate, normalizeRosaryConfig } from "@/lib/rosary/configUtils";
import { getMysterySetForConfig } from "@/lib/rosary/buildRosaryFlow";
import { CARDS_PER_PRINT_PAGE, clampCardCount } from "@/lib/rosary/cardUtils";
import type {
  CustomGuidanceInsertionPoint,
  GeneratedGuideCard,
  GeneratedGuideCardSet,
  GuideCardSection,
  GuideCardSide,
  MysterySet,
  PrayerId,
  RosaryStep,
  UserRosaryConfig,
} from "@/lib/rosary/types";

const openingPrayerIds: PrayerId[] = [
  "sign-of-the-cross",
  "apostles-creed",
  "our-father",
  "hail-mary",
  "glory-be",
];

const closingOrder: PrayerId[] = [
  "hail-holy-queen",
  "closing-prayer",
  "memorare",
  "st-michael-prayer",
];

const guidancePointsForFront: CustomGuidanceInsertionPoint[] = [
  "beginning",
  "before-opening",
  "after-opening",
  "before-decades",
];

const guidancePointsForBack: CustomGuidanceInsertionPoint[] = [
  "before-closing",
  "after-closing",
  "end",
];

export function createDefaultGeneratedGuideConfig(): UserRosaryConfig {
  return normalizeRosaryConfig(createDefaultUserConfigFromTemplate("standard-rosary"));
}

export function generateGuideCardsFromConfig(
  inputConfig: UserRosaryConfig,
  cardCount = 4,
  date = new Date(),
): GeneratedGuideCardSet {
  const config = normalizeRosaryConfig(inputConfig);
  const count = clampCardCount(cardCount);
  const mysterySet = getMysterySetForConfig(config, date);
  const warnings: string[] = [];
  const front = buildGuideCardFront(config, mysterySet, warnings);
  const back = buildGuideCardBack(config, warnings);
  const cards = Array.from({ length: count }, (_, index) =>
    buildGeneratedGuideCard(index + 1, front, back),
  );

  return {
    id: `generated-guide-cards-${config.id}`,
    name: `${config.name || "Rosary Walk Guide"} Cards`,
    sourceRosaryConfigId: config.id,
    sourceRosaryConfigName: config.name || "Rosary Walk Guide",
    cardCount: count,
    mysterySetTitle: mysterySet.title,
    mysterySetModeLabel:
      config.mysterySetMode === "today" ? "Today's mysteries" : "Manually selected mysteries",
    generatedAt: new Date().toISOString(),
    cards,
    warnings,
  };
}

export function buildGuideCardFront(
  config: UserRosaryConfig,
  mysterySet: MysterySet,
  warnings: string[] = [],
): GuideCardSide {
  const title = config.name?.trim() || "Rosary Walk Guide";

  return {
    title,
    subtitle: `${mysterySet.title} pocket guide`,
    sections: [
      {
        id: "opening",
        heading: "Opening",
        lines: buildOpeningSummary(config),
      },
      {
        id: "intentions",
        heading: "Intentions",
        lines: [
          "At this time, please offer your intentions.",
          "[pause]",
          ...buildConciseGuidance(config, guidancePointsForFront, warnings),
        ],
        compact: true,
      },
      {
        id: "each-decade",
        heading: "Each Decade",
        lines: buildDecadeSummary(config),
      },
      {
        id: "mystery-set",
        heading: mysterySet.title,
        lines: buildMysterySummary(mysterySet),
      },
    ],
  };
}

export function buildGuideCardBack(
  config: UserRosaryConfig,
  warnings: string[] = [],
): GuideCardSide {
  const closingSections = buildClosingSummary(config);
  const saintSection = buildSaintInvocationSection(config);
  const guidanceLines = buildConciseGuidance(config, guidancePointsForBack, warnings);
  const leaderLines = buildLeaderNoteSummary(config, warnings);

  return {
    title: config.name?.trim() || "Rosary Walk Guide",
    subtitle: "Closing prayers and leader reminders",
    sections: [
      {
        id: "closing",
        heading: "Closing",
        lines: closingSections.length > 0 ? closingSections : ["Conclude with the Sign of the Cross."],
      },
      {
        id: "holy-father-intentions",
        heading: "Holy Father's Intentions",
        lines: ["Our Father...", "Hail Mary...", "Glory Be..."],
        compact: true,
      },
      ...(saintSection ? [saintSection] : []),
      ...(guidanceLines.length > 0
        ? [
            {
              id: "custom-guidance",
              heading: "Guide Notes",
              lines: guidanceLines,
              compact: true,
            },
          ]
        : []),
      ...(leaderLines.length > 0
        ? [
            {
              id: "leader-notes",
              heading: "Leader Notes",
              lines: leaderLines,
              compact: true,
              leaderOnly: true,
            },
          ]
        : []),
      {
        id: "final-sign",
        heading: "Final",
        lines: [prayersById["sign-of-the-cross"].shortText ?? prayersById["sign-of-the-cross"].incipit],
        compact: true,
      },
    ],
  };
}

export function buildMysterySummary(mysterySet: MysterySet): string[] {
  const setName = mysterySet.title.replace(" Mysteries", "");

  return mysterySet.mysteries.map((mystery) => {
    const fruit = mystery.fruitOfMystery
      ? ` The fruit of this mystery is ${mystery.fruitOfMystery}.`
      : "";

    return `${mystery.number}. The ${ordinalWord(mystery.number)} ${setName} Mystery is ${mystery.title}.${fruit}`;
  });
}

export function buildOpeningSummary(config: UserRosaryConfig): string[] {
  const firstDecadeOrder =
    config.steps
      .filter((step) => step.enabled !== false && step.type === "decade")
      .map((step) => step.order)
      .sort((a, b) => a - b)[0] ?? Number.POSITIVE_INFINITY;

  const openingSteps = config.steps
    .filter((step) => step.enabled !== false)
    .filter((step) => step.order < firstDecadeOrder)
    .filter((step) => step.type === "prayer" || step.type === "prayer-group")
    .filter((step) => step.prayerId && openingPrayerIds.includes(step.prayerId))
    .sort((a, b) => a.order - b.order);

  if (openingSteps.length === 0) {
    return [
      prayersById["sign-of-the-cross"].title,
      prayersById["apostles-creed"].title,
      prayersById["our-father"].title,
      "Three Hail Marys for faith, hope, and charity",
      prayersById["glory-be"].title,
    ];
  }

  return openingSteps.map((step) => formatPrayerStepForCard(step));
}

export function buildDecadeSummary(config: UserRosaryConfig): string[] {
  const hasFatima = config.steps.some(
    (step) => step.enabled !== false && step.type === "decade" && (step.text ?? "").toLowerCase().includes("fatima"),
  );

  return [
    "Announce the mystery and fruit.",
    "Our Father...",
    "10 Hail Marys...",
    "Glory Be...",
    ...(hasFatima ? ["O my Jesus, forgive us our sins..."] : []),
  ];
}

export function buildClosingSummary(config: UserRosaryConfig): string[] {
  return closingOrder
    .filter((prayerId) => config.selectedClosingPrayerIds.includes(prayerId))
    .map((prayerId) => {
      const prayer = prayersById[prayerId];
      return `${prayer.title}: ${prayer.shortText ?? prayer.incipit}`;
    });
}

export function chunkCardsForPrint<T>(
  cards: T[],
  cardsPerPage = CARDS_PER_PRINT_PAGE,
): T[][] {
  const chunks: T[][] = [];

  for (let index = 0; index < cards.length; index += cardsPerPage) {
    chunks.push(cards.slice(index, index + cardsPerPage));
  }

  return chunks;
}

function buildGeneratedGuideCard(
  cardNumber: number,
  front: GuideCardSide,
  back: GuideCardSide,
): GeneratedGuideCard {
  return {
    id: `generated-card-${cardNumber}`,
    cardNumber,
    front,
    back,
  };
}

function buildSaintInvocationSection(config: UserRosaryConfig): GuideCardSection | undefined {
  if (!config.saintInvocations.enabled) {
    return undefined;
  }

  const saints = config.saintInvocations.saints.map((saint) => saint.trim()).filter(Boolean);

  if (saints.length === 0) {
    return undefined;
  }

  return {
    id: "saint-invocations",
    heading: "Saint Invocations",
    lines: saints.map((saint) => `${saint}, pray for us.`),
    compact: true,
  };
}

function buildConciseGuidance(
  config: UserRosaryConfig,
  insertionPoints: CustomGuidanceInsertionPoint[],
  warnings: string[],
): string[] {
  return config.customGuidance
    .filter((item) => insertionPoints.includes(item.insertionPoint))
    .slice(0, 3)
    .map((item) => `${item.title}: ${truncateForCard(item.text, warnings, item.title)}`);
}

function buildLeaderNoteSummary(config: UserRosaryConfig, warnings: string[]): string[] {
  const stepNotes = config.steps
    .filter((step) => step.enabled !== false && step.leaderOnly && step.text)
    .slice(0, 3)
    .map((step) => `${step.title}: ${truncateForCard(step.text ?? "", warnings, step.title)}`);

  const customNotes = config.customGuidance
    .filter((item) => item.stepType === "leader-note")
    .slice(0, 2)
    .map((item) => `${item.title}: ${truncateForCard(item.text, warnings, item.title)}`);

  return [...stepNotes, ...customNotes];
}

function formatPrayerStepForCard(step: RosaryStep): string {
  const prayer = step.prayerId ? prayersById[step.prayerId] : undefined;
  const title = step.title || prayer?.title || "Prayer";
  const repeat = step.repeatCount ?? step.repeat ?? 1;

  if (step.prayerId === "hail-mary" && repeat === 3) {
    return "Three Hail Marys for faith, hope, and charity";
  }

  if (repeat > 1) {
    return `${repeat} ${title}`;
  }

  return title;
}

function truncateForCard(text: string, warnings: string[], label: string): string {
  const cleaned = text.replace(/\s+/g, " ").trim();

  if (cleaned.length <= 140) {
    return cleaned;
  }

  warnings.push(`${label} was shortened for pocket card fit.`);
  return `${cleaned.slice(0, 137).trim()}...`;
}

function ordinalWord(value: number): string {
  if (value === 1) return "First";
  if (value === 2) return "Second";
  if (value === 3) return "Third";
  if (value === 4) return "Fourth";
  if (value === 5) return "Fifth";
  return `${value}th`;
}
