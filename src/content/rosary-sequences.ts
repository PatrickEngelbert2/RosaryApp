import { rosaryTemplates } from "@/lib/rosary/defaultTemplates";
import type { RosarySequence } from "@/lib/rosary/types";

export const basicRosarySequence: RosarySequence = {
  id: "basic-five-decade-rosary",
  title: "Basic Five-Decade Rosary",
  items: rosaryTemplates[0].steps,
};
