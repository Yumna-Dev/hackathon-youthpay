"use client"

import useSWR from "swr"
import { fetchTransactions, type TransactionFilters } from "@/lib/api"

export function useTransactions(filters: TransactionFilters = {}) {
  const { data, error, isLoading } = useSWR(
    ["transactions", filters],
    () => fetchTransactions(filters),
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  )
  return {
    transactions: data?.transactions ?? [],
    total: data?.total ?? 0,
    filtered: data?.filtered ?? 0,
    data,
    isLoading,
    error,
  }
}
