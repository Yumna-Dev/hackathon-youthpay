"use client"

import { useState } from "react"
import Link from "next/link"
import { useInsights } from "@/hooks/useInsights"
import InsightCard from "@/components/insights/InsightCard"

export default function InsightsPage() {
  const { insights, isLoading } = useInsights()
  const [view, setView] = useState<"teen" | "parent">("teen")

  return (
    <>
      <header className="flex justify-between items-center px-lg py-sm w-full bg-canvas fixed top-0 z-50 border-b border-hairline">
        <div className="flex items-center gap-sm">
          <Link
            href="/teen"
            aria-label="Back"
            className="material-symbols-outlined text-primary p-xs"
          >
            arrow_back
          </Link>
          <span className="font-headline-md text-[18px] font-bold text-primary">
            Your Insights
          </span>
        </div>
        {/* Teen / Parent toggle */}
        <div className="flex items-center bg-surface-container rounded-full p-[2px]">
          {(["teen", "parent"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`font-button text-[12px] capitalize rounded-full px-md py-xs transition-colors ${
                view === v
                  ? "bg-primary text-on-primary"
                  : "text-on-surface-variant"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </header>

      <div className="pt-[72px] px-lg max-w-[480px] mx-auto space-y-md pb-md">
        {isLoading || insights.length === 0
          ? Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-surface-container rounded-xl h-[200px] w-full"
              />
            ))
          : insights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} view={view} />
            ))}
      </div>
    </>
  )
}
