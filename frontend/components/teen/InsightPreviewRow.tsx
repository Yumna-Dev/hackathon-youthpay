import Link from "next/link"
import type { Insight } from "@/lib/types"
import { formatPKR, getSeverityColor } from "@/lib/utils"

interface InsightPreviewRowProps {
  insights: Insight[]
  loading?: boolean
}

const ICON_BY_ID: Record<Insight["id"], string> = {
  coffee_addiction: "coffee",
  impulse_late_night: "nights_stay",
  beauty_creep: "spa",
  health_score: "monitor_heart",
  weekend_vs_weekday: "calendar_month",
}

/** A short headline stat per insight, narrowing on the discriminated union. */
function previewStat(insight: Insight): string {
  switch (insight.id) {
    case "coffee_addiction":
      return formatPKR(insight.metrics.total_pkr)
    case "impulse_late_night":
      return `${insight.metrics.late_night_count} late-night`
    case "beauty_creep":
      return formatPKR(insight.metrics.beauty_total_pkr)
    case "health_score":
      return `${insight.metrics.score}/100 · ${insight.metrics.grade}`
    case "weekend_vs_weekday":
      return formatPKR(insight.metrics.weekend_total_pkr)
  }
}

export default function InsightPreviewRow({
  insights,
  loading,
}: InsightPreviewRowProps) {
  return (
    <section className="space-y-md">
      <div className="flex justify-between items-end">
        <h2 className="font-headline-md text-headline-md font-bold">
          Your Insights
        </h2>
        <span className="font-label-mono text-caption text-muted">
          {insights.length || 5} total
        </span>
      </div>

      <div className="flex gap-md overflow-x-auto -mx-lg px-lg pb-xs">
        {loading || insights.length === 0
          ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="shrink-0 w-[160px] h-[120px] rounded-xl bg-surface-container animate-pulse"
              />
            ))
          : insights.slice(0, 4).map((insight) => {
              const sev = getSeverityColor(insight.severity)
              return (
                <Link
                  key={insight.id}
                  href="/insights"
                  className={`shrink-0 w-[160px] bg-canvas border border-hairline ${sev.border} border-l-4 rounded-xl p-md flex flex-col justify-between gap-sm active:scale-95 transition-transform`}
                >
                  <span className={`material-symbols-outlined ${sev.text}`}>
                    {ICON_BY_ID[insight.id]}
                  </span>
                  <div className="space-y-xxs">
                    <p className="font-headline-md text-[13px] font-semibold leading-tight text-primary">
                      {insight.title}
                    </p>
                    <p className="font-label-mono text-caption text-muted">
                      {previewStat(insight)}
                    </p>
                  </div>
                </Link>
              )
            })}
      </div>
    </section>
  )
}
