# UI Specification: Phase 3 - Frontend & Integration

**Phase:** 3 - Frontend & Integration
**Status:** draft
**Created:** 2026-03-28
**Design System:** shadcn/ui + Tailwind CSS v4

## Executive Summary

This specification defines the visual design, component structure, interactions, and responsive behavior for the BlindSpot PWA frontend. The design prioritizes speed (<3s first screen), visual clarity (color-coded bias scores), and progressive enhancement (multi-stage loading). All components build on the existing shadcn/ui design system with Tailwind CSS v4 and oklch color tokens.

## 1. Visual Design System

### 1.1 Color Palette

**Base Colors** (from globals.css):
- Background: `oklch(1 0 0)` (white) / Dark: `oklch(0.145 0 0)`
- Foreground: `oklch(0.145 0 0)` (near-black) / Dark: `oklch(0.985 0 0)`
- Card: `oklch(1 0 0)` (white) / Dark: `oklch(0.205 0 0)`
- Muted: `oklch(0.97 0 0)` (light gray) / Dark: `oklch(0.269 0 0)`

**Semantic Colors for Bias Scores**:

| Bias Score Range | Color | Tailwind Class | Visual Intent |
|-----------------|-------|----------------|---------------|
| 0-40 (Low) | Green | `bg-green-500` / `bg-green-600` | Safe, minimal bias detected |
| 41-65 (Medium) | Orange | `bg-orange-400` / `bg-orange-500` | Caution, moderate bias signals |
| 66-100 (High) | Red | `bg-red-500` / `bg-red-600` | Alert, significant bias detected |

**Confidence Level Colors** (from CognitiveBiasCard):
- Low confidence: `bg-green-50 text-green-700`
- Medium confidence: `bg-orange-50 text-orange-700`
- High confidence: `bg-red-50 text-red-700`

**Interactive States**:
- Primary: `oklch(0.205 0 0)` (dark gray/black)
- Hover: `hover:text-blue-600`, `hover:underline`
- Focus: `outline-ring/50` (from globals.css base layer)
- Border: `oklch(0.922 0 0)` (light gray)

**Reserved Color Usage**:
- Green/Orange/Red: ONLY for bias scores and confidence levels
- Blue: External links, interactive elements (hover states)
- Gray scale: Structural elements, text hierarchy, borders

### 1.2 Typography

**Font Stack**:
- Sans: `var(--font-sans)` (system default, set in globals.css)
- Mono: `var(--font-geist-mono)` (for code/data display)
- Heading: `var(--font-sans)` (same as body)

**Type Scale**:

| Element | Size | Weight | Line Height | Usage |
|---------|------|--------|-------------|-------|
| Hero H1 | `text-4xl` (36px) | `font-bold` (700) | Default | Page titles, article headlines |
| Section H2 | `text-sm` (14px) | `font-medium` (500) | Default | Card titles, section headers |
| Body | `text-xs` (12px) | `font-normal` (400) | `leading-relaxed` (1.625) | Card content, descriptions |
| Small | `text-[10px]` | `font-medium` (500) | `leading-snug` (1.375) | Labels, badges, metadata |
| Score Display | `text-6xl` (60px) | `font-bold` (700) | Default | Bias score number (first visual element) |

**Weight Variants**:
- Regular (400): Body text, descriptions
- Medium (500): Labels, card titles, emphasis
- Semibold (600): Signal names, important metadata
- Bold (700): Headlines, scores, primary emphasis

### 1.3 Spacing System

**Base Scale** (8-point grid):
- `gap-1`: 4px (tight spacing within components)
- `gap-2`: 8px (default component spacing)
- `gap-3`: 12px (list item spacing)
- `gap-4`: 16px (card spacing)
- `gap-8`: 32px (section spacing)

**Component Spacing**:
- Card padding: `p-3` (12px) for content, `p-6` (24px) for headers
- Screen padding: `px-4` (16px) mobile, `max-w-[66%] mx-auto` desktop
- Vertical rhythm: `space-y-4` (16px) for related sections

**Touch Targets**:
- Minimum: 44x44px (iOS/Android standard)
- Button height: `h-10` (40px) + padding meets minimum
- Card clickable area: Full card surface (no minimum, card size sufficient)

### 1.4 Border Radius

**From globals.css** (`--radius: 0.625rem` = 10px):
- `rounded-sm`: 6px (small elements, badges)
- `rounded-md`: 8px (inputs, buttons)
- `rounded-lg`: 10px (cards, dialogs)
- `rounded-xl`: 14px (large cards)
- `rounded-full`: 9999px (circular indicators, badges)

**Applied**:
- Cards: `rounded-xl` (14px)
- Buttons: `rounded-md` (8px)
- Input fields: `rounded-md` (8px)
- Score gauge bar: `rounded-full`
- Confidence badges: `rounded-full`

### 1.5 Shadows & Elevation

**From shadcn/ui defaults**:
- Cards: Default border (`border border-gray-100`) + `bg-gray-50` for subtle elevation
- Hover: No shadow changes (border color/text color changes only)
- Modals/Dialogs: Default shadcn/ui dialog shadows (not customized)

## 2. Screen Specifications

### 2.1 Home Screen (/)

**Layout Structure**:
```
┌─────────────────────────────────────┐
│  [Hero: Welcome Message]            │ <- Placeholder (minimal in Phase 3)
│  [Analyser un article Button]       │
└─────────────────────────────────────┘
```

**Component Hierarchy**:
- `app/page.tsx`
  - `div.flex.flex-col` (centered layout)
    - `h1` - "Welcome to the App"
    - `p` - Description
    - `Button` - "Analyser un article" → navigates to `/search`

**State Variations**:
- Default: Static content only
- Installed PWA: May show "Share from browser" hint (future enhancement)

**Responsive**:
- Mobile/Desktop: Same layout (centered, full viewport height)

**Notes**:
- This screen is minimal in Phase 3; main entry is `/search` or Share Target
- Button navigates to `/search` page for manual URL entry

### 2.2 Search Screen (/search)

**Layout Structure**:
```
┌─────────────────────────────────────┐
│  [Page Title]                       │
│  [URL Input Field + Submit Button]  │
│  ─────────────────                  │
│  Exemples                           │
│  [Example Article Card 1]           │
│  [Example Article Card 2]           │
│  [Example Article Card 3]           │
└─────────────────────────────────────┘
```

**Component Hierarchy**:
- `app/search/page.tsx`
  - `div.max-w-2xl.mx-auto.px-4` (container)
    - `h1.text-4xl` - "Un meilleur contexte pour tous vos articles de presse."
    - `SearchInput` component
    - Example section:
      - `p.text-sm.text-gray-500` - "Exemples"
      - `ExampleArticleCard[]` (mapped list)

**Components Used**:
- `SearchInput`: URL input + submit button
- `ExampleArticleCard`: Clickable cards with article metadata

**Responsive**:
- Mobile: `max-w-2xl` container, `px-4` padding
- Tablet/Desktop: Same (design is mobile-first, scales naturally)

**Notes**:
- This is the manual entry point (not Share Target)
- Example cards demonstrate the app with pre-loaded analysis
- On submit: navigates to `/results?url={encoded_url}`

### 2.3 Share Handler Screen (/share)

**NEW in Phase 3** - Handles Android Share Target intents

**Layout Structure**:
```
┌─────────────────────────────────────┐
│  [Loading indicator]                │
│  "Redirection vers l'analyse..."    │
└─────────────────────────────────────┘
```

**Component Hierarchy**:
- `app/share/page.tsx` (Server Component)
  - Extracts `searchParams: { url?, text?, title? }`
  - Validates URL format
  - `redirect('/results?url={url}')` immediately

**State Variations**:
- Loading: Brief flash before redirect (unavoidable)
- Invalid URL: Redirect to `/` (home) as fallback

**Responsive**:
- N/A (redirect happens server-side, no visible UI)

**Implementation Notes**:
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

  // Android sends URL in 'text' field per Web Share Target spec
  const sharedUrl = params.url || params.text || ''

  // Validate URL
  if (!sharedUrl || !sharedUrl.startsWith('http')) {
    redirect('/')
  }

  // Redirect to results
  redirect(`/results?url=${encodeURIComponent(sharedUrl)}`)
}
```

### 2.4 Loading Screen (Multi-Stage Progress)

**NEW in Phase 3** - Progressive loading states for analysis pipeline

**Layout Structure**:
```
┌─────────────────────────────────────┐
│                                     │
│         [Stage Indicator 1] ●       │ <- Active (spinning)
│         [Stage Indicator 2] ○       │ <- Pending (gray)
│         [Stage Indicator 3] ○       │ <- Pending (gray)
│                                     │
└─────────────────────────────────────┘
```

**Component Hierarchy**:
- `app/results/loading.tsx` (Suspense fallback)
  - `div.min-h-screen.flex.items-center.justify-center`
    - `div.space-y-4.text-center`
      - `LoadingStage` × 3 (Analyse, Recherche, Synthèse)

**LoadingStage Component**:
```typescript
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

**Stage Labels**:
1. "Analyse" - Article extraction and initial analysis
2. "Recherche" - Alternative source search
3. "Synthèse" - Final synthesis and bias scoring

**Timing (simulated)**:
- 0-2s: Analyse (active)
- 2-5s: Recherche (active) after Analyse complete
- 5s+: Synthèse (active) after Recherche complete

**Notes**:
- Backend pipeline is fully parallel (not sequential)
- Stages are simulated for UX clarity (user mental model)
- First screen target: <3s (loading screen itself renders immediately)

### 2.5 Results Screen (/results)

**Layout Structure**:
```
┌─────────────────────────────────────┐
│  [Hero Video Background]            │ <- 256px height
│  ─────────────────────────────────  │
│  Analyse de votre article           │ <- Section label
│  [Article Title]                    │ <- Large, bold
│                                     │
│  [Bias Score Card] ← FIRST VISUAL   │ <- Priority 1
│  ─────────────────────────────────  │
│  [Synthesis Card (full width)]      │
│  [Summary Card (full width)]        │
│                                     │
│  [BlindSpots]  [Cognitive Bias]     │ <- 2-column grid
│                                     │
│  [Other Media] [Media Sources]      │ <- 2-column grid
│                                     │
│  [Entities Card]                    │
└─────────────────────────────────────┘
```

**Component Hierarchy**:
- `app/results/page.tsx`
  - Hero section:
    - `video` (autoplay, muted, loop) - `/bg-video-hd.mp4`
    - Gradient overlay: `bg-linear-to-t from-gray-50 via-gray-50/60`
  - Content section:
    - `div.max-w-[66%].mx-auto.px-4.py-8` (container)
      - Section header (label + title)
      - Conditional render:
        - Example article: `ArticleContent` + `AnalysisCards`
        - Real URL: `UrlAnalysisCards`

**AnalysisCards Layout** (2-column grid):
```typescript
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  {/* Full width cards */}
  <div className="sm:col-span-2">
    <SynthesisCard />
  </div>
  <div className="sm:col-span-2">
    <SummaryCard />
  </div>

  {/* 2-column cards */}
  <BlindSpotsCard />
  <CognitiveBiasCard />

  {/* Nested 2-column grid */}
  <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
    <OtherMediaCard />
    <MediaCard />
  </div>

  <EntitiesCard />
</div>
```

**Responsive Breakpoints**:
- Mobile (<640px): Single column, `grid-cols-1`
- Desktop (≥640px): Two columns, `sm:grid-cols-2`

**State Variations**:
1. **Initial Load**: Shows `loading.tsx` with multi-stage progress
2. **Streaming Results**: Cards populate progressively via Suspense
3. **Complete**: All cards rendered with final data
4. **Error**: Individual card error states (red text, retry option)

**Priority Rendering Order** (via Suspense boundaries):
1. Bias Score Card (first visual element, highest priority)
2. Synthesis Card (summary of analysis)
3. Remaining cards (parallel stream)

## 3. Component Catalog

### 3.1 BiasScoreCard (NEW Component)

**Visual Appearance**:
```
┌─────────────────────────────────────┐
│                                     │
│              [75]                   │ <- 60px, bold, color-coded
│          Score de biais             │ <- 14px, uppercase
│                                     │
└─────────────────────────────────────┘
```

**Props Interface**:
```typescript
interface BiasScoreCardProps {
  score: number // 0-100
}
```

**Color Coding Logic**:
```typescript
const color = score >= 66 ? 'red' : score >= 33 ? 'orange' : 'green'
const colorClass = {
  red: 'bg-red-500 text-white',
  orange: 'bg-orange-500 text-white',
  green: 'bg-green-600 text-white'
}[color]
```

**Implementation**:
```typescript
export function BiasScoreCard({ score }: BiasScoreCardProps) {
  const color = score >= 66 ? 'red' : score >= 33 ? 'orange' : 'green'
  const colorClass = {
    red: 'bg-red-500 text-white',
    orange: 'bg-orange-500 text-white',
    green: 'bg-green-600 text-white'
  }[color]

  return (
    <div className={`rounded-lg p-6 text-center ${colorClass}`}>
      <div className="text-6xl font-bold tabular-nums">{score}</div>
      <div className="text-sm uppercase tracking-wide mt-2">
        Score de biais
      </div>
    </div>
  )
}
```

**States**:
- Default: Color-coded background, white text
- Loading: Skeleton with `animate-pulse` gray background
- Error: Red background, error icon + text

**Accessibility**:
- `role="status"` for screen readers
- `aria-label="Score de biais: {score} sur 100"`
- Color + text label (not color alone) for accessibility

**Location**: `front/components/custom/BiasScoreCard.tsx`

### 3.2 ScoreGauge (Existing Component)

**Visual Appearance** (from CognitiveBiasCard):
```
[████████████░░░░░░░░] 65
```

**Props Interface**:
```typescript
interface ScoreGaugeProps {
  score: number // 0-100
}
```

**Implementation** (existing):
```typescript
function ScoreGauge({ score }: { score: number }) {
  const color =
    score <= 40 ? "bg-green-500"
      : score <= 65 ? "bg-orange-400"
      : "bg-red-500"

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-sm font-semibold tabular-nums w-8 text-right">
        {score}
      </span>
    </div>
  )
}
```

**Usage**: Inside CognitiveBiasCard to show global bias score
**Location**: `front/components/custom/analysis/CognitiveBiasCard.tsx`

### 3.3 CognitiveBiasCard (Existing Component)

**Visual Appearance**:
```
┌─────────────────────────────────────┐
│ Biais cognitifs                     │
├─────────────────────────────────────┤
│ Score de biais                      │
│ [████████████░░░░░░░░] 65           │
│                                     │
│ [Summary text in bordered sidebar]  │
│                                     │
│ ┌─ Signal 1 ──────────────────┐    │
│ │ [Bias Name] [Confidence] ● │    │
│ │ [Excerpt italic]            │    │
│ │ [Explanation]               │    │
│ └────────────────────────────┘    │
│ [... more signals]                 │
└─────────────────────────────────────┘
```

**Props Interface**:
```typescript
interface CognitiveBiasCardProps {
  cognitiveBias?: CognitiveBiasResult
  status: 'idle' | 'loading' | 'success' | 'error'
  error?: string | null
}

interface CognitiveBiasResult {
  globalScore: number
  summary: string
  signals: BiasSignal[]
}

interface BiasSignal {
  bias: string // Signal name
  family: BiasFamily // Category
  confidence: 'low' | 'medium' | 'high'
  explanation: string
  excerpt?: string // Optional quote from article
}
```

**States**:
- Idle: "En attente…" (gray text)
- Loading: "Chargement…" (gray, pulsing)
- Success: Score gauge + summary + scrollable signal list
- Error: Red error text

**Interaction**:
- Signals list scrollable: `max-h-[360px] overflow-y-auto`
- No expand/collapse (always visible)

**Accessibility**:
- Confidence badges use text labels (not just color)
- Semantic HTML: `<div>` structure with proper heading hierarchy
- Scrollable region has focus trap for keyboard nav

**Location**: `front/components/custom/analysis/CognitiveBiasCard.tsx`

### 3.4 OtherMediaCard (Existing Component)

**Visual Appearance**:
```
┌─────────────────────────────────────┐
│ Autres médias                       │
├─────────────────────────────────────┤
│ [🔗] Article Title 1                │
│      Le Monde                       │
│                                     │
│ [🔗] Article Title 2                │
│      Le Figaro                      │
│                                     │
│ [🔗] Article Title 3                │
│      Libération                     │
└─────────────────────────────────────┘
```

**Props Interface**:
```typescript
interface OtherMediaCardProps {
  otherMedia?: OtherMediaArticle[]
  status: 'idle' | 'loading' | 'success' | 'error'
  error?: string | null
}

interface OtherMediaArticle {
  title: string
  url: string
  media: string // Source name
}
```

**Interaction**:
- Each article is a link: `<a href={url} target="_blank" rel="noopener noreferrer">`
- Hover: Blue text + underline on title
- ExternalLink icon (lucide-react) changes to blue on hover
- Full card clickable area (no minimum touch target issue)

**States**:
- Idle: "En attente…"
- Loading: "Chargement…" (pulsing)
- Success: List of 2-3 article links
- Error: Red error message

**Accessibility**:
- `target="_blank"` always paired with `rel="noopener noreferrer"`
- External link icon provides visual cue (screen reader announces "opens in new window")

**Location**: `front/components/custom/analysis/OtherMediaCard.tsx`

### 3.5 AnimatedCardContent (Existing Component)

**Purpose**: Smooth fade-in transitions when card content changes state

**Props Interface**:
```typescript
interface AnimatedCardContentProps {
  contentKey: string | number // Changes trigger animation
  children: React.ReactNode
}
```

**Implementation**:
```typescript
// Wraps card content, fades in/out on contentKey change
// Uses CSS transition or framer-motion (implementation TBD)
```

**Usage**:
```typescript
<AnimatedCardContent contentKey={status}>
  {status === 'loading' && <LoadingSpinner />}
  {status === 'success' && <ActualContent />}
</AnimatedCardContent>
```

**Location**: `front/components/custom/AnimatedCardContent.tsx`

### 3.6 SearchInput (Existing Component)

**Visual Appearance**:
```
┌─────────────────────────────────────┐
│ https://example.com/article    [→] │
└─────────────────────────────────────┘
```

**Props Interface**:
```typescript
interface SearchInputProps {
  onSubmit: (url: string) => void
}
```

**Implementation**:
- Input field: `<input type="url" placeholder="https://...">`
- Submit button: `<Button type="submit">` with arrow icon
- Form validation: URL format check before onSubmit

**States**:
- Default: Empty input, gray border
- Focus: Blue ring (from `outline-ring/50`)
- Filled: Dark text
- Error: Red border (if invalid URL format)

**Accessibility**:
- Label: "Collez l'URL de votre article" (visually hidden or above input)
- Input type="url" for mobile keyboard optimization
- Required field validation

**Location**: `front/components/custom/SearchInput.tsx`

### 3.7 ExampleArticleCard (Existing Component)

**Visual Appearance**:
```
┌─────────────────────────────────────┐
│ [Article Title]                     │
│ Le Monde • Author 1, Author 2       │
└─────────────────────────────────────┘
```

**Props Interface**:
```typescript
interface ExampleArticleCardProps {
  title: string
  source: string
  authors: string[]
  onClick: () => void
}
```

**States**:
- Default: Light background, gray border
- Hover: Border color darkens, cursor pointer
- Focus: Blue ring outline

**Accessibility**:
- Clickable div with `role="button"` or wrapped in `<button>`
- `tabindex="0"` for keyboard navigation
- Enter/Space triggers onClick

**Location**: `front/components/custom/ExampleArticleCard.tsx`

### 3.8 Card Skeleton (Loading State)

**Visual Appearance**:
```
┌─────────────────────────────────────┐
│ [Pulsing gray rectangle]            │
│ h-32 (128px)                        │
└─────────────────────────────────────┘
```

**Implementation** (from AnalysisCardsLoader):
```typescript
Array.from({ length: 6 }).map((_, i) => (
  <div
    key={i}
    className="rounded-xl border bg-card animate-pulse h-32"
  />
))
```

**Usage**: Fallback for dynamic imports or Suspense boundaries
**Location**: Inline in `AnalysisCardsLoader.tsx`

## 4. Interaction Patterns

### 4.1 Loading States (Multi-Stage)

**Strategy**: Progressive disclosure with Suspense boundaries

**Pattern**:
1. User triggers analysis (Share Target or manual submit)
2. Immediate redirect to `/results?url={url}`
3. `loading.tsx` renders multi-stage progress (0-3s)
4. Results page streams in via Suspense:
   - Bias Score Card appears first (highest priority)
   - Other cards populate progressively

**Implementation**:
```typescript
// app/results/page.tsx
<Suspense fallback={<BiasScoreSkeleton />}>
  <BiasScoreCard promise={analysisPromise} />
</Suspense>

<Suspense fallback={<CardsSkeleton />}>
  <AnalysisCards promise={analysisPromise} />
</Suspense>
```

**Stage Simulation** (for loading.tsx):
- No real-time backend progress events in Phase 3
- Simulate stages based on elapsed time (setInterval)
- Backend is fully parallel, but UX shows sequential stages for clarity

### 4.2 Error Handling

**Levels**:
1. **Network Failure**: Toast notification + retry button
2. **Invalid URL**: Redirect to `/` from share handler
3. **Analysis Timeout**: Show partial results if available
4. **Individual Card Failure**: Red error text in card, other cards continue

**Error Display** (per card):
```typescript
{status === 'error' && (
  <p className="text-xs text-red-500">{error}</p>
)}
```

**Toast Pattern** (from use-toast hook):
- Top-right corner
- Auto-dismiss after 5s
- Dismiss button (X icon)
- Error icon + message

**Retry Strategy**:
- No automatic retry (to avoid API quota waste)
- Manual retry button in error cards (future enhancement)
- User can refresh page to retry full analysis

### 4.3 Transitions & Animations

**Allowed Animations**:
1. **Loading spinner**: `animate-spin` on border (loading indicators)
2. **Pulse**: `animate-pulse` on skeleton cards
3. **Fade in**: `AnimatedCardContent` smooth opacity transition
4. **Hover states**: `transition-colors` on links/buttons

**Prohibited Animations**:
- No slide-in/slide-out (causes layout shift)
- No fade-in on initial page load (delays perceived performance)
- No scale transforms (accessibility issues)

**Performance Budget**:
- Max 3 concurrent animations (loading stages = 3 spinners max)
- No animations longer than 300ms
- CSS animations only (no JS-based tweens)

### 4.4 Touch Targets & Gestures

**Minimum Touch Target**: 44x44px (iOS/Android guideline)

**Components**:
- Buttons: `h-10` (40px) + `px-4` (16px) = 40x56px minimum ✓
- Cards: Full card clickable (>100px height) ✓
- Links: Text + icon, line-height provides sufficient height ✓
- Stage indicators: Visual only, not interactive (no target requirement)

**Gestures**:
- Tap: Primary interaction (click equivalent)
- Scroll: Vertical scroll in card content (when `overflow-y-auto`)
- No swipe gestures (PWA limitation, browser controls)
- No pinch-to-zoom (viewport meta prevents)

### 4.5 Progressive Enhancement

**Baseline**: Works without JavaScript (server-rendered)
- Share Target redirect: Server-side, no JS required
- Results page: SSR HTML loads first
- Cards: Static content visible before hydration

**Enhanced with JS**:
- Dynamic loading states (useWorkflowResults hook)
- Animated transitions (AnimatedCardContent)
- Client-side navigation (Next.js router)
- Toast notifications

**Offline Support** (Phase 4):
- Service worker caches static assets
- Analysis requires network (no offline analysis)
- Show "Offline" message if no connection

## 5. Data Display

### 5.1 Bias Score Visualization

**Primary Display**: Large color-coded number
- Font size: `text-6xl` (60px)
- Weight: `font-bold` (700)
- Color: Background color-coded (green/orange/red)
- Text: White for contrast

**Secondary Display**: Score gauge (in CognitiveBiasCard)
- Horizontal bar with percentage fill
- Same color coding (green/orange/red)
- Numeric score on right side

**Visual Hierarchy**:
1. Bias score card (top of page, first element after hero)
2. Score gauge (inside Cognitive Bias card, secondary)
3. Confidence badges (per signal, tertiary)

### 5.2 Signal Cards Layout

**Container**: Scrollable region, max 360px height
```typescript
className="space-y-3 max-h-[360px] overflow-y-auto pr-1"
```

**Individual Signal Card**:
```
┌─────────────────────────────────────┐
│ [Bias Name]  [Confidence Badge] ●   │ <- Top row
│              [Family Label →]       │
│ "Excerpt from article..."          │ <- Italic, gray
│ Explanation of why this is bias.   │ <- Regular text
└─────────────────────────────────────┘
```

**Layout Classes**:
- Container: `rounded-lg border border-gray-100 bg-gray-50 p-3 space-y-1.5`
- Header row: `flex flex-wrap items-center gap-2`
- Bias name: `text-sm font-semibold text-gray-800`
- Confidence badge: `text-[10px] rounded-full px-2 py-0.5 font-medium`
- Family label: `text-[10px] text-gray-400 ml-auto`
- Excerpt: `text-[11px] text-gray-500 italic leading-snug`
- Explanation: `text-xs text-gray-600 leading-relaxed`

### 5.3 Alternative Perspectives Cards

**Layout**: 2-column grid at desktop, single column mobile

**OtherMediaCard**:
- Title: `text-xs font-medium text-gray-800`
- Source: `text-xs text-gray-400`
- Icon: `ExternalLink` (lucide-react), 14x14px
- Link: Full row clickable

**Visual Pattern**:
```
[🔗] Title of alternative article
     Source name
```

**Hover State**:
- Title: Blue text + underline
- Icon: Blue color
- Cursor: Pointer

### 5.4 Expandable Details (Accordion)

**Status**: NOT implemented in Phase 3

**Current Approach**: All card content visible by default
- Signals: Scrollable list (no collapse)
- Summary: Always visible (no expand)

**Future Enhancement** (Phase 4):
- Add shadcn/ui Accordion component
- Collapse long signal lists by default
- "Show all X signals" expand trigger

**Reasoning**: Simplicity for Phase 3, avoid interaction complexity

## 6. Responsive Design

### 6.1 Breakpoints

**Tailwind Default**:
- `sm`: 640px (tablet portrait)
- `md`: 768px (tablet landscape)
- `lg`: 1024px (desktop)
- `xl`: 1280px (large desktop)

**Used in BlindSpot**:
- Mobile: `<640px` - Single column, full width
- Desktop: `≥640px` - Two-column grid, max-width container

**Container Widths**:
- Search page: `max-w-2xl` (672px)
- Results page: `max-w-[66%]` (66% of viewport width)

### 6.2 Mobile-First Approach

**Default**: All styles written for mobile
```typescript
className="grid grid-cols-1 gap-4"
```

**Desktop Override**: `sm:` prefix adds second column
```typescript
className="grid grid-cols-1 sm:grid-cols-2 gap-4"
```

**Full-Width Cards** (mobile + desktop):
```typescript
<div className="sm:col-span-2">
  <SynthesisCard />
</div>
```

### 6.3 Touch Interaction Patterns

**Mobile-Specific**:
- No hover states (tap shows immediate effect)
- Larger touch targets (minimum 44x44px)
- Scroll momentum (native browser behavior)
- Pull-to-refresh (disabled to avoid conflicts)

**Viewport Meta** (in layout.tsx):
```typescript
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1, // Disable pinch-zoom
  userScalable: false
}
```

**Reasoning**: Prevent accidental zoom on double-tap, maintain consistent layout

### 6.4 Tablet Adaptations

**No Special Treatment**: Tablets use desktop layout at `≥640px`
- 2-column grid active
- Same spacing and typography
- Touch targets still meet 44x44px minimum

**Future Optimization** (Phase 4):
- `md:` breakpoint for 3-column layout on large tablets
- Adjust `max-w-[66%]` for ultra-wide screens

## 7. PWA-Specific Specifications

### 7.1 Manifest Configuration

**File**: `app/manifest.ts` (NEW in Phase 3)

**Configuration**:
```typescript
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

**Required Icons** (NEW assets):
- `/icon-192.png` - 192x192px, PNG
- `/icon-512.png` - 512x512px, PNG
- Transparent background or white background
- Simple "B" logo or eye icon (TBD with designer)

### 7.2 Service Worker Registration

**File**: `components/PWARegister.tsx` (NEW in Phase 3)

**Implementation**:
```typescript
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
```

**Usage** (in app/layout.tsx):
```typescript
import { PWARegister } from '@/components/PWARegister'

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

### 7.3 Service Worker Strategy

**File**: `public/sw.js` (NEW in Phase 3)

**Cache Strategy**:
- Static assets (CSS, JS, images): Cache-first
- API calls (`/api/`): Network-first
- HTML pages: Network-first with offline fallback

**Implementation** (simplified):
```javascript
const CACHE_NAME = 'blindspot-v1'
const urlsToCache = [
  '/',
  '/search',
  '/offline',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/')) {
    // Network-first for API
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match('/offline'))
    )
  } else {
    // Cache-first for static assets
    event.respondWith(
      caches.match(event.request)
        .then((response) => response || fetch(event.request))
    )
  }
})
```

### 7.4 Install Prompt

**Requirement**: User must install PWA before Share Target appears in Android share sheet

**Implementation** (Phase 4 enhancement):
```typescript
// components/InstallPrompt.tsx
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowPrompt(true)
    })
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    console.log('Install outcome:', outcome)
    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  if (!showPrompt) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
      <p className="text-sm mb-2">Ajouter BlindSpot à votre écran d'accueil</p>
      <Button onClick={handleInstall}>Installer</Button>
    </div>
  )
}
```

**Note**: Not implemented in Phase 3 (manual install via browser menu)

## 8. Accessibility Requirements

### 8.1 ARIA Roles & Labels

**BiasScoreCard**:
```typescript
<div role="status" aria-label={`Score de biais: ${score} sur 100`}>
  {/* Score display */}
</div>
```

**LoadingStage**:
```typescript
<div role="status" aria-live="polite">
  <span className="sr-only">Étape en cours: {label}</span>
  {/* Visual indicator */}
</div>
```

**External Links**:
```typescript
<a
  href={url}
  target="_blank"
  rel="noopener noreferrer"
  aria-label={`${title} (ouvre dans un nouvel onglet)`}
>
  {/* Link content */}
</a>
```

### 8.2 Keyboard Navigation

**Focus Order**:
1. Skip to content link (optional)
2. Search input
3. Submit button
4. Example article cards (tab order)
5. Result cards (tab through interactive elements)
6. External links (focusable)

**Focus Styles** (from globals.css):
- Outline: `outline-ring/50` (blue-gray, 50% opacity)
- Visible on all interactive elements
- No `outline: none` without replacement

**Keyboard Shortcuts**:
- Enter: Submit form, activate button
- Space: Activate button/card
- Tab: Move focus forward
- Shift+Tab: Move focus backward

### 8.3 Screen Reader Support

**Structure**:
- Semantic HTML: `<header>`, `<main>`, `<nav>`, `<article>`
- Heading hierarchy: H1 → H2 (no skipped levels)
- Lists: `<ul>` for collections (example cards, signal cards)

**Dynamic Content**:
- `aria-live="polite"` on loading regions
- `role="status"` for score displays
- `aria-busy="true"` during loading states

**Images/Icons**:
- Decorative icons: `aria-hidden="true"`
- Meaningful icons: `aria-label` or visually hidden text
- Logo: Alt text "BlindSpot logo"

### 8.4 Color Contrast

**WCAG AA Requirements** (4.5:1 for text, 3:1 for large text):

| Text | Background | Ratio | Pass |
|------|------------|-------|------|
| White text | Green-600 | 4.5:1 | ✓ |
| White text | Orange-500 | 4.5:1 | ✓ |
| White text | Red-500 | 4.5:1 | ✓ |
| Gray-800 | White | 12.6:1 | ✓ |
| Gray-600 | White | 7.0:1 | ✓ |
| Blue-600 | White | 8.2:1 | ✓ |

**Testing**: Use Chrome DevTools Lighthouse accessibility audit

### 8.5 Motion Preferences

**Respect `prefers-reduced-motion`**:
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Implementation**: Add to `globals.css` base layer

## 9. Performance Specifications

### 9.1 Performance Budgets

**Timing Targets** (from requirements):
- First screen: <3s (loading.tsx)
- Complete analysis: <5s P80 (backend SLA)
- Time to Interactive (TTI): <4s
- First Contentful Paint (FCP): <1.5s

**Asset Budgets**:
- JavaScript bundle: <200KB gzipped
- CSS bundle: <50KB gzipped
- Images: WebP format, <100KB each
- Total page weight: <500KB

### 9.2 Loading Strategy

**Code Splitting**:
- Route-based: Automatic via Next.js App Router
- Component-based: Dynamic imports for heavy components
```typescript
const AnalysisCards = dynamic(() => import('@/components/custom/AnalysisCards'), {
  ssr: false,
  loading: () => <AnalysisCardsLoader />
})
```

**Preloading**:
- Critical CSS: Inlined in `<head>`
- Hero video: `<link rel="preload" href="/bg-video-hd.mp4" as="video">`
- Fonts: Preload if custom fonts used

**Lazy Loading**:
- Below-fold cards: Load on scroll (future enhancement)
- Images: `loading="lazy"` attribute
- Video: Load after initial render

### 9.3 Caching Strategy

**Service Worker**:
- Static assets: Cache-first, 30-day expiration
- API responses: Network-first, no cache (stateless)
- HTML pages: Network-first, cache as fallback

**HTTP Headers** (server config):
- Static assets: `Cache-Control: public, max-age=31536000, immutable`
- HTML: `Cache-Control: no-cache`
- API: `Cache-Control: no-store`

### 9.4 Rendering Strategy

**Next.js Rendering**:
- Search page: Static (pre-rendered at build time)
- Results page: Dynamic (SSR on demand)
- Share handler: Server Component (no client JS)

**Suspense Boundaries**:
- Bias Score: Separate boundary (priority 1)
- Analysis Cards: Separate boundary (priority 2)
- Maximum 2 boundaries to avoid waterfall

**Streaming SSR**:
- Enable via React 19 Suspense
- Cards stream in as backend responds
- No blocking on full analysis completion

## 10. Copy & Microcopy

### 10.1 Primary CTAs

| Location | Label | Action |
|----------|-------|--------|
| Home page | "Analyser un article" | Navigate to `/search` |
| Search page | Submit button (arrow icon) | Navigate to `/results?url={url}` |
| Error state | "Réessayer" | Retry analysis (future) |

### 10.2 Empty States

**No URL provided**:
```
Aucune URL fournie.
Veuillez partager un article depuis votre navigateur.
```

**No results found** (search failure):
```
Aucun résultat trouvé.
Vérifiez que l'URL est valide et réessayez.
```

### 10.3 Error Messages

**Network Failure**:
```
Impossible de charger l'analyse.
Vérifiez votre connexion et réessayez.
```

**Timeout**:
```
L'analyse prend trop de temps.
Vérifiez que l'article est accessible publiquement (pas derrière un paywall), ou réessayez dans quelques instants.
```

**Invalid URL**:
```
URL invalide.
Veuillez partager un lien vers un article de presse.
```

**Individual Card Error** (context-specific):

Cognitive Bias Card:
```
Erreur lors de l'analyse des biais.
Rafraîchissez la page pour réessayer.
```

Other Media Card:
```
Impossible de trouver d'autres sources.
Cet article est peut-être trop récent ou trop spécifique.
```

Generic fallback (if card type unknown):
```
Erreur lors du chargement de cette section.
Rafraîchissez la page pour réessayer.
```

### 10.4 Loading States

**Multi-Stage Labels**:
1. "Analyse" - Article analysis in progress
2. "Recherche" - Searching for alternative sources
3. "Synthèse" - Synthesizing final results

**Card-Level Loading**:
- "En attente…" - Idle state
- "Chargement…" - Loading state

### 10.5 Instructional Copy

**Search Page Header**:
```
Un meilleur contexte pour tous vos articles de presse.
```

**Results Page Section Label**:
```
ANALYSE DE VOTRE ARTICLE
```
(Uppercase, small font, gray color)

**Install Prompt** (Phase 4):
```
Ajouter BlindSpot à votre écran d'accueil pour partager des articles directement.
```

## 11. Implementation Checklist

### Phase 3 Deliverables

**PWA Configuration**:
- [ ] Create `app/manifest.ts` with share_target configuration
- [ ] Generate `/icon-192.png` and `/icon-512.png` (placeholder or design)
- [ ] Create `public/sw.js` with basic cache strategy
- [ ] Create `components/PWARegister.tsx` for SW registration
- [ ] Add PWARegister to `app/layout.tsx`

**Share Target Integration**:
- [ ] Create `app/share/page.tsx` handler route
- [ ] Extract URL from searchParams (check `url`, `text`, `title` fields)
- [ ] Validate URL format before redirect
- [ ] Redirect to `/results?url={url}` on success
- [ ] Redirect to `/` on invalid URL

**Loading UI**:
- [ ] Create `app/results/loading.tsx` with multi-stage progress
- [ ] Implement `LoadingStage` component (active/complete/pending states)
- [ ] Add spinner animation (`animate-spin`)
- [ ] Add stage labels: Analyse, Recherche, Synthèse

**Bias Score Component**:
- [ ] Create `components/custom/BiasScoreCard.tsx`
- [ ] Implement color-coded background (green/orange/red)
- [ ] Large text display (`text-6xl`)
- [ ] Add ARIA label for accessibility
- [ ] Create skeleton loader variant

**Results Page Updates**:
- [ ] Add Suspense boundary for BiasScoreCard (priority 1)
- [ ] Add Suspense boundary for AnalysisCards (priority 2)
- [ ] Test progressive rendering (score appears first)
- [ ] Verify performance (<3s first screen)

**Testing**:
- [ ] Test PWA installability (Chrome DevTools)
- [ ] Test Share Target on Android device (requires HTTPS)
- [ ] Test loading states (throttle network to 3G)
- [ ] Test error handling (invalid URLs, timeouts)
- [ ] Lighthouse audit (Performance, Accessibility, PWA scores)

### Phase 4 Enhancements (Deferred)

- [ ] Install prompt component (`beforeinstallprompt` event)
- [ ] Offline fallback page
- [ ] Retry buttons on error cards
- [ ] Accordion for collapsible signal lists
- [ ] Analytics tracking (share events, analysis completion)

## 12. Design Tokens Reference

### Colors (oklch)

```css
/* Light mode */
--background: oklch(1 0 0);              /* White */
--foreground: oklch(0.145 0 0);          /* Near-black */
--card: oklch(1 0 0);                    /* White */
--muted: oklch(0.97 0 0);                /* Light gray */
--border: oklch(0.922 0 0);              /* Border gray */

/* Semantic (Tailwind classes) */
bg-green-500    /* Low bias */
bg-green-600    /* Low bias (dark variant) */
bg-orange-400   /* Medium bias */
bg-orange-500   /* Medium bias (primary) */
bg-red-500      /* High bias */
bg-red-600      /* High bias (dark variant) */
```

### Spacing (rem)

```css
gap-1: 0.25rem   /* 4px */
gap-2: 0.5rem    /* 8px */
gap-3: 0.75rem   /* 12px */
gap-4: 1rem      /* 16px */
gap-8: 2rem      /* 32px */
p-3: 0.75rem     /* 12px */
p-4: 1rem        /* 16px */
p-6: 1.5rem      /* 24px */
```

### Border Radius (rem)

```css
--radius: 0.625rem;           /* 10px base */
rounded-sm: calc(var(--radius) * 0.6);  /* 6px */
rounded-md: calc(var(--radius) * 0.8);  /* 8px */
rounded-lg: var(--radius);              /* 10px */
rounded-xl: calc(var(--radius) * 1.4);  /* 14px */
```

### Typography (rem + px)

```css
text-[10px]: 10px     /* Small labels */
text-xs: 0.75rem      /* 12px - Body */
text-sm: 0.875rem     /* 14px - Card titles */
text-4xl: 2.25rem     /* 36px - Page titles */
text-6xl: 3.75rem     /* 60px - Bias score */

font-normal: 400      /* Body text */
font-medium: 500      /* Labels, emphasis */
font-semibold: 600    /* Signal names */
font-bold: 700        /* Scores, headlines */
```

## 13. Browser & Device Support

### Supported Browsers

| Browser | Version | Share Target Support |
|---------|---------|---------------------|
| Chrome Android | 89+ | ✓ Yes |
| Edge Android | 89+ | ✓ Yes |
| Firefox Android | 100+ | ✗ No (not implemented) |
| Safari iOS | Any | ✗ No (Phase 4) |
| Chrome Desktop | Any | ✗ No (Share Target is mobile-only) |

### Platform Support

**Phase 3 (Current)**:
- Android 8+ (Chrome 89+)
- Requires HTTPS or localhost
- Requires PWA installation

**Phase 4 (Future)**:
- iOS Share Extension (native integration)
- Desktop bookmark drag-and-drop

### Feature Detection

```typescript
// Check Share Target support
const supportsShareTarget = 'share_target' in navigator.serviceWorker

// Check PWA install status
window.addEventListener('appinstalled', () => {
  console.log('PWA installed')
})

// Check online status
window.addEventListener('online', () => {
  console.log('Back online')
})
```

## 14. Visual Mockups (ASCII)

### Mobile Results Screen (Portrait)

```
┌─────────────────────────────────────┐
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│ <- Video hero
│░░░░░░░░░░░VIDEO BG░░░░░░░░░░░░░░░░░░│
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
├─────────────────────────────────────┤
│ ANALYSE DE VOTRE ARTICLE            │ <- Small gray label
│                                     │
│ L'article qui a déclenché l'analyse │ <- Large title
│ avec un titre très long sur         │
│ plusieurs lignes                    │
│                                     │
├─────────────────────────────────────┤
│                 75                  │ <- FIRST VISUAL
│            Score de biais           │    (orange bg)
└─────────────────────────────────────┘
│                                     │
│ ┌─ Synthèse ─────────────────────┐ │
│ │ 3 points de synthèse listés   │ │
│ │ • Point 1                     │ │
│ │ • Point 2                     │ │
│ │ • Point 3                     │ │
│ └───────────────────────────────┘ │
│                                     │
│ ┌─ Résumé ───────────────────────┐ │
│ │ Résumé de l'article avec      │ │
│ │ keywords: [tag] [tag] [tag]   │ │
│ └───────────────────────────────┘ │
│                                     │
│ ┌─ Angles morts ─────────────────┐ │
│ │ • Angle mort 1                │ │
│ │ • Angle mort 2                │ │
│ └───────────────────────────────┘ │
│                                     │
│ ┌─ Biais cognitifs ──────────────┐ │
│ │ Score: [██████████░░] 65      │ │
│ │ Résumé: ...                   │ │
│ │ ┌─ Signal 1 ─────────────────┐│ │
│ │ │ Sélection • moyen          ││ │
│ │ │ "Quote..."                 ││ │
│ │ │ Explanation text           ││ │
│ │ └────────────────────────────┘│ │
│ └───────────────────────────────┘ │
│                                     │
│ ┌─ Autres médias ────────────────┐ │
│ │ 🔗 Article 1 title            │ │
│ │    Le Monde                   │ │
│ │ 🔗 Article 2 title            │ │
│ │    Le Figaro                  │ │
│ └───────────────────────────────┘ │
│                                     │
│ ┌─ Recherche média ──────────────┐ │
│ │ Research summary text         │ │
│ └───────────────────────────────┘ │
│                                     │
│ ┌─ Entités ──────────────────────┐ │
│ │ [Person] [Org] [Location]     │ │
│ └───────────────────────────────┘ │
└─────────────────────────────────────┘
```

### Desktop Results Screen (Landscape)

```
┌────────────────────────────────────────────────────────────┐
│░░░░░░░░░░░░░░░░░░░░░VIDEO BG░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
├────────────────────────────────────────────────────────────┤
│  ANALYSE DE VOTRE ARTICLE                                  │
│  L'article qui a déclenché l'analyse                       │
│                                                            │
├────────────────────────────────────────────────────────────┤
│                        75                                  │ <- FIRST
│                   Score de biais                           │
└────────────────────────────────────────────────────────────┘
│ ┌─ Synthèse ────────────────────────────────────────────┐ │
│ │ Full width card                                       │ │
│ └───────────────────────────────────────────────────────┘ │
│                                                            │
│ ┌─ Résumé ──────────────────────────────────────────────┐ │
│ │ Full width card                                       │ │
│ └───────────────────────────────────────────────────────┘ │
│                                                            │
│ ┌─ Angles morts ─────┐  ┌─ Biais cognitifs ────────────┐ │
│ │ Left column        │  │ Right column                 │ │
│ │ (1/2 width)        │  │ (1/2 width)                  │ │
│ └────────────────────┘  └──────────────────────────────┘ │
│                                                            │
│ ┌─ Autres médias ────┐  ┌─ Recherche média ────────────┐ │
│ │ Left column        │  │ Right column                 │ │
│ └────────────────────┘  └──────────────────────────────┘ │
│                                                            │
│ ┌─ Entités ──────────────────────────────────────────────┐│
│ │ Partial width (left side only)                        ││
│ └───────────────────────────────────────────────────────┘│
└────────────────────────────────────────────────────────────┘
```

### Loading Screen (Multi-Stage)

```
┌─────────────────────────────────────┐
│                                     │
│                                     │
│        ◉ Analyse                    │ <- Spinning
│        ○ Recherche                  │ <- Pending
│        ○ Synthèse                   │ <- Pending
│                                     │
│                                     │
└─────────────────────────────────────┘

After 2 seconds:

┌─────────────────────────────────────┐
│                                     │
│                                     │
│        ● Analyse                    │ <- Complete (green)
│        ◉ Recherche                  │ <- Active (spinning)
│        ○ Synthèse                   │ <- Pending
│                                     │
│                                     │
└─────────────────────────────────────┘
```

---

## Appendix A: Component File Locations

| Component | File Path | Status |
|-----------|-----------|--------|
| BiasScoreCard | `front/components/custom/BiasScoreCard.tsx` | NEW in Phase 3 |
| LoadingStage | `front/app/results/loading.tsx` | NEW in Phase 3 |
| ShareHandler | `front/app/share/page.tsx` | NEW in Phase 3 |
| PWARegister | `front/components/PWARegister.tsx` | NEW in Phase 3 |
| Manifest | `front/app/manifest.ts` | NEW in Phase 3 |
| Service Worker | `front/public/sw.js` | NEW in Phase 3 |
| AnalysisCards | `front/components/custom/AnalysisCards.tsx` | Existing |
| CognitiveBiasCard | `front/components/custom/analysis/CognitiveBiasCard.tsx` | Existing |
| OtherMediaCard | `front/components/custom/analysis/OtherMediaCard.tsx` | Existing |
| SearchInput | `front/components/custom/SearchInput.tsx` | Existing |
| ExampleArticleCard | `front/components/custom/ExampleArticleCard.tsx` | Existing |

## Appendix B: Zod Schemas (for reference)

**From backend** (`mastra/src/mastra/schemas/article.ts`):

```typescript
// Bias signal structure
const BiasSignalSchema = z.object({
  bias: z.string(),
  family: z.enum([
    'selection_faits',
    'cadrage_lexical',
    'causalite_fragile',
    'usage_chiffres',
    'structure_recit',
    'qualite_argumentative'
  ]),
  confidence: z.enum(['low', 'medium', 'high']),
  explanation: z.string(),
  excerpt: z.string().optional()
})

// Cognitive bias result
const CognitiveBiasSchema = z.object({
  globalScore: z.number().min(0).max(100),
  summary: z.string(),
  signals: z.array(BiasSignalSchema)
})

// Other media article
const OtherMediaArticleSchema = z.object({
  title: z.string(),
  url: z.string().url(),
  media: z.string()
})
```

## Appendix C: External Dependencies

| Package | Version | Purpose | Documentation |
|---------|---------|---------|---------------|
| next | 16.2.1 | Framework | [nextjs.org/docs](https://nextjs.org/docs) |
| react | 19.2.4 | UI library | [react.dev](https://react.dev) |
| tailwindcss | 4.2.2 | Styling | [tailwindcss.com](https://tailwindcss.com) |
| radix-ui | 1.4.3 | Primitives | [radix-ui.com](https://radix-ui.com) |
| lucide-react | 1.7.0 | Icons | [lucide.dev](https://lucide.dev) |
| class-variance-authority | 0.7.1 | Variants | [cva.style](https://cva.style) |

All dependencies verified as current stable versions as of 2026-03-28.

---

**End of UI Specification**

This document is the single source of truth for Phase 3 visual design and interaction contracts. All implementation work should reference this specification. Any deviations must be documented with rationale.
