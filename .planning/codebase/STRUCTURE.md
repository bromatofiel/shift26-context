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
├── backend/            # Hono API service
├── front/              # Next.js PWA
├── mastra/             # Mastra workflow orchestration
├── shared/             # Shared TypeScript types
├── langle_mort.md      # Original hackathon spec
├── docker-compose.yml  # Multi-service orchestration
└── README.md
```

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

### Backend (`backend/`)

```
backend/
├── src/
│   ├── index.ts            # Server entry point
│   ├── routes/             # HTTP endpoints
│   │   ├── health.ts       # Health check endpoint
│   │   └── v1/
│   │       └── analyze.ts  # Main analysis endpoint
│   ├── services/           # Business logic
│   │   ├── fetcher.ts      # Article fetching
│   │   ├── extractor.ts    # Content extraction (Readability)
│   │   ├── gemini.ts       # Gemini API client
│   │   ├── grounded-search.ts  # Alternative article discovery
│   │   └── differences.ts  # Perspective extraction
│   ├── schemas/            # Zod validation schemas
│   │   └── article.schema.ts
│   ├── prompts/            # LLM prompt templates
│   │   ├── analysis.prompt.ts
│   │   └── differences.prompt.ts
│   └── mocks/              # Test fixtures
│       └── article-sample.json
├── Dockerfile
├── package.json
├── tsconfig.json
└── .env.example
```

**Purpose:**
- Core article processing pipeline
- Gemini API integration
- Stateless HTTP API (Hono)

### Mastra (`mastra/`)

```
mastra/
├── src/
│   ├── index.ts            # Mastra server entry
│   ├── workflows/          # Workflow definitions
│   │   ├── article-analysis.ts           # Full pipeline
│   │   ├── keywords-extraction.ts        # Keywords only
│   │   ├── article-summary.ts            # Summary only
│   │   ├── entities-analysis.ts          # Entities only
│   │   ├── blindspots-analysis.ts        # Blindspots only
│   │   ├── media-research.ts             # Media research
│   │   ├── other-media.ts                # Alternative media
│   │   └── [4 more workflows]
│   ├── agents/             # LLM-powered agents
│   │   ├── keywords-agent.ts
│   │   ├── summary-agent.ts
│   │   ├── entities-agent.ts
│   │   ├── blindspots-agent.ts
│   │   ├── media-research-agent.ts
│   │   ├── other-media-agent.ts
│   │   └── [5 more agents]
│   ├── tools/              # Agent tools
│   └── scorers/            # Evaluation scorers
├── AGENTS.md               # Agent documentation
├── README.md               # Mastra usage guide
├── Dockerfile
├── package.json
├── tsconfig.json
└── .env.example
```

**Purpose:**
- Workflow orchestration
- Parallel agent execution
- OpenAI integration for agents

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
1. Add service in `backend/src/services/new-analysis.ts`
2. Add route handler in `backend/src/routes/v1/analyze.ts`
3. Add Mastra agent in `mastra/src/agents/new-agent.ts`
4. Add workflow in `mastra/src/workflows/new-workflow.ts`
5. Update frontend component in `front/components/custom/`

### New UI Component
1. If reusable primitive → `front/components/ui/`
2. If domain-specific → `front/components/custom/`
3. If page-specific → Keep in `app/[route]/page.tsx`

### New API Endpoint
1. Add route in `backend/src/routes/`
2. Add service logic in `backend/src/services/`
3. Add Zod schema in `backend/src/schemas/`

### New Utility
1. Backend utility → `backend/src/utils/` (create if needed)
2. Frontend utility → `front/lib/utils.ts`
3. Shared type → `shared/src/types/`

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
