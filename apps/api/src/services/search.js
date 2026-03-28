import { config, isSerperConfigured } from "../config.js";

export async function findCounterPerspectives({ article, titleHint, locale }) {
  if (!isSerperConfigured()) {
    return [];
  }

  const queries = buildQueries({
    articleTitle: article.title,
    hostname: article.hostname,
    titleHint,
    locale
  });

  const settled = await Promise.allSettled(
    queries.map((query) => runSerperSearch(query, locale))
  );

  const rawResults = settled
    .filter((item) => item.status === "fulfilled")
    .flatMap((item) => item.value);

  return dedupeAndRank(rawResults, article.finalUrl).slice(0, 3);
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
  const queryBase = (titleHint || articleTitle || "").trim();
  const localHint = locale?.startsWith("fr") ? "actualité analyse contexte" : "news analysis context";
  const titleOnly = queryBase.replace(/\s*[-|–|—].*$/, "").trim();

  return [
    `"${titleOnly}"`,
    `${titleOnly} ${localHint}`,
    `${titleOnly} site:lemonde.fr OR site:lefigaro.fr OR site:liberation.fr OR site:francetvinfo.fr`,
    `${titleOnly} -site:${hostname}`
  ].filter(Boolean);
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
    throw new Error(`Serper failed with status ${response.status}`);
  }

  const data = await response.json();
  return (data.organic || []).map((item) => ({
    title: item.title,
    link: item.link,
    snippet: item.snippet,
    source: item.source || safeHostname(item.link)
  }));
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
