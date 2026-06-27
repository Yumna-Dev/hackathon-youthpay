"use client"

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import type { CategorySummary } from "@/lib/types"
import { formatPKR } from "@/lib/utils"
import { categoryColor } from "@/lib/categories"

interface SpendingRingProps {
  categories: CategorySummary[]
  total?: number
  loading?: boolean
}

/** Category breakdown donut (PRD §9.8). Flat, no labels on slices, legend below. */
export default function SpendingRing({
  categories,
  total,
  loading,
}: SpendingRingProps) {
  if (loading || categories.length === 0) {
    return (
      <section className="space-y-lg">
        <h2 className="font-headline-md text-headline-md font-bold">
          Where did it go?
        </h2>
        <div className="animate-pulse bg-surface-container rounded-xl h-[260px] w-full" />
      </section>
    )
  }

  return (
    <section className="space-y-lg">
      <h2 className="font-headline-md text-headline-md font-bold">
        Where did it go?
      </h2>

      <div className="relative h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={categories}
              dataKey="amount_pkr"
              nameKey="category"
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={100}
              paddingAngle={2}
              stroke="none"
            >
              {categories.map((c) => (
                <Cell key={c.category} fill={categoryColor(c.category)} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        {/* Center total */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="font-caption text-caption text-muted uppercase tracking-wide">
            Total Spent
          </span>
          <span className="font-headline-md text-[18px] font-bold text-primary">
            {formatPKR(total ?? 0)}
          </span>
        </div>
      </div>

      {/* Legend — 2-column grid */}
      <div className="grid grid-cols-2 gap-x-lg gap-y-sm">
        {categories.map((c) => (
          <div key={c.category} className="flex items-center gap-sm">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: categoryColor(c.category) }}
            />
            <span className="font-body-md text-caption text-on-surface truncate">
              {c.category}
            </span>
            <span className="font-label-mono text-caption text-muted ml-auto">
              {c.percentage}%
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
