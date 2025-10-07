# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

10x Astro Starter - A modern, opinionated starter template for building fast, accessible, and AI-friendly web applications using Astro 5, React 19, TypeScript 5, and Tailwind CSS 4.

## Tech Stack

- **Astro 5** - SSR-enabled web framework (output: "server" mode)
- **React 19** - For interactive components only
- **TypeScript 5** - Type safety throughout
- **Tailwind CSS 4** - Utility-first styling
- **Shadcn/ui** - UI component library (New York style)
- **Supabase** - Backend services and database (when configured)

## Common Commands

```bash
npm run dev         # Start dev server on port 3000
npm run build       # Build for production
npm run preview     # Preview production build
npm run lint        # Run ESLint
npm run lint:fix    # Fix ESLint issues automatically
npm run format      # Format code with Prettier
```

## Architecture

### Project Structure

- `src/layouts/` - Astro layouts for page templates
- `src/pages/` - Astro pages (file-based routing)
- `src/pages/api/` - API endpoints (use uppercase GET/POST handlers, `export const prerender = false`)
- `src/middleware/index.ts` - Astro middleware for request/response modification
- `src/components/` - UI components (Astro for static, React for interactive)
- `src/components/ui/` - Shadcn/ui components
- `src/components/hooks/` - Custom React hooks
- `src/lib/` - Services and helpers
- `src/lib/services/` - Business logic extracted from routes
- `src/db/` - Supabase clients and types
- `src/types.ts` - Shared types for backend and frontend (Entities, DTOs)
- `src/assets/` - Internal static assets
- `public/` - Public assets

### Component Strategy

- Use `.astro` components for static content and layouts
- Use React (`.tsx`) only when interactivity is needed
- Never use Next.js directives like "use client" (this is Astro, not Next.js)

### API Routes

- Use uppercase HTTP method exports: `GET`, `POST`
- Always add `export const prerender = false` for API routes
- Validate input with Zod schemas
- Extract business logic to `src/lib/services/`
- Use `Astro.cookies` for cookie management
- Access env vars via `import.meta.env`

### Supabase Integration

- Use `context.locals.supabase` in Astro routes (not direct imports)
- Import `SupabaseClient` type from `src/db/supabase.client.ts`, not from `@supabase/supabase-js`
- Validate all data exchanged with backend using Zod schemas

### Styling Guidelines

- Tailwind 4 with CSS variables enabled
- Use `@layer` directive for organizing custom styles
- Arbitrary values with square brackets for one-off designs: `w-[123px]`
- Responsive variants: `sm:`, `md:`, `lg:`, etc.
- Dark mode support: `dark:` variant
- State variants for interactivity: `hover:`, `focus-visible:`, `active:`

### React Best Practices

- Functional components with hooks only (no class components)
- `React.memo()` for expensive re-rendering components
- `React.lazy()` and Suspense for code-splitting
- `useCallback` for event handlers passed to children
- `useMemo` for expensive calculations
- `useId()` for accessibility-related unique IDs
- `useOptimistic` for optimistic UI updates
- `useTransition` for non-urgent state updates

### Error Handling Pattern

- Handle errors and edge cases at the beginning of functions
- Use early returns to avoid deep nesting
- Place happy path last for readability
- Avoid unnecessary else statements (prefer if-return pattern)
- Use guard clauses for preconditions
- Implement proper error logging with user-friendly messages

### Accessibility

- Use semantic HTML first, ARIA only when necessary
- ARIA landmarks for page regions (main, navigation, search)
- `aria-expanded` and `aria-controls` for expandable content
- `aria-live` regions for dynamic updates
- `aria-label` or `aria-labelledby` for elements without visible labels
- `aria-describedby` for form input descriptions
- `aria-current` for current item indication
- Never duplicate native HTML semantics with redundant ARIA

## Astro-Specific Features

- View Transitions API enabled (use ClientRouter)
- Content collections with type safety for structured content
- Hybrid rendering: server-side where needed, static where possible
- Image optimization via Astro Image integration
- Middleware support for cross-cutting concerns

## Path Aliases

Configured in `components.json` and `tsconfig.json`:
- `@/components` → `src/components`
- `@/lib` → `src/lib`
- `@/components/ui` → `src/components/ui`
- `@/hooks` → `src/hooks`

## Linting & Formatting

- ESLint configured with TypeScript, React, Astro, and accessibility plugins
- Prettier integration for code formatting
- Husky + lint-staged for pre-commit hooks
- Auto-fixes on staged files: `*.{ts,tsx,astro}` (ESLint), `*.{json,css,md}` (Prettier)

## Node Version

Use Node.js v22.14.0 as specified in `.nvmrc`
