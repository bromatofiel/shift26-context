import { config } from "../config.js";
import { analysisSchema } from "../schema.js";
import { fetchArticle } from "./extract.js";
import { buildFallbackAnalysis, buildSearchFirstFallback } from "./fallback.js";
import { analyzeWithGemini } from "./llm.js";
import { findCounterPerspectives, findCounterPerspectivesFromUrl, findSearchContext } from "./search.js";

export async function runAnalysis(request) {
  const startedAt = Date.now();
  const timeoutMs = request.timeout_ms || config.defaultTimeoutMs;

  const articleStartedAt = Date.now();
  let article = null;
  let fetchError = "";

  try {
    article = await fetchArticle(request.url, timeoutMs, { mode: request.mode || "balanced" });
  } catch (error) {
    fetchError = error?.message || "article fetch failed";
  }

  const fetchMs = Date.now() - articleStartedAt;

  const searchStartedAt = Date.now();
  let alternatives = [];
  let searchContext = [];

  if (article) {
    alternatives = await findCounterPerspectives({
      article,
      titleHint: request.title_hint,
      locale: request.locale
    });
  } else {
    alternatives = await findCounterPerspectivesFromUrl({
      url: request.url,
      titleHint: request.title_hint,
      locale: request.locale
    });
    searchContext = await findSearchContext({
      url: request.url,
      titleHint: request.title_hint,
      locale: request.locale
    });
  }

  const searchMs = Date.now() - searchStartedAt;

  const llmStartedAt = Date.now();
  let analysis;

  if (article) {
    try {
      analysis = await analyzeWithGemini({
        article,
        alternatives,
        request
      });
    } catch {
      analysis = null;
    }
  }

  if (!analysis) {
    console.log("[Analyze] LLM failed or not configured, using fallback");
    analysis = article
      ? buildFallbackAnalysis({ article, alternatives, request })
      : buildSearchFirstFallback({
          request,
          searchResults: searchContext.length ? searchContext : alternatives,
          fetchError
        });
  }

  if (article) {
    if (!analysis.source_article) analysis.source_article = {};

    analysis.source_article.extracted_content_length = article.contentText?.length || 0;
    analysis.source_article.extraction_method = article.extractionMethod || "unknown";
    analysis.source_article.full_text_length = article.contentText?.length || 0;

    if (article.contentText) {
      analysis.source_article.full_scraped_text =
        article.contentText.substring(0, 1000) +
        (article.contentText.length > 1000 ? "..." : "");
    }
  }

  // Format the exact structured input payload expected by the user.
  analysis.structured_input = article
    ? {
        source: article.siteName || article.hostname || "Unknown source",
        title: article.title || request.title_hint || "Shared article",
        authors: article.byline
          ? article.byline
              .split(/,| et /i)
              .map((name) => name.trim())
              .filter(Boolean)
          : [],
        sections: (article.structured?.sections || []).map((section) => ({
          ...(section.heading ? { heading: section.heading } : {}),
          paragraphs: (section.paragraphs || []).filter(Boolean)
        }))
      }
    : {
        source: request.source || "Unknown source",
        title: request.title_hint || "Shared article",
        authors: [],
        sections: []
      };

  const llmMs = Date.now() - llmStartedAt;
  const validated = analysisSchema.parse(analysis);

  return {
    request_id: crypto.randomUUID(),
    status: "ok",
    ...validated,
    timings_ms: {
      fetch: fetchMs,
      search: searchMs,
      llm: llmMs,
      total: Date.now() - startedAt
    }
  };
}
