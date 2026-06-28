# YouthPay Financial Intelligence Engine

Hackathon submission for the YouthPay CTO/Founding Engineer role.

**Live frontend:** https://hackathon-youthpay.vercel.app
**Live backend:** https://hackathon-youthpay-production.up.railway.app

---

## What This Is

A financial intelligence engine for Pakistani teenagers that reads raw bank
notifications and turns them into narrative coaching — not another dashboard with
charts.

The thesis is simple: a 15-year-old will never open a budgeting app, but she will
open something that tells her a surprising, specific, *true* thing about herself
in the voice of a smart friend. So the product is built around the pipeline that
produces that insight, and the dashboard is the last 30% of the work, not the
product itself.

The engine ingests transactions (from a seeded dataset or a live Gmail inbox),
parses Pakistani bank SMS noise, categorizes deterministically, computes behavioral
metrics in pure Python, and only *then* hands the numbers to an LLM to narrate.
Computation is deterministic and testable; the model writes prose, never math.

## The Problem (Haniya's Data)

The reference persona is Haniya Ahmed, 15, Karachi. In one month she made
**160 transactions totalling PKR 1,29,298 in spend** against a stated PKR 10,000
allowance — a ~13× gap that is itself the first product insight: teenagers don't
know where the money comes from, and they definitely don't know where it goes.

What the data actually shows:

| Signal | Value |
| --- | --- |
| Total transactions | 160 |
| Total spend | PKR 1,29,298 |
| Coffee spend | PKR 12,248 (Coffee Wagera + Chai Spot, 22 visits) |
| Late-night transactions (10 PM–4 AM) | 41 |
| Financial Health Score | 36 / 100 (Grade F) |

The Health Score is a deterministic 4-component formula (savings rate, late-night
control, category diversity, education ratio), each scored out of 25. Haniya lands
at 0 + 0 + 18 + 18 = **36**, which puts the narrative coach to work.

## The Pipeline

```
Email / Dataset → Parse → Categorize → Analyze → Insights → Dashboard
```

1. **Ingest** — 160 rows seeded in-memory at startup (default), or fetched live
   from a Gmail inbox via IMAP. Both modes emit the same raw notification strings.
2. **Parse** — a regex layer handles known Pakistani bank/EMI formats (UBL, Meezan,
   HBL, NayaPay, JazzCash), stripping JazakAllah suffixes, ATM strings, and P2P
   transfer IDs. Anything it misses falls through to an LLM parser.
3. **Categorize** — merchant → category via a deterministic lookup map (fast,
   auditable, no model in the hot path).
4. **Analyze** — pure-Python computation: category totals, time-of-day patterns,
   weekend/weekday segmentation, merchant concentration, and the Health Score.
5. **Insights** — computed metrics are passed to the LLM, which produces two
   voices per insight: teen-facing (conversational, specific) and parent-facing
   (factual, brief). Narratives are cached after first generation.
6. **Dashboard** — the frontend renders pre-computed insight objects. It is the
   output of the pipeline, not the pipeline.

## Tech Stack

| Layer | Choice |
| --- | --- |
| Frontend | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind v4, Recharts, Material Symbols |
| Data fetching | SWR |
| Backend | FastAPI (Python), no ORM, no database |
| LLM | Groq — `llama-3.3-70b-versatile` |
| Email | Gmail IMAP via App Password (no OAuth) |
| Deploy | Frontend on Vercel, Backend on Railway (Docker) |

## Project Structure

```
youthpay-mvp/
├── backend/
│   ├── main.py                 # FastAPI app, CORS, router wiring
│   ├── Dockerfile              # python:3.12-slim, binds $PORT (Railway)
│   ├── requirements.txt
│   ├── data/
│   │   └── transactions.py     # 160 rows, seeded from XLSX (single source of truth)
│   ├── routers/                # summary, transactions, insights, parse, email_ingest
│   ├── services/
│   │   ├── insight_engine.py   # pure-Python metrics + Health Score
│   │   ├── llm_service.py      # Groq narration + cache
│   │   ├── parser.py           # regex-first SMS parser + LLM fallback
│   │   └── email_fetcher.py    # Gmail IMAP
│   ├── scripts/seed.py         # XLSX → transactions.py
│   └── tests/integration_test.py
└── frontend/
    ├── app/                    # teen, insights, parent, activity, ingest, debugger
    ├── components/             # layout, teen, insights, parent, ingest, debugger, shared
    ├── hooks/                  # SWR hooks
    └── lib/                    # api, types, utils, categories
```

## Local Setup

**Backend** (from `backend/`):

```bash
python -m venv .venv && source .venv/Scripts/activate   # .venv/bin/activate on macOS/Linux
pip install -r requirements.txt
# create .env with: GROQ_API_KEY, LLM_PROVIDER=groq, DEMO_SECRET, GMAIL_USER, GMAIL_APP_PASSWORD
uvicorn main:app --reload --port 8000
```

Regenerate the dataset from the XLSX if needed: `python scripts/seed.py`
Run the integration suite (server must be up): `python tests/integration_test.py`

**Frontend** (from `frontend/`):

```bash
npm install
# .env.local: NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev   # http://localhost:3000
```

## API Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/health` | Liveness check |
| GET | `/api/summary` | Category totals, top merchants, weekend/weekday, late-night |
| GET | `/api/transactions` | Full feed; filter by `category`, `direction`, `limit`, `offset` |
| GET | `/api/insights` | The 5 computed insights with teen + parent narratives (cached) |
| POST | `/api/parse-notification` | Parse a raw bank SMS into a structured transaction |

**Bonus:** `POST /api/fetch-emails` — connects to Gmail via IMAP (App Password,
secret-gated), parses each bank email through the same engine, and merges the
results into the live feed.

## Live Demo

- **App:** https://hackathon-youthpay.vercel.app
- **API:** https://hackathon-youthpay-production.up.railway.app
  - `GET /health` → `{"status":"ok"}`
  - `GET /api/summary` → `total_debit_pkr: 129298`, `transaction_count: 160`

Walkthrough: Teen dashboard (budget + AI coach + insights + spending ring) →
Insights (5 cards, teen/parent toggle) → Parent view → Activity feed → Ingest
(paste an SMS, or fetch live from Gmail) → Engine Debugger (raw → cleaned, with
live parse latency).

## Design Decisions

- **Backend-first, UI last.** The data pipeline and computation layer were built
  and verified against exact expected numbers before a single line of UI. The 10
  integration assertions had to pass before the frontend started.
- **Deterministic math, LLM for prose only.** Every number — totals, the Health
  Score, late-night counts — is pure Python and unit-checked. The model never
  computes; it narrates the numbers it's handed. This keeps output reproducible
  and the dashboard's figures provably correct.
- **No database.** 160 rows fit in memory and load at import. Zero cold start,
  zero connection overhead, fully reproducible — the right call for a demo that
  must be live and stable.
- **Regex-first parser, LLM fallback.** Known Pakistani bank formats are handled
  by fast, auditable regex; only genuinely novel strings hit the model. Most
  parses return `method: "regex"` with high confidence.
- **Model substitution.** The brief specified `llama-3.1-70b-versatile`, which
  Groq has since decommissioned. Swapped to `llama-3.3-70b-versatile` (the
  documented successor, same tier) rather than ship a dead model id.
- **Currency formatting that matches the spec exactly.** Amounts render with
  `en-IN` grouping (`PKR 1,29,298`) to match the reference card. The intuitive
  `en-PK` locale actually produces Western grouping (`129,298`) and was rejected.
- **Cached narratives.** Insight prose is generated once and cached in memory —
  same numbers every time, fresh language only on a cold start.
- **Gmail without OAuth.** IMAP + an App Password achieves a live "real inbox"
  demo in a single env var, with no Google Cloud project or consent screen. The
  fetcher merges parsed emails into the feed idempotently (deduped, so repeat
  pulls don't duplicate rows).

## What I'd Build Next

- **Real bank connectivity** — Gmail OAuth and a Plaid-style aggregation layer as
  Pakistan's open-banking standards mature, replacing the IMAP demo path.
- **Multi-user + auth** — proper accounts, household linking, and a persistent
  datastore in place of the in-memory list.
- **Parent controls** — spending limits, category caps, and approval flows, with
  the parent dashboard becoming interactive rather than read-only.
- **Real-time ingestion** — push/webhook delivery and live feed updates instead of
  on-demand fetch.
- **Deeper intelligence** — trend detection across months, goal tracking, and
  personalized nudges trained on the behavioral layer the engine captures from day
  one.

---

*Built backend-first. Every number is computed and verified; the model only ever
writes the sentence around it.*
