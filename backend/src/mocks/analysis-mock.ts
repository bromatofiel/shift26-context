import type { AnalysisResponse } from '../../../shared/dist/types/analysis.js';

/**
 * Mock analysis generator for testing
 * Returns deterministic mock data for a given URL
 */
export function createMockAnalysis(url: string): AnalysisResponse {
  return {
    source_article: {
      url,
      title: "Mock Article Title",
      content: "Mock article content for testing purposes.",
      extracted_date: new Date().toISOString()
    },
    bias_score: {
      score: 5,
      color: "orange",
      confidence: 0.75
    },
    main_signals: [
      {
        type: "tone",
        description: "Mock signal for testing",
        severity: "medium"
      }
    ],
    counter_perspectives: [
      {
        title: "Alternative perspective",
        source: "Mock Source",
        url: "https://example.com/alternative",
        key_differences: ["Different framing", "Additional context"]
      }
    ],
    global_context: {
      summary: "Mock global context summary",
      missing_angles: ["Angle 1", "Angle 2"]
    },
    analyzed_at: new Date().toISOString()
  };
}
