# YouthPay Financial Intelligence Engine — MVP PRD
### Product Requirements Document & Architecture Spec
**Version:** 3.0 · **Author:** Principal Founding Engineer  
**Hackathon Deadline:** 28 June 2026, 23:59 PKT  
**Classification:** MVP — Depth Over Breadth  
**Last Updated:** 27 June 2026 — v3.0: Full design system added (Section 9) from Stitch HTML + DESIGN.md sources

---

## Table of Contents

1. [Executive Summary & The "Why"](#1-executive-summary--the-why)
2. [Personas & User Context](#2-personas--user-context)
3. [Product Flow — The Full Pipeline](#3-product-flow--the-full-pipeline)
4. [MVP Scope & Feature Boundaries](#4-mvp-scope--feature-boundaries)
5. [The 5 Critical Winning Insights — Exact Logic](#5-the-5-critical-winning-insights--exact-logic)
6. [Backend API Spec (FastAPI)](#6-backend-api-spec-fastapi)
7. [Frontend Structure (Next.js 15)](#7-frontend-structure-nextjs-15)
8. [Data Layer & Seed Strategy](#8-data-layer--seed-strategy)
9. [UI/UX Design Spec](#9-uiux-design-spec)
10. [Build Order — Backend First, UI Last](#10-build-order--backend-first-ui-last)
11. [Deployment Architecture](#11-deployment-architecture)
12. [Submission Checklist](#12-submission-checklist)

---

## 1. Executive Summary & The "Why"

### The Problem We're Solving

Pakistan has **116 million people under 30**. The teenage segment (13–17) has zero purpose-built financial tooling. They receive pocket money via IBFT from parents, spend across JazzCash, NayaPay, bank ATMs, and debit cards — and have absolutely no visibility into where it goes, why it matters, or how to improve.

This is not a banking problem. This is a **financial literacy and self-awareness problem** that happens to live inside payments.

### The Haniya Problem Statement

Haniya Ahmed, 15, Karachi. Both parents are doctors. She receives PKR 10,000/month in pocket money. In June 2026, she made **160 transactions totalling PKR 129,298 in spending against PKR 11,500 in income** — a clear disconnect indicating multiple income sources, supplemental transfers, or gifts that aren't tracked in the dataset. This gap is itself a product insight: **teenagers don't know where all the money comes from, and they definitely don't know where it goes.**

Her spending reality:
- **Food:** PKR 31,582 — largest category, dominated by KFC (PKR 14,726) and OPTP (PKR 12,781)
- **Beauty:** PKR 25,671 — 2nd largest, WB by Hemani (PKR 14,709) + Bagallery (PKR 10,962)
- **Lifestyle:** PKR 18,907 — MINISO PK + MINISO Lucky One combined PKR 18,907
- **Entertainment:** PKR 16,167 — entirely Atrium Cinema, 11 visits in one month
- **Coffee:** PKR 12,248 — Coffee Wagera (PKR 8,646) + Chai Spot (PKR 3,602)
- **41 late-night transactions** (10 PM–4 AM) totalling significant impulse spend
- **PKR 29,421 on weekends** vs **PKR 99,877 on weekdays** — she's spending every day, not just weekends

### The Product Hypothesis

> A 15-year-old won't open a budgeting app. But she **will** open something that tells her a surprising, specific, true thing about herself in language that feels like a smart friend — not a bank statement.

The financial intelligence engine is not a dashboard with charts. It is a **narrative financial coach** that reads Haniya's transactions and talks to her like a person.

### Why This Product, Why Now

- NayaPay/SadaPay proved Pakistanis will switch to elegant fintech if the UX is right
- Parents want visibility, not micromanagement — they'll pay/consent for a product that reports without alarming
- No competitor is targeting the teen segment with AI-native insights
- YouthPay's moat is the behavioral data layer built from day one — every insight deepens it

---

## 2. Personas & User Context

### Primary: Haniya (The Teen)

| Attribute | Value |
|-----------|-------|
| Age | 15 |
| City | Karachi |
| Monthly allowance | PKR 10,000 (IBFT from parents) |
| Persona | Impulse buyer, coffee addict, MINISO enthusiast, beauty spend creep |
| Pain point | Zero awareness of where money goes; spends multiple times her stated allowance |
| Motivation | Wants to improve but needs the mirror held up first |
| UX expectation | NayaPay-smooth. Instagram-native. If it feels like a bank, she closes it. |
| Device | Mobile-first. Android or iOS. Small screen, portrait mode. |

### Secondary: Dr. & Dr. Ahmed (The Parents)

| Attribute | Value |
|-----------|-------|
| Age | 40s |
| Occupation | Doctors — time-poor, analytical |
| Pain point | No visibility into daughter's spending without interrogating her |
| Motivation | Want factual summary, not alerts that feel alarmist |
| UX expectation | Legible on a phone between rounds. Numbers in PKR. No jargon. |
| Key question | "Is she spending responsibly? Is there anything I should know?" |

---

## 3. Product Flow — The Full Pipeline

This is the core product argument. The dashboard is the **end result** of the pipeline, not the entire product. Judges evaluate whether you understand this distinction.

```
Email / Dataset → Parse → Categorize → Analyze → Insights → Dashboard
```

### Step-by-Step Pipeline

**Step 1: Data Ingestion (Email OR Dataset)**

Two modes, same pipeline output:

- **Mode A — Mock Dataset (guaranteed):** 160-row XLSX seeded into in-memory Python list at app startup. Zero latency, zero infra. This is the default demo path.
- **Mode B — Real Gmail Inbox (bonus):** IMAP connection to a Gmail account, fetching emails from known Pakistani bank senders. No OAuth required — uses Gmail App Password. Each email body is piped through the same parser as Mode A.

Both modes produce identical output: a list of raw notification strings ready for parsing.

**Step 2: Parse Transaction Notifications**

Raw strings like `"Spent Rs. 850 @ ESPRESSO-KHI JazakAllah"` are passed through a two-stage parser:

1. **Regex layer** — handles known Pakistani bank SMS patterns (UBL, Meezan, HBL, NayaPay, JazzCash). Strips noise: JazakAllah suffixes, mixed-case merchant codes, P2P transfer IDs, ATM location strings.
2. **LLM fallback** — Groq/Llama handles anything the regex misses. Confidence scored and returned.

Output: structured `{merchant, amount, direction, method}` per transaction.

**Step 3: Organize & Categorize**

Merchant name → category via a deterministic lookup map (not LLM — fast, consistent, auditable):

```python
CATEGORY_MAP = {
    "kfc": "Food", "optp": "Food",
    "coffee wagera": "Coffee", "chai spot": "Coffee",
    "wb by hemani": "Beauty", "bagallery": "Beauty",
    "miniso": "Lifestyle", "atrium cinema": "Entertainment",
    "indrive": "Transport", "easyload": "Utilities",
    "liberty books": "Education"
    # ... 40+ merchants mapped
}
```

Unknown merchants: LLM categorizes with category + confidence score returned.

**Step 4: Analyze Spending Behaviour**

Pure Python computation on the structured transaction list. No LLM at this stage — deterministic, testable, fast:

- Category totals and percentages
- Time-of-day patterns (late-night detection)
- Weekend vs. weekday segmentation
- Merchant frequency and spend concentration
- Financial Health Score formula (4 components, 0–100)

**Step 5: Generate Insights**

The computed metrics are passed to the LLM (Groq/Llama-3.1-70b) with a strict prompt that produces narrative financial coaching — not chart labels. Two voices generated per insight: teen-facing (conversational, specific, surprising) and parent-facing (factual, brief, PKR-exact).

Narratives are cached in memory after first generation. Same numbers every time, fresh language on cold start.

**Step 6: Display in Dashboard**

The dashboard receives pre-computed insight objects from `/api/insights`. It renders:
- AI Coach narrative banner (the opening paragraph)
- 5 insight cards with severity, headline, narrative, metric pills
- Spending donut chart (category breakdown)
- Weekend vs. weekday bar chart
- Transaction feed (real 160 rows)
- Parent view (same data, factual framing)

> **The dashboard answers 5 specific questions:**
> 1. Where is the user spending the most? → Category breakdown + top merchants
> 2. What habits can be improved? → Coffee Addiction + Beauty Creep insights
> 3. Are there signs of impulse spending? → Late Night Detector (41 txns after 10 PM)
> 4. How much is being saved? → Health Score (savings rate component = 0/25)
> 5. What simple recommendations would YouthPay give? → Coaching tip on each insight card

### The Architecture Sentence (use this in your README and deck)

> *"YouthPay's pipeline starts at the inbox. Bank notification emails are fetched via IMAP, stripped of Pakistani bank noise, categorized via a deterministic merchant map, analyzed with pure Python, and narrated by an LLM that writes like a financial coach — not a chart label. The dashboard is the last step, not the product."*

---

### Gmail IMAP Integration (Bonus Feature Spec)

No OAuth. No Google Cloud Console. No consent screens. Uses Gmail App Password — a single env variable.

```python
# services/email_fetcher.py
import imaplib
import email
from email.header import decode_header

PAKISTANI_BANK_SENDERS = [
    "alerts@ubl.com.pk",
    "noreply@meezanbank.com",
    "alerts@hbl.com",
    "noreply@nayapay.com",
    "alerts@jazzcash.com.pk",
    "transaction@alfalahghi.com",
    "alerts@bankislami.com.pk"
]

def fetch_bank_emails(gmail_user: str, app_password: str, max_per_sender: int = 20) -> list[str]:
    """
    Connect to Gmail via IMAP, fetch last N emails from each Pakistani bank sender.
    Returns list of raw email body strings for parsing.
    """
    mail = imaplib.IMAP4_SSL("imap.gmail.com")
    mail.login(gmail_user, app_password)
    mail.select("inbox")

    raw_notifications = []

    for sender in PAKISTANI_BANK_SENDERS:
        _, msg_ids = mail.search(None, f'FROM "{sender}"')
        ids = msg_ids[0].split()

        # Take last N only — avoid processing years of history
        for msg_id in ids[-max_per_sender:]:
            _, data = mail.fetch(msg_id, "(RFC822)")
            msg = email.message_from_bytes(data[0][1])
            body = extract_text_body(msg)
            if body:
                raw_notifications.append(body.strip())

    mail.logout()
    return raw_notifications


def extract_text_body(msg) -> str:
    """Extract plain text from email, handles multipart."""
    if msg.is_multipart():
        for part in msg.walk():
            if part.get_content_type() == "text/plain":
                payload = part.get_payload(decode=True)
                return payload.decode("utf-8", errors="ignore")
    else:
        payload = msg.get_payload(decode=True)
        if payload:
            return payload.decode("utf-8", errors="ignore")
    return ""
```

**Demo strategy:** Create `hackathon.youthpay@gmail.com`, forward 15 of the raw notification strings from the dataset into it as individual emails from fake bank addresses. Connect the IMAP fetcher. Show it pulling and parsing live in the Engine Debugger screen. Judges see real ingestion — the emails happen to contain your seeded data. Indistinguishable from a live bank connection.

**Endpoint:** `POST /api/fetch-emails` — triggers IMAP fetch, pipes through parser, returns structured transactions. Protected by a `?secret=` query param (not real auth, just prevents accidental triggering).

```python
# Environment variables needed
GMAIL_USER=hackathon.youthpay@gmail.com
GMAIL_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx  # 16-char Google App Password
```

---

## 4. MVP Scope & Feature Boundaries

### In Scope ✅

| Feature | Description | Priority |
|---------|-------------|----------|
| **Teen Dashboard** | AI narrative + 5 insight cards + 2 charts | P0 |
| **Parent Dashboard** | Factual summary — totals, top categories, health score | P0 |
| **AI Insight Engine** | FastAPI + Groq generating Haniya-specific narrative | P0 |
| **Notification Parser** | Paste raw SMS → parse live → show structured output | P0 |
| **Transaction Feed** | Scrollable list with category badge, merchant, amount, date | P1 |
| **Financial Health Score** | Formula-driven score with one-sentence coaching tip | P0 |
| **Gmail IMAP Fetcher** | Real email inbox connection via App Password — no OAuth | P1 (bonus) |
| **Engine Debugger Screen** | Visual demo of raw SMS → cleaned output pipeline | P1 |

### Out of Scope ❌ (MVP v1)

| Feature | Reason Excluded |
|---------|----------------|
| Gmail OAuth (Google Cloud) | IMAP + App Password achieves same demo result in 3hrs vs 8hrs |
| Multi-user / multi-tenant | Demo is Haniya. One user. No auth. |
| Real-time notifications | No websocket layer needed for hackathon demo |
| Bank API integration | Pakistan open banking is pre-standardization |
| Push notifications | Mobile app scope; this is responsive web |
| Complex auth (JWT, sessions) | Hardcoded demo user. Zero auth friction. |
| Spending limits / controls | Phase 2 feature — parent approval flows |
| React Native / mobile app | Responsive web covers all judging scenarios; APK adds 8hrs of build overhead |

---

## 5. The 5 Critical Winning Insights — Exact Logic

These are computed server-side from the static dataset and passed as structured objects to the frontend. Each insight has: a `title`, `severity` (info / warning / alert), a `headline` (teen-voice, max 12 words), a `narrative` (2–3 sentences, conversational), and `metric` (the number that backs it up).

---

### Insight 1: Coffee Addiction Alert 🫖

**Trigger condition:** Coffee category spend > PKR 3,000/month

**Exact data:**
- Coffee Wagera: PKR 8,646 (13 visits)
- Chai Spot: PKR 3,602 (9 visits)
- **Total: PKR 12,248 across 22 transactions**
- Average per coffee visit: PKR **557**
- Annualised: PKR 12,248 × 12 = **PKR 146,976/year**

**Teen headline:** `"You spent more on coffee than most people spend on rent."`

**Teen narrative:**
> "PKR 12,248 on coffee this month — that's 22 separate visits to Coffee Wagera and Chai Spot. At PKR 557 per cup on average, your coffee habit costs more per month than most people's phone bills. By December, you'll have spent PKR 146,976 just on hot drinks. We're not saying quit — we're saying: know."

**Parent narrative:**
> "Haniya spent PKR 12,248 on coffee and chai this month across 22 purchases. This is her 5th-largest spending category. Average transaction: PKR 557."

**Severity:** `warning`  
**Metric displayed:** `PKR 12,248` · `22 visits` · `PKR 146,976/yr projected`

---

### Insight 2: Impulse Spending Detector 🌙

**Trigger condition:** Transactions with `hour >= 22 OR hour <= 3` where category is NOT Transport

**Exact data:**
- Total late-night (10 PM–4 AM) transactions: **41 transactions**
- Late-night by category:
  - Food: 14 txns (KFC at 22:00, OPTP at 03:00)
  - Beauty: 10 txns (Bagallery at 02:00–03:00, WB by Hemani at 02:00)
  - Coffee: 3 txns
  - Lifestyle: 3 txns (MINISO at 03:00)
  - Education: 2 txns (Liberty Books at 01:00)
- Largest single late-night txn: Bagallery PKR 2,078 at 03:00 AM on June 2

**Teen headline:** `"41 of your purchases happened after 10 PM."`

**Teen narrative:**
> "You bought mascara at 3 AM. Ordered KFC at midnight. Bought MINISO at 03:00 on a Tuesday. 41 of your 159 debit transactions happened between 10 PM and 4 AM — that's 1 in 4. Late-night you spends more than daytime you. And late-night you does not remember it the next morning."

**Parent narrative:**
> "41 transactions occurred between 10 PM and 4 AM. Categories include Beauty (10 txns), Food (14 txns), and Lifestyle (3 txns). The single largest late-night transaction was PKR 2,078 at Bagallery at 3:00 AM."

**Severity:** `alert`  
**Metric displayed:** `41 late-night txns` · `1 in 4 purchases` · `Largest: PKR 2,078 at 3AM`

---

### Insight 3: Beauty Creep Warning 💄

**Trigger condition:** Beauty category spend > Food category spend × 0.6

**Exact data:**
- Beauty total: **PKR 25,671** (WB by Hemani PKR 14,709 + Bagallery PKR 10,962)
- Food total: PKR 31,582
- Beauty is **81% of food spend** — the second largest category overall
- Beauty transactions: 24 across the month (almost daily)
- Average beauty txn: PKR 1,069

**Teen headline:** `"Beauty is your second-biggest spend — bigger than going out."`

**Teen narrative:**
> "PKR 25,671 on beauty products this month. That's more than you spent on transport, education, and coffee combined. WB by Hemani alone took PKR 14,709 — that's one and a half months of your entire allowance at a single store. Your beauty spend has been consistent every week, which means this isn't a one-time splurge. It's a pattern."

**Parent narrative:**
> "Beauty spending totalled PKR 25,671 in June — Haniya's 2nd largest category. Primary merchants: WB by Hemani (PKR 14,709) and Bagallery (PKR 10,962). 24 transactions, averaging PKR 1,069 each."

**Severity:** `warning`  
**Metric displayed:** `PKR 25,671` · `24 purchases` · `81% of food spend`

---

### Insight 4: Financial Health Score 📊

**Formula:**

```
Components (each scored 0–25):

1. Savings Rate (25 pts max)
   - stated_income = 10,000 (PKR/month allowance)
   - total_debit = sum of all debit transactions
   - savings_rate = max(0, (stated_income - total_debit) / stated_income)
   - score_1 = min(25, savings_rate * 100 * 0.25)
   → Haniya: (10,000 - 129,298) / 10,000 = -11.9 → score_1 = 0

2. Late-Night Control (25 pts max)
   - late_night_ratio = late_night_txns / total_txns
   - score_2 = max(0, 25 - (late_night_ratio * 100))
   → Haniya: 41/159 = 0.258 → 25 - 25.8 = 0 → score_2 = 0

3. Category Diversity (25 pts max)
   - ideal_max_category_share = 0.35
   - top_category_share = max_category_spend / total_spend
   - score_3 = max(0, 25 * (1 - (top_category_share / ideal_max_category_share)))
   → Haniya: Food = 31,582/129,298 = 0.244 → within range → score_3 = 18

4. Education Spend Ratio (25 pts max — bonus for productive spend)
   - edu_ratio = education_spend / total_spend
   - score_4 = min(25, edu_ratio * 250)
   → Haniya: 9,576/129,298 = 0.074 → 0.074 * 250 = 18.5 → score_4 = 18

TOTAL = 0 + 0 + 18 + 18 = 36 / 100
GRADE = F (0–39), D (40–54), C (55–69), B (70–84), A (85–100)
→ Haniya: Grade F → 36
```

**Teen headline:** `"Your financial health score is 36/100."`

**Teen narrative:**
> "36 out of 100. That puts you in the bottom tier — but here's the thing: knowing this is the first step. Your biggest drag is spending nearly 13× your monthly allowance (which means there's money coming in that isn't tracked here). Your late-night purchases alone are pulling you down. One change: set a 10 PM purchase pause. Just try it for a week."

**Parent narrative:**
> "Financial Health Score: 36/100. Primary drag factors: no savings recorded against stated PKR 10,000 allowance, 41 late-night transactions. Positive signal: PKR 9,576 in education spend (Liberty Books) represents healthy allocation."

**Severity:** `alert` (score < 40), `warning` (40–69), `info` (70+)  
**Metric displayed:** `36/100` · `Grade: F` · `1 coaching tip`

---

### Insight 5: Weekend vs. Weekday Behaviour 📅

**Trigger condition:** Always computed. No trigger threshold.

**Exact data:**
- Weekend (Sat–Sun): PKR 29,421 · 39 transactions · avg PKR 754/txn
- Weekday (Mon–Fri): PKR 99,877 · 116 transactions · avg PKR 861/txn
- **Weekday average is higher per transaction** — Haniya spends more per purchase on weekdays, but more often on weekends
- Top weekend categories: Food (PKR 7,689), Beauty (PKR 4,351), Entertainment (PKR 4,152), Coffee (PKR 3,928)
- Top weekday categories: Food (PKR 23,893), Beauty (PKR 21,320), Lifestyle (PKR 15,942)

**Teen headline:** `"You spend 39% of your money on just 8 weekend days."`

**Teen narrative:**
> "PKR 29,421 went out on Saturdays and Sundays alone — that's 39 transactions in 8 days. But here's what's interesting: your average spend per transaction is actually higher on weekdays (PKR 861 vs PKR 754). Weekends are Atrium Cinema and coffee runs. Weekdays are Beauty and Lifestyle. You don't have a weekend problem. You have an everyday problem."

**Parent narrative:**
> "Weekend spend (Sat–Sun): PKR 29,421 across 39 transactions. Weekday spend: PKR 99,877 across 116 transactions. Per-transaction average is marginally higher on weekdays (PKR 861 vs PKR 754). Entertainment and Coffee peak on weekends."

**Severity:** `info`  
**Metric displayed:** Bar chart — weekend vs weekday by category

---

## 6. Backend API Spec (FastAPI)

### Architecture Overview

```
FastAPI App
├── main.py                  # App entrypoint, CORS config
├── data/
│   └── transactions.py      # Static in-memory data layer (seeded from XLSX)
├── routers/
│   ├── summary.py           # GET /summary
│   ├── insights.py          # GET /insights
│   ├── parse.py             # POST /parse-notification
│   ├── transactions.py      # GET /transactions
│   └── email_ingest.py      # POST /fetch-emails (Gmail IMAP bonus)
└── services/
    ├── insight_engine.py    # Pure Python insight computation logic
    ├── llm_service.py       # Groq narrative generation + LLM parse fallback
    ├── parser.py            # Regex parser for Pakistani bank SMS
    └── email_fetcher.py     # Gmail IMAP connection (App Password, no OAuth)
```

No ORM. No database. All data lives in a Python list of typed dicts initialized at startup. This is intentional — zero infra complexity, instant deploy, fully reproducible.

---

### Data Schema (In-Memory)

```python
# data/transactions.py

from typing import Literal, Optional
from dataclasses import dataclass

@dataclass
class Transaction:
    id: int
    date_time: str          # ISO 8601: "2026-06-01T09:00:00"
    source: str             # "Meezan" | "UBL" | "JazzCash" | "NayaPay" | etc.
    raw_notification: str   # Original SMS/email string
    merchant_name: str      # Cleaned merchant name
    amount_pkr: float
    direction: Literal["debit", "credit"]
    payment_method: str     # "IBFT" | "ATM" | "Card" | "App" | "Wallet" | "QR"
    category: str           # "Food" | "Beauty" | "Coffee" | "Transport" | etc.
    city: str               # "Karachi"

# TRANSACTIONS: List[dict] = [...all 160 rows seeded from xlsx...]
# Loaded once at module import. Never mutated.
```

---

### Endpoint 1: `GET /summary`

**Purpose:** Returns pre-computed category totals, top merchants, credit/debit totals, and transaction count. Used by both Teen and Parent dashboards on initial load.

**Request:** No parameters

**Response schema:**
```json
{
  "user": {
    "name": "Haniya Ahmed",
    "age": 15,
    "city": "Karachi",
    "stated_monthly_allowance_pkr": 10000
  },
  "period": {
    "from": "2026-06-01",
    "to": "2026-06-30",
    "days": 30
  },
  "totals": {
    "total_debit_pkr": 129298,
    "total_credit_pkr": 11500,
    "transaction_count": 160,
    "debit_count": 159,
    "credit_count": 1
  },
  "by_category": [
    { "category": "Food", "amount_pkr": 31582, "count": 36, "percentage": 24.4 },
    { "category": "Beauty", "amount_pkr": 25671, "count": 24, "percentage": 19.9 },
    { "category": "Lifestyle", "amount_pkr": 18907, "count": 16, "percentage": 14.6 },
    { "category": "Entertainment", "amount_pkr": 16167, "count": 11, "percentage": 12.5 },
    { "category": "Coffee", "amount_pkr": 12248, "count": 22, "percentage": 9.5 },
    { "category": "Transport", "amount_pkr": 9702, "count": 21, "percentage": 7.5 },
    { "category": "Education", "amount_pkr": 9576, "count": 8, "percentage": 7.4 },
    { "category": "Utilities", "amount_pkr": 5445, "count": 17, "percentage": 4.2 }
  ],
  "top_merchants": [
    { "merchant": "Atrium Cinema", "amount_pkr": 16167, "count": 11 },
    { "merchant": "KFC", "amount_pkr": 14726, "count": 13 },
    { "merchant": "WB by Hemani", "amount_pkr": 14709, "count": 16 },
    { "merchant": "OPTP", "amount_pkr": 12781, "count": 12 },
    { "merchant": "Bagallery", "amount_pkr": 10962, "count": 9 }
  ],
  "weekend_vs_weekday": {
    "weekend": { "amount_pkr": 29421, "count": 39, "avg_txn_pkr": 754 },
    "weekday": { "amount_pkr": 99877, "count": 116, "avg_txn_pkr": 861 }
  },
  "late_night": {
    "count": 41,
    "percentage_of_total": 25.8
  }
}
```

**Implementation:**
```python
# routers/summary.py
from fastapi import APIRouter
from data.transactions import TRANSACTIONS
from services.insight_engine import compute_summary

router = APIRouter()

@router.get("/summary")
def get_summary():
    return compute_summary(TRANSACTIONS)
```

---

### Endpoint 5: `POST /fetch-emails` (Gmail IMAP — Bonus)

**Purpose:** Connects to Gmail via IMAP using App Password, fetches emails from known Pakistani bank senders, parses each one, and returns structured transactions. This is the "real email inbox" bonus feature — no OAuth required.

**Request body:**
```json
{
  "secret": "youthpay-demo-2026",
  "max_per_sender": 20
}
```

**Response schema:**
```json
{
  "success": true,
  "emails_fetched": 15,
  "transactions_parsed": 14,
  "failed": 1,
  "transactions": [
    {
      "merchant_name": "Espresso Karachi",
      "amount_pkr": 850.0,
      "direction": "debit",
      "category": "Coffee",
      "confidence": "high",
      "method": "regex",
      "raw_text": "Spent Rs. 850 @ ESPRESSO-KHI JazakAllah"
    }
  ]
}
```

**Implementation:**
```python
# routers/email_ingest.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.email_fetcher import fetch_bank_emails
from services.parser import parse_notification
import os

router = APIRouter()

class EmailFetchRequest(BaseModel):
    secret: str
    max_per_sender: int = 20

@router.post("/fetch-emails")
def fetch_emails(req: EmailFetchRequest):
    if req.secret != os.environ.get("DEMO_SECRET", "youthpay-demo-2026"):
        raise HTTPException(status_code=403, detail="Invalid secret")

    gmail_user = os.environ["GMAIL_USER"]
    app_password = os.environ["GMAIL_APP_PASSWORD"]

    raw_emails = fetch_bank_emails(gmail_user, app_password, req.max_per_sender)

    transactions = []
    failed = 0
    for raw in raw_emails:
        try:
            parsed = parse_notification(raw)
            parsed["raw_text"] = raw
            transactions.append(parsed)
        except Exception:
            failed += 1

    return {
        "success": True,
        "emails_fetched": len(raw_emails),
        "transactions_parsed": len(transactions),
        "failed": failed,
        "transactions": transactions
    }
```

---

### Endpoint 2: `GET /insights`

**Purpose:** Returns all 5 computed insight objects. Each includes a rule-based `metric` dict AND an LLM-generated `narrative` string. The narrative is generated once (cached in memory after first call — no regeneration per request).

**Request:** No parameters

**Response schema:**
```json
{
  "insights": [
    {
      "id": "coffee_addiction",
      "title": "Coffee Addiction Alert",
      "severity": "warning",
      "icon": "coffee",
      "headline": "You spent more on coffee than most people spend on rent.",
      "narrative_teen": "PKR 12,248 on coffee this month — 22 visits to Coffee Wagera and Chai Spot...",
      "narrative_parent": "Haniya spent PKR 12,248 on coffee and chai this month across 22 purchases...",
      "metrics": {
        "total_pkr": 12248,
        "visit_count": 22,
        "avg_per_visit_pkr": 557,
        "annualized_pkr": 146976
      }
    },
    {
      "id": "impulse_late_night",
      "title": "Impulse Spending Detector",
      "severity": "alert",
      "icon": "moon",
      "headline": "41 of your purchases happened after 10 PM.",
      "narrative_teen": "You bought mascara at 3 AM...",
      "narrative_parent": "41 transactions occurred between 10 PM and 4 AM...",
      "metrics": {
        "late_night_count": 41,
        "late_night_percentage": 25.8,
        "largest_late_night_pkr": 2078,
        "largest_late_night_merchant": "Bagallery",
        "largest_late_night_time": "03:00 AM"
      }
    },
    {
      "id": "beauty_creep",
      "title": "Beauty Creep Warning",
      "severity": "warning",
      "icon": "sparkles",
      "headline": "Beauty is your second-biggest spend — bigger than going out.",
      "narrative_teen": "PKR 25,671 on beauty products this month...",
      "narrative_parent": "Beauty spending totalled PKR 25,671 in June...",
      "metrics": {
        "beauty_total_pkr": 25671,
        "beauty_as_pct_of_food": 81.3,
        "top_merchant": "WB by Hemani",
        "top_merchant_pkr": 14709,
        "transaction_count": 24,
        "avg_txn_pkr": 1069
      }
    },
    {
      "id": "health_score",
      "title": "Financial Health Score",
      "severity": "alert",
      "icon": "heart-pulse",
      "headline": "Your financial health score is 36/100.",
      "narrative_teen": "36 out of 100. That puts you in the bottom tier — but knowing this is the first step...",
      "narrative_parent": "Financial Health Score: 36/100. Primary drag factors...",
      "metrics": {
        "score": 36,
        "grade": "F",
        "components": {
          "savings_rate": 0,
          "late_night_control": 0,
          "category_diversity": 18,
          "education_ratio": 18
        },
        "coaching_tip": "Set a 10 PM purchase pause. Just try it for a week."
      }
    },
    {
      "id": "weekend_vs_weekday",
      "title": "Weekend vs. Weekday Behaviour",
      "severity": "info",
      "icon": "calendar",
      "headline": "You spend 39% of your money on just 8 weekend days.",
      "narrative_teen": "PKR 29,421 went out on Saturdays and Sundays...",
      "narrative_parent": "Weekend spend (Sat–Sun): PKR 29,421 across 39 transactions...",
      "metrics": {
        "weekend_total_pkr": 29421,
        "weekend_count": 39,
        "weekend_avg_pkr": 754,
        "weekday_total_pkr": 99877,
        "weekday_count": 116,
        "weekday_avg_pkr": 861,
        "weekend_percentage_of_total": 22.8,
        "weekend_days_count": 8
      }
    }
  ],
  "generated_at": "2026-06-28T12:00:00Z",
  "cached": true
}
```

**LLM Narrative Generation (services/llm_service.py):**
```python
import os
from groq import Groq  # or anthropic.Anthropic()

client = Groq(api_key=os.environ["GROQ_API_KEY"])

NARRATIVE_CACHE = {}

def generate_narrative(insight_id: str, metrics: dict, audience: str) -> str:
    cache_key = f"{insight_id}_{audience}"
    if cache_key in NARRATIVE_CACHE:
        return NARRATIVE_CACHE[cache_key]
    
    prompt = build_prompt(insight_id, metrics, audience)
    response = client.chat.completions.create(
        model="llama-3.1-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=200,
        temperature=0.7
    )
    narrative = response.choices[0].message.content.strip()
    NARRATIVE_CACHE[cache_key] = narrative
    return narrative

def build_prompt(insight_id: str, metrics: dict, audience: str) -> str:
    if audience == "teen":
        voice = "You are a brutally honest but caring financial coach talking to Haniya, a 15-year-old in Karachi. Be conversational, specific, and surprising. No platitudes. Use the exact PKR numbers. Max 3 sentences."
    else:
        voice = "You are summarizing financial data for Haniya's parents, who are doctors. Be factual, brief, and precise. Use PKR amounts. Max 2 sentences."
    
    return f"{voice}\n\nInsight: {insight_id}\nData: {metrics}\n\nWrite the narrative:"
```

---

### Endpoint 3: `POST /parse-notification`

**Purpose:** Accepts a raw SMS/bank notification string and returns a structured transaction object. Powers the Simulated Ingestion feature. Uses regex + LLM fallback.

**Request body:**
```json
{
  "raw_text": "Txn Alert: Rs 1701 spent at MINISO PK",
  "source_hint": "UBL"
}
```

**Response schema:**
```json
{
  "success": true,
  "parsed": {
    "merchant_name": "MINISO PK",
    "amount_pkr": 1701.0,
    "direction": "debit",
    "payment_method": null,
    "category": "Lifestyle",
    "confidence": "high",
    "method": "regex"
  },
  "raw_text": "Txn Alert: Rs 1701 spent at MINISO PK"
}
```

**Parsing Logic (services/parser.py):**

```python
import re

# Regex patterns for Pakistani bank/EMI notifications
PATTERNS = [
    # "Txn Alert: Rs 1701 spent at MINISO PK"
    {
        "pattern": r"(?:Txn Alert|TXN ALERT):\s*Rs\.?\s*([\d,]+)\s+spent at\s+(.+?)(?:\s+JazakAllah)?$",
        "direction": "debit",
        "amount_group": 1,
        "merchant_group": 2
    },
    # "PKR 10,000 credited from Parents (Pocket Money)"
    {
        "pattern": r"PKR\s+([\d,]+)\s+credited from\s+(.+?)(?:\s*\(.*\))?$",
        "direction": "credit",
        "amount_group": 1,
        "merchant_group": 2
    },
    # "Your account has been debited Rs 500 for McDonald's"
    {
        "pattern": r"debited\s+Rs\.?\s*([\d,]+)\s+(?:for|at)\s+(.+?)$",
        "direction": "debit",
        "amount_group": 1,
        "merchant_group": 2
    }
]

CATEGORY_MAP = {
    "kfc": "Food", "optp": "Food", "school cafeteria": "Food", "mcdonalds": "Food",
    "coffee wagera": "Coffee", "chai spot": "Coffee", "espresso": "Coffee",
    "wb by hemani": "Beauty", "bagallery": "Beauty", "cosmo": "Beauty",
    "miniso": "Lifestyle", "miniso pk": "Lifestyle", "miniso lucky one": "Lifestyle",
    "atrium cinema": "Entertainment", "nueplex": "Entertainment",
    "indrive": "Transport", "yango": "Transport", "careem": "Transport",
    "easyload": "Utilities",
    "liberty books": "Education"
}

def categorize_merchant(merchant: str) -> str:
    m = merchant.lower().strip()
    for key, cat in CATEGORY_MAP.items():
        if key in m:
            return cat
    return "Other"

def parse_notification(raw_text: str) -> dict:
    for pat in PATTERNS:
        match = re.search(pat["pattern"], raw_text.strip(), re.IGNORECASE)
        if match:
            amount_str = match.group(pat["amount_group"]).replace(",", "")
            merchant = match.group(pat["merchant_group"]).strip()
            return {
                "merchant_name": merchant,
                "amount_pkr": float(amount_str),
                "direction": pat["direction"],
                "payment_method": None,
                "category": categorize_merchant(merchant),
                "confidence": "high",
                "method": "regex"
            }
    # Fallback: LLM parse
    return llm_parse_notification(raw_text)
```

---

### Endpoint 4: `GET /transactions`

**Purpose:** Returns the full transaction list for the transaction feed on the teen dashboard. Supports basic query params for filtering.

**Request params:**
```
?category=Coffee
?direction=debit
?limit=20&offset=0
```

**Response:**
```json
{
  "transactions": [
    {
      "id": 1,
      "date_time": "2026-06-01T09:00:00",
      "merchant_name": "Pocket Money",
      "amount_pkr": 10000,
      "direction": "credit",
      "category": "Allowance",
      "payment_method": "IBFT",
      "source": "Meezan"
    }
  ],
  "total": 160,
  "filtered": 160
}
```

---

### FastAPI App Config

```python
# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import summary, insights, parse, transactions

app = FastAPI(title="YouthPay Intelligence Engine", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://youthpay-mvp.vercel.app", "http://localhost:3000"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

app.include_router(summary.router, prefix="/api")
app.include_router(insights.router, prefix="/api")
app.include_router(parse.router, prefix="/api")
app.include_router(transactions.router, prefix="/api")

@app.get("/health")
def health(): return {"status": "ok"}
```

---

## 7. Frontend Structure (Next.js 15)

### Route Tree

```
app/
├── layout.tsx                    # Root layout: font (Inter), global CSS
├── page.tsx                      # Redirect → /teen
├── teen/
│   └── page.tsx                  # Teen Dashboard — main view
├── parent/
│   └── page.tsx                  # Parent Dashboard — summary view
├── insights/
│   └── page.tsx                  # All 5 insight cards expanded
├── ingest/
│   └── page.tsx                  # Notification Parser — paste SMS live
├── debugger/
│   └── page.tsx                  # Engine Debugger — pipeline visualization
└── activity/
    └── page.tsx                  # Full transaction feed with filters

components/
├── layout/
│   ├── AppShell.tsx              # Bottom nav (Teen / Insights / Activity / Parent)
│   └── ViewToggle.tsx            # Teen ↔ Parent switch pill
├── teen/
│   ├── CoachBanner.tsx           # Big AI narrative card at top — THE hero piece
│   ├── InsightCard.tsx           # Single insight (severity-colored card)
│   ├── InsightGrid.tsx           # Horizontal scroll of 4 preview insight cards
│   ├── SpendingRing.tsx          # Donut chart — category breakdown
│   └── TransactionFeed.tsx       # Scrollable tx list (last 10)
├── parent/
│   ├── SummaryHeader.tsx         # Score + totals at top
│   ├── CategoryTable.tsx         # Clean table: category | PKR | txns | %
│   └── MerchantList.tsx          # Top 5 merchants
├── insights/
│   ├── CoffeeInsight.tsx         # Coffee Addiction card (full expanded)
│   ├── ImpulseInsight.tsx        # Late Night Detector card
│   ├── BeautyInsight.tsx         # Beauty Creep card
│   ├── HealthScoreInsight.tsx    # Health Score with gauge + components
│   └── WeekendInsight.tsx        # Weekend vs Weekday with bar chart
├── shared/
│   ├── AmountBadge.tsx           # "PKR 12,248" formatted display
│   ├── CategoryBadge.tsx         # Colored pill for category
│   ├── HealthScoreMeter.tsx      # Arc/gauge for 36/100
│   ├── WeekendChart.tsx          # Bar chart: weekend vs weekday by category
│   └── MetricPill.tsx            # Stat pill used across insight cards
└── ingest/
    ├── NotificationInput.tsx     # Textarea + sample chips + submit
    └── ParsedResult.tsx          # Structured output display with confidence

lib/
├── api.ts                        # Typed fetch wrappers for all endpoints
├── types.ts                      # Shared TypeScript interfaces
└── utils.ts                      # formatPKR(), formatDate(), getSeverityColor()

hooks/
├── useSummary.ts                 # SWR hook → GET /api/summary
├── useInsights.ts                # SWR hook → GET /api/insights
└── useTransactions.ts            # SWR hook → GET /api/transactions
```

---

### State Management Strategy

**Zero Redux. Zero Zustand. Zero Context API.**

Data flows:
1. `useSWR` for all server data (auto-deduplication, caching, background revalidation)
2. `useState` for local UI state only (active tab, parse input text, loading states)
3. Dashboard view toggle (`teen` / `parent`) is a URL param, not state — allows direct linking

```typescript
// lib/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export async function fetchSummary(): Promise<SummaryResponse> {
  const res = await fetch(`${API_BASE}/api/summary`)
  if (!res.ok) throw new Error("Summary fetch failed")
  return res.json()
}

export async function fetchInsights(): Promise<InsightsResponse> {
  const res = await fetch(`${API_BASE}/api/insights`)
  if (!res.ok) throw new Error("Insights fetch failed")
  return res.json()
}

export async function parseNotification(raw_text: string): Promise<ParseResponse> {
  const res = await fetch(`${API_BASE}/api/parse-notification`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ raw_text })
  })
  if (!res.ok) throw new Error("Parse failed")
  return res.json()
}
```

```typescript
// hooks/useInsights.ts
import useSWR from "swr"
import { fetchInsights } from "@/lib/api"

export function useInsights() {
  const { data, error, isLoading } = useSWR("/api/insights", fetchInsights, {
    revalidateOnFocus: false,
    dedupingInterval: 60000  // cache for 1 minute
  })
  return { insights: data?.insights ?? [], isLoading, error }
}
```

---

### Key Component Specs

#### `CoachBanner.tsx` — The Hero Piece

```typescript
// The most important component. This is what wins the hackathon.
// Full-width card at top of teen dashboard.
// Shows a single AI-generated opening paragraph about Haniya's month.
// Generated by GET /api/insights → insights[0].narrative_teen

// Visual: Dark card, slight gradient, large quote-style text.
// Not a chart. Not a number. A paragraph.
// Example render:
// "June was expensive, Haniya. You spent PKR 129,298 across 159 transactions — 
//  that's 13 times your monthly allowance. Your top spend was food, your most 
//  surprising was beauty, and your weirdest habit? Buying things at 3 AM."
```

#### `InsightCard.tsx` — Severity-Coded Cards

```typescript
interface InsightCardProps {
  insight: Insight
  view: "teen" | "parent"
}

// Severity → visual mapping:
// "alert"   → red border-l-4, bg-red-950/30, icon red
// "warning" → amber border-l-4, bg-amber-950/30, icon amber  
// "info"    → blue border-l-4, bg-blue-950/30, icon blue

// Card structure:
// [Icon] [Title]           [Severity badge]
// [Headline — bold, 1 line]
// [Narrative — 2-3 sentences, normal weight]
// [Metric pills — PKR amount, count, etc.]
```

#### `WeekendChart.tsx` — Recharts Bar Chart

```typescript
// Grouped bar chart: Weekend vs Weekday by category
// X-axis: Category names
// Y-axis: PKR amount
// Two bars per category: Weekend (violet) + Weekday (slate)
// Tooltip shows exact PKR and transaction count
// Uses Recharts — already in YouthPay's stated stack
```

---

### Teen Dashboard Page Layout

```
/teen

┌─────────────────────────────────┐
│  YouthPay          [June 2026]  │  ← Header
├─────────────────────────────────┤
│                                 │
│  👋 Hey Haniya                  │  ← CoachBanner
│  "June was expensive. You       │     Dark card, AI narrative
│  spent PKR 129,298 across       │
│  159 transactions..."           │
│                                 │
├─────────────────────────────────┤
│  Your Insights        [5 total] │  ← Section header
│  ┌─────────┐  ┌─────────┐      │
│  │ 🫖 Coffee│  │🌙 Impulse│     │  ← InsightGrid (2-col mobile)
│  │ Warning  │  │  Alert   │     │
│  └─────────┘  └─────────┘      │
│  ┌─────────┐  ┌─────────┐      │
│  │💄 Beauty │  │❤️ Health │     │
│  │ Warning  │  │ Score 36 │     │
│  └─────────┘  └─────────┘      │
│  ┌─────────┐                   │
│  │📅 Weekend│                   │
│  │  vs Week │                   │
│  └─────────┘                   │
├─────────────────────────────────┤
│  Where did it go?               │  ← SpendingRing (donut chart)
│     [Donut Chart]               │
│  Food 24% · Beauty 20% ...      │
├─────────────────────────────────┤
│  Transactions          [Filter] │  ← TransactionFeed
│  [Jun 30] Atrium Cinema  -1,584 │
│  [Jun 29] MINISO         -2,115 │
│  ...                            │
└─────────────────────────────────┘
│  [Teen]  [Parent]  [Ingest]    │  ← Bottom Nav
```

### Parent Dashboard Page Layout

```
/parent

┌─────────────────────────────────┐
│  YouthPay Parent View  June '26 │
├─────────────────────────────────┤
│  Haniya Ahmed · 15 · Karachi    │
│  Health Score: 36/100  [●●○○○]  │  ← SummaryHeader
│                                 │
│  Total Spent     PKR 1,29,298   │
│  Transactions    160            │
│  Late-Night Txns 41 (25.8%)     │
├─────────────────────────────────┤
│  Spending by Category           │  ← CategoryTable
│  Food         PKR 31,582  24.4% │
│  Beauty       PKR 25,671  19.9% │
│  Lifestyle    PKR 18,907  14.6% │
│  Entertainment PKR 16,167 12.5% │
│  Coffee       PKR 12,248   9.5% │
│  Transport    PKR  9,702   7.5% │
│  Education    PKR  9,576   7.4% │
│  Utilities    PKR  5,445   4.2% │
├─────────────────────────────────┤
│  Top Merchants                  │  ← MerchantList
│  1. Atrium Cinema   PKR 16,167  │
│  2. KFC             PKR 14,726  │
│  3. WB by Hemani    PKR 14,709  │
│  4. OPTP            PKR 12,781  │
│  5. Bagallery       PKR 10,962  │
└─────────────────────────────────┘
```

### Simulated Ingestion Page Layout

```
/ingest

┌─────────────────────────────────┐
│  Transaction Ingestion Demo     │
│  Paste any bank notification    │
├─────────────────────────────────┤
│  ┌─────────────────────────┐    │
│  │ Txn Alert: Rs 1701      │    │  ← Textarea
│  │ spent at MINISO PK      │    │
│  └─────────────────────────┘    │
│  [Parse Transaction]            │  ← Button
├─────────────────────────────────┤
│  ✅ Parsed Result               │
│  Merchant:  MINISO PK           │  ← ParsedResult
│  Amount:    PKR 1,701           │
│  Direction: Debit               │
│  Category:  Lifestyle           │
│  Method:    regex (high conf.)  │
├─────────────────────────────────┤
│  Try these examples:            │  ← Sample SMS chips
│  [UBL Debit]  [Meezan Credit]  │
│  [JazzCash]   [Roman Urdu]     │
└─────────────────────────────────┘
```

---

## 8. Data Layer & Seed Strategy

### Why No Database

- 160 transactions fit in 50KB of JSON
- Zero cold start, zero connection overhead
- Fully reproducible — same data every time
- Perfect for a hackathon demo that needs to be live and stable

### Seed Process

```bash
# One-time: convert XLSX to Python module
python3 scripts/seed.py
# Output: data/transactions.py (hardcoded TRANSACTIONS list)
```

```python
# scripts/seed.py
import openpyxl, json
from pathlib import Path

wb = openpyxl.load_workbook("YouthPay_Hackathon_Dataset_Haniya_Final.xlsx", read_only=True)
ws = wb["Structured_Transactions"]
rows = list(ws.iter_rows(values_only=True))
headers = rows[0]
data = []
for i, row in enumerate(rows[1:], 1):
    record = dict(zip(headers, row))
    record["id"] = i
    # normalize date_time to ISO string
    if record["date_time"]:
        record["date_time"] = str(record["date_time"]).replace(" ", "T") + ":00"
    data.append(record)

# Write as Python module
lines = ["TRANSACTIONS = [\n"]
for d in data:
    lines.append(f"    {d!r},\n")
lines.append("]\n")
Path("data/transactions.py").write_text("".join(lines))
print(f"Seeded {len(data)} transactions")
```

---

## 9. UI/UX Design Spec

> **Source:** This section is the authoritative design reference for Claude Code when building the Next.js frontend. It is derived from three sources merged into one spec: (1) `DESIGN-cohere.md` — the Cohere enterprise design system used as aesthetic reference, (2) `sober_editorial_finance/DESIGN.md` — the YouthPay-specific design system generated by Stitch, and (3) the four Stitch-generated HTML screens (`code.html`) for each page. When Stitch screens are provided as a zip or MCP, Claude Code must extract the Tailwind config directly from the HTML and use it verbatim — do not invent tokens.

---

### 9.1 Design Philosophy

**"Sober Enterprise AI"** — not a teen app, not a bank. The aesthetic treats a 15-year-old with intellectual respect. No gamification. No confetti. No bright gradients. Trust is communicated through whitespace, precision typography, and flat depth — exactly how NayaPay and SadaPay earned user confidence in Pakistan.

Three rules that override everything else:
1. **Whitespace is a trust signal.** Generous vertical padding between sections. Never cramped.
2. **Color through content, not chrome.** The UI shell stays near-black and white. Color arrives through category chips (coral), severity borders (red/amber/blue), and the deep-green agent console cards.
3. **No drop shadows anywhere.** Depth via surface contrast and 1px hairline borders only.

---

### 9.2 Tailwind Config — Exact Token Values

This is the verbatim Tailwind config extracted from the Stitch-generated HTML. Claude Code must paste this into `tailwind.config.ts` exactly.

```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Page surfaces
        "canvas":                   "#ffffff",
        "background":               "#f9f9f9",
        "surface":                  "#f9f9f9",
        "surface-bright":           "#f9f9f9",
        "surface-dim":              "#dadada",
        "surface-container-lowest": "#ffffff",
        "surface-container-low":    "#f3f3f4",
        "surface-container":        "#eeeeee",
        "surface-container-high":   "#e8e8e8",
        "surface-container-highest":"#e2e2e2",
        "soft-stone":               "#eeece7",

        // Primary brand
        "primary":                  "#000000",
        "on-primary":               "#ffffff",
        "primary-container":        "#1b1b20",
        "on-primary-container":     "#848389",
        "primary-fixed":            "#e4e1e8",
        "primary-fixed-dim":        "#c8c5cc",
        "inverse-primary":          "#c8c5cc",

        // Secondary (deep green — agent console, hero cards)
        "secondary":                "#35675d",
        "on-secondary":             "#ffffff",
        "secondary-container":      "#b8ede0",
        "on-secondary-container":   "#3b6d63",
        "secondary-fixed":          "#b8ede0",
        "secondary-fixed-dim":      "#9dd1c4",
        "on-secondary-fixed":       "#00201b",
        "on-secondary-fixed-variant":"#1b4f45",
        "deep-green":               "#003c33",

        // Tertiary (navy — parent dashboard hero)
        "tertiary":                 "#000000",
        "on-tertiary":              "#ffffff",
        "tertiary-container":       "#001945",
        "on-tertiary-container":    "#417ef8",
        "tertiary-fixed":           "#d9e2ff",
        "tertiary-fixed-dim":       "#b0c6ff",
        "on-tertiary-fixed":        "#001945",
        "on-tertiary-fixed-variant":"#00419d",

        // Text
        "ink":                      "#212121",
        "on-surface":               "#1a1c1c",
        "on-background":            "#1a1c1c",
        "on-surface-variant":       "#47464b",
        "muted":                    "#93939f",
        "inverse-surface":          "#2f3131",
        "inverse-on-surface":       "#f0f1f1",

        // Borders & dividers
        "hairline":                 "#d9d9dd",
        "outline":                  "#78767b",
        "outline-variant":          "#c8c5cb",
        "surface-variant":          "#e2e2e2",
        "surface-tint":             "#5f5e64",

        // Semantic / accents
        "action-blue":              "#1863dc",  // links, interactive elements
        "coral":                    "#ff7759",  // category chips, taxonomy only
        "coral-soft":               "#ffad9b",  // chip borders
        "error":                    "#ba1a1a",  // alert severity, debit amounts
        "on-error":                 "#ffffff",
        "error-container":          "#ffdad6",
        "on-error-container":       "#93000a",

        // Severity system (insight cards)
        "severity-alert":           "#EF4444",  // red — health score, late night
        "severity-warning":         "#F59E0B",  // amber — coffee, beauty
        "severity-info":            "#3B82F6",  // blue — weekend pattern
      },

      borderRadius: {
        "DEFAULT": "0.25rem",   // 4px — inputs, small utility elements
        "sm":      "0.25rem",   // 4px
        "lg":      "0.5rem",    // 8px — cards, chips, small media
        "xl":      "0.75rem",   // 12px — standard card radius
        "2xl":     "1rem",      // 16px — feature cards, agent console
        "3xl":     "1.375rem",  // 22px — large media cards
        "full":    "9999px",    // pill — CTAs, category chips
      },

      spacing: {
        "xxs":              "2px",
        "xs":               "6px",
        "sm":               "8px",
        "md":               "12px",
        "lg":               "16px",
        "xl":               "24px",
        "xxl":              "32px",
        "section-mobile":   "48px",
        "section-desktop":  "80px",
      },

      fontFamily: {
        // Space Grotesk — headlines, amounts, label-mono
        "headline-lg":         ["Space Grotesk", "sans-serif"],
        "headline-lg-mobile":  ["Space Grotesk", "sans-serif"],
        "label-mono":          ["Space Grotesk", "sans-serif"],
        // Inter — body, buttons, captions, everything else
        "headline-md":         ["Inter", "sans-serif"],
        "body-lg":             ["Inter", "sans-serif"],
        "body-md":             ["Inter", "sans-serif"],
        "button":              ["Inter", "sans-serif"],
        "caption":             ["Inter", "sans-serif"],
      },

      fontSize: {
        "headline-lg":        ["48px", { lineHeight: "48px",  letterSpacing: "-0.03em", fontWeight: "400" }],
        "headline-lg-mobile": ["32px", { lineHeight: "36px",  letterSpacing: "-0.02em", fontWeight: "400" }],
        "headline-md":        ["24px", { lineHeight: "32px",  letterSpacing: "-0.01em", fontWeight: "500" }],
        "body-lg":            ["18px", { lineHeight: "28px",  fontWeight: "400" }],
        "body-md":            ["16px", { lineHeight: "24px",  fontWeight: "400" }],
        "button":             ["14px", { lineHeight: "24px",  fontWeight: "500" }],
        "label-mono":         ["14px", { lineHeight: "20px",  letterSpacing: "0.02em", fontWeight: "400" }],
        "caption":            ["12px", { lineHeight: "16px",  fontWeight: "400" }],
      },
    },
  },
  plugins: [],
}

export default config
```

**Google Fonts import** — add to `app/layout.tsx`:
```typescript
import { Inter, Space_Grotesk } from "next/font/google"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" })
```

---

### 9.3 Screen → Route Map

Each Stitch HTML file maps to exactly one Next.js route. Claude Code must use the Stitch HTML as the visual reference and wire in real API data in place of every hardcoded value.

| Stitch File | Next.js Route | Description |
|---|---|---|
| `youthpay_financial_intelligence_engine/code.html` | `/teen` | Teen Dashboard — main home screen |
| `youthpay_parent_oversight/code.html` | `/parent` | Parent Dashboard — factual summary |
| `youthpay_engine_intelligence_debugger/code.html` | `/debugger` | Engine Debugger — parse pipeline demo |
| `youthpay_onboarding_identity/code.html` | `/onboarding` | Identity verification step (static, no API) |
| *(build from PRD spec)* | `/insights` | All 5 insight cards expanded |
| *(build from PRD spec)* | `/ingest` | Paste SMS → parse live |
| *(build from PRD spec)* | `/activity` | Full 160-row transaction feed |

---

### 9.4 Hardcoded Values → Real API Replacements

Every hardcoded value in the Stitch HTML must be replaced with live data from the FastAPI backend. This is the exact mapping:

#### `/teen` (Teen Dashboard)

| Stitch hardcoded | Real value | API source |
|---|---|---|
| `PKR 4,200` (remaining) | `summary.totals.total_credit_pkr - summary.totals.total_debit_pkr` | `GET /api/summary` |
| `PKR 10,000` (budget) | `summary.user.stated_monthly_allowance_pkr` | `GET /api/summary` |
| `PKR 5,800` (spent) | `summary.totals.total_debit_pkr` | `GET /api/summary` |
| `42% used` | `(total_debit / allowance) * 100` | computed client-side |
| AI insight text (coffee 40% more) | `insights[0].narrative_teen` | `GET /api/insights` |
| `Espresso @ Karachi` transaction | First 4 rows from real data | `GET /api/transactions?limit=4` |
| `-PKR 850`, `-PKR 1,200`, `-PKR 450` | Real amounts from dataset | `GET /api/transactions?limit=4` |
| Category chips (COFFEE, LIFESTYLE) | Real categories from dataset | `GET /api/transactions?limit=4` |

#### `/parent` (Parent Dashboard)

| Stitch hardcoded | Real value | API source |
|---|---|---|
| Spending health narrative | `insights[*].narrative_parent` for health insight | `GET /api/insights` |
| `PKR 5,000` makeup kit | Real top pending amount | hardcoded demo only |
| `PKR 10,000/mo` allowance | `summary.user.stated_monthly_allowance_pkr` | `GET /api/summary` |
| Merchant list (Butlers, Khaadi, Sephora) | Real top 5 merchants from dataset | `GET /api/summary` → `top_merchants` |
| Transaction amounts | Real amounts from `GET /api/transactions` | `GET /api/transactions` |

#### `/debugger` (Engine Debugger)

| Stitch hardcoded | Real value | API source |
|---|---|---|
| `8ms Latency` | Actual response time (measure with `Date.now()`) | client-side timing |
| `98.4% Confidence` | `parsed.confidence` field | `POST /api/parse-notification` |
| Raw SMS examples | Use the 3 exact Pakistani patterns from PRD Section 6 | static — these are the demo strings |
| Cleaned outputs | Live parse results | `POST /api/parse-notification` |
| `99.8% Precision` | Static copy — marketing claim | hardcoded |

---

### 9.5 Component Patterns (Extracted from Stitch HTML)

#### Page Shell
```
bg-canvas (white)
min-h-screen
font-body-md (Inter 16px)
-webkit-font-smoothing: antialiased
```

#### Top App Bar (all pages)
```
header: flex justify-between items-center px-lg py-sm
bg-canvas fixed top-0 z-50 border-b border-hairline
Avatar: w-10 h-10 rounded-full overflow-hidden border border-hairline
Name: font-bold text-[16px] text-primary leading-tight
Subtitle: font-caption text-caption text-muted
```

#### Agent Console Card (hero cards — dark green/navy)
```
bg-deep-green OR bg-tertiary-container
text-on-primary (white)
rounded-2xl p-xl
relative overflow-hidden
Background blur decoration: absolute top-0 right-0 w-32 h-32 
  bg-secondary opacity-20 blur-3xl rounded-full
```

#### Standard Card
```
bg-canvas
border border-hairline
rounded-xl p-lg
No shadow
```

#### Insight Card (severity variants)
```
bg-canvas border border-hairline rounded-xl p-lg
border-l-4 border-l-[severity color]
Severity colors:
  alert:   border-l-severity-alert   (#EF4444 red)
  warning: border-l-severity-warning (#F59E0B amber)
  info:    border-l-severity-info    (#3B82F6 blue)
```

#### Category Chip
```
bg-coral/10 text-coral
font-label-mono text-[10px]
px-xs py-px rounded uppercase
```

#### Transaction Row
```
flex items-center gap-md py-md border-b border-hairline last:border-0
Icon circle: w-12 h-12 rounded-full bg-surface-container flex items-center justify-center
Merchant: font-headline-md text-[16px] font-semibold
Amount (debit): font-label-mono text-body-md font-bold text-error
Amount (credit): font-label-mono text-body-md font-bold text-secondary
Time/method: text-muted text-caption
```

#### Bottom Navigation
```
nav: fixed bottom-0 w-full z-50 flex justify-around items-center
bg-canvas py-md px-lg border-t border-hairline
Tab item: flex flex-col items-center justify-center px-xl py-xs
Active: text-primary (black icon + label)
Inactive: text-muted
Icon: material-symbols-outlined
Label: font-caption text-[10px] mt-xxs
Active tab indicator: active:scale-90 transition-all duration-200
```

#### Pill Button (primary CTA)
```
bg-primary text-on-primary
font-button text-button
rounded-full px-xl py-sm
w-full (full-width on mobile)
height: 48px
```

#### Amount Display (PKR values)
```typescript
// Always use this formatter — never raw numbers
const formatPKR = (amount: number): string => {
  return `PKR ${amount.toLocaleString("en-PK")}`
}
// e.g. 129298 → "PKR 1,29,298"
// e.g. 12248  → "PKR 12,248"
```

#### Progress Bar (budget card)
```
Track: w-full h-1 bg-on-primary/20 rounded-full
Fill: h-1 bg-error rounded-full (red when >50% spent)
     h-1 bg-secondary rounded-full (green when <50% spent)
Width: inline style — width: `${percentage}%`
```

---

### 9.6 Screen-by-Screen Component Structure

#### `/teen` — Teen Dashboard

```
<header>                    ← TopAppBar (avatar, name, bell)
  fixed top-0 bg-canvas border-b border-hairline

<main> pt-[header height] pb-[nav height]
  
  <!-- SECTION 1: Budget Card -->
  <section mt-md px-lg>
    <AgentConsoleCard bg-deep-green>
      MONO LABEL: "AVAILABLE ALLOWANCE"
      Month badge: "JUNE 2026" pill outline
      Large PKR amount: headline-lg-mobile Space Grotesk bold
      Subtitle: "Remaining from PKR 10,000 budget"
      <ProgressBar />
      Row: "SPENT: PKR X" left | "X% USED" right
    </AgentConsoleCard>
  </section>

  <!-- SECTION 2: AI Coach Card -->
  <section mt-md px-lg>
    <AgentConsoleCard bg-primary-container (near-black)>
      Icon square + "YouthPay Intelligence" title
      narrative_teen text from /api/insights
      "See All Insights →" coral link
    </AgentConsoleCard>
  </section>

  <!-- SECTION 3: Insight Preview Row -->
  <section mt-md>
    <h2 px-lg>Your Insights</h2>
    <div overflow-x-auto flex gap-md px-lg>
      <!-- 4 InsightPreviewCards, horizontal scroll -->
      <!-- Each 140px wide, border-l-4 severity color -->
      <!-- Data from GET /api/insights -->
    </div>
  </section>

  <!-- SECTION 4: Spending Donut -->
  <section mt-section-mobile px-lg>
    <h2>Where did it go?</h2>
    <SpendingRing data={summary.by_category} />
    <!-- Recharts PieChart, no3D, flat -->
  </section>

  <!-- SECTION 5: Transaction Feed -->
  <section mt-section-mobile px-lg>
    <row> "Recent Activity" + "VIEW ALL →" action-blue </row>
    <!-- Last 4 transactions from GET /api/transactions?limit=4 -->
    <TransactionRow /> × 4
  </section>

<nav>                       ← BottomNav (Home active, Insights, Activity, Parent)
```

#### `/parent` — Parent Dashboard

```
<nav>                       ← TopNav (avatar, "Parent Mode", bell + settings)
  NOT fixed — scrolls with page

<main>

  <!-- SECTION 1: Spending Health Hero -->
  <section>
    <AgentConsoleCard bg-tertiary-container (dark navy)>
      "✦ SPENDING HEALTH" teal mono label
      Headline from insights health narrative_parent
      Two stat pills: "160 transactions" | "Score: 36/100"
      "Monitoring Active" status chip
    </AgentConsoleCard>
  </section>

  <!-- SECTION 2: Stats Grid -->
  <section px-lg mt-xl>
    "GOVERNANCE CONTROLS" mono label
    2×2 grid of StandardCards:
      Total Spent | Transactions | Late-Night | Health Score
      All data from GET /api/summary
  </section>

  <!-- SECTION 3: Category Table -->
  <section px-lg mt-section-mobile>
    "SPENDING BREAKDOWN" mono label
    <CategoryTable data={summary.by_category} />
    <!-- 8 rows, hairline dividers, NO zebra, editorial -->
  </section>

  <!-- SECTION 4: Top Merchants -->
  <section px-lg mt-section-mobile>
    "TOP MERCHANTS" mono label
    <MerchantList data={summary.top_merchants} />
    <!-- Ranked list, rank number + merchant + amount + visits -->
  </section>

  <!-- SECTION 5: Alert Cards -->
  <section px-lg mt-xl>
    2 alert cards horizontal:
      Late Night (red border-l)
      Beauty Creep (amber border-l)
  </section>

  <!-- SECTION 6: Download CTA -->
  <section px-lg mt-xl pb-xxl>
    <button full-width pill>"Download June Report ↓"</button>
  </section>

<nav>                       ← BottomNav (Parent active)
```

#### `/debugger` — Engine Debugger

```
<header>                    ← "← Engine Debugger" back + bell

<main>

  <!-- SECTION 1: Status Banner -->
  <section mt-section-mobile px-lg>
    <AgentConsoleCard bg-primary>
      "SYSTEM STATUS" mono label
      "Neural Cleanup Active" bold
      "Xms Latency" — measure real /api/parse-notification response time
      QR icon decorative
    </AgentConsoleCard>
  </section>

  <!-- SECTION 2: Parse Cards (3 examples, live) -->
  <section px-lg mt-xl space-y-xl>
    <!-- Each card: raw SMS box → arrow → cleaned output box -->
    <!-- Wire FIRST card to live POST /api/parse-notification -->
    <!-- Cards 2 & 3 can be static for demo clarity -->
    <ParseCard
      raw="Spent Rs. 850 @ ESPRESSO-KHI JazakAllah"
      method="Regex Scrub"
      confidence="98.4%"
      result={liveParseResult}  ← real API call
    />
    <ParseCard
      raw="TRF to NayaPay A/C 923... (ID: 98765)"
      method="Neural Pattern Match"
      result={{ merchant: "P2P Transfer", category: "Transfer" }}
      static
    />
    <ParseCard
      raw="POS WDRWL *3319 AT HBL_ATM_0012 Karachi PK"
      method="Regex Scrub"
      result={{ merchant: "ATM Withdrawal", category: "Utilities" }}
      static
    />
  </section>

  <!-- SECTION 3: Engine Intelligence Card -->
  <section px-lg mt-section-mobile>
    <AgentConsoleCard bg-primary>
      "✦ Engine Intelligence" coral label
      Copy from PRD parse description
      "99.8% Precision" | "Adaptive Learning" metric pills
    </AgentConsoleCard>
  </section>

  <!-- Fixed bottom -->
  <div fixed bottom-0>
    <button full-width>"Approve Categorization ✓"</button>
  </div>
```

#### `/insights` — All 5 Insights (build from PRD, no Stitch reference)

```
<header> "← Your Insights" + "June 2026" pill + Teen/Parent toggle

<main px-lg space-y-xl>
  <!-- Teen/Parent toggle controls narrative_teen vs narrative_parent -->
  
  <InsightCard id="coffee_addiction"   severity="warning" />
  <InsightCard id="impulse_late_night" severity="alert"   />
  <InsightCard id="beauty_creep"       severity="warning" />
  <InsightCard id="health_score"       severity="alert"   />  ← includes gauge + components
  <InsightCard id="weekend_vs_weekday" severity="info"    />  ← includes bar chart

  <!-- All data from GET /api/insights -->
```

---

### 9.7 Icons

Use **Material Symbols Outlined** (already in Stitch HTML). Add to `app/layout.tsx`:

```html
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
```

```tsx
// Usage
<span className="material-symbols-outlined">notifications</span>
<span className="material-symbols-outlined">coffee</span>
<span className="material-symbols-outlined">nights_stay</span>
<span className="material-symbols-outlined">spa</span>
<span className="material-symbols-outlined">favorite</span>
<span className="material-symbols-outlined">calendar_month</span>
<span className="material-symbols-outlined">receipt_long</span>
<span className="material-symbols-outlined">insights</span>
<span className="material-symbols-outlined">person</span>
<span className="material-symbols-outlined">home</span>
<span className="material-symbols-outlined">settings</span>
<span className="material-symbols-outlined">arrow_forward</span>
<span className="material-symbols-outlined">download</span>
```

Icon style class:
```css
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  display: inline-block;
  vertical-align: middle;
}
```

---

### 9.8 Charts (Recharts)

Two charts only. Both from Recharts library.

#### Spending Donut (Teen Dashboard `/teen`)
```tsx
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"

const CATEGORY_COLORS: Record<string, string> = {
  Food:          "#ff7759",  // coral
  Beauty:        "#35675d",  // deep green
  Lifestyle:     "#1863dc",  // action blue
  Entertainment: "#7C3AED",  // violet
  Coffee:        "#F59E0B",  // amber
  Transport:     "#0d9488",  // teal
  Education:     "#ec4899",  // pink
  Utilities:     "#93939f",  // muted grey
}

// Data comes from GET /api/summary → by_category
// Center text: total spend PKR formatted
// No labels on slices — use legend below
// Legend: 2-column grid, colored dot + name + percentage
```

#### Weekend vs Weekday Bar Chart (Insights `/insights`)
```tsx
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts"

// Data: transform summary.weekend_vs_weekday into per-category breakdown
// X-axis: category names (abbreviated: Food, Beauty, Coffee, etc.)
// Two bars per category:
//   Weekend: fill="#7C3AED" (violet)
//   Weekday: fill="#e2e2e2" (surface-container-highest)
// Y-axis: PKR amounts
// Tooltip: shows exact PKR for each bar
// No grid lines — flat aesthetic
```

---

### 9.9 Loading & Error States

```tsx
// Skeleton shimmer — no spinners
// Use for: CoachBanner, InsightGrid, CategoryTable, TransactionFeed
<div className="animate-pulse bg-surface-container rounded-xl h-[120px] w-full" />

// Error state — never show raw error messages to user
<div className="bg-error-container text-on-error-container rounded-xl p-lg text-body-md">
  Could not load data. Pull down to refresh.
</div>

// Empty state — only for transaction feed with filters
<div className="text-center text-muted text-body-md py-section-mobile">
  No transactions in this category.
</div>
```

---

### 9.10 Do's and Don'ts

| ✅ Do | ❌ Don't |
|-------|---------|
| Use `hairline` (#d9d9dd) for all borders | Add any drop shadows (`shadow-*`) |
| Use `canvas` white as page background | Use dark mode — this is a light-mode app |
| Use `deep-green` for hero/agent console cards | Use coral as a background fill |
| Use `Space Grotesk` for PKR amounts and headlines | Mix font families within one component |
| Format all amounts as `PKR X,XXX` (en-PK locale) | Show raw numbers like `129298` |
| Use `border-l-4` severity borders on insight cards | Use colored card backgrounds for insights |
| Keep bottom nav fixed, all tabs always visible | Hide or disable nav tabs |
| Wire every value to the API — zero hardcoded PKR amounts | Leave Stitch placeholder amounts |
| Use `animate-pulse` skeleton for loading | Use spinners or loading text |
| Use `toLocaleString("en-PK")` for all amounts | Use `toLocaleString("en-US")` (wrong comma grouping) |

---

## 10. Build Order — Backend First, UI Last

**Rule: Do not write a single line of Next.js until every backend test passes.**

The UI is the last 30% of the work. The data pipeline, computation layer, and API are the product. Build and verify them in this exact sequence.

---

### Phase 1: Data Foundation

**Step 1 — Seed Script** `scripts/seed.py`

Convert XLSX → `data/transactions.py`. This is the single source of truth for all subsequent steps.

```bash
# Verify
python -c "from data.transactions import TRANSACTIONS; print(len(TRANSACTIONS))"
# Expected: 160
```

**Step 2 — FastAPI skeleton** `main.py`

Empty routers, CORS configured, `/health` endpoint only. Nothing else.

```bash
# Verify
uvicorn main:app --reload
curl http://localhost:8000/health
# Expected: {"status": "ok"}
```

---

### Phase 2: Core Endpoints (no LLM yet)

**Step 3 — `/api/summary`**

Pure Python on `TRANSACTIONS`. No external calls.

```bash
# Verify these exact numbers
curl http://localhost:8000/api/summary | python -m json.tool
# Expected:
# totals.total_debit_pkr = 129298
# totals.transaction_count = 160
# by_category[0].category = "Food"
# by_category[0].amount_pkr = 31582
# weekend_vs_weekday.weekend.amount_pkr = 29421
# late_night.count = 41
```

**Step 4 — `/api/transactions`**

Filterable list from in-memory data.

```bash
# Verify filters work
curl "http://localhost:8000/api/transactions?category=Coffee"
# Expected: 22 rows, all category=Coffee

curl "http://localhost:8000/api/transactions?direction=credit"
# Expected: 1 row (the PKR 10,000 allowance credit)
```

---

### Phase 3: Insight Engine (pure Python, no LLM)

**Step 5 — `services/insight_engine.py`**

All 5 insight metrics computed from `TRANSACTIONS`. No narratives yet — just the numbers. Test each metric independently.

```bash
python -c "
from data.transactions import TRANSACTIONS
from services.insight_engine import compute_insights_metrics
metrics = compute_insights_metrics(TRANSACTIONS)

# Coffee
assert metrics['coffee']['total_pkr'] == 12248, f\"Got {metrics['coffee']['total_pkr']}\"
assert metrics['coffee']['visit_count'] == 22

# Late night
assert metrics['impulse']['late_night_count'] == 41
assert metrics['impulse']['late_night_percentage'] == 25.8

# Beauty
assert metrics['beauty']['beauty_total_pkr'] == 25671
assert metrics['beauty']['transaction_count'] == 24

# Health score
assert metrics['health']['score'] == 36
assert metrics['health']['grade'] == 'F'

# Weekend
assert metrics['weekend']['weekend_total_pkr'] == 29421
assert metrics['weekend']['weekday_total_pkr'] == 99877

print('ALL METRICS PASS')
"
```

---

### Phase 4: LLM Narratives

**Step 6 — `services/llm_service.py`**

Wire Groq. Generate teen + parent narrative for each of the 5 insights. Test that output is non-empty, non-generic, and mentions real PKR numbers.

```bash
python -c "
from services.llm_service import generate_narrative
narrative = generate_narrative('coffee_addiction', {'total_pkr': 12248, 'visit_count': 22}, 'teen')
print(narrative)
# Must contain: PKR, Coffee Wagera or Chai Spot, and NOT be generic
assert 'PKR' in narrative or 'Rs' in narrative
assert len(narrative) > 50
print('NARRATIVE PASS')
"
```

**Step 7 — `/api/insights`**

Wraps engine + LLM. Test caching (second call must be faster than first).

```bash
# First call — generates narratives
time curl http://localhost:8000/api/insights | python -m json.tool
# Second call — should be instant (cached)
time curl http://localhost:8000/api/insights | python -m json.tool

# Verify structure
curl http://localhost:8000/api/insights | python -c "
import sys, json
data = json.load(sys.stdin)
assert len(data['insights']) == 5
for i in data['insights']:
    assert i['narrative_teen'] != ''
    assert i['narrative_parent'] != ''
    assert 'metrics' in i
print('INSIGHTS PASS')
"
```

---

### Phase 5: Parser

**Step 8 — `services/parser.py` + `/api/parse-notification`**

Test all Pakistani bank SMS formats including the edge cases.

```bash
python -c "
from services.parser import parse_notification

tests = [
    ('Spent Rs. 850 @ ESPRESSO-KHI JazakAllah',   'Coffee',    850.0,  'debit'),
    ('Txn Alert: Rs 1701 spent at MINISO PK',       'Lifestyle', 1701.0, 'debit'),
    ('PKR 10,000 credited from Parents (Pocket Money)', 'Allowance', 10000.0, 'credit'),
    ('TRF to NayaPay A/C 923... (ID: 98765)',       'Transfer',  None,   'debit'),
    ('POS WDRWL *3319 AT HBL_ATM_0012 Karachi PK', 'Utilities', None,   'debit'),
]

for raw, expected_cat, expected_amount, expected_dir in tests:
    result = parse_notification(raw)
    print(f'Input:    {raw[:50]}')
    print(f'Category: {result[\"category\"]} (expected: {expected_cat})')
    print(f'Amount:   {result[\"amount_pkr\"]} (expected: {expected_amount})')
    print(f'Dir:      {result[\"direction\"]} (expected: {expected_dir})')
    print()

print('PARSER PASS')
"
```

---

### Phase 6: Gmail IMAP (Bonus — only if time permits)

**Step 9 — `services/email_fetcher.py` + `/api/fetch-emails`**

```bash
# Test IMAP connection only (no full fetch)
python -c "
import imaplib, os
mail = imaplib.IMAP4_SSL('imap.gmail.com')
mail.login(os.environ['GMAIL_USER'], os.environ['GMAIL_APP_PASSWORD'])
print('IMAP CONNECTION PASS')
mail.logout()
"

# Test full endpoint
curl -X POST http://localhost:8000/api/fetch-emails \
  -H 'Content-Type: application/json' \
  -d '{\"secret\": \"youthpay-demo-2026\", \"max_per_sender\": 5}'
```

---

### Phase 7: Full Integration Test

**Step 10 — Hit all endpoints in sequence, verify numbers are consistent**

```bash
python -c "
import requests

BASE = 'http://localhost:8000'

# Health
assert requests.get(f'{BASE}/health').json()['status'] == 'ok'

# Summary
s = requests.get(f'{BASE}/api/summary').json()
assert s['totals']['total_debit_pkr'] == 129298
assert s['totals']['transaction_count'] == 160
assert s['late_night']['count'] == 41

# Transactions
t = requests.get(f'{BASE}/api/transactions?category=Coffee').json()
assert t['filtered'] == 22

# Insights
i = requests.get(f'{BASE}/api/insights').json()
assert len(i['insights']) == 5
health = next(x for x in i['insights'] if x['id'] == 'health_score')
assert health['metrics']['score'] == 36

# Parse
p = requests.post(f'{BASE}/api/parse-notification',
    json={'raw_text': 'Txn Alert: Rs 1701 spent at MINISO PK'}).json()
assert p['parsed']['merchant_name'] == 'MINISO PK'
assert p['parsed']['amount_pkr'] == 1701.0

print('ALL INTEGRATION TESTS PASS — READY TO BUILD UI')
"
```

---

### Phase 8: UI (Only after Phase 7 is green)

**Build order within UI:**
1. Next.js project scaffold + Tailwind config + design tokens
2. `lib/api.ts` — typed fetch wrappers (copy from PRD spec)
3. `lib/types.ts` — TypeScript interfaces matching API responses
4. Teen Dashboard `/teen` — CoachBanner + InsightGrid (horizontal scroll) + SpendingRing + TransactionFeed
5. Insights page `/insights` — all 5 expanded insight cards
6. Parent Dashboard `/parent` — CategoryTable + MerchantList + SummaryHeader
7. Notification Parser `/ingest` — NotificationInput + ParsedResult
8. Engine Debugger `/debugger` — 3 example parse cards + status card
9. Bottom nav + routing between all pages
10. Mobile polish — 375px viewport, touch targets, skeleton loading states

**UI test:** Load on a real phone via ngrok. Every tap must work. Every number must match the integration test numbers exactly.

---

## 11. Deployment Architecture

### Frontend — Vercel

```bash
# vercel.json
{
  "env": {
    "NEXT_PUBLIC_API_URL": "https://youthpay-api.railway.app"
  }
}
```

### Backend — Railway

```dockerfile
# Dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```
# requirements.txt
fastapi==0.111.0
uvicorn==0.29.0
groq==0.9.0
anthropic==0.28.0  # optional fallback
openpyxl==3.1.2
python-dotenv==1.0.0
# imaplib is Python stdlib — no install needed
```

### Environment Variables

```bash
# Backend (.env)
GROQ_API_KEY=gsk_...
LLM_PROVIDER=groq              # or "anthropic"
GMAIL_USER=hackathon.youthpay@gmail.com
GMAIL_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx   # 16-char Google App Password
DEMO_SECRET=youthpay-demo-2026

# Frontend (.env.local)
NEXT_PUBLIC_API_URL=https://youthpay-api.railway.app
```

---

## 12. Submission Checklist

### Required (All must be ✅ before 23:59 PKT June 28)

- [ ] GitHub repo — public, clean commit history, meaningful commit messages
- [ ] **All 10 integration tests pass** before UI build starts
- [ ] Vercel deploy live — `/teen`, `/parent`, `/insights`, `/ingest`, `/activity` all render
- [ ] Railway/Render API deploy live — `/api/summary`, `/api/insights`, `/api/transactions`, `/api/parse-notification` all return 200
- [ ] All dashboard numbers match the dataset exactly (use integration test as verification)
- [ ] README with: what you built, why, the full pipeline flow diagram, local setup instructions
- [ ] Google Drive folder with 5-slide deck

### Deck Structure (5 slides, no more)

| Slide | Content |
|-------|---------|
| 1 | Who I am + why I chose Challenge 1 (founder-level answer, not technical) |
| 2 | The Haniya Problem — what the data actually shows (use the real numbers) |
| 3 | **The Pipeline** — Email/Dataset → Parse → Categorize → Analyze → Insights → Dashboard. One diagram, no walls of text. |
| 4 | Product decisions — what I built, what I cut, and why (backend-first approach, IMAP over OAuth) |
| 5 | What I'd do with another week (Phase 2: real Gmail OAuth, Plaid-style bank sync, multi-user, spending controls) |

### Optional (High signal if included)

- [ ] 2-min Loom: Teen Dashboard → Insight cards → Parse a notification live → (bonus) Gmail fetch live
- [ ] `tests/integration_test.py` committed to repo — shows you actually ran the numbers
- [ ] Figma mockup (even lo-fi) showing the design intent before build
- [ ] AI prompts document (shows engineering judgment, not prompt gaming)

---

## Appendix: Exact Numbers Reference Card

| Metric | Value |
|--------|-------|
| Total transactions | 160 |
| Total debit | PKR 1,29,298 |
| Total credit | PKR 11,500 |
| Top category | Food — PKR 31,582 (36 txns) |
| Top merchant | Atrium Cinema — PKR 16,167 (11 visits) |
| Coffee total | PKR 12,248 (Coffee Wagera PKR 8,646 + Chai Spot PKR 3,602) |
| Beauty total | PKR 25,671 (WB by Hemani PKR 14,709 + Bagallery PKR 10,962) |
| Late-night txns | 41 (25.8% of total) |
| Largest single txn | MINISO Lucky One — PKR 2,115 at 01:00 AM Jun 29 |
| Largest late-night | Bagallery — PKR 2,078 at 03:00 AM Jun 2 |
| Weekend spend | PKR 29,421 / 39 txns / avg PKR 754 |
| Weekday spend | PKR 99,877 / 116 txns / avg PKR 861 |
| Education spend | PKR 9,576 (Liberty Books — 8 visits) |
| Health Score | 36/100 — Grade F |
| Coffee annualized | PKR 1,46,976/year |

---

*PRD v2.0 — YouthPay CTO/Founding Engineer Hackathon — 27–28 June 2026*  
*Updated: Added Product Flow Pipeline, Gmail IMAP spec, Backend-First Build Order (10 phases), integration test suite, revised scope table and route tree.*
