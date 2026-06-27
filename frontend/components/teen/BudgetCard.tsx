import type { SummaryResponse } from "@/lib/types"
import { formatPKR } from "@/lib/utils"

interface BudgetCardProps {
  summary?: SummaryResponse
}

/**
 * Deep-green budget hero (PRD §9.6, §9.4 data mapping). All amounts come from
 * /api/summary — nothing hardcoded:
 *   spent     = totals.total_debit_pkr
 *   budget    = user.stated_monthly_allowance_pkr
 *   remaining = total_credit_pkr - total_debit_pkr
 *   % used    = (total_debit / allowance) * 100
 * Haniya spends well over her stated allowance, so the bar caps at 100% (red).
 */
export default function BudgetCard({ summary }: BudgetCardProps) {
  if (!summary) {
    return (
      <div className="animate-pulse bg-surface-container rounded-3xl h-[180px] w-full" />
    )
  }

  const allowance = summary.user.stated_monthly_allowance_pkr
  const spent = summary.totals.total_debit_pkr
  const remaining = summary.totals.total_credit_pkr - summary.totals.total_debit_pkr
  const pctUsed = Math.round((spent / allowance) * 100)
  const barWidth = Math.min(100, pctUsed)
  const overBudget = pctUsed > 50
  // Parse year/month parts as local to avoid a UTC->local off-by-one (a bare
  // "2026-06-01" parses as UTC midnight and can shift to May 31 in -UTC zones).
  const [py, pm] = summary.period.from.split("-").map(Number)
  const monthLabel = new Date(py, pm - 1, 1)
    .toLocaleDateString("en-US", { month: "long", year: "numeric" })
    .toUpperCase()

  return (
    <div className="bg-deep-green rounded-3xl p-xl text-on-primary relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-secondary opacity-20 blur-3xl -translate-y-1/2 translate-x-1/2 rounded-full" />
      <div className="relative z-10 space-y-md">
        <div className="flex justify-between items-start">
          <span className="font-label-mono text-caption uppercase tracking-widest opacity-80">
            Available Allowance
          </span>
          <span className="font-label-mono text-caption bg-white/10 px-sm py-[2px] rounded-full">
            {monthLabel}
          </span>
        </div>

        <div className="space-y-xxs">
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile font-bold tracking-tight">
            {formatPKR(remaining)}
          </h1>
          <p className="font-caption text-caption opacity-70">
            Remaining from {formatPKR(allowance)} budget
          </p>
        </div>

        <div className="pt-md">
          <div className="w-full h-[6px] bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-out ${
                overBudget ? "bg-error" : "bg-secondary-fixed-dim"
              }`}
              style={{ width: `${barWidth}%` }}
            />
          </div>
          <div className="flex justify-between mt-xs font-label-mono text-[10px] uppercase opacity-70">
            <span>Spent: {formatPKR(spent)}</span>
            <span>{pctUsed.toLocaleString("en-IN")}% Used</span>
          </div>
        </div>
      </div>
    </div>
  )
}
