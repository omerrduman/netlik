"use client";

import Link from "next/link";
import type { TechnicalPlanDocument } from "@/types/plan";
import { useDocumentChat } from "@/lib/hooks/useDocumentChat";
import MessageList from "@/components/widget/MessageList";
import NetlikRing from "@/components/widget/NetlikRing";
import PlanDocumentView from "./PlanDocumentView";

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
  } = useDocumentChat<TechnicalPlanDocument>({
    chatEndpoint: "/api/plan/chat",
    generateEndpoint: "/api/plan/generate",
    documentKey: "planDocument",
    welcomeMessage: WELCOME_MESSAGE,
  });

  return (
    <div className="flex h-full w-full flex-1 flex-col">
      <header className="flex items-center gap-2 border-b border-border px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <NetlikRing size={26} />
          <span className="font-medium text-foreground">Netlik Proje Planlayıcı</span>
        </Link>
      </header>

      {planDocument ? (
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl p-6">
            <PlanDocumentView document={planDocument} />
          </div>
        </div>
      ) : (
        <>
          <MessageList
            messages={messages}
            isSending={isSending}
            className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-3 overflow-y-auto p-6"
          />

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
