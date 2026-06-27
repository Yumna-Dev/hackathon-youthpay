import Link from "next/link"
import type { Transaction } from "@/lib/types"
import { formatPKR, formatDate } from "@/lib/utils"
import { categoryIcon } from "@/lib/categories"

interface TransactionFeedProps {
  transactions: Transaction[]
  loading?: boolean
}

function amountDisplay(t: Transaction): { text: string; className: string } {
  if (t.direction === "credit") {
    return { text: `+ ${formatPKR(t.amount_pkr)}`, className: "text-secondary" }
  }
  if (t.direction === "info") {
    return { text: "—", className: "text-muted" }
  }
  return { text: `- ${formatPKR(t.amount_pkr)}`, className: "text-error" }
}

export default function TransactionFeed({
  transactions,
  loading,
}: TransactionFeedProps) {
  return (
    <section className="space-y-lg">
      <div className="flex justify-between items-end">
        <h2 className="font-headline-md text-headline-md font-bold">
          Recent Activity
        </h2>
        <Link
          href="/activity"
          className="font-label-mono text-caption text-action-blue hover:underline"
        >
          VIEW ALL
        </Link>
      </div>

      {loading ? (
        <div className="space-y-md">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-16 bg-surface-container rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="divide-y divide-hairline">
          {transactions.map((t) => {
            const amt = amountDisplay(t)
            return (
              <div
                key={t.id}
                className="flex items-center justify-between py-md"
              >
                <div className="flex items-center gap-md min-w-0">
                  <div className="w-12 h-12 bg-soft-stone rounded-lg flex items-center justify-center text-primary shrink-0">
                    <span className="material-symbols-outlined">
                      {categoryIcon(t.category)}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-headline-md text-[16px] font-semibold truncate">
                      {t.merchant_name}
                    </p>
                    <div className="flex items-center gap-xs">
                      <span className="bg-coral/10 text-coral font-label-mono text-[10px] px-xs py-px rounded uppercase">
                        {t.category}
                      </span>
                      <span className="text-muted text-caption">
                        {formatDate(t.date_time, { withTime: true })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0 pl-md">
                  <p className={`font-label-mono text-body-md font-bold ${amt.className}`}>
                    {amt.text}
                  </p>
                  {t.payment_method && (
                    <p className="text-muted text-caption">{t.payment_method}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
