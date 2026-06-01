# SalaryMY

> Malaysia's salary transparency platform — explore real salary ranges by role and experience level, and contribute your own anonymously.

Built with **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Supabase**.

---

## Features

- **Homepage** with a hero section and instant role search (keyboard navigable).
- **Dynamic salary pages** at `/salary/[slug]` (e.g. `/salary/software-engineer-malaysia`).
- **Salary breakdown** showing the average salary plus junior, mid and senior ranges.
- **Anonymous salary submission** form (company, role, salary, years of experience, location).
- **Fully responsive**, modern SaaS UI.
- **SEO-optimized**: per-page metadata, Open Graph/Twitter cards, JSON-LD structured data, dynamic `sitemap.xml` and `robots.txt`.
- **Works without a database** out of the box — falls back to bundled seed data so you can preview instantly.

---

## Project structure

```
salarymy/
├── supabase/
│   └── schema.sql               # Database schema, RLS policies + seed data
├── src/
│   ├── app/
│   │   ├── layout.tsx            # Root layout, global metadata, Navbar/Footer
│   │   ├── page.tsx              # Homepage (hero, search, featured roles)
│   │   ├── globals.css           # Tailwind layers + base styles
│   │   ├── not-found.tsx         # 404 page
│   │   ├── robots.ts             # robots.txt generator
│   │   ├── sitemap.ts            # sitemap.xml generator
│   │   ├── salaries/
│   │   │   └── page.tsx          # Browse all salaries
│   │   ├── salary/
│   │   │   └── [slug]/
│   │   │       └── page.tsx      # Dynamic salary detail page + JSON-LD
│   │   ├── submit/
│   │   │   └── page.tsx          # Salary submission page
│   │   └── api/
│   │       └── submissions/
│   │           └── route.ts      # POST handler that validates + stores submissions
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── Hero.tsx
│   │   ├── SearchBar.tsx          # Client component (search + keyboard nav)
│   │   ├── SalaryCard.tsx
│   │   ├── SalaryStats.tsx        # Average + junior/mid/senior breakdown
│   │   └── SubmissionForm.tsx     # Client component (form + validation)
│   ├── lib/
│   │   ├── salary.ts              # Data access + grouping (server-only)
│   │   ├── slug.ts                # slugify / buildSalarySlug / deslugify
│   │   ├── format.ts              # MYR currency + label formatting
│   │   ├── validation.ts          # Shared submission validation
│   │   ├── site.ts               # Site config for SEO/metadata
│   │   └── supabase/
│   │       ├── client.ts          # Browser client
│   │       ├── server.ts          # Server client (cookies)
│   │       └── env.ts             # Validated env access
│   └── types/
│       └── database.ts            # DB row + Database generic types
├── .env.local.example
├── next.config.ts
├── tailwind.config.ts
├── postcss.config.mjs
├── tsconfig.json
└── package.json
```

---

## Getting started (local development)

### 1. Prerequisites

- Node.js **18.18+** (Node 20 or 22 recommended)
- A [Supabase](https://supabase.com) project (free tier is fine) — optional for a first preview

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example file and fill in your Supabase credentials:

```bash
cp .env.local.example .env.local
```

| Variable                        | Required | Description                                                            |
| ------------------------------- | -------- | ---------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Yes\*    | Your Supabase project URL (Project Settings → API).                    |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes\*    | Your Supabase anon/public key. Safe to expose; protected by RLS.       |
| `NEXT_PUBLIC_SITE_URL`          | Yes      | Public site URL used for canonical links + sitemap. `http://localhost:3000` locally. |

\* If Supabase variables are omitted, the app still runs using bundled **seed data** and submissions are accepted as no-ops. Set them to enable live data + persistence.

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Useful scripts

```bash
npm run dev        # Start the dev server
npm run build      # Production build
npm run start      # Start the production server
npm run lint       # ESLint
npm run typecheck  # TypeScript type-check (no emit)
```

---

## Supabase setup

### 1. Create the schema

In the Supabase dashboard, open **SQL Editor → New query**, paste the contents of
[`supabase/schema.sql`](./supabase/schema.sql), and run it. This creates:

- An `experience_level` enum (`junior`, `mid`, `senior`).
- A **`salaries`** table (publicly readable curated/aggregated market data).
- A **`user_submissions`** table (anyone may insert; only approved rows are readable).
- Indexes, Row Level Security policies, and sample seed data.

Alternatively, with the [Supabase CLI](https://supabase.com/docs/guides/cli):

```bash
supabase db push
```

### Schema overview

**`salaries`**

| Column             | Type               | Notes                                  |
| ------------------ | ------------------ | -------------------------------------- |
| `id`               | `uuid` (PK)        | `gen_random_uuid()`                    |
| `role`             | `text`             | e.g. `Software Engineer`               |
| `location`         | `text`             | defaults to `Malaysia`                 |
| `experience_level` | `experience_level` | `junior` \| `mid` \| `senior`          |
| `salary_min`       | `integer`          | monthly MYR, `>= 0`                    |
| `salary_max`       | `integer`          | monthly MYR, `>= salary_min`           |
| `source`           | `text`             | data source label (nullable)           |
| `created_at`       | `timestamptz`      | defaults to `now()`                    |

**`user_submissions`**

| Column             | Type          | Notes                                   |
| ------------------ | ------------- | --------------------------------------- |
| `id`               | `uuid` (PK)   | `gen_random_uuid()`                     |
| `company`          | `text`        |                                         |
| `role`             | `text`        |                                         |
| `salary`           | `integer`     | monthly MYR, `>= 0`                     |
| `experience_years` | `integer`     | `0–60`                                  |
| `location`         | `text`        |                                         |
| `approved`         | `boolean`     | defaults to `false` (moderation gate)   |
| `created_at`       | `timestamptz` | defaults to `now()`                     |

> **Note:** `approved` and `created_at` are added on top of the requested columns to support moderation and ordering. They have safe defaults, so inserts only need the five core fields.

### 2. Security model (RLS)

- `salaries`: world-readable `SELECT`; no public writes. Manage rows from the dashboard or a service-role process.
- `user_submissions`: anyone can `INSERT` (via the anon key), but cannot read others' raw submissions. Only rows with `approved = true` are selectable.

---

## How salary pages work

- Each role + location pair is grouped into a single page. The slug is built from
  the role and location, e.g. `Software Engineer` + `Malaysia` →
  `software-engineer-malaysia`.
- The **average salary** is the mean of each band's midpoint.
- Pages are statically generated via `generateStaticParams` and revalidated hourly
  (`export const revalidate = 3600`). New roles added to the DB are served on demand.

---

## Deploying to Vercel

1. **Push** this project to a GitHub/GitLab/Bitbucket repository.
2. In [Vercel](https://vercel.com/new), click **Add New → Project** and import the repo.
   Vercel auto-detects Next.js — no build config changes needed.
3. Under **Settings → Environment Variables**, add the following for the
   **Production** (and **Preview**) environments:

   | Key                             | Value                                  |
   | ------------------------------- | -------------------------------------- |
   | `NEXT_PUBLIC_SUPABASE_URL`      | your Supabase project URL              |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your Supabase anon key                 |
   | `NEXT_PUBLIC_SITE_URL`          | your production URL, e.g. `https://salarymy.vercel.app` |

4. Click **Deploy**. Vercel runs `next build` and hosts the app.
5. After the first deploy, set `NEXT_PUBLIC_SITE_URL` to your final domain (custom
   domain or `*.vercel.app`) so canonical URLs, the sitemap and Open Graph tags are
   correct, then redeploy.

> Build command: `next build` · Output: handled automatically by Vercel's Next.js runtime · Install command: `npm install`.

### Post-deploy checklist

- [ ] `supabase/schema.sql` has been run against your Supabase project.
- [ ] Environment variables are set for Production **and** Preview.
- [ ] `NEXT_PUBLIC_SITE_URL` matches your live domain.
- [ ] Visit `/sitemap.xml` and `/robots.txt` to confirm SEO routes resolve.
- [ ] Submit a test salary at `/submit` and confirm a row appears in
      `user_submissions`.

---

## Notes & next steps

- Salary figures in `supabase/schema.sql` are **illustrative samples** — replace
  them with your own sourced data.
- Consider a moderation dashboard (or a Supabase Edge Function) to review and
  approve `user_submissions`, and a job to fold approved submissions into the
  `salaries` aggregates.
- Add authentication (Supabase Auth) if you want saved searches or employer accounts.

## License

MIT — use freely.
