import type { ParseResponse } from "@/lib/types"
import { formatPKR } from "@/lib/utils"

interface ParsedResultProps {
  result: ParseResponse
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-sm border-b border-hairline last:border-0">
      <span className="font-caption text-caption text-muted uppercase tracking-wide">
        {label}
      </span>
      <span className="font-label-mono text-body-md text-primary">{children}</span>
    </div>
  )
}

/** Structured output of POST /api/parse-notification (PRD §3 ingest). */
export default function ParsedResult({ result }: ParsedResultProps) {
  const p = result.parsed
  const isCredit = p.direction === "credit"

  return (
    <div className="bg-canvas border border-hairline rounded-xl p-lg space-y-xs">
      <div className="flex items-center gap-xs pb-sm">
        <span className="material-symbols-outlined text-secondary">check_circle</span>
        <h3 className="font-headline-md text-[16px] font-bold text-primary">
          Parsed Result
        </h3>
      </div>

      <Row label="Merchant">{p.merchant_name}</Row>
      <Row label="Amount">
        {p.amount_pkr !== null ? formatPKR(p.amount_pkr) : "—"}
      </Row>
      <Row label="Direction">
        <span className={isCredit ? "text-secondary" : "text-error"}>
          {p.direction}
        </span>
      </Row>
      <Row label="Category">
        <span className="bg-coral/10 text-coral font-label-mono text-[11px] px-sm py-px rounded uppercase">
          {p.category}
        </span>
      </Row>
      <Row label="Method">
        {p.method} · {p.confidence} conf.
      </Row>
    </div>
  )
}
