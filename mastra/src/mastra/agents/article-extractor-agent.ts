import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core/agent";

export const articleExtractorAgent = new Agent({
    id: "article-extractor-agent",
    name: "Article Extractor Agent",
    instructions: `
You are an expert news article extractor.
Given a URL, use your webSearch tool to retrieve the full content of the article at that URL.

Extract and return the following fields as structured JSON:
- url: the original URL exactly as provided
- source: the publication or domain name only (e.g. "20minutes.fr", "Le Monde", "Les Echos") — not the full URL
- title: the full article headline
- authors: an array of author name strings (empty array if none found)
- sections: the full article body structured as sections, where each section has:
  - heading: the section title as a string — use an empty string "" if there is no section title (never use null)
  - paragraphs: an array of full verbatim paragraph strings — do not truncate or summarize, preserve the complete text of each paragraph

Preserve the complete article structure and all paragraphs in full. Do not omit or shorten any content.
Always respond using the exact JSON structure requested.
  `.trim(),
    model: "openai/gpt-5.4",
    tools: {
        webSearch: openai.tools.webSearch()
    }
});
