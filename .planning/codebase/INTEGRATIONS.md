# External Integrations

**Last Updated:** 2026-03-28

## Overview

BlindSpot integrates with AI APIs for content analysis and uses file-based storage. No external databases or authentication providers.

## AI & LLM Services

### Gemini API (Google)
**Package:** `@google/generative-ai@0.21.0`

**Models Used:**
- `gemini-2.5-flash` - Primary analysis (backend)
- `gemini-1.5-flash` - Grounded search (backend)
- Note: Gemini 1.5 models deprecated in 2026

**Authentication:**
- Environment variable: `GEMINI_API_KEY` (required)
- API key passed via `GoogleGenerativeAI` client

**Used In:**
- `backend/src/services/gemini.ts` - Article analysis
- `backend/src/services/grounded-search.ts` - Alternative article discovery
- `backend/src/services/differences.ts` - Perspective extraction

**API Features Used:**
- Structured JSON output with `response_mime_type: "application/json"`
- Function calling for grounded search
- GoogleSearchRetrieval tool for web search
- Few-shot prompting for consistency

**Rate Limits:**
- Free tier: 60 requests per minute (QPM)
- May affect concurrent analysis

**Error Handling:**
- Timeout on slow responses (8s for analysis, 4s for differences)
- Graceful degradation on API failures
- JSON parsing with markdown wrapper fallback

### OpenAI API
**Package:** `@ai-sdk/openai@3.0.48`

**Models Used:**
- GPT-5.4 models for Mastra workflow agents

**Authentication:**
- Environment variable: `OPENAI_API_KEY` (required for Mastra)

**Used In:**
- `mastra/src/agents/` - 11 workflow agents
- `mastra/src/workflows/` - Agent orchestration

**Integration Pattern:**
- Mastra handles OpenAI client configuration
- Used exclusively in Mastra service, not backend

## Storage

### LibSQL (Mastra)
**Package:** `@mastra/libsql@1.7.2`

**Type:** File-based SQLite database

**Locations:**
- Development: `./mastra.db`
- Production: `/data/mastra.db`

**Purpose:**
- Workflow execution history
- Agent memory persistence
- Trace data storage

**Configuration:**
- No external credentials needed (file-based)
- Docker volume mount for production persistence

## Observability & Logging

### Mastra Cloud (Optional)
**Package:** `@mastra/observability@1.5.1`

**Authentication:**
- Environment variable: `MASTRA_CLOUD_ACCESS_TOKEN` (optional)

**Purpose:**
- Export trace data to Mastra Cloud
- Workflow execution monitoring
- Agent performance analytics

**Status:** Optional integration, not required for operation

### Pino Logging
**Package:** Included in `@mastra/loggers@1.0.3`

**Type:** Structured JSON logging

**Used In:**
- Mastra service for workflow logging
- Backend uses `console.log` (not Pino)

## Networking

### HTTP Client
**Implementation:** Native `fetch` API

**Used For:**
- Article fetching from URLs (`backend/src/services/fetcher.ts`)
- Gemini API requests
- No external HTTP client dependencies (no axios/node-fetch)

**Features:**
- AbortSignal for timeouts
- Built-in support for HTTP/2
- No dependency overhead

### HTTP Server
**Backend:** Hono 4.6.14 with `@hono/node-server`

**Frontend:** Next.js standalone server (production)

**Mastra:** Embedded Mastra server (port 4111)

## Authentication & Authorization

### API Authentication
**Type:** API key based

**Required Keys:**
- `GEMINI_API_KEY` - Google Gemini API access
- `OPENAI_API_KEY` - OpenAI API access (Mastra)

**Optional Keys:**
- `MASTRA_CLOUD_ACCESS_TOKEN` - Mastra Cloud export

### User Authentication
**Status:** None

No user authentication or authorization implemented. Service is stateless and public.

## External APIs

### Gemini Grounded Search
**Endpoint:** Gemini API with `GoogleSearchRetrieval` tool

**Purpose:** Find alternative articles on same topic

**Integration:**
- Invoked via `tools: [{ googleSearchRetrieval: {} }]`
- Returns search results with URLs and snippets
- Used in `backend/src/services/grounded-search.ts`

**Reliability:**
- May return non-existent or 404 URLs
- Results validated before returning to client

## Webhooks & Events

**Status:** No webhooks configured

No inbound or outbound webhooks. Service operates on synchronous request/response pattern.

## Environment Variables

### Required
```bash
# Backend
GEMINI_API_KEY=<google-gemini-api-key>

# Mastra
OPENAI_API_KEY=<openai-api-key>
```

### Optional
```bash
# Mastra observability
MASTRA_CLOUD_ACCESS_TOKEN=<mastra-cloud-token>

# Environment
NODE_ENV=development|production

# Mastra hostname (Docker)
HOSTNAME=<hostname-for-mastra-server>
```

### Missing Validation
No startup validation for required environment variables. Services fail at runtime if keys missing.

## Security Considerations

### API Key Exposure
- Keys passed as environment variables
- Risk of exposure in Docker logs
- No key rotation mechanism

### Rate Limiting
- No application-level rate limiting
- Relies on external API rate limits
- Gemini free tier: 60 QPM

### Data Privacy
- No data persistence (stateless)
- Articles processed in-memory only
- No user tracking or analytics

## Integration Patterns

### Result Type Pattern
All service integrations use discriminated unions:
```typescript
{ ok: true; data: T } | { ok: false; error: string; message: string }
```

### Timeout Handling
- Analysis: 8s timeout
- Differences: 4s timeout
- Search: Included in pipeline budget
- Uses `Promise.race()` with AbortController

### Error Recovery
- Graceful degradation on API failures
- Partial results returned when possible
- Clear error messages to frontend
