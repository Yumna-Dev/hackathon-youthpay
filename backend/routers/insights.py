from datetime import datetime, timezone

from fastapi import APIRouter

from data.transactions import TRANSACTIONS
from services.insight_engine import compute_insights_metrics
from services.llm_service import generate_narrative

router = APIRouter()

# Static presentation metadata for each insight. `metric_key` maps to the block
# returned by compute_insights_metrics(); `headline` is built from those metrics.
INSIGHTS_META = [
    {
        "id": "coffee_addiction",
        "metric_key": "coffee",
        "title": "Coffee Addiction Alert",
        "severity": "warning",
        "icon": "coffee",
        "headline": lambda m: "You spent more on coffee than most people spend on rent.",
    },
    {
        "id": "impulse_late_night",
        "metric_key": "impulse",
        "title": "Impulse Spending Detector",
        "severity": "alert",
        "icon": "moon",
        "headline": lambda m: f"{m['late_night_count']} of your purchases happened after 10 PM.",
    },
    {
        "id": "beauty_creep",
        "metric_key": "beauty",
        "title": "Beauty Creep Warning",
        "severity": "warning",
        "icon": "sparkles",
        "headline": lambda m: "Beauty is your second-biggest spend — bigger than going out.",
    },
    {
        "id": "health_score",
        "metric_key": "health",
        "title": "Financial Health Score",
        # severity derived from score: <40 alert, <70 warning, else info
        "severity": None,
        "icon": "heart-pulse",
        "headline": lambda m: f"Your financial health score is {m['score']}/100.",
    },
    {
        "id": "weekend_vs_weekday",
        "metric_key": "weekend",
        "title": "Weekend vs. Weekday Behaviour",
        "severity": "info",
        "icon": "calendar",
        "headline": lambda m: f"You spend 39% of your money on just {m['weekend_days_count']} weekend days.",
    },
]

# Module-level cache for the assembled payload (narratives are expensive to generate).
_PAYLOAD_CACHE: dict = {}


def _health_severity(score: int) -> str:
    if score < 40:
        return "alert"
    if score < 70:
        return "warning"
    return "info"


def _build_payload() -> dict:
    metrics = compute_insights_metrics(TRANSACTIONS)
    insights = []
    for meta in INSIGHTS_META:
        block = metrics[meta["metric_key"]]
        severity = meta["severity"]
        if meta["id"] == "health_score":
            severity = _health_severity(block["score"])
        insights.append(
            {
                "id": meta["id"],
                "title": meta["title"],
                "severity": severity,
                "icon": meta["icon"],
                "headline": meta["headline"](block),
                "narrative_teen": generate_narrative(meta["id"], block, "teen"),
                "narrative_parent": generate_narrative(meta["id"], block, "parent"),
                "metrics": block,
            }
        )
    return {
        "insights": insights,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "cached": False,
    }


@router.get("/insights")
def get_insights():
    if "payload" in _PAYLOAD_CACHE:
        cached = dict(_PAYLOAD_CACHE["payload"])
        cached["cached"] = True
        return cached
    payload = _build_payload()
    _PAYLOAD_CACHE["payload"] = payload
    return payload
