const FENCE_RE = /^```(?:json)?\s*([\s\S]*?)\s*```$/i;

/**
 * Markdown kod bloklarına sarılmış veya açıklayıcı metinle çevrelenmiş
 * olabilecek ham bir model yanıtından JSON nesnesini geri kazanır. Asla
 * hata fırlatmaz — başarısızlıkta null döner, böylece çağıranlar tekrar
 * denenip denenmeyeceğine kendileri karar verebilir.
 */
export function extractJson<T>(raw: string): T | null {
  let text = raw.trim();

  const fenceMatch = text.match(FENCE_RE);
  if (fenceMatch) {
    text = fenceMatch[1].trim();
  }

  if (!text.startsWith("{") && !text.startsWith("[")) {
    const firstBrace = text.indexOf("{");
    const lastBrace = text.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      text = text.slice(firstBrace, lastBrace + 1);
    }
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}
