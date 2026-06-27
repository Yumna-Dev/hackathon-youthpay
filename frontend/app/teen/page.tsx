"use client"

import TopAppBar from "@/components/layout/TopAppBar"
import BudgetCard from "@/components/teen/BudgetCard"
import CoachCard from "@/components/teen/CoachCard"
import InsightPreviewRow from "@/components/teen/InsightPreviewRow"
import SpendingRing from "@/components/teen/SpendingRing"
import TransactionFeed from "@/components/teen/TransactionFeed"
import { useSummary } from "@/hooks/useSummary"
import { useInsights } from "@/hooks/useInsights"
import { useTransactions } from "@/hooks/useTransactions"

export default function TeenDashboard() {
  const { summary, isLoading: summaryLoading } = useSummary()
  const { insights, isLoading: insightsLoading } = useInsights()
  const { transactions, isLoading: txnsLoading } = useTransactions({ limit: 4 })

  const coachNarrative = insights[0]?.narrative_teen

  return (
    <>
      <TopAppBar
        name={summary?.user.name}
        subtitle={summary ? `${summary.user.city}, PK` : undefined}
      />

      <div className="pt-[72px] px-lg max-w-[480px] mx-auto space-y-section-mobile">
        <div className="mt-md space-y-md">
          <BudgetCard summary={summary} />
          <CoachCard narrative={coachNarrative} loading={insightsLoading} />
        </div>

        <InsightPreviewRow insights={insights} loading={insightsLoading} />

        <SpendingRing
          categories={summary?.by_category ?? []}
          total={summary?.totals.total_debit_pkr}
          loading={summaryLoading}
        />

        <TransactionFeed transactions={transactions} loading={txnsLoading} />
      </div>
    </>
  )
}
