from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel

from services.parser import parse_notification

router = APIRouter()


class ParseRequest(BaseModel):
    raw_text: str
    source_hint: Optional[str] = None


@router.post("/parse-notification")
def parse(req: ParseRequest):
    parsed = parse_notification(req.raw_text)
    return {
        "success": True,
        "parsed": parsed,
        "raw_text": req.raw_text,
    }
