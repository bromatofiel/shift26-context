# Architecture

**Last Updated:** 2026-03-28

## Overview

BlindSpot uses a **2-tier agent-based architecture** with clear separation between presentation (Frontend PWA) and intelligent orchestration (Mastra workflows with LLM agents). The entire analysis pipeline is handled by Mastra agents, eliminating the need for traditional backend services.

## Architectural Pattern

**Pattern:** Agent-Based 2-Tier Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend PWA                          │
│                     (Next.js 16.2.1)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  UI Routes   │  │  Components  │  │    Hooks     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTP (port 3000)
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    Mastra Platform                           │
│                    (Mastra 1.3.15)                          │
│                                                              │
│  ┌────────────────── Workflows ──────────────────┐         │
│  │ • full-article-analysis (main pipeline)       │         │
│  │ • article-extractor (fetch + extract)         │         │
│  │ • keywords, summary, entities, blindspots     │         │
│  │ • media-research, other-media                 │         │
│  │ • cognitive-bias, synthesis                   │         │
│  └────────────────────────────────────────────────┘         │
│                          ▼                                   │
│  ┌─────────────────── Agents ────────────────────┐         │
│  │ • articleExtractorAgent (fetch & extract)     │         │
│  │ • entityAgent, summaryAgent, keywordsAgent    │         │
│  │ • blindspotsAgent, cognitiveBiasAgent         │         │
│  │ • mediaAgent, otherMediaAgent                 │         │
│  │ • synthesisAgent (final aggregation)          │         │
│  └────────────────────────────────────────────────┘         │
│                          ▼                                   │
│           ┌────────────────────────────┐                    │
│           │   LLM APIs & Storage       │                    │
│           │  • OpenAI (GPT-5.4)        │                    │
│           │  • Google Grounding        │                    │
│           │  • LibSQL (execution log)  │                    │
│           └────────────────────────────┘                    │
└─────────────────────────────────────────────────────────────┘
```

**Note:** Le répertoire `backend/` existe encore dans le codebase mais est **obsolète** - toute la logique métier est maintenant gérée par les agents Mastra.

## Layers

### 1. Presentation Layer (Frontend PWA)
**Location:** `front/`

**Responsibilities:**
- User interface rendering
- Share Target API integration (Android PWA)
- State management (React hooks)
- HTTP client for Mastra workflows

**Key Components:**
- `app/` - Next.js App Router routes
- `components/custom/` - React components (analysis cards, bias indicators)
- `hooks/` - Custom React hooks (use-toast)
- `lib/` - Utilities and helpers

**Communication:**
- Calls Mastra workflows via HTTP (port 4111)
- No direct LLM access
- No database access

### 2. Intelligence Layer (Mastra Platform)
**Location:** `mastra/`

**Responsibilities:**
- Complete article analysis pipeline
- Workflow orchestration (sequential + parallel steps)
- LLM agent coordination
- Result aggregation and synthesis
- Execution history tracking

**Key Components:**
- `src/mastra/workflows/` - 11 workflow definitions
- `src/mastra/agents/` - 9 LLM-powered agents
- `src/mastra/schemas/` - Zod schemas for structured outputs
- `src/mastra/tools/` - Agent tools (if any)
- `src/mastra/scorers/` - Evaluation scorers

**Communication:**
- Exposes HTTP API on port 4111
- Calls OpenAI API (GPT-5.4) for all agents
- Uses Google Grounding for web search
- Stores execution history in LibSQL (`/data/mastra.db`)

### 3. Legacy Backend (Obsolete)
**Location:** `backend/` ⚠️ **Not in use**

**Status:** Code exists but is no longer part of the active architecture. All functionality has been migrated to Mastra agents.

**Previous responsibilities** (now handled by Mastra):
- Article fetching → `articleExtractorAgent`
- Content extraction → `articleExtractorAgent`
- Gemini analysis → Multiple specialized agents
- Alternative discovery → `otherMediaAgent` with Grounding

## Data Flow

### Primary Flow: Article Analysis

```
1. User submits URL via Share Target → Frontend PWA
2. Frontend navigates to /search?url=... → Triggers analysis hook
3. Hook calls Mastra workflow:
   POST /api/workflows/full-article-analysis/start-async
   Body: { "inputData": { "url": "https://..." } }

4. Mastra workflow executes:

   Step 1: fetchArticleStep
   ├── articleExtractorAgent fetches URL
   ├── Extracts structured content (title, source, sections)
   └── Returns articleData

   Step 2: Parallel execution (7 agents):
   ├── extractEntitiesStep → entityAgent
   ├── summarizeStep → summaryAgent
   ├── extractKeywordsStep → keywordsAgent
   ├── blindspotsStep → blindspotsAgent
   ├── mediaResearchStep → mediaAgent (with Google Grounding)
   ├── otherMediaStep → otherMediaAgent (with Google Grounding)
   └── cognitiveBiasStep → cognitiveBiasAgent

   Step 3: aggregateStep
   ├── Collects all parallel results
   ├── synthesisAgent produces final insights
   └── Returns complete analysisResult

5. Mastra returns JSON response to frontend
6. Frontend renders analysis with bias scores and perspectives
```

### Mastra Workflow Pipeline (Detailed)

```
URL (input)
  ↓
┌─────────────────────────────────────┐
│ fetchArticleStep                    │
│ Agent: articleExtractorAgent        │
│ - Fetches article from URL          │
│ - Extracts title, source, content   │
│ Output: articleData                 │
└──────────────┬──────────────────────┘
               ↓
    ┌──────────┴────────────┐
    │   PARALLEL EXECUTION   │
    └──────────┬────────────┘
               ↓
    ╔══════════════════════════════════════╗
    ║  7 Agents Running in Parallel        ║
    ╠══════════════════════════════════════╣
    ║  1. entityAgent         → entities   ║
    ║  2. summaryAgent        → summary    ║
    ║  3. keywordsAgent       → keywords   ║
    ║  4. blindspotsAgent     → blindspots ║
    ║  5. mediaAgent          → media info ║
    ║  6. otherMediaAgent     → alt articles║
    ║  7. cognitiveBiasAgent  → bias score ║
    ╚══════════════════════════════════════╝
               ↓
┌──────────────────────────────────────┐
│ aggregateStep                        │
│ Agent: synthesisAgent                │
│ - Consolidates all results           │
│ - Produces final synthesis           │
│ Output: analysisResult (complete)    │
└──────────────┬───────────────────────┘
               ↓
        JSON Response
```

**Timing Characteristics:**
- Fetch + Extract: ~2-3s (articleExtractorAgent)
- Parallel agents: ~5-8s (longest agent wins)
- Synthesis: ~1-2s (aggregateStep)
- **Total: ~8-13s** (depends on LLM latency)
- Target: <10s for 80% of requests

## Key Abstractions

### 1. Workflow Pattern (Mastra)
**Location:** `mastra/src/mastra/workflows/*.ts`

Workflows compose steps with typed inputs/outputs:
```typescript
export const fullArticleAnalysisWorkflow = createWorkflow({
  id: "full-article-analysis",
  inputSchema: z.object({ url: z.string() }),
  outputSchema: analysisResultSchema
})
  .then(fetchArticleStep)           // Sequential
  .parallel([                        // Parallel execution
    extractEntitiesStep,
    summarizeStep,
    extractKeywordsStep,
    // ... 7 agents total
  ])
  .then(aggregateStep)               // Sequential
  .commit();
```

### 2. Step Pattern (Mastra)
**Location:** Workflow definitions

Each step is a typed transformation with agent execution:
```typescript
const extractEntitiesStep = createStep({
  id: "extract-entities",
  inputSchema: articleDataSchema,
  outputSchema: z.object({ entities: z.array(entitySchema) }),
  execute: async ({ inputData, mastra }) => {
    const agent = mastra?.getAgent("entityAgent");
    const result = await agent.generate(articleToText(inputData), {
      structuredOutput: { schema: z.object({ entities: z.array(entitySchema) }) }
    });
    return result.object;
  }
});
```

### 3. Agent Pattern (Mastra)
**Location:** `mastra/src/mastra/agents/*.ts`

Each agent is an LLM-powered specialist:
```typescript
export const entityAgent = mastra.agent({
  name: "entityAgent",
  instructions: "Extract named entities from French news articles",
  model: {
    provider: "OPEN_AI",
    name: "gpt-5.4-...",
    toolChoice: "auto"
  }
});
```

Key characteristics:
- Structured output with Zod schemas
- French language instructions
- GPT-5.4 models for intelligence
- Optional tool usage (Grounding for search)

### 4. Structured Output Pattern
**Location:** All agent calls

Agents return validated, type-safe outputs:
```typescript
const result = await agent.generate(prompt, {
  structuredOutput: { schema: entitySchema }
});
// result.object is validated EntitySchema
```

### 5. Schema Contracts
**Location:** `mastra/src/mastra/schemas/article.ts`

Zod schemas define all data structures:
```typescript
export const articleDataSchema = z.object({
  source: z.string(),
  title: z.string(),
  authors: z.array(z.string()),
  sections: z.array(z.object({
    heading: z.string().optional(),
    paragraphs: z.array(z.string())
  }))
});
```

## Entry Points

### Frontend (Active)
- **Development:** `npm run dev` → port 3000
- **Production:** `npm run build && npm start` → port 3000
- **Entry File:** `front/app/layout.tsx` (root layout)
- **Main Page:** `front/app/page.tsx` (URL input)
- **Results Page:** `front/app/search/page.tsx` (analysis display)

### Mastra (Active)
- **Development:** `npm run dev` → port 4111
- **Production:** `npm start` → port 4111
- **Entry File:** `mastra/src/mastra/index.ts`
- **API Endpoints:**
  - `POST /api/workflows/full-article-analysis/start-async`
  - `POST /api/workflows/article-extractor/start-async`
  - `POST /api/workflows/keywords/start-async`
  - `POST /api/workflows/summary/start-async`
  - ... (11 workflows total)
- **Admin UI:** `http://localhost:4111` (Mastra Studio)
- **Swagger:** `http://localhost:4111/swagger-ui`

### Backend (Obsolete - Not Running)
- **Status:** Code exists but service is not deployed
- **Entry File:** `backend/src/index.ts` (not used)
- All functionality migrated to Mastra agents

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

### Docker Compose (Current)
Two active services:
- `front` - Frontend PWA (Next.js)
- `mastra` - Mastra platform (workflows + agents)
- `backend` - ⚠️ Obsolete (not deployed)

### Networking
- **Frontend:** Port 3000 (public)
- **Mastra:** Port 4111 (API + Studio UI)
- Services communicate via Docker network or localhost

### Data Persistence
- **Articles:** None (stateless, no storage)
- **Mastra execution log:** LibSQL file at `/data/mastra.db`
- **Volume mount:** `/data` for Mastra database persistence

## Scaling Considerations

### Horizontal Scaling
- **Frontend:** Stateless, easily replicable
- **Mastra:** Limited by LibSQL file-based storage
  - Currently single instance
  - Would need distributed storage (PostgreSQL) for multi-instance

### Bottlenecks
1. **LLM API latency** (~80% of request time)
   - 7 parallel agent calls
   - Depends on OpenAI API performance
   - Longest agent determines total time

2. **OpenAI rate limits**
   - Free/starter tier may be insufficient
   - Need monitoring and queuing

3. **Mastra single instance**
   - LibSQL is file-based (not distributed)
   - Cannot horizontally scale without migration

### Current Limits
- **Concurrent requests:** Limited by OpenAI rate limits
- **OpenAI API:** Rate limits vary by tier
- **Memory:** Node.js + agent execution ~512MB-1GB per instance
- **No caching:** Every URL triggers full analysis

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
