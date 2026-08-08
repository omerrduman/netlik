import { GoogleGenAI, Type, type Content, type Schema } from "@google/genai";
import type { ChatMessage } from "@/types/scope";
import {
  SCOPE_CHAT_SYSTEM_PROMPT,
  SCOPE_SYSTEM_PROMPT,
  PLAN_CHAT_SYSTEM_PROMPT,
  PLAN_SYSTEM_PROMPT,
} from "./prompts";
import { getGeminiApiKey, getGeminiModel } from "@/lib/env";

export type AIMode = "scope" | "plan";

let client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  if (!client) {
    client = new GoogleGenAI({ apiKey: getGeminiApiKey() });
  }
  return client;
}

// Gemini kesin bir user/model dönüşümü bekliyor ve geçmiş bir "user"
// turuyla başlamalı. Kendi nötr rollerimizi eşliyoruz ve bitişik aynı-rol
// turlarını (örn. bir retry'den kaynaklanan) metinlerini birleştirerek
// tek bir tura indiriyoruz.
function toGeminiContents(messages: ChatMessage[]): Content[] {
  const userStartIndex = messages.findIndex((m) => m.role === "user");
  const trimmed = userStartIndex === -1 ? [] : messages.slice(userStartIndex);

  const contents: Content[] = [];
  for (const message of trimmed) {
    const role = message.role === "assistant" ? "model" : "user";
    const last = contents[contents.length - 1];
    if (last && last.role === role) {
      last.parts![0].text += `\n\n${message.content}`;
    } else {
      contents.push({ role, parts: [{ text: message.content }] });
    }
  }
  return contents;
}

const SCOPE_DOCUMENT_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    projectTitle: { type: Type.STRING },
    summary: { type: Type.STRING },
    phases: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          estimatedDuration: { type: Type.STRING },
        },
        required: ["name", "description", "estimatedDuration"],
      },
    },
    estimatedDuration: { type: Type.STRING },
    estimatedBudget: { type: Type.STRING },
    attentionPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: [
    "projectTitle",
    "summary",
    "phases",
    "estimatedDuration",
    "estimatedBudget",
    "attentionPoints",
  ],
};

const PLAN_DOCUMENT_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    projectTitle: { type: Type.STRING },
    summary: { type: Type.STRING },
    targetUsers: { type: Type.STRING },
    scopeIncluded: { type: Type.ARRAY, items: { type: Type.STRING } },
    scopeExcluded: { type: Type.ARRAY, items: { type: Type.STRING } },
    suggestedTechStack: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          area: { type: Type.STRING },
          choice: { type: Type.STRING },
          reasoning: { type: Type.STRING },
        },
        required: ["area", "choice", "reasoning"],
      },
    },
    architectureOverview: { type: Type.STRING },
    dataModel: { type: Type.STRING },
    apiEndpoints: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          method: { type: Type.STRING },
          path: { type: Type.STRING },
          description: { type: Type.STRING },
        },
        required: ["method", "path", "description"],
      },
    },
    environmentVariables: { type: Type.ARRAY, items: { type: Type.STRING } },
    phases: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          goal: { type: Type.STRING },
          tasks: { type: Type.ARRAY, items: { type: Type.STRING } },
          complexity: { type: Type.STRING },
        },
        required: ["name", "goal", "tasks", "complexity"],
      },
    },
    openQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
    strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
    risks: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: [
    "projectTitle",
    "summary",
    "targetUsers",
    "scopeIncluded",
    "scopeExcluded",
    "suggestedTechStack",
    "architectureOverview",
    "dataModel",
    "apiEndpoints",
    "environmentVariables",
    "phases",
    "openQuestions",
    "strengths",
    "risks",
  ],
};

const SYSTEM_PROMPTS_CHAT: Record<AIMode, string> = {
  scope: SCOPE_CHAT_SYSTEM_PROMPT,
  plan: PLAN_CHAT_SYSTEM_PROMPT,
};

const SYSTEM_PROMPTS_JSON: Record<AIMode, string> = {
  scope: SCOPE_SYSTEM_PROMPT,
  plan: PLAN_SYSTEM_PROMPT,
};

const RESPONSE_SCHEMAS: Record<AIMode, Schema> = {
  scope: SCOPE_DOCUMENT_SCHEMA,
  plan: PLAN_DOCUMENT_SCHEMA,
};

const TRAILING_INSTRUCTION: Record<AIMode, string> = {
  scope: "Şimdi konuşmaya dayanarak kapsam belgesini üret.",
  plan: "Şimdi konuşmaya dayanarak proje planını üret.",
};

export interface GeminiCallOptions {
  json?: boolean;
  mode?: AIMode;
}

export async function generateGeminiReply(
  messages: ChatMessage[],
  opts: GeminiCallOptions = {}
): Promise<string> {
  const mode: AIMode = opts.mode ?? "scope";
  const contents = toGeminiContents(messages);
  if (contents.length === 0) {
    throw new Error("callAI requires at least one user message");
  }

  // Gemini, geçmişi bir "model" turuyla biten istekleri reddediyor. Belge
  // üretimi bir asistan sorusundan hemen sonra tetikleniyor (henüz yeni bir
  // user yanıtı yokken), bu yüzden turu kapatmak için açık bir kapanış
  // talimatı ekliyoruz. Bu koşul mode'dan bağımsız kalmalı — sadece aşağıda
  // yerine konan metin mode'a göre değişiyor.
  if (opts.json && contents[contents.length - 1].role === "model") {
    contents.push({
      role: "user",
      parts: [{ text: TRAILING_INSTRUCTION[mode] }],
    });
  }

  const ai = getClient();
  const response = await ai.models.generateContent({
    model: getGeminiModel(),
    contents,
    config: opts.json
      ? {
          systemInstruction: SYSTEM_PROMPTS_JSON[mode],
          responseMimeType: "application/json",
          responseSchema: RESPONSE_SCHEMAS[mode],
        }
      : {
          systemInstruction: SYSTEM_PROMPTS_CHAT[mode],
        },
  });

  const text = response.text;
  if (!text) {
    throw new Error("Gemini returned an empty response");
  }
  return text;
}
