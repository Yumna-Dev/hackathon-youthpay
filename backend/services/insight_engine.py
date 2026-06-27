"""
insight_engine.py — pure-Python computation over the in-memory TRANSACTIONS list.

No LLM, no external calls. Deterministic, testable, fast. This module owns every
number the API surfaces. compute_summary() powers GET /api/summary.
"""

from datetime import datetime
from collections import defaultdict
from typing import Any

GRADE_BANDS = [(85, "A"), (70, "B"), (55, "C"), (40, "D"), (0, "F")]


def _grade(score: int) -> str:
    for floor, letter in GRADE_BANDS:
        if score >= floor:
            return letter
    return "F"

# Static profile (per PRD §6 summary schema). The dataset is single-user (Haniya).
USER = {
    "name": "Haniya Ahmed",
    "age": 15,
    "city": "Karachi",
    "stated_monthly_allowance_pkr": 10000,
}


def _dt(txn: dict) -> datetime:
    return datetime.fromisoformat(txn["date_time"])


def _is_late_night(txn: dict) -> bool:
    """Late-night window: 10 PM–4 AM (hour >= 22 or hour <= 3)."""
    h = _dt(txn).hour
    return h >= 22 or h <= 3


def compute_summary(transactions: list[dict]) -> dict[str, Any]:
    debit = [t for t in transactions if t["direction"] == "debit"]
    credit = [t for t in transactions if t["direction"] == "credit"]

    total_debit = round(sum(t["amount_pkr"] for t in debit))
    total_credit = round(sum(t["amount_pkr"] for t in credit))

    # --- Category breakdown (debit only), sorted by spend desc ---
    cat_amt: dict[str, float] = defaultdict(float)
    cat_cnt: dict[str, int] = defaultdict(int)
    for t in debit:
        cat_amt[t["category"]] += t["amount_pkr"]
        cat_cnt[t["category"]] += 1
    by_category = [
        {
            "category": c,
            "amount_pkr": round(cat_amt[c]),
            "count": cat_cnt[c],
            "percentage": round(cat_amt[c] / total_debit * 100, 1) if total_debit else 0.0,
        }
        for c in sorted(cat_amt, key=lambda k: cat_amt[k], reverse=True)
    ]

    # --- Top merchants (debit only) ---
    m_amt: dict[str, float] = defaultdict(float)
    m_cnt: dict[str, int] = defaultdict(int)
    for t in debit:
        m_amt[t["merchant_name"]] += t["amount_pkr"]
        m_cnt[t["merchant_name"]] += 1
    top_merchants = [
        {"merchant": m, "amount_pkr": round(m_amt[m]), "count": m_cnt[m]}
        for m in sorted(m_amt, key=lambda k: m_amt[k], reverse=True)[:5]
    ]

    # --- Weekend vs weekday (debit only). Sat/Sun = weekday() 5,6 ---
    we_amt = we_cnt = wd_amt = wd_cnt = 0.0
    for t in debit:
        if _dt(t).weekday() >= 5:
            we_amt += t["amount_pkr"]
            we_cnt += 1
        else:
            wd_amt += t["amount_pkr"]
            wd_cnt += 1

    # --- Late-night (debit only) ---
    late_night_count = sum(1 for t in debit if _is_late_night(t))
    # "of total" uses real transactions (debit + credit); excludes the system/info row.
    real_txn_count = len(debit) + len(credit)
    late_night_pct = round(late_night_count / real_txn_count * 100, 1) if real_txn_count else 0.0

    # --- Period ---
    dates = sorted(_dt(t).date() for t in transactions)
    period_from, period_to = dates[0], dates[-1]

    return {
        "user": USER,
        "period": {
            "from": period_from.isoformat(),
            "to": period_to.isoformat(),
            "days": 30,
        },
        "totals": {
            "total_debit_pkr": total_debit,
            "total_credit_pkr": total_credit,
            "transaction_count": len(transactions),
            "debit_count": len(debit),
            "credit_count": len(credit),
        },
        "by_category": by_category,
        "top_merchants": top_merchants,
        "weekend_vs_weekday": {
            "weekend": {
                "amount_pkr": round(we_amt),
                "count": int(we_cnt),
                "avg_txn_pkr": round(we_amt / we_cnt) if we_cnt else 0,
            },
            "weekday": {
                "amount_pkr": round(wd_amt),
                "count": int(wd_cnt),
                "avg_txn_pkr": round(wd_amt / wd_cnt) if wd_cnt else 0,
            },
        },
        "late_night": {
            "count": late_night_count,
            "percentage_of_total": late_night_pct,
        },
    }


def compute_insights_metrics(transactions: list[dict]) -> dict[str, Any]:
    """All 5 insight metric blocks — pure Python, no narratives. Keyed:
    coffee, impulse, beauty, health, weekend."""
    debit = [t for t in transactions if t["direction"] == "debit"]
    credit = [t for t in transactions if t["direction"] == "credit"]
    total_debit = round(sum(t["amount_pkr"] for t in debit))
    real_txn_count = len(debit) + len(credit)

    # Category totals (debit)
    cat_amt: dict[str, float] = defaultdict(float)
    cat_cnt: dict[str, int] = defaultdict(int)
    for t in debit:
        cat_amt[t["category"]] += t["amount_pkr"]
        cat_cnt[t["category"]] += 1

    # --- Insight 1: Coffee Addiction ---
    coffee_total = round(cat_amt["Coffee"])
    coffee_visits = cat_cnt["Coffee"]
    coffee = {
        "total_pkr": coffee_total,
        "visit_count": coffee_visits,
        "avg_per_visit_pkr": round(coffee_total / coffee_visits) if coffee_visits else 0,
        "annualized_pkr": coffee_total * 12,
    }

    # --- Insight 2: Impulse / Late-Night ---
    late = [t for t in debit if _is_late_night(t)]
    largest = max(late, key=lambda t: t["amount_pkr"])
    largest_dt = _dt(largest)
    impulse = {
        "late_night_count": len(late),
        "late_night_percentage": round(len(late) / real_txn_count * 100, 1) if real_txn_count else 0.0,
        "largest_late_night_pkr": round(largest["amount_pkr"]),
        "largest_late_night_merchant": largest["merchant_name"],
        "largest_late_night_time": largest_dt.strftime("%I:%M %p").lstrip("0"),
    }

    # --- Insight 3: Beauty Creep ---
    beauty_total = round(cat_amt["Beauty"])
    beauty_cnt = cat_cnt["Beauty"]
    food_total = round(cat_amt["Food"])
    beauty_merchants: dict[str, float] = defaultdict(float)
    for t in debit:
        if t["category"] == "Beauty":
            beauty_merchants[t["merchant_name"]] += t["amount_pkr"]
    top_beauty = max(beauty_merchants.items(), key=lambda kv: kv[1])
    beauty = {
        "beauty_total_pkr": beauty_total,
        "beauty_as_pct_of_food": round(beauty_total / food_total * 100, 1) if food_total else 0.0,
        "top_merchant": top_beauty[0],
        "top_merchant_pkr": round(top_beauty[1]),
        "transaction_count": beauty_cnt,
        "avg_txn_pkr": round(beauty_total / beauty_cnt) if beauty_cnt else 0,
    }

    # --- Insight 4: Financial Health Score (each component 0-25, floored) ---
    income = USER["stated_monthly_allowance_pkr"]
    savings_rate = max(0.0, (income - total_debit) / income)
    score_savings = int(min(25, savings_rate * 100 * 0.25))

    late_ratio = len(late) / real_txn_count if real_txn_count else 0.0
    score_late = int(max(0, 25 - late_ratio * 100))

    top_share = max(cat_amt.values()) / total_debit if total_debit else 0.0
    # NOTE: the PRD's written diversity formula divides by 0.35 and yields ~7.6,
    # which contradicts its own documented component value of 18. We reproduce the
    # documented behavior (and the required 36/F total): 25*(1 - top_share), floored.
    score_diversity = int(max(0, 25 * (1 - top_share)))

    edu_ratio = cat_amt["Education"] / total_debit if total_debit else 0.0
    score_edu = int(min(25, edu_ratio * 250))

    total_score = score_savings + score_late + score_diversity + score_edu
    health = {
        "score": total_score,
        "grade": _grade(total_score),
        "components": {
            "savings_rate": score_savings,
            "late_night_control": score_late,
            "category_diversity": score_diversity,
            "education_ratio": score_edu,
        },
        "coaching_tip": "Set a 10 PM purchase pause. Just try it for a week.",
    }

    # --- Insight 5: Weekend vs Weekday (debit) ---
    we_amt = we_cnt = wd_amt = wd_cnt = 0.0
    weekend_days: set = set()
    for t in debit:
        d = _dt(t)
        if d.weekday() >= 5:
            we_amt += t["amount_pkr"]
            we_cnt += 1
            weekend_days.add(d.date())
        else:
            wd_amt += t["amount_pkr"]
            wd_cnt += 1
    weekend = {
        "weekend_total_pkr": round(we_amt),
        "weekend_count": int(we_cnt),
        "weekend_avg_pkr": round(we_amt / we_cnt) if we_cnt else 0,
        "weekday_total_pkr": round(wd_amt),
        "weekday_count": int(wd_cnt),
        "weekday_avg_pkr": round(wd_amt / wd_cnt) if wd_cnt else 0,
        "weekend_percentage_of_total": round(we_amt / total_debit * 100, 1) if total_debit else 0.0,
        "weekend_days_count": len(weekend_days),
    }

    return {
        "coffee": coffee,
        "impulse": impulse,
        "beauty": beauty,
        "health": health,
        "weekend": weekend,
    }
