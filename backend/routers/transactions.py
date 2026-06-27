from typing import Optional

from fastapi import APIRouter

from data.transactions import TRANSACTIONS

router = APIRouter()

# Fields exposed by the transaction feed (PRD §6 Endpoint 4 schema).
_FIELDS = (
    "id",
    "date_time",
    "merchant_name",
    "amount_pkr",
    "direction",
    "category",
    "payment_method",
    "source",
)


def _project(txn: dict) -> dict:
    return {k: txn.get(k) for k in _FIELDS}


@router.get("/transactions")
def get_transactions(
    category: Optional[str] = None,
    direction: Optional[str] = None,
    limit: Optional[int] = None,
    offset: int = 0,
):
    rows = TRANSACTIONS

    if category is not None:
        rows = [t for t in rows if t["category"].lower() == category.lower()]
    if direction is not None:
        rows = [t for t in rows if t["direction"].lower() == direction.lower()]

    filtered = len(rows)

    # Pagination applies after filtering.
    paged = rows[offset:] if limit is None else rows[offset : offset + limit]

    return {
        "transactions": [_project(t) for t in paged],
        "total": len(TRANSACTIONS),
        "filtered": filtered,
    }
