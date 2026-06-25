import {
  gloriousMysteries,
  joyfulMysteries,
  luminousMysteries,
  sorrowfulMysteries,
} from "@/content/mysteries";
import type { MysterySet } from "@/lib/rosary/types";

export function getTodaysMysteries(date = new Date()): MysterySet {
  const day = date.getDay();

  if (day === 1 || day === 6) {
    return joyfulMysteries;
  }

  if (day === 2 || day === 5) {
    return sorrowfulMysteries;
  }

  if (day === 4) {
    return luminousMysteries;
  }

  return gloriousMysteries;
}
