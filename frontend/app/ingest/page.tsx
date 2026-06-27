"use client"

import { useState } from "react"
import Link from "next/link"
import { parseNotification, fetchEmails } from "@/lib/api"
import type { ParseResponse, FetchEmailsResponse } from "@/lib/types"
import { formatPKR } from "@/lib/utils"
import ParsedResult from "@/components/ingest/ParsedResult"

const SAMPLES: { label: string; text: string }[] = [
  { label: "UBL Debit", text: "Txn Alert: Rs 1701 spent at MINISO PK" },
  { label: "Meezan Credit", text: "PKR 10,000 credited from Parents (Pocket Money)" },
  { label: "Coffee", text: "Spent Rs. 850 @ ESPRESSO-KHI JazakAllah" },
  { label: "P2P Transfer", text: "TRF to NayaPay A/C 923... (ID: 98765)" },
  { label: "ATM Withdrawal", text: "POS WDRWL *3319 AT HBL_ATM_0012 Karachi PK" },
]

export default function IngestPage() {
  const [text, setText] = useState("")
  const [result, setResult] = useState<ParseResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  const [gmailLoading, setGmailLoading] = useState(false)
  const [gmailResult, setGmailResult] = useState<FetchEmailsResponse | null>(null)
  const [gmailError, setGmailError] = useState(false)

  async function handleParse() {
    if (!text.trim()) return
    setLoading(true)
    setError(false)
    try {
      const res = await parseNotification(text.trim())
      setResult(res)
    } catch {
      setError(true)
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  async function handleFetchGmail() {
    setGmailLoading(true)
    setGmailError(false)
    setGmailResult(null)
    try {
      const res = await fetchEmails()
      setGmailResult(res)
    } catch {
      setGmailError(true)
    } finally {
      setGmailLoading(false)
    }
  }

  return (
    <>
      <header className="flex items-center gap-sm px-lg py-sm w-full bg-canvas fixed top-0 z-50 border-b border-hairline">
        <Link
          href="/teen"
          aria-label="Back"
          className="material-symbols-outlined text-primary p-xs"
        >
          arrow_back
        </Link>
        <span className="font-headline-md text-[18px] font-bold text-primary">
          Transaction Ingestion
        </span>
      </header>

      <div className="pt-[72px] px-lg max-w-[480px] mx-auto space-y-lg pb-md">
        <p className="font-body-md text-caption text-muted">
          Paste any Pakistani bank notification — the engine parses it live.
        </p>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g. Txn Alert: Rs 1701 spent at MINISO PK"
          rows={3}
          className="w-full bg-surface-container-low border border-hairline rounded-xl p-md font-body-md text-body-md text-primary resize-none focus:outline-none focus:border-primary"
        />

        <button
          onClick={handleParse}
          disabled={loading || !text.trim()}
          className="w-full bg-primary text-on-primary font-button text-button rounded-full h-12 flex items-center justify-center gap-xs disabled:opacity-40 active:scale-[0.98] transition-transform"
        >
          {loading ? "Parsing…" : "Parse Transaction"}
          {!loading && (
            <span className="material-symbols-outlined text-[18px]">bolt</span>
          )}
        </button>

        {/* Sample chips */}
        <div className="space-y-sm">
          <p className="font-label-mono text-caption text-muted uppercase tracking-wide">
            Try these examples
          </p>
          <div className="flex flex-wrap gap-sm">
            {SAMPLES.map((s) => (
              <button
                key={s.label}
                onClick={() => {
                  setText(s.text)
                  setResult(null)
                  setError(false)
                }}
                className="font-label-mono text-caption text-on-surface-variant bg-canvas border border-hairline rounded-full px-md py-xs hover:border-primary transition-colors"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-error-container text-on-error-container rounded-xl p-lg text-body-md">
            Could not parse that notification. Try one of the examples.
          </div>
        )}

        {result && <ParsedResult result={result} />}

        {/* Gmail fetch (bonus) */}
        <div className="pt-sm border-t border-hairline space-y-sm">
          <p className="font-label-mono text-caption text-muted uppercase tracking-wide">
            Or ingest from a real inbox
          </p>
          <button
            onClick={handleFetchGmail}
            disabled={gmailLoading}
            className="w-full bg-canvas border border-primary text-primary font-button text-button rounded-full h-12 flex items-center justify-center gap-xs disabled:opacity-40 active:scale-[0.98] transition-transform"
          >
            <span className="material-symbols-outlined text-[18px]">mail</span>
            {gmailLoading ? "Connecting to Gmail…" : "Fetch from Gmail"}
          </button>

          {gmailError && (
            <div className="bg-surface-container text-on-surface-variant rounded-xl p-lg text-caption flex items-start gap-sm">
              <span className="material-symbols-outlined text-[18px] text-muted shrink-0">
                info
              </span>
              <span>
                Gmail connection pending — paste a notification above to test
                manually.
              </span>
            </div>
          )}

          {gmailResult && (
            <div className="bg-canvas border border-hairline rounded-xl p-lg space-y-md">
              <p className="font-label-mono text-caption text-secondary uppercase tracking-wide">
                {gmailResult.emails_fetched} emails fetched ·{" "}
                {gmailResult.transactions_parsed} parsed
              </p>
              {gmailResult.transactions.length === 0 ? (
                <p className="text-muted text-caption">
                  No bank emails found in the connected inbox.
                </p>
              ) : (
                <div className="divide-y divide-hairline">
                  {gmailResult.transactions.map((t, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-sm"
                    >
                      <div className="min-w-0">
                        <p className="font-body-md text-[15px] font-semibold text-primary truncate">
                          {t.merchant_name}
                        </p>
                        <span className="bg-coral/10 text-coral font-label-mono text-[10px] px-xs py-px rounded uppercase">
                          {t.category}
                        </span>
                      </div>
                      <span className="font-label-mono text-body-md text-primary shrink-0 pl-md">
                        {t.amount_pkr != null ? formatPKR(t.amount_pkr) : "—"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
