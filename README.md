# SalaryMY

> Malaysia's salary transparency platform — explore real salary ranges by role, location and experience level, use free career tools, and contribute your own salary anonymously.

Built by [Saif Ali](https://github.com/saifali7243) with **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Supabase**.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/saifali7243/SalaryMY)

---

## Features

- **Homepage** with an animated hero, 3D parallax elements, instant role search, and a highlighted career tools section.
- **24 roles × 6 locations = 144 salary pages** — dynamically generated with full SEO.
- **Salary breakdown** showing average salary plus junior, mid and senior ranges with visual bars.
- **Filterable salary directory** at `/salaries` — search, filter by location/category, and sort.
- **Dark/Light mode** toggle with OS-aware default and no-flash persistence.
- **3D interactive UI** — tilt cards, floating glass elements, animated gradient orbs.
- **Anonymous salary submission** form with client + server validation.
- **Free career tools** at `/tools`:
  - **Expat & Malaysian Salary Calculator** — EPF, SOCSO, EIS, PCB deductions, cost-of-living comparison, 2026 expat EP policy compliance checks.
  - **ATS CV Analyzer** — drag-and-drop upload, ATS score, section detection, Malaysia market keywords, expat-specific hiring tips.
- **SEO-optimized**: per-page metadata, Open Graph/Twitter cards, JSON-LD structured data, dynamic `sitemap.xml` and `robots.txt`.
- **Works without a database** out of the box — bundled seed data so you can preview instantly.
- **Responsive** across all breakpoints, with `prefers-reduced-motion` accessibility fallback.

---

## Project structure

```
salarymy/
├── supabase/
│   └── schema.sql               # Database schema, RLS policies + seed data (24 roles × 6 locations)
├── src/
│   ├── app/
│   │   ├── layout.tsx            # Root layout, theme script, global metadata
│   │   ├── page.tsx              # Homepage (hero, stats, tools highlight, featured roles)
│   │   ├── globals.css           # Tailwind layers + semantic color tokens (light/dark)
│   │   ├── not-found.tsx         # 404 page
│   │   ├── robots.ts             # robots.txt generator
│   │   ├── sitemap.ts            # sitemap.xml generator
│   │   ├── salaries/
│   │   │   └── page.tsx          # Filterable salary directory
│   │   ├── salary/
│   │   │   └── [slug]/
│   │   │       └── page.tsx      # Dynamic salary detail page + JSON-LD
│   │   ├── submit/
│   │   │   └── page.tsx          # Salary submission page
│   │   ├── tools/
│   │   │   └── page.tsx          # Career tools (calculator + ATS analyzer)
│   │   └── api/
│   │       └── submissions/
│   │           └── route.ts      # POST handler that validates + stores submissions
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx            # Includes GitHub & LinkedIn links
│   │   ├── Hero.tsx
│   │   ├── HeroScene.tsx         # 3D parallax orbs + floating glass card
│   │   ├── ThemeToggle.tsx       # Animated sun/moon dark mode toggle
│   │   ├── SearchBar.tsx         # Client component (search + keyboard nav)
│   │   ├── SalaryCard.tsx        # 3D tilt cards with glare effect
│   │   ├── SalaryStats.tsx       # Average + junior/mid/senior breakdown
│   │   ├── SalaryDirectory.tsx   # Filterable directory (search, location, category, sort)
│   │   ├── SalaryCalculator.tsx  # Expat & Malaysian salary calculator
│   │   ├── ATSAnalyzer.tsx       # ATS CV compatibility analyzer
│   │   ├── ToolsTabs.tsx         # Tabbed tools container
│   │   └── SubmissionForm.tsx    # Client component (form + validation)
│   ├── lib/
│   │   ├── salary.ts             # Data access + grouping + categories (server-only)
│   │   ├── slug.ts               # slugify / buildSalarySlug / deslugify
│   │   ├── format.ts             # MYR currency + label formatting
│   │   ├── validation.ts         # Shared submission validation
│   │   ├── site.ts               # Site config for SEO/metadata
│   │   └── supabase/
│   │       ├── client.ts         # Browser client
│   │       ├── server.ts         # Server client (cookies)
│   │       └── env.ts            # Validated env access
│   └── types/
│       └── database.ts           # DB row + Database generic types
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

### 2. Clone & install

```bash
git clone https://github.com/saifali7243/SalaryMY.git
cd SalaryMY
npm install
```

### 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

| Variable                        | Required | Description                                                            |
| ------------------------------- | -------- | ---------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Yes\*    | Your Supabase project URL (Project Settings → API).                    |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes\*    | Your Supabase anon/public key. Safe to expose; protected by RLS.       |
| `NEXT_PUBLIC_SITE_URL`          | Yes      | Public site URL. `http://localhost:3000` locally.                       |

\* If Supabase variables are omitted, the app runs using bundled **seed data** and submissions are accepted as no-ops.

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Useful scripts

```bash
npm run dev        # Start the dev server
npm run build      # Production build (generates 154 pages)
npm run start      # Start the production server
npm run lint       # ESLint
npm run typecheck  # TypeScript type-check (no emit)
```

---

## Career Tools

### Salary Calculator (`/tools` → Tab 1)

- Toggle: **Malaysian** / **Expat Category I, II, III**
- Input: monthly gross salary + location
- Output: net pay, deduction breakdown (EPF/SOCSO/EIS/PCB), cost-of-living bar, estimated savings
- Expat-specific: 2026 Employment Pass minimum salary warnings, tax residency info, EPF opt-out notes

### ATS CV Analyzer (`/tools` → Tab 2)

- **Drag & drop** PDF/DOCX/TXT or paste text
- Circular **ATS score** (0-100) with color coding
- **Section detection**: checks for Experience, Education, Skills, Contact Info, etc.
- **Malaysia market keywords**: found vs. suggested
- **Actionable recommendations** to improve your CV
- **Expat hiring tips**: visa info, job portals, timelines, salary norms

---

## Supabase setup

### 1. Create the schema

In the Supabase dashboard, open **SQL Editor → New query**, paste the contents of
[`supabase/schema.sql`](./supabase/schema.sql), and run it. This creates:

- An `experience_level` enum (`junior`, `mid`, `senior`).
- A **`salaries`** table with 24 roles × 6 locations = 432 seed rows.
- A **`user_submissions`** table for crowdsourced data.
- Indexes, Row Level Security policies, and seed data.

### Schema overview

**`salaries`**

| Column             | Type               | Notes                                  |
| ------------------ | ------------------ | -------------------------------------- |
| `id`               | `uuid` (PK)        | `gen_random_uuid()`                    |
| `role`             | `text`             | e.g. `Software Engineer`               |
| `location`         | `text`             | e.g. `Kuala Lumpur`, `Malaysia`        |
| `experience_level` | `experience_level` | `junior` \| `mid` \| `senior`          |
| `salary_min`       | `integer`          | monthly MYR                            |
| `salary_max`       | `integer`          | monthly MYR                            |
| `source`           | `text`             | data source label                      |
| `created_at`       | `timestamptz`      |                                        |

**`user_submissions`**

| Column             | Type          | Notes                                   |
| ------------------ | ------------- | --------------------------------------- |
| `id`               | `uuid` (PK)   |                                         |
| `company`          | `text`        |                                         |
| `role`             | `text`        |                                         |
| `salary`           | `integer`     | monthly MYR                             |
| `experience_years` | `integer`     | 0–60                                    |
| `location`         | `text`        |                                         |
| `approved`         | `boolean`     | defaults to `false`                     |
| `created_at`       | `timestamptz` |                                         |

### 2. Security model (RLS)

- `salaries`: world-readable; no public writes.
- `user_submissions`: anyone can `INSERT`; only `approved = true` rows are selectable.

---

## Deploying to Vercel

1. Push this repo to GitHub (already done).
2. In [Vercel](https://vercel.com/new), import `saifali7243/SalaryMY`.
3. Add environment variables for **Production** and **Preview**:

   | Key                             | Value                                  |
   | ------------------------------- | -------------------------------------- |
   | `NEXT_PUBLIC_SUPABASE_URL`      | your Supabase project URL              |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your Supabase anon key                 |
   | `NEXT_PUBLIC_SITE_URL`          | your production URL                    |

4. Deploy. Vercel auto-detects Next.js.

### Post-deploy checklist

- [ ] `supabase/schema.sql` has been run
- [ ] Environment variables are set
- [ ] `/sitemap.xml` and `/robots.txt` resolve
- [ ] Test a salary submission at `/submit`
- [ ] Test both tools at `/tools`

---

## Tech stack

| Layer       | Technology                           |
| ----------- | ------------------------------------ |
| Framework   | Next.js 15 (App Router)              |
| Language    | TypeScript                           |
| Styling     | Tailwind CSS + CSS variables         |
| Database    | Supabase (PostgreSQL + RLS)          |
| Hosting     | Vercel                               |
| Auth        | Supabase Auth (ready to integrate)   |

---

## Author

**Saif Ali**

- GitHub: [github.com/saifali7243](https://github.com/saifali7243)
- LinkedIn: [linkedin.com/in/saifali7243](https://linkedin.com/in/saifali7243)

---

## License

MIT — use freely.
