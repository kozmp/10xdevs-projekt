# Project Name: AI Product Description Generator

## 1. Project Description

AI Product Description Generator is a web application for Shopify store owners that leverages Large Language Models (LLMs) to automatically generate professional product descriptions and SEO meta tags, reducing the manual effort from hours to minutes.

## 2. Tech Stack

- **Frontend:** Astro 5, React 19, TypeScript 5, Tailwind CSS 4, Shadcn/ui
- **Backend:** Supabase, PostgreSQL
- **External APIs:** OpenRouter.ai (OpenAI + Anthropic), Shopify Admin REST API
- **DevOps:** Docker, DigitalOcean, GitHub Actions
- **Monitoring:** Sentry
- **Testing:**
  - Unit & Component Testing: Vitest, React Testing Library
  - E2E Testing: Cypress/Playwright

## 3. Getting Started Locally

```bash
# Clone the repository
git clone https://github.com/your-org/ai-product-description-generator.git
cd ai-product-description-generator

# Install dependencies
npm install

# Install Node.js version from .nvmrc
nvm use

# Start development server
npm run dev
```

## 4. Available Scripts

- `npm run dev` – start Astro development server
- `npm run build` – build the production site
- `npm run preview` – preview the production build
- `npm run astro` – run Astro CLI commands
- `npm run lint` – run ESLint
- `npm run lint:fix` – run ESLint with auto-fix
- `npm run format` – format code with Prettier

## 5. Project Scope

**In Scope (MVP Prototype):**

- Shopify integration via static API key
- Fetch and bulk-select up to 50 existing products
- Batch generation of HTML product descriptions and 155–160 character SEO meta descriptions in Polish and English
- Real-time progress bar, token cost estimation (total and per-product)
- Rich-text editor with undo/redo (48h window) and full version history saved
- Asynchronous job queue with retry/backoff (3 attempts)
- Update Shopify (draft or publish) respecting API rate limits
- Logging and monitoring with Supabase Metrics and Sentry

**Out of Scope:**

- Integrations beyond Shopify
- Image generation
- Long-term AI context/memory
- Collection/category operations
- Creating new products
- Advanced AI features (fine-tuning, RAG, SEO scoring)
- Multi-user collaboration and role-based access

## 6. Project Status

Current status: MVP Prototype under development (3–4 week sprint by a 2–3 person team).

## 7. License

This project is licensed under the [MIT License](LICENSE.md).

## Running Supabase with Docker Desktop

After running `supabase init` you have a Docker Compose file at `.supabase/docker-compose.yml`. You can use Docker Desktop to launch the Supabase local services:

1. Open Docker Desktop.
2. Go to the "Stacks" (or "Apps") section and click "Add stack".
3. Select the file at `.supabase/docker-compose.yml` in your project directory.
4. Set the name (e.g. `supabase-local`) and click "Deploy the stack".

Alternatively, from the terminal you can run:

```bash
# Start Supabase emulator via Docker Compose
docker compose -f .supabase/docker-compose.yml up -d

# Stop services when done
docker compose -f .supabase/docker-compose.yml down
```

This will bring up:

- Postgres (port 54321)
- Supabase API (port 54322)
- Realtime and other services

Your application can then connect to `http://localhost:54322` for API calls and `postgresql://localhost:54321` for the database.
