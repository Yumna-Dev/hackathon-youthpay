import { formatPKR } from "@/lib/utils"

export interface CleanResult {
  merchant: string
  category: string
  amount?: number | null
  method: string
}

interface ParseCardProps {
  raw: string
  result?: CleanResult
  loading?: boolean
  live?: boolean
}

/** Raw SMS -> cleaned output card (PRD §9.6 debugger). */
export default function ParseCard({ raw, result, loading, live }: ParseCardProps) {
  return (
    <div className="bg-canvas border border-hairline rounded-xl p-md space-y-md">
      {/* Raw input */}
      <div className="flex items-center justify-between gap-sm">
        <div className="bg-surface-container rounded p-sm font-label-mono text-caption text-muted flex-1 truncate">
          {raw}
        </div>
        {live && (
          <span className="font-label-mono text-[10px] uppercase text-secondary bg-secondary-container/40 rounded-full px-sm py-[2px] shrink-0">
            live
          </span>
        )}
      </div>

      {/* Arrow */}
      <div className="flex items-center justify-center">
        <span className="material-symbols-outlined text-muted">south</span>
      </div>

      {/* Cleaned output */}
      <div className="bg-soft-stone p-sm rounded border border-hairline">
        {loading || !result ? (
          <div className="space-y-xs">
            <div className="h-3 bg-on-surface/10 rounded animate-pulse w-1/2" />
            <div className="h-3 bg-on-surface/10 rounded animate-pulse w-1/3" />
          </div>
        ) : (
          <div className="flex flex-col gap-xs">
            <div className="flex justify-between items-center gap-sm">
              <span className="font-body-md text-[15px] font-bold text-primary truncate">
                {result.merchant}
              </span>
              <span className="bg-secondary-fixed text-on-secondary-fixed-variant text-[10px] px-xs py-[1px] rounded font-label-mono shrink-0">
                {result.method}
              </span>
            </div>
            <div className="flex justify-between text-caption">
              <span className="text-on-surface-variant">{result.category}</span>
              <span className="font-label-mono font-bold text-primary">
                {result.amount != null ? formatPKR(result.amount) : "—"}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
