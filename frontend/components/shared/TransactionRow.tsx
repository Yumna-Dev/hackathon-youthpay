import type { Transaction } from "@/lib/types"
import { formatPKR, formatDate } from "@/lib/utils"
import { categoryIcon } from "@/lib/categories"

function amountDisplay(t: Transaction): { text: string; className: string } {
  if (t.direction === "credit")
    return { text: `+ ${formatPKR(t.amount_pkr)}`, className: "text-secondary" }
  if (t.direction === "info") return { text: "—", className: "text-muted" }
  return { text: `- ${formatPKR(t.amount_pkr)}`, className: "text-error" }
}

/** Single transaction row (PRD §9.5), shared by the teen feed and /activity. */
export default function TransactionRow({ txn }: { txn: Transaction }) {
  const amt = amountDisplay(txn)
  return (
    <div className="flex items-center justify-between py-md">
      <div className="flex items-center gap-md min-w-0">
        <div className="w-12 h-12 bg-soft-stone rounded-lg flex items-center justify-center text-primary shrink-0">
          <span className="material-symbols-outlined">
            {categoryIcon(txn.category)}
          </span>
        </div>
        <div className="min-w-0">
          <p className="font-headline-md text-[16px] font-semibold truncate">
            {txn.merchant_name}
          </p>
          <div className="flex items-center gap-xs">
            <span className="bg-coral/10 text-coral font-label-mono text-[10px] px-xs py-px rounded uppercase">
              {txn.category}
            </span>
            <span className="text-muted text-caption">
              {formatDate(txn.date_time, { withTime: true })}
            </span>
          </div>
        </div>
      </div>
      <div className="text-right shrink-0 pl-md">
        <p className={`font-label-mono text-body-md font-bold ${amt.className}`}>
          {amt.text}
        </p>
        {txn.payment_method && (
          <p className="text-muted text-caption">{txn.payment_method}</p>
        )}
      </div>
    </div>
  )
}
