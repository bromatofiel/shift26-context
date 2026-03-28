# Coding Conventions

**Last Updated:** 2026-03-28

## Overview

BlindSpot uses TypeScript across all services with strict mode enabled. Code style is enforced through ESLint (frontend) and TypeScript compiler (backend/mastra).

## Code Style

### Naming Conventions

#### Files and Directories
- **TypeScript files:** `kebab-case.ts` (e.g., `grounded-search.ts`, `article.schema.ts`)
- **React components:** `kebab-case.tsx` (e.g., `analysis-card.tsx`, `bias-indicator.tsx`)
- **Directories:** `kebab-case` (e.g., `src/services/`, `app/search/`)
- **Test files:** `*.test.ts` or `*.spec.ts` (none currently exist)

#### Variables and Functions
- **Variables:** `camelCase` (e.g., `articleHtml`, `extractedContent`)
- **Constants:** `UPPER_SNAKE_CASE` for true constants (e.g., `API_TIMEOUT = 8000`)
- **Functions:** `camelCase` (e.g., `fetchArticle()`, `extractContent()`)
- **Factory functions:** `create*` prefix (e.g., `createGeminiClient()`, `createExtractor()`)
- **Helper functions:** Descriptive verbs (e.g., `extractTitle()`, `detectPaywall()`, `parseJson()`)

#### Classes and Types
- **Classes:** `PascalCase` (e.g., `ArticleExtractor`, `GeminiClient`)
- **Interfaces:** `PascalCase` (e.g., `ArticleContent`, `AnalysisResult`)
- **Type aliases:** `PascalCase` (e.g., `Result<T>`, `ServiceResponse`)
- **Enums:** `PascalCase` for enum name, `PascalCase` for values (e.g., `BiasLevel.High`)

#### React Components
- **Component names:** `PascalCase` (e.g., `AnalysisCard`, `BiasIndicator`, `LoadingState`)
- **Props interfaces:** `{ComponentName}Props` (e.g., `AnalysisCardProps`)
- **Hook names:** `use*` prefix (e.g., `useToast`, `useArticleAnalysis`)

### Formatting

#### Indentation
- **2 spaces** for indentation (enforced by ESLint in frontend)
- No tabs

#### Quotes
- **Single quotes** for strings in backend/mastra
- **Double quotes** in frontend (Next.js convention)
- **Backticks** for template literals

#### Semicolons
- **Optional** - Code works with or without (TypeScript ASI)
- Backend/mastra tend to omit semicolons
- Frontend uses semicolons (ESLint enforced)

#### Line Length
- No strict limit enforced
- Generally keep under 120 characters for readability

#### Imports
- **Group imports:**
  1. External packages (e.g., `from 'hono'`)
  2. Internal modules (e.g., `from './services/fetcher.js'`)
  3. Types (e.g., `import type { ... }`)

- **Backend/Mastra:** Require `.js` extension for ES modules
  ```typescript
  import { fetchArticle } from './services/fetcher.js'
  ```

- **Frontend:** Use `@/` alias
  ```typescript
  import { Button } from '@/components/ui/button'
  import { cn } from '@/lib/utils'
  ```

## TypeScript Patterns

### Strict Mode
All services use TypeScript strict mode:
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

### Type Inference
Prefer type inference over explicit annotations where obvious:
```typescript
// Good
const result = await fetchArticle(url)

// Avoid
const result: Result<string> = await fetchArticle(url)
```

### Interface vs Type
- **Interfaces** for object shapes that might be extended
- **Type aliases** for unions, intersections, and simple renames

```typescript
// Interface for extensible objects
interface ArticleContent {
  title: string
  content: string
}

// Type for discriminated unions
type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; message: string }
```

### Discriminated Unions
**Pattern used throughout:** Result type for error handling

```typescript
type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; message: string }

// Usage
function handleResult<T>(result: Result<T>) {
  if (result.ok) {
    // TypeScript knows result.data exists
    console.log(result.data)
  } else {
    // TypeScript knows result.error and result.message exist
    console.error(result.error, result.message)
  }
}
```

### Optional Chaining
Use optional chaining for potentially undefined values:
```typescript
const title = article?.metadata?.title ?? 'Untitled'
```

### Nullish Coalescing
Use `??` for default values (not `||`):
```typescript
const timeout = config.timeout ?? 8000  // Good
const timeout = config.timeout || 8000  // Avoid (0 would use default)
```

## Error Handling

### Result Type Pattern
**Standard across all services:**

```typescript
// Definition
type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; message: string }

// Service returns Result
export async function fetchArticle(url: string): Promise<Result<string>> {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      return {
        ok: false,
        error: 'FETCH_FAILED',
        message: `HTTP ${response.status}: ${response.statusText}`
      }
    }
    const html = await response.text()
    return { ok: true, data: html }
  } catch (error) {
    return {
      ok: false,
      error: 'NETWORK_ERROR',
      message: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Consumer checks result
const result = await fetchArticle(url)
if (!result.ok) {
  return c.json({ error: result.error, message: result.message }, 502)
}
// TypeScript knows result.data is string here
const html = result.data
```

### Error Codes
**Consistent error codes:**
- `FETCH_FAILED` - HTTP request failed
- `NETWORK_ERROR` - Network failure
- `PARSE_ERROR` - JSON parsing failed
- `VALIDATION_ERROR` - Zod validation failed
- `TIMEOUT` - Operation exceeded timeout
- `API_ERROR` - External API returned error

### Try-Catch Usage
- **Use for:** External API calls, JSON parsing, file operations
- **Avoid for:** Business logic that should use Result types

```typescript
// Good - external API call
try {
  const response = await fetch(url)
} catch (error) {
  return { ok: false, error: 'NETWORK_ERROR', message: error.message }
}

// Avoid - prefer Result type
try {
  const article = await fetchArticle(url)
  if (article.error) throw new Error(article.error)
} catch (error) {
  // ...
}
```

### HTTP Error Responses
**Hono error responses:**
```typescript
// Validation error
return c.json({ error: 'Invalid URL format' }, 422)

// External service error
return c.json({ error: result.error, message: result.message }, 502)

// Internal error
return c.json({ error: 'Internal server error' }, 500)
```

## React Patterns (Frontend)

### Component Structure
```typescript
// Props interface
interface AnalysisCardProps {
  analysis: AnalysisResult
  onRetry?: () => void
}

// Component
export function AnalysisCard({ analysis, onRetry }: AnalysisCardProps) {
  // Hooks at top
  const { toast } = useToast()

  // Event handlers
  const handleRetry = () => {
    onRetry?.()
    toast({ title: 'Retrying analysis...' })
  }

  // Render
  return (
    <Card>
      {/* JSX */}
    </Card>
  )
}
```

### Hooks
- **Place at top** of component (before any conditionals)
- **Custom hooks** start with `use` prefix
- **Dependency arrays** must be complete (ESLint enforces)

### State Management
- **useState** for local component state
- **No global state** (Redux, Zustand) - not needed yet
- **Props drilling** acceptable for current app size

### Props Destructuring
```typescript
// Prefer destructuring in parameters
export function Button({ children, variant = 'default', onClick }: ButtonProps) {
  // ...
}

// Avoid
export function Button(props: ButtonProps) {
  const { children, variant, onClick } = props
  // ...
}
```

## Service Layer Patterns (Backend)

### Service Function Signature
```typescript
// Services return Promise<Result<T>>
export async function serviceName(
  input: InputType
): Promise<Result<OutputType>> {
  // Implementation
}
```

### Dependency Injection
Not used - services instantiate dependencies directly:
```typescript
// No DI container
export async function analyzeArticle(content: ArticleContent) {
  const client = createGeminiClient()  // Create here
  // ...
}
```

### Configuration
Environment variables accessed via `process.env`:
```typescript
const apiKey = process.env.GEMINI_API_KEY
if (!apiKey) {
  throw new Error('GEMINI_API_KEY is required')
}
```

## Validation

### Zod Schemas
**Location:** `backend/src/schemas/*.schema.ts`

```typescript
import { z } from 'zod'

export const articleSchema = z.object({
  url: z.string().url(),
  title: z.string().min(1),
  content: z.string().min(10)
})

export type Article = z.infer<typeof articleSchema>
```

### Route Validation
Use `@hono/zod-validator`:
```typescript
import { zValidator } from '@hono/zod-validator'

app.post('/analyze',
  zValidator('json', articleSchema),
  async (c) => {
    const article = c.req.valid('json')  // Type-safe
    // ...
  }
)
```

## Linting

### Frontend (ESLint 9)
**Config:** `front/.eslintrc.json`

- Next.js rules enabled
- React hooks rules enforced
- Unused vars flagged
- Console.log allowed (development)

### Backend/Mastra
- No ESLint configured
- TypeScript strict mode catches most issues
- Manual code review

## Comments and Documentation

### When to Comment
- **Do:** Explain WHY, not WHAT
- **Do:** Document complex algorithms
- **Do:** Add TODO/FIXME for known issues
- **Don't:** Restate obvious code
- **Don't:** Leave commented-out code

```typescript
// Good - explains why
// Use Promise.race to enforce timeout budget
const result = await Promise.race([
  analyzeWithGemini(content),
  timeoutPromise(8000)
])

// Avoid - restates code
// Fetch the article from the URL
const article = await fetchArticle(url)
```

### JSDoc
Not heavily used - prefer TypeScript types:
```typescript
// Prefer type signature over JSDoc
export async function fetchArticle(url: string): Promise<Result<string>> {
  // ...
}

// Instead of
/**
 * Fetches an article from a URL
 * @param url - The URL to fetch
 * @returns Promise resolving to Result with HTML string
 */
export async function fetchArticle(url: string) {
  // ...
}
```

## File Organization

### Exports
```typescript
// Named exports (preferred)
export function fetchArticle(url: string) { }
export function extractContent(html: string) { }

// Default exports for React components
export default function AnalysisCard(props: Props) { }
```

### Barrel Exports
Not used - import directly from files:
```typescript
// Avoid barrel exports
// index.ts
export * from './fetcher.js'
export * from './extractor.js'

// Prefer direct imports
import { fetchArticle } from './services/fetcher.js'
```

## Testing

**Status:** No testing conventions established

- No test files exist
- No testing framework configured
- Testing patterns TBD

## Security

### Input Validation
- **Always validate** external input with Zod
- **Sanitize URLs** before fetching
- **Escape HTML** in frontend rendering (React does this automatically)

### API Keys
- **Never commit** API keys to git
- **Use .env files** with `.env.example` templates
- **Validate at startup** (currently missing)

### Content Security
- **No eval()** - never used
- **No innerHTML** - React JSX only
- **Validate URLs** to prevent SSRF (incomplete)

## Performance

### Async/Await
Prefer `async/await` over raw Promises:
```typescript
// Good
const html = await fetchArticle(url)
const content = await extractContent(html)

// Avoid
fetchArticle(url).then(html => {
  return extractContent(html)
}).then(content => {
  // ...
})
```

### Parallel Operations
Use `Promise.all` for independent operations:
```typescript
// Good - parallel
const [keywords, summary, entities] = await Promise.all([
  extractKeywords(content),
  generateSummary(content),
  analyzeEntities(content)
])

// Avoid - sequential
const keywords = await extractKeywords(content)
const summary = await generateSummary(content)
const entities = await analyzeEntities(content)
```

### Timeouts
Always set timeouts for external calls:
```typescript
const controller = new AbortController()
const timeout = setTimeout(() => controller.abort(), 8000)

try {
  const response = await fetch(url, { signal: controller.signal })
  return { ok: true, data: await response.text() }
} catch (error) {
  if (error.name === 'AbortError') {
    return { ok: false, error: 'TIMEOUT', message: 'Request timed out' }
  }
  throw error
} finally {
  clearTimeout(timeout)
}
```
