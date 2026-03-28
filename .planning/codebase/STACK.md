# Technology Stack

**Last Updated:** 2026-03-28

## Overview

BlindSpot uses a distributed 3-service architecture with modern TypeScript across all components.

## Languages & Runtime

### Primary Languages
- **TypeScript 5.x** - Strict mode enabled across all services
- **JavaScript** - Legacy files and build outputs

### Runtime Environment
- **Node.js:** >=22.13.0 (required), 22-alpine in production
- **Package Managers:**
  - pnpm (frontend)
  - npm (backend, mastra)

## Core Frameworks

### Backend API (`backend/`)
- **Hono 4.6.14** - Lightweight HTTP framework
- **@hono/node-server** - Node.js adapter
- **@hono/zod-validator** - Request validation middleware

### Frontend PWA (`front/`)
- **Next.js 16.2.1** - React framework with App Router
- **React 19.2.4** - UI library
- **Tailwind CSS 4.x** - Utility-first styling
- **PostCSS** - CSS processing

### Workflow Orchestration (`mastra/`)
- **Mastra 1.3.15** - Agentic workflow engine
- **@mastra/core 1.17.0** - Core orchestration
- **@mastra/libsql 1.7.2** - LibSQL storage
- **@mastra/memory 1.10.0** - Agent memory
- **@mastra/observability 1.5.1** - Tracing
- **@mastra/loggers 1.0.3** - Logging infrastructure
- **@mastra/evals 1.1.2** - Agent evaluation

## Build Tools

- **TypeScript Compiler** - Type checking and compilation
- **tsx** - TypeScript execution
- **esbuild** - Fast bundling
- **Tailwind CSS 4.x** - CSS compilation
- **PostCSS** - CSS transformations

## Critical Dependencies

### AI & LLM
- **@google/generative-ai 0.21.0** - Gemini API client
- **@ai-sdk/openai 3.0.48** - OpenAI API for Mastra agents

### Content Processing
- **@mozilla/readability 0.5.0** - Article extraction
- **jsdom 25.0.1** - HTML parsing
- **linkedom** - Lightweight DOM (used in some contexts)

### Validation & Type Safety
- **zod 4.3.6** - Runtime schema validation
- **@hono/zod-validator** - Hono integration

### UI Libraries
- **@radix-ui/** - Headless UI components
  - accordion, alert-dialog, dialog, dropdown-menu, label, select, slot, switch, tabs, toast
- **lucide-react** - Icon library
- **clsx** - Class name utility
- **tailwind-merge** - Tailwind class merging
- **class-variance-authority** - Component variants

### Utilities
- **date-fns** - Date manipulation
- **sonner** - Toast notifications
- **embla-carousel-react** - Carousel component
- **next-themes** - Theme management

## Configuration Files

### TypeScript
- `backend/tsconfig.json` - Backend TS config
- `front/tsconfig.json` - Frontend TS config
- `mastra/tsconfig.json` - Mastra TS config
- `shared/tsconfig.json` - Shared types config

### Package Management
- `backend/package.json` - Backend dependencies
- `front/package.json` - Frontend dependencies
- `mastra/package.json` - Mastra dependencies
- `pnpm-workspace.yaml` - Workspace configuration (if exists)

### Build & Deploy
- `backend/Dockerfile` - Backend containerization
- `front/Dockerfile` - Frontend containerization
- `mastra/Dockerfile` - Mastra containerization
- `docker-compose.yml` - Multi-service orchestration

### Environment
- `.env.example` files in each service
- Required variables per service (see INTEGRATIONS.md)

## Testing Framework

**Status:** No testing framework configured
- No Jest, Vitest, or Mocha detected
- No test files (`.test.ts`, `.spec.ts`) found
- Relies on TypeScript strict mode for compile-time safety
- Uses Zod schemas for runtime validation

## Development Tools

### Code Quality
- **ESLint 9** - Linting (frontend with Next.js config)
- **TypeScript Strict Mode** - Type checking across all services

### Module System
- **ES Modules** - All services use `"type": "module"`
- Requires `.js` extensions in backend imports

## Version Requirements

### Node.js Engines
- **Minimum:** 22.13.0
- **Production:** 22-alpine (Docker)

### Critical Version Notes
- Next.js 16.2.1 is an early release (may have breaking changes)
- Gemini 2.5-Flash is newly released
- React 19.2.4 is latest stable
- Mastra 1.3.15 is current version
