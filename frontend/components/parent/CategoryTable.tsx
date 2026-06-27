import type { CategorySummary } from "@/lib/types"
import { formatPKR } from "@/lib/utils"
import { categoryColor } from "@/lib/categories"

interface CategoryTableProps {
  categories: CategorySummary[]
}

/** Editorial category breakdown table (PRD §9.6 parent). Hairline rows, no zebra. */
export default function CategoryTable({ categories }: CategoryTableProps) {
  return (
    <div className="divide-y divide-hairline">
      {categories.map((c) => (
        <div key={c.category} className="flex items-center justify-between py-md">
          <div className="flex items-center gap-sm min-w-0">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: categoryColor(c.category) }}
            />
            <span className="font-body-md text-body-md text-on-surface truncate">
              {c.category}
            </span>
          </div>
          <div className="flex items-center gap-lg shrink-0">
            <span className="font-label-mono text-body-md text-primary">
              {formatPKR(c.amount_pkr)}
            </span>
            <span className="font-label-mono text-caption text-muted w-[44px] text-right">
              {c.percentage}%
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
