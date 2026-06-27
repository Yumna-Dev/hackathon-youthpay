import os

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

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
        "transactions": transactions,
    }
