// Typed fetch wrappers for the YouthPay FastAPI backend (PRD §6 endpoints).

import type {
  SummaryResponse,
  InsightsResponse,
  TransactionsResponse,
  ParseResponse,
  FetchEmailsResponse,
  TxnDirection,
} from "./types"

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

async function getJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`)
  if (!res.ok) {
    throw new Error(`GET ${path} failed: ${res.status}`)
  }
  return res.json() as Promise<T>
}

// GET /api/summary
export function fetchSummary(): Promise<SummaryResponse> {
  return getJSON<SummaryResponse>("/api/summary")
}

// GET /api/insights
export function fetchInsights(): Promise<InsightsResponse> {
  return getJSON<InsightsResponse>("/api/insights")
}

export interface TransactionFilters {
  category?: string
  direction?: TxnDirection
  limit?: number
  offset?: number
}

// GET /api/transactions?category=&direction=&limit=&offset=
export function fetchTransactions(
  filters: TransactionFilters = {}
): Promise<TransactionsResponse> {
  const params = new URLSearchParams()
  if (filters.category) params.set("category", filters.category)
  if (filters.direction) params.set("direction", filters.direction)
  if (filters.limit !== undefined) params.set("limit", String(filters.limit))
  if (filters.offset !== undefined) params.set("offset", String(filters.offset))

  const qs = params.toString()
  return getJSON<TransactionsResponse>(
    `/api/transactions${qs ? `?${qs}` : ""}`
  )
}

// POST /api/parse-notification
export async function parseNotification(
  raw_text: string,
  source_hint?: string
): Promise<ParseResponse> {
  const res = await fetch(`${API_BASE}/api/parse-notification`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ raw_text, source_hint }),
  })
  if (!res.ok) {
    throw new Error(`Parse failed: ${res.status}`)
  }
  return res.json() as Promise<ParseResponse>
}

// POST /api/fetch-emails (Gmail IMAP bonus). Throws on non-2xx (e.g. when
// Gmail credentials aren't configured) so the UI can show a graceful message.
export async function fetchEmails(
  secret = "youthpay-demo-2026",
  max_per_sender = 20
): Promise<FetchEmailsResponse> {
  const res = await fetch(`${API_BASE}/api/fetch-emails`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ secret, max_per_sender }),
  })
  if (!res.ok) {
    throw new Error(`Fetch emails failed: ${res.status}`)
  }
  return res.json() as Promise<FetchEmailsResponse>
}
