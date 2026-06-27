"use client"

import { useSummary } from "@/hooks/useSummary"
import { useInsights } from "@/hooks/useInsights"
import { formatPKR, getSeverityColor } from "@/lib/utils"
import CategoryTable from "@/components/parent/CategoryTable"
import MerchantList from "@/components/parent/MerchantList"
import type { Insight, HealthInsight } from "@/lib/types"

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-canvas border border-hairline rounded-xl p-lg">
      <p className="font-label-mono text-caption text-muted uppercase tracking-wide">
        {label}
      </p>
      <p className="font-headline-md text-[22px] font-bold text-primary mt-xs">
        {value}
      </p>
      {sub && <p className="font-caption text-caption text-muted mt-xxs">{sub}</p>}
    </div>
  )
}

function AlertCard({ insight }: { insight?: Insight }) {
  if (!insight) return null
  const sev = getSeverityColor(insight.severity)
  return (
    <div
      className={`bg-canvas border border-hairline ${sev.border} border-l-4 rounded-xl p-lg space-y-xs`}
    >
      <p className="font-headline-md text-[15px] font-bold text-primary">
        {insight.title}
      </p>
      <p className="font-body-md text-caption text-on-surface-variant leading-relaxed">
        {insight.narrative_parent}
      </p>
    </div>
  )
}

export default function ParentDashboard() {
  const { summary } = useSummary()
  const { insights } = useInsights()

  const byId = (id: Insight["id"]) => insights.find((i) => i.id === id)
  const health = byId("health_score") as HealthInsight | undefined

  if (!summary) {
    return (
      <div className="pt-[72px] px-lg max-w-[480px] mx-auto space-y-md">
        <div className="animate-pulse bg-surface-container rounded-2xl h-[160px] w-full" />
        <div className="animate-pulse bg-surface-container rounded-xl h-[200px] w-full" />
      </div>
    )
  }

  const score = health?.metrics.score
  const grade = health?.metrics.grade

  return (
    <div className="px-lg max-w-[480px] mx-auto pt-lg space-y-section-mobile">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-label-mono text-caption text-muted uppercase tracking-wide">
            Parent Mode
          </p>
          <h1 className="font-headline-md text-headline-md font-bold text-primary">
            {summary.user.name}
          </h1>
          <p className="font-caption text-caption text-muted">
            {summary.user.age} · {summary.user.city} ·{" "}
            {formatPKR(summary.user.stated_monthly_allowance_pkr)}/mo
          </p>
        </div>
      </div>

      {/* Spending Health Hero (navy) */}
      <section className="bg-tertiary-container rounded-2xl p-xl text-on-primary relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-secondary opacity-20 blur-3xl -translate-y-1/2 translate-x-1/2 rounded-full" />
        <div className="relative z-10 space-y-md">
          <span className="font-label-mono text-caption uppercase tracking-widest text-secondary-fixed-dim">
            ✦ Spending Health
          </span>
          <p className="font-body-lg text-body-md leading-relaxed opacity-90">
            {health?.narrative_parent ??
              "Generating this month's spending summary…"}
          </p>
          <div className="flex flex-wrap gap-sm pt-xs">
            <span className="font-label-mono text-caption bg-white/10 rounded-full px-md py-xs">
              {summary.totals.transaction_count} transactions
            </span>
            <span className="font-label-mono text-caption bg-white/10 rounded-full px-md py-xs">
              Score: {score ?? "—"}/100
            </span>
            <span className="font-label-mono text-caption bg-secondary-container text-on-secondary-container rounded-full px-md py-xs">
              ● Monitoring Active
            </span>
          </div>
        </div>
      </section>

      {/* Stats grid */}
      <section className="space-y-md">
        <p className="font-label-mono text-caption text-muted uppercase tracking-wide">
          Governance Controls
        </p>
        <div className="grid grid-cols-2 gap-md">
          <StatCard label="Total Spent" value={formatPKR(summary.totals.total_debit_pkr)} />
          <StatCard label="Transactions" value={String(summary.totals.transaction_count)} />
          <StatCard
            label="Late-Night"
            value={String(summary.late_night.count)}
            sub={`${summary.late_night.percentage_of_total}% of total`}
          />
          <StatCard
            label="Health Score"
            value={`${score ?? "—"}/100`}
            sub={grade ? `Grade ${grade}` : undefined}
          />
        </div>
      </section>

      {/* Category breakdown */}
      <section className="space-y-md">
        <p className="font-label-mono text-caption text-muted uppercase tracking-wide">
          Spending Breakdown
        </p>
        <CategoryTable categories={summary.by_category} />
      </section>

      {/* Top merchants */}
      <section className="space-y-md">
        <p className="font-label-mono text-caption text-muted uppercase tracking-wide">
          Top Merchants
        </p>
        <MerchantList merchants={summary.top_merchants} />
      </section>

      {/* Alert cards */}
      <section className="space-y-md">
        <AlertCard insight={byId("impulse_late_night")} />
        <AlertCard insight={byId("beauty_creep")} />
      </section>

      {/* Download CTA (presentational) */}
      <section className="pb-md">
        <button className="w-full bg-primary text-on-primary font-button text-button rounded-full h-12 flex items-center justify-center gap-xs">
          Download June Report
          <span className="material-symbols-outlined text-[18px]">download</span>
        </button>
      </section>
    </div>
  )
}
