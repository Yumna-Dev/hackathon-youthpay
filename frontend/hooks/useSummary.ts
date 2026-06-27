"use client"

import useSWR from "swr"
import { fetchSummary } from "@/lib/api"

export function useSummary() {
  const { data, error, isLoading } = useSWR("summary", fetchSummary, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  })
  return { summary: data, isLoading, error }
}
