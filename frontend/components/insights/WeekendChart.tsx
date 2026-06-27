"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"
import type { WeekendMetrics } from "@/lib/types"
import { formatPKR } from "@/lib/utils"

interface WeekendChartProps {
  metrics: WeekendMetrics
}

/** Weekend vs Weekday spend (PRD §9.8). Two bars, flat, no grid lines. */
export default function WeekendChart({ metrics }: WeekendChartProps) {
  const data = [
    { label: "Weekday", amount: metrics.weekday_total_pkr, fill: "#e2e2e2" },
    { label: "Weekend", amount: metrics.weekend_total_pkr, fill: "#7C3AED" },
  ]

  return (
    <div className="h-[160px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
          <XAxis
            dataKey="label"
            tick={{ fontSize: 12, fill: "#47464b" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis hide />
          <Tooltip
            cursor={{ fill: "transparent" }}
            formatter={(value) => [formatPKR(Number(value)), "Spent"] as [string, string]}
          />
          <Bar dataKey="amount" radius={[6, 6, 0, 0]} maxBarSize={88}>
            {data.map((d) => (
              <Cell key={d.label} fill={d.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
