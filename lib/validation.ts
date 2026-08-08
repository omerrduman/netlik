import type { ChatMessage } from "@/types/scope";

function isChatMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== "object") return false;
  const message = value as Partial<ChatMessage>;
  return (
    (message.role === "user" || message.role === "assistant") &&
    typeof message.content === "string"
  );
}

/**
 * Bir istek gövdesindeki `messages` alanını doğrular. Herhangi bir şekil
 * uyuşmazlığında null döner, böylece çağıranlar bozuk bir öğenin
 * lib/ai/gemini.ts'e kadar ulaşıp Gemini çağrısının derinliklerinde
 * belirsiz bir hataya yol açmasına izin vermek yerine temiz bir 400
 * yanıtı dönebilir.
 */
export function parseChatMessages(value: unknown): ChatMessage[] | null {
  if (!Array.isArray(value) || value.length === 0) return null;
  return value.every(isChatMessage) ? value : null;
}
