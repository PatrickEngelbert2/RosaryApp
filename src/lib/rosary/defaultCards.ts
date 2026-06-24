import { createId } from "@/lib/rosary/configUtils";
import { createCardSlot, DEFAULT_CARD_COUNT } from "@/lib/rosary/cardUtils";
import type { RosaryCardContent, RosaryCardSet, UserRosaryConfig } from "@/lib/rosary/types";

export const defaultMasterCard: RosaryCardContent = {
  title: "Rosary Walk Guide",
  subtitle: "Pray and walk together with Mary toward Christ",
  front: {
    heading: "How to follow",
    sections: [
      {
        id: "front-opening",
        heading: "Opening",
        body: "Begin with the Sign of the Cross, the Apostles' Creed, one Our Father, three Hail Marys, and the Glory Be.",
        compact: false,
        leaderOnly: false,
      },
      {
        id: "front-decade",
        heading: "Each decade",
        body: "The leader announces the mystery. Pray one Our Father, ten Hail Marys, the Glory Be, and the Fatima Prayer.",
        compact: false,
        leaderOnly: false,
      },
      {
        id: "front-walk",
        heading: "While walking",
        body: "Keep a gentle pace. Respond clearly. Pause quietly when the group stops.",
        compact: true,
        leaderOnly: false,
      },
    ],
  },
  back: {
    heading: "Closing",
    sections: [
      {
        id: "back-closing",
        heading: "Final prayers",
        body: "Pray the Hail Holy Queen and the closing prayer, then end with the Sign of the Cross.",
        compact: false,
        leaderOnly: false,
      },
      {
        id: "back-reminder",
        heading: "Reminder",
        body: "The leader will announce each mystery. If you lose your place, simply rejoin at the next response.",
        compact: true,
        leaderOnly: false,
      },
    ],
  },
};

export function createDefaultCardSetFromRosaryConfig(
  config?: UserRosaryConfig,
): RosaryCardSet {
  const now = new Date().toISOString();

  return {
    id: createId("card-set"),
    name: config ? `${config.name} Guide Cards` : "Rosary Walk Guide Cards",
    createdAt: now,
    updatedAt: now,
    cardCount: DEFAULT_CARD_COUNT,
    masterCard: structuredCloneSafe(defaultMasterCard),
    cardSlots: Array.from({ length: DEFAULT_CARD_COUNT }, (_, index) => createCardSlot(index + 1)),
    sourceRosaryConfigId: config?.id,
  };
}

export function makeLeaderCardContent(content: RosaryCardContent): RosaryCardContent {
  const copy = structuredCloneSafe(content);

  return {
    ...copy,
    title: "Leader Rosary Walk Card",
    subtitle: "Prompts for leading the group outdoors",
    front: {
      ...copy.front,
      sections: [
        {
          id: "leader-reminders",
          heading: "Leader reminders",
          body: "Announce each mystery clearly, pause after the fruit of the mystery, watch the group's pace, and invite everyone to respond.",
          compact: false,
          leaderOnly: true,
        },
        ...copy.front.sections,
      ],
    },
  };
}

export function structuredCloneSafe<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
