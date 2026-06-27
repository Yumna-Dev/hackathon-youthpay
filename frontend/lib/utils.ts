// Shared formatting + presentation helpers.

import type { Severity } from "./types"

/**
 * Format a PKR amount with lakh/crore grouping to match the Appendix
 * reference card exactly (e.g. 129298 -> "PKR 1,29,298", 12248 -> "PKR 12,248").
 *
 * NOTE: PRD §9.5 specified "en-PK", but in ICU en-PK uses Western thousands
 * grouping ("129,298") and does NOT match the Appendix's "1,29,298". en-IN is
 * the locale that produces the documented lakh grouping. User-approved 2026-06-27.
 * Always use this — never render raw numbers.
 */
export function formatPKR(amount: number): string {
  return `PKR ${Math.round(amount).toLocaleString("en-IN")}`
}

/**
 * Format an ISO date/datetime string for the transaction feed.
 * Default: "Jun 30". Pass { withTime: true } for "Jun 30, 11:00 PM".
 */
export function formatDate(
  iso: string,
  opts: { withTime?: boolean } = {}
): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso

  const date = d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  if (!opts.withTime) return date

  const time = d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })
  return `${date}, ${time}`
}

export interface SeverityColor {
  /** left-border accent on insight cards (PRD §9.5) */
  border: string
  /** text/icon color */
  text: string
  /** subtle tinted background (optional use, e.g. metric pills) */
  bg: string
  /** raw hex token value */
  hex: string
}

/**
 * Map an insight severity to its Tailwind classes + hex (PRD §9.2 severity system).
 * Insight cards stay white (bg-canvas) with a colored 4px left border.
 */
export function getSeverityColor(severity: Severity): SeverityColor {
  switch (severity) {
    case "alert":
      return {
        border: "border-l-severity-alert",
        text: "text-severity-alert",
        bg: "bg-severity-alert/10",
        hex: "#EF4444",
      }
    case "warning":
      return {
        border: "border-l-severity-warning",
        text: "text-severity-warning",
        bg: "bg-severity-warning/10",
        hex: "#F59E0B",
      }
    case "info":
    default:
      return {
        border: "border-l-severity-info",
        text: "text-severity-info",
        bg: "bg-severity-info/10",
        hex: "#3B82F6",
      }
  }
}
