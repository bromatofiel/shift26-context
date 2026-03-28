import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { SYSTEM_INSTRUCTION, FEW_SHOT_EXAMPLES } from '../prompts/bias-analysis.js';
import { BIAS_ANALYSIS_JSON_SCHEMA, validateLLMResponse, BiasAnalysis } from '../schemas/llm-response.js';

export interface GeminiConfig {
  apiKey: string;
  model?: string;  // Default: gemini-2.5-flash
  timeoutMs?: number;  // Default: 8000
}

export type AnalysisResult = {
  ok: true;
  analysis: BiasAnalysis;
  tokenUsage?: { input: number; output: number };
} | {
  ok: false;
  error: 'API_ERROR' | 'VALIDATION_ERROR' | 'TIMEOUT' | 'INVALID_RESPONSE';
  message: string;
  details?: string[];
}

export class GeminiClient {
  private client: GoogleGenerativeAI;
  private model: string;
  private timeoutMs: number;

  constructor(config: GeminiConfig) {
    this.client = new GoogleGenerativeAI(config.apiKey);
    this.model = config.model || 'gemini-2.5-flash';
    this.timeoutMs = config.timeoutMs || 8000;
  }

  async analyzeArticle(articleContent: string, articleTitle: string): Promise<AnalysisResult> {
    try {
      const model = this.client.getGenerativeModel({
        model: this.model,
        systemInstruction: SYSTEM_INSTRUCTION,
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: BIAS_ANALYSIS_JSON_SCHEMA as any,
          temperature: 0.2,  // Low temperature for consistent analysis
          maxOutputTokens: 2048
        },
        safetySettings: [
          { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE }
        ]
      });

      // Build chat with few-shot examples
      const chat = model.startChat({
        history: FEW_SHOT_EXAMPLES.map(ex => ({
          role: ex.role as 'user' | 'model',
          parts: [{ text: ex.content }]
        }))
      });

      // Send the actual article for analysis
      const userPrompt = `Article titre: "${articleTitle}"\n\nContenu:\n${articleContent}`;

      const result = await Promise.race([
        chat.sendMessage(userPrompt),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('TIMEOUT')), this.timeoutMs)
        )
      ]);

      const response = result.response;
      const text = response.text();

      // Parse JSON response
      let parsed: unknown;
      try {
        parsed = JSON.parse(text);
      } catch {
        return {
          ok: false,
          error: 'INVALID_RESPONSE',
          message: 'LLM response is not valid JSON',
          details: [text.slice(0, 200)]
        };
      }

      // Validate against schema (per ANA-05)
      const validation = validateLLMResponse(parsed);
      if (!validation.valid) {
        return {
          ok: false,
          error: 'VALIDATION_ERROR',
          message: 'LLM response does not match expected schema',
          details: validation.errors
        };
      }

      return {
        ok: true,
        analysis: validation.data,
        tokenUsage: response.usageMetadata ? {
          input: response.usageMetadata.promptTokenCount || 0,
          output: response.usageMetadata.candidatesTokenCount || 0
        } : undefined
      };

    } catch (error) {
      if (error instanceof Error && error.message === 'TIMEOUT') {
        return {
          ok: false,
          error: 'TIMEOUT',
          message: `LLM analysis timed out after ${this.timeoutMs}ms`
        };
      }
      return {
        ok: false,
        error: 'API_ERROR',
        message: error instanceof Error ? error.message : 'Unknown Gemini API error'
      };
    }
  }
}

// Factory function for convenience
export function createGeminiClient(apiKey?: string): GeminiClient {
  const key = apiKey || process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error('GEMINI_API_KEY is required. Set it in environment or pass to createGeminiClient.');
  }
  return new GeminiClient({ apiKey: key });
}
