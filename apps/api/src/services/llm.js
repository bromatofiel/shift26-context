import { config, isGeminiConfigured } from "../config.js";
import { analysisJsonSchema, analysisSchema } from "../schema.js";

export async function analyzeWithGemini({ article, alternatives, request }) {
  if (!isGeminiConfigured()) {
    return null;
  }

  const prompt = buildPrompt({ article, alternatives, request });

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${config.geminiModel}:generateContent`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-goog-api-key": config.geminiApiKey
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          responseMimeType: "application/json",
          responseJsonSchema: analysisJsonSchema
        }
      })
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini failed with status ${response.status}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("Gemini returned no structured output");
  }

  return analysisSchema.parse(JSON.parse(text));
}

function buildPrompt({ article, alternatives, request }) {
  const alternativesBlock = alternatives.length
    ? alternatives
        .map(
          (item, index) =>
            `${index + 1}. media=${item.media}\nurl=${item.url}\ntitle=${item.title}\nsnippet=${item.snippet}`
        )
        .join("\n\n")
    : "No alternative articles were found.";

  return [
    "You are a neutral editorial analyst.",
    "Your job is to compare one source article with alternative coverage and identify framing, missing context, and counter-perspectives.",
    "Do not accuse any media outlet of lying.",
    "Do not infer political intent.",
    "If evidence is weak, keep confidence low and avoid extreme scores.",
    "Return JSON only.",
    "",
    "Scoring rule:",
    "- green = low apparent bias",
    "- orange = partial or incomplete coverage",
    "- red = strongly framed or materially incomplete coverage",
    "",
    `Request locale: ${request.locale || "unknown"}`,
    `Shared URL: ${request.url}`,
    "",
    "Source article:",
    `title=${article.title}`,
    `media=${article.siteName || article.hostname}`,
    `byline=${article.byline || "unknown"}`,
    `excerpt=${article.excerpt || "none"}`,
    `content=${truncate(article.contentText, 12000)}`,
    "",
    "Alternative coverage:",
    alternativesBlock,
    "",
    "Required output style:",
    "- Keep strings short and easy to understand.",
    "- Use only the provided source and alternative snippets.",
    "- If no alternative provides enough evidence, say so in the limits or confidence.",
    "- The missing_fact field must be cautious and concrete."
  ].join("\n");
}

function truncate(value, maxLength) {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength)}...`;
}
