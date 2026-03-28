import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";

const USER_AGENTS = [
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3 Mobile/15E148 Safari/604.1",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36"
];

export async function fetchArticle(url, timeoutMs = 6000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  for (let i = 0; i < USER_AGENTS.length; i++) {
    const userAgent = USER_AGENTS[i];
    
    try {
      const response = await fetch(url, {
        redirect: "follow",
        signal: controller.signal,
        headers: {
          "User-Agent": userAgent,
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8,en-US;q=0.7",
          "Accept-Encoding": "gzip, deflate, br",
          "Referer": "https://www.google.com/",
          "Cache-Control": "no-cache",
          "Pragma": "no-cache",
          "Sec-Fetch-Mode": "navigate",
          "Sec-Fetch-Site": "none",
          "Sec-Fetch-User": "?1",
          "Upgrade-Insecure-Requests": "1"
        }
      });

      if (response.ok) {
        const html = await response.text();
        const dom = new JSDOM(html, { url: response.url });
        const article = new Readability(dom.window.document).parse();

        clearTimeout(timeout);

        const contentText = cleanText(article?.textContent || "");

        return {
          finalUrl: response.url,
          hostname: safeHostname(response.url),
          title: article?.title || extractTitle(dom.window.document.title, response.url),
          byline: article?.byline || null,
          excerpt: article?.excerpt || extractExcerpt(contentText),
          contentText: contentText,
          contentHtml: article?.content || "",
          siteName: article?.siteName || safeHostname(response.url),
          lang: dom.window.document.documentElement.lang || null,
          extractionMethod: "readability-js"
        };
      }

      if (response.status === 403 || response.status === 429 || response.status >= 500) {
        console.warn(`[fetchArticle] ${response.status} on attempt ${i+1}/${USER_AGENTS.length} with UA: ${userAgent.substring(0, 60)}...`);
        continue; // try next user agent
      }

      throw new Error(`HTTP ${response.status}`);
    } catch (err) {
      if (err.name === "AbortError") {
        throw new Error("Request timeout");
      }
      if (i === USER_AGENTS.length - 1) {
        throw err;
      }
      continue;
    }
  }

  clearTimeout(timeout);
  throw new Error("All fetch attempts failed (403/429 blocked)");
}

function extractTitle(title, url) {
  return cleanText(title || safeHostname(url) || "Shared article");
}

function extractExcerpt(text) {
  if (!text) return "";
  const sentences = text.split(/[.!?]+/).slice(0, 2).join('. ');
  return cleanText(sentences).slice(0, 280);
}

function cleanText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function safeHostname(value) {
  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}
