export function getGeminiApiKey(): string {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }
  return apiKey;
}

export function getGeminiModel(): string {
  return process.env.GEMINI_MODEL || "gemini-flash-lite-latest";
}
