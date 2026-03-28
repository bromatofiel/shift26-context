import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";

/**
 * Extract article and structure it into sections with paragraphs
 */
export async function extractStructuredArticle(url, timeoutMs = 8000, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    const dom = new JSDOM(html, { url: response.url });
    const document = dom.window.document;

    const readability = new Readability(document);
    const article = readability.parse();

    const contentText = cleanText(article?.textContent || "");
    const structured = structureContent(
      article?.content || "",
      contentText,
      article?.title || document.title || "",
      options.mode || "balanced"
    );

    return {
      source: safeHostname(response.url),
      title: article?.title || document.title || "Article sans titre",
      authors: extractAuthors(document),
      sections: structured.sections,
      fullText: contentText,
      contentLength: contentText.length
    };

  } catch (error) {
    console.error("[extractStructuredArticle] Error:", error.message);
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function structureContent(readabilityHtml, fullText, title, mode) {
  const sections = [];
  let currentSection = { paragraphs: [] };
  const titleKeywords = extractKeywords(title);

  const badPatterns =
    /à la une|idées|économie|politique|entreprises|finance|marchés|bourse|monde|tech|médias|start-up|régions|patrimoine|travailler mieux|le mag|newsletter|cookie|abonnement|conditions|podcast|ajouter à mes articles|commenter|partager|tous droits réservés/i;

  // Parse only readability output to avoid nav/sidebar noise.
  const contentDom = new JSDOM(`<article>${readabilityHtml || ""}</article>`);
  const contentDoc = contentDom.window.document;
  const elements = contentDoc.querySelectorAll("h2, h3, h4, p, li, blockquote");

  for (const el of elements) {
    const text = cleanText(el.textContent);
    if (!isUsefulText(text, badPatterns)) continue;

    if (el.tagName.match(/^H[2-4]$/)) {
      if (currentSection.paragraphs.length > 0) {
        sections.push({ ...currentSection });
      }
      currentSection = { heading: text, paragraphs: [] };
      continue;
    }

    currentSection.paragraphs.push(text);
  }

  if (currentSection.paragraphs.length > 0) {
    sections.push(currentSection);
  }

  // Fallback if readability sections are empty.
  if (sections.length === 0 && fullText) {
    const paragraphs = fullText
      .split(/\n{2,}|(?<=[.!?])\s+(?=[A-ZÀ-ÖØ-Ý])/)
      .map((p) => cleanText(p))
      .filter((p) => isUsefulText(p, badPatterns));

    sections.push({
      paragraphs: paragraphs.slice(0, 20)
    });
  }

  const normalized = normalizeSections(sections);
  const filtered = filterSectionsByRelevance(normalized, titleKeywords);
  return { sections: applyMode(filtered, mode) };
}

function isUsefulText(text, badPatterns) {
  if (!text || text.length < 45) return false;
  if (badPatterns.test(text)) return false;
  if (/^>|^»|^direct/i.test(text)) return false;
  if (/^publié le|^mis à jour le/i.test(text)) return false;
  if (/^par\s+[A-ZÀ-ÖØ-Ý][a-zà-öø-ÿ]+/i.test(text) && text.split(" ").length < 8) return false;
  if (/^ce qui s'est passé/i.test(text)) return false;
  if (/^\d{1,2}h\d{2}\s*-/i.test(text)) return false;
  // Skip likely nav/link clusters without punctuation.
  if (!/[.!?:;]/.test(text) && text.split(" ").length < 14) return false;
  return true;
}

function normalizeSections(sections) {
  const normalized = sections
    .map((section) => ({
      ...(section.heading ? { heading: section.heading } : {}),
      paragraphs: (section.paragraphs || [])
        .map((p) => cleanText(p))
        .filter(Boolean)
    }))
    .filter((section) => section.paragraphs.length > 0);

  // Deduplicate repeated paragraphs and trim noisy section headings.
  return normalized.map((section) => {
    const seen = new Set();
    const paragraphs = section.paragraphs.filter((p) => {
      const key = p.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    const heading = section.heading
      ? section.heading.replace(/^direct\s*[-: ]*/i, "").trim()
      : undefined;

    return {
      ...(heading ? { heading } : {}),
      paragraphs
    };
  });
}

function filterSectionsByRelevance(sections, titleKeywords) {
  const strictTopicMode = titleKeywords.length >= 3;
  const filtered = sections
    .map((section) => {
      const paragraphs = section.paragraphs.filter((p) => {
        // Remove obvious photo captions and stock/photo credits
        if (/\b(REUTERS|AFP|AP)\b/i.test(p)) return false;
        if (/^[A-ZÀ-ÖØ-Ý][^.!?]{0,80}\.(REUTERS|AFP|AP)$/i.test(p)) return false;

        // In strict topic mode, keep only topic-related paragraphs.
        if (strictTopicMode) {
          return isParagraphRelevant(p, titleKeywords);
        }

        // Otherwise, be more permissive.
        return isParagraphRelevant(p, titleKeywords) || p.split(" ").length >= 35;
      });

      return {
        ...(section.heading ? { heading: section.heading } : {}),
        paragraphs
      };
    })
    .filter((section) => section.paragraphs.length > 0);

  // If filtering was too aggressive, keep original sections.
  return filtered.length ? filtered : sections;
}

function isParagraphRelevant(text, titleKeywords) {
  const conflictLexicon = [
    "iran",
    "israël",
    "israel",
    "houthi",
    "yémen",
    "yemen",
    "oman",
    "détroit",
    "ormuz",
    "missile",
    "frappe",
    "guerre",
    "hezbollah",
    "trump",
    "liban"
  ];

  const lower = text.toLowerCase();
  if (conflictLexicon.some((k) => lower.includes(k))) return true;
  return titleKeywords.some((k) => lower.includes(k));
}

function extractKeywords(title) {
  const stopwords = new Set([
    "direct",
    "guerre",
    "avec",
    "pour",
    "dans",
    "les",
    "des",
    "une",
    "un",
    "sur",
    "aux",
    "du",
    "de",
    "la",
    "le",
    "et",
    "en"
  ]);

  return cleanText(title)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 4 && !stopwords.has(w));
}

function applyMode(sections, mode) {
  if (mode !== "main_article_only") {
    return sections;
  }

  if (!sections.length) return sections;

  // Keep a compact "main article" view: intro + strongest paragraphs.
  const first = sections[0];
  const trimmedParagraphs = (first.paragraphs || []).slice(0, 12);

  return [
    {
      ...(first.heading ? { heading: first.heading } : {}),
      paragraphs: trimmedParagraphs
    }
  ];
}

function extractAuthors(document) {
  const authorSelectors = [
    'meta[name="author"]', 
    '.author', 
    '.byline', 
    'a[rel="author"]',
    '.article__author'
  ];
  
  for (const sel of authorSelectors) {
    const el = document.querySelector(sel);
    if (el) {
      const text = el.textContent || el.getAttribute('content');
      if (text) {
        return text.split(',').map(a => a.trim()).filter(Boolean);
      }
    }
  }
  return [];
}

function cleanText(text) {
  return String(text || "")
    .replace(/\s+/g, " ")
    .trim();
}

function safeHostname(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "Unknown";
  }
}
