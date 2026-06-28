"use client";

import { useCallback, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { GuideCardFace } from "@/components/cards/GuideCardFace";
import {
  applyMeasuredGuideCardLayout,
  filterNonMeasuredLayoutWarnings,
  getGuideCardBlockKey,
  getGuideCardSourceBlocks,
} from "@/lib/rosary/measuredGuideCardLayout";
import type { GeneratedGuideCardSet, GuideCardSide } from "@/lib/rosary/types";

type MeasuredGuideCardLayoutState = {
  cardSet: GeneratedGuideCardSet | undefined;
  isMeasuring: boolean;
  measurementHost: ReactNode;
};

type GuideCardMeasurementHostProps = {
  cardSet: GeneratedGuideCardSet;
  signature: string;
  onMeasured: (cardSet: GeneratedGuideCardSet) => void;
};

export function useMeasuredGuideCardLayout(cardSet: GeneratedGuideCardSet): MeasuredGuideCardLayoutState {
  const signature = useMemo(() => createMeasurementSignature(cardSet), [cardSet]);
  const [measuredState, setMeasuredState] = useState<{
    signature: string;
    cardSet: GeneratedGuideCardSet;
  } | null>(null);
  const handleMeasured = useCallback(
    (measuredCardSet: GeneratedGuideCardSet) =>
      setMeasuredState({
        signature,
        cardSet: measuredCardSet,
      }),
    [signature],
  );

  return {
    cardSet: measuredState?.signature === signature ? measuredState.cardSet : undefined,
    isMeasuring: measuredState?.signature !== signature,
    measurementHost: (
      <GuideCardMeasurementHost
        key={signature}
        cardSet={cardSet}
        signature={signature}
        onMeasured={handleMeasured}
      />
    ),
  };
}

function GuideCardMeasurementHost({
  cardSet,
  signature,
  onMeasured,
}: GuideCardMeasurementHostProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const firstCard = cardSet.cards[0];
  const sourceBlocks = useMemo(
    () => (firstCard ? getGuideCardSourceBlocks(firstCard) : []),
    [firstCard],
  );
  const emptySide: GuideCardSide | undefined = firstCard
    ? {
        id: "measurement-empty",
        title: firstCard.front.title,
        subtitle: firstCard.front.subtitle,
        blocks: [],
      }
    : undefined;
  const blocksSide: GuideCardSide | undefined = firstCard
    ? {
        id: "measurement-blocks",
        title: firstCard.front.title,
        subtitle: firstCard.front.subtitle,
        blocks: sourceBlocks,
      }
    : undefined;

  useLayoutEffect(() => {
    let cancelled = false;

    async function measure() {
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

      if (cancelled || !rootRef.current || !firstCard) {
        return;
      }

      try {
        const emptyCard = rootRef.current.querySelector<HTMLElement>("[data-measure-empty] .print-card");
        const blockCard = rootRef.current.querySelector<HTMLElement>("[data-measure-blocks] .print-card");
        const header = emptyCard?.querySelector<HTMLElement>("header");

        if (!emptyCard || !blockCard || !header) {
          throw new Error("Guide card measurement host did not render the expected card elements.");
        }

        const faceContentHeight = getAvailableBlockHeight(emptyCard, header);
        const blockMeasurements = sourceBlocks.map((block) => {
          const key = getGuideCardBlockKey(block);
          const element = blockCard.querySelector<HTMLElement>(`[data-guide-block-key="${cssEscape(key)}"]`);

          if (!element) {
            return {
              key,
              height: 0,
            };
          }

          return {
            key,
            height: getOuterHeight(element),
          };
        });

        if (cancelled) {
          return;
        }

        onMeasured(
          applyMeasuredGuideCardLayout({
            cardSet,
            blockMeasurements,
            faceContentHeight,
          }),
        );
      } catch (error) {
        if (process.env.NODE_ENV !== "production") {
          console.warn("Guide card measured layout failed; falling back to generated layout.", error);
        }

        onMeasured({
          ...cardSet,
          warnings: [
            ...filterNonMeasuredLayoutWarnings(cardSet.warnings),
            "Measured card layout could not run, so the generated fallback layout is being used.",
          ],
        });
      }
    }

    measure();

    return () => {
      cancelled = true;
    };
  }, [cardSet, firstCard, onMeasured, signature, sourceBlocks]);

  if (!firstCard || !emptySide || !blocksSide) {
    return null;
  }

  return (
    <div ref={rootRef} className="guide-card-measurement-host" aria-hidden="true">
      <div data-measure-empty="">
        <GuideCardFace side={emptySide} cardSize={cardSet.layoutOptions.cardSize} mode="print" />
      </div>
      <div data-measure-blocks="">
        <GuideCardFace side={blocksSide} cardSize={cardSet.layoutOptions.cardSize} mode="print" />
      </div>
    </div>
  );
}

function createMeasurementSignature(cardSet: GeneratedGuideCardSet): string {
  const firstCard = cardSet.cards[0];

  return JSON.stringify({
    id: cardSet.id,
    cardSize: cardSet.layoutOptions.cardSize,
    cardCount: cardSet.cardCount,
    title: firstCard?.front.title,
    subtitle: firstCard?.front.subtitle,
    blocks: firstCard
      ? getGuideCardSourceBlocks(firstCard).map((block) => ({
          key: getGuideCardBlockKey(block),
          heading: block.heading,
          body: block.body,
          lines: block.lines,
          ids: block.sourceItemIds,
        }))
      : [],
  });
}

function getAvailableBlockHeight(card: HTMLElement, header: HTMLElement): number {
  const cardRect = card.getBoundingClientRect();
  const headerRect = header.getBoundingClientRect();
  const style = window.getComputedStyle(card);
  const borderBottom = parseFloat(style.borderBottomWidth || "0");
  const paddingBottom = parseFloat(style.paddingBottom || "0");
  const contentBottom = cardRect.bottom - borderBottom - paddingBottom;

  return Math.max(1, contentBottom - headerRect.bottom);
}

function getOuterHeight(element: HTMLElement): number {
  const rect = element.getBoundingClientRect();
  const style = window.getComputedStyle(element);
  const marginTop = parseFloat(style.marginTop || "0");
  const marginBottom = parseFloat(style.marginBottom || "0");

  return rect.height + marginTop + marginBottom;
}

function cssEscape(value: string): string {
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
    return CSS.escape(value);
  }

  return value.replace(/["\\]/g, "\\$&");
}
