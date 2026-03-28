import { extractStructuredArticle } from "./extractStructured.js";

const USER_AGENTS = [
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3 Mobile/15E148 Safari/604.1",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36"
];

export async function fetchArticle(url, timeoutMs = 8000, options = {}) {
  try {
    const structured = await extractStructuredArticle(url, timeoutMs, options);
    
    console.log(`[fetchArticle] SUCCESS - ${structured.source} | Title: "${structured.title}" | Content: ${structured.contentLength} chars`);
    
    return {
      finalUrl: structured.url,
      hostname: structured.source.toLowerCase(),
      title: structured.title,
      byline: structured.authors?.join(", ") || null,
      excerpt: structured.sections?.[0]?.paragraphs?.[0] || "",
      contentText: structured.fullText || structured.sections?.flatMap(s => s.paragraphs || []).join("\n\n") || "",
      contentHtml: "",
      siteName: structured.source,
      lang: "fr",
      extractionMethod: "structured",
      rawContentLength: structured.contentLength,
      structured: structured // keep full structured data
    };
  } catch (error) {
    console.error("[fetchArticle] Structured extraction failed:", error.message);
    throw error;
  }
}

// Old functions kept for compatibility
function safeHostname(value) {
  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}
