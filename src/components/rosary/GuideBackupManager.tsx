"use client";

import { useRef, useState } from "react";
import { Card } from "@/components/ui/Card";
import {
  createGuideBackupFile,
  createGuideBackupFilename,
  parseGuideBackupJson,
  prepareGuideBackupImport,
} from "@/lib/rosary/guideBackups";
import { createId } from "@/lib/rosary/configUtils";
import {
  getGuideCardCustomizations,
  getSavedRosaryConfigs,
  saveGuideCardSelectedGuideId,
  saveImportedGuideBackup,
  setActiveRosaryConfig,
} from "@/lib/rosary/storage";
import type { UserRosaryConfig } from "@/lib/rosary/types";

type GuideBackupManagerProps = {
  guides: UserRosaryConfig[];
  selectedGuideId?: string;
  onImported?: (importedGuideId: string | undefined) => void;
};

export function GuideBackupManager({
  guides,
  selectedGuideId,
  onImported,
}: GuideBackupManagerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const selectedGuide = selectedGuideId
    ? guides.find((guide) => guide.id === selectedGuideId)
    : undefined;
  const hasGuides = guides.length > 0;

  function downloadBackup(kind: "selected" | "all") {
    const guidesToExport = kind === "selected" && selectedGuide ? [selectedGuide] : guides;

    if (guidesToExport.length === 0) {
      setMessage({
        tone: "error",
        text: "Save a guide first, then you can back it up.",
      });
      return;
    }

    const backup = createGuideBackupFile({
      type: kind === "selected" ? "single-guide" : "all-guides",
      guides: guidesToExport,
      cardCustomizations: getGuideCardCustomizations(),
    });
    const filename = createGuideBackupFilename(guidesToExport[0]?.name ?? "", backup.type);
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setMessage({
      tone: "success",
      text: kind === "selected" ? "Backup downloaded for this guide." : "Backup downloaded for all guides.",
    });
  }

  async function importBackup(file: File | undefined) {
    if (!file) {
      return;
    }

    try {
      const parsed = parseGuideBackupJson(await file.text());

      if (!parsed.ok) {
        setMessage({ tone: "error", text: parsed.message });
        return;
      }

      const existingGuides = getSavedRosaryConfigs();
      const existingCustomizations = getGuideCardCustomizations();
      const importResult = prepareGuideBackupImport({
        backup: {
          guides: parsed.result.guides,
          cardCustomizations: parsed.result.cardCustomizations,
        },
        existingGuides,
        existingCustomizations,
        createId,
      });

      if (!saveImportedGuideBackup(importResult)) {
        setMessage({
          tone: "error",
          text: "This browser could not save the imported backup. Please check private browsing or storage settings and try again.",
        });
        return;
      }

      const importedGuide = importResult.guides[existingGuides.length];

      if (importedGuide) {
        setActiveRosaryConfig(importedGuide.id);
        saveGuideCardSelectedGuideId(importedGuide.id);
      }

      onImported?.(importedGuide?.id);
      setMessage({
        tone: "success",
        text:
          importResult.importedGuideCount === 1
            ? "Imported 1 guide."
            : `Imported ${importResult.importedGuideCount} guides.`,
      });
    } catch {
      setMessage({
        tone: "error",
        text: "This backup file could not be imported. It may be from an incompatible preview version.",
      });
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  return (
    <Card>
      <div className="grid gap-5">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-gold-500">
            Guide backup
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-blue-900">Keep a copy of your guides</h2>
          <p className="mt-3 leading-7 text-slate-700">
            Your guides are saved in this browser. Back them up if you want to keep a copy or move
            them to another device.
          </p>
          {!hasGuides ? (
            <p className="mt-3 rounded-md bg-cream-100 px-4 py-3 text-sm font-medium text-slate-700">
              No saved guides yet. Create and save a guide, then this section can back it up.
            </p>
          ) : null}
          {message ? (
            <p
              className={`mt-3 rounded-md px-4 py-3 text-sm font-semibold ${
                message.tone === "success" ? "bg-cream-100 text-blue-900" : "bg-white text-red-700"
              }`}
            >
              {message.text}
            </p>
          ) : null}
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <button
            type="button"
            disabled={!selectedGuide}
            onClick={() => downloadBackup("selected")}
            className="interactive-button interactive-button-primary rounded-md bg-blue-900 px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-900/30 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50"
          >
            Back up this guide
          </button>
          <button
            type="button"
            disabled={!hasGuides}
            onClick={() => downloadBackup("all")}
            className="interactive-button interactive-button-secondary rounded-md border border-blue-900/20 bg-white px-4 py-3 font-semibold text-blue-900 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-900/30 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50"
          >
            Back up all guides
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="interactive-button interactive-button-secondary rounded-md border border-blue-900/20 bg-white px-4 py-3 font-semibold text-blue-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-900/30 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50"
          >
            Import guide backup
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="sr-only"
            onChange={(event) => {
              void importBackup(event.target.files?.[0]);
            }}
          />
        </div>
      </div>
    </Card>
  );
}
