import type { ScopeDocument } from "@/types/scope";
import { callAI } from "@/lib/ai/callAI";
import { extractJson } from "@/lib/extractJson";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rateLimit";
import { parseChatMessages } from "@/lib/validation";

function isValidScopeDocument(value: unknown): value is ScopeDocument {
  if (!value || typeof value !== "object") return false;
  const doc = value as Partial<ScopeDocument>;
  return (
    typeof doc.projectTitle === "string" &&
    typeof doc.summary === "string" &&
    Array.isArray(doc.phases) &&
    typeof doc.estimatedDuration === "string" &&
    typeof doc.estimatedBudget === "string" &&
    Array.isArray(doc.attentionPoints)
  );
}

const MAX_ATTEMPTS = 2;

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rate = await checkRateLimit(ip, "generate-scope");
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

  let scopeDocument: ScopeDocument | null = null;

  for (let attempt = 0; attempt < MAX_ATTEMPTS && !scopeDocument; attempt++) {
    try {
      const raw = await callAI(messages, { json: true });
      const parsed = extractJson<ScopeDocument>(raw);
      if (parsed && isValidScopeDocument(parsed)) {
        scopeDocument = parsed;
      }
    } catch (err) {
      console.error("[/api/generate-scope] attempt failed", err);
    }
  }

  if (!scopeDocument) {
    return Response.json(
      { error: "Kapsam belgesi oluşturulamadı, lütfen tekrar deneyin." },
      { status: 502 }
    );
  }

  return Response.json({ scopeDocument });
}
