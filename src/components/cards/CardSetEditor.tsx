"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CardContentEditor } from "@/components/cards/CardContentEditor";
import { CardPreview } from "@/components/cards/CardPreview";
import { CardSlotEditor } from "@/components/cards/CardSlotEditor";
import { Card } from "@/components/ui/Card";
import { clampCardCount, ensureCardSlots, getVisibleCardSlots } from "@/lib/rosary/cardUtils";
import { createDefaultCardSetFromRosaryConfig, makeLeaderCardContent } from "@/lib/rosary/defaultCards";
import {
  getSavedCardSets,
  getSavedRosaryConfigs,
  saveCardSet,
  setActiveCardSet,
} from "@/lib/rosary/storage";
import type { RosaryCardContent, RosaryCardSet } from "@/lib/rosary/types";

export function CardSetEditor() {
  const [cardSets, setCardSets] = useState<RosaryCardSet[]>([]);
  const [cardSet, setCardSet] = useState<RosaryCardSet>(() =>
    createDefaultCardSetFromRosaryConfig(),
  );
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    queueMicrotask(() => {
      const savedCardSets = getSavedCardSets().map(ensureCardSlots);
      setCardSets(savedCardSets);
      if (savedCardSets[0]) {
        setCardSet(savedCardSets[0]);
        setActiveCardSet(savedCardSets[0].id);
        return;
      }

      const savedConfig = getSavedRosaryConfigs()[0];
      setCardSet(createDefaultCardSetFromRosaryConfig(savedConfig));
    });
  }, []);

  const visibleSlots = useMemo(() => getVisibleCardSlots(cardSet), [cardSet]);

  function updateCardCount(count: number) {
    setCardSet((current) =>
      ensureCardSlots({
        ...current,
        cardCount: clampCardCount(count),
        updatedAt: new Date().toISOString(),
      }),
    );
  }

  function updateMasterCard(content: RosaryCardContent) {
    setCardSet((current) => ({
      ...current,
      masterCard: content,
      updatedAt: new Date().toISOString(),
    }));
  }

  function saveCurrentCardSet() {
    const next = ensureCardSlots({
      ...cardSet,
      updatedAt: new Date().toISOString(),
      name: cardSet.name.trim() || "Walk the Rosary Guide Cards",
    });
    saveCardSet(next);
    setCardSet(next);
    setCardSets((current) => [...current.filter((item) => item.id !== next.id), next]);
    setSaveMessage("Guide card set saved on this device.");
  }

  function selectCardSet(id: string) {
    const selected = cardSets.find((item) => item.id === id);
    if (selected) {
      const next = ensureCardSlots(selected);
      setCardSet(next);
      setActiveCardSet(next.id);
    }
  }

  function makeCardOneLeader() {
    setCardSet((current) => {
      const next = ensureCardSlots(current);
      const slots = next.cardSlots.map((slot) => {
        if (slot.cardNumber !== 1) {
          return slot;
        }

        return {
          ...slot,
          useMasterCard: false,
          overrideContent: makeLeaderCardContent(slot.overrideContent ?? next.masterCard),
        };
      });

      return { ...next, cardSlots: slots, updatedAt: new Date().toISOString() };
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold text-blue-900" htmlFor="card-set-name">
              Card set name
            </label>
            <input
              id="card-set-name"
              value={cardSet.name}
              onChange={(event) =>
                setCardSet((current) => ({ ...current, name: event.target.value }))
              }
              className="mt-2 w-full rounded-md border border-blue-900/20 px-3 py-3 text-base"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-blue-900" htmlFor="saved-card-set">
              Saved card sets
            </label>
            <select
              id="saved-card-set"
              value={cardSet.id}
              onChange={(event) => selectCardSet(event.target.value)}
              className="mt-2 w-full rounded-md border border-blue-900/20 bg-white px-3 py-3 text-base"
            >
              <option value={cardSet.id}>{cardSet.name}</option>
              {cardSets
                .filter((item) => item.id !== cardSet.id)
                .map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
            </select>
          </div>
        </div>

        <label className="mt-5 block text-sm font-semibold text-blue-900" htmlFor="card-count">
          Number of cards needed
        </label>
        <input
          id="card-count"
          type="number"
          min={1}
          max={24}
          value={cardSet.cardCount}
          onChange={(event) => updateCardCount(Number(event.target.value))}
          className="mt-2 w-full max-w-xs rounded-md border border-blue-900/20 px-3 py-3 text-base"
        />
        <p className="mt-2 text-sm leading-6 text-slate-700">
          Cards print four per letter-size sheet. Only the selected number of cards will be visible.
        </p>
      </Card>

      <Card>
        <h2 className="text-2xl font-semibold text-blue-900">Master card</h2>
        <p className="mt-3 leading-7 text-slate-700">
          By default, all cards match the master card. Customize an individual card if you want one
          card to include leader notes while the rest stay simple for participants.
        </p>
        <CardContentEditor content={cardSet.masterCard} onChange={updateMasterCard} />
        <div className="mt-5">
          <CardPreview content={cardSet.masterCard} label="Master card" />
        </div>
      </Card>

      <Card>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-blue-900">Individual cards</h2>
            <p className="mt-2 leading-7 text-slate-700">
              Linked cards follow the master. Customized cards keep their own front and back content.
            </p>
          </div>
          <button
            type="button"
            onClick={makeCardOneLeader}
            className="rounded-md border border-blue-900/20 bg-white px-4 py-3 font-semibold text-blue-900"
          >
            Make Card 1 a leader card
          </button>
        </div>

        <div className="mt-5 space-y-5">
          {visibleSlots.map((slot) => (
            <CardSlotEditor
              key={slot.id}
              cardSet={cardSet}
              slot={slot}
              onChange={(nextSlot) =>
                setCardSet((current) => ({
                  ...current,
                  cardSlots: ensureCardSlots(current).cardSlots.map((item) =>
                    item.id === nextSlot.id ? nextSlot : item,
                  ),
                  updatedAt: new Date().toISOString(),
                }))
              }
            />
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="text-2xl font-semibold text-blue-900">Save and print</h2>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={saveCurrentCardSet}
            className="rounded-md bg-blue-900 px-5 py-3 font-semibold text-white hover:bg-blue-800"
          >
            Save card set
          </button>
          <Link
            href="/cards/print"
            onClick={() => saveCardSet(ensureCardSlots(cardSet))}
            className="inline-flex items-center justify-center rounded-md border border-blue-900/20 bg-white px-5 py-3 font-semibold text-blue-900"
          >
            Print / Save as PDF
          </Link>
        </div>
        {saveMessage ? <p className="mt-3 font-semibold text-blue-900">{saveMessage}</p> : null}
      </Card>
    </div>
  );
}
