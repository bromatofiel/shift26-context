/**
 * URL fetcher service
 * Per ING-01, ING-02, ING-03: Fetch HTML with redirect handling and timeout
 */

export type FetchResult = {
  ok: true;
  html: string;
  finalUrl: string;  // After redirects
  contentType: string;
} | {
  ok: false;
  error: 'FETCH_FAILED' | 'TIMEOUT' | 'INVALID_URL' | 'NOT_HTML';
  message: string;
}

/**
 * Fetch article HTML from URL
 *
 * @param url - Article URL to fetch
 * @param timeoutMs - Request timeout in milliseconds (default: 5000)
 * @returns FetchResult with HTML content or error
 */
export async function fetchArticle(url: string, timeoutMs: number = 5000): Promise<FetchResult> {
  // Validate URL format
  try {
    new URL(url);
  } catch (error) {
    return {
      ok: false,
      error: 'INVALID_URL',
      message: `Invalid URL format: ${url}`
    };
  }

  try {
    // Fetch with redirect follow and timeout
    const response = await fetch(url, {
      redirect: 'follow',
      signal: AbortSignal.timeout(timeoutMs),
      headers: {
        'User-Agent': 'BlindSpot/1.0 (+https://blindspot.app)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });

    // Check response status
    if (!response.ok) {
      return {
        ok: false,
        error: 'FETCH_FAILED',
        message: `HTTP ${response.status}: ${response.statusText}`
      };
    }

    // Check content type
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml')) {
      return {
        ok: false,
        error: 'NOT_HTML',
        message: `Expected HTML content, got: ${contentType}`
      };
    }

    // Extract HTML content
    const html = await response.text();

    return {
      ok: true,
      html,
      finalUrl: response.url,  // Actual URL after redirects
      contentType
    };

  } catch (error) {
    // Handle timeout errors
    if (error instanceof Error && (error.name === 'AbortError' || error.name === 'TimeoutError')) {
      return {
        ok: false,
        error: 'TIMEOUT',
        message: `Request timed out after ${timeoutMs}ms`
      };
    }

    // Handle network errors
    if (error instanceof TypeError) {
      return {
        ok: false,
        error: 'FETCH_FAILED',
        message: `Network error: ${error.message}`
      };
    }

    // Handle other errors
    return {
      ok: false,
      error: 'FETCH_FAILED',
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
