# Architecture

**Last Updated:** 2026-03-28

## Overview

BlindSpot uses a distributed 3-tier service architecture with clear separation between presentation (Frontend PWA), orchestration (Mastra workflows), and business logic (Backend API). All services communicate via HTTP and share TypeScript type contracts.

## Architectural Pattern

**Pattern:** Distributed 3-Tier Service Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend PWA                          │
│                     (Next.js 16.2.1)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  UI Routes   │  │  Components  │  │    Hooks     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTP (port 3000)
┌─────────────────────┴───────────────────────────────────────┐
│                    Mastra Workflows                          │
│                    (Mastra 1.3.15)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Workflows   │  │    Agents    │  │    Tools     │     │
│  │  (11 total)  │  │  (11 total)  │  │              │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTP (port 4111)
┌─────────────────────┴───────────────────────────────────────┐
│                      Backend API                             │
│                      (Hono 4.6.14)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Routes     │  │   Services   │  │   Schemas    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────┬───────────────────────────────────────┘
                      │
              ┌───────┴────────┐
              │                │
         Gemini API       Article URLs
```

## Layers

### 1. Client Layer (Frontend PWA)
**Location:** `front/`

**Responsibilities:**
- User interface rendering
- Share Target API integration (Android)
- State management (React hooks)
- HTTP client for backend/Mastra

**Key Components:**
- `app/` - Next.js App Router routes
- `components/custom/` - React components
- `hooks/` - Custom React hooks
- `lib/` - Utilities and helpers

**Communication:**
- Calls Mastra workflows via HTTP (port 4111)
- Calls backend API for analysis (port 8787)
- No direct database access

### 2. Orchestration Layer (Mastra Workflows)
**Location:** `mastra/`

**Responsibilities:**
- Workflow orchestration
- Agent coordination
- Parallel execution of analysis tasks
- Result aggregation

**Key Components:**
- `src/workflows/` - 11 workflow definitions
- `src/agents/` - 11 LLM-powered agents
- `src/tools/` - Agent tools
- `src/scorers/` - Evaluation scorers

**Communication:**
- Exposes HTTP API on port 4111
- Calls OpenAI API for agent LLM
- Stores execution history in LibSQL

### 3. Service Layer (Backend API)
**Location:** `backend/`

**Responsibilities:**
- Article fetching and extraction
- Gemini API integration
- Content analysis
- Alternative article discovery

**Key Components:**
- `src/routes/` - HTTP endpoints
- `src/services/` - Business logic
- `src/schemas/` - Zod validation
- `src/prompts/` - LLM prompt templates

**Communication:**
- Exposes HTTP API on port 8787
- Calls Gemini API for analysis
- No database (stateless)

## Data Flow

### Primary Flow: Article Analysis

```
1. User submits URL via Share Target → Frontend
2. Frontend navigates to /search?url=... → Triggers hook
3. Hook calls Mastra workflow → POST /api/workflows/article-analysis/start-async
4. Mastra spawns 7 parallel agents:
   - Keywords extraction
   - Summary generation
   - Entity analysis
   - Blindspots detection
   - Media research
   - Alternative media discovery
   - Differences extraction
5. Each agent calls Backend API → /v1/analyze (or similar)
6. Backend pipeline executes:
   - Fetch article HTML
   - Extract content with Readability
   - Analyze with Gemini
   - Search alternatives with Grounded Search
   - Extract differences
7. Results flow back: Backend → Mastra → Frontend
8. Frontend renders analysis with scores and perspectives
```

### Backend Pipeline (Detailed)

```
URL → Fetch → Extract → Analyze → Search → Differences → Response
      ↓        ↓         ↓         ↓        ↓
   fetcher  extractor  gemini   grounded  differences
   .ts      .ts        .ts      -search   .ts
                                .ts
```

**Timing Budget:**
- Total: 10s target (5s user-facing goal + buffer)
- Fetch: <1s
- Extract: <1s
- Analyze: <8s (Gemini call)
- Search: Included in 8s
- Differences: <4s (Gemini call)
- Reserve: 2s

## Key Abstractions

### 1. Pipeline Execution Pattern
**Location:** `backend/src/routes/v1/analyze.ts`

Services composed in sequence with error propagation:
```typescript
const articleHtml = await fetchArticle(url)
if (!articleHtml.ok) return errorResponse(...)

const extracted = await extractContent(articleHtml.data)
if (!extracted.ok) return errorResponse(...)

const analysis = await analyzeArticle(extracted.data)
// ... continue pipeline
```

### 2. Agent LLM Pattern
**Location:** `mastra/src/agents/*.ts`

Each agent is an LLM-powered unit with:
- Model configuration (GPT-5.4)
- System prompt
- Tools (optional)
- Instructions

### 3. Service Layer with Result Types
**Location:** `backend/src/services/*.ts`

Every service returns discriminated union:
```typescript
type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; message: string }
```

### 4. Type Contracts
**Location:** `shared/dist/types/`

Shared TypeScript types for API contracts between services.

## Entry Points

### Frontend
- **Development:** `npm run dev` → port 3000
- **Production:** `npm run build && npm start` → port 3000
- **Entry File:** `front/app/layout.tsx` (root layout)

### Backend
- **Development:** `npm run dev` → port 8787
- **Production:** `npm start` → port 8787
- **Entry File:** `backend/src/index.ts`

### Mastra
- **Development:** `npm run dev` → port 4111
- **Production:** `npm start` → port 4111
- **Entry File:** `mastra/src/index.ts`

## Error Handling

### HTTP Error Codes
- **502** - External service failure (Gemini API)
- **422** - Validation error (invalid input)
- **500** - Internal server error

### Timeout Strategy
Uses `Promise.race()` with `AbortController`:
```typescript
const timeoutPromise = new Promise((_, reject) =>
  setTimeout(() => reject(new Error('Timeout')), 8000)
)
const result = await Promise.race([apiCall(), timeoutPromise])
```

### Graceful Degradation
- Analysis fails → Return partial extraction
- Search fails → Skip alternative articles
- Differences fail → Return analysis without perspectives

### Error Propagation
Result types propagate errors up the call stack:
```typescript
if (!result.ok) {
  return { ok: false, error: result.error, message: result.message }
}
```

## Cross-Cutting Concerns

### Logging
- **Backend:** `console.log` (simple logging)
- **Mastra:** Pino structured logging
- **Frontend:** `console.log` for development

### Validation
- **Zod schemas** for runtime validation
- **@hono/zod-validator** middleware for HTTP
- **TypeScript** for compile-time type safety

### Authentication
- **None** - Services are public
- API keys for external services (Gemini, OpenAI)

### Configuration
- **Environment variables** (`.env` files)
- No centralized config service
- Per-service configuration

## Deployment Architecture

### Docker Compose
Each service runs in separate container:
- `front` - Frontend PWA
- `backend` - Backend API
- `mastra` - Mastra workflows

### Networking
- Frontend accessible on port 3000
- Backend on port 8787
- Mastra on port 4111
- Services communicate via Docker network

### Data Persistence
- **None for articles** (stateless processing)
- **Mastra DB:** LibSQL file at `/data/mastra.db`

## Scaling Considerations

### Horizontal Scaling
- **Frontend:** Stateless, can replicate
- **Backend:** Stateless, can replicate
- **Mastra:** Single instance (LibSQL file-based)

### Bottlenecks
- LLM API calls (70% of request time)
- JSDOM parsing (memory-intensive)
- Sequential pipeline (no parallel fetch+extract)

### Current Limits
- Single Node.js instance: ~100-200 concurrent requests
- Gemini rate limit: 60 QPM (free tier)
- No caching layer

## Design Patterns

### Repository Pattern
Not used - services directly call external APIs

### Factory Pattern
Used in service creation:
- `createGeminiClient()`
- `createExtractor()`

### Middleware Pattern
Used in Hono routes:
- `zValidator()` for request validation
- Error handling middleware

### Observer Pattern
Not used - no event system

## Future Architectural Considerations

### Caching Layer
Could add Redis for:
- Analyzed article caching
- Rate limit tracking

### Message Queue
Could add for:
- Async article processing
- Retry logic for failed analyses

### API Gateway
Could centralize:
- Authentication
- Rate limiting
- Request routing
