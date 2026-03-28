import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

import { fetchArticle } from '../services/fetcher.js';
import { extractArticle } from '../services/extractor.js';
import { createGeminiClient } from '../services/gemini.js';
import { createGroundedSearchClient } from '../services/grounded-search.js';
import { createDifferencesExtractor } from '../services/differences.js';

import type { AnalysisResponse, SourceArticle, CounterPerspective } from '../../../shared/dist/types/analysis.js';

export const analyzeRoute = new Hono();

const requestSchema = z.object({
  url: z.string().url(),
  locale: z.string().optional(),
  timeout_ms: z.number().positive().max(15000).optional()
});

// Error response type
interface ErrorResponse {
  error: string;
  code: 'FETCH_FAILED' | 'EXTRACTION_FAILED' | 'ANALYSIS_FAILED' | 'SEARCH_FAILED' | 'TIMEOUT';
  message: string;
  partial_result?: Partial<AnalysisResponse>;
}

analyzeRoute.post('/v1/analyze', zValidator('json', requestSchema), async (c) => {
  const startTime = Date.now();
  const { url, timeout_ms = 10000 } = c.req.valid('json');

  // Track remaining time
  const timeRemaining = () => timeout_ms - (Date.now() - startTime);

  try {
    // Step 1: Fetch HTML (ING-01, ING-02, ING-03)
    const fetchResult = await fetchArticle(url, Math.min(5000, timeRemaining()));
    if (!fetchResult.ok) {
      return c.json<ErrorResponse>({
        error: 'fetch_error',
        code: 'FETCH_FAILED',
        message: fetchResult.message
      }, 502);
    }

    // Step 2: Extract content (EXT-01, EXT-02, EXT-03)
    const extractResult = extractArticle(fetchResult.html, fetchResult.finalUrl);

    // Build source article
    const source_article: SourceArticle = {
      url: fetchResult.finalUrl,
      title: extractResult.ok ? extractResult.article.title : (extractResult.partial_content?.title || 'Unknown'),
      content: extractResult.ok ? extractResult.article.textContent : (extractResult.partial_content?.excerpt || ''),
      extracted_date: extractResult.ok ? (extractResult.article.publishedTime || undefined) : undefined,
      media_url: undefined  // Could be extracted from og:image
    };

    if (!extractResult.ok && !extractResult.partial_content) {
      return c.json<ErrorResponse>({
        error: 'extraction_error',
        code: 'EXTRACTION_FAILED',
        message: extractResult.message
      }, 422);
    }

    // Step 3: Initialize clients
    const geminiClient = createGeminiClient();
    const searchClient = createGroundedSearchClient();
    const differencesExtractor = createDifferencesExtractor();

    // Step 4: Run bias analysis (ANA-01, ANA-02, ANA-04)
    const analysisResult = await geminiClient.analyzeArticle(
      source_article.content,
      source_article.title
    );

    if (!analysisResult.ok) {
      return c.json<ErrorResponse>({
        error: 'analysis_error',
        code: 'ANALYSIS_FAILED',
        message: analysisResult.message,
        partial_result: { source_article }
      }, 500);
    }

    // Step 5: Search for alternatives (SRC-01, SRC-02, SRC-03)
    const searchResult = await searchClient.searchAlternatives(
      source_article.title,
      source_article.content.slice(0, 500),
      source_article.url
    );

    let counter_perspectives: CounterPerspective[] = [];

    if (searchResult.ok && timeRemaining() > 2000) {
      // Step 6: Extract differences (ANA-03)
      const differencesResult = await differencesExtractor.extractDifferences(
        source_article.title,
        source_article.content,
        searchResult.alternatives
      );

      if (differencesResult.ok) {
        counter_perspectives = differencesResult.perspectives;
      } else {
        // Fallback: use search results without detailed differences
        counter_perspectives = searchResult.alternatives.map(alt => ({
          title: alt.title,
          source: alt.source,
          url: alt.url,
          key_differences: [alt.snippet],
          published_date: alt.publishedDate
        }));
      }
    } else if (searchResult.ok) {
      // Timeout approaching: use search results as-is
      counter_perspectives = searchResult.alternatives.map(alt => ({
        title: alt.title,
        source: alt.source,
        url: alt.url,
        key_differences: [alt.snippet],
        published_date: alt.publishedDate
      }));
    }

    // If no alternatives found, use placeholders from analysis
    if (counter_perspectives.length === 0) {
      counter_perspectives = analysisResult.analysis.counter_perspectives;
    }

    // Step 7: Build response
    const response: AnalysisResponse = {
      source_article,
      bias_score: analysisResult.analysis.bias_score,
      main_signals: analysisResult.analysis.main_signals,
      counter_perspectives,
      global_context: analysisResult.analysis.global_context,
      analyzed_at: new Date().toISOString()
    };

    // Add partial flag if extraction was partial (EXT-03)
    if (extractResult.ok && extractResult.partial) {
      (response as any).extraction_partial = true;
    }

    return c.json(response, 200);

  } catch (error) {
    return c.json<ErrorResponse>({
      error: 'internal_error',
      code: 'ANALYSIS_FAILED',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});
