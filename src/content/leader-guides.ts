import type { LeaderGuide } from "@/lib/rosary/types";

export const leaderGuides: LeaderGuide[] = [
  {
    id: "opening",
    phase: "Opening",
    title: "Gather the group and set the intention",
    summary: "Begin with a short welcome and a clear invitation into prayer.",
    steps: [
      "Choose a safe place to gather before the walk begins.",
      "Briefly explain the route, pace, and how call-and-response will work.",
      "Invite a shared intention, then begin with the Sign of the Cross.",
    ],
  },
  {
    id: "walking-transitions",
    phase: "Transitions",
    title: "Keep the walk prayerful and easy to follow",
    summary: "Small pauses help the group stay together physically and spiritually.",
    steps: [
      "Announce each mystery before the decade begins.",
      "Pause at corners, crossings, or uneven ground so the group can regroup safely.",
      "Use a steady voice and allow enough silence for meditation.",
    ],
  },
  {
    id: "closing",
    phase: "Closing",
    title: "Close with gratitude and peace",
    summary: "End simply, without rushing people immediately out of prayer.",
    steps: [
      "Gather the group in a safe stopping place for the final prayers.",
      "Pray the Hail Holy Queen and closing prayer together.",
      "Thank the group and share any practical next steps or future walk times.",
    ],
  },
];
