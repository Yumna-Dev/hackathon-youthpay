import type { Insight } from "@/lib/types"
import { formatPKR, getSeverityColor } from "@/lib/utils"
import MetricPill from "@/components/shared/MetricPill"
import WeekendChart from "./WeekendChart"

interface InsightCardProps {
  insight: Insight
  view: "teen" | "parent"
}

const ICON_BY_ID: Record<Insight["id"], string> = {
  coffee_addiction: "coffee",
  impulse_late_night: "nights_stay",
  beauty_creep: "spa",
  health_score: "monitor_heart",
  weekend_vs_weekday: "calendar_month",
}

/** Metric pills per insight, narrowing on the discriminated union. */
function pills(insight: Insight): string[] {
  switch (insight.id) {
    case "coffee_addiction": {
      const m = insight.metrics
      return [
        formatPKR(m.total_pkr),
        `${m.visit_count} visits`,
        `${formatPKR(m.annualized_pkr)}/yr`,
      ]
    }
    case "impulse_late_night": {
      const m = insight.metrics
      return [
        `${m.late_night_count} late-night`,
        `${m.late_night_percentage}% of txns`,
        `Largest ${formatPKR(m.largest_late_night_pkr)} · ${m.largest_late_night_merchant} @ ${m.largest_late_night_time}`,
      ]
    }
    case "beauty_creep": {
      const m = insight.metrics
      return [
        formatPKR(m.beauty_total_pkr),
        `${m.transaction_count} purchases`,
        `${m.beauty_as_pct_of_food}% of food`,
      ]
    }
    case "health_score": {
      const m = insight.metrics
      return [`${m.score}/100`, `Grade ${m.grade}`]
    }
    case "weekend_vs_weekday": {
      const m = insight.metrics
      return [
        `Weekend ${formatPKR(m.weekend_total_pkr)}`,
        `Weekday ${formatPKR(m.weekday_total_pkr)}`,
      ]
    }
  }
}

function HealthComponents({ insight }: { insight: Insight }) {
  if (insight.id !== "health_score") return null
  const c = insight.metrics.components
  const rows: [string, number][] = [
    ["Savings Rate", c.savings_rate],
    ["Late-Night Control", c.late_night_control],
    ["Category Diversity", c.category_diversity],
    ["Education Ratio", c.education_ratio],
  ]
  return (
    <div className="space-y-sm pt-sm">
      {rows.map(([label, val]) => (
        <div key={label} className="flex items-center gap-md">
          <span className="font-caption text-caption text-muted w-[140px] shrink-0">
            {label}
          </span>
          <div className="flex-1 h-1.5 bg-surface-container rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full"
              style={{ width: `${(val / 25) * 100}%` }}
            />
          </div>
          <span className="font-label-mono text-caption text-on-surface-variant w-[44px] text-right">
            {val}/25
          </span>
        </div>
      ))}
      <p className="font-body-md text-caption text-on-surface-variant pt-xs">
        💡 {insight.metrics.coaching_tip}
      </p>
    </div>
  )
}

export default function InsightCard({ insight, view }: InsightCardProps) {
  const sev = getSeverityColor(insight.severity)
  const narrative =
    view === "teen" ? insight.narrative_teen : insight.narrative_parent

  return (
    <div
      className={`bg-canvas border border-hairline ${sev.border} border-l-4 rounded-xl p-lg space-y-md`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-sm min-w-0">
          <span className={`material-symbols-outlined ${sev.text}`}>
            {ICON_BY_ID[insight.id]}
          </span>
          <h3 className="font-headline-md text-[18px] font-bold text-primary truncate">
            {insight.title}
          </h3>
        </div>
        <span
          className={`font-label-mono text-[10px] uppercase ${sev.text} ${sev.bg} rounded-full px-sm py-[2px] shrink-0`}
        >
          {insight.severity}
        </span>
      </div>

      <p className="font-headline-md text-[16px] font-semibold text-primary leading-snug">
        {insight.headline}
      </p>

      <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
        {narrative}
      </p>

      <div className="flex flex-wrap gap-xs">
        {pills(insight).map((p, i) => (
          <MetricPill key={i}>{p}</MetricPill>
        ))}
      </div>

      <HealthComponents insight={insight} />

      {insight.id === "weekend_vs_weekday" && (
        <WeekendChart metrics={insight.metrics} />
      )}
    </div>
  )
}
