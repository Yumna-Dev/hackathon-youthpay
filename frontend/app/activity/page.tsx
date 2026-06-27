"use client"

import { useState } from "react"
import { useSummary } from "@/hooks/useSummary"
import { useTransactions } from "@/hooks/useTransactions"
import TransactionRow from "@/components/shared/TransactionRow"

export default function ActivityPage() {
  const { summary } = useSummary()
  const [category, setCategory] = useState<string>("All")

  const filters = category === "All" ? {} : { category }
  const { transactions, filtered, total, isLoading } = useTransactions(filters)

  const categories = ["All", ...(summary?.by_category.map((c) => c.category) ?? [])]

  return (
    <>
      <header className="flex justify-between items-center px-lg py-sm w-full bg-canvas fixed top-0 z-50 border-b border-hairline">
        <span className="font-headline-md text-[18px] font-bold text-primary">
          Activity
        </span>
        <span className="font-label-mono text-caption text-muted">
          {filtered} of {total}
        </span>
      </header>

      <div className="pt-[72px] max-w-[480px] mx-auto">
        {/* Category filter chips */}
        <div className="flex gap-sm overflow-x-auto px-lg py-md">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`shrink-0 font-label-mono text-caption rounded-full px-md py-xs border transition-colors ${
                category === c
                  ? "bg-primary text-on-primary border-primary"
                  : "bg-canvas text-on-surface-variant border-hairline"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="px-lg pb-md">
          {isLoading ? (
            <div className="space-y-md">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-16 bg-surface-container rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center text-muted text-body-md py-section-mobile">
              No transactions in this category.
            </div>
          ) : (
            <div className="divide-y divide-hairline">
              {transactions.map((t) => (
                <TransactionRow key={t.id} txn={t} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
