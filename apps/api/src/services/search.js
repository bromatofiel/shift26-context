import { config, isSerperConfigured } from "../config.js";

export async function findCounterPerspectives({ article, titleHint, locale }) {
  console.log(`[Serper] findCounterPerspectives called for: ${article.title?.substring(0, 60)}...`);

  // Temporarily disabled due to 403 errors
  console.log("[Serper] Serper temporarily disabled (403 errors)");
  return [];

  const queries = buildQueries({
    articleTitle: article.title,
    hostname: article.hostname,
    titleHint,
    locale
  });

  console.log(`[Serper] Running ${queries.length} queries`);

  const settled = await Promise.allSettled(
    queries.map((query) => runSerperSearch(query, locale))
  );

  const rawResults = settled
    .filter((item) => item.status === "fulfilled")
    .flatMap((item) => item.value);

  console.log(`[Serper] Got ${rawResults.length} results before deduping`);

  const results = dedupeAndRank(rawResults, article.finalUrl).slice(0, 3);
  console.log(`[Serper] Final results: ${results.length}`);

  return results;
}

export async function findCounterPerspectivesFromUrl({ url, titleHint, locale }) {
  if (!isSerperConfigured()) {
    return [];
  }

  const hostname = safeHostname(url);
  const seed = (titleHint || url).trim();
  const localHint = locale?.startsWith("fr") ? "actualité analyse contexte" : "news analysis context";
  const queries = [
    `"${seed}"`,
    `${seed} ${localHint}`,
    `${seed} -site:${hostname}`
  ].filter(Boolean);

  const settled = await Promise.allSettled(
    queries.map((query) => runSerperSearch(query, locale))
  );

  const rawResults = settled
    .filter((item) => item.status === "fulfilled")
    .flatMap((item) => item.value);

  return dedupeAndRank(rawResults, url).slice(0, 3);
}

export async function findSearchContext({ url, titleHint, locale }) {
  if (!isSerperConfigured()) {
    return [];
  }

  const hostname = safeHostname(url);
  const seed = (titleHint || url).trim();
  const queries = [`"${seed}"`, `${seed} -site:${hostname}`].filter(Boolean);

  const settled = await Promise.allSettled(
    queries.map((query) => runSerperSearch(query, locale))
  );

  const rawResults = settled
    .filter((item) => item.status === "fulfilled")
    .flatMap((item) => item.value);

  return dedupeAndRank(rawResults, url).slice(0, 5);
}

function buildQueries({ articleTitle, hostname, titleHint, locale }) {
  // Prioritize real article title over test hint
  let queryBase = (articleTitle || titleHint || "").trim();
  
  // Clean live/direct titles
  queryBase = queryBase.replace(/^DIRECT\s*[-:]\s*/i, '').trim();
  queryBase = queryBase.replace(/\s*[-|–|—].*$/, "").trim();
  
  const titleOnly = queryBase.split(' ').slice(0, 6).join(' ');
  const localHint = locale?.startsWith("fr") ? "actualité analyse contexte" : "news analysis context";

  const queries = [
    `"${titleOnly}"`,
    `${titleOnly} ${localHint}`,
    `${titleOnly} guerre iran`,
    `${titleOnly} -site:${hostname}`,
  ].filter(Boolean);

  console.log(`[Serper] Cleaned query: "${titleOnly}" (from ${articleTitle ? 'articleTitle' : 'titleHint'})`);

  return queries;
}

async function runSerperSearch(query, locale) {
  const response = await fetch("https://google.serper.dev/search", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": config.serperApiKey
    },
    body: JSON.stringify({
      q: query,
      gl: config.serperGl,
      hl: normalizeLocale(locale) || config.serperHl,
      num: 5
    })
  });

  if (!response.ok) {
    console.error(`[Serper] API error ${response.status} for query: "${query}"`);
    throw new Error(`Serper failed with status ${response.status}`);
  }

  const data = await response.json();
  const results = (data.organic || []).map((item) => ({
    title: item.title,
    link: item.link,
    snippet: item.snippet,
    source: item.source || safeHostname(item.link)
  }));

  console.log(`[Serper] Query "${query}" returned ${results.length} results`);
  return results;
}

function dedupeAndRank(results, sourceUrl) {
  const sourceHost = safeHostname(sourceUrl);
  const seen = new Set();
  const output = [];

  for (const result of results) {
    if (!result.link) continue;
    const host = safeHostname(result.link);
    if (!host || host === sourceHost) continue;
    if (seen.has(host)) continue;
    seen.add(host);
    output.push({
      media: result.source || host,
      url: result.link,
      title: result.title || "",
      snippet: result.snippet || ""
    });
  }

  return output;
}

function safeHostname(value) {
  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function normalizeLocale(value) {
  if (!value) return "";
  return value.slice(0, 2).toLowerCase();
}
