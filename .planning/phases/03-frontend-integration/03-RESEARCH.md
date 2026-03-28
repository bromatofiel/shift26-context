# Phase 3: Frontend & Integration - Research

**Researched:** 2026-03-28
**Domain:** React PWA with Android Share Target integration
**Confidence:** HIGH

## Summary

Phase 3 integrates the backend analysis pipeline (completed in Phase 2) with a React 19 + Next.js 16 PWA frontend featuring Android Share Target API support. The project already has significant frontend scaffolding in place (Next.js 16.2.1, React 19.2.4, shadcn/ui components, Tailwind CSS v4) with working analysis display components and API integration hooks.

The core technical challenge is implementing the Web Share Target API for Android, which requires a properly configured manifest.json, service worker registration, and a share handler route. Performance targets demand aggressive streaming SSR with loading states (<3s first screen, <5s complete analysis).

**Primary recommendation:** Use Next.js built-in manifest.json support with manual service worker registration; implement multi-stage loading UI with React Suspense boundaries; leverage existing useFullAnalysis hook for backend integration; focus on progressive enhancement and offline UX patterns.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ING-01 | L'utilisateur peut partager un lien vers l'app via Share Target Android | Web Share Target API manifest configuration, service worker registration, share handler route |
| UI-01 | L'utilisateur voit un écran de chargement avec étapes (Analyse, Recherche, Synthèse) | React Suspense boundaries, loading.tsx streaming SSR, multi-stage progress indicators |
| UI-02 | L'utilisateur voit le score couleur en premier (verdict visuel immédiat) | Progressive rendering, optimistic UI patterns, visual hierarchy with color-coded score |
| UI-03 | L'utilisateur peut voir le détail des biais détectés | Expandable card components (existing shadcn/ui components), accordion patterns |
| UI-04 | L'utilisateur voit 2-3 cartes "Autres angles" cliquables | Card grid layout with external link handling (existing otherMedia display) |
| UI-05 | L'utilisateur peut ouvrir les sources alternatives dans le navigateur | External link handling with target="_blank" rel="noopener noreferrer" (already implemented) |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.2.1 | React framework with App Router, SSR, streaming | Industry standard for React SSR/PWA, built-in manifest support, verified compatible (already installed) |
| React | 19.2.4 | UI library with Suspense, useActionState, useOptimistic | Latest stable (March 2026), improved loading states and concurrent rendering, verified installed |
| TypeScript | 5.x | Type safety | Standard for production React apps, already configured |
| Tailwind CSS | 4.2.2 | Utility-first styling | v4 current stable (2026), already installed and configured |
| shadcn/ui | Latest (radix-ui 1.4.3) | Accessible component primitives | Built on Radix UI, already integrated with unified package (Feb 2026 update) |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Workbox | 7.x (via manual SW) | Service worker utilities | For offline caching strategies, background sync |
| lucide-react | 1.7.0 | Icon library | Already installed, consistent icon set |
| Zod | Latest | Runtime validation | Already in use for backend schemas, reuse for client-side validation |
| class-variance-authority | 0.7.1 | Component variant styling | Already installed for shadcn/ui variants |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Manual service worker | next-pwa package | next-pwa deprecated for Next.js 16, causes middleware conflicts; manual setup gives full control |
| Manual service worker | Serwist | Requires webpack (Next.js 16 uses Turbopack by default); adds build complexity for 48h hackathon |
| React 19 Suspense | react-loading-skeleton | Suspense is native, more performant, better SSR integration; external library unnecessary |
| Manual manifest.json | next-manifest plugin | Next.js 16 has built-in manifest support via metadata API; no plugin needed |

**Installation:**

No additional packages required beyond current dependencies. Existing stack is complete for Phase 3 requirements.

**Version verification (as of 2026-03-28):**

```bash
npm view next version        # 16.2.1 (current stable)
npm view react version       # 19.2.4 (current stable)
npm view tailwindcss version # 4.2.2 (current stable)
npm view lucide-react version # 1.7.0 (current)
```

All versions verified as current and compatible.

## Architecture Patterns

### Recommended Project Structure

```
front/
├── app/
│   ├── layout.tsx              # PWA metadata, SW registration
│   ├── manifest.ts             # Web app manifest with share_target
│   ├── share/
│   │   └── page.tsx            # Share Target handler route
│   ├── results/
│   │   ├── page.tsx            # Results display (exists)
│   │   └── loading.tsx         # Multi-stage loading UI
│   └── api/
│       └── mastra/[...path]/   # Backend proxy (exists)
├── components/
│   ├── custom/                 # Analysis cards (exist)
│   ├── ui/                     # shadcn/ui primitives (exist)
│   └── loading/                # Skeleton components
├── hooks/
│   └── useFullAnalysis.ts      # Backend integration (exists)
├── lib/
│   └── types.ts                # Shared types (exists)
└── public/
    └── sw.js                   # Service worker for PWA
```

### Pattern 1: Web Share Target Configuration

**What:** Configure PWA to receive shared URLs from Android system share sheet

**When to use:** ING-01 requirement - Android share integration

**Example:**

```typescript
// app/manifest.ts
import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'BlindSpot',
    short_name: 'BlindSpot',
    description: 'Analyse contextuelle d\'articles de presse',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    share_target: {
      action: '/share',
      method: 'GET',
      params: {
        title: 'title',
        text: 'text',
        url: 'url',
      },
    },
  }
}
```

**Source:** [Next.js Metadata API](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/manifest), [MDN share_target](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/share_target)

### Pattern 2: Share Handler Route

**What:** Extract URL from share intent and redirect to analysis page

**When to use:** ING-01 - processing shared URLs

**Example:**

```typescript
// app/share/page.tsx
import { redirect } from 'next/navigation'

interface SharePageProps {
  searchParams: Promise<{
    url?: string
    text?: string
    title?: string
  }>
}

export default async function SharePage({ searchParams }: SharePageProps) {
  const params = await searchParams

  // Android may send URL in 'text' field instead of 'url' field
  const sharedUrl = params.url || params.text || ''

  // Validate URL format
  if (!sharedUrl || !sharedUrl.startsWith('http')) {
    redirect('/') // Fallback to home if invalid
  }

  // Redirect to results page with URL
  redirect(`/results?url=${encodeURIComponent(sharedUrl)}`)
}
```

**Source:** [Chrome Share Target API](https://developer.chrome.com/docs/capabilities/web-apis/web-share-target), Android transmits URLs in 'text' field per [W3C Web Share Target spec](https://w3c.github.io/web-share-target/)

### Pattern 3: Service Worker Registration

**What:** Client-side registration of service worker for PWA capabilities

**When to use:** PWA installability, offline support, background sync

**Example:**

```typescript
// components/pwa-register.tsx
'use client'

import { useEffect } from 'react'

export function PWARegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then(registration => {
          console.log('SW registered:', registration.scope)
        })
        .catch(err => {
          console.error('SW registration failed:', err)
        })
    }
  }, [])

  return null
}

// app/layout.tsx - add to body
import { PWARegister } from '@/components/pwa-register'

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        <PWARegister />
        {children}
      </body>
    </html>
  )
}
```

**Source:** [MDN Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers), registration must happen client-side

### Pattern 4: Multi-Stage Loading UI with Suspense

**What:** Progressive loading states showing pipeline stages

**When to use:** UI-01 - loading screen with progress stages

**Example:**

```typescript
// app/results/loading.tsx
export default function ResultsLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="space-y-4 text-center">
        <div className="space-y-2">
          <LoadingStage label="Analyse" status="active" />
          <LoadingStage label="Recherche" status="pending" />
          <LoadingStage label="Synthèse" status="pending" />
        </div>
      </div>
    </div>
  )
}

function LoadingStage({
  label,
  status
}: {
  label: string
  status: 'active' | 'complete' | 'pending'
}) {
  return (
    <div className="flex items-center gap-3">
      {status === 'active' && (
        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      )}
      {status === 'complete' && (
        <div className="w-4 h-4 bg-green-600 rounded-full" />
      )}
      {status === 'pending' && (
        <div className="w-4 h-4 bg-gray-300 rounded-full" />
      )}
      <span className={status === 'active' ? 'font-medium' : 'text-gray-500'}>
        {label}
      </span>
    </div>
  )
}
```

**Source:** [Next.js loading.js conventions](https://nextjs.org/docs/app/api-reference/file-conventions/loading)

### Pattern 5: Optimistic Score Display

**What:** Show bias score as first visual element using progressive enhancement

**When to use:** UI-02 - immediate visual feedback

**Example:**

```typescript
// components/custom/BiasScoreCard.tsx
import { Suspense } from 'react'

export function BiasScoreCard({ score }: { score: number }) {
  const color = score >= 66 ? 'red' : score >= 33 ? 'orange' : 'green'
  const colorClass = {
    red: 'bg-red-500 text-white',
    orange: 'bg-orange-500 text-white',
    green: 'bg-green-600 text-white'
  }[color]

  return (
    <div className={`rounded-lg p-6 text-center ${colorClass}`}>
      <div className="text-6xl font-bold">{score}</div>
      <div className="text-sm uppercase tracking-wide mt-2">
        Score de biais
      </div>
    </div>
  )
}

// Wrap in Suspense boundary for progressive rendering
export function BiasScoreSection({ promise }: { promise: Promise<any> }) {
  return (
    <Suspense fallback={<BiasScoreSkeleton />}>
      <BiasScoreContent promise={promise} />
    </Suspense>
  )
}
```

**Source:** [React 19 Suspense patterns](https://react.dev/reference/react/Suspense), [React concurrent rendering guide](https://www.sitepoint.com/react-server-components-streaming-performance-2026/)

### Pattern 6: Expandable Details Accordion

**What:** Collapsible sections for bias signal details

**When to use:** UI-03 - detailed bias information display

**Example:**

```typescript
// Using existing shadcn/ui Accordion component (Radix UI primitive)
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export function BiasDetails({ signals }: { signals: BiasSignal[] }) {
  return (
    <Accordion type="single" collapsible>
      {signals.map((signal, idx) => (
        <AccordionItem key={idx} value={`signal-${idx}`}>
          <AccordionTrigger>
            <div className="flex justify-between w-full">
              <span className="font-medium">{signal.bias}</span>
              <span className="text-sm text-gray-500">{signal.confidence}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <p className="text-sm text-gray-600">{signal.explanation}</p>
            {signal.excerpt && (
              <blockquote className="mt-2 border-l-4 border-gray-300 pl-4 italic text-sm">
                {signal.excerpt}
              </blockquote>
            )}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
```

**Source:** [shadcn/ui Accordion](https://ui.shadcn.com/docs/components/accordion), built on Radix UI primitives with accessibility

### Anti-Patterns to Avoid

- **Loading waterfalls:** Don't create sequential Suspense boundaries for parallel data - causes components to load one-by-one instead of simultaneously
- **Blocking manifest.json/sw.js:** Ensure middleware doesn't intercept PWA files (add exclusions to middleware matcher)
- **navigator.onLine reliance:** navigator.onLine is unreliable (false positives); always implement fetch retry with timeout
- **Empty Suspense fallbacks:** Always provide meaningful skeleton UI; empty fallback causes layout shift
- **Popcorn effect:** Too many Suspense boundaries (>5) creates jarring rapid content flashes; group related content

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Accessible UI primitives | Custom dropdowns, modals, accordions | Radix UI (via shadcn/ui) | ARIA roles, keyboard nav, focus management, screen reader support - easy to get wrong |
| Service worker caching | Custom cache strategies from scratch | Workbox library | Handles cache versioning, stale-while-revalidate, precaching, expiration policies - complex edge cases |
| Offline detection | navigator.onLine polling | Workbox + fetch retry with timeout | navigator.onLine has false positives; need actual network probe |
| Form loading states | Manual isLoading flags | React 19 useActionState | Tracks pending/error/success states automatically, handles race conditions |
| Icon library | SVG sprite management | lucide-react (already installed) | 1000+ consistent icons, tree-shakeable, typed |
| Utility class composition | String concatenation for variants | class-variance-authority (already installed) | Type-safe variant management, prevents class conflicts |

**Key insight:** PWA development has numerous browser compatibility pitfalls (service worker lifecycle, manifest parsing, iOS vs Android differences, cache invalidation). Using battle-tested libraries (Workbox, Radix UI) avoids months of debugging obscure edge cases.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Next.js | Full app framework | ✓ | 16.2.1 | — |
| React | UI library | ✓ | 19.2.4 | — |
| Node.js | Build + runtime | ✓ | >=22.13.0 (per mastra engine requirement) | — |
| npm | Package management | ✓ | Latest | — |
| Tailwind CSS | Styling | ✓ | 4.2.2 | — |
| TypeScript | Type safety | ✓ | 5.x | — |
| shadcn/ui | Component primitives | ✓ | Radix UI 1.4.3 | — |
| Mastra backend | Analysis API | ✓ | Running on :4111 (dev) or MASTRA_URL (prod) | — |

**Missing dependencies with no fallback:**

None - all required dependencies are installed and verified.

**Missing dependencies with fallback:**

None - environment is complete for Phase 3 implementation.

## Common Pitfalls

### Pitfall 1: Share Target Only Works When Installed

**What goes wrong:** Users attempt to share to app before adding to home screen; share target doesn't appear in Android share sheet

**Why it happens:** Web Share Target API requires PWA to meet installability criteria AND be installed by user; browser shows install prompt only after engagement signals

**How to avoid:**
- Ensure manifest.json has all required fields (name, icons, start_url, display)
- Add "Add to Home Screen" prompt with beforeinstallprompt event handler
- Test install flow before testing share target
- Document install requirement for users/testers

**Warning signs:** Share target option never appears in Android share sheet; no install prompt shown

**Source:** [Chrome Web Share Target docs](https://developer.chrome.com/docs/capabilities/web-apis/web-share-target) - "Before a user can share to your app, they must add it to their home screen"

### Pitfall 2: Android URL Sharing Edge Cases

**What goes wrong:** Share handler receives empty URL or malformed data; URL appears in 'text' field instead of 'url' field

**Why it happens:** Android's share system doesn't have dedicated URL field; some apps send URL in 'text', others in 'title', format varies by source app

**How to avoid:**
- Check all three fields: params.url || params.text || params.title
- Validate URL format with regex before redirecting
- Handle URL extraction from plain text (e.g., "Check this out: https://...")
- Log incoming share params during testing to see actual Android behavior

**Warning signs:** Share works from browser but fails from Twitter/Reddit/other apps; mysterious empty shares

**Source:** [W3C Web Share Target Native Integration](https://github.com/w3c/web-share-target/blob/main/docs/native.md) - Android URL field limitations

### Pitfall 3: Service Worker Cache Invalidation Hell

**What goes wrong:** Users stuck on old version after deployment; cached service worker serves stale HTML/JS; hard refresh required

**Why it happens:** Service worker aggressive caching + browser caches service worker file itself; no atomic update mechanism

**How to avoid:**
- Set Cache-Control: no-cache on sw.js file
- Implement skipWaiting() + clients.claim() in service worker
- Add update notification UI when new version detected
- Use cache versioning (e.g., 'v1-cache', 'v2-cache')
- Test update flow explicitly during development

**Warning signs:** Code changes don't appear after deployment; different users see different versions; "works on my machine" with hard refresh

**Source:** [MDN Service Worker lifecycle](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers#updating_your_service_worker), lifecycle state machine is complex

### Pitfall 4: Loading State Waterfalls

**What goes wrong:** Loading stages show sequentially instead of representing actual pipeline progress; perceived performance worse than spinners

**Why it happens:** React 19 Suspense loads sibling components sequentially by default (waterfall pattern); without explicit parallelization, components wait for previous to complete

**How to avoid:**
- Use single Suspense boundary for parallel data fetches
- Don't create nested Suspense for independent data
- Show accurate pipeline stages (Mastra workflow provides real progress via streaming)
- Limit Suspense boundaries to 2-3 max (avoid popcorn effect)

**Warning signs:** Loading stages don't match actual backend workflow timing; UI feels slower than simple spinner

**Source:** [9 React 19 Suspense Patterns That Reduce Waterfalls](https://medium.com/@sparknp1/9-react-19-suspense-patterns-that-reduce-waterfalls-d1449512887c)

### Pitfall 5: Middleware Blocking PWA Files

**What goes wrong:** manifest.json returns 404 or sw.js fails to register; Chrome refuses to install PWA

**Why it happens:** Next.js middleware intercepts all requests by default; PWA files need direct serving from public/ or app/ directories

**How to avoid:**
- Exclude PWA files in middleware matcher: `matcher: ['/((?!api|_next/static|_next/image|favicon.ico|manifest.json|sw.js).*)']`
- Test manifest.json loads at /manifest.json (not /manifest)
- Verify sw.js serves with correct Content-Type: application/javascript
- Check browser DevTools > Application > Manifest for errors

**Warning signs:** Install prompt never appears; manifest errors in DevTools; service worker registration fails silently

**Source:** [Next.js middleware matcher patterns](https://nextjs.org/docs/app/guides/progressive-web-apps), common PWA setup issue

### Pitfall 6: Optimistic UI Without Error Rollback

**What goes wrong:** User sees success state but backend failed; no way to recover; data inconsistency

**Why it happens:** useOptimistic updates UI immediately but doesn't automatically revert on error; requires manual error handling

**How to avoid:**
- Always pair useOptimistic with useActionState for error tracking
- Implement error boundaries around optimistic updates
- Show error toast + revert UI state on failure
- Test error paths explicitly (network offline, 500 errors)

**Warning signs:** UI shows success but data not saved; refresh reveals discrepancy; no user feedback on errors

**Source:** [React 19 useOptimistic docs](https://react.dev/reference/react/useOptimistic) - reconciliation with real result required

## Code Examples

Verified patterns from official sources:

### Service Worker with Update Notification

```javascript
// public/sw.js
const CACHE_NAME = 'blindspot-v1'
const urlsToCache = [
  '/',
  '/offline',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting()) // Activate immediately
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        )
      })
      .then(() => self.clients.claim()) // Take control immediately
  )
})

self.addEventListener('fetch', (event) => {
  // Network-first for API calls
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match('/offline'))
    )
    return
  }

  // Cache-first for static assets
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  )
})
```

**Source:** [MDN Service Worker patterns](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Offline_and_background_operation)

### React 19 Error Boundary with Suspense

```typescript
// components/error-boundary.tsx
'use client'

import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 bg-red-50 border border-red-200 rounded">
          <h2 className="text-red-800 font-bold">Erreur</h2>
          <p className="text-red-600 text-sm">{this.state.error?.message}</p>
        </div>
      )
    }

    return this.props.children
  }
}

// Usage with Suspense
<ErrorBoundary fallback={<ErrorDisplay />}>
  <Suspense fallback={<LoadingSkeleton />}>
    <AnalysisResults url={url} />
  </Suspense>
</ErrorBoundary>
```

**Source:** [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)

### Metadata for PWA

```typescript
// app/layout.tsx
import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'BlindSpot',
  description: 'Analyse contextuelle d\'articles de presse',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'BlindSpot',
  },
}

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
}
```

**Source:** [Next.js Metadata API](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)

### Streaming Results with Progressive Enhancement

```typescript
// app/results/page.tsx
import { Suspense } from 'react'
import { BiasScoreSkeleton, BiasScoreCard } from '@/components/bias-score'
import { DetailsSkeleton, DetailsPanel } from '@/components/details'

async function getAnalysis(url: string) {
  const res = await fetch(`/api/mastra/workflows/full-article-analysis/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ inputData: { url } }),
  })
  return res.json()
}

export default async function ResultsPage({
  searchParams
}: {
  searchParams: Promise<{ url?: string }>
}) {
  const { url } = await searchParams
  if (!url) redirect('/')

  const analysisPromise = getAnalysis(url)

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* First render: Score appears immediately (highest priority) */}
      <Suspense fallback={<BiasScoreSkeleton />}>
        <BiasScoreCard promise={analysisPromise} />
      </Suspense>

      {/* Second render: Details stream in after score */}
      <Suspense fallback={<DetailsSkeleton />}>
        <DetailsPanel promise={analysisPromise} />
      </Suspense>
    </div>
  )
}
```

**Source:** [Next.js Streaming guide](https://nextjs.org/learn/dashboard-app/streaming), [React Server Components streaming](https://www.sitepoint.com/react-server-components-streaming-performance-2026/)

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| next-pwa package | Manual service worker + Workbox | 2026 Q1 | next-pwa incompatible with Next.js 16 App Router, causes middleware conflicts |
| Individual @radix-ui/react-* packages | Unified radix-ui package | Feb 2026 | Cleaner package.json, simpler upgrades, single version to track |
| Manual loading states | React 19 Suspense + useActionState | Dec 2024 (React 19 stable) | Declarative loading, automatic error handling, less boilerplate |
| Webpack for PWA | Turbopack default (or manual SW without bundler plugin) | Next.js 15+ | Faster builds, simpler config, PWA via metadata API |
| navigator.onLine polling | Workbox background sync + fetch retry | Ongoing best practice | More reliable offline detection, handles partial connectivity |

**Deprecated/outdated:**

- **next-pwa**: Officially unmaintained for Next.js 16; use manual service worker registration
- **Individual Radix packages**: Use unified `radix-ui` package as of Feb 2026 shadcn/ui update
- **Legacy manifest plugins**: Next.js 16 has built-in manifest.json support via metadata API
- **Manual loading state management**: React 19 useActionState + Suspense eliminate need for isLoading/hasError flags

## Open Questions

1. **Progressive Stage Indicators During Backend Processing**
   - What we know: Mastra workflow is fully parallel (7 steps run simultaneously after fetch)
   - What's unclear: How to show accurate "Analyse → Recherche → Synthèse" stages when steps actually run in parallel
   - Recommendation: Show simulated stages based on time elapsed (0-2s: Analyse, 2-5s: Recherche, 5s+: Synthèse) OR use single "Analyse en cours" state with spinner

2. **Offline Caching Strategy for Analysis Results**
   - What we know: Project is stateless by design (no persistence)
   - What's unclear: Should service worker cache completed analyses for offline viewing? Or strict no-cache for privacy?
   - Recommendation: Cache analysis results in service worker with short TTL (5 minutes), prompt user to clear cache on close; balances offline UX with privacy commitment

3. **iOS Share Extension Timeline**
   - What we know: v1 is Android-only via PWA Share Target; iOS deferred to v2 (requirements IOS-01, IOS-02)
   - What's unclear: Timeline for iOS support, Safari Share Extension complexity
   - Recommendation: Out of scope for Phase 3; validate Android flow thoroughly before expanding to iOS

## Sources

### Primary (HIGH confidence)

- [Next.js Official Docs - PWA Guide](https://nextjs.org/docs/app/guides/progressive-web-apps) - Official Next.js 16 PWA guidance
- [Next.js Metadata API - manifest.json](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/manifest) - Built-in manifest support
- [MDN Web Share Target API](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/share_target) - share_target specification
- [W3C Web Share Target Spec](https://w3c.github.io/web-share-target/) - Official specification
- [Chrome Web Share Target Guide](https://developer.chrome.com/docs/capabilities/web-apis/web-share-target) - Android implementation details
- [React 19 Official Docs - Suspense](https://react.dev/reference/react/Suspense) - Loading state patterns
- [React 19 Official Docs - useActionState](https://react.dev/reference/react/useActionState) - Form handling
- [React 19 Official Docs - useOptimistic](https://react.dev/reference/react/useOptimistic) - Optimistic updates
- [shadcn/ui Installation](https://ui.shadcn.com/docs/installation) - Component library setup
- [shadcn/ui Changelog - Radix UI](https://ui.shadcn.com/docs/changelog/2026-02-radix-ui) - Feb 2026 unified package update
- [MDN Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers) - Service worker lifecycle

### Secondary (MEDIUM confidence)

- [Build with Matija - Next.js 16 PWA](https://www.buildwithmatija.com/blog/turn-nextjs-16-app-into-pwa) - Next.js 16 PWA tutorial
- [LogRocket - Next.js 16 PWA Offline Support](https://blog.logrocket.com/nextjs-16-pwa-offline-support/) - Offline strategies
- [SitePoint - React Server Components Streaming 2026](https://www.sitepoint.com/react-server-components-streaming-performance-2026/) - Streaming performance
- [Medium - React 19 Suspense Waterfalls](https://medium.com/@sparknp1/9-react-19-suspense-patterns-that-reduce-waterfalls-d1449512887c) - Performance patterns
- [freeCodeCamp - React 19 Hooks](https://www.freecodecamp.org/news/react-19-new-hooks-explained-with-examples/) - useActionState examples
- [Digital Applied - PWA Performance Guide 2026](https://www.digitalapplied.com/blog/progressive-web-apps-2026-pwa-performance-guide) - PWA best practices

### Tertiary (LOW confidence)

None - all critical findings verified with official sources.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All versions verified via npm registry, current installations confirmed
- Architecture: HIGH - Patterns from official Next.js/React docs + existing working code in repo
- Pitfalls: MEDIUM-HIGH - Mix of official docs (service worker lifecycle) and community experience (middleware blocking)
- Share Target: HIGH - Official W3C spec + Chrome implementation guide + MDN docs
- Performance: MEDIUM - Official streaming docs but simulated stage indicators require testing

**Research date:** 2026-03-28
**Valid until:** 2026-04-28 (30 days - stable ecosystem, Next.js 16 current stable)

**Notes:**
- Existing frontend is well-scaffolded; primary work is PWA configuration + loading UX
- Backend integration hook (useFullAnalysis) already functional and tested
- No blocking dependencies; all required packages installed and verified
- Performance targets (<3s first screen, <5s complete) achievable with streaming SSR + Suspense
- Share Target requires user install step (Chrome requirement) - must be communicated clearly
