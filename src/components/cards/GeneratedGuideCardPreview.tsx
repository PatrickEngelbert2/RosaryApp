import { GuideCardFace } from "@/components/cards/GuideCardFace";
import type { GuideCardEditHandlers } from "@/components/cards/GuideCardFace";
import type { GuideCardSide, GuideCardSize } from "@/lib/rosary/types";

type GeneratedGuideCardPreviewProps = {
  sides: GuideCardSide[];
  cardSize: GuideCardSize;
  editHandlers?: GuideCardEditHandlers;
};

export function GeneratedGuideCardPreview({
  sides,
  cardSize,
  editHandlers,
}: GeneratedGuideCardPreviewProps) {
  return (
    <div className={cardSize === "pocket-4" ? "grid gap-5 lg:grid-cols-2" : "grid gap-5"}>
      {sides.map((side, index) => (
        <GeneratedGuideCardSide
          key={side.id}
          side={side}
          cardSize={cardSize}
          label={
            index === 0
              ? "Preview: Front"
              : index === 1
                ? "Preview: Back"
                : `Preview: Extra side ${index - 1}`
          }
          editHandlers={editHandlers}
        />
      ))}
    </div>
  );
}

export function GeneratedGuideCardSide({
  side,
  cardSize,
  label,
  editHandlers,
}: {
  side: GuideCardSide;
  cardSize: GuideCardSize;
  label: string;
  editHandlers?: GuideCardEditHandlers;
}) {
  return (
    <div className="guide-card-preview-frame rounded-lg border border-blue-900/20 bg-white p-3 shadow-sm">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gold-500">{label}</p>
      <GuideCardFace side={side} cardSize={cardSize} mode="preview" editHandlers={editHandlers} />
      {side.overflowWarnings?.map((warning) => (
        <p key={warning} className="mt-3 rounded-md bg-cream-100 px-3 py-2 text-xs font-medium text-slate-700">
          {warning}
        </p>
      ))}
    </div>
  );
}
