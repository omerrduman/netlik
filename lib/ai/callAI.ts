import type { ChatMessage } from "@/types/scope";
import { generateGeminiReply, type AIMode } from "./gemini";

export interface CallAIOptions {
  /** Sağlayıcıdan ham JSON döndürmesini iste (belge üretiminde kullanılır). */
  json?: boolean;
  /** Hangi persona/şema çiftinin kullanılacağı. Varsayılan "scope". */
  mode?: AIMode;
}

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryable(err: unknown): boolean {
  const status = (err as { status?: number } | null)?.status;
  return status === 429 || status === 503;
}

/**
 * Uygulamadaki tüm AI çağrıları için tek giriş noktası. Şu anda Gemini
 * kullanıyor; ileride sağlayıcı değiştirmek (örn. gelir oluşunca Claude'a
 * geçmek) sadece bu dosyanın içeriğini değiştirmek anlamına gelir, hiçbir
 * çağıran kodu etkilemez.
 */
export async function callAI(
  messages: ChatMessage[],
  opts: CallAIOptions = {}
): Promise<string> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await generateGeminiReply(messages, opts);
    } catch (err) {
      lastError = err;
      if (!isRetryable(err) || attempt === MAX_RETRIES) {
        break;
      }
      await sleep(BASE_DELAY_MS * 2 ** attempt);
    }
  }
  throw lastError;
}
