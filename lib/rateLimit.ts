import { createHash } from "node:crypto";

export interface RateLimitResult {
  ok: boolean;
  retryAfter?: number;
}

const RATE_LIMITS = {
  chat: { limit: 20, windowSeconds: 600 },
  "generate-scope": { limit: 5, windowSeconds: 600 },
  "plan-chat": { limit: 20, windowSeconds: 600 },
  "generate-plan": { limit: 5, windowSeconds: 600 },
} as const;

export type RateLimitedRoute = keyof typeof RATE_LIMITS;

const RATE_LIMIT_MESSAGE = "Çok fazla istek gönderildi, lütfen birazdan tekrar deneyin.";

interface Bucket {
  count: number;
  windowStart: number;
}

/**
 * Bellek içi (in-memory) sabit pencereli sınırlayıcı — iyi niyetli bir
 * kötüye kullanım koruması, kesin bir güvenlik sınırı değil. Sunucu süreci
 * bazında yaşar: yeniden başlatma/deploy'da sıfırlanır ve eşzamanlı
 * serverless instance'lar arasında paylaşılmaz. Bu ileride önemli olursa
 * (örn. Supabase tekrar bağlanınca), bu Map'i aynı şekilde anahtarlanmış
 * (ip hash + route) bir `rate_limit_hits` tablosuyla değiştirebilirsin —
 * checkRateLimit/rateLimitResponse çağrı noktalarının değişmesine gerek yok.
 */
const buckets = new Map<string, Bucket>();

function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex");
}

// setInterval kullanmıyoruz — zamanlayıcılar serverless soğuk
// başlangıç/uyku durumlarında güvenilir şekilde hayatta kalmıyor. Onun yerine,
// bellek tek seferlik/değişen IP'lerden sınırsız büyümesin diye normal bir
// kontrol çağrısında ara sıra süresi dolmuş kayıtları temizliyoruz.
function sweepExpired(maxAgeMs: number) {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (now - bucket.windowStart >= maxAgeMs) {
      buckets.delete(key);
    }
  }
}

export async function checkRateLimit(
  ip: string,
  route: RateLimitedRoute
): Promise<RateLimitResult> {
  const { limit, windowSeconds } = RATE_LIMITS[route];
  const windowMs = windowSeconds * 1000;
  const key = `${route}:${hashIp(ip)}`;
  const now = Date.now();

  if (Math.random() < 0.01) sweepExpired(windowMs);

  const bucket = buckets.get(key);
  if (!bucket || now - bucket.windowStart >= windowMs) {
    buckets.set(key, { count: 1, windowStart: now });
    return { ok: true };
  }

  if (bucket.count >= limit) {
    const retryAfter = Math.ceil((bucket.windowStart + windowMs - now) / 1000);
    return { ok: false, retryAfter };
  }

  bucket.count += 1;
  return { ok: true };
}

export function rateLimitResponse(result: RateLimitResult): Response {
  const headers = result.retryAfter
    ? { "Retry-After": String(result.retryAfter) }
    : undefined;
  return Response.json({ error: RATE_LIMIT_MESSAGE }, { status: 429, headers });
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "unknown";
}
