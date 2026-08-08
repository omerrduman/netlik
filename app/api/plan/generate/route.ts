import type { TechnicalPlanDocument } from "@/types/plan";
import { callAI } from "@/lib/ai/callAI";
import { extractJson } from "@/lib/extractJson";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rateLimit";
import { parseChatMessages } from "@/lib/validation";

function isValidPlanDocument(value: unknown): value is TechnicalPlanDocument {
  if (!value || typeof value !== "object") return false;
  const doc = value as Partial<TechnicalPlanDocument>;
  return (
    typeof doc.projectTitle === "string" &&
    typeof doc.summary === "string" &&
    typeof doc.targetUsers === "string" &&
    Array.isArray(doc.scopeIncluded) &&
    Array.isArray(doc.scopeExcluded) &&
    Array.isArray(doc.suggestedTechStack) &&
    typeof doc.architectureOverview === "string" &&
    typeof doc.dataModel === "string" &&
    Array.isArray(doc.apiEndpoints) &&
    Array.isArray(doc.environmentVariables) &&
    Array.isArray(doc.phases) &&
    Array.isArray(doc.openQuestions) &&
    Array.isArray(doc.strengths) &&
    Array.isArray(doc.risks)
  );
}

const MAX_ATTEMPTS = 2;

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rate = await checkRateLimit(ip, "generate-plan");
  if (!rate.ok) {
    return rateLimitResponse(rate);
  }

  let body: { messages?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const messages = parseChatMessages(body.messages);
  if (!messages) {
    return Response.json({ error: "messages is required" }, { status: 400 });
  }

  let planDocument: TechnicalPlanDocument | null = null;

  for (let attempt = 0; attempt < MAX_ATTEMPTS && !planDocument; attempt++) {
    try {
      const raw = await callAI(messages, { json: true, mode: "plan" });
      const parsed = extractJson<TechnicalPlanDocument>(raw);
      if (parsed && isValidPlanDocument(parsed)) {
        planDocument = parsed;
      }
    } catch (err) {
      console.error("[/api/plan/generate] attempt failed", err);
    }
  }

  if (!planDocument) {
    return Response.json(
      { error: "Proje planı oluşturulamadı, lütfen tekrar deneyin." },
      { status: 502 }
    );
  }

  return Response.json({ planDocument });
}
