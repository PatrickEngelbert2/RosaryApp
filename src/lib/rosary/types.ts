export type PrayerId =
  | "sign-of-the-cross"
  | "apostles-creed"
  | "our-father"
  | "hail-mary"
  | "glory-be"
  | "fatima-prayer"
  | "hail-holy-queen"
  | "closing-prayer"
  | "memorare"
  | "st-michael-prayer";

export type Prayer = {
  id: PrayerId;
  title: string;
  incipit: string;
  text: string;
  shortText?: string;
  category?: "opening" | "decade" | "closing" | "optional";
};

export type MysterySetId = "joyful" | "luminous" | "sorrowful" | "glorious";

export type Mystery = {
  id: string;
  setId: MysterySetId;
  setName: string;
  title: string;
  number: number;
  description: string;
  scriptureReference?: string;
  fruitOfMystery?: string;
  leaderFruitLine?: string;
  readingTranslation?: "RSV-2CE";
  readingText?: string;
  reflection?: string;
  shortReflection?: string;
  shortLabel?: string;
};

export type MysterySet = {
  id: MysterySetId;
  title: string;
  traditionalDays: string;
  mysteries: Mystery[];
};

export type MysterySetMode = "today" | "manual";

export type CustomGuidanceInsertionPoint =
  | "beginning"
  | "before-opening"
  | "after-opening"
  | "before-decades"
  | "before-each-decade"
  | "after-each-decade"
  | "before-closing"
  | "after-closing"
  | "end";

export type RosaryStepType =
  | "prayer"
  | "mystery"
  | "decade"
  | "instruction"
  | "leader-note"
  | "custom-text"
  | "section-heading"
  | "prayer-group";

export type RosaryStep = {
  id: string;
  type: RosaryStepType;
  title: string;
  prayerId?: PrayerId;
  mysteryId?: string;
  text?: string;
  repeat?: number;
  repeatCount?: number;
  defaultCollapsed?: boolean;
  leaderOnly?: boolean;
  optional?: boolean;
  enabled?: boolean;
  cardEligible?: boolean;
  order: number;
  description?: string;
};

export type RosarySequence = {
  id: string;
  title: string;
  items: RosaryStep[];
};

export type RenderedRosaryStep = {
  id: string;
  type: RosaryStepType;
  title: string;
  prayer?: Prayer;
  mystery?: Mystery;
  text?: string;
  repeatCount?: number;
  description?: string;
  defaultCollapsed: boolean;
  leaderOnly: boolean;
  cardEligible: boolean;
  order: number;
};

export type CustomGuidance = {
  id: string;
  title: string;
  text: string;
  stepType: Extract<RosaryStepType, "instruction" | "leader-note" | "custom-text">;
  insertionPoint: CustomGuidanceInsertionPoint;
};

export type SaintInvocations = {
  enabled: boolean;
  saints: string[];
};

export type RosaryPreferences = {
  defaultLargeText: boolean;
  defaultCollapseKnownPrayers: boolean;
  showLeaderNotes: boolean;
  includeOptionalClosingPrayers: PrayerId[];
  showRepeatedPrayersIndividually: boolean;
};

export type RosaryTemplate = {
  id: string;
  name: string;
  description: string;
  steps: RosaryStep[];
  defaultMysterySetId: MysterySetId;
  mysterySetMode: MysterySetMode;
  availableOptionalClosingPrayers: PrayerId[];
};

export type UserRosaryConfig = {
  id: string;
  name: string;
  baseTemplateId: string;
  createdAt: string;
  updatedAt: string;
  steps: RosaryStep[];
  selectedMysterySetId: MysterySetId;
  mysterySetMode: MysterySetMode;
  selectedClosingPrayerIds: PrayerId[];
  saintInvocations: SaintInvocations;
  customGuidance: CustomGuidance[];
  preferences: RosaryPreferences;
};

export type LeaderGuide = {
  id: string;
  phase: string;
  title: string;
  summary: string;
  steps: string[];
};

export type PrintableResource = {
  id: string;
  title: string;
  description: string;
  audience: string;
  format: "PDF";
  path: string;
};

export type RosaryCardSection = {
  id: string;
  heading: string;
  body: string;
  compact: boolean;
  leaderOnly: boolean;
};

export type RosaryCardSide = {
  heading: string;
  sections: RosaryCardSection[];
};

export type RosaryCardContent = {
  title: string;
  subtitle: string;
  front: RosaryCardSide;
  back: RosaryCardSide;
};

export type CardSlot = {
  id: string;
  cardNumber: number;
  useMasterCard: boolean;
  overrideContent?: RosaryCardContent;
};

export type RosaryCardSet = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  cardCount: number;
  masterCard: RosaryCardContent;
  cardSlots: CardSlot[];
  sourceRosaryConfigId?: string;
};

export type GuideCardSection = {
  id: string;
  heading: string;
  lines: string[];
  body?: string;
  compact?: boolean;
  leaderOnly?: boolean;
};

export type GuideCardSize = "pocket-4" | "tall-3" | "wide-3" | "tall-2" | "wide-2" | "full-1";

export type GuideCardLayoutOptions = {
  cardSize: GuideCardSize;
  cardCount: number;
  fullPrayerIds: PrayerId[];
  includeOverflowWarnings: boolean;
};

export type GuideCardBlock = {
  id: string;
  type:
    | "heading"
    | "prayer"
    | "instruction"
    | "mystery-list"
    | "invocation-list"
    | "custom-guidance";
  heading?: string;
  lines?: string[];
  body?: string;
  prayerId?: PrayerId;
  printMode?: "short" | "full";
  estimatedWeight: number;
  keepTogether?: boolean;
  priority?: "required" | "optional";
  compact?: boolean;
  leaderOnly?: boolean;
  sectionGroup?: string;
};

export type GuideCardSide = {
  title: string;
  subtitle?: string;
  id: string;
  blocks: GuideCardBlock[];
  overflowWarnings?: string[];
};

export type GeneratedGuideCard = {
  id: string;
  cardNumber: number;
  front: GuideCardSide;
  back?: GuideCardSide;
  extraSides?: GuideCardSide[];
  layoutOptions: GuideCardLayoutOptions;
};

export type GeneratedGuideCardSet = {
  id: string;
  name: string;
  sourceRosaryConfigId: string;
  sourceRosaryConfigName: string;
  cardCount: number;
  mysterySetTitle: string;
  mysterySetModeLabel: string;
  generatedAt: string;
  cards: GeneratedGuideCard[];
  warnings: string[];
  layoutOptions: GuideCardLayoutOptions;
  cardsPerPage: number;
};
