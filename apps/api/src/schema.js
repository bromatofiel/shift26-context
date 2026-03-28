import { z } from "zod";

const looseUrlSchema = z.string().trim().refine((value) => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}, "Invalid URL");

export const analyzeRequestSchema = z.object({
  url: looseUrlSchema,
  title_hint: z.string().optional().nullable(),
  text_hint: z.string().optional().nullable(),
  locale: z.string().optional().nullable(),
  source: z.string().optional().nullable(),
  mode: z.enum(["balanced", "main_article_only"]).optional().nullable(),
  timeout_ms: z.number().int().positive().max(15000).optional().nullable()
});

export const analysisSchema = z.object({
  source_article: z.object({
    title: z.string(),
    media: z.string(),
    published_at: z.string().nullable().optional(),
    bias: z.object({
      score: z.number().int().min(0).max(10),
      color: z.enum(["green", "orange", "red"]),
      main_signals: z.array(z.string()).max(5)
    }),
    tone: z.string(),
    coverage: z.array(z.string()).max(5),
    limits: z.array(z.string()).max(5)
  }),
  counter_perspectives: z
    .array(
      z.object({
        media: z.string(),
        url: z.string().url(),
        stance: z.string(),
        missing_fact: z.string(),
        why_relevant: z.string()
      })
    )
    .max(3),
  global_context: z.string(),
  confidence: z.object({
    level: z.enum(["low", "medium", "high"]),
    reason: z.string()
  }),
  structured_input: z
    .object({
      source: z.string(),
      title: z.string(),
      authors: z.array(z.string()),
      sections: z.array(
        z.object({
          heading: z.string().optional(),
          paragraphs: z.array(z.string())
        })
      )
    })
    .optional()
});

export const analysisJsonSchema = {
  type: "object",
  properties: {
    source_article: {
      type: "object",
      properties: {
        title: { type: "string" },
        media: { type: "string" },
        published_at: { type: ["string", "null"] },
        bias: {
          type: "object",
          properties: {
            score: { type: "integer", minimum: 0, maximum: 10 },
            color: { type: "string", enum: ["green", "orange", "red"] },
            main_signals: {
              type: "array",
              items: { type: "string" }
            }
          },
          required: ["score", "color", "main_signals"]
        },
        tone: { type: "string" },
        coverage: {
          type: "array",
          items: { type: "string" }
        },
        limits: {
          type: "array",
          items: { type: "string" }
        }
      },
      required: ["title", "media", "bias", "tone", "coverage", "limits"]
    },
    counter_perspectives: {
      type: "array",
      items: {
        type: "object",
        properties: {
          media: { type: "string" },
          url: { type: "string" },
          stance: { type: "string" },
          missing_fact: { type: "string" },
          why_relevant: { type: "string" }
        },
        required: ["media", "url", "stance", "missing_fact", "why_relevant"]
      }
    },
    global_context: { type: "string" },
    confidence: {
      type: "object",
      properties: {
        level: { type: "string", enum: ["low", "medium", "high"] },
        reason: { type: "string" }
      },
      required: ["level", "reason"]
    },
    structured_input: {
      type: "object",
      properties: {
        source: { type: "string" },
        title: { type: "string" },
        authors: { type: "array", items: { type: "string" } },
        sections: {
          type: "array",
          items: {
            type: "object",
            properties: {
              heading: { type: "string" },
              paragraphs: { type: "array", items: { type: "string" } }
            },
            required: ["paragraphs"]
          }
        }
      },
      required: ["source", "title", "authors", "sections"]
    }
  },
  required: ["source_article", "counter_perspectives", "global_context", "confidence"]
};
