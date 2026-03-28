import { extractStructuredArticle } from "../src/index.js";

const url = process.argv[2];

if (!url) {
  console.error("Usage: npm run test:url -- <url> [mode]");
  process.exit(1);
}

const mode = process.argv[3] || "balanced";

try {
  const data = await extractStructuredArticle(url, 10000, { mode });
  console.log(JSON.stringify(data, null, 2));
} catch (error) {
  console.error("[scraper-core] extraction failed:", error.message);
  process.exit(1);
}
