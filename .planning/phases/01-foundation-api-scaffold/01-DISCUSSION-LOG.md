# Phase 1: Foundation & API Scaffold - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-28
**Phase:** 01-foundation-api-scaffold
**Areas discussed:** Structure repo, Backend framework, Mock fidelity

---

## Structure repo

| Option | Description | Selected |
|--------|-------------|----------|
| Monorepo | Un seul repo avec frontend/ + backend/ + shared/ (types communs) | ✓ |
| Repos séparés | Deux repos distincts, déploiement indépendant | |
| Single folder | Tout à la racine, structure minimale pour hackathon | |

**User's choice:** Monorepo
**Notes:** Permet le partage de types TypeScript entre frontend et backend.

---

## Backend framework

| Option | Description | Selected |
|--------|-------------|----------|
| Express | Classique, énorme écosystème | |
| Fastify | Plus rapide, validation JSON schema native | |
| Hono | Ultra-léger, edge-ready, API similaire à Express | ✓ |

**User's choice:** Hono
**Notes:** Léger et compatible avec les déploiements edge (Vercel, Cloudflare).

---

## Mock fidelity

| Option | Description | Selected |
|--------|-------------|----------|
| Squelette | Structure correcte, valeurs placeholder | ✓ |
| Réaliste | Exemple complet avec vrai article mock | |
| Dynamique | Le mock varie selon l'URL passée | |

**User's choice:** Squelette
**Notes:** Suffisant pour valider le contrat API en Phase 1.

---

## Claude's Discretion

- Choix du gestionnaire de packages
- Configuration TypeScript
- Structure des dossiers internes
- Tooling de dev

## Deferred Ideas

None — discussion stayed within phase scope
