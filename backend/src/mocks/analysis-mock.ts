import type {
  AnalysisResponse,
  SourceArticle,
  BiasScore,
  Signal,
  CounterPerspective,
  GlobalContext
} from '@blindspot/shared';

/**
 * Mock analysis data generator
 * Per D-05: Structure correct, placeholder values
 * Per D-06: No dynamic logic, static placeholders
 *
 * Validates API contract before implementing real analysis in Phase 2
 */
export function createMockAnalysis(url: string): AnalysisResponse {
  const source_article: SourceArticle = {
    url,
    title: "Article Title (Mock)",
    content: "Article content will be extracted here. This is placeholder text for Phase 1 testing.",
    extracted_date: "2026-03-28T10:00:00Z",
    media_url: undefined
  };

  const bias_score: BiasScore = {
    score: 5,
    color: "orange",
    confidence: 0.7
  };

  const main_signals: Signal[] = [
    {
      type: "tone",
      description: "Mock signal: tone analysis",
      severity: "medium"
    },
    {
      type: "framing",
      description: "Mock signal: framing analysis",
      severity: "low"
    },
    {
      type: "omission",
      description: "Mock signal: missing context",
      severity: "high"
    }
  ];

  const counter_perspectives: CounterPerspective[] = [
    {
      title: "Alternative Perspective 1",
      source: "Source A",
      url: "https://example.com/alt1",
      key_differences: ["Different framing", "Additional context"],
      published_date: "2026-03-27T14:00:00Z"
    },
    {
      title: "Alternative Perspective 2",
      source: "Source B",
      url: "https://example.com/alt2",
      key_differences: ["Counter argument", "Different sources cited"],
      published_date: "2026-03-26T09:00:00Z"
    }
  ];

  const global_context: GlobalContext = {
    summary: "Mock summary: This is a placeholder global context summary for testing purposes.",
    missing_angles: ["Economic impact not covered", "Historical precedent missing"]
  };

  const analyzed_at = new Date().toISOString();

  return {
    source_article,
    bias_score,
    main_signals,
    counter_perspectives,
    global_context,
    analyzed_at
  };
}
