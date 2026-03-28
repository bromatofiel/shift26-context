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
    article = await fetchArticle(request.url, timeoutMs);
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
    analysis = article
      ? buildFallbackAnalysis({ article, alternatives, request })
      : buildSearchFirstFallback({
          request,
          searchResults: searchContext.length ? searchContext : alternatives,
          fetchError
        });
  }

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
