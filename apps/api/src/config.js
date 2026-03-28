export const config = {
  port: Number(process.env.PORT || 3001),
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  geminiModel: process.env.GEMINI_MODEL || "gemini-2.5-flash",
  serperApiKey: process.env.SERPER_API_KEY || "0cc6507421ca0441ee8229c34e5db9fc265350cb2b11c785c0b6545ff745574a",
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
