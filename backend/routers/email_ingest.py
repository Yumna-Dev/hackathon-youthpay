import os
from datetime import datetime

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from data.transactions import TRANSACTIONS
from services.email_fetcher import fetch_bank_emails
from services.parser import parse_notification

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

    # Dedup guard scoped to previously-merged Gmail rows only (keeps repeat calls
    # idempotent without skipping emails whose text matches the original seed data).
    existing_raws = {
        t.get("raw_notification") for t in TRANSACTIONS if t.get("source") == "Gmail"
    }

    transactions = []
    failed = 0
    for raw in raw_emails:
        try:
            parsed = parse_notification(raw)
            parsed["raw_text"] = raw
            transactions.append(parsed)

            # Merge into the in-memory list so it shows up in /api/transactions (/activity).
            if raw not in existing_raws:
                TRANSACTIONS.append(
                    {
                        "id": len(TRANSACTIONS) + 1,
                        "date_time": datetime.now().isoformat(),
                        "merchant_name": parsed["merchant_name"],
                        "amount_pkr": parsed["amount_pkr"] or 0,
                        "direction": parsed["direction"],
                        "category": parsed["category"],
                        "payment_method": parsed.get("payment_method") or "Email",
                        "source": "Gmail",
                        "raw_notification": raw,
                    }
                )
                existing_raws.add(raw)
        except Exception:
            failed += 1

    return {
        "success": True,
        "emails_fetched": len(raw_emails),
        "transactions_parsed": len(transactions),
        "failed": failed,
        "transactions": transactions,
    }
