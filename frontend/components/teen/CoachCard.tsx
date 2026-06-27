import Link from "next/link"

interface CoachCardProps {
  narrative?: string
  loading?: boolean
}

/**
 * AI Coach console card (PRD §9.6 Section 2). Near-black card with the
 * LLM-generated teen narrative (insights[0].narrative_teen).
 */
export default function CoachCard({ narrative, loading }: CoachCardProps) {
  return (
    <div className="bg-primary rounded-xl p-lg border border-hairline">
      <div className="flex items-start gap-md">
        <div className="p-sm bg-secondary-container rounded-lg shrink-0">
          <span
            className="material-symbols-outlined text-on-secondary-container"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            psychology
          </span>
        </div>
        <div className="space-y-sm min-w-0">
          <h3 className="font-headline-md text-[18px] font-bold text-on-primary">
            YouthPay Intelligence
          </h3>

          {loading || !narrative ? (
            <div className="space-y-2">
              <div className="h-3 bg-on-primary/15 rounded animate-pulse w-full" />
              <div className="h-3 bg-on-primary/15 rounded animate-pulse w-11/12" />
              <div className="h-3 bg-on-primary/15 rounded animate-pulse w-4/5" />
            </div>
          ) : (
            <p className="font-body-md text-on-primary opacity-80 leading-relaxed">
              {narrative}
            </p>
          )}

          <div className="pt-xs">
            <Link
              href="/insights"
              className="font-button text-button text-secondary-fixed-dim inline-flex items-center gap-xs hover:gap-sm transition-all"
            >
              See All Insights
              <span className="material-symbols-outlined text-[16px]">
                arrow_forward
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
