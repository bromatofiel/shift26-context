# Phase 1: Foundation & API Scaffold - Context

**Gathered:** 2026-03-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Environnement de développement prêt + structure API capable de recevoir des requêtes et retourner des réponses mock. Pas de logique métier — juste le squelette.

Success criteria:
1. Backend responds to GET /health with uptime and version
2. Backend accepts POST /v1/analyze with URL and returns valid mock JSON response
3. JSON schema matches expected structure (source_article, counter_perspectives, global_context)
4. Response includes all required fields (score, color, main_signals, alternatives)

</domain>

<decisions>
## Implementation Decisions

### Project Structure
- **D-01:** Monorepo avec `frontend/`, `backend/`, `shared/` (types communs)
- **D-02:** Types TypeScript partagés entre frontend et backend via `shared/`

### Backend Framework
- **D-03:** Hono comme framework backend Node.js
- **D-04:** Validation JSON schema via Zod (compatible Hono)

### Mock Strategy
- **D-05:** Mock squelette — structure correcte, valeurs placeholder
- **D-06:** Pas de logique dynamique dans le mock Phase 1

### API Contract
- **D-07:** `GET /health` retourne `{ status, version, uptime_ms }`
- **D-08:** `POST /v1/analyze` accepte `{ url, locale?, timeout_ms? }` et retourne le schema complet

### Claude's Discretion
- Choix du gestionnaire de packages (npm/pnpm/yarn)
- Configuration TypeScript exacte
- Structure des dossiers internes
- Tooling de dev (nodemon, tsx, etc.)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### API Schema
- `.planning/REQUIREMENTS.md` — Requirements ANA-01 to ANA-05 define the expected output structure

### Project Context
- `.planning/PROJECT.md` — Stack constraints (Node.js + React PWA), performance targets (<5s)

No external specs — requirements fully captured in decisions above and planning docs.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None — greenfield project

### Established Patterns
- None — patterns will be established in this phase

### Integration Points
- Backend will be consumed by React PWA in Phase 3
- Shared types will be imported by both frontend and backend

</code_context>

<specifics>
## Specific Ideas

- Hono choisi pour sa légèreté et sa compatibilité edge (déploiement Vercel/Cloudflare possible)
- Mock doit être suffisant pour valider le contrat API, pas pour tester l'UX complète

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-foundation-api-scaffold*
*Context gathered: 2026-03-28*
