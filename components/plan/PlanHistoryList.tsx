"use client";

import type { PlanHistoryEntry } from "@/lib/planHistory";

interface PlanHistoryListProps {
  entries: PlanHistoryEntry[];
  onSelect: (entry: PlanHistoryEntry) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export default function PlanHistoryList({
  entries,
  onSelect,
  onDelete,
  onClose,
}: PlanHistoryListProps) {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Geçmiş Planlarım</h2>
          <button
            onClick={onClose}
            className="rounded-lg border border-border px-2.5 py-1 text-xs text-muted transition-colors hover:text-foreground"
          >
            Geri
          </button>
        </div>

        {entries.length === 0 ? (
          <p className="text-sm text-muted">Henüz kaydedilmiş bir plan yok.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {entries.map((entry) => (
              <li
                key={entry.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface p-3"
              >
                <button
                  onClick={() => onSelect(entry)}
                  className="min-w-0 flex-1 text-left"
                >
                  <div className="truncate font-medium text-foreground">
                    {entry.document.projectTitle}
                  </div>
                  <div className="mt-0.5 text-xs text-muted">
                    {new Date(entry.createdAt).toLocaleString("tr-TR")}
                  </div>
                </button>
                <button
                  onClick={() => onDelete(entry.id)}
                  className="shrink-0 rounded-lg border border-border px-2.5 py-1 text-xs text-muted transition-colors hover:text-accent-orange"
                >
                  Sil
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
