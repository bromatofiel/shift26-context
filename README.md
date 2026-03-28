# Blind Spot

Minimal React + Node skeleton for the mobile share flow.

## Apps

- `apps/web`: React PWA with a `share_target` route at `/share-target`
- `apps/api`: Node/Express API with article extraction, Serper search, Gemini structured output, and fallback mode

## Run

```bash
npm install
npm run dev:api
npm run dev:web
```

Create `apps/api/.env` from `apps/api/.env.example` before running the real integrations.

## MVP flow

1. Install the PWA on Android Chrome.
2. Share a news article into `Blind Spot`.
3. The PWA opens `/share-target`.
4. React calls the Node API.
5. The API extracts the article, looks for counter coverage, and returns a structured analysis.

## Next steps

- Add better ranking for alternative coverage
- Improve the extraction fallback for paywalled articles
- Add production deployment and secret management
