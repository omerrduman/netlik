import type { TechnicalPlanDocument } from "@/types/plan";

export interface PlanHistoryEntry {
  id: string;
  createdAt: string;
  document: TechnicalPlanDocument;
}

const STORAGE_KEY = "netlik.planHistory.v1";
const MAX_ENTRIES = 50;

function generateId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function getPlanHistory(): PlanHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as PlanHistoryEntry[]) : [];
  } catch {
    return [];
  }
}

function writeHistory(entries: PlanHistoryEntry[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Kota dolmuş veya localStorage kullanılamıyor olabilir — sessizce yut,
    // aktif plan gösterimi bu yüzden bozulmamalı.
  }
}

export function savePlanToHistory(document: TechnicalPlanDocument): PlanHistoryEntry {
  const entry: PlanHistoryEntry = {
    id: generateId(),
    createdAt: new Date().toISOString(),
    document,
  };
  const entries = [entry, ...getPlanHistory()].slice(0, MAX_ENTRIES);
  writeHistory(entries);
  return entry;
}

export function updatePlanInHistory(id: string, document: TechnicalPlanDocument): void {
  const entries = getPlanHistory().map((entry) =>
    entry.id === id ? { ...entry, document } : entry
  );
  writeHistory(entries);
}

export function deletePlanFromHistory(id: string): void {
  writeHistory(getPlanHistory().filter((entry) => entry.id !== id));
}
