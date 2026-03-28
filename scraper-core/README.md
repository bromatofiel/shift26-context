# scraper-core

Module autonome pour extraire une URL d'article et renvoyer un JSON structuré.

## Installation

```bash
cd scraper-core
npm install
```

## Usage

```js
import { extractStructuredArticle } from "./src/index.js";

const data = await extractStructuredArticle("https://example.com/article", 8000, {
  mode: "main_article_only", // or "balanced"
  maxParagraphs: 10 // optional, used in main_article_only mode
});
```

## Format retourné

```json
{
  "source": "lesechos.fr",
  "title": "...",
  "authors": ["..."],
  "sections": [
    {
      "heading": "Optionnel",
      "paragraphs": ["...", "..."]
    }
  ],
  "fullText": "...",
  "contentLength": 12345
}
```

## Test rapide en CLI

```bash
npm run test:url -- "https://www.lesechos.fr/..." main_article_only
```
