from fastapi import APIRouter

from data.transactions import TRANSACTIONS
from services.insight_engine import compute_summary

router = APIRouter()


@router.get("/summary")
def get_summary():
    return compute_summary(TRANSACTIONS)
