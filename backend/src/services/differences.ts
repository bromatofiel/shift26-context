import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';

// Schema for differences extraction
const DifferenceSchema = z.object({
  alternative_title: z.string(),
  alternative_source: z.string(),
  alternative_url: z.string(),
  key_differences: z.array(z.string()).min(1).max(5)
});

const DifferencesResponseSchema = z.object({
  comparisons: z.array(DifferenceSchema)
});

export interface AlternativeWithDifferences {
  title: string;
  source: string;
  url: string;
  key_differences: string[];
  published_date?: string;
}

export type DifferencesResult = {
  ok: true;
  perspectives: AlternativeWithDifferences[];
} | {
  ok: false;
  error: 'EXTRACTION_FAILED' | 'TIMEOUT' | 'VALIDATION_ERROR';
  message: string;
}

export interface DifferencesConfig {
  apiKey: string;
  model?: string;
  timeoutMs?: number;
}

export class DifferencesExtractor {
  private client: GoogleGenerativeAI;
  private model: string;
  private timeoutMs: number;

  constructor(config: DifferencesConfig) {
    this.client = new GoogleGenerativeAI(config.apiKey);
    this.model = config.model || 'gemini-1.5-flash';
    this.timeoutMs = config.timeoutMs || 4000;
  }

  async extractDifferences(
    sourceTitle: string,
    sourceContent: string,
    alternatives: Array<{ title: string; source: string; url: string; snippet: string }>
  ): Promise<DifferencesResult> {
    try {
      const model = this.client.getGenerativeModel({
        model: this.model,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2,
          maxOutputTokens: 1024
        }
      });

      const alternativesText = alternatives.map((alt, i) =>
        `${i + 1}. "${alt.title}" (${alt.source})\n   ${alt.snippet}`
      ).join('\n\n');

      const prompt = `
Compare l'article source avec les alternatives suivantes. Pour chaque alternative, identifie 2-4 differences cles.

ARTICLE SOURCE:
Titre: "${sourceTitle}"
Contenu (extrait): ${sourceContent.slice(0, 1500)}

ALTERNATIVES:
${alternativesText}

Pour chaque alternative, analyse:
- Faits selectionnes (quels faits sont presents/absents?)
- Angle de traitement (comment le sujet est presente?)
- Ton (neutre, critique, favorable?)

Reponds en JSON:
{
  "comparisons": [
    {
      "alternative_title": "...",
      "alternative_source": "...",
      "alternative_url": "...",
      "key_differences": ["Difference 1", "Difference 2", ...]
    }
  ]
}
`;

      const result = await Promise.race([
        model.generateContent(prompt),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('TIMEOUT')), this.timeoutMs)
        )
      ]);

      const response = result.response;
      const text = response.text();

      // Parse and validate
      let parsed: unknown;
      try {
        parsed = JSON.parse(text);
      } catch {
        // Try to extract JSON from response
        const jsonMatch = text.match(/\{[\s\S]*"comparisons"[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Invalid JSON response');
        }
      }

      const validation = DifferencesResponseSchema.safeParse(parsed);
      if (!validation.success) {
        return {
          ok: false,
          error: 'VALIDATION_ERROR',
          message: 'Differences response does not match schema'
        };
      }

      // Map to output format
      const perspectives: AlternativeWithDifferences[] = validation.data.comparisons.map(comp => ({
        title: comp.alternative_title,
        source: comp.alternative_source,
        url: comp.alternative_url,
        key_differences: comp.key_differences
      }));

      return { ok: true, perspectives };

    } catch (error) {
      if (error instanceof Error && error.message === 'TIMEOUT') {
        return {
          ok: false,
          error: 'TIMEOUT',
          message: `Differences extraction timed out after ${this.timeoutMs}ms`
        };
      }
      return {
        ok: false,
        error: 'EXTRACTION_FAILED',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

export function createDifferencesExtractor(apiKey?: string): DifferencesExtractor {
  const key = apiKey || process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error('GEMINI_API_KEY is required for differences extraction');
  }
  return new DifferencesExtractor({ apiKey: key });
}
