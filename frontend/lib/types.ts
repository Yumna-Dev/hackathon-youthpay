// TypeScript interfaces matching the FastAPI response schemas (PRD §6).
// Field names mirror the backend JSON exactly.

export type Severity = "alert" | "warning" | "info"
export type Grade = "A" | "B" | "C" | "D" | "F"
export type Direction = "debit" | "credit"
// Transactions can also include a non-monetary "info" row (e.g. low-balance alert).
export type TxnDirection = Direction | "info"
export type ParseConfidence = "high" | "medium" | "low"
export type ParseMethod = "regex" | "llm"

// ---------------------------------------------------------------------------
// GET /api/summary
// ---------------------------------------------------------------------------

export interface UserProfile {
  name: string
  age: number
  city: string
  stated_monthly_allowance_pkr: number
}

export interface Period {
  from: string
  to: string
  days: number
}

export interface SummaryTotals {
  total_debit_pkr: number
  total_credit_pkr: number
  transaction_count: number
  debit_count: number
  credit_count: number
}

export interface CategorySummary {
  category: string
  amount_pkr: number
  count: number
  percentage: number
}

export interface MerchantSummary {
  merchant: string
  amount_pkr: number
  count: number
}

export interface DaySegment {
  amount_pkr: number
  count: number
  avg_txn_pkr: number
}

export interface WeekendVsWeekday {
  weekend: DaySegment
  weekday: DaySegment
}

export interface LateNightSummary {
  count: number
  percentage_of_total: number
}

export interface SummaryResponse {
  user: UserProfile
  period: Period
  totals: SummaryTotals
  by_category: CategorySummary[]
  top_merchants: MerchantSummary[]
  weekend_vs_weekday: WeekendVsWeekday
  late_night: LateNightSummary
}

// ---------------------------------------------------------------------------
// GET /api/insights
// ---------------------------------------------------------------------------

export interface CoffeeMetrics {
  total_pkr: number
  visit_count: number
  avg_per_visit_pkr: number
  annualized_pkr: number
}

export interface ImpulseMetrics {
  late_night_count: number
  late_night_percentage: number
  largest_late_night_pkr: number
  largest_late_night_merchant: string
  largest_late_night_time: string
}

export interface BeautyMetrics {
  beauty_total_pkr: number
  beauty_as_pct_of_food: number
  top_merchant: string
  top_merchant_pkr: number
  transaction_count: number
  avg_txn_pkr: number
}

export interface HealthComponents {
  savings_rate: number
  late_night_control: number
  category_diversity: number
  education_ratio: number
}

export interface HealthMetrics {
  score: number
  grade: Grade
  components: HealthComponents
  coaching_tip: string
}

export interface WeekendMetrics {
  weekend_total_pkr: number
  weekend_count: number
  weekend_avg_pkr: number
  weekday_total_pkr: number
  weekday_count: number
  weekday_avg_pkr: number
  weekend_percentage_of_total: number
  weekend_days_count: number
}

interface BaseInsight {
  title: string
  severity: Severity
  icon: string
  headline: string
  narrative_teen: string
  narrative_parent: string
}

export interface CoffeeInsight extends BaseInsight {
  id: "coffee_addiction"
  metrics: CoffeeMetrics
}
export interface ImpulseInsight extends BaseInsight {
  id: "impulse_late_night"
  metrics: ImpulseMetrics
}
export interface BeautyInsight extends BaseInsight {
  id: "beauty_creep"
  metrics: BeautyMetrics
}
export interface HealthInsight extends BaseInsight {
  id: "health_score"
  metrics: HealthMetrics
}
export interface WeekendInsight extends BaseInsight {
  id: "weekend_vs_weekday"
  metrics: WeekendMetrics
}

// Discriminated union on `id` — narrow with `if (insight.id === "coffee_addiction")`.
export type Insight =
  | CoffeeInsight
  | ImpulseInsight
  | BeautyInsight
  | HealthInsight
  | WeekendInsight

export type InsightId = Insight["id"]

export interface InsightsResponse {
  insights: Insight[]
  generated_at: string
  cached: boolean
}

// ---------------------------------------------------------------------------
// GET /api/transactions
// ---------------------------------------------------------------------------

export interface Transaction {
  id: number
  date_time: string
  merchant_name: string
  amount_pkr: number
  direction: TxnDirection
  category: string
  payment_method: string | null
  source: string
}

export interface TransactionsResponse {
  transactions: Transaction[]
  total: number
  filtered: number
}

// ---------------------------------------------------------------------------
// POST /api/parse-notification
// ---------------------------------------------------------------------------

export interface ParsedTransaction {
  merchant_name: string
  amount_pkr: number | null
  direction: Direction
  payment_method: string | null
  category: string
  confidence: ParseConfidence
  method: ParseMethod
}

export interface ParseResponse {
  success: boolean
  parsed: ParsedTransaction
  raw_text: string
}

// ---------------------------------------------------------------------------
// POST /api/fetch-emails (Gmail IMAP bonus)
// ---------------------------------------------------------------------------

export interface FetchedTransaction {
  merchant_name: string
  amount_pkr: number | null
  direction: Direction
  category: string
  confidence: ParseConfidence
  method: ParseMethod
  raw_text: string
}

export interface FetchEmailsResponse {
  success: boolean
  emails_fetched: number
  transactions_parsed: number
  failed: number
  transactions: FetchedTransaction[]
}
