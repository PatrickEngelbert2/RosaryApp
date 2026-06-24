import type { PrintableResource } from "@/lib/rosary/types";

export const printables: PrintableResource[] = [
  {
    id: "one-page-rosary-guide",
    title: "One-Page Rosary Guide",
    description: "A compact guide with the order of prayers and a simple bead map.",
    audience: "Beginners and visitors",
    format: "PDF",
    path: "/printables/one-page-rosary-guide.pdf",
  },
  {
    id: "rosary-walk-leader-card",
    title: "Rosary Walk Leader Card",
    description: "A quick outdoor leadership card with openings, transitions, and closing notes.",
    audience: "Group leaders",
    format: "PDF",
    path: "/printables/rosary-walk-leader-card.pdf",
  },
  {
    id: "mysteries-handout",
    title: "Mysteries Handout",
    description: "A printable list of all four mystery sets with short meditation prompts.",
    audience: "Parishes and families",
    format: "PDF",
    path: "/printables/mysteries-handout.pdf",
  },
];
