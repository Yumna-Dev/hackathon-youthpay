"""
YouthPay Intelligence Engine — FastAPI entrypoint.

Phase 1 skeleton: CORS configured + /health only. Routers are wired in later
phases (summary, transactions, insights, parse) as each is built and verified.
"""

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

from routers import summary, transactions, insights, parse, email_ingest

app = FastAPI(title="YouthPay Intelligence Engine", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://youthpay-mvp.vercel.app", "http://localhost:3000"],
    # Allow any Vercel deployment (prod + previews) and any localhost dev port.
    allow_origin_regex=r"https://.*\.vercel\.app|http://localhost:\d+",
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

app.include_router(summary.router, prefix="/api")
app.include_router(transactions.router, prefix="/api")
app.include_router(insights.router, prefix="/api")
app.include_router(parse.router, prefix="/api")
app.include_router(email_ingest.router, prefix="/api")


@app.get("/health")
def health():
    return {"status": "ok"}
