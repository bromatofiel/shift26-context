/**
 * Analysis types for BlindSpot API contract
 * Defines the complete schema for bias analysis requests and responses
 */

/**
 * Bias score with color-coded severity
 * Per ANA-01: 0-10 scale with visual color mapping
 */
export interface BiasScore {
  /** Bias score from 0 (neutral) to 10 (highly biased) */
  score: number;
  /** Visual color indicator */
  color: "green" | "orange" | "red";
  /** LLM confidence in the score (0-1) */
  confidence: number;
}

/**
 * Individual bias signal detected in the article
 * Per ANA-02: Different types of framing indicators
 */
export interface Signal {
  /** Type of bias signal */
  type: "tone" | "framing" | "omission" | "source_selection";
  /** Human-readable description of the signal */
  description: string;
  /** Severity level of this signal */
  severity: "low" | "medium" | "high";
}

/**
 * Alternative perspective on the same topic
 * Per ANA-03: Counter-narratives with key differences highlighted
 */
export interface CounterPerspective {
  /** Title of the alternative article */
  title: string;
  /** Source media name */
  source: string;
  /** URL to the alternative article */
  url: string;
  /** Key differences compared to source article */
  key_differences: string[];
  /** Publication date if available */
  published_date?: string;
}

/**
 * Source article metadata and content
 */
export interface SourceArticle {
  /** Original URL submitted by user */
  url: string;
  /** Article title */
  title: string;
  /** Extracted article content */
  content: string;
  /** Extraction date if available */
  extracted_date?: string;
  /** Featured image URL if available */
  media_url?: string;
}

/**
 * Global context and missing angles
 * Per ANA-04: Broader context beyond individual perspectives
 */
export interface GlobalContext {
  /** Summary of the overall context */
  summary: string;
  /** Angles or facts missing from the source article */
  missing_angles: string[];
}

/**
 * Analysis request payload
 * Per D-08: URL with optional configuration
 */
export interface AnalysisRequest {
  /** URL of the article to analyze */
  url: string;
  /** Locale for language-specific analysis */
  locale?: string;
  /** Maximum processing time in milliseconds */
  timeout_ms?: number;
}

/**
 * Complete analysis response
 * Combines all analysis components into a single response
 */
export interface AnalysisResponse {
  /** Source article metadata and content */
  source_article: SourceArticle;
  /** Bias score with color coding */
  bias_score: BiasScore;
  /** Main bias signals detected */
  main_signals: Signal[];
  /** Alternative perspectives found */
  counter_perspectives: CounterPerspective[];
  /** Global context and missing angles */
  global_context: GlobalContext;
  /** ISO timestamp of when analysis was performed */
  analyzed_at: string;
}

/**
 * Health check response
 * Per D-07: Basic service status
 */
export interface HealthResponse {
  /** Service status */
  status: "ok";
  /** API version */
  version: string;
  /** Service uptime in milliseconds */
  uptime_ms: number;
}
