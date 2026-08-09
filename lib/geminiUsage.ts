// Gemini'nin ücretsiz katman kotası Google Cloud projesi bazında (yani tek
// paylaşılan GEMINI_API_KEY için) ve Pasifik saatinde gece yarısı
// sıfırlanıyor. Bu sayaç aynı saat dilimini kullanıyor ki gösterilen rakam
// gerçek kotayla senkron kalsın.
//
// Gemini'nin kendi kotası (~1000 istek/gün) teorik olarak çok daha fazla
// plana izin verir (~142/gün), ama bu araç tek bir kişisel kullanıcı için —
// o yüzden günlük hakkı bilinçli olarak düşük tutuyoruz.
const DAILY_PLAN_BUDGET = 15;
// Persona'ların kendi üst sınırı ~4-6 soru + 1 üretim çağrısı — muhafazakar
// bir ortalama.
const AVG_GEMINI_CALLS_PER_PLAN = 7;

interface DailyUsage {
  date: string;
  count: number;
}

// Bellek içi, sunucu süreci bazlı — lib/rateLimit.ts ile aynı kabul edilmiş
// sınırlama (Vercel'de birden fazla instance arasında paylaşılmaz).
let usage: DailyUsage = { date: "", count: 0 };

function getPacificDateKey(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/** Gerçek bir Gemini ağ çağrısı başarıyla döndüğünde bir kez çağrılır. */
export function recordGeminiCall(): void {
  const today = getPacificDateKey();
  if (usage.date !== today) {
    usage = { date: today, count: 0 };
  }
  usage.count += 1;
}

export interface UsageToday {
  usedToday: number;
  budget: number;
  remainingPlans: number;
}

export function getUsageToday(): UsageToday {
  const today = getPacificDateKey();
  const usedToday = usage.date === today ? usage.count : 0;
  const remainingPlans = Math.max(
    0,
    DAILY_PLAN_BUDGET - Math.ceil(usedToday / AVG_GEMINI_CALLS_PER_PLAN)
  );
  return { usedToday, budget: DAILY_PLAN_BUDGET, remainingPlans };
}
