import type { MerchantSummary } from "@/lib/types"
import { formatPKR } from "@/lib/utils"

interface MerchantListProps {
  merchants: MerchantSummary[]
}

/** Ranked top-merchants list (PRD §9.6 parent). */
export default function MerchantList({ merchants }: MerchantListProps) {
  return (
    <div className="divide-y divide-hairline">
      {merchants.map((m, i) => (
        <div key={m.merchant} className="flex items-center justify-between py-md">
          <div className="flex items-center gap-md min-w-0">
            <span className="font-label-mono text-caption text-muted w-5 shrink-0">
              {i + 1}
            </span>
            <div className="min-w-0">
              <p className="font-headline-md text-[15px] font-semibold text-primary truncate">
                {m.merchant}
              </p>
              <p className="font-caption text-caption text-muted">
                {m.count} visits
              </p>
            </div>
          </div>
          <span className="font-label-mono text-body-md font-bold text-primary shrink-0">
            {formatPKR(m.amount_pkr)}
          </span>
        </div>
      ))}
    </div>
  )
}
