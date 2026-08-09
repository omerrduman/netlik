"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { TechnicalPlanDocument } from "@/types/plan";
import { useDocumentChat } from "@/lib/hooks/useDocumentChat";
import {
  getPlanHistory,
  savePlanToHistory,
  updatePlanInHistory,
  deletePlanFromHistory,
  type PlanHistoryEntry,
} from "@/lib/planHistory";
import { PLAN_TEMPLATES } from "@/lib/planTemplates";
import type { UsageToday } from "@/lib/geminiUsage";
import MessageList from "@/components/widget/MessageList";
import NetlikRing from "@/components/widget/NetlikRing";
import PlanDocumentView from "./PlanDocumentView";
import PlanHistoryList from "./PlanHistoryList";

const WELCOME_MESSAGE =
  "Merhaba! Yaptırmak istediğin projeyi anlatır mısın? Birkaç soru sorup senin için sağlam bir teknik plan çıkaracağım.";

export default function PlanChat() {
  const {
    messages,
    input,
    setInput,
    isSending,
    isGenerating,
    document: planDocument,
    error,
    canGenerate,
    sendMessage,
    generateDocument,
    updateDocument,
  } = useDocumentChat<TechnicalPlanDocument>({
    chatEndpoint: "/api/plan/chat",
    generateEndpoint: "/api/plan/generate",
    documentKey: "planDocument",
    welcomeMessage: WELCOME_MESSAGE,
  });

  const [showHistory, setShowHistory] = useState(false);
  const [selectedHistoryEntry, setSelectedHistoryEntry] = useState<PlanHistoryEntry | null>(
    null
  );
  // Ref kullanıyoruz çünkü bu değer JSX'te hiçbir yerde doğrudan
  // gösterilmiyor — sadece handleSaveEdit'in en güncel değeri okuması
  // yeterli, değiştiğinde yeniden render tetiklemesine gerek yok.
  const liveHistoryIdRef = useRef<string | null>(null);
  const [historyEntries, setHistoryEntries] = useState<PlanHistoryEntry[]>([]);
  const [usage, setUsage] = useState<UsageToday | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Canlı üretilen plan geçmişe sadece bir kez, ilk üretildiğinde kaydedilir.
  // liveHistoryIdRef zaten set edilmişse (örn. düzenleme sonrası
  // updateDocument yeniden bir belge nesnesi verdiği için) tekrar
  // kaydetmiyoruz — aksi halde her düzenlemede yinelenen bir geçmiş kaydı
  // oluşurdu.
  useEffect(() => {
    if (planDocument && liveHistoryIdRef.current === null) {
      const entry = savePlanToHistory(planDocument);
      liveHistoryIdRef.current = entry.id;
    }
  }, [planDocument]);

  // Sayfa açılışında ve her plan üretiminden sonra kalan günlük hakkı tazele.
  useEffect(() => {
    fetch("/api/plan/usage")
      .then((res) => res.json())
      .then(setUsage)
      .catch(() => {});
  }, [planDocument]);

  function openHistory() {
    setHistoryEntries(getPlanHistory());
    setSelectedHistoryEntry(null);
    setShowHistory(true);
  }

  function closeHistory() {
    setShowHistory(false);
  }

  function selectHistoryEntry(entry: PlanHistoryEntry) {
    setSelectedHistoryEntry(entry);
    setShowHistory(false);
  }

  function deleteHistoryEntry(id: string) {
    deletePlanFromHistory(id);
    setHistoryEntries((prev) => prev.filter((entry) => entry.id !== id));
  }

  function handleSaveEdit(editedDoc: TechnicalPlanDocument) {
    const targetId = selectedHistoryEntry?.id ?? liveHistoryIdRef.current;
    if (targetId) {
      updatePlanInHistory(targetId, editedDoc);
    }
    if (selectedHistoryEntry) {
      setSelectedHistoryEntry({ ...selectedHistoryEntry, document: editedDoc });
    } else {
      updateDocument(editedDoc);
    }
  }

  function applyTemplate(seedMessage: string) {
    setInput(seedMessage);
    inputRef.current?.focus();
  }

  return (
    <div className="flex h-full w-full flex-1 flex-col">
      <header className="flex items-center justify-between gap-3 border-b border-border px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <NetlikRing size={26} />
          <span className="font-medium text-foreground">Netlik Proje Planlayıcı</span>
        </Link>
        <div className="flex items-center gap-3">
          {usage && (
            <span className="text-xs text-muted">
              Bugün kalan plan hakkı: {usage.remainingPlans}/{usage.budget}
            </span>
          )}
          <button
            onClick={openHistory}
            className="rounded-lg border border-border px-2.5 py-1 text-xs text-muted transition-colors hover:text-foreground"
          >
            Geçmiş Planlarım
          </button>
        </div>
      </header>

      {showHistory ? (
        <PlanHistoryList
          entries={historyEntries}
          onSelect={selectHistoryEntry}
          onDelete={deleteHistoryEntry}
          onClose={closeHistory}
        />
      ) : selectedHistoryEntry ? (
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl p-6">
            <button
              onClick={() => setSelectedHistoryEntry(null)}
              className="mb-4 rounded-lg border border-border px-2.5 py-1 text-xs text-muted transition-colors hover:text-foreground"
            >
              Geri
            </button>
            <PlanDocumentView
              document={selectedHistoryEntry.document}
              onSave={handleSaveEdit}
            />
          </div>
        </div>
      ) : planDocument ? (
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl p-6">
            <PlanDocumentView document={planDocument} onSave={handleSaveEdit} />
          </div>
        </div>
      ) : (
        <>
          <MessageList
            messages={messages}
            isSending={isSending}
            className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-3 overflow-y-auto p-6"
          />

          {messages.length === 1 && (
            <div className="mx-auto flex w-full max-w-3xl flex-wrap gap-2 px-6 pb-2">
              {PLAN_TEMPLATES.map((template) => (
                <button
                  key={template.label}
                  onClick={() => applyTemplate(template.seedMessage)}
                  className="rounded-full border border-border px-3 py-1.5 text-xs text-muted transition-colors hover:border-accent-cyan/40 hover:text-accent-cyan"
                >
                  {template.label}
                </button>
              ))}
            </div>
          )}

          {error && (
            <div className="mx-auto w-full max-w-3xl px-6 pb-2 text-xs text-accent-orange">
              {error}
            </div>
          )}

          {canGenerate && (
            <div className="mx-auto w-full max-w-3xl px-6 pb-2">
              <button
                onClick={generateDocument}
                disabled={isGenerating}
                className="w-full rounded-lg border border-accent-cyan/40 py-2.5 text-xs font-medium text-accent-cyan transition-colors hover:bg-accent-cyan/10 disabled:opacity-50"
              >
                {isGenerating ? "Plan hazırlanıyor..." : "Planı oluştur"}
              </button>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="border-t border-border"
          >
            <div className="mx-auto flex w-full max-w-3xl items-center gap-2 p-4">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Projeni anlat..."
                disabled={isSending}
                className="flex-1 rounded-full bg-surface px-4 py-2.5 text-sm text-foreground outline-none placeholder:text-muted"
              />
              <button
                type="submit"
                disabled={isSending || !input.trim()}
                className="rounded-full bg-accent-cyan px-5 py-2.5 text-sm font-medium text-background disabled:opacity-50"
              >
                Gönder
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
