export function buildFallbackAnalysis({ article, alternatives, request }) {
  const contentLength = (article?.contentText || "").length;

  return {
    source_article: {
      title: article?.title || request.title_hint || "Shared article",
      media: article?.siteName || article?.hostname || "Les Echos",
      published_at: null,
      bias: {
        score: 3,
        color: "orange",
        main_signals: [
          "article extracted successfully",
          `content length: ${contentLength} characters`,
          "using enhanced extraction"
        ]
      },
      tone: "neutral",
      coverage: [
        article?.excerpt?.substring(0, 200) || "Article retrieved from Les Echos",
        `full text length: ${contentLength} chars`,
        "body successfully extracted"
      ],
      limits: [
        "full LLM analysis not yet enabled",
        "counter perspectives not fetched"
      ],
      full_text_length: contentLength,
      extraction_method: article?.extractionMethod || "structured",
      scraped_text_sample: article?.contentText ? 
        article.contentText.substring(0, 300) + "..." : "no text",
      structured_sections_count: article?.structured?.sections?.length || 0
    },
    counter_perspectives: alternatives.length > 0 ? alternatives.slice(0, 2) : [],
    global_context: `Article extracted with ${contentLength} characters of content. Enhanced scraper was used.`,
    confidence: {
      level: contentLength > 5000 ? "medium" : "low",
      reason: contentLength > 5000 
        ? "Good article content was successfully extracted" 
        : "Limited content available"
    }
  };
}

export function buildSearchFirstFallback({ request, searchResults, fetchError }) {
  return buildFallbackAnalysis({
    article: { 
      title: request.title_hint || "Article from Les Echos",
      contentText: "No direct content available",
      extractionMethod: "search-fallback"
    },
    alternatives: searchResults,
    request
  });
}

function compact(items) {
  return items.filter(Boolean).slice(0, 5);
}
