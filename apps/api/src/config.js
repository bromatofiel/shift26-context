export const config = {
  port: Number(process.env.PORT || 3001),
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  geminiModel: process.env.GEMINI_MODEL || "gemini-2.5-flash",
  serperApiKey: process.env.SERPER_API_KEY || "",
  serperGl: process.env.SERPER_GL || "fr",
  serperHl: process.env.SERPER_HL || "fr",
  defaultTimeoutMs: Number(process.env.DEFAULT_TIMEOUT_MS || 4500)
};

export function isGeminiConfigured() {
  return Boolean(config.geminiApiKey);
}

export function isSerperConfigured() {
  return Boolean(config.serperApiKey);
}
