"use client";

import { type CSSProperties } from "react";
import type { ScopeDocument } from "@/types/scope";
import { useDocumentChat } from "@/lib/hooks/useDocumentChat";
import MessageList from "./MessageList";
import NetlikRing from "./NetlikRing";
import ScopeDocumentView from "./ScopeDocumentView";

interface ChatWidgetProps {
  freelancerId: string;
  title?: string;
  welcomeMessage?: string;
  accentColor?: string;
}

export default function ChatWidget({
  freelancerId,
  title = "Netlik",
  welcomeMessage = "Merhaba! Aklındaki proje hakkında birkaç şey anlatır mısın?",
  accentColor,
}: ChatWidgetProps) {
  const {
    messages,
    input,
    setInput,
    isSending,
    isGenerating: isGeneratingScope,
    document: scopeDocument,
    error,
    canGenerate: canGenerateScope,
    sendMessage,
    generateDocument: generateScope,
  } = useDocumentChat<ScopeDocument>({
    chatEndpoint: "/api/chat",
    generateEndpoint: "/api/generate-scope",
    documentKey: "scopeDocument",
    welcomeMessage,
    extraBody: { freelancerId },
  });

  return (
    <div
      className="flex h-full max-h-[640px] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-border bg-background"
      style={
        accentColor ? ({ "--accent-cyan": accentColor } as CSSProperties) : undefined
      }
    >
      <header className="flex items-center gap-2 border-b border-border px-4 py-3">
        <NetlikRing size={24} />
        <span className="font-medium text-foreground">{title}</span>
      </header>

      {scopeDocument ? (
        <div className="flex-1 overflow-y-auto p-4">
          <ScopeDocumentView document={scopeDocument} />
        </div>
      ) : (
        <>
          <MessageList
            messages={messages}
            isSending={isSending}
            className="flex flex-1 flex-col gap-3 overflow-y-auto p-4"
          />

          {error && (
            <div className="px-4 pb-2 text-xs text-accent-orange">{error}</div>
          )}

          {canGenerateScope && (
            <div className="px-4 pb-2">
              <button
                onClick={generateScope}
                disabled={isGeneratingScope}
                className="w-full rounded-lg border border-accent-cyan/40 py-2 text-xs font-medium text-accent-cyan transition-colors hover:bg-accent-cyan/10 disabled:opacity-50"
              >
                {isGeneratingScope
                  ? "Kapsam belgesi hazırlanıyor..."
                  : "Kapsam belgesini oluştur"}
              </button>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex items-center gap-2 border-t border-border p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Mesajınızı yazın..."
              disabled={isSending}
              className="flex-1 rounded-full bg-surface px-4 py-2 text-sm text-foreground outline-none placeholder:text-muted"
            />
            <button
              type="submit"
              disabled={isSending || !input.trim()}
              className="rounded-full bg-accent-cyan px-4 py-2 text-sm font-medium text-background disabled:opacity-50"
            >
              Gönder
            </button>
          </form>
        </>
      )}
    </div>
  );
}
