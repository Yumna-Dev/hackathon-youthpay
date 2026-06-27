"""
llm_service.py — Groq/Llama narrative generation.

Turns computed insight metrics into narrative financial coaching (teen + parent
voices). Narratives are cached in memory after first generation: same numbers
every time, fresh language only on a cold start.
"""

import os

from dotenv import load_dotenv
from groq import Groq

load_dotenv()

# NOTE: PRD/original spec pinned "llama-3.1-70b-versatile", which Groq has since
# decommissioned. llama-3.3-70b-versatile is Groq's official drop-in successor
# (same 70B versatile tier). Approved by the user on 2026-06-27.
MODEL = "llama-3.3-70b-versatile"

client = Groq(api_key=os.environ["GROQ_API_KEY"])

NARRATIVE_CACHE: dict[str, str] = {}

# Human-readable framing per insight so the model grounds itself in the right topic.
INSIGHT_CONTEXT = {
    "coffee_addiction": "Haniya's spending on coffee and chai (Coffee Wagera, Chai Spot).",
    "impulse_late_night": "Haniya's late-night purchases between 10 PM and 4 AM.",
    "beauty_creep": "Haniya's beauty-product spending (WB by Hemani, Bagallery).",
    "health_score": "Haniya's overall financial health score out of 100.",
    "weekend_vs_weekday": "How Haniya's spending splits between weekends and weekdays.",
}

# Per-insight clarifications about what the numbers mean (units), so the model
# doesn't mislabel non-currency values as rupee amounts.
INSIGHT_NOTES = {
    "health_score": (
        "UNITS: 'score' is out of 100 and 'grade' is a letter (A-F). The four "
        "'components' (savings_rate, late_night_control, category_diversity, "
        "education_ratio) are each scores out of 25 POINTS - they are NOT rupee "
        "amounts. Never write 'PKR' or 'Rs' before a component score or the health "
        "score. Only real money amounts should be written as PKR."
    ),
}


def build_prompt(insight_id: str, metrics: dict, audience: str) -> str:
    if audience == "teen":
        voice = (
            "You are a brutally honest but caring financial coach talking to Haniya, "
            "a 15-year-old in Karachi. Be conversational, specific, and surprising. "
            "No platitudes. Use the exact figures from the data; rupee amounts are in "
            "PKR. Max 3 sentences."
        )
    else:
        voice = (
            "You are summarizing financial data for Haniya's parents, who are doctors. "
            "Be factual, brief, and precise. Use the exact figures from the data; "
            "rupee amounts are in PKR. Max 2 sentences."
        )

    context = INSIGHT_CONTEXT.get(insight_id, insight_id)
    note = INSIGHT_NOTES.get(insight_id)
    note_line = f"\n{note}" if note else ""
    return (
        f"{voice}\n\n"
        f"Topic: {context}\n"
        f"Insight id: {insight_id}\n"
        f"Data (use these exact figures): {metrics}{note_line}\n\n"
        f"Write the narrative now. Output only the narrative text, no preamble."
    )


def generate_narrative(insight_id: str, metrics: dict, audience: str) -> str:
    cache_key = f"{insight_id}_{audience}"
    if cache_key in NARRATIVE_CACHE:
        return NARRATIVE_CACHE[cache_key]

    prompt = build_prompt(insight_id, metrics, audience)
    response = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=200,
        temperature=0.7,
    )
    narrative = response.choices[0].message.content.strip()
    NARRATIVE_CACHE[cache_key] = narrative
    return narrative
