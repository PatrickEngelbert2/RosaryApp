"use client";

import { useState, useSyncExternalStore } from "react";
import { clearStorageRecoveryNotice, getStorageRecoveryNotice } from "@/lib/rosary/storage";

export function StorageRecoveryNotice() {
  const [dismissed, setDismissed] = useState(false);
  const message = useSyncExternalStore(
    () => () => {},
    getStorageRecoveryNotice,
    () => null,
  );

  if (!message || dismissed) {
    return null;
  }

  return (
    <div className="border-b border-gold-500/20 bg-cream-100">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-5 py-3 text-sm leading-6 text-blue-900 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <p>{message}</p>
        <button
          type="button"
          onClick={() => {
            clearStorageRecoveryNotice();
            setDismissed(true);
          }}
          className="interactive-link self-start font-semibold underline md:self-auto"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
