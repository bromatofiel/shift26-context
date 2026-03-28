import { z } from 'zod';

// Per ANA-01: Bias score with color mapping
export const BiasScoreSchema = z.object({
  score: z.number().min(0).max(10),
  color: z.enum(['green', 'orange', 'red']),
  confidence: z.number().min(0).max(1)
});

// Per ANA-02: Bias signals
export const SignalSchema = z.object({
  type: z.enum(['tone', 'framing', 'omission', 'source_selection']),
  description: z.string().min(10).max(500),
  severity: z.enum(['low', 'medium', 'high'])
});

// Per ANA-03: Counter-perspectives
export const CounterPerspectiveSchema = z.object({
  title: z.string().min(5).max(200),
  source: z.string().min(2).max(100),
  url: z.string().url(),
  key_differences: z.array(z.string()).min(1).max(5),
  published_date: z.string().optional()
});

// Per ANA-04: Global context
export const GlobalContextSchema = z.object({
  summary: z.string().min(50).max(1000),
  missing_angles: z.array(z.string()).min(1).max(5)
});

// Complete bias analysis response from LLM
export const BiasAnalysisSchema = z.object({
  bias_score: BiasScoreSchema,
  main_signals: z.array(SignalSchema).min(1).max(5),
  counter_perspectives: z.array(CounterPerspectiveSchema).min(2).max(3),
  global_context: GlobalContextSchema
});

export type BiasAnalysis = z.infer<typeof BiasAnalysisSchema>;

// Validation function with error details
export function validateLLMResponse(data: unknown): { valid: true; data: BiasAnalysis } | { valid: false; errors: string[] } {
  const result = BiasAnalysisSchema.safeParse(data);
  if (result.success) {
    return { valid: true, data: result.data };
  }
  return {
    valid: false,
    errors: result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
  };
}

// JSON Schema version for Gemini function calling
export const BIAS_ANALYSIS_JSON_SCHEMA = {
  type: "object",
  properties: {
    bias_score: {
      type: "object",
      properties: {
        score: { type: "number", minimum: 0, maximum: 10 },
        color: { type: "string", enum: ["green", "orange", "red"] },
        confidence: { type: "number", minimum: 0, maximum: 1 }
      },
      required: ["score", "color", "confidence"]
    },
    main_signals: {
      type: "array",
      items: {
        type: "object",
        properties: {
          type: { type: "string", enum: ["tone", "framing", "omission", "source_selection"] },
          description: { type: "string" },
          severity: { type: "string", enum: ["low", "medium", "high"] }
        },
        required: ["type", "description", "severity"]
      }
    },
    counter_perspectives: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          source: { type: "string" },
          url: { type: "string" },
          key_differences: { type: "array", items: { type: "string" } },
          published_date: { type: "string" }
        },
        required: ["title", "source", "url", "key_differences"]
      }
    },
    global_context: {
      type: "object",
      properties: {
        summary: { type: "string" },
        missing_angles: { type: "array", items: { type: "string" } }
      },
      required: ["summary", "missing_angles"]
    }
  },
  required: ["bias_score", "main_signals", "counter_perspectives", "global_context"]
};
