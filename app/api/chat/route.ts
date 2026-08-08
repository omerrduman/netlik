import type { ChatMessage } from "@/types/scope";
import { callAI } from "@/lib/ai/callAI";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rateLimit";
import { parseChatMessages } from "@/lib/validation";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rate = await checkRateLimit(ip, "chat");
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

  try {
    const reply = await callAI(messages);
    return Response.json({
      message: { role: "assistant", content: reply } satisfies ChatMessage,
    });
  } catch (err) {
    console.error("[/api/chat]", err);
    return Response.json(
      { error: "Şu anda yanıt üretilemedi, lütfen birazdan tekrar deneyin." },
      { status: 502 }
    );
  }
}
