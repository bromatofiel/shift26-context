# Testing

**Last Updated:** 2026-03-28

## Overview

**Status:** No testing framework configured. The codebase has zero test coverage and no formal testing strategy.

## Current State

### Test Files
**None found.** No `.test.ts` or `.spec.ts` files exist in:
- `backend/src/`
- `front/`
- `mastra/src/`

### Testing Frameworks
**None configured.** No test runners detected:
- No Jest
- No Vitest
- No Mocha
- No testing-library

### Test Scripts
**None defined.** All `package.json` files have:
```json
{
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  }
}
```

## Current Validation Approach

### Runtime Validation (Zod)
**Location:** `backend/src/schemas/*.schema.ts`

Services use Zod schemas for runtime type validation instead of unit tests:

```typescript
import { z } from 'zod'

export const articleSchema = z.object({
  url: z.string().url(),
  title: z.string().min(1),
  content: z.string().min(10)
})

// Validation happens at runtime
const parsed = articleSchema.parse(input)  // Throws if invalid
```

**Pros:**
- Catches type errors at runtime
- Prevents invalid data from entering system
- Explicit error messages

**Cons:**
- No test coverage reporting
- Doesn't test business logic
- Fails in production (not during development)

### Type-Driven Development
**TypeScript strict mode** provides compile-time safety:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

**What it catches:**
- Type mismatches
- Null/undefined access
- Missing properties
- Invalid function calls

**What it misses:**
- Runtime errors
- Business logic bugs
- Integration issues
- Edge cases

### Manual Testing
**Primary validation method:**
- Local development testing
- Manual API calls with curl
- Browser testing of frontend
- Observing Mastra workflow execution

**No automated regression testing.**

## Test Coverage Gaps

### High Priority (Core Business Logic)

#### Backend Services
**Need testing:**
- `backend/src/services/fetcher.ts`
  - URL validation
  - HTTP error handling
  - Timeout behavior
  - Network failures

- `backend/src/services/extractor.ts`
  - Readability extraction
  - Paywall detection
  - Partial content handling
  - Invalid HTML handling

- `backend/src/services/gemini.ts`
  - API call success/failure
  - Timeout handling
  - JSON parsing
  - Retry logic

- `backend/src/services/grounded-search.ts`
  - Search result parsing
  - Empty results
  - Invalid URLs in results
  - API failures

- `backend/src/services/differences.ts`
  - Differences extraction
  - Timeout behavior
  - JSON parsing
  - Empty perspectives

#### End-to-End Pipeline
**Need testing:**
- `backend/src/routes/v1/analyze.ts`
  - Full pipeline success path
  - Partial failure scenarios
  - Timeout orchestration
  - Error response formats

### Medium Priority (Frontend)

#### React Components
**Need testing:**
- `front/components/custom/analysis-card.tsx`
  - Rendering with different analysis states
  - User interactions
  - Error states
  - Loading states

- `front/components/custom/bias-indicator.tsx`
  - Color coding
  - Score thresholds
  - Edge cases (null/undefined scores)

- `front/app/search/page.tsx`
  - URL parameter handling
  - API call integration
  - Error handling
  - Loading state management

#### Custom Hooks
**Need testing:**
- `front/hooks/use-toast.ts`
  - Toast triggering
  - Multiple toasts
  - Dismissal behavior

### Medium Priority (Mastra)

#### Workflows
**Need testing:**
- `mastra/src/workflows/article-analysis.ts`
  - Full workflow execution
  - Partial agent failures
  - Timeout handling
  - Result aggregation

#### Agents
**Need testing:**
- Individual agent execution
- Input/output contracts
- Error handling
- Tool usage

## Recommended Testing Strategy

### Phase 1: Unit Tests for Services

**Framework:** Vitest (fast, TypeScript-native)

**Setup:**
```bash
npm install -D vitest @vitest/ui
```

**Example test:**
```typescript
// backend/src/services/fetcher.test.ts
import { describe, it, expect, vi } from 'vitest'
import { fetchArticle } from './fetcher'

describe('fetchArticle', () => {
  it('returns HTML on successful fetch', async () => {
    const result = await fetchArticle('https://example.com/article')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data).toContain('<html')
    }
  })

  it('returns error on 404', async () => {
    const result = await fetchArticle('https://example.com/not-found')
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toBe('FETCH_FAILED')
    }
  })

  it('times out after 5 seconds', async () => {
    const result = await fetchArticle('https://slow-server.com/article')
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toBe('TIMEOUT')
    }
  })
})
```

### Phase 2: Integration Tests

**Test database:** In-memory SQLite for Mastra

**Example:**
```typescript
// mastra/src/workflows/article-analysis.test.ts
import { describe, it, expect } from 'vitest'
import { articleAnalysisWorkflow } from './article-analysis'

describe('Article Analysis Workflow', () => {
  it('completes full analysis for valid article', async () => {
    const input = {
      source: 'Le Monde',
      title: 'Test Article',
      sections: [{ paragraphs: ['Content...'] }]
    }

    const result = await articleAnalysisWorkflow.execute(input)

    expect(result.keywords).toBeDefined()
    expect(result.summary).toBeDefined()
    expect(result.entities).toBeDefined()
  })
})
```

### Phase 3: E2E Tests

**Framework:** Playwright (for frontend + API)

**Example:**
```typescript
// e2e/article-analysis.spec.ts
import { test, expect } from '@playwright/test'

test('analyze article flow', async ({ page }) => {
  await page.goto('http://localhost:3000')

  // Enter URL
  await page.fill('input[type="url"]', 'https://lemonde.fr/article')
  await page.click('button:has-text("Analyser")')

  // Wait for analysis
  await expect(page.locator('[data-testid="analysis-result"]')).toBeVisible({
    timeout: 10000
  })

  // Verify results
  await expect(page.locator('[data-testid="bias-score"]')).toContainText(/Vert|Orange|Rouge/)
})
```

### Phase 4: Mocking Strategy

**Mock external APIs:**
```typescript
// backend/src/services/__mocks__/gemini.ts
export const mockGeminiClient = {
  analyze: vi.fn().mockResolvedValue({
    ok: true,
    data: {
      keywords: ['IA', 'régulation'],
      summary: 'Article sur la régulation de l\'IA',
      entities: [],
      blindspots: []
    }
  })
}
```

**Use mock data:**
```typescript
// backend/src/mocks/article-sample.json (already exists)
{
  "title": "Sample Article",
  "content": "Lorem ipsum..."
}
```

## Testing Best Practices (When Implemented)

### Test Structure
```typescript
describe('Feature', () => {
  describe('when condition', () => {
    it('should behavior', () => {
      // Arrange
      const input = { ... }

      // Act
      const result = functionUnderTest(input)

      // Assert
      expect(result).toBe(expected)
    })
  })
})
```

### Test Coverage Goals
- **Critical paths:** 100% (fetcher, extractor, analyze route)
- **Services:** 80%
- **Components:** 70%
- **Utilities:** 90%

### Continuous Integration
**Not configured.** Would need:
- GitHub Actions workflow
- Run tests on PR
- Block merge on test failures
- Coverage reporting

## Manual Testing Procedures (Current)

### Backend API Testing
```bash
# Health check
curl http://localhost:8787/health

# Analyze article
curl -X POST http://localhost:8787/v1/analyze \
  -H "Content-Type: application/json" \
  -d '{"url": "https://lemonde.fr/article"}'
```

### Mastra Workflow Testing
```bash
# Keywords extraction
curl -X POST http://localhost:4111/api/workflows/keywords-extraction/start-async \
  -H "Content-Type: application/json" \
  -d '{"inputData": {...}}'
```

### Frontend Testing
1. Open http://localhost:3000
2. Enter article URL
3. Click "Analyser"
4. Verify results display

## Dependencies at Risk (No Tests)

### Archived/Unmaintained
- **@mozilla/readability** - Archived repository, no active maintenance
  - Critical for content extraction
  - Breaking changes would be undetected

### Heavy Dependencies
- **jsdom** - Large, memory-intensive
  - Edge cases not tested
  - Memory leaks possible

### Newly Released
- **Gemini 2.5-Flash** - Newly released model
  - API changes not caught by tests
  - Output format changes would break parsing

### Early Versions
- **Next.js 16.2.1** - Early release
  - Breaking changes possible
  - No upgrade path tested

## Recommendations

### Immediate (Before Production)
1. **Add health check tests** - Verify services start
2. **Add schema validation tests** - Verify Zod schemas catch errors
3. **Add critical path tests** - Test /v1/analyze endpoint

### Short Term (Next Sprint)
1. **Set up Vitest** for backend/mastra
2. **Add unit tests** for all services
3. **Add integration tests** for workflows
4. **Set up test coverage reporting**

### Long Term (Next Milestone)
1. **Add E2E tests** with Playwright
2. **Set up CI/CD** with automated tests
3. **Add performance tests** for latency targets
4. **Add load tests** for concurrent requests

## Testing Anti-Patterns to Avoid

### Don't
- Test implementation details
- Mock everything (integration tests valuable)
- Skip edge cases
- Ignore flaky tests
- Write tests after deployment

### Do
- Test behavior and contracts
- Use real implementations when possible
- Test error paths
- Fix flaky tests immediately
- Write tests alongside code
