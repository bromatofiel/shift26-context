/**
 * Article content extractor service
 * Per EXT-01, EXT-02, EXT-03: Extract content with paywall detection
 */

import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';

export type ExtractionResult = {
  ok: true;
  article: {
    title: string;
    content: string;
    textContent: string;
    excerpt: string;
    byline: string | null;
    publishedTime: string | null;
    siteName: string | null;
  };
  partial: boolean;  // true if paywall/degraded mode (per EXT-03)
} | {
  ok: false;
  error: 'EXTRACTION_FAILED' | 'NO_CONTENT' | 'PAYWALL';
  message: string;
  partial_content?: { title: string; excerpt: string };  // Degraded mode fallback
}

/**
 * Extract article content from HTML
 *
 * @param html - Raw HTML content
 * @param url - Article URL (for context)
 * @returns ExtractionResult with article data or error
 */
export function extractArticle(html: string, url: string): ExtractionResult {
  try {
    // Parse HTML with JSDOM
    const dom = new JSDOM(html, { url });
    const document = dom.window.document;

    // Check for paywall indicators (per 02-CONTEXT.md "Combined" approach)
    const paywallDetected = detectPaywall(document);

    // Extract with Readability
    const reader = new Readability(document);
    const article = reader.parse();

    // If Readability extraction failed
    if (!article || !article.content) {
      // Try degraded mode extraction
      const degradedContent = extractDegradedContent(document);

      if (degradedContent) {
        return {
          ok: false,
          error: 'NO_CONTENT',
          message: 'Readability extraction failed, degraded content available',
          partial_content: degradedContent
        };
      }

      return {
        ok: false,
        error: 'NO_CONTENT',
        message: 'Could not extract article content'
      };
    }

    // Extract metadata
    const publishedTime = extractPublishedTime(document);
    const siteName = extractSiteName(document);

    // Check for truncated content (less than 500 chars is suspicious)
    const textContent = article.textContent || '';
    const isTruncated = textContent.trim().length < 500;

    // Determine if content is partial
    const isPartial = paywallDetected || isTruncated || textContent.length < 1000;

    return {
      ok: true,
      article: {
        title: article.title || extractTitle(document),
        content: article.content,
        textContent: article.textContent || '',
        excerpt: article.excerpt || '',
        byline: article.byline || null,
        publishedTime,
        siteName
      },
      partial: isPartial
    };

  } catch (error) {
    return {
      ok: false,
      error: 'EXTRACTION_FAILED',
      message: error instanceof Error ? error.message : 'Unknown extraction error'
    };
  }
}

/**
 * Detect paywall indicators in the document
 */
function detectPaywall(document: Document): boolean {
  const html = document.documentElement.innerHTML.toLowerCase();

  // Common paywall indicator patterns
  const paywallPatterns = [
    'paywall',
    'subscription',
    'premium-content',
    'premium_content',
    'subscriber-only',
    'members-only',
    'register-wall',
    'registration-wall'
  ];

  // Check for paywall indicators in class names and IDs
  for (const pattern of paywallPatterns) {
    if (html.includes(pattern)) {
      return true;
    }
  }

  // Check for paywall-specific elements
  const paywallSelectors = [
    '[class*="paywall"]',
    '[id*="paywall"]',
    '[class*="subscription"]',
    '[id*="subscription"]',
    '[class*="premium"]',
    '[id*="premium"]'
  ];

  for (const selector of paywallSelectors) {
    if (document.querySelector(selector)) {
      return true;
    }
  }

  return false;
}

/**
 * Extract degraded content when Readability fails
 * Returns title + meta description + first paragraphs
 */
function extractDegradedContent(document: Document): { title: string; excerpt: string } | null {
  const title = extractTitle(document);

  // Try meta description
  const metaDesc = document.querySelector('meta[name="description"]')?.getAttribute('content');

  // Try first few paragraphs
  const paragraphs = Array.from(document.querySelectorAll('p'))
    .slice(0, 3)
    .map(p => p.textContent?.trim())
    .filter(Boolean)
    .join(' ');

  const excerpt = metaDesc || paragraphs || '';

  if (title && excerpt) {
    return { title, excerpt };
  }

  return null;
}

/**
 * Extract title from document
 * Priority: og:title > document.title
 */
function extractTitle(document: Document): string {
  // Try Open Graph title
  const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content');
  if (ogTitle) return ogTitle;

  // Try Twitter title
  const twitterTitle = document.querySelector('meta[name="twitter:title"]')?.getAttribute('content');
  if (twitterTitle) return twitterTitle;

  // Fallback to document title
  return document.title || 'Untitled';
}

/**
 * Extract published time from document metadata
 */
function extractPublishedTime(document: Document): string | null {
  // Try article:published_time meta tag
  const articleTime = document.querySelector('meta[property="article:published_time"]')?.getAttribute('content');
  if (articleTime) return articleTime;

  // Try time element with datetime attribute
  const timeElement = document.querySelector('time[datetime]');
  if (timeElement) {
    return timeElement.getAttribute('datetime');
  }

  // Try JSON-LD structured data
  const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');
  for (const script of Array.from(jsonLdScripts)) {
    try {
      const data = JSON.parse(script.textContent || '');
      if (data.datePublished) {
        return data.datePublished;
      }
    } catch {
      // Ignore JSON parse errors
    }
  }

  return null;
}

/**
 * Extract site name from document metadata
 */
function extractSiteName(document: Document): string | null {
  // Try og:site_name meta tag
  const ogSiteName = document.querySelector('meta[property="og:site_name"]')?.getAttribute('content');
  if (ogSiteName) return ogSiteName;

  // Try publisher meta tag
  const publisher = document.querySelector('meta[name="publisher"]')?.getAttribute('content');
  if (publisher) return publisher;

  return null;
}
