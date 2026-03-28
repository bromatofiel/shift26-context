import { GoogleGenerativeAI, DynamicRetrievalMode } from '@google/generative-ai';

export interface AlternativeSource {
  title: string;
  url: string;
  source: string;  // Domain name
  snippet: string;
  publishedDate?: string;
}

export type SearchResult = {
  ok: true;
  alternatives: AlternativeSource[];
  searchQuery: string;  // The query used
} | {
  ok: false;
  error: 'SEARCH_FAILED' | 'NO_RESULTS' | 'TIMEOUT';
  message: string;
}

export interface GroundedSearchConfig {
  apiKey: string;
  model?: string;  // Default: gemini-1.5-flash
  timeoutMs?: number;  // Default: 5000
}

export class GroundedSearchClient {
  private client: GoogleGenerativeAI;
  private model: string;
  private timeoutMs: number;

  constructor(config: GroundedSearchConfig) {
    this.client = new GoogleGenerativeAI(config.apiKey);
    this.model = config.model || 'gemini-1.5-flash';
    this.timeoutMs = config.timeoutMs || 5000;
  }

  async searchAlternatives(
    articleTitle: string,
    articleExcerpt: string,
    sourceUrl: string
  ): Promise<SearchResult> {
    try {
      const model = this.client.getGenerativeModel({
        model: this.model,
        tools: [{
          googleSearchRetrieval: {
            dynamicRetrievalConfig: {
              mode: DynamicRetrievalMode.MODE_DYNAMIC
            }
          }
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 1024
        }
      });

      // Per SRC-01: Search for 2-4 alternatives on same topic
      const searchPrompt = `
Trouve 3 articles d'actualite recents sur le meme sujet que:
"${articleTitle}"

Contexte: ${articleExcerpt.slice(0, 300)}

IMPORTANT:
- Articles de sources DIFFERENTES du domaine ${new URL(sourceUrl).hostname}
- Articles RECENTS (moins de 7 jours si possible)
- Perspectives DIVERSES (pas que le meme angle)

Pour chaque article trouve, donne:
- Titre exact
- URL complete
- Nom de la source (media)
- Court extrait (1-2 phrases)

Format JSON:
{ "alternatives": [{ "title": "...", "url": "...", "source": "...", "snippet": "..." }, ...] }
`;

      const result = await Promise.race([
        model.generateContent(searchPrompt),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('TIMEOUT')), this.timeoutMs)
        )
      ]);

      const response = result.response;
      const text = response.text();

      // Extract JSON from response (may have markdown wrapping)
      const jsonMatch = text.match(/\{[\s\S]*"alternatives"[\s\S]*\}/);
      if (!jsonMatch) {
        return {
          ok: false,
          error: 'NO_RESULTS',
          message: 'Could not extract alternatives from search response'
        };
      }

      const parsed = JSON.parse(jsonMatch[0]);
      const alternatives: AlternativeSource[] = parsed.alternatives || [];

      // Per SRC-02: Deduplicate domains
      const seenDomains = new Set<string>();
      const sourceDomain = new URL(sourceUrl).hostname.replace('www.', '');
      seenDomains.add(sourceDomain);

      const deduped = alternatives.filter(alt => {
        try {
          const domain = new URL(alt.url).hostname.replace('www.', '');
          if (seenDomains.has(domain)) return false;
          seenDomains.add(domain);
          return true;
        } catch {
          return false;  // Invalid URL
        }
      });

      // Per SRC-03: Take top 2-3 diverse sources
      const topAlternatives = deduped.slice(0, 3);

      if (topAlternatives.length < 2) {
        return {
          ok: false,
          error: 'NO_RESULTS',
          message: `Found only ${topAlternatives.length} alternative(s), need at least 2`
        };
      }

      return {
        ok: true,
        alternatives: topAlternatives,
        searchQuery: articleTitle
      };

    } catch (error) {
      if (error instanceof Error && error.message === 'TIMEOUT') {
        return {
          ok: false,
          error: 'TIMEOUT',
          message: `Search timed out after ${this.timeoutMs}ms`
        };
      }
      return {
        ok: false,
        error: 'SEARCH_FAILED',
        message: error instanceof Error ? error.message : 'Unknown search error'
      };
    }
  }
}

export function createGroundedSearchClient(apiKey?: string): GroundedSearchClient {
  const key = apiKey || process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error('GEMINI_API_KEY is required for Grounded Search');
  }
  return new GroundedSearchClient({ apiKey: key });
}
