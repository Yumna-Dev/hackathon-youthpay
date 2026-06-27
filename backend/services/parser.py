"""
parser.py — two-stage parser for Pakistani bank / EMI notification strings.

Stage 1: regex layer for known SMS shapes (UBL, Meezan, HBL, NayaPay, JazzCash).
Stage 2: LLM fallback (Groq) for anything the regex misses.

Output: {merchant_name, amount_pkr, direction, payment_method, category,
         confidence, method}.
"""

import re

# Amount-bearing patterns, tried in order. Each captures amount + merchant.
PATTERNS = [
    # "Spent Rs. 850 @ ESPRESSO-KHI JazakAllah"
    {
        "pattern": r"spent\s+rs\.?\s*([\d,]+)\s*@\s*(.+?)(?:\s+jazakallah)?\s*$",
        "direction": "debit",
        "amount_group": 1,
        "merchant_group": 2,
    },
    # "Txn Alert: Rs 1701 spent at MINISO PK"
    {
        "pattern": r"rs\.?\s*([\d,]+)\s+spent at\s+(.+?)(?:\s+jazakallah)?\s*$",
        "direction": "debit",
        "amount_group": 1,
        "merchant_group": 2,
    },
    # "PKR 10,000 credited from Parents (Pocket Money)"
    {
        "pattern": r"pkr\s+([\d,]+)\s+credited from\s+(.+?)(?:\s*\(.*\))?\s*$",
        "direction": "credit",
        "amount_group": 1,
        "merchant_group": 2,
    },
    # "Your account has been debited Rs 500 for McDonald's"
    {
        "pattern": r"debited\s+rs\.?\s*([\d,]+)\s+(?:for|at)\s+(.+?)\s*$",
        "direction": "debit",
        "amount_group": 1,
        "merchant_group": 2,
    },
]

# No-amount special cases: bank notifications that don't expose a clean amount.
# (regex, merchant_name, category)
SPECIAL_PATTERNS = [
    # "TRF to NayaPay A/C 923... (ID: 98765)" — peer-to-peer transfer
    (r"\btrf\s+to\b", "P2P Transfer", "Transfer"),
    # "POS WDRWL *3319 AT HBL_ATM_0012 Karachi PK" — ATM cash withdrawal
    (r"\b(?:pos\s+wdrwl|atm)\b", "ATM Withdrawal", "Utilities"),
]

CATEGORY_MAP = {
    "kfc": "Food", "optp": "Food", "school cafeteria": "Food", "mcdonalds": "Food",
    "coffee wagera": "Coffee", "chai spot": "Coffee", "espresso": "Coffee",
    "wb by hemani": "Beauty", "bagallery": "Beauty", "cosmo": "Beauty",
    "miniso": "Lifestyle", "miniso pk": "Lifestyle", "miniso lucky one": "Lifestyle",
    "atrium cinema": "Entertainment", "nueplex": "Entertainment",
    "indrive": "Transport", "yango": "Transport", "careem": "Transport",
    "easyload": "Utilities",
    "liberty books": "Education",
    # Allowance / pocket-money credits
    "parents": "Allowance", "pocket money": "Allowance",
}


def categorize_merchant(merchant: str) -> str:
    m = merchant.lower().strip()
    for key, cat in CATEGORY_MAP.items():
        if key in m:
            return cat
    return "Other"


def _regex_result(merchant: str, amount, direction: str, category: str) -> dict:
    return {
        "merchant_name": merchant,
        "amount_pkr": amount,
        "direction": direction,
        "payment_method": None,
        "category": category,
        "confidence": "high",
        "method": "regex",
    }


def parse_notification(raw_text: str) -> dict:
    text = raw_text.strip()

    # Stage 1a — amount-bearing patterns
    for pat in PATTERNS:
        match = re.search(pat["pattern"], text, re.IGNORECASE)
        if match:
            amount = float(match.group(pat["amount_group"]).replace(",", ""))
            merchant = match.group(pat["merchant_group"]).strip()
            return _regex_result(merchant, amount, pat["direction"], categorize_merchant(merchant))

    # Stage 1b — special no-amount patterns (transfers, ATM withdrawals)
    for pattern, merchant, category in SPECIAL_PATTERNS:
        if re.search(pattern, text, re.IGNORECASE):
            return _regex_result(merchant, None, "debit", category)

    # Stage 2 — LLM fallback
    return llm_parse_notification(text)


def llm_parse_notification(raw_text: str) -> dict:
    """LLM fallback for notifications the regex layer can't handle.

    Returns the same dict shape with method='llm'. Defensive: if the LLM call or
    JSON parse fails, returns a low-confidence 'Other' stub rather than raising.
    """
    import json

    try:
        from services.llm_service import client, MODEL

        prompt = (
            "Extract a transaction from this Pakistani bank SMS. Respond with ONLY "
            "a JSON object with keys: merchant_name (string), amount_pkr (number or null), "
            "direction ('debit' or 'credit'). No other text.\n\n"
            f"SMS: {raw_text}"
        )
        resp = client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=120,
            temperature=0,
        )
        content = resp.choices[0].message.content.strip()
        # Strip code fences if present
        content = re.sub(r"^```(?:json)?|```$", "", content, flags=re.MULTILINE).strip()
        data = json.loads(content)
        merchant = str(data.get("merchant_name", "Unknown")).strip()
        amount = data.get("amount_pkr")
        return {
            "merchant_name": merchant,
            "amount_pkr": float(amount) if amount is not None else None,
            "direction": data.get("direction", "debit"),
            "payment_method": None,
            "category": categorize_merchant(merchant),
            "confidence": "medium",
            "method": "llm",
        }
    except Exception:
        return {
            "merchant_name": "Unknown",
            "amount_pkr": None,
            "direction": "debit",
            "payment_method": None,
            "category": "Other",
            "confidence": "low",
            "method": "llm",
        }
