# Handbookly

Handbookly is an employee handbook your team can ask at any hour. The assistant is Liam. He answers from the policies HR uploads, cites the section, and sends anything the handbook does not cover to an HR queue.

The signed-in app is the product. The marketing page is a short introduction.

## What you can do

- Sign in with Clerk. Organization admins are HR. Members are employees.
- Upload a handbook PDF or DOCX. Handbookly splits it into sections.
- Ask Liam. Answers cite the section number, title, and a short excerpt.
- If the handbook does not cover the question, the employee can send it to HR.
- HR answers the queue and can save that answer into a knowledge base Liam will cite next time.
- Topics employees keep asking about, and the handbook never mentions, show up as policy-gap suggestions.
- The HR dashboard charts questions, answer mix, and the sections people actually use. Those numbers come from stored questions.

A fictional 25-person company, Cedar & Pine (outdoor apparel, Bend, Oregon), is included as labeled demo data. Avery Chen is the People Lead.

## Stack

- Next.js 16 App Router and TypeScript. This repo stayed on Next 16 because Clerk’s current integration uses `src/proxy.ts` (`middleware` was renamed to `proxy`). Tailwind CSS v4, shadcn/ui, lucide, and framer-motion.
- Clerk (`@clerk/nextjs`), including keyless mode in local development when publishable and secret keys are absent.
- Drizzle ORM and Postgres (`DATABASE_URL`, Neon or Supabase compatible). If the `vector` extension is available, search blends BM25 with local 256-dimension hash embeddings. Otherwise search is BM25 only.
- Anthropic Claude on the server. The model is `AI_MODEL`, default `claude-sonnet-4-6`. Without `ANTHROPIC_API_KEY`, Liam still searches and quotes the matching section, and the reply is labeled as a sample.

## Environment variables

Copy `.env.example`. Names only — do not commit secrets.

| Name | Purpose |
| --- | --- |
| `DATABASE_URL` | Postgres connection string. Missing: in-memory demo data. |
| `ANTHROPIC_API_KEY` | Server-side Claude calls. Missing: labeled sample answers. |
| `AI_MODEL` | Claude model id. Default `claude-sonnet-4-6`. |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key. |
| `CLERK_SECRET_KEY` | Clerk secret key. |
| `CLERK_ENCRYPTION_KEY` | Optional. Needed when Clerk keys are supplied to middleware at runtime. Handbookly sets a local fallback if this is empty. |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Optional. App uses `/sign-in`. |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Optional. App uses `/sign-up`. |
| `NEXT_PUBLIC_CLERK_KEYLESS_DISABLED` | Set to `true` to skip keyless mode in development. |
| `UPSTASH_REDIS_REST_URL` | Optional shared rate limit. |
| `UPSTASH_REDIS_REST_TOKEN` | Optional shared rate limit. |
| `DEMO_SCREENSHOT` | Set to `1` to open `/demo` for screenshots and click-through without Clerk. |
| `NEXT_PUBLIC_APP_URL` | Absolute URL used for metadata. |
| `SEED_ORG_ID` | Optional org id for `npm run db:seed`. |

Enable Organizations in the Clerk dashboard. The organization admin role is HR.

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

In development, Clerk keyless mode can create a temporary application when keys are empty. Production and preview deploys need real Clerk keys.

With Postgres:

```bash
npm run db:migrate
npm run db:seed
```

`db:seed` loads the Cedar & Pine handbook, a month of questions, an open HR queue, and suggested policy gaps into `SEED_ORG_ID` or the demo org id. Without `DATABASE_URL`, the running app seeds that sample into memory and labels it “Demo data”. Postgres does not auto-seed; HR can also use “Load the Cedar & Pine sample” in Handbooks.

## Scripts

- `npm run dev` — local server
- `npm run build` / `npm start` — production
- `npm run lint` — ESLint
- `npm run db:generate` — Drizzle kit generate
- `npm run db:migrate` — apply `drizzle/0000_init.sql` and try `pgvector`
- `npm run db:seed` — insert the Cedar & Pine sample
- `npm run screenshot` — Playwright shots of the landing page and HR dashboard. The server must be running with `DEMO_SCREENSHOT=1`.

## What is real, and what is a sample

- Parsing, chunking, BM25 retrieval, citations, the queue, gaps, and analytics are real and run on stored data.
- pgvector hybrid search is real when the extension exists. Embeddings are a local feature hash, not a hosted embedding model.
- Claude is real only when `ANTHROPIC_API_KEY` is set. Otherwise the UI shows a sample answer quoted from the retrieved section.
- Without `DATABASE_URL`, data lives in memory for the server process and is labeled demo data.
- `/demo` returns 404 unless `DEMO_SCREENSHOT=1`.
