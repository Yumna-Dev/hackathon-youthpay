"use client"

import useSWR from "swr"
import { fetchInsights } from "@/lib/api"

export function useInsights() {
  const { data, error, isLoading } = useSWR("insights", fetchInsights, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  })
  return { insights: data?.insights ?? [], data, isLoading, error }
}
