# Directory Structure

**Last Updated:** 2026-03-28

## Repository Layout

```
shift26-context/
├── .planning/          # GSD workflow artifacts
│   ├── phases/         # Phase plans and summaries
│   ├── codebase/       # This documentation
│   ├── PROJECT.md      # Project vision
│   ├── ROADMAP.md      # Phase roadmap
│   └── STATE.md        # Project state
├── backend/            # ⚠️ OBSOLETE - Legacy Hono API (not in use)
├── front/              # ✅ Next.js PWA (active)
├── mastra/             # ✅ Mastra platform (active - workflows + agents)
├── shared/             # Shared TypeScript types (if used)
├── langle_mort.md      # Original hackathon spec
├── docker-compose.yml  # Multi-service orchestration
└── README.md
```

**Active Services:** `front/` + `mastra/` only
**Obsolete:** `backend/` (functionality migrated to Mastra agents)

## Service Directories

### Frontend (`front/`)

```
front/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   ├── search/             # Search results page
│   │   └── page.tsx
│   ├── globals.css         # Global styles
│   └── favicon.ico
├── components/             # React components
│   ├── custom/             # Custom components
│   │   ├── analysis-card.tsx
│   │   ├── bias-indicator.tsx
│   │   ├── loading-state.tsx
│   │   ├── navbar.tsx
│   │   └── url-input.tsx
│   └── ui/                 # shadcn/ui components
│       ├── accordion.tsx
│       ├── alert-dialog.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── dropdown-menu.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── select.tsx
│       ├── switch.tsx
│       ├── tabs.tsx
│       └── toast.tsx
├── hooks/                  # Custom React hooks
│   └── use-toast.ts
├── lib/                    # Utilities
│   └── utils.ts            # Class merging, etc.
├── public/                 # Static assets
│   ├── manifest.json       # PWA manifest
│   └── icons/
├── Dockerfile              # Frontend container
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.mjs
├── next.config.ts
└── .env.example
```

**Purpose:**
- User interface for article analysis
- PWA with Share Target support
- React 19 + Next.js 16 App Router
- Tailwind CSS + shadcn/ui components

### Backend (`backend/`) ⚠️ **OBSOLETE**

```
backend/
├── src/
│   ├── index.ts            # [NOT USED] Server entry point
│   ├── routes/             # [NOT USED] HTTP endpoints
│   │   ├── health.ts
│   │   └── analyze.ts
│   ├── services/           # [NOT USED] Business logic
│   │   ├── fetcher.ts      # → Replaced by articleExtractorAgent
│   │   ├── extractor.ts    # → Replaced by articleExtractorAgent
│   │   ├── gemini.ts       # → Replaced by OpenAI agents
│   │   ├── grounded-search.ts # → Replaced by otherMediaAgent
│   │   └── differences.ts  # → Replaced by synthesisAgent
│   ├── schemas/            # → Migrated to mastra/schemas/
│   ├── prompts/            # → Now in agent instructions
│   └── mocks/
├── Dockerfile              # Not deployed
├── package.json
└── tsconfig.json
```

**Status:** Code exists but is not deployed or used. All functionality migrated to Mastra agents.

**Migration mapping:**
- `fetcher.ts + extractor.ts` → `articleExtractorAgent` (Mastra)
- `gemini.ts analysis` → `cognitiveBiasAgent`, `blindspotsAgent`, etc.
- `grounded-search.ts` → `otherMediaAgent` with Google Grounding
- `differences.ts` → `synthesisAgent`

**Recommendation:** Can be safely deleted or archived.

### Mastra (`mastra/`) ✅ **ACTIVE**

```
mastra/
├── src/
│   └── mastra/                # Mastra configuration root
│       ├── index.ts           # Mastra instance + registration
│       ├── workflows/         # 11 workflow definitions
│       │   ├── full-article-analysis-workflow.ts  # Main pipeline
│       │   ├── article-extractor-workflow.ts      # Fetch + extract
│       │   ├── keywords-workflow.ts
│       │   ├── summary-workflow.ts
│       │   ├── entities-workflow.ts
│       │   ├── blindspots-workflow.ts
│       │   ├── cognitive-bias-workflow.ts
│       │   ├── media-research-workflow.ts
│       │   ├── other-media-workflow.ts
│       │   ├── synthesis-workflow.ts
│       │   └── example-weather-workflow.ts  # Example/template
│       ├── agents/            # 9+ LLM-powered agents
│       │   ├── article-extractor-agent.ts   # Fetch & extract
│       │   ├── keywords-agent.ts
│       │   ├── summary-agent.ts
│       │   ├── entity-agent.ts
│       │   ├── blindspots-agent.ts
│       │   ├── cognitive-bias-agent.ts
│       │   ├── media-agent.ts
│       │   ├── other-media.ts               # With Grounding
│       │   ├── synthesis-agent.ts
│       │   ├── article-agent.ts
│       │   └── example-weather-agent.ts
│       ├── schemas/           # Zod schemas for structured outputs
│       │   └── article.ts     # All analysis schemas
│       ├── tools/             # Agent tools (if any)
│       │   └── example-weather-tool.ts
│       └── scorers/           # Evaluation scorers
│           └── example-weather-scorer.ts
├── AGENTS.md               # Agent architecture docs
├── README.md               # Usage guide (API endpoints, curl examples)
├── Dockerfile
├── package.json
├── tsconfig.json
└── .env.example            # OPENAI_API_KEY required
```

**Purpose:**
- **Complete article analysis pipeline** (replaces backend)
- Workflow orchestration (sequential + parallel steps)
- LLM agent coordination (9 specialized agents)
- Structured output with Zod validation
- Google Grounding for web search (otherMediaAgent)
- Execution history tracking (LibSQL)

### Shared Types (`shared/`)

```
shared/
├── dist/
│   └── types/              # Compiled TypeScript types
│       ├── article.d.ts
│       ├── analysis.d.ts
│       └── index.d.ts
├── src/
│   └── types/              # Source type definitions
├── package.json
└── tsconfig.json
```

**Purpose:**
- Type contracts between services
- Shared interfaces for API communication

## Key File Locations

### Configuration Files

#### Root Level
- `docker-compose.yml` - Service orchestration
- `langle_mort.md` - Original hackathon specification

#### Per Service
- `*/package.json` - Dependencies and scripts
- `*/tsconfig.json` - TypeScript configuration
- `*/.env.example` - Environment variable templates
- `*/Dockerfile` - Container definitions

### Entry Points

- **Frontend:** `front/app/layout.tsx` (root), `front/app/page.tsx` (home)
- **Backend:** `backend/src/index.ts`
- **Mastra:** `mastra/src/index.ts`

### Core Logic

#### Backend Pipeline
1. `backend/src/routes/v1/analyze.ts` - Main endpoint
2. `backend/src/services/fetcher.ts` - Fetch article
3. `backend/src/services/extractor.ts` - Extract content
4. `backend/src/services/gemini.ts` - Analyze with Gemini
5. `backend/src/services/grounded-search.ts` - Find alternatives
6. `backend/src/services/differences.ts` - Extract perspectives

#### Frontend Flow
1. `front/app/page.tsx` - URL input
2. `front/app/search/page.tsx` - Results display
3. `front/components/custom/analysis-card.tsx` - Analysis rendering
4. `front/hooks/use-toast.ts` - Error notifications

#### Mastra Workflows
1. `mastra/src/workflows/article-analysis.ts` - Full orchestration
2. `mastra/src/agents/` - Individual analysis agents
3. `mastra/src/tools/` - Agent tools

## Naming Conventions

### Files
- **TypeScript:** `kebab-case.ts` (e.g., `grounded-search.ts`)
- **React Components:** `kebab-case.tsx` (e.g., `analysis-card.tsx`)
- **Routes:** `kebab-case` directories (e.g., `v1/analyze.ts`)

### Functions
- **Services:** `camelCase` (e.g., `fetchArticle()`, `extractContent()`)
- **Components:** `PascalCase` (e.g., `AnalysisCard`, `BiasIndicator`)
- **Factories:** `create*` prefix (e.g., `createGeminiClient()`)
- **Utilities:** Descriptive verbs (e.g., `extractTitle()`, `detectPaywall()`)

### Routes
- **HTTP paths:** `kebab-case` (e.g., `/v1/analyze`, `/api/health`)
- **Next.js routes:** Folder-based (e.g., `app/search/page.tsx` → `/search`)

### Types
- **Interfaces:** `PascalCase` (e.g., `ArticleContent`, `AnalysisResult`)
- **Type aliases:** `PascalCase` (e.g., `Result<T>`)
- **Enums:** `PascalCase` (e.g., `BiasLevel`)

## Where to Add Code

### New Feature: Article Analysis Step
1. **Create Mastra agent** in `mastra/src/mastra/agents/new-analysis-agent.ts`
   - Define agent with instructions
   - Configure GPT model
   - Add structured output schema

2. **Create workflow step** in target workflow file
   - Add `createStep()` with agent execution
   - Define input/output schemas (Zod)

3. **Update schema** in `mastra/src/mastra/schemas/article.ts`
   - Add new Zod schema for output
   - Export schema type

4. **Add to workflow** in `mastra/src/mastra/workflows/`
   - Add step to `.parallel([])` or `.then()`
   - Update workflow output schema
   - Update aggregate step if needed

5. **Update frontend** in `front/components/custom/`
   - Add UI component to display new analysis

### New UI Component
1. If reusable primitive → `front/components/ui/`
2. If domain-specific → `front/components/custom/`
3. If page-specific → Keep in `app/[route]/page.tsx`

### New Workflow (Independent)
1. Create workflow file in `mastra/src/mastra/workflows/new-workflow.ts`
2. Define steps with agents
3. Register in `mastra/src/mastra/index.ts`
4. Access via `POST /api/workflows/new-workflow/start-async`

### New Utility
1. Frontend utility → `front/lib/utils.ts`
2. Mastra utility → `mastra/src/mastra/utils/` (create if needed)
3. Shared type → `mastra/src/mastra/schemas/` (Zod schemas preferred)

### ⚠️ Do NOT Add Code To:
- `backend/` - This directory is obsolete
- Use Mastra agents instead of backend services

## Special Directories

### Generated/Build Outputs (Not Committed)
- `front/.next/` - Next.js build output
- `backend/dist/` - Compiled TypeScript
- `mastra/dist/` - Compiled TypeScript
- `*/node_modules/` - Dependencies
- `.mastra/` - Mastra runtime data

### Docker Volumes
- `/data/` - Mastra database persistence (production)
- `./mastra.db` - Local Mastra database (development)

### Documentation
- `.planning/` - GSD workflow artifacts
- `*/README.md` - Service-specific docs
- `mastra/AGENTS.md` - Agent architecture
- `langle_mort.md` - Original spec

## Import Path Patterns

### Backend
```typescript
// Relative paths with .js extension (ES modules)
import { fetchArticle } from './services/fetcher.js'
```

### Frontend
```typescript
// Alias imports with @ prefix
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
```

### Mastra
```typescript
// Relative paths with .js extension
import { keywordsAgent } from './agents/keywords-agent.js'
```

## File Organization Principles

1. **Feature-based:** Group by feature, not file type
2. **Service isolation:** Each service is independent
3. **Shared types:** Common contracts in `shared/`
4. **Configuration co-location:** Config files next to code
5. **No circular dependencies:** Strict one-way imports

## Migration Notes

### Legacy Backend Directory
The original `backend/` directory may have been replaced by the Mastra-based architecture. Current structure uses:
- `backend/` for Hono API
- `mastra/` for workflow orchestration
- Old backend code may be deprecated
