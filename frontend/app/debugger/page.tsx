"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { parseNotification } from "@/lib/api"
import ParseCard, { type CleanResult } from "@/components/debugger/ParseCard"

const LIVE_RAW = "Spent Rs. 850 @ ESPRESSO-KHI JazakAllah"

// Cards 2 & 3 are static demo cases (PRD §9.6).
const STATIC_CARDS: { raw: string; result: CleanResult }[] = [
  {
    raw: "TRF to NayaPay A/C 923... (ID: 98765)",
    result: { merchant: "P2P Transfer", category: "Transfer", amount: null, method: "Neural Pattern" },
  },
  {
    raw: "POS WDRWL *3319 AT HBL_ATM_0012 Karachi PK",
    result: { merchant: "ATM Withdrawal", category: "Utilities", amount: null, method: "Regex Scrub" },
  },
]

export default function DebuggerPage() {
  const [liveResult, setLiveResult] = useState<CleanResult | null>(null)
  const [latencyMs, setLatencyMs] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const t0 = performance.now()
      try {
        const res = await parseNotification(LIVE_RAW)
        const dt = Math.round(performance.now() - t0)
        if (cancelled) return
        const p = res.parsed
        setLiveResult({
          merchant: p.merchant_name,
          category: p.category,
          amount: p.amount_pkr,
          method: p.method === "regex" ? "Regex Scrub" : "Neural Parse",
        })
        setLatencyMs(dt)
      } catch {
        if (!cancelled) setLatencyMs(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

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
          Engine Debugger
        </span>
      </header>

      <div className="pt-[72px] px-lg max-w-[480px] mx-auto space-y-lg pb-md">
        {/* Status banner (dark) */}
        <section className="bg-primary text-on-primary rounded-xl p-lg flex justify-between items-center relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-white/5 rounded-full blur-xl" />
          <div className="space-y-xxs relative z-10">
            <p className="font-label-mono text-[10px] uppercase tracking-widest opacity-70">
              System Status
            </p>
            <h2 className="font-headline-md text-body-lg font-bold">
              Neural Cleanup Active
            </h2>
          </div>
          <div className="flex flex-col items-end relative z-10">
            <span className="font-headline-md text-headline-md font-bold">
              {latencyMs != null ? `${latencyMs}ms` : "—"}
            </span>
            <p className="font-caption text-caption opacity-60">Latency</p>
          </div>
        </section>

        {/* Parse cards */}
        <section className="space-y-md">
          <h4 className="font-label-mono text-caption uppercase text-muted tracking-widest font-bold">
            AI Parsing Examples
          </h4>
          <ParseCard raw={LIVE_RAW} result={liveResult ?? undefined} loading={loading} live />
          {STATIC_CARDS.map((c) => (
            <ParseCard key={c.raw} raw={c.raw} result={c.result} />
          ))}
        </section>

        {/* Engine intelligence card (dark green) */}
        <section className="bg-deep-green text-on-primary rounded-xl p-lg space-y-md">
          <div className="flex items-center gap-xs">
            <span className="text-coral">✦</span>
            <span className="font-label-mono text-caption uppercase text-coral font-bold tracking-widest">
              Engine Intelligence
            </span>
          </div>
          <p className="font-body-md text-caption leading-relaxed opacity-80">
            The engine strips Roman-Urdu noise, JazakAllah suffixes, and transfer
            IDs to isolate the merchant, amount, and intent — regex first, LLM
            fallback for anything unknown.
          </p>
          <div className="grid grid-cols-2 gap-md pt-xs">
            <div className="bg-white/5 p-md rounded-lg">
              <p className="font-headline-md text-body-lg font-bold">99.8%</p>
              <p className="font-caption text-caption opacity-60">Precision</p>
            </div>
            <div className="bg-white/5 p-md rounded-lg">
              <p className="font-body-md font-bold">Active</p>
              <p className="font-caption text-caption opacity-60">Adaptive Learning</p>
            </div>
          </div>
          <button className="w-full bg-primary text-on-primary font-button text-button rounded-full h-12 flex items-center justify-center gap-xs active:scale-[0.98] transition-transform">
            Approve Categorization
            <span className="material-symbols-outlined text-[18px]">done</span>
          </button>
        </section>
      </div>
    </>
  )
}
