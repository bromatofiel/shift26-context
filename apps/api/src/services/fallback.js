export function buildFallbackAnalysis({ article, alternatives, request }) {
  const mainSignals = [];

  if (alternatives.length < 2) {
    mainSignals.push("limited counter coverage found");
  }

  if ((article.contentText || "").length < 1800) {
    mainSignals.push("article body is short or partially extracted");
  }

  if (mainSignals.length === 0) {
    mainSignals.push("source article was parsed, but no live comparison model is configured");
  }

  const color = alternatives.length >= 2 ? "orange" : "green";

  return {
    source_article: {
      title: article.title || request.title_hint || "Shared article",
      media: article.siteName || article.hostname || "Unknown source",
      published_at: null,
      bias: {
        score: color === "orange" ? 4 : 2,
        color,
        main_signals: mainSignals
      },
      tone: "not fully assessed yet",
      coverage: compact([
        article.excerpt || null,
        article.byline ? `byline: ${article.byline}` : null,
        "headline and body extracted"
      ]),
      limits: compact([
        alternatives.length ? null : "no alternative coverage could be fetched",
        "final LLM comparison is not configured yet"
      ])
    },
    counter_perspectives: alternatives.map((item) => ({
      media: item.media,
      url: item.url,
      stance: "related coverage",
      missing_fact: item.snippet || "This article may add context missing from the source.",
      why_relevant: item.title || "Alternative source found on the same topic."
    })),
    global_context: alternatives.length
      ? "Blind Spot extracted the source article and found nearby coverage, but the final structured comparison is still running in fallback mode."
      : "Blind Spot extracted the source article, but no reliable alternative coverage was found for a stronger comparison.",
    confidence: {
      level: "low",
      reason: "Fallback mode was used because the Gemini or Serper integration is not fully configured."
    }
  };
}

export function buildSearchFirstFallback({ request, searchResults, fetchError }) {
  const hostname = safeHostname(request.url);
  const title = request.title_hint || readableUrl(request.url);
  const alternatives = searchResults.slice(0, 3).map((item) => ({
    media: item.media,
    url: item.url,
    stance: "related coverage",
    missing_fact: item.snippet || "This result may add context not visible in the original article.",
    why_relevant: item.title || "Alternative result found from search."
  }));

  return {
    source_article: {
      title,
      media: hostname || "Unknown source",
      published_at: null,
      bias: {
        score: alternatives.length >= 2 ? 4 : 2,
        color: alternatives.length >= 2 ? "orange" : "green",
        main_signals: compact([
          "publisher blocked direct extraction",
          alternatives.length ? "comparison built from search context" : null,
          "article body was not directly available"
        ])
      },
      tone: "not directly assessed",
      coverage: compact([
        request.title_hint ? `shared title: ${request.title_hint}` : null,
        "original URL received",
        "search results scanned for context"
      ]),
      limits: compact([
        fetchError ? `fetch blocked: ${fetchError}` : "direct fetch failed",
        "analysis based on search context instead of full article text"
      ])
    },
    counter_perspectives: alternatives,
    global_context: alternatives.length
      ? "Blind Spot could not fetch the original article, so it switched to search-first mode and built context from nearby coverage."
      : "Blind Spot could not fetch the original article and did not find enough alternative coverage to build a stronger comparison.",
    confidence: {
      level: alternatives.length >= 2 ? "medium" : "low",
      reason: alternatives.length >= 2
        ? "The result is based on multiple search results, but not on the full original article body."
        : "The original article body was blocked and too little external coverage was available."
    }
  };
}

function compact(items) {
  return items.filter(Boolean).slice(0, 5);
}

function safeHostname(value) {
  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function readableUrl(value) {
  try {
    const url = new URL(value);
    return `${url.hostname}${url.pathname}`.replace(/\/$/, "");
  } catch {
    return value;
  }
}
