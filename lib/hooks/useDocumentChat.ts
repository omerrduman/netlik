"use client";

import { useState } from "react";
import type { ChatMessage } from "@/types/scope";

export interface UseDocumentChatOptions {
  chatEndpoint: string;
  generateEndpoint: string;
  /** Generate endpoint'inin JSON yanıtında üretilen belgeyi tutan anahtar. */
  documentKey: string;
  welcomeMessage: string;
  /** Her iki istek gövdesine de eklenen ekstra alanlar (örn. widget'ın freelancerId'si). */
  extraBody?: Record<string, unknown>;
}

export interface UseDocumentChatResult<TDoc> {
  messages: ChatMessage[];
  input: string;
  setInput: (value: string) => void;
  isSending: boolean;
  isGenerating: boolean;
  document: TDoc | null;
  error: string | null;
  canGenerate: boolean;
  sendMessage: () => Promise<void>;
  generateDocument: () => Promise<void>;
}

// Sohbet personaları (lib/ai/prompts.ts), yeterince soru sorduklarında son
// mesajlarını bu işaretle bitirecek şekilde yönlendiriliyor. Mesajı
// göstermeden/kaydetmeden önce bu işareti temizliyoruz ve varlığını,
// "belge oluştur" butonunun tek bir yanıttan sonra değil, ne zaman
// görünmesi gerektiğine karar vermek için kullanıyoruz.
const READY_MARKER_RE = /\s*\[HAZIR\]\s*$/i;

// Modelin işareti unutma ihtimaline karşı bir güvenlik ağı — personaların
// kendi belirttiği maksimum soru sayısıyla (~4-6) uyumlu, böylece buton
// asla sonsuza kadar gizli kalmaz.
const READY_FALLBACK_MESSAGE_COUNT = 6;

/**
 * Paylaşılan sohbet-belge akışı: mesajları bir chat endpoint'ine gönderir,
 * asistan netleştirmeyi bitirdiğini işaret ettiğinde (ya da bir yedek mesaj
 * sayısına ulaşıldığında) bir generate endpoint'ini çağırarak yapılandırılmış
 * bir belge üretir. Hem freelancer widget'ı (ScopeDocument) hem de proje
 * planlayıcı (TechnicalPlanDocument) tarafından kullanılır — aynı state
 * makinesi, farklı endpoint/belge şekli/render mantığı.
 */
export function useDocumentChat<TDoc>({
  chatEndpoint,
  generateEndpoint,
  documentKey,
  welcomeMessage,
  extraBody,
}: UseDocumentChatOptions): UseDocumentChatResult<TDoc> {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: welcomeMessage },
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [document, setDocument] = useState<TDoc | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  const userMessageCount = messages.filter((m) => m.role === "user").length;
  const canGenerate =
    (isReady || userMessageCount >= READY_FALLBACK_MESSAGE_COUNT) &&
    !isSending &&
    !isGenerating;

  async function sendMessage() {
    const content = input.trim();
    if (!content || isSending) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content }];
    setMessages(nextMessages);
    setInput("");
    setIsSending(true);
    setError(null);

    try {
      const res = await fetch(chatEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...extraBody, messages: nextMessages }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Bir hata oluştu");

      const rawReply = (data.message as ChatMessage).content;
      if (READY_MARKER_RE.test(rawReply)) {
        setIsReady(true);
      }
      const reply: ChatMessage = {
        role: "assistant",
        content: rawReply.replace(READY_MARKER_RE, "").trim(),
      };
      setMessages((prev) => [...prev, reply]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setIsSending(false);
    }
  }

  async function generateDocument() {
    setIsGenerating(true);
    setError(null);
    try {
      const res = await fetch(generateEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...extraBody, messages }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Bir hata oluştu");
      setDocument(data[documentKey] as TDoc);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setIsGenerating(false);
    }
  }

  return {
    messages,
    input,
    setInput,
    isSending,
    isGenerating,
    document,
    error,
    canGenerate,
    sendMessage,
    generateDocument,
  };
}
